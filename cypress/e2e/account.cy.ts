describe('account', () => {
  const route = '/account';
  const currentUser = { _id: 'u1', username: 'eve', email: 'eve@com', groups: ['g1', 'g2'] };

  beforeEach(() => {
    cy.intercept('GET', '**/api/allgroups', {
      statusCode: 200,
      body: [
        { _id: 'g1', groupname: 'Data', description: '' },
        { _id: 'g2', groupname: 'AI',   description: '' },
        { _id: 'g3', groupname: 'Other',description: '' },
      ]
    }).as('getGroups');

    cy.intercept('GET', '**/api/allchannels', {
      statusCode: 200,
      body: [
        { _id: 'c1', channelname: 'general', groupId: 'g1' },
        { _id: 'c2', channelname: 'examples', groupId: 'g1' },
        { _id: 'c3', channelname: 'reports',  groupId: 'g2' },
        { _id: 'c4', channelname: 'advice',   groupId: 'g3' },
      ]
    }).as('getChannels');

    cy.intercept('GET', '**/api/fetchallusers', {
      statusCode: 200,
      body: [
        currentUser,                                 
        { _id: 'u2', username: 'tom', email: 'tom@com', avatar: '', groups: ['g1', 'g3'], isSuper: false },
        { _id: 'u3', username: 'jerry', email: 'jerry@com', avatar: '', groups: ['g2'], isSuper: true  },
      ]
    }).as('getUsers');

    cy.intercept(
      { method: 'GET', url: '**/api/fetchmembership*', query: { userId: 'u1' } },
      { statusCode: 200, body: null }
    ).as('fetchMembership');

    cy.intercept('GET', '**/api/fetchallreports', {
      statusCode: 200,
      body: [
        { _id: 'b1', userId: 'u1', channelIds: ['c1'] },
        { _id: 'b2', userId: 'u1', channelIds: ['c2'] },
      ]
    }).as('getBanReports');

    cy.visit(route, {
      onBeforeLoad(win) {
        win.localStorage.setItem('currentUser', JSON.stringify(currentUser));
      }
    });

    cy.wait(['@getGroups', '@getChannels', '@getUsers', '@fetchMembership', '@getBanReports']);
  });

  it('should render groups/channels and apply banned state', ()=> {
    // Only load user groups
    cy.contains('.group-item', 'Data').should('exist');
    cy.contains('.group-item', 'AI').should('exist');
    cy.contains('.group-item', 'Other').should('not.exist');

    // Show unbanned channels
    cy.contains('.group-item', 'AI').within(() => {
      cy.contains('.chip', 'reports').should('exist').and('not.be.disabled');
    });

    // Disable banned channels
    cy.contains('.group-item', 'Data').within(() => {
      cy.contains('.chip', 'general').should('exist').and('be.disabled').find('i.bi-ban').should('exist');;
      cy.contains('.chip', 'examples').should('exist').and('be.disabled').find('i.bi-ban').should('exist');;
    });

    cy.get('[data-role]').should('have.attr', 'data-role', 'chatuser');
    cy.contains('.text-danger', '*').should('not.exist');
  })

  it('should render header with user name when no avatar', () => {
    cy.get('.account-header .avatar-img').should('exist').and('not.have.attr', 'src');
    cy.contains('.account-title', 'eve').should('be.visible');
    cy.contains('.user-email', 'eve@com').should('be.visible');
    cy.get('.header-actions .roles-badge').should('contain.text', 'chatuser');
  });

  it('opens profile edit modal and uploads avatar', () => {
    // Open modal
    cy.get('.header-actions .roles-badge--btn').first().click();
    cy.get('#changeProfileModal').should('be.visible');

    cy.intercept('POST', '**/api/uploadavatar/*/avatar', {
      statusCode: 200,
      body: { avatar: 'data:image/png;base64,iVBORw0KGgoAAA...' },
    }).as('uploadAvatar');

    const tinyPng =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO0OQ0YAAAAASUVORK5CYII=';
    const blob = Cypress.Blob.base64StringToBlob(tinyPng, 'image/png');

    cy.get('#changeProfileModal input[type="file"]').selectFile(
      { contents: blob, fileName: 'avatar.png', mimeType: 'image/png' },
      { force: true }
    );

    // Save
    cy.contains('button', 'Save').click();
    cy.wait('@uploadAvatar');

    // Update UI
    cy.get('.account-header img.avatar-img').should('have.attr', 'src');
  });

  it('opens delete user confirmation modal', () => {
    cy.contains('button', 'Remove').click();
    cy.get('#confirmDeleteModal').should('be.visible');
    cy.get('#confirmDeleteLabel').should('contain.text', 'delete your account');

    // Mock backend
    cy.intercept('DELETE', '**/api/deleteuser/u1', 
      { statusCode: 204 }
    ).as('deleteUser');

    // Confirm
    cy.contains('button', 'Delete').click();
    cy.wait('@deleteUser');

    cy.url().should('include', '/login');
  });

  it('opens leave group confirmation modal', () => {
    cy.intercept(
      { method: 'DELETE', url: '**/api/leavegroup*', query: { userId: 'u1', groupId: 'g1'} },
      { statusCode: 204 }
    ).as('leaveGroup');
    
    cy.contains('.group-item', 'Data').find('button.btn i.bi-box-arrow-right').click();

    cy.get('#confirmLeaveGroupModal').contains('strong', 'Data').should('be.visible');
    cy.get('#confirmLeaveGroupLabel').should('contain.text', 'Are you sure to leave Group');

    // Confirm
    cy.contains('button', 'Leave').click();
    cy.wait('@leaveGroup');

    cy.contains('.group-item', 'Data').should('not.exist');
    cy.contains('.group-item', 'AI').should('exist');
    cy.contains('.group-item', 'Other').should('not.exist');
  });
});