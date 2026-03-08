import type { Localized } from '@traqula/core';
import { traqulaNewlineAlternative, TransformerObject, traqulaIndentation } from '@traqula/core';
import { AstFactory } from './astFactory.js';
import type { SparqlContext, SparqlGeneratorContext } from './sparql11HelperTypes.js';
import type { Path, TermIri } from './Sparql11types.js';

interface Parser<ParseRet> {
  queryOrUpdate: (input: string, context: SparqlContext) => ParseRet;
  path: (input: string, context: SparqlContext) => TermIri | Path;
}

export function completeParseContext(
  context: Partial<SparqlContext>,
): SparqlContext {
  return {
    astFactory: context.astFactory ?? new AstFactory({ tracksSourceLocation: false }),
    baseIRI: context.baseIRI,
    prefixes: { ...context.prefixes },
    parseMode: context.parseMode ? new Set(context.parseMode) : new Set([ 'canParseVars', 'canCreateBlankNodes' ]),
    skipValidation: context.skipValidation ?? false,
  };
}

export function completeGeneratorContext(
  context: Partial<SparqlGeneratorContext & { offset?: number }>,
): SparqlGeneratorContext & { offset?: number } {
  return {
    astFactory: context.astFactory ?? new AstFactory(),
    origSource: context.origSource ?? '',
    offset: context.offset,
    [traqulaIndentation]: context[traqulaIndentation] ?? 0,
    [traqulaNewlineAlternative]: context[traqulaNewlineAlternative] ?? ' ',
    indentInc: context.indentInc ?? 2,
  };
}

export function copyParseContext<T extends
Partial<SparqlContext & SparqlGeneratorContext & { origSource: string; offset?: number }>>(
  context: T,
): T {
  return {
    ...context,
    prefixes: { ...context.prefixes },
    parseMode: new Set(context.parseMode),
  };
}

export class MinimalSparqlParser<ParseRet extends Localized> {
  protected readonly defaultContext: SparqlContext;
  protected readonly coreTransformer = new TransformerObject();

  public constructor(protected readonly parser: Parser<ParseRet>, defaultContext: Partial<SparqlContext> = {}) {
    this.defaultContext = completeParseContext(defaultContext);
  }

  /**
   * Parse a query string starting from the
   * [QueryUnit](https://www.w3.org/TR/sparql11-query/#rQueryUnit)
   * or [QueryUpdate](https://www.w3.org/TR/sparql11-query/#rUpdateUnit) rules.
   * @param query
   * @param context
   */
  public parse(query: string, context: Partial<SparqlContext> = {}): ParseRet {
    const ast = this.parser.queryOrUpdate(query, copyParseContext({ ...this.defaultContext, ...context }));
    ast.loc = this.defaultContext.astFactory.sourceLocationInlinedSource(query, ast.loc, 0, Number.MAX_SAFE_INTEGER);
    return ast;
  }

  /**
   * Parse a query string starting from the [Path](https://www.w3.org/TR/sparql11-query/#rPath) grammar rule.
   * @param query
   * @param context
   */
  public parsePath(query: string, context: Partial<SparqlContext> = {}):
    (Path & { prefixes: object }) | TermIri {
    const ast = this.parser.path(query, copyParseContext({ ...this.defaultContext, ...context }));
    ast.loc = this.defaultContext.astFactory.sourceLocationInlinedSource(query, ast.loc, 0, Number.MAX_SAFE_INTEGER);
    if (this.defaultContext.astFactory.isPathPure(ast)) {
      return {
        ...ast,
        prefixes: {},
      };
    }
    return ast;
  }
}
