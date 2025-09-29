describe('Groups', () => {
  const route = '/dashboard/groups';
  const currentUser = { _id: 'u1', username: 'tom', email: 'tom@com', groups: ['g1', 'g3'] };

  beforeEach(() => {
    cy.intercept('GET', '**/api/allgroups', {
      statusCode: 200,
      body: [
        {
          _id: 'g1',
          groupname: 'Data',
          description: 'Data group',
          channels: [
            { _id: 'c1', channelname: 'general' },
            { _id: 'c2', channelname: 'examples' },
          ],
          createdBy: 'u1',
        },
        {
          _id: 'g2',
          groupname: 'AI',
          description: 'AI group',
          channels: [{ _id: 'c3', channelname: 'reports' }],
          createdBy: 'u2',
        },
        {
          _id: 'g3',
          groupname: 'Sdp',
          description: 'advice',
          channels: [],
          createdBy: 'u3',
        },
      ],
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

    cy.intercept(
      { method: 'GET', url: '**/api/fetchmembership*', query: { userId: 'u1' } },
      { statusCode: 200, body: { _id: 'm1', role: 'admin', admin: 'u1', groups: ['g1', 'g2']} }
    ).as('fetchMembership');

    cy.intercept('GET', '**/api/fetchallusers', {
      statusCode: 200,
      body: [
        { _id: 'u1', username: 'tom' },
        { _id: 'u2', username: 'jerry' },
        { _id: 'u3', username: 'eve' },
      ],
    }).as('getUsers');

    cy.visit(route, {
      onBeforeLoad(win) {
        win.localStorage.setItem('currentUser', JSON.stringify(currentUser));
      }
    });

    cy.wait(['@getGroups', '@getChannels', '@fetchMembership', '@getUsers']);
    cy.get('.card-title').should('have.length.at.least', 1);
  })

  it('should display button to swipe between groups and admin groups', () => {
    // Admin only button
    cy.get('button.back-btn').should('be.visible');
    cy.contains('button.btn-admin', 'Admin Groups').should('be.visible');

    // Click to display admin groups
    cy.contains('button.btn-admin', 'Admin Groups').click().should('be.disabled');
    cy.get('button.back-btn').should('not.be.disabled');

    // Click to display all groups
    cy.get('button.back-btn').click().should('be.disabled');
    cy.contains('button.btn-admin', 'Admin Groups').should('not.be.disabled');
  });

  it('opens edit group modal and pre-fills group name', () => {
    cy.contains('.card-title a', 'Data').click();
    cy.get('#editGroupModal').should('be.visible');
    cy.get('#editGroupModal input[name="groupname"]').should('have.value', 'Data');

    cy.intercept('PUT', '**/api/editgroup/*', req => {
      expect(req.body.newGroupName).to.eq('Data2');
      const url = new URL(req.url);
      expect(url.pathname.split('/').pop()).to.eq('g1');

      req.reply({statusCode: 204})
    }).as('editGroup');

    // Fill the form
    cy.get('#editGroupModal input[name="groupname"]').clear().type('Data2');
    cy.get('#editGroupModal button.btn-primary').click();
    cy.wait('@editGroup');

    // Update UI
    cy.contains('.card-title a', 'Data2').should('be.visible')
  });

  it('deletes a group after confirm', () => {
    cy.contains('.card', 'Data')
      .find('button.btn.text-danger.p-0:has(i.bi-dash-circle-dotted)')
      .should('be.visible')
      .click();
    cy.get('#confirmDeleteGroupModal').should('be.visible');
    cy.get('#confirmDeleteGroupModal').contains('strong', 'Group: Data').should('be.visible');

    cy.intercept('DELETE', '**/api/deletegroup/*', { statusCode: 204 }).as('deleteGroup');
    cy.get('#confirmDeleteGroupModal .btn-danger').click();
    cy.wait('@deleteGroup');

    cy.contains('.card-title', 'Data').should('not.exist');
    cy.contains('.card-title', 'AI').should('exist');
  });

  it('deletes a channel of a group', () => {
    cy.contains('.card', 'Data')
      .find('li:contains("general") button.btn-link.text-danger.p-0:has(i.bi-dash-lg)')
      .should('be.visible')
      .click();

    cy.get('#confirmDeleteChannelModal').should('be.visible');
    cy.get('#confirmDeleteChannelModal').contains('strong', 'Channel: general').should('be.visible');

    cy.intercept('DELETE', '**/api/deletechannel/*', { statusCode: 204 }).as('deleteChannel');
    cy.get('#confirmDeleteChannelModal .btn-danger').click();
    cy.wait('@deleteChannel');

    cy.contains('.card', 'Data').find('li').contains('general').should('not.exist');
  });

  it('adds a channel to a group', () => {
    cy.contains('.card', 'Data').within(() => {
      cy.get('button.add-btn').should('be.visible').click();
  
      cy.get('.add-pop').should('be.visible')
      cy.get('.add-pop input[placeholder="New channel name"]').type('new channel');
  
      cy.intercept('POST', '**/api/createchannel', {
        statusCode: 200,
        body: { _id: 'c9', channelname: 'new channel' }
      }).as('createChannel');
  
      cy.contains('.add-pop button', 'Confirm').click();
    });
      cy.wait('@createChannel');
      cy.contains('li', 'new channel').should('exist');
  });

  it('displays pending state after applying to join a group user not in', () => {
    cy.intercept('POST', '**/api/**', { statusCode: 200 }).as('applyToJoin');

    cy.contains('.card', 'AI').within(() => {
      cy.get('button.btn:has(i.bi-suit-heart-fill)')
        .should('not.be.disabled')
        .click();

      cy.wait('@applyToJoin');
      cy.get('button.btn:has(i.bi-hourglass-split)').should('be.disabled');
    });

  });

  it('adds more groups to display when clicking more', () => {
    cy.contains('button', 'More').should('be.visible').click();
    cy.contains('.card', 'Sdp').should('be.visible');

    // Reset
    cy.get('button:has(i.bi-arrow-bar-up)').should('be.visible').click();
    cy.contains('.card', 'Sdp').should('not.exist');
  });

  it('sorts groups when clicking the sort button', () => {
    const titles = () =>
      cy.get('.card-title').then($t => [...$t].map(el => el.textContent?.trim()));
  
    titles().then(before => {
      cy.get('button.btn:has(i.bi-arrow-down-up)').click();
      titles().should(after => {
        expect(after.join('|')).not.to.eq(before.join('|'));
      });
    });
  });
});