#!/usr/bin/env node

/**
 * LED B2B网站自动部署助手
 * 这个脚本会引导您完成整个部署过程
 */

const readline = require('readline');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 创建交互式界面
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 颜色输出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bright: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(`${colors.blue}${prompt}${colors.reset}`, resolve);
  });
}

// 检查必要的工具
function checkRequirements() {
  log('\n🔍 检查系统环境...', 'blue');
  
  const requirements = [
    { cmd: 'node --version', name: 'Node.js' },
    { cmd: 'npm --version', name: 'npm' },
    { cmd: 'git --version', name: 'Git' }
  ];
  
  for (const req of requirements) {
    try {
      const version = execSync(req.cmd, { encoding: 'utf8' }).trim();
      log(`✅ ${req.name}: ${version}`, 'green');
    } catch (error) {
      log(`❌ ${req.name} 未安装`, 'red');
      log(`请先安装 ${req.name}`, 'yellow');
      process.exit(1);
    }
  }
}

// 收集用户信息
async function collectUserInfo() {
  log('\n📋 请提供以下信息:', 'bright');
  
  const info = {};
  
  info.githubUsername = await question('GitHub用户名: ');
  info.githubToken = await question('GitHub Personal Access Token (可选，用于私有仓库): ');
  info.projectName = await question('项目名称 (默认: led-b2b-website): ') || 'led-b2b-website';
  
  log('\n🏢 公司信息:', 'bright');
  info.companyName = await question('公司名称: ');
  info.companyNameEn = await question('公司英文名称: ');
  info.companyPhone = await question('公司电话: ');
  info.companyEmail = await question('公司邮箱: ');
  info.companyAddress = await question('公司地址: ');
  
  log('\n📧 邮件配置 (用于接收询盘):', 'bright');
  info.smtpHost = await question('SMTP服务器 (如: smtp.qq.com): ');
  info.smtpPort = await question('SMTP端口 (默认: 587): ') || '587';
  info.smtpUser = await question('邮箱账号: ');
  info.smtpPass = await question('邮箱密码/授权码: ');
  info.inquiryEmail = await question('接收询盘的邮箱: ');
  
  return info;
}

// 创建环境变量文件
function createEnvFile(info) {
  log('\n📝 创建环境变量文件...', 'blue');
  
  const envContent = `# LED B2B网站环境变量
NEXTAUTH_URL=https://${info.projectName}.vercel.app
NEXTAUTH_SECRET=${generateRandomSecret()}

# 公司信息
COMPANY_NAME=${info.companyName}
COMPANY_NAME_EN=${info.companyNameEn}
COMPANY_PHONE=${info.companyPhone}
COMPANY_EMAIL=${info.companyEmail}
COMPANY_ADDRESS=${info.companyAddress}

# 邮件配置
SMTP_HOST=${info.smtpHost}
SMTP_PORT=${info.smtpPort}
SMTP_USER=${info.smtpUser}
SMTP_PASS=${info.smtpPass}
INQUIRY_EMAIL=${info.inquiryEmail}

# 联系方式
WECHAT_ID=your-wechat-id
WHATSAPP_NUMBER=${info.companyPhone}
QQ_NUMBER=123456789
`;
  
  fs.writeFileSync('.env.local', envContent);
  log('✅ 环境变量文件已创建', 'green');
}

// 生成随机密钥
function generateRandomSecret() {
  return require('crypto').randomBytes(32).toString('hex');
}

// 初始化Git仓库
async function initGitRepo(info) {
  log('\n📦 初始化Git仓库...', 'blue');
  
  try {
    // 检查是否已经是Git仓库
    try {
      execSync('git status', { stdio: 'ignore' });
      log('✅ Git仓库已存在', 'green');
    } catch {
      execSync('git init');
      log('✅ Git仓库初始化完成', 'green');
    }
    
    // 添加所有文件
    execSync('git add .');
    
    // 提交
    try {
      execSync('git commit -m "Initial commit: LED B2B website"');
      log('✅ 代码已提交', 'green');
    } catch {
      log('ℹ️ 没有新的更改需要提交', 'yellow');
    }
    
  } catch (error) {
    log(`❌ Git操作失败: ${error.message}`, 'red');
    throw error;
  }
}

// 创建GitHub仓库
async function createGitHubRepo(info) {
  log('\n🐙 创建GitHub仓库...', 'blue');
  
  const repoUrl = `https://github.com/${info.githubUsername}/${info.projectName}`;
  
  log('请手动完成以下步骤:', 'yellow');
  log(`1. 访问: https://github.com/new`, 'yellow');
  log(`2. Repository name: ${info.projectName}`, 'yellow');
  log(`3. 选择 Public`, 'yellow');
  log(`4. 点击 "Create repository"`, 'yellow');
  log(`5. 完成后按回车继续...`, 'yellow');
  
  await question('');
  
  try {
    // 添加远程仓库
    try {
      execSync(`git remote add origin ${repoUrl}.git`);
    } catch {
      execSync(`git remote set-url origin ${repoUrl}.git`);
    }
    
    // 推送代码
    execSync('git branch -M main');
    execSync('git push -u origin main');
    
    log('✅ 代码已推送到GitHub', 'green');
    return repoUrl;
  } catch (error) {
    log(`❌ GitHub推送失败: ${error.message}`, 'red');
    log('请检查GitHub仓库是否创建成功，以及网络连接', 'yellow');
    throw error;
  }
}

// Vercel部署指导
async function deployToVercel(info, repoUrl) {
  log('\n🚀 部署到Vercel...', 'blue');
  
  log('请按照以下步骤部署到Vercel:', 'yellow');
  log('1. 访问: https://vercel.com', 'yellow');
  log('2. 使用GitHub账号登录', 'yellow');
  log('3. 点击 "New Project"', 'yellow');
  log(`4. 选择 "${info.projectName}" 仓库`, 'yellow');
  log('5. 点击 "Import"', 'yellow');
  log('6. Framework Preset 选择 "Next.js"', 'yellow');
  log('7. 点击 "Deploy"', 'yellow');
  log('8. 等待部署完成...', 'yellow');
  
  await question('部署完成后按回车继续...');
  
  const vercelUrl = await question('请输入Vercel分配的网站地址 (如: https://led-b2b-website.vercel.app): ');
  
  log('\n⚙️ 现在需要设置环境变量:', 'blue');
  log('1. 在Vercel项目页面，点击 "Settings"', 'yellow');
  log('2. 选择 "Environment Variables"', 'yellow');
  log('3. 添加以下环境变量:', 'yellow');
  
  // 显示需要添加的环境变量
  const envVars = [
    { name: 'NEXTAUTH_URL', value: vercelUrl },
    { name: 'NEXTAUTH_SECRET', value: generateRandomSecret() },
    { name: 'COMPANY_NAME', value: info.companyName },
    { name: 'COMPANY_NAME_EN', value: info.companyNameEn },
    { name: 'COMPANY_PHONE', value: info.companyPhone },
    { name: 'COMPANY_EMAIL', value: info.companyEmail },
    { name: 'COMPANY_ADDRESS', value: info.companyAddress },
    { name: 'SMTP_HOST', value: info.smtpHost },
    { name: 'SMTP_PORT', value: info.smtpPort },
    { name: 'SMTP_USER', value: info.smtpUser },
    { name: 'SMTP_PASS', value: info.smtpPass },
    { name: 'INQUIRY_EMAIL', value: info.inquiryEmail }
  ];
  
  console.log('\n环境变量列表:');
  envVars.forEach(env => {
    console.log(`${colors.green}${env.name}${colors.reset} = ${env.value}`);
  });
  
  await question('\n环境变量设置完成后按回车继续...');
  
  log('4. 点击 "Deployments" 标签', 'yellow');
  log('5. 点击最新部署的 "..." 按钮', 'yellow');
  log('6. 选择 "Redeploy"', 'yellow');
  log('7. 等待重新部署完成', 'yellow');
  
  return vercelUrl;
}

// 测试网站功能
async function testWebsite(websiteUrl) {
  log('\n🧪 测试网站功能...', 'blue');
  
  log(`请访问您的网站: ${websiteUrl}`, 'green');
  log('请检查以下功能:', 'yellow');
  log('✓ 网站能正常打开', 'yellow');
  log('✓ 中英文切换正常', 'yellow');
  log('✓ 手机端显示正常', 'yellow');
  log('✓ 询盘表单能正常提交', 'yellow');
  log('✓ 能收到询盘邮件', 'yellow');
  
  const testResult = await question('所有功能都正常吗? (y/n): ');
  
  if (testResult.toLowerCase() === 'y') {
    log('🎉 恭喜！网站部署成功！', 'green');
    return true;
  } else {
    log('❌ 发现问题，请检查配置', 'red');
    return false;
  }
}

// 生成部署报告
function generateReport(info, websiteUrl) {
  const report = `# LED B2B网站部署报告

## 部署信息
- **网站地址**: ${websiteUrl}
- **GitHub仓库**: https://github.com/${info.githubUsername}/${info.projectName}
- **部署时间**: ${new Date().toLocaleString()}

## 公司信息
- **公司名称**: ${info.companyName}
- **联系电话**: ${info.companyPhone}
- **联系邮箱**: ${info.companyEmail}

## 功能特性
- ✅ 多语言支持 (中英双语)
- ✅ 响应式设计 (手机端适配)
- ✅ 询盘系统 (自动邮件通知)
- ✅ 产品展示系统
- ✅ 案例展示系统
- ✅ SEO优化
- ✅ 安全防护

## 管理和维护
- **更新内容**: 修改GitHub仓库中的文件，Vercel会自动重新部署
- **查看统计**: 登录Vercel查看访问统计
- **技术支持**: 遇到问题可以查看部署日志

## 下一步建议
1. 完善产品信息和图片
2. 添加更多成功案例
3. 设置Google Analytics
4. 提交网站到搜索引擎
5. 开始推广营销

---
部署助手生成于 ${new Date().toLocaleString()}
`;
  
  fs.writeFileSync('部署报告.md', report);
  log('📊 部署报告已生成: 部署报告.md', 'green');
}

// 主函数
async function main() {
  try {
    log('🚀 LED B2B网站自动部署助手', 'bright');
    log('这个工具将帮助您快速部署网站到Vercel', 'blue');
    
    // 检查环境
    checkRequirements();
    
    // 收集信息
    const userInfo = await collectUserInfo();
    
    // 创建配置文件
    createEnvFile(userInfo);
    
    // Git操作
    await initGitRepo(userInfo);
    
    // GitHub操作
    const repoUrl = await createGitHubRepo(userInfo);
    
    // Vercel部署
    const websiteUrl = await deployToVercel(userInfo, repoUrl);
    
    // 测试功能
    const success = await testWebsite(websiteUrl);
    
    if (success) {
      // 生成报告
      generateReport(userInfo, websiteUrl);
      
      log('\n🎉 部署完成！', 'green');
      log(`您的网站地址: ${websiteUrl}`, 'bright');
      log('感谢使用LED B2B网站部署助手！', 'blue');
    }
    
  } catch (error) {
    log(`\n❌ 部署过程中出现错误: ${error.message}`, 'red');
    log('请检查错误信息并重试', 'yellow');
  } finally {
    rl.close();
  }
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = { main };