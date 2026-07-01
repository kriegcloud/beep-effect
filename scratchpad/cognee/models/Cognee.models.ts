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

/**
 * Text payload accepted by the add pipeline.
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
    description: "Text payload accepted by the add pipeline.",
  })
) {}

/**
 * File path payload accepted by the add pipeline.
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
    description: "File path payload accepted by the add pipeline.",
  })
) {}

/**
 * URL payload accepted by the add pipeline.
 *
 * @category models
 * @since 0.0.0
 */
export class UrlInput extends S.Class<UrlInput>($I`UrlInput`)(
  {
    type: S.tag("url"),
    url: S.String,
  },
  $I.annote("UrlInput", {
    description: "URL payload accepted by the add pipeline.",
  })
) {}

/**
 * Binary payload accepted by the add pipeline.
 *
 * @category models
 * @since 0.0.0
 */
export class BinaryInput extends S.Class<BinaryInput>($I`BinaryInput`)(
  {
    type: S.tag("binary"),
    bytes: S.Union([S.Uint8Array, S.Array(S.Finite), S.String]),
    name: S.String,
  },
  $I.annote("BinaryInput", {
    description: "Binary payload accepted by the add pipeline.",
  })
) {}

/**
 * Discriminated add input accepted by `cogneeAdd`.
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
 * Type for {@link DataInput}.
 *
 * @category models
 * @since 0.0.0
 */
export type DataInput = typeof DataInput.Type;

/**
 * Options accepted by `cogneeAdd` and the add phase of `cogneeAddAndCognify`.
 *
 * @category configuration
 * @since 0.0.0
 */
export class AddOptions extends S.Class<AddOptions>($I`AddOptions`)(
  {
    tenant: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
  },
  $I.annote("AddOptions", {
    description: "Options accepted by cogneeAdd and the add phase of cogneeAddAndCognify.",
  })
) {}

/**
 * Per-call cognify config overrides applied on top of the handle config.
 *
 * @category configuration
 * @since 0.0.0
 */
export class CognifyOptions extends S.Class<CognifyOptions>($I`CognifyOptions`)(
  {
    tenant: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
    chunkSize: S.OptionFromOptionalKey(S.Finite).pipe(SchemaUtils.withNoneDefault),
    chunkOverlap: S.OptionFromOptionalKey(S.Finite).pipe(SchemaUtils.withNoneDefault),
    summarization: S.OptionFromOptionalKey(S.Boolean).pipe(SchemaUtils.withNoneDefault),
    temporalCognify: S.OptionFromOptionalKey(S.Boolean).pipe(SchemaUtils.withNoneDefault),
    triplet: S.OptionFromOptionalKey(S.Boolean).pipe(
      SchemaUtils.withNoneDefault,
      S.annotateKey({
        description: "Whether to index source-relation-target triplet embeddings.",
      })
    ),
  },
  $I.annote("CognifyOptions", {
    description: "Per-call cognify config overrides applied on top of the handle config.",
  })
) {}

/**
 * Data item row mirrored from `cognee_models::Data`.
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
    updated_at: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
    label: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
    original_extension: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
    original_mime_type: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
    loader_engine: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
    raw_content_hash: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
    tenant_id: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
    external_metadata: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
    node_set: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
    pipeline_status: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
    token_count: S.Finite,
    data_size: S.Finite,
    last_accessed: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
    importance_weight: S.OptionFromNullOr(S.Number).pipe(SchemaUtils.withNoneDefault),
  },
  $I.annote("DataRecord", {
    description: "Data item row mirrored from cognee_models::Data.",
  })
) {}

/**
 * Result returned by `cogneeAdd`.
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
    description: "Result returned by cogneeAdd.",
  })
) {}

/**
 * Cognify pipeline count summary.
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
    priorPipelineRunId: S.OptionFromNullOr(S.String).pipe(SchemaUtils.withNoneDefault),
  },
  $I.annote("CognifyResult", {
    description: "Cognify pipeline count summary.",
  })
) {}

/**
 * Search type wire names matching Cognee's Rust serde representation.
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
]).pipe(
  $I.annoteSchema("SearchTypeString", {
    description: "Search type wire names matching Cognee's Rust serde representation.",
  })
);

/**
 * Type for {@link SearchTypeString}.
 *
 * @category models
 * @since 0.0.0
 */
export type SearchTypeString = typeof SearchTypeString.Type;

/**
 * Recall scope wire names.
 *
 * @category models
 * @since 0.0.0
 */
export const RecallScopeString = LiteralKit(["auto", "graph", "session", "trace", "graph_context", "all"]).pipe(
  $I.annoteSchema("RecallScopeString", {
    description: "Recall scope wire names.",
  })
);

/**
 * Type for {@link RecallScopeString}.
 *
 * @category models
 * @since 0.0.0
 */
export type RecallScopeString = typeof RecallScopeString.Type;

/**
 * Options accepted by `cogneeSearch`.
 *
 * @category configuration
 * @since 0.0.0
 */
export class SearchOptions extends S.Class<SearchOptions>($I`SearchOptions`)(
  {
    searchType: SearchTypeString.pipe(SchemaUtils.withKeyDefaults("GRAPH_COMPLETION")),
    datasets: S.Array(S.String).pipe(S.OptionFromOptionalKey, SchemaUtils.withNoneDefault),
    datasetIds: S.Array(S.String).pipe(S.OptionFromOptionalKey, SchemaUtils.withNoneDefault),
    topK: S.OptionFromOptionalKey(S.Finite).pipe(SchemaUtils.withNoneDefault),
    systemPrompt: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
    sessionId: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
    nodeType: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
    nodeName: S.Array(S.String).pipe(S.OptionFromOptionalKey, SchemaUtils.withNoneDefault),
    onlyContext: S.OptionFromOptionalKey(S.Boolean).pipe(SchemaUtils.withNoneDefault),
    useCombinedContext: S.OptionFromOptionalKey(S.Boolean).pipe(SchemaUtils.withNoneDefault),
    verbose: S.OptionFromOptionalKey(S.Boolean).pipe(SchemaUtils.withNoneDefault),
    saveInteraction: S.Boolean.pipe(SchemaUtils.withKeyDefaults(true)),
    autoFeedbackDetection: S.OptionFromOptionalKey(S.Boolean).pipe(SchemaUtils.withNoneDefault),
    userId: S.OptionFromOptionalKey(UUID).pipe(SchemaUtils.withNoneDefault),
  },
  $I.annote("SearchOptions", {
    description: "Options accepted by cogneeSearch.",
  })
) {}

/**
 * Options accepted by `cogneeRecall`.
 *
 * @category configuration
 * @since 0.0.0
 */
export class RecallOptions extends S.Class<RecallOptions>($I`RecallOptions`)(
  {
    searchType: S.OptionFromOptionalKey(SearchTypeString).pipe(SchemaUtils.withNoneDefault),
    datasets: S.Array(S.String).pipe(S.OptionFromOptionalKey, SchemaUtils.withNoneDefault),
    topK: S.Finite.pipe(SchemaUtils.withKeyDefaults(10)),
    autoRoute: S.Boolean.pipe(SchemaUtils.withKeyDefaults(false)),
    sessionId: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
    scope: S.Union([RecallScopeString, S.Array(RecallScopeString)]).pipe(SchemaUtils.withKeyDefaults("auto")),
  },
  $I.annote("RecallOptions", {
    description: "Options accepted by cogneeRecall.",
  })
) {}

/**
 * Search result item returned when the search output kind is `Items`.
 *
 * @category models
 * @since 0.0.0
 */
export class SearchItem extends S.Class<SearchItem>($I`SearchItem`)(
  {
    id: S.OptionFromNullOr(S.String).pipe(SchemaUtils.withNoneDefault),
    score: S.OptionFromNullOr(S.Number).pipe(SchemaUtils.withNoneDefault),
    payload: UnknownRecord,
  },
  $I.annote("SearchItem", {
    description: "Search result item returned when the search output kind is Items.",
  })
) {}

/**
 * Knowledge graph node attached to a search response.
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
    description: "Knowledge graph node attached to a search response.",
  })
) {}

/**
 * Knowledge graph edge attached to a search response.
 *
 * @category models
 * @since 0.0.0
 */
export class SearchGraphEdge extends S.Class<SearchGraphEdge>($I`SearchGraphEdge`)(
  {
    source: S.String,
    target: S.String,
    relationship: S.String,
    weight: S.OptionFromNullOr(S.Number).pipe(SchemaUtils.withNoneDefault),
  },
  $I.annote("SearchGraphEdge", {
    description: "Knowledge graph edge attached to a search response.",
  })
) {}

/**
 * Named graph payload attached to a search response.
 *
 * @category models
 * @since 0.0.0
 */
export class SearchGraph extends S.Class<SearchGraph>($I`SearchGraph`)(
  {
    nodes: S.Array(SearchGraphNode),
    edges: S.Array(SearchGraphEdge),
  },
  $I.annote("SearchGraph", {
    description: "Named graph payload attached to a search response.",
  })
) {}

class SearchRuleOutputItem extends S.Class<SearchRuleOutputItem>($I`SearchRuleOutputItem`)(
  {
    node_set: S.String,
    text: S.String,
  },
  $I.annote("SearchRuleOutputItem", {
    description: "Coding-rules search output row.",
  })
) {}

class SearchAckOutputData extends S.Class<SearchAckOutputData>($I`SearchAckOutputData`)(
  {
    message: S.String,
  },
  $I.annote("SearchAckOutputData", {
    description: "Acknowledgement search output payload.",
  })
) {}

class SearchItemsOutput extends S.Class<SearchItemsOutput>($I`SearchItemsOutput`)(
  {
    kind: S.tag("Items"),
    data: S.Array(SearchItem),
  },
  $I.annote("SearchItemsOutput", {
    description: "Search output containing structured search items.",
  })
) {}

class SearchTextOutput extends S.Class<SearchTextOutput>($I`SearchTextOutput`)(
  {
    kind: S.tag("Text"),
    data: S.String,
  },
  $I.annote("SearchTextOutput", {
    description: "Search output containing a single text value.",
  })
) {}

class SearchTextsOutput extends S.Class<SearchTextsOutput>($I`SearchTextsOutput`)(
  {
    kind: S.tag("Texts"),
    data: S.Array(S.String),
  },
  $I.annote("SearchTextsOutput", {
    description: "Search output containing multiple text values.",
  })
) {}

class SearchGraphQueryRowsOutput extends S.Class<SearchGraphQueryRowsOutput>($I`SearchGraphQueryRowsOutput`)(
  {
    kind: S.tag("GraphQueryRows"),
    data: S.Array(S.Array(S.Unknown)),
  },
  $I.annote("SearchGraphQueryRowsOutput", {
    description: "Search output containing graph query rows.",
  })
) {}

class SearchRulesOutput extends S.Class<SearchRulesOutput>($I`SearchRulesOutput`)(
  {
    kind: S.tag("Rules"),
    data: S.Array(SearchRuleOutputItem),
  },
  $I.annote("SearchRulesOutput", {
    description: "Search output containing coding rule rows.",
  })
) {}

class SearchAckOutput extends S.Class<SearchAckOutput>($I`SearchAckOutput`)(
  {
    kind: S.tag("Ack"),
    data: SearchAckOutputData,
  },
  $I.annote("SearchAckOutput", {
    description: "Search output containing an acknowledgement payload.",
  })
) {}

class SearchStructuredOutput extends S.Class<SearchStructuredOutput>($I`SearchStructuredOutput`)(
  {
    kind: S.tag("Structured"),
    data: S.Unknown,
  },
  $I.annote("SearchStructuredOutput", {
    description: "Search output containing an arbitrary structured value.",
  })
) {}

/**
 * Discriminated search output returned in `SearchResponse.result`.
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
 * Type for {@link SearchOutput}.
 *
 * @category models
 * @since 0.0.0
 */
export type SearchOutput = typeof SearchOutput.Type;

/**
 * Search response returned by `cogneeSearch`.
 *
 * @category models
 * @since 0.0.0
 */
export class SearchResponse extends S.Class<SearchResponse>($I`SearchResponse`)(
  {
    search_type: SearchTypeString,
    result: SearchOutput,
    context: S.OptionFromOptionalNullOr(S.Record(S.String, S.Array(SearchItem))).pipe(SchemaUtils.withNoneDefault),
    graphs: S.OptionFromOptionalNullOr(S.Record(S.String, SearchGraph)).pipe(SchemaUtils.withNoneDefault),
    diagnostics: S.OptionFromOptionalNullOr(UnknownRecord).pipe(SchemaUtils.withNoneDefault),
    datasets: S.OptionFromOptionalNullOr(S.Array(S.String)).pipe(SchemaUtils.withNoneDefault),
    only_context: S.Boolean,
    use_combined_context: S.Boolean,
    verbose: S.Boolean,
  },
  $I.annote("SearchResponse", {
    description: "Search response returned by cogneeSearch.",
  })
) {}

const RecallSourceString = LiteralKit(["session", "graph", "trace", "graph_context"]).pipe(
  $I.annoteSchema("RecallSourceString", {
    description: "Recall result source names.",
  })
);

/**
 * Source-tagged recall result item.
 *
 * @category models
 * @since 0.0.0
 */
export class RecallItem extends S.Class<RecallItem>($I`RecallItem`)(
  {
    source: RecallSourceString,
    content: UnknownRecord,
    score: S.Finite,
  },
  $I.annote("RecallItem", {
    description: "Source-tagged recall result item.",
  })
) {}

/**
 * Result returned by `cogneeRecall`.
 *
 * @category models
 * @since 0.0.0
 */
export class RecallResult extends S.Class<RecallResult>($I`RecallResult`)(
  {
    items: S.Array(RecallItem),
    searchTypeUsed: S.OptionFromOptionalNullOr(SearchTypeString).pipe(SchemaUtils.withNoneDefault),
    autoRouted: S.Boolean,
    searchResponse: S.OptionFromOptionalNullOr(SearchResponse).pipe(SchemaUtils.withNoneDefault),
  },
  $I.annote("RecallResult", {
    description: "Result returned by cogneeRecall.",
  })
) {}

/**
 * Options accepted by `cogneeRemember`.
 *
 * @category configuration
 * @since 0.0.0
 */
export class RememberOptions extends S.Class<RememberOptions>($I`RememberOptions`)(
  {
    sessionId: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
    selfImprovement: S.Boolean.pipe(SchemaUtils.withKeyDefaults(false)),
    tenant: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
  },
  $I.annote("RememberOptions", {
    description: "Options accepted by cogneeRemember.",
  })
) {}

/**
 * Open record result returned by remember operations.
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
 * Type for {@link RememberResult}.
 *
 * @category models
 * @since 0.0.0
 */
export type RememberResult = typeof RememberResult.Type;

/**
 * Graph element IDs used to produce a Q&A answer.
 *
 * @category models
 * @since 0.0.0
 */
export class UsedGraphElementIds extends S.Class<UsedGraphElementIds>($I`UsedGraphElementIds`)(
  {
    node_ids: S.Array(S.String),
    edge_ids: S.Array(S.String),
  },
  $I.annote("UsedGraphElementIds", {
    description: "Graph element IDs used to produce a Q&A answer.",
  })
) {}

class QAMemoryEntry extends S.Class<QAMemoryEntry>($I`QAMemoryEntry`)(
  {
    type: S.tag("qa"),
    question: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
    answer: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
    context: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
    feedbackText: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
    feedbackScore: S.OptionFromOptionalKey(S.Finite).pipe(SchemaUtils.withNoneDefault),
    usedGraphElementIds: S.OptionFromOptionalKey(UsedGraphElementIds).pipe(SchemaUtils.withNoneDefault),
  },
  $I.annote("QAMemoryEntry", {
    description: "Q&A memory entry accepted by cogneeRememberEntry.",
  })
) {}

class TraceMemoryEntry extends S.Class<TraceMemoryEntry>($I`TraceMemoryEntry`)(
  {
    type: S.tag("trace"),
    originFunction: S.String,
    status: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
    memoryQuery: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
    memoryContext: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
    methodParams: S.OptionFromOptionalKey(S.Unknown).pipe(SchemaUtils.withNoneDefault),
    methodReturnValue: S.OptionFromOptionalKey(S.Unknown).pipe(SchemaUtils.withNoneDefault),
    errorMessage: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
    generateFeedbackWithLlm: S.OptionFromOptionalKey(S.Boolean).pipe(SchemaUtils.withNoneDefault),
  },
  $I.annote("TraceMemoryEntry", {
    description: "Trace memory entry accepted by cogneeRememberEntry.",
  })
) {}

class FeedbackMemoryEntry extends S.Class<FeedbackMemoryEntry>($I`FeedbackMemoryEntry`)(
  {
    type: S.tag("feedback"),
    qaId: S.String,
    feedbackText: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
    feedbackScore: S.OptionFromOptionalKey(S.Finite).pipe(SchemaUtils.withNoneDefault),
  },
  $I.annote("FeedbackMemoryEntry", {
    description: "Feedback memory entry accepted by cogneeRememberEntry.",
  })
) {}

/**
 * Typed memory entry accepted by `cogneeRememberEntry`.
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
 * Type for {@link MemoryEntry}.
 *
 * @category models
 * @since 0.0.0
 */
export type MemoryEntry = typeof MemoryEntry.Type;

/**
 * Options accepted by `cogneeMemify`.
 *
 * @category configuration
 * @since 0.0.0
 */
export class MemifyOptions extends S.Class<MemifyOptions>($I`MemifyOptions`)(
  {
    tripletBatchSize: S.OptionFromOptionalKey(S.Finite).pipe(SchemaUtils.withNoneDefault),
    nodeTypeFilter: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
    nodeNameFilter: S.Array(S.String).pipe(S.OptionFromOptionalKey, SchemaUtils.withNoneDefault),
    nodeNameFilterOperator: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
  },
  $I.annote("MemifyOptions", {
    description: "Options accepted by cogneeMemify.",
  })
) {}

/**
 * Result returned by `cogneeMemify`.
 *
 * @category models
 * @since 0.0.0
 */
export class MemifyResult extends S.Class<MemifyResult>($I`MemifyResult`)(
  {
    tripletCount: S.Finite,
    indexedCount: S.Finite,
    batchCount: S.Finite,
    alreadyCompleted: S.Boolean,
    priorPipelineRunId: S.OptionFromNullOr(S.String).pipe(SchemaUtils.withNoneDefault),
  },
  $I.annote("MemifyResult", {
    description: "Result returned by cogneeMemify.",
  })
) {}

/**
 * Options accepted by `cogneeImprove`.
 *
 * @category configuration
 * @since 0.0.0
 */
export class ImproveOptions extends S.Class<ImproveOptions>($I`ImproveOptions`)(
  {
    datasetName: S.String,
    sessionIds: S.Array(S.String).pipe(S.OptionFromOptionalKey, SchemaUtils.withNoneDefault),
    nodeName: S.Array(S.String).pipe(S.OptionFromOptionalKey, SchemaUtils.withNoneDefault),
    feedbackAlpha: S.OptionFromOptionalKey(S.Finite).pipe(SchemaUtils.withNoneDefault),
    tenant: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
  },
  $I.annote("ImproveOptions", {
    description: "Options accepted by cogneeImprove.",
  })
) {}

/**
 * Result returned by `cogneeImprove`.
 *
 * @category models
 * @since 0.0.0
 */
export class ImproveResult extends S.Class<ImproveResult>($I`ImproveResult`)(
  {
    stagesRun: S.Array(S.String),
    memifyResult: S.OptionFromOptionalNullOr(MemifyResult).pipe(SchemaUtils.withNoneDefault),
    feedbackEntriesProcessed: S.Finite,
    feedbackEntriesApplied: S.Finite,
    sessionsPersisted: S.Finite,
    edgesSynced: S.Finite,
  },
  $I.annote("ImproveResult", {
    description: "Result returned by cogneeImprove.",
  })
) {}

class DatasetNameSelector extends S.Class<DatasetNameSelector>($I`DatasetNameSelector`)(
  {
    name: S.String,
  },
  $I.annote("DatasetNameSelector", {
    description: "Dataset selector by name.",
  })
) {}

class DatasetIdSelector extends S.Class<DatasetIdSelector>($I`DatasetIdSelector`)(
  {
    id: S.String,
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
    kind: S.tag("item"),
    dataId: S.String,
    dataset: DatasetSelector,
  },
  $I.annote("ForgetItemTarget", {
    description: "Forget target for a single data item.",
  })
) {}

class ForgetDatasetTarget extends S.Class<ForgetDatasetTarget>($I`ForgetDatasetTarget`)(
  {
    kind: S.tag("dataset"),
    dataset: DatasetSelector,
  },
  $I.annote("ForgetDatasetTarget", {
    description: "Forget target for a dataset.",
  })
) {}

class ForgetAllTarget extends S.Class<ForgetAllTarget>($I`ForgetAllTarget`)(
  {
    kind: S.tag("all"),
  },
  $I.annote("ForgetAllTarget", {
    description: "Forget target for all data.",
  })
) {}

/**
 * Target accepted by `cogneeForget`.
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
 * Type for {@link ForgetTarget}.
 *
 * @category models
 * @since 0.0.0
 */
export type ForgetTarget = typeof ForgetTarget.Type;

/**
 * Delete operation detail mirrored from `cognee_delete::DeleteResult`.
 *
 * @category models
 * @since 0.0.0
 */
export class DeleteResultDetail extends S.Class<DeleteResultDetail>($I`DeleteResultDetail`)(
  {
    deleted_datasets: S.Finite,
    deleted_dataset_links: S.Finite,
    deleted_data: S.Finite,
    deleted_storage_files: S.Finite,
    deleted_graph_nodes: S.Finite,
    deleted_vector_points: S.Finite,
    deleted_provenance_nodes: S.Finite,
    deleted_provenance_edges: S.Finite,
    deleted_orphan_entities: S.Finite,
    deleted_orphan_entity_types: S.Finite,
    deleted_orphan_edge_types: S.Finite,
    deleted_pipeline_runs: S.Finite,
    cleared_pipeline_statuses: S.Finite,
    deleted_search_queries: S.Finite,
    pruned_sessions: S.Boolean,
    warnings: S.Array(S.String),
  },
  $I.annote("DeleteResultDetail", {
    description: "Delete operation detail mirrored from cognee_delete::DeleteResult.",
  })
) {}

/**
 * Backward-compatible schema alias for {@link DeleteResultDetail}.
 *
 * @category models
 * @since 0.0.0
 */
export const DeleteResult = DeleteResultDetail;

/**
 * Type alias for {@link DeleteResultDetail}.
 *
 * @category models
 * @since 0.0.0
 */
export type DeleteResult = DeleteResultDetail;

/**
 * Result returned by `cogneeForget`.
 *
 * @category models
 * @since 0.0.0
 */
export class ForgetResult extends S.Class<ForgetResult>($I`ForgetResult`)(
  {
    target: S.String,
    deleteResult: DeleteResultDetail,
  },
  $I.annote("ForgetResult", {
    description: "Result returned by cogneeForget.",
  })
) {}

/**
 * Options accepted by `cogneeUpdate`.
 *
 * @category configuration
 * @since 0.0.0
 */
export class UpdateOptions extends S.Class<UpdateOptions>($I`UpdateOptions`)(
  {
    tenant: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
  },
  $I.annote("UpdateOptions", {
    description: "Options accepted by cogneeUpdate.",
  })
) {}

/**
 * Result returned by `cogneeUpdate`.
 *
 * @category models
 * @since 0.0.0
 */
export class UpdateResult extends S.Class<UpdateResult>($I`UpdateResult`)(
  {
    deletedDataId: S.String,
    deleteResult: DeleteResultDetail,
    newData: S.Array(DataRecord),
    cognifyResult: S.OptionFromOptionalNullOr(CognifyResult).pipe(SchemaUtils.withNoneDefault),
  },
  $I.annote("UpdateResult", {
    description: "Result returned by cogneeUpdate.",
  })
) {}

/**
 * Options accepted by `cogneePruneSystem`.
 *
 * @category configuration
 * @since 0.0.0
 */
export class PruneSystemOptions extends S.Class<PruneSystemOptions>($I`PruneSystemOptions`)(
  {
    pruneGraph: S.OptionFromOptionalKey(S.Boolean).pipe(SchemaUtils.withNoneDefault),
    pruneVector: S.OptionFromOptionalKey(S.Boolean).pipe(SchemaUtils.withNoneDefault),
    pruneMetadata: S.OptionFromOptionalKey(S.Boolean).pipe(SchemaUtils.withNoneDefault),
    pruneCache: S.OptionFromOptionalKey(S.Boolean).pipe(SchemaUtils.withNoneDefault),
  },
  $I.annote("PruneSystemOptions", {
    description: "Options accepted by cogneePruneSystem.",
  })
) {}

/**
 * Result returned by `cogneePruneSystem`.
 *
 * @category models
 * @since 0.0.0
 */
export class PruneResult extends S.Class<PruneResult>($I`PruneResult`)(
  {
    dataPruned: S.Boolean,
    graphPruned: S.Boolean,
    vectorPruned: S.Boolean,
    metadataPruned: S.Boolean,
    cachePruned: S.Boolean,
  },
  $I.annote("PruneResult", {
    description: "Result returned by cogneePruneSystem.",
  })
) {}

/**
 * Dataset row mirrored from `cognee_models::Dataset`.
 *
 * @category models
 * @since 0.0.0
 */
export class Dataset extends S.Class<Dataset>($I`Dataset`)(
  {
    id: S.String,
    name: S.String,
    owner_id: S.String,
    tenant_id: S.OptionFromNullOr(S.String).pipe(SchemaUtils.withNoneDefault),
    created_at: S.String,
    updated_at: S.OptionFromNullOr(S.String).pipe(SchemaUtils.withNoneDefault),
  },
  $I.annote("Dataset", {
    description: "Dataset row mirrored from cognee_models::Dataset.",
  })
) {}

/**
 * Backward-compatible schema alias for {@link DataRecord}.
 *
 * @category models
 * @since 0.0.0
 */
export const Data = DataRecord;

/**
 * Type alias for {@link DataRecord}.
 *
 * @category models
 * @since 0.0.0
 */
export type Data = DataRecord;

/**
 * User row mirrored from `cognee_models::User`.
 *
 * @category models
 * @since 0.0.0
 */
export class User extends S.Class<User>($I`User`)(
  {
    id: S.String,
    email: S.String,
    is_active: S.Boolean,
    is_superuser: S.Boolean,
    tenant_id: S.OptionFromNullOr(S.String).pipe(SchemaUtils.withNoneDefault),
    created_at: S.String,
    updated_at: S.OptionFromNullOr(S.String).pipe(SchemaUtils.withNoneDefault),
  },
  $I.annote("User", {
    description: "User row mirrored from cognee_models::User.",
  })
) {}

/**
 * Notebook row mirrored from Cognee's notebook database model.
 *
 * @category models
 * @since 0.0.0
 */
export class Notebook extends S.Class<Notebook>($I`Notebook`)(
  {
    id: S.String,
    owner_id: S.String,
    name: S.String,
    cells: S.Array(S.Unknown),
    deletable: S.Boolean,
    created_at: S.String,
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
 * @category models
 * @since 0.0.0
 */
export class SessionQAEntry extends S.Class<SessionQAEntry>($I`SessionQAEntry`)(
  {
    id: S.String,
    session_id: S.String,
    user_id: S.OptionFromNullOr(S.String).pipe(SchemaUtils.withNoneDefault),
    question: S.String,
    answer: S.String,
    context: S.OptionFromNullOr(S.String).pipe(SchemaUtils.withNoneDefault),
    created_at: S.String,
    feedback_text: S.OptionFromNullOr(S.String).pipe(SchemaUtils.withNoneDefault),
    feedback_score: S.OptionFromNullOr(S.Number).pipe(SchemaUtils.withNoneDefault),
    used_graph_element_ids: S.OptionFromNullOr(UsedGraphElementIds).pipe(SchemaUtils.withNoneDefault),
    memify_metadata: S.OptionFromNullOr(BooleanRecord).pipe(SchemaUtils.withNoneDefault),
  },
  $I.annote("SessionQAEntry", {
    description: "Session Q&A entry mirrored from cognee_session::SessionQAEntry.",
  })
) {}

/**
 * Options accepted by `cogneeVisualize` and `cogneeVisualizeToFile`.
 *
 * @category configuration
 * @since 0.0.0
 */
export class VisualizeOptions extends S.Class<VisualizeOptions>($I`VisualizeOptions`)(
  {
    destinationPath: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
  },
  $I.annote("VisualizeOptions", {
    description: "Options accepted by cogneeVisualize and cogneeVisualizeToFile.",
  })
) {}
