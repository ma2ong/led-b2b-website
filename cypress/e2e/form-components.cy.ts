/**
 * 表单组件E2E测试
 */

describe('Form Components', () => {
  beforeEach(() => {
    cy.visit('/ui-showcase'); // 假设有一个UI展示页面
  });

  describe('Button Component', () => {
    it('should render different button variants', () => {
      cy.get('[data-testid="button-primary"]').should('be.visible');
      cy.get('[data-testid="button-secondary"]').should('be.visible');
      cy.get('[data-testid="button-outline"]').should('be.visible');
      cy.get('[data-testid="button-ghost"]').should('be.visible');
    });

    it('should handle button clicks', () => {
      cy.get('[data-testid="button-primary"]').click();
      cy.get('[data-testid="click-count"]').should('contain', '1');
    });

    it('should show loading state', () => {
      cy.get('[data-testid="button-loading"]').should('contain', 'Loading');
      cy.get('[data-testid="button-loading"]').should('be.disabled');
    });

    it('should render different sizes', () => {
      cy.get('[data-testid="button-xs"]').should('have.class', 'btn-xs');
      cy.get('[data-testid="button-sm"]').should('have.class', 'btn-sm');
      cy.get('[data-testid="button-lg"]').should('have.class', 'btn-lg');
      cy.get('[data-testid="button-xl"]').should('have.class', 'btn-xl');
    });

    it('should support keyboard navigation', () => {
      cy.get('[data-testid="button-primary"]').focus();
      cy.get('[data-testid="button-primary"]').should('be.focused');
      cy.get('[data-testid="button-primary"]').type('{enter}');
      cy.get('[data-testid="click-count"]').should('contain', '1');
    });
  });

  describe('Input Component', () => {
    it('should render input field with label', () => {
      cy.get('[data-testid="input-name"]').should('be.visible');
      cy.get('label[for="input-name"]').should('contain', 'Name');
    });

    it('should handle text input', () => {
      cy.get('[data-testid="input-name"]').type('John Doe');
      cy.get('[data-testid="input-name"]').should('have.value', 'John Doe');
    });

    it('should show validation errors', () => {
      cy.get('[data-testid="input-email"]').type('invalid-email');
      cy.get('[data-testid="input-email"]').blur();
      cy.get('[data-testid="input-email-error"]').should('contain', 'Please enter a valid email');
    });

    it('should clear validation errors when input becomes valid', () => {
      cy.get('[data-testid="input-email"]').type('invalid-email');
      cy.get('[data-testid="input-email"]').blur();
      cy.get('[data-testid="input-email-error"]').should('be.visible');
      
      cy.get('[data-testid="input-email"]').clear();
      cy.get('[data-testid="input-email"]').type('valid@example.com');
      cy.get('[data-testid="input-email"]').blur();
      cy.get('[data-testid="input-email-error"]').should('not.exist');
    });

    it('should show helper text', () => {
      cy.get('[data-testid="input-password-help"]').should('contain', 'Must be at least 8 characters');
    });

    it('should support different input types', () => {
      cy.get('[data-testid="input-email"]').should('have.attr', 'type', 'email');
      cy.get('[data-testid="input-password"]').should('have.attr', 'type', 'password');
      cy.get('[data-testid="input-number"]').should('have.attr', 'type', 'number');
    });
  });

  describe('Textarea Component', () => {
    it('should render textarea field', () => {
      cy.get('[data-testid="textarea-message"]').should('be.visible');
      cy.get('label[for="textarea-message"]').should('contain', 'Message');
    });

    it('should handle multiline text input', () => {
      const message = 'This is a\nmultiline\nmessage';
      cy.get('[data-testid="textarea-message"]').type(message);
      cy.get('[data-testid="textarea-message"]').should('have.value', message);
    });

    it('should support character counting', () => {
      cy.get('[data-testid="textarea-message"]').type('Hello world');
      cy.get('[data-testid="textarea-character-count"]').should('contain', '11');
    });

    it('should validate minimum length', () => {
      cy.get('[data-testid="textarea-message"]').type('Hi');
      cy.get('[data-testid="textarea-message"]').blur();
      cy.get('[data-testid="textarea-message-error"]').should('contain', 'Must be at least');
    });
  });

  describe('Select Component', () => {
    it('should render select field with options', () => {
      cy.get('[data-testid="select-country"]').should('be.visible');
      cy.get('[data-testid="select-country"]').click();
      cy.get('option[value="us"]').should('contain', 'United States');
      cy.get('option[value="ca"]').should('contain', 'Canada');
      cy.get('option[value="uk"]').should('contain', 'United Kingdom');
    });

    it('should handle option selection', () => {
      cy.get('[data-testid="select-country"]').select('Canada');
      cy.get('[data-testid="select-country"]').should('have.value', 'ca');
    });

    it('should show placeholder', () => {
      cy.get('[data-testid="select-country"]').should('contain', 'Select a country');
    });

    it('should support grouped options', () => {
      cy.get('[data-testid="select-grouped"]').click();
      cy.get('optgroup[label="North America"]').should('exist');
      cy.get('optgroup[label="Europe"]').should('exist');
    });
  });

  describe('Checkbox Component', () => {
    it('should render checkbox with label', () => {
      cy.get('[data-testid="checkbox-terms"]').should('be.visible');
      cy.get('label[for="checkbox-terms"]').should('contain', 'Accept Terms');
    });

    it('should handle checkbox toggle', () => {
      cy.get('[data-testid="checkbox-terms"]').should('not.be.checked');
      cy.get('[data-testid="checkbox-terms"]').check();
      cy.get('[data-testid="checkbox-terms"]').should('be.checked');
      cy.get('[data-testid="checkbox-terms"]').uncheck();
      cy.get('[data-testid="checkbox-terms"]').should('not.be.checked');
    });

    it('should support indeterminate state', () => {
      cy.get('[data-testid="checkbox-indeterminate"]').should('have.prop', 'indeterminate', true);
    });

    it('should support keyboard navigation', () => {
      cy.get('[data-testid="checkbox-terms"]').focus();
      cy.get('[data-testid="checkbox-terms"]').should('be.focused');
      cy.get('[data-testid="checkbox-terms"]').type(' ');
      cy.get('[data-testid="checkbox-terms"]').should('be.checked');
    });
  });

  describe('Radio Group Component', () => {
    it('should render radio group with options', () => {
      cy.get('[data-testid="radio-size-small"]').should('be.visible');
      cy.get('[data-testid="radio-size-medium"]').should('be.visible');
      cy.get('[data-testid="radio-size-large"]').should('be.visible');
    });

    it('should handle radio selection', () => {
      cy.get('[data-testid="radio-size-medium"]').check();
      cy.get('[data-testid="radio-size-medium"]').should('be.checked');
      cy.get('[data-testid="radio-size-small"]').should('not.be.checked');
      cy.get('[data-testid="radio-size-large"]').should('not.be.checked');
    });

    it('should allow only one selection', () => {
      cy.get('[data-testid="radio-size-small"]').check();
      cy.get('[data-testid="radio-size-medium"]').check();
      cy.get('[data-testid="radio-size-small"]').should('not.be.checked');
      cy.get('[data-testid="radio-size-medium"]').should('be.checked');
    });

    it('should support keyboard navigation', () => {
      cy.get('[data-testid="radio-size-small"]').focus();
      cy.get('[data-testid="radio-size-small"]').type('{rightarrow}');
      cy.get('[data-testid="radio-size-medium"]').should('be.focused');
      cy.get('[data-testid="radio-size-medium"]').should('be.checked');
    });
  });

  describe('File Upload Component', () => {
    it('should render file upload area', () => {
      cy.get('[data-testid="file-upload"]').should('be.visible');
      cy.get('[data-testid="file-upload"]').should('contain', 'Click to upload');
    });

    it('should handle file selection', () => {
      const fileName = 'test-file.txt';
      cy.fixture(fileName).then(fileContent => {
        cy.get('[data-testid="file-upload-input"]').selectFile({
          contents: Cypress.Buffer.from(fileContent),
          fileName,
          mimeType: 'text/plain',
        });
      });
      
      cy.get('[data-testid="uploaded-file"]').should('contain', fileName);
    });

    it('should show file size and type restrictions', () => {
      cy.get('[data-testid="file-upload-restrictions"]').should('contain', 'Max size: 10MB');
      cy.get('[data-testid="file-upload-restrictions"]').should('contain', 'Accepted formats');
    });

    it('should support drag and drop', () => {
      cy.fixture('test-file.txt').then(fileContent => {
        cy.get('[data-testid="file-upload"]').selectFile({
          contents: Cypress.Buffer.from(fileContent),
          fileName: 'test-file.txt',
          mimeType: 'text/plain',
        }, { action: 'drag-drop' });
      });
      
      cy.get('[data-testid="uploaded-file"]').should('contain', 'test-file.txt');
    });

    it('should allow file removal', () => {
      cy.fixture('test-file.txt').then(fileContent => {
        cy.get('[data-testid="file-upload-input"]').selectFile({
          contents: Cypress.Buffer.from(fileContent),
          fileName: 'test-file.txt',
          mimeType: 'text/plain',
        });
      });
      
      cy.get('[data-testid="uploaded-file"]').should('be.visible');
      cy.get('[data-testid="remove-file-0"]').click();
      cy.get('[data-testid="uploaded-file"]').should('not.exist');
    });

    it('should validate file size', () => {
      // Create a large file (mock)
      const largeContent = 'x'.repeat(11 * 1024 * 1024); // 11MB
      cy.get('[data-testid="file-upload-input"]').selectFile({
        contents: Cypress.Buffer.from(largeContent),
        fileName: 'large-file.txt',
        mimeType: 'text/plain',
      });
      
      cy.get('[data-testid="file-upload-error"]').should('contain', 'File size must be less than');
    });
  });

  describe('Multi-Step Form Component', () => {
    beforeEach(() => {
      cy.visit('/multi-step-form-demo'); // 假设有一个多步骤表单演示页面
    });

    it('should render step indicators', () => {
      cy.get('[data-testid="step-indicator-0"]').should('be.visible');
      cy.get('[data-testid="step-indicator-1"]').should('be.visible');
      cy.get('[data-testid="step-indicator-2"]').should('be.visible');
    });

    it('should show current step as active', () => {
      cy.get('[data-testid="step-indicator-0"]').should('have.class', 'active');
      cy.get('[data-testid="step-indicator-1"]').should('not.have.class', 'active');
    });

    it('should navigate between steps', () => {
      // Start at step 1
      cy.get('[data-testid="step-content-0"]').should('be.visible');
      cy.get('[data-testid="step-content-1"]').should('not.exist');
      
      // Go to step 2
      cy.get('[data-testid="next-button"]').click();
      cy.get('[data-testid="step-content-1"]').should('be.visible');
      cy.get('[data-testid="step-content-0"]').should('not.exist');
      
      // Go back to step 1
      cy.get('[data-testid="previous-button"]').click();
      cy.get('[data-testid="step-content-0"]').should('be.visible');
    });

    it('should show progress bar', () => {
      cy.get('[data-testid="progress-bar"]').should('be.visible');
      cy.get('[data-testid="progress-bar"]').should('have.attr', 'style').and('include', '33.33%');
      
      cy.get('[data-testid="next-button"]').click();
      cy.get('[data-testid="progress-bar"]').should('have.attr', 'style').and('include', '66.66%');
    });

    it('should validate steps before proceeding', () => {
      // Try to proceed without filling required fields
      cy.get('[data-testid="next-button"]').click();
      cy.get('[data-testid="step-error"]').should('contain', 'Please complete all required fields');
      
      // Fill required fields and proceed
      cy.get('[data-testid="step-1-name"]').type('John Doe');
      cy.get('[data-testid="step-1-email"]').type('john@example.com');
      cy.get('[data-testid="next-button"]').click();
      cy.get('[data-testid="step-content-1"]').should('be.visible');
    });

    it('should show complete button on last step', () => {
      // Navigate to last step
      cy.get('[data-testid="step-1-name"]').type('John Doe');
      cy.get('[data-testid="step-1-email"]').type('john@example.com');
      cy.get('[data-testid="next-button"]').click();
      
      cy.get('[data-testid="step-2-company"]').type('Test Company');
      cy.get('[data-testid="next-button"]').click();
      
      // Should show complete button
      cy.get('[data-testid="complete-button"]').should('be.visible');
      cy.get('[data-testid="next-button"]').should('not.exist');
    });

    it('should mark completed steps', () => {
      // Complete step 1
      cy.get('[data-testid="step-1-name"]').type('John Doe');
      cy.get('[data-testid="step-1-email"]').type('john@example.com');
      cy.get('[data-testid="next-button"]').click();
      
      // Step 1 should be marked as completed
      cy.get('[data-testid="step-indicator-0"]').should('have.class', 'completed');
      cy.get('[data-testid="step-indicator-0"] .check-icon').should('be.visible');
    });

    it('should allow jumping to completed steps', () => {
      // Complete step 1
      cy.get('[data-testid="step-1-name"]').type('John Doe');
      cy.get('[data-testid="step-1-email"]').type('john@example.com');
      cy.get('[data-testid="next-button"]').click();
      
      // Complete step 2
      cy.get('[data-testid="step-2-company"]').type('Test Company');
      cy.get('[data-testid="next-button"]').click();
      
      // Click on step 1 indicator to jump back
      cy.get('[data-testid="step-indicator-0"]').click();
      cy.get('[data-testid="step-content-0"]').should('be.visible');
      
      // Data should be preserved
      cy.get('[data-testid="step-1-name"]').should('have.value', 'John Doe');
    });
  });

  describe('Form Integration', () => {
    beforeEach(() => {
      cy.visit('/contact'); // 假设有一个联系表单页面
    });

    it('should submit form with valid data', () => {
      cy.get('[data-testid="contact-name"]').type('John Doe');
      cy.get('[data-testid="contact-email"]').type('john@example.com');
      cy.get('[data-testid="contact-company"]').type('Test Company');
      cy.get('[data-testid="contact-phone"]').type('+1234567890');
      cy.get('[data-testid="contact-message"]').type('This is a test message for the contact form.');
      
      cy.get('[data-testid="contact-submit"]').click();
      
      cy.get('[data-testid="success-message"]').should('contain', 'Thank you for your message');
    });

    it('should show validation errors for empty form', () => {
      cy.get('[data-testid="contact-submit"]').click();
      
      cy.get('[data-testid="contact-name-error"]').should('contain', 'required');
      cy.get('[data-testid="contact-email-error"]').should('contain', 'required');
      cy.get('[data-testid="contact-message-error"]').should('contain', 'required');
    });

    it('should validate email format', () => {
      cy.get('[data-testid="contact-email"]').type('invalid-email');
      cy.get('[data-testid="contact-email"]').blur();
      
      cy.get('[data-testid="contact-email-error"]').should('contain', 'valid email');
    });

    it('should validate phone format', () => {
      cy.get('[data-testid="contact-phone"]').type('123');
      cy.get('[data-testid="contact-phone"]').blur();
      
      cy.get('[data-testid="contact-phone-error"]').should('contain', 'valid phone');
    });

    it('should show loading state during submission', () => {
      cy.get('[data-testid="contact-name"]').type('John Doe');
      cy.get('[data-testid="contact-email"]').type('john@example.com');
      cy.get('[data-testid="contact-message"]').type('Test message');
      
      cy.intercept('POST', '/api/contact', { delay: 2000 }).as('submitForm');
      
      cy.get('[data-testid="contact-submit"]').click();
      cy.get('[data-testid="contact-submit"]').should('be.disabled');
      cy.get('[data-testid="contact-submit"]').should('contain', 'Submitting');
      
      cy.wait('@submitForm');
    });

    it('should handle form submission errors', () => {
      cy.intercept('POST', '/api/contact', { statusCode: 500 }).as('submitFormError');
      
      cy.get('[data-testid="contact-name"]').type('John Doe');
      cy.get('[data-testid="contact-email"]').type('john@example.com');
      cy.get('[data-testid="contact-message"]').type('Test message');
      
      cy.get('[data-testid="contact-submit"]').click();
      
      cy.wait('@submitFormError');
      cy.get('[data-testid="error-message"]').should('contain', 'Something went wrong');
    });
  });

  describe('Accessibility', () => {
    it('should support keyboard navigation', () => {
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-testid', 'input-name');
      
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid', 'input-email');
      
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid', 'textarea-message');
    });

    it('should have proper ARIA labels', () => {
      cy.get('[data-testid="input-name"]').should('have.attr', 'aria-label');
      cy.get('[data-testid="checkbox-terms"]').should('have.attr', 'aria-describedby');
      cy.get('[data-testid="file-upload"]').should('have.attr', 'aria-label');
    });

    it('should announce validation errors to screen readers', () => {
      cy.get('[data-testid="input-email"]').type('invalid');
      cy.get('[data-testid="input-email"]').blur();
      
      cy.get('[data-testid="input-email-error"]').should('have.attr', 'role', 'alert');
    });

    it('should have proper focus management', () => {
      cy.get('[data-testid="input-name"]').focus();
      cy.get('[data-testid="input-name"]').should('be.focused');
      cy.get('[data-testid="input-name"]').should('have.class', 'focus:ring-2');
    });
  });
});