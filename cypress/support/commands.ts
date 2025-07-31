/// <reference types="cypress" />

// 自定义命令：等待页面加载完成
Cypress.Commands.add('waitForPageLoad', () => {
  cy.window().should('have.property', 'next');
  cy.get('body').should('be.visible');
});

// 自定义命令：切换语言
Cypress.Commands.add('switchLanguage', (language: 'en' | 'zh') => {
  cy.get('[data-testid="language-switcher"]').click();
  cy.get(`[data-testid="language-option-${language}"]`).click();
  cy.url().should('include', `/${language}`);
});

// 自定义命令：填写询盘表单
Cypress.Commands.add('fillInquiryForm', (data) => {
  cy.get('[data-testid="inquiry-form"]').within(() => {
    cy.get('input[name="name"]').type(data.name);
    cy.get('input[name="email"]').type(data.email);
    cy.get('input[name="company"]').type(data.company);
    cy.get('textarea[name="message"]').type(data.message);
  });
});

// 添加更多自定义命令...

export {};