import { createFunctionParslet } from '../src/parslets/FunctionParslet.js'
import { Lexer } from '../src/lexer/Lexer.js'
import { rules } from '../src/lexer/LexerRules.js'
import { expect } from 'chai'
import { Parser } from '../src/Parser.js'
import { createParameterListParslet } from '../src/parslets/ParameterListParslet.js'
import { createNameParslet } from '../src/parslets/NameParslet.js'
import { createObjectParslet } from '../src/parslets/ObjectParslet.js'
import { parenthesisParslet } from '../src/parslets/ParenthesisParslet.js'

describe('ParameterListParslet', () => {
  it('rethrows errors', () => {
    const parser = new Parser(
      [
        createFunctionParslet({
          allowWithoutParenthesis: false,
          allowNamedParameters: undefined,
          allowNoReturnType: true,
          allowNewAsFunctionKeyword: true
        }),
        createParameterListParslet({
          allowTrailingComma: false
        }),
        createNameParslet({
          allowedAdditionalTokens: []
        }),
        createObjectParslet({
          allowKeyTypes: false,
          objectFieldGrammar: []
        }),
        parenthesisParslet
      ],
      Lexer.create(rules, 'function(a, b, ")')
    )
    expect(() => {
      parser.parse()
    }).to.throw('Unterminated String')
  })
})
