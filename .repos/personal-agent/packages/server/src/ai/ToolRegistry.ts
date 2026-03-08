import type { MemoryLimits } from "@template/domain/config"
import { ToolName } from "@template/domain/ids"
import type {
  AgentId,
  AuditEntryId,
  AuditLogId,
  ChannelId,
  CheckpointId,
  ConversationId,
  PolicyId,
  SessionId,
  ToolDefinitionId,
  ToolInvocationId,
  TurnId
} from "@template/domain/ids"
import { toMemoryItemIds, type SubroutineToolScope } from "@template/domain/memory"
import { MemoryScope, MemoryTier } from "@template/domain/status"
import {
  DEFAULT_MEMORY_SCOPE,
  DEFAULT_MEMORY_SOURCE,
  DEFAULT_MEMORY_TIER
} from "@template/domain/system-defaults"
import {
  ArtifactRefSchema,
  CHECKPOINT_REPLAY_PAYLOAD_VERSION,
  type ArtifactStorePort,
  type SessionArtifactPort,
  type CheckpointReplayPayloadVersion,
  type Instant
} from "@template/domain/ports"
import type {
  AuthorizationDecision,
  CheckpointAction,
  ComplianceStatus
} from "@template/domain/status"
import { DateTime, Effect, Layer, Match, Ref, Schema, ServiceMap, Stream } from "effect"
import * as Tool from "effect/unstable/ai/Tool"
import * as Toolkit from "effect/unstable/ai/Toolkit"
import { AgentConfig } from "./AgentConfig.js"
import {
  computeAllowedTools,
  TOOL_CATALOG_BY_NAME
} from "./ToolCatalog.js"
import {
  ArtifactStorePortTag,
  CheckpointPortTag,
  GovernancePortTag,
  MemoryPortTag,
  SessionArtifactPortTag,
  SessionMetricsPortTag
} from "../PortTags.js"
import {
  canonicalJsonStringify,
  makeCheckpointPayloadHash
} from "../checkpoints/ReplayHash.js"
import {
  toCheckpointToolFailure,
  validateInvokeToolCheckpoint
} from "../checkpoints/ReplayCheckpointValidator.js"
import { safeJsonParseUnknown, safeJsonStringify } from "../json/JsonCodec.js"
import type { CommandInvocationContext } from "../tools/command/CommandTypes.js"
import { ToolExecution } from "../tools/ToolExecution.js"

const POLICY_SYSTEM_ERROR = "policy:invoke_tool:system_error:v1" as PolicyId
const POLICY_TOOL_SCOPE = "policy:invoke_tool:scope_denied:v1" as PolicyId
const DEFAULT_AUDIT_LOG_ID = "auditlog:governance:default:v1" as AuditLogId

const TOOL_NAMES = {
  time_now: ToolName.makeUnsafe("time_now"),
  math_calculate: ToolName.makeUnsafe("math_calculate"),
  echo_text: ToolName.makeUnsafe("echo_text"),
  store_memory: ToolName.makeUnsafe("store_memory"),
  retrieve_memories: ToolName.makeUnsafe("retrieve_memories"),
  forget_memories: ToolName.makeUnsafe("forget_memories"),
  file_read: ToolName.makeUnsafe("file_read"),
  file_write: ToolName.makeUnsafe("file_write"),
  file_edit: ToolName.makeUnsafe("file_edit"),
  file_ls: ToolName.makeUnsafe("file_ls"),
  file_find: ToolName.makeUnsafe("file_find"),
  file_grep: ToolName.makeUnsafe("file_grep"),
  shell_execute: ToolName.makeUnsafe("shell_execute"),
  send_notification: ToolName.makeUnsafe("send_notification")
} as const

const ToolFailurePayload = Schema.Struct({
  errorCode: Schema.String,
  message: Schema.String
})
type ToolFailurePayload = typeof ToolFailurePayload.Type

class ToolFailureError extends Schema.ErrorClass<ToolFailureError>(
  "ToolFailureError"
)({
  _tag: Schema.tag("ToolFailureError"),
  errorCode: Schema.String,
  message: Schema.String
}) {}

export class RequiresApprovalToolFailure extends Schema.ErrorClass<RequiresApprovalToolFailure>(
  "RequiresApprovalToolFailure"
)({
  _tag: Schema.tag("RequiresApprovalToolFailure"),
  errorCode: Schema.Literal("RequiresApproval"),
  message: Schema.String
}) {}

type ToolFailure = ToolFailureError | RequiresApprovalToolFailure

const makeToolFailure = (
  errorCode: string,
  message: string
): ToolFailure =>
  errorCode === "RequiresApproval"
    ? new RequiresApprovalToolFailure({ errorCode: "RequiresApproval", message })
    : new ToolFailureError({ errorCode, message })

const toToolFailurePayload = (
  failure: ToolFailure
): ToolFailurePayload =>
  failure._tag === "RequiresApprovalToolFailure"
    ? {
      errorCode: "RequiresApproval",
      message: failure.message
    }
    : {
      errorCode: failure.errorCode,
      message: failure.message
    }

const fromToolFailurePayload = (
  failure: ToolFailurePayload
): ToolFailure => makeToolFailure(failure.errorCode, failure.message)

const ToolErrorResult = Schema.Struct({
  ok: Schema.Literal(false),
  errorCode: Schema.String,
  message: Schema.String
})
type ToolErrorResult = typeof ToolErrorResult.Type

const ToolOutputArtifactEnvelope = Schema.Struct({
  storage: Schema.Literal("ArtifactRef"),
  artifact: ArtifactRefSchema,
  preview: Schema.String
})
type ToolOutputArtifactEnvelope = typeof ToolOutputArtifactEnvelope.Type

const withToolErrorResult = <A extends Schema.Top>(success: A) =>
  Schema.Union([success, ToolErrorResult])

export interface CheckpointSignal {
  readonly checkpointId: string
  readonly action: CheckpointAction
  readonly toolName: string
  readonly inputJson: string
  readonly reason: string
}

const TimeNowTool = Tool.make("time_now", {
  description: "Return the current UTC timestamp as ISO 8601.",
  success: withToolErrorResult(Schema.Struct({
    nowIso: Schema.String
  })),
  failure: ToolFailurePayload
})

const MathCalculateTool = Tool.make("math_calculate", {
  description: "Evaluate a basic arithmetic expression.",
  parameters: Schema.Struct({
    expression: Schema.String
  }),
  success: withToolErrorResult(Schema.Struct({
    result: Schema.Number
  })),
  failure: ToolFailurePayload
})

const EchoTextTool = Tool.make("echo_text", {
  description: "Return provided text verbatim.",
  parameters: Schema.Struct({
    text: Schema.String
  }),
  success: withToolErrorResult(Schema.Struct({
    text: Schema.String
  })),
  failure: ToolFailurePayload
})

const StoreMemoryTool = Tool.make("store_memory", {
  description: "Store a memory item for this agent.",
  parameters: Schema.Struct({
    content: Schema.String,
    tags: Schema.optionalKey(Schema.Array(Schema.String)),
    scope: Schema.optionalKey(MemoryScope),
    tier: Schema.optionalKey(MemoryTier)
  }),
  success: withToolErrorResult(Schema.Struct({
    memoryId: Schema.String,
    stored: Schema.Boolean
  })),
  failure: ToolFailurePayload
})

const RetrieveMemoriesTool = Tool.make("retrieve_memories", {
  description: "Retrieve relevant memories for a natural language query.",
  parameters: Schema.Struct({
    query: Schema.String,
    limit: Schema.optionalKey(Schema.Number)
  }),
  success: withToolErrorResult(Schema.Struct({
    memories: Schema.Array(Schema.Struct({
      memoryId: Schema.String,
      content: Schema.String,
      metadataJson: Schema.Union([Schema.String, Schema.Null]),
      createdAt: Schema.String
    }))
  })),
  failure: ToolFailurePayload
})

const ForgetMemoriesTool = Tool.make("forget_memories", {
  description: "Delete memories by item ID.",
  parameters: Schema.Struct({
    memoryIds: Schema.Array(Schema.String)
  }),
  success: withToolErrorResult(Schema.Struct({
    forgotten: Schema.Number
  })),
  failure: ToolFailurePayload
})

const FileReadTool = Tool.make("file_read", {
  description: "Read file content from the specified path.",
  parameters: Schema.Struct({
    path: Schema.String,
    offset: Schema.optionalKey(Schema.Number),
    limit: Schema.optionalKey(Schema.Number)
  }),
  success: withToolErrorResult(Schema.Struct({
    ok: Schema.Literal(true),
    path: Schema.String,
    content: Schema.String
  })),
  failure: ToolFailurePayload
})

const FileWriteTool = Tool.make("file_write", {
  description: "Write content to a file at the specified path.",
  parameters: Schema.Struct({
    path: Schema.String,
    content: Schema.String
  }),
  success: withToolErrorResult(Schema.Struct({
    ok: Schema.Literal(true),
    path: Schema.String,
    bytesWritten: Schema.Number
  })),
  failure: ToolFailurePayload
})

const FileEditTool = Tool.make("file_edit", {
  description: "Edit a file by replacing a unique matching string.",
  parameters: Schema.Struct({
    path: Schema.String,
    old_string: Schema.NonEmptyString,
    new_string: Schema.String
  }),
  success: withToolErrorResult(Schema.Struct({
    ok: Schema.Literal(true),
    path: Schema.String,
    bytesWritten: Schema.Number,
    diff: Schema.String
  })),
  failure: ToolFailurePayload
})

const FileLsTool = Tool.make("file_ls", {
  description: "List files in a directory.",
  parameters: Schema.Struct({
    path: Schema.optionalKey(Schema.String),
    recursive: Schema.optionalKey(Schema.Boolean),
    include_hidden: Schema.optionalKey(Schema.Boolean),
    ignore: Schema.optionalKey(Schema.Array(Schema.String)),
    limit: Schema.optionalKey(Schema.Number)
  }),
  success: withToolErrorResult(Schema.Struct({
    ok: Schema.Literal(true),
    path: Schema.String,
    entries: Schema.Array(Schema.String),
    truncated: Schema.Boolean
  })),
  failure: ToolFailurePayload
})

const FileFindTool = Tool.make("file_find", {
  description: "Find files by glob pattern.",
  parameters: Schema.Struct({
    pattern: Schema.NonEmptyString,
    path: Schema.optionalKey(Schema.String),
    include_hidden: Schema.optionalKey(Schema.Boolean),
    limit: Schema.optionalKey(Schema.Number)
  }),
  success: withToolErrorResult(Schema.Struct({
    ok: Schema.Literal(true),
    path: Schema.String,
    matches: Schema.Array(Schema.String),
    truncated: Schema.Boolean
  })),
  failure: ToolFailurePayload
})

const FileGrepTool = Tool.make("file_grep", {
  description: "Search file content with grep-style matching.",
  parameters: Schema.Struct({
    pattern: Schema.NonEmptyString,
    path: Schema.optionalKey(Schema.String),
    include_hidden: Schema.optionalKey(Schema.Boolean),
    include: Schema.optionalKey(Schema.String),
    literal_text: Schema.optionalKey(Schema.Boolean),
    case_sensitive: Schema.optionalKey(Schema.Boolean),
    limit: Schema.optionalKey(Schema.Number)
  }),
  success: withToolErrorResult(Schema.Struct({
    ok: Schema.Literal(true),
    path: Schema.String,
    matches: Schema.Array(Schema.Struct({
      path: Schema.String,
      line: Schema.Number,
      text: Schema.String
    })),
    truncated: Schema.Boolean
  })),
  failure: ToolFailurePayload
})

const ShellExecuteTool = Tool.make("shell_execute", {
  description: "Execute a shell command and return its output.",
  parameters: Schema.Struct({
    command: Schema.String,
    cwd: Schema.optionalKey(Schema.String)
  }),
  success: withToolErrorResult(Schema.Struct({
    ok: Schema.Literal(true),
    exitCode: Schema.Number,
    stdout: Schema.String,
    stderr: Schema.String
  })),
  failure: ToolFailurePayload
})

const SendNotificationTool = Tool.make("send_notification", {
  description: "Send a notification message to a user or channel.",
  parameters: Schema.Struct({
    recipient: Schema.String,
    message: Schema.String
  }),
  success: withToolErrorResult(Schema.Struct({
    ok: Schema.Literal(true),
    notificationId: Schema.String,
    delivered: Schema.Boolean
  })),
  failure: ToolFailurePayload
})

const SafeToolkit = Toolkit.make(
  TimeNowTool,
  MathCalculateTool,
  EchoTextTool,
  StoreMemoryTool,
  RetrieveMemoriesTool,
  ForgetMemoriesTool,
  FileReadTool,
  FileWriteTool,
  FileEditTool,
  FileLsTool,
  FileFindTool,
  FileGrepTool,
  ShellExecuteTool,
  SendNotificationTool
)

/**
 * The handler layer produced by SafeToolkit.toLayer, with `any` context
 * stripped to `never`. Toolkit.toLayer leaks `any` context in Effect v4 beta.
 */
type SafeToolkitHandlerLayer =
  ReturnType<typeof SafeToolkit.toLayer> extends Layer.Layer<infer A, infer E, any>
    ? Layer.Layer<A, E>
    : never

export interface ToolExecutionContext {
  readonly agentId: AgentId
  readonly sessionId: SessionId
  readonly conversationId: ConversationId
  readonly turnId: TurnId
  readonly now: Instant
  readonly iteration?: number
  readonly channelId: string
  readonly checkpointId?: string
  readonly checkpointAction?: CheckpointAction
  readonly userId?: string
  readonly content?: string
  readonly recoverToolErrors?: boolean
}

export interface ApprovedToolReplayResult {
  readonly turnId: TurnId
  readonly sessionId: SessionId
  readonly createdAt: Instant
  readonly replayPayloadVersion: CheckpointReplayPayloadVersion
  readonly toolName: string
  readonly inputJson: string
  readonly outputJson: string
  readonly isError: boolean
}

export interface ToolRegistryService {
  readonly makeToolkit: (
    context: ToolExecutionContext,
    checkpointSignalsRef?: Ref.Ref<ReadonlyArray<CheckpointSignal>>,
    toolScope?: SubroutineToolScope
  ) => Effect.Effect<{
    readonly toolkit: typeof SafeToolkit
    readonly handlerLayer: SafeToolkitHandlerLayer
  }>
  readonly executeApprovedCheckpointTool: (params: {
    readonly checkpointId: CheckpointId
    readonly payloadJson: string
    readonly agentId: AgentId
    readonly sessionId: SessionId
    readonly conversationId: ConversationId
    readonly channelId: ChannelId
    readonly decidedBy: string
    readonly now: Instant
  }) => Effect.Effect<ApprovedToolReplayResult>
}

export class ToolRegistry extends ServiceMap.Service<ToolRegistry>()(
  "server/ai/ToolRegistry",
  {
    make: Effect.gen(function*() {
      const governance = yield* GovernancePortTag
      const memoryPort = yield* MemoryPortTag
      const checkpointPort = yield* CheckpointPortTag
      const artifactStore = yield* ArtifactStorePortTag
      const sessionArtifactPort = yield* SessionArtifactPortTag
      const sessionMetricsPort = yield* SessionMetricsPortTag
      const agentConfig = yield* AgentConfig
      const toolExecution = yield* ToolExecution
      const artifactConfig = agentConfig.server.storage.artifacts

      // ── Startup invariant: toolkit tool names must match ToolCatalog ──
      const toolkitNames = new Set(Object.keys(TOOL_NAMES))
      const catalogNames = new Set(TOOL_CATALOG_BY_NAME.keys())
      const missingFromCatalog = [...toolkitNames].filter((n) => !catalogNames.has(n))
      const missingFromToolkit = [...catalogNames].filter((n) => !toolkitNames.has(n))
      if (missingFromCatalog.length > 0 || missingFromToolkit.length > 0) {
        return yield* Effect.die(
          new Error(
            `ToolRegistry/ToolCatalog name parity mismatch. `
            + (missingFromCatalog.length > 0
              ? `In toolkit but not catalog: [${missingFromCatalog.join(", ")}]. `
              : "")
            + (missingFromToolkit.length > 0
              ? `In catalog but not toolkit: [${missingFromToolkit.join(", ")}].`
              : "")
          )
        )
      }

      const persistInvocation = (params: {
        readonly context: ToolExecutionContext
        readonly toolName: ToolName
        readonly idempotencyKey: string
        readonly inputJson: string
        readonly outputJson: string
        readonly decision: AuthorizationDecision
        readonly complianceStatus: ComplianceStatus
        readonly policyId: PolicyId
        readonly toolDefinitionId: ToolDefinitionId | null
        readonly reason: string
      }) =>
        Effect.gen(function*() {
          const toolInvocationId = (`toolinv:${crypto.randomUUID()}`) as ToolInvocationId
          const auditEntryId = (`audit:${params.context.turnId}:${crypto.randomUUID()}`) as AuditEntryId
          const rawOutputBytes = utf8ByteLength(params.outputJson)

          const storedOutput = yield* storeToolOutputIfLarge({
            outputJson: params.outputJson,
            outputBytes: rawOutputBytes,
            thresholdBytes: artifactConfig.inlineToolResultMaxBytes,
            previewBytes: artifactConfig.previewMaxBytes,
            context: params.context,
            turnId: params.context.turnId,
            toolInvocationId,
            artifactStore,
            sessionArtifactPort
          })

          yield* governance.recordToolInvocationWithAudit({
            invocation: {
              toolInvocationId,
              idempotencyKey: params.idempotencyKey,
              auditEntryId,
              toolDefinitionId: params.toolDefinitionId,
              auditLogId: DEFAULT_AUDIT_LOG_ID,
              agentId: params.context.agentId,
              sessionId: params.context.sessionId,
              conversationId: params.context.conversationId,
              turnId: params.context.turnId,
              toolName: params.toolName,
              inputJson: params.inputJson,
              outputJson: storedOutput.storedOutputJson,
              decision: params.decision,
              complianceStatus: params.complianceStatus,
              policyId: params.policyId,
              reason: params.reason,
              invokedAt: params.context.now,
              completedAt: params.context.now
            },
            audit: {
              auditEntryId,
              auditLogId: DEFAULT_AUDIT_LOG_ID,
              toolInvocationId,
              agentId: params.context.agentId,
              sessionId: params.context.sessionId,
              decision: params.decision,
              reason: params.reason,
              createdAt: params.context.now
            }
          })

          yield* sessionMetricsPort.increment(params.context.sessionId, {
            toolResultBytes: rawOutputBytes,
            artifactBytes: storedOutput.artifactBytes,
            fileTouches: estimateFileTouchDelta(params.toolName)
          })
        })

      const replayStoredInvocation = <A>(
        outputJson: string
      ): Effect.Effect<A, ToolFailure> =>
        materializeStoredOutputJson(outputJson, artifactStore).pipe(
          Effect.flatMap((materializedOutputJson) =>
            Effect.suspend(() => {
              const parsed = safeJsonParseUnknown(materializedOutputJson)
              if (isToolFailurePayload(parsed)) {
                return Effect.fail(fromToolFailurePayload(parsed))
              }
              if (parsed === null || parsed === undefined) {
                return Effect.fail(
                  makeToolFailure(
                    "ReplayDecodeFailed",
                    "stored invocation output was null or undefined"
                  )
                )
              }
              return Effect.succeed(parsed as A)
            })
          ),
          Effect.catchDefect(() =>
            Effect.fail(
              makeToolFailure(
                "ReplayDecodeFailed",
                "failed to decode persisted tool invocation payload"
              )
            )
          )
        )

      const failWithRecordedInvocation = (params: {
        readonly context: ToolExecutionContext
        readonly toolName: ToolName
        readonly idempotencyKey: string
        readonly inputJson: string
        readonly decision: "Deny" | "RequireApproval"
        readonly policyId: PolicyId
        readonly toolDefinitionId: ToolDefinitionId | null
        readonly reason: string
        readonly failure: ToolFailure
      }): Effect.Effect<never, ToolFailure> =>
        persistInvocation({
          context: params.context,
          toolName: params.toolName,
          idempotencyKey: params.idempotencyKey,
          inputJson: params.inputJson,
          outputJson: safeJsonStringify(toToolFailurePayload(params.failure)),
          decision: params.decision,
          complianceStatus: "NonCompliant",
          policyId: params.policyId,
          toolDefinitionId: params.toolDefinitionId,
          reason: params.reason
        }).pipe(
          Effect.andThen(Effect.fail(params.failure))
        )

      const toToolErrorResult = (failure: ToolFailure): ToolErrorResult => {
        const payload = toToolFailurePayload(failure)
        return {
          ok: false,
          errorCode: payload.errorCode,
          message: payload.message
        }
      }

      const withToolErrorRecovery = <A>(
        context: ToolExecutionContext,
        effect: Effect.Effect<A, ToolFailure>
      ): Effect.Effect<A | ToolErrorResult, ToolFailure> =>
        context.recoverToolErrors === true
          ? effect.pipe(
            Effect.catchTags({
              ToolFailureError: (failure) => Effect.succeed(toToolErrorResult(failure)),
              RequiresApprovalToolFailure: (failure) => Effect.fail(failure)
            })
          )
          : effect

      const runMemoryPolicy = <A>(params: {
        readonly context: ToolExecutionContext
        readonly toolName: ToolName
        readonly action: "ReadMemory" | "WriteMemory"
        readonly operation: "store" | "retrieve" | "forget"
        readonly allowReason: string
        readonly denyReason: string
        readonly auditBeforeExecute: boolean
        readonly execute: Effect.Effect<A, ToolFailure>
      }): Effect.Effect<A, ToolFailure> =>
        Effect.gen(function*() {
          const policy = yield* governance.evaluatePolicy({
            agentId: params.context.agentId,
            sessionId: params.context.sessionId,
            action: params.action
          }).pipe(
            Effect.catchCause(() =>
              Effect.fail(makeToolFailure("MemoryPolicyError", "memory policy evaluation failed"))
            )
          )

          const auditEntryId = (`audit:memory:${params.operation}:${params.context.turnId}:${params.toolName}:${
            params.context.iteration ?? 0
          }`) as AuditEntryId

          yield* Match.value(policy.decision).pipe(
            Match.when("Allow", () => Effect.void),
            Match.orElse(() =>
              governance.writeAudit({
                auditEntryId,
                agentId: params.context.agentId,
                sessionId: params.context.sessionId,
                decision: policy.decision,
                reason: `${params.denyReason}:${policy.reason}`,
                createdAt: params.context.now
              }).pipe(
                Effect.andThen(
                  Effect.fail(makeToolFailure("MemoryAccessDenied", policy.reason))
                )
              )
            )
          )

          const writeAllowAudit = governance.writeAudit({
            auditEntryId,
            agentId: params.context.agentId,
            sessionId: params.context.sessionId,
            decision: "Allow",
            reason: params.allowReason,
            createdAt: params.context.now
          })

          if (params.auditBeforeExecute) {
            yield* writeAllowAudit
            return yield* params.execute
          }

          const result = yield* params.execute
          yield* writeAllowAudit
          return result
        })

      const runGovernedTool = <A>(
        context: ToolExecutionContext,
        toolName: ToolName,
        input: Record<string, unknown>,
        execute: Effect.Effect<A, ToolFailure>,
        checkpointSignalsRef?: Ref.Ref<ReadonlyArray<CheckpointSignal>>,
        allowedToolNames?: Set<string>
      ): Effect.Effect<A, ToolFailure> =>
        Effect.gen(function*() {
          const inputJson = canonicalJsonStringify(input)
          const idempotencyKey = yield* makeIdempotencyKey(
            context.turnId,
            context.iteration ?? 0,
            toolName,
            inputJson
          )

          if (allowedToolNames && !allowedToolNames.has(toolName as string)) {
            return yield* failWithRecordedInvocation({
              context,
              toolName,
              idempotencyKey,
              inputJson,
              decision: "Deny",
              policyId: POLICY_TOOL_SCOPE,
              toolDefinitionId: null,
              reason: `tool_scope_denied:${toolName}`,
              failure: makeToolFailure(
                "ToolNotInScope",
                `Tool '${toolName}' is not allowed in this subroutine's tool scope.`
              )
            })
          }

          // --- Approved bypass path ---
          if (context.checkpointId !== undefined && context.checkpointAction === "InvokeTool") {
            const validatedCheckpoint = yield* validateInvokeToolCheckpoint({
              checkpointPort,
              checkpointId: context.checkpointId as CheckpointId,
              expectedTurnContext: {
                agentId: context.agentId,
                sessionId: context.sessionId,
                conversationId: context.conversationId,
                channelId: context.channelId
              },
              expectedToolName: toolName as string,
              expectedInputJson: inputJson
            }).pipe(
              Effect.mapError((failure) =>
                fromToolFailurePayload(toCheckpointToolFailure(failure))
              )
            )

            // Local defensive assert to keep bypass path invariant explicit at call site.
            if (
              validatedCheckpoint.payload.toolName !== (toolName as string)
              || validatedCheckpoint.payload.inputJson !== inputJson
            ) {
              return yield* makeToolFailure(
                "CheckpointPayloadMismatch",
                `checkpoint ${context.checkpointId} payload does not match replay tool input`
              )
            }

            // Bypass policy/idempotency — execute directly
            const result = yield* governance.enforceSandbox(context.agentId, execute).pipe(
              Effect.mapError(toToolFailure),
              Effect.tap((r) =>
                persistInvocation({
                  context,
                  toolName,
                  idempotencyKey,
                  inputJson,
                  outputJson: safeJsonStringify(r),
                  decision: "Allow",
                  complianceStatus: "Compliant",
                  policyId: validatedCheckpoint.checkpoint.policyId ?? POLICY_SYSTEM_ERROR,
                  toolDefinitionId: null,
                  reason: `checkpoint_approved:${toolName}`
                })
              )
            )

            return result
          }

          // --- Standard idempotency check ---
          const existing = yield* governance.findToolInvocationByIdempotencyKey(idempotencyKey)
          if (existing !== null) {
            return yield* replayStoredInvocation(existing.outputJson)
          }

          const policy = yield* governance.evaluatePolicy({
            agentId: context.agentId,
            sessionId: context.sessionId,
            action: "InvokeTool",
            toolName
          }).pipe(
            Effect.catchCause(() =>
              failWithRecordedInvocation({
                context,
                toolName,
                idempotencyKey,
                inputJson,
                decision: "Deny",
                policyId: POLICY_SYSTEM_ERROR,
                toolDefinitionId: null,
                reason: "governance_system_error:evaluate_policy",
                failure: makeToolFailure("GovernancePolicyError", "policy evaluation failed")
              })
            )
          )

          yield* Match.value(policy.decision).pipe(
            Match.when("Deny", () =>
              failWithRecordedInvocation({
                context,
                toolName,
                idempotencyKey,
                inputJson,
                decision: "Deny",
                policyId: policy.policyId ?? POLICY_SYSTEM_ERROR,
                toolDefinitionId: policy.toolDefinitionId,
                reason: `tool_policy_denied:${toolName}`,
                failure: makeToolFailure("PolicyDenied", policy.reason)
              })
            ),
            Match.when("RequireApproval", () =>
              Effect.gen(function*() {
                const newCheckpointId = (`checkpoint:${crypto.randomUUID()}`) as CheckpointId
                const replayPayload = {
                  replayPayloadVersion: CHECKPOINT_REPLAY_PAYLOAD_VERSION,
                  kind: "InvokeTool",
                  toolName: toolName as string,
                  inputJson,
                  turnContext: {
                    agentId: context.agentId,
                    sessionId: context.sessionId,
                    conversationId: context.conversationId,
                    channelId: context.channelId,
                    turnId: context.turnId,
                    createdAt: DateTime.formatIso(context.now)
                  }
                } as const
                const payloadHash = yield* makeCheckpointPayloadHash(
                  "InvokeTool",
                  replayPayload
                )

                yield* checkpointPort.create({
                  checkpointId: newCheckpointId,
                  agentId: context.agentId,
                  sessionId: context.sessionId,
                  channelId: context.channelId as ChannelId,
                  turnId: context.turnId,
                  action: "InvokeTool",
                  policyId: policy.policyId,
                  reason: policy.reason,
                  payloadJson: safeJsonStringify(replayPayload),
                  payloadHash,
                  status: "Pending",
                  requestedAt: context.now,
                  decidedAt: null,
                  decidedBy: null,
                  consumedAt: null,
                  consumedBy: null,
                  expiresAt: null
                })

                if (checkpointSignalsRef !== undefined) {
                  yield* Ref.update(checkpointSignalsRef, (signals) => [
                    ...signals,
                    {
                      checkpointId: newCheckpointId,
                      action: "InvokeTool" as const,
                      toolName: toolName as string,
                      inputJson,
                      reason: policy.reason
                    }
                  ])
                }

                return yield* failWithRecordedInvocation({
                  context,
                  toolName,
                  idempotencyKey,
                  inputJson,
                  decision: "RequireApproval",
                  policyId: policy.policyId ?? POLICY_SYSTEM_ERROR,
                  toolDefinitionId: policy.toolDefinitionId,
                  reason: `tool_requires_approval:${toolName}`,
                  failure: makeToolFailure("RequiresApproval", policy.reason)
                })
              })
            ),
            Match.when("Allow", () => Effect.void),
            Match.exhaustive
          )

          yield* governance.checkToolQuota(context.agentId, toolName, context.now).pipe(
            Effect.catchTag("ToolQuotaExceeded", (error) =>
              failWithRecordedInvocation({
                context,
                toolName,
                idempotencyKey,
                inputJson,
                decision: "Deny",
                policyId: policy.policyId ?? POLICY_SYSTEM_ERROR,
                toolDefinitionId: policy.toolDefinitionId,
                reason: `tool_quota_exceeded:${toolName}`,
                failure: makeToolFailure(
                  "ToolQuotaExceeded",
                  `remaining_invocations=${error.remainingInvocations}`
                )
              })
            ),
            Effect.catchDefect(() =>
              failWithRecordedInvocation({
                context,
                toolName,
                idempotencyKey,
                inputJson,
                decision: "Deny",
                policyId: POLICY_SYSTEM_ERROR,
                toolDefinitionId: policy.toolDefinitionId,
                reason: "governance_system_error:check_quota",
                failure: makeToolFailure("GovernanceQuotaError", "quota check failed")
              })
            )
          )

          return yield* governance.enforceSandbox(context.agentId, execute).pipe(
            Effect.mapError(toToolFailure),
            Effect.tap((result) =>
              persistInvocation({
                context,
                toolName,
                idempotencyKey,
                inputJson,
                outputJson: safeJsonStringify(result),
                decision: "Allow",
                complianceStatus: "Compliant",
                policyId: policy.policyId ?? POLICY_SYSTEM_ERROR,
                toolDefinitionId: policy.toolDefinitionId,
                reason: `tool_invoked:${toolName}`
              })
            ),
            Effect.catchTags({
              ToolFailureError: (failure) =>
                persistInvocation({
                  context,
                  toolName,
                  idempotencyKey,
                  inputJson,
                  outputJson: safeJsonStringify(toToolFailurePayload(failure)),
                  decision: "Allow",
                  complianceStatus: "Compliant",
                  policyId: policy.policyId ?? POLICY_SYSTEM_ERROR,
                  toolDefinitionId: policy.toolDefinitionId,
                  reason: `tool_execution_failed:${toolName}:${failure.errorCode}`
                }).pipe(
                  Effect.andThen(Effect.fail(failure))
                ),
              RequiresApprovalToolFailure: (failure) =>
                persistInvocation({
                  context,
                  toolName,
                  idempotencyKey,
                  inputJson,
                  outputJson: safeJsonStringify(toToolFailurePayload(failure)),
                  decision: "Allow",
                  complianceStatus: "Compliant",
                  policyId: policy.policyId ?? POLICY_SYSTEM_ERROR,
                  toolDefinitionId: policy.toolDefinitionId,
                  reason: `tool_execution_failed:${toolName}:${failure.errorCode}`
                }).pipe(
                  Effect.andThen(Effect.fail(failure))
                )
            })
          )
        }) as Effect.Effect<A, ToolFailure>

      const toToolInvocationContext = (
        context: ToolExecutionContext,
        toolName: ToolName
      ): CommandInvocationContext =>
        ({
          source: context.checkpointId !== undefined ? "checkpoint_replay" : "tool",
          agentId: context.agentId,
          sessionId: context.sessionId,
          turnId: context.turnId,
          channelId: context.channelId as ChannelId,
          ...(context.checkpointId !== undefined
            ? { checkpointId: context.checkpointId as CheckpointId }
            : {}),
          toolName
        }) satisfies CommandInvocationContext

      const makeToolkit: ToolRegistryService["makeToolkit"] = (context, checkpointSignalsRef, toolScope) =>
        Effect.gen(function*() {
          const profile = yield* agentConfig.getAgent(context.agentId as string).pipe(Effect.orDie)
          const memoryLimits = profile.runtime.memory
          const allowedTools = toolScope ? computeAllowedTools(toolScope) : undefined
          const runTool = <A>(
            toolContext: ToolExecutionContext,
            toolName: ToolName,
            input: Record<string, unknown>,
            execute: Effect.Effect<A, ToolFailure>
          ): Effect.Effect<A | ToolErrorResult, ToolFailure> =>
            withToolErrorRecovery(
              toolContext,
              runGovernedTool(
                toolContext,
                toolName,
                input,
                execute,
                checkpointSignalsRef,
                allowedTools
              )
            )

          return {
            toolkit: SafeToolkit,
            handlerLayer: SafeToolkit.toLayer(
              SafeToolkit.of({
              "time_now": () =>
                runTool(
                  context,
                  TOOL_NAMES.time_now,
                  {},
                  Effect.succeed({
                    nowIso: DateTime.formatIso(context.now)
                  })
                ),
              "math_calculate": ({ expression }) => {
                const result = safeCalculate(expression)
                return runTool(
                  context,
                  TOOL_NAMES.math_calculate,
                  { expression },
                  result === null
                    ? Effect.fail(
                      makeToolFailure(
                        "InvalidExpression",
                        "Expression must contain only numbers and arithmetic operators."
                      )
                    )
                    : Effect.succeed({ result })
                )
              },
              "echo_text": ({ text }) =>
                runTool(
                  context,
                  TOOL_NAMES.echo_text,
                  { text },
                  Effect.succeed({ text })
                ),
              "store_memory": ({ content, tags, scope, tier }) =>
                runTool(
                  context,
                  TOOL_NAMES.store_memory,
                  { content, tags, scope, tier },
                  runMemoryPolicy({
                    context,
                    toolName: TOOL_NAMES.store_memory,
                    action: "WriteMemory",
                    operation: "store",
                    allowReason: "memory_store_allowed",
                    denyReason: "memory_store_denied",
                    auditBeforeExecute: true,
                    execute: Effect.gen(function*() {
                      const metadataJson = Array.isArray(tags) && tags.length > 0
                        ? safeJsonStringify({ tags: tags.filter((tag) => tag.trim().length > 0) })
                        : null
                      const [memoryId] = yield* memoryPort.encode(
                        context.agentId,
                        [{
                          tier: tier ?? DEFAULT_MEMORY_TIER,
                          scope: scope ?? DEFAULT_MEMORY_SCOPE,
                          source: DEFAULT_MEMORY_SOURCE,
                          content,
                          metadataJson
                        }],
                        context.now
                      )

                      if (memoryId === undefined) {
                        return yield* makeToolFailure(
                          "MemoryStoreFailed",
                          "memory store did not return an item id"
                        )
                      }

                      return {
                        memoryId,
                        stored: true
                      } as const
                    })
                  })
                ),
              "retrieve_memories": ({ query, limit }) =>
                runTool(
                  context,
                  TOOL_NAMES.retrieve_memories,
                  { query, limit },
                  runMemoryPolicy({
                    context,
                    toolName: TOOL_NAMES.retrieve_memories,
                    action: "ReadMemory",
                    operation: "retrieve",
                    allowReason: "memory_retrieve_allowed",
                    denyReason: "memory_retrieve_denied",
                    auditBeforeExecute: false,
                    execute: memoryPort.search(context.agentId, {
                      query,
                      limit: clampMemoryLimit(limit, memoryLimits),
                      sort: "CreatedDesc"
                    }).pipe(
                      Effect.map((result) => ({
                        memories: result.items.map((item) => ({
                          memoryId: item.memoryItemId,
                          content: item.content,
                          metadataJson: item.metadataJson,
                          createdAt: DateTime.formatIso(item.createdAt)
                        }))
                      }))
                    )
                  })
                ),
              "forget_memories": ({ memoryIds }) =>
                runTool(
                  context,
                  TOOL_NAMES.forget_memories,
                  { memoryIds },
                  runMemoryPolicy({
                    context,
                    toolName: TOOL_NAMES.forget_memories,
                    action: "WriteMemory",
                    operation: "forget",
                    allowReason: "memory_forget_allowed",
                    denyReason: "memory_forget_denied",
                    auditBeforeExecute: true,
                    execute: Effect.gen(function*() {
                      const validIds = toMemoryItemIds(memoryIds)

                      if (validIds.length === 0) {
                        return yield* makeToolFailure(
                          "InvalidMemoryIds",
                          "memoryIds must contain at least one non-empty id"
                        )
                      }

                      const forgotten = yield* memoryPort.forget(context.agentId, {
                        itemIds: validIds
                      })
                      return { forgotten } as const
                    })
                  })
                ),
              "file_read": ({ path, offset, limit }) =>
                runTool(
                  context,
                  TOOL_NAMES.file_read,
                  { path, offset, limit },
                  toolExecution.readFile({
                    path,
                    ...(offset !== undefined ? { offset } : {}),
                    ...(limit !== undefined ? { limit } : {}),
                    context: toToolInvocationContext(context, TOOL_NAMES.file_read)
                  }).pipe(
                    Effect.map((result) => ({
                      ok: true as const,
                      path: result.path,
                      content: result.content
                    })),
                    Effect.mapError((error) => makeToolFailure(error.errorCode, error.message))
                  )
                ),
              "file_write": ({ path, content }) =>
                runTool(
                  context,
                  TOOL_NAMES.file_write,
                  { path, content },
                  toolExecution.writeFile({
                    path,
                    content,
                    context: toToolInvocationContext(context, TOOL_NAMES.file_write)
                  }).pipe(
                    Effect.map((result) => ({
                      ok: true as const,
                      path: result.path,
                      bytesWritten: result.bytesWritten
                    })),
                    Effect.mapError((error) => makeToolFailure(error.errorCode, error.message))
                  )
                ),
              "file_edit": ({ path, old_string, new_string }) =>
                runTool(
                  context,
                  TOOL_NAMES.file_edit,
                  { path, old_string, new_string },
                  toolExecution.editFile({
                    path,
                    oldString: old_string,
                    newString: new_string,
                    context: toToolInvocationContext(context, TOOL_NAMES.file_edit)
                  }).pipe(
                    Effect.map((result) => ({
                      ok: true as const,
                      path: result.path,
                      bytesWritten: result.bytesWritten,
                      diff: result.diff
                    })),
                    Effect.mapError((error) => makeToolFailure(error.errorCode, error.message))
                  )
                ),
              "file_ls": ({ path, recursive, include_hidden, ignore, limit }) =>
                runTool(
                  context,
                  TOOL_NAMES.file_ls,
                  { path, recursive, include_hidden, ignore, limit },
                  toolExecution.listFiles({
                    ...(path !== undefined ? { path } : {}),
                    ...(recursive !== undefined ? { recursive } : {}),
                    ...(include_hidden !== undefined ? { includeHidden: include_hidden } : {}),
                    ...(ignore !== undefined ? { ignore } : {}),
                    ...(limit !== undefined ? { limit } : {}),
                    context: toToolInvocationContext(context, TOOL_NAMES.file_ls)
                  }).pipe(
                    Effect.map((result) => ({
                      ok: true as const,
                      path: result.path,
                      entries: result.entries,
                      truncated: result.truncated
                    })),
                    Effect.mapError((error) => makeToolFailure(error.errorCode, error.message))
                  )
                ),
              "file_find": ({ pattern, path, include_hidden, limit }) =>
                runTool(
                  context,
                  TOOL_NAMES.file_find,
                  { pattern, path, include_hidden, limit },
                  toolExecution.findFiles({
                    pattern,
                    ...(path !== undefined ? { path } : {}),
                    ...(include_hidden !== undefined ? { includeHidden: include_hidden } : {}),
                    ...(limit !== undefined ? { limit } : {}),
                    context: toToolInvocationContext(context, TOOL_NAMES.file_find)
                  }).pipe(
                    Effect.map((result) => ({
                      ok: true as const,
                      path: result.path,
                      matches: result.matches,
                      truncated: result.truncated
                    })),
                    Effect.mapError((error) => makeToolFailure(error.errorCode, error.message))
                  )
                ),
              "file_grep": ({ pattern, path, include_hidden, include, literal_text, case_sensitive, limit }) =>
                runTool(
                  context,
                  TOOL_NAMES.file_grep,
                  { pattern, path, include_hidden, include, literal_text, case_sensitive, limit },
                  toolExecution.grepFiles({
                    pattern,
                    ...(path !== undefined ? { path } : {}),
                    ...(include_hidden !== undefined ? { includeHidden: include_hidden } : {}),
                    ...(include !== undefined ? { include } : {}),
                    ...(literal_text !== undefined ? { literalText: literal_text } : {}),
                    ...(case_sensitive !== undefined ? { caseSensitive: case_sensitive } : {}),
                    ...(limit !== undefined ? { limit } : {}),
                    context: toToolInvocationContext(context, TOOL_NAMES.file_grep)
                  }).pipe(
                    Effect.map((result) => ({
                      ok: true as const,
                      path: result.path,
                      matches: result.matches,
                      truncated: result.truncated
                    })),
                    Effect.mapError((error) => makeToolFailure(error.errorCode, error.message))
                  )
                ),
              "shell_execute": ({ command, cwd }) =>
                runTool(
                  context,
                  TOOL_NAMES.shell_execute,
                  { command, cwd },
                  toolExecution.executeShell({
                    command,
                    ...(cwd !== undefined ? { cwd } : {}),
                    context: toToolInvocationContext(context, TOOL_NAMES.shell_execute)
                  }).pipe(
                    Effect.map((result) => ({
                      ok: true as const,
                      exitCode: result.exitCode,
                      stdout: result.stdout,
                      stderr: result.stderr
                    })),
                    Effect.mapError((error) => makeToolFailure(error.errorCode, error.message))
                  )
                ),
              "send_notification": ({ recipient, message }) =>
                runTool(
                  context,
                  TOOL_NAMES.send_notification,
                  { recipient, message },
                  toolExecution.sendNotification({ recipient, message }).pipe(
                    Effect.map((result) => ({
                      ok: true as const,
                      notificationId: result.notificationId,
                      delivered: result.delivered
                    })),
                    Effect.mapError((error) => makeToolFailure(error.errorCode, error.message))
                  )
                )
            })
          ) as SafeToolkitHandlerLayer
          }
        })

      const executeApprovedCheckpointTool = (params: {
        readonly checkpointId: CheckpointId
        readonly payloadJson: string
        readonly agentId: AgentId
        readonly sessionId: SessionId
        readonly conversationId: ConversationId
        readonly channelId: ChannelId
        readonly decidedBy: string
        readonly now: Instant
      }) =>
        Effect.gen(function*() {
          const replayTurnId = (`turn:replay:${crypto.randomUUID()}`) as TurnId
          const toReplayFailure = (failure: ToolFailure): ApprovedToolReplayResult => ({
            turnId: replayTurnId,
            sessionId: params.sessionId,
            createdAt: params.now,
            replayPayloadVersion: CHECKPOINT_REPLAY_PAYLOAD_VERSION,
            toolName: "unknown",
            inputJson: "{}",
            outputJson: safeJsonStringify(toToolFailurePayload(failure)),
            isError: true
          })

          const validatedCheckpoint = yield* validateInvokeToolCheckpoint({
            checkpointPort,
            checkpointId: params.checkpointId,
            expectedTurnContext: {
              agentId: params.agentId,
              sessionId: params.sessionId,
              conversationId: params.conversationId,
              channelId: params.channelId
            }
          }).pipe(
            Effect.mapError((failure) =>
              fromToolFailurePayload(toCheckpointToolFailure(failure))
            ),
            Effect.map((result) => ({ ok: true as const, result })),
            Effect.catchTags({
              ToolFailureError: (failure) =>
                Effect.succeed({ ok: false as const, failure }),
              RequiresApprovalToolFailure: (failure) =>
                Effect.succeed({ ok: false as const, failure })
            })
          )

          if (!validatedCheckpoint.ok) {
            return toReplayFailure(validatedCheckpoint.failure)
          }

          const replayPayload = validatedCheckpoint.result.payload
          const parsedInput = safeJsonParseUnknown(replayPayload.inputJson)
          if (!isJsonRecord(parsedInput)) {
            return {
              turnId: replayTurnId,
              sessionId: params.sessionId,
              createdAt: params.now,
              replayPayloadVersion: replayPayload.replayPayloadVersion,
              toolName: replayPayload.toolName,
              inputJson: replayPayload.inputJson,
              outputJson: safeJsonStringify(
                toToolFailurePayload(
                  makeToolFailure(
                    "CheckpointPayloadInvalid",
                    "tool replay input is not a valid JSON object"
                  )
                )
              ),
              isError: true
            } satisfies ApprovedToolReplayResult
          }

          const bundle = yield* makeToolkit({
            agentId: params.agentId,
            sessionId: params.sessionId,
            conversationId: params.conversationId,
            turnId: replayTurnId,
            now: params.now,
            channelId: params.channelId,
            checkpointId: params.checkpointId,
            checkpointAction: "InvokeTool",
            userId: params.decidedBy
          })

          const toolkit = yield* bundle.toolkit.asEffect().pipe(
            Effect.provide(bundle.handlerLayer)
          )
          const toolkitUnsafe = toolkit as any

          const stream = yield* toolkitUnsafe.handle(
            replayPayload.toolName,
            parsedInput
          ).pipe(
            Effect.mapError(toToolFailure)
          )

          const execution = yield* Stream.runCollect(stream).pipe(
            Effect.map((chunks) => ({
              isError: false as const,
              outputJson: safeJsonStringify(chunks)
            })),
            Effect.catchTags({
              ToolFailureError: (failure: ToolFailureError) =>
                Effect.succeed({
                  isError: true as const,
                  outputJson: safeJsonStringify(toToolFailurePayload(failure))
                }),
              RequiresApprovalToolFailure: (failure: RequiresApprovalToolFailure) =>
                Effect.succeed({
                  isError: true as const,
                  outputJson: safeJsonStringify(toToolFailurePayload(failure))
                })
            })
          )

          return {
            turnId: replayTurnId,
            sessionId: params.sessionId,
            createdAt: params.now,
            replayPayloadVersion: replayPayload.replayPayloadVersion,
            toolName: replayPayload.toolName,
            inputJson: replayPayload.inputJson,
            outputJson: execution.outputJson,
            isError: execution.isError
          } satisfies ApprovedToolReplayResult
        })

      return {
        makeToolkit,
        executeApprovedCheckpointTool: executeApprovedCheckpointTool as ToolRegistryService["executeApprovedCheckpointTool"]
      } satisfies ToolRegistryService
    })
  }
) {
  static layer = Layer.effect(this, this.make)
}

const utf8ByteLength = (value: string): number =>
  new TextEncoder().encode(value).byteLength

const previewFromJsonString = (
  value: string,
  previewBytes: number
): string => {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  return decoder.decode(
    encoder.encode(value).slice(0, Math.max(1, previewBytes))
  )
}

const storeToolOutputIfLarge = (params: {
  readonly outputJson: string
  readonly outputBytes: number
  readonly thresholdBytes: number
  readonly previewBytes: number
  readonly context: ToolExecutionContext
  readonly turnId: TurnId
  readonly toolInvocationId: ToolInvocationId
  readonly artifactStore: Pick<ArtifactStorePort, "putBytes">
  readonly sessionArtifactPort: Pick<SessionArtifactPort, "link">
}): Effect.Effect<{ readonly storedOutputJson: string; readonly artifactBytes: number }> =>
  Effect.gen(function*() {
    if (params.outputBytes <= params.thresholdBytes) {
      return {
        storedOutputJson: params.outputJson,
        artifactBytes: 0
      } as const
    }

    const preview = previewFromJsonString(params.outputJson, params.previewBytes)
    const artifact = yield* params.artifactStore.putBytes(
      params.context.sessionId,
      "ToolResult",
      new TextEncoder().encode(params.outputJson),
      {
        mediaType: "application/json",
        previewText: preview
      }
    )
    yield* params.sessionArtifactPort.link(
      params.context.sessionId,
      artifact,
      "ToolResult",
      {
        turnId: params.turnId,
        toolInvocationId: params.toolInvocationId
      }
    )

    const envelope: ToolOutputArtifactEnvelope = {
      storage: "ArtifactRef",
      artifact,
      preview
    }

    return {
      storedOutputJson: safeJsonStringify(envelope),
      artifactBytes: artifact.bytes
    } as const
  })

const materializeStoredOutputJson = (
  storedOutputJson: string,
  artifactStore: Pick<ArtifactStorePort, "getBytes">
): Effect.Effect<string> =>
  Effect.gen(function*() {
    const parsed = safeJsonParseUnknown(storedOutputJson)
    if (!isToolOutputArtifactEnvelope(parsed)) {
      return storedOutputJson
    }
    const bytes = yield* artifactStore.getBytes(parsed.artifact.artifactId)
    return new TextDecoder().decode(bytes)
  })

const makeIdempotencyKey = (
  turnId: TurnId,
  iteration: number,
  toolName: ToolName,
  canonicalInputJson: string
): Effect.Effect<string> =>
  Effect.promise(() =>
    crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(`${turnId}:${iteration}:${toolName}:${canonicalInputJson}`)
    )
  ).pipe(
    Effect.map((buffer) => {
      const hex = Array.from(new Uint8Array(buffer), (b) => b.toString(16).padStart(2, "0")).join("")
      return `tool-idem:${hex}`
    })
  )

const clampMemoryLimit = (
  limit: number | undefined,
  memoryLimits: MemoryLimits
): number => {
  if (limit === undefined || !Number.isFinite(limit)) {
    return memoryLimits.defaultRetrieveLimit
  }
  return Math.min(Math.max(Math.floor(limit), 1), memoryLimits.maxRetrieveLimit)
}

const safeCalculate = (expression: string): number | null => {
  if (!/^[0-9+\-*/().\s]+$/.test(expression)) {
    return null
  }

  try {
    const evaluated = Number(
      Function(`"use strict"; return (${expression});`)()
    )
    return Number.isFinite(evaluated) ? evaluated : null
  } catch {
    return null
  }
}

const isToolFailurePayload = Schema.is(ToolFailurePayload)
const isToolOutputArtifactEnvelope = Schema.is(ToolOutputArtifactEnvelope)

const estimateFileTouchDelta = (toolName: ToolName): number =>
  String(toolName).startsWith("file_") ? 1 : 0

const isJsonRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

const toToolFailure = (error: unknown): ToolFailure => {
  if (error instanceof ToolFailureError || error instanceof RequiresApprovalToolFailure) {
    return error
  }

  const errorCode = (
      typeof error === "object"
      && error !== null
      && "errorCode" in error
      && typeof (error as { readonly errorCode?: unknown }).errorCode === "string"
    )
    ? (error as { readonly errorCode: string }).errorCode
    : "ToolInvocationError"

  const message = (
      typeof error === "object"
      && error !== null
      && "message" in error
      && typeof (error as { readonly message?: unknown }).message === "string"
    )
    ? (error as { readonly message: string }).message
    : error instanceof Error
    ? error.message
    : String(error)

  return makeToolFailure(errorCode, message)
}
