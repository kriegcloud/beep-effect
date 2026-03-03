import { testFixture } from '../Fixture.js'

describe('typescript predicates', () => {
  describe('should parse a predicate', () => {
    testFixture({
      input: 'x is string',
      modes: ['typescript'],
      expected: {
        type: 'JsdocTypePredicate',
        left: {
          type: 'JsdocTypeName',
          value: 'x'
        },
        right: {
          type: 'JsdocTypeName',
          value: 'string'
        }
      }
    })
  })
})
