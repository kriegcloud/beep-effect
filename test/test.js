import { strictEqual } from 'assert'
import { describe, it } from 'mocha'
import SinkMap from '../index.js'

describe('sink-map', () => {
  describe('constructor', () => {
    it('should create an empty map', () => {
      const map = new SinkMap()

      strictEqual(map.size, 0)
    })

    it('should import the key/value pairs from an array', () => {
      const jsonld = {}
      const turtle = {}

      const other = [
        ['application/ld+json', jsonld],
        ['text/turtle', turtle]
      ]

      const map = new SinkMap(other)

      strictEqual(map.get('application/ld+json'), jsonld)
      strictEqual(map.get('text/turtle'), turtle)
    })

    it('should import the key/value pairs from another SinkMap', () => {
      const jsonld = {}
      const turtle = {}

      const other = new SinkMap([
        ['application/ld+json', jsonld],
        ['text/turtle', turtle]
      ])

      const map = new SinkMap(other)

      strictEqual(map.get('application/ld+json'), jsonld)
      strictEqual(map.get('text/turtle'), turtle)
    })
  })

  describe('.import', () => {
    it('should be a method', () => {
      const map = new SinkMap()

      strictEqual(typeof map.import, 'function')
    })

    it('should return null if no matching sink was found', () => {
      const map = new SinkMap()

      strictEqual(map.import('image/jpeg'), null)
    })

    it('should call the import method of the sink', () => {
      let touched = false

      const jsonld = {}
      const turtle = {
        import: () => {
          touched = true
        }
      }

      const map = new SinkMap([
        ['application/ld+json', jsonld],
        ['text/turtle', turtle]
      ])

      map.import('text/turtle')

      strictEqual(touched, true)
    })

    it('should forward the input parameter', () => {
      let actualInput

      const jsonld = {}
      const turtle = {
        import: input => {
          actualInput = input
        }
      }

      const map = new SinkMap([
        ['application/ld+json', jsonld],
        ['text/turtle', turtle]
      ])

      map.import('text/turtle', 'test')

      strictEqual(actualInput, 'test')
    })

    it('should forward the input parameter', () => {
      let actualOptions

      const jsonld = {}
      const turtle = {
        import: (input, options) => {
          actualOptions = options
        }
      }

      const map = new SinkMap([
        ['application/ld+json', jsonld],
        ['text/turtle', turtle]
      ])

      map.import('text/turtle', null, 'test')

      strictEqual(actualOptions, 'test')
    })

    it('should return the result of the sink import method call', () => {
      const jsonld = {}
      const turtle = {
        import: () => {
          return 'test'
        }
      }

      const map = new SinkMap([
        ['application/ld+json', jsonld],
        ['text/turtle', turtle]
      ])

      strictEqual(map.import('text/turtle'), 'test')
    })
  })
})
