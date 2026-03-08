import { strictEqual, notStrictEqual } from 'assert'

function runTests ({ factory, mocha }) {
  const { describe, it } = mocha

  describe('.blankNode', () => {
    it('should be a static method', () => {
      strictEqual(typeof factory.blankNode, 'function')
    })

    it('should create an object with a termType property that contains the value "BlankNode"', () => {
      const term = factory.blankNode()

      strictEqual(term.termType, 'BlankNode')
    })

    it('should create an object with a value property that contains a unique identifier', () => {
      const term1 = factory.blankNode()
      const term2 = factory.blankNode()

      notStrictEqual(term1.value, term2.value)
    })

    it('should create an object with a value property that contains the given identifier', () => {
      const id = 'b1'
      const term = factory.blankNode(id)

      strictEqual(term.value, id)
    })

    describe('.equals', () => {
      it('should be a method', () => {
        const term = factory.blankNode()

        strictEqual(typeof term.equals, 'function')
      })

      it('should return true if termType and value are equal', () => {
        const id = 'b1'
        const term = factory.blankNode(id)
        const mock = { termType: 'BlankNode', value: id }

        strictEqual(term.equals(mock), true)
      })

      it('should return false if termType is not equal', () => {
        const id = 'b1'
        const term = factory.blankNode(id)
        const mock = { termType: 'NamedNode', value: id }

        strictEqual(term.equals(mock), false)
      })

      it('should return false if value is not equal', () => {
        const id = 'b1'
        const term = factory.blankNode(id)
        const mock = { termType: 'BlankNode', value: id + '1' }

        strictEqual(term.equals(mock), false)
      })

      it('should return false if value is falsy', () => {
        const id = 'b1'
        const term = factory.blankNode(id)

        strictEqual(term.equals(null), false)
      })
    })
  })
}

export default runTests
