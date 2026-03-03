import { expect } from 'chai'
import { tryParse } from '../src/parse.js'

describe('tryParse', () => {
  it('should parse a valid expression in jsdoc', () => {
    expect(() => {
      tryParse('function(a, ...[b])')
    }).not.to.throw()
  })

  it('should throw an error vor invalid type syntax in any type', () => {
    expect(() => {
      tryParse('A<')
    }).to.throw()
  })
})
