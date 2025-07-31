#!/usr/bin/env node

/**
 * 快速部署脚本 - 最简化版本
 * 只需要提供GitHub用户名和基本信息即可
 */

const readline = require('readline');
const { execSync } = require('child_process');
const fs = require('fs');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function quickDeploy() {
  console.log('🚀 LED B2B网站快速部署');
  console.log('只需要几个简单步骤即可完成部署！\n');
  
  // 收集最基本的信息
  const githubUsername = await question('1. 您的GitHub用户名: ');
  const companyName = await question('2. 公司名称: ');
  const companyEmail = await question('3. 公司邮箱: ');
  const companyPhone = await question('4. 公司电话: ');
  
  console.log('\n📝 生成配置文件...');
  
  // 创建基础环境变量文件
  const envContent = `# LED B2B网站基础配置
NEXTAUTH_URL=https://led-b2b-website.vercel.app
NEXTAUTH_SECRET=${require('crypto').randomBytes(32).toString('hex')}

# 公司信息
COMPANY_NAME=${companyName}
COMPANY_PHONE=${companyPhone}
COMPANY_EMAIL=${companyEmail}

# 邮件配置 (请稍后在Vercel中完善)
SMTP_HOST=smtp.qq.com
SMTP_PORT=587
SMTP_USER=${companyEmail}
SMTP_PASS=请在Vercel中设置
INQUIRY_EMAIL=${companyEmail}
`;
  
  fs.writeFileSync('.env.local', envContent);
  
  console.log('✅ 配置文件已生成');
  console.log('\n📦 准备代码...');
  
  try {
    // Git操作
    try {
      execSync('git init', { stdio: 'ignore' });
    } catch {}
    
    execSync('git add .');
    
    try {
      execSync('git commit -m "LED B2B website ready for deployment"');
    } catch {}
    
    console.log('✅ 代码已准备完成');
    
  } catch (error) {
    console.log('⚠️ Git操作遇到问题，但可以继续');
  }
  
  console.log('\n🎯 接下来请按照以下步骤完成部署:');
  console.log('\n=== 第一步: 创建GitHub仓库 ===');
  console.log('1. 访问: https://github.com/new');
  console.log('2. Repository name: led-b2b-website');
  console.log('3. 选择 "Public"');
  console.log('4. 点击 "Create repository"');
  console.log('5. 在新页面中，找到 "…or push an existing repository from the command line"');
  console.log('6. 复制并运行以下命令:');
  console.log(`
git remote add origin https://github.com/${githubUsername}/led-b2b-website.git
git branch -M main
git push -u origin main
`);
  
  console.log('\n=== 第二步: 部署到Vercel ===');
  console.log('1. 访问: https://vercel.com');
  console.log('2. 用GitHub账号登录');
  console.log('3. 点击 "New Project"');
  console.log('4. 选择 "led-b2b-website" 仓库');
  console.log('5. 点击 "Import"');
  console.log('6. Framework Preset 选择 "Next.js"');
  console.log('7. 点击 "Deploy"');
  console.log('8. 等待部署完成 (约3-5分钟)');
  
  console.log('\n=== 第三步: 配置环境变量 ===');
  console.log('1. 在Vercel项目页面，点击 "Settings"');
  console.log('2. 选择 "Environment Variables"');
  console.log('3. 添加以下环境变量:');
  
  const envVars = [
    'NEXTAUTH_SECRET=随机32位字符串',
    `COMPANY_NAME=${companyName}`,
    `COMPANY_PHONE=${companyPhone}`,
    `COMPANY_EMAIL=${companyEmail}`,
    'SMTP_HOST=smtp.qq.com',
    'SMTP_PORT=587',
    'SMTP_USER=您的QQ邮箱',
    'SMTP_PASS=QQ邮箱授权码',
    `INQUIRY_EMAIL=${companyEmail}`
  ];
  
  envVars.forEach(env => {
    console.log(`   ${env}`);
  });
  
  console.log('\n4. 设置完成后，点击 "Deployments" → "Redeploy"');
  
  console.log('\n=== 完成！===');
  console.log('🎉 您的网站将在几分钟内上线！');
  console.log(`📱 网站地址: https://led-b2b-website.vercel.app`);
  console.log('📧 记得测试询盘功能是否正常');
  
  // 生成快速参考文件
  const quickRef = `# 快速部署参考

## 您的信息
- GitHub用户名: ${githubUsername}
- 公司名称: ${companyName}
- 联系邮箱: ${companyEmail}
- 联系电话: ${companyPhone}

## 网站地址
https://led-b2b-website.vercel.app

## 管理地址
- GitHub: https://github.com/${githubUsername}/led-b2b-website
- Vercel: https://vercel.com/dashboard

## 重要提醒
1. 请在Vercel中完善邮件配置
2. 获取QQ邮箱授权码并设置SMTP_PASS
3. 测试询盘功能是否正常
4. 可以随时修改GitHub中的代码，Vercel会自动更新

## 需要帮助？
如果遇到问题，请检查:
1. GitHub仓库是否创建成功
2. Vercel是否正确连接到GitHub
3. 环境变量是否设置正确
4. 邮箱配置是否正确
`;
  
  fs.writeFileSync('部署参考.md', quickRef);
  console.log('\n📋 部署参考文件已生成: 部署参考.md');
  
  rl.close();
}

quickDeploy().catch(console.error);