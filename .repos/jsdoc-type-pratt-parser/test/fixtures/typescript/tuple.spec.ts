import { testFixture } from '../Fixture.js'

describe('typescript tuple tests', () => {
  describe('Empty tuple', () => {
    testFixture({
      input: '[]',
      expected: {
        type: 'JsdocTypeTuple',
        elements: []
      },
      modes: [
        'typescript'
      ],
      catharsis: {
        closure: 'fail',
        jsdoc: 'fail'
      },
      jtp: {
        closure: 'fail',
        jsdoc: 'fail',
        typescript: 'typescript',
        permissive: 'typescript'
      }
    })
  })

  describe('Incomplete tuple', () => {
    testFixture({
      input: '[x',
      modes: []
    })
  })

  describe('Tuple with question mark', () => {
    testFixture({
      input: '[?,null]',
      modes: []
    })
  })

  describe('Tuple with one element', () => {
    testFixture({
      input: '[x]',
      expected: {
        type: 'JsdocTypeTuple',
        elements: [
          {
            type: 'JsdocTypeName',
            value: 'x'
          }
        ]
      },
      modes: [
        'typescript'
      ],
      catharsis: {
        closure: 'fail',
        jsdoc: 'fail'
      },
      jtp: {
        closure: 'fail',
        jsdoc: 'fail',
        typescript: 'typescript',
        permissive: 'typescript'
      }
    })
  })

  describe('Tuple with 4 elements', () => {
    testFixture({
      input: '[it, needs, to, be]',
      expected: {
        type: 'JsdocTypeTuple',
        elements: [
          {
            type: 'JsdocTypeName',
            value: 'it'
          },
          {
            type: 'JsdocTypeName',
            value: 'needs'
          },
          {
            type: 'JsdocTypeName',
            value: 'to'
          },
          {
            type: 'JsdocTypeName',
            value: 'be'
          }
        ]
      },
      modes: [
        'typescript'
      ],
      catharsis: {
        closure: 'fail',
        jsdoc: 'fail'
      },
      jtp: {
        closure: 'fail',
        jsdoc: 'fail',
        typescript: 'typescript',
        permissive: 'typescript'
      }
    })
  })

  describe('Tuple with spaces', () => {
    testFixture({
      input: '[ tuple, with, spaces ]',
      stringified: '[tuple, with, spaces]',
      expected: {
        type: 'JsdocTypeTuple',
        elements: [
          {
            type: 'JsdocTypeName',
            value: 'tuple'
          },
          {
            type: 'JsdocTypeName',
            value: 'with'
          },
          {
            type: 'JsdocTypeName',
            value: 'spaces'
          }
        ]
      },
      modes: [
        'typescript'
      ],
      catharsis: {
        closure: 'fail',
        jsdoc: 'fail'
      },
      jtp: {
        closure: 'fail',
        jsdoc: 'fail',
        typescript: 'typescript',
        permissive: 'typescript'
      }
    })
  })

  describe('Tuple with spaces', () => {
    testFixture({
      input: '[ tuple, with, trailing, comma, ]',
      stringified: '[tuple, with, trailing, comma]',
      expected: {
        type: 'JsdocTypeTuple',
        elements: [
          {
            type: 'JsdocTypeName',
            value: 'tuple'
          },
          {
            type: 'JsdocTypeName',
            value: 'with'
          },
          {
            type: 'JsdocTypeName',
            value: 'trailing'
          },
          {
            type: 'JsdocTypeName',
            value: 'comma'
          }
        ]
      },
      modes: [
        'typescript'
      ],
      catharsis: {
        closure: 'fail',
        jsdoc: 'fail'
      },
      jtp: {
        closure: 'fail',
        jsdoc: 'fail',
        typescript: 'typescript',
        permissive: 'typescript'
      }
    })
  })

  describe('Array of empty tuples', () => {
    testFixture({
      input: '[][]',
      expected: {
        type: 'JsdocTypeGeneric',
        left: {
          type: 'JsdocTypeName',
          value: 'Array'
        },
        elements: [
          {
            type: 'JsdocTypeTuple',
            elements: []
          }
        ],
        meta: {
          dot: false,
          brackets: 'square'
        }
      },
      modes: [
        'typescript'
      ],
      catharsis: {
        closure: 'fail',
        jsdoc: 'fail'
      },
      jtp: {
        closure: 'fail',
        jsdoc: 'fail',
        typescript: 'typescript',
        permissive: 'typescript'
      }
    })
  })

  describe('Array of non empty tuples', () => {
    testFixture({
      input: '[tuple, array][]',
      expected: {
        type: 'JsdocTypeGeneric',
        left: {
          type: 'JsdocTypeName',
          value: 'Array'
        },
        elements: [
          {
            type: 'JsdocTypeTuple',
            elements: [
              {
                type: 'JsdocTypeName',
                value: 'tuple'
              },
              {
                type: 'JsdocTypeName',
                value: 'array'
              }
            ]
          }
        ],
        meta: {
          dot: false,
          brackets: 'square'
        }
      },
      modes: [
        'typescript'
      ],
      catharsis: {
        closure: 'fail',
        jsdoc: 'fail'
      },
      jtp: {
        closure: 'fail',
        jsdoc: 'fail',
        typescript: 'typescript',
        permissive: 'typescript'
      }
    })
  })

  describe('Tuple with typeof', () => {
    testFixture({
      input: '[tuple, with, typeof foo]',
      expected: {
        type: 'JsdocTypeTuple',
        elements: [
          {
            type: 'JsdocTypeName',
            value: 'tuple'
          },
          {
            type: 'JsdocTypeName',
            value: 'with'
          },
          {
            type: 'JsdocTypeTypeof',
            element: {
              type: 'JsdocTypeName',
              value: 'foo'
            }
          }
        ]
      },
      modes: [
        'typescript'
      ],
      catharsis: {
        closure: 'fail',
        jsdoc: 'fail'
      },
      jtp: {
        closure: 'fail',
        jsdoc: 'fail',
        typescript: 'typescript',
        permissive: 'typescript'
      }
    })
  })

  describe('Tuple with keyof', () => {
    testFixture({
      input: '[tuple, with, keyof foo]',
      expected: {
        type: 'JsdocTypeTuple',
        elements: [
          {
            type: 'JsdocTypeName',
            value: 'tuple'
          },
          {
            type: 'JsdocTypeName',
            value: 'with'
          },
          {
            type: 'JsdocTypeKeyof',
            element: {
              type: 'JsdocTypeName',
              value: 'foo'
            }
          }
        ]
      },
      modes: [
        'typescript'
      ],
      catharsis: {
        closure: 'fail',
        jsdoc: 'fail'
      },
      jtp: {
        closure: 'fail',
        jsdoc: 'fail',
        typescript: 'typescript',
        permissive: 'typescript'
      }
    })
  })

  describe('Tuple with typeof and keyof', () => {
    testFixture({
      input: '[ tuple, with, typeof foo, and, keyof foo]',
      stringified: '[tuple, with, typeof foo, and, keyof foo]',
      expected: {
        type: 'JsdocTypeTuple',
        elements: [
          {
            type: 'JsdocTypeName',
            value: 'tuple'
          },
          {
            type: 'JsdocTypeName',
            value: 'with'
          },
          {
            type: 'JsdocTypeTypeof',
            element: {
              type: 'JsdocTypeName',
              value: 'foo'
            }
          },
          {
            type: 'JsdocTypeName',
            value: 'and'
          },
          {
            type: 'JsdocTypeKeyof',
            element: {
              type: 'JsdocTypeName',
              value: 'foo'
            }
          }
        ]
      },
      modes: [
        'typescript'
      ],
      catharsis: {
        closure: 'fail',
        jsdoc: 'fail'
      },
      jtp: {
        closure: 'fail',
        jsdoc: 'fail',
        typescript: 'typescript',
        permissive: 'typescript'
      }
    })
  })

  describe('Tuple with spreaded tuple', () => {
    testFixture({
      input: '[variadic, arguments, ...tuple]',
      expected: {
        type: 'JsdocTypeTuple',
        elements: [
          {
            type: 'JsdocTypeName',
            value: 'variadic'
          },
          {
            type: 'JsdocTypeName',
            value: 'arguments'
          },
          {
            type: 'JsdocTypeVariadic',
            element: {
              type: 'JsdocTypeName',
              value: 'tuple'
            },
            meta: {
              squareBrackets: false,
              position: 'prefix'
            }
          }
        ]
      },
      modes: [
        'typescript'
      ],
      catharsis: {
        closure: 'fail',
        jsdoc: 'fail'
      },
      jtp: {
        closure: 'fail',
        jsdoc: 'fail',
        typescript: 'typescript',
        permissive: 'typescript'
      }
    })
  })

  describe('Tuple with spreaded tuple and typeof', () => {
    testFixture({
      input: '[ tuple, with, typeof foo, and, ...rest ]',
      stringified: '[tuple, with, typeof foo, and, ...rest]',
      expected: {
        type: 'JsdocTypeTuple',
        elements: [
          {
            type: 'JsdocTypeName',
            value: 'tuple'
          },
          {
            type: 'JsdocTypeName',
            value: 'with'
          },
          {
            type: 'JsdocTypeTypeof',
            element: {
              type: 'JsdocTypeName',
              value: 'foo'
            }
          },
          {
            type: 'JsdocTypeName',
            value: 'and'
          },
          {
            type: 'JsdocTypeVariadic',
            element: {
              type: 'JsdocTypeName',
              value: 'rest'
            },
            meta: {
              squareBrackets: false,
              position: 'prefix'
            }
          }
        ]
      },
      modes: [
        'typescript'
      ],
      catharsis: {
        closure: 'fail',
        jsdoc: 'fail'
      },
      jtp: {
        closure: 'fail',
        jsdoc: 'fail',
        typescript: 'typescript',
        permissive: 'typescript'
      }
    })
  })

  describe('Tuple with spreaded tuple and keyof', () => {
    testFixture({
      input: '[ tuple, with, keyof foo, and, ...rest ]',
      stringified: '[tuple, with, keyof foo, and, ...rest]',
      expected: {
        type: 'JsdocTypeTuple',
        elements: [
          {
            type: 'JsdocTypeName',
            value: 'tuple'
          },
          {
            type: 'JsdocTypeName',
            value: 'with'
          },
          {
            type: 'JsdocTypeKeyof',
            element: {
              type: 'JsdocTypeName',
              value: 'foo'
            }
          },
          {
            type: 'JsdocTypeName',
            value: 'and'
          },
          {
            type: 'JsdocTypeVariadic',
            element: {
              type: 'JsdocTypeName',
              value: 'rest'
            },
            meta: {
              squareBrackets: false,
              position: 'prefix'
            }
          }
        ]
      },
      modes: [
        'typescript'
      ],
      catharsis: {
        closure: 'fail',
        jsdoc: 'fail'
      },
      jtp: {
        closure: 'fail',
        jsdoc: 'fail',
        typescript: 'typescript',
        permissive: 'typescript'
      }
    })
  })

  describe('Tuple with spreaded tuple and typeof and keyof', () => {
    testFixture({
      input: '[ tuple, with, typeof foo, keyof foo, and, ...rest ]',
      stringified: '[tuple, with, typeof foo, keyof foo, and, ...rest]',
      expected: {
        type: 'JsdocTypeTuple',
        elements: [
          {
            type: 'JsdocTypeName',
            value: 'tuple'
          },
          {
            type: 'JsdocTypeName',
            value: 'with'
          },
          {
            type: 'JsdocTypeTypeof',
            element: {
              type: 'JsdocTypeName',
              value: 'foo'
            }
          },
          {
            type: 'JsdocTypeKeyof',
            element: {
              type: 'JsdocTypeName',
              value: 'foo'
            }
          },
          {
            type: 'JsdocTypeName',
            value: 'and'
          },
          {
            type: 'JsdocTypeVariadic',
            element: {
              type: 'JsdocTypeName',
              value: 'rest'
            },
            meta: {
              squareBrackets: false,
              position: 'prefix'
            }
          }
        ]
      },
      modes: [
        'typescript'
      ],
      catharsis: {
        closure: 'fail',
        jsdoc: 'fail'
      },
      jtp: {
        closure: 'fail',
        jsdoc: 'fail',
        typescript: 'typescript',
        permissive: 'typescript'
      }
    })
  })

  describe('labeled tuple with one element', () => {
    testFixture({
      input: '[a: string]',
      modes: ['typescript'],
      expected: {
        type: 'JsdocTypeTuple',
        elements: [
          {
            type: 'JsdocTypeKeyValue',
            key: 'a',
            optional: false,
            variadic: false,
            right: {
              type: 'JsdocTypeName',
              value: 'string'
            }
          }
        ]
      }
    })
  })

  describe('labeled tuple with two elements', () => {
    testFixture({
      input: '[a: string, b: number]',
      modes: ['typescript'],
      expected: {
        type: 'JsdocTypeTuple',
        elements: [
          {
            type: 'JsdocTypeKeyValue',
            key: 'a',
            optional: false,
            variadic: false,
            right: {
              type: 'JsdocTypeName',
              value: 'string'
            }
          },
          {
            type: 'JsdocTypeKeyValue',
            key: 'b',
            optional: false,
            variadic: false,
            right: {
              type: 'JsdocTypeName',
              value: 'number'
            }
          }
        ]
      }
    })
  })

  describe('mixed labeled tuples', () => {
    testFixture({
      input: '[a: string, b]',
      modes: []
    })
  })
})
