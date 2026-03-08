import { Command, Options } from "@effect/cli"
import { ConfigProvider, Effect, Option, Redacted } from "effect"
import * as Console from "effect/Console"

import { runExtractAdapter } from "./cli/ExtractAdapter.js"
import type {
  CliRuntimeOptions,
  ExecuteExtractCommandOptions,
  ResolvedExtractCommandConfig
} from "./cli/index.js"
import {
  InputFormat,
  type InputFormat as InputFormatType,
  OutputFormat,
  type OutputFormat as OutputFormatType,
  ProviderName,
  type ProviderName as ProviderNameType,
  RowErrorMode,
  type RowErrorMode as RowErrorModeType
} from "./cli/index.js"
import { runVisualizeAdapter } from "./cli/VisualizeAdapter.js"
import { InferenceConfigError } from "./Errors.js"
import { ExtractionConfig } from "./ExtractionConfig.js"
import { detectProviderFromModelId } from "./providers/Patterns.js"

type ConfigSource = "cli" | "env" | "default"

const defaultsByProvider: Readonly<Record<ProviderNameType, string>> = {
  gemini: "gemini-2.5-flash",
  openai: "gpt-4o-mini",
  anthropic: "claude-3-5-sonnet-latest",
  ollama: "llama3.2:latest"
}

const parseProvider = (value: string | undefined): ProviderNameType | undefined => {
  if (value === undefined) {
    return undefined
  }
  const lowered = value.trim().toLowerCase()
  if (
    lowered === "gemini" ||
    lowered === "openai" ||
    lowered === "anthropic" ||
    lowered === "ollama"
  ) {
    return lowered
  }
  return undefined
}

const parseOutput = (value: string | undefined): OutputFormatType | undefined => {
  if (value === undefined) {
    return undefined
  }
  const lowered = value.trim().toLowerCase()
  if (lowered === "json" || lowered === "jsonl" || lowered === "html") {
    return lowered
  }
  return undefined
}

const parseInputFormat = (
  value: string | undefined
): InputFormatType | undefined => {
  if (value === undefined) {
    return undefined
  }

  const lowered = value.trim().toLowerCase()
  if (
    lowered === "auto" ||
    lowered === "text" ||
    lowered === "json" ||
    lowered === "jsonl" ||
    lowered === "csv" ||
    lowered === "url" ||
    lowered === "stdin"
  ) {
    return lowered
  }
  return undefined
}

const parseRowErrorMode = (
  value: string | undefined
): RowErrorModeType | undefined => {
  if (value === undefined) {
    return undefined
  }

  const lowered = value.trim().toLowerCase()
  if (lowered === "fail-fast" || lowered === "skip-row") {
    return lowered
  }
  return undefined
}

const resolveConfigSource = (
  cliValue: unknown,
  envValue: unknown
): ConfigSource => {
  if (cliValue !== undefined) {
    return "cli"
  }
  if (envValue !== undefined) {
    return "env"
  }
  return "default"
}

const pickFirstDefined = <A>(
  ...values: ReadonlyArray<A | undefined>
): A | undefined => values.find((value) => value !== undefined)

const redactEnv = (value: string | undefined): Redacted.Redacted | undefined =>
  value !== undefined ? Redacted.make(value) : undefined

const defaultCommandConfig = {
  prompt: "Extract structured entities.",
  examplesFile: "examples.json",
  output: "json" as const,
  inputFormat: "auto" as const,
  rowErrorMode: "fail-fast" as const,
  documentBatchSize: 100,
  ollamaBaseUrl: "http://localhost:11434"
}

const setConfigValue = (
  map: Map<string, string>,
  key: string,
  value: string | number | boolean | undefined
): void => {
  if (value === undefined) {
    return
  }
  map.set(key, String(value))
}

const buildExtractionConfigMap = (
  options: ExecuteExtractCommandOptions,
  env: Readonly<Record<string, string | undefined>>
): Map<string, string> => {
  const map = new Map<string, string>()
  for (const [key, value] of Object.entries(env)) {
    if (value !== undefined) {
      map.set(key, value)
    }
  }

  const providerFromCli = options.provider
  const providerFromEnv = parseProvider(
    pickFirstDefined(env.LANGEXTRACT_PROVIDER, env.PROVIDER)
  )
  const providerForModelDefault = providerFromCli ?? providerFromEnv ?? "gemini"

  setConfigValue(
    map,
    "MODEL_ID",
    options.modelId ?? env.MODEL_ID ?? defaultsByProvider[providerForModelDefault]
  )
  setConfigValue(map, "MAX_CHAR_BUFFER", options.maxCharBuffer)
  setConfigValue(map, "TEMPERATURE", options.temperature)
  setConfigValue(map, "BATCH_LENGTH", options.batchLength)
  setConfigValue(map, "BATCH_CONCURRENCY", options.batchConcurrency)
  setConfigValue(map, "PROVIDER_CONCURRENCY", options.providerConcurrency)
  setConfigValue(map, "MAX_BATCH_INPUT_TOKENS", options.maxBatchInputTokens)
  setConfigValue(map, "EXTRACTION_PASSES", options.extractionPasses)
  setConfigValue(map, "CONTEXT_WINDOW_CHARS", options.contextWindowChars)
  setConfigValue(map, "PRIMED_CACHE_ENABLED", options.primedCacheEnabled)
  setConfigValue(map, "PRIMED_CACHE_DIR", options.primedCacheDir)
  setConfigValue(map, "PRIMED_CACHE_NAMESPACE", options.primedCacheNamespace)
  setConfigValue(map, "PRIMED_CACHE_TTL_SECONDS", options.primedCacheTtlSeconds)
  setConfigValue(
    map,
    "PRIMED_CACHE_DETERMINISTIC_ONLY",
    options.primedCacheDeterministicOnly
  )
  setConfigValue(
    map,
    "CLEAR_PRIMED_CACHE_ON_START",
    options.clearPrimedCacheOnStart
  )

  return map
}

export const resolveExtractCommandConfig = (
  options: ExecuteExtractCommandOptions,
  envInput?: Readonly<Record<string, string | undefined>>
): Effect.Effect<ResolvedExtractCommandConfig, InferenceConfigError> =>
  Effect.gen(function* () {
    const env = envInput ?? options.env ?? {}
    const providerFromCli = options.provider
    const providerFromEnv = parseProvider(
      pickFirstDefined(env.LANGEXTRACT_PROVIDER, env.PROVIDER)
    )

    const extractionConfigMap = buildExtractionConfigMap(options, env)
    const extractedConfig = yield* ConfigProvider
      .fromMap(extractionConfigMap)
      .load(ExtractionConfig)
      .pipe(
        Effect.mapError(
          (error) =>
            new InferenceConfigError({
              message: `Failed to decode extraction config: ${String(error)}`
            })
        )
      )

    const provider =
      providerFromCli ??
      providerFromEnv ??
      detectProviderFromModelId(extractedConfig.modelId)

    return {
      input: options.input,
      inputFormat:
        pickFirstDefined(
          options.inputFormat,
          parseInputFormat(env.LANGEXTRACT_INPUT_FORMAT)
        ) ?? defaultCommandConfig.inputFormat,
      textField: options.textField,
      idField: options.idField,
      contextField: options.contextField ?? [],
      csvDelimiter: options.csvDelimiter,
      csvHeader: options.csvHeader,
      rowErrorMode:
        pickFirstDefined(
          options.rowErrorMode,
          parseRowErrorMode(env.LANGEXTRACT_ROW_ERROR_MODE)
        ) ?? defaultCommandConfig.rowErrorMode,
      documentBatchSize:
        options.documentBatchSize ?? defaultCommandConfig.documentBatchSize,
      prompt:
        pickFirstDefined(options.prompt, env.PROMPT_DESCRIPTION) ??
        defaultCommandConfig.prompt,
      examplesFile:
        pickFirstDefined(options.examplesFile, env.EXAMPLES_FILE) ??
        defaultCommandConfig.examplesFile,
      provider,
      modelId: extractedConfig.modelId,
      temperature: Option.getOrUndefined(extractedConfig.temperature),
      output:
        pickFirstDefined(options.output, parseOutput(env.OUTPUT_FORMAT)) ??
        defaultCommandConfig.output,
      outputPath: pickFirstDefined(options.outputPath, env.OUTPUT_PATH),
      maxCharBuffer: extractedConfig.maxCharBuffer,
      batchLength: extractedConfig.batchLength,
      batchConcurrency: extractedConfig.batchConcurrency,
      providerConcurrency: extractedConfig.providerConcurrency,
      extractionPasses: extractedConfig.extractionPasses,
      contextWindowChars: Option.getOrUndefined(extractedConfig.contextWindowChars),
      maxBatchInputTokens: Option.getOrUndefined(extractedConfig.maxBatchInputTokens),
      primedCacheEnabled: extractedConfig.primedCacheEnabled,
      primedCacheDir: extractedConfig.primedCacheDir,
      primedCacheNamespace: extractedConfig.primedCacheNamespace,
      primedCacheTtlSeconds: extractedConfig.primedCacheTtlSeconds,
      primedCacheDeterministicOnly: extractedConfig.primedCacheDeterministicOnly,
      clearPrimedCacheOnStart: extractedConfig.clearPrimedCacheOnStart,
      openAiApiKey: pickFirstDefined(options.openAiApiKey, redactEnv(env.OPENAI_API_KEY)) ?? Redacted.make(""),
      openAiBaseUrl: pickFirstDefined(options.openAiBaseUrl, env.OPENAI_BASE_URL),
      openAiOrganization: pickFirstDefined(
        options.openAiOrganization,
        env.OPENAI_ORGANIZATION
      ),
      geminiApiKey: pickFirstDefined(options.geminiApiKey, redactEnv(env.GEMINI_API_KEY)) ?? Redacted.make(""),
      geminiBaseUrl: pickFirstDefined(options.geminiBaseUrl, env.GEMINI_BASE_URL),
      anthropicApiKey:
        pickFirstDefined(options.anthropicApiKey, redactEnv(env.ANTHROPIC_API_KEY)) ?? Redacted.make(""),
      anthropicBaseUrl: pickFirstDefined(
        options.anthropicBaseUrl,
        env.ANTHROPIC_BASE_URL
      ),
      ollamaBaseUrl:
        pickFirstDefined(options.ollamaBaseUrl, env.OLLAMA_BASE_URL) ??
        defaultCommandConfig.ollamaBaseUrl
    }
  })

const optionalTextOption = (
  name: string,
  description: string
): Options.Options<string | undefined> =>
  Options.withDescription(
    Options.withDefault(Options.text(name), undefined),
    description
  )

const repeatedTextOption = (
  name: string,
  description: string
): Options.Options<ReadonlyArray<string>> =>
  Options.withDescription(
    Options.withDefault(Options.repeated(Options.text(name)), []),
    description
  )

const optionalIntegerOption = (
  name: string,
  description: string
): Options.Options<number | undefined> =>
  Options.withDescription(
    Options.withDefault(Options.integer(name), undefined),
    description
  )

const optionalFloatOption = (
  name: string,
  description: string
): Options.Options<number | undefined> =>
  Options.withDescription(
    Options.withDefault(Options.float(name), undefined),
    description
  )

const optionalBooleanOption = (
  name: string,
  description: string
): Options.Options<boolean | undefined> =>
  Options.withDescription(
    Options.withDefault(
      Options.map(
        Options.choice(name, ["true", "false"] as const),
        (value) => value === "true"
      ),
      undefined
    ),
    description
  )

const optionalProviderOption: Options.Options<ProviderNameType | undefined> =
  Options.withDescription(
    Options.withDefault(
      Options.choice("provider", [
        "gemini",
        "openai",
        "anthropic",
        "ollama"
      ] as const),
      undefined
    ),
    "Provider to use for inference."
  )

const optionalOutputOption: Options.Options<OutputFormatType | undefined> =
  Options.withDescription(
    Options.withDefault(
      Options.choice("output", ["json", "jsonl", "html"] as const),
      undefined
    ),
    "Output format."
  )

const optionalInputFormatOption: Options.Options<InputFormatType | undefined> =
  Options.withDescription(
    Options.withDefault(
      Options.choice("input-format", [
        "auto",
        "text",
        "json",
        "jsonl",
        "csv",
        "url",
        "stdin"
      ] as const),
      undefined
    ),
    "Input source/format mode."
  )

const optionalRowErrorModeOption: Options.Options<RowErrorModeType | undefined> =
  Options.withDescription(
    Options.withDefault(
      Options.choice("row-error-mode", ["fail-fast", "skip-row"] as const),
      undefined
    ),
    "Structured-row handling mode."
  )

const extractCliConfig = {
  input: optionalTextOption(
    "input",
    "Unified input value (path, URL, '-', or inline text when --input-format text)."
  ),
  inputFormat: optionalInputFormatOption,
  textField: optionalTextOption(
    "text-field",
    "Structured row field/path mapped to Document.text."
  ),
  idField: optionalTextOption(
    "id-field",
    "Structured row field/path mapped to Document.documentId."
  ),
  contextField: repeatedTextOption(
    "context-field",
    "Repeatable structured row field/path mapped to Document.additionalContext."
  ),
  csvDelimiter: optionalTextOption(
    "csv-delimiter",
    "CSV delimiter character (defaults to ',')."
  ),
  csvHeader: optionalBooleanOption(
    "csv-header",
    "Whether CSV has a header row (true|false)."
  ),
  rowErrorMode: optionalRowErrorModeOption,
  documentBatchSize: optionalIntegerOption(
    "document-batch-size",
    "Number of documents grouped per annotation call."
  ),
  prompt: optionalTextOption("prompt", "Prompt description."),
  examplesFile: optionalTextOption(
    "examples-file",
    "Path to few-shot examples JSON file."
  ),
  provider: optionalProviderOption,
  modelId: optionalTextOption("model-id", "Model identifier."),
  temperature: optionalFloatOption("temperature", "Model sampling temperature."),
  output: optionalOutputOption,
  outputPath: optionalTextOption("output-path", "Output destination path."),
  maxCharBuffer: optionalIntegerOption(
    "max-char-buffer",
    "Maximum character buffer per chunk."
  ),
  batchLength: optionalIntegerOption(
    "batch-length",
    "Target number of chunks per batch."
  ),
  batchConcurrency: optionalIntegerOption(
    "batch-concurrency",
    "Concurrent batch worker count."
  ),
  providerConcurrency: optionalIntegerOption(
    "provider-concurrency",
    "Concurrent provider request count."
  ),
  extractionPasses: optionalIntegerOption(
    "extraction-passes",
    "Number of extraction passes."
  ),
  contextWindowChars: optionalIntegerOption(
    "context-window-chars",
    "Context window size in characters."
  ),
  maxBatchInputTokens: optionalIntegerOption(
    "max-batch-input-tokens",
    "Maximum estimated tokens per batch."
  ),
  primedCacheEnabled: optionalBooleanOption(
    "primed-cache-enabled",
    "Enable primed cache (true|false)."
  ),
  primedCacheDir: optionalTextOption(
    "primed-cache-dir",
    "Primed cache root directory."
  ),
  primedCacheNamespace: optionalTextOption(
    "primed-cache-namespace",
    "Primed cache namespace."
  ),
  primedCacheTtlSeconds: optionalIntegerOption(
    "primed-cache-ttl-seconds",
    "Primed cache TTL in seconds."
  ),
  primedCacheDeterministicOnly: optionalBooleanOption(
    "primed-cache-deterministic-only",
    "Only cache deterministic requests (true|false)."
  ),
  clearPrimedCacheOnStart: optionalBooleanOption(
    "clear-primed-cache-on-start",
    "Clear namespace at startup (true|false)."
  )
} as const

type ExtractCliConfig = Command.Command.ParseConfig<typeof extractCliConfig>

const visualizeCliConfig = {
  input: Options.withDescription(
    Options.text("input"),
    "Path to an annotated document JSON file."
  ),
  outputPath: optionalTextOption("output-path", "Output HTML file path."),
  animationSpeed: optionalFloatOption(
    "animation-speed",
    "Animation speed in seconds."
  ),
  showLegend: optionalBooleanOption(
    "show-legend",
    "Render extraction legend (true|false)."
  )
} as const

type VisualizeCliConfig = Command.Command.ParseConfig<typeof visualizeCliConfig>

const runExtractFromCli = (
  config: ExtractCliConfig,
  runtime: CliRuntimeOptions
) =>
  resolveExtractCommandConfig(config, runtime.env).pipe(
    Effect.tap((resolved) => {
      const providerEnvValue = pickFirstDefined(
        runtime.env?.LANGEXTRACT_PROVIDER,
        runtime.env?.PROVIDER
      )
      const providerSource: "cli" | "env" | "model-id" =
        config.provider !== undefined
          ? "cli"
          : providerEnvValue !== undefined
            ? "env"
            : "model-id"

      return Effect.logDebug("langextract.cli.config_resolved").pipe(
        Effect.annotateLogs({
          provider: resolved.provider,
          modelId: resolved.modelId,
          output: resolved.output,
          providerSource,
          modelIdSource: resolveConfigSource(config.modelId, runtime.env?.MODEL_ID),
          outputSource: resolveConfigSource(config.output, runtime.env?.OUTPUT_FORMAT),
          primedCacheEnabledSource: resolveConfigSource(
            config.primedCacheEnabled,
            runtime.env?.PRIMED_CACHE_ENABLED
          ),
          configPath: "effect-config"
        })
      )
    }),
    Effect.flatMap((resolved) => runExtractAdapter(resolved, runtime))
  )

const runVisualizeFromCli = (
  config: VisualizeCliConfig,
  runtime: CliRuntimeOptions
) =>
  runVisualizeAdapter(
    {
      input: config.input,
      outputPath: config.outputPath,
      animationSpeed: config.animationSpeed,
      showLegend: config.showLegend
    },
    runtime.emitResultToStdout !== false
  )

export const makeExtractCommand = (runtime: CliRuntimeOptions = {}) =>
  Command.make("extract", extractCliConfig, (config) =>
    runExtractFromCli(config, runtime)
  ).pipe(
    Command.withDescription("Extract structured data from unified ingestion inputs.")
  )

export const makeVisualizeCommand = (runtime: CliRuntimeOptions = {}) =>
  Command.make("visualize", visualizeCliConfig, (config) =>
    runVisualizeFromCli(config, runtime)
  ).pipe(
    Command.withDescription(
      "Render HTML visualization from an annotated document JSON file."
    )
  )

export const makeCliCommand = (runtime: CliRuntimeOptions = {}) =>
  Command.make("effect-langextract", {}, () =>
    Console.log(
      "Use the `extract` or `visualize` subcommand. Run with `--help` for details."
    )
  ).pipe(
    Command.withDescription("Effect-native LangExtract CLI."),
    Command.withSubcommands([
      makeExtractCommand(runtime),
      makeVisualizeCommand(runtime)
    ])
  )

export const runCli = (
  argv: ReadonlyArray<string>,
  runtime: CliRuntimeOptions = {}
) =>
  Command.run(
    makeCliCommand(runtime),
    {
      name: "effect-langextract",
      version: "0.1.0"
    }
  )(argv)

export {
  InputFormat,
  OutputFormat,
  ProviderName,
  RowErrorMode
}

export type {
  CliRuntimeOptions,
  ExecuteExtractCommandOptions,
  ResolvedExtractCommandConfig
}
