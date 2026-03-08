import { notStrictEqual, strictEqual, throws } from 'assert'

function runTests ({ factory, mocha }) {
  const { describe, it } = mocha

  describe('.fromQuad', () => {
    it('should be a static method', () => {
      strictEqual(typeof factory.fromQuad, 'function')
    })

    it('should create a clone of the given Quad', () => {
      const subject = factory.blankNode()
      const predicate = factory.namedNode('http://example.org/predicate')
      const object = factory.literal('example')
      const graph = factory.namedNode('http://example.org/graph')
      const original = factory.quad(subject, predicate, object, graph)

      const term = factory.fromQuad(original)

      strictEqual(term.equals(original), true)
      notStrictEqual(term, original)
    })

    it('should return null if null is given', () => {
      const term = factory.fromQuad(null)

      strictEqual(term, null)
    })

    it('should throw an error if an unknown object is given', () => {
      const original = {}

      throws(() => {
        factory.fromQuad(original)
      })
    })
  })
}

export default runTests
