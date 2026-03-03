import { expect } from 'chai'
import { objectSquaredPropertyParslet } from '../src/parslets/ObjectSquaredPropertyParslet.js'
import { Parser } from '../src/Parser.js'
import type { Grammar } from '../src/grammars/Grammar.js'
import { createObjectParslet } from '../src/parslets/ObjectParslet.js'
import { createNameParslet } from '../src/parslets/NameParslet.js'
import { Lexer } from '../src/lexer/Lexer.js'
import { rules } from '../src/lexer/LexerRules.js'

describe('`ObjectSquaredPropertyParslet`', () => {
  it('throws without base parser', () => {
    const parser = new Parser(
      [
        objectSquaredPropertyParslet,
      ],
      Lexer.create(rules, '[abc: string]')
    )

    expect(() => {
      parser.parse()

      // eslint-disable-next-line no-console -- Testing
      console.log(parser);
    }).to.throw('Only allowed inside object grammar')
  })

  it('throws without `:` or `in`', () => {
    const objectFieldGrammar: Grammar = [
      createNameParslet({
        allowedAdditionalTokens: []
      }),
      objectSquaredPropertyParslet
    ]

    const objectParslet = createObjectParslet({
      allowKeyTypes: true,
      objectFieldGrammar
    })

    const parser = new Parser(
      [
        objectParslet
      ],
      Lexer.create(rules, '{[abc]}')
    )

    expect(() => {
      parser.parse()

      // eslint-disable-next-line no-console -- Testing
      console.log(parser);
    }).to.throw('Incomplete computed property: missing colon')
  })
})
