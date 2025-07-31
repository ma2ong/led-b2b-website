#!/bin/bash

# LED B2B网站自动备份定时任务设置脚本
set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
ENVIRONMENT=${1:-production}
PROJECT_DIR=${2:-/opt/led-b2b-website}
BACKUP_USER=${3:-backup}
LOG_DIR="/var/log/led-b2b-backup"

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查权限
check_permissions() {
    if [ "$EUID" -ne 0 ]; then
        log_error "此脚本需要root权限运行"
        exit 1
    fi
}

# 创建备份用户
create_backup_user() {
    if ! id "$BACKUP_USER" &>/dev/null; then
        log_info "创建备份用户: $BACKUP_USER"
        
        useradd -r -s /bin/bash -d /home/$BACKUP_USER -m $BACKUP_USER
        
        # 添加到docker组
        usermod -aG docker $BACKUP_USER
        
        log_success "备份用户创建完成"
    else
        log_info "备份用户已存在: $BACKUP_USER"
    fi
}

# 设置目录权限
setup_directories() {
    log_info "设置备份目录权限..."
    
    # 创建日志目录
    mkdir -p $LOG_DIR
    chown $BACKUP_USER:$BACKUP_USER $LOG_DIR
    chmod 755 $LOG_DIR
    
    # 设置项目目录权限
    if [ -d "$PROJECT_DIR" ]; then
        mkdir -p $PROJECT_DIR/backups
        chown -R $BACKUP_USER:$BACKUP_USER $PROJECT_DIR/backups
        chmod -R 755 $PROJECT_DIR/backups
        
        # 给备份用户执行脚本的权限
        chmod +x $PROJECT_DIR/scripts/backup-database.sh
        chmod +x $PROJECT_DIR/scripts/restore-database.sh
        
        log_success "目录权限设置完成"
    else
        log_error "项目目录不存在: $PROJECT_DIR"
        exit 1
    fi
}

# 创建备份脚本包装器
create_backup_wrapper() {
    local wrapper_script="/usr/local/bin/led-b2b-backup"
    
    log_info "创建备份脚本包装器..."
    
    cat > $wrapper_script << EOF
#!/bin/bash

# LED B2B备份包装器脚本
set -e

# 配置
PROJECT_DIR="$PROJECT_DIR"
LOG_DIR="$LOG_DIR"
ENVIRONMENT="$ENVIRONMENT"
BACKUP_TYPE=\$1
TIMESTAMP=\$(date +"%Y%m%d_%H%M%S")
LOG_FILE="\$LOG_DIR/backup_\${BACKUP_TYPE}_\$TIMESTAMP.log"

# 切换到项目目录
cd \$PROJECT_DIR

# 记录开始时间
echo "[\$(date)] 开始 \$BACKUP_TYPE 备份" >> \$LOG_FILE

# 执行备份
if ./scripts/backup-database.sh \$BACKUP_TYPE \$ENVIRONMENT >> \$LOG_FILE 2>&1; then
    echo "[\$(date)] \$BACKUP_TYPE 备份成功完成" >> \$LOG_FILE
    
    # 发送成功通知
    if [ -n "\$SLACK_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \\
            --data "{
                \"text\": \"✅ LED B2B \$BACKUP_TYPE 备份成功完成 (\$ENVIRONMENT)\"
            }" \\
            "\$SLACK_WEBHOOK_URL" >> \$LOG_FILE 2>&1
    fi
else
    echo "[\$(date)] \$BACKUP_TYPE 备份失败" >> \$LOG_FILE
    
    # 发送失败通知
    if [ -n "\$SLACK_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \\
            --data "{
                \"text\": \"❌ LED B2B \$BACKUP_TYPE 备份失败 (\$ENVIRONMENT)\"
            }" \\
            "\$SLACK_WEBHOOK_URL" >> \$LOG_FILE 2>&1
    fi
    
    exit 1
fi

# 清理旧日志（保留30天）
find \$LOG_DIR -name "backup_*.log" -mtime +30 -delete

echo "[\$(date)] 备份流程完成" >> \$LOG_FILE
EOF

    chmod +x $wrapper_script
    chown $BACKUP_USER:$BACKUP_USER $wrapper_script
    
    log_success "备份包装器创建完成: $wrapper_script"
}

# 设置定时任务
setup_cron_jobs() {
    log_info "设置定时任务..."
    
    # 创建临时cron文件
    local temp_cron="/tmp/led-b2b-backup-cron"
    
    # 获取现有的cron任务（如果有）
    crontab -u $BACKUP_USER -l > $temp_cron 2>/dev/null || echo "" > $temp_cron
    
    # 移除旧的LED B2B备份任务
    grep -v "led-b2b-backup" $temp_cron > ${temp_cron}.new || echo "" > ${temp_cron}.new
    mv ${temp_cron}.new $temp_cron
    
    # 添加新的备份任务
    cat >> $temp_cron << EOF

# LED B2B自动备份任务
# 每日凌晨2点执行全量备份
0 2 * * * /usr/local/bin/led-b2b-backup full

# 每6小时执行增量备份（工作时间）
0 6,12,18 * * * /usr/local/bin/led-b2b-backup incremental

# 每周日凌晨1点执行结构备份
0 1 * * 0 /usr/local/bin/led-b2b-backup schema

# 每月1号凌晨3点清理旧备份
0 3 1 * * cd $PROJECT_DIR && ./scripts/backup-database.sh full $ENVIRONMENT cleanup

EOF

    # 安装新的cron任务
    crontab -u $BACKUP_USER -l < $temp_cron
    
    if [ $? -eq 0 ]; then
        log_success "定时任务设置完成"
        
        # 显示当前的cron任务
        log_info "当前的备份定时任务:"
        crontab -u $BACKUP_USER -l | grep "led-b2b-backup"
    else
        log_error "定时任务设置失败"
        exit 1
    fi
    
    # 清理临时文件
    rm -f $temp_cron
}

# 创建日志轮转配置
setup_log_rotation() {
    log_info "配置日志轮转..."
    
    local logrotate_config="/etc/logrotate.d/led-b2b-backup"
    
    cat > $logrotate_config << EOF
$LOG_DIR/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 $BACKUP_USER $BACKUP_USER
    postrotate
        # 发送日志轮转通知
        if [ -n "\$SLACK_WEBHOOK_URL" ]; then
            curl -X POST -H 'Content-type: application/json' \\
                --data '{"text": "📋 LED B2B备份日志已轮转"}' \\
                "\$SLACK_WEBHOOK_URL" > /dev/null 2>&1
        fi
    endscript
}
EOF
    
    log_success "日志轮转配置完成: $logrotate_config"
}

# 测试备份系统
test_backup_system() {
    log_info "测试备份系统..."
    
    # 切换到备份用户执行测试
    sudo -u $BACKUP_USER bash << EOF
cd $PROJECT_DIR

# 测试备份脚本权限
if [ -x "./scripts/backup-database.sh" ]; then
    echo "✓ 备份脚本可执行"
else
    echo "✗ 备份脚本权限错误"
    exit 1
fi

# 测试环境配置
if [ -f ".env.$ENVIRONMENT" ]; then
    echo "✓ 环境配置文件存在"
else
    echo "✗ 环境配置文件缺失"
    exit 1
fi

# 测试备份目录权限
if [ -w "./backups" ]; then
    echo "✓ 备份目录可写"
else
    echo "✗ 备份目录权限错误"
    exit 1
fi

# 测试Docker访问权限
if docker ps > /dev/null 2>&1; then
    echo "✓ Docker访问正常"
else
    echo "✗ Docker访问失败"
    exit 1
fi

echo "备份系统测试通过"
EOF
    
    if [ $? -eq 0 ]; then
        log_success "备份系统测试通过"
    else
        log_error "备份系统测试失败"
        exit 1
    fi
}

# 创建监控脚本
create_monitoring_script() {
    local monitor_script="/usr/local/bin/led-b2b-backup-monitor"
    
    log_info "创建备份监控脚本..."
    
    cat > $monitor_script << 'EOF'
#!/bin/bash

# LED B2B备份监控脚本
set -e

LOG_DIR="/var/log/led-b2b-backup"
ALERT_THRESHOLD_HOURS=25  # 超过25小时没有备份则告警
BACKUP_SIZE_THRESHOLD=1048576  # 备份文件小于1MB则告警

# 检查最近的备份
check_recent_backup() {
    local latest_backup=$(find /opt/led-b2b-website/backups -name "*.sql" -o -name "*.tar*" -o -name "*.gpg" | head -1)
    
    if [ -z "$latest_backup" ]; then
        echo "ERROR: 未找到任何备份文件"
        return 1
    fi
    
    local backup_age=$(find "$latest_backup" -mtime +1 -print | wc -l)
    if [ "$backup_age" -gt 0 ]; then
        echo "WARNING: 最新备份超过24小时"
        return 1
    fi
    
    local backup_size=$(stat -f%z "$latest_backup" 2>/dev/null || stat -c%s "$latest_backup" 2>/dev/null)
    if [ "$backup_size" -lt "$BACKUP_SIZE_THRESHOLD" ]; then
        echo "ERROR: 备份文件过小，可能损坏"
        return 1
    fi
    
    echo "OK: 备份检查通过"
    return 0
}

# 检查备份日志
check_backup_logs() {
    local latest_log=$(find $LOG_DIR -name "backup_*.log" -mtime -1 | head -1)
    
    if [ -z "$latest_log" ]; then
        echo "WARNING: 未找到最近的备份日志"
        return 1
    fi
    
    if grep -q "备份失败" "$latest_log"; then
        echo "ERROR: 备份日志显示失败"
        return 1
    fi
    
    echo "OK: 备份日志检查通过"
    return 0
}

# 发送告警
send_alert() {
    local message=$1
    local level=${2:-warning}
    
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        local color="warning"
        local emoji="⚠️"
        
        if [ "$level" = "error" ]; then
            color="danger"
            emoji="🚨"
        fi
        
        curl -X POST -H 'Content-type: application/json' \
            --data "{
                \"attachments\": [{
                    \"color\": \"$color\",
                    \"title\": \"${emoji} LED B2B备份监控告警\",
                    \"text\": \"$message\",
                    \"fields\": [
                        {
                            \"title\": \"服务器\",
                            \"value\": \"$(hostname)\",
                            \"short\": true
                        },
                        {
                            \"title\": \"时间\",
                            \"value\": \"$(date)\",
                            \"short\": true
                        }
                    ]
                }]
            }" \
            "$SLACK_WEBHOOK_URL"
    fi
    
    # 记录到系统日志
    logger -t led-b2b-backup-monitor "$message"
}

# 主监控逻辑
main() {
    local errors=0
    
    # 检查备份文件
    if ! check_recent_backup; then
        send_alert "备份文件检查失败" "error"
        ((errors++))
    fi
    
    # 检查备份日志
    if ! check_backup_logs; then
        send_alert "备份日志检查异常" "warning"
        ((errors++))
    fi
    
    # 检查磁盘空间
    local disk_usage=$(df /opt/led-b2b-website/backups | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ "$disk_usage" -gt 85 ]; then
        send_alert "备份目录磁盘空间不足: ${disk_usage}%" "warning"
        ((errors++))
    fi
    
    if [ $errors -eq 0 ]; then
        echo "$(date): 备份监控检查通过" >> $LOG_DIR/monitor.log
    else
        echo "$(date): 发现 $errors 个问题" >> $LOG_DIR/monitor.log
    fi
    
    exit $errors
}

main "$@"
EOF
    
    chmod +x $monitor_script
    chown $BACKUP_USER:$BACKUP_USER $monitor_script
    
    log_success "备份监控脚本创建完成: $monitor_script"
}

# 设置监控定时任务
setup_monitoring_cron() {
    log_info "设置监控定时任务..."
    
    # 添加监控任务到cron
    local temp_cron="/tmp/led-b2b-monitor-cron"
    crontab -u $BACKUP_USER -l > $temp_cron 2>/dev/null || echo "" > $temp_cron
    
    # 移除旧的监控任务
    grep -v "led-b2b-backup-monitor" $temp_cron > ${temp_cron}.new || echo "" > ${temp_cron}.new
    mv ${temp_cron}.new $temp_cron
    
    # 添加新的监控任务
    cat >> $temp_cron << EOF

# LED B2B备份监控任务
# 每小时检查备份状态
0 * * * * /usr/local/bin/led-b2b-backup-monitor

EOF
    
    crontab -u $BACKUP_USER -l < $temp_cron
    rm -f $temp_cron
    
    log_success "监控定时任务设置完成"
}

# 显示使用说明
show_usage() {
    cat << EOF

LED B2B网站备份系统设置完成！

配置信息:
- 环境: $ENVIRONMENT
- 项目目录: $PROJECT_DIR
- 备份用户: $BACKUP_USER
- 日志目录: $LOG_DIR

定时任务:
- 每日凌晨2点: 全量备份
- 每6小时: 增量备份
- 每周日凌晨1点: 结构备份
- 每月1号凌晨3点: 清理旧备份
- 每小时: 备份状态监控

手动操作命令:
- 执行全量备份: sudo -u $BACKUP_USER /usr/local/bin/led-b2b-backup full
- 执行增量备份: sudo -u $BACKUP_USER /usr/local/bin/led-b2b-backup incremental
- 检查备份状态: sudo -u $BACKUP_USER /usr/local/bin/led-b2b-backup-monitor
- 查看备份日志: tail -f $LOG_DIR/backup_*.log

配置文件:
- 环境变量: $PROJECT_DIR/.env.$ENVIRONMENT
- 日志轮转: /etc/logrotate.d/led-b2b-backup

注意事项:
1. 确保 .env.$ENVIRONMENT 文件包含必要的数据库连接信息
2. 如需S3备份，请配置 BACKUP_S3_BUCKET 和 AWS凭证
3. 如需通知，请配置 SLACK_WEBHOOK_URL
4. 定期检查备份文件的完整性和可恢复性

EOF
}

# 主函数
main() {
    log_info "开始设置LED B2B网站自动备份系统"
    
    # 检查权限
    check_permissions
    
    # 创建备份用户
    create_backup_user
    
    # 设置目录权限
    setup_directories
    
    # 创建备份脚本包装器
    create_backup_wrapper
    
    # 设置定时任务
    setup_cron_jobs
    
    # 配置日志轮转
    setup_log_rotation
    
    # 创建监控脚本
    create_monitoring_script
    
    # 设置监控定时任务
    setup_monitoring_cron
    
    # 测试备份系统
    test_backup_system
    
    log_success "LED B2B网站备份系统设置完成！"
    
    # 显示使用说明
    show_usage
}

# 脚本入口
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    cat << EOF
用法: $0 [ENVIRONMENT] [PROJECT_DIR] [BACKUP_USER]

参数:
  ENVIRONMENT   环境名称 (默认: production)
  PROJECT_DIR   项目目录路径 (默认: /opt/led-b2b-website)
  BACKUP_USER   备份用户名 (默认: backup)

示例:
  $0 production /opt/led-b2b-website backup
  $0 staging /home/user/led-b2b-website backup

EOF
    exit 0
fi

main