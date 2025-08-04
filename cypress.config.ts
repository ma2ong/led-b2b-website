import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    supportFile: false, // 禁用支持文件以避免错误
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: false,
    defaultCommandTimeout: 10000,
    
    // 环境变量
    env: {
      apiUrl: 'http://localhost:3000/api'
    },
    
    // 浏览器配置
    chromeWebSecurity: false,
    
    // 测试隔离
    testIsolation: true,
  },
  
  // 全局配置
  watchForFileChanges: false,
  
  // 重试配置
  retries: {
    runMode: 0,
    openMode: 0,
  },
})