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
  EachOfSolutions,
  ExcessTripleViolation,
  groupSolution,
  groupSolutions,
  MissingProperty,
  OneOfSolution,
  OneOfSolutions,
  Recursion,
  SemActFailure,
  shapeExprTest,
  TestedTriple,
  TripleConstraintSolutions,
  tripleExprSolutions
} from "@shexjs/term/shexv";

export {};

type ConstraintToTriples = Map<ShExJ.TripleConstraint, RdfJsQuad[]>; // TODO: prefer MapArray<>?

enum ControlType {
  Split, Rept, Match
}

class StackEntry {
  public i: number | null;
  constructor(
      public c: ShExJ.EachOf | ShExJ.OneOf,
      public e: number,
  ) { this.i = null; }
}

class RegExpState {
  protected constructor(
      public outs: number[],
  ) {}
}
class TripleConstraintState extends RegExpState {
  c: ShExJ.TripleConstraint;
  expr: ShExJ.EachOf | ShExJ.OneOf | undefined;
  stack: StackEntry[];
  constructor(
      c: ShExJ.TripleConstraint,
      outs: number[],
      stack: StackEntry[],
  ) {
    super(outs);
    this.c = c;
    this.stack = stack;
  }
}

class ControlState extends RegExpState {}
class SplitState extends ControlState {
  constructor(
      public c: ControlType.Split,
      outs: number[],
      public expr: ShExJ.EachOf | ShExJ.OneOf,
  ) {
    super(outs);
  }
}
class ReptState extends ControlState {
  // cache min/max in normalized form for simplicity of comparison.
  public min: number;
  public max: number;
  constructor(
      public c: ControlType.Rept,
      outs: number[],
      public expr: ShExJ.EachOf | ShExJ.OneOf,
  ) {
    super(outs);
    this.min = expr.min === undefined ? 1 : expr.min;
    this.max = expr.max === undefined
        ? 1
        : expr.max === UNBOUNDED
            ? Infinity
            : expr.max;
  }
}
class MatchState extends ControlState {
  constructor(
      public c: ControlType.Match
  ) {
    super([]);
  }
}

class RegExpPair {
  constructor(
      public start: number,
      public tail: number[],
  ) {}
}

const UNBOUNDED = -1;

export const RegexpModule: ValidatorRegexModule = {
  name: "eval-simple-1err",
  description: "simple regular expression engine with n out states",

  /* compile - compile regular expression and index triple constraints
   */
  compile: (_schema: ShExJ.Schema, shape: ShExJ.Shape, index: SchemaIndex): ValidatorRegexEngine => {
    const expression = shape.expression;
    return NFA();

    function NFA() {
      // wrapper for states, startNo and matchstate
      const states: RegExpState[] = [];
      const matchstate = addState(new MatchState(ControlType.Match));
      let startNo = matchstate;
      let pair;
      if (expression) {
        const pair = walkExpr(expression, []);
        patch(pair.tail, matchstate);
        startNo = pair.start;
      }
      return new EvalSimple1ErrRegexEngine(shape, states, startNo, matchstate);

      function maybeAddRept(expr: ShExJ.EachOf | ShExJ.OneOf, start: number, tail: number[]): RegExpPair {
        if ((expr.min == undefined || expr.min === 1) &&
            (expr.max == undefined || expr.max === 1))
          return new RegExpPair(start, tail)
        const s = addState(new ReptState(ControlType.Rept, [start], expr));
        patch(tail, s);
        return new RegExpPair(s, [s])
      }

      function walkExpr(expr: ShExJ.tripleExprOrRef, stack: StackEntry[]): RegExpPair {
        let s: number, starts: number[];
        let lastTail: number[];

        if (typeof expr === "string") { // Inclusion
          const included = index.tripleExprs[expr];
          return walkExpr(included, stack);
        } else {
          switch (expr.type) {
            case "TripleConstraint":
              s = addState(new TripleConstraintState(expr, [], stack));
              return new RegExpPair(s, [s]);
            case "OneOf":
              lastTail = [];
              starts = [];
              expr.expressions.forEach(function (nested, ord) {
                pair = walkExpr(nested, stack.concat([new StackEntry(expr, ord)]));
                starts.push(pair.start);
                lastTail = lastTail.concat(pair.tail);
              });
              s = addState(new SplitState(ControlType.Split, starts, expr));
              return maybeAddRept(expr, s, lastTail);
            case "EachOf":
              expr.expressions.forEach(function (nested, ord) {
                pair = walkExpr(nested, stack.concat([new StackEntry(expr, ord)]));
                if (ord === 0)
                  s = pair.start;
                else
                  patch(lastTail, pair.start);
                lastTail = pair.tail;
              });
              return maybeAddRept(expr, s!, lastTail!); // ShExJ says that EachOf has at least two expressions
          }
        }
      }

      function addState(state: RegExpState): number {
        const ret = states.length;
        states.push(state);
        return ret;
      }

      function patch(l: number[], target: number) {
        l.forEach(elt => {
          states[elt].outs.push(target);
        });
      }
    }
  }
}

/**
 * debugging tool; lots of ts-ignores
 */
class NfaToString {
  public known: {
    OneOf: ShExJ.tripleExpr[],
    EachOf: ShExJ.tripleExpr[]
  } = {OneOf: [], EachOf: []};

  dumpTripleConstraint (tc: ShExJ.TripleConstraint) {
    return "<" + tc.predicate + ">";
  }

  card (obj: RegExpState) {
    let x = "";
    if ("min" in obj)
        // @ts-ignore
      x += obj.min;
    if ("max" in obj)
        // @ts-ignore
      x += "," + obj.max;
    return x ? "{" + x + "}" : "";
  }

  junct (j: string | ShExJ.tripleExpr) { // string.type is undefined so this works in js
    // @ts-ignore
    let id = known[j.type].indexOf(j);
    if (id === -1) { // @ts-ignore
      id = known[j.type].push(j) - 1;
    }
    // @ts-ignore
    return j.type + id; // + card(j);
  }

  public dumpStackElt (elt: StackEntry) {
    return this.junct(elt.c) + "." + elt.e + ("i" in elt ? "[" + elt.i + "]" : "");
  }

  public dumpStack (stack: StackEntry[]) {
    return stack.map(elt => {
      return this.dumpStackElt(elt);
    }).join("/");
  }

  public dumpNFA (states: RegExpState[], startNo: number) {
    return states.map((s, i) => {
      return (i === startNo
                  ? s instanceof MatchState
                      ? "."
                      : "S"
                  : s instanceof MatchState
                      ? "E"
                      : " "
          )
          + i + " " + (
              s instanceof SplitState
                  ? ("Split-" + this.junct(s.expr))
                  : s instanceof ReptState
                      ? ("Rept-" + this.junct(s.expr))
                      : s instanceof MatchState
                          ? "Match"
                          : this.dumpTripleConstraint((s as TripleConstraintState).c as ShExJ.TripleConstraint)
          )
          + this.card(s) + "→" + s.outs!.join(" | ") + (
              "stack" in s
                  ? this.dumpStack((s as TripleConstraintState).stack)
                  : ""
          );
    }).join("\n");
  }

  public dumpMatched (matched: TriplesMatch[]) {
    return matched.map(m => {
      return this.dumpTripleConstraint(m.c) + "[" + m.triples.join(",") + "]" + this.dumpStack(m.stack);
    }).join(",");
  }

  public dumpThread (thread: RegExpThread) {
    return "S" + thread.state + ":" + Object.keys(thread.repeats).map(k => {
      return k + "×" + thread.repeats[k];
    }).join(",") + " " + this.dumpMatched(thread.matched);
  }

  public dumpThreadList(list: RegExpThread[]) {
    return "[[" + list.map(thread => {
      return this.dumpThread(thread);
    }).join("\n  ") + "]]";
  }
}

interface Repeats {
  [key: string]: number;
}

class RegExpThread {
  constructor(
      public state: number = -1,
      public repeats: Repeats = {},
      public avail: ConstraintToTriples = new Map(),
      public stack = [],
      public matched: TriplesMatch[] = [],
      public errors = [],
  ) { }
}

interface TriplesMatch {
  c: ShExJ.TripleConstraint;
  triples: RdfJsQuad[];
  stack: StackEntry[];
}

class EvalSimple1ErrRegexEngine implements ValidatorRegexEngine {
  static algorithm = "rbenx"; // rename at will; only used for debugging
  private end: number;
  private readonly states: RegExpState[];
  private readonly start: number;
  private readonly shape: ShExJ.Shape;

  constructor(shape: ShExJ.Shape, states: RegExpState[], startNo: number, matchstate: number) {
    this.shape = shape;
    this.end = matchstate;
    this.states = states;
    this.start = startNo;
  }

  match(node: RdfJsTerm, constraintToTripleMapping: ConstraintToTripleResults, semActHandler: SemActDispatcher, trace: object[] | null): shapeExprTest {
    const thisEvalSimple1ErrRegexEngine = this;
    let clist: RegExpThread[] = [], nlist: RegExpThread[] = []; // list of {state:state number, repeats:stateNo->repetitionCount}
    const allTriples = constraintToTripleMapping.reduce<Set<RdfJsQuad>>((allTriples, _tripleConstraint, tripleResult) => {
      tripleResult.forEach(res => allTriples.add(res.triple));
      return allTriples;
    }, new Set())
    if (thisEvalSimple1ErrRegexEngine.states.length === 1)
      return this.matchedToResult([], constraintToTripleMapping, semActHandler);

    let chosen = null;
    // console.log(new NfaToString().dumpNFA(this.states, this.start));
    this.addstate(clist, this.start, new RegExpThread());
    while (clist.length) {
      nlist = [];
      if (trace)
        trace.push({threads: []});
      for (let threadno = 0; threadno < clist.length; ++threadno) {
        const thread = clist[threadno];
        if (thread.state === thisEvalSimple1ErrRegexEngine.end)
          continue;
        const state = thisEvalSimple1ErrRegexEngine.states[thread.state];
        const nlistlen = nlist.length;
        // may be an Accept state
        if (state instanceof TripleConstraintState) {
          const tripleConstraint = state.c;
          let min = state.c.min !== undefined ? state.c.min : 1;
          let max = state.c.max !== undefined ? state.c.max === UNBOUNDED ? Infinity : state.c.max : 1;
          if (!thread.avail.has(tripleConstraint))
            thread.avail.set(tripleConstraint, constraintToTripleMapping.get(tripleConstraint)!.map(pair => pair.triple));
          const taken = thread.avail.get(tripleConstraint)!.splice(0, max);
          if (taken.length >= min) {
            do {
              this.addStates(nlist, thread, taken);
            } while ((function () {
              if (thread.avail.get(tripleConstraint)!.length > 0 && taken.length < max) {
                taken.push(thread.avail.get(tripleConstraint)!.shift()!);
                return true; // stay in look to take more.
              } else {
                return false; // no more to take or we're already at max
              }
            })());
          }
        }
        if (trace)
          // @ts-ignore
          trace[trace.length - 1].threads.push({
            state: clist[threadno].state,
            to: nlist.slice(nlistlen).map(x => {
              return this.stateString(x.state, x.repeats);
            })
          });
      }

      if (nlist.length === 0 && chosen === null)
        return reportError(localExpect(clist, thisEvalSimple1ErrRegexEngine.states));
      const t = clist;
      clist = nlist;
      nlist = t;
      const longerChosen = clist.reduce<RegExpThread | null>((ret, elt) => {
        const matchedAll =
            elt.matched.reduce<number>((ret, m) => {
              return ret + m.triples.length; // count matched triples
            }, 0) === allTriples.size;
        return ret !== null ? ret : (elt.state === thisEvalSimple1ErrRegexEngine.end && matchedAll) ? elt : null;
      }, null)
      if (longerChosen)
        chosen = longerChosen;
    }
    if (chosen === null)
      return reportError([]);

    function reportError(_x: shapeExprTest[]) {
      return {
        type: "Failure",
        node: node,
        errors: localExpect(clist, thisEvalSimple1ErrRegexEngine.states)
      }
    }

    function localExpect(clist: RegExpThread[], states: RegExpState[]): shapeExprTest[] {
      const lastState = states[states.length - 1] as TripleConstraintState;
      return clist.reduce<shapeExprTest[]>((acc, elt) => {
        const c = (thisEvalSimple1ErrRegexEngine.states[elt.state] as TripleConstraintState).c; // Always fails on a TCState
        // if (c === ControlType.Match)
        //   return { type: "EndState999" };
        let valueExpr: ShExJ.shapeExprOrRef | null = null;
        if (typeof c.valueExpr === "string") { // ShapeRef
          valueExpr = c.valueExpr;
        } else if (c.valueExpr) {
          valueExpr = c.valueExpr;
        }
        if (elt.state !== thisEvalSimple1ErrRegexEngine.end) {
          const error: MissingProperty = {
            type: "MissingProperty",
            property: lastState.c.predicate,
          };
          if (valueExpr)
            error.valueExpr = valueExpr;
          // @ts-ignore -- Type 'MissingProperty' is not assignable to type 'shapeExprTest'?
          return acc.concat([error]);
        } else {
          const unmatchedTriples: Map<RdfJsQuad, ShExJ.TripleConstraint> = new Map();
          const threadMatches = elt.matched.reduce<Set<RdfJsQuad>>((threadMatches, eltMatched) => {
            eltMatched.triples.forEach(triple => threadMatches.add(triple))
            return threadMatches;
          }, new Set());
          const errors = Array.from(allTriples).reduce<ExcessTripleViolation[]>((errors, triple) => { // can reduce to ShExV.error
            if (!threadMatches.has(triple)) {
              const error: ExcessTripleViolation = {
                type: "ExcessTripleViolation",
                property: lastState.c.predicate, // TODO: needed?
                triple: triple,
              };
              if (valueExpr)
                error.valueExpr = valueExpr;
              errors.push(error);
            }
            return errors;
          }, [])
          return acc.concat(errors);
        }
      }, []);
    }

    // console.log("chosen:", dump.thread(chosen));
    return "errors" in chosen.matched ?
        chosen.matched :
        this.matchedToResult(chosen.matched, constraintToTripleMapping, semActHandler);
  }

  addStates (nlist: RegExpThread[], thread: RegExpThread, taken: RdfJsQuad[]) {
      const state = this.states[thread.state] as TripleConstraintState;
      // find the exprs that require repetition
      const exprs = this.states.map(x => { return x instanceof ReptState ? x.expr : null; });
      const newStack = state.stack.map(e => {
        let i = thread.repeats[exprs.indexOf(e.c)];
        if (i === undefined)
          i = 0; // expr has no repeats
        else
          i = i-1;
        return { c:e.c, e:e.e, i:i };
      });
      const withIndexes: TriplesMatch = {
        c: state.c,
        triples: taken,
        stack: newStack
      };
      thread.matched = thread.matched.concat([withIndexes]);
      state.outs.forEach(o => { // single out if NFA includes epsilons
        this.addstate(nlist, o, thread);
      });
    }

    addstate (list: RegExpThread[], stateNo: number, thread: RegExpThread, seen: string[] = []): number[] {
      const seenkey = this.stateString(stateNo, thread.repeats);
      if (seen.indexOf(seenkey) !== -1)
        return [];
      seen.push(seenkey);

      const s = this.states[stateNo];
      if (s instanceof SplitState) {
        return s.outs!.reduce<number[]>((ret, o) => {
          return ret.concat(this.addstate(list, o, thread, seen));
        }, []);
        // } else if (s.c.type === "OneOf" || s.c.type === "EachOf") { // don't need Rept
      } else if (s instanceof ReptState) {
        const ret: number[] = [];
        // matched = [matched].concat("Rept" + s.expr);
        if (!(stateNo in thread.repeats))
          thread.repeats[stateNo] = 0;
        const repetitions = thread.repeats[stateNo];
        // add(r < s.min ? outs[0] : r >= s.min && < s.max ? outs[0], outs[1] : outs[1])
        if (repetitions < s.max!)
          Array.prototype.push.apply(ret, this.addstate(list, s.outs[0], this.incrmRepeat(thread, stateNo), seen)); // outs[0] to repeat
        if (repetitions >= s.min && repetitions <= s.max)
          Array.prototype.push.apply(ret, this.addstate(list, s.outs[1], this.resetRepeat(thread, stateNo), seen)); // outs[1] when done
        return ret;
      } else {
        // if (stateNo !== rbenx.end || !thread.avail.reduce((r2, avail) => { faster if we trim early??
        //   return r2 || avail.length > 0;
        // }, false))
        return [list.push(new RegExpThread( // return [new list element index]
            stateNo,
            thread.repeats,
            thread.avail, // Experiments indicate this and it's arrays safe to reuse, but I've not thought about it.
            thread.stack,
            thread.matched,
            thread.errors
        )) - 1];
      }
    }

    resetRepeat (thread: RegExpThread, repeatedState: number): RegExpThread {
      const trimmedRepeats = Object.keys(thread.repeats).reduce<Repeats>((r, k) => {
        if (parseInt(k) !== repeatedState) // ugh, hash keys are strings
          r[k] = thread.repeats[k];
        return r;
      }, {});
      return new RegExpThread(
          thread.state/*???*/,
          trimmedRepeats,
          thread.avail, // Experiments indicate this is safe to reuse, but I've not thought about it.
          thread.stack,
          thread.matched,
          []
      );
    }

    incrmRepeat (thread: RegExpThread, repeatedState: number): RegExpThread {
      const incrmedRepeats = Object.keys(thread.repeats).reduce<Repeats>((r, k) => {
        r[k] = parseInt(k) == repeatedState ? thread.repeats[k] + 1 : thread.repeats[k];
        return r;
      }, {});
      return new RegExpThread(
        thread.state/*???*/,
        incrmedRepeats,
        [...thread.avail.keys()].reduce<ConstraintToTriples>((acc, tc) => {acc.set(tc, thread.avail.get(tc)!); return acc;}, new Map()),
        thread.stack,
        thread.matched,
        []
      );
    }

    stateString (state: number, repeats: Repeats): string {
      const rs = Object.keys(repeats).map(rpt => {
        return rpt+":"+repeats[rpt];
      }).join(",");
      return rs.length ? state + "-" + rs : ""+state;
    }

    matchedToResult(matched: TriplesMatch[], constraintToTripleMapping: ConstraintToTripleResults, semActHandler: SemActDispatcher): tripleExprSolutions | SemActFailure {
      let last: StackEntry[] = [];
      const errors: SemActFailure[] = [];
      const skips: ((tripleExprSolutions | null)[])[] = [];
      const ret = matched.reduce<tripleExprSolutions>((out, m) => {

        let mis = 0;
        let ptr = out;
        while (mis < last.length &&
               m.stack[mis].c === last[mis].c && // constraint
               m.stack[mis].i === last[mis].i && // iteration number
               m.stack[mis].e === last[mis].e) { // (dis|con)junction number
          ptr = (ptr.solutions[last[mis].i!] as (EachOfSolution | OneOfSolution)).expressions[last[mis].e];
          ++mis;
        }
        while (mis < m.stack.length) {
          if (mis >= last.length) {
            last.push({} as StackEntry); // to be filled in below
          }
          let xOfSolns: groupSolution[];
          if (m.stack[mis].c !== last[mis].c) {
            const t: groupSolution[] = [];
            ptr.type = m.stack[mis].c.type === "EachOf" ? "EachOfSolutions" : "OneOfSolutions";
            (ptr as EachOfSolutions).solutions = t as EachOfSolution[]; // arbitrary down cast
            if ("min" in m.stack[mis].c)
              ptr.min = m.stack[mis].c.min;
            if ("max" in m.stack[mis].c)
              ptr.max = m.stack[mis].c.max;
            if ("annotations" in m.stack[mis].c)
              ptr.annotations = m.stack[mis].c.annotations;
            if ("semActs" in m.stack[mis].c)
              ptr.semActs = m.stack[mis].c.semActs;
            xOfSolns = t;
            last[mis].i = null;
            // !!! on the way out to call after valueExpr test
            if ("semActs" in m.stack[mis].c) {
              const ctx = {
                triples: constraintToTripleMapping.get(m.c)!
                  .map(m => m.triple),
                tripleExpr: m.c
              };
              const errors = semActHandler.dispatchAll(m.stack[mis].c.semActs, ctx, ptr);
              if (errors.length)
                throw errors;
            }
            // if (ret && "semActs" in expr) { ret.semActs = expr.semActs; }
          } else {
            xOfSolns = ptr.solutions as groupSolution[];
          }
          let texprSolns: tripleExprSolutions[];
          if (m.stack[mis].i !== last[mis].i) {
            const t: tripleExprSolutions[] = [];
            xOfSolns[m.stack[mis].i!] = {
              type: m.stack[mis].c.type === "EachOf" ? "EachOfSolution" : "OneOfSolution",
              expressions: t as groupSolutions[]
            };
            texprSolns = t;
            last[mis].e = -1; // trigger m.stack[mis].e !== last[mis].e below
          } else {
            texprSolns = (xOfSolns[last[mis].i!] as EachOfSolution).expressions;
          }
          if (m.stack[mis].e !== last[mis].e) {
            const t = {} as TripleConstraintSolutions;
            texprSolns[m.stack[mis].e] = t;
            if (m.stack[mis].e > 0 && texprSolns[m.stack[mis].e - 1] === undefined && skips.indexOf(texprSolns) === -1)
              skips.push(texprSolns);
            ptr = t;
            last.length = mis + 1; // chop off last so we create everything underneath
          } else {
            throw "how'd we get here?"
            // ptr = texprSolns[last[mis].e];
          }
          ++mis;
        }
        const tcSolns = ptr as TripleConstraintSolutions;
        tcSolns.type = "TripleConstraintSolutions";
        if ("min" in m.c)
          tcSolns.min = m.c.min;
        if ("max" in m.c)
          tcSolns.max = m.c.max;
        tcSolns.predicate = m.c.predicate;
        if ("valueExpr" in m.c)
          tcSolns.valueExpr = m.c.valueExpr;
        if ("id" in m.c)
          tcSolns.productionLabel = m.c.id;
        tcSolns.solutions = m.triples.reduce<TestedTriple[]>((acc, triple) => {

          const ret = {
            type: "TestedTriple",
            subject: rdfJsTerm2Ld(triple.subject),
            predicate: rdfJsTerm2Ld(triple.predicate),
            object: rdfJsTerm2Ld(triple.object)
          } as TestedTriple;

          const hit = constraintToTripleMapping.get(m.c)!.find(x => x.triple === triple);
          if (hit!.res && Object.keys(hit!.res).length > 0)
            ret.referenced = hit!.res as shapeExprTest | Recursion;
          if (errors.length === 0 && "semActs" in m.c) {
            Array.prototype.push.apply(errors, semActHandler.dispatchAll(m.c.semActs, {triples:[triple], tripleExpr: m.c}, ret));
          }
          return acc.concat(ret);
        }, [])
        if ("annotations" in m.c)
          tcSolns.annotations = m.c.annotations;
        if ("semActs" in m.c)
          tcSolns.semActs = m.c.semActs;
        last = m.stack.slice();
        return out;
      }, {} as tripleExprSolutions);

      if (errors.length)
        return {
          type: "SemActFailure",
          errors: errors
        };

      // Clear out the nulls for the expressions with min:0 and no matches.
      // <S> { (:p .; :q .)?; :r . } \ { <s> :r 1 } -> i:0, e:1 resulting in null at e=0
      // Maybe we want these nulls in expressions[] to make it clear that there are holes?
      skips.forEach(skip => {
        for (let exprNo = 0; exprNo < skip.length; ++exprNo)
          if (skip[exprNo] === null || skip[exprNo] === undefined)
            skip.splice(exprNo--, 1);
      });

      if ("semActs" in this.shape)
        ret.semActs = this.shape.semActs;
      return ret;
    }
  }
