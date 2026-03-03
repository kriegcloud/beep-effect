import { testFixture } from '../Fixture.js'

describe('typescript call signatures', () => {
  describe('should parse a call signature', () => {
    testFixture({
      input: '{(a: string, b: number): SomeType}',
      modes: ['typescript'],
      expected: {
        type: 'JsdocTypeObject',
        meta: {
          separator: 'comma'
        },
        elements: [
          {
            type: 'JsdocTypeCallSignature',
            parameters: [
              {
                type: 'JsdocTypeKeyValue',
                key: 'a',
                right: {
                  type: 'JsdocTypeName',
                  value: 'string'
                },
                optional: false,
                variadic: false
              },
              {
                type: 'JsdocTypeKeyValue',
                key: 'b',
                right: {
                  type: 'JsdocTypeName',
                  value: 'number'
                },
                optional: false,
                variadic: false
              }
            ],
            returnType: {
              type: 'JsdocTypeName',
              value: 'SomeType'
            }
          }
        ]
      }
    })
  })

  describe('should parse a call signature with type parameters', () => {
    testFixture({
      input: '{<T>(a: T, b: number): SomeType}',
      modes: ['typescript'],
      expected: {
        type: 'JsdocTypeObject',
        meta: {
          separator: 'comma'
        },
        elements: [
          {
            type: 'JsdocTypeCallSignature',
            typeParameters: [
              {
                name: {
                  type: 'JsdocTypeName',
                  value: 'T'
                },
                type: 'JsdocTypeTypeParameter'
              }
            ],
            parameters: [
              {
                type: 'JsdocTypeKeyValue',
                key: 'a',
                right: {
                  type: 'JsdocTypeName',
                  value: 'T'
                },
                optional: false,
                variadic: false
              },
              {
                type: 'JsdocTypeKeyValue',
                key: 'b',
                right: {
                  type: 'JsdocTypeName',
                  value: 'number'
                },
                optional: false,
                variadic: false
              }
            ],
            returnType: {
              type: 'JsdocTypeName',
              value: 'SomeType'
            }
          }
        ]
      }
    })
  })

  describe('should err with non-name type parameters', () => {
    testFixture({
      input: '{<123>(): SomeType}',
      errors: {
        typescript: "Unexpected type: 'JsdocTypeNumber'."
      }
    })
  })
})
