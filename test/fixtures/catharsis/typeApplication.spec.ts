import { testFixture } from '../Fixture.js'

describe('catharsis type application tests', () => {
  describe('array of strings, without a dot separator', () => {
    testFixture({
      input: 'Array<string>',
      expected: {
        type: 'JsdocTypeGeneric',
        elements: [
          {
            type: 'JsdocTypeName',
            value: 'string'
          }
        ],
        left: {
          type: 'JsdocTypeName',
          value: 'Array'
        },
        meta: {
          dot: false,
          brackets: 'angle'
        }
      },
      modes: [
        'typescript',
        'jsdoc',
        'closure'
      ],
      catharsis: {
        closure: 'closure',
        jsdoc: 'jsdoc'
      },
      jtp: {
        closure: 'closure',
        jsdoc: 'jsdoc',
        typescript: 'typescript',
        permissive: 'closure'
      }
    })
  })

  describe('array of strings, with a dot separator', () => {
    testFixture({
      input: 'Array.<string>',
      expected: {
        type: 'JsdocTypeGeneric',
        elements: [
          {
            type: 'JsdocTypeName',
            value: 'string'
          }
        ],
        left: {
          type: 'JsdocTypeName',
          value: 'Array'
        },
        meta: {
          dot: true,
          brackets: 'angle'
        }
      },
      modes: [
        'typescript',
        'jsdoc',
        'closure'
      ],
      catharsis: {
        closure: 'closure',
        jsdoc: 'jsdoc'
      },
      jtp: {
        closure: 'closure',
        jsdoc: 'jsdoc',
        typescript: 'typescript',
        permissive: 'closure'
      }
    })
  })

  describe('repeatable array of strings', () => {
    testFixture({
      input: '...Array.<string>',
      expected: {
        type: 'JsdocTypeVariadic',
        element: {
          type: 'JsdocTypeGeneric',
          elements: [
            {
              type: 'JsdocTypeName',
              value: 'string'
            }
          ],
          left: {
            type: 'JsdocTypeName',
            value: 'Array'
          },
          meta: {
            dot: true,
            brackets: 'angle'
          }
        },
        meta: {
          squareBrackets: false,
          position: 'prefix'
        }
      },
      modes: [
        'typescript',
        'jsdoc',
        'closure'
      ],
      catharsis: {
        closure: 'closure',
        jsdoc: 'jsdoc'
      },
      jtp: {
        closure: 'closure',
        jsdoc: 'jsdoc',
        typescript: 'typescript',
        permissive: 'closure'
      }
    })
  })

  describe('object whose properties are strings and property values are numbers', () => {
    testFixture({
      input: 'Object.<string, number>',
      expected: {
        type: 'JsdocTypeGeneric',
        elements: [
          {
            type: 'JsdocTypeName',
            value: 'string'
          },
          {
            type: 'JsdocTypeName',
            value: 'number'
          }
        ],
        left: {
          type: 'JsdocTypeName',
          value: 'Object'
        },
        meta: {
          dot: true,
          brackets: 'angle'
        }
      },
      modes: [
        'typescript',
        'jsdoc',
        'closure'
      ],
      catharsis: {
        closure: 'closure',
        jsdoc: 'jsdoc'
      },
      jtp: {
        closure: 'closure',
        jsdoc: 'jsdoc',
        typescript: 'typescript',
        permissive: 'closure'
      }
    })
  })

  describe('object whose properties are a type application and property values are a type union', () => {
    testFixture({
      input: 'Object.<Array.<(boolean|{myKey: Error})>, (boolean|string|function(new:foo): string)>',
      stringified: 'Object.<Array.<(boolean | {myKey: Error})>, (boolean | string | function(new: foo): string)>',
      expected: {
        type: 'JsdocTypeGeneric',
        elements: [
          {
            type: 'JsdocTypeGeneric',
            elements: [
              {
                type: 'JsdocTypeParenthesis',
                element: {
                  type: 'JsdocTypeUnion',
                  elements: [
                    {
                      type: 'JsdocTypeName',
                      value: 'boolean'
                    },
                    {
                      type: 'JsdocTypeObject',
                      meta: {
                        separator: 'comma'
                      },
                      elements: [
                        {
                          type: 'JsdocTypeObjectField',
                          key: 'myKey',
                          meta: {
                            quote: undefined
                          },
                          optional: false,
                          readonly: false,
                          right: {
                            type: 'JsdocTypeName',
                            value: 'Error'
                          }
                        }
                      ]
                    }
                  ]
                }
              }
            ],
            left: {
              type: 'JsdocTypeName',
              value: 'Array'
            },
            meta: {
              dot: true,
              brackets: 'angle'
            }
          },
          {
            type: 'JsdocTypeParenthesis',
            element: {
              type: 'JsdocTypeUnion',
              elements: [
                {
                  type: 'JsdocTypeName',
                  value: 'boolean'
                },
                {
                  type: 'JsdocTypeName',
                  value: 'string'
                },
                {
                  type: 'JsdocTypeFunction',
                  parameters: [
                    {
                      type: 'JsdocTypeKeyValue',
                      key: 'new',
                      optional: false,
                      variadic: false,
                      right: {
                        type: 'JsdocTypeName',
                        value: 'foo'
                      }
                    }
                  ],
                  returnType: {
                    type: 'JsdocTypeName',
                    value: 'string'
                  },
                  arrow: false,
                  constructor: false,
                  parenthesis: true
                }
              ]
            }
          }
        ],
        left: {
          type: 'JsdocTypeName',
          value: 'Object'
        },
        meta: {
          dot: true,
          brackets: 'angle'
        }
      },
      modes: [
        'typescript',
        'jsdoc',
        'closure'
      ],
      catharsis: {
        closure: 'closure',
        jsdoc: 'jsdoc'
      },
      jtp: {
        closure: 'closure',
        jsdoc: 'jsdoc',
        typescript: 'typescript',
        permissive: 'closure'
      }
    })
  })

  describe('array of objects that have a length property', () => {
    testFixture({
      input: 'Array.<{length}>',
      expected: {
        type: 'JsdocTypeGeneric',
        elements: [
          {
            type: 'JsdocTypeObject',
            meta: {
              separator: 'comma'
            },
            elements: [
              {
                type: 'JsdocTypeObjectField',
                key: 'length',
                optional: false,
                readonly: false,
                right: undefined,
                meta: {
                  quote: undefined
                }
              }
            ]
          }
        ],
        left: {
          type: 'JsdocTypeName',
          value: 'Array'
        },
        meta: {
          dot: true,
          brackets: 'angle'
        }
      },
      modes: [
        'typescript',
        'jsdoc',
        'closure'
      ],
      catharsis: {
        closure: 'closure',
        jsdoc: 'jsdoc'
      },
      jtp: {
        closure: 'closure',
        jsdoc: 'jsdoc',
        typescript: 'typescript',
        permissive: 'closure'
      }
    })
  })

  describe('array of unknown', () => {
    testFixture({
      input: 'Array.<?>',
      expected: {
        type: 'JsdocTypeGeneric',
        elements: [
          {
            type: 'JsdocTypeUnknown'
          }
        ],
        left: {
          type: 'JsdocTypeName',
          value: 'Array'
        },
        meta: {
          dot: true,
          brackets: 'angle'
        }
      },
      modes: [
        'jsdoc',
        'closure',
        'typescript'
      ],
      catharsis: {
        closure: 'closure',
        jsdoc: 'jsdoc'
      },
      jtp: {
        closure: 'closure',
        jsdoc: 'jsdoc',
        typescript: 'typescript',
        permissive: 'closure'
      }
    })
  })

  describe('Promise containing string', () => {
    testFixture({
      input: 'Promise.<string>',
      expected: {
        type: 'JsdocTypeGeneric',
        elements: [
          {
            type: 'JsdocTypeName',
            value: 'string'
          }
        ],
        left: {
          type: 'JsdocTypeName',
          value: 'Promise'
        },
        meta: {
          dot: true,
          brackets: 'angle'
        }
      },
      modes: [
        'typescript',
        'jsdoc',
        'closure'
      ],
      catharsis: {
        closure: 'closure',
        jsdoc: 'jsdoc'
      },
      jtp: {
        closure: 'closure',
        jsdoc: 'jsdoc',
        typescript: 'typescript',
        permissive: 'closure'
      }
    })
  })

  describe('foo.Promise containing string', () => {
    testFixture({
      input: 'foo.Promise.<string>',
      expected: {
        type: 'JsdocTypeGeneric',
        elements: [
          {
            type: 'JsdocTypeName',
            value: 'string'
          }
        ],
        left: {
          left: {
            value: 'foo',
            type: 'JsdocTypeName'
          },
          right: {
            type: 'JsdocTypeProperty',
            value: 'Promise',
            meta: {
              quote: undefined
            }
          },
          pathType: 'property',
          type: 'JsdocTypeNamePath'
        },
        meta: {
          dot: true,
          brackets: 'angle'
        }
      },
      modes: [
        'typescript',
        'jsdoc',
        'closure'
      ],
      catharsis: {
        closure: 'closure',
        jsdoc: 'jsdoc'
      },
      jtp: {
        closure: 'closure',
        jsdoc: 'jsdoc',
        typescript: 'typescript',
        permissive: 'closure'
      }
    })
  })
})
