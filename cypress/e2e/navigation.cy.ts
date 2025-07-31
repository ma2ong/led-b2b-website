describe('Navigation', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.waitForPageLoad();
  });

  describe('Desktop Navigation', () => {
    beforeEach(() => {
      cy.viewport(1280, 720);
    });

    it('should display all main navigation items', () => {
      cy.contains('Home').should('be.visible');
      cy.contains('About Us').should('be.visible');
      cy.contains('Products').should('be.visible');
      cy.contains('Solutions').should('be.visible');
      cy.contains('Cases').should('be.visible');
      cy.contains('News').should('be.visible');
      cy.contains('Support').should('be.visible');
      cy.contains('Contact').should('be.visible');
    });

    it('should show dropdown menu on hover', () => {
      cy.contains('Products').trigger('mouseover');
      cy.contains('Fine Pitch LED').should('be.visible');
      cy.contains('Outdoor LED Display').should('be.visible');
    });

    it('should highlight active navigation item', () => {
      cy.contains('Home').should('have.class', 'active');
    });

    it('should display language switcher', () => {
      cy.get('[data-testid="language-switcher"]').should('be.visible');
    });

    it('should switch language when clicked', () => {
      cy.get('[data-testid="language-switcher"]').click();
      cy.get('[data-testid="language-option-zh"]').click();
      cy.url().should('include', '/zh');
    });

    it('should display CTA button', () => {
      cy.contains('Get Quote').should('be.visible');
    });
  });

  describe('Mobile Navigation', () => {
    beforeEach(() => {
      cy.viewport(375, 667);
    });

    it('should display hamburger menu button', () => {
      cy.get('[aria-label="navigation.openMenu"]').should('be.visible');
    });

    it('should open mobile menu when hamburger is clicked', () => {
      cy.get('[aria-label="navigation.openMenu"]').click();
      cy.contains('Menu').should('be.visible');
      cy.contains('Home').should('be.visible');
      cy.contains('Products').should('be.visible');
    });

    it('should close mobile menu when close button is clicked', () => {
      cy.get('[aria-label="navigation.openMenu"]').click();
      cy.get('[aria-label="Close menu"]').click();
      cy.contains('Menu').should('not.exist');
    });

    it('should expand submenu in mobile menu', () => {
      cy.get('[aria-label="navigation.openMenu"]').click();
      cy.contains('Products').click();
      cy.contains('Fine Pitch LED').should('be.visible');
    });

    it('should display language switcher in mobile menu', () => {
      cy.get('[aria-label="navigation.openMenu"]').click();
      cy.contains('Language').should('be.visible');
    });
  });

  describe('Language Switching', () => {
    it('should switch to Chinese and update navigation labels', () => {
      cy.get('[data-testid="language-switcher"]').click();
      cy.get('[data-testid="language-option-zh"]').click();
      
      // 检查URL变化
      cy.url().should('include', '/zh');
      
      // 检查导航标签变化（如果有中文导航的话）
      cy.contains('首页').should('be.visible');
    });

    it('should maintain current page when switching language', () => {
      // 假设我们在设计系统页面
      cy.visit('/design-system');
      
      cy.get('[data-testid="language-switcher"]').click();
      cy.get('[data-testid="language-option-zh"]').click();
      
      cy.url().should('include', '/zh/design-system');
    });
  });

  describe('Scroll Behavior', () => {
    it('should change navigation appearance on scroll', () => {
      // 滚动页面
      cy.scrollTo(0, 500);
      
      // 检查导航栏是否有滚动状态的样式
      cy.get('header').should('have.class', 'bg-white/95');
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard navigable', () => {
      // Tab through navigation items
      cy.get('body').tab();
      cy.focused().should('contain', 'Home');
      
      cy.focused().tab();
      cy.focused().should('contain', 'About Us');
    });

    it('should have proper ARIA attributes', () => {
      cy.get('[data-testid="language-switcher"]')
        .should('have.attr', 'aria-expanded', 'false')
        .should('have.attr', 'aria-haspopup', 'true');
    });

    it('should support escape key to close dropdowns', () => {
      cy.get('[data-testid="language-switcher"]').click();
      cy.get('body').type('{esc}');
      cy.get('[data-testid="language-option-zh"]').should('not.exist');
    });
  });
});