#!/bin/bash

# LED B2B网站部署脚本
set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
PROJECT_NAME="led-b2b-website"
DOCKER_REGISTRY="your-registry.com"
IMAGE_TAG=${1:-latest}
ENVIRONMENT=${2:-production}
BACKUP_RETENTION_DAYS=7

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

# 检查必要的工具
check_dependencies() {
    log_info "检查部署依赖..."
    
    local deps=("docker" "docker-compose" "curl" "jq")
    for dep in "${deps[@]}"; do
        if ! command -v $dep &> /dev/null; then
            log_error "$dep 未安装"
            exit 1
        fi
    done
    
    log_success "所有依赖检查通过"
}

# 加载环境变量
load_environment() {
    log_info "加载环境配置..."
    
    if [ -f ".env.${ENVIRONMENT}" ]; then
        export $(cat .env.${ENVIRONMENT} | grep -v '^#' | xargs)
        log_success "环境配置加载完成"
    else
        log_error "环境配置文件 .env.${ENVIRONMENT} 不存在"
        exit 1
    fi
}

# 健康检查
health_check() {
    local url=$1
    local max_attempts=30
    local attempt=1
    
    log_info "执行健康检查: $url"
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$url" > /dev/null; then
            log_success "健康检查通过"
            return 0
        fi
        
        log_info "健康检查失败，重试 $attempt/$max_attempts"
        sleep 10
        ((attempt++))
    done
    
    log_error "健康检查失败"
    return 1
}

# 数据库备份
backup_database() {
    log_info "创建数据库备份..."
    
    local backup_file="backup_$(date +%Y%m%d_%H%M%S).sql"
    local backup_path="./backups/$backup_file"
    
    mkdir -p ./backups
    
    docker-compose exec -T postgres pg_dump -U $POSTGRES_USER $POSTGRES_DB > $backup_path
    
    if [ $? -eq 0 ]; then
        log_success "数据库备份完成: $backup_path"
        
        # 压缩备份文件
        gzip $backup_path
        log_success "备份文件已压缩: ${backup_path}.gz"
        
        # 清理旧备份
        find ./backups -name "backup_*.sql.gz" -mtime +$BACKUP_RETENTION_DAYS -delete
        log_info "已清理 $BACKUP_RETENTION_DAYS 天前的备份文件"
    else
        log_error "数据库备份失败"
        exit 1
    fi
}

# 构建镜像
build_image() {
    log_info "构建Docker镜像..."
    
    # 构建应用镜像
    docker build -t ${PROJECT_NAME}:${IMAGE_TAG} .
    
    if [ $? -eq 0 ]; then
        log_success "镜像构建完成: ${PROJECT_NAME}:${IMAGE_TAG}"
    else
        log_error "镜像构建失败"
        exit 1
    fi
    
    # 如果配置了镜像仓库，推送镜像
    if [ ! -z "$DOCKER_REGISTRY" ]; then
        log_info "推送镜像到仓库..."
        
        docker tag ${PROJECT_NAME}:${IMAGE_TAG} ${DOCKER_REGISTRY}/${PROJECT_NAME}:${IMAGE_TAG}
        docker push ${DOCKER_REGISTRY}/${PROJECT_NAME}:${IMAGE_TAG}
        
        if [ $? -eq 0 ]; then
            log_success "镜像推送完成"
        else
            log_error "镜像推送失败"
            exit 1
        fi
    fi
}

# 部署应用
deploy_application() {
    log_info "部署应用..."
    
    # 停止旧容器（保持数据库运行）
    docker-compose stop app nginx
    
    # 拉取最新镜像（如果使用镜像仓库）
    if [ ! -z "$DOCKER_REGISTRY" ]; then
        docker-compose pull app
    fi
    
    # 启动服务
    docker-compose up -d
    
    if [ $? -eq 0 ]; then
        log_success "应用部署完成"
    else
        log_error "应用部署失败"
        exit 1
    fi
}

# 运行数据库迁移
run_migrations() {
    log_info "运行数据库迁移..."
    
    # 等待数据库就绪
    sleep 10
    
    # 运行迁移（这里需要根据实际的迁移工具调整）
    docker-compose exec app npm run db:migrate
    
    if [ $? -eq 0 ]; then
        log_success "数据库迁移完成"
    else
        log_warning "数据库迁移失败，请手动检查"
    fi
}

# 验证部署
verify_deployment() {
    log_info "验证部署..."
    
    # 检查容器状态
    local failed_services=$(docker-compose ps --services --filter "status=exited")
    if [ ! -z "$failed_services" ]; then
        log_error "以下服务启动失败: $failed_services"
        docker-compose logs $failed_services
        exit 1
    fi
    
    # 健康检查
    health_check "http://localhost/api/health"
    
    # 检查关键页面
    local pages=("/" "/products" "/about" "/contact")
    for page in "${pages[@]}"; do
        if curl -f -s "http://localhost$page" > /dev/null; then
            log_success "页面检查通过: $page"
        else
            log_warning "页面检查失败: $page"
        fi
    done
    
    log_success "部署验证完成"
}

# 发送通知
send_notification() {
    local status=$1
    local message=$2
    
    if [ ! -z "$SLACK_WEBHOOK_URL" ]; then
        local color="good"
        if [ "$status" = "error" ]; then
            color="danger"
        elif [ "$status" = "warning" ]; then
            color="warning"
        fi
        
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"attachments\":[{\"color\":\"$color\",\"text\":\"$message\"}]}" \
            $SLACK_WEBHOOK_URL
    fi
    
    if [ ! -z "$EMAIL_NOTIFICATION" ]; then
        echo "$message" | mail -s "LED B2B部署通知" $EMAIL_NOTIFICATION
    fi
}

# 回滚函数
rollback() {
    log_warning "开始回滚..."
    
    # 停止当前服务
    docker-compose stop app nginx
    
    # 恢复上一个版本的镜像
    if [ ! -z "$DOCKER_REGISTRY" ]; then
        docker pull ${DOCKER_REGISTRY}/${PROJECT_NAME}:previous
        docker tag ${DOCKER_REGISTRY}/${PROJECT_NAME}:previous ${PROJECT_NAME}:latest
    fi
    
    # 重启服务
    docker-compose up -d app nginx
    
    # 验证回滚
    if health_check "http://localhost/api/health"; then
        log_success "回滚完成"
        send_notification "warning" "LED B2B网站已回滚到上一个版本"
    else
        log_error "回滚失败"
        send_notification "error" "LED B2B网站回滚失败，需要手动干预"
        exit 1
    fi
}

# 主部署流程
main() {
    log_info "开始部署 LED B2B网站 - 环境: $ENVIRONMENT, 版本: $IMAGE_TAG"
    
    # 检查依赖
    check_dependencies
    
    # 加载环境变量
    load_environment
    
    # 创建数据库备份
    if [ "$ENVIRONMENT" = "production" ]; then
        backup_database
    fi
    
    # 构建镜像
    build_image
    
    # 部署应用
    deploy_application
    
    # 运行数据库迁移
    run_migrations
    
    # 验证部署
    if verify_deployment; then
        log_success "部署成功完成！"
        send_notification "good" "LED B2B网站部署成功 - 版本: $IMAGE_TAG"
    else
        log_error "部署验证失败"
        send_notification "error" "LED B2B网站部署失败 - 版本: $IMAGE_TAG"
        
        # 生产环境自动回滚
        if [ "$ENVIRONMENT" = "production" ]; then
            rollback
        fi
        exit 1
    fi
    
    # 清理旧镜像
    docker image prune -f
    
    log_success "部署流程完成！"
}

# 脚本入口
case "${3:-deploy}" in
    "deploy")
        main
        ;;
    "rollback")
        rollback
        ;;
    "health-check")
        health_check "http://localhost/api/health"
        ;;
    "backup")
        load_environment
        backup_database
        ;;
    *)
        echo "用法: $0 [IMAGE_TAG] [ENVIRONMENT] [ACTION]"
        echo "  IMAGE_TAG: 镜像标签 (默认: latest)"
        echo "  ENVIRONMENT: 环境 (默认: production)"
        echo "  ACTION: deploy|rollback|health-check|backup (默认: deploy)"
        exit 1
        ;;
esac