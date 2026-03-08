import type * as RDF from '@rdfjs/types';
import { translateAlgTerm } from '@traqula/algebra-transformations-1-1';
import type { TermIri, TermVariable } from '@traqula/rules-sparql-1-1';
import type { Term } from '@traqula/rules-sparql-1-2';
import type { AstIndir } from './types.js';

export const translateAlgTerm12: AstIndir<(typeof translateAlgTerm)['name'], Term, [RDF.Term]> = {
  name: 'translateTerm',
  fun: s => (c, term) => {
    if (term.termType === 'Quad') {
      const { SUBRULE } = s;
      const { astFactory: F } = c;
      return F.termTriple(
        SUBRULE(translateAlgTerm, term.subject),
        <TermIri | TermVariable> SUBRULE(translateAlgTerm, term.predicate),
        SUBRULE(translateAlgTerm, term.object),
        F.gen(),
      );
    }
    return translateAlgTerm.fun(s)(c, term);
  },
};
