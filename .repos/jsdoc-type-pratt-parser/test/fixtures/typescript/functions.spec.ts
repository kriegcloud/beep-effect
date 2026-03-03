import { testFixture } from '../Fixture.js'

describe('typescript function test', () => {
  describe('allows new as function', () => {
    testFixture({
      input: 'new(number, string): SomeType',
      expected: {
        type: 'JsdocTypeFunction',
        parameters: [
          {
            type: 'JsdocTypeName',
            value: 'number'
          },
          {
            type: 'JsdocTypeName',
            value: 'string'
          }
        ],
        arrow: false,
        constructor: true,
        parenthesis: true,
        returnType: {
          type: 'JsdocTypeName',
          value: 'SomeType'
        }
      },
      modes: ['typescript']
    })
  })

  describe('allows new as an arrow function', () => {
    testFixture({
      input: 'new () => SomeType',
      expected: {
        type: 'JsdocTypeFunction',
        parameters: [],
        arrow: true,
        constructor: true,
        parenthesis: true,
        returnType: {
          type: 'JsdocTypeName',
          value: 'SomeType'
        }
      },
      modes: ['typescript']
    })
  })

  describe('allow typed variadic args', () => {
    testFixture({
      input: 'function(...args: any[]): object',
      expected: {
        type: 'JsdocTypeFunction',
        arrow: false,
        constructor: false,
        parenthesis: true,
        parameters: [{
          type: 'JsdocTypeKeyValue',
          key: 'args',
          right: {
            type: 'JsdocTypeGeneric',
            left: {
              type: 'JsdocTypeName',
              value: 'Array'
            },
            elements: [{
              type: 'JsdocTypeName',
              value: 'any'
            }],
            meta: {
              brackets: 'square',
              dot: false
            }
          },
          optional: false,
          variadic: true
        }],
        returnType: {
          type: 'JsdocTypeName',
          value: 'object'
        }
      },
      modes: ['typescript']
    })
  })
})
