describe('GroupForm', () => {
  const route = '/dashboard/group-form';
  beforeEach(() => {
    cy.intercept(
      { method: 'GET', url: '**/api/fetchmembership*', query: { userId: 'u1' } },
      { statusCode: 200, body: { _id: 'm1', role: 'admin', admin: 'u1', groups: ['g1', 'g3'] } }
    ).as('getMembership');
    cy.visit(route, {
      onBeforeLoad(win) {
        win.localStorage.setItem('currentUser', JSON.stringify({ _id: 'u1', isSuper: false }));
      }
    });
  })

  it('should show client-side validation when submitting', () => {
    cy.contains('button', 'Create').click();

    cy.get('form.group-form').should('have.class', 'was-validated');
    cy.contains('.invalid-feedback', 'Group name is required.').should('be.visible');
    cy.contains('.invalid-feedback', 'Group description is required.').should('be.visible');
    cy.contains('.invalid-feedback', 'Add at least one channel.').should('be.visible');
  });

  it('should create a group and navigate to /dashboard/groups', () => {
    // Use intercept to mock backend
    cy.intercept('POST', '**/api/creategroup', req => {
      // Assert payload from the form
      expect(req.body.userId).to.eq('u1');
      expect(req.body.groupname).to.eq('Test group name');
      expect(req.body.description).to.eq('Test group description');
      expect(req.body.channelNames).to.deep.eq(['channel1', 'channel2']);

      // Respond success
      req.reply({
        statusCode: 200,
        body: {
          _id: 'g1',
          groupname: req.body.groupname,
          description: req.body.description,
          channelNames: req.body.channels,
          createdBy: 'u1'
        }
      });
    }).as('createGroup');
    // Fill the form
    cy.get('input[name="groupname"]').type('Test group name');
    cy.get('textarea[name="description"]').type('Test group description');
    cy.get('textarea[name="channelnames"]').type('channel1{enter}channel2');

    // Submit
    cy.contains('button', 'Create').click();

    // Wait for calls & assert navigation
    cy.wait('@createGroup');

    cy.url().should('include', '/dashboard/groups');
  })
});