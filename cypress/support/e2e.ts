// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// 全局配置
Cypress.on('uncaught:exception', (err, runnable) => {
  // 忽略某些不影响测试的错误
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false;
  }
  return true;
});

// 添加自定义命令类型声明
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * 自定义命令：等待页面加载完成
       */
      waitForPageLoad(): Chainable<void>;
      
      /**
       * 自定义命令：切换语言
       */
      switchLanguage(language: 'en' | 'zh'): Chainable<void>;
      
      /**
       * 自定义命令：填写询盘表单
       */
      fillInquiryForm(data: {
        name: string;
        email: string;
        company: string;
        message: string;
      }): Chainable<void>;
    }
  }
}