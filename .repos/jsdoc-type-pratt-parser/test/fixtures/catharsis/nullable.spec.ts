import { testFixture } from '../Fixture.js'

describe('catharsis nullable tests', () => {
  describe('nullable number', () => {
    testFixture({
      input: '?number',
      expected: {
        type: 'JsdocTypeNullable',
        element: {
          type: 'JsdocTypeName',
          value: 'number'
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

  describe('postfix nullable number', () => {
    testFixture({
      input: 'number?',
      expected: {
        type: 'JsdocTypeNullable',
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

  describe('non-nullable object', () => {
    testFixture({
      input: '!Object',
      expected: {
        type: 'JsdocTypeNotNullable',
        element: {
          type: 'JsdocTypeName',
          value: 'Object'
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

  describe('postfix non-nullable object', () => {
    testFixture({
      input: 'Object!',
      expected: {
        type: 'JsdocTypeNotNullable',
        element: {
          type: 'JsdocTypeName',
          value: 'Object'
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
        typescript: 'typescript',
        permissive: 'closure'
      }
    })
  })

  describe('repeatable nullable number', () => {
    testFixture({
      input: '...?number',
      expected: {
        type: 'JsdocTypeVariadic',
        element: {
          type: 'JsdocTypeNullable',
          element: {
            type: 'JsdocTypeName',
            value: 'number'
          },
          meta: {
            position: 'prefix'
          }
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

  describe('postfix repeatable nullable number', () => {
    testFixture({
      input: '...number?',
      expected: {
        type: 'JsdocTypeVariadic',
        element: {
          type: 'JsdocTypeNullable',
          element: {
            type: 'JsdocTypeName',
            value: 'number'
          },
          meta: {
            position: 'suffix'
          }
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

  describe('repeatable non-nullable object', () => {
    testFixture({
      input: '...!Object',
      expected: {
        type: 'JsdocTypeVariadic',
        element: {
          type: 'JsdocTypeNotNullable',
          element: {
            type: 'JsdocTypeName',
            value: 'Object'
          },
          meta: {
            position: 'prefix'
          }
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

  describe('postfix repeatable non-nullable object', () => {
    testFixture({
      input: '...Object!',
      expected: {
        type: 'JsdocTypeVariadic',
        element: {
          type: 'JsdocTypeNotNullable',
          element: {
            type: 'JsdocTypeName',
            value: 'Object'
          },
          meta: {
            position: 'suffix'
          }
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

  describe('postfix optional nullable number', () => {
    testFixture({
      input: 'number=?',
      expected: {
        type: 'JsdocTypeNullable',
        element: {
          type: 'JsdocTypeOptional',
          element: {
            type: 'JsdocTypeName',
            value: 'number'
          },
          meta: {
            position: 'suffix'
          }
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
        closure: 'fail',
        jsdoc: 'fail',
        typescript: 'fail',
        permissive: 'fail'
      }
    })
  })

  describe('postfix nullable optional number', () => {
    testFixture({
      input: 'number?=',
      expected: {
        type: 'JsdocTypeOptional',
        element: {
          type: 'JsdocTypeNullable',
          element: {
            type: 'JsdocTypeName',
            value: 'number'
          },
          meta: {
            position: 'suffix'
          }
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

  describe('postfix repeatable nullable optional number', () => {
    testFixture({
      input: '...number?=',
      expected: {
        type: 'JsdocTypeVariadic',
        element: {
          type: 'JsdocTypeOptional',
          element: {
            type: 'JsdocTypeNullable',
            element: {
              type: 'JsdocTypeName',
              value: 'number'
            },
            meta: {
              position: 'suffix'
            }
          },
          meta: {
            position: 'suffix'
          }
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

  describe('postfix optional non-nullable object', () => {
    testFixture({
      input: 'Object=!',
      expected: {
        type: 'JsdocTypeNotNullable',
        element: {
          type: 'JsdocTypeOptional',
          element: {
            type: 'JsdocTypeName',
            value: 'Object'
          },
          meta: {
            position: 'suffix'
          }
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
        closure: 'fail',
        jsdoc: 'fail',
        typescript: 'fail',
        permissive: 'fail'
      }
    })
  })

  describe('postfix non-nullable optional object', () => {
    testFixture({
      input: 'Object!=',
      expected: {
        type: 'JsdocTypeOptional',
        element: {
          type: 'JsdocTypeNotNullable',
          element: {
            type: 'JsdocTypeName',
            value: 'Object'
          },
          meta: {
            position: 'suffix'
          }
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
        typescript: 'typescript',
        permissive: 'closure'
      }
    })
  })

  describe('postfix repeatable non-nullable optional object', () => {
    testFixture({
      input: '...Object!=',
      expected: {
        type: 'JsdocTypeVariadic',
        element: {
          type: 'JsdocTypeOptional',
          element: {
            type: 'JsdocTypeNotNullable',
            element: {
              type: 'JsdocTypeName',
              value: 'Object'
            },
            meta: {
              position: 'suffix'
            }
          },
          meta: {
            position: 'suffix'
          }
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
})
