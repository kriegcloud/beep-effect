import * as LanguageModel from "@effect/ai/LanguageModel"
import * as AnthropicLanguageModel from "@effect/ai-anthropic/AnthropicLanguageModel"
import { AnthropicClient } from "@effect/ai-anthropic"
import * as GoogleLanguageModel from "@effect/ai-google/GoogleLanguageModel"
import { GoogleClient } from "@effect/ai-google"
import * as OpenAiLanguageModel from "@effect/ai-openai/OpenAiLanguageModel"
import { OpenAiClient } from "@effect/ai-openai"
import { FetchHttpClient, HttpClient, HttpClientRequest } from "@effect/platform"
import { Effect, Layer, Redacted } from "effect"
import { Rlm, rlmBunLayer } from "./Rlm"
import { RlmConfig, type RlmConfigService, type RlmProvider, type RlmModelTarget } from "./RlmConfig"
import type { RlmModel } from "./RlmModel"
import { makeRlmModelLayer } from "./RlmModel"
import { SandboxConfig } from "./Sandbox"
import { RunTraceConfig, type RunTraceConfigService } from "./RunTraceWriter"
import { isCompiled, resolveWorkerPath } from "./WorkerPath"

export interface CliArgs {
  query: string
  context: string
  inputs?: ReadonlyArray<{ readonly name: string; readonly path: string }>
  provider: RlmProvider
  model: string
  subModel?: string
  namedModels?: Record<string, RlmModelTarget>
  subDelegationEnabled?: boolean
  subDelegationDepthThreshold?: number
  maxIterations?: number
  maxDepth?: number
  maxLlmCalls?: number
  maxTotalTokens?: number
  maxTimeMs?: number
  sandboxTransport?: "auto" | "worker" | "spawn"
  media?: ReadonlyArray<{ readonly name: string; readonly path: string }>
  mediaUrls?: ReadonlyArray<{ readonly name: string; readonly url: string }>
  enablePromptCaching?: boolean
  noCache?: boolean
  quiet: boolean
  noColor: boolean
  verbose: boolean
  nlpTools: boolean
  outputFile?: string
  bridgeTimeoutMs?: number
  noTrace?: boolean
  traceDir?: string
  anthropicApiKey?: string
  openaiApiKey?: string
  googleApiKey?: string
  googleApiUrl?: string
}

const targetToEffect = (
  target: RlmModelTarget
): Effect.Effect<LanguageModel.Service, never, any> => {
  if (target.provider === "openai") {
    return OpenAiLanguageModel.make({
      model: target.model
    }) as Effect.Effect<LanguageModel.Service, never, any>
  }
  if (target.provider === "google") {
    return GoogleLanguageModel.make({
      model: target.model
    }) as Effect.Effect<LanguageModel.Service, never, any>
  }
  return AnthropicLanguageModel.make({
    model: target.model
  }) as Effect.Effect<LanguageModel.Service, never, any>
}

export const buildRlmModelLayer = (cliArgs: CliArgs): Layer.Layer<RlmModel, never, never> => {
  const httpLayer = FetchHttpClient.layer
  const subLlmDelegation = {
    enabled: cliArgs.subDelegationEnabled ?? cliArgs.subModel !== undefined,
    depthThreshold: cliArgs.subDelegationDepthThreshold ?? 1
  }

  const primaryTarget: RlmModelTarget = {
    provider: cliArgs.provider,
    model: cliArgs.model
  }
  const subTarget = cliArgs.subModel !== undefined
    ? {
        provider: cliArgs.provider,
        model: cliArgs.subModel
      } satisfies RlmModelTarget
    : undefined
  const named = cliArgs.namedModels
  const namedEffects = named !== undefined
    ? Object.fromEntries(
        Object.entries(named).map(([name, target]) => [name, targetToEffect(target)])
      )
    : undefined

  const modelLayer = makeRlmModelLayer({
    primaryTarget,
    primary: targetToEffect(primaryTarget),
    ...(subTarget !== undefined ? { sub: targetToEffect(subTarget), subTarget } : {}),
    ...(namedEffects !== undefined ? { named: namedEffects } : {}),
    ...(named !== undefined ? { namedTargets: named } : {}),
    subLlmDelegation
  })

  const providers = new Set<RlmProvider>([
    primaryTarget.provider,
    ...(subTarget !== undefined ? [subTarget.provider] : []),
    ...(named !== undefined ? Object.values(named).map((target) => target.provider) : [])
  ])

  const clientLayers: Array<Layer.Layer<any, never, never>> = []
  if (providers.has("anthropic")) {
    if (cliArgs.anthropicApiKey === undefined) {
      throw new Error("Missing anthropicApiKey in CliArgs for anthropic provider")
    }
    clientLayers.push(
      Layer.provide(
        AnthropicClient.layer({
          apiKey: Redacted.make(cliArgs.anthropicApiKey)
        }),
        httpLayer
      )
    )
  }
  if (providers.has("openai")) {
    if (cliArgs.openaiApiKey === undefined) {
      throw new Error("Missing openaiApiKey in CliArgs for openai provider")
    }
    clientLayers.push(
      Layer.provide(
        OpenAiClient.layer({
          apiKey: Redacted.make(cliArgs.openaiApiKey)
        }),
        httpLayer
      )
    )
  }
  if (providers.has("google")) {
    if (cliArgs.googleApiKey === undefined) {
      throw new Error("Missing googleApiKey in CliArgs for google provider")
    }
    const useVertexAi = cliArgs.googleApiUrl !== undefined
    clientLayers.push(
      Layer.provide(
        GoogleClient.layer({
          apiKey: Redacted.make(cliArgs.googleApiKey),
          ...(useVertexAi ? {
            apiUrl: cliArgs.googleApiUrl,
            transformClient: (client: HttpClient.HttpClient) =>
              HttpClient.mapRequest(client, (req) => {
                const url = new URL(req.url)
                url.pathname = url.pathname.replace(
                  /\/v1beta\/models\//,
                  "/v1/publishers/google/models/"
                )
                return HttpClientRequest.setUrl(req, url.toString())
              })
          } : {})
        }),
        httpLayer
      )
    )
  }

  const head = clientLayers[0]!
  const clientsLayer = clientLayers.slice(1).reduce(
    (acc, layer) => Layer.merge(acc, layer),
    head
  )

  return Layer.provide(modelLayer, clientsLayer) as Layer.Layer<RlmModel, never, never>
}

export const makeCliConfig = (cliArgs: CliArgs): RlmConfigService => {
  const subLlmDelegation = {
    enabled: cliArgs.subDelegationEnabled ?? cliArgs.subModel !== undefined,
    depthThreshold: cliArgs.subDelegationDepthThreshold ?? 1
  }

  return {
    maxIterations: cliArgs.maxIterations ?? 50,
    maxDepth: cliArgs.maxDepth ?? 1,
    maxLlmCalls: cliArgs.maxLlmCalls ?? 200,
    maxTotalTokens: cliArgs.maxTotalTokens ?? null,
    ...(cliArgs.maxTimeMs !== undefined ? { maxTimeMs: cliArgs.maxTimeMs } : {}),
    commandQueueCapacity: 8_192,
    concurrency: 4,
    enableLlmQueryBatched: true,
    maxBatchQueries: 32,
    eventBufferCapacity: 4096,
    maxExecutionOutputChars: 8_000,
    enablePromptCaching: cliArgs.enablePromptCaching ?? true,
    ...(cliArgs.bridgeTimeoutMs !== undefined ? { bridgeTimeoutMs: cliArgs.bridgeTimeoutMs } : {}),
    ...(cliArgs.noCache === true ? { cache: { enabled: false } } : {}),
    llmRetryCount: 1,
    llmRetryBaseDelayMs: 100,
    llmRetryJitter: true,
    primaryTarget: {
      provider: cliArgs.provider,
      model: cliArgs.model
    },
    ...(cliArgs.subModel !== undefined
      ? {
          subTarget: {
            provider: cliArgs.provider,
            model: cliArgs.subModel
          }
        }
      : {}),
    ...(cliArgs.namedModels !== undefined ? { namedModels: cliArgs.namedModels } : {}),
    subLlmDelegation
  }
}

export const buildCliLayer = (cliArgs: CliArgs): Layer.Layer<Rlm, never, never> => {
  const modelLayer = buildRlmModelLayer(cliArgs)
  const configLayer = Layer.succeed(RlmConfig, makeCliConfig(cliArgs))
  const sandboxConfigLayer = Layer.succeed(SandboxConfig, {
    sandboxMode: "permissive" as const,
    sandboxTransport: cliArgs.sandboxTransport ?? (isCompiled ? "spawn" : "auto"),
    executeTimeoutMs: 300_000,
    setVarTimeoutMs: 5_000,
    getVarTimeoutMs: 5_000,
    listVarTimeoutMs: 5_000,
    shutdownGraceMs: 2_000,
    maxFrameBytes: 32 * 1024 * 1024,
    maxBridgeConcurrency: 4,
    incomingFrameQueueCapacity: 2_048,
    workerPath: resolveWorkerPath()
  })
  const traceConfigLayer = Layer.succeed(RunTraceConfig, makeCliTraceConfig(cliArgs))

  return Layer.provide(
    rlmBunLayer,
    Layer.mergeAll(modelLayer, configLayer, sandboxConfigLayer, traceConfigLayer)
  )
}

export const makeCliTraceConfig = (cliArgs: CliArgs): RunTraceConfigService => ({
  enabled: cliArgs.noTrace !== true,
  baseDir: cliArgs.traceDir ?? ".rlm/traces",
  maxSnapshotBytes: 5_000_000
})
