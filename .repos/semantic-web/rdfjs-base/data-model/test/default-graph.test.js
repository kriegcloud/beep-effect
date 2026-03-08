import { strictEqual } from 'assert'

function runTests ({ factory, mocha }) {
  const { describe, it } = mocha

  describe('.defaultGraph', () => {
    it('should be a static method', () => {
      strictEqual(typeof factory.defaultGraph, 'function')
    })

    it('should create an object with a termType property that contains the value "DefaultGraph"', () => {
      const term = factory.defaultGraph()

      strictEqual(term.termType, 'DefaultGraph')
    })

    it('should create an object with a value property that contains an empty string', () => {
      const term = factory.defaultGraph()

      strictEqual(term.value, '')
    })

    describe('.equals', () => {
      it('should be a method', () => {
        const term = factory.defaultGraph()

        strictEqual(typeof term.equals, 'function')
      })

      it('should return true if termType and value are equal', () => {
        const term = factory.defaultGraph()
        const mock = { termType: 'DefaultGraph', value: '' }

        strictEqual(term.equals(mock), true)
      })

      it('should return false if termType is not equal', () => {
        const term = factory.defaultGraph()
        const mock = { termType: 'NamedNode', value: '' }

        strictEqual(term.equals(mock), false)
      })

      it('should return false if value is falsy', () => {
        const term = factory.defaultGraph()

        strictEqual(term.equals(null), false)
      })
    })
  })
}

export default runTests
