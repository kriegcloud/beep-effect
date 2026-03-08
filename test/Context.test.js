import assert from 'assert'
import { describe, it } from 'mocha'
import Context from '../lib/Context.js'
import { schema } from './support/namespace.js'
import rdf from './support/factory.js'

describe('Context', () => {
  describe('out', () => {
    it('can be called without language', () => {
      const context = new Context({ dataset: rdf.dataset() })

      assert.doesNotThrow(() => {
        context.out([schema.knows])
      })
    })
  })
})
