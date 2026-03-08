import { notStrictEqual, strictEqual, throws } from 'assert'

function runTests ({ factory, mocha }) {
  const { describe, it } = mocha

  describe('.fromTerm', () => {
    it('should be a static method', () => {
      strictEqual(typeof factory.fromTerm, 'function')
    })

    it('should create a clone of the given BlankNode', () => {
      const original = factory.blankNode()

      const term = factory.fromTerm(original)

      strictEqual(term.equals(original), true)
      notStrictEqual(term, original)
    })

    it('should create a clone of the given DefaultGraph', () => {
      const original = factory.defaultGraph()

      const term = factory.fromTerm(original)

      strictEqual(term.equals(original), true)
    })

    it('should create a clone of the given Literal', () => {
      const original = factory.literal('example')

      const term = factory.fromTerm(original)

      strictEqual(term.equals(original), true)
      notStrictEqual(term, original)
    })

    it('should create a clone of the given Literal with language', () => {
      const original = factory.literal('example', 'en')

      const term = factory.fromTerm(original)

      strictEqual(term.equals(original), true)
      notStrictEqual(term, original)
    })

    it('should create a clone of the given Literal with datatype', () => {
      const original = factory.literal('example', factory.namedNode('http://example.org/'))

      const term = factory.fromTerm(original)

      strictEqual(term.equals(original), true)
      notStrictEqual(term, original)
      notStrictEqual(term.datatype, original.datatype)
    })

    it('should create a clone of the given NamedNode', () => {
      const original = factory.namedNode('http://example.org/')

      const term = factory.fromTerm(original)

      strictEqual(term.equals(original), true)
      notStrictEqual(term, original)
    })

    it('should create a clone of the given Quad', () => {
      const subject = factory.blankNode()
      const predicate = factory.namedNode('http://example.org/predicate')
      const object = factory.literal('example')
      const graph = factory.namedNode('http://example.org/graph')
      const original = factory.quad(subject, predicate, object, graph)

      const term = factory.fromTerm(original)

      strictEqual(term.equals(original), true)
      notStrictEqual(term, original)
      notStrictEqual(term.subject, original.subject)
      notStrictEqual(term.predicate, original.predicate)
      notStrictEqual(term.object, original.object)
      notStrictEqual(term.graph, original.graph)
    })

    it('should create a clone of the given Variable', () => {
      const original = factory.variable('v')

      const term = factory.fromTerm(original)

      strictEqual(term.equals(original), true)
      notStrictEqual(term, original)
    })

    it('should return null if null is given', () => {
      const term = factory.fromTerm(null)

      strictEqual(term, null)
    })

    it('should throw an error if an unknown object is given', () => {
      const original = {}

      throws(() => {
        factory.fromTerm(original)
      })
    })
  })
}

export default runTests
