describe('Register', () => {
  const route = '/register';
  beforeEach(() => {
    cy.visit(route);
  })

  // Form validation
  it('should show validation errors when submitting empty form', () => {
    cy.contains('button', 'Register').click();
    cy.get('form.group-form').should('have.class', 'was-validated');

    cy.contains('.invalid-feedback','Valid user name is required.').should('be.visible');
    cy.contains('.invalid-feedback','Valid email is required.').should('be.visible');
    cy.contains('.invalid-feedback','Please choose at least one group.').should('be.visible');
    cy.contains('.invalid-feedback','Password is required').should('be.visible');
  });

  // Reset form
  it('should reset form when clicking reset button', () => {
    cy.get('input[name="username"]').type('eve');
    cy.get('input[name="email"]').type('eve@com');
    cy.get('input[name="groups"]').type('engineering');
    cy.get('input[name="pwd"]').type('1234');

    cy.contains('button', 'Reset').click();

    cy.get('input[name="username"]').should('have.value', '');
    cy.get('input[name="email"]').should('have.value', '');
    cy.get('input[name="groups"]').should('have.value', '');
    cy.get('input[name="pwd"]').should('have.value', '');
  });

  // Register 
  it('should register with valid data on success', () => {
    // Use intercept to mock backend
    cy.intercept('POST', '**/api/register', req => {
      // Assert payload from the register
      expect(req.body.username).to.eq('eve');
      expect(req.body.email).to.eq('eve@com');
      expect(req.body.pwd).to.eq('1234');

      // Respond success
      req.reply({
        statusCode: 200,
        body: {
          _id: 'u1',
          username: req.body.username.trim(),
          email: req.body.email.trim(),
          groups: [],
          valid: true,
          avatar: null,
          isSuper: false
        }
      })
    }).as('register');

    // Fill the form
    cy.get('input[name="username"]').type('eve');
    cy.get('input[name="email"]').type('eve@com');
    cy.get('input[name="groups"]').type('engineering');
    cy.get('input[name="pwd"]').type('1234');

    // Submit
    cy.contains('button', 'Register').click();

    // Wait for calls & assert navigation
    cy.wait('@register');
    cy.url().should('include', '/account')
  })
});