import React from 'react'
import Component from '../../src/Component'

describe('<Component />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<Component label="Label" value="Hello there" />)
    cy.get('#label').should('have.text', 'Label')
    cy.get('#input').should('have.value', 'Hello there')
  })
})