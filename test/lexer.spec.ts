import { expect } from 'chai'
import { Lexer } from '../src/lexer/Lexer.js'
import type { Token } from '../src/lexer/Token.js'
import { rules, looseRules } from '../src/lexer/LexerRules.js'

function expectTokensBase (lexer: Lexer, text: string, tokens: Array<Partial<Token>>): void {
  let position = 0

  while (lexer.current.type !== 'EOF') {
    const nextToken = lexer.current
    const nextExpected = tokens[position]
    expect(nextToken.type).to.equal(nextExpected.type)
    expect(nextToken.text).to.equal(nextExpected.text)
    lexer = lexer.advance()
    position++
  }

  expect(tokens.length).to.equal(position)
}

function expectTokens (text: string, tokens: Array<Partial<Token>>): void {
  const lexer = Lexer.create(rules, text)
  expectTokensBase(lexer, text, tokens)
}

function expectTokensLoose (text: string, tokens: Array<Partial<Token>>): void {
  const lexer = Lexer.create(looseRules, text)
  expectTokensBase(lexer, text, tokens)
}

describe('lexer', () => {
  it('should lex name', () => {
    expectTokens('sometype', [
      {
        type: 'Identifier',
        text: 'sometype'
      }
    ])
  })

  it('should parse a complex expression', () => {
    expectTokens('Array<(AType|OtherType)>|\'test\'|undefined', [
      {
        type: 'Identifier',
        text: 'Array'
      },
      {
        type: '<',
        text: '<'
      },
      {
        type: '(',
        text: '('
      },
      {
        type: 'Identifier',
        text: 'AType'
      },
      {
        type: '|',
        text: '|'
      },
      {
        type: 'Identifier',
        text: 'OtherType'
      },
      {
        type: ')',
        text: ')'
      },
      {
        type: '>',
        text: '>'
      },
      {
        type: '|',
        text: '|'
      },
      {
        type: 'StringValue',
        text: '\'test\''
      },
      {
        type: '|',
        text: '|'
      },
      {
        type: 'undefined',
        text: 'undefined'
      }
    ])
  })

  it('should parse numbers', () => {
    expectTokens('12345', [
      {
        type: 'Number',
        text: '12345'
      }
    ])

    expectTokens('-12345', [
      {
        type: 'Number',
        text: '-12345'
      }
    ])

    expectTokensLoose('Infinity', [
      {
        type: 'Number',
        text: 'Infinity'
      }
    ])
  })

  it('should parse an expression containing multiple numbers', () => {
    expectTokensLoose('123|-Infinity|Array<NaN>', [
      {
        type: 'Number',
        text: '123'
      },
      {
        type: '|',
        text: '|'
      },
      {
        type: 'Number',
        text: '-Infinity'
      },
      {
        type: '|',
        text: '|'
      },
      {
        type: 'Identifier',
        text: 'Array'
      },
      {
        type: '<',
        text: '<'
      },
      {
        type: 'Number',
        text: 'NaN'
      },
      {
        type: '>',
        text: '>'
      }
    ])
  })

  it('should obtain last token', () => {
    let lexer = Lexer.create(rules, '(null)')
    const token1 = lexer.current
    lexer = lexer.advance()
    const token2 = lexer.current
    lexer = lexer.advance()
    const token3 = lexer.previous as Token
    expect(token1.text).to.equal('(')
    expect(token2.text).to.equal('null')
    expect(token3.text).to.equal('null')
  })
})
