/**
 * User-facing schema surface for the Cognee SDK scratchpad bindings.
 *
 * These schemas mirror the public wire payloads returned by the native Cognee
 * bridge while keeping Effect Schema as the source of truth for TypeScript
 * types.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $ScratchpadId } from "@beep/identity";
import { FilePath, LiteralKit, SchemaUtils, UUID, UnknownRecord } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $ScratchpadId.create("cognee/models/Cognee.models");

const keyDescriptions = {
  added: "Rows newly created by this add operation.",
  addedCount: "Number of rows newly created by this add operation.",
  alreadyCompleted: "Whether Cognee skipped work because the pipeline had already completed.",
  answer: "Answer text stored in a session memory entry.",
  autoFeedbackDetection: "Whether Cognee should detect feedback about the previous response before searching.",
  autoRoute: "Whether Cognee should choose the graph retrieval search type automatically.",
  autoRouted: "Whether automatic route selection was applied for this recall request.",
  batchCount: "Number of batches processed by the memify stage.",
  bytes: "Binary input bytes supplied as a Uint8Array, numeric byte array, or encoded string.",
  cachePruned: "Whether the prune operation cleared Cognee cache data.",
  cells: "Opaque notebook cell payloads owned by the application layer.",
  chunkOverlap: "Override for the overlap between adjacent chunks.",
  chunkSize: "Override for the target chunk size used during cognify.",
  chunks: "Number of chunks produced or observed by the cognify pipeline.",
  cleared_pipeline_statuses: "Number of pipeline status rows cleared during deletion.",
  cognifyResult: "Optional cognify result produced after replacement data was added.",
  content: "Source-specific recall content or memory payload.",
  content_hash: "Hash of the normalized content used for duplicate detection.",
  context: "Optional context text or search context grouped by retrieval path.",
  created_at: "Creation timestamp serialized by Cognee.",
  data: "Variant payload carried by the tagged search output.",
  dataId: "Cognee data item identifier targeted by a forget operation.",
  dataPruned: "Whether the prune operation removed data records.",
  data_size: "Size of the stored data item in Cognee's metadata units.",
  dataset: "Dataset selector used to scope item or dataset deletion.",
  datasetIds: "Dataset identifiers used to restrict a search.",
  datasetName: "Dataset name associated with an add result.",
  datasets: "Dataset names associated with a request or response.",
  deduplicated: "Rows that already existed before this add operation.",
  deduplicatedCount: "Number of submitted rows that Cognee treated as duplicates.",
  deletable: "Whether the notebook can be deleted by callers.",
  deleteResult: "Detailed delete counters returned by the underlying delete operation.",
  deletedDataId: "Identifier of the data item removed before an update inserted replacement data.",
  deleted_data: "Number of data rows deleted.",
  deleted_dataset_links: "Number of dataset link rows deleted.",
  deleted_datasets: "Number of dataset rows deleted.",
  deleted_graph_nodes: "Number of graph nodes deleted.",
  deleted_orphan_edge_types: "Number of orphan edge type rows deleted.",
  deleted_orphan_entities: "Number of orphan entity rows deleted.",
  deleted_orphan_entity_types: "Number of orphan entity type rows deleted.",
  deleted_pipeline_runs: "Number of pipeline run rows deleted.",
  deleted_provenance_edges: "Number of provenance edges deleted.",
  deleted_provenance_nodes: "Number of provenance nodes deleted.",
  deleted_search_queries: "Number of persisted search query rows deleted.",
  deleted_storage_files: "Number of storage files deleted.",
  deleted_vector_points: "Number of vector points deleted.",
  description: "Human-readable description carried by the Cognee payload.",
  destinationPath: "Optional absolute HTML file destination for visualize-to-file calls.",
  diagnostics: "Optional diagnostic metadata returned with verbose search responses.",
  edge_ids: "Graph edge identifiers used to produce an answer.",
  edges: "Knowledge graph edges returned with a graph payload.",
  edgesSynced: "Number of graph edges synchronized during improvement.",
  email: "User email address serialized by Cognee.",
  embeddings: "Number of embeddings produced or observed by the cognify pipeline.",
  entities: "Number of entities produced or observed by the cognify pipeline.",
  errorMessage: "Optional error message captured by a trace memory entry.",
  extension: "Detected storage extension for a data item.",
  external_metadata: "Opaque external metadata serialized by Cognee.",
  feedbackAlpha: "Weighting factor used when applying feedback during improvement.",
  feedbackEntriesApplied: "Number of feedback entries applied to the graph.",
  feedbackEntriesProcessed: "Number of feedback entries considered during improvement.",
  feedbackScore: "Optional numeric feedback score supplied by the caller.",
  feedbackText: "Optional feedback text supplied by the caller.",
  feedback_score: "Numeric feedback score stored on a session Q&A entry.",
  feedback_text: "Feedback text stored on a session Q&A entry.",
  generateFeedbackWithLlm: "Whether Cognee should ask an LLM to generate trace feedback.",
  graphPruned: "Whether the prune operation removed graph data.",
  graphs: "Optional named graph payloads attached to a search response.",
  id: "Stable Cognee identifier for the row or payload.",
  importance_weight: "Optional importance weight assigned to a data item.",
  indexedCount: "Number of triplets indexed during memify.",
  is_active: "Whether the Cognee user row is active.",
  is_superuser: "Whether the Cognee user row has superuser privileges.",
  items: "Recall items returned from all contributing sources.",
  kind: "Wire discriminator selecting the tagged payload variant.",
  label: "Optional label assigned to a data item.",
  last_accessed: "Optional timestamp for the last recorded data access.",
  loader_engine: "Optional loader engine name used to ingest the data item.",
  memifyResult: "Optional memify result produced during improvement.",
  memify_metadata: "Optional memify metadata stored on a session Q&A entry.",
  memoryContext: "Optional memory context captured for a trace entry.",
  memoryQuery: "Optional memory query captured for a trace entry.",
  message: "Acknowledgement message returned by Cognee.",
  metadataPruned: "Whether the prune operation removed metadata records.",
  methodParams: "Optional method parameters captured for a trace entry.",
  methodReturnValue: "Optional method return value captured for a trace entry.",
  mime_type: "Detected MIME type for a data item.",
  name: "Human-readable Cognee name for the row or payload.",
  newData: "Replacement data rows created by an update operation.",
  node_ids: "Graph node identifiers used to produce an answer.",
  node_set: "Optional node-set name associated with a data item or rule row.",
  nodeName: "Node names used to filter search or improvement work.",
  nodeNameFilter: "Node names used to filter memify work.",
  nodeNameFilterOperator: "Operator used when applying the node name filter.",
  nodeType: "Node type used to filter search results.",
  nodeTypeFilter: "Node type used to filter memify work.",
  nodes: "Knowledge graph nodes returned with a graph payload.",
  onlyContext: "Whether search should return context without running completion.",
  only_context: "Whether the search response contains context-only results.",
  originFunction: "Function name that produced a trace memory entry.",
  original_data_location: "Original source location before Cognee storage normalization.",
  original_extension: "Original extension before Cognee storage normalization.",
  original_mime_type: "Original MIME type before Cognee storage normalization.",
  owner_id: "Owner identifier associated with the Cognee row.",
  path: "Filesystem path supplied to the add pipeline.",
  payload: "Heterogeneous search payload whose shape depends on the search type.",
  pipeline_status: "Optional pipeline status serialized by Cognee.",
  priorPipelineRunId: "Identifier of the previous pipeline run when work was already complete.",
  pruneCache: "Whether system pruning should clear cache data.",
  pruneGraph: "Whether system pruning should clear graph data.",
  pruneMetadata: "Whether system pruning should clear metadata records.",
  pruneVector: "Whether system pruning should clear vector data.",
  pruned_sessions: "Whether deletion pruned related session data.",
  qaId: "Session Q&A entry identifier receiving feedback.",
  question: "Question text stored in a memory or session entry.",
  raw_content_hash: "Hash of the raw content before normalization.",
  raw_data_location: "Raw storage location for a data item.",
  relationship: "Relationship label for a graph edge.",
  result: "Tagged search output payload returned by Cognee.",
  saveInteraction: "Whether Cognee should persist the query and result to search history.",
  scope: "Recall source scope or scopes requested by the caller.",
  score: "Search or recall relevance score.",
  searchResponse: "Optional raw search response produced by the graph recall leg.",
  searchType: "Search type requested by a caller.",
  searchTypeUsed: "Search type actually used by the graph recall leg.",
  search_type: "Search type serialized in a search response.",
  selfImprovement: "Whether remember should run a self-improvement pass after cognify.",
  sessionId: "Session identifier used for memory or search history routing.",
  sessionIds: "Session identifiers included in an improvement run.",
  session_id: "Session identifier serialized on a stored Q&A entry.",
  sessionsPersisted: "Number of sessions persisted during improvement.",
  source: "Recall source that produced a result item.",
  stagesRun: "Improvement stages executed by Cognee.",
  status: "Optional trace status.",
  summaries: "Number of summaries produced or observed by the cognify pipeline.",
  summarization: "Whether summarization is enabled for cognify.",
  systemPrompt: "Optional system prompt override for completion-producing search.",
  target: "String label for the forget target that was processed.",
  temporalCognify: "Whether temporal cognify behavior is enabled.",
  tenant: "Optional tenant UUID string used for multi-tenant scoping.",
  tenant_id: "Optional tenant identifier serialized by Cognee.",
  text: "Text content supplied by the caller or returned by Cognee.",
  token_count: "Token count recorded for the data item.",
  topK: "Maximum number of results to request or return.",
  triplet: "Whether to index source-relation-target triplet embeddings.",
  tripletBatchSize: "Batch size used for triplet indexing.",
  tripletCount: "Number of triplets produced by memify.",
  type: "Wire discriminator selecting the input or memory-entry variant.",
  updated_at: "Optional update timestamp serialized by Cognee.",
  url: "URL string supplied to the add pipeline.",
  useCombinedContext: "Whether search should combine context from multiple retrieval paths.",
  use_combined_context: "Whether the search response used combined retrieval context.",
  usedGraphElementIds: "Optional graph element identifiers used to produce a Q&A answer.",
  used_graph_element_ids: "Optional graph element identifiers stored with a session Q&A entry.",
  userId: "Optional user UUID override for search calls.",
  user_id: "Optional user identifier serialized on a stored Q&A entry.",
  vectorPruned: "Whether the prune operation removed vector data.",
  verbose: "Whether verbose diagnostics were requested or returned.",
  warnings: "Warnings emitted while processing a delete operation.",
  weight: "Optional edge weight.",
} satisfies Record<string, string>;

const keyAnnotation = (name: keyof typeof keyDescriptions) => ({
  description: keyDescriptions[name],
});

const key = (name: keyof typeof keyDescriptions) => S.annotateKey(keyAnnotation(name));

/**
 * Text payload accepted by the add pipeline.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { TextInput } from "./Cognee.models.ts"
 *
 * const decoded = S.decodeUnknownEither(TextInput)({ type: "text", text: "Hello Cognee" })
 * console.log(decoded._tag) // "Right"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class TextInput extends S.Class<TextInput>($I`TextInput`)(
  {
    type: S.tag("text").annotateKey(keyAnnotation("type")),
    text: S.String.pipe(key("text")),
  },
  $I.annote("TextInput", {
    description: "Text payload accepted by the add pipeline.",
  })
) {}

/**
 * File path payload accepted by the add pipeline.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { FileInput } from "./Cognee.models.ts"
 *
 * const decoded = S.decodeUnknownEither(FileInput)({ type: "file", path: "/tmp/notes.txt" })
 * console.log(decoded._tag) // "Right"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FileInput extends S.Class<FileInput>($I`FileInput`)(
  {
    type: S.tag("file").annotateKey(keyAnnotation("type")),
    path: FilePath.pipe(key("path")),
  },
  $I.annote("FileInput", {
    description: "File path payload accepted by the add pipeline.",
  })
) {}

/**
 * URL payload accepted by the add pipeline.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { UrlInput } from "./Cognee.models.ts"
 *
 * const decoded = S.decodeUnknownEither(UrlInput)({ type: "url", url: "https://example.com/notes" })
 * console.log(decoded._tag) // "Right"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class UrlInput extends S.Class<UrlInput>($I`UrlInput`)(
  {
    type: S.tag("url").annotateKey(keyAnnotation("type")),
    url: S.String.pipe(key("url")),
  },
  $I.annote("UrlInput", {
    description: "URL payload accepted by the add pipeline.",
  })
) {}

/**
 * Binary payload accepted by the add pipeline.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { BinaryInput } from "./Cognee.models.ts"
 *
 * const decoded = S.decodeUnknownEither(BinaryInput)({ type: "binary", bytes: "aGVsbG8=", name: "note.txt" })
 * console.log(decoded._tag) // "Right"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class BinaryInput extends S.Class<BinaryInput>($I`BinaryInput`)(
  {
    type: S.tag("binary").annotateKey(keyAnnotation("type")),
    bytes: S.Union([S.Uint8Array, S.Array(S.Finite), S.String]).pipe(key("bytes")),
    name: S.String.pipe(key("name")),
  },
  $I.annote("BinaryInput", {
    description: "Binary payload accepted by the add pipeline.",
  })
) {}

/**
 * Discriminated add input accepted by `cogneeAdd`.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { DataInput } from "./Cognee.models.ts"
 *
 * const decoded = S.decodeUnknownEither(DataInput)({ type: "text", text: "Hello Cognee" })
 * console.log(decoded._tag) // "Right"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const DataInput = S.Union([TextInput, FileInput, UrlInput, BinaryInput]).pipe(
  S.toTaggedUnion("type"),
  $I.annoteSchema("DataInput", {
    description: "Discriminated add input accepted by cogneeAdd.",
  })
);

/**
 * Companion type for {@link DataInput}.
 *
 * @example
 * ```ts
 * import type { DataInput } from "./Cognee.models.ts"
 *
 * const input: Pick<DataInput, "type"> = { type: "text" }
 * console.log(input.type)
 * ```
 *
 * @category type-level
 * @since 0.0.0
 */
export type DataInput = typeof DataInput.Type;

/**
 * Options accepted by `cogneeAdd` and the add phase of `cogneeAddAndCognify`.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { AddOptions } from "./Cognee.models.ts"
 *
 * const decoded = S.decodeUnknownEither(AddOptions)({ tenant: "550e8400-e29b-41d4-a716-446655440000" })
 * console.log(decoded._tag) // "Right"
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export class AddOptions extends S.Class<AddOptions>($I`AddOptions`)(
  {
    tenant: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault, key("tenant")),
  },
  $I.annote("AddOptions", {
    description: "Options accepted by cogneeAdd and the add phase of cogneeAddAndCognify.",
  })
) {}

/**
 * Per-call cognify config overrides applied on top of the handle config.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { CognifyOptions } from "./Cognee.models.ts"
 *
 * const decoded = S.decodeUnknownEither(CognifyOptions)({ chunkSize: 512, summarization: true })
 * console.log(decoded._tag) // "Right"
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export class CognifyOptions extends S.Class<CognifyOptions>($I`CognifyOptions`)(
  {
    tenant: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault, key("tenant")),
    chunkSize: S.OptionFromOptionalKey(S.Finite).pipe(SchemaUtils.withNoneDefault, key("chunkSize")),
    chunkOverlap: S.OptionFromOptionalKey(S.Finite).pipe(SchemaUtils.withNoneDefault, key("chunkOverlap")),
    summarization: S.OptionFromOptionalKey(S.Boolean).pipe(SchemaUtils.withNoneDefault, key("summarization")),
    temporalCognify: S.OptionFromOptionalKey(S.Boolean).pipe(SchemaUtils.withNoneDefault, key("temporalCognify")),
    triplet: S.OptionFromOptionalKey(S.Boolean).pipe(SchemaUtils.withNoneDefault, key("triplet")),
  },
  $I.annote("CognifyOptions", {
    description: "Per-call cognify config overrides applied on top of the handle config.",
  })
) {}

/**
 * Data item row mirrored from `cognee_models::Data`.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { DataRecord } from "./Cognee.models.ts"
 *
 * const decoded = S.decodeUnknownEither(DataRecord)({
 *   id: "data-1",
 *   name: "notes.txt",
 *   raw_data_location: "/tmp/raw/notes.txt",
 *   original_data_location: "/tmp/notes.txt",
 *   extension: "txt",
 *   mime_type: "text/plain",
 *   content_hash: "hash",
 *   owner_id: "user-1",
 *   created_at: "2026-07-01T00:00:00Z",
 *   token_count: 12,
 *   data_size: 128
 * })
 * console.log(decoded._tag) // "Right"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class DataRecord extends S.Class<DataRecord>($I`DataRecord`)(
  {
    id: S.String.pipe(key("id")),
    name: S.String.pipe(key("name")),
    raw_data_location: S.String.pipe(key("raw_data_location")),
    original_data_location: S.String.pipe(key("original_data_location")),
    extension: S.String.pipe(key("extension")),
    mime_type: S.String.pipe(key("mime_type")),
    content_hash: S.String.pipe(key("content_hash")),
    owner_id: S.String.pipe(key("owner_id")),
    created_at: S.String.pipe(key("created_at")),
    updated_at: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault, key("updated_at")),
    label: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault, key("label")),
    original_extension: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault, key("original_extension")),
    original_mime_type: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault, key("original_mime_type")),
    loader_engine: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault, key("loader_engine")),
    raw_content_hash: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault, key("raw_content_hash")),
    tenant_id: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault, key("tenant_id")),
    external_metadata: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault, key("external_metadata")),
    node_set: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault, key("node_set")),
    pipeline_status: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault, key("pipeline_status")),
    token_count: S.Finite.pipe(key("token_count")),
    data_size: S.Finite.pipe(key("data_size")),
    last_accessed: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault, key("last_accessed")),
    importance_weight: S.OptionFromNullOr(S.Finite).pipe(SchemaUtils.withNoneDefault, key("importance_weight")),
  },
  $I.annote("DataRecord", {
    description: "Data item row mirrored from cognee_models::Data.",
  })
) {}

/**
 * Result returned by `cogneeAdd`.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { AddResult } from "./Cognee.models.ts"
 *
 * const decoded = S.decodeUnknownEither(AddResult)({
 *   datasetName: "notes",
 *   added: [],
 *   addedCount: 0,
 *   deduplicated: [],
 *   deduplicatedCount: 0
 * })
 * console.log(decoded._tag) // "Right"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class AddResult extends S.Class<AddResult>($I`AddResult`)(
  {
    datasetName: S.String.pipe(key("datasetName")),
    added: S.Array(DataRecord).pipe(key("added")),
    addedCount: S.Finite.pipe(key("addedCount")),
    deduplicated: S.Array(DataRecord).pipe(key("deduplicated")),
    deduplicatedCount: S.Finite.pipe(key("deduplicatedCount")),
  },
  $I.annote("AddResult", {
    description: "Result returned by cogneeAdd.",
  })
) {}

/**
 * Cognify pipeline count summary.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { CognifyResult } from "./Cognee.models.ts"
 *
 * const decoded = S.decodeUnknownEither(CognifyResult)({
 *   chunks: 2,
 *   entities: 1,
 *   edges: 1,
 *   summaries: 0,
 *   embeddings: 2,
 *   alreadyCompleted: false,
 *   priorPipelineRunId: null
 * })
 * console.log(decoded._tag) // "Right"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class CognifyResult extends S.Class<CognifyResult>($I`CognifyResult`)(
  {
    chunks: S.Finite.pipe(key("chunks")),
    entities: S.Finite.pipe(key("entities")),
    edges: S.Finite.pipe(key("edges")),
    summaries: S.Finite.pipe(key("summaries")),
    embeddings: S.Finite.pipe(key("embeddings")),
    alreadyCompleted: S.Boolean.pipe(key("alreadyCompleted")),
    priorPipelineRunId: S.OptionFromNullOr(S.String).pipe(SchemaUtils.withNoneDefault, key("priorPipelineRunId")),
  },
  $I.annote("CognifyResult", {
    description: "Cognify pipeline count summary.",
  })
) {}

/**
 * Search type wire names matching Cognee's Rust serde representation.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { SearchTypeString } from "./Cognee.models.ts"
 *
 * const isSearchType = S.is(SearchTypeString)
 * console.log(isSearchType("GRAPH_COMPLETION")) // true
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const SearchTypeString = LiteralKit([
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
]).annotate(
  $I.annote("SearchTypeString", {
    description: "Search type wire names matching Cognee's Rust serde representation.",
  })
);

/**
 * Companion type for {@link SearchTypeString}.
 *
 * @example
 * ```ts
 * import type { SearchTypeString } from "./Cognee.models.ts"
 *
 * const searchType: SearchTypeString = "GRAPH_COMPLETION"
 * console.log(searchType)
 * ```
 *
 * @category type-level
 * @since 0.0.0
 */
export type SearchTypeString = typeof SearchTypeString.Type;

/**
 * Recall scope wire names.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { RecallScopeString } from "./Cognee.models.ts"
 *
 * const isRecallScope = S.is(RecallScopeString)
 * console.log(isRecallScope("graph")) // true
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const RecallScopeString = LiteralKit(["auto", "graph", "session", "trace", "graph_context", "all"]).annotate(
  $I.annote("RecallScopeString", {
    description: "Recall scope wire names.",
  })
);

/**
 * Companion type for {@link RecallScopeString}.
 *
 * @example
 * ```ts
 * import type { RecallScopeString } from "./Cognee.models.ts"
 *
 * const scope: RecallScopeString = "graph"
 * console.log(scope)
 * ```
 *
 * @category type-level
 * @since 0.0.0
 */
export type RecallScopeString = typeof RecallScopeString.Type;

/**
 * Options accepted by `cogneeSearch`.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { SearchOptions } from "./Cognee.models.ts"
 *
 * const decoded = S.decodeUnknownEither(SearchOptions)({ searchType: "GRAPH_COMPLETION", topK: 5 })
 * console.log(decoded._tag) // "Right"
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export class SearchOptions extends S.Class<SearchOptions>($I`SearchOptions`)(
  {
    searchType: SearchTypeString.pipe(SchemaUtils.withKeyDefaults("GRAPH_COMPLETION"), key("searchType")),
    datasets: S.Array(S.String).pipe(S.OptionFromOptionalKey, SchemaUtils.withNoneDefault, key("datasets")),
    datasetIds: S.Array(S.String).pipe(S.OptionFromOptionalKey, SchemaUtils.withNoneDefault, key("datasetIds")),
    topK: S.OptionFromOptionalKey(S.Finite).pipe(SchemaUtils.withNoneDefault, key("topK")),
    systemPrompt: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault, key("systemPrompt")),
    sessionId: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault, key("sessionId")),
    nodeType: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault, key("nodeType")),
    nodeName: S.Array(S.String).pipe(S.OptionFromOptionalKey, SchemaUtils.withNoneDefault, key("nodeName")),
    onlyContext: S.OptionFromOptionalKey(S.Boolean).pipe(SchemaUtils.withNoneDefault, key("onlyContext")),
    useCombinedContext: S.OptionFromOptionalKey(S.Boolean).pipe(SchemaUtils.withNoneDefault, key("useCombinedContext")),
    verbose: S.OptionFromOptionalKey(S.Boolean).pipe(SchemaUtils.withNoneDefault, key("verbose")),
    saveInteraction: S.Boolean.pipe(SchemaUtils.withKeyDefaults(true), key("saveInteraction")),
    autoFeedbackDetection: S.OptionFromOptionalKey(S.Boolean).pipe(SchemaUtils.withNoneDefault, key("autoFeedbackDetection")),
    userId: S.OptionFromOptionalKey(UUID).pipe(SchemaUtils.withNoneDefault, key("userId")),
  },
  $I.annote("SearchOptions", {
    description: "Options accepted by cogneeSearch.",
  })
) {}

/**
 * Options accepted by `cogneeRecall`.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { RecallOptions } from "./Cognee.models.ts"
 *
 * const decoded = S.decodeUnknownEither(RecallOptions)({ scope: "graph", topK: 10 })
 * console.log(decoded._tag) // "Right"
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export class RecallOptions extends S.Class<RecallOptions>($I`RecallOptions`)(
  {
    searchType: S.OptionFromOptionalKey(SearchTypeString).pipe(SchemaUtils.withNoneDefault, key("searchType")),
    datasets: S.Array(S.String).pipe(S.OptionFromOptionalKey, SchemaUtils.withNoneDefault, key("datasets")),
    topK: S.Finite.pipe(SchemaUtils.withKeyDefaults(10), key("topK")),
    autoRoute: S.Boolean.pipe(SchemaUtils.withKeyDefaults(false), key("autoRoute")),
    sessionId: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault, key("sessionId")),
    scope: S.Union([RecallScopeString, S.Array(RecallScopeString)]).pipe(SchemaUtils.withKeyDefaults("auto"), key("scope")),
  },
  $I.annote("RecallOptions", {
    description: "Options accepted by cogneeRecall.",
  })
) {}

/**
 * Search result item returned when the search output kind is `Items`.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { SearchItem } from "./Cognee.models.ts"
 *
 * const decoded = S.decodeUnknownEither(SearchItem)({ id: "node-1", score: 0.82, payload: { text: "match" } })
 * console.log(decoded._tag) // "Right"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class SearchItem extends S.Class<SearchItem>($I`SearchItem`)(
  {
    id: S.OptionFromNullOr(S.String).pipe(SchemaUtils.withNoneDefault, key("id")),
    score: S.OptionFromNullOr(S.Finite).pipe(SchemaUtils.withNoneDefault, key("score")),
    payload: UnknownRecord.pipe(key("payload")),
  },
  $I.annote("SearchItem", {
    description: "Search result item returned when the search output kind is Items.",
  })
) {}

/**
 * Knowledge graph node attached to a search response.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { SearchGraphNode } from "./Cognee.models.ts"
 *
 * const decoded = S.decodeUnknownEither(SearchGraphNode)({ id: "node-1", label: "Concept" })
 * console.log(decoded._tag) // "Right"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class SearchGraphNode extends S.Class<SearchGraphNode>($I`SearchGraphNode`)(
  {
    id: S.String.pipe(key("id")),
    label: S.String.pipe(key("label")),
  },
  $I.annote("SearchGraphNode", {
    description: "Knowledge graph node attached to a search response.",
  })
) {}

/**
 * Knowledge graph edge attached to a search response.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { SearchGraphEdge } from "./Cognee.models.ts"
 *
 * const decoded = S.decodeUnknownEither(SearchGraphEdge)({
 *   source: "node-1",
 *   target: "node-2",
 *   relationship: "RELATED_TO",
 *   weight: 0.9
 * })
 * console.log(decoded._tag) // "Right"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class SearchGraphEdge extends S.Class<SearchGraphEdge>($I`SearchGraphEdge`)(
  {
    source: S.String.pipe(key("source")),
    target: S.String.pipe(key("target")),
    relationship: S.String.pipe(key("relationship")),
    weight: S.OptionFromNullOr(S.Finite).pipe(SchemaUtils.withNoneDefault, key("weight")),
  },
  $I.annote("SearchGraphEdge", {
    description: "Knowledge graph edge attached to a search response.",
  })
) {}

/**
 * Named graph payload attached to a search response.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { SearchGraph } from "./Cognee.models.ts"
 *
 * const decoded = S.decodeUnknownEither(SearchGraph)({
 *   nodes: [{ id: "node-1", label: "Concept" }],
 *   edges: []
 * })
 * console.log(decoded._tag) // "Right"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class SearchGraph extends S.Class<SearchGraph>($I`SearchGraph`)(
  {
    nodes: S.Array(SearchGraphNode).pipe(key("nodes")),
    edges: S.Array(SearchGraphEdge).pipe(key("edges")),
  },
  $I.annote("SearchGraph", {
    description: "Named graph payload attached to a search response.",
  })
) {}

class SearchRuleOutputItem extends S.Class<SearchRuleOutputItem>($I`SearchRuleOutputItem`)(
  {
    node_set: S.String.pipe(key("node_set")),
    text: S.String.pipe(key("text")),
  },
  $I.annote("SearchRuleOutputItem", {
    description: "Coding-rules search output row.",
  })
) {}

class SearchAckOutputData extends S.Class<SearchAckOutputData>($I`SearchAckOutputData`)(
  {
    message: S.String.pipe(key("message")),
  },
  $I.annote("SearchAckOutputData", {
    description: "Acknowledgement search output payload.",
  })
) {}

class SearchItemsOutput extends S.Class<SearchItemsOutput>($I`SearchItemsOutput`)(
  {
    kind: S.tag("Items").annotateKey(keyAnnotation("kind")),
    data: S.Array(SearchItem).pipe(key("data")),
  },
  $I.annote("SearchItemsOutput", {
    description: "Search output containing structured search items.",
  })
) {}

class SearchTextOutput extends S.Class<SearchTextOutput>($I`SearchTextOutput`)(
  {
    kind: S.tag("Text").annotateKey(keyAnnotation("kind")),
    data: S.String.pipe(key("data")),
  },
  $I.annote("SearchTextOutput", {
    description: "Search output containing a single text value.",
  })
) {}

class SearchTextsOutput extends S.Class<SearchTextsOutput>($I`SearchTextsOutput`)(
  {
    kind: S.tag("Texts").annotateKey(keyAnnotation("kind")),
    data: S.Array(S.String).pipe(key("data")),
  },
  $I.annote("SearchTextsOutput", {
    description: "Search output containing multiple text values.",
  })
) {}

class SearchGraphQueryRowsOutput extends S.Class<SearchGraphQueryRowsOutput>($I`SearchGraphQueryRowsOutput`)(
  {
    kind: S.tag("GraphQueryRows").annotateKey(keyAnnotation("kind")),
    data: S.Unknown.pipe(S.Array, S.Array, key("data")),
  },
  $I.annote("SearchGraphQueryRowsOutput", {
    description: "Search output containing graph query rows.",
  })
) {}

class SearchRulesOutput extends S.Class<SearchRulesOutput>($I`SearchRulesOutput`)(
  {
    kind: S.tag("Rules").annotateKey(keyAnnotation("kind")),
    data: S.Array(SearchRuleOutputItem).pipe(key("data")),
  },
  $I.annote("SearchRulesOutput", {
    description: "Search output containing coding rule rows.",
  })
) {}

class SearchAckOutput extends S.Class<SearchAckOutput>($I`SearchAckOutput`)(
  {
    kind: S.tag("Ack").annotateKey(keyAnnotation("kind")),
    data: SearchAckOutputData.pipe(key("data")),
  },
  $I.annote("SearchAckOutput", {
    description: "Search output containing an acknowledgement payload.",
  })
) {}

class SearchStructuredOutput extends S.Class<SearchStructuredOutput>($I`SearchStructuredOutput`)(
  {
    kind: S.tag("Structured").annotateKey(keyAnnotation("kind")),
    data: S.Unknown.pipe(key("data")),
  },
  $I.annote("SearchStructuredOutput", {
    description: "Search output containing an arbitrary structured value.",
  })
) {}

/**
 * Discriminated search output returned in `SearchResponse.result`.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { SearchOutput } from "./Cognee.models.ts"
 *
 * const decoded = S.decodeUnknownEither(SearchOutput)({ kind: "Text", data: "Answer" })
 * console.log(decoded._tag) // "Right"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const SearchOutput = S.Union([
  SearchItemsOutput,
  SearchTextOutput,
  SearchTextsOutput,
  SearchGraphQueryRowsOutput,
  SearchRulesOutput,
  SearchAckOutput,
  SearchStructuredOutput,
]).pipe(
  S.toTaggedUnion("kind"),
  $I.annoteSchema("SearchOutput", {
    description: "Discriminated search output returned in SearchResponse.result.",
  })
);

/**
 * Companion type for {@link SearchOutput}.
 *
 * @example
 * ```ts
 * import type { SearchOutput } from "./Cognee.models.ts"
 *
 * const kind: SearchOutput["kind"] = "Text"
 * console.log(kind)
 * ```
 *
 * @category type-level
 * @since 0.0.0
 */
export type SearchOutput = typeof SearchOutput.Type;

/**
 * Search response returned by `cogneeSearch`.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { SearchResponse } from "./Cognee.models.ts"
 *
 * const decoded = S.decodeUnknownEither(SearchResponse)({
 *   search_type: "GRAPH_COMPLETION",
 *   result: { kind: "Text", data: "Answer" },
 *   only_context: false,
 *   use_combined_context: false,
 *   verbose: false
 * })
 * console.log(decoded._tag) // "Right"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class SearchResponse extends S.Class<SearchResponse>($I`SearchResponse`)(
  {
    search_type: SearchTypeString.pipe(key("search_type")),
    result: SearchOutput.pipe(key("result")),
    context: S.OptionFromOptionalNullOr(S.Record(S.String, S.Array(SearchItem))).pipe(SchemaUtils.withNoneDefault, key("context")),
    graphs: S.OptionFromOptionalNullOr(S.Record(S.String, SearchGraph)).pipe(SchemaUtils.withNoneDefault, key("graphs")),
    diagnostics: S.OptionFromOptionalNullOr(UnknownRecord).pipe(SchemaUtils.withNoneDefault, key("diagnostics")),
    datasets: S.String.pipe(S.Array, S.OptionFromOptionalNullOr, SchemaUtils.withNoneDefault, key("datasets")),
    only_context: S.Boolean.pipe(key("only_context")),
    use_combined_context: S.Boolean.pipe(key("use_combined_context")),
    verbose: S.Boolean.pipe(key("verbose")),
  },
  $I.annote("SearchResponse", {
    description: "Search response returned by cogneeSearch.",
  })
) {}

const RecallSourceString = LiteralKit(["session", "graph", "trace", "graph_context"]).annotate(
  $I.annote("RecallSourceString", {
    description: "Recall result source names.",
  })
);

/**
 * Source-tagged recall result item.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { RecallItem } from "./Cognee.models.ts"
 *
 * const decoded = S.decodeUnknownEither(RecallItem)({ source: "graph", content: { text: "Answer" }, score: 0.7 })
 * console.log(decoded._tag) // "Right"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class RecallItem extends S.Class<RecallItem>($I`RecallItem`)(
  {
    source: RecallSourceString.pipe(key("source")),
    content: UnknownRecord.pipe(key("content")),
    score: S.Finite.pipe(key("score")),
  },
  $I.annote("RecallItem", {
    description: "Source-tagged recall result item.",
  })
) {}

/**
 * Result returned by `cogneeRecall`.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { RecallResult } from "./Cognee.models.ts"
 *
 * const decoded = S.decodeUnknownEither(RecallResult)({
 *   items: [],
 *   searchTypeUsed: null,
 *   autoRouted: false,
 *   searchResponse: null
 * })
 * console.log(decoded._tag) // "Right"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class RecallResult extends S.Class<RecallResult>($I`RecallResult`)(
  {
    items: S.Array(RecallItem).pipe(key("items")),
    searchTypeUsed: S.OptionFromOptionalNullOr(SearchTypeString).pipe(SchemaUtils.withNoneDefault, key("searchTypeUsed")),
    autoRouted: S.Boolean.pipe(key("autoRouted")),
    searchResponse: S.OptionFromOptionalNullOr(SearchResponse).pipe(SchemaUtils.withNoneDefault, key("searchResponse")),
  },
  $I.annote("RecallResult", {
    description: "Result returned by cogneeRecall.",
  })
) {}

/**
 * Options accepted by `cogneeRemember`.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { RememberOptions } from "./Cognee.models.ts"
 *
 * const decoded = S.decodeUnknownEither(RememberOptions)({ sessionId: "session-1", selfImprovement: false })
 * console.log(decoded._tag) // "Right"
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export class RememberOptions extends S.Class<RememberOptions>($I`RememberOptions`)(
  {
    sessionId: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault, key("sessionId")),
    selfImprovement: S.Boolean.pipe(SchemaUtils.withKeyDefaults(false), key("selfImprovement")),
    tenant: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault, key("tenant")),
  },
  $I.annote("RememberOptions", {
    description: "Options accepted by cogneeRemember.",
  })
) {}

/**
 * Open record result returned by remember operations.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { RememberResult } from "./Cognee.models.ts"
 *
 * const decoded = S.decodeUnknownEither(RememberResult)({ status: "ok" })
 * console.log(decoded._tag) // "Right"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const RememberResult = UnknownRecord.pipe(
  $I.annoteSchema("RememberResult", {
    description: "Open record result returned by remember operations.",
  })
);

/**
 * Companion type for {@link RememberResult}.
 *
 * @example
 * ```ts
 * import type { RememberResult } from "./Cognee.models.ts"
 *
 * const result: RememberResult = { status: "ok" }
 * console.log(result.status)
 * ```
 *
 * @category type-level
 * @since 0.0.0
 */
export type RememberResult = typeof RememberResult.Type;

/**
 * Graph element IDs used to produce a Q&A answer.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { UsedGraphElementIds } from "./Cognee.models.ts"
 *
 * const decoded = S.decodeUnknownEither(UsedGraphElementIds)({ node_ids: ["node-1"], edge_ids: ["edge-1"] })
 * console.log(decoded._tag) // "Right"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class UsedGraphElementIds extends S.Class<UsedGraphElementIds>($I`UsedGraphElementIds`)(
  {
    node_ids: S.Array(S.String).pipe(key("node_ids")),
    edge_ids: S.Array(S.String).pipe(key("edge_ids")),
  },
  $I.annote("UsedGraphElementIds", {
    description: "Graph element IDs used to produce a Q&A answer.",
  })
) {}

class QAMemoryEntry extends S.Class<QAMemoryEntry>($I`QAMemoryEntry`)(
  {
    type: S.tag("qa").annotateKey(keyAnnotation("type")),
    question: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault, key("question")),
    answer: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault, key("answer")),
    context: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault, key("context")),
    feedbackText: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault, key("feedbackText")),
    feedbackScore: S.OptionFromOptionalKey(S.Finite).pipe(SchemaUtils.withNoneDefault, key("feedbackScore")),
    usedGraphElementIds: S.OptionFromOptionalKey(UsedGraphElementIds).pipe(SchemaUtils.withNoneDefault, key("usedGraphElementIds")),
  },
  $I.annote("QAMemoryEntry", {
    description: "Q&A memory entry accepted by cogneeRememberEntry.",
  })
) {}

class TraceMemoryEntry extends S.Class<TraceMemoryEntry>($I`TraceMemoryEntry`)(
  {
    type: S.tag("trace").annotateKey(keyAnnotation("type")),
    originFunction: S.String.pipe(key("originFunction")),
    status: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault, key("status")),
    memoryQuery: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault, key("memoryQuery")),
    memoryContext: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault, key("memoryContext")),
    methodParams: S.OptionFromOptionalKey(S.Unknown).pipe(SchemaUtils.withNoneDefault, key("methodParams")),
    methodReturnValue: S.OptionFromOptionalKey(S.Unknown).pipe(SchemaUtils.withNoneDefault, key("methodReturnValue")),
    errorMessage: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault, key("errorMessage")),
    generateFeedbackWithLlm: S.OptionFromOptionalKey(S.Boolean).pipe(SchemaUtils.withNoneDefault, key("generateFeedbackWithLlm")),
  },
  $I.annote("TraceMemoryEntry", {
    description: "Trace memory entry accepted by cogneeRememberEntry.",
  })
) {}

class FeedbackMemoryEntry extends S.Class<FeedbackMemoryEntry>($I`FeedbackMemoryEntry`)(
  {
    type: S.tag("feedback").annotateKey(keyAnnotation("type")),
    qaId: S.String.pipe(key("qaId")),
    feedbackText: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault, key("feedbackText")),
    feedbackScore: S.OptionFromOptionalKey(S.Finite).pipe(SchemaUtils.withNoneDefault, key("feedbackScore")),
  },
  $I.annote("FeedbackMemoryEntry", {
    description: "Feedback memory entry accepted by cogneeRememberEntry.",
  })
) {}

/**
 * Typed memory entry accepted by `cogneeRememberEntry`.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { MemoryEntry } from "./Cognee.models.ts"
 *
 * const decoded = S.decodeUnknownEither(MemoryEntry)({ type: "feedback", qaId: "qa-1", feedbackText: "Useful", feedbackScore: 1 })
 * console.log(decoded._tag) // "Right"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const MemoryEntry = S.Union([QAMemoryEntry, TraceMemoryEntry, FeedbackMemoryEntry]).pipe(
  S.toTaggedUnion("type"),
  $I.annoteSchema("MemoryEntry", {
    description: "Typed memory entry accepted by cogneeRememberEntry.",
  })
);

/**
 * Companion type for {@link MemoryEntry}.
 *
 * @example
 * ```ts
 * import type { MemoryEntry } from "./Cognee.models.ts"
 *
 * const kind: MemoryEntry["type"] = "feedback"
 * console.log(kind)
 * ```
 *
 * @category type-level
 * @since 0.0.0
 */
export type MemoryEntry = typeof MemoryEntry.Type;

/**
 * Options accepted by `cogneeMemify`.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { MemifyOptions } from "./Cognee.models.ts"
 *
 * const decoded = S.decodeUnknownEither(MemifyOptions)({ tripletBatchSize: 50 })
 * console.log(decoded._tag) // "Right"
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export class MemifyOptions extends S.Class<MemifyOptions>($I`MemifyOptions`)(
  {
    tripletBatchSize: S.OptionFromOptionalKey(S.Finite).pipe(SchemaUtils.withNoneDefault, key("tripletBatchSize")),
    nodeTypeFilter: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault, key("nodeTypeFilter")),
    nodeNameFilter: S.Array(S.String).pipe(S.OptionFromOptionalKey, SchemaUtils.withNoneDefault, key("nodeNameFilter")),
    nodeNameFilterOperator: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault, key("nodeNameFilterOperator")),
  },
  $I.annote("MemifyOptions", {
    description: "Options accepted by cogneeMemify.",
  })
) {}

/**
 * Result returned by `cogneeMemify`.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { MemifyResult } from "./Cognee.models.ts"
 *
 * const decoded = S.decodeUnknownEither(MemifyResult)({
 *   tripletCount: 1,
 *   indexedCount: 1,
 *   batchCount: 1,
 *   alreadyCompleted: false,
 *   priorPipelineRunId: null
 * })
 * console.log(decoded._tag) // "Right"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class MemifyResult extends S.Class<MemifyResult>($I`MemifyResult`)(
  {
    tripletCount: S.Finite.pipe(key("tripletCount")),
    indexedCount: S.Finite.pipe(key("indexedCount")),
    batchCount: S.Finite.pipe(key("batchCount")),
    alreadyCompleted: S.Boolean.pipe(key("alreadyCompleted")),
    priorPipelineRunId: S.OptionFromNullOr(S.String).pipe(SchemaUtils.withNoneDefault, key("priorPipelineRunId")),
  },
  $I.annote("MemifyResult", {
    description: "Result returned by cogneeMemify.",
  })
) {}

/**
 * Options accepted by `cogneeImprove`.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { ImproveOptions } from "./Cognee.models.ts"
 *
 * const decoded = S.decodeUnknownEither(ImproveOptions)({ datasetName: "notes", nodeName: ["Concept"] })
 * console.log(decoded._tag) // "Right"
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export class ImproveOptions extends S.Class<ImproveOptions>($I`ImproveOptions`)(
  {
    datasetName: S.String.pipe(key("datasetName")),
    sessionIds: S.Array(S.String).pipe(S.OptionFromOptionalKey, SchemaUtils.withNoneDefault, key("sessionIds")),
    nodeName: S.Array(S.String).pipe(S.OptionFromOptionalKey, SchemaUtils.withNoneDefault, key("nodeName")),
    feedbackAlpha: S.OptionFromOptionalKey(S.Finite).pipe(SchemaUtils.withNoneDefault, key("feedbackAlpha")),
    tenant: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault, key("tenant")),
  },
  $I.annote("ImproveOptions", {
    description: "Options accepted by cogneeImprove.",
  })
) {}

/**
 * Result returned by `cogneeImprove`.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { ImproveResult } from "./Cognee.models.ts"
 *
 * const decoded = S.decodeUnknownEither(ImproveResult)({
 *   stagesRun: ["memify"],
 *   memifyResult: null,
 *   feedbackEntriesProcessed: 0,
 *   feedbackEntriesApplied: 0,
 *   sessionsPersisted: 0,
 *   edgesSynced: 0
 * })
 * console.log(decoded._tag) // "Right"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ImproveResult extends S.Class<ImproveResult>($I`ImproveResult`)(
  {
    stagesRun: S.Array(S.String).pipe(key("stagesRun")),
    memifyResult: S.OptionFromOptionalNullOr(MemifyResult).pipe(SchemaUtils.withNoneDefault, key("memifyResult")),
    feedbackEntriesProcessed: S.Finite.pipe(key("feedbackEntriesProcessed")),
    feedbackEntriesApplied: S.Finite.pipe(key("feedbackEntriesApplied")),
    sessionsPersisted: S.Finite.pipe(key("sessionsPersisted")),
    edgesSynced: S.Finite.pipe(key("edgesSynced")),
  },
  $I.annote("ImproveResult", {
    description: "Result returned by cogneeImprove.",
  })
) {}

class DatasetNameSelector extends S.Class<DatasetNameSelector>($I`DatasetNameSelector`)(
  {
    name: S.String.pipe(key("name")),
  },
  $I.annote("DatasetNameSelector", {
    description: "Dataset selector by name.",
  })
) {}

class DatasetIdSelector extends S.Class<DatasetIdSelector>($I`DatasetIdSelector`)(
  {
    id: S.String.pipe(key("id")),
  },
  $I.annote("DatasetIdSelector", {
    description: "Dataset selector by ID.",
  })
) {}

const DatasetSelector = S.Union([DatasetNameSelector, DatasetIdSelector]).pipe(
  $I.annoteSchema("DatasetSelector", {
    description: "Dataset selector by name or ID.",
  })
);

class ForgetItemTarget extends S.Class<ForgetItemTarget>($I`ForgetItemTarget`)(
  {
    kind: S.tag("item").annotateKey(keyAnnotation("kind")),
    dataId: S.String.pipe(key("dataId")),
    dataset: DatasetSelector.pipe(key("dataset")),
  },
  $I.annote("ForgetItemTarget", {
    description: "Forget target for a single data item.",
  })
) {}

class ForgetDatasetTarget extends S.Class<ForgetDatasetTarget>($I`ForgetDatasetTarget`)(
  {
    kind: S.tag("dataset").annotateKey(keyAnnotation("kind")),
    dataset: DatasetSelector.pipe(key("dataset")),
  },
  $I.annote("ForgetDatasetTarget", {
    description: "Forget target for a dataset.",
  })
) {}

class ForgetAllTarget extends S.Class<ForgetAllTarget>($I`ForgetAllTarget`)(
  {
    kind: S.tag("all").annotateKey(keyAnnotation("kind")),
  },
  $I.annote("ForgetAllTarget", {
    description: "Forget target for all data.",
  })
) {}

/**
 * Target accepted by `cogneeForget`.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { ForgetTarget } from "./Cognee.models.ts"
 *
 * const decoded = S.decodeUnknownEither(ForgetTarget)({ kind: "all" })
 * console.log(decoded._tag) // "Right"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const ForgetTarget = S.Union([ForgetItemTarget, ForgetDatasetTarget, ForgetAllTarget]).pipe(
  S.toTaggedUnion("kind"),
  $I.annoteSchema("ForgetTarget", {
    description: "Target accepted by cogneeForget.",
  })
);

/**
 * Companion type for {@link ForgetTarget}.
 *
 * @example
 * ```ts
 * import type { ForgetTarget } from "./Cognee.models.ts"
 *
 * const kind: ForgetTarget["kind"] = "all"
 * console.log(kind)
 * ```
 *
 * @category type-level
 * @since 0.0.0
 */
export type ForgetTarget = typeof ForgetTarget.Type;

/**
 * Delete operation detail mirrored from `cognee_delete::DeleteResult`.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { DeleteResultDetail } from "./Cognee.models.ts"
 *
 * const decoded = S.decodeUnknownEither(DeleteResultDetail)({
 *   deleted_datasets: 0, deleted_dataset_links: 0, deleted_data: 0, deleted_storage_files: 0,
 *   deleted_graph_nodes: 0, deleted_vector_points: 0, deleted_provenance_nodes: 0, deleted_provenance_edges: 0,
 *   deleted_orphan_entities: 0, deleted_orphan_entity_types: 0, deleted_orphan_edge_types: 0, deleted_pipeline_runs: 0,
 *   cleared_pipeline_statuses: 0, deleted_search_queries: 0, pruned_sessions: false, warnings: []
 * })
 * console.log(decoded._tag) // "Right"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class DeleteResultDetail extends S.Class<DeleteResultDetail>($I`DeleteResultDetail`)(
  {
    deleted_datasets: S.Finite.pipe(key("deleted_datasets")),
    deleted_dataset_links: S.Finite.pipe(key("deleted_dataset_links")),
    deleted_data: S.Finite.pipe(key("deleted_data")),
    deleted_storage_files: S.Finite.pipe(key("deleted_storage_files")),
    deleted_graph_nodes: S.Finite.pipe(key("deleted_graph_nodes")),
    deleted_vector_points: S.Finite.pipe(key("deleted_vector_points")),
    deleted_provenance_nodes: S.Finite.pipe(key("deleted_provenance_nodes")),
    deleted_provenance_edges: S.Finite.pipe(key("deleted_provenance_edges")),
    deleted_orphan_entities: S.Finite.pipe(key("deleted_orphan_entities")),
    deleted_orphan_entity_types: S.Finite.pipe(key("deleted_orphan_entity_types")),
    deleted_orphan_edge_types: S.Finite.pipe(key("deleted_orphan_edge_types")),
    deleted_pipeline_runs: S.Finite.pipe(key("deleted_pipeline_runs")),
    cleared_pipeline_statuses: S.Finite.pipe(key("cleared_pipeline_statuses")),
    deleted_search_queries: S.Finite.pipe(key("deleted_search_queries")),
    pruned_sessions: S.Boolean.pipe(key("pruned_sessions")),
    warnings: S.Array(S.String).pipe(key("warnings")),
  },
  $I.annote("DeleteResultDetail", {
    description: "Delete operation detail mirrored from cognee_delete::DeleteResult.",
  })
) {}

/**
 * Backward-compatible schema alias for {@link DeleteResultDetail}.
 *
 * @example
 * ```ts
 * import { DeleteResult, DeleteResultDetail } from "./Cognee.models.ts"
 *
 * console.log(DeleteResult === DeleteResultDetail) // true
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const DeleteResult = DeleteResultDetail;

/**
 * Type alias for {@link DeleteResultDetail}.
 *
 * @example
 * ```ts
 * import type { DeleteResult } from "./Cognee.models.ts"
 *
 * const count: DeleteResult["deleted_data"] = 0
 * console.log(count)
 * ```
 *
 * @category type-level
 * @since 0.0.0
 */
export type DeleteResult = DeleteResultDetail;

/**
 * Result returned by `cogneeForget`.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { ForgetResult } from "./Cognee.models.ts"
 *
 * const decoded = S.decodeUnknownEither(ForgetResult)({
 *   target: "all",
 *   deleteResult: {
 *     deleted_datasets: 0, deleted_dataset_links: 0, deleted_data: 0, deleted_storage_files: 0,
 *     deleted_graph_nodes: 0, deleted_vector_points: 0, deleted_provenance_nodes: 0, deleted_provenance_edges: 0,
 *     deleted_orphan_entities: 0, deleted_orphan_entity_types: 0, deleted_orphan_edge_types: 0, deleted_pipeline_runs: 0,
 *     cleared_pipeline_statuses: 0, deleted_search_queries: 0, pruned_sessions: false, warnings: []
 *   }
 * })
 * console.log(decoded._tag) // "Right"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ForgetResult extends S.Class<ForgetResult>($I`ForgetResult`)(
  {
    target: S.String.pipe(key("target")),
    deleteResult: DeleteResultDetail.pipe(key("deleteResult")),
  },
  $I.annote("ForgetResult", {
    description: "Result returned by cogneeForget.",
  })
) {}

/**
 * Options accepted by `cogneeUpdate`.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { UpdateOptions } from "./Cognee.models.ts"
 *
 * const decoded = S.decodeUnknownEither(UpdateOptions)({ tenant: "550e8400-e29b-41d4-a716-446655440000" })
 * console.log(decoded._tag) // "Right"
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export class UpdateOptions extends S.Class<UpdateOptions>($I`UpdateOptions`)(
  {
    tenant: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault, key("tenant")),
  },
  $I.annote("UpdateOptions", {
    description: "Options accepted by cogneeUpdate.",
  })
) {}

/**
 * Result returned by `cogneeUpdate`.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { UpdateResult } from "./Cognee.models.ts"
 *
 * const decoded = S.decodeUnknownEither(UpdateResult)({
 *   deletedDataId: "data-1",
 *   deleteResult: {
 *     deleted_datasets: 0, deleted_dataset_links: 0, deleted_data: 1, deleted_storage_files: 0,
 *     deleted_graph_nodes: 0, deleted_vector_points: 0, deleted_provenance_nodes: 0, deleted_provenance_edges: 0,
 *     deleted_orphan_entities: 0, deleted_orphan_entity_types: 0, deleted_orphan_edge_types: 0, deleted_pipeline_runs: 0,
 *     cleared_pipeline_statuses: 0, deleted_search_queries: 0, pruned_sessions: false, warnings: []
 *   },
 *   newData: [],
 *   cognifyResult: null
 * })
 * console.log(decoded._tag) // "Right"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class UpdateResult extends S.Class<UpdateResult>($I`UpdateResult`)(
  {
    deletedDataId: S.String.pipe(key("deletedDataId")),
    deleteResult: DeleteResultDetail.pipe(key("deleteResult")),
    newData: S.Array(DataRecord).pipe(key("newData")),
    cognifyResult: S.OptionFromOptionalNullOr(CognifyResult).pipe(SchemaUtils.withNoneDefault, key("cognifyResult")),
  },
  $I.annote("UpdateResult", {
    description: "Result returned by cogneeUpdate.",
  })
) {}

/**
 * Options accepted by `cogneePruneSystem`.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { PruneSystemOptions } from "./Cognee.models.ts"
 *
 * const decoded = S.decodeUnknownEither(PruneSystemOptions)({ pruneCache: true })
 * console.log(decoded._tag) // "Right"
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export class PruneSystemOptions extends S.Class<PruneSystemOptions>($I`PruneSystemOptions`)(
  {
    pruneGraph: S.OptionFromOptionalKey(S.Boolean).pipe(SchemaUtils.withNoneDefault, key("pruneGraph")),
    pruneVector: S.OptionFromOptionalKey(S.Boolean).pipe(SchemaUtils.withNoneDefault, key("pruneVector")),
    pruneMetadata: S.OptionFromOptionalKey(S.Boolean).pipe(SchemaUtils.withNoneDefault, key("pruneMetadata")),
    pruneCache: S.OptionFromOptionalKey(S.Boolean).pipe(SchemaUtils.withNoneDefault, key("pruneCache")),
  },
  $I.annote("PruneSystemOptions", {
    description: "Options accepted by cogneePruneSystem.",
  })
) {}

/**
 * Result returned by `cogneePruneSystem`.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { PruneResult } from "./Cognee.models.ts"
 *
 * const decoded = S.decodeUnknownEither(PruneResult)({
 *   dataPruned: true,
 *   graphPruned: false,
 *   vectorPruned: false,
 *   metadataPruned: true,
 *   cachePruned: true
 * })
 * console.log(decoded._tag) // "Right"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class PruneResult extends S.Class<PruneResult>($I`PruneResult`)(
  {
    dataPruned: S.Boolean.pipe(key("dataPruned")),
    graphPruned: S.Boolean.pipe(key("graphPruned")),
    vectorPruned: S.Boolean.pipe(key("vectorPruned")),
    metadataPruned: S.Boolean.pipe(key("metadataPruned")),
    cachePruned: S.Boolean.pipe(key("cachePruned")),
  },
  $I.annote("PruneResult", {
    description: "Result returned by cogneePruneSystem.",
  })
) {}

/**
 * Dataset row mirrored from `cognee_models::Dataset`.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { Dataset } from "./Cognee.models.ts"
 *
 * const decoded = S.decodeUnknownEither(Dataset)({
 *   id: "dataset-1",
 *   name: "notes",
 *   owner_id: "user-1",
 *   tenant_id: null,
 *   created_at: "2026-07-01T00:00:00Z",
 *   updated_at: null
 * })
 * console.log(decoded._tag) // "Right"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class Dataset extends S.Class<Dataset>($I`Dataset`)(
  {
    id: S.String.pipe(key("id")),
    name: S.String.pipe(key("name")),
    owner_id: S.String.pipe(key("owner_id")),
    tenant_id: S.OptionFromNullOr(S.String).pipe(SchemaUtils.withNoneDefault, key("tenant_id")),
    created_at: S.String.pipe(key("created_at")),
    updated_at: S.OptionFromNullOr(S.String).pipe(SchemaUtils.withNoneDefault, key("updated_at")),
  },
  $I.annote("Dataset", {
    description: "Dataset row mirrored from cognee_models::Dataset.",
  })
) {}

/**
 * Backward-compatible schema alias for {@link DataRecord}.
 *
 * @example
 * ```ts
 * import { Data, DataRecord } from "./Cognee.models.ts"
 *
 * console.log(Data === DataRecord) // true
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const Data = DataRecord;

/**
 * Type alias for {@link DataRecord}.
 *
 * @example
 * ```ts
 * import type { Data } from "./Cognee.models.ts"
 *
 * const id: Data["id"] = "data-1"
 * console.log(id)
 * ```
 *
 * @category type-level
 * @since 0.0.0
 */
export type Data = DataRecord;

/**
 * User row mirrored from `cognee_models::User`.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { User } from "./Cognee.models.ts"
 *
 * const decoded = S.decodeUnknownEither(User)({
 *   id: "user-1",
 *   email: "user@example.com",
 *   is_active: true,
 *   is_superuser: false,
 *   tenant_id: null,
 *   created_at: "2026-07-01T00:00:00Z",
 *   updated_at: null
 * })
 * console.log(decoded._tag) // "Right"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class User extends S.Class<User>($I`User`)(
  {
    id: S.String.pipe(key("id")),
    email: S.String.pipe(key("email")),
    is_active: S.Boolean.pipe(key("is_active")),
    is_superuser: S.Boolean.pipe(key("is_superuser")),
    tenant_id: S.OptionFromNullOr(S.String).pipe(SchemaUtils.withNoneDefault, key("tenant_id")),
    created_at: S.String.pipe(key("created_at")),
    updated_at: S.OptionFromNullOr(S.String).pipe(SchemaUtils.withNoneDefault, key("updated_at")),
  },
  $I.annote("User", {
    description: "User row mirrored from cognee_models::User.",
  })
) {}

/**
 * Notebook row mirrored from Cognee's notebook database model.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { Notebook } from "./Cognee.models.ts"
 *
 * const decoded = S.decodeUnknownEither(Notebook)({
 *   id: "notebook-1",
 *   owner_id: "user-1",
 *   name: "Research",
 *   cells: [],
 *   deletable: true,
 *   created_at: "2026-07-01T00:00:00Z"
 * })
 * console.log(decoded._tag) // "Right"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class Notebook extends S.Class<Notebook>($I`Notebook`)(
  {
    id: S.String.pipe(key("id")),
    owner_id: S.String.pipe(key("owner_id")),
    name: S.String.pipe(key("name")),
    cells: S.Array(S.Unknown).pipe(key("cells")),
    deletable: S.Boolean.pipe(key("deletable")),
    created_at: S.String.pipe(key("created_at")),
  },
  $I.annote("Notebook", {
    description: "Notebook row mirrored from Cognee's notebook database model.",
  })
) {}

const BooleanRecord = S.Record(S.String, S.Boolean).pipe(
  $I.annoteSchema("BooleanRecord", {
    description: "Record of boolean values.",
  })
);

/**
 * Session Q&A entry mirrored from `cognee_session::SessionQAEntry`.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { SessionQAEntry } from "./Cognee.models.ts"
 *
 * const decoded = S.decodeUnknownEither(SessionQAEntry)({
 *   id: "qa-1",
 *   session_id: "session-1",
 *   user_id: null,
 *   question: "What is Cognee?",
 *   answer: "A knowledge graph memory system.",
 *   context: null,
 *   created_at: "2026-07-01T00:00:00Z",
 *   feedback_text: null,
 *   feedback_score: null,
 *   used_graph_element_ids: null,
 *   memify_metadata: null
 * })
 * console.log(decoded._tag) // "Right"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class SessionQAEntry extends S.Class<SessionQAEntry>($I`SessionQAEntry`)(
  {
    id: S.String.pipe(key("id")),
    session_id: S.String.pipe(key("session_id")),
    user_id: S.OptionFromNullOr(S.String).pipe(SchemaUtils.withNoneDefault, key("user_id")),
    question: S.String.pipe(key("question")),
    answer: S.String.pipe(key("answer")),
    context: S.OptionFromNullOr(S.String).pipe(SchemaUtils.withNoneDefault, key("context")),
    created_at: S.String.pipe(key("created_at")),
    feedback_text: S.OptionFromNullOr(S.String).pipe(SchemaUtils.withNoneDefault, key("feedback_text")),
    feedback_score: S.OptionFromNullOr(S.Finite).pipe(SchemaUtils.withNoneDefault, key("feedback_score")),
    used_graph_element_ids: S.OptionFromNullOr(UsedGraphElementIds).pipe(SchemaUtils.withNoneDefault, key("used_graph_element_ids")),
    memify_metadata: S.OptionFromNullOr(BooleanRecord).pipe(SchemaUtils.withNoneDefault, key("memify_metadata")),
  },
  $I.annote("SessionQAEntry", {
    description: "Session Q&A entry mirrored from cognee_session::SessionQAEntry.",
  })
) {}

/**
 * Options accepted by `cogneeVisualize` and `cogneeVisualizeToFile`.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { VisualizeOptions } from "./Cognee.models.ts"
 *
 * const decoded = S.decodeUnknownEither(VisualizeOptions)({ destinationPath: "/tmp/cognee-graph.html" })
 * console.log(decoded._tag) // "Right"
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export class VisualizeOptions extends S.Class<VisualizeOptions>($I`VisualizeOptions`)(
  {
    destinationPath: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault, key("destinationPath")),
  },
  $I.annote("VisualizeOptions", {
    description: "Options accepted by cogneeVisualize and cogneeVisualizeToFile.",
  })
) {}

/**
 * Types that can be passed as pipeline values.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { Value } from "./Cognee.models.ts"
 *
 * const decoded = S.decodeUnknownEither(Value)("Hello, world!")
 * console.log(decoded._tag) // "Right"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const Value = S.Union([S.Finite, S.Boolean, S.String, S.Uint8Array]).pipe(
  $I.annoteSchema("Value", {
    description: "Types that can be passed as pipeline values.",
  })
);

/**
 * Companion type for {@link Value}.
 *
 * @example
 * ```ts
 * import type { Value } from "./Cognee.models.ts"
 *
 * const value: Value = "Hello, world!"
 * console.log(value)
 * ```
 *
 * @category type-level
 * @since 0.0.0
 */
export type Value = typeof Value.Type;
