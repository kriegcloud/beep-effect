import { testFixture } from '../Fixture.js'

describe('typescript typeof tests', () => {
  describe('typeof name', () => {
    testFixture({
      input: 'typeof A',
      expected: {
        type: 'JsdocTypeTypeof',
        element: {
          type: 'JsdocTypeName',
          value: 'A'
        }
      },
      modes: [
        'typescript',
        'closure'
      ],
      catharsis: {
        closure: 'fail',
        jsdoc: 'fail'
      },
      jtp: {
        closure: 'closure',
        jsdoc: 'fail',
        typescript: 'typescript',
        permissive: 'closure'
      }
    })
  })

  describe('typeof', () => {
    testFixture({
      input: 'typeof',
      modes: [],
      catharsis: {
        closure: 'differ',
        jsdoc: 'differ'
      },
      jtp: {
        closure: 'differ',
        jsdoc: 'differ',
        typescript: 'differ',
        permissive: 'differ'
      }
    })
  })

  describe('generic with typeof', () => {
    testFixture({
      input: 'X<typeof>',
      modes: [],
      catharsis: {
        closure: 'differ',
        jsdoc: 'differ'
      },
      jtp: {
        closure: 'differ',
        jsdoc: 'differ',
        typescript: 'differ',
        permissive: 'differ'
      }
    })
  })

  describe('generic with typeof name', () => {
    testFixture({
      input: 'X<typeof A>',
      expected: {
        type: 'JsdocTypeGeneric',
        left: {
          type: 'JsdocTypeName',
          value: 'X'
        },
        elements: [
          {
            type: 'JsdocTypeTypeof',
            element: {
              type: 'JsdocTypeName',
              value: 'A'
            }
          }
        ],
        meta: {
          dot: false,
          brackets: 'angle'
        }
      },
      modes: [
        'typescript',
        'closure'
      ],
      catharsis: {
        closure: 'fail',
        jsdoc: 'fail'
      },
      jtp: {
        closure: 'closure',
        jsdoc: 'fail',
        typescript: 'typescript',
        permissive: 'typescript'
      }
    })
  })

  describe('typeof name in parenthesis', () => {
    testFixture({
      input: '(typeof A)',
      expected: {
        type: 'JsdocTypeParenthesis',
        element: {
          type: 'JsdocTypeTypeof',
          element: {
            type: 'JsdocTypeName',
            value: 'A'
          }
        }
      },
      modes: [
        'typescript',
        'closure'
      ],
      catharsis: {
        closure: 'fail',
        jsdoc: 'fail'
      },
      jtp: {
        closure: 'closure',
        jsdoc: 'fail',
        typescript: 'typescript',
        permissive: 'typescript'
      }
    })
  })

  describe('repeatable typeof name', () => {
    testFixture({
      input: '...typeof A',
      expected: {
        type: 'JsdocTypeVariadic',
        element: {
          type: 'JsdocTypeTypeof',
          element: {
            type: 'JsdocTypeName',
            value: 'A'
          }
        },
        meta: {
          squareBrackets: false,
          position: 'prefix'
        }
      },
      modes: [
        'closure',
        'typescript'
      ],
      catharsis: {
        closure: 'fail',
        jsdoc: 'fail'
      },
      jtp: {
        closure: 'closure',
        jsdoc: 'fail',
        typescript: 'typescript',
        permissive: 'typescript'
      }
    })
  })

  describe('postfix repeatable typeof name', () => {
    testFixture({
      input: 'typeof A...',
      expected: {
        type: 'JsdocTypeVariadic',
        element: {
          type: 'JsdocTypeTypeof',
          element: {
            type: 'JsdocTypeName',
            value: 'A'
          }
        },
        meta: {
          squareBrackets: false,
          position: 'suffix'
        }
      },
      modes: [],
      catharsis: {
        closure: 'fail',
        jsdoc: 'fail'
      },
      jtp: {
        closure: 'differ',
        jsdoc: 'fail',
        typescript: 'differ',
        permissive: 'differ'
      }
    })
  })

  describe('union typeof name', () => {
    testFixture({
      input: 'typeof A | number',
      expected: {
        type: 'JsdocTypeUnion',
        elements: [
          {
            type: 'JsdocTypeTypeof',
            element: {
              type: 'JsdocTypeName',
              value: 'A'
            }
          },
          {
            type: 'JsdocTypeName',
            value: 'number'
          }
        ]
      },
      modes: [
        'typescript',
        'closure'
      ],
      catharsis: {
        closure: 'fail',
        jsdoc: 'fail'
      },
      jtp: {
        closure: 'closure',
        jsdoc: 'fail',
        typescript: 'typescript',
        permissive: 'typescript'
      }
    })
  })

  describe('union with typeof name', () => {
    testFixture({
      input: 'number | typeof A',
      expected: {
        type: 'JsdocTypeUnion',
        elements: [
          {
            type: 'JsdocTypeName',
            value: 'number'
          },
          {
            type: 'JsdocTypeTypeof',
            element: {
              type: 'JsdocTypeName',
              value: 'A'
            }
          }
        ]
      },
      modes: [
        'typescript',
        'closure'
      ],
      catharsis: {
        closure: 'fail',
        jsdoc: 'fail'
      },
      jtp: {
        closure: 'closure',
        jsdoc: 'fail',
        typescript: 'typescript',
        permissive: 'typescript'
      }
    })
  })

  describe('typeof array', () => {
    testFixture({
      input: 'typeof N[]',
      expected: {
        type: 'JsdocTypeTypeof',
        element: {
          type: 'JsdocTypeGeneric',
          left: {
            type: 'JsdocTypeName',
            value: 'Array'
          },
          elements: [
            {
              type: 'JsdocTypeName',
              value: 'N'
            }
          ],
          meta: {
            dot: false,
            brackets: 'square'
          }
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
        typescript: 'differ',
        permissive: 'differ'
      }
    })
  })

  describe('typeof as function parameter without return type should fail', () => {
    testFixture({
      input: 'function(typeof A)',
      expected: {
        type: 'JsdocTypeFunction',
        parameters: [
          {
            type: 'JsdocTypeTypeof',
            element: {
              type: 'JsdocTypeName',
              value: 'A'
            }
          }
        ],
        arrow: false,
        constructor: false,
        parenthesis: true
      },
      modes: [
        'closure',
        'typescript'
      ],
      catharsis: {
        closure: 'fail',
        jsdoc: 'fail'
      },
      jtp: {
        closure: 'closure',
        jsdoc: 'fail',
        typescript: 'differ',
        permissive: 'differ'
      }
    })
  })

  describe('typeof as function parameter', () => {
    testFixture({
      input: 'function(typeof A): void',
      expected: {
        type: 'JsdocTypeFunction',
        parameters: [
          {
            type: 'JsdocTypeTypeof',
            element: {
              type: 'JsdocTypeName',
              value: 'A'
            }
          }
        ],
        returnType: {
          type: 'JsdocTypeName',
          value: 'void'
        },
        arrow: false,
        constructor: false,
        parenthesis: true
      },
      modes: [
        'typescript',
        'closure'
      ],
      catharsis: {
        closure: 'fail',
        jsdoc: 'fail'
      },
      jtp: {
        closure: 'closure',
        jsdoc: 'fail',
        typescript: 'typescript',
        permissive: 'typescript'
      }
    })
  })

  describe('typeof as first function parameter', () => {
    testFixture({
      input: 'function(typeof A, number): void',
      expected: {
        type: 'JsdocTypeFunction',
        parameters: [
          {
            type: 'JsdocTypeTypeof',
            element: {
              type: 'JsdocTypeName',
              value: 'A'
            }
          },
          {
            type: 'JsdocTypeName',
            value: 'number'
          }
        ],
        returnType: {
          type: 'JsdocTypeName',
          value: 'void'
        },
        arrow: false,
        constructor: false,
        parenthesis: true
      },
      modes: [
        'typescript',
        'closure'
      ],
      catharsis: {
        closure: 'fail',
        jsdoc: 'fail'
      },
      jtp: {
        closure: 'closure',
        jsdoc: 'fail',
        typescript: 'typescript',
        permissive: 'typescript'
      }
    })
  })

  describe('typeof as second function parameter', () => {
    testFixture({
      input: 'function(number, typeof A): void',
      expected: {
        type: 'JsdocTypeFunction',
        parameters: [
          {
            type: 'JsdocTypeName',
            value: 'number'
          },
          {
            type: 'JsdocTypeTypeof',
            element: {
              type: 'JsdocTypeName',
              value: 'A'
            }
          }
        ],
        returnType: {
          type: 'JsdocTypeName',
          value: 'void'
        },
        arrow: false,
        constructor: false,
        parenthesis: true
      },
      modes: [
        'typescript',
        'closure'
      ],
      catharsis: {
        closure: 'fail',
        jsdoc: 'fail'
      },
      jtp: {
        closure: 'closure',
        jsdoc: 'fail',
        typescript: 'typescript',
        permissive: 'typescript'
      }
    })
  })

  describe('typeof as return of function', () => {
    testFixture({
      input: 'function(): typeof A',
      expected: {
        type: 'JsdocTypeFunction',
        parameters: [],
        returnType: {
          type: 'JsdocTypeTypeof',
          element: {
            type: 'JsdocTypeName',
            value: 'A'
          }
        },
        arrow: false,
        constructor: false,
        parenthesis: true
      },
      modes: [
        'typescript',
        'closure'
      ],
      catharsis: {
        closure: 'fail',
        jsdoc: 'fail'
      },
      jtp: {
        closure: 'closure',
        jsdoc: 'fail',
        typescript: 'typescript',
        permissive: 'typescript'
      }
    })
  })
})

// TODO:
// {
//   description: 'generic typeof name in parenthesis',
//   input: '(typeof X)<A>',
//   expected: {
//     type: 'JsdocTypeGeneric',
//     left: {
//       type: 'JsdocTypeTypeof',
//       element: {
//         type: 'JsdocTypeName',
//         value: 'X',
//         meta: {
//           reservedWord: false
//         }
//       }
//     },
//     elements: [
//       {
//         type: 'JsdocTypeName',
//         value: 'A',
//         meta: {
//           reservedWord: false
//         }
//       }
//     ],
//     meta: {
//       dot: false,
//       brackets: 'angle'
//     }
//   },
//   modes: ['typescript'],
//   catharsis: {
//     closure: 'fail',
//     jsdoc: 'fail'
//   },
//   jtp: {
//     closure: 'fail',
//     jsdoc: 'fail',
//     typescript: 'typescript',
//     permissive: 'typescript'
//   }
// },
