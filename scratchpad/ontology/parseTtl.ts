/**
 * TTL → in-memory ClassTable parser.
 *
 * Stage 1 of the TTL → JSON Schema → Effect Schema codegen pipeline. Parses an
 * energy-intel TTL module into a typed table of classes, properties, and
 * prefix bindings. Downstream codegen stages (Task 7+) consume this table and
 * never touch the n3 Store directly.
 *
 * The parser deliberately keeps property cardinality unresolved: properties
 * default to optional + single unless a later pass projects restriction
 * metadata onto `ClassProperty`. Cross-class object-property references are left
 * as raw IRIs (`range` is a string); resolution happens during JSON Schema
 * construction.
 *
 * Equivalent-class restrictions of the BFO role-bearer shape
 * (`Foo ≡ Person ⊓ ∃bfo:bearerOf.Role`) are captured per class so Task 8 can
 * fold them into generated Effect schemas without re-parsing the n3 Store.
 *
 * Always uses explicit `format: "Turtle"` per project memory (n3.js' default
 * picks N3-superset and accepts non-Turtle constructs).
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import {Effect, pipe} from "effect";
import * as A from "effect/Array";
import * as MutableHashMap from "effect/MutableHashMap";
import * as MutableHashSet from "effect/MutableHashSet";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import {O} from "@beep/utils";
import {CauseTaggedError, SchemaUtils} from "@beep/schema";
import {
	DataFactory,
	Parser,
	Store,
	NamedNode as N3NamedNode,
	BlankNode,
	Variable,
	Literal,
	DefaultGraph,
} from "n3";
import {$ScratchpadId} from "@beep/identity";

const $I = $ScratchpadId.create("ontology/parseTtl")

const termTypeSentinel = <const TermType extends string>(literal: TermType) => ({
	"~sentinels": A.make({
		key: "termType",
		literal,
	}),
});

const N3 = {
	Parser: S.instanceOf(Parser),
	Store: S.instanceOf(Store),
	Variable: S.instanceOf(Variable, termTypeSentinel("Variable")),
	BlankNode: S.instanceOf(BlankNode, termTypeSentinel("BlankNode")),
	Literal: S.instanceOf(Literal, termTypeSentinel("Literal")),
	DefaultGraph: S.instanceOf(DefaultGraph, termTypeSentinel("DefaultGraph")),
}

/**
 * N3 named-node schema with constructors colocated on the schema value.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { NamedNode } from "./parseTtl.ts"
 *
 * const expert = NamedNode.of("https://w3id.org/energy-intel/Expert")
 * console.log(S.is(NamedNode)(expert)) // true
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const NamedNode = S.instanceOf(N3NamedNode, termTypeSentinel("NamedNode")).pipe(
	SchemaUtils.withStatics(() => ({
		of: DataFactory.namedNode,
	})),
	$I.annoteSchema("NamedNode", {
		description: "N3 named-node schema with colocated constructors.",
	}),
);

/**
 * Runtime type for {@link NamedNode}. {@inheritDoc NamedNode}
 *
 * @example
 * ```ts
 * import type { NamedNode } from "./parseTtl.ts"
 *
 * const value: NamedNode["termType"] = "NamedNode"
 * console.log(value)
 * ```
 *
 * @category type-level
 * @since 0.0.0
 */
export type NamedNode = typeof NamedNode.Type;

/**
 * N3 quad subject schema accepted by the ontology Turtle parser.
 *
 * @example
 * ```ts
 * import { NamedNode, QuadSubject } from "./parseTtl.ts"
 *
 * const subject = NamedNode.of("https://w3id.org/energy-intel/Expert")
 * console.log(QuadSubject.guards.NamedNode(subject)) // true
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const QuadSubject = S.Union([
	NamedNode,
	N3.BlankNode,
	N3.Variable,
]).pipe(S.toTaggedUnion("termType"), $I.annoteSchema("QuadSubject", {
	description: "N3 quad subject accepted by the ontology Turtle parser.",
}));

/**
 * Runtime type for {@link QuadSubject}. {@inheritDoc QuadSubject}
 *
 * @example
 * ```ts
 * import type { QuadSubject } from "./parseTtl.ts"
 *
 * const termType: QuadSubject["termType"] = "NamedNode"
 * console.log(termType)
 * ```
 *
 * @category type-level
 * @since 0.0.0
 */
export type QuadSubject = typeof QuadSubject.Type;

/**
 * N3 term schema used while traversing Turtle triples and RDF lists.
 *
 * @example
 * ```ts
 * import { DataFactory } from "n3"
 * import { Term } from "./parseTtl.ts"
 *
 * const literal = DataFactory.literal("Energy analyst")
 * console.log(Term.guards.Literal(literal)) // true
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const Term = S.Union([
	NamedNode,
	N3.BlankNode,
	N3.Literal,
	N3.Variable,
	N3.DefaultGraph,
]).pipe(S.toTaggedUnion("termType"), $I.annoteSchema("Term", {
	description: "N3 term used while traversing Turtle triples and RDF lists.",
}))

/**
 * Runtime type for {@link Term}. {@inheritDoc Term}
 *
 * @example
 * ```ts
 * import type { Term } from "./parseTtl.ts"
 *
 * const termType: Term["termType"] = "Literal"
 * console.log(termType)
 * ```
 *
 * @category type-level
 * @since 0.0.0
 */
export type Term = typeof Term.Type;

const RDF_TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
const RDF_FIRST = "http://www.w3.org/1999/02/22-rdf-syntax-ns#first";
const RDF_REST = "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest";
const RDF_NIL = "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil";
const OWL_CLASS = "http://www.w3.org/2002/07/owl#Class";
const OWL_RESTRICTION = "http://www.w3.org/2002/07/owl#Restriction";
const OWL_DATATYPE_PROPERTY = "http://www.w3.org/2002/07/owl#DatatypeProperty";
const OWL_OBJECT_PROPERTY = "http://www.w3.org/2002/07/owl#ObjectProperty";
const OWL_DISJOINT = "http://www.w3.org/2002/07/owl#disjointWith";
const OWL_EQUIVALENT_CLASS = "http://www.w3.org/2002/07/owl#equivalentClass";
const OWL_INTERSECTION_OF = "http://www.w3.org/2002/07/owl#intersectionOf";
const OWL_UNION_OF = "http://www.w3.org/2002/07/owl#unionOf";
const OWL_ON_PROPERTY = "http://www.w3.org/2002/07/owl#onProperty";
const OWL_SOME_VALUES_FROM = "http://www.w3.org/2002/07/owl#someValuesFrom";
const RDFS_LABEL = "http://www.w3.org/2000/01/rdf-schema#label";
const RDFS_SUBCLASS = "http://www.w3.org/2000/01/rdf-schema#subClassOf";
const RDFS_DOMAIN = "http://www.w3.org/2000/01/rdf-schema#domain";
const RDFS_RANGE = "http://www.w3.org/2000/01/rdf-schema#range";
const SKOS_DEF = "http://www.w3.org/2004/02/skos/core#definition";

/**
 * Property attached to a parsed ontology class.
 *
 * @example
 * ```ts
 * import { ClassProperty } from "./parseTtl.ts"
 *
 * const property = ClassProperty.make({
 *   iri: "https://w3id.org/energy-intel/name",
 *   optional: true,
 *   list: false
 * })
 * console.log(property.iri)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export class ClassProperty extends S.Class<ClassProperty>($I`ClassProperty`)({
	iri: S.String,
	label: S.optionalKey(S.String),
	range: S.optionalKey(S.String),
	rangeUnion: S.String.pipe(S.Array, S.optionalKey),
	optional: SchemaUtils.BoolKeyDefaultTrue,
	list: SchemaUtils.BoolKeyDefaultFalse,
}, $I.annote("ClassProperty", {
	description: "Property attached to a parsed ontology class.",
})) {
}

/**
 * BFO role-bearer restriction discovered on an equivalent class expression.
 *
 * @example
 * ```ts
 * import { EquivalentClassRestriction } from "./parseTtl.ts"
 *
 * const restriction = EquivalentClassRestriction.make({
 *   onProperty: "http://purl.obolibrary.org/obo/BFO_0000053",
 *   someValuesFrom: "https://w3id.org/energy-intel/ExpertRole"
 * })
 * console.log(restriction.someValuesFrom)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export class EquivalentClassRestriction extends S.Class<EquivalentClassRestriction>($I`EquivalentClassRestriction`)({
	onProperty: S.String,
	someValuesFrom: S.String,
}, $I.annote("EquivalentClassRestriction", {
	description: "BFO role-bearer restriction discovered on an equivalent class expression.",
})) {
}

/**
 * Parsed OWL class with superclass links, restrictions, and attached properties.
 *
 * @example
 * ```ts
 * import { ClassRecord } from "./parseTtl.ts"
 *
 * const cls = ClassRecord.make({
 *   iri: "https://w3id.org/energy-intel/Expert",
 *   label: "Expert",
 *   superClasses: [],
 *   disjointWith: [],
 *   equivalentClassRestrictions: [],
 *   properties: []
 * })
 * console.log(cls.label)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export class ClassRecord extends S.Class<ClassRecord>($I`ClassRecord`)({
	iri: S.String,
	label: S.String,
	definition: S.optionalKey(S.String),
	superClasses: S.Array(S.String).pipe(SchemaUtils.withEmptyArrayDefaults<string>()),
	disjointWith: S.Array(S.String).pipe(SchemaUtils.withEmptyArrayDefaults<string>()),
	equivalentClassRestrictions: S.Array(EquivalentClassRestriction).pipe(
		SchemaUtils.withEmptyArrayDefaults<EquivalentClassRestriction>(),
	),
	properties: S.Array(ClassProperty).pipe(SchemaUtils.withEmptyArrayDefaults<ClassProperty>()),
}, $I.annote("ClassRecord", {
	description: "Parsed OWL class with superclass links, restrictions, and attached properties.",
})) {
}


/**
 * Parsed class table consumed by ontology code generation stages.
 *
 * @example
 * ```ts
 * import { ClassTable } from "./parseTtl.ts"
 *
 * const table = ClassTable.make({
 *   classes: [],
 *   prefixes: {}
 * })
 * console.log(table.classes.length)
 * ```
 *
 * @category tables
 * @since 0.0.0
 */
export class ClassTable extends S.Class<ClassTable>($I`ClassTable`)({
	classes: S.Array(ClassRecord).pipe(SchemaUtils.withEmptyArrayDefaults<ClassRecord>()),
	declaredProperties: S.Array(S.String).pipe(SchemaUtils.withEmptyArrayDefaults<string>()),
	prefixes: S.Record(S.String, S.String).pipe(SchemaUtils.withKeyDefaults(R.empty<string, string>())),
}, $I.annote("ClassTable", {
	description: "Parsed class table consumed by ontology code generation stages.",
})) {
}

/**
 * Error raised when Turtle parsing or class-table extraction fails.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { parseTtlToClassTable } from "./parseTtl.ts"
 *
 * const handled = parseTtlToClassTable("not turtle").pipe(
 *   Effect.catchTag("TtlParseError", (error) => Effect.succeed(error.message))
 * )
 * console.log(Effect.runSync(handled))
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class TtlParseError extends CauseTaggedError<TtlParseError>($I`TtlParseError`)("TtlParseError", $I.annote("TtlParseError", {
	description: "Error raised when Turtle parsing or class-table extraction fails.",
})) {
}

const firstObjectValue = (store: Store, subject: QuadSubject, predicate: string): string | undefined => {
	const quads = store.getQuads(subject, NamedNode.of(predicate), null, null);
	return pipe(quads, A.get(0), O.map((quad) => quad.object.value), O.getOrUndefined);
};

const firstObjectTerm = (store: Store, subject: QuadSubject, predicate: string): Term | undefined => {
	const quads = store.getQuads(subject, NamedNode.of(predicate), null, null);
	return pipe(quads, A.get(0), O.map((quad) => quad.object), O.getOrUndefined);
};

const objectValuesNamed = (
	store: Store,
	subject: QuadSubject,
	predicate: string,
): ReadonlyArray<string> => pipe(
	store.getQuads(subject, NamedNode.of(predicate), null, null),
	A.map((q) => q.object),
	A.filter(Term.guards.NamedNode),
	A.map((o) => o.value),
)


const isNamedSubject = QuadSubject.guards.NamedNode;

const subjectFromTerm = (term: Term): QuadSubject | undefined => Term.guards.BlankNode(term) || Term.guards.NamedNode(
	term)
	? term
	: undefined;

const namedNodeValuesFromRdfList = (store: Store, head: QuadSubject): ReadonlyArray<string> | undefined => {
	let values = A.empty<string>()
	let listHead: QuadSubject | undefined = head;
	let safety = 0;

	while (P.isNotUndefined(listHead) && safety < 1024) {
		safety++;
		if (Term.guards.NamedNode(listHead) && listHead.value === RDF_NIL) {
			return values;
		}

		const first = firstObjectTerm(store, listHead, RDF_FIRST);
		if (P.isUndefined(first) || !Term.guards.NamedNode(first)) {
			return undefined;
		}
		values = A.append(values, first.value);

		const rest = firstObjectTerm(store, listHead, RDF_REST);
		if (P.isUndefined(rest)) return undefined;
		if (Term.guards.NamedNode(rest) && rest.value === RDF_NIL) {
			return values;
		}
		listHead = subjectFromTerm(rest);
	}

	return undefined;
};

const propertyRange = (store: Store, propertySubject: QuadSubject): Pick<ClassProperty, "range" | "rangeUnion"> => {
	const range = firstObjectTerm(store, propertySubject, RDFS_RANGE);
	if (P.isUndefined(range)) return R.empty();
	if (Term.guards.NamedNode(range)) return {range: range.value};

	const rangeSubject = subjectFromTerm(range);
	if (P.isNotUndefined(rangeSubject)) {
		const unionHeadTerm = firstObjectTerm(store, rangeSubject, OWL_UNION_OF);
		const unionHead = P.isUndefined(unionHeadTerm)
			? undefined
			: subjectFromTerm(unionHeadTerm);
		if (P.isNotUndefined(unionHead)) {
			const ranges = namedNodeValuesFromRdfList(store, unionHead);
			if (P.isNotUndefined(ranges) && A.isReadonlyArrayNonEmpty(ranges)) {
				return {rangeUnion: ranges};
			}
		}
	}

	return {range: range.value};
};

/**
 * Walk an `owl:equivalentClass` chain and surface any
 * `owl:Restriction` nodes inside its `owl:intersectionOf` rdf:List.
 *
 * Targets the BFO role-bearer pattern used in agent.ttl:
 *   Foo ≡ Person ⊓ ∃bfo:bearerOf.Role
 * Non-restriction list members (e.g. `foaf:Person`) and malformed structures
 * are skipped silently — Task 8 only needs the restrictions, and the codegen
 * pipeline must not crash on TTL we don't recognise.
 */
const extractEquivalentRestrictions = (
	store: Store,
	namedSubject: NamedNode,
): ReadonlyArray<EquivalentClassRestriction> => {
	let out = A.empty<EquivalentClassRestriction>();
	const equivQuads = store.getQuads(namedSubject, NamedNode.of(OWL_EQUIVALENT_CLASS), null, null);

	for (const equivQuad of equivQuads) {
		const equivSubject = subjectFromTerm(equivQuad.object);
		if (P.isUndefined(equivSubject)) continue;

		const intersectionQuads = store.getQuads(equivSubject, NamedNode.of(OWL_INTERSECTION_OF), null, null);

		for (const intersectionQuad of intersectionQuads) {
			let listHead = subjectFromTerm(intersectionQuad.object);
			// Walk the rdf:List: rdf:first holds the member, rdf:rest the next cell
			// (terminated by rdf:nil). Cap iterations defensively to avoid a cycle
			// on malformed input.
			let safety = 0;
			while (P.isNotUndefined(listHead) && Term.guards.BlankNode(listHead) && safety < 1024) {
				safety++;
				const firstQuads = store.getQuads(listHead, NamedNode.of(RDF_FIRST), null, null);
				const memberTerm = pipe(firstQuads, A.get(0), O.map((quad) => quad.object), O.getOrUndefined);
				const member = P.isUndefined(memberTerm)
					? undefined
					: subjectFromTerm(memberTerm);
				if (P.isNotUndefined(member)) {
					const memberTypes = pipe(
						store.getQuads(member, NamedNode.of(RDF_TYPE), null, null),
						A.map((quad) => quad.object),
						A.filter(Term.guards.NamedNode),
						A.map((term) => term.value),
					);
					if (A.contains(memberTypes, OWL_RESTRICTION)) {
						const onProperty = firstObjectValue(store, member, OWL_ON_PROPERTY);
						const someValuesFrom = firstObjectValue(store, member, OWL_SOME_VALUES_FROM);
						if (P.isNotUndefined(onProperty) && P.isNotUndefined(someValuesFrom)) {
							out = A.append(
								out,
								EquivalentClassRestriction.make({
									onProperty,
									someValuesFrom,
								}),
							);
						}
					}
					// Non-restriction members (e.g. foaf:Person) are skipped silently.
				}

				const restQuads = store.getQuads(listHead, NamedNode.of(RDF_REST), null, null);
				const restTerm = pipe(restQuads, A.get(0), O.map((quad) => quad.object), O.getOrUndefined);
				if (P.isUndefined(restTerm) || (Term.guards.NamedNode(restTerm) && restTerm.value === RDF_NIL)) {
					listHead = undefined;
				} else {
					listHead = subjectFromTerm(restTerm);
				}
			}
		}
	}

	return out;
};

class MutableClassRecord extends S.Class<MutableClassRecord>($I`MutableClassRecord`)({
	iri: S.String,
	label: S.String,
	definition: S.optionalKey(S.String),
	superClasses: S.Array(S.String),
	disjointWith: S.Array(S.String),
	equivalentClassRestrictions: S.Array(EquivalentClassRestriction),
	properties: S.Array(ClassProperty),
}, $I.annote("MutableClassRecord", {
	description: "Internal parser accumulator for a class record before finalization.",
})) {
}

const finalizeClass = (cls: MutableClassRecord): ClassRecord => ClassRecord.make({
	iri: cls.iri,
	label: cls.label,
	...O.getSomesStruct({definition: O.fromNullishOr(cls.definition)}),
	superClasses: cls.superClasses,
	disjointWith: cls.disjointWith,
	equivalentClassRestrictions: cls.equivalentClassRestrictions,
	properties: cls.properties,
});

/**
 * Concatenate `classes` arrays and union `prefixes` records across
 * multiple ClassTables. Used by the codegen entrypoint to feed
 * `emitIrisModule` the union of every vendored TTL — running codegen
 * against `media` then must not drop `EI.Expert` from `iris.ts`.
 *
 * Duplicates by IRI inside `classes` are de-duped (first-seen wins
 * to keep the merge stable across module ordering); for `prefixes`,
 * later tables override earlier ones (later TTLs are assumed to ship
 * the latest prefix mappings, though in practice the vendored TTLs
 * use the same prefix set so this is rarely visible).
 *
 * Stable: iterating an empty input or a single-table input returns
 * a structurally-equivalent ClassTable so the codegen pipeline keeps
 * working when only one TTL is vendored.
 *
 * @example
 * ```ts
 * import { mergeClassTables } from "./parseTtl.ts"
 *
 * const merged = mergeClassTables([])
 * console.log(merged.classes.length) // 0
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const mergeClassTables = (tables: ReadonlyArray<ClassTable>): ClassTable => {
	const classByIri = MutableHashMap.empty<string, ClassRecord>();
	const declaredProperties = MutableHashSet.empty<string>();
	let prefixes = R.empty<string, string>();
	for (const table of tables) {
		for (const cls of table.classes) {
			if (!MutableHashMap.has(classByIri, cls.iri)) MutableHashMap.set(classByIri, cls.iri, cls);
		}
		for (const property of table.declaredProperties) {
			MutableHashSet.add(declaredProperties, property);
		}
		for (const [prefix, iri] of R.toEntries(table.prefixes)) {
			prefixes = R.set(prefixes, prefix, iri);
		}
	}
	return ClassTable.make({
		classes: classByIri.pipe(MutableHashMap.values, A.fromIterable),
		declaredProperties: pipe(A.fromIterable(declaredProperties), A.sort(Str.Order)),
		prefixes,
	});
};

/**
 * Parse a Turtle document into the in-memory class table used by codegen.
 *
 * @remarks
 * The parser intentionally keeps range IRIs as strings; JSON Schema generation
 * performs cross-class range resolution later.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { parseTtlToClassTable } from "./parseTtl.ts"
 *
 * const ttl = `
 * @prefix owl: <http://www.w3.org/2002/07/owl#> .
 * @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
 * @prefix ei: <https://w3id.org/energy-intel/> .
 * ei:Expert a owl:Class ; rdfs:label "Expert" .
 * `
 * const program = parseTtlToClassTable(ttl).pipe(
 *   Effect.map((table) => table.classes.length)
 * )
 * console.log(Effect.runSync(program))
 * ```
 *
 * @category parsing
 * @since 0.0.0
 */
export const parseTtlToClassTable = (ttl: string): Effect.Effect<ClassTable, TtlParseError> => Effect.try((): ClassTable => {
		let prefixes = R.empty<string, string>();
		const parser = new Parser({format: "Turtle"});
		const quads = parser.parse(ttl, null, (prefix, iri) => {
			prefixes = R.set(prefixes, prefix, iri.value);
		});
		const store = new Store(quads);

		// Stage A: collect named owl:Class subjects (skip blank-node restrictions).
		// Map keyed by IRI gives O(1) dedup + O(1) lookup during property
		// attachment — the parser scales to ~300 classes for the full energy-intel
		// ontology.
		const classByIri = MutableHashMap.empty<string, MutableClassRecord>();
		const classQuads = store.getQuads(null, NamedNode.of(RDF_TYPE), NamedNode.of(OWL_CLASS), null);
		for (const quad of classQuads) {
			const subj = quad.subject;
			if (!isNamedSubject(subj)) continue;
			const iri = subj.value;
			if (MutableHashMap.has(classByIri, iri)) continue;
			const label = firstObjectValue(store, subj, RDFS_LABEL) ?? iri;
			const definition = firstObjectValue(store, subj, SKOS_DEF);
			const superClasses = objectValuesNamed(store, subj, RDFS_SUBCLASS);
			const disjointWith = objectValuesNamed(store, subj, OWL_DISJOINT);
			const equivalentClassRestrictions = extractEquivalentRestrictions(store, subj);
			MutableHashMap.set(classByIri, iri, MutableClassRecord.make({
				iri,
				label,
				...O.getSomesStruct({definition: O.fromNullishOr(definition)}),
				superClasses,
				disjointWith,
				equivalentClassRestrictions,
				properties: A.empty<ClassProperty>(),
			}));
		}

		// Stage B: walk owl:DatatypeProperty + owl:ObjectProperty subjects and
		// attach them to their declared rdfs:domain class. Cardinality is left
		// at the slice default (optional + single); Task 7 may revisit.
		const declaredProperties = MutableHashSet.empty<string>();
		for (const propType of A.make(OWL_DATATYPE_PROPERTY, OWL_OBJECT_PROPERTY)) {
			const propQuads = store.getQuads(null, NamedNode.of(RDF_TYPE), NamedNode.of(propType), null);
			for (const propQuad of propQuads) {
				const propSubj = propQuad.subject;
				if (!isNamedSubject(propSubj)) continue;
				const propIri = propSubj.value;
				MutableHashSet.add(declaredProperties, propIri);
				const label = firstObjectValue(store, propSubj, RDFS_LABEL);
				const range = propertyRange(store, propSubj);
				const domains = objectValuesNamed(store, propSubj, RDFS_DOMAIN);
				for (const domainIri of domains) {
					const domainClass = MutableHashMap.get(classByIri, domainIri);
					if (O.isNone(domainClass)) continue;
					const property = ClassProperty.make({
						iri: propIri,
						...O.getSomesStruct({label: O.fromNullishOr(label)}),
						...range,
					});
					MutableHashMap.set(classByIri, domainIri, MutableClassRecord.make({
						...domainClass.value,
						properties: A.append(domainClass.value.properties, property),
					}));
				}
			}
		}

		return ClassTable.make({
			classes: pipe(A.fromIterable(classByIri.pipe(MutableHashMap.values)), A.map(finalizeClass)),
			declaredProperties: pipe(A.fromIterable(declaredProperties), A.sort(Str.Order)),
			prefixes,
		});
}).pipe(TtlParseError.mapError("TTL parse failed"));
