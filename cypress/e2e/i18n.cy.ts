/**
 * 国际化系统E2E测试
 */

describe('Internationalization (i18n)', () => {
  beforeEach(() => {
    // 清除localStorage和cookies
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  describe('Language Detection and Switching', () => {
    it('should default to English locale', () => {
      cy.visit('/');
      cy.url().should('include', '/en');
      cy.get('html').should('have.attr', 'lang', 'en');
    });

    it('should switch to Chinese when selected', () => {
      cy.visit('/');
      
      // 点击语言切换器
      cy.get('[data-testid="language-switcher"]').click();
      
      // 选择中文
      cy.get('[data-testid="language-option-zh"]').click();
      
      // 验证URL和HTML lang属性
      cy.url().should('include', '/zh');
      cy.get('html').should('have.attr', 'lang', 'zh-CN');
    });

    it('should persist language preference in localStorage', () => {
      cy.visit('/');
      
      // 切换到中文
      cy.get('[data-testid="language-switcher"]').click();
      cy.get('[data-testid="language-option-zh"]').click();
      
      // 验证localStorage
      cy.window().then((win) => {
        expect(win.localStorage.getItem('preferred-language')).to.equal('zh');
      });
      
      // 刷新页面，应该保持中文
      cy.reload();
      cy.url().should('include', '/zh');
    });

    it('should set language cookie', () => {
      cy.visit('/');
      
      // 切换到中文
      cy.get('[data-testid="language-switcher"]').click();
      cy.get('[data-testid="language-option-zh"]').click();
      
      // 验证cookie
      cy.getCookie('NEXT_LOCALE').should('have.property', 'value', 'zh');
    });
  });

  describe('Content Localization', () => {
    it('should display English content by default', () => {
      cy.visit('/');
      
      // 检查导航菜单是否为英文
      cy.get('nav').should('contain', 'Home');
      cy.get('nav').should('contain', 'Products');
      cy.get('nav').should('contain', 'About');
      cy.get('nav').should('contain', 'Contact');
    });

    it('should display Chinese content when Chinese is selected', () => {
      cy.visit('/');
      
      // 切换到中文
      cy.get('[data-testid="language-switcher"]').click();
      cy.get('[data-testid="language-option-zh"]').click();
      
      // 检查导航菜单是否为中文
      cy.get('nav').should('contain', '首页');
      cy.get('nav').should('contain', '产品');
      cy.get('nav').should('contain', '关于我们');
      cy.get('nav').should('contain', '联系我们');
    });

    it('should maintain language when navigating between pages', () => {
      cy.visit('/');
      
      // 切换到中文
      cy.get('[data-testid="language-switcher"]').click();
      cy.get('[data-testid="language-option-zh"]').click();
      
      // 导航到产品页面
      cy.get('nav a[href*="products"]').click();
      
      // 验证仍然是中文
      cy.url().should('include', '/zh/products');
      cy.get('nav').should('contain', '产品');
    });
  });

  describe('URL Localization', () => {
    it('should handle direct access to localized URLs', () => {
      // 直接访问中文URL
      cy.visit('/zh/products');
      
      cy.url().should('include', '/zh/products');
      cy.get('html').should('have.attr', 'lang', 'zh-CN');
      cy.get('nav').should('contain', '产品');
    });

    it('should redirect to default locale for invalid locales', () => {
      // 访问无效的语言代码
      cy.visit('/fr/products', { failOnStatusCode: false });
      
      // 应该重定向到默认语言
      cy.url().should('include', '/en/products');
    });

    it('should preserve query parameters when switching languages', () => {
      cy.visit('/products?category=indoor&sort=price');
      
      // 切换到中文
      cy.get('[data-testid="language-switcher"]').click();
      cy.get('[data-testid="language-option-zh"]').click();
      
      // 验证查询参数保持不变
      cy.url().should('include', '/zh/products');
      cy.url().should('include', 'category=indoor');
      cy.url().should('include', 'sort=price');
    });
  });

  describe('Language Switcher UI', () => {
    it('should show current language flag and name', () => {
      cy.visit('/');
      
      const switcher = cy.get('[data-testid="language-switcher"]');
      switcher.should('contain', '🇺🇸'); // English flag
      switcher.should('contain', 'English');
    });

    it('should show dropdown with available languages', () => {
      cy.visit('/');
      
      cy.get('[data-testid="language-switcher"]').click();
      
      // 验证下拉菜单内容
      cy.get('[data-testid="language-option-en"]').should('be.visible');
      cy.get('[data-testid="language-option-zh"]').should('be.visible');
      
      // 验证语言选项内容
      cy.get('[data-testid="language-option-en"]').should('contain', '🇺🇸');
      cy.get('[data-testid="language-option-en"]').should('contain', 'English');
      
      cy.get('[data-testid="language-option-zh"]').should('contain', '🇨🇳');
      cy.get('[data-testid="language-option-zh"]').should('contain', '中文');
    });

    it('should highlight current language in dropdown', () => {
      cy.visit('/');
      
      cy.get('[data-testid="language-switcher"]').click();
      
      // 英文应该被高亮
      cy.get('[data-testid="language-option-en"]').should('have.class', 'text-primary-600');
      cy.get('[data-testid="language-option-zh"]').should('not.have.class', 'text-primary-600');
    });

    it('should close dropdown when clicking outside', () => {
      cy.visit('/');
      
      cy.get('[data-testid="language-switcher"]').click();
      cy.get('[data-testid="language-option-zh"]').should('be.visible');
      
      // 点击外部区域
      cy.get('body').click(0, 0);
      
      cy.get('[data-testid="language-option-zh"]').should('not.exist');
    });

    it('should work in compact variant', () => {
      cy.visit('/navigation-demo'); // 假设有一个演示页面
      
      // 查找紧凑版语言切换器
      cy.get('[data-testid="language-switcher"]').should('have.class', 'gap-1');
    });
  });

  describe('SEO and Meta Tags', () => {
    it('should set correct hreflang tags', () => {
      cy.visit('/');
      
      // 检查hreflang标签
      cy.get('link[hreflang="en"]').should('exist');
      cy.get('link[hreflang="zh-CN"]').should('exist');
    });

    it('should set correct Open Graph locale', () => {
      cy.visit('/');
      
      cy.get('meta[property="og:locale"]').should('have.attr', 'content', 'en_US');
      
      // 切换到中文
      cy.get('[data-testid="language-switcher"]').click();
      cy.get('[data-testid="language-option-zh"]').click();
      
      cy.get('meta[property="og:locale"]').should('have.attr', 'content', 'zh_CN');
    });

    it('should set correct HTML dir attribute for RTL languages', () => {
      cy.visit('/');
      
      // 英文和中文都是LTR
      cy.get('html').should('have.attr', 'dir', 'ltr');
      
      // 切换到中文
      cy.get('[data-testid="language-switcher"]').click();
      cy.get('[data-testid="language-option-zh"]').click();
      
      cy.get('html').should('have.attr', 'dir', 'ltr');
    });
  });

  describe('Form Localization', () => {
    it('should localize form labels and placeholders', () => {
      cy.visit('/contact');
      
      // 英文表单
      cy.get('input[name="name"]').should('have.attr', 'placeholder').and('include', 'Name');
      cy.get('input[name="email"]').should('have.attr', 'placeholder').and('include', 'Email');
      
      // 切换到中文
      cy.get('[data-testid="language-switcher"]').click();
      cy.get('[data-testid="language-option-zh"]').click();
      
      // 中文表单
      cy.get('input[name="name"]').should('have.attr', 'placeholder').and('include', '姓名');
      cy.get('input[name="email"]').should('have.attr', 'placeholder').and('include', '邮箱');
    });

    it('should localize validation messages', () => {
      cy.visit('/contact');
      
      // 提交空表单触发验证
      cy.get('button[type="submit"]').click();
      
      // 英文验证消息
      cy.get('.error-message').should('contain', 'required');
      
      // 切换到中文
      cy.get('[data-testid="language-switcher"]').click();
      cy.get('[data-testid="language-option-zh"]').click();
      
      // 再次提交空表单
      cy.get('button[type="submit"]').click();
      
      // 中文验证消息
      cy.get('.error-message').should('contain', '必填');
    });
  });

  describe('Number and Date Formatting', () => {
    it('should format numbers according to locale', () => {
      cy.visit('/products');
      
      // 英文数字格式 (1,234.56)
      cy.get('.price').first().should('match', /\$[\d,]+\.\d{2}/);
      
      // 切换到中文
      cy.get('[data-testid="language-switcher"]').click();
      cy.get('[data-testid="language-option-zh"]').click();
      
      // 中文数字格式 (¥1,234.56)
      cy.get('.price').first().should('match', /¥[\d,]+\.\d{2}/);
    });

    it('should format dates according to locale', () => {
      cy.visit('/news');
      
      // 英文日期格式 (MM/DD/YYYY)
      cy.get('.date').first().should('match', /\d{1,2}\/\d{1,2}\/\d{4}/);
      
      // 切换到中文
      cy.get('[data-testid="language-switcher"]').click();
      cy.get('[data-testid="language-option-zh"]').click();
      
      // 中文日期格式 (YYYY/MM/DD)
      cy.get('.date').first().should('match', /\d{4}\/\d{1,2}\/\d{1,2}/);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for language switcher', () => {
      cy.visit('/');
      
      cy.get('[data-testid="language-switcher"]')
        .should('have.attr', 'aria-expanded', 'false')
        .should('have.attr', 'aria-haspopup', 'true');
      
      // 打开下拉菜单
      cy.get('[data-testid="language-switcher"]').click();
      
      cy.get('[data-testid="language-switcher"]')
        .should('have.attr', 'aria-expanded', 'true');
    });

    it('should support keyboard navigation', () => {
      cy.visit('/');
      
      // 使用Tab键导航到语言切换器
      cy.get('body').tab();
      cy.get('[data-testid="language-switcher"]').should('be.focused');
      
      // 使用Enter键打开下拉菜单
      cy.get('[data-testid="language-switcher"]').type('{enter}');
      cy.get('[data-testid="language-option-zh"]').should('be.visible');
      
      // 使用方向键导航
      cy.get('[data-testid="language-switcher"]').type('{downarrow}');
      cy.get('[data-testid="language-option-zh"]').should('be.focused');
      
      // 使用Enter键选择
      cy.get('[data-testid="language-option-zh"]').type('{enter}');
      cy.url().should('include', '/zh');
    });

    it('should announce language changes to screen readers', () => {
      cy.visit('/');
      
      // 检查是否有适当的aria-live区域
      cy.get('[aria-live]').should('exist');
      
      // 切换语言
      cy.get('[data-testid="language-switcher"]').click();
      cy.get('[data-testid="language-option-zh"]').click();
      
      // 验证语言变更通知
      cy.get('[aria-live]').should('contain', 'Language changed to Chinese');
    });
  });

  describe('Performance', () => {
    it('should load translations efficiently', () => {
      cy.visit('/');
      
      // 监控网络请求
      cy.intercept('GET', '**/locales/**/*.json').as('translationRequest');
      
      // 切换语言
      cy.get('[data-testid="language-switcher"]').click();
      cy.get('[data-testid="language-option-zh"]').click();
      
      // 验证只加载必要的翻译文件
      cy.wait('@translationRequest').then((interception) => {
        expect(interception.request.url).to.include('/zh/');
      });
    });

    it('should cache translations', () => {
      cy.visit('/');
      
      // 第一次切换到中文
      cy.get('[data-testid="language-switcher"]').click();
      cy.get('[data-testid="language-option-zh"]').click();
      
      // 切换回英文
      cy.get('[data-testid="language-switcher"]').click();
      cy.get('[data-testid="language-option-en"]').click();
      
      // 再次切换到中文，应该使用缓存
      cy.get('[data-testid="language-switcher"]').click();
      cy.get('[data-testid="language-option-zh"]').click();
      
      // 页面应该快速加载，无额外网络请求
      cy.get('nav').should('contain', '产品');
    });
  });
});