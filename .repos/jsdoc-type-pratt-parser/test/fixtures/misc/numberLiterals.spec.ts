import { testFixture } from '../Fixture.js'

describe('number literals tests', () => {
  describe('should accept numbers as types', () => {
    testFixture({
      input: '123',
      expected: {
        type: 'JsdocTypeNumber',
        value: 123
      },
      modes: [
        'jsdoc',
        'closure',
        'typescript'
      ],
      jtp: {
        jsdoc: 'jsdoc',
        closure: 'closure',
        typescript: 'typescript',
        permissive: 'jsdoc'
      },
      catharsis: {
        jsdoc: 'jsdoc',
        closure: 'closure'
      }
    })
  })

  describe('should accept numbers in type unions', () => {
    testFixture({
      input: '123 | 456',
      expected: {
        type: 'JsdocTypeUnion',
        elements: [
          {
            type: 'JsdocTypeNumber',
            value: 123
          },
          {
            type: 'JsdocTypeNumber',
            value: 456
          }
        ]
      },
      modes: [
        'jsdoc',
        'closure',
        'typescript'
      ],
      jtp: {
        jsdoc: 'jsdoc',
        closure: 'closure',
        typescript: 'typescript',
        permissive: 'jsdoc'
      },
      catharsis: {
        jsdoc: 'jsdoc',
        closure: 'closure'
      }
    })
  })

  describe('should accept numbers as generic parameters', () => {
    testFixture({
      input: 'SomeType<123 & 456>',
      expected: {
        type: 'JsdocTypeGeneric',
        left: {
          type: 'JsdocTypeName',
          value: 'SomeType'
        },
        elements: [
          {
            type: 'JsdocTypeIntersection',
            elements: [
              {
                type: 'JsdocTypeNumber',
                value: 123
              },
              {
                type: 'JsdocTypeNumber',
                value: 456
              }
            ]
          }
        ],
        meta: {
          brackets: 'angle',
          dot: false
        }
      },
      modes: [
        'typescript'
      ],
      jtp: {
        jsdoc: 'fail',
        closure: 'fail',
        typescript: 'typescript',
        permissive: 'typescript'
      },
      catharsis: {
        jsdoc: 'fail',
        closure: 'fail'
      }
    })
  })

  describe('should accept floating point numbers', () => {
    testFixture({
      input: '3.14 | 1.2e+104',
      modes: ['typescript', 'jsdoc', 'closure'],
      expected: {
        type: 'JsdocTypeUnion',
        elements: [
          {
            type: 'JsdocTypeNumber',
            value: 3.14
          },
          {
            type: 'JsdocTypeNumber',
            value: 1.2e+104
          }
        ]
      }
    })
  })
})
