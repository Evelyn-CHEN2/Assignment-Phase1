describe('Chatwindow', () => {
  const route = '/chatwindow/c11';
  const currentUser = { _id: 'u1', username: 'tom', email: 'tom@com', groups: ['g1', 'g2'] };
  beforeEach(() => {
    // Mock membership
    cy.intercept('GET', '**/api/fetchmembership*', {
      statusCode: 200,
      body: { _id: 'm1', role: 'admin', admin: 'u1', groups: ['g1', 'g2']}
    }).as('fetchMembership');

    cy.intercept('GET', '**/api/allchannels', {
      statusCode: 200,
      body: [
        { _id: 'c11', channelname: 'general', groupId: 'g1', chatMsg: [] },
        { _id: 'c12', channelname: 'examples', groupId: 'g1', chatMsg: [] },
      ],
    }).as('getChannels');

    cy.intercept('GET', '**/api/fetchallusers', {
      statusCode: 200,
      body: [
        { _id: 'u1', username: 'tom', avatar: 'data:image/png;base64,xxx', isSuper: false },
        { _id: 'u2', username: 'jerry', avatar: 'data:image/png;base64,xxx', isSuper: false },
      ],
    }).as('getUsers');

    cy.intercept('GET', '**/api/fetchchatmessages/c11', {
      statusCode: 200,
      body: [
        { _id: 'm1', sender: 'u2', message: 'Hello!', timestamp: new Date().toISOString() },
        { _id: 'm2', sender: 'u1', message: 'Hi!', timestamp: new Date().toISOString() }
      ]
    }).as('fetchMsgs'); 

    cy.visit(route, {
      onBeforeLoad(win) {
        win.localStorage.setItem('currentUser', JSON.stringify({ _id: 'u1', isSuper: true }));
      }
    });

    cy.wait(['@fetchMembership', '@getChannels', '@getUsers', '@fetchMsgs']);
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

  it('should send a message and display it', () => {
    cy.get('input[name="message"]').type('Hi!');
    cy.get('form.chat-input').submit();
    cy.get('.msg-bubble .msg-text').last().should('contain.text', 'Hi!')  // contain.text equals to include.text, have.text is strict match
  });

  it('should open ban modal when clicking user avatar', () => {
    cy.intercept('POST', '**/api/banuserbyID/*', { statusCode: 200, body: {}}).as('banUser');
    // Open modal
    cy.get('.msg-avatar').should('exist').first().click();
    cy.get('#confirmBanModal').should('be.visible');
    cy.get('#confirmBanLabel').should('contain.text', 'Are you sure to ban');

    // Confirm ban
    cy.contains('button', 'Ban').click();
    cy.wait('@banUser');
  });
});



// cy.get is used to select elements by CSS selectors (input, modal, id, class)
// cy.contains is used to verify text (label, button, error messages)