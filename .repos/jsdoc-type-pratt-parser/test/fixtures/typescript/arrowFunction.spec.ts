import { testFixture } from '../Fixture.js'

describe('typescript arrow function tests', () => {
  describe('arrow with special any type', () => {
    testFixture({
      input: '(x: *) => *',
      expected: {
        type: 'JsdocTypeFunction',
        parameters: [
          {
            type: 'JsdocTypeKeyValue',
            key: 'x',
            optional: false,
            variadic: false,
            right: {
              type: 'JsdocTypeAny'
            }
          }
        ],
        returnType: {
          type: 'JsdocTypeAny'
        },
        arrow: true,
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

  describe('arrow with one parameter and return type', () => {
    testFixture({
      input: '(x: number) => string',
      expected: {
        type: 'JsdocTypeFunction',
        parameters: [
          {
            type: 'JsdocTypeKeyValue',
            key: 'x',
            optional: false,
            variadic: false,
            right: {
              type: 'JsdocTypeName',
              value: 'number'
            }
          }
        ],
        returnType: {
          type: 'JsdocTypeName',
          value: 'string'
        },
        arrow: true,
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

  describe('arrow with multiple parameters and a return type', () => {
    testFixture({
      input: '(x: number, y: string, z: Class) => string',
      expected: {
        type: 'JsdocTypeFunction',
        parameters: [
          {
            type: 'JsdocTypeKeyValue',
            key: 'x',
            optional: false,
            variadic: false,
            right: {
              type: 'JsdocTypeName',
              value: 'number'
            }
          },
          {
            type: 'JsdocTypeKeyValue',
            key: 'y',
            optional: false,
            variadic: false,
            right: {
              type: 'JsdocTypeName',
              value: 'string'
            }
          },
          {
            type: 'JsdocTypeKeyValue',
            key: 'z',
            optional: false,
            variadic: false,
            right: {
              type: 'JsdocTypeName',
              value: 'Class'
            }
          }
        ],
        returnType: {
          type: 'JsdocTypeName',
          value: 'string'
        },
        arrow: true,
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

  describe('arrow without parameter and return type', () => {
    testFixture({
      input: '() => string',
      expected: {
        type: 'JsdocTypeFunction',
        parameters: [],
        returnType: {
          type: 'JsdocTypeName',
          value: 'string'
        },
        arrow: true,
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

  describe('function with arrow as return type', () => {
    testFixture({
      input: 'function(): () => string',
      expected: {
        type: 'JsdocTypeFunction',
        parameters: [],
        returnType: {
          type: 'JsdocTypeFunction',
          parameters: [],
          returnType: {
            type: 'JsdocTypeName',
            value: 'string'
          },
          arrow: true,
          constructor: false,
          parenthesis: true
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

  describe('function with arrow as parameter', () => {
    testFixture({
      input: 'function(() => string): void',
      expected: {
        type: 'JsdocTypeFunction',
        parameters: [
          {
            type: 'JsdocTypeFunction',
            parameters: [],
            returnType: {
              type: 'JsdocTypeName',
              value: 'string'
            },
            arrow: true,
            constructor: false,
            parenthesis: true
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

  describe('arrow function parameter list with trailing comma', () => {
    testFixture({
      input: '( arrow: Function, with: TrailingComma, ) => string',
      stringified: '(arrow: Function, with: TrailingComma) => string',
      expected: {
        type: 'JsdocTypeFunction',
        parameters: [
          {
            type: 'JsdocTypeKeyValue',
            key: 'arrow',
            optional: false,
            variadic: false,
            right: {
              type: 'JsdocTypeName',
              value: 'Function'
            }
          },
          {
            type: 'JsdocTypeKeyValue',
            key: 'with',
            optional: false,
            variadic: false,
            right: {
              type: 'JsdocTypeName',
              value: 'TrailingComma'
            }
          }
        ],
        returnType: {
          type: 'JsdocTypeName',
          value: 'string'
        },
        arrow: true,
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

  describe('arrow as generic type', () => {
    testFixture({
      input: 'X<() => string>',
      expected: {
        type: 'JsdocTypeGeneric',
        left: {
          type: 'JsdocTypeName',
          value: 'X'
        },
        elements: [
          {
            type: 'JsdocTypeFunction',
            parameters: [],
            returnType: {
              type: 'JsdocTypeName',
              value: 'string'
            },
            arrow: true,
            constructor: false,
            parenthesis: true
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

  describe('arrow returning void', () => {
    testFixture({
      input: '() => void',
      expected: {
        type: 'JsdocTypeFunction',
        parameters: [],
        arrow: true,
        constructor: false,
        parenthesis: true,
        returnType: {
          type: 'JsdocTypeName',
          value: 'void'
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

  describe('arrow returning arrow', () => {
    testFixture({
      input: '() => () => void',
      expected: {
        type: 'JsdocTypeFunction',
        parameters: [],
        returnType: {
          type: 'JsdocTypeFunction',
          parameters: [],
          returnType: {
            type: 'JsdocTypeName',
            value: 'void'
          },
          arrow: true,
          constructor: false,
          parenthesis: true
        },
        arrow: true,
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

  describe('arrow returning arrow with parameters', () => {
    testFixture({
      input: '(a: number) => (b: string) => boolean',
      expected: {
        type: 'JsdocTypeFunction',
        parameters: [
          {
            type: 'JsdocTypeKeyValue',
            key: 'a',
            optional: false,
            variadic: false,
            right: {
              type: 'JsdocTypeName',
              value: 'number'
            }
          }
        ],
        returnType: {
          type: 'JsdocTypeFunction',
          parameters: [
            {
              type: 'JsdocTypeKeyValue',
              key: 'b',
              optional: false,
              variadic: false,
              right: {
                type: 'JsdocTypeName',
                value: 'string'
              }
            }
          ],
          returnType: {
            type: 'JsdocTypeName',
            value: 'boolean'
          },
          arrow: true,
          constructor: false,
          parenthesis: true
        },
        arrow: true,
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

  describe('arrow with unnamed parameters', () => {
    testFixture({
      input: '(number) => void',
      expected: {
        type: 'JsdocTypeFunction',
        parameters: [
          {
            type: 'JsdocTypeName',
            value: 'number'
          }
        ],
        returnType: {
          type: 'JsdocTypeName',
          value: 'void'
        },
        arrow: true,
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
        typescript: 'fail',
        permissive: 'fail'
      }
    })
  })

  describe('arrow with unnamed parameters that are not names should fail', () => {
    testFixture({
      input: '(Array<string>) => void',
      modes: [],
      catharsis: {
        closure: 'fail',
        jsdoc: 'fail'
      },
      jtp: {
        closure: 'fail',
        jsdoc: 'fail',
        typescript: 'fail',
        permissive: 'fail'
      }
    })
  })

  describe('arrow as first object property', () => {
    testFixture({
      input: '{x: () => void, y: string}',
      modes: ['typescript'],
      expected: {
        type: 'JsdocTypeObject',
        elements: [
          {
            type: 'JsdocTypeObjectField',
            optional: false,
            readonly: false,
            key: 'x',
            right: {
              type: 'JsdocTypeFunction',
              parameters: [],
              returnType: {
                type: 'JsdocTypeName',
                value: 'void'
              },
              arrow: true,
              constructor: false,
              parenthesis: true
            },
            meta: {
              quote: undefined
            }
          },
          {
            type: 'JsdocTypeObjectField',
            key: 'y',
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
        ],
        meta: {
          separator: 'comma'
        }
      }
    })
  })

  describe('optional parameters for functions', () => {
    testFixture({
      input: '(param1: string, param2?: string) => number',
      expected: {
        type: 'JsdocTypeFunction',
        arrow: true,
        constructor: false,
        parenthesis: true,
        parameters: [{
          type: 'JsdocTypeKeyValue',
          key: 'param1',
          right: {
            type: 'JsdocTypeName',
            value: 'string'
          },
          optional: false,
          variadic: false
        }, {
          type: 'JsdocTypeKeyValue',
          key: 'param2',
          right: {
            type: 'JsdocTypeName',
            value: 'string'
          },
          optional: true,
          variadic: false
        }],
        returnType: {
          type: 'JsdocTypeName',
          value: 'number'
        }
      },
      modes: ['typescript']
    })
  })

  describe('arrow with one parameter and return type and type params', () => {
    testFixture({
      input: '<T, U extends V = string, W = string>(x: T) => U',
      expected: {
        type: 'JsdocTypeFunction',
        typeParameters: [
          {
            type: 'JsdocTypeTypeParameter',
            name: {
              type: 'JsdocTypeName',
              value: 'T'
            }
          },
          {
            type: 'JsdocTypeTypeParameter',
            name: {
              type: 'JsdocTypeName',
              value: 'U'
            },
            constraint: {
              type: 'JsdocTypeName',
              value: 'V'
            },
            defaultValue: {
              type: 'JsdocTypeName',
              value: 'string'
            }
          },
          {
            type: 'JsdocTypeTypeParameter',
            name: {
              type: 'JsdocTypeName',
              value: 'W'
            },
            defaultValue: {
              type: 'JsdocTypeName',
              value: 'string'
            }
          }
        ],
        parameters: [
          {
            type: 'JsdocTypeKeyValue',
            key: 'x',
            optional: false,
            variadic: false,
            right: {
              type: 'JsdocTypeName',
              value: 'T'
            }
          }
        ],
        returnType: {
          type: 'JsdocTypeName',
          value: 'U'
        },
        arrow: true,
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
        typescript: 'fail',
        permissive: 'fail'
      }
    })
  })
})

// TODO:
// {new (x: number) => string} // should fail
