import { expect } from 'chai'
import { Parser } from '../src/Parser.js'

import type { NoParsletFoundError, EarlyEndOfParseError } from '../src/errors.js'

import { typescriptGrammar } from '../src/grammars/typescriptGrammar.js'
import { Lexer } from '../src/lexer/Lexer.js'
import { rules } from '../src/lexer/LexerRules.js'

describe('Parser', () => {
  it('should consume an array of tokens', () => {
    const parser = new Parser(typescriptGrammar, Lexer.create(rules, '[test]'))
    parser.parse()

    const twoTokens = parser.consume(['[', 'Identifier'])
    const finalTokens = parser.consume([']', 'EOF'])

    expect(twoTokens).to.equal(false)
    expect(finalTokens).to.equal(true)
  })

  it('should return token of error with `NoParsletFoundError.getToken`', () => {
    const parser = new Parser(typescriptGrammar, Lexer.create(rules, '{'))

    let error
    try {
      parser.parse()
    } catch (err) {
      error = err
    }

    if (error === undefined) {
      throw new Error('Failed')
    }

    const token = (error as NoParsletFoundError).getToken()

    expect(token).to.deep.equal({
      reduced: 0,
      column: 0,
      line: 0,
      type: 'EOF',
      text: '',
      startOfLine: false
    })
  })

  it('should return token of error with `EarlyEndOfParseError.getToken`', () => {
    const parser = new Parser(typescriptGrammar, Lexer.create(rules, 'name]'))

    let error
    try {
      parser.parse()
    } catch (err) {
      error = err
    }

    if (error === undefined) {
      throw new Error('Failed')
    }

    const token = (error as EarlyEndOfParseError).getToken()

    expect(token).to.deep.equal({
      reduced: 1,
      column: 1,
      line: 0,
      startOfLine: false,
      type: ']',
      text: ']'
    })
  })
})
