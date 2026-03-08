import { expect } from 'chai'
import { jsdocGrammar } from '../src/grammars/jsdocGrammar.js'
import { createFunctionParslet } from '../src/parslets/FunctionParslet.js'
import { Parser } from '../src/Parser.js'
import { Lexer } from '../src/lexer/Lexer.js'
import { rules } from '../src/lexer/LexerRules.js'

function parse (text: string, allowNoReturnType = true): void {
  // Replace other function parslet with one setting
  //   `allowNamedParameters: undefined`
  const grammar = [
    ...jsdocGrammar.filter(p => p.name !== 'functionParslet'),
    createFunctionParslet({
      allowWithoutParenthesis: true,
      allowNamedParameters: undefined,
      allowNoReturnType,
      allowNewAsFunctionKeyword: false
    })
  ]
  const parser = new Parser(grammar, Lexer.create(rules, text))
  parser.parse()
}

describe('`createFunctionParslet`', () => {
  it('Errs with named parameter`', () => {
    expect(() => {
      parse('function(someName: string)')
    }).to.throw('No parameter should be named')
  })

  it('Works with unnamed parameters`', () => {
    expect(() => {
      parse('function(someName)')
    }).not.to.throw()
  })

  it('Errs with allowNoReturnType set to `false`', () => {
    expect(() => {
      parse('function(someName)', false)
    }).to.throw('function is missing return type')
  })
})
