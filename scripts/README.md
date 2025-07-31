# LED B2B网站部署和监控脚本

本目录包含LED B2B网站的部署、监控和维护脚本。这些脚本主要用于Linux/Unix环境。

## 脚本列表

### 1. 数据备份和恢复
- **backup-database.sh** - 数据库备份脚本
- **restore-database.sh** - 数据库恢复脚本
- **setup-backup-cron.sh** - 自动备份定时任务设置

### 2. 网站监控
- **website-monitor.sh** - 网站监控脚本
- **ssl-manager.sh** - SSL证书管理脚本

### 3. 上线验证
- **pre-launch-checklist.sh** - 上线前检查清单
- **final-launch-verification.sh** - 最终上线验证

### 4. 部署相关
- **deploy.sh** - 自动化部署脚本
- **verify-deployment.js** - 部署验证脚本

## 使用说明

### 在Linux/Unix环境下使用

1. **添加执行权限**
   ```bash
   chmod +x scripts/*.sh
   ```

2. **数据库备份**
   ```bash
   # 全量备份
   ./scripts/backup-database.sh full production
   
   # 增量备份
   ./scripts/backup-database.sh incremental production
   
   # 仅备份结构
   ./scripts/backup-database.sh schema production
   ```

3. **数据库恢复**
   ```bash
   # 从本地文件恢复
   ./scripts/restore-database.sh ./backups/backup.sql staging full true
   
   # 从S3恢复
   ./scripts/restore-database.sh s3://bucket/backup.sql.gpg production full true
   ```

4. **设置自动备份**
   ```bash
   sudo ./scripts/setup-backup-cron.sh production /opt/led-b2b-website backup
   ```

5. **网站监控**
   ```bash
   # 单次检查
   ./scripts/website-monitor.sh https://led-b2b.com production
   
   # 持续监控
   ./scripts/website-monitor.sh -c https://led-b2b.com production
   
   # 生成报告
   ./scripts/website-monitor.sh -r https://led-b2b.com production
   ```

6. **SSL证书管理**
   ```bash
   # 安装SSL证书
   sudo ./scripts/ssl-manager.sh install led-b2b.com admin@led-b2b.com
   
   # 检查证书状态
   ./scripts/ssl-manager.sh check led-b2b.com
   
   # 续期证书
   sudo ./scripts/ssl-manager.sh renew led-b2b.com
   
   # 设置自动续期
   sudo ./scripts/ssl-manager.sh auto-renewal
   ```

7. **上线前检查**
   ```bash
   ./scripts/pre-launch-checklist.sh https://led-b2b.com production /opt/led-b2b-website
   ```

8. **最终上线验证**
   ```bash
   ./scripts/final-launch-verification.sh https://led-b2b.com production /opt/led-b2b-website
   ```

## 环境变量配置

在使用脚本前，请确保设置以下环境变量：

### 数据库配置
```bash
export POSTGRES_USER=your_db_user
export POSTGRES_PASSWORD=your_db_password
export POSTGRES_DB=your_db_name
export DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

### 备份配置
```bash
export BACKUP_S3_BUCKET=your-backup-bucket
export BACKUP_ENCRYPTION_KEY=your-encryption-key
export BACKUP_RETENTION_DAYS=30
```

### 通知配置
```bash
export SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
export ALERT_EMAIL=admin@led-b2b.com
```

### AWS配置（用于S3备份）
```bash
export AWS_ACCESS_KEY_ID=your-access-key
export AWS_SECRET_ACCESS_KEY=your-secret-key
export AWS_DEFAULT_REGION=us-east-1
```

## 定时任务示例

### 自动备份
```bash
# 每日凌晨2点全量备份
0 2 * * * /opt/led-b2b-website/scripts/backup-database.sh full production

# 每6小时增量备份
0 6,12,18 * * * /opt/led-b2b-website/scripts/backup-database.sh incremental production

# 每周日凌晨1点结构备份
0 1 * * 0 /opt/led-b2b-website/scripts/backup-database.sh schema production
```

### 网站监控
```bash
# 每5分钟检查网站状态
*/5 * * * * /opt/led-b2b-website/scripts/website-monitor.sh https://led-b2b.com production

# 每小时生成监控报告
0 * * * * /opt/led-b2b-website/scripts/website-monitor.sh -r https://led-b2b.com production
```

### SSL证书监控
```bash
# 每日检查SSL证书状态
0 3 * * * /opt/led-b2b-website/scripts/ssl-manager.sh check led-b2b.com

# 每月1号尝试续期证书
0 2 1 * * /opt/led-b2b-website/scripts/ssl-manager.sh renew led-b2b.com
```

## 日志文件位置

- 备份日志: `/var/log/led-b2b-backup/`
- 监控日志: `/var/log/led-b2b-monitor/`
- SSL管理日志: `/var/log/ssl-manager.log`
- 部署日志: `/var/log/led-b2b-deploy/`

## 故障排除

### 常见问题

1. **权限问题**
   ```bash
   # 确保脚本有执行权限
   chmod +x scripts/*.sh
   
   # 确保用户有必要的权限
   sudo usermod -aG docker $USER
   ```

2. **Docker连接问题**
   ```bash
   # 检查Docker服务状态
   sudo systemctl status docker
   
   # 启动Docker服务
   sudo systemctl start docker
   ```

3. **数据库连接问题**
   ```bash
   # 检查数据库容器状态
   docker ps | grep postgres
   
   # 检查数据库连接
   docker-compose exec postgres pg_isready -U $POSTGRES_USER
   ```

4. **备份失败**
   ```bash
   # 检查磁盘空间
   df -h
   
   # 检查备份目录权限
   ls -la ./backups/
   
   # 查看详细错误日志
   tail -f /var/log/led-b2b-backup/backup_*.log
   ```

5. **SSL证书问题**
   ```bash
   # 检查域名DNS解析
   nslookup led-b2b.com
   
   # 检查80端口是否开放
   netstat -tlnp | grep :80
   
   # 查看Certbot日志
   tail -f /var/log/letsencrypt/letsencrypt.log
   ```

## 安全注意事项

1. **敏感信息保护**
   - 不要在脚本中硬编码密码和密钥
   - 使用环境变量或配置文件存储敏感信息
   - 确保配置文件权限设置正确（600或640）

2. **备份安全**
   - 启用备份文件加密
   - 定期测试备份恢复流程
   - 将备份存储在不同的物理位置

3. **访问控制**
   - 限制脚本执行权限
   - 使用专用的备份用户账户
   - 定期审查用户权限

4. **网络安全**
   - 使用HTTPS进行所有外部通信
   - 配置防火墙规则
   - 定期更新SSL证书

## 联系支持

如果在使用脚本过程中遇到问题，请：

1. 检查相关日志文件
2. 确认环境变量配置正确
3. 验证网络连接和权限设置
4. 联系系统管理员或开发团队

---

**注意**: 这些脚本主要设计用于Linux/Unix环境。在Windows环境下，建议使用WSL（Windows Subsystem for Linux）或Docker容器来运行这些脚本。