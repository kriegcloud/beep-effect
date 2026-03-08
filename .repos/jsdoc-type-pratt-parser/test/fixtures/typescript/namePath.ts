import { testFixture } from '../Fixture.js'

describe('typescript array access test', () => {
  describe('array access of generic type', () => {
    testFixture({
      input: 'Parameters<testFunc>[0]',
      modes: ['typescript'],
      expected: {
        type: 'JsdocTypeNamePath',
        pathType: 'property-brackets',
        left: {
          type: 'JsdocTypeGeneric',
          left: {
            type: 'JsdocTypeName',
            value: 'Parameters'
          },
          elements: [
            {
              type: 'JsdocTypeName',
              value: 'testFunc'
            }
          ],
          meta: {
            dot: false,
            brackets: 'angle'
          }
        },
        right: {
          type: 'JsdocTypeProperty',
          value: '0',
          meta: {
            quote: undefined
          }
        }
      }
    })
  })
})
