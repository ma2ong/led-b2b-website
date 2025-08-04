describe('Homepage', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.waitForPageLoad();
  });

  it('should display the homepage correctly', () => {
    // 检查页面标题
    cy.title().should('contain', 'Professional LED Display Manufacturer');
    
    // 检查导航栏
    cy.contains('Lejin LED').should('be.visible');
    cy.contains('Home').should('be.visible');
    cy.contains('Products').should('be.visible');
    cy.contains('About Us').should('be.visible');
    
    // 检查主要内容是否存在
    cy.contains('Professional LED Display Solutions').should('be.visible');
    cy.contains('17+ Years of Manufacturing Excellence').should('be.visible');
    
    // 检查网站建设中的提示
    cy.contains('Website Under Construction').should('be.visible');
    
    // 检查基础功能完成状态
    cy.contains('Next.js 14 Setup').should('be.visible');
    cy.contains('TypeScript Configuration').should('be.visible');
    cy.contains('Tailwind CSS Styling').should('be.visible');
    cy.contains('Design System').should('be.visible');
  });

  it('should be responsive', () => {
    // 测试不同屏幕尺寸
    const viewports = [
      { width: 375, height: 667 }, // Mobile
      { width: 768, height: 1024 }, // Tablet
      { width: 1280, height: 720 }, // Desktop
    ];

    viewports.forEach((viewport) => {
      cy.viewport(viewport.width, viewport.height);
      cy.get('main').should('be.visible');
      cy.get('h1').should('be.visible');
      
      // 检查导航在不同尺寸下的显示
      if (viewport.width < 1024) {
        // 移动端应该显示汉堡菜单
        cy.get('[aria-label="navigation.openMenu"]').should('be.visible');
      } else {
        // 桌面端应该显示完整导航
        cy.contains('Products').should('be.visible');
        cy.contains('Solutions').should('be.visible');
      }
    });
  });

  it('should have proper meta tags', () => {
    // 检查SEO相关的meta标签
    cy.get('head meta[name="description"]').should('exist');
    cy.get('head meta[name="keywords"]').should('exist');
    cy.get('head meta[property="og:title"]').should('exist');
    cy.get('head meta[property="og:description"]').should('exist');
    cy.get('head meta[name="twitter:card"]').should('exist');
  });

  it('should have structured data', () => {
    // 检查结构化数据
    cy.get('script[type="application/ld+json"]').should('exist');
  });

  it('should load without accessibility violations', () => {
    // 基础的可访问性检查
    cy.get('h1').should('exist');
    cy.get('main').should('exist');
    
    // 检查图片是否有alt属性（如果存在）
    cy.get('img').each(($img) => {
      cy.wrap($img).should('have.attr', 'alt');
    });
  });
});