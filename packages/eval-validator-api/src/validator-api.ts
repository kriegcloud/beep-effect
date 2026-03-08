import * as ShExJ from 'shexj';
import * as RdfJs from '@rdfjs/types/data-model';
import {shapeExprTest, Recursion, SemActFailure} from "@shexjs/term/shexv";
// import {NeighborhoodDb} from "@shexjs/neighborhood-api";
import {SchemaIndex} from "@shexjs/term";
import {Quad as RdfJsQuad} from "@rdfjs/types";
import {TripleConstraint} from "shexj";

export {};

export class MapArray<A, T> {
  public data: Map<A, T[]> = new Map(); // public 'cause I don't know how to fix reduce to use this.data
  add (a:A, t:T): void {
    if (!this.data.has(a)) { this.data.set(a, []); }
    if (this.data.get(a)!.indexOf(t) !== -1) { throw Error(`Error adding [${a}] ${t}; already included`); }
    this.data.get(a)!.push(t);
  }

  get length () { return this.data.size; }

  get keys () { return this.data.keys(); }

  reduce: <U>(f: (acc: U, a: A, x: T[]) => U, acc: U) => U = (f, acc) => {
    const keys = [...this.data.keys()];
    for (const key of keys)
      acc = f(acc, key, this.data.get(key)!);
    return acc
  }

  get(key: A) { return this.data.get(key); }

  empty(key: A) {
    this.data.set(key, [])
  }
}

export type TripleResult = {
  triple: RdfJsQuad;
  res: shapeExprTest;
}
export type ConstraintToTripleResults = MapArray<TripleConstraint, TripleResult>;

export type T2TcPartition = Map<RdfJsQuad, TripleConstraint>;

export interface ValidatorRegexModule {
  name: string;
  description: string;
  compile(schema: ShExJ.Schema, shape: ShExJ.Shape, index: SchemaIndex): ValidatorRegexEngine
}

export interface ValidatorRegexEngine {
  match(
    point: RdfJs.Term,
    tc2t: ConstraintToTripleResults,
    semActHandler: SemActDispatcher,
    trace: object[] | null
  ): shapeExprTest;
}

export interface QueryTracker {
  enter (term: RdfJs.Term, shapeLabel: string): void;
  exit (term: RdfJs.Term, shapeLabel: string, res: shapeExprTest): void;
  recurse (rec: Recursion): void;
  known (res: shapeExprTest): void;
}

export interface SemActDispatcher {
  register(name: string, handler: SemActHandler): void;
  dispatchAll(semActs: ShExJ.SemAct[] | undefined, ctx: any, resultsArtifact: any): SemActFailure[];
  results: { [id: string]: string | undefined }; // TODO: improve this trivial storage mechanism
}

export interface SemActHandler {
  dispatch(code: string | null, ctx: any, extensionStorage: any): SemActFailure[];
}
