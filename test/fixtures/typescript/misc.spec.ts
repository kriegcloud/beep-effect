import { testFixture } from '../Fixture.js'

describe('typescript misc tests', () => {
  describe('function parameter list with trailing comma', () => {
    testFixture({
      input: 'function( TrailingComma, ): string',
      stringified: 'function(TrailingComma): string',
      expected: {
        type: 'JsdocTypeFunction',
        parameters: [
          {
            type: 'JsdocTypeName',
            value: 'TrailingComma'
          }
        ],
        returnType: {
          type: 'JsdocTypeName',
          value: 'string'
        },
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
        closure: 'fail',
        jsdoc: 'fail'
      },
      jtp: {
        closure: 'closure',
        jsdoc: 'jsdoc',
        typescript: 'typescript',
        permissive: 'typescript'
      }
    })
  })
})
