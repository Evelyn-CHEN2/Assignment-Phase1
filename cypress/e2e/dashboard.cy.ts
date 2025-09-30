describe('Dashboard', () => {
  const route = '/dashboard';
  function visitWithRole(role: 'super' | 'admin' | 'chatuser') {
    cy.intercept('GET', '**/api/fetchmembership*', {
      statusCode: 200,
      body: { _id: 'm1', role, admin: role === 'admin' ? 'u1' : '', groups: ['g1'] },
    }).as('fetchMembership');

    cy.visit(route, {
      onBeforeLoad(win) {
        // It is required if app reads from localStorage on init
        win.localStorage.setItem('currentUser', JSON.stringify({ _id: 'u1', username: 'eve' }));
      }
    });

    cy.wait('@fetchMembership');
  }

  // Display breadcrumb for super/admin
  it('should display breadcrumb for super', () => {
    visitWithRole('super');
    cy.get('nav[aria-label="breadcrumb"]').should('be.visible');
    cy.contains('a', 'Users').should('have.attr', 'routerLink', '/dashboard/users');
    cy.contains('a', 'Groups').should('have.attr', 'routerLink', '/dashboard/groups');
    cy.contains('a', 'Notifications').should('have.attr', 'routerLink', '/dashboard/notifications');
  });

  it('should display breadcrumb for admin', () => {
    visitWithRole('admin');
    cy.get('nav[aria-label="breadcrumb"]').should('be.visible');
    cy.contains('a', 'Users').should('have.attr', 'routerLink', '/dashboard/users');
    cy.contains('a', 'Groups').should('have.attr', 'routerLink', '/dashboard/groups');
    cy.contains('a', 'Notifications').should('have.attr', 'routerLink', '/dashboard/notifications');
  });

  // Does not display breadcrumb for chatuser
  it('does not show breadcrumb for chatusers', () => {
    visitWithRole('chatuser');

    cy.get('nav[aria-label="breadcrumb"]').should('not.exist');
  });

  it('should navigate to Users/Groups/Notifications when clicking', () => {
    visitWithRole('super');

    cy.contains('a', 'Users').should('be.visible').click();
    cy.url().should('include', '/dashboard/users');

    cy.contains('a', 'Groups').should('be.visible').click();
    cy.url().should('include', '/dashboard/groups');

    cy.contains('a', 'Notifications').should('be.visible').click();
    cy.url().should('include', '/dashboard/notifications');

  })
});