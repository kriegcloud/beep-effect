import { notStrictEqual, strictEqual } from 'assert'
import SinkMap from '@rdfjs/sink-map'
import { describe, it } from 'mocha'
import Formats from '../lib/Formats.js'

describe('Formats', () => {
  it('should be a constructor', () => {
    strictEqual(typeof Formats, 'function')
  })

  it('should assign the given factory', () => {
    const factory = {}

    const formats = new Formats({ factory })

    strictEqual(formats.factory, factory)
  })

  it('should assign an empty SinkMap to .parsers', () => {
    const formats = new Formats({ factory: {} })

    strictEqual(formats.parsers instanceof SinkMap, true)
    strictEqual(formats.parsers.size, 0)
  })

  it('should assign an empty SinkMap to .serializers', () => {
    const formats = new Formats({ factory: {} })

    strictEqual(formats.serializers instanceof SinkMap, true)
    strictEqual(formats.serializers.size, 0)
  })

  describe('.import', () => {
    it('should be a method', () => {
      const formats = new Formats({ factory: {} })

      strictEqual(typeof formats.import, 'function')
    })

    it('should import new instances of the parsers given in formats', () => {
      class ParserA {}
      class ParserB {}
      const original = {
        parsers: new Map([
          ['a', new ParserA()],
          ['b', new ParserB()]
        ])
      }
      const formats = new Formats({ factory: {} })

      formats.import(original)

      strictEqual(formats.parsers.size, 2)
      strictEqual(formats.parsers.get('a') instanceof ParserA, true)
      notStrictEqual(formats.parsers.get('a'), original.parsers.get('a'))
      strictEqual(formats.parsers.get('b') instanceof ParserB, true)
      notStrictEqual(formats.parsers.get('b'), original.parsers.get('b'))
    })

    it('should return the formats object', () => {
      const formats = new Formats({ factory: {} })

      const result = formats.import(new Map())

      strictEqual(result, formats)
    })

    it('should forward the factory to the constructor of the new parser instance', () => {
      class Parser {
        constructor ({ factory }) {
          this.factory = factory
        }
      }
      const factory = {}
      const original = {
        parsers: new Map([['a', new Parser({ factory: {} })]])
      }
      const formats = new Formats({ factory })

      formats.import(original)

      strictEqual(formats.parsers.get('a').factory, factory)
    })

    it('should import new instances of the serializers given in formats', () => {
      class SerializerA {}
      class SerializerB {}
      const original = {
        serializers: new Map([
          ['a', new SerializerA()],
          ['b', new SerializerB()]
        ])
      }
      const formats = new Formats({ factory: {} })

      formats.import(original)

      strictEqual(formats.serializers.size, 2)
      strictEqual(formats.serializers.get('a') instanceof SerializerA, true)
      notStrictEqual(formats.serializers.get('a'), original.serializers.get('a'))
      strictEqual(formats.serializers.get('b') instanceof SerializerB, true)
      notStrictEqual(formats.serializers.get('b'), original.serializers.get('b'))
    })

    it('should forward the factory to the constructor of the new serializer instance', () => {
      class Serializer {
        constructor ({ factory }) {
          this.factory = factory
        }
      }
      const factory = {}
      const original = {
        serializers: new Map([['a', new Serializer({ factory: {} })]])
      }
      const formats = new Formats({ factory })

      formats.import(original)

      strictEqual(formats.serializers.get('a').factory, factory)
    })
  })
})
