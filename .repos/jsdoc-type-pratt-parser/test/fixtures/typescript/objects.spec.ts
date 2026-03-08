import { testFixture } from '../Fixture.js'

describe('typescript objects tests', () => {
  describe('simple object with trailing semicolon separator', () => {
    testFixture({
      input: '{ object: string; }',
      stringified: '{object: string}',
      expected: {
        type: 'JsdocTypeObject',
        meta: {
          separator: 'semicolon'
        },
        elements: [
          {
            type: 'JsdocTypeObjectField',
            key: 'object',
            optional: false,
            readonly: false,
            right: {
              type: 'JsdocTypeName',
              value: 'string'
            },
            meta: {
              quote: undefined
            }
          }
        ]
      },
      modes: [
        'jsdoc',
        'closure',
        'typescript'
      ],
      catharsis: {
        closure: 'fail',
        jsdoc: 'fail'
      },
      jtp: {
        closure: 'differ',
        jsdoc: 'differ',
        typescript: 'typescript',
        permissive: 'typescript'
      }
    })
  })

  describe('optional entry', () => {
    // there seems to be a catharsis error: https://github.com/hegemonic/catharsis/blob/222e8fc4350c346b47ca8395c37512290979df12/lib/parser.pegjs#L555
    testFixture({
      input: '{ object?: string, key: string }',
      stringified: '{object?: string, key: string}',
      diffExpected: {
        typescript: {
          type: 'JsdocTypeObject',
          meta: {
            separator: 'comma'
          },
          elements: [
            {
              type: 'JsdocTypeObjectField',
              key: 'object',
              optional: true,
              readonly: false,
              meta: {
                quote: undefined
              },
              right: {
                type: 'JsdocTypeName',
                value: 'string'
              }
            },
            {
              type: 'JsdocTypeObjectField',
              key: 'key',
              optional: false,
              readonly: false,
              meta: {
                quote: undefined
              },
              right: {
                type: 'JsdocTypeName',
                value: 'string'
              }
            }
          ]
        },
        jsdoc: {
          type: 'JsdocTypeObject',
          meta: {
            separator: 'comma'
          },
          elements: [
            {
              type: 'JsdocTypeJsdocObjectField',
              left: {
                type: 'JsdocTypeNullable',
                element: {
                  type: 'JsdocTypeName',
                  value: 'object'
                },
                meta: {
                  position: 'suffix'
                }
              },
              right: {
                type: 'JsdocTypeName',
                value: 'string'
              }
            },
            {
              type: 'JsdocTypeObjectField',
              key: 'key',
              optional: false,
              readonly: false,
              meta: {
                quote: undefined
              },
              right: {
                type: 'JsdocTypeName',
                value: 'string'
              }
            }
          ]
        }
      },
      modes: [
        'jsdoc',
        'typescript'
      ],
      catharsis: {
        closure: 'fail',
        jsdoc: 'fail'
      },
      jtp: {
        closure: 'differ',
        jsdoc: 'differ',
        typescript: 'typescript',
        permissive: 'typescript'
      }
    })
  })

  describe('An object with unenclosed union as type', () => {
    testFixture({
      input: '{message: string|undefined}',
      stringified: '{message: string | undefined}',
      expected: {
        type: 'JsdocTypeObject',
        meta: {
          separator: 'comma'
        },
        elements: [
          {
            type: 'JsdocTypeObjectField',
            key: 'message',
            optional: false,
            readonly: false,
            right: {
              type: 'JsdocTypeUnion',
              elements: [
                {
                  type: 'JsdocTypeName',
                  value: 'string'
                },
                {
                  type: 'JsdocTypeUndefined'
                }
              ]
            },
            meta: {
              quote: undefined
            }
          }
        ]
      },
      modes: [
        'jsdoc',
        'closure',
        'typescript'
      ],
      catharsis: {
        jsdoc: 'jsdoc',
        closure: 'closure'
      },
      jtp: {
        jsdoc: 'jsdoc',
        closure: 'closure',
        typescript: 'typescript',
        permissive: 'typescript'
      }
    })
  })

  describe('An object an optional field without a type', () => {
    testFixture({
      input: '{ message?} ',
      stringified: '{message?}',
      expected: {
        type: 'JsdocTypeObject',
        meta: {
          separator: 'comma'
        },
        elements: [
          {
            type: 'JsdocTypeObjectField',
            key: 'message',
            optional: true,
            readonly: false,
            right: undefined,
            meta: {
              quote: undefined
            }
          }
        ]
      },
      modes: [
        'jsdoc', // TODO: should this fail in closure or jsdoc?
        'closure',
        'typescript'
      ],
      catharsis: {
        jsdoc: 'fail',
        closure: 'fail'
      },
      jtp: {
        jsdoc: 'fail',
        closure: 'fail',
        typescript: 'fail',
        permissive: 'fail'
      }
    })
  })

  describe('object property named module', () => {
    testFixture({
      input: '{module: type}',
      modes: ['jsdoc', 'closure', 'typescript'],
      expected: {
        type: 'JsdocTypeObject',
        elements: [
          {
            type: 'JsdocTypeObjectField',
            key: 'module',
            optional: false,
            readonly: false,
            right: {
              type: 'JsdocTypeName',
              value: 'type'
            },
            meta: {
              quote: undefined
            }
          }
        ],
        meta: {
          separator: 'comma'
        }
      }
    })
  })

  describe('object property set to question mark unknown', () => {
    testFixture({
      input: '{abc: ?}',
      modes: ['jsdoc', 'closure', 'typescript'],
      expected: {
        type: 'JsdocTypeObject',
        elements: [
          {
            type: 'JsdocTypeObjectField',
            key: 'abc',
            optional: false,
            readonly: false,
            right: {
              type: 'JsdocTypeUnknown'
            },
            meta: {
              quote: undefined
            }
          }
        ],
        meta: {
          separator: 'comma'
        }
      }
    })
  })

  describe('object property named typeof', () => {
    testFixture({
      input: '{typeof: type}',
      modes: ['jsdoc', 'closure', 'typescript'],
      expected: {
        type: 'JsdocTypeObject',
        elements: [
          {
            type: 'JsdocTypeObjectField',
            key: 'typeof',
            optional: false,
            readonly: false,
            right: {
              type: 'JsdocTypeName',
              value: 'type'
            },
            meta: {
              quote: undefined
            }
          }
        ],
        meta: {
          separator: 'comma'
        }
      }
    })
  })

  describe('object type with a property that uses a TypeScript keyword (readonly) as a key', () => {
    testFixture({
      input: '{readonly: string}',
      expected: {
        type: 'JsdocTypeObject',
        meta: {
          separator: 'comma'
        },
        elements: [
          {
            type: 'JsdocTypeObjectField',
            key: 'readonly',
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
        'typescript'
      ]
    })
  })

  describe('object type with a property that uses a TypeScript keyword (function) as a key', () => {
    testFixture({
      input: '{function: string}',
      expected: {
        type: 'JsdocTypeObject',
        meta: {
          separator: 'comma'
        },
        elements: [
          {
            type: 'JsdocTypeObjectField',
            key: 'function',
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
        'typescript', 'jsdoc'
      ]
    })
  })

  describe('linebreaks can be separators', () => {
    testFixture({
      input:
        `{
  range: boolean
  loc: boolean
}`,
      stringified: '{\n  range: boolean\n  loc: boolean\n}',
      modes: ['typescript', 'jsdoc', 'closure'],
      expected: {
        type: 'JsdocTypeObject',
        meta: {
          separator: 'linebreak',
          propertyIndent: '  '
        },
        elements: [
          {
            type: 'JsdocTypeObjectField',
            key: 'range',
            optional: false,
            readonly: false,
            right: {
              type: 'JsdocTypeName',
              value: 'boolean'
            },
            meta: {
              quote: undefined
            }
          },
          {
            type: 'JsdocTypeObjectField',
            key: 'loc',
            optional: false,
            readonly: false,
            right: {
              type: 'JsdocTypeName',
              value: 'boolean'
            },
            meta: {
              quote: undefined
            }
          }
        ]
      }
    })
  })

  describe('commas can follow linebreaks', () => {
    testFixture({
      input:
        `{
  range: boolean
,}`,
      stringified: '{range: boolean}',
      modes: ['typescript', 'jsdoc', 'closure'],
      expected: {
        type: 'JsdocTypeObject',
        meta: {
          separator: 'linebreak',
          propertyIndent: '  '
        },
        elements: [
          {
            type: 'JsdocTypeObjectField',
            key: 'range',
            optional: false,
            readonly: false,
            right: {
              type: 'JsdocTypeName',
              value: 'boolean'
            },
            meta: {
              quote: undefined
            }
          }
        ]
      }
    })
  })

  describe('semicolons can follow linebreaks', () => {
    testFixture({
      input:
        `{
  range: boolean
;}`,
      stringified: '{range: boolean}',
      modes: ['typescript', 'jsdoc', 'closure'],
      expected: {
        type: 'JsdocTypeObject',
        meta: {
          separator: 'linebreak',
          propertyIndent: '  '
        },
        elements: [
          {
            type: 'JsdocTypeObjectField',
            key: 'range',
            optional: false,
            readonly: false,
            right: {
              type: 'JsdocTypeName',
              value: 'boolean'
            },
            meta: {
              quote: undefined
            }
          }
        ]
      }
    })
  })

  describe('comma-and-linebreaks can be separators', () => {
    testFixture({
      input:
        `{
  range: boolean,
  loc: boolean
}`,
      stringified: '{\n  range: boolean,\n  loc: boolean\n}',
      modes: ['typescript', 'jsdoc', 'closure'],
      expected: {
        type: 'JsdocTypeObject',
        meta: {
          separator: 'comma-and-linebreak',
          propertyIndent: '  '
        },
        elements: [
          {
            type: 'JsdocTypeObjectField',
            key: 'range',
            optional: false,
            readonly: false,
            right: {
              type: 'JsdocTypeName',
              value: 'boolean'
            },
            meta: {
              quote: undefined
            }
          },
          {
            type: 'JsdocTypeObjectField',
            key: 'loc',
            optional: false,
            readonly: false,
            right: {
              type: 'JsdocTypeName',
              value: 'boolean'
            },
            meta: {
              quote: undefined
            }
          }
        ]
      }
    })
  })

  describe('semicolon-and-linebreaks can be separators', () => {
    testFixture({
      input:
        `{
  range: boolean;
  loc: boolean
}`,
      stringified: '{\n  range: boolean;\n  loc: boolean\n}',
      modes: ['typescript', 'jsdoc', 'closure'],
      expected: {
        type: 'JsdocTypeObject',
        meta: {
          separator: 'semicolon-and-linebreak',
          propertyIndent: '  '
        },
        elements: [
          {
            type: 'JsdocTypeObjectField',
            key: 'range',
            optional: false,
            readonly: false,
            right: {
              type: 'JsdocTypeName',
              value: 'boolean'
            },
            meta: {
              quote: undefined
            }
          },
          {
            type: 'JsdocTypeObjectField',
            key: 'loc',
            optional: false,
            readonly: false,
            right: {
              type: 'JsdocTypeName',
              value: 'boolean'
            },
            meta: {
              quote: undefined
            }
          }
        ]
      }
    })
  })

  describe('multiple levels of square brackets', () => {
    testFixture({
      input: 'obj["level1"]["level2"]',
      modes: ['typescript'],
      expected: {
        type: 'JsdocTypeNamePath',
        left: {
          type: 'JsdocTypeNamePath',
          left: {
            type: 'JsdocTypeName',
            value: 'obj'
          },
          right: {
            type: 'JsdocTypeProperty',
            value: 'level1',
            meta: {
              quote: 'double'
            }
          },
          pathType: 'property-brackets'
        },
        right: {
          type: 'JsdocTypeProperty',
          value: 'level2',
          meta: {
            quote: 'double'
          }
        },
        pathType: 'property-brackets'
      }
    })
  })

  describe('indexed access type', () => {
    testFixture({
      input: 'obj[keyof a]',
      modes: ['typescript'],
      expected: {
        type: 'JsdocTypeNamePath',
        left: {
          type: 'JsdocTypeName',
          value: 'obj'
        },
        right: {
          right: {
            element: {
              type: 'JsdocTypeName',
              value: 'a'
            },
            type: 'JsdocTypeKeyof'
          },
          type: 'JsdocTypeIndexedAccessIndex',
        },
        pathType: 'property-brackets'
      }
    })
  })

  describe('index signatures', () => {
    testFixture({
      input: '{[key: string]: number}',
      modes: ['typescript'],
      expected: {
        type: 'JsdocTypeObject',
        meta: {
          separator: 'comma'
        },
        elements: [
          {
            type: 'JsdocTypeObjectField',
            key: {
              type: 'JsdocTypeIndexSignature',
              key: 'key',
              right: {
                type: 'JsdocTypeName',
                value: 'string'
              }
            },
            optional: false,
            readonly: false,
            right: {
              type: 'JsdocTypeName',
              value: 'number'
            },
            meta: {
              quote: undefined
            }
          }
        ]
      }
    })
  })

  describe('mapped type clauses', () => {
    testFixture({
      input: '{[key in Type]: number}',
      modes: ['typescript'],
      expected: {
        type: 'JsdocTypeObject',
        meta: {
          separator: 'comma'
        },
        elements: [
          {
            type: 'JsdocTypeObjectField',
            key: {
              type: 'JsdocTypeMappedType',
              key: 'key',
              right: {
                type: 'JsdocTypeName',
                value: 'Type'
              }
            },
            optional: false,
            readonly: false,
            right: {
              type: 'JsdocTypeName',
              value: 'number'
            },
            meta: {
              quote: undefined
            }
          }
        ]
      }
    })
  })

  describe('readonly and optional mapped type clauses', () => {
    testFixture({
      input: '{readonly [key in Type]?: number}',
      modes: ['typescript'],
      expected: {
        type: 'JsdocTypeObject',
        meta: {
          separator: 'comma'
        },
        elements: [
          {
            type: 'JsdocTypeObjectField',
            key: {
              type: 'JsdocTypeMappedType',
              key: 'key',
              right: {
                type: 'JsdocTypeName',
                value: 'Type'
              }
            },
            optional: true,
            readonly: true,
            right: {
              type: 'JsdocTypeName',
              value: 'number'
            },
            meta: {
              quote: undefined
            }
          }
        ]
      }
    })
  })

  describe('mapped type clauses (more complex)', () => {
    testFixture({
      input: '{[key in AvailableArbitraryType]: Partial<TypeObject> | string[]}',
      modes: ['typescript'],
      expected: {
        type: 'JsdocTypeObject',
        meta: {
          separator: 'comma'
        },
        elements: [
          {
            type: 'JsdocTypeObjectField',
            key: {
              type: 'JsdocTypeMappedType',
              key: 'key',
              right: {
                type: 'JsdocTypeName',
                value: 'AvailableArbitraryType'
              }
            },
            optional: false,
            readonly: false,
            right: {
              elements: [
                {
                  elements: [
                    {
                      type: 'JsdocTypeName',
                      value: 'TypeObject'
                    }
                  ],
                  left: {
                    type: 'JsdocTypeName',
                    value: 'Partial'
                  },
                  meta: {
                    brackets: 'angle',
                    dot: false
                  },
                  type: 'JsdocTypeGeneric'
                },
                {
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
                    brackets: 'square',
                    dot: false
                  },
                  type: 'JsdocTypeGeneric'
                }
              ],
              type: 'JsdocTypeUnion'
            },
            meta: {
              quote: undefined
            }
          }
        ]
      }
    })
  })

  describe('mapped type with string literal union keys and function value', () => {
    testFixture({
      input: '{[key in "abc"|"def"]?: (node: Node, ...extraArgs: any[]) => void}',
      stringified: '{[key in "abc" | "def"]?: (node: Node, ...extraArgs: any[]) => void}',
      modes: ['typescript'],
      expected: {
        type: 'JsdocTypeObject',
        meta: { separator: 'comma' },
        elements: [
          {
            type: 'JsdocTypeObjectField',
            key: {
              type: 'JsdocTypeMappedType',
              key: 'key',
              right: {
                type: 'JsdocTypeUnion',
                elements: [
                  {
                    type: 'JsdocTypeStringValue',
                    value: 'abc',
                    meta: { quote: 'double' }
                  },
                  {
                    type: 'JsdocTypeStringValue',
                    value: 'def',
                    meta: { quote: 'double' }
                  }
                ]
              }
            },
            optional: true,
            readonly: false,
            right: {
              type: 'JsdocTypeFunction',
              parameters: [
                {
                  type: 'JsdocTypeKeyValue',
                  key: 'node',
                  optional: false,
                  variadic: false,
                  right: {
                    type: 'JsdocTypeName',
                    value: 'Node'
                  }
                },
                {
                  type: 'JsdocTypeKeyValue',
                  key: 'extraArgs',
                  optional: false,
                  variadic: true,
                  right: {
                    type: 'JsdocTypeGeneric',
                    left: { type: 'JsdocTypeName', value: 'Array' },
                    elements: [ { type: 'JsdocTypeName', value: 'any' } ],
                    meta: { brackets: 'square', dot: false }
                  }
                }
              ],
              returnType: { type: 'JsdocTypeName', value: 'void' },
              arrow: true,
              constructor: false,
              parenthesis: true
            },
            meta: { quote: undefined }
          }
        ]
      }
    })
  })

  describe('mapped type with string literal key', () => {
    testFixture({
      input: '{[key in "abc"]: number}',
      modes: ['typescript'],
      expected: {
        type: 'JsdocTypeObject',
        meta: { separator: 'comma' },
        elements: [
          {
            type: 'JsdocTypeObjectField',
            key: {
              type: 'JsdocTypeMappedType',
              key: 'key',
              right: {
                type: 'JsdocTypeStringValue',
                value: 'abc',
                meta: { quote: 'double' }
              }
            },
            optional: false,
            readonly: false,
            right: { type: 'JsdocTypeName', value: 'number' },
            meta: { quote: undefined }
          }
        ]
      }
    })
  })

  describe('mapped type with string literal union keys', () => {
    testFixture({
      input: '{[key in "abc"|"def"]: number}',
      stringified: '{[key in "abc" | "def"]: number}',
      modes: ['typescript'],
      expected: {
        type: 'JsdocTypeObject',
        meta: { separator: 'comma' },
        elements: [
          {
            type: 'JsdocTypeObjectField',
            key: {
              type: 'JsdocTypeMappedType',
              key: 'key',
              right: {
                type: 'JsdocTypeUnion',
                elements: [
                  { type: 'JsdocTypeStringValue', value: 'abc', meta: { quote: 'double' } },
                  { type: 'JsdocTypeStringValue', value: 'def', meta: { quote: 'double' } }
                ]
              }
            },
            optional: false,
            readonly: false,
            right: { type: 'JsdocTypeName', value: 'number' },
            meta: { quote: undefined }
          }
        ]
      }
    })
  })

  describe('union in index signature', () => {
    testFixture({
      input: '{[key: string | number]: boolean}',
      expected: {
        type: 'JsdocTypeObject',
        meta: {
          separator: 'comma'
        },
        elements: [
          {
            type: 'JsdocTypeObjectField',
            key: {
              type: 'JsdocTypeIndexSignature',
              key: 'key',
              right: {
                type: 'JsdocTypeUnion',
                elements: [
                  {
                    type: 'JsdocTypeName',
                    value: 'string'
                  },
                  {
                    type: 'JsdocTypeName',
                    value: 'number'
                  }
                ]
              }
            },
            right: {
              type: 'JsdocTypeName',
              value: 'boolean'
            },
            optional: false,
            readonly: false,
            meta: {
              quote: undefined
            }
          }
        ]
      },
      modes: ['typescript']
    })
  })

  describe('readonly in index signatures', () => {
    testFixture({
      input: '{readonly [key: string]: number}',
      modes: ['typescript'],
      expected: {
        type: 'JsdocTypeObject',
        meta: {
          separator: 'comma'
        },
        elements: [
          {
            type: 'JsdocTypeObjectField',
            key: {
              type: 'JsdocTypeIndexSignature',
              key: 'key',
              right: {
                type: 'JsdocTypeName',
                value: 'string'
              }
            },
            optional: false,
            readonly: true,
            right: {
              type: 'JsdocTypeName',
              value: 'number'
            },
            meta: {
              quote: undefined
            }
          }
        ]
      }
    })

    testFixture({
      input: '{readonly [type: string]: ReadonlyArray<string>}',
      modes: ['typescript'],
      expected: {
        type: 'JsdocTypeObject',
        meta: {
          separator: 'comma'
        },
        elements: [
          {
            type: 'JsdocTypeObjectField',
            key: {
              type: 'JsdocTypeIndexSignature',
              key: 'type',
              right: {
                type: 'JsdocTypeName',
                value: 'string'
              }
            },
            right: {
              type: 'JsdocTypeGeneric',
              left: {
                type: 'JsdocTypeName',
                value: 'ReadonlyArray'
              },
              elements: [
                {
                  type: 'JsdocTypeName',
                  value: 'string'
                }
              ],
              meta: {
                brackets: 'angle',
                dot: false
              }
            },
            optional: false,
            readonly: true,
            meta: {
              quote: undefined
            }
          }
        ]
      }
    })
  })
})
