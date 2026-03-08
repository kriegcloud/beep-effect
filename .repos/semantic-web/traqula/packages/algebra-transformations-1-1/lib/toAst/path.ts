import type * as RDF from '@rdfjs/types';
import type {
  Path,
  PathAlternativeLimited,
  PathModified,
  PathNegatedElt,
  PathPure,
  PropertyPathChain,
  TermIri,
} from '@traqula/rules-sparql-1-1';
import type * as Algebra from '../algebra.js';
import { types } from '../toAlgebra/core.js';
import type { AstIndir } from './core.js';
import type { RdfTermToAst } from './general.js';
import { translateAlgTerm } from './general.js';

export const translateAlgPathComponent: AstIndir<'translatePathComponent', Path, [Algebra.PropertyPathSymbol]> = {
  name: 'translatePathComponent',
  fun: ({ SUBRULE }) => (_, path) => {
    switch (path.type) {
      case types.ALT: return SUBRULE(translateAlgAlt, path);
      case types.INV: return SUBRULE(translateAlgInv, path);
      case types.LINK: return SUBRULE(translateAlgLink, path);
      case types.NPS: return SUBRULE(translateAlgNps, path);
      case types.ONE_OR_MORE_PATH: return SUBRULE(translateAlgOneOrMorePath, path);
      case types.SEQ: return SUBRULE(translateAlgSeq, path);
      case types.ZERO_OR_MORE_PATH: return SUBRULE(translateAlgZeroOrMorePath, path);
      case types.ZERO_OR_ONE_PATH: return SUBRULE(translateAlgZeroOrOnePath, path);
      default:
        throw new Error(`Unknown Path type ${(<{ type: string }>path).type}`);
    }
  },
};

export const translateAlgAlt: AstIndir<'translateAlt', Path, [Algebra.Alt]> = {
  name: 'translateAlt',
  fun: ({ SUBRULE }) => ({ astFactory: F }, path) => {
    const mapped = path.input.map(x => SUBRULE(translateAlgPathComponent, x));
    if (mapped.every(entry => F.isPathOfType(entry, [ '!' ]))) {
      return F.path(
        '!',
        [ F.path(
          '|',
          <(TermIri | PathNegatedElt)[]> mapped.flatMap(entry => (<PathPure> entry).items),
          F.gen(),
        ) ],
        F.gen(),
      );
    }
    return F.path('|', mapped, F.gen());
  },
};

export const translateAlgInv: AstIndir<'translateInv', Path, [Algebra.Inv]> = {
  name: 'translateInv',
  fun: ({ SUBRULE }) => ({ astFactory: F }, path) => {
    if (path.path.type === types.NPS) {
      const inv: Path[] = path.path.iris.map((iri: RDF.NamedNode) => F.path(
        '^',
        [ <RdfTermToAst<typeof iri>>SUBRULE(translateAlgTerm, iri) ],
        F.gen(),
      ));

      if (inv.length <= 1) {
        return F.path(
          '!',
          <[TermIri | PathNegatedElt | PathAlternativeLimited]> inv,
          F.gen(),
        );
      }

      return F.path('!', [ <PathAlternativeLimited> F.path('|', inv, F.gen()) ], F.gen());
    }

    return F.path('^', [ SUBRULE(translateAlgPathComponent, path.path) ], F.gen());
  },
};

export const translateAlgLink: AstIndir<'translateLink', TermIri, [Algebra.Link]> = {
  name: 'translateLink',
  fun: ({ SUBRULE }) => (_, path) =>
    <RdfTermToAst<typeof path.iri>>SUBRULE(translateAlgTerm, path.iri),
};

export const translateAlgNps: AstIndir<'translateNps', Path, [Algebra.Nps]> = {
  name: 'translateNps',
  fun: ({ SUBRULE }) => ({ astFactory: F }, path) => {
    if (path.iris.length === 1) {
      return F.path('!', [ <RdfTermToAst<typeof path.iris[0]>> SUBRULE(translateAlgTerm, path.iris[0]) ], F.gen());
    }
    return F.path('!', [
      F.path('|', path.iris.map(x => <RdfTermToAst<typeof x>> SUBRULE(translateAlgTerm, x)), F.gen()),
    ], F.gen());
  },
};

export const translateAlgOneOrMorePath: AstIndir<'translateOneOrMorePath', PathModified, [Algebra.OneOrMorePath]> = {
  name: 'translateOneOrMorePath',
  fun: ({ SUBRULE }) => ({ astFactory: F }, path) =>
    F.path('+', [ SUBRULE(translateAlgPathComponent, path.path) ], F.gen()),
};

export const translateAlgSeq: AstIndir<'translateSeq', PropertyPathChain, [Algebra.Seq]> = {
  name: 'translateSeq',
  fun: ({ SUBRULE }) => ({ astFactory: F }, path) =>
    F.path(
      '/',
      path.input.map(x => SUBRULE(translateAlgPathComponent, x)),
      F.gen(),
    ),
};

export const translateAlgZeroOrMorePath: AstIndir<'translateZeroOrMorePath', PathModified, [Algebra.ZeroOrMorePath]> = {
  name: 'translateZeroOrMorePath',
  fun: ({ SUBRULE }) => ({ astFactory: F }, path) =>
    F.path('*', [ SUBRULE(translateAlgPathComponent, path.path) ], F.gen()),
};

export const translateAlgZeroOrOnePath: AstIndir<'translateZeroOrOnePath', PathModified, [Algebra.ZeroOrOnePath]> = {
  name: 'translateZeroOrOnePath',
  fun: ({ SUBRULE }) => ({ astFactory: F }, path) =>
    F.path('?', [ SUBRULE(translateAlgPathComponent, path.path) ], F.gen()),
};
