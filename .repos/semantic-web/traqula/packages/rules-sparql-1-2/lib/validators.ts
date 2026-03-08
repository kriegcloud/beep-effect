import { AstFactory } from './AstFactory.js';
import type {
  Path,
  Pattern,
  SparqlQuery,
  Term,
  TermLiteral,
  TripleCollection,
  TripleNesting,
  Wildcard,
} from './sparql12Types.js';

const F = new AstFactory();

function isLangDir(dir: string): dir is 'ltr' | 'rtl' {
  return dir === 'ltr' || dir === 'rtl';
}

export function langTagHasCorrectRange(literal: TermLiteral): void {
  if (F.isTermLiteralLangStr(literal)) {
    const dirSplit = literal.langOrIri.split('--');
    if (dirSplit.length > 1) {
      const [ _, direction ] = dirSplit;
      if (!isLangDir(direction)) {
        throw new Error(`language direction "${direction}" of literal "${JSON.stringify(literal)}" is not is required range 'ltr' | 'rtl'.`);
      }
    }
  }
}

export function findPatternBoundedVars(
  iter: SparqlQuery | Pattern | TripleNesting | TripleCollection | Path | Term | Wildcard,
  boundedVars: Set<string>,
): void {
  if (F.isQuery(iter) || F.isUpdate(iter)) {
    if (F.isQuerySelect(iter) || F.isQueryDescribe(iter)) {
      if (iter.where && iter.variables.some(x => F.isWildcard(x))) {
        findPatternBoundedVars(iter.where, boundedVars);
      } else {
        for (const v of iter.variables) {
          findPatternBoundedVars(v, boundedVars);
        }
      }
      if (iter.solutionModifiers.group) {
        const grouping = iter.solutionModifiers.group;
        for (const g of grouping.groupings) {
          if ('variable' in g) {
            findPatternBoundedVars(g.variable, boundedVars);
          }
        }
      }
      if (iter.values?.values && iter.values.values.length > 0) {
        const values = iter.values.values;
        for (const v of Object.keys(values[0])) {
          boundedVars.add(v);
        }
      }
    }
  } else if (F.isTerm(iter)) {
    if (F.isTermVariable(iter)) {
      boundedVars.add(iter.value);
    }
    if (F.isTermTriple(iter)) {
      findPatternBoundedVars(iter.subject, boundedVars);
      findPatternBoundedVars(iter.predicate, boundedVars);
      findPatternBoundedVars(iter.object, boundedVars);
    }
  } else if (F.isTriple(iter)) {
    findPatternBoundedVars(iter.subject, boundedVars);
    findPatternBoundedVars(iter.predicate, boundedVars);
    findPatternBoundedVars(iter.object, boundedVars);
    for (const annotation of iter.annotations ?? []) {
      findPatternBoundedVars(
        F.isTripleCollection(annotation) ? annotation : annotation.val,
        boundedVars,
      );
    }
  } else if (F.isPath(iter)) {
    if (!F.isTerm(iter)) {
      for (const item of iter.items) {
        findPatternBoundedVars(item, boundedVars);
      }
    }
  } else if (F.isTripleCollection(iter) || F.isPatternBgp(iter)) {
    for (const triple of iter.triples) {
      findPatternBoundedVars(triple, boundedVars);
    }
  } else if (
    F.isPatternGroup(iter) || F.isPatternUnion(iter) || F.isPatternOptional(iter) || F.isPatternService(iter)) {
    for (const pattern of iter.patterns) {
      findPatternBoundedVars(pattern, boundedVars);
    }
    if (F.isPatternService(iter)) {
      findPatternBoundedVars(iter.name, boundedVars);
    }
  } else if (F.isPatternBind(iter)) {
    findPatternBoundedVars(iter.variable, boundedVars);
  } else if (F.isPatternValues(iter)) {
    for (const variable of Object.keys(iter.values.at(0) ?? {})) {
      boundedVars.add(variable);
    }
  } else if (F.isPatternGraph(iter)) {
    findPatternBoundedVars(iter.name, boundedVars);
    for (const pattern of iter.patterns) {
      findPatternBoundedVars(pattern, boundedVars);
    }
  }
}
