import { TransformerSubTyped, traqulaIndentation, traqulaNewlineAlternative } from '@traqula/core';
import { AstFactory } from './AstFactory.js';
import type { SparqlContext, SparqlGeneratorContext } from './sparql12HelperTypes.js';
import type { Sparql12Nodes } from './sparql12Types.js';

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
    indentInc: context.indentInc ?? 2,
    [traqulaIndentation]: context[traqulaIndentation] ?? 0,
    [traqulaNewlineAlternative]: context[traqulaNewlineAlternative] ?? ' ',
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

export class AstTransformer extends TransformerSubTyped<Sparql12Nodes> {}
