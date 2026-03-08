import * as ShExJ from 'shexj';
import {SchemaIndex} from '@shexjs/term';
import {
    Annotation,
    BNODE,
    EachOf, exclusion,
    IRIREF, IriStemRange, LanguageStemRange, LiteralStemRange, NodeConstraint,
    OneOf,
    SemAct,
    ShapeAnd, ShapeDecl, shapeDeclRef, shapeExpr,
    shapeExprOrRef, ShapeExternal, ShapeNot,
    ShapeOr, TripleConstraint, tripleExprOrRef,
    tripleExprRef, valueSetValue
} from 'shexj';

export {}
export class ShExVisitorIface {
  // constructor(...args: any[]); pass extra args in your constructor

  visitSchema(schema: Schema, ...args: any[]): any;
    // visitBase: (v: IRIREF, ...args: any[]) => any;
    // visitPrefixes(prefixes: any, ...args: any[]): any;
    // "visit@context": (v: string, ...args: any[]) => any;
    visitStartActs(startActs: SemAct[], ...args: any[]): any;
    visitStart: (v: shapeExprOrRef, ...args: any[]) => any;
    visitImports(imports: IRIREF, ...args: any[]): any;
    visitShapes(shapes: ShapeDecl[], ...args: any[]): any;

    // SemActs and Annotations can appear in multiple places
    visitSemActs(semActs: SemAct[], ...args: any[]): any[];
    visitSemAct(semAct: SemAct, label: any, ...args: any[]): any;
    visitName: (v: IRIREF, ...args: any[]) => any;
    visitCode: (v: string, ...args: any[]) => any;
    visitAnnotations: (l: Annotation[], ...args: any[]) => any;
    visitPredicate: (v: IRIREF, ...args: any[]) => any;
    // !! visitObject

  visitId: (v: shapeDeclRef | tripleExprRef, ...args: any[]) => any;

  visitShapeExpr(expr: shapeExprOrRef, ...args: any[]): any;
    visitShapeRef(reference: shapeDeclRef, ...args: any[]): any;

  visitShapeDecl(decl: ShapeDecl, ...args: any[]): any;
    visitAbstract: (v: boolean, ...args: any[]) => any;
    visitRestricts: (v: shapeExprOrRef, ...args: any[]) => any;

  visitShapeOr: (v: ShapeOr, ...args: any[]) => any;

  visitShapeAnd: (v: ShapeAnd, ...args: any[]) => any;

  visitShapeNot(expr: ShapeNot, ...args: any[]): any;

  visitShapeExternal(expr: ShapeExternal, ...args: any[]): any;

  visitNodeConstraint(shape: NodeConstraint, ...args: any[]): any;
    visitNodeKind: (v: nodeKind, ...args: any[]) => any;
    visitDatatype: (v: IRIREF, ...args: any[]) => any;
    visitValues(values: valueSetValue, ...args: any[]): any;

    // stringFacets
    visitLength: (v: number, ...args: any[]) => any;
    visitMinlength: (v: number, ...args: any[]) => any;
    visitMaxlength: (v: number, ...args: any[]) => any;
    visitPattern: (v: string, ...args: any[]) => any;
    visitFlags: (v: string, ...args: any[]) => any;

    // numericFacets
    visitMininclusive: (v: number, ...args: any[]) => any;
    visitMinexclusive: (v: number, ...args: any[]) => any;
    visitMaxinclusive: (v: number, ...args: any[]) => any;
    visitMaxexclusive: (v: number, ...args: any[]) => any;
    visitTotaldigits: (v: number, ...args: any[]) => any;
    visitFractiondigits: (v: number, ...args: any[]) => any;

    // value sets
    visitIRI(i: IRIREF, ...args: any[]): any;
    visitStemRange(t: IriStemRange | LiteralStemRange | LanguageStemRange, ...args: any[]): any;
    visitExclusion(c: exclusion, ...args: any[]): any;
    visitType: (v: string, ...args: any[]) => any;

  visitShape(shape: Shape, ...args: any[]): any;
    visitClosed: (v: boolean, ...args: any[]) => any;
    visitExtends: (v: shapeExprOrRef, ...args: any[]) => any;
    visitExtra: (l: IRIREF, ...args: any[]) => any;

  visitExpression(expr: tripleExprOrRef, ...args: any[]): any;
    visitInclusion(inclusion: tripleExprRef, ...args: any[]): string;
    visitInclude: (v: tripleExprRef, ...args: any[]) => any;
    visitMin: (v: number, ...args: any[]) => any;
    visitMax: (v: number, ...args: any[]) => any;

  visitTripleExpr(expr: tripleExpr, ...args: any[]): any;

  visitOneOf: (v: OneOf, ...args: any[]) => any;

  visitEachOf: (v: EachOf, ...args: any[]) => any;

  visitTripleConstraint(expr: TripleConstraint, ...args: any[]): any;
    visitInverse: (v: boolean, ...args: any[]) => any;
    visitValueExpr(expr: shapeExprOrRef, ...args: any[]): any;

    /*
    _maybeSet(obj: any, ret: any, context: any, members: any, ignore: any, ...args: any[]): any;
    _visitValue(v: any, ...args: any[]): any;
    _visitList(l: any, ...args: any[]): any;
    _testUnknownAttributes(obj: any, expected: any, context: any, captureFrame: any): void;
    _expect(o: any, p: any, v: any, ...args: any[]): void;
     */
}
// export function index (schema: ShExJ.Schema): SchemaIndex
export function ShExVisitor (... x: any): ShExVisitorIface

export class ShExIndexVisitor extends ShExVisitor {
    static index(schema: any, ...args: any[]): SchemaIndex;
    constructor();
    myIndex: SchemaIndex;
}
