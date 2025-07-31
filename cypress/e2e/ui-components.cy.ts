describe('UI Components', () => {
  beforeEach(() => {
    cy.visit('/ui-components');
    cy.waitForPageLoad();
  });

  it('should display the UI components showcase', () => {
    cy.contains('UI Components Showcase').should('be.visible');
    cy.contains('Complete set of reusable UI components').should('be.visible');
  });

  describe('Button Components', () => {
    it('should display all button variants', () => {
      cy.contains('Button Variants').should('be.visible');
      cy.contains('Primary Button').should('be.visible');
      cy.contains('Secondary Button').should('be.visible');
      cy.contains('Accent Button').should('be.visible');
      cy.contains('Success Button').should('be.visible');
    });

    it('should display button sizes', () => {
      cy.contains('Button Sizes').should('be.visible');
      cy.contains('Extra Small').should('be.visible');
      cy.contains('Small').should('be.visible');
      cy.contains('Medium').should('be.visible');
      cy.contains('Large').should('be.visible');
      cy.contains('Extra Large').should('be.visible');
    });

    it('should demonstrate loading state', () => {
      cy.contains('Click to Load').click();
      cy.contains('Loading...').should('be.visible');
      cy.wait(2000);
      cy.contains('Click to Load').should('be.visible');
    });

    it('should display icon buttons', () => {
      cy.contains('Icon Buttons').should('be.visible');
      cy.get('[role="button"]').should('have.length.greaterThan', 10);
    });

    it('should display button groups', () => {
      cy.contains('Button Groups').should('be.visible');
      cy.contains('Left').should('be.visible');
      cy.contains('Center').should('be.visible');
      cy.contains('Right').should('be.visible');
    });
  });

  describe('Form Components', () => {
    it('should display input fields', () => {
      cy.contains('Input Fields').should('be.visible');
      cy.get('input[placeholder="Enter your company name"]').should('be.visible');
      cy.get('input[type="email"]').should('be.visible');
      cy.get('input[type="tel"]').should('be.visible');
    });

    it('should display textarea', () => {
      cy.contains('Textarea').should('be.visible');
      cy.get('textarea').should('be.visible');
    });

    it('should display select dropdown', () => {
      cy.contains('Select Dropdown').should('be.visible');
      cy.get('select').should('be.visible');
    });

    it('should display checkboxes', () => {
      cy.contains('Checkboxes').should('be.visible');
      cy.get('input[type="checkbox"]').should('have.length.greaterThan', 0);
    });

    it('should display radio buttons', () => {
      cy.contains('Radio Buttons').should('be.visible');
      cy.get('input[type="radio"]').should('have.length.greaterThan', 0);
    });

    it('should display file upload', () => {
      cy.contains('File Upload').should('be.visible');
      cy.contains('Drop files here or click to upload').should('be.visible');
    });
  });

  describe('Loading Spinners', () => {
    it('should display loading spinners in different sizes', () => {
      cy.contains('Loading Spinners').should('be.visible');
      cy.contains('Extra Small').should('be.visible');
      cy.contains('Small').should('be.visible');
      cy.contains('Medium').should('be.visible');
      cy.contains('Large').should('be.visible');
    });

    it('should display loading spinners in different colors', () => {
      cy.contains('Primary').should('be.visible');
      cy.contains('Secondary').should('be.visible');
      cy.contains('White').should('be.visible');
      cy.contains('Gray').should('be.visible');
    });
  });

  describe('Complete Form Example', () => {
    it('should display the complete form', () => {
      cy.contains('Complete Form Example').should('be.visible');
      cy.contains('LED Display Inquiry Form').should('be.visible');
    });

    it('should have all form fields', () => {
      cy.get('input[placeholder="John Doe"]').should('be.visible');
      cy.get('input[placeholder="Your Company Ltd."]').should('be.visible');
      cy.get('input[placeholder="john@company.com"]').should('be.visible');
      cy.get('input[placeholder="+1 (555) 123-4567"]').should('be.visible');
      cy.get('select').should('be.visible');
      cy.get('textarea').should('be.visible');
    });

    it('should have radio buttons for budget range', () => {
      cy.contains('Budget Range').should('be.visible');
      cy.contains('Under $10,000').should('be.visible');
      cy.contains('$10,000 - $50,000').should('be.visible');
      cy.contains('Over $100,000').should('be.visible');
    });

    it('should have submit and save buttons', () => {
      cy.contains('Submit Inquiry').should('be.visible');
      cy.contains('Save Draft').should('be.visible');
    });
  });

  describe('Responsive Design', () => {
    it('should be responsive on mobile', () => {
      cy.viewport(375, 667);
      cy.contains('UI Components Showcase').should('be.visible');
      cy.get('.grid').should('exist');
    });

    it('should be responsive on tablet', () => {
      cy.viewport(768, 1024);
      cy.contains('UI Components Showcase').should('be.visible');
      cy.get('.grid').should('exist');
    });
  });

  describe('Interactions', () => {
    it('should allow typing in input fields', () => {
      cy.get('input[placeholder="Enter your company name"]').type('Test Company');
      cy.get('input[placeholder="Enter your company name"]').should('have.value', 'Test Company');
    });

    it('should allow selecting from dropdown', () => {
      cy.get('select').first().select('Fine Pitch LED Display');
      cy.get('select').first().should('have.value', 'fine-pitch');
    });

    it('should allow checking checkboxes', () => {
      cy.get('input[type="checkbox"]').first().check();
      cy.get('input[type="checkbox"]').first().should('be.checked');
    });

    it('should allow selecting radio buttons', () => {
      cy.get('input[type="radio"]').first().check();
      cy.get('input[type="radio"]').first().should('be.checked');
    });
  });
});