import { testFixture } from '../Fixture.js'

describe('catharsis basic tests', () => {
  describe('boolean', () => {
    testFixture({
      input: 'boolean',
      expected: {
        type: 'JsdocTypeName',
        value: 'boolean'
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

  describe('object', () => {
    testFixture({
      input: 'Window',
      expected: {
        type: 'JsdocTypeName',
        value: 'Window'
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

  describe('object with properties', () => {
    testFixture({
      input: 'goog.ui.Menu',
      expected: {
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

  describe('object with a single-quoted string-literal property', () => {
    testFixture({
      input: "myObj.'myProp'.foo",
      expected: {
        left: {
          left: {
            value: 'myObj',
            type: 'JsdocTypeName'
          },
          right: {
            type: 'JsdocTypeProperty',
            value: 'myProp',
            meta: {
              quote: 'single'
            }
          },
          type: 'JsdocTypeNamePath',
          pathType: 'property'
        },
        right: {
          type: 'JsdocTypeProperty',
          value: 'foo',
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

  describe('object with a double-quoted string-literal property', () => {
    testFixture({
      input: 'myObj."myProp".foo',
      expected: {
        left: {
          left: {
            value: 'myObj',
            type: 'JsdocTypeName'
          },
          right: {
            type: 'JsdocTypeProperty',
            value: 'myProp',
            meta: {
              quote: 'double'
            }
          },
          type: 'JsdocTypeNamePath',
          pathType: 'property'
        },
        right: {
          type: 'JsdocTypeProperty',
          value: 'foo',
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

  describe('failing string literal', () => {
    testFixture({
      input: '\u200B',
      modes: []
    })
  })

  describe('failing unterminated string', () => {
    testFixture({
      input: '"abc',
      modes: []
    })
  })

  describe('object with a string-literal property that includes other punctuation', () => {
    testFixture({
      input: 'myObj."#weirdProp".foo',
      expected: {
        left: {
          left: {
            value: 'myObj',
            type: 'JsdocTypeName'
          },
          right: {
            type: 'JsdocTypeProperty',
            value: '#weirdProp',
            meta: {
              quote: 'double'
            }
          },
          type: 'JsdocTypeNamePath',
          pathType: 'property'
        },
        right: {
          type: 'JsdocTypeProperty',
          value: 'foo',
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

  describe('object with a numeric property', () => {
    testFixture({
      input: 'myObj.12345',
      expected: {
        left: {
          value: 'myObj',
          type: 'JsdocTypeName'
        },
        right: {
          type: 'JsdocTypeProperty',
          value: '12345',
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
        closure: 'fail',
        jsdoc: 'fail',
        typescript: 'fail',
        permissive: 'fail'
      }
    })
  })

  describe('variable number of parameters', () => {
    testFixture({
      input: '...number',
      expected: {
        type: 'JsdocTypeVariadic',
        element: {
          type: 'JsdocTypeName',
          value: 'number'
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

  describe('optional number parameter', () => {
    testFixture({
      input: 'number=',
      expected: {
        type: 'JsdocTypeOptional',
        element: {
          type: 'JsdocTypeName',
          value: 'number'
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

  describe('optional Object parameter', () => {
    testFixture({
      input: 'Object=',
      expected: {
        type: 'JsdocTypeOptional',
        element: {
          type: 'JsdocTypeName',
          value: 'Object'
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

  describe('null', () => {
    testFixture({
      input: 'null',
      expected: {
        type: 'JsdocTypeNull'
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

  describe('repeatable null', () => {
    testFixture({
      input: '...null',
      expected: {
        type: 'JsdocTypeVariadic',
        element: {
          type: 'JsdocTypeNull'
        },
        meta: {
          position: 'prefix',
          squareBrackets: false
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

  describe('undefined', () => {
    testFixture({
      input: 'undefined',
      expected: {
        type: 'JsdocTypeUndefined'
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

  describe('repeatable undefined', () => {
    testFixture({
      input: '...undefined',
      expected: {
        type: 'JsdocTypeVariadic',
        element: {
          type: 'JsdocTypeUndefined'
        },
        meta: {
          position: 'prefix',
          squareBrackets: false
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

  describe('all', () => {
    testFixture({
      input: '*',
      expected: {
        type: 'JsdocTypeAny'
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

  describe('repeatable all', () => {
    testFixture({
      input: '...*',
      expected: {
        type: 'JsdocTypeVariadic',
        element: {
          type: 'JsdocTypeAny'
        },
        meta: {
          position: 'prefix',
          squareBrackets: false
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

  describe('unknown', () => {
    testFixture({
      input: '?',
      expected: {
        type: 'JsdocTypeUnknown'
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

  describe('repeatable unknown', () => {
    testFixture({
      input: '...?',
      expected: {
        type: 'JsdocTypeVariadic',
        element: {
          type: 'JsdocTypeUnknown'
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
        typescript: 'typescript',
        permissive: 'closure'
      }
    })
  })

  describe('name that starts with a reserved word', () => {
    testFixture({
      input: 'forsooth',
      expected: {
        type: 'JsdocTypeName',
        value: 'forsooth'
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

  describe('name that includes a hyphen and a numeral', () => {
    testFixture({
      input: 'My-1st-Class',
      expected: {
        type: 'JsdocTypeName',
        value: 'My-1st-Class'
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
        typescript: 'differ',
        permissive: 'closure'
      }
    })
  })

  describe('single quoted module path', () => {
    testFixture({
      input: "module:'some-path'",
      expected: {
        type: 'JsdocTypeSpecialNamePath',
        specialType: 'module',
        value: 'some-path',
        meta: {
          quote: 'single'
        }
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
        typescript: 'fail',
        permissive: 'jsdoc'
      }
    })
  })

  describe('double quoted module path', () => {
    testFixture({
      input: 'module:"some-path"',
      expected: {
        type: 'JsdocTypeSpecialNamePath',
        specialType: 'module',
        value: 'some-path',
        meta: {
          quote: 'double'
        }
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
        typescript: 'fail',
        permissive: 'jsdoc'
      }
    })
  })

  describe('name that includes an @ sign', () => {
    testFixture({
      input: 'module:@prefix/my-module~myCallback',
      expected: {
        type: 'JsdocTypeNamePath',
        left: {
          value: '@prefix/my-module',
          type: 'JsdocTypeSpecialNamePath',
          specialType: 'module',
          meta: {
            quote: undefined
          }
        },
        right: {
          type: 'JsdocTypeProperty',
          value: 'myCallback',
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
        closure: 'fail',
        jsdoc: 'fail',
        typescript: 'fail',
        permissive: 'fail'
      }
    })
  })
})
