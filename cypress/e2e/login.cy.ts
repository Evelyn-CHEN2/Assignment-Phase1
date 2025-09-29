describe('Login', () => {
  const route = '/login';
  beforeEach(() => {
    cy.visit(route);
  });

  // Form validation
  it('should show validation errors when submitting empty form', () => {
    cy.contains('button', 'Log in').click();
    cy.get('form.group-form').should('have.class', 'was-validated');

    cy.contains('.invalid-feedback','Valid user name is required.').should('be.visible');
    cy.contains('.invalid-feedback','Valid password is required.').should('be.visible');
  });

  // Navigate to register page
  it('should navigate to /register when clicking the button', () => {
    cy.contains('button', 'Register').click();
    cy.url().should('include', '/register');
  });

  // Login
  it('should login with valid data on success', () => {
    cy.intercept('POST', '**/api/login', req => {
      expect(req.body.username).to.eq('eve');
      expect(req.body.pwd).to.eq('1234');

      req.reply({
        statusCode: 200,
        body: {
          _id: 'u1',
          username: req.body.username.trim(),
          email: 'eve@com',
          groups: ['g1'],
          valid: true,
          avatar: null,
        }
      });
    }).as('login');

    // Fill the form
    cy.get('input[name="username"]').type('eve');
    cy.get('input[name="pwd"]').type('1234');

    // Submit
    cy.contains('button', 'Log in').click();

    // Wait for calls & assert navigation
    cy.wait('@login');
    cy.url().should('include', '/account')
  })
});