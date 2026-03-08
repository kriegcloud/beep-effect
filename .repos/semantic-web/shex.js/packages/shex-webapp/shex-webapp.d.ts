/**
 * automatic ts-ified annotation for webpack product -- probably garbage
 */

export {};

export class DcTap {
    constructor(...args: any[]);

    coerseValue(...args: any[]): void;

    parseIri(...args: any[]): void;

    parseRow(...args: any[]): void;

    parseRows(...args: any[]): void;

    parseValueConstraint(...args: any[]): void;

    toJson(...args: any[]): void;

    toShEx(...args: any[]): void;

    toTripleConstraint(...args: any[]): void;

}

export class Writer {
    constructor(outputStream: any, options: any);

    addPrefix(prefix: any, iri: any, done: any): void;

    addPrefixes(prefixes: any, done: any): void;

    addShape(shape: any, name: any, done: any): void;

    addShapes(shapes: any): void;

    end(done: any): any;

    writeSchema(shape: any, done: any): void;

}

export const ShapeMap: {
    Parser: {
        construct: any;
    };
    focus: {
        term: string;
    };
    start: {
        term: string;
    };
    wildcard: {
        term: string;
    };
};

export function Api(config: any): any;

export function Util(parent: any, toPrototype: any): any;

export namespace Parser {
    function construct(baseIRI: any, prefixes: any, schemaOptions: any, ...args: any[]): any;

}

export namespace ShExTerm {
    const RdfLangString: string;

    const XsdString: string;

    function externalTerm(node: any, factory: any): any;

    function externalTriple(triple: any, factory: any): any;

    function getLiteralLanguage(literal: any): any;

    function getLiteralType(literal: any): any;

    function inDefaultGraph(triple: any): any;

    function shExJsTerm2Turtle(node: any, meta: {base: string, prefixes: {[name: string]: string[]}}, aForType: boolean): any;

    function internalTerm(node: any): any;

    function internalTriple(triple: any): any;

    function isBlank(entity: any): any;

    function isDefaultGraph(entity: any): any;

    function isIRI(entity: any): any;

    function isLiteral(entity: any): any;

    function resolveRelativeIRI(base: any, iri: any): any;

}

export namespace ShapeMapParser {
    function construct(baseIRI: any, schemaMeta: any, dataMeta: any, ...args: any[]): any;

}

export namespace Util {
    const NotSupplied: string;

    const RDF: {
        first: string;
        nil: string;
        rest: string;
        type: string;
    };

    const SX: {
        "@context": string;
        Annotation: string;
        EachOf: string;
        Inclusion: string;
        IriStem: string;
        IriStemRange: string;
        Language: string;
        LanguageStem: string;
        LanguageStemRange: string;
        LiteralStem: string;
        LiteralStemRange: string;
        NodeConstraint: string;
        OneOf: string;
        Schema: string;
        SemAct: string;
        Shape: string;
        ShapeAnd: string;
        ShapeDecl: string;
        ShapeExternal: string;
        ShapeNot: string;
        ShapeOr: string;
        ShapeRef: string;
        TripleConstraint: string;
        Wildcard: string;
        abstract: string;
        annotation: string;
        bnode: string;
        closed: string;
        code: string;
        datatype: string;
        exclusion: string;
        expression: string;
        expressions: string;
        extends: string;
        extra: string;
        flags: string;
        fractiondigits: string;
        imports: string;
        include: string;
        inverse: string;
        iri: string;
        languageTag: string;
        length: string;
        literal: string;
        max: string;
        maxexclusive: string;
        maxinclusive: string;
        maxlength: string;
        min: string;
        minexclusive: string;
        mininclusive: string;
        minlength: string;
        name: string;
        negated: string;
        nodeKind: string;
        nonliteral: string;
        object: string;
        pattern: string;
        predicate: string;
        reference: string;
        restricts: string;
        semActs: string;
        shapeExpr: string;
        shapeExprs: string;
        shapes: string;
        start: string;
        startActs: string;
        stem: string;
        totaldigits: string;
        valueExpr: string;
        values: string;
    };

    const UnknownIRI: string;

    function AStoShExJ(schema: any, abbreviate: any): any;

    function BiDiClosure(): any;

    function ShExJtoAS(schema: any): any;

    function ShExRVisitor(knownShapeExprs: any): any;

    function ShExRtoShExJ(schema: any): any;

    function ShExVisitor(...args: any[]): any;

    function absolutizeResults(parsed: any, base: any): any;

    function absolutizeShapeMap(parsed: any, base: any): any;

    function canonicalize(schema: any, trimIRI: any): any;

    function emptySchema(): any;

    function errsToSimple(val: any): any;

    function executeQuery(query: any, endpoint: any): any;

    function executeQueryPromise(query: any, endpoint: any): any;

    function flatten(schema: any, deps: any, cantFind: any): any;

    function getAST(schema: any): any;

    function getDependencies(schema: any, ret: any): any;

    function getPredicateUsage(schema: any, untyped: any): any;

    function getProofGraph(res: any, db: any, dataFactory: any): any;

    function getValueType(valueExpr: any): any;

    function index(schema: any): any;

    function isWellDefined(schema: any): any;

    function merge(left: any, right: any, overwrite: any, inPlace: any): any;

    function nestShapes(schema: any, options: any): any;

    function parsePassedNode(passedValue: any, meta: any, deflt: any, known: any, reportUnknown: any): any;

    function partition(schema: any, includes: any, deps: any, cantFind: any): any;

    function rdfjsDB(db: any, queryTracker: any, ...args: any[]): any;

    function resolvePrefixedIRI(prefixedIri: any, prefixes: any): any;

    function resolveRelativeIRI(base: any, iri: any): any;

    function simpleToShapeMap(x: any): any;

    function simpleTripleConstraints(shape: any): any;

    function skipDecl(shapeExpr: any): any;

    function unescapeText(string: any, replacements: any): any;

    function valGrep(obj: any, type: any, f: any): any;

    function valToExtension(val: any, lookfor: any): any;

    function valToN3js(res: any, factory: any): any;

    function valToValues(val: any): any;

    function validateSchema(schema: any): any;

    function valuesToSchema(values: any): any;

    function version(): any;

    function walkVal(val: any, cb: any): any;

    namespace Visitor {
        function index(schema: any): any;

    }

}

export namespace Validator {
    const options: {
        coverage: {
            exhaustive: string;
            firstError: string;
        };
    };

    const start: {
        term: string;
    };

    function construct(schema: any, db: any, options: any, ...args: any[]): any;

}


