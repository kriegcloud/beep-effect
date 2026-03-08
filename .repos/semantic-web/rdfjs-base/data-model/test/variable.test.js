import { strictEqual } from 'assert'

function runTests ({ factory, mocha }) {
  const { describe, it } = mocha

  // support for Variable is optional
  if (!factory.variable) {
    return
  }

  describe('.variable', () => {
    it('should be a static method', () => {
      strictEqual(typeof factory.variable, 'function')
    })

    it('should create an object with a termType property that contains the value "Variable"', () => {
      const name = 'v'
      const term = factory.variable(name)

      strictEqual(term.termType, 'Variable')
    })

    it('should create an object with a value property that contains the given name', () => {
      const name = 'v'
      const term = factory.variable(name)

      strictEqual(term.value, name)
    })

    describe('.equals', () => {
      it('should be a method', () => {
        const name = 'v'
        const term = factory.variable(name)

        strictEqual(typeof term.equals, 'function')
      })

      it('should return true if termType and value are equal', () => {
        const name = 'v'
        const term = factory.variable(name)
        const mock = { termType: 'Variable', value: name }

        strictEqual(term.equals(mock), true)
      })

      it('should return false if termType is not equal', () => {
        const name = 'v'
        const term = factory.variable(name)
        const mock = { termType: 'NamedNode', value: name }

        strictEqual(term.equals(mock), false)
      })

      it('should return false if value is not equal', () => {
        const name = 'v'
        const term = factory.variable(name)
        const mock = { termType: 'Variable', value: name + '1' }

        strictEqual(term.equals(mock), false)
      })

      it('should return false if value is falsy', () => {
        const name = 'v'
        const term = factory.variable(name)

        strictEqual(term.equals(null), false)
      })
    })
  })
}

export default runTests
