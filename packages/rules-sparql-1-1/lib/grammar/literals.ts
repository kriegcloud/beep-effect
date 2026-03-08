import type { IToken } from '@traqula/chevrotain';
import * as l from '../lexer/index.js';
import type { SparqlGrammarRule, SparqlRule } from '../sparql11HelperTypes.js';
import type {
  TermBlank,
  TermIri,
  TermIriFull,
  TermIriPrefixed,
  TermLiteral,
  TermLiteralStr,
  TermLiteralTyped,
} from '../Sparql11types.js';
import { CommonIRIs } from '../utils.js';

export function stringEscapedLexical(str: string): string {
  const lexical = str.replaceAll(/["\\\t\n\r\b\f]/gu, (char) => {
    switch (char) {
      case '\t':
        return '\\t';
      case '\n':
        return '\\n';
      case '\r':
        return '\\r';
      case '\b':
        return '\\b';
      case '\f':
        return '\\f';
      case '"':
        return '\\"';
      case '\\':
        return '\\\\';
      default:
        return char;
    }
  });
  return `"${lexical}"`;
}

/**
 * [[120]](https://www.w3.org/TR/sparql11-query/#rRDFLiteral)
 */
export const rdfLiteral: SparqlRule<'rdfLiteral', TermLiteral> = <const> {
  name: 'rdfLiteral',
  impl: ({ ACTION, SUBRULE1, CONSUME, OPTION, OR }) => (C) => {
    const value = SUBRULE1(string);
    return OPTION(() => OR<TermLiteral>([
      { ALT: () => {
        const lang = CONSUME(l.terminals.langTag);
        return ACTION(() => C.astFactory.termLiteral(
          C.astFactory.sourceLocation(value, lang),
          value.value,
          lang.image.slice(1).toLowerCase(),
        ));
      } },
      { ALT: () => {
        CONSUME(l.symbols.hathat);
        const iriVal = SUBRULE1(iri);
        return ACTION(() => C.astFactory.termLiteral(
          C.astFactory.sourceLocation(value, iriVal),
          value.value,
          iriVal,
        ));
      } },
    ])) ?? value;
  },
  gImpl: ({ SUBRULE, PRINT, PRINT_WORD }) => (ast, { astFactory }) => {
    if (!ast.langOrIri || typeof ast.langOrIri === 'string') {
      // String or langdir string - no sub loc.
      astFactory.printFilter(ast, () => {
        PRINT_WORD('');
        PRINT(stringEscapedLexical(ast.value));
      });
      if (typeof ast.langOrIri === 'string') {
        astFactory.printFilter(ast, () => PRINT('@', ast.langOrIri));
      }
    } else if (astFactory.isSourceLocationNoMaterialize(ast.langOrIri.loc)) {
      // You have a typed literal. -- If type is not materialized, print raw
      astFactory.printFilter(ast, () => {
        PRINT_WORD(ast.value);
      });
    } else {
      astFactory.printFilter(ast, () => {
        PRINT_WORD('');
        PRINT(stringEscapedLexical(ast.value), '^^');
      });
      SUBRULE(iri, ast.langOrIri);
    }
  },
};

/**
 * Parses a numeric literal.
 * [[130]](https://www.w3.org/TR/sparql11-query/#rNumericLiteral)
 */
export const numericLiteral: SparqlGrammarRule<'numericLiteral', TermLiteralTyped> = <const> {
  name: 'numericLiteral',
  impl: ({ SUBRULE, OR }) => () => OR([
    { ALT: () => SUBRULE(numericLiteralUnsigned) },
    { ALT: () => SUBRULE(numericLiteralPositive) },
    { ALT: () => SUBRULE(numericLiteralNegative) },
  ]),
};

/**
 * Parses an unsigned numeric literal.
 * [[131]](https://www.w3.org/TR/sparql11-query/#rNumericLiteralUnsigned)
 */
export const numericLiteralUnsigned: SparqlGrammarRule<'numericLiteralUnsigned', TermLiteralTyped> = <const> {
  name: 'numericLiteralUnsigned',
  impl: ({ ACTION, CONSUME, OR }) => (C) => {
    const parsed = OR<[IToken, string]>([
      { ALT: () => <const> [ CONSUME(l.terminals.integer), CommonIRIs.INTEGER ]},
      { ALT: () => <const> [ CONSUME(l.terminals.decimal), CommonIRIs.DECIMAL ]},
      { ALT: () => <const> [ CONSUME(l.terminals.double), CommonIRIs.DOUBLE ]},
    ]);
    return ACTION(() => C.astFactory.termLiteral(
      C.astFactory.sourceLocation(parsed[0]),
      parsed[0].image,
      C.astFactory.termNamed(C.astFactory.sourceLocation(), parsed[1]),
    ));
  },
};

/**
 * Parses a positive numeric literal.
 * [[132]](https://www.w3.org/TR/sparql11-query/#rNumericLiteralPositive)
 */
export const numericLiteralPositive: SparqlGrammarRule<'numericLiteralPositive', TermLiteralTyped> = <const> {
  name: 'numericLiteralPositive',
  impl: ({ ACTION, CONSUME, OR }) => (C) => {
    const parsed = OR<[IToken, string]>([
      { ALT: () => <const> [ CONSUME(l.terminals.integerPositive), CommonIRIs.INTEGER ]},
      { ALT: () => <const> [ CONSUME(l.terminals.decimalPositive), CommonIRIs.DECIMAL ]},
      { ALT: () => <const> [ CONSUME(l.terminals.doublePositive), CommonIRIs.DOUBLE ]},
    ]);
    return ACTION(() => C.astFactory.termLiteral(
      C.astFactory.sourceLocation(parsed[0]),
      parsed[0].image,
      C.astFactory.termNamed(C.astFactory.sourceLocation(), parsed[1]),
    ));
  },
};

/**
 * Parses a negative numeric literal.
 * [[133]](https://www.w3.org/TR/sparql11-query/#rNumericLiteralNegative)
 */
export const numericLiteralNegative: SparqlGrammarRule<'numericLiteralNegative', TermLiteralTyped> = <const> {
  name: 'numericLiteralNegative',
  impl: ({ ACTION, CONSUME, OR }) => (C) => {
    const parsed = OR<[IToken, string]>([
      { ALT: () => <const> [ CONSUME(l.terminals.integerNegative), CommonIRIs.INTEGER ]},
      { ALT: () => <const> [ CONSUME(l.terminals.decimalNegative), CommonIRIs.DECIMAL ]},
      { ALT: () => <const> [ CONSUME(l.terminals.doubleNegative), CommonIRIs.DOUBLE ]},
    ]);
    return ACTION(() => C.astFactory.termLiteral(
      C.astFactory.sourceLocation(parsed[0]),
      parsed[0].image,
      C.astFactory.termNamed(C.astFactory.sourceLocation(), parsed[1]),
    ));
  },
};

/**
 * Parses a boolean literal.
 * [[134]](https://www.w3.org/TR/sparql11-query/#rBooleanLiteral)
 */
export const booleanLiteral: SparqlGrammarRule<'booleanLiteral', TermLiteralTyped> = <const> {
  name: 'booleanLiteral',
  impl: ({ ACTION, CONSUME, OR }) => (C) => {
    const token = OR([
      { ALT: () => CONSUME(l.true_) },
      { ALT: () => CONSUME(l.false_) },
    ]);

    return ACTION(() => C.astFactory.termLiteral(
      C.astFactory.sourceLocation(token),
      token.image.toLowerCase(),
      C.astFactory.termNamed(C.astFactory.sourceLocation(), CommonIRIs.BOOLEAN),
    ));
  },
};

/**
 * Parses a string literal.
 * [[135]](https://www.w3.org/TR/sparql11-query/#rString)
 */
export const string: SparqlGrammarRule<'string', TermLiteralStr> = <const> {
  name: 'string',
  impl: ({ ACTION, CONSUME, OR }) => (C) => {
    const x = OR([
      { ALT: () => {
        const token = CONSUME(l.terminals.stringLiteral1);
        return <const>[ token, token.image.slice(1, -1) ];
      } },
      { ALT: () => {
        const token = CONSUME(l.terminals.stringLiteral2);
        return <const>[ token, token.image.slice(1, -1) ];
      } },
      { ALT: () => {
        const token = CONSUME(l.terminals.stringLiteralLong1);
        return <const>[ token, token.image.slice(3, -3) ];
      } },
      { ALT: () => {
        const token = CONSUME(l.terminals.stringLiteralLong2);
        return <const>[ token, token.image.slice(3, -3) ];
      } },
    ]);
    // Handle string escapes (19.7). (19.2 is handled at input level.)
    return ACTION(() => {
      const F = C.astFactory;
      const value = x[1].replaceAll(/\\([tnrbf"'\\])/gu, (_, char: string) => {
        switch (char) {
          case 't':
            return '\t';
          case 'n':
            return '\n';
          case 'r':
            return '\r';
          case 'b':
            return '\b';
          case 'f':
            return '\f';
          default:
            return char;
        }
      });
      return F.termLiteral(F.sourceLocation(x[0]), value);
    });
  },
};

/**
 * Parses a named node, either as an IRI or as a prefixed name.
 * [[136]](https://www.w3.org/TR/sparql11-query/#riri)
 */
export const iri: SparqlRule<'iri', TermIri> = <const> {
  name: 'iri',
  impl: ({ SUBRULE, OR }) => () => OR<TermIri>([
    { ALT: () => SUBRULE(iriFull) },
    { ALT: () => SUBRULE(prefixedName) },
  ]),
  gImpl: ({ SUBRULE }) => (ast, { astFactory: F }) =>
    F.isTermNamedPrefixed(ast) ? SUBRULE(prefixedName, ast) : SUBRULE(iriFull, ast),
};

export const iriFull: SparqlRule<'iriFull', TermIriFull> = <const> {
  name: 'iriFull',
  impl: ({ ACTION, CONSUME }) => (C) => {
    const iriToken = CONSUME(l.terminals.iriRef);
    return ACTION(() => C.astFactory.termNamed(C.astFactory.sourceLocation(iriToken), iriToken.image.slice(1, -1)));
  },
  gImpl: ({ PRINT }) => (ast, { astFactory: F }) => {
    F.printFilter(ast, () => PRINT('<', ast.value, '>'));
  },
};

/**
 * Parses a named node with a prefix. Looks up the prefix in the context and returns the full IRI.
 * [[137]](https://www.w3.org/TR/sparql11-query/#rPrefixedName)
 */
export const prefixedName: SparqlRule<'prefixedName', TermIriPrefixed> = <const> {
  name: 'prefixedName',
  impl: ({ ACTION, CONSUME, OR }) => (C) => {
    function verifyPrefix(prefix: string): void {
      if (!C.skipValidation && C.prefixes[prefix] === undefined) {
        throw new Error(`Unknown prefix: ${prefix}`);
      }
    }
    return OR([{ ALT: () => {
      const longName = CONSUME(l.terminals.pNameLn);
      return ACTION(() => {
        const [ prefix, localName ] = longName.image.split(':');
        verifyPrefix(prefix);
        return C.astFactory.termNamed(C.astFactory.sourceLocation(longName), localName, prefix);
      });
    },
    }, { ALT: () => {
      const shortName = CONSUME(l.terminals.pNameNs);
      return ACTION(() => {
        const prefix = shortName.image.slice(0, -1);
        verifyPrefix(prefix);
        return C.astFactory.termNamed(
          C.astFactory.sourceLocation(shortName),
          '',
          prefix,
        );
      });
    },
    }]);
  },
  gImpl: ({ PRINT }) => (ast, { astFactory: F }) => {
    F.printFilter(ast, () => PRINT(ast.prefix, ':', ast.value));
  },
};

export const canCreateBlankNodes = Symbol('canCreateBlankNodes');

/**
 * Parses blank note and throws an error if 'canCreateBlankNodes' is not in the current parserMode.
 * [[138]](https://www.w3.org/TR/sparql11-query/#rBlankNode)
 */
export const blankNode: SparqlRule<'blankNode', TermBlank> = <const> {
  name: 'blankNode',
  impl: ({ ACTION, CONSUME, OR }) => (C) => {
    const result = OR([
      { ALT: () => {
        const labelToken = CONSUME(l.terminals.blankNodeLabel);
        return ACTION(() =>
          C.astFactory.termBlank(labelToken.image.slice(2), C.astFactory.sourceLocation(labelToken)));
      } },
      { ALT: () => {
        const anonToken = CONSUME(l.terminals.anon);
        return ACTION(() => C.astFactory.termBlank(undefined, C.astFactory.sourceLocation(anonToken)));
      } },
    ]);
    ACTION(() => {
      if (!C.parseMode.has('canCreateBlankNodes')) {
        throw new Error('Blank nodes are not allowed in this context');
      }
    });
    return result;
  },
  gImpl: ({ PRINT }) => (ast, { astFactory }) => {
    astFactory.printFilter(ast, () => PRINT('_:', ast.label.replace(/^e_/u, '')));
  },
};

export const verbA: SparqlGrammarRule<'VerbA', TermIriFull> = <const> {
  name: 'VerbA',
  impl: ({ ACTION, CONSUME }) => (C) => {
    const token = CONSUME(l.a);
    return ACTION(() => C.astFactory.termNamed(C.astFactory.sourceLocation(token), CommonIRIs.TYPE, undefined));
  },
};
