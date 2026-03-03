import { expect } from 'chai'
import { stub, type SinonStub } from 'sinon'

import { jsdocGrammar } from '../src/grammars/jsdocGrammar.js'
import { Parser } from '../src/Parser.js'
import type { Grammar } from '../src/grammars/Grammar.js'

import { createObjectParslet } from '../src/parslets/ObjectParslet.js'
import type { RootResult } from '../src/result/RootResult.js'
import { Lexer } from '../src/lexer/Lexer.js'
import { rules } from '../src/lexer/LexerRules.js'

describe('`ObjectParslet`', () => {
  beforeEach(() => {
    stub(Parser.prototype, 'parseIntermediateType')
  })
  afterEach(() => {
    (Parser.prototype.parseIntermediateType as SinonStub).restore()
  })
  it('Recovers after failing first intermediate parsing with `allowKeyTypes`', () => {
    // Limit the field grammar so it mostly fails
    const objectFieldGrammar: Grammar = [
      ...jsdocGrammar
    ]

    const objectParslet = createObjectParslet({
      allowKeyTypes: true,
      objectFieldGrammar
    })

    const parser = new Parser(
      [
        objectParslet,
        ...jsdocGrammar
      ],
      Lexer.create(rules, '{abc}')
    )

    const ret: unknown = undefined

    // eslint-disable-next-line @typescript-eslint/unbound-method -- Ok here
    const parseIntermediateType = Parser.prototype.parseIntermediateType;

    (parseIntermediateType as SinonStub).callThrough().onSecondCall().returns(
      ret as RootResult
    )

    const rootResult = parser.parse()

    const expected: RootResult = {
      elements: [
        {
          key: 'abc',
          meta: {
            quote: undefined
          },
          optional: false,
          readonly: false,
          right: undefined,
          type: 'JsdocTypeObjectField'
        }
      ],
      meta: {
        separator: 'comma'
      },
      type: 'JsdocTypeObject'
    }

    expect(rootResult).to.deep.equal(expected)
  })
})
