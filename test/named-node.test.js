import { strictEqual } from 'assert'

function runTests ({ factory, mocha }) {
  const { describe, it } = mocha

  describe('.namedNode', () => {
    it('should be a static method', () => {
      strictEqual(typeof factory.namedNode, 'function')
    })

    it('should create an object with a termType property that contains the value "NamedNode"', () => {
      const iri = 'http://example.org'
      const term = factory.namedNode(iri)

      strictEqual(term.termType, 'NamedNode')
    })

    it('should create an object with a value property that contains the given IRI', () => {
      const iri = 'http://example.org'
      const term = factory.namedNode(iri)

      strictEqual(term.value, iri)
    })

    describe('.equals', () => {
      it('should be a method', () => {
        const iri = 'http://example.org'
        const term = factory.namedNode(iri)

        strictEqual(typeof term.equals, 'function')
      })

      it('should return true if termType and value are equal', () => {
        const iri = 'http://example.org'
        const term = factory.namedNode(iri)
        const mock = { termType: 'NamedNode', value: iri }

        strictEqual(term.equals(mock), true)
      })

      it('should return false if termType is not equal', () => {
        const iri = 'http://example.org'
        const term = factory.namedNode(iri)
        const mock = { termType: 'BlankNode', value: iri }

        strictEqual(term.equals(mock), false)
      })

      it('should return false if value is not equal', () => {
        const iri = 'http://example.org'
        const term = factory.namedNode(iri)
        const mock = { termType: 'NamedNode', value: iri + '1' }

        strictEqual(term.equals(mock), false)
      })

      it('should return false if value is falsy', () => {
        const iri = 'http://example.org'
        const term = factory.namedNode(iri)

        strictEqual(term.equals(null), false)
      })
    })
  })
}

export default runTests
