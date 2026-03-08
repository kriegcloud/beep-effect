import * as N3 from 'n3';
import * as RdfJs from "@rdfjs/types/data-model";
import * as ShExJ from 'shexj';

export {};

export function version(): any;
export function index(schema: any): Index;
export function getAST(schema: any): any;
export function ShExJtoAS(schema: any): any;
export function AStoShExJ(schema: any, abbreviate: any): any;
export function ShExRVisitor(knownShapeExprs: any): any;
export function ShExRtoShExJ(schema: any): any;
export function valGrep(obj: any, type: any, f: any): any;
export function valToN3js(res: any, factory: any): any;
export function canonicalize(schema: any, trimIRI: any): any;
export function BiDiClosure(): any;
export function nestShapes(schema: any, options: any): any;
export function getPredicateUsage(schema: any, untyped: any): any;
export function simpleTripleConstraints(shape: any): any;
export function getValueType(valueExpr: any): any;
export function getDependencies(schema: any, ret: any): any;
export function partition(schema: any, includes: any, deps: any, cantFind: any): any;
export function flatten(schema: any, deps: any, cantFind: any): any;
export function emptySchema(): any;
export function merge(left: any, right: any, overwrite: any, inPlace: any): any;
export function absolutizeResults(parsed: any, base: any): any;
export function getProofGraph(res: any, db: any, dataFactory: any): any;
export function validateSchema(schema: any): any;
export function isWellDefined(schema: any): any;
export function walkVal(val: any, cb: any): any;
export function valToValues(val: any): any;
export function valToExtension(val: any, lookfor: any): any;
export function valuesToSchema(values: any): any;
export function simpleToShapeMap(x: any): any;
export function absolutizeShapeMap(parsed: any, base: any): any;
export function errsToSimple(val: any): any;
export function resolvePrefixedIRI(prefixedIri: any, prefixes: any): any;
export function parsePassedNode(passedValue: any, meta: any, deflt: any, known: any, reportUnknown: any): any;
export function executeQueryPromise(query: any, endpoint: any): any;
export function executeQuery(query: any, endpoint: any): any;
export function unescapeText(string: any, replacements: any): any;

export interface Index {
  shapeExprs: { [key: string]: ShExJ.ShapeDecl; }
  tripelExprs: { [key: string]: ShExJ.tripleExpr; }
}
