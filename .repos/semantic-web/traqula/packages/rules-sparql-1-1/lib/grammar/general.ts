import * as l from '../lexer/index.js';
import type { SparqlGrammarRule, SparqlRule } from '../sparql11HelperTypes.js';
import type {
  ContextDefinition,
  ContextDefinitionBase,
  ContextDefinitionPrefix,
  GraphTerm,
  Term,
  TermIri,
  TermVariable,
} from '../Sparql11types.js';
import { CommonIRIs } from '../utils.js';
import { blankNode, booleanLiteral, iri, iriFull, numericLiteral, rdfLiteral, verbA } from './literals.js';

/**
 * [[4]](https://www.w3.org/TR/sparql11-query/#rPrologue)
 */
export const prologue: SparqlRule<'prologue', ContextDefinition[]> = <const> {
  name: 'prologue',
  impl: ({ SUBRULE, MANY, OR }) => () => {
    const result: ContextDefinition[] = [];
    MANY(() => OR([
      { ALT: () => result.push(SUBRULE(baseDecl)) },
      // TODO: the [spec](https://www.w3.org/TR/sparql11-query/#iriRefs) says you cannot redefine prefixes.
      //  We might need to check this.
      { ALT: () => result.push(SUBRULE(prefixDecl)) },
    ]));
    return result;
  },
  gImpl: ({ SUBRULE }) => (ast, { astFactory: F }) => {
    for (const context of ast) {
      if (F.isContextDefinitionBase(context)) {
        SUBRULE(baseDecl, context);
      } else if (F.isContextDefinitionPrefix(context)) {
        SUBRULE(prefixDecl, context);
      }
    }
  },
};

/**
 * Registers base IRI in the context and returns it.
 * [[5]](https://www.w3.org/TR/sparql11-query/#rBaseDecl)
 */
export const baseDecl: SparqlRule<'baseDecl', ContextDefinitionBase> = <const> {
  name: 'baseDecl',
  impl: ({ ACTION, CONSUME, SUBRULE }) => (C) => {
    const base = CONSUME(l.baseDecl);
    const val = SUBRULE(iriFull);
    return ACTION(() => C.astFactory.contextDefinitionBase(C.astFactory.sourceLocation(base, val), val));
  },
  gImpl: ({ SUBRULE, PRINT_ON_EMPTY, NEW_LINE }) => (ast, { astFactory: F }) => {
    F.printFilter(ast, () => PRINT_ON_EMPTY('BASE '));
    SUBRULE(iri, ast.value);
    F.printFilter(ast, () => NEW_LINE());
  },
};

/**
 * Registers prefix in the context and returns registered key-value-pair.
 * [[6]](https://www.w3.org/TR/sparql11-query/#rPrefixDecl)
 */
export const prefixDecl: SparqlRule<'prefixDecl', ContextDefinitionPrefix> = <const> {
  name: 'prefixDecl',
  impl: ({ ACTION, CONSUME, SUBRULE }) => (C) => {
    const prefix = CONSUME(l.prefixDecl);
    const name = CONSUME(l.terminals.pNameNs).image.slice(0, -1);
    const value = SUBRULE(iriFull);

    return ACTION(() => {
      C.prefixes[name] = value.value;
      return C.astFactory.contextDefinitionPrefix(C.astFactory.sourceLocation(prefix, value), name, value);
    });
  },
  gImpl: ({ SUBRULE, PRINT_ON_EMPTY, NEW_LINE }) => (ast, { astFactory: F }) => {
    F.printFilter(ast, () => {
      PRINT_ON_EMPTY('PREFIX ', `${ast.key}: `);
    });
    SUBRULE(iri, ast.value);
    F.printFilter(ast, () => NEW_LINE());
  },
};

/**
 * [[78]](https://www.w3.org/TR/sparql11-query/#rVerb)
 */
export const verb: SparqlGrammarRule<'verb', TermVariable | TermIri> = <const> {
  name: 'verb',
  impl: ({ SUBRULE, OR }) => () => OR([
    { ALT: () => SUBRULE(varOrIri) },
    { ALT: () => SUBRULE(verbA) },
  ]),
};

/**
 * [[106]](https://www.w3.org/TR/sparql11-query/#rVarOrTerm)
 */
export const varOrTerm: SparqlRule<'varOrTerm', Term> = <const> {
  name: 'varOrTerm',
  impl: ({ SUBRULE, OR }) => C => OR<Term>([
    { GATE: () => C.parseMode.has('canParseVars'), ALT: () => SUBRULE(var_) },
    { ALT: () => SUBRULE(graphTerm) },
  ]),
  gImpl: ({ SUBRULE }) => (ast, { astFactory: F }) => {
    if (F.isTermVariable(ast)) {
      return SUBRULE(var_, ast);
    }
    return SUBRULE(graphTerm, ast);
  },
};

/**
 * [[107]](https://www.w3.org/TR/sparql11-query/#rVarOrIri)
 */
export const varOrIri: SparqlGrammarRule<'varOrIri', TermIri | TermVariable> = <const> {
  name: 'varOrIri',
  impl: ({ SUBRULE, OR }) => C => OR<TermIri | TermVariable>([
    { GATE: () => C.parseMode.has('canParseVars'), ALT: () => SUBRULE(var_) },
    { ALT: () => SUBRULE(iri) },
  ]),
};

/**
 * [[108]](https://www.w3.org/TR/sparql11-query/#rVar)
 */
export const var_: SparqlRule<'var', TermVariable> = <const> {
  name: 'var',
  impl: ({ ACTION, CONSUME, OR }) => (C) => {
    const varToken = OR([
      { ALT: () => CONSUME(l.terminals.var1) },
      { ALT: () => CONSUME(l.terminals.var2) },
    ]);
    return ACTION(() => C.astFactory.termVariable(varToken.image.slice(1), C.astFactory.sourceLocation(varToken)));
  },
  gImpl: ({ PRINT }) => (ast, { astFactory: F }) => {
    F.printFilter(ast, () => PRINT(`?${ast.value}`));
  },
};

/**
 * [[109]](https://www.w3.org/TR/sparql11-query/#rGraphTerm)
 */
export const graphTerm: SparqlRule<'graphTerm', GraphTerm> = <const> {
  name: 'graphTerm',
  impl: ({ ACTION, SUBRULE, CONSUME, OR }) => C => OR<GraphTerm>([
    { ALT: () => SUBRULE(iri) },
    { ALT: () => SUBRULE(rdfLiteral) },
    { ALT: () => SUBRULE(numericLiteral) },
    { ALT: () => SUBRULE(booleanLiteral) },
    { GATE: () => C.parseMode.has('canCreateBlankNodes'), ALT: () => SUBRULE(blankNode) },
    { ALT: () => {
      const tokenNil = CONSUME(l.terminals.nil);
      return ACTION(() =>
        C.astFactory.termNamed(C.astFactory.sourceLocation(tokenNil), CommonIRIs.NIL));
    } },
  ]),
  gImpl: ({ SUBRULE }) => (ast, { astFactory: F }) => {
    if (F.isTermNamed(ast)) {
      SUBRULE(iri, ast);
    } else if (F.isTermLiteral(ast)) {
      SUBRULE(rdfLiteral, ast);
    } else if (F.isTermBlank(ast)) {
      SUBRULE(blankNode, ast);
    }
  },
};
