import { testFixture } from '../Fixture.js'

describe('catharsis jsdoc tests', () => {
  describe('name expression that starts with the word "function"', () => {
    testFixture({
      input: 'functional',
      expected: {
        type: 'JsdocTypeName',
        value: 'functional'
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

  describe('name expression with instance scope punctuation', () => {
    testFixture({
      input: 'MyClass#myMember',
      expected: {
        type: 'JsdocTypeNamePath',
        left: {
          type: 'JsdocTypeName',
          value: 'MyClass'
        },
        right: {
          type: 'JsdocTypeProperty',
          value: 'myMember',
          meta: {
            quote: undefined
          }
        },
        pathType: 'instance'
      },
      modes: [
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
        typescript: 'differ',
        permissive: 'jsdoc'
      }
    })
  })

  describe('name expression with inner scope punctuation', () => {
    testFixture({
      input: 'MyClass~myMember',
      expected: {
        type: 'JsdocTypeNamePath',
        left: {
          type: 'JsdocTypeName',
          value: 'MyClass'
        },
        right: {
          type: 'JsdocTypeProperty',
          value: 'myMember',
          meta: {
            quote: undefined
          }
        },
        pathType: 'inner'
      },
      modes: [
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
        typescript: 'differ',
        permissive: 'jsdoc'
      }
    })
  })

  describe('name expression with instance and inner scope punctuation', () => {
    testFixture({
      input: 'MyClass#myMember#yourMember~theirMember',
      expected: {
        type: 'JsdocTypeNamePath',
        left: {
          type: 'JsdocTypeNamePath',
          left: {
            type: 'JsdocTypeNamePath',
            left: {
              type: 'JsdocTypeName',
              value: 'MyClass'
            },
            right: {
              type: 'JsdocTypeProperty',
              value: 'myMember',
              meta: {
                quote: undefined
              }
            },
            pathType: 'instance'
          },
          right: {
            type: 'JsdocTypeProperty',
            value: 'yourMember',
            meta: {
              quote: undefined
            }
          },
          pathType: 'instance'
        },
        right: {
          type: 'JsdocTypeProperty',
          value: 'theirMember',
          meta: {
            quote: undefined
          }
        },
        pathType: 'inner'
      },
      modes: [
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
        typescript: 'differ',
        permissive: 'jsdoc'
      }
    })
  })

  describe('name expression for a class within a module', () => {
    testFixture({
      input: 'module:foo/bar/baz~Qux',
      expected: {
        type: 'JsdocTypeNamePath',
        left: {
          value: 'foo/bar/baz',
          type: 'JsdocTypeSpecialNamePath',
          specialType: 'module',
          meta: {
            quote: undefined
          }
        },
        right: {
          type: 'JsdocTypeProperty',
          value: 'Qux',
          meta: {
            quote: undefined
          }
        },
        pathType: 'inner'
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
        typescript: 'fail',
        permissive: 'jsdoc'
      }
    })
  })

  describe('name expression for a class within a module with hyphens', () => {
    testFixture({
      input: 'module:foo-bar/baz~Qux',
      expected: {
        type: 'JsdocTypeNamePath',
        left: {
          value: 'foo-bar/baz',
          type: 'JsdocTypeSpecialNamePath',
          specialType: 'module',
          meta: {
            quote: undefined
          }
        },
        right: {
          type: 'JsdocTypeProperty',
          value: 'Qux',
          meta: {
            quote: undefined
          }
        },
        pathType: 'inner'
      },
      modes: [
        'jsdoc',
        'closure',
      ],
      catharsis: {
        closure: 'closure',
        jsdoc: 'jsdoc'
      },
      jtp: {
        closure: 'closure',
        jsdoc: 'jsdoc',
        typescript: 'fail',
        permissive: 'jsdoc'
      }
    })
  })

  describe('name expression containing a reserved word', () => {
    testFixture({
      input: 'this',
      error: 'Unexpected reserved keyword "this"'
    })
  })

  describe('name expression for a symbol variation whose name is an empty string', () => {
    testFixture({
      input: 'MyClass()',
      expected: {
        value: 'MyClass',
        type: 'JsdocTypeSymbol'
      },
      modes: [
        'jsdoc',
        'closure'
      ],
      catharsis: {
        closure: 'closure',
        jsdoc: 'jsdoc'
      },
      jtp: {
        closure: 'fail',
        jsdoc: 'fail',
        typescript: 'fail',
        permissive: 'fail'
      }
    })
  })

  describe('name expression for a symbol variation whose name is one numeral', () => {
    testFixture({
      input: 'MyClass(2)',
      expected: {
        value: 'MyClass',
        type: 'JsdocTypeSymbol',
        element: {
          type: 'JsdocTypeNumber',
          value: 2
        }
      },
      modes: [
        'jsdoc',
        'closure'
      ],
      catharsis: {
        closure: 'closure',
        jsdoc: 'jsdoc'
      },
      jtp: {
        closure: 'fail',
        jsdoc: 'fail',
        typescript: 'fail',
        permissive: 'fail'
      }
    })
  })

  describe('name expression for a symbol variation whose name is multiple numerals', () => {
    testFixture({
      input: 'MyClass(23456)',
      expected: {
        value: 'MyClass',
        type: 'JsdocTypeSymbol',
        element: {
          type: 'JsdocTypeNumber',
          value: 23456
        }
      },
      modes: [
        'jsdoc',
        'closure'
      ],
      catharsis: {
        closure: 'closure',
        jsdoc: 'jsdoc'
      },
      jtp: {
        closure: 'fail',
        jsdoc: 'fail',
        typescript: 'fail',
        permissive: 'fail'
      }
    })
  })

  describe('name expression for a symbol variation whose name is one letter', () => {
    testFixture({
      input: 'MyClass(a)',
      expected: {
        value: 'MyClass',
        type: 'JsdocTypeSymbol',
        element: {
          value: 'a',
          type: 'JsdocTypeName'
        }
      },
      modes: [
        'jsdoc',
        'closure'
      ],
      catharsis: {
        closure: 'closure',
        jsdoc: 'jsdoc'
      },
      jtp: {
        closure: 'fail',
        jsdoc: 'fail',
        typescript: 'fail',
        permissive: 'fail'
      }
    })
  })

  describe('name expression for a symbol variation whose name is multiple letters', () => {
    testFixture({
      input: 'MyClass(abcde)',
      expected: {
        value: 'MyClass',
        type: 'JsdocTypeSymbol',
        element: {
          value: 'abcde',
          type: 'JsdocTypeName'
        }
      },
      modes: [
        'jsdoc',
        'closure'
      ],
      catharsis: {
        closure: 'closure',
        jsdoc: 'jsdoc'
      },
      jtp: {
        closure: 'fail',
        jsdoc: 'fail',
        typescript: 'fail',
        permissive: 'fail'
      }
    })
  })

  describe('name expression enclosed in double quotes', () => {
    testFixture({
      input: '"foo.bar.baz"',
      expected: {
        type: 'JsdocTypeStringValue',
        value: 'foo.bar.baz',
        meta: {
          quote: 'double'
        }
      },
      modes: [
        'typescript',
        'jsdoc'
      ],
      catharsis: {
        closure: 'fail',
        jsdoc: 'jsdoc'
      },
      jtp: {
        closure: 'differ',
        jsdoc: 'jsdoc',
        typescript: 'typescript',
        permissive: 'jsdoc'
      }
    })
  })

  describe('name expression enclosed in single quotes', () => {
    testFixture({
      input: "'foo.bar.baz'",
      expected: {
        type: 'JsdocTypeStringValue',
        value: 'foo.bar.baz',
        meta: {
          quote: 'single'
        }
      },
      modes: [
        'typescript',
        'jsdoc'
      ],
      catharsis: {
        closure: 'fail',
        jsdoc: 'jsdoc'
      },
      jtp: {
        closure: 'differ',
        jsdoc: 'jsdoc',
        typescript: 'typescript',
        permissive: 'jsdoc'
      }
    })
  })

  describe('name expression partially enclosed in double quotes', () => {
    testFixture({
      input: 'foo."bar.baz".qux',
      expected: {
        left: {
          left: {
            value: 'foo',
            type: 'JsdocTypeName'
          },
          right: {
            type: 'JsdocTypeProperty',
            value: 'bar.baz',
            meta: {
              quote: 'double'
            }
          },
          type: 'JsdocTypeNamePath',
          pathType: 'property'
        },
        right: {
          type: 'JsdocTypeProperty',
          value: 'qux',
          meta: {
            quote: undefined
          }
        },
        type: 'JsdocTypeNamePath',
        pathType: 'property'
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

  describe('name expression partially enclosed in single quotes', () => {
    testFixture({
      input: "foo.'bar.baz'.qux",
      expected: {
        left: {
          left: {
            value: 'foo',
            type: 'JsdocTypeName'
          },
          right: {
            type: 'JsdocTypeProperty',
            value: 'bar.baz',
            meta: {
              quote: 'single'
            }
          },
          type: 'JsdocTypeNamePath',
          pathType: 'property'
        },
        right: {
          type: 'JsdocTypeProperty',
          value: 'qux',
          meta: {
            quote: undefined
          }
        },
        type: 'JsdocTypeNamePath',
        pathType: 'property'
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

  describe('identifier with a repeatable param that is not enclosed in brackets', () => {
    testFixture({
      input: 'MyClass(...foo)',
      expected: {
        value: 'MyClass',
        type: 'JsdocTypeSymbol',
        element: {
          type: 'JsdocTypeVariadic',
          element: {
            value: 'foo',
            type: 'JsdocTypeName'
          },
          meta: {
            squareBrackets: false,
            position: 'prefix'
          }
        }
      },
      modes: [
        'jsdoc',
        'closure'
      ],
      catharsis: {
        closure: 'closure',
        jsdoc: 'jsdoc'
      },
      jtp: {
        closure: 'fail',
        jsdoc: 'fail',
        typescript: 'fail',
        permissive: 'fail'
      }
    })
  })

  describe('type application with no period', () => {
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
          brackets: 'angle',
          dot: false
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

  describe('Jsdoc Toolkit 2-style array notation for an array of strings', () => {
    testFixture({
      input: 'string[]',
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
          brackets: 'square',
          dot: false
        }
      },
      modes: [
        'typescript',
        'jsdoc'
      ],
      catharsis: {
        closure: 'fail',
        jsdoc: 'jsdoc'
      },
      jtp: {
        closure: 'fail',
        jsdoc: 'jsdoc',
        typescript: 'typescript',
        permissive: 'jsdoc'
      }
    })
  })

  describe('Jsdoc Toolkit 2-style array notation for an array of functions', () => {
    testFixture({
      input: 'function[]',
      expected: {
        type: 'JsdocTypeGeneric',
        elements: [
          {
            type: 'JsdocTypeName',
            value: 'function'
          }
        ],
        left: {
          type: 'JsdocTypeName',
          value: 'Array'
        },
        meta: {
          brackets: 'square',
          dot: false
        }
      },
      modes: [
        'jsdoc',
        'typescript'
      ],
      catharsis: {
        closure: 'fail',
        jsdoc: 'jsdoc'
      },
      jtp: {
        closure: 'fail',
        jsdoc: 'jsdoc',
        typescript: 'typescript',
        permissive: 'jsdoc'
      }
    })
  })

  describe('Jsdoc Toolkit 2-style nested array (two levels)', () => {
    testFixture({
      input: 'number[][]',
      expected: {
        type: 'JsdocTypeGeneric',
        elements: [
          {
            type: 'JsdocTypeGeneric',
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
            }
          }
        ],
        left: {
          type: 'JsdocTypeName',
          value: 'Array'
        },
        meta: {
          brackets: 'square',
          dot: false
        }
      },
      modes: [
        'typescript',
        'jsdoc'
      ],
      catharsis: {
        closure: 'fail',
        jsdoc: 'jsdoc'
      },
      jtp: {
        closure: 'fail',
        jsdoc: 'jsdoc',
        typescript: 'typescript',
        permissive: 'jsdoc'
      }
    })
  })

  describe('Jsdoc Toolkit 2-style nested array (three levels)', () => {
    testFixture({
      input: 'number[][][]',
      expected: {
        type: 'JsdocTypeGeneric',
        elements: [
          {
            type: 'JsdocTypeGeneric',
            elements: [
              {
                type: 'JsdocTypeGeneric',
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
                }
              }
            ],
            left: {
              type: 'JsdocTypeName',
              value: 'Array'
            },
            meta: {
              brackets: 'square',
              dot: false
            }
          }
        ],
        left: {
          type: 'JsdocTypeName',
          value: 'Array'
        },
        meta: {
          brackets: 'square',
          dot: false
        }
      },
      modes: [
        'typescript',
        'jsdoc'
      ],
      catharsis: {
        closure: 'fail',
        jsdoc: 'jsdoc'
      },
      jtp: {
        closure: 'fail',
        jsdoc: 'jsdoc',
        typescript: 'typescript',
        permissive: 'jsdoc'
      }
    })
  })

  describe('record type with a property that uses a type application as a key', () => {
    testFixture({
      input: '{Array.<string>: number}',
      expected: {
        type: 'JsdocTypeObject',
        meta: {
          separator: 'comma'
        },
        elements: [
          {
            type: 'JsdocTypeJsdocObjectField',
            left: {
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
                brackets: 'angle',
                dot: true
              }
            },
            right: {
              type: 'JsdocTypeName',
              value: 'number'
            }
          }
        ]
      },
      modes: [
        'jsdoc'
      ],
      catharsis: {
        closure: 'differ',
        jsdoc: 'jsdoc'
      },
      jtp: {
        closure: 'fail',
        jsdoc: 'fail',
        typescript: 'fail',
        permissive: 'fail'
      }
    })
  })

  describe('record type with a property that uses a type union as a key', () => {
    testFixture({
      input: '{(number|boolean|string): number}',
      stringified: '{(number | boolean | string): number}',
      expected: {
        type: 'JsdocTypeObject',
        meta: {
          separator: 'comma'
        },
        elements: [
          {
            type: 'JsdocTypeJsdocObjectField',
            left: {
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
            },
            right: {
              type: 'JsdocTypeName',
              value: 'number'
            }
          }
        ]
      },
      modes: [
        'jsdoc'
      ],
      catharsis: {
        closure: 'differ',
        jsdoc: 'jsdoc'
      },
      jtp: {
        closure: 'fail',
        jsdoc: 'fail',
        typescript: 'fail',
        permissive: 'fail'
      }
    })
  })

  describe('record type with a property name that starts with a literal', () => {
    testFixture({
      input: '{undefinedHTML: (string|undefined)}',
      stringified: '{undefinedHTML: (string | undefined)}',
      expected: {
        type: 'JsdocTypeObject',
        meta: {
          separator: 'comma'
        },
        elements: [
          {
            type: 'JsdocTypeObjectField',
            key: 'undefinedHTML',
            optional: false,
            readonly: false,
            meta: {
              quote: undefined
            },
            right: {
              type: 'JsdocTypeParenthesis',
              element: {
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

  describe('record type with a property that contains a function with no preceding space', () => {
    testFixture({
      input: '{foo:function()}',
      stringified: '{foo: function()}',
      expected: {
        type: 'JsdocTypeObject',
        meta: {
          separator: 'comma'
        },
        elements: [
          {
            type: 'JsdocTypeObjectField',
            key: 'foo',
            optional: false,
            readonly: false,
            meta: {
              quote: undefined
            },
            right: {
              type: 'JsdocTypeFunction',
              parameters: [],
              arrow: false,
              constructor: false,
              parenthesis: true
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
        closure: 'closure',
        jsdoc: 'jsdoc'
      },
      jtp: {
        closure: 'closure',
        jsdoc: 'jsdoc',
        typescript: 'differ',
        permissive: 'closure'
      }
    })
  })

  describe('record type with a property that contains a function with no preceding space that returns void', () => {
    testFixture({
      input: '{foo:function(): void}',
      stringified: '{foo: function(): void}',
      expected: {
        type: 'JsdocTypeObject',
        meta: {
          separator: 'comma'
        },
        elements: [
          {
            type: 'JsdocTypeObjectField',
            key: 'foo',
            optional: false,
            readonly: false,
            meta: {
              quote: undefined
            },
            right: {
              type: 'JsdocTypeFunction',
              parameters: [],
              arrow: false,
              constructor: false,
              parenthesis: true,
              returnType: {
                type: 'JsdocTypeName',
                value: 'void'
              }
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

  describe('function type with no trailing parenthesis', () => {
    testFixture({
      input: 'function',
      expected: {
        type: 'JsdocTypeName',
        value: 'function'
      },
      errors: {
        closure: 'function is missing parameter list',
        jsdoc: 'Unexpected reserved keyword "function"',
        typescript: 'Unexpected reserved keyword "function"'
      }
    })
  })

  describe('standard function type (should still parse if JSDoc expressions are allowed)', () => {
    testFixture({
      input: 'function(this:my.namespace.Class, my.Class)=',
      stringified: 'function(this: my.namespace.Class, my.Class)=',
      expected: {
        type: 'JsdocTypeOptional',
        element: {
          type: 'JsdocTypeFunction',
          parameters: [
            {
              type: 'JsdocTypeKeyValue',
              key: 'this',
              optional: false,
              variadic: false,
              right: {
                left: {
                  left: {
                    value: 'my',
                    type: 'JsdocTypeName'
                  },
                  right: {
                    type: 'JsdocTypeProperty',
                    value: 'namespace',
                    meta: {
                      quote: undefined
                    }
                  },
                  type: 'JsdocTypeNamePath',
                  pathType: 'property'
                },
                right: {
                  type: 'JsdocTypeProperty',
                  value: 'Class',
                  meta: {
                    quote: undefined
                  }
                },
                type: 'JsdocTypeNamePath',
                pathType: 'property'
              }
            },
            {
              left: {
                value: 'my',
                type: 'JsdocTypeName'
              },
              right: {
                type: 'JsdocTypeProperty',
                value: 'Class',
                meta: {
                  quote: undefined
                }
              },
              type: 'JsdocTypeNamePath',
              pathType: 'property'
            }
          ],
          arrow: false,
          constructor: false,
          parenthesis: true
        },
        meta: {
          position: 'suffix'
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
        typescript: 'differ',
        permissive: 'closure'
      }
    })
  })

  describe('type union with no parentheses, a repeatable param, and a JSDoc-style array', () => {
    testFixture({
      input: '...string|string[]',
      stringified: '...string | string[]',
      expected: {
        type: 'JsdocTypeUnion',
        elements: [
          {
            type: 'JsdocTypeVariadic',
            element: {
              type: 'JsdocTypeName',
              value: 'string'
            },
            meta: {
              squareBrackets: false,
              position: 'prefix'
            }
          },
          {
            type: 'JsdocTypeGeneric',
            elements: [
              {
                value: 'string',
                type: 'JsdocTypeName'
              }
            ],
            left: {
              type: 'JsdocTypeName',
              value: 'Array'
            },
            meta: {
              brackets: 'square',
              dot: false
            }
          }
        ]
      },
      modes: [
        'jsdoc',
        'typescript'
      ],
      catharsis: {
        closure: 'differ',
        jsdoc: 'jsdoc'
      },
      jtp: {
        closure: 'fail',
        jsdoc: 'differ',
        typescript: 'differ',
        permissive: 'differ'
      }
    })
  })
})
