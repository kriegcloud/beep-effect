/**
 * Positional export adapter for NLP tools.
 *
 * @since 0.0.0
 * @module @beep/nlp/Tools/ToolExport
 */

import {$NlpId} from "@beep/identity";
import {TaggedErrorClass} from "@beep/schema";
import {Cause, Effect, Inspectable, SchemaParser, Stream} from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import {type AiError, Tool, type Toolkit} from "effect/unstable/ai";
import {dual} from "effect/Function";
import {NlpToolkit, NlpTools} from "./NlpToolkit.ts";
import {Struct} from "@beep/utils";

const $I = $NlpId.create("Tools/ToolExport");

const TOOL_PARAMETER_NAMES: Partial<Record<string, ReadonlyArray<string>>> = {
  ChunkBySentences: [
    "text",
    "maxChunkChars"
  ],
  CorpusStats: [
    "corpusId",
    "includeIdf",
    "includeMatrix",
    "topIdfTerms"
  ],
  CreateCorpus: [
    "corpusId",
    "bm25Config"
  ],
  LearnCorpus: [
    "corpusId",
    "documents",
    "dedupeById"
  ],
  LearnCustomEntities: [
    "groupName",
    "mode",
    "entities"
  ],
  NGrams: [
    "text",
    "size",
    "mode",
    "topN"
  ],
  PhoneticMatch: [
    "text1",
    "text2",
    "algorithm",
    "minTokenLength"
  ],
  QueryCorpus: [
    "corpusId",
    "query",
    "topN",
    "includeText"
  ],
  RankByRelevance: [
    "texts",
    "query",
    "topN"
  ],
  TransformText: [
    "text",
    "operations"
  ],
  TverskySimilarity: [
    "text1",
    "text2",
    "alpha",
    "beta"
  ],
};

const USAGE_EXAMPLES: Partial<Record<string, ReadonlyArray<string>>> = {
  ChunkBySentences: ['const { chunks } = await ChunkBySentences("One. Two. Three.", 1200)'],
  CorpusStats: ["const stats = await CorpusStats(corpusId, true, false, 20)"],
  CreateCorpus: ['const { corpusId } = await CreateCorpus("product-docs")'],
  LearnCorpus: ["await LearnCorpus(corpusId, [{ id: 'doc-1', text: 'Refund policy details' }], true)"],
  LearnCustomEntities: [
    "await LearnCustomEntities('custom-entities', 'append', [{ name: 'PERSON_NAME', patterns: ['[PROPN]', '[PROPN]'] }])",
  ],
  NGrams: ['const result = await NGrams("internationalization", 3, "bag", 10)'],
  PhoneticMatch: ['const result = await PhoneticMatch("Stephen Hawking", "Steven Hocking", "soundex", 2)'],
  QueryCorpus: ['const result = await QueryCorpus(corpusId, "refund policy", 5, true)'],
  RankByRelevance: ['const result = await RankByRelevance(["Cats are playful"], "cats", 1)'],
};

const DEFAULT_TIMEOUT_MS = 30_000;
type NlpTool = (typeof NlpTools)[number];
type NlpToolkitWithHandler = Toolkit.WithHandler<typeof NlpToolkit.tools>;

const renderError = (error: unknown): string => (P.isString(error) ? error : Inspectable.toStringUnknown(error));

const hasStructFields = (schema: unknown): schema is {
  readonly fields: Record<string, unknown>
} =>
  P.hasProperty(
    schema,
    "fields"
  ) && P.isObject(schema.fields);

const parameterNamesForTool = (tool: NlpTool): ReadonlyArray<string> => {
  const overridden = TOOL_PARAMETER_NAMES[tool.name];
  return P.isNotUndefined(overridden)
    ? overridden
    : hasStructFields(tool.parametersSchema)
      ? Struct.keys(tool.parametersSchema.fields)
      : A.empty();
};

/**
 * Error raised while exporting or executing positional NLP tools.
 *
 * @since 0.0.0
 * @category Errors
 */
export class ExportedToolError extends TaggedErrorClass<ExportedToolError>($I`ExportedToolError`)(
  "ExportedToolError",
  {
    cause: S.Unknown,
    message: S.String,
    toolName: S.String,
  },
  $I.annote(
    "ExportedToolError",
    {
      description: "Failure raised while exporting or executing a positional NLP tool.",
    }
  )
) {
  /**
   * Convert an unknown cause into a typed export-adapter error.
   *
   * @param cause {unknown} - The underlying failure or defect.
   * @param toolName {string} - The tool name associated with the failure.
   * @param message {string} - The rendered error message for the caller.
   * @returns {ExportedToolError} - A typed export-adapter error value.
   */
  static readonly fromCause:
    {
      (
        cause: unknown,
        toolName: string,
        message: string
      ): ExportedToolError
      (
        toolName: string,
        message: string
      ): (cause: unknown) => ExportedToolError
    } = dual(
    3,
    (
      cause: unknown,
      toolName: string,
      message: string
    ): ExportedToolError => new ExportedToolError({
      cause,
      message,
      toolName,
    })
  )
}

/**
 * Runtime descriptor for an exported positional tool.
 *
 * @since 0.0.0
 * @category Models
 */
export interface ExportedTool {
  readonly description: string;
  readonly handle: (args: ReadonlyArray<unknown>) => Effect.Effect<unknown, ExportedToolError>;
  readonly name: string;
  readonly parameterNames: ReadonlyArray<string>;
  readonly parametersJsonSchema: object;
  readonly returnsJsonSchema: object;
  readonly timeoutMs: number;
  readonly usageExamples: ReadonlyArray<string>;
}

const buildArgsObject = (
  parameterNames: ReadonlyArray<string>,
  args: ReadonlyArray<unknown>
): Record<string, unknown> =>
  A.reduce(
    parameterNames,
    R.empty<string, unknown>(),
    (output, name, index) =>
      P.isUndefined(args[index])
        ? output
        : {
          ...output,
          [name]: args[index]
        }
  );

const decodeToolParameters = <T extends NlpTool>(
  tool: T,
  parameterNames: ReadonlyArray<string>,
  args: ReadonlyArray<unknown>
): Tool.Parameters<T> =>
  SchemaParser.decodeUnknownSync(
    S.make<S.Decoder<Tool.Parameters<T>>>(tool.parametersSchema.ast)
  )(
    buildArgsObject(
      parameterNames,
      args
    )
  );

const handleTool = <T extends NlpTool>(
  toolkit: NlpToolkitWithHandler,
  tool: T,
  params: Tool.Parameters<T>
): Effect.Effect<
  Stream.Stream<Tool.HandlerResult<T>, Tool.HandlerError<T> | AiError.AiError, never>,
  AiError.AiError,
  never
> =>
  // `Toolkit.handle` is keyed by a literal tool-name map. At this adapter boundary
  // we validate `params` against the selected tool schema immediately beforehand,
  // so the runtime pairing of tool name and decoded parameters is sound.
  toolkit.handle(
    tool.name as never,
    params as never
  ) as Effect.Effect<
    Stream.Stream<Tool.HandlerResult<T>, Tool.HandlerError<T> | AiError.AiError, never>,
    AiError.AiError,
    never
  >;


const buildExportedTool: {
  <T extends NlpTool>(
    tool: T,
    toolkit: NlpToolkitWithHandler
  ): ExportedTool,
  (toolkit: NlpToolkitWithHandler): <T extends NlpTool>(tool: T) => ExportedTool
} = dual(
  2,
  <T extends NlpTool>(
    tool: T,
    toolkit: NlpToolkitWithHandler
  ): ExportedTool => {
    const parameterNames = parameterNamesForTool(tool);

    return {
      description: Tool.getDescription(tool) ?? "",
      handle:
        Effect.fn(
          function* (args) {
            const params = yield* Effect.try({
              try: () => decodeToolParameters(tool, parameterNames, args),
              catch: (cause) =>
                ExportedToolError.fromCause(
                  cause,
                  tool.name,
                  `Invalid parameters for ${tool.name}: ${renderError(cause)}`
                ),
            });
            const stream = yield* handleTool(
              toolkit,
              tool,
              params
            ).pipe(
              Effect.mapError((cause) =>
                ExportedToolError.fromCause(
                  cause,
                  tool.name,
                  `Failed to start ${tool.name}: ${renderError(cause)}`
                )
              )
            );
            const last = yield* Stream.runLast(stream).pipe(
              Effect.mapError((cause) =>
                ExportedToolError.fromCause(
                  cause,
                  tool.name,
                  `Tool ${tool.name} failed: ${renderError(cause)}`
                )
              )
            );

            return yield* O.match(last, {
              onNone: () =>
                Effect.fail(
                  ExportedToolError.fromCause(
                    undefined,
                    tool.name,
                    `Tool ${tool.name} returned no result`
                  )
                ),
              onSome: (result) =>
                result.isFailure
                  ? Effect.fail(
                    ExportedToolError.fromCause(
                      result.result,
                      tool.name,
                      `Tool ${tool.name} failed: ${renderError(result.result)}`
                    )
                  )
                  : Effect.succeed(result.encodedResult),
            });
          },
          Effect.catchCause((cause) =>
            Effect.fail(
              ExportedToolError.fromCause(
                cause,
                tool.name,
                `Tool ${tool.name} failed: ${Cause.pretty(cause)}`
              )
            )
          )
        ),
      name: tool.name,
      parameterNames,
      parametersJsonSchema: Tool.getJsonSchema(tool),
      returnsJsonSchema: Tool.getJsonSchemaFromSchema(tool.successSchema),
      timeoutMs: DEFAULT_TIMEOUT_MS,
      usageExamples: USAGE_EXAMPLES[tool.name] ?? A.empty(),
    };
  }
)

/**
 * @since 0.0.0
 * @category Adapters
 */
const exportToolsEffect: Effect.Effect<
  ReadonlyArray<ExportedTool>,
  ExportedToolError,
  Tool.HandlersFor<typeof NlpToolkit.tools>
> = Effect.gen(function* () {
  const toolkit = yield* NlpToolkit;
  const exportedTools: ReadonlyArray<ExportedTool> = A.map(
    NlpTools,
    buildExportedTool(
      toolkit
    )
  );

  return exportedTools;
})
  .pipe(
    Effect.mapError((cause) =>
      ExportedToolError.fromCause(
        cause,
        "__init__",
        `Failed to export NLP tools: ${renderError(cause)}`
      )
    )
  );
/**
 * @since 0.0.0
 * @category Adapters
 */
export const exportTools: typeof exportToolsEffect = exportToolsEffect;
