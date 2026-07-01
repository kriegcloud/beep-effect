/**
 * Tier-gate dispatch wrapper.
 *
 * `McpSchema.EnabledWhen` filters `tools/list` only — `tools/call` dispatch
 * never re-checks it (verified `McpServer.ts:255-262` vs. the shared
 * `filterByClient` helper at `McpServer.ts:1490-1512`, used generically by
 * every MCP list endpoint, not just `tools/list`). A client that already
 * knows a tool's name can call it even if that tool was filtered out of its
 * tool list. This module's dispatch wrapper is the real security boundary: a
 * `ClaimGate`-shaped (refusal-as-value, error channel `never`, fail-closed;
 * pattern: `packages/epistemic/use-cases/src/ClaimGate/ClaimGate.ports.ts:42-47`)
 * gate that wraps `tools/call` dispatch and produces a sanitized audit
 * record — shaped for the `UsageRecord.metadata` jsonb sink
 * (`packages/epistemic/domain/src/entities/UsageRecord/UsageRecord.model.ts:95-97`;
 * persistence wiring is consumer-side) — for every gated or refused call.
 *
 * The paired `enabledWhenApprovedTool` helper only ever affects `tools/list`
 * visibility; it must never be relied upon as the enforcement point.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $McpKitId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import { Context, DateTime, Effect } from "effect";
import * as S from "effect/Schema";
import * as McpSchema from "effect/unstable/ai/McpSchema";
import * as AiTool from "effect/unstable/ai/Tool";
import type * as O from "effect/Option";
import type * as P from "effect/Predicate";

const $I = $McpKitId.create("TierGate");

/**
 * Sanitized audit record written for every gated or refused `tools/call`
 * dispatch. Shaped as a plain JSON-serializable record so it can be stored
 * directly in the `UsageRecord.metadata` jsonb column; persistence wiring
 * belongs to the consumer.
 *
 * @example
 * ```ts
 * import * as O from "effect/Option"
 * import { TierGateAuditRecord } from "@beep/mcp-kit"
 *
 * const audit = TierGateAuditRecord.make({
 *   tool: "delete_document",
 *   reason: "Tool is destructive and not present in the approved-tools policy.",
 *   destructive: true,
 *   toolCallId: O.none(),
 *   occurredAt: "2026-07-01T00:00:00.000Z"
 * })
 * console.log(audit.tool)
 * // "delete_document"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class TierGateAuditRecord extends S.Class<TierGateAuditRecord>($I`TierGateAuditRecord`)(
  {
    tool: S.NonEmptyString.annotateKey({
      description: "Name of the refused tool.",
    }),
    reason: S.NonEmptyString.annotateKey({
      description: "Human-readable reason the dispatch was refused.",
    }),
    destructive: S.Boolean.annotateKey({
      description: "Whether the refused tool is annotated as destructive.",
    }),
    toolCallId: S.OptionFromNullOr(S.String).annotateKey({
      description: "Caller-supplied tool call identifier, when available.",
    }),
    occurredAt: S.NonEmptyString.annotateKey({
      description: "ISO-8601 timestamp at which the refusal was decided.",
    }),
  },
  $I.annote("TierGateAuditRecord", {
    description: "Sanitized audit record written for a gated or refused tools/call dispatch.",
  })
) {}

const TierGateVerdictTag = LiteralKit(["approved", "refused"]);

/**
 * Typed verdict returned by the tier gate, discriminated on `verdict`. An
 * `approved` call carries no audit record and proceeds to the tool handler;
 * a `refused` call carries the {@link TierGateAuditRecord} that documents why
 * dispatch was refused, and never proceeds to the tool handler.
 *
 * @example
 * ```ts
 * import { TierGateVerdict } from "@beep/mcp-kit"
 * import * as S from "effect/Schema"
 *
 * const verdict = S.decodeUnknownSync(TierGateVerdict)({ verdict: "approved" })
 * console.log(verdict.verdict)
 * // "approved"
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const TierGateVerdict = TierGateVerdictTag.toTaggedUnion("verdict")({
  approved: {},
  refused: { audit: TierGateAuditRecord },
}).pipe(
  $I.annoteSchema("TierGateVerdict", {
    description: "Typed approved/refused verdict returned by the tier gate.",
  })
);

/**
 * Runtime type for {@link TierGateVerdict}.
 *
 * @example
 * ```ts
 * import type { TierGateVerdict } from "@beep/mcp-kit"
 *
 * const approved: TierGateVerdict = { verdict: "approved" }
 * console.log(approved.verdict)
 * ```
 *
 * @category type-level
 * @since 0.0.0
 */
export type TierGateVerdict = typeof TierGateVerdict.Type;

/**
 * The minimal description of a `tools/call` dispatch the gate needs to
 * decide: the tool being invoked (carrying its `Tool.Destructive` and other
 * annotations) and an optional caller-supplied tool call identifier.
 *
 * @category models
 * @since 0.0.0
 */
export interface ToolCallRequest {
  readonly tool: AiTool.Any;
  readonly toolCallId: O.Option<string>;
}

/**
 * Service shape for the tier gate: evaluate a `tools/call` dispatch request
 * and return a typed approved/refused verdict. Refusal is a value
 * ({@link TierGateVerdict}), never an error — mirrors the `ClaimGate` total-
 * engine pattern.
 *
 * @example
 * ```ts
 * import { strictEqual } from "node:assert"
 * import { Effect } from "effect"
 * import type { TierGateShape } from "@beep/mcp-kit"
 *
 * const shape: TierGateShape = {
 *   evaluate: () => Effect.succeed({ verdict: "approved" })
 * }
 *
 * strictEqual(typeof shape.evaluate, "function")
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export interface TierGateShape {
  readonly evaluate: (request: ToolCallRequest) => Effect.Effect<TierGateVerdict>;
}

/**
 * Tier gate service tag.
 *
 * @example
 * ```ts
 * import { strictEqual } from "node:assert"
 * import { Effect } from "effect"
 * import { TierGate } from "@beep/mcp-kit"
 *
 * const hasEvaluate = Effect.runSync(
 *   Effect.gen(function* () {
 *     const gate = yield* TierGate
 *     return typeof gate.evaluate === "function"
 *   }).pipe(
 *     Effect.provideService(TierGate, TierGate.of({ evaluate: () => Effect.succeed({ verdict: "approved" }) }))
 *   )
 * )
 *
 * strictEqual(hasEvaluate, true)
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export class TierGate extends Context.Service<TierGate, TierGateShape>()($I`TierGate`) {}

/**
 * Policy consulted by {@link fromApprovedToolsPolicy}: the tool names
 * explicitly approved to dispatch regardless of their destructive
 * annotation.
 *
 * @example
 * ```ts
 * import { TierGatePolicy } from "@beep/mcp-kit"
 *
 * const policy = TierGatePolicy.make({ approvedTools: ["delete_document"] })
 * console.log(policy.approvedTools)
 * // ["delete_document"]
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class TierGatePolicy extends S.Class<TierGatePolicy>($I`TierGatePolicy`)(
  {
    approvedTools: S.Array(S.String).annotateKey({
      description: "Tool names explicitly approved to dispatch regardless of their destructive annotation.",
    }),
  },
  $I.annote("TierGatePolicy", {
    description: "Policy consulted by fromApprovedToolsPolicy: tool names explicitly approved to dispatch.",
  })
) {}

const isDestructive = (tool: AiTool.Any): boolean => Context.get(tool.annotations, AiTool.Destructive);

const isPolicyApproved = (policy: TierGatePolicy, tool: AiTool.Any): boolean =>
  !isDestructive(tool) || policy.approvedTools.includes(tool.name);

/**
 * Builds a fail-closed {@link TierGateShape} from an approved-tools policy.
 * Read-only/non-destructive tools (per `Tool.Destructive`) always pass;
 * destructive tools pass only when explicitly named in
 * `policy.approvedTools`. Anything else is refused with a
 * {@link TierGateAuditRecord}.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as O from "effect/Option"
 * import { Tool } from "effect/unstable/ai"
 * import { fromApprovedToolsPolicy } from "@beep/mcp-kit"
 *
 * const writeTool = Tool.make("delete_document").annotate(Tool.Destructive, true)
 * const gate = fromApprovedToolsPolicy({ approvedTools: [] })
 *
 * const verdict = Effect.runSync(gate.evaluate({ tool: writeTool, toolCallId: O.none() }))
 * console.log(verdict.verdict)
 * // "refused"
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const fromApprovedToolsPolicy = (policy: TierGatePolicy): TierGateShape => ({
  evaluate: (request) =>
    isPolicyApproved(policy, request.tool)
      ? Effect.succeed(TierGateVerdict.make({ verdict: "approved" }))
      : Effect.map(DateTime.now, (now) =>
          TierGateVerdict.make({
            verdict: "refused",
            audit: TierGateAuditRecord.make({
              tool: request.tool.name,
              reason: "Tool is destructive and not present in the approved-tools policy.",
              destructive: true,
              toolCallId: request.toolCallId,
              occurredAt: DateTime.formatIso(now),
            }),
          })
        ),
});

/**
 * The result of dispatching a `tools/call` request through the tier gate:
 * `Dispatched` when the gate approved the call and the wrapped effect ran,
 * carrying its result; `Refused` when the gate refused fail-closed, carrying
 * the sanitized audit record. The wrapped effect never runs on the refused
 * path.
 *
 * @category models
 * @since 0.0.0
 */
export type TierGateDispatchResult<A> =
  | { readonly _tag: "Dispatched"; readonly value: A }
  | { readonly _tag: "Refused"; readonly audit: TierGateAuditRecord };

/**
 * Wraps a `tools/call` dispatch effect with the tier gate. Evaluates the
 * gate first; on `refused`, the wrapped effect never runs and the refusal
 * (with its audit record) is returned as a value. On `approved`, the wrapped
 * effect runs and its result is returned as a value. The gate's own
 * evaluation never fails; the wrapper's error channel is exactly the wrapped
 * effect's error channel.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as O from "effect/Option"
 * import { Tool } from "effect/unstable/ai"
 * import { dispatchWithTierGate, fromApprovedToolsPolicy, TierGate } from "@beep/mcp-kit"
 *
 * const writeTool = Tool.make("delete_document").annotate(Tool.Destructive, true)
 * const gate = fromApprovedToolsPolicy({ approvedTools: [] })
 *
 * const program = dispatchWithTierGate(
 *   { tool: writeTool, toolCallId: O.none() },
 *   Effect.succeed("deleted")
 * ).pipe(Effect.provideService(TierGate, TierGate.of(gate)))
 *
 * const result = Effect.runSync(program)
 * console.log(result._tag)
 * // "Refused"
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const dispatchWithTierGate = Effect.fn("dispatchWithTierGate")(function* <A, E, R>(
  request: ToolCallRequest,
  onApproved: Effect.Effect<A, E, R>
) {
  const gate = yield* TierGate;
  const verdict = yield* gate.evaluate(request);
  if (verdict.verdict === "approved") {
    const value = yield* onApproved;
    return { _tag: "Dispatched", value } as const;
  }
  return { _tag: "Refused", audit: verdict.audit } as const;
});

/**
 * Annotates a tool with `McpSchema.EnabledWhen`, hiding it from `tools/list`
 * when the approved-tools policy would refuse it. **This affects list
 * visibility only** — `tools/call` dispatch never re-checks
 * `EnabledWhen` (verified `McpServer.ts:255-262`). Always pair this with
 * {@link dispatchWithTierGate}, which is the real enforcement boundary.
 *
 * @example
 * ```ts
 * import { Tool } from "effect/unstable/ai"
 * import { withEnabledWhenApprovedTool } from "@beep/mcp-kit"
 *
 * const writeTool = Tool.make("delete_document").annotate(Tool.Destructive, true)
 * const listed = withEnabledWhenApprovedTool(writeTool, { approvedTools: [] })
 * console.log(listed.name)
 * // "delete_document"
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const withEnabledWhenApprovedTool = <T extends AiTool.Any>(tool: T, policy: TierGatePolicy): T => {
  const predicate: P.Predicate<unknown> = () => isPolicyApproved(policy, tool);
  // `Tool#annotate` returns the widened `Tool<Name, Config, Requirements>`
  // shape rather than the caller's specific `T`; the annotation itself does
  // not change `Name`/`Config`/`Requirements`, so re-narrowing here is sound.
  return tool.annotate(McpSchema.EnabledWhen, predicate as never) as T;
};
