#!/bin/bash

# LED B2B网站上线前检查清单脚本
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
LOG_FILE="/tmp/pre-launch-checklist-$(date +%Y%m%d_%H%M%S).log"

# 检查结果统计
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNING_CHECKS=0

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1" | tee -a "$LOG_FILE"
    ((PASSED_CHECKS++))
}

log_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1" | tee -a "$LOG_FILE"
    ((WARNING_CHECKS++))
}

log_error() {
    echo -e "${RED}[✗]${NC} $1" | tee -a "$LOG_FILE"
    ((FAILED_CHECKS++))
}

# 执行检查并记录结果
run_check() {
    local check_name="$1"
    local check_command="$2"
    
    ((TOTAL_CHECKS++))
    log_info "检查: $check_name"
    
    if eval "$check_command"; then
        log_success "$check_name"
        return 0
    else
        log_error "$check_name"
        return 1
    fi
}

# 1. 环境配置检查
check_environment_config() {
    log_info "=== 环境配置检查 ==="
    
    # 检查环境变量文件
    if [ -f "$PROJECT_DIR/.env.$ENVIRONMENT" ]; then
        log_success "环境配置文件存在: .env.$ENVIRONMENT"
        
        # 检查必要的环境变量
        local required_vars=("DATABASE_URL" "NEXTAUTH_SECRET" "NEXTAUTH_URL")
        for var in "${required_vars[@]}"; do
            if grep -q "^$var=" "$PROJECT_DIR/.env.$ENVIRONMENT"; then
                log_success "环境变量已配置: $var"
            else
                log_error "缺少环境变量: $var"
            fi
        done
    else
        log_error "环境配置文件不存在: .env.$ENVIRONMENT"
    fi
    
    # 检查Node.js版本
    if command -v node >/dev/null 2>&1; then
        local node_version=$(node --version | sed 's/v//')\n        local required_version=\"18.0.0\"\n        if [ \"$(printf '%s\\n' \"$required_version\" \"$node_version\" | sort -V | head -n1)\" = \"$required_version\" ]; then\n            log_success \"Node.js版本符合要求: $node_version\"\n        else\n            log_error \"Node.js版本过低: $node_version (需要 >= $required_version)\"\n        fi\n    else\n        log_error \"Node.js未安装\"\n    fi\n    \n    # 检查Docker\n    if command -v docker >/dev/null 2>&1; then\n        if docker ps >/dev/null 2>&1; then\n            log_success \"Docker运行正常\"\n        else\n            log_error \"Docker服务未运行\"\n        fi\n    else\n        log_error \"Docker未安装\"\n    fi\n}\n\n# 2. 代码质量检查\ncheck_code_quality() {\n    log_info \"=== 代码质量检查 ===\"\n    \n    cd \"$PROJECT_DIR\"\n    \n    # 检查依赖安装\n    if [ -f \"package.json\" ] && [ -d \"node_modules\" ]; then\n        log_success \"依赖包已安装\"\n    else\n        log_error \"依赖包未安装或package.json不存在\"\n    fi\n    \n    # 运行ESLint检查\n    if npm run lint >/dev/null 2>&1; then\n        log_success \"ESLint检查通过\"\n    else\n        log_warning \"ESLint检查发现问题\"\n    fi\n    \n    # 运行TypeScript类型检查\n    if npm run type-check >/dev/null 2>&1; then\n        log_success \"TypeScript类型检查通过\"\n    else\n        log_error \"TypeScript类型检查失败\"\n    fi\n    \n    # 检查构建\n    if npm run build >/dev/null 2>&1; then\n        log_success \"项目构建成功\"\n    else\n        log_error \"项目构建失败\"\n    fi\n}\n\n# 3. 测试覆盖率检查\ncheck_test_coverage() {\n    log_info \"=== 测试覆盖率检查 ===\"\n    \n    cd \"$PROJECT_DIR\"\n    \n    # 运行单元测试\n    if npm run test >/dev/null 2>&1; then\n        log_success \"单元测试通过\"\n    else\n        log_error \"单元测试失败\"\n    fi\n    \n    # 检查测试覆盖率\n    if npm run test:coverage >/dev/null 2>&1; then\n        local coverage=$(npm run test:coverage 2>/dev/null | grep \"All files\" | awk '{print $10}' | sed 's/%//')\n        if [ -n \"$coverage\" ] && [ \"$coverage\" -ge 80 ]; then\n            log_success \"测试覆盖率达标: ${coverage}%\"\n        else\n            log_warning \"测试覆盖率不足: ${coverage}% (目标: 80%)\"\n        fi\n    else\n        log_error \"无法获取测试覆盖率\"\n    fi\n    \n    # 运行E2E测试\n    if npm run test:e2e >/dev/null 2>&1; then\n        log_success \"E2E测试通过\"\n    else\n        log_warning \"E2E测试失败或未配置\"\n    fi\n}\n\n# 4. 安全性检查\ncheck_security() {\n    log_info \"=== 安全性检查 ===\"\n    \n    cd \"$PROJECT_DIR\"\n    \n    # 检查依赖漏洞\n    if npm audit --audit-level=high >/dev/null 2>&1; then\n        log_success \"依赖安全检查通过\"\n    else\n        log_warning \"发现依赖安全漏洞\"\n    fi\n    \n    # 检查敏感信息\n    if grep -r \"password\\|secret\\|key\" --include=\"*.js\" --include=\"*.ts\" --include=\"*.json\" . | grep -v node_modules | grep -v \".git\" >/dev/null; then\n        log_warning \"代码中可能包含敏感信息\"\n    else\n        log_success \"未发现明文敏感信息\"\n    fi\n    \n    # 检查HTTPS配置\n    if curl -s -I \"$WEBSITE_URL\" | grep -q \"HTTP/2 200\\|HTTP/1.1 200\"; then\n        if [[ \"$WEBSITE_URL\" == https://* ]]; then\n            log_success \"HTTPS配置正确\"\n        else\n            log_error \"网站未使用HTTPS\"\n        fi\n    else\n        log_error \"网站无法访问\"\n    fi\n}\n\n# 5. 性能检查\ncheck_performance() {\n    log_info \"=== 性能检查 ===\"\n    \n    # 检查页面加载时间\n    local load_time=$(curl -o /dev/null -s -w \"%{time_total}\" \"$WEBSITE_URL\")\n    local load_time_ms=$(echo \"$load_time * 1000\" | bc | cut -d. -f1)\n    \n    if [ \"$load_time_ms\" -lt 3000 ]; then\n        log_success \"页面加载时间: ${load_time_ms}ms\"\n    else\n        log_warning \"页面加载时间过长: ${load_time_ms}ms (目标: <3000ms)\"\n    fi\n    \n    # 检查图片优化\n    local image_count=$(curl -s \"$WEBSITE_URL\" | grep -o '<img[^>]*>' | wc -l)\n    local webp_count=$(curl -s \"$WEBSITE_URL\" | grep -o 'src=\"[^\"]*\\.webp\"' | wc -l)\n    \n    if [ \"$image_count\" -gt 0 ]; then\n        local webp_ratio=$(echo \"scale=2; $webp_count * 100 / $image_count\" | bc)\n        if (( $(echo \"$webp_ratio >= 80\" | bc -l) )); then\n            log_success \"图片优化良好: ${webp_ratio}% 使用WebP格式\"\n        else\n            log_warning \"图片优化不足: ${webp_ratio}% 使用WebP格式\"\n        fi\n    fi\n    \n    # 检查缓存配置\n    local cache_header=$(curl -s -I \"$WEBSITE_URL\" | grep -i \"cache-control\")\n    if [ -n \"$cache_header\" ]; then\n        log_success \"缓存头配置正确\"\n    else\n        log_warning \"缺少缓存头配置\"\n    fi\n}\n\n# 6. SEO检查\ncheck_seo() {\n    log_info \"=== SEO检查 ===\"\n    \n    local html_content=$(curl -s \"$WEBSITE_URL\")\n    \n    # 检查title标签\n    if echo \"$html_content\" | grep -q \"<title>.*</title>\"; then\n        local title=$(echo \"$html_content\" | grep -o \"<title>.*</title>\" | sed 's/<title>//;s/<\\/title>//')\n        if [ ${#title} -ge 30 ] && [ ${#title} -le 60 ]; then\n            log_success \"页面标题长度合适: ${#title}字符\"\n        else\n            log_warning \"页面标题长度不当: ${#title}字符 (建议30-60字符)\"\n        fi\n    else\n        log_error \"缺少页面标题\"\n    fi\n    \n    # 检查meta description\n    if echo \"$html_content\" | grep -q 'name=\"description\"'; then\n        local description=$(echo \"$html_content\" | grep -o 'name=\"description\"[^>]*content=\"[^\"]*\"' | sed 's/.*content=\"//;s/\".*//')\n        if [ ${#description} -ge 120 ] && [ ${#description} -le 160 ]; then\n            log_success \"Meta描述长度合适: ${#description}字符\"\n        else\n            log_warning \"Meta描述长度不当: ${#description}字符 (建议120-160字符)\"\n        fi\n    else\n        log_error \"缺少Meta描述\"\n    fi\n    \n    # 检查robots.txt\n    if curl -s \"${WEBSITE_URL}/robots.txt\" | grep -q \"User-agent\"; then\n        log_success \"robots.txt配置正确\"\n    else\n        log_warning \"robots.txt配置异常或缺失\"\n    fi\n    \n    # 检查sitemap\n    if curl -s \"${WEBSITE_URL}/sitemap.xml\" | grep -q \"<urlset\"; then\n        log_success \"sitemap.xml存在且格式正确\"\n    else\n        log_warning \"sitemap.xml异常或缺失\"\n    fi\n}\n\n# 7. 多语言检查\ncheck_internationalization() {\n    log_info \"=== 多语言检查 ===\"\n    \n    # 检查中文页面\n    if curl -s \"${WEBSITE_URL}/zh\" | grep -q \"LED显示屏\"; then\n        log_success \"中文页面正常\"\n    else\n        log_error \"中文页面异常\"\n    fi\n    \n    # 检查英文页面\n    if curl -s \"${WEBSITE_URL}/en\" | grep -q \"LED Display\"; then\n        log_success \"英文页面正常\"\n    else\n        log_error \"英文页面异常\"\n    fi\n    \n    # 检查hreflang标签\n    local html_content=$(curl -s \"$WEBSITE_URL\")\n    if echo \"$html_content\" | grep -q 'hreflang=\"zh\"' && echo \"$html_content\" | grep -q 'hreflang=\"en\"'; then\n        log_success \"hreflang标签配置正确\"\n    else\n        log_warning \"hreflang标签配置异常\"\n    fi\n}\n\n# 8. 功能测试\ncheck_functionality() {\n    log_info \"=== 功能测试 ===\"\n    \n    # 检查API健康状态\n    if curl -s \"${WEBSITE_URL}/api/health\" | grep -q '\"status\":\"ok\"'; then\n        log_success \"API健康检查通过\"\n    else\n        log_error \"API健康检查失败\"\n    fi\n    \n    # 检查产品页面\n    if curl -s \"${WEBSITE_URL}/products\" | grep -q \"产品\\|Products\"; then\n        log_success \"产品页面正常\"\n    else\n        log_error \"产品页面异常\"\n    fi\n    \n    # 检查联系表单\n    if curl -s \"${WEBSITE_URL}/contact\" | grep -q \"form\\|表单\"; then\n        log_success \"联系表单页面正常\"\n    else\n        log_error \"联系表单页面异常\"\n    fi\n    \n    # 检查案例研究页面\n    if curl -s \"${WEBSITE_URL}/case-studies\" | grep -q \"案例\\|Case\"; then\n        log_success \"案例研究页面正常\"\n    else\n        log_error \"案例研究页面异常\"\n    fi\n}\n\n# 9. 移动端适配检查\ncheck_mobile_compatibility() {\n    log_info \"=== 移动端适配检查 ===\"\n    \n    local html_content=$(curl -s \"$WEBSITE_URL\")\n    \n    # 检查viewport meta标签\n    if echo \"$html_content\" | grep -q 'name=\"viewport\"'; then\n        log_success \"viewport meta标签存在\"\n    else\n        log_error \"缺少viewport meta标签\"\n    fi\n    \n    # 检查响应式设计\n    if echo \"$html_content\" | grep -q \"@media\\|responsive\\|mobile\"; then\n        log_success \"包含响应式设计代码\"\n    else\n        log_warning \"可能缺少响应式设计\"\n    fi\n    \n    # 使用移动端User-Agent测试\n    local mobile_response=$(curl -s -H \"User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15\" \"$WEBSITE_URL\")\n    if [ -n \"$mobile_response\" ]; then\n        log_success \"移动端访问正常\"\n    else\n        log_error \"移动端访问异常\"\n    fi\n}\n\n# 10. 监控和日志检查\ncheck_monitoring() {\n    log_info \"=== 监控和日志检查 ===\"\n    \n    # 检查日志目录\n    if [ -d \"/var/log/led-b2b\" ]; then\n        log_success \"日志目录存在\"\n    else\n        log_warning \"日志目录不存在\"\n    fi\n    \n    # 检查监控脚本\n    if [ -x \"/usr/local/bin/led-b2b-monitor\" ]; then\n        log_success \"监控脚本已安装\"\n    else\n        log_warning \"监控脚本未安装\"\n    fi\n    \n    # 检查备份脚本\n    if [ -x \"$PROJECT_DIR/scripts/backup-database.sh\" ]; then\n        log_success \"备份脚本存在\"\n    else\n        log_warning \"备份脚本不存在\"\n    fi\n    \n    # 检查定时任务\n    if crontab -l | grep -q \"led-b2b\"; then\n        log_success \"定时任务已配置\"\n    else\n        log_warning \"定时任务未配置\"\n    fi\n}\n\n# 生成检查报告\ngenerate_report() {\n    local report_file=\"/tmp/pre-launch-report-$(date +%Y%m%d_%H%M%S).html\"\n    \n    cat > \"$report_file\" << EOF\n<!DOCTYPE html>\n<html lang=\"zh-CN\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>LED B2B网站上线前检查报告</title>\n    <style>\n        body { font-family: Arial, sans-serif; margin: 20px; }\n        .header { background: #f0f0f0; padding: 20px; border-radius: 5px; }\n        .summary { margin: 20px 0; padding: 15px; border-left: 4px solid #007cba; }\n        .passed { color: #28a745; }\n        .warning { color: #ffc107; }\n        .failed { color: #dc3545; }\n        .checklist { margin: 20px 0; }\n        .check-item { margin: 10px 0; padding: 10px; border-radius: 3px; }\n        .check-item.passed { background: #d4edda; }\n        .check-item.warning { background: #fff3cd; }\n        .check-item.failed { background: #f8d7da; }\n    </style>\n</head>\n<body>\n    <div class=\"header\">\n        <h1>LED B2B网站上线前检查报告</h1>\n        <p><strong>检查时间:</strong> $(date)</p>\n        <p><strong>网站URL:</strong> $WEBSITE_URL</p>\n        <p><strong>环境:</strong> $ENVIRONMENT</p>\n    </div>\n    \n    <div class=\"summary\">\n        <h2>检查摘要</h2>\n        <p><strong>总检查项:</strong> $TOTAL_CHECKS</p>\n        <p class=\"passed\"><strong>通过:</strong> $PASSED_CHECKS</p>\n        <p class=\"warning\"><strong>警告:</strong> $WARNING_CHECKS</p>\n        <p class=\"failed\"><strong>失败:</strong> $FAILED_CHECKS</p>\n        <p><strong>通过率:</strong> $(echo \"scale=1; $PASSED_CHECKS * 100 / $TOTAL_CHECKS\" | bc)%</p>\n    </div>\n    \n    <div class=\"checklist\">\n        <h2>详细检查结果</h2>\nEOF\n    \n    # 添加检查日志到HTML报告\n    while IFS= read -r line; do\n        if [[ $line == *\"[✓]\"* ]]; then\n            echo \"        <div class='check-item passed'>$line</div>\" >> \"$report_file\"\n        elif [[ $line == *\"[⚠]\"* ]]; then\n            echo \"        <div class='check-item warning'>$line</div>\" >> \"$report_file\"\n        elif [[ $line == *\"[✗]\"* ]]; then\n            echo \"        <div class='check-item failed'>$line</div>\" >> \"$report_file\"\n        fi\n    done < \"$LOG_FILE\"\n    \n    cat >> \"$report_file\" << EOF\n    </div>\n    \n    <div class=\"footer\">\n        <p><em>报告生成时间: $(date)</em></p>\n        <p><em>详细日志: $LOG_FILE</em></p>\n    </div>\n</body>\n</html>\nEOF\n    \n    echo \"$report_file\"\n}\n\n# 主函数\nmain() {\n    log_info \"开始LED B2B网站上线前检查\"\n    log_info \"网站URL: $WEBSITE_URL\"\n    log_info \"环境: $ENVIRONMENT\"\n    log_info \"项目目录: $PROJECT_DIR\"\n    log_info \"日志文件: $LOG_FILE\"\n    echo \"\" | tee -a \"$LOG_FILE\"\n    \n    # 执行所有检查\n    check_environment_config\n    echo \"\" | tee -a \"$LOG_FILE\"\n    \n    check_code_quality\n    echo \"\" | tee -a \"$LOG_FILE\"\n    \n    check_test_coverage\n    echo \"\" | tee -a \"$LOG_FILE\"\n    \n    check_security\n    echo \"\" | tee -a \"$LOG_FILE\"\n    \n    check_performance\n    echo \"\" | tee -a \"$LOG_FILE\"\n    \n    check_seo\n    echo \"\" | tee -a \"$LOG_FILE\"\n    \n    check_internationalization\n    echo \"\" | tee -a \"$LOG_FILE\"\n    \n    check_functionality\n    echo \"\" | tee -a \"$LOG_FILE\"\n    \n    check_mobile_compatibility\n    echo \"\" | tee -a \"$LOG_FILE\"\n    \n    check_monitoring\n    echo \"\" | tee -a \"$LOG_FILE\"\n    \n    # 生成报告\n    local report_file=$(generate_report)\n    \n    # 显示最终结果\n    log_info \"=== 检查完成 ===\"\n    log_info \"总检查项: $TOTAL_CHECKS\"\n    log_info \"通过: $PASSED_CHECKS\"\n    log_info \"警告: $WARNING_CHECKS\"\n    log_info \"失败: $FAILED_CHECKS\"\n    \n    local pass_rate=$(echo \"scale=1; $PASSED_CHECKS * 100 / $TOTAL_CHECKS\" | bc)\n    log_info \"通过率: ${pass_rate}%\"\n    \n    log_info \"详细日志: $LOG_FILE\"\n    log_info \"HTML报告: $report_file\"\n    \n    # 根据结果返回适当的退出码\n    if [ \"$FAILED_CHECKS\" -eq 0 ]; then\n        if [ \"$WARNING_CHECKS\" -eq 0 ]; then\n            log_success \"所有检查通过，网站可以上线！\"\n            exit 0\n        else\n            log_warning \"存在警告项，建议修复后上线\"\n            exit 1\n        fi\n    else\n        log_error \"存在失败项，必须修复后才能上线\"\n        exit 2\n    fi\n}\n\n# 显示帮助信息\nshow_help() {\n    cat << EOF\n用法: $0 [WEBSITE_URL] [ENVIRONMENT] [PROJECT_DIR]\n\n参数:\n  WEBSITE_URL    要检查的网站URL (默认: https://led-b2b.com)\n  ENVIRONMENT    环境名称 (默认: production)\n  PROJECT_DIR    项目目录路径 (默认: /opt/led-b2b-website)\n\n示例:\n  $0                                                    # 使用默认参数\n  $0 https://staging.led-b2b.com staging              # 检查staging环境\n  $0 https://led-b2b.com production /opt/led-b2b      # 指定所有参数\n\n检查项目:\n  1. 环境配置检查\n  2. 代码质量检查\n  3. 测试覆盖率检查\n  4. 安全性检查\n  5. 性能检查\n  6. SEO检查\n  7. 多语言检查\n  8. 功能测试\n  9. 移动端适配检查\n  10. 监控和日志检查\n\n退出码:\n  0 - 所有检查通过\n  1 - 存在警告项\n  2 - 存在失败项\n\nEOF\n}\n\n# 脚本入口\nif [ \"$1\" = \"--help\" ] || [ \"$1\" = \"-h\" ]; then\n    show_help\n    exit 0\nfi\n\nmain"