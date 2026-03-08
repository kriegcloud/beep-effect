import * as ShExJ from 'shexj';
import {rdfJsTerm2Ld, SchemaIndex} from "@shexjs/term";
import type {Quad as RdfJsQuad, Term as RdfJsTerm} from '@rdfjs/types';
import {
  ConstraintToTripleResults,
  SemActDispatcher,
  ValidatorRegexEngine,
  ValidatorRegexModule
} from "@shexjs/eval-validator-api";
import {
  EachOfSolution,
  error,
  ExcessTripleViolation,
  groupSolution,
  groupSolutions,
  MissingProperty,
  OneOfSolution,
  shapeExprTest,
  TestedTriple,
  TripleConstraintSolutions,
  tripleExprSolution,
  tripleExprSolutions
} from "@shexjs/term/shexv";

export {};

const UNBOUNDED = -1;

type ConstraintToTriples = Map<ShExJ.TripleConstraint, RdfJsQuad[]>; // TODO: prefer MapArray<>?

interface PossibleErrors {
  type: "PossibleErrors"
  errors: error[][];
}

interface TripleList {
  triples: RdfJsQuad[];
}

class RegexpThread {
  public avail: ConstraintToTriples;   // triples remaining by constraint
  public matched: TripleList[]; // triples matched in this thread
  public errors: error[];   // errors encounted
  public solution?: groupSolution
  public expression?: tripleExprSolutions
  constructor(avail: ConstraintToTriples = new Map(), errors: error[] = [], matched: TripleList[] = [], expression?: tripleExprSolutions) {
    this.avail = avail;
    this.errors = errors;
    this.matched = matched;
    this.expression = expression;
  }

  makeResultsThread (expr: ShExJ.TripleConstraint, tests: TripleTestedErrors[],
                     errors: error[], matched: TripleList[], minmax: GroupAttrs): RegexpThread {
    return new RegexpThread(
      new Map(this.avail), // copy parent thread's avail vector,
      errors,
      matched.concat({
        triples: tests.map(p => p.triple)
      }),
      Object.assign(
          { type: "TripleConstraintSolutions", predicate: expr.predicate },
          expr.valueExpr !== undefined ? {valueExpr: expr.valueExpr} : {},
          expr.id !== undefined ? {productionLabel: expr.id} : {},
          minmax,
          { solutions: tests.map(p => p.tested) }
      )
    );
  }

  makeMissingPropertyThread (expr: ShExJ.TripleConstraint, matched: TripleList[]) {
    return new RegexpThread(
      this.avail,
      this.errors.concat([
        Object.assign(
            {type: "MissingProperty", property: expr.predicate},
            expr.valueExpr ? {valueExpr: expr.valueExpr} : {}
        )
      ]),
      matched
    )
  }
}

export const RegexpModule: ValidatorRegexModule = {
  name: "eval-threaded-nerr",
  description: "emulation of regular expression engine with error permutations",

  /* compile - compile regular expression and index triple constraints
   */
  compile: (_schema: ShExJ.Schema, shape: ShExJ.Shape, index: SchemaIndex): ValidatorRegexEngine => {
    return new EvalThreadedNErrRegexEngine(shape, index); // not called if there's no expression
  }
}

interface GroupAttrs {
  min?: number,
  max?: number,
  semActs?: ShExJ.SemAct[];
  annotations?: ShExJ.Annotation[];
}

interface TripleTestedErrors {
  triple: RdfJsQuad;
  tested: TestedTriple;
  semActErrors: any;
}

class EvalThreadedNErrRegexEngine implements ValidatorRegexEngine {
  public outerExpression: ShExJ.tripleExprOrRef;
  constructor(
      public shape: ShExJ.Shape,
      public index: SchemaIndex,
  ) {
    this.outerExpression = shape.expression!;
  }

  match (node: RdfJsTerm, constraintToTripleMapping: ConstraintToTripleResults,
         semActHandler: SemActDispatcher, _trace: object[] | null): shapeExprTest {
    const allTriples = constraintToTripleMapping.reduce<Set<RdfJsQuad>>(
        (allTriples, _tripleConstraint, tripleResult) => {
            tripleResult.forEach(res => allTriples.add(res.triple));
            return allTriples;
          }, new Set())

    const startingThread = new RegexpThread();
    const ret = this.matchTripleExpression(this.outerExpression, startingThread, constraintToTripleMapping, semActHandler);
    // console.log(JSON.stringify(ret));
    // note: don't return if ret.length === 1 because it might fail the unmatchedTriples test.
    const longerChosen =
        ret.reduce<RegexpThread | null>((ret, elt) => {
          if (elt.errors.length > 0)
            return ret;              // early return
          const unmatchedTriples = new Set<RdfJsQuad>(allTriples);

          // Removed triples matched in this thread.
          elt.matched.forEach(m => {
            m.triples.forEach(t => {
              unmatchedTriples.delete(t);
            });
          });
          // Remaining triples are unaccounted for.
          unmatchedTriples.forEach(t => { // TODO: for in -ify
            elt.errors.push({
              type: "ExcessTripleViolation",
              triple: t,
            });
          });
          return ret !== null ? ret : // keep first solution
              // Accept thread with no unmatched triples.
              unmatchedTriples.size > 0 ? null : elt;
        }, null);

    if (longerChosen !== null) {
      let fromValidationPoint: tripleExprSolutions = longerChosen.expression!;
      if (this.shape.semActs !== undefined)
        fromValidationPoint.semActs = this.shape.semActs;
      return fromValidationPoint;
    } else {
      return ret.length > 1 ? {
        type: "PossibleErrors",
        errors: ret.reduce<error[]>((all, e) => {
          return all.concat([e.errors]);
        }, [])
      } : {
        type: "Failure",
        node: node,
        errors: ret[0].errors
      };

    }
  }

  matchTripleExpression (expr: ShExJ.tripleExprOrRef, thread: RegexpThread,
                         constraintToTripleMapping: ConstraintToTripleResults,
                         semActHandler: SemActDispatcher): RegexpThread[] {
    if (typeof expr === "string") { // Inclusion
      const included = this.index.tripleExprs[expr];
      return this.matchTripleExpression(included, thread, constraintToTripleMapping, semActHandler);
    }

    let min = expr.min !== undefined ? expr.min : 1;
    let max = expr.max !== undefined ? expr.max === UNBOUNDED ? Infinity : expr.max : 1;

    switch (expr.type) {
      case "OneOf":
        return this.matchOneOf(expr, min, max, thread, constraintToTripleMapping, semActHandler);
      case "EachOf":
        return this.matchEachOf(expr, min, max, thread, constraintToTripleMapping, semActHandler);
      case "TripleConstraint":
        return this.matchTripleConstraint(expr, min, max, thread, constraintToTripleMapping, semActHandler);
      default:
        throw Error("how'd we get here?")
    }
  }

  matchOneOf (oneOf: ShExJ.OneOf, min: number, max: number,
              thread: RegexpThread, constraintToTripleMapping: ConstraintToTripleResults,
              semActHandler: SemActDispatcher): RegexpThread[] {
    return EvalThreadedNErrRegexEngine.matchRepeat(oneOf, min, max, thread, "OneOfSolutions", (th) => {
      // const accept = null;
      const matched: RegexpThread[] = [];
      const failed: RegexpThread[] = [];
      for (const nested of oneOf.expressions) {
        const thcopy = new RegexpThread(
          new Map(th.avail),
          th.errors,
          th.matched //.slice() ever needed??
        );
        const sub = this.matchTripleExpression(nested, thcopy, constraintToTripleMapping, semActHandler);
        if (sub[0].errors.length === 0) { // all subs pass or all fail
          Array.prototype.push.apply(matched, sub);
          sub.forEach(newThread => {
            const expressions =
                thcopy.solution !== undefined ? thcopy.solution.expressions : [];
            if (newThread.expression !== undefined) // undefined for no matches on min card:0
              expressions.push(newThread.expression as groupSolutions);
            delete newThread.expression;
            newThread.solution = {
              type: "OneOfSolution",
              expressions: expressions
            };
          });
        } else
          Array.prototype.push.apply(failed, sub);
      }
      return matched.length > 0 ? matched : failed;
    }, semActHandler);
  }

  matchEachOf (expr: ShExJ.EachOf, min: number, max: number,
               thread: RegexpThread, constraintToTripleMapping: ConstraintToTripleResults,
               semActHandler: SemActDispatcher): RegexpThread[] {
    return EvalThreadedNErrRegexEngine.homogenize(EvalThreadedNErrRegexEngine.matchRepeat(expr, min, max, thread, "EachOfSolutions", (th) => {
      // Iterate through nested expressions, exprThreads starts as [th].
      return expr.expressions.reduce((exprThreads, nested) => {

        // Iterate through current thread list composing nextThreads.
        // Consider e.g.
        // <S1> { <p1> . | <p2> .; <p3> . } / { <x> <p2> 2; <p3> 3 } (should pass)
        // <S1> { <p1> .; <p2> . }          / { <s1> <p1> 1 }        (should fail)
        return EvalThreadedNErrRegexEngine.homogenize(exprThreads.reduce<RegexpThread[]>((nextThreads, exprThread) => {

          const sub = this.matchTripleExpression(nested, exprThread, constraintToTripleMapping, semActHandler);
          // Move newThread.expression into a hierarchical solution structure.
          sub.forEach(newThread => {
            if (newThread.errors.length === 0) {
              const expressions =
                  exprThread.solution !== undefined ? exprThread.solution.expressions.slice() : [];
              if (newThread.expression !== undefined) // undefined for no matches on min card:0
                expressions.push(newThread.expression as groupSolutions);
              delete newThread.expression;
              newThread.solution = {
                type: "EachOfSolution",
                expressions: expressions // exprThread.expression + newThread.expression
              };
            }
          });
          return nextThreads.concat(sub);
        }, []));
      }, [th]);
    }, semActHandler));
  }

  // Early return in case of insufficient matching triples
  matchTripleConstraint (constraint: ShExJ.TripleConstraint, min: number, max: number,
                         thread: RegexpThread, constraintToTripleMapping: ConstraintToTripleResults,
                         semActHandler: SemActDispatcher): RegexpThread[] {
    if (thread.avail.get(constraint) === undefined)
      thread.avail.set(constraint, constraintToTripleMapping.get(constraint)!.map(pair => pair.triple));
    const taken = thread.avail.get(constraint)!.splice(0, min);

    if (!(taken.length >= min)) // Early return
      return [thread.makeMissingPropertyThread(constraint, thread.matched)];

    const ret: RegexpThread[] = [];
    const minmax = {} as GroupAttrs;
    if (constraint.min !== undefined && constraint.min !== 1 || constraint.max !== undefined && constraint.max !== 1) {
      minmax.min = constraint.min;
      minmax.max = constraint.max;
    }
    if (constraint.semActs !== undefined)
      minmax.semActs = constraint.semActs;
    if (constraint.annotations !== undefined)
      minmax.annotations = constraint.annotations;
    do {
      const passFail = taken.reduce<{ pass: TripleTestedErrors[], fail: TripleTestedErrors[] }>((acc, triple) => {

        const tested = {
          type: "TestedTriple",
          subject: rdfJsTerm2Ld(triple.subject),
          predicate: rdfJsTerm2Ld(triple.predicate),
          object: rdfJsTerm2Ld(triple.object)
        } as TestedTriple
        const hit = constraintToTripleMapping.get(constraint)!.find(x => x.triple === triple)!;
        if (hit.res !== undefined)
          tested.referenced = hit.res;
        const semActErrors = thread.errors.concat(
            constraint.semActs !== undefined
                ? semActHandler.dispatchAll(constraint.semActs, {triples: [triple], tripleExpr: constraint}, tested)
                : []
        )
        if (semActErrors.length > 0)
          acc.fail.push(<TripleTestedErrors>{triple, tested, semActErrors})
        else
          acc.pass.push(<TripleTestedErrors>{triple, tested, semActErrors})
        return acc
      }, {pass: [], fail: []})

      // return an empty solution if min card was 0
      if (passFail.fail.length === 0) {
        // If we didn't take anything, fall back to old errors.
        // Could do something fancy here with a semAct registration for negative matches.
        const totalErrors = taken.length === 0 ? thread.errors.slice() : []
        const myThread = thread.makeResultsThread(constraint, passFail.pass, totalErrors, thread.matched, minmax)
        ret.push(myThread);
      } else {
        passFail.fail.forEach(
            f => ret.push(thread.makeResultsThread(constraint, [f], f.semActErrors, thread.matched, minmax))
        )
      }
    } while ((() => {
      if (thread.avail.get(constraint)!.length > 0 && taken.length < max) {
        // build another thread.
        taken.push(thread.avail.get(constraint)!.shift()!);
        return true;
      } else {
        // no more threads
        return false;
      }
    })());

    return ret;
  }

  /*
     * returns: list of all passing or all failing threads (no heterogeneous lists)
     */
  static matchRepeat (groupTE: ShExJ.EachOf | ShExJ.OneOf, min: number, max: number, thread: RegexpThread,
                      type: "EachOfSolutions" | "OneOfSolutions", evalGroup: (th: RegexpThread) => RegexpThread[],
                      semActHandler: SemActDispatcher): RegexpThread[] {
    let repeated = 0, errOut = false;
    let newThreads = [thread];
    const minmax = {} as GroupAttrs;
    if (groupTE.min !== undefined && groupTE.min !== 1 || groupTE.max !== undefined && groupTE.max !== 1) {
      minmax.min = groupTE.min;
      minmax.max = groupTE.max;
    }
    if (groupTE.semActs !== undefined)
      minmax.semActs = groupTE.semActs;
    if (groupTE.annotations !== undefined)
      minmax.annotations = groupTE.annotations;
    for (; repeated < max && !errOut; ++repeated) {
      let inner: RegexpThread[] = [];
      for (let t = 0; t < newThreads.length; ++t) {
        const newt = newThreads[t];
        const sub = evalGroup(newt);
        if (sub.length > 0 && sub[0].errors.length === 0) { // all subs pass or all fail
          sub.forEach(newThread => {
            const solutions: tripleExprSolution[] =
                newt.expression !== undefined ? newt.expression.solutions.slice() : [];
            if (newThread.solution !== undefined)
              solutions.push(newThread.solution);
            delete newThread.solution;
            newThread.expression = Object.assign({
              type: type,
              solutions: solutions
            }, minmax) as groupSolutions;
          });
        }
        if (sub.length === 0 /* min:0 */ || sub[0].errors.length > 0)
          return repeated < min ? sub : newThreads;
        else
          inner = inner.concat(sub);
        // newThreads.expressions.push(sub);
      }
      newThreads = inner;
    }
    if (newThreads.length > 0 && newThreads[0].errors.length === 0 && groupTE.semActs !== undefined) {
      const passes: RegexpThread[] = [];
      const failures: RegexpThread[] = [];
      for (const newThread of newThreads) {
        const ctx = {
          triples: newThread.matched.flatMap(m => m.triples),
          tripleExpr: groupTE,
        }
        const semActErrors = semActHandler.dispatchAll(groupTE.semActs, ctx, newThread)
        if (semActErrors.length === 0) {
          passes.push(newThread)
        } else {
          Array.prototype.push.apply(newThread.errors, semActErrors);
          failures.push(newThread);
        }
      }
      newThreads = passes.length > 0 ? passes : failures;
    }
    return newThreads;
  }

  static homogenize (list: RegexpThread[]): RegexpThread[] {
    return list.reduce<{ errors: boolean, l: RegexpThread[] }>((acc, elt) => {
      if (elt.errors.length === 0) {
        if (acc.errors) {
          return {errors: false, l: [elt]};
        } else {
          return {errors: false, l: acc.l.concat(elt)};
        }
      } else {
        if (acc.errors) {
          return {errors: true, l: acc.l.concat(elt)};
        } else {
          return acc;
        }
      }
    }, {errors: true, l: []}).l;
  }
}
