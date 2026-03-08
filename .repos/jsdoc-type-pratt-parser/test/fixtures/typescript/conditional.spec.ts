import { testFixture } from '../Fixture.js'

describe('typescript conditional', () => {
  describe('should parse a conditional', () => {
    testFixture({
      input: 'A extends B ? C : D',
      modes: ['typescript'],
      expected: {
        type: 'JsdocTypeConditional',
        checksType: {
          type: 'JsdocTypeName',
          value: 'A'
        },
        extendsType: {
          type: 'JsdocTypeName',
          value: 'B'
        },
        trueType: {
          type: 'JsdocTypeName',
          value: 'C'
        },
        falseType: {
          type: 'JsdocTypeName',
          value: 'D'
        }
      }
    })
  })

  describe('should parse a conditional with keyof', () => {
    testFixture({
      input: 'K extends keyof Abc ? Abc[K] : Def',
      modes: ['typescript'],
      expected: {
        type: 'JsdocTypeConditional',
        checksType: {
          type: 'JsdocTypeName',
          value: 'K'
        },
        extendsType: {
          type: 'JsdocTypeKeyof',
          element: {
            type: 'JsdocTypeName',
            value: 'Abc'
          }
        },
        trueType: {
          type: 'JsdocTypeNamePath',
          left: {
            type: 'JsdocTypeName',
            value: 'Abc'
          },
          right: {
            type: 'JsdocTypeProperty',
            value: 'K',
            meta: {
              quote: undefined
            }
          },
          pathType: 'property-brackets'
        },
        falseType: {
          type: 'JsdocTypeName',
          value: 'Def'
        }
      }
    })
  })

  describe('should support `infer` within a conditional', () => {
    testFixture({
      input: 'A extends B<infer b> ? b : C',
      modes: ['typescript'],
      expected: {
        type: 'JsdocTypeConditional',
        checksType: {
          type: 'JsdocTypeName',
          value: 'A'
        },
        extendsType: {
          type: 'JsdocTypeGeneric',
          left: {
            type: 'JsdocTypeName',
            value: 'B'
          },
          elements: [
            {
              type: 'JsdocTypeInfer',
              element: {
                type: 'JsdocTypeName',
                value: 'b'
              }
            }
          ],
          meta: {
            brackets: 'angle',
            dot: false
          }
        },
        trueType: {
          type: 'JsdocTypeName',
          value: 'b'
        },
        falseType: {
          type: 'JsdocTypeName',
          value: 'C'
        }
      }
    })
  })

  describe('should support `infer` in a non-initial generic parameter', () => {
    testFixture({
      input: 'T extends Map<any, infer V> ? V : never',
      modes: ['typescript'],
      expected: {
        type: 'JsdocTypeConditional',
        checksType: { type: 'JsdocTypeName', value: 'T' },
        extendsType: {
          type: 'JsdocTypeGeneric',
          left: { type: 'JsdocTypeName', value: 'Map' },
          elements: [
            { type: 'JsdocTypeName', value: 'any' },
            { type: 'JsdocTypeInfer', element: { type: 'JsdocTypeName', value: 'V' } }
          ],
          meta: { brackets: 'angle', dot: false }
        },
        trueType: { type: 'JsdocTypeName', value: 'V' },
        falseType: { type: 'JsdocTypeName', value: 'never' }
      }
    })
  })

  describe('should throw with bad `infer` within a conditional', () => {
    testFixture({
      input: 'A extends B<infer 5> ? b : C',
      modes: [],
      expected: {
        type: 'JsdocTypeConditional',
        checksType: {
          type: 'JsdocTypeName',
          value: 'A'
        },
        extendsType: {
          type: 'JsdocTypeGeneric',
          left: {
            type: 'JsdocTypeName',
            value: 'B'
          },
          elements: [
            {
              type: 'JsdocTypeInfer',
              element: {
                type: 'JsdocTypeName',
                value: 'b'
              }
            }
          ],
          meta: {
            brackets: 'angle',
            dot: false
          }
        },
        trueType: {
          type: 'JsdocTypeName',
          value: 'b'
        },
        falseType: {
          type: 'JsdocTypeName',
          value: 'C'
        }
      }
    })
  })
})
