import { testFixture } from '../Fixture.js'

describe('`VariadicParslet` tests', () => {
  describe('should get postfix result', () => {
    testFixture({
      input: 'b...',
      expected: {
        type: 'JsdocTypeVariadic',
        element: {
          type: 'JsdocTypeName',
          value: 'b'
        },
        meta: {
          position: 'suffix',
          squareBrackets: false
        }
      },
      modes: [
        'jsdoc'
      ]
    })
  })

  describe('should get postfix result', () => {
    testFixture({
      input: '...',
      expected: {
        type: 'JsdocTypeVariadic',
        meta: {
          position: undefined,
          squareBrackets: false
        }
      },
      modes: [
        'jsdoc',
        'closure',
        'typescript'
      ]
    })
  })
})
