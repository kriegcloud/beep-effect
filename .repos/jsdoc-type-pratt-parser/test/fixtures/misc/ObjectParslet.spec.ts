import { testFixture } from '../Fixture.js'

describe('`ObjectParslet`', () => {
  describe('record type with numeric key and no right-hand side', () => {
    testFixture({
      input: '{123}',
      expected: {
        type: 'JsdocTypeObject',
        meta: {
          separator: 'comma'
        },
        elements: [
          {
            type: 'JsdocTypeObjectField',
            right: undefined,
            key: '123',
            optional: false,
            readonly: false,
            meta: {
              quote: undefined
            }
          }
        ]
      },
      modes: [
        'closure',
        'typescript',
        'jsdoc'
      ]
    })
  })

  describe('record type with numeric key and no right-hand side', () => {
    testFixture({
      input: '{"abc"}',
      expected: {
        type: 'JsdocTypeObject',
        meta: {
          separator: 'comma'
        },
        elements: [
          {
            type: 'JsdocTypeObjectField',
            right: undefined,
            key: 'abc',
            optional: false,
            readonly: false,
            meta: {
              quote: 'double'
            }
          }
        ]
      },
      modes: [
        'closure',
        'typescript',
        'jsdoc'
      ]
    })
  })
})
