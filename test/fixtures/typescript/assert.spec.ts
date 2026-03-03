import { testFixture } from '../Fixture.js'

describe('typescript assert result tests', () => {
  describe('assert as return type', () => {
    testFixture({
      input: 'asserts foo is Bar',
      expected: {
        type: 'JsdocTypeAsserts',
        left: {
          type: 'JsdocTypeName',
          value: 'foo'
        },
        right: {
          type: 'JsdocTypeName',
          value: 'Bar'
        }
      },
      modes: ['typescript']
    })
  })

  describe('assert without `is` as return type', () => {
    testFixture({
      input: 'asserts foo',
      expected: {
        type: 'JsdocTypeAssertsPlain',
        element: {
          type: 'JsdocTypeName',
          value: 'foo'
        }
      },
      modes: ['typescript']
    })
  })
})
