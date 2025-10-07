describe('My First Test', () => {
  it.skip('Visits the initial project page', () => {
    cy.visit('/')
    cy.contains('app is running')
  })
})
