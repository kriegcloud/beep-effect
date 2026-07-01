/**
 * Batched repair for assistant blocks that failed streamed validation.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { AssistantBlock } from "@beep/agents-domain/values/AssistantContent";
import { IndexedBlock } from "@beep/agents-use-cases/public";
import { BlockRepairFailed } from "@beep/agents-use-cases/server";
import { generateAnthropicToolJson } from "@beep/anthropic";
import { make } from "@beep/identity";
import { redactString } from "@beep/observability";
import { Effect, JsonPatch, Metric } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { AnthropicStructuredOutput, Tool, Toolkit } from "effect/unstable/ai";
import { assistantBlockOutput } from "./AnthropicTurnCodec.ts";
import type { RepairError } from "@beep/anthropic";

const { $AgentsServerId } = make("agents-server");
const $I = $AgentsServerId.create("AssistantTurn/BlockRepair");

const REPAIR_ATTEMPTS = 2;

const REPAIR_SYSTEM = A.join(
  [
    "You repair invalid rich-text blocks from a structured-output pipeline.",
    "For each numbered failure you receive the original block JSON and the validation issue.",
    "Call the repair tool with a corrected block for every listed index, echoing each index unchanged.",
    "Preserve the author's intent and change only what the issue requires.",
  ],
  " "
);

const blocksRepaired = Metric.counter("agents_assistant_turn_blocks_repaired_total", {
  description: "Assistant-turn block repair outcomes",
  incremental: true,
});

/**
 * Validation issue report for one streamed assistant-block slice.
 *
 * @example
 * ```ts
 * import { IssueReport } from "@beep/agents-server/AssistantTurn"
 *
 * const report = IssueReport.make({
 *   index: 0,
 *   raw: "{\"type\":\"paragraph\"}",
 *   report: "children is missing",
 * })
 * console.log(report.index)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class IssueReport extends S.Class<IssueReport>($I`IssueReport`)(
  {
    index: S.Finite.annotateKey({ description: "Original block index in the assistant turn envelope." }),
    raw: S.String.annotateKey({ description: "The raw JSON slice that failed validation." }),
    report: S.String.annotateKey({ description: "Validation issue that caused the slice to be held for repair." }),
  },
  $I.annote("IssueReport", {
    description: "Validation issue report for one streamed assistant-block slice.",
  })
) {}

class RepairItem extends S.Class<RepairItem>($I`RepairItem`)(
  {
    index: S.Finite.annotateKey({ description: "Original failure index echoed unchanged." }),
    block: AssistantBlock,
  },
  $I.annote("RepairItem", {
    description: "One corrected assistant block returned by the repair tool.",
  })
) {}

class RepairEnvelope extends S.Class<RepairEnvelope>($I`RepairEnvelope`)(
  {
    repairs: S.Array(RepairItem).annotateKey({ description: "Corrected blocks for listed failure indices." }),
  },
  $I.annote("RepairEnvelope", {
    description: "Repair tool response envelope.",
  })
) {}

class RepairAttemptState extends S.Class<RepairAttemptState>($I`RepairAttemptState`)(
  {
    pending: S.Array(IssueReport),
    repaired: S.Array(IndexedBlock),
  },
  $I.annote("RepairAttemptState", {
    description: "Accumulator for unrepaired failures and accepted repaired blocks across repair attempts.",
  })
) {}
interface RepairAttemptState {
  readonly pending: ReadonlyArray<IssueReport>;
  readonly repaired: ReadonlyArray<IndexedBlock>;
}

/**
 * Provider call used by {@link makeRepairInvalidBlocks} to obtain repair tool
 * parameters for a batch of invalid block slices.
 *
 * @remarks
 * `attempt` is one-based and never exceeds the adapter retry limit. The call
 * returns the raw repair-tool parameters JSON; envelope validation, per-block
 * decoding, unexpected indices, and dropped repairs remain the adapter's
 * responsibility.
 *
 * @example
 * ```ts
 * import { IssueReport } from "@beep/agents-server/AssistantTurn"
 * import type { BlockRepairCall } from "@beep/agents-server/AssistantTurn"
 * import { Effect } from "effect"
 *
 * const issue = IssueReport.make({
 *   index: 0,
 *   raw: '{"type":"paragraph","children":[{"type":"text","text":1}]}',
 *   report: "/children/0/text Expected string",
 * })
 * const callRepair: BlockRepairCall = (pending, attempt) =>
 *   Effect.succeed(
 *     `{"repairs":[{"index":${pending[0]?.index ?? 0},"block":{"type":"paragraph","children":[{"type":"text","text":"Fixed on attempt ${attempt}"}]}}]}`
 *   )
 *
 * Effect.runPromise(callRepair([issue], 1)).then((paramsJson) =>
 *   console.log(paramsJson.includes("Fixed")) // true
 * )
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export type BlockRepairCall = (
  pending: ReadonlyArray<IssueReport>,
  attempt: number
) => Effect.Effect<string, RepairError>;

/**
 * Repair function shape used by the Anthropic turn kernel after streamed block
 * validation has collected one or more failures.
 *
 * @remarks
 * The returned effect succeeds with repaired indexed blocks only. Missing,
 * duplicated, unexpected, or still-invalid tool results are handled by the
 * adapter and do not escape as successful blocks; repair-call failures are
 * represented by `BlockRepairFailed`.
 *
 * @example
 * ```ts
 * import { IssueReport, makeRepairInvalidBlocks } from "@beep/agents-server/AssistantTurn"
 * import type { RepairInvalidBlocks } from "@beep/agents-server/AssistantTurn"
 * import { Effect } from "effect"
 *
 * const repair: RepairInvalidBlocks = makeRepairInvalidBlocks(() =>
 *   Effect.succeed(
 *     '{"repairs":[{"index":0,"block":{"type":"paragraph","children":[{"type":"text","text":"Fixed"}]}}]}'
 *   )
 * )
 * const issue = IssueReport.make({
 *   index: 0,
 *   raw: '{"type":"paragraph","children":[{"type":"text","text":1}]}',
 *   report: "/children/0/text Expected string",
 * })
 *
 * Effect.runPromise(repair([issue])).then((blocks) => console.log(blocks[0]?.block.type)) // "paragraph"
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export type RepairInvalidBlocks = (
  failures: ReadonlyArray<IssueReport>
) => Effect.Effect<ReadonlyArray<IndexedBlock>, BlockRepairFailed>;

const repairOutput = AnthropicStructuredOutput.toCodecAnthropic(RepairEnvelope);

const RepairTool = Tool.make("repair", {
  description: "Deliver corrected blocks for the listed failure indices. You MUST respond with a JSON object.",
  parameters: RepairEnvelope,
}).annotate(Tool.Strict, false);

const RepairToolkit = Toolkit.make(RepairTool);

const decodeEnvelopeJson = S.decodeUnknownEffect(S.fromJsonString(repairOutput.codec));
const decodeJsonString = S.decodeUnknownEffect(S.fromJsonString(S.Json));
const decodeJsonValue = S.decodeUnknownEffect(S.Json);
const decodeRepairedBlock = S.decodeUnknownEffect(assistantBlockOutput.codec);
const encodeBlock = S.encodeUnknownEffect(AssistantBlock);

const failureSection = (failure: IssueReport): string =>
  A.join(
    [`### Failure index ${failure.index}`, "Original block JSON:", failure.raw, "Validation issue:", failure.report],
    "\n"
  );

const defaultRepairCall: BlockRepairCall = (pending, attempt) =>
  generateAnthropicToolJson({
    prompt: [
      { role: "system", content: REPAIR_SYSTEM },
      {
        role: "user",
        content: A.join(
          [`Repair attempt ${attempt} of ${REPAIR_ATTEMPTS}.`, A.join(A.map(pending, failureSection), "\n\n")],
          "\n\n"
        ),
      },
    ],
    toolkit: RepairToolkit,
    toolChoice: { tool: "repair" },
  });

const toBlockRepairFailed = (message: string): BlockRepairFailed => BlockRepairFailed.make({ message });

const PATCH_PATH_LIMIT = 128;

interface PatchOpSummary {
  readonly op: JsonPatch.JsonPatchOperation["op"];
  readonly path: string;
}

// Summarize a JSON patch into non-sensitive structural metadata: the operation
// count and, per operation, the op kind plus a redacted/truncated JSON Pointer.
// The `value` field of add/replace operations carries repaired assistant content
// and is intentionally never logged.
const summarizePatch = (
  patch: JsonPatch.JsonPatch
): { readonly operations: number; readonly ops: ReadonlyArray<PatchOpSummary> } => ({
  operations: A.length(patch),
  ops: A.map(patch, (operation) => ({ op: operation.op, path: redactString(operation.path, PATCH_PATH_LIMIT) })),
});

const trackRepairOutcome = (outcome: "call_failed" | "dropped" | "repaired", count: number): Effect.Effect<void> =>
  count === 0 ? Effect.void : Metric.update(Metric.withAttributes(blocksRepaired, { outcome }), count);

const requestRepairEnvelope = (
  callRepair: BlockRepairCall,
  pending: ReadonlyArray<IssueReport>,
  attempt: number
): Effect.Effect<RepairEnvelope, BlockRepairFailed> =>
  callRepair(pending, attempt).pipe(
    Effect.tapError((error) =>
      Effect.logWarning("assistant-turn block repair call failed", {
        attempt,
        detail: error,
      })
    ),
    Effect.mapError((error) => toBlockRepairFailed(`Block repair call failed: ${error.message}`)),
    Effect.flatMap((paramsJson) =>
      decodeEnvelopeJson(paramsJson).pipe(
        Effect.mapError((error) => toBlockRepairFailed(`Block repair envelope failed validation: ${error.message}`))
      )
    )
  );

const repairItemToIndexed = Effect.fn("repairItemToIndexed")(function* (
  pending: ReadonlyArray<IssueReport>,
  item: RepairItem
): Effect.fn.Return<O.Option<IndexedBlock>> {
  const failure = A.findFirst(pending, (candidate) => candidate.index === item.index);
  if (O.isNone(failure)) {
    yield* Effect.logWarning("assistant-turn block repair ignored unexpected index", { index: item.index });
    return O.none<IndexedBlock>();
  }

  const encodedUnknown = yield* encodeBlock(item.block).pipe(
    Effect.map(O.some),
    Effect.catch((error) =>
      Effect.logWarning("assistant-turn block repair failed to encode returned block", {
        index: item.index,
        detail: error.message,
      }).pipe(Effect.as(O.none<typeof AssistantBlock.Encoded>()))
    )
  );
  if (O.isNone(encodedUnknown)) {
    return O.none<IndexedBlock>();
  }

  const encodedJson = yield* decodeJsonValue(encodedUnknown.value).pipe(
    Effect.map(O.some),
    Effect.catch((error) =>
      Effect.logWarning("assistant-turn block repair returned non-json block", {
        index: item.index,
        detail: error.message,
      }).pipe(Effect.as(O.none<S.Json>()))
    )
  );
  if (O.isNone(encodedJson)) {
    return O.none<IndexedBlock>();
  }

  const checked = yield* decodeRepairedBlock(encodedJson.value).pipe(
    Effect.map(O.some),
    Effect.catch((error) =>
      Effect.logWarning("assistant-turn block repair returned codec-invalid block", {
        index: item.index,
        detail: error.message,
      }).pipe(Effect.as(O.none<AssistantBlock>()))
    )
  );
  if (O.isNone(checked)) {
    return O.none<IndexedBlock>();
  }

  yield* decodeJsonString(failure.value.raw).pipe(
    Effect.matchEffect({
      onFailure: (error) =>
        Effect.logWarning("assistant-turn block repaired without original patch", {
          index: item.index,
          detail: error.message,
        }),
      onSuccess: (originalJson) => {
        const patch = JsonPatch.get(originalJson, encodedJson.value);
        return A.isReadonlyArrayEmpty(patch)
          ? Effect.logInfo("assistant-turn block repaired without structural patch", { index: item.index })
          : Effect.logInfo("assistant-turn block repaired", { index: item.index, ...summarizePatch(patch) });
      },
    })
  );
  return O.some<IndexedBlock>({ block: checked.value, index: item.index });
});

const containsIndexedBlock = (blocks: ReadonlyArray<IndexedBlock>, index: number): boolean =>
  A.some(blocks, (block) => block.index === index);

const deduplicateIndexedBlocks = (blocks: ReadonlyArray<IndexedBlock>): ReadonlyArray<IndexedBlock> =>
  A.reduce(blocks, A.empty<IndexedBlock>(), (deduplicated, block) =>
    containsIndexedBlock(deduplicated, block.index) ? deduplicated : A.append(deduplicated, block)
  );

const attemptRepairs = (
  callRepair: BlockRepairCall,
  pending: ReadonlyArray<IssueReport>,
  attempt: number
): Effect.Effect<ReadonlyArray<IndexedBlock>, BlockRepairFailed> =>
  requestRepairEnvelope(callRepair, pending, attempt).pipe(
    Effect.flatMap((envelope) =>
      Effect.forEach(envelope.repairs, (item) => repairItemToIndexed(pending, item), { concurrency: 1 })
    ),
    Effect.map(A.getSomes),
    Effect.map(deduplicateIndexedBlocks)
  );

const runRepairAttempts = Effect.fn("runRepairAttempts")(function* (
  callRepair: BlockRepairCall,
  pending: ReadonlyArray<IssueReport>,
  repaired: ReadonlyArray<IndexedBlock>,
  attempt: number
): Effect.fn.Return<RepairAttemptState, BlockRepairFailed> {
  if (attempt > REPAIR_ATTEMPTS || A.isReadonlyArrayEmpty(pending)) {
    return { pending, repaired };
  }

  const fixed = yield* attemptRepairs(callRepair, pending, attempt).pipe(
    Effect.tapError(() =>
      Effect.all(
        [trackRepairOutcome("repaired", A.length(repaired)), trackRepairOutcome("call_failed", A.length(pending))],
        { discard: true }
      )
    )
  );
  const fixedIndices = A.map(fixed, (item) => item.index);
  const remaining = A.filter(pending, (failure) => !A.contains(fixedIndices, failure.index));
  return yield* runRepairAttempts(callRepair, remaining, A.appendAll(repaired, fixed), attempt + 1);
});

/**
 * Build a retrying invalid-block repair function from a provider call.
 *
 * @remarks
 * The returned repair function makes at most two sequential repair attempts.
 * It keeps the first accepted repair per index, ignores unexpected indices,
 * logs codec-invalid tool results, records repair metrics, and drops failures
 * that remain pending after the retry budget. A failed provider call or
 * malformed repair envelope fails the effect with `BlockRepairFailed`.
 *
 * @example
 * ```ts
 * import { IssueReport, makeRepairInvalidBlocks } from "@beep/agents-server/AssistantTurn"
 * import { Effect } from "effect"
 *
 * const repair = makeRepairInvalidBlocks(() =>
 *   Effect.succeed(
 *     '{"repairs":[{"index":0,"block":{"type":"paragraph","children":[{"type":"text","text":"Fixed"}]}}]}'
 *   )
 * )
 * const issue = IssueReport.make({
 *   index: 0,
 *   raw: '{"type":"paragraph","children":[{"type":"text","text":1}]}',
 *   report: "/children/0/text Expected string",
 * })
 *
 * Effect.runPromise(repair([issue])).then((blocks) => console.log(blocks.length)) // 1
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const makeRepairInvalidBlocks = (callRepair: BlockRepairCall = defaultRepairCall): RepairInvalidBlocks =>
  Effect.fn("agents.assistant_turn.block_repair")(function* (failures) {
    if (A.isReadonlyArrayEmpty(failures)) {
      return A.empty<IndexedBlock>();
    }

    const result = yield* runRepairAttempts(callRepair, failures, A.empty<IndexedBlock>(), 1);

    yield* trackRepairOutcome("repaired", A.length(result.repaired));
    if (!A.isReadonlyArrayEmpty(result.pending)) {
      yield* trackRepairOutcome("dropped", A.length(result.pending));
      yield* Effect.logWarning("assistant-turn dropping unrepairable blocks", {
        indices: A.map(result.pending, (failure) => failure.index),
      });
    }

    return result.repaired;
  });

/**
 * Default Anthropic-backed invalid-block repair function.
 *
 * @remarks
 * Non-empty failure batches call the Anthropic repair tool with redacted,
 * structured failure reports. Empty batches return immediately without a
 * provider call, which is useful for branch-free repair tails.
 *
 * @example
 * ```ts
 * import { repairInvalidBlocks } from "@beep/agents-server/AssistantTurn"
 * import { Effect } from "effect"
 *
 * Effect.runPromise(repairInvalidBlocks([])).then((blocks) => console.log(blocks.length)) // 0
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const repairInvalidBlocks = makeRepairInvalidBlocks();
