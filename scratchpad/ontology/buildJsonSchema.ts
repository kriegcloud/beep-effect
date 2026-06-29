// noinspection HttpUrlsUsage

/**
 * Class table → JSON Schema 2020-12 builder.
 *
 * Stage 2 of the TTL → Effect Schema codegen pipeline. Consumes the
 * `ClassTable` produced by Task 6's `parseTtl.ts` and emits a JSON Schema
 * 2020-12 document where each class becomes a `$defs` entry. Task 8 hands
 * this document to Effect's `SchemaRepresentation.fromJsonSchemaDocument` to
 * build an AST; Task 9 wires it all together.
 *
 * Scope discipline:
 * - No AST manipulation here (Task 8).
 * - No file IO (Task 9).
 * - `equivalentClassRestrictions` from `ClassRecord` are NOT consumed; Task 8
 *   folds them at the AST level. This builder simply ignores them.
 * - Cardinality is read straight off `ClassProperty.optional` / `.list`. Per
 *   Task 6's defaults every property starts optional + single, so `required`
 *   is omitted from output until upstream cardinality lands.
 *
 * Key sanitization choice: property keys use the IRI's last path segment or
 * fragment verbatim (alphanumeric + `_`), so `bfo:0000053` → `BFO_0000053`.
 * Task 8's AST post-processor can rename to friendlier names (`bearerOf`)
 * after the fact.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import {Effect, pipe} from "effect";
import * as A from "effect/Array";
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import {TaggedErrorClass} from "@beep/schema";
import {$ScratchpadId} from "@beep/identity";
import {ClassProperty, ClassTable} from "./parseTtl.ts";

const $I = $ScratchpadId.create("ontology/buildJsonSchema")

/**
 * Tagged error surfaced when the builder cannot resolve an ontology
 * range IRI to a primitive XSD type or to a class IRI in the same
 * table. Replaces the prior silent `console.warn` + permissive
 * `{ type: "string" }` fallback that let ontology typos sail through
 * to the generated schema.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { buildJsonSchema } from "./buildJsonSchema.ts"
 * import { ClassTable } from "./parseTtl.ts"
 *
 * const handled = buildJsonSchema(ClassTable.make({ classes: [], prefixes: {} })).pipe(
 *   Effect.catchTag("BuildJsonSchemaError", (error) => Effect.succeed(error.message))
 * )
 * console.log(handled)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class BuildJsonSchemaError extends TaggedErrorClass<BuildJsonSchemaError>()("BuildJsonSchemaError", {
	kind: S.tag("UnknownRange"),
	propertyIri: S.String,
	rangeIri: S.String,
	message: S.String,
}, $I.annote("BuildJsonSchemaError", {
	description: "Tagged error surfaced when the builder cannot resolve an ontology range IRI to a primitive XSD type or to a class IRI in the same table. Replaces the prior silent `console.warn` + permissive `{ type: \"string\" }` fallback that let ontology typos sail through to the generated schema.",
})) {
}

/**
 * Shared optional fields for JSON Schema primitive declarations.
 *
 * @example
 * ```ts
 * import { JsonSchemaPrimitiveBase } from "./buildJsonSchema.ts"
 *
 * const primitive = JsonSchemaPrimitiveBase.make({ format: "date-time" })
 * console.log(primitive.format)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export class JsonSchemaPrimitiveBase extends S.Class<JsonSchemaPrimitiveBase>($I`JsonSchemaPrimitiveBase`)({
	format: S.optionalKey(S.String),
}, $I.annote("JsonSchemaPrimitiveBase", {
	description: "Shared optional fields for JSON Schema primitive declarations.",
})) {
}

export declare namespace JsonSchemaPrimitiveBase {
	export interface Encoded {
		readonly format?: undefined | string
	}
}

/**
 * JSON Schema string primitive, optionally carrying a string format.
 *
 * @example
 * ```ts
 * import { JsonSchemaPrimitiveString } from "./buildJsonSchema.ts"
 *
 * const date = JsonSchemaPrimitiveString.make({ format: "date" })
 * console.log(date.type)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export class JsonSchemaPrimitiveString extends JsonSchemaPrimitiveBase.extend<JsonSchemaPrimitiveString>($I`JsonSchemaPrimitiveString`)({
		type: S.tag("string"),
	},
	$I.annote("JsonSchemaPrimitiveString", {
		description: "JSON Schema string primitive, optionally carrying a string format.",
	}),
) {
}

export declare namespace JsonSchemaPrimitiveString {
	export interface Encoded extends JsonSchemaPrimitiveBase.Encoded {
		readonly type: "string"
	}
}

/**
 * JSON Schema number primitive.
 *
 * @example
 * ```ts
 * import { JsonSchemaPrimitiveNumber } from "./buildJsonSchema.ts"
 *
 * const value = JsonSchemaPrimitiveNumber.make()
 * console.log(value.type)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export class JsonSchemaPrimitiveNumber extends JsonSchemaPrimitiveBase.extend<JsonSchemaPrimitiveNumber>($I`JsonSchemaPrimitiveNumber`)({
		type: S.tag("number"),
	},
	$I.annote("JsonSchemaPrimitiveNumber", {
		description: "JSON Schema number primitive.",
	}),
) {
}

export declare namespace JsonSchemaPrimitiveNumber {
	export interface Encoded extends JsonSchemaPrimitiveBase.Encoded {
		readonly type: "number"
	}
}

/**
 * JSON Schema integer primitive.
 *
 * @example
 * ```ts
 * import { JsonSchemaPrimitiveInt } from "./buildJsonSchema.ts"
 *
 * const value = JsonSchemaPrimitiveInt.make()
 * console.log(value.type)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export class JsonSchemaPrimitiveInt extends JsonSchemaPrimitiveBase.extend<JsonSchemaPrimitiveInt>($I`JsonSchemaPrimitiveInt`)({
		type: S.tag("integer"),
	},
	$I.annote("JsonSchemaPrimitiveInt", {
		description: "JSON Schema integer primitive.",
	}),
) {
}

export declare namespace JsonSchemaPrimitiveInt {
	export interface Encoded extends JsonSchemaPrimitiveBase.Encoded {
		readonly type: "integer"
	}
}

/**
 * JSON Schema boolean primitive.
 *
 * @example
 * ```ts
 * import { JsonSchemaPrimitiveBool } from "./buildJsonSchema.ts"
 *
 * const value = JsonSchemaPrimitiveBool.make()
 * console.log(value.type)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export class JsonSchemaPrimitiveBool extends JsonSchemaPrimitiveBase.extend<JsonSchemaPrimitiveBool>($I`JsonSchemaPrimitiveBool`)({
		type: S.tag("boolean"),
	},
	$I.annote("JsonSchemaPrimitiveBool", {
		description: "JSON Schema boolean primitive.",
	}),
) {
}

export declare namespace JsonSchemaPrimitiveBool {
	export interface Encoded extends JsonSchemaPrimitiveBase.Encoded {
		readonly type: "boolean"
	}
}

/**
 * Tagged union of JSON Schema primitive declarations.
 *
 * @example
 * ```ts
 * import { JsonSchemaPrimitive, JsonSchemaPrimitiveString } from "./buildJsonSchema.ts"
 *
 * const primitive = JsonSchemaPrimitiveString.make()
 * console.log(JsonSchemaPrimitive.guards.string(primitive)) // true
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const JsonSchemaPrimitive = S.Union([
	JsonSchemaPrimitiveString,
	JsonSchemaPrimitiveNumber,
	JsonSchemaPrimitiveInt,
	JsonSchemaPrimitiveBool,
]).pipe(S.toTaggedUnion("type"), $I.annoteSchema("JsonSchemaPrimitive", {
	description: "Tagged union of JSON Schema primitive declarations.",
}))

/**
 * Runtime type for {@link JsonSchemaPrimitive}. {@inheritDoc JsonSchemaPrimitive}
 *
 * @example
 * ```ts
 * import type { JsonSchemaPrimitive } from "./buildJsonSchema.ts"
 *
 * const typeName: JsonSchemaPrimitive["type"] = "string"
 * console.log(typeName)
 * ```
 *
 * @category type-level
 * @since 0.0.0
 */
export type JsonSchemaPrimitive = typeof JsonSchemaPrimitive.Type;

export declare namespace JsonSchemaPrimitive {
	export type Encoded =
		| JsonSchemaPrimitiveString.Encoded
		| JsonSchemaPrimitiveNumber.Encoded
		| JsonSchemaPrimitiveInt.Encoded
		| JsonSchemaPrimitiveBool.Encoded
}


/**
 * JSON Schema array declaration whose `items` points at another schema node.
 *
 * @example
 * ```ts
 * import { JsonSchemaArray, JsonSchemaPrimitiveString } from "./buildJsonSchema.ts"
 *
 * const array = JsonSchemaArray.make({
 *   items: JsonSchemaPrimitiveString.make()
 * })
 * console.log(array.type)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export class JsonSchemaArray extends S.Class<JsonSchemaArray>($I`JsonSchemaArray`)({
	type: S.tag("array"),
	items: S.suspend((): S.Codec<JsonSchemaProperty, JsonSchemaProperty.Encoded> => JsonSchemaProperty),
}, $I.annote("JsonSchemaArray", {
	description: "JSON Schema array declaration whose items points at another schema node.",
})) {
}

export declare namespace JsonSchemaArray {
	export interface Encoded {
		readonly type: "array"
		readonly items: JsonSchemaProperty.Encoded
	}
}

/**
 * JSON Schema local `$ref` declaration for class definitions.
 *
 * @example
 * ```ts
 * import { JsonSchemaRef } from "./buildJsonSchema.ts"
 *
 * const ref = JsonSchemaRef.make({ $ref: "#/$defs/Expert" })
 * console.log(ref.$ref)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export class JsonSchemaRef extends S.Class<JsonSchemaRef>($I`JsonSchemaRef`)({
	type: S.tag("$ref"),
	$ref: S.String,
}, $I.annote("JsonSchemaRef", {
	description: "JSON Schema local $ref declaration for class definitions.",
})) {
}

export declare namespace JsonSchemaRef {
	export interface Encoded {
		readonly type: "$ref"
		readonly $ref: string
	}
}

/**
 * JSON Schema `anyOf` declaration for RDF union ranges.
 *
 * @example
 * ```ts
 * import { JsonSchemaAnyOf, JsonSchemaPrimitiveString } from "./buildJsonSchema.ts"
 *
 * const union = JsonSchemaAnyOf.make({
 *   anyOf: [JsonSchemaPrimitiveString.make()]
 * })
 * console.log(union.anyOf.length)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export class JsonSchemaAnyOf extends S.Class<JsonSchemaAnyOf>($I`JsonSchemaAnyOf`)({
	type: S.tag("anyOf"),
	anyOf: S.Array(S.suspend((): S.Codec<JsonSchemaProperty, JsonSchemaProperty.Encoded> => JsonSchemaProperty)),
}, $I.annote("JsonSchemaAnyOf", {
	description: "JSON Schema anyOf declaration for RDF union ranges.",
})) {
}

export declare namespace JsonSchemaAnyOf {
	export interface Encoded {
		readonly type: "anyOf"
		readonly anyOf: ReadonlyArray<JsonSchemaProperty.Encoded>
	}
}

/**
 * Recursive JSON Schema property node emitted for ontology properties.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { JsonSchemaPrimitiveString, JsonSchemaProperty } from "./buildJsonSchema.ts"
 *
 * const property = JsonSchemaPrimitiveString.make()
 * console.log(S.is(JsonSchemaProperty)(property)) // true
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const JsonSchemaProperty = S.Union([
	JsonSchemaPrimitive,
	S.suspend((): S.Codec<JsonSchemaArray, JsonSchemaArray.Encoded> => JsonSchemaArray),
	JsonSchemaRef,
	S.suspend((): S.Codec<JsonSchemaAnyOf, JsonSchemaAnyOf.Encoded> => JsonSchemaAnyOf),
]).pipe($I.annoteSchema("JsonSchemaProperty", {
	description: "Recursive JSON Schema property node emitted for ontology properties.",
}))

/**
 * Runtime type for {@link JsonSchemaProperty}. {@inheritDoc JsonSchemaProperty}
 *
 * @example
 * ```ts
 * import type { JsonSchemaProperty } from "./buildJsonSchema.ts"
 *
 * const typeName: JsonSchemaProperty["type"] = "string"
 * console.log(typeName)
 * ```
 *
 * @category type-level
 * @since 0.0.0
 */
export type JsonSchemaProperty = typeof JsonSchemaProperty.Type;

export declare namespace JsonSchemaProperty {
	export type Encoded =
		| JsonSchemaPrimitive.Encoded
		| JsonSchemaArray.Encoded
		| JsonSchemaRef.Encoded
		| JsonSchemaAnyOf.Encoded
}

/**
 * JSON Schema object definition emitted for a parsed ontology class.
 *
 * @example
 * ```ts
 * import { JsonSchemaObject } from "./buildJsonSchema.ts"
 *
 * const object = JsonSchemaObject.make({ properties: {} })
 * console.log(object.type)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export class JsonSchemaObject extends S.Class<JsonSchemaObject>($I`JsonSchemaObject`)({
	type: S.tag("object"),
	properties: S.Record(S.String, JsonSchemaProperty),
	required: S.String.pipe(S.Array, S.optionalKey),
	description: S.String.pipe(S.optionalKey),
}, $I.annote("JsonSchemaObject", {
	description: "JSON Schema object definition emitted for a parsed ontology class.",
})) {
}

export declare namespace JsonSchemaObject {
	export interface Encoded {
		readonly type: "object";
		readonly properties: Record<string, JsonSchemaProperty>;
		readonly required?: undefined | ReadonlyArray<string>;
		readonly description?: undefined | string;
	}
}

/**
 * JSON Schema 2020-12 document generated from a parsed class table.
 *
 * @example
 * ```ts
 * import { JsonSchemaDocument } from "./buildJsonSchema.ts"
 *
 * const document = JsonSchemaDocument.make({
 *   $schema: "https://json-schema.org/draft/2020-12/schema",
 *   $defs: {}
 * })
 * console.log(document.$schema)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export class JsonSchemaDocument extends S.Class<JsonSchemaDocument>($I`JsonSchemaDocument`)({
	$schema: S.tag("https://json-schema.org/draft/2020-12/schema"),
	$id: S.optionalKey(S.String),
	$defs: S.Record(S.String, JsonSchemaObject),
}, $I.annote("JsonSchemaDocument", {
	description: "JSON Schema 2020-12 document generated from a parsed class table.",
})) {
}

export declare namespace JsonSchemaDocument {
	export interface Encoded {
		readonly $schema: "https://json-schema.org/draft/2020-12/schema";
		readonly $id?: undefined | string;
		readonly $defs: Record<string, JsonSchemaObject>;
	}
}

const JSON_SCHEMA_2020_12 = "https://json-schema.org/draft/2020-12/schema";

/**
 * External ontology range IRIs accepted as string-valued references.
 *
 * @example
 * ```ts
 * import * as HashSet from "effect/HashSet"
 * import { ALLOWED_EXTERNAL_RANGE_IRIS } from "./buildJsonSchema.ts"
 *
 * const allowed = HashSet.has(ALLOWED_EXTERNAL_RANGE_IRIS, "http://xmlns.com/foaf/0.1/Person")
 * console.log(allowed) // true
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const ALLOWED_EXTERNAL_RANGE_IRIS = HashSet.make(
	"http://purl.obolibrary.org/obo/IAO_0000030",
	"http://qudt.org/schema/qudt/Unit",
	"http://www.w3.org/2004/02/skos/core#Concept",
	"http://www.w3.org/ns/dcat#Dataset",
	"http://www.w3.org/ns/dcat#Distribution",
	"http://xmlns.com/foaf/0.1/Person",
);

/**
 * Options controlling JSON Schema range resolution.
 *
 * @example
 * ```ts
 * import { BuildJsonSchemaOptions } from "./buildJsonSchema.ts"
 *
 * const options = BuildJsonSchemaOptions.make()
 * console.log(options.allowedExternalRangeIris)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export class BuildJsonSchemaOptions extends S.Class<BuildJsonSchemaOptions>($I`BuildJsonSchemaOptions`)({
	/**
	 * Optional union of all parsed ontology modules. Ranges pointing at another
	 * local energy-intel class are valid, even when that target lives in a
	 * different generated module. They render as strings in this module's
	 * self-contained JSON Schema; same-module ranges still use `$ref`.
	 */
	rangeTable: S.optionalKey(ClassTable).annotateKey({
		description: "Optional union of all parsed ontology modules. Ranges pointing at another\nlocal energy-intel class are valid, even when that target lives in a\ndifferent generated module. They render as strings in this module's\nself-contained JSON Schema; same-module ranges still use `$ref`.",
	}),
	/**
	 * Explicit allow-list for external ontology classes used as object ranges.
	 * Keeping this narrow preserves the "ontology typos fail codegen" guardrail.
	 */
	allowedExternalRangeIris: S.HashSet(S.String).pipe(S.optionalKey, S.annotateKey({
		description: "Explicit allow-list for external ontology classes used as object ranges.\nKeeping this narrow preserves the \"ontology typos fail codegen\" guardrail.",
	})),
}, $I.annote("BuildJsonSchemaOptions", {
	description: "Options controlling JSON Schema range resolution.",
})) {
}

export declare namespace BuildJsonSchemaOptions {
	export interface Encoded {
		/**
		 * Optional union of all parsed ontology modules. Ranges pointing at another
		 * local energy-intel class are valid, even when that target lives in a
		 * different generated module. They render as strings in this module's
		 * self-contained JSON Schema; same-module ranges still use `$ref`.
		 */
		readonly rangeTable?: ClassTable;
		/**
		 * Explicit allow-list for external ontology classes used as object ranges.
		 * Keeping this narrow preserves the "ontology typos fail codegen" guardrail.
		 */
		readonly allowedExternalRangeIris?: HashSet.HashSet<string>;
	}
}

/**
 * XSD datatype IRI → JSON Schema primitive shape.
 *
 * Covers the slice's expected datatypes; any IRI not present here either
 * resolves to a class `$ref` or falls through to a `string` default with a
 * `console.warn` (see `mapRange`).
 */
const XSD_TYPE_MAP = HashMap.make(
	["http://www.w3.org/2001/XMLSchema#string", JsonSchemaPrimitiveString.make()],
	["http://www.w3.org/2001/XMLSchema#integer", JsonSchemaPrimitiveInt.make()],
	["http://www.w3.org/2001/XMLSchema#decimal", JsonSchemaPrimitiveNumber.make()],
	["http://www.w3.org/2001/XMLSchema#double", JsonSchemaPrimitiveNumber.make()],
	["http://www.w3.org/2001/XMLSchema#float", JsonSchemaPrimitiveNumber.make()],
	["http://www.w3.org/2001/XMLSchema#boolean", JsonSchemaPrimitiveBool.make()],
	["http://www.w3.org/2001/XMLSchema#dateTime", JsonSchemaPrimitiveString.make({
		format: "date-time",
	})],
	["http://www.w3.org/2001/XMLSchema#date", JsonSchemaPrimitiveString.make({
		format: "date",
	})],
);

/**
 * Last URL path segment / fragment, with non-alphanumeric chars (other than
 * underscore) collapsed. Drives both `$defs` keys and property keys.
 *
 *  https://w3id.org/energy-intel/Expert    -> Expert
 *  http://xmlns.com/foaf/0.1/name          -> name
 *  http://purl.obolibrary.org/obo/BFO_0000053 -> BFO_0000053
 *  https://w3id.org/energy-intel/age#hash  -> hash
 */
const localName = (iri: string): string => {
	const hashTail = pipe(
		iri,
		Str.lastIndexOf("#"),
		O.map((hashIdx) => pipe(iri, Str.slice(hashIdx + 1))),
	);
	const slashTail = pipe(
		iri,
		Str.lastIndexOf("/"),
		O.map((slashIdx) => pipe(iri, Str.slice(slashIdx + 1))),
		O.getOrElse(() => iri),
	);
	const tail = pipe(
		hashTail,
		O.getOrElse(() => slashTail),
	);
	// JSON Schema property keys must be JSON strings (no constraint at spec
	// level), but downstream Effect code generation prefers identifier-safe
	// keys. Replace runs of non-(alnum|underscore) with underscore.
	const sanitized = pipe(tail, Str.replace(/[^A-Za-z0-9_]+/g, "_"));
	return Str.isEmpty(sanitized)
		? "_"
		: sanitized;
};

/**
 * Lookup context for resolving property range IRIs into JSON Schema nodes.
 *
 * @remarks
 * Same-table classes become `$ref` values, known external ranges become
 * strings, and unknown ranges fail through {@link BuildJsonSchemaError}.
 *
 * @example
 * ```ts
 * import * as HashMap from "effect/HashMap"
 * import * as HashSet from "effect/HashSet"
 * import { RangeContext } from "./buildJsonSchema.ts"
 *
 * const context = RangeContext.make({
 *   classDefKeys: HashMap.empty(),
 *   knownClassIris: HashSet.empty(),
 *   allowedExternalRangeIris: HashSet.empty()
 * })
 * console.log(HashMap.size(context.classDefKeys))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export class RangeContext extends S.Class<RangeContext>($I`RangeContext`)(
	{
		classDefKeys: S.HashMap(S.String, S.String),
		knownClassIris: S.HashSet(S.String),
		allowedExternalRangeIris: S.HashSet(S.String)
	},
	$I.annote("RangeContext", {
		description: "Lookup context for resolving property range IRIs into JSON Schema nodes."
	})
)  {}
declare namespace RangeContext {
	export interface Encoded {
		readonly classDefKeys: HashMap.HashMap<string, string>;
		readonly knownClassIris: HashSet.HashSet<string>;
		readonly allowedExternalRangeIris: HashSet.HashSet<string>;
	}
}

const mapRangeIri = Effect.fnUntraced(function* (
	prop: ClassProperty,
	range: string,
	context: RangeContext,
): Effect.fn.Return<JsonSchemaProperty, BuildJsonSchemaError> {
	const xsd = HashMap.get(XSD_TYPE_MAP, range);
	if (O.isSome(xsd)) return JsonSchemaProperty.make(xsd.value);
	const defKey = HashMap.get(context.classDefKeys, range);
	if (O.isSome(defKey)) return JsonSchemaRef.make({$ref: `#/$defs/${defKey.value}`});
	if (HashSet.has(context.knownClassIris, range) || HashSet.has(context.allowedExternalRangeIris, range)) {
		return JsonSchemaPrimitiveString.make();
	}
	return yield* BuildJsonSchemaError.make({
		kind: "UnknownRange",
		propertyIri: prop.iri,
		rangeIri: range,
		message: `Unknown range IRI: ${range} on property ${prop.iri}`,
	});
});

const mapRange = Effect.fnUntraced(function* (
	prop: ClassProperty,
	context: RangeContext,
): Effect.fn.Return<JsonSchemaProperty, BuildJsonSchemaError> {
	const rangeUnion = prop.rangeUnion;
	if (rangeUnion !== undefined) {
		const anyOf = yield* Effect.forEach(rangeUnion, (range) => mapRangeIri(prop, range, context));
		return A.match(anyOf, {
			onEmpty: () => JsonSchemaAnyOf.make({
				anyOf: A.empty(),
			}),
			onNonEmpty: (values) => A.isReadonlyArrayNonEmpty(A.tailNonEmpty(values))
				? JsonSchemaAnyOf.make({
					anyOf,
				})
				: JsonSchemaProperty.make(A.headNonEmpty(values)),
		});
	}

	const range = prop.range;
	if (range === undefined) {
		return JsonSchemaPrimitiveString.make();
	}

	return yield* mapRangeIri(prop, range, context);
});

const propertyShape = Effect.fnUntraced(function* (
	prop: ClassProperty,
	context: RangeContext,
): Effect.fn.Return<JsonSchemaProperty, BuildJsonSchemaError> {
	const base = yield* mapRange(prop, context);
	return prop.list
		? JsonSchemaArray.make({
			items: base,
		})
		: JsonSchemaProperty.make(base);
});

/**
 * Build a self-contained JSON Schema document from a parsed ontology class table.
 *
 * @remarks
 * Properties whose ranges point to same-table classes become `$ref` entries.
 * Known external object ranges are represented as strings so each generated
 * module remains standalone.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { buildJsonSchema } from "./buildJsonSchema.ts"
 * import { ClassTable } from "./parseTtl.ts"
 *
 * const program = buildJsonSchema(ClassTable.make({ classes: [], prefixes: {} })).pipe(
 *   Effect.map((document) => document.$schema)
 * )
 * console.log(program)
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const buildJsonSchema = Effect.fn("Ontology.buildJsonSchema")(function* (
	table: ClassTable,
	options: BuildJsonSchemaOptions = BuildJsonSchemaOptions.make(),
): Effect.fn.Return<JsonSchemaDocument, BuildJsonSchemaError> {
	// Pre-build IRI → $defs key map so cross-class $ref resolution is O(1)
	// and order-independent (a property's range may resolve to a class that
	// appears later in `table.classes`).
	const classDefKeys = HashMap.fromIterable(pipe(
		table.classes,
		A.map((cls): readonly [string, string] => [cls.iri, localName(cls.iri)]),
	));
	const knownClassIris = HashSet.fromIterable(pipe(
		(options.rangeTable ?? table).classes,
		A.map((cls) => cls.iri),
	));
	const context: RangeContext = {
		classDefKeys,
		knownClassIris,
		allowedExternalRangeIris: options.allowedExternalRangeIris ?? ALLOWED_EXTERNAL_RANGE_IRIS,
	};

	let $defs = R.empty<string, JsonSchemaObject>();
	for (const cls of table.classes) {
		const defKey = pipe(
			HashMap.get(classDefKeys, cls.iri),
			O.getOrElse(() => localName(cls.iri)),
		);
		let properties = R.empty<string, JsonSchemaProperty>();
		for (const prop of cls.properties) {
			const key = localName(prop.iri);
			properties = R.set(properties, key, yield* propertyShape(prop, context));
		}
		// TODO: emit `required: [...]` once parseTtl wires owl:Restriction
		// cardinality off blank-node restrictions; today every property is
		// optional per parseTtl.ts default.
		$defs = R.set($defs, defKey, JsonSchemaObject.make({
			properties,
		}));
	}

	return {
		$schema: JSON_SCHEMA_2020_12,
		$defs,
	};
});
