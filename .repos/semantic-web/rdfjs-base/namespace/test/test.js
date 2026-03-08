import { strictEqual } from 'assert'
import { describe, it } from 'mocha'
import namespace from '../index.js'

describe('namespace', () => {
  it('should be a function', () => {
    strictEqual(typeof namespace, 'function')
  })

  it('should return a function', () => {
    const schema = namespace('http://schema.org/')

    strictEqual(typeof schema, 'function')
  })

  it('should use the given factory to create Named Nodes', () => {
    let touched = false

    const factory = {
      namedNode: () => {
        touched = true
      }
    }
    const schema = namespace('http://schema.org/', { factory })

    schema('hasPart')

    strictEqual(touched, true)
  })

  describe('function call', () => {
    it('should create a Named Node based on the baseIRI and the given parameter', () => {
      const schema = namespace('http://schema.org/')
      const term = schema('hasPart')

      strictEqual(term.termType, 'NamedNode')
      strictEqual(term.value, 'http://schema.org/hasPart')
    })

    it('should create a Named Node based on the baseIRI with the empty string as parameter', () => {
      const schema = namespace('http://schema.org/')
      const term = schema('')

      strictEqual(term.termType, 'NamedNode')
      strictEqual(term.value, 'http://schema.org/')
    })

    it('should create a Named Node based on the baseIRI without parameter', () => {
      const schema = namespace('http://schema.org/')
      const term = schema()

      strictEqual(term.termType, 'NamedNode')
      strictEqual(term.value, 'http://schema.org/')
    })
  })

  describe('tagged template literal', () => {
    it('should create a Named Node based on the baseIRI and the given template string', () => {
      const schema = namespace('http://schema.org/')
      const term = schema`hasPart`

      strictEqual(term.termType, 'NamedNode')
      strictEqual(term.value, 'http://schema.org/hasPart')
    })

    it('should create a Named Node based on the baseIRI and an empty template string', () => {
      const schema = namespace('http://schema.org/')
      const term = schema``

      strictEqual(term.termType, 'NamedNode')
      strictEqual(term.value, 'http://schema.org/')
    })
  })

  describe('proxy', () => {
    it('should create a Named Node based on the baseIRI and the property', () => {
      const schema = namespace('http://schema.org/')
      const term = schema.hasPart

      strictEqual(term.termType, 'NamedNode')
      strictEqual(term.value, 'http://schema.org/hasPart')
    })

    it('should return undefined if the JavaScript engine doesn\'t support Proxy', () => {
      const ProxyBackup = global.Proxy

      delete global.Proxy

      const schema = namespace('http://schema.org/')
      const term = schema.hasPart

      global.Proxy = ProxyBackup

      strictEqual(typeof term, 'undefined')
    })
  })
})
