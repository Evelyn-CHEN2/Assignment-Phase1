describe('Users', () => {
  const route = '/dashboard/users';
  const currentUser = { _id: 'u1', username: 'tom', email: 'tom@com', groups: ['g1', 'g2'], isSuper: true };

  beforeEach(() => {
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
        { _id: 'u3', username: 'zoe', email: 'zoe@com', groups:['g1'] },                            
        currentUser,
        { _id: 'u2', username: 'jerry', email: 'jerry@com', groups: ['g2'] }
      ]
    }).as('getUsers');

    cy.intercept('GET', '**/api/fetchmembership*', (req) => {
      const url = new URL(req.url);
      const id = url.searchParams.get('userId');
      if (id === 'u1') {
        req.reply({ statusCode: 200, body: { _id: 'm-u1', role: 'super', groups: ['g1','g2'] } });
      } else if (id === 'u2') {
        req.reply({ statusCode: 200, body: null });
      } else if (id === 'u3') {
        req.reply({ statusCode: 200, body: null });
      } 
    }).as('fetchMembership');

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

  it('updates a user role on success', () => {
    cy.contains('table tbody tr', /jerry/).within(() => {
      cy.contains('button', 'jerry').click();
    });

    cy.get('tr.table-active').within(() => {
      cy.get('button.roles-badge').click();
      cy.get('.update-role-pop').should('be.visible');

      cy.get('.update-role-pop select.form-select').select('admin');

      // Mock backend
      cy.intercept('PUT', '**/api/updateuser/*', (req) => {
        const url = new URL(req.url);
        expect(url.pathname.split('/').pop()).to.eq('u2');
        expect(req.body.groupId).to.eq('g2');
        expect(req.body.newRole).to.eq('admin');
        req.reply({ statusCode: 204 });
      }).as('updateRole');

      cy.contains('.update-role-pop button', 'Update').click();
    });

    // Confirm in modal
    cy.get('#confirmUpdateModal').should('be.visible').within(() => {
      cy.contains('button', 'Confirm').click();
    });
    cy.wait('@updateRole');

    // Update UI
    cy.get('tr.table-active').within(() => {
      cy.get('button.roles-badge').should('contain.text', 'admin');
    });
  });

  it('removes a user from a group', () => {
    cy.contains('table tbody tr', /zoe/).within(() => {
      cy.contains('button', 'zoe').click();
    });

    cy.get('tr.table-active').first().within(() => {
      cy.get('button.btn.btn-m.text-danger.p-0:has(i.bi-person-x)').click();
    });

    cy.intercept(
      {method: 'DELETE', url: '**/api/removeuserfromgroup*', query: { userId: 'u3', groupId: 'g1'}},
      {statusCode: 204}
    ).as('removeUserFromGroup');

    cy.get('#confirmRemoveModal').should('be.visible').within(() => {
      cy.contains('button', 'Remove').click();
    });
    cy.get('#confirmRemoveModal').contains('strong', 'User:').should('be.visible')
    cy.wait('@removeUserFromGroup');

    cy.get('tr.table-active').should('have.length', 0);
  });

})