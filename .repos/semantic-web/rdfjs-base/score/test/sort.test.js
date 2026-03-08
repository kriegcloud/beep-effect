import { notStrictEqual, strictEqual } from 'assert'
import { describe, it } from 'mocha'
import sort from '../sort.js'

describe('sort', () => {
  it('should be a function', () => {
    strictEqual(typeof sort, 'function')
  })

  it('should return an array', () => {
    const result = sort([])

    strictEqual(Array.isArray(result), true)
  })

  it('should return an array with the same length as the given array', () => {
    const input = [{ score: 0.5 }, { score: 1 }, { score: 0.25 }]

    const result = sort(input)

    strictEqual(result.length, input.length)
  })

  it('should return a new array', () => {
    const input = [{ score: 0.5 }, { score: 1 }, { score: 0.25 }]

    const result = sort(input)

    notStrictEqual(result, input)
  })

  it('should not touch the original array', () => {
    const input = [{ score: 0.5 }, { score: 1 }, { score: 0.25 }]

    sort(input)

    strictEqual(input[0].score, 0.5)
    strictEqual(input[1].score, 1)
    strictEqual(input[2].score, 0.25)
  })

  it('should sort the given result array based on the score property', () => {
    const input = [{ score: 0.5 }, { score: 1 }, { score: 0.25 }]

    const result = sort(input)

    strictEqual(result[0].score, 1)
    strictEqual(result[1].score, 0.5)
    strictEqual(result[2].score, 0.25)
  })

  it('should keep the original result item objects', () => {
    const input = [{ score: 0.5 }, { score: 1 }, { score: 0.25 }]

    const result = sort(input)

    strictEqual(result[0], input[1])
    strictEqual(result[1], input[0])
    strictEqual(result[2], input[2])
  })
})
