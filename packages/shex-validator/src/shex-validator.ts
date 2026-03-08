/* ShExValidator - javascript module to validate a graph with respect to Shape Expressions
 */

// interface constants
import * as ShExTerm from "@shexjs/term";
import {InternalSchema, rdfJsTerm2Ld, SchemaIndex, ShapeMap, ShapeMapEntry} from "@shexjs/term";
import {
  QueryTracker,
  SemActDispatcher,
  SemActHandler,
  T2TcPartition,
  ValidatorRegexEngine,
  ValidatorRegexModule,
  MapArray,
  ConstraintToTripleResults, TripleResult
} from "@shexjs/eval-validator-api";
import * as Hierarchy from 'hierarchy-closure';
import type {Quad, Term as RdfJsTerm} from '@rdfjs/types';
import {Neighborhood, NeighborhoodDb, Start as NeighborhoodStart} from "@shexjs/neighborhood-api";
import {
  error,
  Failure,
  FailureList,
  NestedFailure,
  NodeConstraintTest,
  NodeConstraintViolation,
  Recursion,
  SemActFailure,
  ShapeAndFailure,
  shapeExprTest,
  ShapeNotFailure,
  ShapeNotResults,
  ShapeAndResults,
  ShapeTest,
  SolutionList,
} from "@shexjs/term/shexv";
import * as ShExJ from "shexj";
import {
  EachOf,
  IRIREF,
  IriStem,
  IriStemRange,
  Language,
  LanguageStem,
  LanguageStemRange,
  LiteralStem,
  LiteralStemRange,
  NodeConstraint,
  ObjectLiteral,
  OneOf,
  Schema,
  Shape,
  ShapeAnd,
  ShapeDecl, shapeDeclLabel,
  shapeDeclRef,
  shapeExprOrRef,
  ShapeNot,
  ShapeOr,
  TripleConstraint,
  tripleExpr
} from "shexj";
import {getNumericDatatype, testFacets, testKnownTypes} from "./shex-xsd";
import * as RdfJs from "@rdfjs/types/data-model";
import {Literal as RdfJsLiteral} from "@rdfjs/types/data-model";
import {ShExVisitor, ShExIndexVisitor} from "@shexjs/visitor";

export {};

export const InterfaceOptions = {
  "coverage": {
    "firstError": "fail on first error (usually used with eval-simple-1err)",
    "exhaustive": "find as many errors as possible (usually used with eval-threaded-nerr)"
  }
};

const VERBOSE = false; // "VERBOSE" in process.env;
const EvalThreadedNErr = require("@shexjs/eval-threaded-nerr").RegexpModule;

interface ValidatorOptions {
  regexModule?: ValidatorRegexEngine;
  coverage?: {
    exhaustive: string;
    firstError: string;
  };
  ignoreClosed?: boolean;
  noCache?: boolean;
  semActs?: SemActCodeIndex;
  validateExtern?: (point: RdfJsTerm, shapeLabel: LabelOrStart, ctx: ShapeExprValidationContext) => shapeExprTest;
}

export interface ShExJsResultMapEntry extends ShapeMapEntry {
  status: "conformant" | "nonconformant";
  appinfo: shapeExprTest;
}

export type ShExJsResultMap = ShExJsResultMapEntry[];

interface SemActCodeIndex {
  [id: string]: string;
}

interface NeighborhoodIndex {
  byPredicate: Map<string, Quad[]>;
  // candidates: number[][];
  misses: any[];
}

class SemActDispatcherImpl implements SemActDispatcher {
  handlers: { [id: string]: SemActHandler; } = {};
  externalCode: SemActCodeIndex;
  public results: { [id: string]: string | undefined } = {};

  constructor(externalCode?: SemActCodeIndex) {
    this.externalCode = externalCode || {};
  }

  /**
   * Store a semantic action handler.
   *
   * @param {string} name - semantic action's URL.
   * @param {SemActHandler} handler - handler function.
   *
   * The handler object has a dispatch function is invoked with:
   *   code: string - text of the semantic action.
   *   ctx: object - matched triple or results subset.
   *   extensionStorage: object - place where the extension writes into the result structure.
   *   return :bool - false if the extension failed or did not accept the ctx object.
   */
  register (name: string, handler: SemActHandler) {
    this.handlers[name] = handler;
  }

  /**
   * Calls all semantic actions, allowing each to write to resultsArtifact.
   *
   * @param {ShExJ.SemAct[]} semActs - list of semantic actions to invoke.
   * @param {any} semActParm - evaluation context for SemAct.
   * @param {any} resultsArtifact - simple storage for SemAct.
   * @return {SemActFailure[]} false if any result was false.
   */
  dispatchAll (semActs: ShExJ.SemAct[], semActParm: any, resultsArtifact: any): SemActFailure[] {
    return semActs.reduce<SemActFailure[]>((ret, semAct) => {

      if (ret.length === 0 && semAct.name in this.handlers) {
        const code: string | null = ("code" in semAct ? semAct.code : this.externalCode[semAct.name]) || null;
        const existing = "extensions" in resultsArtifact && semAct.name in resultsArtifact.extensions;
        const extensionStorage = existing ? resultsArtifact.extensions[semAct.name] : {};
        const response: SemActFailure[] = this.handlers[semAct.name].dispatch(code, semActParm, extensionStorage);
        if (typeof response === 'object' && Array.isArray(response)) {
          if (response.length > 0)
            ret.push({ type: "SemActFailure", errors: response })
        } else {
          throw Error("unsupported response from semantic action handler: " + JSON.stringify(response))
        }
        if (!existing && Object.keys(extensionStorage).length > 0) {
          if (!("extensions" in resultsArtifact))
            resultsArtifact.extensions = {};
          resultsArtifact.extensions[semAct.name] = extensionStorage;
        }
        return ret;
      }
      return ret;
    }, []);
  }
}

/**
 * A QueryTracker that's all no-ops.
 */
class EmptyTracker implements QueryTracker {
  depth = 0;

  recurse(_rec: Recursion) {}
  known(_res: shapeExprTest) {}
  enter(_term: RdfJsTerm, _shapeLabel: string) { ++this.depth; }
  exit(_term: RdfJsTerm, _shapeLabel: string, _res: shapeExprTest) { --this.depth; }
}

type LabelOrStart = shapeDeclLabel | typeof NeighborhoodStart;

interface SeenIndex {
  [id: string]: { node: RdfJsTerm, shape: string };
}

interface MatchTarget {
  label: string;
  count: number;
}

interface ExtensionIndex {
  [id:string]: shapeDeclRef[]
}

interface ResList {passes: shapeExprTest[], failures: shapeExprTest[]}

export class ShapeExprValidationContext {
  constructor(
      public parent: ShapeExprValidationContext | null,
      public label: LabelOrStart, // Can only be Start if it's the root of a context list.
      public depth: number = 0,
      public tracker: QueryTracker = new EmptyTracker(),
      public seen: SeenIndex = {},
      public matchTarget: MatchTarget | null = null,
      public subGraph: NeighborhoodDb | null = null) {
  }

  public checkShapeLabel(label: LabelOrStart): ShapeExprValidationContext {
    return new ShapeExprValidationContext(this, label, this.depth + 1, this.tracker, this.seen, this.matchTarget, this.subGraph);
  }

  public followTripleConstraint(): ShapeExprValidationContext {
    return new ShapeExprValidationContext(this, this.label, this.depth + 1, this.tracker, this.seen, this.matchTarget, null);
  }

  public checkExtendsPartition(subGraph: NeighborhoodDb): ShapeExprValidationContext {
    return new ShapeExprValidationContext(this, this.label, this.depth + 1, this.tracker, this.seen, this.matchTarget, subGraph);
  }

  public checkExtendingClass(label: LabelOrStart, matchTarget: MatchTarget | null): ShapeExprValidationContext {
    return new ShapeExprValidationContext(this, label, this.depth + 1, this.tracker, this.seen, matchTarget, this.subGraph);
  }
}

interface ReferenceToExtendedShapeDecl { type: "Ref", ref: string; }
type RefOrTc = ReferenceToExtendedShapeDecl | TripleConstraint;
type RefsAndTCsForOneExtension = RefOrTc[];
type RefsAndTCsForShapesExtensions = RefsAndTCsForOneExtension[];
type ByPredicateResult = {
  t2tcErrors: T2TCErrors; // for each T, some failing constraint ??
  tc2TResults: TC2TResult; // for each TC, for each passing T, what was the result
  t2tcs: T2TCs; // for each T, which constraints does it match
};
class MapMap<A, B, T> {
  protected data: Map<A, Map<B, T>> = new Map();
  set (a:A, b:B, t:T): void {
    if (!this.data.has(a)) { this.data.set(a, new Map<B, T>()); }
    if (this.data.get(a)!.has(b)) { throw Error(`Error setting [${a}][${b}]=${t}; already has value ${this.data.get(a)!.get(b)}`); }
    this.data.get(a)!.set(b, t);
  }
  get (a:A, b:B): T {
    return this.data.get(a)!.get(b)!;
  }
}

type T2TCErrors = Map<Quad, { constraint: TripleConstraint, errors: shapeExprTest }>;
type TC2TResult = MapMap<TripleConstraint, Quad, (shapeExprTest | undefined)>;
type T2TCs = MapArray<Quad, TripleConstraint>;

type WhatsMissingResult = {
  missErrors: error[];
  matchedExtras: Quad[];
}

class TriplesMatching {
  constructor (
      public hits: TriplesMatchingHit[],
      public misses: TriplesMatchingMiss[]
  ) {}
}
class TriplesMatchingResult {
  constructor(
      public triple: Quad,
      public sub: shapeExprTest,
  ) { }
}
class TriplesMatchingHit extends TriplesMatchingResult {}
class TriplesMatchingNoValueConstraint extends TriplesMatchingResult {
  constructor(triple: Quad) {
    super(triple, undefined as any as shapeExprTest); // TODO: could weaken typing on the hits, but also weakens the misses
  }
}
class TriplesMatchingMiss extends TriplesMatchingResult {}

/**
 * Convert a ResultMap to a shapeExprTest by examining each shape association.
 * TODO: migrate to ShExUtil when ShExUtil is TS-ified
 * @param resultsMap - SolutionList or FailureList depending on whether resultsMap had some errors.
 */
export function resultMapToShapeExprTest(resultsMap: ShExJsResultMapEntry[]): shapeExprTest {
  const passFails = resultsMap.reduce<ResList>((ret, pair) => {
    const res = pair.appinfo;
    return "errors" in res
        ? {passes: ret.passes, failures: ret.failures.concat([res])}
        : {passes: ret.passes.concat([res]), failures: ret.failures};
  }, {passes: [], failures: []});
  if (passFails.failures.length > 0) {
    return passFails.failures.length !== 1
        ? {type: "FailureList", errors: passFails.failures} as FailureList
        : passFails.failures [0];
  } else {
    return passFails.passes.length !== 1
        ? {type: "SolutionList", solutions: passFails.passes} as SolutionList
        : passFails.passes [0];
  }
}

/** Directly construct a DB from triples.
 * TODO: should this be in @shexjs/neighborhood-something ?
 */
class TrivialNeighborhood implements NeighborhoodDb {
  incoming: Quad[] = [];
  outgoing: Quad[] = [];
  //@ts-ignore -- TODO: model DbTracker on QueryTracker
  private queryTracker: QueryTracker | null;

  constructor(queryTracker: QueryTracker | null) {
    this.queryTracker = queryTracker;
  }

  getTriplesByIRI(s: RdfJsTerm, p: RdfJsTerm, o: RdfJsTerm, _g?: RdfJsTerm): Quad[] {
    return this.incoming.concat(this.outgoing).filter(
        t =>
            (!s || s === t.subject) &&
            (!p || p === t.predicate) &&
            (!o || o === t.object)
    );
  }

  getNeighborhood (_point: RdfJsTerm, _shapeLabel: LabelOrStart, _shape: Shape): Neighborhood {
    return {
      outgoing: this.outgoing,
      incoming: this.incoming
    };
  }

  getSubjects (): RdfJs.Term[] { throw Error("!Triples DB can't index subjects"); }
  getPredicates (): RdfJs.Term[] { throw Error("!Triples DB can't index predicates"); }
  getObjects (): RdfJs.Term[] { throw Error("!Triples DB can't index objects"); }
  getQuads (): RdfJs.Quad[] { throw Error("!Triples DB doesn't have Quads"); }
  get size(): number { return this.incoming.length + this.outgoing.length; }
  addIncomingTriples (tz: Quad[]) { Array.prototype.push.apply(this.incoming, tz); }
  addOutgoingTriples (tz: Quad[]) { Array.prototype.push.apply(this.outgoing, tz); }
}


export class ShExValidator {
  public static readonly Start = NeighborhoodStart;
  public static readonly InterfaceOptions = InterfaceOptions;
  public static readonly type = "ShExValidator";

  public readonly options: ValidatorOptions;
  public readonly known: {
    [id: string]: shapeExprTest;
  }
  public readonly schema: InternalSchema;
  public readonly semActHandler: SemActDispatcher;
  public readonly index: SchemaIndex;
  private readonly db: NeighborhoodDb;
  private regexModule: ValidatorRegexModule;

  /* ShExValidator - construct an object for validating a schema.
   *
   * schema: a structure produced by a ShEx parser or equivalent.
   * options: object with controls for
   *   lax(true): boolean: whine about missing types in schema.
   *   diagnose(false): boolean: make validate return a structure with errors.
   */
  constructor(schema: InternalSchema, db: NeighborhoodDb, options: ValidatorOptions = {}) {
    const index: SchemaIndex = schema._index || ShExIndexVisitor.index(schema);
    if (index.labelToTcs === undefined) // make sure there's a labelToTcs in the index
      index.labelToTcs = {};
    this.index = index;

    options = options || {};
    this.options = options;
    this.known = {};

    this.schema = schema;
    this.db = db;
    // const regexModule = this.options.regexModule || require("@shexjs/eval-simple-1err");
    this.regexModule = this.options.regexModule || EvalThreadedNErr;
    this.semActHandler = new SemActDispatcherImpl(options.semActs);
  }

  /**
   * Validate each entry in a fixed ShapeMap, returning a results ShapeMap
   *
   * @param shapeMap - list of node/shape pairs to validate
   * @param tracker - optional implementation of QueryTracker to log validation
   * @param seen - optional (and discouraged) list of currently-visited node/shape associations -- may be useful for rare wizardry.
   */
  validateShapeMap (shapeMap: ShapeMap, tracker: QueryTracker = new EmptyTracker(), seen: SeenIndex = {}): ShExJsResultMap {
    return shapeMap.reduce<ShExJsResultMap>((acc, pair) => {

      // let time = +new Date();
      const res = this.validateNodeShapePair(ShExTerm.ld2RdfJsTerm(pair.node), pair.shape, tracker, seen);
      // time = +new Date() - time;
      return acc.concat([{
        node: pair.node,
        shape: pair.shape,
        status: "errors" in res ? "nonconformant" : "conformant",
        appinfo: res,
        // elapsed: time
      }]);
    }, []);
  }

  /**
   * Validate a single node as a labeled shape expression or as the Start shape
   *
   * @param focus - RdfJs Term to validate
   * @param labelOrStart - label of shapeExpr to validate focus against, or `ShExValidator.Start`.
   * @param tracker - optional implementation of QueryTracker to log validation
   * @param seen - optional (and discouraged) list of currently-visited node/shape associations -- may be useful for rare wizardry.
   */
  validateNodeShapePair (focus: RdfJsTerm, labelOrStart: LabelOrStart, tracker: QueryTracker = new EmptyTracker(), seen: SeenIndex = {}): shapeExprTest {
    const ctx = new ShapeExprValidationContext(null, labelOrStart, 0, tracker, seen, null, null,)
    if ("startActs" in this.schema) {
      const startActionStorage = {}; // !!! need test to see this write to results structure.
      const semActErrors = this.semActHandler.dispatchAll(this.schema.startActs, null, startActionStorage)
      if (semActErrors.length)
        return {
          type: "Failure",
          node: rdfJsTerm2Ld(focus),
          shape: ctx.label,
          errors: semActErrors
        }; // some semAct aborted !! return a better error
    }
    const ret: shapeExprTest = this.validateShapeLabel (focus, ctx);
    if ("startActs" in this.schema) {
      (ret as ShapeTest).startActs = this.schema.startActs;
    }
    return ret;
  }

  validateShapeLabel (focus: RdfJsTerm, ctx: ShapeExprValidationContext): shapeExprTest {
    if (typeof ctx.label !== "string") {
      if (ctx.label !== ShExValidator.Start)
        runtimeError(`unknown shape ctx.label ${JSON.stringify(ctx.label)}`);
      if (!this.schema.start)
        runtimeError("start production not defined");
      return this.validateShapeExpr(focus, this.schema.start, ctx);
    }

    const seenKey = ShExTerm.rdfJsTerm2Turtle(focus) + "@" + ctx.label;
    if (!ctx.subGraph) { // Don't cache base shape validations as they aren't testing the full neighborhood.
      if (seenKey in ctx.seen)
        {
          let ret: Recursion = {
            type: "Recursion",
            node: rdfJsTerm2Ld(focus),
            shape: ctx.label
          };
          ctx.tracker.recurse(ret);
          return ret;
        }
      if ("known" in this && seenKey in this.known) {
        const ret = this.known[seenKey];
        ctx.tracker.known(ret);
        return ret;
      }
      ctx.seen[seenKey] = { node: focus, shape: ctx.label };
      ctx.tracker.enter(focus, ctx.label);
    }
    const ret = this.validateDescendants(focus, ctx.label, ctx, false);
    if (!ctx.subGraph) {
      ctx.tracker.exit(focus, ctx.label, ret);
      delete ctx.seen[seenKey];
      if ("known" in this)
        this.known[seenKey] = ret;
    }
    return ret;
  }

  /**
   * Validate shapeLabel and shapeExprs which extend shapeLabel
   *
   * @param focus - focus of validation
   * @param shapeLabel - same as ctx.label, but with stronger typing (can't be Start)
   * @param ctx - validation context
   * @param includeAbstractShapes - if true, don't strip out abstract classes (needed for validating abstract base shapes)
   */
  validateDescendants(focus: RdfJsTerm, shapeLabel: shapeDeclLabel, ctx: ShapeExprValidationContext, includeAbstractShapes: boolean = false): shapeExprTest {
    const _ShExValidator = this;
    if (ctx.subGraph) { // !! matchTarget?
      // matchTarget indicates that shape substitution has already been applied.
      // Now we're testing a subgraph against the base shapes.
      const res = this.validateShapeDecl(focus, this.lookupShape(shapeLabel), ctx);
      if (ctx.matchTarget && shapeLabel === ctx.matchTarget.label && !("errors" in res))
        ctx.matchTarget.count++;
      return res;
    }

    // Find all non-abstract shapeExprs extended with label.
    let candidates:shapeDeclRef[] = [shapeLabel];
    candidates = candidates.concat(indexExtensions(this.schema)[shapeLabel] || []);
    // Uniquify list.
    for (let i = candidates.length - 1; i >= 0; --i) {
      if (candidates.indexOf(candidates[i]) < i)
        candidates.splice(i, 1);
    }
    // Filter out abstract shapes.
    if (!includeAbstractShapes)
      candidates = candidates.filter(l => !this.lookupShape(l).abstract);

    // Aggregate results in a SolutionList or FailureList.
    const results = candidates.reduce<ResList>((ret, candidateShapeLabel) => {

      const shapeExpr = this.lookupShape(candidateShapeLabel);
      const matchTarget = candidateShapeLabel === shapeLabel ? null : { label: shapeLabel, count: 0 };
      ctx = ctx.checkExtendingClass(candidateShapeLabel, matchTarget);
      const res = this.validateShapeDecl(focus, shapeExpr, ctx);
      return "errors" in res || matchTarget && matchTarget.count === 0 ?
        { passes: ret.passes, failures: ret.failures.concat(res) } :
        { passes: ret.passes.concat(res), failures: ret.failures } ;

    }, {passes: [], failures: []});
    let ret: shapeExprTest;
    if (results.passes.length > 0) {
      ret = results.passes.length !== 1 ?
        { type: "SolutionList", solutions: results.passes } as SolutionList :
      results.passes [0];
    } else if (results.failures.length > 0) {
      ret = results.failures.length !== 1 ?
        { type: "FailureList", errors: results.failures } as FailureList :
      results.failures [0];
    } else {
      ret = {
        type: "AbstractShapeFailure",
        shape: shapeLabel,
        errors: [shapeLabel + " has no non-abstract children"]
      };
    }
    return ret;

    // @TODO move to ShExIndexVisitor.index
    function indexExtensions (schema: Schema): ExtensionIndex {
      const abstractness: { [id:string]: boolean } = {};
      const extensions = Hierarchy.create();
      makeSchemaVisitor().visitSchema(schema);
      return extensions.children;

      function makeSchemaVisitor () {
        const schemaVisitor = new (ShExVisitor as any)();
        let curLabel: string;
        // let curAbstract; -- not yet used
        const oldVisitShapeDecl = schemaVisitor.visitShapeDecl;

        schemaVisitor.visitShapeDecl = function (decl: ShapeDecl) {
          curLabel = decl.id;
          // curAbstract = decl.abstract;
          abstractness[decl.id] = !!decl.abstract;
          return oldVisitShapeDecl.call(schemaVisitor, decl, decl.id);
        };

        schemaVisitor.visitShape = function (shape: ShExJ.Shape) {
          if (shape.extends !== undefined) {
            shape.extends.forEach(ext => {
              const extendsVisitor = new (ShExVisitor as any)();
              extendsVisitor.visitExpression = function (_expr: tripleExpr, ..._args: never[]) { return "null"; }
              extendsVisitor.visitShapeRef = function (reference: string, ..._args: never[]) {
                extensions.add(reference, curLabel);
                extendsVisitor.visitShapeDecl(_ShExValidator.lookupShape(reference))
                // makeSchemaVisitor().visitSchema(schema);
                return "null";
              };
              extendsVisitor.visitShapeExpr(ext);
            })
          }
          return "null";
        };
        return schemaVisitor;
      }
    }
  }

  /**
   * Validate a ShapeDecl, including any shapes it restricts
   *
   * @param focus - focus of validation
   * @param shapeDecl - ShExJ ShapeDecl object
   * @param ctx - validation context
   */
  validateShapeDecl(focus: RdfJsTerm, shapeDecl: ShapeDecl, ctx: ShapeExprValidationContext): shapeExprTest {
    const conjuncts = (shapeDecl.restricts || []).concat([shapeDecl.shapeExpr])
    const expr = conjuncts.length === 1
          ? conjuncts[0]
          : { type: "ShapeAnd", shapeExprs: conjuncts } as ShExJ.ShapeAnd;
    return this.validateShapeExpr(focus, expr, ctx);
  }

  lookupShape(label: shapeDeclLabel): ShapeDecl {
    const shapes = this.schema.shapes;
    if (shapes === undefined) {
      runtimeError("shape " + label + " not found; no shapes in schema");
    } else if (label in this.index.shapeExprs) {
      return this.index.shapeExprs[label]
    }
    runtimeError("shape " + label + " not found in:\n" + Object.keys(this.index.shapeExprs || []).map(s => "  " + s).join("\n"));
  }

  validateShapeExpr(focus: RdfJsTerm, shapeExpr: shapeExprOrRef, ctx: ShapeExprValidationContext): shapeExprTest {
    if (typeof shapeExpr === "string") { // ShapeRef
      return this.validateShapeLabel(focus, ctx.checkShapeLabel(shapeExpr));
    }

    switch (shapeExpr.type) {
      case "NodeConstraint":
        return this.validateNodeConstraint(focus, shapeExpr, ctx);
      case "Shape":
        return this.validateShape(focus, shapeExpr, ctx);
      case "ShapeExternal":
        if (typeof this.options.validateExtern !== "function")
          throw runtimeError(`validating ${ShExTerm.shExJsTerm2Turtle(focus)} as EXTERNAL shapeExpr ${ctx.label} requires a 'validateExtern' option`)
        return this.options.validateExtern(focus, ctx.label, ctx.checkShapeLabel(ctx.label));
      case "ShapeOr":
        const orErrors = [];
        for (let i = 0; i < shapeExpr.shapeExprs.length; ++i) {
          const nested = shapeExpr.shapeExprs[i];
          const sub = this.validateShapeExpr(focus, nested, ctx);
          if ("errors" in sub)
            orErrors.push(sub);
          else if (!ctx.matchTarget || ctx.matchTarget.count > 0)
            return {type: "ShapeOrResults", solution: sub};
        }
        return {type: "ShapeOrFailure", errors: orErrors} as any as shapeExprTest;
      case "ShapeNot":
        const sub = this.validateShapeExpr(focus, shapeExpr.shapeExpr, ctx);
        return ("errors" in sub)
          ? {type: "ShapeNotResults", solution: sub} as ShapeNotResults
          : {type: "ShapeNotFailure", errors: sub} as ShapeNotFailure

      case "ShapeAnd":
        const andPasses = [];
        const andErrors = [];
        for (let i = 0; i < shapeExpr.shapeExprs.length; ++i) {
          const nested = shapeExpr.shapeExprs[i];
          const sub = this.validateShapeExpr(focus, nested, ctx);
          if ("errors" in sub)
            andErrors.push(sub);
          else
            andPasses.push(sub);
        }
        return andErrors.length > 0
          ? {type: "ShapeAndFailure", errors: andErrors} as ShapeAndFailure
          : {type: "ShapeAndResults", solutions: andPasses} as ShapeAndResults;

      default:
        throw Error("expected one of Shape{Ref,And,Or} or NodeConstraint, got " + JSON.stringify(shapeExpr));
    }
  }

  // TODO: should this be called for and, or, not?
  protected evaluateShapeExprSemActs(ret: shapeExprTest, shapeExpr: NodeConstraint, point: RdfJsTerm, shapeLabel: LabelOrStart) {
    if (!("errors" in ret) && shapeExpr.semActs !== undefined) {
      const semActErrors = this.semActHandler.dispatchAll((shapeExpr as any).semActs, Object.assign({node: point}, ret), ret)
      if (semActErrors.length)
          // some semAct aborted
        return {type: "Failure", node: rdfJsTerm2Ld(point), shape: shapeLabel, errors: semActErrors} as Failure;
    }
    return ret;
  }

  validateShape(focus: RdfJsTerm, shape: Shape, ctx: ShapeExprValidationContext): shapeExprTest {
    let ret = null;
    const fromDB  = (ctx.subGraph || this.db).getNeighborhood(focus, ctx.label, shape);
    const neighborhood = fromDB.outgoing.concat(fromDB.incoming);

    const { extendsTCs, tc2exts, localTCs } = this.TripleConstraintsVisitor(this.index.labelToTcs).getAllTripleConstraints(shape);
    const tripleConstraints = extendsTCs.concat(localTCs);

    // neighborhood already integrates subGraph so don't pass to _errorsMatchingShapeExpr
    const {t2tcs, t2tcErrors, tc2TResults} = this.matchByPredicate(tripleConstraints, fromDB, ctx);
    const {missErrors, matchedExtras} = this.whatsMissing(t2tcs, t2tcErrors, shape.extra || [])

    const allT2TCs = new TripleToTripleConstraints(t2tcs, extendsTCs, tc2exts);
    const partitionErrors: error[][] = [];
    // only construct a regexp engine if shape has a triple expression
    const regexEngine = shape.expression === undefined ? null : this.regexModule.compile(this.schema, shape, this.index);

    for (let t2tc = allT2TCs.next(); t2tc !== null && ret === null; t2tc = allT2TCs.next()) {
      const {errors, triples, results}
          = this.tryPartition(t2tc, focus, shape, ctx, extendsTCs, tc2exts, matchedExtras, tripleConstraints, tc2TResults, fromDB.outgoing, regexEngine);

      const possibleRet = { type: "ShapeTest", node: rdfJsTerm2Ld(focus), shape: ctx.label };
      if (errors.length === 0 && results !== null) // only include .solution for non-empty pattern
        // @ts-ignore TODO
        possibleRet.solution = results;
      if ("semActs" in shape) {
        const semActErrors = this.semActHandler.dispatchAll(shape.semActs, Object.assign({node: focus, triples}, results), possibleRet)
        if (semActErrors.length)
          // some semAct aborted
          Array.prototype.push.apply(errors, semActErrors);
      }

      partitionErrors.push(errors)
      if (errors.length === 0)
        ret = possibleRet
    }

    // Report only last errors until we have a better idea.
    const lastErrors = partitionErrors[partitionErrors.length - 1];
    let errors = missErrors.concat(lastErrors.length === 1 ? lastErrors[0] : lastErrors);
    if (errors.length > 0)
      ret = {
        type: "Failure",
        node: rdfJsTerm2Ld(focus),
        shape: ctx.label,
        errors: errors
      };

    // remove N3jsTripleToString
    if (VERBOSE)
      neighborhood.forEach(function (t) {
        // @ts-ignore
        delete t.toString;
      });

    return this.addShapeAttributes(shape, ret!);
  }

  /**
   * Try a mapping of triples to triple constraints
   *
   * @param t2tc mapping from triples to triple constraints
   * @param focus node being validated
   * @param shape against a give shape
   * @param ctx validation context
   * @param extendsTCs all triple constraints shape transitively extends
   * @param tc2exts mapping of extended triple constraint to position in EXTENDS
   * @param matchedExtras triples allowed by EXTRA
   * @param tripleConstraints triple constraints composing shape
   * @param results mapping from triple to nested validation result
   * @param outgoing triples to check for ClosedShapeViolation
   * @param regexEngine engine to use to test regular triple expression
   * @private
   */
  protected tryPartition(
      t2tc: Map<Quad, TripleConstraint>, focus: RdfJsTerm, shape: Shape, ctx: ShapeExprValidationContext,
      extendsTCs: TripleConstraint[], tc2exts: Map<TripleConstraint, number[]>, matchedExtras: Quad[],
      tripleConstraints: TripleConstraint[], t2tcErrors: TC2TResult,
      outgoing: Quad[], regexEngine: ValidatorRegexEngine | null
  ) {
    const tc2ts: ConstraintToTripleResults = new MapArray<TripleConstraint, TripleResult>();
    tripleConstraints.forEach(tc => tc2ts.empty(tc))

    const usedTriples: Quad[] = [];
    const unexpectedTriples: Quad[] = [];
    const extendsToTriples: Quad[][] = _seq((shape.extends || []).length).map(() => []);
    t2tc.forEach((tripleConstraint, triple) => {
      if (extendsTCs.indexOf(tripleConstraint) !== -1) {
        // allocate to EXTENDS
        for (let extNo of tc2exts.get(tripleConstraint)!) {
          // allocated to multiple extends if diamond inheritance
          extendsToTriples[extNo].push(triple);
        }
      } else {
        // allocate to local shape
        tc2ts.add(tripleConstraint, {triple: triple, res: t2tcErrors.get(tripleConstraint, triple)!});
      }
    });

    // usedTriples are returned to be passed to a SemActHandler
    outgoing.forEach(triple => {
      if (!t2tc.has(triple) // didn't match anything
          && matchedExtras.indexOf(triple) === -1) // isn't in EXTRAs
        unexpectedTriples.push(triple);
      else
        usedTriples.push(triple);
    })

    const errors: error[] = [];

    // Triples not mapped to triple constraints are not allowed in closed shapes.
    if (shape.closed && unexpectedTriples.length > 0 && !this.options.ignoreClosed) {
      errors.push({
        type: "ClosedShapeViolation",
        unexpectedTriples: unexpectedTriples.map(q => {
          return {
            subject: rdfJsTerm2Ld(q.subject),
            predicate: rdfJsTerm2Ld(q.predicate),
            object: rdfJsTerm2Ld(q.object),
          };
        })
      });
    }

    let results: shapeExprTest | null = this.testExtends(shape, focus, extendsToTriples, ctx);
    if (results === null || !("errors" in results)) {
      if (regexEngine !== null /* i.e. shape.expression !== undefined */) {
        const sub = regexEngine.match(focus, tc2ts, this.semActHandler, null);
        if (!("errors" in sub) && results) {
          results = {type: "ExtendedResults", extensions: results, local: sub};
        } else {
          results = sub;
        }
      } else if (results) { // constructs { ExtendedResults, extensions: { ExtensionResults ... } with no local: { ... } }
        results = {type: "ExtendedResults", extensions: results}; // TODO: keep that redundant nesting for consistency?
      }
    }
    // TODO: what if results is a TypedError (i.e. not a container of further errors)?
    if (results !== null && (results as NestedFailure).errors !== undefined)
      Array.prototype.push.apply(errors, (results as NestedFailure).errors);
    return {errors, triples: usedTriples, results};
  }

  /**
   * For each TripleConstraint TC, for each triple T | T.p === TC.p, get the result of testing the value constraint.
   * @param constraintList - list of TripleConstraint
   * @param neighborhood - list of Quad
   * @param ctx - evaluation context
   */
  protected matchByPredicate(constraintList: TripleConstraint[], neighborhood: Neighborhood, ctx: ShapeExprValidationContext): ByPredicateResult {
    const _ShExValidator = this;
    const outgoing = indexNeighborhood(neighborhood.outgoing);
    const incoming = indexNeighborhood(neighborhood.incoming);
    const init: ByPredicateResult = { t2tcErrors: new Map(), tc2TResults: new MapMap(), t2tcs:new MapArray() };
    [neighborhood.outgoing, neighborhood.incoming].forEach(quads =>
        quads.forEach(triple =>
            init.t2tcs.data.set(triple, [])
        )
    );
    return constraintList.reduce<ByPredicateResult>(function (ret, constraint) {

      // subject and object depend on direction of constraint.
      const index = constraint.inverse ? incoming : outgoing;

      // get triples matching predicate
      const matchPredicate = index.byPredicate.get(constraint.predicate) ||
            []; // empty list when no triple matches that constraint

      // strip to triples matching value constraints (apart from @<someShape>)
      const matchConstraints = _ShExValidator.triplesMatchingShapeExpr(matchPredicate, constraint, ctx);

      matchConstraints.hits.forEach(function (evidence) {
        ret.t2tcs.add(evidence.triple, constraint);
        ret.tc2TResults.set(constraint, evidence.triple, evidence.sub);
      });
      matchConstraints.misses.forEach(function (evidence) {
        ret.t2tcErrors.set(evidence.triple, {constraint: constraint, errors: evidence.sub});
      });
      return ret;
    }, init);
  }

  protected whatsMissing (t2tcs: T2TCs, misses: T2TCErrors, extras: string[]): WhatsMissingResult {
    const matchedExtras: Quad[] = []; // triples accounted for by EXTRA
    const missErrors = t2tcs.reduce<error[]>((ret, t, constraints) => {
      if (constraints.length === 0 &&   // matches no constraints
          misses.has(t)) {   // predicate matched some constraint(s)
        if (extras.indexOf(t.predicate.value) !== -1) {
          matchedExtras.push(t);
        } else {                        // not declared extra
          ret.push({             // so it's a missing triple.
            type: "TypeMismatch",
            triple: {type: "TestedTriple", subject: rdfJsTerm2Ld(t.subject), predicate: rdfJsTerm2Ld(t.predicate), object: rdfJsTerm2Ld(t.object)},
            constraint: misses.get(t)!.constraint,
            errors: misses.get(t)!.errors
          });
        }
      }
      return ret;
    }, []);
    return {missErrors, matchedExtras}
  }

  addShapeAttributes (shape: Shape, ret: shapeExprTest): shapeExprTest {
    if (shape.annotations !== undefined)
      { // @ts-ignore TODO: where can annotations appear in results?
        ret.annotations = shape.annotations;
      }
    return ret;
  }

  testExtends(expr: Shape, focus: RdfJsTerm, extendsToTriples: Quad[][], ctx: ShapeExprValidationContext) {
    if (expr.extends === undefined)
      return null;
    const passes = [];
    const errors = [];
    for (let eNo = 0; eNo < expr.extends.length; ++eNo) {
      const extend = expr.extends[eNo];
      const subgraph = new TrivialNeighborhood(null); // These triples were tracked earlier.
      extendsToTriples[eNo].forEach(t => subgraph.addOutgoingTriples([t]));
      ctx = ctx.checkExtendsPartition(subgraph); // new context with subgraph
      const sub = this.validateShapeExpr(focus, extend, ctx);
      if ("errors" in sub)
        errors.push(sub);
      else
        passes.push(sub);
    }
    if (errors.length > 0) {
      return { type: "ExtensionFailure", errors: errors };
    }
    return { type: "ExtensionResults", solutions: passes };
  }

  /** TripleConstraintsVisitor - walk shape's extends to get all
   * referenced triple constraints.
   *
   * @param {} labelToTcs: Map<shapeLabel, TripleConstraint[]>
   * @returns { extendsTCs: [[TripleConstraint]], localTCs: [TripleConstraint] }
   */
  TripleConstraintsVisitor (labelToTcs: { [id: string]: ShExJ.TripleConstraint[] }) {
    const _ShExValidator = this;
    const visitor = new (ShExVisitor as any)(labelToTcs);

    function emptyShapeExpr () { return []; }

    visitor.visitShapeDecl = function (decl: ShapeDecl, _min: number, _max: number) {
      // if (labelToTcs.has(decl.id)) !! uncomment cache for production
      //   return labelToTcs[decl.id];
      labelToTcs[decl.id] = decl.shapeExpr
          ? visitor.visitShapeExpr(decl.shapeExpr, 1, 1)
          : emptyShapeExpr();
      return [{ type: "Ref", ref: decl.id }];
    }
    visitor.visitShapeOr = function (shapeExpr: ShapeOr, _min: number, max: number) {
      return shapeExpr.shapeExprs.reduce(
        (acc, disjunct) => acc.concat(this.visitShapeExpr(disjunct, 0, max))
        , emptyShapeExpr()
      );
    }

    visitor.visitShapeAnd = function (shapeExpr: ShapeAnd, min: number, max: number) {
      const seen = new Set();
      return shapeExpr.shapeExprs.reduce<TripleConstraint[]>((acc, disjunct) => {
        this.visitShapeExpr(disjunct, min, max).forEach((tc: TripleConstraint) => {
          const key = `${tc.min} ${tc.max} ${tc.predicate}`;
          if (!seen.has(key)) {
            seen.add(key);
            acc.push(tc);
          }
        });
        return acc;
      }, []);
    }

    visitor.visitShapeNot = function (expr: ShapeNot, _min: number, _max: number) {
      throw Error(`don't know what to do when extending ${JSON.stringify(expr)}`);
    }

    visitor.visitShapeExternal = emptyShapeExpr

    visitor.visitNodeConstraint = emptyShapeExpr;

    // Override visitShapeRef to follow references.
    // tests: Extend3G-pass, vitals-RESTRICTS-pass_lie-Vital...
    visitor.visitShapeRef = function (shapeLabel: string, min: number, max: number) {
      return visitor.visitShapeDecl(_ShExValidator.lookupShape(shapeLabel), min, max);
    };

    visitor.visitShape = function (shape: Shape, min: number, max: number) {
      const { extendsTCs, localTCs } = shapePieces(shape, min, max);
      return extendsTCs.flat().concat(localTCs);
    }
    // Visit shape's EXTENDS and expression.
    function shapePieces (shape: Shape, min: number, max: number): {
      extendsTCs: RefsAndTCsForShapesExtensions ;
      localTCs: TripleConstraint[];
    } {
      const extendsTCs = shape.extends !== undefined
            ? shape.extends.map(ext => visitor.visitShapeExpr(ext, min, max))
            : [];
      const localTCs = shape.expression === undefined
            ? []
            : visitor.visitExpression(shape.expression, min, max);
      return { extendsTCs, localTCs };
    }

    function getAllTripleConstraints (shape: Shape) {
      const { extendsTCs: extendsTcOrRefsz, localTCs } = shapePieces(shape, 1, 1);
      const tcs: TripleConstraint[] = [];
      const tc2exts: Map<TripleConstraint, number[]> = new Map();
      extendsTcOrRefsz.map((tcOrRefs, ord) => flattenExtends(tcOrRefs, ord));
      return { extendsTCs: tcs, tc2exts, localTCs };

      function flattenExtends (tcOrRefs: RefsAndTCsForOneExtension, ord: number) {
        return tcOrRefs.forEach(tcOrRef => {
          if (tcOrRef.type === "TripleConstraint") {
            add(tcOrRef); // as TC
          } else {
            flattenExtends(labelToTcs[tcOrRef.ref], ord);
          }
        });
        function add (tc: TripleConstraint) {
          const idx = tcs.indexOf(tc);
          if (idx === -1) {
            // new TC
            tcs.push(tc);
            tc2exts.set(tc, [ord]);
          } else {
            // ref to TC already seen in this or earlier EXTENDS
            if (tc2exts.get(tc)!.indexOf(ord) === -1) {
              // not yet included in this EXTENDS
              tc2exts.get(tc)!.push(ord);
            }
          }
        }
      }
    }
    // tripleExprs return list of TripleConstraints

    function n (l: number, expr: OneOf | EachOf) {
      if (expr.min === undefined) return l;
      return l * expr.min;
    }

    function x (l: number, expr: OneOf | EachOf) {
      if (expr.max === undefined) return l;
      if (l === -1 || expr.max === -1) return -1;
      return l * expr.max;
    }

    function and<T> (tes: T[][]): T[] {
      return Array.prototype.concat.apply([], tes);
    }

    // Any TC inside a OneOf implicitly has a min cardinality of 0.
    visitor.visitOneOf = function (expr: OneOf, _outerMin: number, outerMax: number) {
      return and(expr.expressions.map(nested => visitor.visitTripleExpr(nested, 0, x(outerMax, expr))))
    }

    visitor.visitEachOf = function (expr: EachOf, outerMin: number, outerMax: number) {
      return and(expr.expressions.map(nested => visitor.visitTripleExpr(nested, n(outerMin, expr), x(outerMax, expr))))
    }

    visitor.visitInclusion = function (inclusion: string, outerMin: number, outerMax: number) {
      return visitor.visitTripleExpr(_ShExValidator.index.tripleExprs[inclusion], outerMin, outerMax);
    }

    // Synthesize a TripleConstraint with the implicit cardinality.
    visitor.visitTripleConstraint = function (expr: TripleConstraint, _outerMin: number, _outerMax: number) {
      return [expr];
      /* eval-threaded-n-err counts on t2tcs.indexOf(expr) so we can't optimize with:
         const ret = JSON.parse(JSON.stringify(expr));
         ret.min = n(outerMin, expr);
         ret.max = x(outerMax, expr);
         return [ret];
      */
    };

    return {getAllTripleConstraints};
  }

  triplesMatchingShapeExpr(triples: Quad[], constraint: TripleConstraint, ctx: ShapeExprValidationContext): TriplesMatching {
    const _ShExValidator = this;
    const misses: TriplesMatchingMiss[] = [];
    const hits: TriplesMatchingHit[] = [];
    for (const triple of triples) {
      const value = constraint.inverse ? triple.subject : triple.object;
      const oldBindings = JSON.parse(JSON.stringify(_ShExValidator.semActHandler.results));
      if (constraint.valueExpr === undefined)
        hits.push(new TriplesMatchingNoValueConstraint(triple));
      else {
        ctx = ctx.followTripleConstraint();
        const sub: shapeExprTest = _ShExValidator.validateShapeExpr(value, constraint.valueExpr, ctx);
        if ((sub as NestedFailure).errors === undefined) { // TODO: improve typing to cast isn't necessary
          hits.push(new TriplesMatchingHit(triple, sub));
        } else /* !! if (!hits.find(h => h.triple === triple)) */ {
          _ShExValidator.semActHandler.results = JSON.parse(JSON.stringify(oldBindings));
          misses.push(new TriplesMatchingMiss(triple, sub));
        }
      }
    }
    return new TriplesMatching(hits, misses);
  }

  /* validateNodeConstraint - return whether the value matches the value
   * expression without checking shape references.
   */
  validateNodeConstraint(focus: RdfJsTerm, nc: NodeConstraint, ctx: ShapeExprValidationContext): shapeExprTest {
    const errors: string[] = [];
    function validationError (...s:string[]): boolean {
      const errorStr = Array.prototype.join.call(s, "");
      errors.push("Error validating " + ShExTerm.rdfJsTerm2Turtle(focus) + " as " + JSON.stringify(nc) + ": " + errorStr);
      return false;
    }

    if (nc.nodeKind !== undefined) {
      if (["iri", "bnode", "literal", "nonliteral"].indexOf(nc.nodeKind) === -1) {
        validationError(`unknown node kind '${nc.nodeKind}'`);
      }
      if (focus.termType === "BlankNode") {
        if (nc.nodeKind === "iri" || nc.nodeKind === "literal") {
          validationError(`blank node found when ${nc.nodeKind} expected`);
        }
      } else if (focus.termType === "Literal") {
        if (nc.nodeKind !== "literal") {
          validationError(`literal found when ${nc.nodeKind} expected`);
        }
      } else if (nc.nodeKind === "bnode" || nc.nodeKind === "literal") {
        validationError(`iri found when ${nc.nodeKind} expected`);
      }
    }

    if (nc.datatype  && nc.values) validationError("found both datatype and values in " + nc);

    if (nc.values !== undefined) {
      if (!nc.values.some(valueSetValue => testValueSetValue(valueSetValue, focus))) {
        validationError(`value ${(focus.value)} not found in set ${JSON.stringify(nc.values)}`);
      }
    }

    const numeric = getNumericDatatype(focus);

    if (nc.datatype !== undefined) {
      testKnownTypes(focus, validationError, rdfJsTerm2Ld, nc.datatype, numeric, focus.value);
    }

    testFacets(nc, focus.value, validationError, numeric);

    const ncRet: shapeExprTest = Object.assign({}, {
      type: null,
      node: rdfJsTerm2Ld(focus)
    }, (ctx.label ? {shape: ctx.label} : {}), {shapeExpr: nc});
    Object.assign(
      ncRet,
      errors.length > 0
        ? {type: "NodeConstraintViolation", errors: errors} as NodeConstraintViolation
      : {type: "NodeConstraintTest",} as NodeConstraintTest
    );
    return this.evaluateShapeExprSemActs(ncRet, nc, focus, ctx.label);
  }
}

function testLanguageStem(typedValue: string, stem: string) {
  const trail = typedValue.substring(stem.length);
  return (typedValue !== "" && typedValue.startsWith(stem) && (stem === "" || trail === "" || trail[0] === "-"));
}

function valueInExclusions(exclusions: Array<IRIREF | IriStem | ObjectLiteral | LiteralStem | Language | LanguageStem>, value: string): boolean {
  return exclusions.some(exclusion => {
    if (typeof exclusion === "string") { // Iri
      return (value === exclusion)
    } else if (typeof exclusion === "object" // Literal
        && exclusion.type !== undefined
        && !exclusion.type.match(/^(?:Iri|Literal|Language)(?:Stem(?:Range)?)?$/)) {
      return (value === (exclusion as ObjectLiteral).value)
    } else {
      const valueConstraint = exclusion as IriStem | LiteralStem | Language | LanguageStem;
      switch (valueConstraint.type) {
          // "Iri" covered above
        case "IriStem":
          return (value.startsWith(valueConstraint.stem));
          // "Literal" covered above
        case "LiteralStem":
          return (value.startsWith(valueConstraint.stem));
        case "Language":
          return (value === valueConstraint.languageTag);
        case "LanguageStem":
          return testLanguageStem(value, valueConstraint.stem);
      }
    }
    return false;
  })
}

function testValueSetValue(valueSetValueP: string | ObjectLiteral | IriStem | IriStemRange | LiteralStem | LiteralStemRange | Language | LanguageStem | LanguageStemRange, value: RdfJsTerm) {
  if (typeof valueSetValueP === "string") { // Iri
    return (value.termType === "NamedNode" && value.value === valueSetValueP);
  } else if (typeof valueSetValueP === "object" // Literal
      && (valueSetValueP.type === undefined
          || !valueSetValueP.type.match(/^(?:Iri|Literal|Language)(?:Stem(?:Range)?)?$/))) {
    if (value.termType !== "Literal") {
      return false;
    } else {
      const vsValueLiteral = valueSetValueP as ObjectLiteral;
      const valLiteral = value as RdfJsLiteral;
      return (value.value === vsValueLiteral.value
          && (vsValueLiteral.language === undefined || vsValueLiteral.language === valLiteral.language)
          && (vsValueLiteral.type === undefined || vsValueLiteral.type === valLiteral.datatype.value));
    }
  } else {
    // Do a little dance to rule out ObjectLiteral and IRIREF
    const valueSetValue = valueSetValueP as IriStem | IriStemRange | LiteralStem | LiteralStemRange | Language | LanguageStem | LanguageStemRange
    switch (valueSetValue.type) {
        // "Iri" covered above
      case "IriStem":
        if (value.termType !== "NamedNode") return false;
        return (value.value.startsWith(valueSetValue.stem));
      case "IriStemRange":
        if (value.termType !== "NamedNode") return false;
        if (typeof valueSetValue.stem === "string" && !value.value.startsWith(valueSetValue.stem))
          return false;
        return (!valueInExclusions(valueSetValue.exclusions, value.value));
        // "Literal" covered above
      case "LiteralStem":
        if (value.termType !== "Literal") return false;
        return (value.value.startsWith(valueSetValue.stem));
      case "LiteralStemRange":
        if (value.termType !== "Literal") return false;
        if (typeof valueSetValue.stem === "string" && !value.value.startsWith(valueSetValue.stem as string))
          return false;
        return (!valueInExclusions(valueSetValue.exclusions, value.value));
      case "Language":
        if (value.termType !== "Literal") return false;
        return (value.language === valueSetValue.languageTag);
      case "LanguageStem":
        if (value.termType !== "Literal") return false;
        return testLanguageStem(value.language, valueSetValue.stem);
      case "LanguageStemRange":
        if (value.termType !== "Literal") return false;
        if (typeof valueSetValue.stem === "string" && !testLanguageStem(value.language, valueSetValue.stem))
          return false;
        return (!valueInExclusions(valueSetValue.exclusions, value.language));
    }
  }
}

const NoTripleConstraint = Symbol('NO_TRIPLE_CONSTRAINT');

/** Explore permutations of mapping from Triples to TripleConstraints
 * documented using test ExtendsRepeatedP-pass
 */
class TripleToTripleConstraints {
  private extendsTCs: TripleConstraint[];
  private tc2exts: Map<TripleConstraint, number[]>;
  private subgraphCache: Map<string, boolean>;
  private crossProduct: { next: () => (boolean); get: () => T2TcPartition; };
  private uniqueTCs: TripleConstraint[] = [];
  /**
   *
   * @param constraintList mapping from Triple to possible TripleConstraints, e.g. [
   *      [0,2,4], # try T0 against TC0, TC2, TC4
   *      [0,2,4], # try T1 against same
   *      [0,2,4], # try T2 against same
   *      [1,3]    # try T3 against TC1, TC3
   *   ]
   * @param extendsTCs how many TCs are in EXTENDS,
   *   e.g. 4 says that TCs 0-3 are assigned to some EXTENDS; only TC4 is "local".
   * @param tc2exts which TripleConstraints came from which EXTENDS, e.g. [
   *     [0], # TC0 is assignable to EXTENDS 0
   *     [0], # TC1 is assignable to EXTENDS 0
   *     [0], # TC2 is assignable to EXTENDS 0
   *     [0], # TC3 is assignable to EXTENDS 0
   *   ]
   */
  constructor (constraintList: T2TCs, extendsTCs: TripleConstraint[], tc2exts:Map<TripleConstraint, number[]>) {
    this.extendsTCs = extendsTCs; this.tc2exts = tc2exts;
    this.subgraphCache = new Map();
    this.crossProduct = CrossProduct<Quad, TripleConstraint, typeof NoTripleConstraint>(constraintList, NoTripleConstraint);
  }

  /**
   * Find next mapping of Triples to TripleConstraints.
   * Exclude any that differ only in an irrelevant order difference in assignment to EXTENDS.
   * @returns {(Quad | null}
   */
  next (): T2TcPartition | null {
    while (this.crossProduct.next()) {
      /* t2tc - array mapping neighborhood index to TripleConstraint
       * CrossProduct counts through t2tcs from the right:
       *   [ 0, 0, 0, 1 ] # first call
       *   [ 0, 0, 0, 3 ] # second call
       *   [ 0, 0, 2, 1 ] # third call
       *   [ 0, 0, 2, 3 ] # fourth call
       *   [ 0, 0, 4, 1 ] # fifth call
       *   [ 0, 2, 0, 1 ] # sixth call...
       */
      const t2tc = this.crossProduct.get(); // [0,1,0,3] mapping from triple to constraint
      // if (DBG_gonnaMatch (t2tc, fromDB, t2tcs)) debugger;

      /* If this permutation repeats the same assignments to EXTENDS parents, continue to next permutation.
         Test extends-abstract-multi-empty_fail-Ref1ExtraP includes e.g. "_-L4-E0-E0-E0-_" from:
         t2tc: [ NoTripleConstraint, 4, 2, 1, 3, NoTripleConstraint ]
         tc2exts: [[0], [0], [0], [0]] (All four TCs assignable to first EXTENDS.)
      */
      const subgraphKey = [...t2tc.entries()].map(([_triple, tripleConstraint]) =>
        this.extendsTCs.indexOf(tripleConstraint) !== -1
          ? '' + this.tc2exts.get(tripleConstraint)!.map(eNo => 'E' + eNo)
          : 'L' + this.getUniqueTcNo(tripleConstraint)
      ).join('-')

      if (!this.subgraphCache.has(subgraphKey)) {
        this.subgraphCache.set(subgraphKey, true);
        return t2tc;
      }
    }
    return null;
  }

  private getUniqueTcNo(tripleConstraint: TripleConstraint) {
    let idx = this.uniqueTCs.indexOf(tripleConstraint);
    if (idx === -1) {
      idx = this.uniqueTCs.length;
      this.uniqueTCs.push(tripleConstraint);
    }
    return idx;
  }
}

/**
 * Create a cross-product iterator that walks through all permutations of assigning a set of keys to one of their associated values.
 *
 * started from http://stackoverflow.com/questions/9422386/lazy-cartesian-product-of-arrays-arbitrary-nested-loops
 * TODO: make NoConstraint be part of CrossProduct rather than an externally-supplied value.
 *
 * @param sets Map from key to array of values
 * @param emptyValue a term that won't appear in the values that can be used for internal logic
 * @constructor
 */
function CrossProduct<KEY, LISTELT, EMPTY_VALUE>(sets: MapArray<KEY, LISTELT>, emptyValue: EMPTY_VALUE) {
  const n = sets.length, carets: number[] = [];
  const keys = [...sets.keys];
  let args: (LISTELT | EMPTY_VALUE)[] | null = null;

  function init() {
    args = [];
    for (let i = 0; i < n; i++) {
      carets[i] = 0;
      args[i] = sets.get(keys[i])!.length > 0 ? sets.get(keys[i])![0] : emptyValue;
    }
  }

  function next() {

    // special case: crossProduct([]).next().next() returns false.
    if (args !== null && args.length === 0)
      return false;

    if (args === null) {
      init();
      return true;
    }
    let i = n - 1;
    carets[i]++;
    if (carets[i] < sets.get(keys[i])!.length) {
      args[i] = sets.get(keys[i])![carets[i]];
      return true;
    }
    while (carets[i] >= sets.get(keys[i])!.length) {
      if (i === 0) {
        return false;
      }
      carets[i] = 0;
      args[i] = sets.get(keys[i])!.length > 0 ? sets.get(keys[i])![0] : emptyValue;
      carets[--i]++;
    }
    args[i] = sets.get(keys[i])![carets[i]];
    return true;
  }

  return {
    next: next,
    // do: function (block, _context) { // old API
    //   return block.apply(_context, args);
    // },
    // new API because
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments#Description
    // cautions about functions over arguments.
    get: function () {
      return args!.reduce<Map<KEY, LISTELT>>((acc, listElt, ord) => {
        if (listElt !== emptyValue)
          acc.set(keys[ord], listElt as LISTELT);
        return acc;
      }, new Map());
    }
  };
}

/* N3jsTripleToString - simple toString function to make N3.js's triples
 * printable.
 */
const N3jsTripleToString = function () {
  function fmt (n: RdfJsTerm) {
    return n.termType === "Literal" ?
      [ "http://www.w3.org/2001/XMLSchema#integer",
        "http://www.w3.org/2001/XMLSchema#float",
        "http://www.w3.org/2001/XMLSchema#double"
      ].indexOf(n.datatype.value) !== -1 ?
      parseInt(n.value) :
      n :
    n.termType === "BlankNode" ?
      n :
      "<" + n + ">";
  }
  // @ts-ignore what's an elegant way add toString to Quads?
  return fmt(this.subject) + " " + fmt(this.predicate) + " " + fmt(this.object) + " .";
};

/* indexNeighborhood - index triples by predicate
 * returns: {
 *     byPredicate: Object: mapping from predicate to triples containing that
 *                  predicate.
 *
 *     candidates: [[1,3], [0,2]]: mapping from triple to the triple constraints
 *                 it matches.  It is initialized to []. Mappings that remain an
 *                 empty set indicate a triple which didn't matching anything in
 *                 the shape.
 *
 *     misses: list to receive value constraint failures.
 *   }
 */
function indexNeighborhood (triples: Quad[]): NeighborhoodIndex {
  return {
    byPredicate: triples.reduce(function (ret, t) {
      const p = t.predicate.value;
      if (!ret.has(p))
        ret.set(p, []);
      ret.get(p).push(t);

      // If in VERBOSE mode, add a nice toString to N3.js's triple objects.
      if (VERBOSE)
        t.toString = N3jsTripleToString;

      return ret;
    }, new Map()),
    // candidates: _seq<number>(triples.length).map(function () {
    //   return [];
    // }),
    misses: []
  };
}

/* Return a list of n `undefined`s.
 *
 * Note that Array(n) on its own returns a "sparse array" so Array(n).map(f)
 * never calls f.
 * This doesn't work without both a fill and a map (‽):
 *   extendsToTriples: Quad[][] = Array((shape.extends || []).length).fill([]]).map(() => []);
 */
function _seq<T> (n: number): (T | undefined)[] {
  return Array.from(Array(n)); // ha ha ha, javascript, you suck.
}

function runtimeError (... args: string[]): never {
  const errorStr = args.join("");
  const e = new Error(errorStr);
  if ("captureStackTrace" in Error) {
    Error.captureStackTrace(e, runtimeError);
  }
  throw e;
}
