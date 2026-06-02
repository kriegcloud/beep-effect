/**
 * Streaming and dataset MCP tool definitions.
 *
 * Declares the 17 agent-facing streaming tools (file IO, JSONL handling,
 * dataset loading, and line-transform pipelines) together with their output
 * schemas and the {@link StreamingToolkit} that groups them. Every tool fails
 * with {@link AiToolError} using `failureMode: "return"` so callers can inspect
 * structured failures. All output schemas are plain {@link S.Struct} values
 * because the toolkit encodes results structurally.
 *
 * @since 0.0.0
 * @packageDocumentation
 */

import { $NlpMcpId } from "@beep/identity";
import { AiToolError } from "@beep/nlp/Tools";
import { LiteralKit, SchemaUtils } from "@beep/schema";
import * as S from "effect/Schema";
import { Tool, Toolkit } from "effect/unstable/ai";

const $I = $NlpMcpId.create("StreamingTools");

const EncodingKit = LiteralKit(["ascii", "latin1", "utf-8"]).annotate(
  $I.annote("EncodingKit", {
    description: "LiteralKit backing schema for supported text decoding labels.",
  })
);
const Encoding = EncodingKit.pipe(
  $I.annoteSchema("Encoding", { description: "Text decoding label applied to file bytes." }),
  SchemaUtils.withLiteralKitStatics(EncodingKit)
);

const StageKit = LiteralKit(["lowercase", "normalizeWhitespace", "removePunctuation", "trim", "uppercase"]).annotate(
  $I.annote("StageKit", {
    description: "LiteralKit backing schema for supported pipeline transform stages.",
  })
);
const Stage = StageKit.pipe(
  $I.annoteSchema("Stage", { description: "A pure per-line transform applied by the processing pipeline." }),
  SchemaUtils.withLiteralKitStatics(StageKit)
);

const JsonlLineErrorOutput = S.Struct({
  error: S.String,
  lineNumber: S.Number,
}).pipe(
  $I.annoteSchema("JsonlLineErrorOutput", {
    description: "A JSONL line parse failure with its zero-based line number.",
  })
);

const PipelineErrorOutput = S.Struct({
  error: S.String,
  item: S.Unknown,
  stage: S.String,
}).pipe(
  $I.annoteSchema("PipelineErrorOutput", {
    description: "A pipeline failure describing the failing item, message, and stage.",
  })
);

/**
 * Output schema for line-returning streaming tools.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { LinesOutput } from "@beep/nlp-mcp/StreamingTools"
 *
 * const output = S.decodeUnknownSync(LinesOutput)({ count: 1, lines: ["hi"], truncated: false })
 * output.count
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const LinesOutput = S.Struct({
  count: S.Number,
  lines: S.Array(S.String),
  truncated: S.Boolean,
}).pipe(
  $I.annoteSchema("LinesOutput", {
    description: "Lines returned from a streaming file operation with a truncation flag.",
  })
);

/**
 * Output schema for file existence and size metadata.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { FileInfoOutput } from "@beep/nlp-mcp/StreamingTools"
 *
 * const output = S.decodeUnknownSync(FileInfoOutput)({ exists: true, lineCount: 3, sizeBytes: 12 })
 * output.exists
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const FileInfoOutput = S.Struct({
  exists: S.Boolean,
  lineCount: S.optionalKey(S.Number),
  sizeBytes: S.optionalKey(S.Number),
}).pipe(
  $I.annoteSchema("FileInfoOutput", {
    description: "File existence with optional line count and byte size.",
  })
);

/**
 * Output schema for aggregate text statistics.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { TextStatsOutput } from "@beep/nlp-mcp/StreamingTools"
 *
 * const output = S.decodeUnknownSync(TextStatsOutput)({
 *   avgLineLength: 4,
 *   maxLineLength: 8,
 *   minLineLength: 1,
 *   nonEmptyLines: 2,
 *   totalBytes: 12,
 *   totalLines: 3
 * })
 * output.totalLines
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const TextStatsOutput = S.Struct({
  avgLineLength: S.Number,
  maxLineLength: S.Number,
  minLineLength: S.Number,
  nonEmptyLines: S.Number,
  totalBytes: S.Number,
  totalLines: S.Number,
}).pipe(
  $I.annoteSchema("TextStatsOutput", {
    description: "Aggregate line-length and byte statistics for a text file.",
  })
);

/**
 * Output schema for JSONL record reads, with optional collected errors.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { JsonlOutput } from "@beep/nlp-mcp/StreamingTools"
 *
 * const output = S.decodeUnknownSync(JsonlOutput)({ count: 1, records: [{ id: 1 }], truncated: false })
 * output.count
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const JsonlOutput = S.Struct({
  count: S.Number,
  errors: JsonlLineErrorOutput.pipe(S.Array, S.optionalKey),
  records: S.Array(S.Unknown),
  truncated: S.Boolean,
}).pipe(
  $I.annoteSchema("JsonlOutput", {
    description: "JSONL records returned from a streaming operation with optional parse errors.",
  })
);

/**
 * Output schema for JSONL parse statistics.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { JsonlStatsOutput } from "@beep/nlp-mcp/StreamingTools"
 *
 * const output = S.decodeUnknownSync(JsonlStatsOutput)({
 *   errorCount: 0,
 *   skippedCount: 0,
 *   successCount: 3,
 *   totalLines: 3
 * })
 * output.successCount
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const JsonlStatsOutput = S.Struct({
  errorCount: S.Number,
  skippedCount: S.Number,
  successCount: S.Number,
  totalLines: S.Number,
}).pipe(
  $I.annoteSchema("JsonlStatsOutput", {
    description: "Aggregate parse statistics for a JSONL file.",
  })
);

/**
 * Output schema for dataset provenance metadata.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { DatasetMetaOutput } from "@beep/nlp-mcp/StreamingTools"
 *
 * const output = S.decodeUnknownSync(DatasetMetaOutput)({
 *   format: "text",
 *   loadedAt: 0,
 *   location: "/tmp/data.txt",
 *   sourceType: "file"
 * })
 * output.format
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const DatasetMetaOutput = S.Struct({
  format: S.String,
  loadedAt: S.Number,
  location: S.String,
  sizeBytes: S.optionalKey(S.Number),
  sourceType: S.String,
}).pipe(
  $I.annoteSchema("DatasetMetaOutput", {
    description: "Provenance metadata describing a loaded dataset.",
  })
);

/**
 * Output schema pairing loaded data with its {@link DatasetMetaOutput}.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { DataOutput } from "@beep/nlp-mcp/StreamingTools"
 *
 * const output = S.decodeUnknownSync(DataOutput)({
 *   data: "hello",
 *   meta: { format: "text", loadedAt: 0, location: "/tmp/data.txt", sourceType: "file" }
 * })
 * output.meta.format
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const DataOutput = S.Struct({
  data: S.Unknown,
  meta: DatasetMetaOutput,
}).pipe(
  $I.annoteSchema("DataOutput", {
    description: "A loaded dataset payload paired with its provenance metadata.",
  })
);

/**
 * Output schema for line-transform pipeline runs.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { PipelineOutput } from "@beep/nlp-mcp/StreamingTools"
 *
 * const output = S.decodeUnknownSync(PipelineOutput)({
 *   durationMs: 1,
 *   errors: [],
 *   failed: 0,
 *   processed: 2,
 *   results: ["a", "b"],
 *   skipped: 0
 * })
 * output.processed
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const PipelineOutput = S.Struct({
  durationMs: S.Number,
  errors: S.Array(PipelineErrorOutput),
  failed: S.Number,
  processed: S.Number,
  results: S.Array(S.Unknown),
  skipped: S.Number,
}).pipe(
  $I.annoteSchema("PipelineOutput", {
    description: "Result of running a line-transform pipeline over a file.",
  })
);

const CountOutput = S.Struct({
  count: S.Number,
}).pipe(
  $I.annoteSchema("CountOutput", {
    description: "A single non-negative count.",
  })
);

const CountWithErrorsOutput = S.Struct({
  count: S.Number,
  errors: S.optionalKey(S.Number),
}).pipe(
  $I.annoteSchema("CountWithErrorsOutput", {
    description: "A count with an optional companion error count.",
  })
);

const ReadLinesParameters = S.Struct({
  options: S.optionalKey(
    S.Struct({
      encoding: S.optionalKey(Encoding),
      maxLines: S.optionalKey(S.Number.check(S.isGreaterThan(0))),
      skip: S.optionalKey(S.Number.check(S.isGreaterThanOrEqualTo(0))),
      skipEmpty: S.optionalKey(S.Boolean),
      tail: S.optionalKey(S.Number.check(S.isGreaterThan(0))),
      trim: S.optionalKey(S.Boolean),
    })
  ),
  path: S.String.check(S.isMinLength(1)),
}).pipe($I.annoteSchema("ReadLinesParameters", { description: "Inputs for reading lines from a text file." }));

const FileInfoParameters = S.Struct({
  path: S.String.check(S.isMinLength(1)),
}).pipe($I.annoteSchema("FileInfoParameters", { description: "Inputs for inspecting a text file." }));

const TextStatsParameters = S.Struct({
  options: S.optionalKey(
    S.Struct({
      skipEmpty: S.optionalKey(S.Boolean),
      trim: S.optionalKey(S.Boolean),
    })
  ),
  path: S.String.check(S.isMinLength(1)),
}).pipe($I.annoteSchema("TextStatsParameters", { description: "Inputs for computing text statistics." }));

const SampleLinesParameters = S.Struct({
  options: S.optionalKey(
    S.Struct({
      skipEmpty: S.optionalKey(S.Boolean),
      trim: S.optionalKey(S.Boolean),
    })
  ),
  path: S.String.check(S.isMinLength(1)),
  sampleSize: S.Number.check(S.isGreaterThan(0), S.isLessThanOrEqualTo(10_000)),
}).pipe($I.annoteSchema("SampleLinesParameters", { description: "Inputs for randomly sampling text lines." }));

const ReadJsonlParameters = S.Struct({
  options: S.optionalKey(
    S.Struct({
      collectErrors: S.optionalKey(S.Boolean),
      maxRecords: S.optionalKey(S.Number.check(S.isGreaterThan(0))),
      skipInvalid: S.optionalKey(S.Boolean),
    })
  ),
  path: S.String.check(S.isMinLength(1)),
}).pipe($I.annoteSchema("ReadJsonlParameters", { description: "Inputs for reading JSONL records." }));

const JsonlStatsParameters = S.Struct({
  path: S.String.check(S.isMinLength(1)),
}).pipe($I.annoteSchema("JsonlStatsParameters", { description: "Inputs for computing JSONL statistics." }));

const ValidateJsonlParameters = S.Struct({
  options: S.optionalKey(
    S.Struct({
      maxErrors: S.optionalKey(S.Number.check(S.isGreaterThan(0))),
    })
  ),
  path: S.String.check(S.isMinLength(1)),
}).pipe($I.annoteSchema("ValidateJsonlParameters", { description: "Inputs for validating a JSONL file." }));

const SampleJsonlParameters = S.Struct({
  options: S.optionalKey(
    S.Struct({
      skipInvalid: S.optionalKey(S.Boolean),
    })
  ),
  path: S.String.check(S.isMinLength(1)),
  sampleSize: S.Number.check(S.isGreaterThan(0), S.isLessThanOrEqualTo(10_000)),
}).pipe($I.annoteSchema("SampleJsonlParameters", { description: "Inputs for randomly sampling JSONL records." }));

const LoadTextParameters = S.Struct({
  location: S.String.check(S.isMinLength(1)),
  options: S.optionalKey(
    S.Struct({
      encoding: S.optionalKey(Encoding),
      timeout: S.optionalKey(S.Number.check(S.isGreaterThan(0))),
    })
  ),
}).pipe($I.annoteSchema("LoadTextParameters", { description: "Inputs for loading text from a file or URL." }));

const LoadLinesParameters = S.Struct({
  location: S.String.check(S.isMinLength(1)),
  options: S.optionalKey(
    S.Struct({
      maxLines: S.optionalKey(S.Number.check(S.isGreaterThan(0))),
      skipEmpty: S.optionalKey(S.Boolean),
      timeout: S.optionalKey(S.Number.check(S.isGreaterThan(0))),
      trim: S.optionalKey(S.Boolean),
    })
  ),
}).pipe($I.annoteSchema("LoadLinesParameters", { description: "Inputs for loading lines from a file or URL." }));

const LoadJsonlParameters = S.Struct({
  location: S.String.check(S.isMinLength(1)),
  options: S.optionalKey(
    S.Struct({
      maxRecords: S.optionalKey(S.Number.check(S.isGreaterThan(0))),
      skipInvalid: S.optionalKey(S.Boolean),
      timeout: S.optionalKey(S.Number.check(S.isGreaterThan(0))),
    })
  ),
}).pipe($I.annoteSchema("LoadJsonlParameters", { description: "Inputs for loading JSONL from a file or URL." }));

const LoadJsonParameters = S.Struct({
  location: S.String.check(S.isMinLength(1)),
  options: S.optionalKey(
    S.Struct({
      timeout: S.optionalKey(S.Number.check(S.isGreaterThan(0))),
    })
  ),
}).pipe($I.annoteSchema("LoadJsonParameters", { description: "Inputs for loading JSON from a file or URL." }));

const ProcessFileParameters = S.Struct({
  options: S.optionalKey(
    S.Struct({
      maxLines: S.optionalKey(S.Number.check(S.isGreaterThan(0))),
      skipEmpty: S.optionalKey(S.Boolean),
      stopOnError: S.optionalKey(S.Boolean).annotateKey({
        description:
          "Reserved for future custom stages. The built-in transform stages are total and never fail, so this option currently has no effect.",
      }),
    })
  ),
  path: S.String.check(S.isMinLength(1)),
  stages: S.NonEmptyArray(Stage),
}).pipe($I.annoteSchema("ProcessFileParameters", { description: "Inputs for running a line-transform pipeline." }));

const FilterLinesParameters = S.Struct({
  options: S.optionalKey(
    S.Struct({
      caseInsensitive: S.optionalKey(S.Boolean),
      invert: S.optionalKey(S.Boolean),
      maxLines: S.optionalKey(S.Number.check(S.isGreaterThan(0))),
    })
  ),
  path: S.String.check(S.isMinLength(1)),
  pattern: S.String.check(S.isMinLength(1)),
}).pipe($I.annoteSchema("FilterLinesParameters", { description: "Inputs for filtering lines by a regex pattern." }));

const ExtractMatchesParameters = S.Struct({
  options: S.optionalKey(
    S.Struct({
      caseInsensitive: S.optionalKey(S.Boolean),
      fullLines: S.optionalKey(S.Boolean),
      maxMatches: S.optionalKey(S.Number.check(S.isGreaterThan(0))),
    })
  ),
  path: S.String.check(S.isMinLength(1)),
  pattern: S.String.check(S.isMinLength(1)),
}).pipe(
  $I.annoteSchema("ExtractMatchesParameters", { description: "Inputs for extracting regex matches from a file." })
);

const CountLinesParameters = S.Struct({
  options: S.optionalKey(
    S.Struct({
      skipEmpty: S.optionalKey(S.Boolean),
    })
  ),
  path: S.String.check(S.isMinLength(1)),
}).pipe($I.annoteSchema("CountLinesParameters", { description: "Inputs for counting lines in a file." }));

const CountJsonlParameters = S.Struct({
  options: S.optionalKey(
    S.Struct({
      skipInvalid: S.optionalKey(S.Boolean),
    })
  ),
  path: S.String.check(S.isMinLength(1)),
}).pipe($I.annoteSchema("CountJsonlParameters", { description: "Inputs for counting JSONL records in a file." }));

/**
 * Tool: read lines from a text file with optional head/tail windowing.
 *
 * @since 0.0.0
 * @category tools
 */
export const ReadLines = Tool.make("stream_read_lines", {
  description:
    "Read lines from a text file. Memory efficient for large files. Supports head/tail windowing, skipping, and trimming.",
  failure: AiToolError,
  failureMode: "return",
  parameters: ReadLinesParameters,
  success: LinesOutput,
});

/**
 * Tool: report whether a file exists plus its size and line count.
 *
 * @since 0.0.0
 * @category tools
 */
export const FileInfo = Tool.make("stream_file_info", {
  description: "Get information about a text file: existence, byte size, and line count.",
  failure: AiToolError,
  failureMode: "return",
  parameters: FileInfoParameters,
  success: FileInfoOutput,
});

/**
 * Tool: compute aggregate line-length and byte statistics for a file.
 *
 * @since 0.0.0
 * @category tools
 */
export const TextStats = Tool.make("stream_text_stats", {
  description: "Compute detailed statistics about a text file: line counts, byte size, and line-length distribution.",
  failure: AiToolError,
  failureMode: "return",
  parameters: TextStatsParameters,
  success: TextStatsOutput,
});

/**
 * Tool: sample random lines from a text file.
 *
 * @since 0.0.0
 * @category tools
 */
export const SampleLines = Tool.make("stream_sample_lines", {
  description: "Sample random lines from a text file. Useful for building test or validation subsets.",
  failure: AiToolError,
  failureMode: "return",
  parameters: SampleLinesParameters,
  success: LinesOutput,
});

/**
 * Tool: read JSONL/NDJSON records from a file.
 *
 * @since 0.0.0
 * @category tools
 */
export const ReadJsonl = Tool.make("stream_read_jsonl", {
  description: "Read JSON Lines (JSONL/NDJSON) records from a file. Memory efficient and supports error collection.",
  failure: AiToolError,
  failureMode: "return",
  parameters: ReadJsonlParameters,
  success: JsonlOutput,
});

/**
 * Tool: compute JSONL parse statistics for a file.
 *
 * @since 0.0.0
 * @category tools
 */
export const JsonlStats = Tool.make("stream_jsonl_stats", {
  description: "Compute statistics about a JSONL file: total, success, error, and skipped line counts.",
  failure: AiToolError,
  failureMode: "return",
  parameters: JsonlStatsParameters,
  success: JsonlStatsOutput,
});

/**
 * Tool: validate a JSONL file and collect parse errors.
 *
 * @since 0.0.0
 * @category tools
 */
export const ValidateJsonl = Tool.make("stream_validate_jsonl", {
  description: "Validate a JSONL file, returning parsed records and collected parse errors.",
  failure: AiToolError,
  failureMode: "return",
  parameters: ValidateJsonlParameters,
  success: JsonlOutput,
});

/**
 * Tool: sample random JSONL records from a file.
 *
 * @since 0.0.0
 * @category tools
 */
export const SampleJsonl = Tool.make("stream_sample_jsonl", {
  description: "Sample random records from a JSONL file.",
  failure: AiToolError,
  failureMode: "return",
  parameters: SampleJsonlParameters,
  success: JsonlOutput,
});

/**
 * Tool: load text from a local file or remote URL.
 *
 * @since 0.0.0
 * @category tools
 */
export const LoadText = Tool.make("stream_load_text", {
  description: "Load text content from a local file or remote URL. Auto-detects the source type.",
  failure: AiToolError,
  failureMode: "return",
  parameters: LoadTextParameters,
  success: DataOutput,
});

/**
 * Tool: load lines from a local file or remote URL.
 *
 * @since 0.0.0
 * @category tools
 */
export const LoadLines = Tool.make("stream_load_lines", {
  description: "Load text as an array of lines from a local file or remote URL.",
  failure: AiToolError,
  failureMode: "return",
  parameters: LoadLinesParameters,
  success: DataOutput,
});

/**
 * Tool: load JSONL records from a local file or remote URL.
 *
 * @since 0.0.0
 * @category tools
 */
export const LoadJsonl = Tool.make("stream_load_jsonl", {
  description: "Load JSONL/NDJSON records from a local file or remote URL. Auto-detects the source type.",
  failure: AiToolError,
  failureMode: "return",
  parameters: LoadJsonlParameters,
  success: DataOutput,
});

/**
 * Tool: load and parse JSON from a local file or remote URL.
 *
 * @since 0.0.0
 * @category tools
 */
export const LoadJson = Tool.make("stream_load_json", {
  description: "Load and parse a JSON document from a local file or remote URL.",
  failure: AiToolError,
  failureMode: "return",
  parameters: LoadJsonParameters,
  success: DataOutput,
});

/**
 * Tool: run a line-transform pipeline over a file.
 *
 * @since 0.0.0
 * @category tools
 */
export const ProcessFile = Tool.make("stream_process_file", {
  description: "Run a line-transform pipeline over a file, applying ordered stages to each line.",
  failure: AiToolError,
  failureMode: "return",
  parameters: ProcessFileParameters,
  success: PipelineOutput,
});

/**
 * Tool: filter file lines by a regex pattern.
 *
 * @since 0.0.0
 * @category tools
 */
export const FilterLines = Tool.make("stream_filter_lines", {
  description: "Filter lines from a file that match a regex pattern, with optional inversion.",
  failure: AiToolError,
  failureMode: "return",
  parameters: FilterLinesParameters,
  success: LinesOutput,
});

/**
 * Tool: extract regex matches from a file.
 *
 * @since 0.0.0
 * @category tools
 */
export const ExtractMatches = Tool.make("stream_extract_matches", {
  description: "Extract regex matches from a file, returning matched substrings or full matching lines.",
  failure: AiToolError,
  failureMode: "return",
  parameters: ExtractMatchesParameters,
  success: LinesOutput,
});

/**
 * Tool: count total lines in a file.
 *
 * @since 0.0.0
 * @category tools
 */
export const CountLines = Tool.make("stream_count_lines", {
  description: "Count the total lines in a file. Memory efficient for large files.",
  failure: AiToolError,
  failureMode: "return",
  parameters: CountLinesParameters,
  success: CountOutput,
});

/**
 * Tool: count valid JSONL records in a file.
 *
 * @since 0.0.0
 * @category tools
 */
export const CountJsonl = Tool.make("stream_count_jsonl", {
  description: "Count JSONL records in a file, optionally counting only valid records.",
  failure: AiToolError,
  failureMode: "return",
  parameters: CountJsonlParameters,
  success: CountWithErrorsOutput,
});

/**
 * The complete streaming toolkit grouping all 17 streaming tools.
 *
 * @example
 * ```ts
 * import { StreamingToolkit } from "@beep/nlp-mcp/StreamingTools"
 *
 * const names = Object.keys(StreamingToolkit.tools)
 * names.length
 * ```
 *
 * @since 0.0.0
 * @category toolkit
 */
export const StreamingToolkit = Toolkit.make(
  ReadLines,
  FileInfo,
  TextStats,
  SampleLines,
  ReadJsonl,
  JsonlStats,
  ValidateJsonl,
  SampleJsonl,
  LoadText,
  LoadLines,
  LoadJsonl,
  LoadJson,
  ProcessFile,
  FilterLines,
  ExtractMatches,
  CountLines,
  CountJsonl
);

/**
 * Type of the {@link StreamingToolkit}.
 *
 * @since 0.0.0
 * @category toolkit
 */
export type StreamingToolkit = typeof StreamingToolkit;
