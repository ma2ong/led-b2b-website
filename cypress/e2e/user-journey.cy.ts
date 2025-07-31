/**
 * 用户完整流程E2E测试
 */

describe('Complete User Journey', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Product Discovery Journey', () => {
    it('allows user to discover and compare products', () => {
      // 1. 用户访问首页
      cy.get('[data-testid="hero-section"]').should('be.visible');
      cy.get('[data-testid="product-navigation"]').should('be.visible');

      // 2. 浏览产品类别
      cy.get('[data-testid="product-category"]').first().click();
      cy.url().should('include', '/products');

      // 3. 使用筛选功能
      cy.get('[data-testid="product-filters"]').should('be.visible');
      cy.get('[data-testid="filter-category"]').select('Indoor LED');
      cy.get('[data-testid="filter-pixel-pitch"]').select('P2.5');
      
      // 4. 查看筛选结果
      cy.get('[data-testid="product-grid"]').should('be.visible');
      cy.get('[data-testid="product-card"]').should('have.length.at.least', 1);

      // 5. 查看产品详情
      cy.get('[data-testid="product-card"]').first().click();
      cy.url().should('include', '/products/');
      cy.get('[data-testid="product-detail"]').should('be.visible');
      cy.get('[data-testid="product-specifications"]').should('be.visible');
      cy.get('[data-testid="product-images"]').should('be.visible');

      // 6. 添加到对比
      cy.get('[data-testid="add-to-compare"]').click();
      cy.get('[data-testid="compare-notification"]').should('be.visible');

      // 7. 返回产品列表添加更多产品对比
      cy.go('back');
      cy.get('[data-testid="product-card"]').eq(1).click();
      cy.get('[data-testid="add-to-compare"]').click();

      // 8. 查看产品对比
      cy.get('[data-testid="compare-button"]').click();
      cy.url().should('include', '/products/compare');
      cy.get('[data-testid="comparison-table"]').should('be.visible');
      cy.get('[data-testid="compared-product"]').should('have.length', 2);
    });

    it('allows user to search for specific products', () => {
      // 1. 使用搜索功能
      cy.get('[data-testid="search-input"]').type('P2.5 Indoor');
      cy.get('[data-testid="search-button"]').click();

      // 2. 查看搜索结果
      cy.url().should('include', 'search=P2.5');
      cy.get('[data-testid="search-results"]').should('be.visible');
      cy.get('[data-testid="product-card"]').should('contain.text', 'P2.5');

      // 3. 使用搜索建议
      cy.get('[data-testid="search-input"]').clear().type('LED');
      cy.get('[data-testid="search-suggestions"]').should('be.visible');
      cy.get('[data-testid="search-suggestion"]').first().click();
      cy.get('[data-testid="search-results"]').should('be.visible');
    });
  });

  describe('Inquiry Submission Journey', () => {
    it('allows user to submit a complete inquiry', () => {
      // 1. 从产品页面开始询盘
      cy.visit('/products/p2-5-indoor-led-display');
      cy.get('[data-testid="inquiry-button"]').click();

      // 2. 填写多步骤询盘表单 - 产品信息
      cy.get('[data-testid="multi-step-form"]').should('be.visible');
      cy.get('[data-testid="step-indicator"]').should('contain.text', '1');
      
      cy.get('[data-testid="product-quantity"]').type('10');
      cy.get('[data-testid="product-size"]').select('2x1m');
      cy.get('[data-testid="installation-type"]').select('Wall Mount');
      cy.get('[data-testid="next-step"]').click();

      // 3. 项目信息
      cy.get('[data-testid="step-indicator"]').should('contain.text', '2');
      cy.get('[data-testid="project-name"]').type('Retail Store Display');
      cy.get('[data-testid="project-description"]').type('LED display for retail store entrance');
      cy.get('[data-testid="project-budget-min"]').type('10000');
      cy.get('[data-testid="project-budget-max"]').type('50000');
      cy.get('[data-testid="project-timeline"]').select('1-3 months');
      cy.get('[data-testid="next-step"]').click();

      // 4. 公司信息
      cy.get('[data-testid="step-indicator"]').should('contain.text', '3');
      cy.get('[data-testid="company-name"]').type('Test Retail Corp');
      cy.get('[data-testid="company-industry"]').select('Retail');
      cy.get('[data-testid="company-website"]').type('https://testretail.com');
      cy.get('[data-testid="company-country"]').select('United States');
      cy.get('[data-testid="company-city"]').type('New York');
      cy.get('[data-testid="next-step"]').click();

      // 5. 联系信息
      cy.get('[data-testid="step-indicator"]').should('contain.text', '4');
      cy.get('[data-testid="contact-name"]').type('John Doe');
      cy.get('[data-testid="contact-email"]').type('john@testretail.com');
      cy.get('[data-testid="contact-phone"]').type('+1234567890');
      cy.get('[data-testid="contact-position"]').type('Store Manager');
      cy.get('[data-testid="next-step"]').click();

      // 6. 确认和提交
      cy.get('[data-testid="step-indicator"]').should('contain.text', '5');
      cy.get('[data-testid="inquiry-summary"]').should('be.visible');
      cy.get('[data-testid="summary-product"]').should('contain.text', 'P2.5 Indoor LED Display');
      cy.get('[data-testid="summary-quantity"]').should('contain.text', '10');
      cy.get('[data-testid="summary-company"]').should('contain.text', 'Test Retail Corp');
      cy.get('[data-testid="summary-contact"]').should('contain.text', 'John Doe');

      cy.get('[data-testid="terms-checkbox"]').check();
      cy.get('[data-testid="submit-inquiry"]').click();

      // 7. 确认提交成功
      cy.get('[data-testid="inquiry-success"]').should('be.visible');
      cy.get('[data-testid="inquiry-id"]').should('be.visible');
      cy.get('[data-testid="success-message"]').should('contain.text', 'Thank you for your inquiry');
    });

    it('validates form fields and shows appropriate errors', () => {
      // 1. 访问询盘表单
      cy.get('[data-testid="floating-inquiry-button"]').click();

      // 2. 尝试跳过必填字段
      cy.get('[data-testid="next-step"]').click();
      cy.get('[data-testid="error-message"]').should('be.visible');

      // 3. 测试邮箱验证
      cy.get('[data-testid="contact-email"]').type('invalid-email');
      cy.get('[data-testid="next-step"]').click();
      cy.get('[data-testid="email-error"]').should('contain.text', 'valid email');

      // 4. 测试电话号码验证
      cy.get('[data-testid="contact-phone"]').type('invalid-phone');
      cy.get('[data-testid="phone-error"]').should('be.visible');

      // 5. 测试预算范围验证
      cy.get('[data-testid="project-budget-min"]').type('50000');
      cy.get('[data-testid="project-budget-max"]').type('10000');
      cy.get('[data-testid="budget-error"]').should('contain.text', 'minimum budget');
    });
  });

  describe('Case Studies and Solutions Journey', () => {
    it('allows user to explore case studies and solutions', () => {
      // 1. 访问案例研究页面
      cy.get('[data-testid="nav-case-studies"]').click();
      cy.url().should('include', '/case-studies');

      // 2. 查看案例地图
      cy.get('[data-testid="case-study-map"]').should('be.visible');
      cy.get('[data-testid="map-marker"]').should('have.length.at.least', 1);

      // 3. 点击地图标记查看案例
      cy.get('[data-testid="map-marker"]').first().click();
      cy.get('[data-testid="case-study-popup"]').should('be.visible');
      cy.get('[data-testid="view-case-study"]').click();

      // 4. 查看案例详情
      cy.get('[data-testid="case-study-detail"]').should('be.visible');
      cy.get('[data-testid="case-study-images"]').should('be.visible');
      cy.get('[data-testid="case-study-specs"]').should('be.visible');
      cy.get('[data-testid="case-study-results"]').should('be.visible');

      // 5. 查看相关产品
      cy.get('[data-testid="related-products"]').should('be.visible');
      cy.get('[data-testid="related-product"]').first().click();
      cy.url().should('include', '/products/');

      // 6. 访问解决方案页面
      cy.visit('/solutions');
      cy.get('[data-testid="solutions-grid"]').should('be.visible');

      // 7. 按行业筛选解决方案
      cy.get('[data-testid="industry-filter"]').select('Retail');
      cy.get('[data-testid="solution-card"]').should('contain.text', 'Retail');

      // 8. 查看解决方案详情
      cy.get('[data-testid="solution-card"]').first().click();
      cy.get('[data-testid="solution-detail"]').should('be.visible');
      cy.get('[data-testid="solution-benefits"]').should('be.visible');
      cy.get('[data-testid="solution-products"]').should('be.visible');
    });
  });

  describe('Multi-language Experience', () => {
    it('allows user to switch languages and maintains functionality', () => {
      // 1. 切换到中文
      cy.get('[data-testid="language-switcher"]').click();
      cy.get('[data-testid="language-option-zh"]').click();

      // 2. 验证页面内容已切换
      cy.get('[data-testid="hero-title"]').should('contain.text', '专业LED显示屏');
      cy.get('[data-testid="nav-products"]').should('contain.text', '产品');

      // 3. 在中文环境下使用产品筛选
      cy.get('[data-testid="nav-products"]').click();
      cy.get('[data-testid="filter-category"]').select('室内LED');
      cy.get('[data-testid="product-card"]').should('be.visible');

      // 4. 在中文环境下提交询盘
      cy.get('[data-testid="inquiry-button"]').first().click();
      cy.get('[data-testid="contact-name"]').type('张三');
      cy.get('[data-testid="contact-email"]').type('zhangsan@example.com');
      cy.get('[data-testid="company-name"]').type('测试公司');
      cy.get('[data-testid="inquiry-message"]').type('请提供报价');

      // 5. 切换回英文
      cy.get('[data-testid="language-switcher"]').click();
      cy.get('[data-testid="language-option-en"]').click();

      // 6. 验证表单数据保持不变
      cy.get('[data-testid="contact-name"]').should('have.value', '张三');
      cy.get('[data-testid="contact-email"]').should('have.value', 'zhangsan@example.com');
    });
  });

  describe('Mobile Responsive Experience', () => {
    beforeEach(() => {
      cy.viewport('iphone-x');
    });

    it('provides optimal mobile experience', () => {
      // 1. 验证移动端导航
      cy.get('[data-testid="mobile-menu-button"]').should('be.visible');
      cy.get('[data-testid="mobile-menu-button"]').click();
      cy.get('[data-testid="mobile-menu"]').should('be.visible');

      // 2. 移动端产品浏览
      cy.get('[data-testid="mobile-nav-products"]').click();
      cy.get('[data-testid="product-grid"]').should('be.visible');
      
      // 3. 移动端筛选器
      cy.get('[data-testid="mobile-filter-button"]').click();
      cy.get('[data-testid="mobile-filter-drawer"]').should('be.visible');
      cy.get('[data-testid="filter-category"]').select('Indoor LED');
      cy.get('[data-testid="apply-filters"]').click();

      // 4. 移动端产品详情
      cy.get('[data-testid="product-card"]').first().click();
      cy.get('[data-testid="product-detail"]').should('be.visible');
      
      // 5. 移动端图片画廊
      cy.get('[data-testid="product-image"]').should('be.visible');
      cy.get('[data-testid="image-thumbnail"]').eq(1).click();
      cy.get('[data-testid="product-image"]').should('have.attr', 'src').and('include', 'image-2');

      // 6. 移动端询盘表单
      cy.get('[data-testid="mobile-inquiry-button"]').click();
      cy.get('[data-testid="mobile-inquiry-form"]').should('be.visible');
      
      // 7. 移动端快速联系
      cy.get('[data-testid="quick-contact-bar"]').should('be.visible');
      cy.get('[data-testid="quick-call"]').should('be.visible');
      cy.get('[data-testid="quick-whatsapp"]').should('be.visible');
    });
  });

  describe('Performance and Accessibility', () => {
    it('meets performance benchmarks', () => {
      // 1. 测试页面加载时间
      cy.visit('/', {
        onBeforeLoad: (win) => {
          win.performance.mark('start');
        },
        onLoad: (win) => {
          win.performance.mark('end');
          win.performance.measure('pageLoad', 'start', 'end');
          const measure = win.performance.getEntriesByName('pageLoad')[0];
          expect(measure.duration).to.be.lessThan(3000); // 3秒内加载完成
        },
      });

      // 2. 测试图片懒加载
      cy.get('[data-testid="lazy-image"]').should('not.have.attr', 'src');
      cy.scrollTo('bottom');
      cy.get('[data-testid="lazy-image"]').should('have.attr', 'src');

      // 3. 测试无障碍访问
      cy.get('img').each(($img) => {
        cy.wrap($img).should('have.attr', 'alt');
      });

      cy.get('button').each(($button) => {
        cy.wrap($button).should('be.visible');
      });

      // 4. 测试键盘导航
      cy.get('body').tab();
      cy.focused().should('have.attr', 'tabindex').or('be.focusable');
    });

    it('handles error states gracefully', () => {
      // 1. 测试网络错误处理
      cy.intercept('GET', '/api/products', { forceNetworkError: true });
      cy.visit('/products');
      cy.get('[data-testid="error-message"]').should('be.visible');
      cy.get('[data-testid="retry-button"]').should('be.visible');

      // 2. 测试404页面
      cy.visit('/non-existent-page', { failOnStatusCode: false });
      cy.get('[data-testid="404-page"]').should('be.visible');
      cy.get('[data-testid="back-home"]').click();
      cy.url().should('eq', Cypress.config().baseUrl + '/');

      // 3. 测试表单提交错误
      cy.intercept('POST', '/api/inquiries', { statusCode: 500 });
      cy.get('[data-testid="floating-inquiry-button"]').click();
      cy.get('[data-testid="contact-name"]').type('Test User');
      cy.get('[data-testid="contact-email"]').type('test@example.com');
      cy.get('[data-testid="submit-inquiry"]').click();
      cy.get('[data-testid="error-notification"]').should('be.visible');
    });
  });
});