import { strictEqual } from 'assert'
import Environment from '@rdfjs/environment'
import { describe, it } from 'mocha'
import Factory from '../Factory.js'
import Traverser from '../Traverser.js'

const env = new Environment([Factory])

describe('TraverserFactory', function () {
  describe('.traverser', () => {
    it('should be a method', () => {
      strictEqual(typeof env.traverser, 'function')
    })

    it('should return a Traverser instance', () => {
      const traverser = env.traverser()

      strictEqual(traverser instanceof Traverser, true)
    })
  })
})
