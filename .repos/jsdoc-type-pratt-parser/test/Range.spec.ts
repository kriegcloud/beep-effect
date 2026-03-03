import { expect } from 'chai'
import { parse } from '../src/parse.js'

describe('`parse` with `range`', () => {
  it('adds `range`', () => {
    const result = parse('function(typeof A): void', 'typescript', {
      range: true
    })
    expect(result).to.deep.equal({
      type: 'JsdocTypeFunction',
      parameters: [
        {
          type: 'JsdocTypeTypeof',
          range: [9, 17],
          element: {
            range: [15, 17],
            type: 'JsdocTypeName',
            value: 'A'
          }
        }
      ],
      range: [0, 24],
      returnType: {
        type: 'JsdocTypeName',
        value: 'void',
        range: [19, 24],
      },
      arrow: false,
      constructor: false,
      parenthesis: true
    })
  })

  it('adds `range` with `rangeStart`', () => {
    const result = parse('function(typeof A): void', 'typescript', {
      range: true,
      rangeStart: 1
    })
    expect(result).to.deep.equal({
      type: 'JsdocTypeFunction',
      parameters: [
        {
          type: 'JsdocTypeTypeof',
          range: [10, 18],
          element: {
            range: [16, 18],
            type: 'JsdocTypeName',
            value: 'A'
          }
        }
      ],
      range: [1, 25],
      returnType: {
        type: 'JsdocTypeName',
        value: 'void',
        range: [20, 25],
      },
      arrow: false,
      constructor: false,
      parenthesis: true
    })
  })
});
