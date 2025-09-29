describe('Chatwindow', () => {
  const route = '/chatwindow/c11';
  beforeEach(() => {
    window.localStorage.setItem('currentUser', JSON.stringify({ _id: 'u1', username: 'eve' }))
    // Mock membership
    cy.intercept('GET', '**/api/fetchmembership*', {
      statusCode: 200,
      body: { _id: 'm1', role: 'chatuser', admin: 'u1', groups: ['g1', 'g2']}
    });
    // Mock chat message
    cy.intercept('GET', '**/api/fetchchatmessages/c11', {
      statusCode: 200,
      body: [
        { _id: 'm1', sender: 'u2', message: 'Hello!', timestamp: new Date().toISOString() },
        { _id: 'm2', sender: 'u1', message: 'Hi!', timestamp: new Date().toISOString() }
      ]
    });

    cy.visit(route)
  });

  // Go back to last page
  it('should go back to account page when clicking on icon', () => {
    cy.get('button.back-btn').click();
    cy.url().should('include', '/account');
  });

  it('shoud display messages in the chat body', () => {
    cy.get('.msg-list .msg').should('have.length.at.least', 1);
    cy.get('.msg-bubble .msg-text').first().should('contain.text', 'Hello');
  });

  it('should send a message', () => {
    cy.get('input[name="message"]').type('Hi!');
    cy.get('form.chat-input').submit();
    cy.get('.msg-bubble .msg-text').last().should('contain.text', 'Hi!')  // contain.text equals to include.text, have.text is strict match
  });

  it('should open ban modal when clicking user avatar', () => {
    // Open modal
    cy.get('.msg-avatar').first().click();
    cy.get('#confirmBanModal').should('be.visible');
    cy.get('#confirmBanLabel').should('contain.text', 'Are you sure to ban');

    // Confirm ban
    cy.contains('button', 'Ban').click();

    // Assert modal closes
    cy.get('#confirmBanModal').should('not.be.visible');
  });
});



// cy.get is used to select elements by CSS selectors (input, modal, id, class)
// cy.contains is used to verify text (label, button, error messages)