import Environment from '@rdfjs/environment/Environment.js'
import { expect } from 'chai'
import { RdfineFactory } from '../environment.js'

describe('environment', () => {
  it('creates an empty environment', () => {
    // given
    const env = new Environment([
      RdfineFactory,
    ])

    // then
    expect(Object.keys(env.rdfine)).to.contain.all.members(['Resource'])
  })
})
