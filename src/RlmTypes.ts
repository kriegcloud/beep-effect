import { Brand, Data, Deferred, Option, Scope } from "effect"
import type { ContextMetadata } from "./ContextMetadata"
import type { SandboxInstance } from "./Sandbox"
import type { RlmError } from "./RlmError"
import type { RlmToolAny } from "./RlmTool"

// --- Branded IDs ---

export type CallId = string & Brand.Brand<"CallId">
export const CallId = Brand.nominal<CallId>()

export type BridgeRequestId = string & Brand.Brand<"BridgeRequestId">
export const BridgeRequestId = Brand.nominal<BridgeRequestId>()

// --- Data Classes ---

export class BudgetState extends Data.Class<{
  readonly iterationsRemaining: number
  readonly llmCallsRemaining: number
  readonly tokenBudgetRemaining: Option.Option<number>
  readonly totalTokensUsed: number
}> {}

export class TranscriptEntry extends Data.Class<{
  readonly assistantResponse: string
  readonly executionOutput?: string
}> {}

export class CallState extends Data.Class<{
  readonly callId: CallId
  readonly depth: number
  readonly query: string
  readonly context: string
  readonly iteration: number
  readonly transcript: ReadonlyArray<TranscriptEntry>
  readonly sandbox: SandboxInstance
  readonly callScope: Scope.CloseableScope
  readonly parentBridgeRequestId?: BridgeRequestId
  readonly tools?: ReadonlyArray<RlmToolAny>
  readonly outputJsonSchema?: object
}> {}

export type FinalAnswerPayload =
  | {
      readonly source: "answer"
      readonly answer: string
    }
  | {
      readonly source: "value"
      readonly value: unknown
    }

export interface PartialResult {
  readonly source: "partial"
  readonly reason: "iterations" | "llmCalls" | "tokens" | "time"
  readonly transcript: ReadonlyArray<TranscriptEntry>
  readonly variables: Record<string, unknown>
}

export type CompletionOutcome =
  | {
      readonly _tag: "Final"
      readonly payload: FinalAnswerPayload
    }
  | {
      readonly _tag: "Partial"
      readonly payload: PartialResult
    }

export interface MediaAttachment {
  readonly name: string
  readonly mediaType: string
  readonly data: string | Uint8Array | URL
}

export interface InputFile {
  readonly name: string
  readonly path: string
  readonly metadata?: ContextMetadata & {
    readonly linesEstimated?: boolean
    readonly recordCountEstimated?: boolean
  }
}

export interface InputManifestEntry {
  readonly name: string
  readonly path: string
  readonly bytes: number
  readonly format: string
  readonly lines: number | null
  readonly linesEstimated: boolean
  readonly recordCount: number | null
  readonly recordCountEstimated: boolean
  readonly fields: ReadonlyArray<string> | null
  readonly sampleRecord: string | null
}

// --- Tagged Enums ---

export type RlmCommand = Data.TaggedEnum<{
  StartCall: {
    readonly callId: CallId
    readonly depth: number
    readonly query: string
    readonly context: string
    readonly mediaAttachments?: ReadonlyArray<MediaAttachment>
    readonly parentBridgeRequestId?: BridgeRequestId
    readonly tools?: ReadonlyArray<RlmToolAny>
    readonly outputJsonSchema?: object
    readonly cacheBinding?: {
      readonly key: string
      readonly deferred: Deferred.Deferred<unknown, RlmError>
    }
  }
  GenerateStep: { readonly callId: CallId }
  ExecuteCode: { readonly callId: CallId; readonly code: string }
  CodeExecuted: { readonly callId: CallId; readonly output: string }
  HandleBridgeCall: {
    readonly callId: CallId
    readonly bridgeRequestId: BridgeRequestId
    readonly method: string
    readonly args: ReadonlyArray<unknown>
  }
  Finalize: { readonly callId: CallId; readonly payload: FinalAnswerPayload }
  FailCall: { readonly callId: CallId; readonly error: RlmError }
}>
export const RlmCommand = Data.taggedEnum<RlmCommand>()

export type RlmEvent = Data.TaggedEnum<{
  CallStarted: { readonly completionId: string; readonly callId: CallId; readonly depth: number }
  IterationStarted: {
    readonly completionId: string
    readonly callId: CallId
    readonly depth: number
    readonly iteration: number
    readonly budget: BudgetState
  }
  ModelResponse: {
    readonly completionId: string
    readonly callId: CallId
    readonly depth: number
    readonly text: string
    readonly usage?: {
      readonly inputTokens?: number
      readonly outputTokens?: number
      readonly totalTokens?: number
      readonly reasoningTokens?: number
      readonly cachedInputTokens?: number
    }
  }
  CallFinalized: {
    readonly completionId: string
    readonly callId: CallId
    readonly depth: number
    readonly answer: string
  }
  CodeExecutionStarted: {
    readonly completionId: string
    readonly callId: CallId
    readonly depth: number
    readonly code: string
  }
  CodeExecutionCompleted: {
    readonly completionId: string
    readonly callId: CallId
    readonly depth: number
    readonly output: string
  }
  BridgeCallReceived: {
    readonly completionId: string
    readonly callId: CallId
    readonly depth: number
    readonly method: string
  }
  CacheHit: {
    readonly completionId: string
    readonly callId: CallId
    readonly depth: number
    readonly kind: "subcall" | "model"
    readonly cacheKey: string
  }
  CacheMiss: {
    readonly completionId: string
    readonly callId: CallId
    readonly depth: number
    readonly kind: "subcall" | "model"
    readonly cacheKey: string
  }
  CallFailed: {
    readonly completionId: string
    readonly callId: CallId
    readonly depth: number
    readonly error: RlmError
  }
  SchedulerWarning: {
    readonly completionId: string
    readonly code:
      | "STALE_COMMAND_DROPPED"
      | "QUEUE_CLOSED"
      | "CALL_SCOPE_CLEANUP"
      | "MIXED_SUBMIT_AND_CODE"
      | "TOOLKIT_DEGRADED"
      | "VARIABLE_SYNC_FAILED"
      | "STALL_DETECTED_EARLY_EXTRACT"
      | "SUBMIT_INVALID"
      | "SUBMIT_RESOLVE_FAILED"
      | "QUEUE_OVERLOADED_FATAL"
    readonly message: string
    readonly callId?: CallId
    readonly commandTag?: RlmCommand["_tag"]
  }
}>
export const RlmEvent = Data.taggedEnum<RlmEvent>()
