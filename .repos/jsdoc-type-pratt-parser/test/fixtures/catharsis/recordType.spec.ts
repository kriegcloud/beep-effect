import { testFixture } from '../Fixture.js'

describe('catharsis record type tests', () => {
  describe('empty record type', () => {
    testFixture({
      input: '{}',
      expected: {
        type: 'JsdocTypeObject',
        meta: {
          separator: 'comma'
        },
        elements: []
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

  describe('record type with 1 typed property', () => {
    testFixture({
      input: '{myNum: number}',
      expected: {
        type: 'JsdocTypeObject',
        meta: {
          separator: 'comma'
        },
        elements: [
          {
            type: 'JsdocTypeObjectField',
            key: 'myNum',
            meta: {
              quote: undefined
            },
            optional: false,
            readonly: false,
            right: {
              type: 'JsdocTypeName',
              value: 'number'
            }
          }
        ]
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

  describe('repeatable record type with 1 typed property', () => {
    testFixture({
      input: '...{myNum: number}',
      expected: {
        type: 'JsdocTypeVariadic',
        element: {
          type: 'JsdocTypeObject',
          meta: {
            separator: 'comma'
          },
          elements: [
            {
              type: 'JsdocTypeObjectField',
              key: 'myNum',
              meta: {
                quote: undefined
              },
              optional: false,
              readonly: false,
              right: {
                type: 'JsdocTypeName',
                value: 'number'
              }
            }
          ]
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

  describe('optional record type with 1 typed property', () => {
    testFixture({
      input: '{myNum: number}=',
      expected: {
        type: 'JsdocTypeOptional',
        element: {
          type: 'JsdocTypeObject',
          meta: {
            separator: 'comma'
          },
          elements: [
            {
              type: 'JsdocTypeObjectField',
              key: 'myNum',
              meta: {
                quote: undefined
              },
              optional: false,
              readonly: false,
              right: {
                type: 'JsdocTypeName',
                value: 'number'
              }
            }
          ]
        },
        meta: {
          position: 'suffix'
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

  describe('nullable record type with 1 typed property', () => {
    testFixture({
      input: '?{myNum: number}',
      expected: {
        type: 'JsdocTypeNullable',
        element: {
          type: 'JsdocTypeObject',
          meta: {
            separator: 'comma'
          },
          elements: [
            {
              type: 'JsdocTypeObjectField',
              key: 'myNum',
              meta: {
                quote: undefined
              },
              optional: false,
              readonly: false,
              right: {
                type: 'JsdocTypeName',
                value: 'number'
              }
            }
          ]
        },
        meta: {
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

  describe('non-nullable record type with 1 typed property', () => {
    testFixture({
      input: '!{myNum: number}',
      expected: {
        type: 'JsdocTypeNotNullable',
        element: {
          type: 'JsdocTypeObject',
          meta: {
            separator: 'comma'
          },
          elements: [
            {
              type: 'JsdocTypeObjectField',
              key: 'myNum',
              meta: {
                quote: undefined
              },
              optional: false,
              readonly: false,
              right: {
                type: 'JsdocTypeName',
                value: 'number'
              }
            }
          ]
        },
        meta: {
          position: 'prefix'
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

  describe('record type with 1 typed property and 1 untyped property', () => {
    testFixture({
      input: '{myNum: number, myObject}',
      expected: {
        type: 'JsdocTypeObject',
        meta: {
          separator: 'comma'
        },
        elements: [
          {
            type: 'JsdocTypeObjectField',
            key: 'myNum',
            meta: {
              quote: undefined
            },
            optional: false,
            readonly: false,
            right: {
              type: 'JsdocTypeName',
              value: 'number'
            }
          },
          {
            type: 'JsdocTypeObjectField',
            key: 'myObject',
            right: undefined,
            optional: false,
            readonly: false,
            meta: {
              quote: undefined
            }
          }
        ]
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

  describe('record type with 2 typed properties and semicolon separator', () => {
    testFixture({
      input: '{myNum: number; myObject: string}',
      expected: {
        type: 'JsdocTypeObject',
        meta: {
          separator: 'semicolon'
        },
        elements: [
          {
            type: 'JsdocTypeObjectField',
            key: 'myNum',
            meta: {
              quote: undefined
            },
            optional: false,
            readonly: false,
            right: {
              type: 'JsdocTypeName',
              value: 'number'
            }
          },
          {
            type: 'JsdocTypeObjectField',
            key: 'myObject',
            meta: {
              quote: undefined
            },
            optional: false,
            readonly: false,
            right: {
              type: 'JsdocTypeName',
              value: 'string'
            }
          }
        ]
      },
      modes: [
        'typescript',
        'jsdoc',
        'closure'
      ],
      catharsis: {
        closure: 'fail',
        jsdoc: 'fail'
      },
      jtp: {
        closure: 'closure',
        jsdoc: 'jsdoc',
        typescript: 'typescript',
        permissive: 'closure'
      }
    })
  })

  describe('record type with a property that uses a type application as a value', () => {
    testFixture({
      input: '{myArray: Array.<string>}',
      expected: {
        type: 'JsdocTypeObject',
        meta: {
          separator: 'comma'
        },
        elements: [
          {
            type: 'JsdocTypeObjectField',
            key: 'myArray',
            meta: {
              quote: undefined
            },
            optional: false,
            readonly: false,
            right: {
              type: 'JsdocTypeGeneric',
              left: {
                type: 'JsdocTypeName',
                value: 'Array'
              },
              elements: [
                {
                  type: 'JsdocTypeName',
                  value: 'string'
                }
              ],
              meta: {
                dot: true,
                brackets: 'angle'
              }
            }
          }
        ]
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

  describe('record type with a property that uses a type union as a value', () => {
    testFixture({
      input: '{myKey: (number|boolean|string)}',
      stringified: '{myKey: (number | boolean | string)}',
      expected: {
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
              type: 'JsdocTypeParenthesis',
              element: {
                type: 'JsdocTypeUnion',
                elements: [
                  {
                    type: 'JsdocTypeName',
                    value: 'number'
                  },
                  {
                    type: 'JsdocTypeName',
                    value: 'boolean'
                  },
                  {
                    type: 'JsdocTypeName',
                    value: 'string'
                  }
                ]
              }
            }
          }
        ]
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

  describe('record type with a property that uses a JavaScript keyword as a key', () => {
    testFixture({
      input: '{continue: string}',
      expected: {
        type: 'JsdocTypeObject',
        meta: {
          separator: 'comma'
        },
        elements: [
          {
            type: 'JsdocTypeObjectField',
            key: 'continue',
            meta: {
              quote: undefined
            },
            optional: false,
            readonly: false,
            right: {
              type: 'JsdocTypeName',
              value: 'string'
            }
          }
        ]
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

  describe('record type with a property that uses a JavaScript future reserved word as a key', () => {
    testFixture({
      input: '{class: string}',
      expected: {
        type: 'JsdocTypeObject',
        meta: {
          separator: 'comma'
        },
        elements: [
          {
            type: 'JsdocTypeObjectField',
            key: 'class',
            meta: {
              quote: undefined
            },
            optional: false,
            readonly: false,
            right: {
              type: 'JsdocTypeName',
              value: 'string'
            }
          }
        ]
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

  describe('record type with a property that uses a string representation of a JavaScript boolean literal as a key', () => {
    testFixture({
      input: '{true: string}',
      expected: {
        type: 'JsdocTypeObject',
        meta: {
          separator: 'comma'
        },
        elements: [
          {
            type: 'JsdocTypeObjectField',
            key: 'true',
            meta: {
              quote: undefined
            },
            optional: false,
            readonly: false,
            right: {
              type: 'JsdocTypeName',
              value: 'string'
            }
          }
        ]
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

  describe('record type with a property that uses a numeric key', () => {
    testFixture({
      input: '{0: string}',
      expected: {
        type: 'JsdocTypeObject',
        meta: {
          separator: 'comma'
        },
        elements: [
          {
            type: 'JsdocTypeObjectField',
            key: '0',
            meta: {
              quote: undefined
            },
            optional: false,
            readonly: false,
            right: {
              type: 'JsdocTypeName',
              value: 'string'
            }
          }
        ]
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
