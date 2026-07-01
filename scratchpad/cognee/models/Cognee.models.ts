/**
 * User-facing TypeScript type surface for the cognee SDK.
 *
 * These types are extracted from `native.ts` so that `cognee.ts` and
 * user code can import them without pulling in the full `NativeBindings`
 * interface. `native.ts` re-exports everything from here for backward
 * compatibility.
 *
 * @fileoverview Cognee Data Models
 * @packageDocumentation
 * @since 0.0.0
 * @author elpresidank
 */
import { $ScratchpadId } from "@beep/identity";
import {withNoneDefault} from "@beep/schema/SchemaUtils";
import * as S from "effect/Schema";
import { O } from "@beep/utils";
import { LiteralKit, SchemaUtils, FilePath, UUID, DirectedGraph} from "@beep/schema";


const $I = $ScratchpadId.create("Cognee/Cognee.models");

// ─────────────────────────────────────────────────────────────────────────────
// Phase 3 types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * `effect/Schema` Class schema for the `text` type member of the `add` input discriminated union {@see `cogneeAdd`}.
 *
 * @example
 * ```ts
 *  import { TextInput, DataInput } from "@beep/cognee/models/Cognee.models";
 *  import { Console, Effect } from "effect";
 *  import * as S from "effect/Schema";
 *  import { BunRuntime } from "@effect/platform-bun";
 *
 *  const program = Effect.gen(function* () {
 *    const fact = yield* TextInput.makeEffect({ text: "beep hole." })
 *
 *    yield* DataInput.match(fact, {
 *      text: (textFact) => Console.log(`text type: ${textFact.text}`),
 *      file: (fileFact) => Console.log(`file type: ${fileFact.file}`),
 *      url: (urlFact) => Console.log(`url type: ${urlFact.url.toString()}`),
 *      binary: (binaryFact) => Console.log(`binary type: ${binaryFact.name}`),
 *    });
 *  }).pipe(
 *    Effect.catch({
 *     SchemaError: (error) => Effect.logError(error),
 *    }),
 *    Effect.orDie
 *  )
 *
 *  BunRuntime.runMain(program);
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class TextInput extends S.Class<TextInput>($I`TextInput`)(
	{
		type: S.tag("text"),
		text: S.String,
	},
	$I.annote("TextInput", {
		description: "Text type member of the `add` input discriminated union {@see `cogneeAdd`}."
	})
) {}

/**
 * `effect/Schema` Class schema for the `file` type member of the `add` input discriminated union {@see `cogneeAdd`}.
 *
 * @example
 * ```ts
 *  import { FileInput, DataInput } from "@beep/cognee/models/Cognee.models";
 *  import { Console, Effect } from "effect";
 *  import { FilePath } from "@beep/schema";
 *  import * as S from "effect/Schema";
 *  import { BunRuntime } from "@effect/platform-bun";
 *
 *  const program = Effect.gen(function* () {
 *    const fact = yield* FileInput.makeEffect({ path: FilePath.make("/home/username/desktop") })
 *
 *    yield* DataInput.match(fact, {
 *      text: (textFact) => Console.log(`text type: ${textFact.path}`),
 *      file: (fileFact) => Console.log(`file type: ${fileFact.file}`),
 *      url: (urlFact) => Console.log(`url type: ${urlFact.url.toString()}`),
 *      binary: (binaryFact) => Console.log(`binary type: ${binaryFact.name}`),
 *    });
 *  }).pipe(
 *    Effect.catch({
 *     SchemaError: (error) => Effect.logError(error),
 *    }),
 *    Effect.orDie
 *  )
 *
 *  BunRuntime.runMain(program);
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FileInput extends S.Class<FileInput>($I`FileInput`)(
	{
		type: S.tag("file"),
		path: FilePath,
	},
	$I.annote("FileInput", {
		description: "File type member of the `add` input discriminated union {@see `cogneeAdd`}."
	})
) {}

/**
 * `effect/Schema` Class schema for the `url` type member of the `add` input discriminated union {@see `cogneeAdd`}.
 *
 * @example
 * ```ts
 *  import { UrlInput, DataInput } from "@beep/cognee/models/Cognee.models";
 *  import { Console, Effect } from "effect";
 *  import * as S from "effect/Schema";
 *  import { BunRuntime } from "@effect/platform-bun";
 *
 *  const program = Effect.gen(function* () {
 *    const fact = yield* UrlInput.makeEffect({ url: "beep hole." })
 *
 *    yield* DataInput.match(fact, {
 *      text: (textFact) => Console.log(`text type: ${textFact.text}`),
 *      file: (fileFact) => Console.log(`file type: ${fileFact.file}`),
 *      url: (urlFact) => Console.log(`url type: ${urlFact.url.toString()}`),
 *      binary: (binaryFact) => Console.log(`binary type: ${binaryFact.name}`),
 *    });
 *  }).pipe(
 *    Effect.catch({
 *     SchemaError: (error) => Effect.logError(error),
 *    }),
 *    Effect.orDie
 *  )
 *
 *  BunRuntime.runMain(program);
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class UrlInput extends S.Class<UrlInput>($I`UrlInput`)(
	{
		type: S.tag("url"),
		url: S.URLFromString,
	},
	$I.annote("UrlInput", {
		description: "Url type member of the `add` input discriminated union {@see `cogneeAdd`}."
	})
) {}

/**
 * `effect/Schema` Class schema for the `binary` type member of the `add` input discriminated union {@see `cogneeAdd`}.
 *
 * @example
 * ```ts
 *  import { BinaryInput, DataInput } from "@beep/cognee/models/Cognee.models";
 *  import { Console, Effect } from "effect";
 *  import * as S from "effect/Schema";
 *  import { BunRuntime } from "@effect/platform-bun";
 *
 *  const program = Effect.gen(function* () {
 *    const fact = yield* BinaryInput.makeEffect({ bytes: [1], name: "bytehole" })
 *
 *    yield* DataInput.match(fact, {
 *      binary: (binaryFact) => Console.log(`binary type: ${binaryFact.binary}`),
 *      file: (fileFact) => Console.log(`file type: ${fileFact.file}`),
 *      url: (urlFact) => Console.log(`url type: ${urlFact.url.toString()}`),
 *      binary: (binaryFact) => Console.log(`binary type: ${binaryFact.name}`),
 *    });
 *  }).pipe(
 *    Effect.catch({
 *     SchemaError: (error) => Effect.logError(error),
 *    }),
 *    Effect.orDie
 *  )
 *
 *  BunRuntime.runMain(program);
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class BinaryInput extends S.Class<BinaryInput>($I`BinaryInput`)(
	{
		type: S.tag("binary"),
		bytes: S.Union([S.Array(S.Finite), S.Uint8Array]),
		name: S.String,
	},
	$I.annote("BinaryInput", {
		description: "Binary type member of the `add` input discriminated union {@see `cogneeAdd`}."
	})
) {}

/**
 * A single `add` input (discriminated union; see `cogneeAdd`).
 *
 * @example
 * ```ts
 *  import { BinaryInput, DataInput } from "@beep/cognee/models/Cognee.models";
 *  import { Console, Effect } from "effect";
 *  import * as S from "effect/Schema";
 *  import { BunRuntime } from "@effect/platform-bun";
 *
 *  const program = Effect.gen(function* () {
 *    const fact = yield* BinaryInput.makeEffect({ binary: "beep hole." })
 *
 *    yield* DataInput.match(fact, {
 *      binary: (binaryFact) => Console.log(`binary type: ${binaryFact.binary}`),
 *      file: (fileFact) => Console.log(`file type: ${fileFact.file}`),
 *      url: (urlFact) => Console.log(`url type: ${urlFact.url.toString()}`),
 *      binary: (binaryFact) => Console.log(`binary type: ${binaryFact.name}`),
 *    });
 *  }).pipe(
 *    Effect.catch({
 *     SchemaError: (error) => Effect.logError(error),
 *    }),
 *    Effect.orDie
 *  )
 *
 *  BunRuntime.runMain(program);
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const DataInput = S.Union(
	[
		TextInput,
		FileInput,
		UrlInput,
		BinaryInput,
	]
).pipe(
	S.toTaggedUnion("type"),
	$I.annoteSchema("DataInput", {
		description: "A single `add` input (discriminated union; see `cogneeAdd`)."
	})
)

/**
 * Companion type for {@link DataInput}.
 *
 * @example
 * ```ts
 *  import { TextInput, DataInput } from "@beep/cognee/models/Cognee.models";
 *  import { Console, Effect } from "effect";
 *  import * as S from "effect/Schema";
 *  import { BunRuntime } from "@effect/platform-bun";
 *
 *  const program = Effect.gen(function* () {
 *    const fact: DataInput = yield* TextInput.makeEffect({ text: "beep hole." })
 *
 *    yield* DataInput.match(fact, {
 *      text: (textFact) => Console.log(`text type: ${textFact.text}`),
 *      file: (fileFact) => Console.log(`file type: ${fileFact.file}`),
 *      url: (urlFact) => Console.log(`url type: ${urlFact.url.toString()}`),
 *      binary: (binaryFact) => Console.log(`binary type: ${binaryFact.name}`),
 *    });
 *  }).pipe(
 *    Effect.catch({
 *     SchemaError: (error) => Effect.logError(error),
 *    }),
 *    Effect.orDie
 *  )
 *
 *  BunRuntime.runMain(program);
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type DataInput = typeof DataInput.Type;

/**
 * Options accepted by `cogneeAdd` / the add phase of `cogneeAddAndCognify`
 *
 * @example
 * ```ts
 * import {AddOptions} from "@beep/cognee/models/Cognee.models";
 * import { O } from "@beep/schema";
 *
 * const addOptions: AddOptions = AddOptions.make({
 *  tenant: O.none()
 * });
 * ```
 *
 * @category configurations
 * @since 0.0.0
 */
export class AddOptions extends S.Class<AddOptions>($I`AddOptions`)(
	{
		/**
		 * Tenant UUID string (multi-tenant scoping); defaults to
		 *
		 * @default O.Option<string>
		 */
		tenant: S.String.pipe(S.OptionFromOptionalKey, SchemaUtils.withNoneDefault, S.annotateKey({
			description: "Tenant UUID string (multi-tenant scoping); defaults to",
			default: O.none()
		}))
	},
	$I.annote("AddOptions", {
		description: "Options accepted by `cogneeAdd` / the add phase of `cogneeAddAndCognify`"
	})
) {}

const OptFromOptionalStr = S.OptionFromOptionalKey(S.String)
const OptFromOptionalNum = S.OptionFromOptionalKey(S.Finite)
const OptFromOptionalBool = S.OptionFromOptionalKey(S.Boolean)

/**
 * Per-call cognify config overrides (applied on top of the handle config).
 *
 * @example
 *
 * @category models
 * @since 0.0.0
 */
export class CognifyOptions extends S.Class<CognifyOptions>($I`CognifyOptions`)(
	{
		tenant: OptFromOptionalStr,
		chunkSize: OptFromOptionalNum,
		chunkOverlap: OptFromOptionalNum,
		summarization: OptFromOptionalBool,
		temporalCognify: OptFromOptionalBool,
		/** Index `"source → relation → target"` triplet embeddings. */
		triplet: OptFromOptionalBool.annotateKey({
			description: "Index `\"source → relation → target\"` triplet embeddings."
		}),
	},
	$I.annote("CognifyOptions", {
		description: "Per-call cognify config overrides (applied on top of the handle config)."
	})
) {}

/**
 * A data item row. Mirrors `cognee_models::Data` (Serialize).
 *
 * All fields are snake_case (Rust's default `serde` serialization).
 *
 * @example
 *
 * @category models
 * @since 0.0.0
 */
export class DataRecord extends S.Class<DataRecord>($I`DataRecord`)(
	{
		id: S.String,
		name: S.String,
		raw_data_location: S.String,
		original_data_location: S.String,
		extension: S.String,
		mime_type: S.String,
		content_hash: S.String,
		owner_id: S.String,
		created_at: S.String,
		updated_at: S.String.pipe(S.OptionFromOptionalKey, SchemaUtils.withNoneDefault),
		label: S.String.pipe(S.OptionFromOptionalKey, SchemaUtils.withNoneDefault),
		original_extension: S.String.pipe(S.OptionFromOptionalKey, SchemaUtils.withNoneDefault),
		original_mime_type: S.String.pipe(S.OptionFromOptionalKey, SchemaUtils.withNoneDefault),
		loader_engine: S.String.pipe(S.OptionFromOptionalKey, SchemaUtils.withNoneDefault),
		raw_content_hash: S.String.pipe(S.OptionFromOptionalKey, SchemaUtils.withNoneDefault),
		tenant_id: S.String.pipe(S.OptionFromOptionalKey, SchemaUtils.withNoneDefault),
		external_metadata: S.String.pipe(S.OptionFromOptionalKey, SchemaUtils.withNoneDefault),
		node_set: S.String.pipe(S.OptionFromOptionalKey, SchemaUtils.withNoneDefault),
		pipeline_status: S.String.pipe(S.OptionFromOptionalKey, SchemaUtils.withNoneDefault),
		token_count: S.Finite,
		data_size: S.Finite,
		last_accessed: S.String.pipe(S.OptionFromOptionalKey, SchemaUtils.withNoneDefault),
		importance_weight: S.Number.pipe(S.OptionFromNullOr, SchemaUtils.withNoneDefault),

	},
	$I.annote("DataRecord", {
		description: "A data item row. Mirrors `cognee_models::Data` (Serialize)."
	})
) {}

/**
 * Result of `cogneeAdd`.
 *
 * `AddPipeline::add` returns one row per input including duplicates (the
 * duplicate path returns the pre-existing row), so the binding pre-scans the
 * dataset and partitions the result: `added` holds only the items newly created
 * by this call, `deduplicated` holds the ones that already existed. An empty
 * `added` array (`addedCount === 0`) means every submitted item was a duplicate.
 *
 * @example
 *
 * @category models
 * @since 0.0.0
 */
export class AddResult extends S.Class<AddResult>($I`AddResult`)(
	{
		datasetName: S.String,
		added: S.Array(DataRecord),
		addedCount: S.Finite,
		deduplicated: S.Array(DataRecord),
		deduplicatedCount: S.Finite,
	},
	$I.annote("AddResult", {
		description: "Result of `cogneeAdd`."
	})
) {}

/**
 * Result of `cogneeCognify` — counts hand-built from the pipeline result.
 *
 * @example
 *
 * @category models
 * @since 0.0.0
 */
export class CognifyResult extends S.Class<CognifyResult>($I`CognifyResult`)(
	{
		chunks: S.Finite,
		entities: S.Finite,
		edges: S.Finite,
		summaries: S.Finite,
		embeddings: S.Finite,
		alreadyCompleted: S.Boolean,
		priorPipelineRunId: S.String.pipe(S.OptionFromNullOr, SchemaUtils.withNoneDefault),
	},
	$I.annote("CognifyResult", {
		description: "Result of `cogneeCognify` — counts hand-built from the pipeline result."
	})
) {}

/**
 * All 15 search type wire names (SCREAMING_SNAKE_CASE, matching Rust serde).
 *
 * @example
 *
 * @category models
 * @since 0.0.0
 */
export const SearchTypeString = LiteralKit(
	[
	 "SUMMARIES",
	 "CHUNKS",
	 "RAG_COMPLETION",
	 "TRIPLET_COMPLETION",
	 "GRAPH_COMPLETION",
	 "GRAPH_SUMMARY_COMPLETION",
	 "CYPHER",
	 "NATURAL_LANGUAGE",
	 "GRAPH_COMPLETION_COT",
	 "GRAPH_COMPLETION_CONTEXT_EXTENSION",
	 "FEELING_LUCKY",
	 "FEEDBACK",
	 "TEMPORAL",
	 "CODING_RULES",
	 "CHUNKS_LEXICAL",
	]
).pipe(
	$I.annoteSchema("SearchTypeString", {
		description: "All 15 search type wire names (SCREAMING_SNAKE_CASE, matching Rust serde)."
	})
)

/**
 * Companion type for {@link SearchTypeString}.
 *
 * @example
 *
 * @category models
 * @since 0.0.0
 */
export type SearchTypeString = typeof SearchTypeString.Type;


/**
 * Recall scope wire names (snake_case; "all" expands to all four concrete scopes).
 *
 * @example
 *
 * @category models
 * @since 0.0.0
 */
export const RecallScopeString = LiteralKit(
	[
	 "auto",
	 "graph",
	 "session",
	 "trace",
	 "graph_context",
	 "all",
	]
).pipe(
	$I.annoteSchema("RecallScopeString", {
		description: "Recall scope wire names (snake_case; \"all\" expands to all four concrete scopes)."
	})
)

/**
 * Companion type for {@link RecallScopeString}.
 *
 * @example
 *
 * @category models
 * @since 0.0.0
 */
export type RecallScopeString = typeof RecallScopeString.Type;

/**
 * Options accepted by `cogneeSearch`. All fields are optional.
 *
 * @example
 *
 * @category models
 * @since 0.0.0
 */
export class SearchOptions extends S.Class<SearchOptions>($I`SearchOptions`)(
	{
		/** SCREAMING_SNAKE_CASE search type. Defaults to "GRAPH_COMPLETION". */
		searchType: SearchTypeString.pipe(SchemaUtils.withKeyDefaults("GRAPH_COMPLETION"), S.annotateKey({
			description: "SCREAMING_SNAKE_CASE search type. Defaults to \"GRAPH_COMPLETION\"."
		})),
		/** Dataset names to restrict the search to. */
		datasets: S.String.pipe(S.Array, S.OptionFromOptionalKey, SchemaUtils.withNoneDefault, S.annotateKey({
			description: "Dataset names to restrict the search to."
		})),
		/** Dataset UUIDs to restrict the search to. */
		datasetIds: S.String.pipe(S.Array, S.OptionFromOptionalKey, SchemaUtils.withNoneDefault, S.annotateKey({
			description: "Dataset UUIDs to restrict the search to."
		})),
		/** Maximum number of results to return. */
		topK: S.Finite.pipe(S.OptionFromOptionalKey, SchemaUtils.withNoneDefault, S.annotateKey({
			description: "Maximum number of results to return."
		})),
		/** System prompt override for completion-generating retrievers. */
		systemPrompt: S.String.pipe(S.OptionFromOptionalKey, SchemaUtils.withNoneDefault, S.annotateKey({
			description: "System prompt override for completion-generating retrievers."
		})),
		/** Session ID for QA history persistence. */
		sessionId: S.String.pipe(S.OptionFromOptionalKey, SchemaUtils.withNoneDefault, S.annotateKey({
			description: "Session ID for QA history persistence."
		})),
		/** Filter results by node type. */
		nodeType: S.String.pipe(S.OptionFromOptionalKey, SchemaUtils.withNoneDefault, S.annotateKey({
			description: "Filter results by node type."
		})),
		/** Filter results by one or more node names. */
		nodeName: S.String.pipe(S.Array, S.OptionFromOptionalKey, SchemaUtils.withNoneDefault, S.annotateKey({
			description: "Filter results by one or more node names."
		})),
		/** Return only the context without running completion. */
		onlyContext: S.Boolean.pipe(S.OptionFromOptionalKey, SchemaUtils.withNoneDefault, S.annotateKey({
			description: "Return only the context without running completion."
		})),
		/** Combine context from multiple retrieval paths. */
		useCombinedContext: S.Boolean.pipe(S.OptionFromOptionalKey, SchemaUtils.withNoneDefault, S.annotateKey({
			description: "Combine context from multiple retrieval paths."
		})),
		/** Include verbose diagnostics in the response. */
		verbose: S.Boolean.pipe(S.OptionFromOptionalKey, SchemaUtils.withNoneDefault, S.annotateKey({
			description: "Include verbose diagnostics in the response."
		})),
		/** Persist this query+result to search history (defaults to true). */
		saveInteraction: S.Boolean.pipe(SchemaUtils.withKeyDefaults(true), S.annotateKey({
			description: "Persist this query+result to search history (defaults to true)."
		})),
		/** Detect feedback about the previous response before searching. */
		autoFeedbackDetection: S.Boolean.pipe(S.OptionFromOptionalKey, SchemaUtils.withNoneDefault, S.annotateKey({
			description: "Detect feedback about the previous response before searching."
		})),
		/** User UUID override (defaults to the handle's owner). */
		userId: UUID.pipe(S.OptionFromOptionalKey, SchemaUtils.withNoneDefault, S.annotateKey({
			description: "User UUID override (defaults to the handle's owner)."
		})),
	},
	$I.annote("SearchOptions", {
		description: "Options accepted by `cogneeSearch`. All fields are optional."
	})
) {}

/**
 * Options accepted by `cogneeRecall`. All fields are optional.
 *
 * @example
 *
 * @category models
 * @since 0.0.1
 */
export class RecallOptions extends S.Class<RecallOptions>($I`RecallOptions`)(
	{
		/** SCREAMING_SNAKE_CASE search type for the graph retrieval leg. */
		searchType: SearchTypeString.pipe(S.OptionFromOptionalKey, SchemaUtils.withNoneDefault, S.annotateKey({
			description: "SCREAMING_SNAKE_CASE search type for the graph retrieval leg."
		})),
		/** Dataset names to restrict graph search to. */
		datasets: S.String.pipe(S.Array, S.OptionFromOptionalKey, SchemaUtils.withNoneDefault, S.annotateKey({
			description: "Dataset names to restrict graph search to."
		})),
		/** Maximum number of results per source. Defaults to 10. */
		topK: S.Finite.pipe(S.OptionFromOptionalKey, SchemaUtils.withNoneDefault, S.annotateKey({
			description: "Maximum number of results per source. Defaults to 10."
		})),
		/** Automatically select the best search type (defaults to false). */
		autoRoute: S.Boolean.pipe(S.OptionFromOptionalKey, SchemaUtils.withNoneDefault, S.annotateKey({
			description: "Automatically select the best search type (defaults to false)."
		})),
		/** Session ID for session-first routing. */
		sessionId: S.String.pipe(S.OptionFromOptionalKey, SchemaUtils.withNoneDefault, S.annotateKey({
			description: "Session ID for session-first routing."
		})),
		/**
		 * Recall scope: a single scope string or an array.
		 * "auto" (default) → session-first routing when sessionId is set, else graph.
		 * "all" → fan out across all four concrete sources.
		 */
		scope: S.Union([RecallScopeString, S.Array(RecallScopeString)]).annotateKey({
			description: "Recall scope: a single scope string or an array.\n\"auto\" (default) → session-first routing when sessionId is set, else graph.\n\"all\" → fan out across all four concrete sources."
		}),
	},
	$I.annote("RecallOptions", {
		description: "Options accepted by `cogneeRecall`. All fields are optional."
	})
) {}

/**
 * A single item in a `SearchResponse.result` when `kind === "Items"`.
 *
 * Mirrors `cognee_search::SearchItem` (Serialize). `payload` is a
 * heterogeneous JSON object whose shape depends on the search type.
 */
export class SearchItem extends S.Class<SearchItem>($I`SearchItem`)(
	{
		id: S.String.pipe(S.OptionFromNullOr, SchemaUtils.withNoneDefault),
		score: S.Number.pipe(S.OptionFromNullOr, SchemaUtils.withNoneDefault),
		payload: S.Record(S.String, S.Unknown),
	},
	$I.annote("SearchItem", {
		description: "A single item in a `SearchResponse.result` when `kind === \"Items\"`.\n\nMirrors `cognee_search::SearchItem` (Serialize). `payload` is a heterogeneous JSON object whose shape depends on the search type."
	})
) {}

/**
 * A knowledge-graph node returned in the `context` / `graphs` maps.
 *
 * @example
 *
 * @category models
 * @since 0.0.0
 */
export class SearchGraphNode extends S.Class<SearchGraphNode>($I`SearchGraphNode`)(
	{
		id: S.String,
		label: S.String,
	},
	$I.annote("SearchGraphNode", {
		description: "A knowledge-graph node returned in the `context` / `graphs` maps."
	})
) {}

/**
 * A knowledge-graph edge returned in the `context` / `graphs` maps.
 *
 * @example
 *
 * @category models
 * @since 0.0.0
 */
export class SearchGraphEdge extends S.Class<SearchGraphEdge>($I`SearchGraphEdge`)(
	{
		source: S.String,
		target: S.String,
		relationship: S.String,
		weight: S.Number.pipe(S.OptionFromNullOr, SchemaUtils.withNoneDefault),
	},
	$I.annote("SearchGraphEdge", {
		description: "A knowledge-graph edge returned in the `context` / `graphs` maps."
	})
) {}

export const SearchGraph = DirectedGraph({
	node: S.Array(SearchGraphNode),
	edge: S.Array(SearchGraphEdge),
}).pipe(
	$I.annoteSchema("SearchGraph", {
		description: "A knowledge-graph returned in the `context` / `graphs` maps."
	})
)

/**
 * Companion type for {@link SearchGraph}.
 *
 * @example
 *
 * @category models
 * @since 0.0.0
 */
export type SearchGraph = typeof SearchGraph.Type;

/**
 * The discriminated `result` field of `SearchResponse`.
 *
 * Mirrors the `SearchOutput` enum (`#[serde(tag = "kind", content = "data")]`).
 * When `kind === "Items"`, `data` is `SearchItem[]`.
 * When `kind === "Text"`, `data` is `string`.
 * When `kind === "Texts"`, `data` is `string[]`.
 * When `kind === "GraphQueryRows"`, `data` is a two-dimensional JSON array.
 * When `kind === "Rules"`, `data` is `Array<{ node_set: S.String, text: S.String }>`.
 * When `kind === "Ack"`, `data` is `{ message: S.String }`.
 * When `kind === "Structured"`, `data` is an arbitrary JSON value.
 *
 * @example
 * ```typescript
 * import { ItemsOutput } from "effect/DomainModel"
 * import * as S from "effect/Schema"
 *
 * // Declare an instance of ItemsOutput and validate a payload.
 * const outputSchema = ItemsOutput.schema
 *
 * // Define a payload to validate
 * const payload = {
 *   items: [{ id: 1, name: "Widget" }, { id: 2, name: "Gadget" }]
 * }
 *
 * // Perform runtime validation
 * const validatedOutput = S.decodeUnknownEffect(outputSchema)(payload)
 *
 * const program = Effect.gen(function* () {
 *   const output = yield* validatedOutput
 *   console.log(output)
 *   return output
 * })
 * ```
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const SearchOutput = S.TaggedUnion({
	Items: { data: S.Array(SearchItem)},
	Text: { data: S.String },
	Texts: { data: S.Array(S.String) },
	GraphQueryRows: { data: S.Unknown.pipe(S.Array, S.Array) },
	Rules: { data: S.Array(S.Struct({ node_set: S.String, text: S.String}) },
	Ack: { data: S.Struct({ message: S.String }) },
	Structured: { data: S.Unknown }
}).pipe(
	$I.annoteSchema("SearchOutput", {
		description: "The discriminated `result` field of `SearchResponse`."
	})
)

/**
 * Companion type for {@link SearchOutput}.
 *
 * @example
 *
 * @category models
 * @since 0.0.0
 */


/**
 * Search response from `cogneeSearch`.
 *
 * Mirrors `cognee_search::SearchResponse` (Serialize, snake_case fields).
 *
 * @example
 *
 * @category models
 * @since 0.0.0
 */
export class SearchResponse extends S.Class<SearchResponse>($I`SearchResponse`)(
	{
		search_type: SearchTypeString,
		result: SearchOutput,
		context: S.Record(S.String, S.Array(SearchItem)).pipe(S.OptionFromNullOr, SchemaUtils.withNoneDefault),
		graphs: S.Record(S.String, SearchGraph).pipe(S.OptionFromNullOr, SchemaUtils.withNoneDefault);
		diagnostics: S.Record(S.String, S.Unknown).pipe(S.OptionFromNullOr, SchemaUtils.withNoneDefault),
		datasets: S.String.pipe(S.Array, S.OptionFromNullOr, SchemaUtils.withNoneDefault),
		only_context: S.Boolean,
		use_combined_context: S.Boolean,
		verbose: S.Boolean,
	},
	$I.annote("SearchResponse", {
		description: "Search response from `cogneeSearch`."
	})
) {}

const RecallItemFields = {
	content: S.Record(S.String, S.Unknown),
	score: S.Finite,
}

/**
 * A single recall result item. Mirrors `cognee_search::RecallItem` (Serialize).
 *
 * `source` is one of `"session"`, `"graph"`, `"trace"`, `"graph_context"`
 * (snake_case, matching the `RecallSource` serde rename).
 * `content` is a heterogeneous JSON value whose shape depends on the source.
 */
export const RecallItem = S.TaggedUnion({
	session: RecallItemFields,
	graph: RecallItemFields,
	trace: RecallItemFields,
	graph_context: RecallItemFields
}).pipe(
	$I.annoteSchema("RecallItem", {
		description: "A single recall result item. Mirrors `cognee_search::RecallItem` (Serialize)."
	})
)

/**
 * Companion type for {@link RecallItem}.
 * 
 * @example
 * 
 * @category models
 * @since 0.0.0
 */
export type RecallItem = typeof RecallItem.Type;

/**
 * Result returned by `cogneeRecall`.
 *
 * @example
 *
 * @category models
 * @since 0.0.0
 */
export class RecallResult extends S.Class<RecallResult>($I`RecallResult`)(
	{
		/** Source-tagged result items from all contributing sources. */
		items: RecallItem.pipe(S.Array, S.annotateKey({
			description: "Source-tagged result items from all contributing sources."
		})),
		/** The search type used for the graph retrieval leg, or null. */
		searchTypeUsed: SearchTypeString.pipe(S.OptionFromNullOr, SchemaUtils.withNoneDefault, S.annotateKey({
			description: "The search type used for the graph retrieval leg, or null."
		})),
		/** Whether auto-routing was applied. */
		autoRouted: S.Boolean.annotateKey({
			description: "Whether auto-routing was applied."
		}),
		/** The raw graph search response, or null if no graph leg ran. */
		searchResponse: SearchResponse.pipe(S.OptionFromNullOr, SchemaUtils.withNoneDefault, S.annotateKey({
			description: "The raw graph search response, or null if no graph leg ran."
		})),
	},
	$I.annote("RecallResult", {
		description: "Result returned by `cogneeRecall`."
	})
) {}

// ─────────────────────────────────────────────────────────────────────────────
// Phase 5 types
// ─────────────────────────────────────────────────────────────────────────────