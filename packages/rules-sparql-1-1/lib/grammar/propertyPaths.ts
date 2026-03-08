import type { IToken, TokenType } from '@traqula/chevrotain';
import type { RuleDefReturn } from '@traqula/core';
import * as l from '../lexer/index.js';
import type { SparqlGeneratorRule, SparqlGrammarRule } from '../sparql11HelperTypes.js';
import type { TermIri, PathNegatedElt, Path, PathModified, PathNegated } from '../Sparql11types.js';
import { iri, verbA } from './literals.js';

/**
 * [[88]](https://www.w3.org/TR/sparql11-query/#rPath)
 */
export const path: SparqlGrammarRule<'path', Path> = <const> {
  name: 'path',
  impl: ({ SUBRULE }) => () => SUBRULE(pathAlternative),
};

export const pathGenerator: SparqlGeneratorRule<'path', Path, [boolean | undefined]> = {
  name: 'path',
  gImpl: ({ PRINT, SUBRULE }) => (ast, { astFactory: F }, braces = true) => {
    if (F.isTerm(ast) && F.isTermNamed(ast)) {
      SUBRULE(iri, ast);
    } else {
      F.printFilter(ast, () => braces && PRINT('('));
      switch (ast.subType) {
        case '|':
        case '/': {
          const [ head, ...tail ] = ast.items;
          SUBRULE(pathGenerator, head, braces);
          for (const val of tail) {
            F.printFilter(ast, () => PRINT(ast.subType));
            SUBRULE(pathGenerator, val, braces);
          }
          break;
        }
        case '^':
          F.printFilter(ast, () => PRINT('^'));
          SUBRULE(pathGenerator, ast.items[0], braces);
          break;
        case '?':
        case '*':
        case '+':
          SUBRULE(pathGenerator, ast.items[0], braces);
          F.printFilter(ast, () => PRINT(ast.subType));
          break;
        case '!':
          F.printFilter(ast, () => PRINT('!'));
          F.printFilter(ast, () => PRINT('('));
          SUBRULE(pathGenerator, ast.items[0], false);
          F.printFilter(ast, () => PRINT(')'));
          break;
      }
      F.printFilter(ast, () => braces && PRINT(')'));
    }
  },
};

export function pathChainHelper<T extends string>(
  name: T,
  SEP: TokenType,
  subType: '|' | '/',
  subRule: SparqlGrammarRule<string, Path>,
): SparqlGrammarRule<T, Path | TermIri> {
  return {
    name,
    impl: ({ ACTION, CONSUME, SUBRULE1, SUBRULE2, MANY }) => (C) => {
      const head = SUBRULE1(subRule);
      let tailEnd: Path = head;
      const tail: Path[] = [];

      MANY(() => {
        CONSUME(SEP);
        tailEnd = SUBRULE2(subRule);
        tail.push(tailEnd);
      });

      return ACTION(() => tail.length === 0 ?
        head :
        C.astFactory.path(subType, [ head, ...tail ], C.astFactory.sourceLocation(head, tailEnd)));
    },
  };
}

/**
 * [[92]](https://www.w3.org/TR/sparql11-query/#rPathEltOrInverse)
 */
export const pathEltOrInverse: SparqlGrammarRule<'pathEltOrInverse', PathModified | Path> = <const> {
  name: 'pathEltOrInverse',
  impl: ({ ACTION, CONSUME, SUBRULE1, SUBRULE2, OR }) => C => OR<Path | TermIri>([
    { ALT: () => SUBRULE1(pathElt) },
    { ALT: () => {
      const hat = CONSUME(l.symbols.hat);
      const item = SUBRULE2(pathElt);
      return ACTION(() => C.astFactory.path('^', [ item ], C.astFactory.sourceLocation(hat, item)));
    } },
  ]),
};

/**
 * [[90]](https://www.w3.org/TR/sparql11-query/#rPathSequence)
 */
export const pathSequence = pathChainHelper('pathSequence', l.symbols.slash, '/', pathEltOrInverse);

/**
 * [[89]](https://www.w3.org/TR/sparql11-query/#rPathAlternative)
 */
export const pathAlternative = pathChainHelper('pathAlternative', l.symbols.pipe, '|', pathSequence);

/**
 * [[91]](https://www.w3.org/TR/sparql11-query/#rPathElt)
 */
export const pathElt: SparqlGrammarRule<'pathElt', PathModified | Path> = <const> {
  name: 'pathElt',
  impl: ({ ACTION, SUBRULE, OPTION }) => (C) => {
    const item = SUBRULE(pathPrimary);
    const modification = OPTION(() => SUBRULE(pathMod));
    return ACTION(() => modification === undefined ?
      item :
      C.astFactory.path(modification.image, [ item ], C.astFactory.sourceLocation(item, modification)));
  },
};

/**
 * [[93]](https://www.w3.org/TR/sparql11-query/#rPathMod)
 */
export const pathMod: SparqlGrammarRule<'pathMod', IToken & { image: '*' | '+' | '?' }> = <const> {
  name: 'pathMod',
  impl: ({ CONSUME, OR }) => () => OR<RuleDefReturn<typeof pathMod>>([
    { ALT: () => <RuleDefReturn<typeof pathMod>> CONSUME(l.symbols.question) },
    { ALT: () => <RuleDefReturn<typeof pathMod>> CONSUME(l.symbols.star) },
    { ALT: () => <RuleDefReturn<typeof pathMod>> CONSUME(l.symbols.opPlus) },
  ]),
};

/**
 * [[94]](https://www.w3.org/TR/sparql11-query/#rPathPrimary)
 */
export const pathPrimary: SparqlGrammarRule<'pathPrimary', Path> = <const> {
  name: 'pathPrimary',
  impl: ({ SUBRULE, CONSUME, OR }) => () => OR<Path>([
    { ALT: () => SUBRULE(iri) },
    { ALT: () => SUBRULE(verbA) },
    { ALT: () => SUBRULE(pathNegatedPropertySet) },
    { ALT: () => {
      CONSUME(l.symbols.LParen);
      const resRecursive = SUBRULE(path);
      CONSUME(l.symbols.RParen);
      return resRecursive;
    } },
  ]),
};

/**
 * [[95]](https://www.w3.org/TR/sparql11-query/#rPathNegatedPropertySet)
 */
export const pathNegatedPropertySet: SparqlGrammarRule<'pathNegatedPropertySet', PathNegated> = <const> {
  name: 'pathNegatedPropertySet',
  impl: ({ ACTION, CONSUME, SUBRULE1, SUBRULE2, SUBRULE3, OR, MANY }) => (C) => {
    const exclamation = CONSUME(l.symbols.exclamation);
    return OR<PathNegated>([
      { ALT: () => {
        const noAlternative = SUBRULE1(pathOneInPropertySet);
        return ACTION(() =>
          C.astFactory.path('!', [ noAlternative ], C.astFactory.sourceLocation(exclamation, noAlternative)));
      } },
      { ALT: () => {
        const open = CONSUME(l.symbols.LParen);

        const head = SUBRULE2(pathOneInPropertySet);
        const tail: (TermIri | PathNegatedElt)[] = [];
        MANY(() => {
          CONSUME(l.symbols.pipe);
          const item = SUBRULE3(pathOneInPropertySet);
          tail.push(item);
        });

        const close = CONSUME(l.symbols.RParen);

        return ACTION(() => {
          const F = C.astFactory;
          if (tail.length === 0) {
            return F.path('!', [ head ], F.sourceLocation(exclamation, close));
          }
          return F.path(
            '!',
            [ F.path('|', [ head, ...tail ], F.sourceLocation(open, close)) ],
            F.sourceLocation(exclamation, close),
          );
        });
      } },
    ]);
  },
};

/**
 * [[96]](https://www.w3.org/TR/sparql11-query/#rPathOneInPropertySet)
 */
export const pathOneInPropertySet: SparqlGrammarRule<'pathOneInPropertySet', TermIri | PathNegatedElt> = <const> {
  name: 'pathOneInPropertySet',
  impl: ({ ACTION, CONSUME, SUBRULE1, SUBRULE2, OR1, OR2 }) => C =>
    OR1<TermIri | PathNegatedElt>([
      { ALT: () => SUBRULE1(iri) },
      { ALT: () => SUBRULE1(verbA) },
      { ALT: () => {
        const hat = CONSUME(l.symbols.hat);
        const item = OR2<TermIri>([
          { ALT: () => SUBRULE2(iri) },
          { ALT: () => SUBRULE2(verbA) },
        ]);
        return ACTION(() =>
          C.astFactory.path('^', [ item ], C.astFactory.sourceLocation(hat, item)));
      } },
    ]),
};
