import { strictEqual } from 'assert'
import DataFactory from '@rdfjs/data-model/Factory.js'
import Environment from '@rdfjs/environment'
import { describe, it } from 'mocha'
import Factory from '../Factory.js'
import { loadDataset } from './support/utils.js'

describe('Factory', () => {
  it('should be a class', () => {
    strictEqual(typeof Factory, 'function')
  })

  it('should attach a .shacl object', () => {
    const env = new Environment([Factory])

    strictEqual(typeof env.shacl, 'object')
  })

  describe('.validator', () => {
    it('should be a function', () => {
      const env = new Environment([Factory])

      strictEqual(typeof env.shacl.validator, 'function')
    })

    it('should use the environment as data factory', async () => {
      let touched = false

      class CustomDataFactory extends DataFactory {
        literal (...args) {
          touched = true

          return super.literal(...args)
        }
      }

      const env = new Environment([CustomDataFactory, Factory])
      const dataset = await loadDataset(new URL('assets/details/and-details.ttl', import.meta.url))

      const validator = env.shacl.validator(dataset)
      await validator.validate({ dataset })

      strictEqual(touched, true)
    })
  })
})
