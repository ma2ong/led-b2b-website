#!/usr/bin/env node

/**
 * 部署验证脚本
 * 验证部署后的应用是否正常工作
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

// 配置
const config = {
  baseUrl: process.env.BASE_URL || 'https://led-displays.com',
  timeout: 10000,
  retries: 3,
  retryDelay: 5000,
};

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

/**
 * 发送HTTP请求
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'Deployment-Verification-Script/1.0',
        ...options.headers,
      },
      timeout: config.timeout,
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          responseTime: Date.now() - startTime,
        });
      });
    });

    const startTime = Date.now();
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

/**
 * 重试机制
 */
async function withRetry(fn, retries = config.retries) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) {
        throw error;
      }
      logWarning(`Attempt ${i + 1} failed, retrying in ${config.retryDelay}ms...`);
      await new Promise(resolve => setTimeout(resolve, config.retryDelay));
    }
  }
}

/**
 * 健康检查
 */
async function checkHealth() {
  logInfo('检查应用健康状态...');
  
  try {
    const response = await withRetry(() => makeRequest(`${config.baseUrl}/api/health`));
    
    if (response.statusCode === 200) {
      const healthData = JSON.parse(response.body);
      
      if (healthData.status === 'healthy') {
        logSuccess(`健康检查通过 (响应时间: ${response.responseTime}ms)`);
        logInfo(`版本: ${healthData.version}, 环境: ${healthData.environment}`);
        logInfo(`运行时间: ${Math.round(healthData.uptime)}秒`);
        
        // 检查各个组件状态
        Object.entries(healthData.checks).forEach(([component, status]) => {
          if (status === 'healthy') {
            logSuccess(`${component}: 健康`);
          } else {
            logError(`${component}: 不健康`);
          }
        });
        
        return true;
      } else {
        logError('应用状态不健康');
        return false;
      }
    } else {
      logError(`健康检查失败，状态码: ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    logError(`健康检查失败: ${error.message}`);
    return false;
  }
}

/**
 * 检查关键页面
 */
async function checkPages() {
  logInfo('检查关键页面...');
  
  const pages = [
    { path: '/', name: '首页' },
    { path: '/products', name: '产品页面' },
    { path: '/about', name: '关于我们' },
    { path: '/contact', name: '联系我们' },
    { path: '/solutions', name: '解决方案' },
    { path: '/case-studies', name: '案例研究' },
  ];
  
  let allPassed = true;
  
  for (const page of pages) {
    try {
      const response = await withRetry(() => makeRequest(`${config.baseUrl}${page.path}`));
      
      if (response.statusCode === 200) {
        // 检查页面内容
        const hasTitle = response.body.includes('<title>');
        const hasContent = response.body.length > 1000;
        
        if (hasTitle && hasContent) {
          logSuccess(`${page.name} 页面正常 (${response.responseTime}ms)`);
        } else {
          logWarning(`${page.name} 页面内容可能不完整`);
          allPassed = false;
        }
      } else {
        logError(`${page.name} 页面返回状态码: ${response.statusCode}`);
        allPassed = false;
      }
    } catch (error) {
      logError(`${page.name} 页面检查失败: ${error.message}`);
      allPassed = false;
    }
  }
  
  return allPassed;
}

/**
 * 检查API端点
 */
async function checkAPI() {
  logInfo('检查API端点...');
  
  const endpoints = [
    { path: '/api/products', name: '产品API' },
    { path: '/api/inquiries', name: '询盘API', method: 'GET' },
    { path: '/sitemap.xml', name: '站点地图' },
    { path: '/robots.txt', name: '机器人文件' },
  ];
  
  let allPassed = true;
  
  for (const endpoint of endpoints) {
    try {
      const response = await withRetry(() => makeRequest(`${config.baseUrl}${endpoint.path}`, {
        method: endpoint.method || 'GET'
      }));
      
      if (response.statusCode === 200 || response.statusCode === 405) {
        logSuccess(`${endpoint.name} 端点正常`);
      } else {
        logError(`${endpoint.name} 端点返回状态码: ${response.statusCode}`);
        allPassed = false;
      }
    } catch (error) {
      logError(`${endpoint.name} 端点检查失败: ${error.message}`);
      allPassed = false;
    }
  }
  
  return allPassed;
}

/**
 * 检查安全头
 */
async function checkSecurityHeaders() {
  logInfo('检查安全头...');
  
  try {
    const response = await withRetry(() => makeRequest(config.baseUrl));
    
    const requiredHeaders = [
      'strict-transport-security',
      'x-frame-options',
      'x-content-type-options',
      'x-xss-protection',
      'referrer-policy',
    ];
    
    let allPresent = true;
    
    requiredHeaders.forEach(header => {
      if (response.headers[header]) {
        logSuccess(`安全头 ${header} 存在`);
      } else {
        logWarning(`安全头 ${header} 缺失`);
        allPresent = false;
      }
    });
    
    return allPresent;
  } catch (error) {
    logError(`安全头检查失败: ${error.message}`);
    return false;
  }
}

/**
 * 检查SSL证书
 */
async function checkSSL() {
  logInfo('检查SSL证书...');
  
  if (!config.baseUrl.startsWith('https://')) {
    logWarning('跳过SSL检查（非HTTPS）');
    return true;
  }
  
  try {
    const urlObj = new URL(config.baseUrl);
    
    return new Promise((resolve) => {
      const req = https.request({
        hostname: urlObj.hostname,
        port: 443,
        path: '/',
        method: 'GET',
      }, (res) => {
        const cert = res.connection.getPeerCertificate();
        
        if (cert && cert.valid_to) {
          const expiryDate = new Date(cert.valid_to);
          const now = new Date();
          const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
          
          if (daysUntilExpiry > 30) {
            logSuccess(`SSL证书有效，${daysUntilExpiry}天后过期`);
            resolve(true);
          } else if (daysUntilExpiry > 0) {
            logWarning(`SSL证书即将过期，${daysUntilExpiry}天后过期`);
            resolve(true);
          } else {
            logError('SSL证书已过期');
            resolve(false);
          }
        } else {
          logError('无法获取SSL证书信息');
          resolve(false);
        }
      });
      
      req.on('error', (error) => {
        logError(`SSL检查失败: ${error.message}`);
        resolve(false);
      });
      
      req.end();
    });
  } catch (error) {
    logError(`SSL检查失败: ${error.message}`);
    return false;
  }
}

/**
 * 性能测试
 */
async function performanceTest() {
  logInfo('执行性能测试...');
  
  const testPages = [
    { path: '/', name: '首页' },
    { path: '/products', name: '产品页面' },
  ];
  
  let allPassed = true;
  
  for (const page of testPages) {
    try {
      const response = await withRetry(() => makeRequest(`${config.baseUrl}${page.path}`));
      
      if (response.responseTime < 3000) {
        logSuccess(`${page.name} 响应时间: ${response.responseTime}ms`);
      } else if (response.responseTime < 5000) {
        logWarning(`${page.name} 响应时间较慢: ${response.responseTime}ms`);
      } else {
        logError(`${page.name} 响应时间过慢: ${response.responseTime}ms`);
        allPassed = false;
      }
    } catch (error) {
      logError(`${page.name} 性能测试失败: ${error.message}`);
      allPassed = false;
    }
  }
  
  return allPassed;
}

/**
 * 主验证流程
 */
async function main() {
  log('\n🚀 开始部署验证...\n', colors.blue);
  
  const tests = [
    { name: '健康检查', fn: checkHealth },
    { name: '关键页面检查', fn: checkPages },
    { name: 'API端点检查', fn: checkAPI },
    { name: '安全头检查', fn: checkSecurityHeaders },
    { name: 'SSL证书检查', fn: checkSSL },
    { name: '性能测试', fn: performanceTest },
  ];
  
  const results = [];
  
  for (const test of tests) {
    log(`\n--- ${test.name} ---`, colors.yellow);
    try {
      const result = await test.fn();
      results.push({ name: test.name, passed: result });
    } catch (error) {
      logError(`${test.name} 执行失败: ${error.message}`);
      results.push({ name: test.name, passed: false });
    }
  }
  
  // 输出总结
  log('\n📊 验证结果总结:', colors.blue);
  let allPassed = true;
  
  results.forEach(result => {
    if (result.passed) {
      logSuccess(result.name);
    } else {
      logError(result.name);
      allPassed = false;
    }
  });
  
  if (allPassed) {
    log('\n🎉 所有验证测试通过！部署成功！', colors.green);
    process.exit(0);
  } else {
    log('\n💥 部分验证测试失败！请检查问题。', colors.red);
    process.exit(1);
  }
}

// 运行验证
if (require.main === module) {
  main().catch(error => {
    logError(`验证脚本执行失败: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  checkHealth,
  checkPages,
  checkAPI,
  checkSecurityHeaders,
  checkSSL,
  performanceTest,
};