import { testFixture } from '../Fixture.js'

describe('typescript computed method tests', () => {
  describe('simple computed method object', () => {
    testFixture({
      input: '{[someType](): AnotherType;}',
      stringified: '{[someType](): AnotherType}',
      expected: {
        type: 'JsdocTypeObject',
        meta: {
          separator: 'semicolon'
        },
        elements: [
          {
            type: 'JsdocTypeObjectField',
            key: {
              type: 'JsdocTypeComputedMethod',
              optional: false,
              parameters: [],
              value: {
                type: 'JsdocTypeName',
                value: 'someType'
              },
              returnType: {
                type: 'JsdocTypeName',
                value: 'AnotherType'
              }
            },
            optional: false,
            readonly: false,
            right: undefined,
            meta: {
              quote: undefined
            }
          }
        ]
      },
      modes: [
        'typescript'
      ]
    })
  })

  describe('optional computed method object', () => {
    testFixture({
      input: '{[someType]?(): AnotherType;}',
      stringified: '{[someType]?(): AnotherType}',
      expected: {
        type: 'JsdocTypeObject',
        meta: {
          separator: 'semicolon'
        },
        elements: [
          {
            type: 'JsdocTypeObjectField',
            key: {
              type: 'JsdocTypeComputedMethod',
              optional: true,
              parameters: [],
              value: {
                type: 'JsdocTypeName',
                value: 'someType'
              },
              returnType: {
                type: 'JsdocTypeName',
                value: 'AnotherType'
              }
            },
            optional: false,
            readonly: false,
            right: undefined,
            meta: {
              quote: undefined
            }
          }
        ]
      },
      modes: [
        'typescript'
      ]
    })
  })

  describe('computed method object with parameters', () => {
    testFixture({
      input: '{[someType](a: string, b: number[]): AnotherType;}',
      stringified: '{[someType](a: string, b: number[]): AnotherType}',
      expected: {
        type: 'JsdocTypeObject',
        meta: {
          separator: 'semicolon'
        },
        elements: [
          {
            type: 'JsdocTypeObjectField',
            key: {
              type: 'JsdocTypeComputedMethod',
              optional: false,
              parameters: [
                {
                  key: 'a',
                  optional: false,
                  right: {
                    type: 'JsdocTypeName',
                    value: 'string'
                  },
                  type: 'JsdocTypeKeyValue',
                  variadic: false
                },
                {
                  key: 'b',
                  optional: false,
                  right: {
                    elements: [
                      {
                        type: 'JsdocTypeName',
                        value: 'number'
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
                  type: 'JsdocTypeKeyValue',
                  variadic: false
                }
              ],
              value: {
                type: 'JsdocTypeName',
                value: 'someType'
              },
              returnType: {
                type: 'JsdocTypeName',
                value: 'AnotherType'
              }
            },
            optional: false,
            readonly: false,
            right: undefined,
            meta: {
              quote: undefined
            }
          }
        ]
      },
      modes: [
        'typescript'
      ]
    })
  })

  describe('optional computed method object with type parameters', () => {
    testFixture({
      input: '{[someType]?<T>(a: T, b: number[]): AnotherType;}',
      stringified: '{[someType]?<T>(a: T, b: number[]): AnotherType}',
      expected: {
        type: 'JsdocTypeObject',
        meta: {
          separator: 'semicolon'
        },
        elements: [
          {
            type: 'JsdocTypeObjectField',
            key: {
              type: 'JsdocTypeComputedMethod',
              optional: true,
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
                  key: 'a',
                  optional: false,
                  right: {
                    type: 'JsdocTypeName',
                    value: 'T'
                  },
                  type: 'JsdocTypeKeyValue',
                  variadic: false
                },
                {
                  key: 'b',
                  optional: false,
                  right: {
                    elements: [
                      {
                        type: 'JsdocTypeName',
                        value: 'number'
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
                  type: 'JsdocTypeKeyValue',
                  variadic: false
                }
              ],
              value: {
                type: 'JsdocTypeName',
                value: 'someType'
              },
              returnType: {
                type: 'JsdocTypeName',
                value: 'AnotherType'
              }
            },
            optional: false,
            readonly: false,
            right: undefined,
            meta: {
              quote: undefined
            }
          }
        ]
      },
      modes: [
        'typescript'
      ]
    })
  })

  describe('computed method object with defaulting type parameters', () => {
    testFixture({
      input: '{[someType]<T = string>(a: T, b: number[]): AnotherType;}',
      stringified: '{[someType]<T = string>(a: T, b: number[]): AnotherType}',
      expected: {
        type: 'JsdocTypeObject',
        meta: {
          separator: 'semicolon'
        },
        elements: [
          {
            type: 'JsdocTypeObjectField',
            key: {
              type: 'JsdocTypeComputedMethod',
              optional: false,
              typeParameters: [
                {
                  defaultValue: {
                    type: 'JsdocTypeName',
                    value: 'string'
                  },
                  name: {
                    type: 'JsdocTypeName',
                    value: 'T'
                  },
                  type: 'JsdocTypeTypeParameter'
                }
              ],
              parameters: [
                {
                  key: 'a',
                  optional: false,
                  right: {
                    type: 'JsdocTypeName',
                    value: 'T'
                  },
                  type: 'JsdocTypeKeyValue',
                  variadic: false
                },
                {
                  key: 'b',
                  optional: false,
                  right: {
                    elements: [
                      {
                        type: 'JsdocTypeName',
                        value: 'number'
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
                  type: 'JsdocTypeKeyValue',
                  variadic: false
                }
              ],
              value: {
                type: 'JsdocTypeName',
                value: 'someType'
              },
              returnType: {
                type: 'JsdocTypeName',
                value: 'AnotherType'
              }
            },
            optional: false,
            readonly: false,
            right: undefined,
            meta: {
              quote: undefined
            }
          }
        ]
      },
      modes: [
        'typescript'
      ]
    })
  })

  describe('computed method object with defaulting type parameters', () => {
    testFixture({
      input: '{[someType]<123>(a: T, b: number[]): AnotherType;}',
      errors: {
        typescript: "Unexpected type: 'JsdocTypeNumber'."
      }
    })
  })

  describe('computed method object with complex type parameters', () => {
    testFixture({
      input: '{[someType]<T extends A = string, V>(a: T, b: number[]): AnotherType;}',
      stringified: '{[someType]<T extends A = string, V>(a: T, b: number[]): AnotherType}',
      expected: {
        type: 'JsdocTypeObject',
        meta: {
          separator: 'semicolon'
        },
        elements: [
          {
            type: 'JsdocTypeObjectField',
            key: {
              type: 'JsdocTypeComputedMethod',
              optional: false,
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
                  key: 'a',
                  optional: false,
                  right: {
                    type: 'JsdocTypeName',
                    value: 'T'
                  },
                  type: 'JsdocTypeKeyValue',
                  variadic: false
                },
                {
                  key: 'b',
                  optional: false,
                  right: {
                    elements: [
                      {
                        type: 'JsdocTypeName',
                        value: 'number'
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
                  type: 'JsdocTypeKeyValue',
                  variadic: false
                }
              ],
              value: {
                type: 'JsdocTypeName',
                value: 'someType'
              },
              returnType: {
                type: 'JsdocTypeName',
                value: 'AnotherType'
              }
            },
            optional: false,
            readonly: false,
            right: undefined,
            meta: {
              quote: undefined
            }
          }
        ]
      },
      modes: [
        'typescript'
      ]
    })
  })

  describe('computed method object with namespaced property', () => {
    testFixture({
      input: '{[SomeObject.someType()](): AnotherType;}',
      espree: true,
      stringified: '{[SomeObject.someType()](): AnotherType}',
      expected: {
        type: 'JsdocTypeObject',
        meta: {
          separator: 'semicolon'
        },
        elements: [
          {
            type: 'JsdocTypeObjectField',
            key: {
              type: 'JsdocTypeComputedMethod',
              optional: false,
              parameters: [],
              value: {
                body: [
                  {
                    end: 21,
                    expression: {
                      arguments: [],
                      callee: {
                        computed: false,
                        end: 19,
                        object: {
                          // @ts-expect-error Not the same `Identifier`
                          end: 10,
                          name: 'SomeObject',
                          start: 0,
                          type: 'Identifier'
                        },
                        property: {
                          // @ts-expect-error Not the same `Identifier`
                          end: 19,
                          name: 'someType',
                          start: 11,
                          type: 'Identifier'
                        },
                        start: 0,
                        type: 'MemberExpression'
                      },
                      end: 21,
                      start: 0,
                      type: 'CallExpression'
                    },
                    start: 0,
                    type: 'ExpressionStatement'
                  }
                ],
                end: 21,
                sourceType: 'script',
                start: 0,
                type: 'Program'
              },
              returnType: {
                type: 'JsdocTypeName',
                value: 'AnotherType'
              }
            },
            optional: false,
            readonly: false,
            right: undefined,
            meta: {
              quote: undefined
            }
          }
        ]
      },
      modes: [
        'typescript'
      ]
    })
  })

  describe('no readonly computed method object', () => {
    testFixture({
      input: '{readonly [someType](): string;}',
      errors: {
        typescript: 'Computed method may not be readonly'
      }
    })
  })

  describe('unterminated computed method object', () => {
    testFixture({
      input: '{[someType](: string;}',
      errors: {
        // typescript: 'Unterminated computed method parenthesis'
        typescript: "No parslet found for token: ':' with value ':'"
      }
    })
  })

  describe('optional computed method object throws', () => {
    testFixture({
      input: '{[someType]()?: string;}',
      errors: {
        // typescript: 'Computed methods may not be optional'
        typescript: "Unexpected type: 'JsdocTypeParameterList'."
      }
    })
  })
})
