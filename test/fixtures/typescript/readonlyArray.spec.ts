import { expect } from 'chai'
import { testFixture } from '../Fixture.js'
import { parse } from '../../../src/parse.js'

describe('typescript readonly arrays and tuples', () => {
  describe('should parse a readonly array', () => {
    testFixture({
      input: 'readonly string[]',
      modes: ['typescript'],
      expected: {
        type: 'JsdocTypeReadonlyArray',
        element: {
          type: 'JsdocTypeGeneric',
          left: {
            type: 'JsdocTypeName',
            value: 'Array'
          },
          elements: [
            {
              type: 'JsdocTypeName',
              value: 'string'
            }
          ],
          meta: {
            brackets: 'square',
            dot: false
          }
        }
      }
    })
  })

  describe('should parse a readonly tuple', () => {
    testFixture({
      input: 'readonly [string, number]',
      modes: ['typescript'],
      expected: {
        type: 'JsdocTypeReadonlyArray',
        element: {
          type: 'JsdocTypeTuple',
          elements: [
            {
              type: 'JsdocTypeName',
              value: 'string'
            },
            {
              type: 'JsdocTypeName',
              value: 'number'
            }
          ]
        }
      }
    })
  })

  describe('should throw with bad type', () => {
    it('does not allow a plain string type', () => {
      expect(() => {
        parse('readonly string', 'typescript')
      }).to.throw('Unexpected type: \'JsdocTypeName\'.')
    })

    it('does not allow a generic Array', () => {
      expect(() => {
        parse('readonly Array<string>', 'typescript')
      }).to.throw('Unexpected type: \'JsdocTypeGeneric\'.')
    })
  })
})
