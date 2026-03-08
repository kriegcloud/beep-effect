import type * as RDF from '@rdfjs/types';
import {
  translateNamed,
  translateTerm,
  translateTripleCollection,
  translateTripleNesting,
} from '@traqula/algebra-transformations-1-1';
import type { FlattenedTriple } from '@traqula/algebra-transformations-1-1';
import type * as T11 from '@traqula/rules-sparql-1-1';
import type {
  Expression,
  Ordering,
  Path,
  PatternBind,
  SparqlQuery,
  Term,
  TripleCollection,
  TripleNesting,
  Wildcard,
} from '@traqula/rules-sparql-1-2';
import {
  findPatternBoundedVars,
} from '@traqula/rules-sparql-1-2';
import { termToString } from 'rdf-string';
import type { AlgebraIndir } from './types.js';

const reificationIri = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies';

export type MapAggregateType = Wildcard | Expression | Ordering | PatternBind;

export const translateTerm12: AlgebraIndir<(typeof translateTerm)['name'], RDF.Term, [Term]> = {
  name: 'translateTerm',
  fun: $ => (C, term) => {
    if (C.astFactory.isTermTriple(term)) {
      return C.dataFactory.quad(
        $.SUBRULE(translateTerm12, term.subject),
        $.SUBRULE(translateTerm12, term.predicate),
        $.SUBRULE(translateTerm12, term.object),
      );
    }
    if (C.astFactory.isTermLiteral(term)) {
      if (!term.langOrIri) {
        return C.dataFactory.literal(term.value);
      }
      if (typeof term.langOrIri === 'object') {
        const iri = $.SUBRULE(translateNamed, term.langOrIri);
        return C.dataFactory.literal(term.value, iri);
      }
      const [ lang, langDir ] = term.langOrIri.split('--');
      if (langDir && (langDir === '' || langDir === 'ltr' || langDir === 'rtl')) {
        return C.dataFactory.literal(term.value, {
          language: lang,
          direction: langDir,
        });
      }
      return C.dataFactory.literal(term.value, term.langOrIri);
    }
    return translateTerm.fun($)(C, term);
  },
};

export const translateTripleCollection12: AlgebraIndir<
  (typeof translateTripleCollection)['name'],
void,
[TripleCollection, FlattenedTriple[]]
> = {
  name: 'translateTripleCollection',
  fun: s => (c, collection, result) => {
    if (c.astFactory.isTripleCollectionReifiedTriple(collection)) {
      const { SUBRULE } = s;
      const { dataFactory } = c;
      const identifier = SUBRULE(translateTerm12, collection.identifier);
      SUBRULE(translateTripleNesting12, collection.triples[0], result);
      // Given the rule for triple nesting, the triple itself is always generated last
      // (followed by annotations, but they are not allowed within reified triples
      const { subject, predicate, object } = result.pop()!;
      const asTerm = dataFactory.quad(subject, <Exclude<typeof predicate, T11.PathPure>> predicate, object);
      result.push({
        subject: identifier,
        predicate: dataFactory.namedNode(reificationIri),
        object: asTerm,
      });
    } else {
      translateTripleCollection.fun(s)(c, <T11.TripleCollection> collection, result);
    }
  },
};

/**
 * Generates: everything for the subject collection + everything for the object collection + itself +
 *              the annotations triples
 */
export const translateTripleNesting12: AlgebraIndir<
  (typeof translateTripleNesting)['name'],
void,
[TripleNesting, FlattenedTriple[]]
> = {
  name: 'translateTripleNesting',
  fun: s => (c, triple, result) => {
    translateTripleNesting.fun(s)(c, <T11.TripleNesting>triple, result);
    const SUBRULE = s.SUBRULE;
    const { subject, predicate, object } = result.at(-1)!;
    const { astFactory: F, dataFactory } = c;
    if (triple.annotations && triple.annotations.length > 0) {
      // Blocks know who identifies them. -> Can just add it to list of triples
      //  -> a blocks identifier only need to be registered when the identifier is not explicitly registered before.
      //  We register: <annotationNode, reifies, tripleNesting>
      // You cannot have an annotation on a triple that has paths
      const asTerm = dataFactory.quad(subject, <Exclude<typeof predicate, T11.PathPure>> predicate, object);
      const registered = new Set<string>();
      for (const annotation of triple.annotations) {
        let subject: RDF.Term;
        const tripleCollection = F.isTripleCollection(annotation);
        if (tripleCollection) {
          subject = SUBRULE(translateTerm12, annotation.identifier);
        } else {
          subject = SUBRULE(translateTerm12, annotation.val);
        }
        if (!registered.has(termToString(subject))) {
          result.push({
            subject,
            predicate: dataFactory.namedNode(reificationIri),
            object: asTerm,
          });
        }
        registered.add(termToString(subject));
        if (tripleCollection) {
          SUBRULE(translateTripleCollection12, annotation, result);
        }
      }
    }
  },
};

/**
 * 18.2.1
 */
export const inScopeVariables:
AlgebraIndir<'inScopeVariables', Set<string>, [SparqlQuery | TripleNesting | TripleCollection | Path | Term]> = {
  name: 'inScopeVariables',
  fun: () => (_, thingy) => {
    const vars = new Set<string>();
    findPatternBoundedVars(thingy, vars);
    return vars;
  },
};
