import { testFixture } from '../Fixture.js'

describe('typescript intersection tests', () => {
  describe('intersection of 2 types', () => {
    testFixture({
      input: 'A & B',
      expected: {
        type: 'JsdocTypeIntersection',
        elements: [
          {
            type: 'JsdocTypeName',
            value: 'A'
          },
          {
            type: 'JsdocTypeName',
            value: 'B'
          }
        ]
      },
      modes: [
        'typescript'
      ],
      catharsis: {
        jsdoc: 'fail',
        closure: 'fail'
      },
      jtp: {
        jsdoc: 'fail',
        closure: 'fail',
        typescript: 'typescript',
        permissive: 'typescript'
      }
    })
  })

  describe('nullable intersection', () => {
    testFixture({
      input: '(A & B)?',
      expected: {
        type: 'JsdocTypeNullable',
        element: {
          type: 'JsdocTypeParenthesis',
          element: {
            type: 'JsdocTypeIntersection',
            elements: [
              {
                type: 'JsdocTypeName',
                value: 'A'
              },
              {
                type: 'JsdocTypeName',
                value: 'B'
              }
            ]
          }
        },
        meta: {
          position: 'suffix'
        }
      },
      modes: [
        'typescript'
      ],
      catharsis: {
        jsdoc: 'fail',
        closure: 'fail'
      },
      jtp: {
        jsdoc: 'fail',
        closure: 'fail',
        typescript: 'typescript',
        permissive: 'typescript'
      }
    })
  })

  describe('intersection of a function and generic', () => {
    testFixture({
      input: 'function(): void & A<B, C>',
      expected: {
        type: 'JsdocTypeIntersection',
        elements: [
          {
            type: 'JsdocTypeFunction',
            parameters: [],
            returnType: {
              type: 'JsdocTypeName',
              value: 'void'
            },
            arrow: false,
            constructor: false,
            parenthesis: true
          },
          {
            type: 'JsdocTypeGeneric',
            left: {
              type: 'JsdocTypeName',
              value: 'A'
            },
            elements: [
              {
                type: 'JsdocTypeName',
                value: 'B'
              },
              {
                type: 'JsdocTypeName',
                value: 'C'
              }
            ],
            meta: {
              dot: false,
              brackets: 'angle'
            }
          }
        ]
      },
      modes: [
        'typescript'
      ],
      catharsis: {
        jsdoc: 'fail',
        closure: 'fail'
      },
      jtp: {
        jsdoc: 'fail',
        closure: 'fail',
        typescript: 'typescript',
        permissive: 'typescript'
      }
    })
  })

  describe('intersection of an union and an arrow', () => {
    testFixture({
      input: '(A | B) & (a: string) => void',
      expected: {
        type: 'JsdocTypeIntersection',
        elements: [
          {
            type: 'JsdocTypeParenthesis',
            element: {
              type: 'JsdocTypeUnion',
              elements: [
                {
                  type: 'JsdocTypeName',
                  value: 'A'
                },
                {
                  type: 'JsdocTypeName',
                  value: 'B'
                }
              ]
            }
          },
          {
            type: 'JsdocTypeFunction',
            arrow: true,
            constructor: false,
            parenthesis: true,
            parameters: [
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
            ],
            returnType: {
              type: 'JsdocTypeName',
              value: 'void'
            }
          }
        ]
      },
      modes: [
        'typescript'
      ],
      catharsis: {
        jsdoc: 'fail',
        closure: 'fail'
      },
      jtp: {
        jsdoc: 'fail',
        closure: 'fail',
        typescript: 'typescript',
        permissive: 'typescript'
      }
    })
  })
})
