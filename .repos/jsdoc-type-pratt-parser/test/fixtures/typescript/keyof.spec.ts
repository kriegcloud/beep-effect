import { testFixture } from '../Fixture.js'

describe('typescript keyof tests', () => {
  describe('keyof name', () => {
    testFixture({
      input: 'keyof A',
      expected: {
        type: 'JsdocTypeKeyof',
        element: {
          type: 'JsdocTypeName',
          value: 'A'
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

  describe('keyof', () => {
    testFixture({
      input: 'keyof',
      expected: {
        type: 'JsdocTypeName',
        value: 'keyof'
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
        closure: 'differ',
        jsdoc: 'differ',
        typescript: 'differ',
        permissive: 'differ'
      }
    })
  })

  describe('generic with keyof', () => {
    testFixture({
      input: 'X<keyof>',
      expected: {
        type: 'JsdocTypeGeneric',
        left: {
          type: 'JsdocTypeName',
          value: 'X'
        },
        elements: [
          {
            type: 'JsdocTypeName',
            value: 'keyof'
          }
        ],
        meta: {
          dot: false,
          brackets: 'angle'
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
        closure: 'differ',
        jsdoc: 'differ',
        typescript: 'differ',
        permissive: 'differ'
      }
    })
  })

  describe('generic with keyof name', () => {
    testFixture({
      input: 'X<keyof A>',
      expected: {
        type: 'JsdocTypeGeneric',
        left: {
          type: 'JsdocTypeName',
          value: 'X'
        },
        elements: [
          {
            type: 'JsdocTypeKeyof',
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

  describe('keyof name in parenthesis', () => {
    testFixture({
      input: '(keyof A)',
      expected: {
        type: 'JsdocTypeParenthesis',
        element: {
          type: 'JsdocTypeKeyof',
          element: {
            type: 'JsdocTypeName',
            value: 'A'
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
        typescript: 'typescript',
        permissive: 'typescript'
      }
    })
  })

  describe('repeatable keyof name', () => {
    testFixture({
      input: '...keyof A',
      expected: {
        type: 'JsdocTypeVariadic',
        element: {
          type: 'JsdocTypeKeyof',
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

  describe('postfix repeatable keyof name', () => {
    testFixture({
      input: 'keyof A...',
      expected: {
        type: 'JsdocTypeVariadic',
        element: {
          type: 'JsdocTypeKeyof',
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
        closure: 'fail',
        jsdoc: 'fail',
        typescript: 'differ',
        permissive: 'differ'
      }
    })
  })

  describe('union keyof name', () => {
    testFixture({
      input: 'keyof A | number',
      expected: {
        type: 'JsdocTypeUnion',
        elements: [
          {
            type: 'JsdocTypeKeyof',
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

  describe('union with keyof name', () => {
    testFixture({
      input: 'number | keyof A',
      expected: {
        type: 'JsdocTypeUnion',
        elements: [
          {
            type: 'JsdocTypeName',
            value: 'number'
          },
          {
            type: 'JsdocTypeKeyof',
            element: {
              type: 'JsdocTypeName',
              value: 'A'
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

  describe('keyof array', () => {
    testFixture({
      input: 'keyof N[]',
      expected: {
        type: 'JsdocTypeKeyof',
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
        typescript: 'typescript',
        permissive: 'typescript'
      }
    })
  })

  describe('keyof as function parameter without return', () => {
    testFixture({
      input: 'function(keyof A)',
      modes: [
        'typescript'
      ],
      expected: {
        type: 'JsdocTypeFunction',
        parameters: [
          {
            type: 'JsdocTypeKeyof',
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

  describe('keyof as function parameter', () => {
    testFixture({
      input: 'function(keyof A): void',
      expected: {
        type: 'JsdocTypeFunction',
        parameters: [
          {
            type: 'JsdocTypeKeyof',
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

  describe('keyof as first function parameter', () => {
    testFixture({
      input: 'function(keyof A, number): void',
      expected: {
        type: 'JsdocTypeFunction',
        parameters: [
          {
            type: 'JsdocTypeKeyof',
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

  describe('keyof as second function parameter', () => {
    testFixture({
      input: 'function(number, keyof A): void',
      expected: {
        type: 'JsdocTypeFunction',
        parameters: [
          {
            type: 'JsdocTypeName',
            value: 'number'
          },
          {
            type: 'JsdocTypeKeyof',
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

  describe('keyof as return of function', () => {
    testFixture({
      input: 'function(): keyof A',
      expected: {
        type: 'JsdocTypeFunction',
        parameters: [],
        returnType: {
          type: 'JsdocTypeKeyof',
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
})

// TODO:
// {
//   description: 'generic keyof name in parenthesis',
//   input: '(keyof X)<A>',
//   expected: {
//     type: 'JsdocTypeGeneric',
//     left: {
//       type: 'JsdocTypeKeyof',
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
