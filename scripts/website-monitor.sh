#!/bin/bash

# LED B2B网站监控脚本
set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
WEBSITE_URL=${1:-"https://led-b2b.com"}
ENVIRONMENT=${2:-production}
LOG_DIR="/var/log/led-b2b-monitor"
ALERT_EMAIL=${ALERT_EMAIL:-"admin@led-b2b.com"}
SLACK_WEBHOOK_URL=${SLACK_WEBHOOK_URL}
CHECK_INTERVAL=300  # 5分钟
TIMEOUT=30
MAX_RESPONSE_TIME=3000  # 3秒
MIN_UPTIME_PERCENTAGE=99.5

# 创建日志目录
mkdir -p $LOG_DIR

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_DIR/monitor.log"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_DIR/monitor.log"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_DIR/monitor.log"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_DIR/monitor.log"
}

# 获取当前时间戳
get_timestamp() {
    date '+%Y-%m-%d %H:%M:%S'
}

# 检查网站可用性
check_website_availability() {
    local url=$1
    local start_time=$(date +%s%3N)
    
    log_info "检查网站可用性: $url"
    
    # 使用curl检查网站状态
    local http_code=$(curl -o /dev/null -s -w "%{http_code}" \
        --max-time $TIMEOUT \
        --connect-timeout 10 \
        --user-agent "LED-B2B-Monitor/1.0" \
        "$url")
    
    local end_time=$(date +%s%3N)
    local response_time=$((end_time - start_time))
    
    # 记录响应时间
    echo "$(get_timestamp),$response_time,$http_code" >> "$LOG_DIR/response_times.csv"
    
    if [ "$http_code" -eq 200 ]; then
        if [ "$response_time" -gt "$MAX_RESPONSE_TIME" ]; then
            log_warning "网站响应缓慢: ${response_time}ms (阈值: ${MAX_RESPONSE_TIME}ms)"
            return 2  # 慢响应
        else
            log_success "网站正常访问 (${response_time}ms)"
            return 0  # 正常
        fi
    else
        log_error "网站访问异常: HTTP $http_code (${response_time}ms)"
        return 1  # 错误
    fi
}

# 检查SSL证书
check_ssl_certificate() {
    local domain=$(echo "$WEBSITE_URL" | sed 's|https\\?://||' | sed 's|/.*||')\n    \n    log_info \"检查SSL证书: $domain\"\n    \n    # 获取证书信息\n    local cert_info=$(echo | openssl s_client -servername \"$domain\" -connect \"$domain:443\" 2>/dev/null | openssl x509 -noout -dates 2>/dev/null)\n    \n    if [ $? -ne 0 ]; then\n        log_error \"无法获取SSL证书信息\"\n        return 1\n    fi\n    \n    # 提取过期时间\n    local expiry_date=$(echo \"$cert_info\" | grep \"notAfter\" | cut -d= -f2)\n    local expiry_timestamp=$(date -d \"$expiry_date\" +%s)\n    local current_timestamp=$(date +%s)\n    local days_until_expiry=$(( (expiry_timestamp - current_timestamp) / 86400 ))\n    \n    if [ \"$days_until_expiry\" -lt 30 ]; then\n        log_warning \"SSL证书即将过期: $days_until_expiry 天后过期\"\n        return 2\n    elif [ \"$days_until_expiry\" -lt 7 ]; then\n        log_error \"SSL证书即将过期: $days_until_expiry 天后过期\"\n        return 1\n    else\n        log_success \"SSL证书有效: $days_until_expiry 天后过期\"\n        return 0\n    fi\n}\n\n# 检查关键页面\ncheck_critical_pages() {\n    local base_url=$1\n    local pages=(\n        \"/\"\n        \"/products\"\n        \"/solutions\"\n        \"/case-studies\"\n        \"/contact\"\n        \"/api/health\"\n    )\n    \n    local failed_pages=()\n    \n    for page in \"${pages[@]}\"; do\n        local full_url=\"${base_url}${page}\"\n        log_info \"检查页面: $full_url\"\n        \n        local http_code=$(curl -o /dev/null -s -w \"%{http_code}\" \\\n            --max-time $TIMEOUT \\\n            --connect-timeout 10 \\\n            \"$full_url\")\n        \n        if [ \"$http_code\" -ne 200 ]; then\n            log_error \"页面访问失败: $page (HTTP $http_code)\"\n            failed_pages+=(\"$page\")\n        else\n            log_success \"页面正常: $page\"\n        fi\n    done\n    \n    if [ ${#failed_pages[@]} -gt 0 ]; then\n        log_error \"发现 ${#failed_pages[@]} 个页面访问异常\"\n        return 1\n    else\n        log_success \"所有关键页面正常\"\n        return 0\n    fi\n}\n\n# 检查API健康状态\ncheck_api_health() {\n    local api_url=\"${WEBSITE_URL}/api/health\"\n    \n    log_info \"检查API健康状态: $api_url\"\n    \n    local response=$(curl -s --max-time $TIMEOUT \"$api_url\")\n    local http_code=$(curl -o /dev/null -s -w \"%{http_code}\" --max-time $TIMEOUT \"$api_url\")\n    \n    if [ \"$http_code\" -eq 200 ]; then\n        # 检查响应内容\n        if echo \"$response\" | grep -q '\"status\":\"ok\"'; then\n            log_success \"API健康检查通过\"\n            return 0\n        else\n            log_warning \"API响应异常: $response\"\n            return 2\n        fi\n    else\n        log_error \"API健康检查失败: HTTP $http_code\"\n        return 1\n    fi\n}\n\n# 检查数据库连接\ncheck_database_connection() {\n    log_info \"检查数据库连接状态\"\n    \n    # 通过API检查数据库连接\n    local db_check_url=\"${WEBSITE_URL}/api/health?check=database\"\n    local response=$(curl -s --max-time $TIMEOUT \"$db_check_url\")\n    local http_code=$(curl -o /dev/null -s -w \"%{http_code}\" --max-time $TIMEOUT \"$db_check_url\")\n    \n    if [ \"$http_code\" -eq 200 ] && echo \"$response\" | grep -q '\"database\":\"connected\"'; then\n        log_success \"数据库连接正常\"\n        return 0\n    else\n        log_error \"数据库连接异常\"\n        return 1\n    fi\n}\n\n# 检查服务器资源\ncheck_server_resources() {\n    log_info \"检查服务器资源使用情况\"\n    \n    # 检查CPU使用率\n    local cpu_usage=$(top -bn1 | grep \"Cpu(s)\" | awk '{print $2}' | sed 's/%us,//')\n    local cpu_percent=$(echo \"$cpu_usage\" | sed 's/%//')\n    \n    if (( $(echo \"$cpu_percent > 80\" | bc -l) )); then\n        log_warning \"CPU使用率过高: ${cpu_percent}%\"\n    else\n        log_success \"CPU使用率正常: ${cpu_percent}%\"\n    fi\n    \n    # 检查内存使用率\n    local mem_info=$(free | grep Mem)\n    local total_mem=$(echo $mem_info | awk '{print $2}')\n    local used_mem=$(echo $mem_info | awk '{print $3}')\n    local mem_percent=$(( used_mem * 100 / total_mem ))\n    \n    if [ \"$mem_percent\" -gt 85 ]; then\n        log_warning \"内存使用率过高: ${mem_percent}%\"\n    else\n        log_success \"内存使用率正常: ${mem_percent}%\"\n    fi\n    \n    # 检查磁盘使用率\n    local disk_usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')\n    \n    if [ \"$disk_usage\" -gt 85 ]; then\n        log_warning \"磁盘使用率过高: ${disk_usage}%\"\n    else\n        log_success \"磁盘使用率正常: ${disk_usage}%\"\n    fi\n    \n    # 记录资源使用情况\n    echo \"$(get_timestamp),$cpu_percent,$mem_percent,$disk_usage\" >> \"$LOG_DIR/resource_usage.csv\"\n}\n\n# 检查Docker容器状态\ncheck_docker_containers() {\n    log_info \"检查Docker容器状态\"\n    \n    local containers=(\"app\" \"postgres\" \"nginx\")\n    local failed_containers=()\n    \n    for container in \"${containers[@]}\"; do\n        if docker ps --format \"table {{.Names}}\" | grep -q \"$container\"; then\n            local status=$(docker inspect --format='{{.State.Status}}' \"$container\" 2>/dev/null)\n            if [ \"$status\" = \"running\" ]; then\n                log_success \"容器正常运行: $container\"\n            else\n                log_error \"容器状态异常: $container ($status)\"\n                failed_containers+=(\"$container\")\n            fi\n        else\n            log_error \"容器未找到: $container\"\n            failed_containers+=(\"$container\")\n        fi\n    done\n    \n    if [ ${#failed_containers[@]} -gt 0 ]; then\n        log_error \"发现 ${#failed_containers[@]} 个容器异常\"\n        return 1\n    else\n        log_success \"所有容器正常运行\"\n        return 0\n    fi\n}\n\n# 生成监控报告\ngenerate_monitoring_report() {\n    local report_file=\"$LOG_DIR/monitoring_report_$(date +%Y%m%d_%H%M%S).json\"\n    \n    log_info \"生成监控报告: $report_file\"\n    \n    # 计算最近24小时的统计数据\n    local uptime_data=$(tail -n 288 \"$LOG_DIR/response_times.csv\" 2>/dev/null || echo \"\")\n    local total_checks=$(echo \"$uptime_data\" | wc -l)\n    local successful_checks=$(echo \"$uptime_data\" | awk -F',' '$3 == 200' | wc -l)\n    local uptime_percentage=0\n    \n    if [ \"$total_checks\" -gt 0 ]; then\n        uptime_percentage=$(echo \"scale=2; $successful_checks * 100 / $total_checks\" | bc)\n    fi\n    \n    # 计算平均响应时间\n    local avg_response_time=0\n    if [ -n \"$uptime_data\" ]; then\n        avg_response_time=$(echo \"$uptime_data\" | awk -F',' '{sum+=$2; count++} END {if(count>0) print sum/count; else print 0}')\n    fi\n    \n    # 生成JSON报告\n    cat > \"$report_file\" << EOF\n{\n  \"timestamp\": \"$(get_timestamp)\",\n  \"environment\": \"$ENVIRONMENT\",\n  \"website_url\": \"$WEBSITE_URL\",\n  \"monitoring_period\": \"24h\",\n  \"statistics\": {\n    \"uptime_percentage\": $uptime_percentage,\n    \"total_checks\": $total_checks,\n    \"successful_checks\": $successful_checks,\n    \"failed_checks\": $((total_checks - successful_checks)),\n    \"average_response_time\": $avg_response_time\n  },\n  \"last_check\": {\n    \"timestamp\": \"$(get_timestamp)\",\n    \"status\": \"$(tail -n 1 \"$LOG_DIR/response_times.csv\" 2>/dev/null | cut -d',' -f3 || echo 'unknown')\",\n    \"response_time\": \"$(tail -n 1 \"$LOG_DIR/response_times.csv\" 2>/dev/null | cut -d',' -f2 || echo '0')\"\n  }\n}\nEOF\n    \n    log_success \"监控报告生成完成\"\n    echo \"$report_file\"\n}\n\n# 发送告警通知\nsend_alert() {\n    local level=$1\n    local message=$2\n    local details=${3:-\"\"}\n    \n    local timestamp=$(get_timestamp)\n    \n    # 发送Slack通知\n    if [ -n \"$SLACK_WEBHOOK_URL\" ]; then\n        local color=\"good\"\n        local emoji=\"✅\"\n        \n        case $level in\n            \"error\")\n                color=\"danger\"\n                emoji=\"🚨\"\n                ;;\n            \"warning\")\n                color=\"warning\"\n                emoji=\"⚠️\"\n                ;;\n            \"info\")\n                color=\"good\"\n                emoji=\"ℹ️\"\n                ;;\n        esac\n        \n        curl -X POST -H 'Content-type: application/json' \\\n            --data \"{\n                \\\"attachments\\\": [{\n                    \\\"color\\\": \\\"$color\\\",\n                    \\\"title\\\": \\\"${emoji} LED B2B网站监控告警\\\",\n                    \\\"text\\\": \\\"$message\\\",\n                    \\\"fields\\\": [\n                        {\n                            \\\"title\\\": \\\"环境\\\",\n                            \\\"value\\\": \\\"$ENVIRONMENT\\\",\n                            \\\"short\\\": true\n                        },\n                        {\n                            \\\"title\\\": \\\"时间\\\",\n                            \\\"value\\\": \\\"$timestamp\\\",\n                            \\\"short\\\": true\n                        },\n                        {\n                            \\\"title\\\": \\\"网站\\\",\n                            \\\"value\\\": \\\"$WEBSITE_URL\\\",\n                            \\\"short\\\": false\n                        }\n                    ]\n                }]\n            }\" \\\n            \"$SLACK_WEBHOOK_URL\" > /dev/null 2>&1\n    fi\n    \n    # 发送邮件通知\n    if [ -n \"$ALERT_EMAIL\" ] && command -v mail >/dev/null 2>&1; then\n        echo \"$message\\n\\n详细信息:\\n$details\\n\\n时间: $timestamp\\n环境: $ENVIRONMENT\\n网站: $WEBSITE_URL\" | \\\n            mail -s \"[LED B2B] 网站监控告警 - $level\" \"$ALERT_EMAIL\"\n    fi\n    \n    # 记录到系统日志\n    logger -t led-b2b-monitor \"[$level] $message\"\n}\n\n# 主监控流程\nmain_monitoring() {\n    local errors=0\n    local warnings=0\n    \n    log_info \"开始网站监控检查 - $(get_timestamp)\"\n    \n    # 检查网站可用性\n    case $(check_website_availability \"$WEBSITE_URL\") in\n        0) ;; # 正常\n        1) \n            send_alert \"error\" \"网站无法访问\"\n            ((errors++))\n            ;;\n        2)\n            send_alert \"warning\" \"网站响应缓慢\"\n            ((warnings++))\n            ;;\n    esac\n    \n    # 检查SSL证书\n    case $(check_ssl_certificate) in\n        0) ;; # 正常\n        1)\n            send_alert \"error\" \"SSL证书问题\"\n            ((errors++))\n            ;;\n        2)\n            send_alert \"warning\" \"SSL证书即将过期\"\n            ((warnings++))\n            ;;\n    esac\n    \n    # 检查关键页面\n    if ! check_critical_pages \"$WEBSITE_URL\"; then\n        send_alert \"error\" \"关键页面访问异常\"\n        ((errors++))\n    fi\n    \n    # 检查API健康状态\n    case $(check_api_health) in\n        0) ;; # 正常\n        1)\n            send_alert \"error\" \"API健康检查失败\"\n            ((errors++))\n            ;;\n        2)\n            send_alert \"warning\" \"API响应异常\"\n            ((warnings++))\n            ;;\n    esac\n    \n    # 检查数据库连接\n    if ! check_database_connection; then\n        send_alert \"error\" \"数据库连接异常\"\n        ((errors++))\n    fi\n    \n    # 检查服务器资源\n    check_server_resources\n    \n    # 检查Docker容器\n    if ! check_docker_containers; then\n        send_alert \"error\" \"Docker容器异常\"\n        ((errors++))\n    fi\n    \n    # 生成监控报告\n    local report_file=$(generate_monitoring_report)\n    \n    # 总结监控结果\n    if [ $errors -eq 0 ] && [ $warnings -eq 0 ]; then\n        log_success \"监控检查完成 - 所有系统正常\"\n    elif [ $errors -eq 0 ]; then\n        log_warning \"监控检查完成 - 发现 $warnings 个警告\"\n    else\n        log_error \"监控检查完成 - 发现 $errors 个错误, $warnings 个警告\"\n    fi\n    \n    return $errors\n}\n\n# 持续监控模式\ncontinuous_monitoring() {\n    log_info \"启动持续监控模式 (间隔: ${CHECK_INTERVAL}秒)\"\n    \n    while true; do\n        main_monitoring\n        \n        log_info \"等待 $CHECK_INTERVAL 秒后进行下次检查...\"\n        sleep $CHECK_INTERVAL\n    done\n}\n\n# 显示帮助信息\nshow_help() {\n    cat << EOF\n用法: $0 [OPTIONS] [WEBSITE_URL] [ENVIRONMENT]\n\n参数:\n  WEBSITE_URL    要监控的网站URL (默认: https://led-b2b.com)\n  ENVIRONMENT    环境名称 (默认: production)\n\n选项:\n  -c, --continuous    持续监控模式\n  -r, --report        生成监控报告\n  -h, --help          显示帮助信息\n\n环境变量:\n  ALERT_EMAIL         告警邮件地址\n  SLACK_WEBHOOK_URL   Slack Webhook URL\n  CHECK_INTERVAL      检查间隔（秒，默认300）\n  TIMEOUT             请求超时时间（秒，默认30）\n  MAX_RESPONSE_TIME   最大响应时间（毫秒，默认3000）\n\n示例:\n  $0                                    # 单次检查\n  $0 -c                                 # 持续监控\n  $0 -r                                 # 生成报告\n  $0 https://staging.led-b2b.com staging  # 监控staging环境\n\nEOF\n}\n\n# 脚本入口\ncase \"${1:-}\" in\n    \"-c\"|\"--continuous\")\n        shift\n        WEBSITE_URL=${1:-$WEBSITE_URL}\n        ENVIRONMENT=${2:-$ENVIRONMENT}\n        continuous_monitoring\n        ;;\n    \"-r\"|\"--report\")\n        shift\n        WEBSITE_URL=${1:-$WEBSITE_URL}\n        ENVIRONMENT=${2:-$ENVIRONMENT}\n        generate_monitoring_report\n        ;;\n    \"-h\"|\"--help\")\n        show_help\n        exit 0\n        ;;\n    *)\n        if [ -n \"$1\" ] && [[ \"$1\" != -* ]]; then\n            WEBSITE_URL=$1\n            ENVIRONMENT=${2:-$ENVIRONMENT}\n        fi\n        main_monitoring\n        ;;\nesac"