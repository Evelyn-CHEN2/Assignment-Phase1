describe('Notifications', () => {
  const route = '/dashboard/notifications';
  const currentUser = { _id: 'u1', username: 'eve', email: 'eve@com', groups: ['g1', 'g2'], isSuper: true };

  beforeEach(() => {
    cy.intercept(
      { method: 'GET', url: '**/api/fetchmembership*', query: { userId: 'u1' } },
      { statusCode: 200, body: { _id: 'm1', role: 'super', admin: 'u1', groups: []} }
    ).as('fetchMembership');

    cy.intercept('GET', '**/api/fetchallusers', {
      statusCode: 200,
      body: [
        { _id: 'u1', username: 'tom' },
        { _id: 'u2', username: 'jerry' },
        { _id: 'u3', username: 'eve' },
      ],
    }).as('getUsers');

    cy.intercept('GET', '**/api/allgroups', {
      statusCode: 200,
      body: [
        { _id: 'g1', groupname: 'Data', description: 'Data group', channels: ['c1', 'c2'], createdBy: 'u1'},
        { _id: 'g2', groupname: 'AI', description: 'AI group', channels: ['c3'], createdBy: 'u2' },
        { _id: 'g3', groupname: 'Sdp', description: 'advice', channels: [], createdBy: 'u3' },
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

    cy.intercept('GET', '**/api/fetchnotifications', {
      statusCode: 200,
      body: [
        { _id: 'n1', applier: 'u3', groupToApply: 'g1', status: 'pending', approvedBy: '', timestamp: new Date() },
        { _id: 'n2', applier: 'u3', groupToApply: 'g3', status: 'approved', approvedBy: 'u2', timestamp: new Date() },
      ]
    }).as('fetchNotifications');

    cy.intercept('GET', '**/api/fetchallreports', {
      statusCode: 200,
      body: [
        { _id: 'b1', userId: 'u3', channelIds: ['c1'] },
        { _id: 'b2', userId: 'u3', channelIds: ['c2'] },
      ]
    }).as('fetchBanReports');

    cy.visit(route, {
      onBeforeLoad(win) {
        win.localStorage.setItem('currentUser', JSON.stringify(currentUser));
      }
    });

    cy.wait(['@getUsers', '@fetchMembership', '@fetchNotifications', '@fetchBanReports']);
  });

  it('should render notifications and banreports', () => {
    cy.get('ul.notif-list .notif-card').should('have.length', 2);

    // First notification
    cy.get('ul.notif-list .notif-card').eq(0).within(() => {
      cy.contains('Group: Data').should('be.visible');
      cy.contains('Applier: Eve').should('be.visible');
      cy.get('.status-pill').should('contain.text', 'pending');
      cy.get('button.btn-approve').should('be.enabled');
    });

    // Second notification
    cy.get('ul.notif-list .notif-card').eq(1).within(() => {
      cy.contains('Group: Sdp').should('be.visible');
      cy.contains('Applier: Eve').should('be.visible');
      cy.contains('By: Jerry').should('be.visible');
      cy.get('.status-pill').should('contain.text', 'approved');
      cy.get('button.btn-approve').should('be.disabled');
    });
  });

  it('opens approve modal and confirms for a pending notification', () => {
    cy.intercept('PUT', '**/api/addgrouptouser', {statusCode: 204}).as('approve');

    cy.get('ul.notif-list .notif-card').eq(0).within(() => {
      cy.get('button.btn-approve').click();
    });

    cy.get('#approveApplicationModal').contains('strong', 'Eve').should('be.visible');
    cy.get('#approveApplicationLabel').should('contain.text', 'Are you sure to approve');
    cy.get('#approveApplicationModal').within(() => {
      cy.contains('button', 'Confirm').click();
    });

    cy.wait('@approve');
    cy.get('#approveApplicationModal').should('not.be.visible');
  });

  it('deletes a notification', () => {
    cy.intercept('DELETE', '**/api/deletenotification/n1', {statusCode: 204}).as('deleteNotification');
    cy.get('ul.notif-list .notif-card').eq(0).within(() => {
      cy.get('button.btn-delete').click();
    });

    cy.get('#deleteApplicationModal').should('be.visible');
    cy.get('#deleteApplicationLabel').should('contain.text', 'Are you sure to delete');
    cy.get('#deleteApplicationModal').within(() => {
      cy.contains('button', 'Delete').click();
    });

    cy.wait('@deleteNotification');
    cy.get('#deleteApplicationModal').should('not.be.visible');
  })

  it('displays banned user information', () => {
    cy.get('.banned-list').should('be.visible');
    cy.get('.banned-list .badge').first().should('contain.text', 2);

    cy.get('.banned-list .banned-item').should('have.length', 2);
    cy.get('.banned-list').within(() => {
      cy.contains('Banned').should('be.visible');
      cy.contains('general').should('be.visible');
      cy.contains('examples').should('be.visible');
    });
  });

  it('opens unban modal and confirms', () => {
    cy.intercept('PUT', '**/api/unbanuserbyID/u3', { statusCode: 204}).as('unBan');

    cy.get('.banned-list .banned-item').first().within(() => {
      cy.contains('general').click();
    });

    cy.get('#confirmUnbanModal').contains('strong', 'Eve').should('be.visible');
    cy.get('#confirmUnbanLabel').should('contain.text', 'Are you sure to release')
    cy.contains('#confirmUnbanModal', 'Confirm').click();

    cy.wait('@unBan');
    cy.get('#confirmUnbanModal').should('not.be.visible')
  })
});