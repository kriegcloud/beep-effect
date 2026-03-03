import { testFixture } from '../Fixture.js'

describe('catharsis function type tests', () => {
  describe('function with two basic parameters', () => {
    testFixture({
      input: 'function(string, boolean)',
      expected: {
        type: 'JsdocTypeFunction',
        parameters: [
          {
            type: 'JsdocTypeName',
            value: 'string'
          },
          {
            type: 'JsdocTypeName',
            value: 'boolean'
          }
        ],
        arrow: false,
        constructor: false,
        parenthesis: true
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

  describe('repeatable function with two basic parameters', () => {
    testFixture({
      input: '...function(string, boolean)',
      expected: {
        type: 'JsdocTypeVariadic',
        element: {
          type: 'JsdocTypeFunction',
          parameters: [
            {
              type: 'JsdocTypeName',
              value: 'string'
            },
            {
              type: 'JsdocTypeName',
              value: 'boolean'
            }
          ],
          arrow: false,
          constructor: false,
          parenthesis: true
        },
        meta: {
          position: 'prefix',
          squareBrackets: false
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

  describe('function with two basic parameters and a return value', () => {
    testFixture({
      input: 'function(string, boolean): boolean',
      expected: {
        type: 'JsdocTypeFunction',
        parameters: [
          {
            type: 'JsdocTypeName',
            value: 'string'
          },
          {
            type: 'JsdocTypeName',
            value: 'boolean'
          }
        ],
        returnType: {
          type: 'JsdocTypeName',
          value: 'boolean'
        },
        arrow: false,
        constructor: false,
        parenthesis: true
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

  describe('repeatable function with two basic parameters and a return value', () => {
    testFixture({
      input: '...function(string, boolean): boolean',
      expected: {
        type: 'JsdocTypeVariadic',
        element: {
          type: 'JsdocTypeFunction',
          parameters: [
            {
              type: 'JsdocTypeName',
              value: 'string'
            },
            {
              type: 'JsdocTypeName',
              value: 'boolean'
            }
          ],
          returnType: {
            type: 'JsdocTypeName',
            value: 'boolean'
          },
          arrow: false,
          constructor: false,
          parenthesis: true
        },
        meta: {
          squareBrackets: false,
          position: 'prefix'
        }
      },
      modes: [
        'jsdoc',
        'typescript',
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

  describe('optional function with one basic parameter', () => {
    testFixture({
      input: 'function(string)=',
      expected: {
        type: 'JsdocTypeOptional',
        element: {
          type: 'JsdocTypeFunction',
          parameters: [
            {
              type: 'JsdocTypeName',
              value: 'string'
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

  describe('function with no parameters and a return value', () => {
    testFixture({
      input: 'function(): number',
      expected: {
        type: 'JsdocTypeFunction',
        parameters: [],
        returnType: {
          type: 'JsdocTypeName',
          value: 'number'
        },
        arrow: false,
        constructor: false,
        parenthesis: true
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
        permissive: 'closure',
        typescript: 'typescript'
      }
    })
  })

  describe('function with a "this" type and no parameters', () => {
    testFixture({
      input: 'function(this:goog.ui.Menu)',
      stringified: 'function(this: goog.ui.Menu)',
      expected: {
        parameters: [
          {
            type: 'JsdocTypeKeyValue',
            key: 'this',
            optional: false,
            variadic: false,
            right: {
              left: {
                left: {
                  value: 'goog',
                  type: 'JsdocTypeName'
                },
                right: {
                  type: 'JsdocTypeProperty',
                  value: 'ui',
                  meta: {
                    quote: undefined
                  }
                },
                type: 'JsdocTypeNamePath',
                pathType: 'property'
              },
              right: {
                type: 'JsdocTypeProperty',
                value: 'Menu',
                meta: {
                  quote: undefined
                }
              },
              type: 'JsdocTypeNamePath',
              pathType: 'property'
            }
          }
        ],
        type: 'JsdocTypeFunction',
        arrow: false,
        constructor: false,
        parenthesis: true
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

  describe('function with a "this" type and one parameter', () => {
    testFixture({
      input: 'function(this:goog.ui.Menu, string)',
      stringified: 'function(this: goog.ui.Menu, string)',
      expected: {
        parameters: [
          {
            type: 'JsdocTypeKeyValue',
            optional: false,
            variadic: false,
            key: 'this',
            right: {
              left: {
                left: {
                  value: 'goog',
                  type: 'JsdocTypeName'
                },
                right: {
                  type: 'JsdocTypeProperty',
                  value: 'ui',
                  meta: {
                    quote: undefined
                  }
                },
                type: 'JsdocTypeNamePath',
                pathType: 'property'
              },
              right: {
                type: 'JsdocTypeProperty',
                value: 'Menu',
                meta: {
                  quote: undefined
                }
              },
              type: 'JsdocTypeNamePath',
              pathType: 'property'
            }
          },
          {
            value: 'string',
            type: 'JsdocTypeName'
          }
        ],
        type: 'JsdocTypeFunction',
        arrow: false,
        constructor: false,
        parenthesis: true
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

  describe('function with a "new" type and no parameters', () => {
    testFixture({
      input: 'function(new:goog.ui.Menu)',
      stringified: 'function(new: goog.ui.Menu)',
      expected: {
        type: 'JsdocTypeFunction',
        parameters: [
          {
            type: 'JsdocTypeKeyValue',
            optional: false,
            variadic: false,
            key: 'new',
            right: {
              left: {
                left: {
                  value: 'goog',
                  type: 'JsdocTypeName'
                },
                right: {
                  type: 'JsdocTypeProperty',
                  value: 'ui',
                  meta: {
                    quote: undefined
                  }
                },
                type: 'JsdocTypeNamePath',
                pathType: 'property'
              },
              right: {
                type: 'JsdocTypeProperty',
                value: 'Menu',
                meta: {
                  quote: undefined
                }
              },
              type: 'JsdocTypeNamePath',
              pathType: 'property'
            }
          }
        ],
        arrow: false,
        constructor: false,
        parenthesis: true
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

  describe('function with a "new" type and one parameter', () => {
    testFixture({
      input: 'function(new:goog.ui.Menu, string)',
      stringified: 'function(new: goog.ui.Menu, string)',
      expected: {
        type: 'JsdocTypeFunction',
        parameters: [
          {
            type: 'JsdocTypeKeyValue',
            key: 'new',
            optional: false,
            variadic: false,
            right: {
              left: {
                left: {
                  value: 'goog',
                  type: 'JsdocTypeName'
                },
                right: {
                  type: 'JsdocTypeProperty',
                  value: 'ui',
                  meta: {
                    quote: undefined
                  }
                },
                type: 'JsdocTypeNamePath',
                pathType: 'property'
              },
              right: {
                type: 'JsdocTypeProperty',
                value: 'Menu',
                meta: {
                  quote: undefined
                }
              },
              type: 'JsdocTypeNamePath',
              pathType: 'property'
            }
          },
          {
            type: 'JsdocTypeName',
            value: 'string'
          }
        ],
        arrow: false,
        constructor: false,
        parenthesis: true
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

  describe('function with a "new" and "this" type and no parameters', () => {
    testFixture({
      input: 'function(new:goog.ui.Menu, this:goog.ui)',
      stringified: 'function(new: goog.ui.Menu, this: goog.ui)',
      expected: {
        type: 'JsdocTypeFunction',
        parameters: [
          {
            type: 'JsdocTypeKeyValue',
            key: 'new',
            optional: false,
            variadic: false,
            right: {
              left: {
                left: {
                  value: 'goog',
                  type: 'JsdocTypeName'
                },
                right: {
                  type: 'JsdocTypeProperty',
                  value: 'ui',
                  meta: {
                    quote: undefined
                  }
                },
                type: 'JsdocTypeNamePath',
                pathType: 'property'
              },
              right: {
                type: 'JsdocTypeProperty',
                value: 'Menu',
                meta: {
                  quote: undefined
                }
              },
              type: 'JsdocTypeNamePath',
              pathType: 'property'
            }
          },
          {
            type: 'JsdocTypeKeyValue',
            key: 'this',
            optional: false,
            variadic: false,
            right: {
              left: {
                value: 'goog',
                type: 'JsdocTypeName'
              },
              right: {
                type: 'JsdocTypeProperty',
                value: 'ui',
                meta: {
                  quote: undefined
                }
              },
              type: 'JsdocTypeNamePath',
              pathType: 'property'
            }
          }
        ],
        arrow: false,
        constructor: false,
        parenthesis: true
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
        closure: 'fail',
        jsdoc: 'fail',
        typescript: 'fail',
        permissive: 'fail'
      }
    })
  })

  describe('function with a fixed parameter, followed by a variable number of parameters, as well as a return value', () => {
    testFixture({
      input: 'function(string, ...[number]): number',
      stringified: 'function(string, ...number): number',
      diffExpected: {
        jsdoc: {
          type: 'JsdocTypeFunction',
          parameters: [
            {
              type: 'JsdocTypeName',
              value: 'string'
            },
            {
              type: 'JsdocTypeVariadic',
              element: {
                type: 'JsdocTypeName',
                value: 'number'
              },
              meta: {
                position: 'prefix',
                squareBrackets: true
              }
            }
          ],
          returnType: {
            type: 'JsdocTypeName',
            value: 'number'
          },
          arrow: false,
          constructor: false,
          parenthesis: true
        },
        typescript: {
          type: 'JsdocTypeFunction',
          parameters: [
            {
              type: 'JsdocTypeName',
              value: 'string'
            },
            {
              type: 'JsdocTypeVariadic',
              element: {
                type: 'JsdocTypeTuple',
                elements: [
                  {
                    type: 'JsdocTypeName',
                    value: 'number'
                  }
                ]
              },
              meta: {
                position: 'prefix',
                squareBrackets: false
              }
            }
          ],
          returnType: {
            type: 'JsdocTypeName',
            value: 'number'
          },
          arrow: false,
          constructor: false,
          parenthesis: true
        }
      },
      modes: [
        'typescript',
        'jsdoc'
      ],
      catharsis: {
        closure: 'differ',
        jsdoc: 'jsdoc'
      },
      jtp: {
        closure: 'fail',
        jsdoc: 'fail',
        typescript: 'typescript',
        permissive: 'typescript'
      }
    })
  })

  describe('function with a variable number of parameters containing the value `null`', () => {
    testFixture({
      input: 'function(...[null])',
      stringified: 'function(...null)',
      diffExpected: {
        jsdoc: {
          type: 'JsdocTypeFunction',
          parameters: [
            {
              type: 'JsdocTypeVariadic',
              element: {
                type: 'JsdocTypeNull'
              },
              meta: {
                squareBrackets: true,
                position: 'prefix'
              }
            }
          ],
          arrow: false,
          constructor: false,
          parenthesis: true
        },
        typescript: {
          type: 'JsdocTypeFunction',
          parameters: [
            {
              type: 'JsdocTypeVariadic',
              element: {
                elements: [
                {
                  type: 'JsdocTypeNull'
                }
              ],
                type: 'JsdocTypeTuple'
              },
              meta: {
                squareBrackets: false,
                position: 'prefix'
              }
            }
          ],
          arrow: false,
          constructor: false,
          parenthesis: true
        }
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
        jsdoc: 'fail',
        typescript: 'differ',
        permissive: 'differ'
      }
    })
  })

  describe('function with a variable number of parameters containing the value `undefined`', () => {
    testFixture({
      input: 'function(...[undefined])',
      stringified: 'function(...undefined)',
      diffExpected: {
        jsdoc: {
          type: 'JsdocTypeFunction',
          parameters: [
            {
              type: 'JsdocTypeVariadic',
              element: {
                type: 'JsdocTypeUndefined'
              },
              meta: {
                position: 'prefix',
                squareBrackets: true
              }
            }
          ],
          arrow: false,
          constructor: false,
          parenthesis: true
        },
        typescript: {
          type: 'JsdocTypeFunction',
          parameters: [
            {
              type: 'JsdocTypeVariadic',
              element: {
                elements: [
                  {
                    type: 'JsdocTypeUndefined'
                  }
                ],
                type: 'JsdocTypeTuple'
              },
              meta: {
                position: 'prefix',
                squareBrackets: false
              }
            }
          ],
          arrow: false,
          constructor: false,
          parenthesis: true
        }
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
        jsdoc: 'fail',
        typescript: 'differ',
        permissive: 'differ'
      }
    })
  })

  describe('function with a variable number of parameters, a "new" type, a "this" type, and a return value', () => {
    testFixture({
      input: 'function(new:Master, this:Everyone, string, goog.ui.Menu, Array.<Object>, ...[string]): boolean',
      stringified: 'function(new: Master, this: Everyone, string, goog.ui.Menu, Array.<Object>, ...string): boolean',
      diffExpected: {
        jsdoc: {
          type: 'JsdocTypeFunction',
          parameters: [
            {
              type: 'JsdocTypeKeyValue',
              key: 'new',
              optional: false,
              variadic: false,
              right: {
                type: 'JsdocTypeName',
                value: 'Master'
              }
            },
            {
              type: 'JsdocTypeKeyValue',
              key: 'this',
              optional: false,
              variadic: false,
              right: {
                type: 'JsdocTypeName',
                value: 'Everyone'
              }
            },
            {
              type: 'JsdocTypeName',
              value: 'string'
            },
            {
              left: {
                left: {
                  value: 'goog',
                  type: 'JsdocTypeName'
                },
                right: {
                  type: 'JsdocTypeProperty',
                  value: 'ui',
                  meta: {
                    quote: undefined
                  }
                },
                type: 'JsdocTypeNamePath',
                pathType: 'property'
              },
              right: {
                type: 'JsdocTypeProperty',
                value: 'Menu',
                meta: {
                  quote: undefined
                }
              },
              type: 'JsdocTypeNamePath',
              pathType: 'property'
            },
            {
              type: 'JsdocTypeGeneric',
              elements: [
                {
                  type: 'JsdocTypeName',
                  value: 'Object'
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
              type: 'JsdocTypeVariadic',
              element: {
                type: 'JsdocTypeName',
                value: 'string'
              },
              meta: {
                squareBrackets: true,
                position: 'prefix'
              }
            }
          ],
          returnType: {
            type: 'JsdocTypeName',
            value: 'boolean'
          },
          arrow: false,
          constructor: false,
          parenthesis: true
        },
        typescript: {
          type: 'JsdocTypeFunction',
          parameters: [
            {
              type: 'JsdocTypeKeyValue',
              key: 'new',
              optional: false,
              variadic: false,
              right: {
                type: 'JsdocTypeName',
                value: 'Master'
              }
            },
            {
              type: 'JsdocTypeKeyValue',
              key: 'this',
              optional: false,
              variadic: false,
              right: {
                type: 'JsdocTypeName',
                value: 'Everyone'
              }
            },
            {
              type: 'JsdocTypeName',
              value: 'string'
            },
            {
              left: {
                left: {
                  value: 'goog',
                  type: 'JsdocTypeName'
                },
                right: {
                  type: 'JsdocTypeProperty',
                  value: 'ui',
                  meta: {
                    quote: undefined
                  }
                },
                type: 'JsdocTypeNamePath',
                pathType: 'property'
              },
              right: {
                type: 'JsdocTypeProperty',
                value: 'Menu',
                meta: {
                  quote: undefined
                }
              },
              type: 'JsdocTypeNamePath',
              pathType: 'property'
            },
            {
              type: 'JsdocTypeGeneric',
              elements: [
                {
                  type: 'JsdocTypeName',
                  value: 'Object'
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
              type: 'JsdocTypeVariadic',
              element: {
                type: 'JsdocTypeTuple',
                elements: [
                  {
                    type: 'JsdocTypeName',
                    value: 'string'
                  }
                ]
              },
              meta: {
                squareBrackets: false,
                position: 'prefix'
              }
            }
          ],
          returnType: {
            type: 'JsdocTypeName',
            value: 'boolean'
          },
          arrow: false,
          constructor: false,
          parenthesis: true
        }
      },
      modes: [
        'typescript',
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

  describe('function with a repeatable param that is not enclosed in brackets', () => {
    testFixture({
      input: 'function(...foo)',
      expected: {
        type: 'JsdocTypeFunction',
        parameters: [
          {
            type: 'JsdocTypeVariadic',
            element: {
              type: 'JsdocTypeName',
              value: 'foo'
            },
            meta: {
              position: 'prefix',
              squareBrackets: false
            }
          }
        ],
        arrow: false,
        constructor: false,
        parenthesis: true
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

  describe('function that returns a type union', () => {
    testFixture({
      input: 'function(): (number|string)',
      stringified: 'function(): (number | string)',
      expected: {
        type: 'JsdocTypeFunction',
        parameters: [],
        returnType: {
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
                value: 'string'
              }
            ]
          }
        },
        arrow: false,
        constructor: false,
        parenthesis: true
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

  describe('function with no parameters and no return value', () => {
    testFixture({
      input: 'function()',
      expected: {
        type: 'JsdocTypeFunction',
        parameters: [],
        arrow: false,
        constructor: false,
        parenthesis: true
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

  describe('function with a variable number of parameters containing any values', () => {
    testFixture({
      input: 'function(...[*])',
      stringified: 'function(...*)',
      diffExpected: {
        jsdoc: {
          type: 'JsdocTypeFunction',
          parameters: [
            {
              type: 'JsdocTypeVariadic',
              element: {
                type: 'JsdocTypeAny'
              },
              meta: {
                squareBrackets: true,
                position: 'prefix'
              }
            }
          ],
          arrow: false,
          constructor: false,
          parenthesis: true
        },
        typescript: {
          type: 'JsdocTypeFunction',
          parameters: [
            {
              type: 'JsdocTypeVariadic',
              element: {
                elements: [
                  {
                    type: 'JsdocTypeAny'
                  }
                ],
                type: 'JsdocTypeTuple'
              },
              meta: {
                squareBrackets: false,
                position: 'prefix'
              }
            }
          ],
          arrow: false,
          constructor: false,
          parenthesis: true
        }
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
        jsdoc: 'fail',
        typescript: 'differ',
        permissive: 'differ'
      }
    })
  })

  describe('function with a "this" type that returns a type union', () => {
    testFixture({
      input: 'function(this:Object): (number|string)',
      stringified: 'function(this: Object): (number | string)',
      expected: {
        type: 'JsdocTypeFunction',
        parameters: [
          {
            type: 'JsdocTypeKeyValue',
            key: 'this',
            optional: false,
            variadic: false,
            right: {
              type: 'JsdocTypeName',
              value: 'Object'
            }
          }
        ],
        returnType: {
          element: {
            elements: [
              {
                type: 'JsdocTypeName',
                value: 'number'
              },
              {
                type: 'JsdocTypeName',
                value: 'string'
              }
            ],
            type: 'JsdocTypeUnion'
          },
          type: 'JsdocTypeParenthesis'
        },
        arrow: false,
        constructor: false,
        parenthesis: true
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

  describe('function with a "this" type that is a type union, and that returns a type union', () => {
    testFixture({
      input: 'function(this:(Array|Date)): (number|string)',
      stringified: 'function(this: (Array | Date)): (number | string)',
      expected: {
        type: 'JsdocTypeFunction',
        parameters: [
          {
            type: 'JsdocTypeKeyValue',
            key: 'this',
            optional: false,
            variadic: false,
            right: {
              element: {
                type: 'JsdocTypeUnion',
                elements: [
                  {
                    type: 'JsdocTypeName',
                    value: 'Array'
                  },
                  {
                    type: 'JsdocTypeName',
                    value: 'Date'
                  }
                ]
              },
              type: 'JsdocTypeParenthesis'
            }
          }
        ],
        returnType: {
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
                value: 'string'
              }
            ]
          }
        },
        arrow: false,
        constructor: false,
        parenthesis: true
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

  describe('function with a "new" type and a variable number of params that accept all types, returning a name expression', () => {
    testFixture({
      input: 'function(new:Array, ...[*]): Array',
      stringified: 'function(new: Array, ...*): Array',
      diffExpected: {
        jsdoc: {
          type: 'JsdocTypeFunction',
          parameters: [
            {
              type: 'JsdocTypeKeyValue',
              key: 'new',
              optional: false,
              variadic: false,
              right: {
                type: 'JsdocTypeName',
                value: 'Array'
              }
            },
            {
              type: 'JsdocTypeVariadic',
              element: {
                type: 'JsdocTypeAny'
              },
              meta: {
                squareBrackets: true,
                position: 'prefix'
              }
            }
          ],
          returnType: {
            type: 'JsdocTypeName',
            value: 'Array'
          },
          arrow: false,
          constructor: false,
          parenthesis: true
        },
        typescript: {
          type: 'JsdocTypeFunction',
          parameters: [
            {
              type: 'JsdocTypeKeyValue',
              key: 'new',
              optional: false,
              variadic: false,
              right: {
                type: 'JsdocTypeName',
                value: 'Array'
              }
            },
            {
              type: 'JsdocTypeVariadic',
              element: {
                type: 'JsdocTypeTuple',
                elements: [
                  {
                    type: 'JsdocTypeAny'
                  }
                ]
              },
              meta: {
                squareBrackets: false,
                position: 'prefix'
              }
            }
          ],
          returnType: {
            type: 'JsdocTypeName',
            value: 'Array'
          },
          arrow: false,
          constructor: false,
          parenthesis: true
        }
      },
      modes: [
        'typescript',
        'jsdoc'
      ],
      catharsis: {
        closure: 'differ',
        jsdoc: 'jsdoc'
      },
      jtp: {
        closure: 'fail',
        jsdoc: 'fail',
        typescript: 'typescript',
        permissive: 'typescript'
      }
    })
  })

  describe('function with a "new" type that accepts an optional parameter of any type, as well as a return value', () => {
    testFixture({
      input: 'function(new:Boolean, *=): boolean',
      stringified: 'function(new: Boolean, *=): boolean',
      expected: {
        type: 'JsdocTypeFunction',
        parameters: [
          {
            type: 'JsdocTypeKeyValue',
            key: 'new',
            optional: false,
            variadic: false,
            right: {
              type: 'JsdocTypeName',
              value: 'Boolean'
            }
          },
          {
            type: 'JsdocTypeOptional',
            element: {
              type: 'JsdocTypeAny'
            },
            meta: {
              position: 'suffix'
            }
          }
        ],
        returnType: {
          type: 'JsdocTypeName',
          value: 'boolean'
        },
        arrow: false,
        constructor: false,
        parenthesis: true
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

  describe('function with a variable number of parameters and a return value', () => {
    testFixture({
      input: 'function(...[number]): boolean',
      stringified: 'function(...number): boolean',
      diffExpected: {
        jsdoc: {
          type: 'JsdocTypeFunction',
          parameters: [
            {
              type: 'JsdocTypeVariadic',
              element: {
                type: 'JsdocTypeName',
                value: 'number'
              },
              meta: {
                squareBrackets: true,
                position: 'prefix'
              }
            }
          ],
          returnType: {
            type: 'JsdocTypeName',
            value: 'boolean'
          },
          arrow: false,
          constructor: false,
          parenthesis: true
        },
        typescript: {
          type: 'JsdocTypeFunction',
          parameters: [
            {
              type: 'JsdocTypeVariadic',
              element: {
                type: 'JsdocTypeTuple',
                elements: [
                  {
                    type: 'JsdocTypeName',
                    value: 'number'
                  }
                ]
              },
              meta: {
                squareBrackets: false,
                position: 'prefix'
              }
            }
          ],
          returnType: {
            type: 'JsdocTypeName',
            value: 'boolean'
          },
          arrow: false,
          constructor: false,
          parenthesis: true
        }
      },
      modes: [
        'typescript',
        'jsdoc'
      ],
      catharsis: {
        closure: 'differ',
        jsdoc: 'jsdoc'
      },
      jtp: {
        closure: 'fail',
        jsdoc: 'fail',
        typescript: 'typescript',
        permissive: 'typescript'
      }
    })
  })

  describe('function with a "this" type and a parameter that returns a type union', () => {
    testFixture({
      input: 'function(this:Date, number): (boolean|number|string)',
      stringified: 'function(this: Date, number): (boolean | number | string)',
      expected: {
        type: 'JsdocTypeFunction',
        parameters: [
          {
            type: 'JsdocTypeKeyValue',
            key: 'this',
            optional: false,
            variadic: false,
            right: {
              type: 'JsdocTypeName',
              value: 'Date'
            }
          },
          {
            type: 'JsdocTypeName',
            value: 'number'
          }
        ],
        returnType: {
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
                value: 'number'
              },
              {
                type: 'JsdocTypeName',
                value: 'string'
              }
            ]
          }
        },
        arrow: false,
        constructor: false,
        parenthesis: true
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
