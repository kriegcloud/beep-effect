import { Context } from "effect"

export type RlmProvider = "anthropic" | "openai" | "google"

export interface RlmModelTarget {
  readonly provider: RlmProvider
  readonly model: string
}

export interface SubLlmDelegationConfig {
  readonly enabled: boolean
  readonly depthThreshold: number
}

export interface RlmConfigService {
  readonly maxIterations: number
  readonly maxDepth: number
  readonly maxLlmCalls: number
  readonly maxTotalTokens: number | null
  readonly maxTimeMs?: number
  readonly commandQueueCapacity?: number
  readonly concurrency: number
  readonly enableLlmQueryBatched: boolean
  readonly maxBatchQueries: number
  readonly eventBufferCapacity: number
  readonly maxExecutionOutputChars: number
  readonly enablePromptCaching: boolean
  readonly primaryTarget: RlmModelTarget
  readonly subTarget?: RlmModelTarget
  readonly namedModels?: Record<string, RlmModelTarget>
  readonly subLlmDelegation: SubLlmDelegationConfig
  readonly subModelContextChars?: number
  readonly cache?: {
    readonly enabled?: boolean
    readonly subcallCacheCapacity?: number
  }
  readonly bridgeTimeoutMs?: number
  readonly bridgeToolRetryCount?: number
  readonly bridgeLlmQueryRetryCount?: number
  readonly bridgeRetryBaseDelayMs?: number
  readonly llmRetryCount?: number
  readonly llmRetryBaseDelayMs?: number
  readonly llmRetryJitter?: boolean
  readonly stallConsecutiveLimit?: number
  readonly stallResponseMaxChars?: number
}

export class RlmConfig extends Context.Reference<RlmConfig>()(
  "@recursive-llm/RlmConfig",
  {
    defaultValue: (): RlmConfigService => ({
      maxIterations: 10,
      maxDepth: 1,
      maxLlmCalls: 20,
      maxTotalTokens: null,
      commandQueueCapacity: 8_192,
      concurrency: 4,
      enableLlmQueryBatched: true,
      maxBatchQueries: 32,
      eventBufferCapacity: 4096,
      maxExecutionOutputChars: 8_000,
      enablePromptCaching: true,
      primaryTarget: {
        provider: "anthropic",
        model: "claude-sonnet-4-5-20250929"
      },
      subLlmDelegation: {
        enabled: false,
        depthThreshold: 1
      },
      bridgeTimeoutMs: 300_000,
      bridgeToolRetryCount: 1,
      bridgeLlmQueryRetryCount: 1,
      bridgeRetryBaseDelayMs: 50,
      llmRetryCount: 1,
      llmRetryBaseDelayMs: 100,
      llmRetryJitter: true,
      stallConsecutiveLimit: 3,
      stallResponseMaxChars: 24
    })
  }
) {}
