"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegexpModule = void 0;
const term_1 = require("@shexjs/term");
var ControlType;
(function (ControlType) {
    ControlType[ControlType["Split"] = 0] = "Split";
    ControlType[ControlType["Rept"] = 1] = "Rept";
    ControlType[ControlType["Match"] = 2] = "Match";
})(ControlType || (ControlType = {}));
class StackEntry {
    constructor(c, e) {
        this.c = c;
        this.e = e;
        this.i = null;
    }
}
class RegExpState {
    constructor(outs) {
        this.outs = outs;
    }
}
class TripleConstraintState extends RegExpState {
    constructor(c, outs, stack) {
        super(outs);
        this.c = c;
        this.stack = stack;
    }
}
class ControlState extends RegExpState {
}
class SplitState extends ControlState {
    constructor(c, outs, expr) {
        super(outs);
        this.c = c;
        this.expr = expr;
    }
}
class ReptState extends ControlState {
    constructor(c, outs, expr) {
        super(outs);
        this.c = c;
        this.expr = expr;
        this.min = expr.min === undefined ? 1 : expr.min;
        this.max = expr.max === undefined
            ? 1
            : expr.max === UNBOUNDED
                ? Infinity
                : expr.max;
    }
}
class MatchState extends ControlState {
    constructor(c) {
        super([]);
        this.c = c;
    }
}
class RegExpPair {
    constructor(start, tail) {
        this.start = start;
        this.tail = tail;
    }
}
const UNBOUNDED = -1;
exports.RegexpModule = {
    name: "eval-simple-1err",
    description: "simple regular expression engine with n out states",
    /* compile - compile regular expression and index triple constraints
     */
    compile: (_schema, shape, index) => {
        const expression = shape.expression;
        return NFA();
        function NFA() {
            // wrapper for states, startNo and matchstate
            const states = [];
            const matchstate = addState(new MatchState(ControlType.Match));
            let startNo = matchstate;
            let pair;
            if (expression) {
                const pair = walkExpr(expression, []);
                patch(pair.tail, matchstate);
                startNo = pair.start;
            }
            return new EvalSimple1ErrRegexEngine(shape, states, startNo, matchstate);
            function maybeAddRept(expr, start, tail) {
                if ((expr.min == undefined || expr.min === 1) &&
                    (expr.max == undefined || expr.max === 1))
                    return new RegExpPair(start, tail);
                const s = addState(new ReptState(ControlType.Rept, [start], expr));
                patch(tail, s);
                return new RegExpPair(s, [s]);
            }
            function walkExpr(expr, stack) {
                let s, starts;
                let lastTail;
                if (typeof expr === "string") { // Inclusion
                    const included = index.tripleExprs[expr];
                    return walkExpr(included, stack);
                }
                else {
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
                            return maybeAddRept(expr, s, lastTail); // ShExJ says that EachOf has at least two expressions
                    }
                }
            }
            function addState(state) {
                const ret = states.length;
                states.push(state);
                return ret;
            }
            function patch(l, target) {
                l.forEach(elt => {
                    states[elt].outs.push(target);
                });
            }
        }
    }
};
/**
 * debugging tool; lots of ts-ignores
 */
class NfaToString {
    constructor() {
        this.known = { OneOf: [], EachOf: [] };
    }
    dumpTripleConstraint(tc) {
        return "<" + tc.predicate + ">";
    }
    card(obj) {
        let x = "";
        if ("min" in obj)
            // @ts-ignore
            x += obj.min;
        if ("max" in obj)
            // @ts-ignore
            x += "," + obj.max;
        return x ? "{" + x + "}" : "";
    }
    junct(j) {
        // @ts-ignore
        let id = known[j.type].indexOf(j);
        if (id === -1) { // @ts-ignore
            id = known[j.type].push(j) - 1;
        }
        // @ts-ignore
        return j.type + id; // + card(j);
    }
    dumpStackElt(elt) {
        return this.junct(elt.c) + "." + elt.e + ("i" in elt ? "[" + elt.i + "]" : "");
    }
    dumpStack(stack) {
        return stack.map(elt => {
            return this.dumpStackElt(elt);
        }).join("/");
    }
    dumpNFA(states, startNo) {
        return states.map((s, i) => {
            return (i === startNo
                ? s instanceof MatchState
                    ? "."
                    : "S"
                : s instanceof MatchState
                    ? "E"
                    : " ")
                + i + " " + (s instanceof SplitState
                ? ("Split-" + this.junct(s.expr))
                : s instanceof ReptState
                    ? ("Rept-" + this.junct(s.expr))
                    : s instanceof MatchState
                        ? "Match"
                        : this.dumpTripleConstraint(s.c))
                + this.card(s) + "→" + s.outs.join(" | ") + ("stack" in s
                ? this.dumpStack(s.stack)
                : "");
        }).join("\n");
    }
    dumpMatched(matched) {
        return matched.map(m => {
            return this.dumpTripleConstraint(m.c) + "[" + m.triples.join(",") + "]" + this.dumpStack(m.stack);
        }).join(",");
    }
    dumpThread(thread) {
        return "S" + thread.state + ":" + Object.keys(thread.repeats).map(k => {
            return k + "×" + thread.repeats[k];
        }).join(",") + " " + this.dumpMatched(thread.matched);
    }
    dumpThreadList(list) {
        return "[[" + list.map(thread => {
            return this.dumpThread(thread);
        }).join("\n  ") + "]]";
    }
}
class RegExpThread {
    constructor(state = -1, repeats = {}, avail = new Map(), stack = [], matched = [], errors = []) {
        this.state = state;
        this.repeats = repeats;
        this.avail = avail;
        this.stack = stack;
        this.matched = matched;
        this.errors = errors;
    }
}
class EvalSimple1ErrRegexEngine {
    constructor(shape, states, startNo, matchstate) {
        this.shape = shape;
        this.end = matchstate;
        this.states = states;
        this.start = startNo;
    }
    match(node, constraintToTripleMapping, semActHandler, trace) {
        const thisEvalSimple1ErrRegexEngine = this;
        let clist = [], nlist = []; // list of {state:state number, repeats:stateNo->repetitionCount}
        const allTriples = constraintToTripleMapping.reduce((allTriples, _tripleConstraint, tripleResult) => {
            tripleResult.forEach(res => allTriples.add(res.triple));
            return allTriples;
        }, new Set());
        if (thisEvalSimple1ErrRegexEngine.states.length === 1)
            return this.matchedToResult([], constraintToTripleMapping, semActHandler);
        let chosen = null;
        // console.log(new NfaToString().dumpNFA(this.states, this.start));
        this.addstate(clist, this.start, new RegExpThread());
        while (clist.length) {
            nlist = [];
            if (trace)
                trace.push({ threads: [] });
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
                        thread.avail.set(tripleConstraint, constraintToTripleMapping.get(tripleConstraint).map(pair => pair.triple));
                    const taken = thread.avail.get(tripleConstraint).splice(0, max);
                    if (taken.length >= min) {
                        do {
                            this.addStates(nlist, thread, taken);
                        } while ((function () {
                            if (thread.avail.get(tripleConstraint).length > 0 && taken.length < max) {
                                taken.push(thread.avail.get(tripleConstraint).shift());
                                return true; // stay in look to take more.
                            }
                            else {
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
            const longerChosen = clist.reduce((ret, elt) => {
                const matchedAll = elt.matched.reduce((ret, m) => {
                    return ret + m.triples.length; // count matched triples
                }, 0) === allTriples.size;
                return ret !== null ? ret : (elt.state === thisEvalSimple1ErrRegexEngine.end && matchedAll) ? elt : null;
            }, null);
            if (longerChosen)
                chosen = longerChosen;
        }
        if (chosen === null)
            return reportError([]);
        function reportError(_x) {
            return {
                type: "Failure",
                node: node,
                errors: localExpect(clist, thisEvalSimple1ErrRegexEngine.states)
            };
        }
        function localExpect(clist, states) {
            const lastState = states[states.length - 1];
            return clist.reduce((acc, elt) => {
                const c = thisEvalSimple1ErrRegexEngine.states[elt.state].c; // Always fails on a TCState
                // if (c === ControlType.Match)
                //   return { type: "EndState999" };
                let valueExpr = null;
                if (typeof c.valueExpr === "string") { // ShapeRef
                    valueExpr = c.valueExpr;
                }
                else if (c.valueExpr) {
                    valueExpr = c.valueExpr;
                }
                if (elt.state !== thisEvalSimple1ErrRegexEngine.end) {
                    const error = {
                        type: "MissingProperty",
                        property: lastState.c.predicate,
                    };
                    if (valueExpr)
                        error.valueExpr = valueExpr;
                    // @ts-ignore -- Type 'MissingProperty' is not assignable to type 'shapeExprTest'?
                    return acc.concat([error]);
                }
                else {
                    const unmatchedTriples = new Map();
                    const threadMatches = elt.matched.reduce((threadMatches, eltMatched) => {
                        eltMatched.triples.forEach(triple => threadMatches.add(triple));
                        return threadMatches;
                    }, new Set());
                    const errors = Array.from(allTriples).reduce((errors, triple) => {
                        if (!threadMatches.has(triple)) {
                            const error = {
                                type: "ExcessTripleViolation",
                                property: lastState.c.predicate,
                                triple: triple,
                            };
                            if (valueExpr)
                                error.valueExpr = valueExpr;
                            errors.push(error);
                        }
                        return errors;
                    }, []);
                    return acc.concat(errors);
                }
            }, []);
        }
        // console.log("chosen:", dump.thread(chosen));
        return "errors" in chosen.matched ?
            chosen.matched :
            this.matchedToResult(chosen.matched, constraintToTripleMapping, semActHandler);
    }
    addStates(nlist, thread, taken) {
        const state = this.states[thread.state];
        // find the exprs that require repetition
        const exprs = this.states.map(x => { return x instanceof ReptState ? x.expr : null; });
        const newStack = state.stack.map(e => {
            let i = thread.repeats[exprs.indexOf(e.c)];
            if (i === undefined)
                i = 0; // expr has no repeats
            else
                i = i - 1;
            return { c: e.c, e: e.e, i: i };
        });
        const withIndexes = {
            c: state.c,
            triples: taken,
            stack: newStack
        };
        thread.matched = thread.matched.concat([withIndexes]);
        state.outs.forEach(o => {
            this.addstate(nlist, o, thread);
        });
    }
    addstate(list, stateNo, thread, seen = []) {
        const seenkey = this.stateString(stateNo, thread.repeats);
        if (seen.indexOf(seenkey) !== -1)
            return [];
        seen.push(seenkey);
        const s = this.states[stateNo];
        if (s instanceof SplitState) {
            return s.outs.reduce((ret, o) => {
                return ret.concat(this.addstate(list, o, thread, seen));
            }, []);
            // } else if (s.c.type === "OneOf" || s.c.type === "EachOf") { // don't need Rept
        }
        else if (s instanceof ReptState) {
            const ret = [];
            // matched = [matched].concat("Rept" + s.expr);
            if (!(stateNo in thread.repeats))
                thread.repeats[stateNo] = 0;
            const repetitions = thread.repeats[stateNo];
            // add(r < s.min ? outs[0] : r >= s.min && < s.max ? outs[0], outs[1] : outs[1])
            if (repetitions < s.max)
                Array.prototype.push.apply(ret, this.addstate(list, s.outs[0], this.incrmRepeat(thread, stateNo), seen)); // outs[0] to repeat
            if (repetitions >= s.min && repetitions <= s.max)
                Array.prototype.push.apply(ret, this.addstate(list, s.outs[1], this.resetRepeat(thread, stateNo), seen)); // outs[1] when done
            return ret;
        }
        else {
            // if (stateNo !== rbenx.end || !thread.avail.reduce((r2, avail) => { faster if we trim early??
            //   return r2 || avail.length > 0;
            // }, false))
            return [list.push(new RegExpThread(// return [new list element index]
                stateNo, thread.repeats, thread.avail, // Experiments indicate this and it's arrays safe to reuse, but I've not thought about it.
                thread.stack, thread.matched, thread.errors)) - 1];
        }
    }
    resetRepeat(thread, repeatedState) {
        const trimmedRepeats = Object.keys(thread.repeats).reduce((r, k) => {
            if (parseInt(k) !== repeatedState) // ugh, hash keys are strings
                r[k] = thread.repeats[k];
            return r;
        }, {});
        return new RegExpThread(thread.state /*???*/, trimmedRepeats, thread.avail, // Experiments indicate this is safe to reuse, but I've not thought about it.
        thread.stack, thread.matched, []);
    }
    incrmRepeat(thread, repeatedState) {
        const incrmedRepeats = Object.keys(thread.repeats).reduce((r, k) => {
            r[k] = parseInt(k) == repeatedState ? thread.repeats[k] + 1 : thread.repeats[k];
            return r;
        }, {});
        return new RegExpThread(thread.state /*???*/, incrmedRepeats, [...thread.avail.keys()].reduce((acc, tc) => { acc.set(tc, thread.avail.get(tc)); return acc; }, new Map()), thread.stack, thread.matched, []);
    }
    stateString(state, repeats) {
        const rs = Object.keys(repeats).map(rpt => {
            return rpt + ":" + repeats[rpt];
        }).join(",");
        return rs.length ? state + "-" + rs : "" + state;
    }
    matchedToResult(matched, constraintToTripleMapping, semActHandler) {
        let last = [];
        const errors = [];
        const skips = [];
        const ret = matched.reduce((out, m) => {
            let mis = 0;
            let ptr = out;
            while (mis < last.length &&
                m.stack[mis].c === last[mis].c && // constraint
                m.stack[mis].i === last[mis].i && // iteration number
                m.stack[mis].e === last[mis].e) { // (dis|con)junction number
                ptr = ptr.solutions[last[mis].i].expressions[last[mis].e];
                ++mis;
            }
            while (mis < m.stack.length) {
                if (mis >= last.length) {
                    last.push({}); // to be filled in below
                }
                let xOfSolns;
                if (m.stack[mis].c !== last[mis].c) {
                    const t = [];
                    ptr.type = m.stack[mis].c.type === "EachOf" ? "EachOfSolutions" : "OneOfSolutions";
                    ptr.solutions = t; // arbitrary down cast
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
                            triples: constraintToTripleMapping.get(m.c)
                                .map(m => m.triple),
                            tripleExpr: m.c
                        };
                        const errors = semActHandler.dispatchAll(m.stack[mis].c.semActs, ctx, ptr);
                        if (errors.length)
                            throw errors;
                    }
                    // if (ret && "semActs" in expr) { ret.semActs = expr.semActs; }
                }
                else {
                    xOfSolns = ptr.solutions;
                }
                let texprSolns;
                if (m.stack[mis].i !== last[mis].i) {
                    const t = [];
                    xOfSolns[m.stack[mis].i] = {
                        type: m.stack[mis].c.type === "EachOf" ? "EachOfSolution" : "OneOfSolution",
                        expressions: t
                    };
                    texprSolns = t;
                    last[mis].e = -1; // trigger m.stack[mis].e !== last[mis].e below
                }
                else {
                    texprSolns = xOfSolns[last[mis].i].expressions;
                }
                if (m.stack[mis].e !== last[mis].e) {
                    const t = {};
                    texprSolns[m.stack[mis].e] = t;
                    if (m.stack[mis].e > 0 && texprSolns[m.stack[mis].e - 1] === undefined && skips.indexOf(texprSolns) === -1)
                        skips.push(texprSolns);
                    ptr = t;
                    last.length = mis + 1; // chop off last so we create everything underneath
                }
                else {
                    throw "how'd we get here?";
                    // ptr = texprSolns[last[mis].e];
                }
                ++mis;
            }
            const tcSolns = ptr;
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
            tcSolns.solutions = m.triples.reduce((acc, triple) => {
                const ret = {
                    type: "TestedTriple",
                    subject: (0, term_1.rdfJsTerm2Ld)(triple.subject),
                    predicate: (0, term_1.rdfJsTerm2Ld)(triple.predicate),
                    object: (0, term_1.rdfJsTerm2Ld)(triple.object)
                };
                const hit = constraintToTripleMapping.get(m.c).find(x => x.triple === triple);
                if (hit.res && Object.keys(hit.res).length > 0)
                    ret.referenced = hit.res;
                if (errors.length === 0 && "semActs" in m.c) {
                    Array.prototype.push.apply(errors, semActHandler.dispatchAll(m.c.semActs, { triples: [triple], tripleExpr: m.c }, ret));
                }
                return acc.concat(ret);
            }, []);
            if ("annotations" in m.c)
                tcSolns.annotations = m.c.annotations;
            if ("semActs" in m.c)
                tcSolns.semActs = m.c.semActs;
            last = m.stack.slice();
            return out;
        }, {});
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
EvalSimple1ErrRegexEngine.algorithm = "rbenx"; // rename at will; only used for debugging
//# sourceMappingURL=eval-simple-1err.js.map