#!/bin/bash

# LED B2B网站SSL证书管理脚本
set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
DOMAIN=${1:-"led-b2b.com"}
EMAIL=${2:-"admin@led-b2b.com"}
WEBROOT=${3:-"/var/www/html"}
NGINX_CONFIG_DIR="/etc/nginx/sites-available"
CERTBOT_DIR="/etc/letsencrypt"
LOG_FILE="/var/log/ssl-manager.log"

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

# 检查权限
check_permissions() {
    if [ "$EUID" -ne 0 ]; then
        log_error "此脚本需要root权限运行"
        exit 1
    fi
}

# 安装Certbot
install_certbot() {
    log_info "检查并安装Certbot..."
    
    if command -v certbot >/dev/null 2>&1; then
        log_success "Certbot已安装"
        return 0
    fi
    
    # 根据系统类型安装Certbot
    if [ -f /etc/debian_version ]; then
        # Debian/Ubuntu
        apt-get update
        apt-get install -y certbot python3-certbot-nginx
    elif [ -f /etc/redhat-release ]; then
        # CentOS/RHEL
        yum install -y epel-release
        yum install -y certbot python3-certbot-nginx
    else
        log_error "不支持的操作系统"
        exit 1
    fi
    
    if command -v certbot >/dev/null 2>&1; then
        log_success "Certbot安装完成"
    else
        log_error "Certbot安装失败"
        exit 1
    fi
}

# 创建Nginx配置
create_nginx_config() {
    local domain=$1
    local config_file="$NGINX_CONFIG_DIR/$domain"
    
    log_info "创建Nginx配置: $domain"
    
    cat > "$config_file" << EOF
server {
    listen 80;
    server_name $domain www.$domain;
    
    # Let's Encrypt验证路径
    location /.well-known/acme-challenge/ {
        root $WEBROOT;
    }
    
    # 重定向到HTTPS
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name $domain www.$domain;
    
    # SSL证书配置（将由Certbot自动填充）
    # ssl_certificate /etc/letsencrypt/live/$domain/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/$domain/privkey.pem;
    
    # SSL安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384:ECDHE-RSA-AES128-SHA:ECDHE-RSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES256-SHA256:DHE-RSA-AES128-SHA:DHE-RSA-AES256-SHA:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # 其他安全头
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # 应用配置
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # 静态文件缓存
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        proxy_pass http://localhost:3000;
    }
}
EOF
    
    # 启用站点
    if [ ! -L "/etc/nginx/sites-enabled/$domain" ]; then
        ln -s "$config_file" "/etc/nginx/sites-enabled/$domain"
    fi
    
    log_success "Nginx配置创建完成"
}

# 获取SSL证书
obtain_certificate() {
    local domain=$1
    local email=$2
    
    log_info "为域名 $domain 获取SSL证书..."
    
    # 确保webroot目录存在
    mkdir -p "$WEBROOT"
    
    # 测试Nginx配置
    if ! nginx -t; then
        log_error "Nginx配置测试失败"
        exit 1
    fi
    
    # 重载Nginx
    systemctl reload nginx
    
    # 获取证书
    certbot certonly \
        --webroot \
        --webroot-path="$WEBROOT" \
        --email "$email" \
        --agree-tos \
        --no-eff-email \
        --domains "$domain,www.$domain" \
        --non-interactive
    
    if [ $? -eq 0 ]; then
        log_success "SSL证书获取成功"
        
        # 使用Certbot自动配置Nginx
        certbot --nginx \
            --domains "$domain,www.$domain" \
            --non-interactive \
            --agree-tos \
            --email "$email"
        
        if [ $? -eq 0 ]; then
            log_success "Nginx SSL配置完成"
        else
            log_warning "Nginx SSL自动配置失败，需要手动配置"
        fi
    else
        log_error "SSL证书获取失败"
        exit 1
    fi
}

# 检查证书状态
check_certificate() {
    local domain=$1
    
    log_info "检查域名 $domain 的SSL证书状态..."
    
    if [ ! -d "$CERTBOT_DIR/live/$domain" ]; then
        log_error "证书目录不存在: $CERTBOT_DIR/live/$domain"
        return 1
    fi
    
    local cert_file="$CERTBOT_DIR/live/$domain/fullchain.pem"
    
    if [ ! -f "$cert_file" ]; then
        log_error "证书文件不存在: $cert_file"
        return 1
    fi
    
    # 检查证书有效期
    local expiry_date=$(openssl x509 -enddate -noout -in "$cert_file" | cut -d= -f2)
    local expiry_timestamp=$(date -d "$expiry_date" +%s)
    local current_timestamp=$(date +%s)
    local days_until_expiry=$(( (expiry_timestamp - current_timestamp) / 86400 ))
    
    log_info "证书过期时间: $expiry_date"
    log_info "剩余天数: $days_until_expiry 天"
    
    if [ "$days_until_expiry" -lt 30 ]; then
        log_warning "证书即将过期，建议续期"
        return 2
    elif [ "$days_until_expiry" -lt 7 ]; then
        log_error "证书即将过期，需要立即续期"
        return 3
    else
        log_success "证书状态正常"
        return 0
    fi
}

# 续期证书
renew_certificate() {
    local domain=$1
    
    log_info "续期域名 $domain 的SSL证书..."
    
    # 测试续期
    certbot renew --dry-run --cert-name "$domain"
    
    if [ $? -eq 0 ]; then
        log_success "续期测试通过"
        
        # 执行实际续期
        certbot renew --cert-name "$domain"
        
        if [ $? -eq 0 ]; then
            log_success "证书续期成功"
            
            # 重载Nginx
            systemctl reload nginx
            log_success "Nginx配置已重载"
        else
            log_error "证书续期失败"
            exit 1
        fi
    else
        log_error "续期测试失败"
        exit 1
    fi
}

# 撤销证书
revoke_certificate() {
    local domain=$1
    
    log_warning "撤销域名 $domain 的SSL证书..."
    
    read -p "确认撤销证书? (y/N): " confirm
    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
        log_info "操作已取消"
        exit 0
    fi
    
    certbot revoke --cert-path "$CERTBOT_DIR/live/$domain/fullchain.pem"
    
    if [ $? -eq 0 ]; then
        log_success "证书撤销成功"
        
        # 删除证书文件
        certbot delete --cert-name "$domain"
        
        log_success "证书文件已删除"
    else
        log_error "证书撤销失败"
        exit 1
    fi
}

# 设置自动续期
setup_auto_renewal() {
    log_info "设置SSL证书自动续期..."
    
    # 创建续期脚本
    local renewal_script="/usr/local/bin/ssl-auto-renewal"
    
    cat > "$renewal_script" << 'EOF'
#!/bin/bash

# SSL证书自动续期脚本
LOG_FILE="/var/log/ssl-renewal.log"

echo "[$(date)] 开始SSL证书续期检查" >> "$LOG_FILE"

# 续期所有证书
certbot renew --quiet >> "$LOG_FILE" 2>&1

if [ $? -eq 0 ]; then
    echo "[$(date)] 证书续期检查完成" >> "$LOG_FILE"
    
    # 重载Nginx
    systemctl reload nginx >> "$LOG_FILE" 2>&1
    
    # 发送成功通知
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data '{"text": "✅ SSL证书续期检查完成"}' \
            "$SLACK_WEBHOOK_URL" >> "$LOG_FILE" 2>&1
    fi
else
    echo "[$(date)] 证书续期失败" >> "$LOG_FILE"
    
    # 发送失败通知
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data '{"text": "❌ SSL证书续期失败"}' \
            "$SLACK_WEBHOOK_URL" >> "$LOG_FILE" 2>&1
    fi
fi

# 清理旧日志
find /var/log -name "ssl-renewal.log" -mtime +30 -delete
EOF
    
    chmod +x "$renewal_script"
    
    # 添加到crontab
    local cron_entry="0 2 * * * $renewal_script"
    
    # 检查是否已存在
    if ! crontab -l 2>/dev/null | grep -q "$renewal_script"; then\n        (crontab -l 2>/dev/null; echo \"$cron_entry\") | crontab -\n        log_success \"自动续期定时任务已添加\"\n    else\n        log_info \"自动续期定时任务已存在\"\n    fi\n    \n    log_success \"SSL证书自动续期设置完成\"\n}\n\n# 测试SSL配置\ntest_ssl_config() {\n    local domain=$1\n    \n    log_info \"测试域名 $domain 的SSL配置...\"\n    \n    # 测试HTTPS连接\n    if curl -s -I \"https://$domain\" | grep -q \"HTTP/2 200\\|HTTP/1.1 200\"; then\n        log_success \"HTTPS连接正常\"\n    else\n        log_error \"HTTPS连接失败\"\n        return 1\n    fi\n    \n    # 测试SSL证书\n    local ssl_info=$(echo | openssl s_client -servername \"$domain\" -connect \"$domain:443\" 2>/dev/null | openssl x509 -noout -subject -dates 2>/dev/null)\n    \n    if [ -n \"$ssl_info\" ]; then\n        log_success \"SSL证书验证通过\"\n        echo \"$ssl_info\" | tee -a \"$LOG_FILE\"\n    else\n        log_error \"SSL证书验证失败\"\n        return 1\n    fi\n    \n    # 测试SSL评级（使用SSL Labs API）\n    log_info \"正在获取SSL评级（可能需要几分钟）...\"\n    \n    local api_url=\"https://api.ssllabs.com/api/v3/analyze?host=$domain&publish=off&startNew=on&all=done\"\n    local grade_result=$(curl -s \"$api_url\" | grep -o '\"grade\":\"[A-F][+-]*\"' | head -1 | cut -d'\"' -f4)\n    \n    if [ -n \"$grade_result\" ]; then\n        log_success \"SSL评级: $grade_result\"\n    else\n        log_warning \"无法获取SSL评级\"\n    fi\n}\n\n# 备份证书\nbackup_certificates() {\n    local backup_dir=\"/backup/ssl-certificates\"\n    local timestamp=$(date +%Y%m%d_%H%M%S)\n    local backup_file=\"$backup_dir/ssl-backup-$timestamp.tar.gz\"\n    \n    log_info \"备份SSL证书...\"\n    \n    mkdir -p \"$backup_dir\"\n    \n    # 创建备份\n    tar -czf \"$backup_file\" -C / etc/letsencrypt\n    \n    if [ $? -eq 0 ]; then\n        log_success \"SSL证书备份完成: $backup_file\"\n        \n        # 清理旧备份（保留30天）\n        find \"$backup_dir\" -name \"ssl-backup-*.tar.gz\" -mtime +30 -delete\n        \n        log_info \"旧备份已清理\"\n    else\n        log_error \"SSL证书备份失败\"\n        exit 1\n    fi\n}\n\n# 恢复证书\nrestore_certificates() {\n    local backup_file=$1\n    \n    if [ -z \"$backup_file\" ]; then\n        log_error \"请指定备份文件路径\"\n        exit 1\n    fi\n    \n    if [ ! -f \"$backup_file\" ]; then\n        log_error \"备份文件不存在: $backup_file\"\n        exit 1\n    fi\n    \n    log_warning \"恢复SSL证书: $backup_file\"\n    \n    read -p \"确认恢复证书? 这将覆盖现有证书 (y/N): \" confirm\n    if [ \"$confirm\" != \"y\" ] && [ \"$confirm\" != \"Y\" ]; then\n        log_info \"操作已取消\"\n        exit 0\n    fi\n    \n    # 停止Nginx\n    systemctl stop nginx\n    \n    # 恢复证书\n    tar -xzf \"$backup_file\" -C /\n    \n    if [ $? -eq 0 ]; then\n        log_success \"SSL证书恢复完成\"\n        \n        # 启动Nginx\n        systemctl start nginx\n        \n        if [ $? -eq 0 ]; then\n            log_success \"Nginx已重启\"\n        else\n            log_error \"Nginx启动失败\"\n            exit 1\n        fi\n    else\n        log_error \"SSL证书恢复失败\"\n        \n        # 尝试启动Nginx\n        systemctl start nginx\n        exit 1\n    fi\n}\n\n# 显示帮助信息\nshow_help() {\n    cat << EOF\n用法: $0 <COMMAND> [OPTIONS]\n\n命令:\n  install <domain> <email>              安装SSL证书\n  check <domain>                        检查证书状态\n  renew <domain>                        续期证书\n  revoke <domain>                       撤销证书\n  auto-renewal                          设置自动续期\n  test <domain>                         测试SSL配置\n  backup                                备份证书\n  restore <backup_file>                 恢复证书\n\n参数:\n  domain     域名 (例如: led-b2b.com)\n  email      邮箱地址 (例如: admin@led-b2b.com)\n\n示例:\n  $0 install led-b2b.com admin@led-b2b.com\n  $0 check led-b2b.com\n  $0 renew led-b2b.com\n  $0 test led-b2b.com\n  $0 backup\n  $0 restore /backup/ssl-certificates/ssl-backup-20240101_120000.tar.gz\n\nEOF\n}\n\n# 主函数\nmain() {\n    local command=$1\n    \n    case $command in\n        \"install\")\n            check_permissions\n            install_certbot\n            create_nginx_config \"$DOMAIN\"\n            obtain_certificate \"$DOMAIN\" \"$EMAIL\"\n            setup_auto_renewal\n            test_ssl_config \"$DOMAIN\"\n            ;;\n        \"check\")\n            check_certificate \"$DOMAIN\"\n            ;;\n        \"renew\")\n            check_permissions\n            renew_certificate \"$DOMAIN\"\n            ;;\n        \"revoke\")\n            check_permissions\n            revoke_certificate \"$DOMAIN\"\n            ;;\n        \"auto-renewal\")\n            check_permissions\n            setup_auto_renewal\n            ;;\n        \"test\")\n            test_ssl_config \"$DOMAIN\"\n            ;;\n        \"backup\")\n            check_permissions\n            backup_certificates\n            ;;\n        \"restore\")\n            check_permissions\n            restore_certificates \"$2\"\n            ;;\n        \"help\"|\"--help\"|\"-h\")\n            show_help\n            ;;\n        *)\n            log_error \"未知命令: $command\"\n            show_help\n            exit 1\n            ;;\n    esac\n}\n\n# 脚本入口\nif [ $# -eq 0 ]; then\n    show_help\n    exit 1\nfi\n\nmain \"$@\""