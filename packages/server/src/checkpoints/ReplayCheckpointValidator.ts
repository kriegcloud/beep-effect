import type { CheckpointId } from "@template/domain/ids"
import {
  InvokeToolReplayPayload,
  ReadMemoryReplayPayload,
  type CheckpointPort,
  type CheckpointRecord,
  type ContentBlock
} from "@template/domain/ports"
import type { CheckpointAction } from "@template/domain/status"
import { Effect, Schema } from "effect"
import { decodeUnknownJsonOption } from "../json/JsonStringCodecs.js"
import { canonicalJsonStringify, makeCheckpointPayloadHash } from "./ReplayHash.js"

export type ReplayCheckpointValidationReason =
  | "checkpoint_not_approved"
  | "checkpoint_payload_invalid"
  | "checkpoint_payload_mismatch"

export interface ReplayCheckpointValidationError {
  readonly reason: ReplayCheckpointValidationReason
  readonly detail: string
}

export interface ReplayTurnContextExpectation {
  readonly agentId: string
  readonly sessionId: string
  readonly conversationId: string
  readonly channelId: string
}

const decodeReplayPayloadJson = decodeUnknownJsonOption
const decodeInvokeToolReplayPayload = Schema.decodeUnknownOption(InvokeToolReplayPayload)
const decodeReadMemoryReplayPayload = Schema.decodeUnknownOption(ReadMemoryReplayPayload)

const fail = (
  reason: ReplayCheckpointValidationReason,
  detail: string
): Effect.Effect<never, ReplayCheckpointValidationError> =>
  Effect.fail({ reason, detail })

const loadApprovedCheckpoint = (params: {
  readonly checkpointPort: Pick<CheckpointPort, "get">
  readonly checkpointId: CheckpointId
  readonly action: CheckpointAction
}): Effect.Effect<CheckpointRecord, ReplayCheckpointValidationError> =>
  Effect.gen(function*() {
    const checkpoint = yield* params.checkpointPort.get(params.checkpointId)
    if (checkpoint === null) {
      return yield* fail("checkpoint_not_approved", "checkpoint_not_found")
    }
    if (checkpoint.status !== "Approved") {
      return yield* fail("checkpoint_not_approved", `checkpoint_status_${checkpoint.status}`)
    }
    if (checkpoint.action !== params.action) {
      return yield* fail("checkpoint_not_approved", `checkpoint_action_${checkpoint.action}`)
    }
    return checkpoint
  })

const validateTurnContext = (params: {
  readonly expected: ReplayTurnContextExpectation | undefined
  readonly payloadContext: {
    readonly agentId: string
    readonly sessionId: string
    readonly conversationId: string
    readonly channelId: string
  }
}): Effect.Effect<void, ReplayCheckpointValidationError> => {
  if (params.expected === undefined) {
    return Effect.void
  }
  if (
    params.expected.agentId !== params.payloadContext.agentId
    || params.expected.sessionId !== params.payloadContext.sessionId
    || params.expected.conversationId !== params.payloadContext.conversationId
    || params.expected.channelId !== params.payloadContext.channelId
  ) {
    return fail("checkpoint_payload_mismatch", "turn_context_mismatch")
  }
  return Effect.void
}

export const validateInvokeToolCheckpoint = (params: {
  readonly checkpointPort: Pick<CheckpointPort, "get">
  readonly checkpointId: CheckpointId
  readonly expectedTurnContext?: ReplayTurnContextExpectation
  readonly expectedToolName?: string
  readonly expectedInputJson?: string
}): Effect.Effect<
  { readonly checkpoint: CheckpointRecord; readonly payload: typeof InvokeToolReplayPayload.Type },
  ReplayCheckpointValidationError
> =>
  Effect.gen(function*() {
    const checkpoint = yield* loadApprovedCheckpoint({
      checkpointPort: params.checkpointPort,
      checkpointId: params.checkpointId,
      action: "InvokeTool"
    })

    const parsedJson = decodeReplayPayloadJson(checkpoint.payloadJson)
    if (parsedJson._tag === "None") {
      return yield* fail("checkpoint_payload_invalid", "payload_not_json")
    }

    const decodedPayload = decodeInvokeToolReplayPayload(parsedJson.value)
    if (decodedPayload._tag === "None") {
      return yield* fail("checkpoint_payload_invalid", "payload_schema_invoke_tool")
    }

    const expectedHash = yield* makeCheckpointPayloadHash(
      "InvokeTool",
      Schema.encodeSync(InvokeToolReplayPayload)(decodedPayload.value)
    )
    if (expectedHash !== checkpoint.payloadHash) {
      return yield* fail("checkpoint_payload_mismatch", "payload_hash_mismatch")
    }

    yield* validateTurnContext({
      expected: params.expectedTurnContext,
      payloadContext: decodedPayload.value.turnContext
    })

    if (
      params.expectedToolName !== undefined
      && decodedPayload.value.toolName !== params.expectedToolName
    ) {
      return yield* fail("checkpoint_payload_mismatch", "tool_name_mismatch")
    }
    if (
      params.expectedInputJson !== undefined
      && decodedPayload.value.inputJson !== params.expectedInputJson
    ) {
      return yield* fail("checkpoint_payload_mismatch", "tool_input_mismatch")
    }

    return {
      checkpoint,
      payload: decodedPayload.value
    } as const
  })

export const validateReadMemoryCheckpoint = (params: {
  readonly checkpointPort: Pick<CheckpointPort, "get">
  readonly checkpointId: CheckpointId
  readonly expectedTurnContext?: ReplayTurnContextExpectation
  readonly expectedContent?: string
  readonly expectedContentBlocks?: ReadonlyArray<ContentBlock>
}): Effect.Effect<
  { readonly checkpoint: CheckpointRecord; readonly payload: typeof ReadMemoryReplayPayload.Type },
  ReplayCheckpointValidationError
> =>
  Effect.gen(function*() {
    const checkpoint = yield* loadApprovedCheckpoint({
      checkpointPort: params.checkpointPort,
      checkpointId: params.checkpointId,
      action: "ReadMemory"
    })

    const parsedJson = decodeReplayPayloadJson(checkpoint.payloadJson)
    if (parsedJson._tag === "None") {
      return yield* fail("checkpoint_payload_invalid", "payload_not_json")
    }

    const decodedPayload = decodeReadMemoryReplayPayload(parsedJson.value)
    if (decodedPayload._tag === "None") {
      return yield* fail("checkpoint_payload_invalid", "payload_schema_read_memory")
    }

    const expectedHash = yield* makeCheckpointPayloadHash(
      "ReadMemory",
      Schema.encodeSync(ReadMemoryReplayPayload)(decodedPayload.value)
    )
    if (expectedHash !== checkpoint.payloadHash) {
      return yield* fail("checkpoint_payload_mismatch", "payload_hash_mismatch")
    }

    yield* validateTurnContext({
      expected: params.expectedTurnContext,
      payloadContext: decodedPayload.value.turnContext
    })

    if (
      params.expectedContent !== undefined
      && decodedPayload.value.content !== params.expectedContent
    ) {
      return yield* fail("checkpoint_payload_mismatch", "content_mismatch")
    }

    if (
      params.expectedContentBlocks !== undefined
      && canonicalJsonStringify(decodedPayload.value.contentBlocks)
        !== canonicalJsonStringify(params.expectedContentBlocks)
    ) {
      return yield* fail("checkpoint_payload_mismatch", "content_blocks_mismatch")
    }

    return {
      checkpoint,
      payload: decodedPayload.value
    } as const
  })

export const toCheckpointToolFailure = (
  failure: ReplayCheckpointValidationError
): { readonly errorCode: string; readonly message: string } => {
  switch (failure.reason) {
    case "checkpoint_not_approved":
      return {
        errorCode: "CheckpointNotApproved",
        message: failure.detail
      }
    case "checkpoint_payload_invalid":
      return {
        errorCode: "CheckpointPayloadInvalid",
        message: failure.detail
      }
    case "checkpoint_payload_mismatch":
      return {
        errorCode: "CheckpointPayloadMismatch",
        message: failure.detail
      }
  }
}

export const toCheckpointFailureReason = (
  failure: ReplayCheckpointValidationError
): string =>
  failure.reason
