#!/bin/bash

# LED B2B网站最终上线验证脚本
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
PROJECT_DIR=${3:-"/opt/led-b2b-website"}
VERIFICATION_LOG="/tmp/final-launch-verification-$(date +%Y%m%d_%H%M%S).log"

# 验证结果统计
TOTAL_VERIFICATIONS=0
PASSED_VERIFICATIONS=0
FAILED_VERIFICATIONS=0
CRITICAL_FAILURES=0

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$VERIFICATION_LOG"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1" | tee -a "$VERIFICATION_LOG"
    ((PASSED_VERIFICATIONS++))
}

log_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1" | tee -a "$VERIFICATION_LOG"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1" | tee -a "$VERIFICATION_LOG"
    ((FAILED_VERIFICATIONS++))
}

log_critical() {
    echo -e "${RED}[CRITICAL]${NC} $1" | tee -a "$VERIFICATION_LOG"
    ((FAILED_VERIFICATIONS++))
    ((CRITICAL_FAILURES++))
}

# 执行验证并记录结果
run_verification() {
    local verification_name="$1"
    local verification_command="$2"
    local is_critical=${3:-false}
    
    ((TOTAL_VERIFICATIONS++))
    log_info "验证: $verification_name"
    
    if eval "$verification_command"; then
        log_success "$verification_name"
        return 0
    else
        if [ "$is_critical" = true ]; then
            log_critical "$verification_name - 关键验证失败"
        else
            log_error "$verification_name"
        fi
        return 1
    fi
}

# 1. 核心功能验证
verify_core_functionality() {
    log_info "=== 核心功能验证 ==="
    
    # 网站可访问性
    run_verification "网站主页访问" \
        "curl -f -s -o /dev/null --max-time 10 '$WEBSITE_URL'" \
        true
    
    # API健康检查
    run_verification "API健康检查" \
        "curl -f -s '$WEBSITE_URL/api/health' | grep -q '\"status\":\"ok\"'" \
        true
    
    # 数据库连接
    run_verification "数据库连接" \
        "curl -f -s '$WEBSITE_URL/api/health?check=database' | grep -q '\"database\":\"connected\"'" \
        true
    
    # 关键页面访问
    local pages=("/" "/products" "/solutions" "/case-studies" "/contact")
    for page in "${pages[@]}"; do
        run_verification "页面访问: $page" \
            "curl -f -s -o /dev/null --max-time 10 '$WEBSITE_URL$page'"
    done
}

# 2. 性能验证
verify_performance() {
    log_info "=== 性能验证 ==="
    
    # 页面加载时间
    local load_time=$(curl -o /dev/null -s -w "%{time_total}" --max-time 30 "$WEBSITE_URL")
    local load_time_ms=$(echo "$load_time * 1000" | bc | cut -d. -f1)
    
    if [ "$load_time_ms" -lt 3000 ]; then
        log_success "页面加载时间: ${load_time_ms}ms (< 3000ms)"
        ((PASSED_VERIFICATIONS++))
    else
        log_error "页面加载时间过长: ${load_time_ms}ms (目标: < 3000ms)"
        ((FAILED_VERIFICATIONS++))
    fi
    ((TOTAL_VERIFICATIONS++))
    
    # 并发访问测试
    run_verification "并发访问测试" \
        "for i in {1..10}; do curl -f -s -o /dev/null --max-time 10 '$WEBSITE_URL' & done; wait"
    
    # 静态资源缓存
    run_verification "静态资源缓存配置" \
        "curl -I -s '$WEBSITE_URL' | grep -i 'cache-control'"
}

# 3. 安全验证
verify_security() {
    log_info "=== 安全验证 ==="
    
    # HTTPS强制跳转
    run_verification "HTTPS强制跳转" \
        "curl -I -s 'http://$(echo $WEBSITE_URL | sed 's|https://||')' | grep -q '301\\|302'" \
        true
    
    # SSL证书有效性
    local domain=$(echo "$WEBSITE_URL" | sed 's|https://||' | sed 's|/.*||')
    run_verification "SSL证书有效性" \
        "echo | openssl s_client -servername '$domain' -connect '$domain:443' 2>/dev/null | openssl x509 -noout -dates 2>/dev/null" \
        true
    
    # 安全头检查
    local security_headers=("X-Frame-Options" "X-Content-Type-Options" "X-XSS-Protection" "Strict-Transport-Security")
    for header in "${security_headers[@]}"; do
        run_verification "安全头: $header" \
            "curl -I -s '$WEBSITE_URL' | grep -i '$header'"
    done
    
    # CSP头检查
    run_verification "内容安全策略(CSP)" \
        "curl -I -s '$WEBSITE_URL' | grep -i 'content-security-policy'"
}

# 4. SEO验证
verify_seo() {
    log_info "=== SEO验证 ==="
    
    local html_content=$(curl -s "$WEBSITE_URL")
    
    # 页面标题
    if echo "$html_content" | grep -q "<title>.*</title>"; then
        local title_length=$(echo "$html_content" | grep -o "<title>.*</title>" | sed 's/<title>//;s/<\/title>//' | wc -c)
        if [ "$title_length" -ge 30 ] && [ "$title_length" -le 60 ]; then
            log_success "页面标题长度合适: ${title_length}字符"
            ((PASSED_VERIFICATIONS++))
        else
            log_error "页面标题长度不当: ${title_length}字符"
            ((FAILED_VERIFICATIONS++))
        fi
    else
        log_error "缺少页面标题"
        ((FAILED_VERIFICATIONS++))
    fi
    ((TOTAL_VERIFICATIONS++))
    
    # Meta描述
    run_verification "Meta描述" \
        "echo '$html_content' | grep -q 'name=\"description\"'"
    
    # robots.txt
    run_verification "robots.txt" \
        "curl -f -s '$WEBSITE_URL/robots.txt' | grep -q 'User-agent'"
    
    # sitemap.xml
    run_verification "sitemap.xml" \
        "curl -f -s '$WEBSITE_URL/sitemap.xml' | grep -q '<urlset'"
    
    # 结构化数据
    run_verification "结构化数据" \
        "echo '$html_content' | grep -q 'application/ld+json'"
}

# 5. 多语言验证
verify_internationalization() {
    log_info "=== 多语言验证 ==="
    
    # 中文页面
    run_verification "中文页面" \
        "curl -f -s '$WEBSITE_URL/zh' | grep -q 'LED显示屏'"
    
    # 英文页面
    run_verification "英文页面" \
        "curl -f -s '$WEBSITE_URL/en' | grep -q 'LED Display'"
    
    # 语言切换功能
    run_verification "语言切换功能" \
        "curl -s '$WEBSITE_URL' | grep -q 'hreflang'"
    
    # 本地化内容
    run_verification "本地化货币显示" \
        "curl -s '$WEBSITE_URL/zh' | grep -q '¥\\|RMB'"
}

# 6. 移动端验证
verify_mobile_compatibility() {
    log_info "=== 移动端验证 ==="
    
    # viewport meta标签
    run_verification "viewport meta标签" \
        "curl -s '$WEBSITE_URL' | grep -q 'name=\"viewport\"'"
    
    # 移动端访问
    run_verification "移动端访问" \
        "curl -f -s -H 'User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)' '$WEBSITE_URL' > /dev/null"
    
    # 响应式设计
    run_verification "响应式设计标识" \
        "curl -s '$WEBSITE_URL' | grep -q '@media\\|responsive'"
}

# 7. 表单功能验证
verify_forms() {
    log_info "=== 表单功能验证 ==="
    
    # 联系表单页面
    run_verification "联系表单页面" \
        "curl -f -s '$WEBSITE_URL/contact' | grep -q 'form'"
    
    # 询盘表单API
    run_verification "询盘表单API" \
        "curl -f -s -X OPTIONS '$WEBSITE_URL/api/inquiries' > /dev/null"
    
    # 表单验证
    run_verification "表单验证功能" \
        "curl -s '$WEBSITE_URL/contact' | grep -q 'required\\|validation'"
}

# 8. 监控系统验证
verify_monitoring() {
    log_info "=== 监控系统验证 ==="
    
    # 监控脚本
    run_verification "网站监控脚本" \
        "[ -x '/usr/local/bin/led-b2b-monitor' ] || [ -x '$PROJECT_DIR/scripts/website-monitor.sh' ]"
    
    # 备份脚本
    run_verification "数据备份脚本" \
        "[ -x '$PROJECT_DIR/scripts/backup-database.sh' ]"
    
    # 日志目录
    run_verification "日志目录" \
        "[ -d '/var/log/led-b2b' ] || [ -d '/var/log/led-b2b-monitor' ]"
    
    # 定时任务
    run_verification "定时任务配置" \
        "crontab -l | grep -q 'led-b2b' || [ -f '/etc/cron.d/led-b2b' ]"
}

# 9. 数据完整性验证
verify_data_integrity() {
    log_info "=== 数据完整性验证 ==="
    
    # 产品数据
    run_verification "产品数据API" \
        "curl -f -s '$WEBSITE_URL/api/products' | grep -q '\\[.*\\]'"
    
    # 案例研究数据
    run_verification "案例研究数据API" \
        "curl -f -s '$WEBSITE_URL/api/case-studies' | grep -q '\\[.*\\]'"
    
    # 解决方案数据
    run_verification "解决方案数据" \
        "curl -f -s '$WEBSITE_URL/solutions' | grep -q '解决方案\\|Solutions'"
}

# 10. 第三方集成验证
verify_third_party_integrations() {
    log_info "=== 第三方集成验证 ==="
    
    # Google Analytics
    run_verification "Google Analytics集成" \
        "curl -s '$WEBSITE_URL' | grep -q 'gtag\\|analytics'"
    
    # 社交媒体链接
    run_verification "社交媒体链接" \
        "curl -s '$WEBSITE_URL' | grep -q 'facebook\\|twitter\\|linkedin'"
    
    # 地图集成
    run_verification "地图集成" \
        "curl -s '$WEBSITE_URL/contact' | grep -q 'map\\|地图'"
}

# 生成最终验证报告
generate_final_report() {
    local report_file="/tmp/final-launch-report-$(date +%Y%m%d_%H%M%S).html"
    local pass_rate=$(echo "scale=1; $PASSED_VERIFICATIONS * 100 / $TOTAL_VERIFICATIONS" | bc)
    
    cat > "$report_file" << EOF
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LED B2B网站最终上线验证报告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px; margin-bottom: 20px; }
        .header h1 { margin: 0; font-size: 2.5em; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .summary-card { padding: 20px; border-radius: 8px; text-align: center; }
        .summary-card h3 { margin: 0 0 10px 0; font-size: 2em; }
        .summary-card p { margin: 0; font-weight: bold; }
        .passed { background: #d4edda; color: #155724; }
        .failed { background: #f8d7da; color: #721c24; }
        .critical { background: #f5c6cb; color: #721c24; border: 2px solid #dc3545; }
        .total { background: #e2e3e5; color: #383d41; }
        .status { padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .status.ready { background: #d4edda; color: #155724; }
        .status.not-ready { background: #f8d7da; color: #721c24; }
        .details { margin: 20px 0; }
        .verification-item { margin: 10px 0; padding: 15px; border-radius: 5px; border-left: 4px solid; }
        .verification-item.passed { background: #d4edda; border-color: #28a745; }
        .verification-item.failed { background: #f8d7da; border-color: #dc3545; }
        .verification-item.critical { background: #f5c6cb; border-color: #dc3545; font-weight: bold; }
        .timestamp { text-align: center; margin-top: 30px; color: #6c757d; }
        .recommendations { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .recommendations h3 { color: #856404; margin-top: 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 LED B2B网站最终上线验证报告</h1>
            <p><strong>验证时间:</strong> $(date)</p>
            <p><strong>网站URL:</strong> $WEBSITE_URL</p>
            <p><strong>环境:</strong> $ENVIRONMENT</p>
        </div>
        
        <div class="summary">
            <div class="summary-card total">
                <h3>$TOTAL_VERIFICATIONS</h3>
                <p>总验证项</p>
            </div>
            <div class="summary-card passed">
                <h3>$PASSED_VERIFICATIONS</h3>
                <p>通过验证</p>
            </div>
            <div class="summary-card failed">
                <h3>$FAILED_VERIFICATIONS</h3>
                <p>失败验证</p>
            </div>
            <div class="summary-card critical">
                <h3>$CRITICAL_FAILURES</h3>
                <p>关键失败</p>
            </div>
        </div>
        
        <div class="status $([ $CRITICAL_FAILURES -eq 0 ] && echo 'ready' || echo 'not-ready')">
            <h2>$([ $CRITICAL_FAILURES -eq 0 ] && echo '✅ 网站已准备好上线！' || echo '❌ 网站尚未准备好上线')</h2>
            <p><strong>通过率:</strong> ${pass_rate}%</p>
            $([ $CRITICAL_FAILURES -gt 0 ] && echo "<p><strong>关键问题:</strong> 发现 $CRITICAL_FAILURES 个关键问题需要立即修复</p>")
        </div>
EOF

    # 添加建议部分
    if [ $CRITICAL_FAILURES -gt 0 ] || [ $FAILED_VERIFICATIONS -gt 0 ]; then
        cat >> "$report_file" << EOF
        <div class="recommendations">
            <h3>🔧 修复建议</h3>
            <ul>
EOF
        if [ $CRITICAL_FAILURES -gt 0 ]; then
            echo "                <li><strong>立即修复关键问题:</strong> 网站无法正常访问或存在严重安全问题</li>" >> "$report_file"
        fi
        if [ $FAILED_VERIFICATIONS -gt 0 ]; then
            echo "                <li><strong>修复失败项:</strong> 检查详细日志并修复所有失败的验证项</li>" >> "$report_file"
            echo "                <li><strong>重新验证:</strong> 修复后重新运行验证脚本</li>" >> "$report_file"
        fi
        cat >> "$report_file" << EOF
                <li><strong>监控设置:</strong> 确保监控和告警系统正常工作</li>
                <li><strong>备份验证:</strong> 验证数据备份和恢复流程</li>
            </ul>
        </div>
EOF
    fi

    # 添加详细验证结果
    cat >> "$report_file" << EOF
        <div class="details">
            <h2>📋 详细验证结果</h2>
EOF

    # 从日志文件中提取验证结果
    while IFS= read -r line; do
        if [[ $line == *"[✓]"* ]]; then
            echo "            <div class='verification-item passed'>$line</div>" >> "$report_file"
        elif [[ $line == *"[✗]"* ]]; then
            echo "            <div class='verification-item failed'>$line</div>" >> "$report_file"
        elif [[ $line == *"[CRITICAL]"* ]]; then
            echo "            <div class='verification-item critical'>$line</div>" >> "$report_file"
        fi
    done < "$VERIFICATION_LOG"

    cat >> "$report_file" << EOF
        </div>
        
        <div class="timestamp">
            <p><em>报告生成时间: $(date)</em></p>
            <p><em>详细日志: $VERIFICATION_LOG</em></p>
        </div>
    </div>
</body>
</html>
EOF

    echo "$report_file"
}

# 发送上线通知
send_launch_notification() {
    local status=$1
    local report_file=$2
    
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        local color="good"
        local emoji="🚀"
        local message="LED B2B网站已成功上线！"
        
        if [ "$status" != "ready" ]; then
            color="danger"
            emoji="⚠️"
            message="LED B2B网站上线验证发现问题"
        fi
        
        curl -X POST -H 'Content-type: application/json' \
            --data "{
                \"attachments\": [{
                    \"color\": \"$color\",
                    \"title\": \"$emoji LED B2B网站上线验证报告\",
                    \"text\": \"$message\",
                    \"fields\": [
                        {
                            \"title\": \"网站URL\",
                            \"value\": \"$WEBSITE_URL\",
                            \"short\": true
                        },
                        {
                            \"title\": \"环境\",
                            \"value\": \"$ENVIRONMENT\",
                            \"short\": true
                        },
                        {
                            \"title\": \"验证结果\",
                            \"value\": \"通过: $PASSED_VERIFICATIONS/$TOTAL_VERIFICATIONS\",
                            \"short\": true
                        },
                        {
                            \"title\": \"关键问题\",
                            \"value\": \"$CRITICAL_FAILURES\",
                            \"short\": true
                        }
                    ]
                }]
            }" \
            "$SLACK_WEBHOOK_URL"
    fi
}

# 主函数
main() {
    log_info "开始LED B2B网站最终上线验证"
    log_info "网站URL: $WEBSITE_URL"
    log_info "环境: $ENVIRONMENT"
    log_info "项目目录: $PROJECT_DIR"
    log_info "验证日志: $VERIFICATION_LOG"
    echo "" | tee -a "$VERIFICATION_LOG"
    
    # 执行所有验证
    verify_core_functionality
    echo "" | tee -a "$VERIFICATION_LOG"
    
    verify_performance
    echo "" | tee -a "$VERIFICATION_LOG"
    
    verify_security
    echo "" | tee -a "$VERIFICATION_LOG"
    
    verify_seo
    echo "" | tee -a "$VERIFICATION_LOG"
    
    verify_internationalization
    echo "" | tee -a "$VERIFICATION_LOG"
    
    verify_mobile_compatibility
    echo "" | tee -a "$VERIFICATION_LOG"
    
    verify_forms
    echo "" | tee -a "$VERIFICATION_LOG"
    
    verify_monitoring
    echo "" | tee -a "$VERIFICATION_LOG"
    
    verify_data_integrity
    echo "" | tee -a "$VERIFICATION_LOG"
    
    verify_third_party_integrations
    echo "" | tee -a "$VERIFICATION_LOG"
    
    # 生成最终报告
    local report_file=$(generate_final_report)
    
    # 显示最终结果
    log_info "=== 最终验证结果 ==="
    log_info "总验证项: $TOTAL_VERIFICATIONS"
    log_info "通过验证: $PASSED_VERIFICATIONS"
    log_info "失败验证: $FAILED_VERIFICATIONS"
    log_info "关键失败: $CRITICAL_FAILURES"
    
    local pass_rate=$(echo "scale=1; $PASSED_VERIFICATIONS * 100 / $TOTAL_VERIFICATIONS" | bc)
    log_info "通过率: ${pass_rate}%"
    
    log_info "详细日志: $VERIFICATION_LOG"
    log_info "HTML报告: $report_file"
    
    # 发送通知
    if [ "$CRITICAL_FAILURES" -eq 0 ]; then
        log_success "🚀 网站已准备好上线！"
        send_launch_notification "ready" "$report_file"
        exit 0
    else
        log_critical "❌ 网站尚未准备好上线，发现 $CRITICAL_FAILURES 个关键问题"
        send_launch_notification "not-ready" "$report_file"
        exit 1
    fi
}

# 显示帮助信息
show_help() {
    cat << EOF
用法: $0 [WEBSITE_URL] [ENVIRONMENT] [PROJECT_DIR]

参数:
  WEBSITE_URL    要验证的网站URL (默认: https://led-b2b.com)
  ENVIRONMENT    环境名称 (默认: production)
  PROJECT_DIR    项目目录路径 (默认: /opt/led-b2b-website)

验证项目:
  1. 核心功能验证 - 网站访问、API、数据库连接
  2. 性能验证 - 加载时间、并发访问、缓存配置
  3. 安全验证 - HTTPS、SSL证书、安全头
  4. SEO验证 - 标题、描述、robots.txt、sitemap
  5. 多语言验证 - 中英文页面、语言切换
  6. 移动端验证 - 响应式设计、移动端访问
  7. 表单功能验证 - 联系表单、询盘API
  8. 监控系统验证 - 监控脚本、备份脚本、定时任务
  9. 数据完整性验证 - 产品数据、案例数据
  10. 第三方集成验证 - 分析工具、社交媒体

环境变量:
  SLACK_WEBHOOK_URL    Slack通知Webhook URL

示例:
  $0                                                    # 使用默认参数
  $0 https://staging.led-b2b.com staging              # 验证staging环境
  $0 https://led-b2b.com production /opt/led-b2b      # 指定所有参数

退出码:
  0 - 所有验证通过，网站可以上线
  1 - 发现关键问题，网站不能上线

EOF
}

# 脚本入口
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    show_help
    exit 0
fi

main