import { expect } from 'chai'
import 'mocha'
import catharsis from 'catharsis'
import { parse as jtpParse } from 'jsdoctypeparser'
import { parse as espree } from 'espree'
import { generate } from '@es-joy/escodegen'
import { jtpTransform } from '../../src/transforms/jtpTransform.js'
import { simplify } from '../../src/transforms/simplify.js'
import { catharsisTransform, parse, parseName, parseNamePath, type RootResult, type ParseMode, stringify } from '../../src/index.js'

const { parse: catharsisParse } = catharsis

export type JtpMode = 'jsdoc' | 'closure' | 'typescript' | 'permissive'

export type CatharsisMode = 'jsdoc' | 'closure'

export type CompareMode = ParseMode | 'fail' | 'differ'

interface BaseFixture {
  /**
   * The input that should be parsed
   */
  input: string
  jtp?: Record<JtpMode, CompareMode>
  catharsis?: Record<CatharsisMode, CompareMode>
  espree?: boolean
  /**
   * The expected parse result object. If you expect different parse results for different parse modes please use
   * `diffExpected`.
   */
  expected?: RootResult
  /**
   * The expected parse results objects for different modes. If a mode is included in `modes` and as a key of
   * `diffExpected` the object in `diffExpected` is used over the result in `expected`.
   */
  diffExpected?: Partial<Record<ParseMode, RootResult>>
  /**
   * If the stringified output differs from the input it can be provided here. These are mostly whitespace differences.
   */
  stringified?: string
}

interface extraParseArgs {
  module?: boolean,
  strictMode?: boolean,
  asyncFunctionBody?: boolean,
  classContext?: boolean,
  includeSpecial?: boolean
}

type SuccessFixture = BaseFixture & {
  /**
   * The {@link ParseMode}s that the expression is expected to get parsed in. In all other modes it is expected to fail.
   */
  modes: ParseMode[],
  parseName?: true,
  extraParseArgs?: extraParseArgs
  parseNamePath?: true
}

type ErrorFixture = BaseFixture & ({
  error: string,
  parseName?: true,
  extraParseArgs?: extraParseArgs,
  parseNamePath?: true
} | {
  errors: Partial<Record<ParseMode, string>>,
  parseName?: true,
  extraParseArgs?: extraParseArgs
  parseNamePath?: true
})

export type Fixture = SuccessFixture | ErrorFixture

type Results = Partial<Record<ParseMode, RootResult>>

function testParser (mode: ParseMode, fixture: Fixture): RootResult | undefined {
  if ('modes' in fixture) {
    if (fixture.modes.includes(mode)) {
      it(`is parsed in '${mode}' mode`, () => {
        const result = fixture.parseNamePath ? parseNamePath(
          fixture.input,
          mode,
          {
            ...fixture.extraParseArgs
          }
        ) : fixture.parseName ? parseName(fixture.input, mode) : parse(
          fixture.input,
          mode,
          {
            ...fixture.extraParseArgs,
            computedPropertyParser: fixture.espree !== undefined && fixture.espree ? espree : undefined
          }
        )
        const expected = fixture.diffExpected?.[mode] ?? fixture.expected
        expect(result).to.deep.equal(expected)
      })
      try {
        return fixture.parseNamePath ? parseNamePath(
          fixture.input,
          mode,
          {
            ...fixture.extraParseArgs
          }
        ) : fixture.parseName ? parseName(fixture.input, mode) :parse(
          fixture.input,
          mode,
          {
            ...fixture.extraParseArgs,
            computedPropertyParser: fixture.espree !== undefined && fixture.espree ? espree : undefined
          }
        )
      } catch (e) {
        // eslint-disable-next-line no-console -- Testing
        console.error(`Parse failed for mode '${mode}'`)
        throw e
      }
    } else {
      it(`fails to parse in '${mode}' mode`, () => {
        expect(() => {
          if (fixture.parseNamePath) {
            parseNamePath(
              fixture.input,
              mode,
              {
                ...fixture.extraParseArgs
              }
            )
          } else if (fixture.parseName) {
            parseName(fixture.input, mode)
          } else {
            parse(fixture.input, mode)
          }
        }).to.throw()
      })
    }
  } else {
    const expectedErrorForMode = 'errors' in fixture ? fixture.errors[mode] : fixture.error
    if (expectedErrorForMode !== undefined) {
      it(`In '${mode}' mode, throws with: ${expectedErrorForMode}`, () => {
        expect(() => {
          if (fixture.parseNamePath) {
            parseNamePath(
              fixture.input,
              mode,
              {
                ...fixture.extraParseArgs
              }
            )
          } else if (fixture.parseName) {
            parseName(fixture.input, mode)
          } else {
            parse(fixture.input, mode)
          }
        }).to.throw(expectedErrorForMode)
      })
    }
  }
}

function compareCatharsis (mode: CatharsisMode, compareMode: CompareMode, results: Results, fixture: Fixture): void {
  if (compareMode !== 'fail') {
    it(`compares to catharsis in '${mode}' mode`, () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Overly broad possibilities
      const catharsisResult = catharsisParse(fixture.input, {
        jsdoc: mode === 'jsdoc'
      })

      expect(catharsisResult).not.to.be.equal(undefined)

      if (compareMode !== 'differ') {
        const transformed = catharsisTransform(results[compareMode] as RootResult)
        expect(transformed, 'matches the catharsis output').to.deep.equal(catharsisResult)
      }
    })
  } else {
    it(`does not get parsed by catharsis in '${mode}' mode`, () => {
      expect(() => {
        catharsisParse(fixture.input, {
          jsdoc: mode === 'jsdoc'
        })
      }).to.throw()
    })
  }
}

function compareJtp (mode: JtpMode, compareMode: CompareMode, results: Results, fixture: Fixture): void {
  if (compareMode !== 'fail') {
    it(`compares to jsdoctypeparser in '${mode}' mode`, () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Overly broad possibilities
      const jtpResult = jtpParse(fixture.input, {
        mode
      })

      expect(jtpResult).not.to.be.equal(undefined)

      if (compareMode !== 'differ') {
        const transformed = jtpTransform(results[compareMode] as RootResult)
        expect(transformed, 'matches the jsdoctypeparser output').to.deep.equal(jtpResult)
      }
    })
  } else {
    it(`does not get parsed by jsdoctypeparser in '${mode}' mode`, () => {
      expect(() => {
        jtpParse(fixture.input, {
          mode
        })
      }).to.throw()
    })
  }
}

/**
 * Function to run all relevant tests for a {@link Fixture}.
 */
export function testFixture (fixture: Fixture): void {
  const results: Results = {
    closure: testParser('closure', fixture),
    typescript: testParser('typescript', fixture),
    jsdoc: testParser('jsdoc', fixture)
  }

  if (fixture.catharsis !== undefined) {
    compareCatharsis('jsdoc', fixture.catharsis.jsdoc, results, fixture)
    compareCatharsis('closure', fixture.catharsis.closure, results, fixture)
  }

  if (fixture.jtp !== undefined) {
    compareJtp('closure', fixture.jtp.closure, results, fixture)
    compareJtp('jsdoc', fixture.jtp.jsdoc, results, fixture)
    compareJtp('typescript', fixture.jtp.typescript, results, fixture)
    compareJtp('permissive', fixture.jtp.permissive, results, fixture)
  }

  it('should stringify', () => {
    // TODO: at the moment this does only test one possible stringification

    const mode: ParseMode | undefined = (results.jsdoc !== undefined)
      ? 'jsdoc'
      : (results.closure !== undefined)
          ? 'closure'
          : (results.typescript !== undefined)
              ? 'typescript'
              : undefined

    if (mode !== undefined) {
      const result = results[mode] as RootResult
      const stringified = stringify(
        result,
        fixture.espree !== undefined && fixture.espree
          ? generate
          : undefined
      )

      expect(stringified).to.equal(fixture.stringified ?? fixture.input)

      if (fixture.parseName) {
        const reparsed = parseName(
          stringified,
          mode
        )

        expect(simplify(reparsed)).to.deep.equal(simplify(result))
        return
      }
      if (fixture.parseNamePath) {
        const reparsed = parseNamePath(
          stringified,
          mode,
          {
            ...fixture.extraParseArgs,
          }
        )

        expect(simplify(reparsed)).to.deep.equal(simplify(result))
        return
      }

      const reparsed = parse(
        stringified,
        mode,
        {
          ...fixture.extraParseArgs,
          computedPropertyParser: fixture.espree !== undefined && fixture.espree ? espree : undefined
        }
      )

      expect(simplify(reparsed)).to.deep.equal(simplify(result))
    }
  })
}
