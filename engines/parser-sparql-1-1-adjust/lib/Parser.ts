import { ParserBuilder, LexerBuilder, type ParserBuildArgs } from '@traqula/core';
import { sparql11ParserBuilder } from '@traqula/parser-sparql-1-1';
import { sparqlCodepointEscape, lex as l11, MinimalSparqlParser } from '@traqula/rules-sparql-1-1';
import type { gram as g11, SparqlQuery, SparqlContext } from '@traqula/rules-sparql-1-1';
import { gram, lex } from '@traqula/rules-sparql-1-1-adjust';

export const adjustParserBuilder = ParserBuilder.create(sparql11ParserBuilder)
  // This typePatch is not needed, but we need to import g11 for our types
  .typePatch<{ [g11.builtInCall.name]: [any]}>()
  .addRule(gram.builtInAdjust)
  .patchRule(gram.builtInPatch);

export type Adjust11Parser = ReturnType<typeof adjustParserBuilder.build>;

export const adjustLexerBuilder = LexerBuilder.create(l11.sparql11LexerBuilder).addBefore(l11.a, lex.BuiltInAdjust);

/**
 * Generator that can generate a SPARQL 1.1 AST given a SPARQL 1.1 string + able to parse the
 * [ADJUST function](https://github.com/w3c/sparql-dev/blob/main/SEP/SEP-0002/sep-0002.md).
 */
export class Parser extends MinimalSparqlParser<SparqlQuery> {
  public constructor(
    args: Pick<ParserBuildArgs, 'parserConfig' | 'lexerConfig'> & { defaultContext?: Partial<SparqlContext> } = {},
  ) {
    const parser: Adjust11Parser = adjustParserBuilder.build({
      ...args,
      tokenVocabulary: adjustLexerBuilder.tokenVocabulary,
      queryPreProcessor: sparqlCodepointEscape,
    });
    super(parser, args.defaultContext);
  }
}
