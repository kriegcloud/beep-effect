import { testFixture } from '../Fixture.js'

describe('typescript constructor signatures', () => {
  describe('should parse a constructor signature', () => {
    testFixture({
      input: '{new (a: string, b: number): SomeType}',
      modes: ['typescript'],
      expected: {
        type: 'JsdocTypeObject',
        meta: {
          separator: 'comma'
        },
        elements: [
          {
            type: 'JsdocTypeConstructorSignature',
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

  describe('should parse a constructor signature', () => {
    testFixture({
      input: '{new (...args: any[]): object}',
      modes: ['typescript'],
      expected: {
        type: 'JsdocTypeObject',
        meta: {
          separator: 'comma'
        },
        elements: [
          {
            type: 'JsdocTypeConstructorSignature',
            parameters: [
              {
                type: 'JsdocTypeKeyValue',
                key: 'args',
                right: {
                  elements: [
                    {
                      type: 'JsdocTypeName',
                      value: 'any'
                    }
                  ],
                  left: {
                    type: 'JsdocTypeName',
                    value: 'Array'
                  },
                  meta: {
                    brackets: 'square',
                    dot: false
                  },
                  type: 'JsdocTypeGeneric'
                },
                optional: false,
                variadic: true
              }
            ],
            returnType: {
              type: 'JsdocTypeName',
              value: 'object'
            }
          }
        ]
      }
    })
  })

  describe('should parse a constructor signature with complex type parameters', () => {
    testFixture({
      input: '{new <T extends A = string, V>(a: T, b: number): SomeType}',
      modes: ['typescript'],
      expected: {
        type: 'JsdocTypeObject',
        meta: {
          separator: 'comma'
        },
        elements: [
          {
            type: 'JsdocTypeConstructorSignature',
            typeParameters: [
              {
                constraint: {
                  type: 'JsdocTypeName',
                  value: 'A'
                },
                defaultValue: {
                  type: 'JsdocTypeName',
                  value: 'string'
                },
                name: {
                  type: 'JsdocTypeName',
                  value: 'T'
                },
                type: 'JsdocTypeTypeParameter'
              },
              {
                name: {
                  type: 'JsdocTypeName',
                  value: 'V'
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
})
