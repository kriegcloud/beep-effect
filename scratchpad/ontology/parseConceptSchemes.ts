/**
 * Parse ontology_skill SKOS concept-scheme TTLs into a small typed table.
 *
 * This is deliberately separate from parseTtlToClassTable: OWL classes become
 * Effect Schema classes, while SKOS concepts are ontology individuals that
 * feed classification, filtering, and graph edges.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import {Effect, identity, pipe, SchemaGetter} from "effect";
import * as A from "effect/Array";
import * as MutableHashMap from "effect/MutableHashMap";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import {O} from "@beep/utils";
import {Parser, Store} from "n3";
import {$ScratchpadId} from "@beep/identity";
import {CauseTaggedError, SchemaUtils} from "@beep/schema";
import {NamedNode, QuadSubject, Term} from "./parseTtl.ts";

const $I = $ScratchpadId.create("ontology/parseConceptSchemes");

/**
 * RDF predicate IRI for term type assertions.
 *
 * @example
 * ```ts
 * import { RDF_TYPE } from "./parseConceptSchemes.ts"
 *
 * console.log(RDF_TYPE)
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const RDF_TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";

/**
 * OWL class IRI for named individuals.
 *
 * @example
 * ```ts
 * import { OWL_NAMED_INDIVIDUAL } from "./parseConceptSchemes.ts"
 *
 * console.log(OWL_NAMED_INDIVIDUAL)
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const OWL_NAMED_INDIVIDUAL = "http://www.w3.org/2002/07/owl#NamedIndividual";

/**
 * RDFS label predicate IRI.
 *
 * @example
 * ```ts
 * import { RDFS_LABEL } from "./parseConceptSchemes.ts"
 *
 * console.log(RDFS_LABEL)
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const RDFS_LABEL = "http://www.w3.org/2000/01/rdf-schema#label";

/**
 * SKOS alternate-label predicate IRI.
 *
 * @example
 * ```ts
 * import { SKOS_ALT_LABEL } from "./parseConceptSchemes.ts"
 *
 * console.log(SKOS_ALT_LABEL)
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const SKOS_ALT_LABEL = "http://www.w3.org/2004/02/skos/core#altLabel";

/**
 * SKOS broader-concept predicate IRI.
 *
 * @example
 * ```ts
 * import { SKOS_BROADER } from "./parseConceptSchemes.ts"
 *
 * console.log(SKOS_BROADER)
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const SKOS_BROADER = "http://www.w3.org/2004/02/skos/core#broader";

/**
 * SKOS concept class IRI.
 *
 * @example
 * ```ts
 * import { SKOS_CONCEPT } from "./parseConceptSchemes.ts"
 *
 * console.log(SKOS_CONCEPT)
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const SKOS_CONCEPT = "http://www.w3.org/2004/02/skos/core#Concept";

/**
 * SKOS concept-scheme class IRI.
 *
 * @example
 * ```ts
 * import { SKOS_CONCEPT_SCHEME } from "./parseConceptSchemes.ts"
 *
 * console.log(SKOS_CONCEPT_SCHEME)
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const SKOS_CONCEPT_SCHEME = "http://www.w3.org/2004/02/skos/core#ConceptScheme";

/**
 * SKOS definition predicate IRI.
 *
 * @example
 * ```ts
 * import { SKOS_DEFINITION } from "./parseConceptSchemes.ts"
 *
 * console.log(SKOS_DEFINITION)
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const SKOS_DEFINITION = "http://www.w3.org/2004/02/skos/core#definition";

/**
 * SKOS has-top-concept predicate IRI.
 *
 * @example
 * ```ts
 * import { SKOS_HAS_TOP_CONCEPT } from "./parseConceptSchemes.ts"
 *
 * console.log(SKOS_HAS_TOP_CONCEPT)
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const SKOS_HAS_TOP_CONCEPT = "http://www.w3.org/2004/02/skos/core#hasTopConcept";

/**
 * SKOS in-scheme predicate IRI.
 *
 * @example
 * ```ts
 * import { SKOS_IN_SCHEME } from "./parseConceptSchemes.ts"
 *
 * console.log(SKOS_IN_SCHEME)
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const SKOS_IN_SCHEME = "http://www.w3.org/2004/02/skos/core#inScheme";

/**
 * SKOS narrower-concept predicate IRI.
 *
 * @example
 * ```ts
 * import { SKOS_NARROWER } from "./parseConceptSchemes.ts"
 *
 * console.log(SKOS_NARROWER)
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const SKOS_NARROWER = "http://www.w3.org/2004/02/skos/core#narrower";

/**
 * SKOS preferred-label predicate IRI.
 *
 * @example
 * ```ts
 * import { SKOS_PREF_LABEL } from "./parseConceptSchemes.ts"
 *
 * console.log(SKOS_PREF_LABEL)
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const SKOS_PREF_LABEL = "http://www.w3.org/2004/02/skos/core#prefLabel";

/**
 * SKOS top-concept-of predicate IRI.
 *
 * @example
 * ```ts
 * import { SKOS_TOP_CONCEPT_OF } from "./parseConceptSchemes.ts"
 *
 * console.log(SKOS_TOP_CONCEPT_OF)
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const SKOS_TOP_CONCEPT_OF = "http://www.w3.org/2004/02/skos/core#topConceptOf";

const SortedUniqueStrings = S.Array(S.String).pipe(
	S.decodeTo(
		S.UniqueArray(S.String),
		{
			decode: SchemaGetter.transform((values: ReadonlyArray<string>) => pipe(values, A.dedupe, A.sort(Str.Order))),
			encode: SchemaGetter.transform((values: ReadonlyArray<string>) => pipe(values, A.sort(Str.Order))),
		},
	),
	S.withDecodingDefault(Effect.succeed(A.empty<string>())),
	$I.annoteSchema("SortedUniqueStrings", {
		description: "Private array schema that canonicalizes string lists into sorted unique values.",
	}),
);

const decodeSortedUniqueStrings = S.decodeSync(SortedUniqueStrings);

/**
 * Parsed SKOS concept individual with labels and concept graph edges.
 *
 * @example
 * ```ts
 * import { SkosConceptRecord } from "./parseConceptSchemes.ts"
 *
 * const concept = SkosConceptRecord.make({
 *   iri: "https://w3id.org/energy-intel/concept/Expert",
 *   slug: "Expert",
 *   label: "Expert",
 *   altLabels: [],
 *   topConcept: true,
 *   broader: [],
 *   narrower: []
 * })
 * console.log(concept.label)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export class SkosConceptRecord extends S.Class<SkosConceptRecord>($I`SkosConceptRecord`)({
	iri: S.String,
	slug: S.String,
	label: S.String,
	altLabels: SortedUniqueStrings,
	definition: S.optionalKey(S.String),
	inScheme: S.optionalKey(S.String),
	topConcept: SchemaUtils.BoolKeyDefaultFalse,
	broader: SortedUniqueStrings,
	narrower: SortedUniqueStrings,
}, $I.annote("SkosConceptRecord", {
	description: "Parsed SKOS concept individual with labels and concept graph edges.",
})) {
}

/**
 * Parsed SKOS concept scheme with its top concepts.
 *
 * @example
 * ```ts
 * import { SkosConceptSchemeRecord } from "./parseConceptSchemes.ts"
 *
 * const scheme = SkosConceptSchemeRecord.make({
 *   iri: "https://w3id.org/energy-intel/scheme/Role",
 *   slug: "Role",
 *   label: "Role",
 *   topConcepts: []
 * })
 * console.log(scheme.slug)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export class SkosConceptSchemeRecord extends S.Class<SkosConceptSchemeRecord>($I`SkosConceptSchemeRecord`)({
	iri: S.String,
	slug: S.String,
	label: S.String,
	definition: S.optionalKey(S.String),
	topConcepts: SortedUniqueStrings,
}, $I.annote("SkosConceptSchemeRecord", {
	description: "Parsed SKOS concept scheme with its top concepts.",
})) {
}

/**
 * Parsed table of SKOS concepts and concept schemes.
 *
 * @example
 * ```ts
 * import { ConceptSchemeTable } from "./parseConceptSchemes.ts"
 *
 * const table = ConceptSchemeTable.make({
 *   concepts: [],
 *   schemes: []
 * })
 * console.log(table.schemes.length)
 * ```
 *
 * @category tables
 * @since 0.0.0
 */
export class ConceptSchemeTable extends S.Class<ConceptSchemeTable>($I`ConceptSchemeTable`)({
	concepts: S.Array(SkosConceptRecord).pipe(SchemaUtils.withEmptyArrayDefaults<SkosConceptRecord>()),
	schemes: S.Array(SkosConceptSchemeRecord).pipe(SchemaUtils.withEmptyArrayDefaults<SkosConceptSchemeRecord>()),
}, $I.annote("ConceptSchemeTable", {
	description: "Parsed table of SKOS concepts and concept schemes.",
})) {
}

/**
 * Error raised when SKOS Turtle parsing fails.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { parseConceptSchemeTtl } from "./parseConceptSchemes.ts"
 *
 * const handled = parseConceptSchemeTtl("not turtle").pipe(
 *   Effect.catchTag("ConceptSchemeParseError", (error) => Effect.succeed(error.message))
 * )
 * console.log(Effect.runSync(handled))
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class ConceptSchemeParseError extends CauseTaggedError<ConceptSchemeParseError>($I`ConceptSchemeParseError`)("ConceptSchemeParseError", $I.annote("ConceptSchemeParseError", {
	description: "Error raised when SKOS Turtle parsing fails.",
})) {
}

const decodeSkosConceptRecord = S.decodeSync(SkosConceptRecord);
const decodeSkosConceptSchemeRecord = S.decodeSync(SkosConceptSchemeRecord);

const iriTail = (iri: string): string => {
	const hashTail = pipe(iri, Str.lastIndexOf("#"), O.map((hashIdx) => pipe(iri, Str.slice(hashIdx + 1))));
	const slashTail = pipe(
		iri,
		Str.lastIndexOf("/"),
		O.map((slashIdx) => pipe(iri, Str.slice(slashIdx + 1))),
		O.getOrElse(() => iri),
	);
	const tail = pipe(hashTail, O.getOrElse(() => slashTail));
	return Str.isEmpty(tail)
		? iri
		: tail;
};

const SkosSlugFromIri = S.String.pipe(
	S.decodeTo(
		S.String,
		{
			decode: SchemaGetter.transform(iriTail),
			encode: SchemaGetter.transform(identity),
		},
	),
	$I.annoteSchema("SkosSlugFromIri", {
		description: "Private normalization schema for deriving SKOS concept slugs from IRIs.",
	}),
);

const slugFromIri = S.decodeUnknownSync(SkosSlugFromIri);

const byIri = <T extends {
	readonly iri: string
}>(values: Iterable<T>): ReadonlyArray<T> => A.sortWith(values, (value) => value.iri, Str.Order);

const hasType = (store: Store, subject: QuadSubject, typeIri: string): boolean => pipe(store.getQuads(
	subject,
	NamedNode.of(RDF_TYPE),
	NamedNode.of(typeIri),
	null,
), A.isReadonlyArrayNonEmpty);


const literalValues = (
	store: Store,
	subject: QuadSubject,
	predicate: string,
): ReadonlyArray<string> => pipe(
	store.getQuads(subject, NamedNode.of(predicate), null, null),
	A.map((quad) => quad.object),
	A.filter(Term.guards.Literal),
	A.map((object) => object.value),
);

const namedObjectValues = (
	store: Store,
	subject: QuadSubject,
	predicate: string,
): ReadonlyArray<string> => pipe(
	store.getQuads(subject, NamedNode.of(predicate), null, null),
	A.map((quad) => quad.object),
	A.filter(Term.guards.NamedNode),
	A.map((object) => object.value),
);

const firstLiteral = (
	store: Store,
	subject: QuadSubject,
	predicates: ReadonlyArray<string>,
): string | undefined => pipe(predicates, A.reduce(
	O.none<string>(),
	(current, predicate) => pipe(current, O.orElse(() => A.head(literalValues(store, subject, predicate)))),
), O.getOrUndefined);

const firstNamedObject = (store: Store, subject: QuadSubject, predicate: string): string | undefined => pipe(namedObjectValues(store, subject, predicate),
	A.head,
	O.getOrUndefined,
);

const namedSubjects = (store: Store): ReadonlyArray<NamedNode> => pipe(
	store.getQuads(null, null, null, null),
	A.map((quad) => quad.subject),
	A.filter(QuadSubject.guards.NamedNode),
	A.map((subject) => subject.value),
	decodeSortedUniqueStrings,
	A.map(NamedNode.of),
);

/**
 * Parse SKOS concept-scheme Turtle into a typed concept table.
 *
 * @remarks
 * Concepts without a preferred or RDFS label are skipped because downstream
 * filters need a stable display label.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { parseConceptSchemeTtl } from "./parseConceptSchemes.ts"
 *
 * const ttl = `
 * @prefix skos: <http://www.w3.org/2004/02/skos/core#> .
 * @prefix ex: <https://example.com/> .
 * ex:Role a skos:Concept ; skos:prefLabel "Role" .
 * `
 * const program = parseConceptSchemeTtl(ttl).pipe(
 *   Effect.map((table) => table.concepts.length)
 * )
 * console.log(Effect.runSync(program))
 * ```
 *
 * @category parsing
 * @since 0.0.0
 */
export const parseConceptSchemeTtl = (ttl: string): Effect.Effect<ConceptSchemeTable, ConceptSchemeParseError> => Effect.try(() => {
		const parser = new Parser({format: "Turtle"});
		const store = new Store(parser.parse(ttl));
		let concepts = A.empty<SkosConceptRecord>();
		let schemes = A.empty<SkosConceptSchemeRecord>();

		for (const subject of namedSubjects(store)) {
			if (hasType(store, subject, SKOS_CONCEPT)) {
				const label = firstLiteral(store, subject, [
					SKOS_PREF_LABEL,
					RDFS_LABEL,
				]);
				if (P.isUndefined(label)) continue;
				const definition = firstLiteral(store, subject, [SKOS_DEFINITION]);
				const inScheme = firstNamedObject(store, subject, SKOS_IN_SCHEME);
				concepts = A.append(concepts, decodeSkosConceptRecord({
					iri: subject.value,
					slug: slugFromIri(subject.value),
					label,
					altLabels: literalValues(store, subject, SKOS_ALT_LABEL), ...O.getSomesStruct({
						definition: O.fromNullishOr(definition),
						inScheme: O.fromNullishOr(inScheme),
					}),
					topConcept: pipe(namedObjectValues(store, subject, SKOS_TOP_CONCEPT_OF), A.isReadonlyArrayNonEmpty),
					broader: namedObjectValues(store, subject, SKOS_BROADER),
					narrower: namedObjectValues(store, subject, SKOS_NARROWER),
				}));
			}

			if (hasType(store, subject, SKOS_CONCEPT_SCHEME) || (hasType(store, subject, OWL_NAMED_INDIVIDUAL) && pipe(namedObjectValues(store, subject, SKOS_HAS_TOP_CONCEPT),
				A.isReadonlyArrayNonEmpty,
			))) {
				const label = firstLiteral(store, subject, [
					SKOS_PREF_LABEL,
					RDFS_LABEL,
				]);
				if (P.isUndefined(label)) continue;
				const definition = firstLiteral(store, subject, [SKOS_DEFINITION]);
				schemes = A.append(schemes, decodeSkosConceptSchemeRecord({
					iri: subject.value,
					slug: slugFromIri(subject.value),
					label, ...O.getSomesStruct({
						definition: O.fromNullishOr(definition),
					}),
					topConcepts: namedObjectValues(store, subject, SKOS_HAS_TOP_CONCEPT),
				}));
			}
		}

		return ConceptSchemeTable.make({
			concepts: byIri(concepts),
			schemes: byIri(schemes),
		});
}).pipe(ConceptSchemeParseError.mapError("Failed to parse SKOS concept-scheme Turtle"));

/**
 * Merge parsed SKOS concept-scheme tables, preserving first-seen records by IRI.
 *
 * @example
 * ```ts
 * import { mergeConceptSchemeTables } from "./parseConceptSchemes.ts"
 *
 * const merged = mergeConceptSchemeTables([])
 * console.log(merged.concepts.length) // 0
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const mergeConceptSchemeTables = (tables: ReadonlyArray<ConceptSchemeTable>): ConceptSchemeTable => {
	const concepts = MutableHashMap.empty<string, SkosConceptRecord>();
	const schemes = MutableHashMap.empty<string, SkosConceptSchemeRecord>();

	for (const table of tables) {
		for (const concept of table.concepts) {
			if (!MutableHashMap.has(concepts, concept.iri)) MutableHashMap.set(concepts, concept.iri, concept);
		}
		for (const scheme of table.schemes) {
			if (!MutableHashMap.has(schemes, scheme.iri)) MutableHashMap.set(schemes, scheme.iri, scheme);
		}
	}

	return ConceptSchemeTable.make({
		concepts: concepts.pipe(MutableHashMap.values, byIri),
		schemes: schemes.pipe(MutableHashMap.values, byIri),
	});
};
