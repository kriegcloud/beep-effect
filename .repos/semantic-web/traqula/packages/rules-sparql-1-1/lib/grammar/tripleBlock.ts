import type { IToken } from '@traqula/chevrotain';
import { traqulaIndentation } from '@traqula/core';
import * as l from '../lexer/index.js';
import type { SparqlGrammarRule, SparqlRule } from '../sparql11HelperTypes.js';
import type {
  BasicGraphPattern,
  GraphNode,
  Path,
  PatternBgp,
  Term,
  TermVariable,
  TripleCollection,
  TripleCollectionBlankNodeProperties,
  TripleCollectionList,
  TripleNesting,
} from '../Sparql11types.js';
import { CommonIRIs } from '../utils.js';
import { var_, varOrTerm, verb } from './general.js';
import { path, pathGenerator } from './propertyPaths.js';

function triplesDotSeperated(triplesSameSubjectSubrule: SparqlGrammarRule<string, BasicGraphPattern>):
SparqlGrammarRule<string, PatternBgp>['impl'] {
  return ({ ACTION, AT_LEAST_ONE, SUBRULE, CONSUME, OPTION }) => (C) => {
    const triples: BasicGraphPattern = [];

    let parsedDot = true;
    let dotToken: undefined | IToken;
    AT_LEAST_ONE({
      GATE: () => parsedDot,
      DEF: () => {
        parsedDot = false;
        const template = SUBRULE(triplesSameSubjectSubrule);
        ACTION(() => {
          triples.push(...template);
        });
        OPTION(() => {
          dotToken = CONSUME(l.symbols.dot);
          parsedDot = true;
        });
      },
    });
    return ACTION(() => C.astFactory.patternBgp(triples, C.astFactory.sourceLocation(...triples, dotToken)));
  };
}

/**
 * [[55]](https://www.w3.org/TR/sparql11-query/#rTriplesBlock)
 */
export const triplesBlock: SparqlRule<'triplesBlock', PatternBgp> = <const>{
  name: 'triplesBlock',
  impl: implArgs => C => triplesDotSeperated(triplesSameSubjectPath)(implArgs)(C),
  gImpl: ({ SUBRULE, PRINT_WORD, HANDLE_LOC, NEW_LINE }) => (ast, { astFactory: F }) => {
    for (const [ index, triple ] of ast.triples.entries()) {
      HANDLE_LOC(triple, () => {
        const nextTriple = ast.triples.at(index + 1);
        if (F.isTripleCollection(triple)) {
          SUBRULE(graphNodePath, triple);
          // A top level tripleCollection block means that it is either not used in a triple
          //   - or is the subject of a triple. In case it is the subject,
          //   the identifier of the block will be the subject of the next triple and that subject is not materialized.
          const isSubjectOfTriple = nextTriple?.type === 'triple' &&
            F.isSourceLocationNoMaterialize(nextTriple.subject.loc);
          if (!isSubjectOfTriple) {
            F.printFilter(triple, () => {
              PRINT_WORD('.');
              NEW_LINE();
            });
          }
        } else {
          // Subject
          SUBRULE(graphNodePath, triple.subject);
          F.printFilter(triple, () => PRINT_WORD(''));
          // Predicate
          if (F.isTerm(triple.predicate) && F.isTermVariable(triple.predicate)) {
            SUBRULE(varOrTerm, triple.predicate);
          } else {
            SUBRULE(pathGenerator, triple.predicate, undefined);
          }
          F.printFilter(triple, () => PRINT_WORD(''));
          // Object
          SUBRULE(graphNodePath, triple.object);

          // If no more things, or a top level collection (only possible if new block was part), or new subject: add DOT
          if (nextTriple === undefined || F.isTripleCollection(nextTriple) ||
            !F.isSourceLocationNoMaterialize(nextTriple.subject.loc)) {
            F.printFilter(ast, () => {
              PRINT_WORD('.');
              NEW_LINE();
            });
          } else if (F.isSourceLocationNoMaterialize(nextTriple.predicate.loc)) {
            F.printFilter(ast, () => PRINT_WORD(','));
          } else {
            F.printFilter(ast, () => {
              PRINT_WORD(';');
              NEW_LINE();
            });
          }
        }
      });
    }
  },
};

/**
 * [[75]](https://www.w3.org/TR/sparql11-query/#rTriplesSameSubject)
 * [[81]](https://www.w3.org/TR/sparql11-query/#rTriplesSameSubjectPath)
 * CONTRACT: triples generated from the subject come first, then comes the main triple,
 *  and then come the triples from the object. Only the first occurrence of a term has `SourceLocationType = source`
 */
function triplesSameSubjectImpl<T extends string>(name: T, allowPaths: boolean):
SparqlGrammarRule<T, BasicGraphPattern> {
  return <const> {
    name,
    impl: ({ ACTION, SUBRULE, OR }) => C => OR<BasicGraphPattern>([
      { ALT: () => {
        const subject = SUBRULE(varOrTerm);
        const res = SUBRULE(
          allowPaths ? propertyListPathNotEmpty : propertyListNotEmpty,
          ACTION(() => C.astFactory.dematerialized(subject)),
        );
        // Only the first occurrence of a subject is actually materialized.
        return ACTION(() => {
          if (res.length > 0) {
            res[0].subject = subject;
            res[0].loc = C.astFactory.sourceLocation(subject, res[0]);
          }
          return res;
        });
      } },
      { ALT: () => {
        const subjectNode = SUBRULE(allowPaths ? triplesNodePath : triplesNode);
        const restNode = SUBRULE(
          allowPaths ? propertyListPath : propertyList,
          ACTION(() => C.astFactory.graphNodeIdentifier(subjectNode)),
        );
        return ACTION(() => {
          if (restNode.length === 0) {
            return [ subjectNode ];
          }
          restNode[0].subject = subjectNode;
          restNode[0].loc = C.astFactory.sourceLocation(subjectNode, restNode[0]);
          return restNode;
        });
      } },
    ]),
  };
}
export const triplesSameSubject = triplesSameSubjectImpl('triplesSameSubject', false);
export const triplesSameSubjectPath = triplesSameSubjectImpl('triplesSameSubjectPath', true);

/**
 * [[52]](https://www.w3.org/TR/sparql11-query/#rTriplesTemplate)
 */
export const triplesTemplate: SparqlGrammarRule<'triplesTemplate', PatternBgp> = <const> {
  name: 'triplesTemplate',
  impl: triplesDotSeperated(triplesSameSubject),
};

/**
 * [[76]](https://www.w3.org/TR/sparql11-query/#rPropertyList)
 * [[82]](https://www.w3.org/TR/sparql11-query/#rPropertyListPath)
 */
function propertyListImpl<T extends string>(name: T, allowPaths: boolean):
SparqlGrammarRule<T, TripleNesting[], [TripleNesting['subject']]> {
  return {
    name,
    impl: ({ SUBRULE, OPTION }) => (_, subject) =>
      OPTION(() => SUBRULE(allowPaths ? propertyListPathNotEmpty : propertyListNotEmpty, subject)) ?? [],
  };
}
export const propertyList = propertyListImpl('propertyList', false);
export const propertyListPath = propertyListImpl('propertyListPath', true);

// We could use gates for this, but in that case,
// a grammar not in need of paths would still have to include the path rules
/**
 * [[77]](https://www.w3.org/TR/sparql11-query/#rPropertyListNotEmpty)
 * [[83]](https://www.w3.org/TR/sparql11-query/#rPropertyListPathNotEmpty)
 */
function propertyListNotEmptyImplementation<T extends string>(
  name: T,
  allowPaths: boolean,
): SparqlGrammarRule<T, TripleNesting[], [TripleNesting['subject']]> {
  return {
    name,
    impl: ({ ACTION, CONSUME, AT_LEAST_ONE, SUBRULE1, MANY2, OR1 }) => (_, subject) => {
      const result: TripleNesting[] = [];
      let parsedSemi = true;

      AT_LEAST_ONE({
        GATE: () => parsedSemi,
        DEF: () => {
          parsedSemi = false;
          const predicate = allowPaths ?
            OR1<TermVariable | Path>([
              { ALT: () => SUBRULE1(verbPath) },
              { ALT: () => SUBRULE1(verbSimple) },
            ]) :
            SUBRULE1(verb);
          const triples = SUBRULE1(
            allowPaths ? objectListPath : objectList,
            subject,
            predicate,
          );

          MANY2(() => {
            CONSUME(l.symbols.semi);
            parsedSemi = true;
          });

          ACTION(() => {
            result.push(...triples);
          });
        },
      });
      return result;
    },
  };
}
export const propertyListNotEmpty = propertyListNotEmptyImplementation('propertyListNotEmpty', false);
export const propertyListPathNotEmpty = propertyListNotEmptyImplementation('propertyListPathNotEmpty', true);

/**
 * [[84]](https://www.w3.org/TR/sparql11-query/#rVerbPath)
 */
export const verbPath: SparqlGrammarRule<'verbPath', Path> = <const> {
  name: 'verbPath',
  impl: ({ SUBRULE }) => () => SUBRULE(path),
};

/**
 * [[85]](https://www.w3.org/TR/sparql11-query/#rVerbSimple)
 */
export const verbSimple: SparqlGrammarRule<'verbSimple', TermVariable> = <const> {
  name: 'verbSimple',
  impl: ({ SUBRULE }) => () => SUBRULE(var_),
};

/**
 * [[79]](https://www.w3.org/TR/sparql11-query/#rObjectList)
 * [[86]](https://www.w3.org/TR/sparql11-query/#rObjectListPath)
 */
function objectListImpl<T extends string>(name: T, allowPaths: boolean):
SparqlGrammarRule<T, TripleNesting[], [TripleNesting['subject'], TripleNesting['predicate']]> {
  return <const> {
    name,
    impl: ({ ACTION, SUBRULE, AT_LEAST_ONE_SEP }) => (_, subj, pred) => {
      const objects: TripleNesting[] = [];
      AT_LEAST_ONE_SEP({
        SEP: l.symbols.comma,
        DEF: () => {
          const objectTriple = SUBRULE(allowPaths ? objectPath : object, subj, pred);
          ACTION(() => {
            objects.push(objectTriple);
          });
        },
      });
      return objects;
    },
  };
}
export const objectList = objectListImpl('objectList', false);
export const objectListPath = objectListImpl('objectListPath', true);

/**
 * [[80]](https://www.w3.org/TR/sparql11-query/#rObject)
 * [[87]](https://www.w3.org/TR/sparql11-query/#rObjectPath)
 */
function objectImpl<T extends string>(name: T, allowPaths: boolean):
SparqlGrammarRule<T, TripleNesting, [TripleNesting['subject'], TripleNesting['predicate']]> {
  return {
    name,
    impl: ({ ACTION, SUBRULE }) => (C, subject, predicate) => {
      const node = SUBRULE(allowPaths ? graphNodePath : graphNode);
      return ACTION(() =>
        C.astFactory.triple(subject, predicate, node));
    },
  };
}
export const object = objectImpl('object', false);
export const objectPath = objectImpl('objectPath', true);

/**
 * [[102]](https://www.w3.org/TR/sparql11-query/#rCollection)
 * [[103]](https://www.w3.org/TR/sparql11-query/#rCollectionPath)
 */
function collectionImpl<T extends string>(name: T, allowPaths: boolean): SparqlRule<T, TripleCollectionList> {
  return {
    name,
    impl: ({ ACTION, AT_LEAST_ONE, SUBRULE, CONSUME }) => (C) => {
      // Construct a [cons list](https://en.wikipedia.org/wiki/Cons#Lists),
      // here called a [RDF collection](https://www.w3.org/TR/sparql11-query/#collections).
      const terms: GraphNode[] = [];

      const startToken = CONSUME(l.symbols.LParen);

      AT_LEAST_ONE(() => {
        terms.push(SUBRULE(allowPaths ? graphNodePath : graphNode));
      });
      const endToken = CONSUME(l.symbols.RParen);

      return ACTION(() => {
        const F = C.astFactory;
        const triples: TripleNesting[] = [];
        // The triples created in your recursion
        const predFirst = F.termNamed(F.sourceLocation(), CommonIRIs.FIRST, undefined);
        const predRest = F.termNamed(F.sourceLocation(), CommonIRIs.REST, undefined);
        const predNil = F.termNamed(F.sourceLocation(), CommonIRIs.NIL, undefined);

        const listHead = F.termBlank(undefined, F.sourceLocation());
        let iterHead: TripleNesting['object'] = listHead;
        for (const [ index, term ] of terms.entries()) {
          const lastInList = index === terms.length - 1;

          const headTriple: TripleNesting = F.triple(
            iterHead,
            predFirst,
            term,
          );
          triples.push(headTriple);

          // If not the last, create new iterHead, otherwise, close list
          if (lastInList) {
            const nilTriple: TripleNesting = F.triple(iterHead, predRest, predNil);
            triples.push(nilTriple);
          } else {
            const tail = F.termBlank(undefined, F.sourceLocation());
            const linkTriple: TripleNesting = F.triple(iterHead, predRest, tail);
            triples.push(linkTriple);
            iterHead = tail;
          }
        }
        return F.tripleCollectionList(listHead, triples, F.sourceLocation(startToken, endToken));
      });
    },
    gImpl: ({ SUBRULE, PRINT_WORD }) => (ast, { astFactory: F }) => {
      F.printFilter(ast, () => PRINT_WORD('('));
      // Only every 2 triple is relevant. The odd triples are linking triples.
      for (const [ idx, triple ] of ast.triples.entries()) {
        if (idx % 2 === 0) {
          SUBRULE(allowPaths ? graphNodePath : graphNode, triple.object);
        }
      }
      F.printFilter(ast, () => PRINT_WORD(')'));
    },
  };
}
export const collection = collectionImpl('collection', false);
export const collectionPath = collectionImpl('collectionPath', true);

/**
 * [[98]](https://www.w3.org/TR/sparql11-query/#rTriplesNode)
 * [[100]](https://www.w3.org/TR/sparql11-query/#rTriplesNodePath)
 */
function triplesNodeImpl<T extends string>(name: T, allowPaths: boolean): SparqlRule<T, TripleCollection> {
  return <const>{
    name,
    impl: ({ SUBRULE, OR }) => () => OR<TripleCollection>([
      { ALT: () => SUBRULE(allowPaths ? collectionPath : collection) },
      { ALT: () => SUBRULE(allowPaths ? blankNodePropertyListPath : blankNodePropertyList) },
    ]),
    gImpl: ({ SUBRULE }) => ast => ast.subType === 'list' ?
      SUBRULE(allowPaths ? collectionPath : collection, ast) :
      SUBRULE(allowPaths ? blankNodePropertyListPath : blankNodePropertyList, ast),
  };
}
export const triplesNode = triplesNodeImpl('triplesNode', false);
export const triplesNodePath = triplesNodeImpl('triplesNodePath', true);

/**
 * [[99]](https://www.w3.org/TR/sparql11-query/#rBlankNodePropertyList)
 * [[101]](https://www.w3.org/TR/sparql11-query/#rBlankNodePropertyListPath)
 */
function blankNodePropertyListImpl<T extends string>(name: T, allowPaths: boolean):
SparqlRule<T, TripleCollectionBlankNodeProperties> {
  const propertyPathNotEmptyImpl = allowPaths ? propertyListPathNotEmpty : propertyListNotEmpty;
  return {
    name,
    impl: ({ ACTION, SUBRULE, CONSUME }) => (C) => {
      const startToken = CONSUME(l.symbols.LSquare);

      const blankNode = ACTION(() =>
        C.astFactory.termBlank(undefined, C.astFactory.sourceLocation()));

      const propList = SUBRULE(propertyPathNotEmptyImpl, blankNode);
      const endToken = CONSUME(l.symbols.RSquare);

      return ACTION(() => C.astFactory.tripleCollectionBlankNodeProperties(
        blankNode,
        propList,
        C.astFactory.sourceLocation(startToken, endToken),
      ));
    },
    gImpl: ({ SUBRULE, PRINT, PRINT_WORD, HANDLE_LOC, PRINT_ON_EMPTY, NEW_LINE }) => (ast, c) => {
      const { astFactory: F, indentInc } = c;
      F.printFilter(ast, () => {
        c[traqulaIndentation] += indentInc;
        PRINT('[');
        NEW_LINE();
      });
      for (const triple of ast.triples) {
        HANDLE_LOC(triple, () => {
          // Predicate
          if (F.isTerm(triple.predicate) && F.isTermVariable(triple.predicate)) {
            SUBRULE(varOrTerm, triple.predicate);
          } else {
            SUBRULE(pathGenerator, triple.predicate, undefined);
          }
          F.printFilter(triple, () => PRINT_WORD(''));
          // Object
          SUBRULE(graphNodePath, triple.object);

          F.printFilter(ast, () => {
            PRINT_WORD(';');
            NEW_LINE();
          });
        });
      }
      F.printFilter(ast, () => {
        c[traqulaIndentation] -= indentInc;
        PRINT_ON_EMPTY(']');
      });
    },
  };
}
export const blankNodePropertyList = blankNodePropertyListImpl('blankNodePropertyList', false);
export const blankNodePropertyListPath = blankNodePropertyListImpl('blankNodePropertyListPath', true);

/**
 * [[103]](https://www.w3.org/TR/sparql11-query/#rGraphNode)
 * [[105]](https://www.w3.org/TR/sparql11-query/#rGraphNodePath)
 */
function graphNodeImpl<T extends string>(name: T, allowPaths: boolean): SparqlRule<T, Term | TripleCollection> {
  const triplesNodeRule = allowPaths ? triplesNodePath : triplesNode;
  return {
    name,
    impl: ({ SUBRULE, OR }) => C => OR<Term | TripleCollection>([
      { ALT: () => SUBRULE(varOrTerm) },
      {
        GATE: () => C.parseMode.has('canCreateBlankNodes'),
        ALT: () => SUBRULE(triplesNodeRule),
      },
    ]),
    gImpl: ({ SUBRULE }) => (ast, { astFactory: F }) => {
      if (F.isTerm(ast)) {
        SUBRULE(varOrTerm, ast);
      } else {
        SUBRULE(triplesNodeRule, ast);
      }
    },
  };
}
export const graphNode = graphNodeImpl('graphNode', false);
export const graphNodePath = graphNodeImpl('graphNodePath', true);
