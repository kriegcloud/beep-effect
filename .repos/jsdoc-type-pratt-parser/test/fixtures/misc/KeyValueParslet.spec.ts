import { testFixture } from '../Fixture.js'

describe('variadic tests', () => {
  describe('should get string key value', () => {
    testFixture({
      input: '{"abc": string}',
      expected: {
        type: 'JsdocTypeObject',
        meta: {
          separator: 'comma'
        },
        elements: [
          {
            type: 'JsdocTypeObjectField',
            key: 'abc',
            optional: false,
            readonly: false,
            right: {
              type: 'JsdocTypeName',
              value: 'string'
            },
            meta: {
              quote: 'double'
            }
          }
        ]
      },
      modes: [
        'jsdoc',
        'closure',
        'typescript'
      ]
    })
  })
})
