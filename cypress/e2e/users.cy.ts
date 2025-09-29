describe('Users', () => {
  const route = '/dashboard/users';
  const currentUser = { _id: 'u1', username: 'tom', email: 'tom@com', groups: ['g1', 'g2'], isSuper: true };

  beforeEach(() => {
    cy.intercept('**/api/**', (req) => {
      Cypress.log({ name: 'API', message: `${req.method} ${req.url}` });
    }).as('anyApi');
    
    cy.intercept('GET', '**/api/allgroups', {
      statusCode: 200,
      body: [
        { _id: 'g1', groupname: 'Data', description: 'Data group' },
        { _id: 'g2', groupname: 'AI', description: 'AI group' },
        { _id: 'g3', groupname: 'Sdp', description: 'advice' }
      ],
    }).as('getGroups');

    cy.intercept('GET', '**/api/fetchallusers', {
      statusCode: 200,
      body: [
        currentUser,                                 
        { _id: 'u2', username: 'tom', email: 'tom@com', groups: ['g1', 'g2'] },
        { _id: 'u3', username: 'jerry', email: 'jerry@com', groups: ['g2'] },
        { _id: 'u4', username: 'zoe', email: 'zoe@com', groups: ['g1'] },
      ]
    }).as('getUsers');

    cy.intercept(
      { method: 'GET', url: '**/api/fetchmembership*', query: { userId: 'u1' } },
      { statusCode: 200, body: { _id: 'm1', role: 'super', admin: 'u1'} }
    ).as('fetchMembership');

    cy.visit(route, {
      onBeforeLoad(win) {
        win.localStorage.setItem('currentUser', JSON.stringify(currentUser));
      }
    });
    cy.wait(['@getGroups', '@getUsers', '@fetchMembership']);
  });

  it('sorts users when clicking the sort button', () => {
    const users = () =>
      cy.get('table tbody tr').then($rows => [...$rows].map(r => r.querySelector('td:nth-child(2)')?.textContent?.trim()));
  
    users().then(before => {
      cy.get('button.btn:has(i.bi-arrow-down-up)').click();
      users().should(after => {
        expect(after.join('|')).not.to.eq(before.join('|'));
      });
    });
  });

  it('expands a user to show groups and shows role in each group', () => {
    cy.contains('table tbody tr', /jerry/).within(() => {
      cy.contains('button', 'jerry').click();
    });

    cy.get('tr.table-active').should('exist').within(() => {
      cy.contains('span', 'AI').should('be.visible');
      cy.get('button.roles-badge')
        .should('be.visible');
    });
  });
})