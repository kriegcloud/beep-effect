import { Args, Command, Options } from "@effect/cli"
import { Effect } from "effect"
import type { CliArgs } from "../CliLayer"
import type { RlmProvider } from "../RlmConfig"
import { type ParsedCliConfig, normalizeCliArgs } from "./Normalize"
import { runCliWithLayer } from "./Run"

const PROVIDERS = ["anthropic", "openai", "google"] as const
const SANDBOX_TRANSPORTS = ["auto", "worker", "spawn"] as const

const query = Args.text({ name: "query" }).pipe(
  Args.withDescription("Prompt query")
)

const context = Options.text("context").pipe(
  Options.withDefault(""),
  Options.withDescription("Context string")
)

const contextFile = Options.text("context-file").pipe(
  Options.optional,
  Options.withDescription("Deprecated: stage file as --input context=<path> (does not populate --context)")
)

const provider = Options.choice("provider", PROVIDERS).pipe(
  Options.withDefault("anthropic"),
  Options.withDescription("Provider: anthropic, openai, google")
)

const model = Options.text("model").pipe(
  Options.withDefault("claude-sonnet-4-5-20250929"),
  Options.withDescription("Model name")
)

const subModel = Options.text("sub-model").pipe(
  Options.optional,
  Options.withDescription("Lower-tier model for delegated sub-LLM calls")
)

const subDelegationEnabled = Options.boolean("sub-delegation-enabled").pipe(
  Options.withDescription("Enable sub-LLM delegation")
)

const disableSubDelegation = Options.boolean("disable-sub-delegation").pipe(
  Options.withDescription("Disable sub-LLM delegation")
)

const subDelegationDepthThreshold = Options.integer("sub-delegation-depth-threshold").pipe(
  Options.optional,
  Options.withDescription("Minimum depth required to delegate to sub-model")
)

const maxIterations = Options.integer("max-iterations").pipe(
  Options.optional,
  Options.withDescription("Max iterations")
)

const maxDepth = Options.integer("max-depth").pipe(
  Options.optional,
  Options.withDescription("Max recursion depth")
)

const maxLlmCalls = Options.integer("max-llm-calls").pipe(
  Options.optional,
  Options.withDescription("Max total LLM calls")
)

const maxTotalTokens = Options.integer("max-total-tokens").pipe(
  Options.optional,
  Options.withDescription("Max total model tokens across the run")
)

const maxTimeMs = Options.integer("max-time-ms").pipe(
  Options.optional,
  Options.withDescription("Wall-clock budget for a run in milliseconds")
)

const sandboxTransport = Options.choice("sandbox-transport", SANDBOX_TRANSPORTS).pipe(
  Options.optional,
  Options.withDescription("Sandbox transport: auto, worker, spawn")
)

const namedModel = Options.text("named-model").pipe(
  Options.repeated,
  Options.withDescription("Named model mapping (repeatable): name=provider/model")
)

const media = Options.text("media").pipe(
  Options.repeated,
  Options.withDescription("Media attachment from local file (repeatable): name=path")
)

const mediaUrl = Options.text("media-url").pipe(
  Options.repeated,
  Options.withDescription("Media attachment from URL (repeatable): name=url")
)

const input = Options.text("input").pipe(
  Options.repeated,
  Options.withDescription("Input file (repeatable): name=path or just path (auto-named from basename)")
)

const noPromptCaching = Options.boolean("no-prompt-caching").pipe(
  Options.withDescription("Disable Anthropic prompt caching breakpoints")
)

const noCache = Options.boolean("no-cache").pipe(
  Options.withDescription("Disable sub-call caching and deduplication")
)

const quiet = Options.boolean("quiet").pipe(
  Options.withDescription("Only show final answer and errors")
)

const noColor = Options.boolean("no-color").pipe(
  Options.withDescription("Disable ANSI colors")
)

const nlpTools = Options.boolean("nlp-tools").pipe(
  Options.withDescription("Enable built-in NLP tools (DocumentStats, ChunkBySentences, ExtractEntities, etc.)")
)

const outputFile = Options.text("output-file").pipe(
  Options.optional,
  Options.withDescription("Write final answer to file (clean text, no ANSI)")
)

const verbose = Options.boolean("verbose").pipe(
  Options.withDescription("Show untruncated output in terminal")
)

const bridgeTimeout = Options.integer("bridge-timeout").pipe(
  Options.optional,
  Options.withDescription("Bridge call timeout in seconds (default: 300)")
)

const noTrace = Options.boolean("no-trace").pipe(
  Options.withDescription("Disable run trace persistence")
)

const traceDir = Options.text("trace-dir").pipe(
  Options.optional,
  Options.withDescription("Base directory for run traces")
)

const commandConfig = {
  query,
  context,
  contextFile,
  provider,
  model,
  subModel,
  subDelegationEnabled,
  disableSubDelegation,
  subDelegationDepthThreshold,
  maxIterations,
  maxDepth,
  maxLlmCalls,
  maxTotalTokens,
  maxTimeMs,
  sandboxTransport,
  namedModel,
  media,
  mediaUrl,
  input,
  noPromptCaching,
  noCache,
  quiet,
  noColor,
  verbose,
  nlpTools,
  outputFile,
  bridgeTimeout,
  noTrace,
  traceDir
}

export type CliExecutor = (cliArgs: CliArgs) => Effect.Effect<void>

type CliCommandEnv = Record<string, string | undefined>

export interface RunCliCommandOptions {
  readonly execute?: CliExecutor
  readonly env?: CliCommandEnv
  readonly name?: string
  readonly version?: string
}

const defaultExecute: CliExecutor = runCliWithLayer

export const makeCliCommand = (
  rawArgs: ReadonlyArray<string>,
  options: Pick<RunCliCommandOptions, "execute" | "env"> = {}
) => {
  const execute = options.execute ?? defaultExecute
  const env = options.env ?? Bun.env

  return Command.make("recursive-llm", commandConfig, (parsed) =>
    normalizeCliArgs(parsed as ParsedCliConfig, rawArgs, env).pipe(
      Effect.flatMap(execute)
    ))
}

export const runCliCommand = (
  argv: ReadonlyArray<string>,
  options: RunCliCommandOptions = {}
) =>
  Command.run(makeCliCommand(argv.slice(2), options), {
    name: options.name ?? "recursive-llm",
    version: options.version ?? "0.0.0"
  })(argv)

export type CliProviderOption = (typeof PROVIDERS)[number]
export const isCliProvider = (value: string): value is RlmProvider =>
  PROVIDERS.includes(value as CliProviderOption)
