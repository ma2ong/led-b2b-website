# 🚀 Vercel部署教程（超详细版）

## 📋 准备工作（5分钟）

### 需要准备的账号
1. **GitHub账号** - 用来存放代码
2. **Vercel账号** - 用来部署网站
3. **邮箱** - 用来接收询盘（QQ邮箱、163邮箱都可以）

## 第一步：注册GitHub账号

### 1.1 访问GitHub
- 打开浏览器，访问：https://github.com
- 点击右上角"Sign up"按钮

### 1.2 填写注册信息
- **用户名**：建议用公司英文名，如 `ledtech2024`
- **邮箱**：填写您的常用邮箱
- **密码**：设置一个安全的密码

### 1.3 验证邮箱
- 查收邮件，点击验证链接
- 完成账号验证

## 第二步：上传项目到GitHub

### 2.1 创建新仓库
1. 登录GitHub后，点击右上角"+"号
2. 选择"New repository"
3. 填写仓库信息：
   - **Repository name**: `led-b2b-website`
   - **Description**: `LED显示屏B2B网站`
   - 选择"Public"（公开）
   - 勾选"Add a README file"
4. 点击"Create repository"

### 2.2 上传项目文件
1. 在新创建的仓库页面，点击"uploading an existing file"
2. 把项目文件夹里的所有文件拖拽到页面上
3. 等待文件上传完成
4. 在底部填写提交信息：
   - **Commit title**: `初始化LED B2B网站项目`
   - **Description**: `上传完整的网站源代码`
5. 点击"Commit changes"

## 第三步：注册Vercel账号

### 3.1 访问Vercel
- 打开浏览器，访问：https://vercel.com
- 点击"Sign Up"按钮

### 3.2 使用GitHub登录
- 选择"Continue with GitHub"
- 授权Vercel访问您的GitHub账号
- 完成注册

## 第四步：部署网站

### 4.1 创建新项目
1. 在Vercel控制台，点击"New Project"
2. 找到刚才创建的`led-b2b-website`仓库
3. 点击"Import"

### 4.2 配置项目设置
1. **Project Name**: 保持默认或修改为`led-b2b-website`
2. **Framework Preset**: 选择"Next.js"
3. **Root Directory**: 保持默认"/"
4. 点击"Deploy"

### 4.3 等待部署完成
- 部署过程大约需要3-5分钟
- 您会看到部署进度条
- 完成后会显示"Congratulations!"

## 第五步：配置环境变量

### 5.1 进入项目设置
1. 在项目页面，点击"Settings"标签
2. 在左侧菜单选择"Environment Variables"

### 5.2 添加必要的环境变量
点击"Add"按钮，逐个添加以下变量：

#### 基本配置
```
Name: NEXTAUTH_SECRET
Value: your-random-secret-key-here-make-it-long-and-random
```

```
Name: NEXTAUTH_URL
Value: https://your-project-name.vercel.app
```

#### 公司信息
```
Name: COMPANY_NAME
Value: 您的公司名称
```

```
Name: COMPANY_PHONE
Value: +86-138-0000-0000
```

```
Name: COMPANY_EMAIL
Value: info@yourcompany.com
```

#### 邮件配置（重要！）
```
Name: SMTP_HOST
Value: smtp.qq.com
```

```
Name: SMTP_PORT
Value: 587
```

```
Name: SMTP_USER
Value: your-email@qq.com
```

```
Name: SMTP_PASS
Value: 您的QQ邮箱授权码
```

```
Name: INQUIRY_EMAIL
Value: sales@yourcompany.com
```

### 5.3 重新部署
1. 添加完环境变量后，点击"Deployments"标签
2. 点击最新部署右侧的"..."按钮
3. 选择"Redeploy"
4. 等待重新部署完成

## 第六步：获取QQ邮箱授权码

### 6.1 登录QQ邮箱
- 访问：https://mail.qq.com
- 登录您的QQ邮箱

### 6.2 开启SMTP服务
1. 点击"设置" → "账户"
2. 找到"POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务"
3. 开启"IMAP/SMTP服务"
4. 按照提示发送短信验证
5. 获得授权码（16位字符）

### 6.3 更新环境变量
1. 回到Vercel项目设置
2. 找到`SMTP_PASS`环境变量
3. 点击"Edit"，填入刚获得的授权码
4. 保存并重新部署

## 第七步：自定义域名（可选）

### 7.1 如果您有域名
1. 在Vercel项目设置中，点击"Domains"
2. 点击"Add"按钮
3. 输入您的域名，如：`www.yourcompany.com`
4. 按照提示修改域名的DNS设置

### 7.2 如果您没有域名
- 可以先使用Vercel提供的免费域名
- 格式：`your-project-name.vercel.app`
- 以后可以随时绑定自己的域名

## 第八步：测试网站功能

### 8.1 访问网站
1. 打开您的网站地址
2. 检查页面是否正常显示
3. 测试中英文切换功能

### 8.2 测试询盘功能
1. 找到联系表单
2. 填写测试信息提交
3. 检查您的邮箱是否收到询盘

### 8.3 测试移动端
1. 用手机打开网站
2. 检查显示是否正常
3. 测试各项功能

## 🎯 完成检查清单

部署完成后，请检查以下项目：

- [ ] 网站能正常打开
- [ ] 显示您的公司信息
- [ ] 中英文切换正常
- [ ] 手机端显示正常
- [ ] 询盘表单能正常提交
- [ ] 能收到询盘邮件
- [ ] 联系方式显示正确

## 🔧 常见问题解决

### 问题1：部署失败
**错误信息**: "Build failed"
**解决方法**:
1. 检查代码是否完整上传
2. 确认选择了正确的框架（Next.js）
3. 查看部署日志找到具体错误

### 问题2：网站显示错误
**错误信息**: "Application error"
**解决方法**:
1. 检查环境变量是否正确设置
2. 确认`NEXTAUTH_SECRET`已设置
3. 重新部署项目

### 问题3：收不到邮件
**可能原因**: 邮箱配置错误
**解决方法**:
1. 确认QQ邮箱授权码正确
2. 检查垃圾邮件箱
3. 尝试用其他邮箱测试

### 问题4：域名无法访问
**可能原因**: DNS设置错误
**解决方法**:
1. 检查域名DNS设置
2. 等待DNS生效（最多24小时）
3. 联系域名服务商

## 📱 后续维护

### 更新网站内容
1. 在GitHub仓库中修改文件
2. 提交更改
3. Vercel会自动重新部署

### 查看访问统计
1. 在Vercel项目页面查看"Analytics"
2. 了解网站访问情况

### 监控网站状态
1. Vercel会自动监控网站状态
2. 出现问题会发送邮件通知

## 🎉 恭喜！部署成功

当您完成以上步骤后，您的LED B2B网站就成功上线了！

### 您现在拥有：
- ✅ 一个专业的B2B网站
- ✅ 自动的HTTPS安全证书
- ✅ 全球CDN加速
- ✅ 自动备份和版本控制
- ✅ 免费的托管服务

### 下一步建议：
1. **完善内容**: 添加更多产品和案例
2. **SEO优化**: 提交到搜索引擎
3. **推广营销**: 分享到社交媒体
4. **数据分析**: 安装Google Analytics

**您的网站地址**: `https://your-project-name.vercel.app`

## 📞 需要帮助？

如果在部署过程中遇到问题：

1. **查看官方文档**: https://vercel.com/docs
2. **搜索解决方案**: 在百度或Google搜索错误信息
3. **寻求帮助**: 在技术论坛提问
4. **付费支持**: 找技术人员协助（100-300元）

**祝您部署成功！** 🎊