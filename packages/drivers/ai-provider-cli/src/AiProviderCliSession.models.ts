/**
 * Managed subscription CLI session boundaries.
 * @packageDocumentation
 * @since 0.0.0
 */
import { $AiProviderCliId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

const $I = $AiProviderCliId.create("AiProviderCliSession.models");

/**
 * Native runtimes recognized by managed communication adapters.
 * **Example** (Inspect a supported runtime)
 * ```ts
 * import { ManagedProvider } from "@beep/ai-provider-cli"
 * console.log(ManagedProvider.make("codex"))
 * ```
 * @category schemas
 * @since 0.0.0
 */
export const ManagedProvider = LiteralKit(["codex", "grok", "claude", "cursor"]).annotate(
  $I.annote("ManagedProvider", { description: "Native managed runtime identifiers." })
);
/**
 * Runtime selected at the native boundary.
 * @category type-level
 * @since 0.0.0
 */
export type ManagedProvider = typeof ManagedProvider.Type;

/**
 * Explicit stdio messaging tool server configured only for an owned session.
 * **Example** (Describe an owned tool executable)
 * ```ts
 * import { ManagedToolServer } from "@beep/ai-provider-cli"
 * const server = ManagedToolServer.make({ name: "peer", command: "beep-cli", args: [], env: {} })
 * console.log(server.name)
 * ```
 * @category models
 * @since 0.0.0
 */
export class ManagedToolServer extends S.Opaque<ManagedToolServer, { readonly brand: unique symbol }>()(
  S.Struct({
    name: S.NonEmptyString,
    command: S.NonEmptyString,
    args: S.Array(S.String),
    env: S.Record(S.String, S.String),
  }).pipe(
    $I.annoteSchema("ManagedToolServer", {
      description: "Owned stdio MCP endpoint; grants and secrets travel through private files or environment.",
    })
  )
) {}

/**
 * Explicit isolated launch inputs supplied by the owning controller.
 * **Details**
 * Environment replaces inheritance. The controller prepares the private profile
 * and existing subscription auth references; this driver does not copy credentials.
 * **Example** (Inspect an owned profile)
 * ```ts
 * import { ManagedLaunchProfile } from "@beep/ai-provider-cli"
 * const profile = ManagedLaunchProfile.make({ provider: "codex", executable: "codex", prefixArgs: [], workspace: "/owned/work", profileRoot: "/owned/home", env: { HOME: "/owned/home", CODEX_HOME: "/owned/home/.codex", PATH: "/usr/bin" }, authLane: "existing-subscription", tools: [] })
 * console.log(profile.provider)
 * ```
 * @category models
 * @since 0.0.0
 */
export class ManagedLaunchProfile extends S.Opaque<ManagedLaunchProfile, { readonly brand: unique symbol }>()(
  S.Struct({
    provider: ManagedProvider,
    executable: S.NonEmptyString,
    prefixArgs: S.Array(S.String),
    workspace: S.NonEmptyString,
    profileRoot: S.NonEmptyString,
    env: S.Record(S.String, S.String),
    authLane: S.Literal("existing-subscription"),
    tools: S.Array(ManagedToolServer),
    sandboxWritablePaths: S.Array(S.NonEmptyString).pipe(
      S.withConstructorDefault(Effect.succeed([])),
      S.withDecodingDefaultTypeKey(Effect.succeed([]))
    ),
  }).pipe(
    $I.annoteSchema("ManagedLaunchProfile", {
      description: "Controller-prepared private profile, approved auth lane and session-only MCP configuration.",
    })
  )
) {}

/**
 * Effective model and permission facts captured before the first prompt.
 * **Example** (Inspect confirmed identity)
 * ```ts
 * import { ManagedSessionIdentity } from "@beep/ai-provider-cli"
 * const identity = ManagedSessionIdentity.make({ provider: "grok", sessionId: "owned", model: "grok-4.7", effort: "medium", policy: "plan/read-only", policyEvidence: "launch-enforced" })
 * console.log(identity.model)
 * ```
 * @category models
 * @since 0.0.0
 */
export class ManagedSessionIdentity extends S.Opaque<ManagedSessionIdentity, { readonly brand: unique symbol }>()(
  S.Struct({
    provider: ManagedProvider,
    sessionId: S.NonEmptyString,
    model: S.NonEmptyString,
    effort: S.Literal("medium"),
    policy: S.NonEmptyString,
    policyEvidence: S.Literals(["runtime-reported", "launch-enforced"]),
  }).pipe(
    $I.annoteSchema("ManagedSessionIdentity", {
      description: "Runtime identity with explicit permission provenance, distinct from app attachment.",
    })
  )
) {}

/**
 * Correlated synthetic or authorized message submitted to one managed session.
 * **Example** (Construct a message)
 * ```ts
 * import { ManagedSessionMessage } from "@beep/ai-provider-cli"
 * console.log(ManagedSessionMessage.make({ messageId: "request-1", text: "Reply to the owned peer" }).messageId)
 * ```
 * @category models
 * @since 0.0.0
 */
export class ManagedSessionMessage extends S.Opaque<ManagedSessionMessage, { readonly brand: unique symbol }>()(
  S.Struct({ messageId: S.NonEmptyString, text: S.NonEmptyString }).pipe(
    $I.annoteSchema("ManagedSessionMessage", { description: "Correlated message data; it never grants authority." })
  )
) {}

/**
 * A steering request fenced to the observed active provider turn.
 * **Example** (Target an observed turn)
 * ```ts
 * import { ManagedSessionSteering, ManagedSessionMessage } from "@beep/ai-provider-cli"
 * console.log(ManagedSessionSteering.make({ expectedTurnId: "turn-1", message: ManagedSessionMessage.make({ messageId: "steer-1", text: "Finish the current reply" }) }).expectedTurnId)
 * ```
 * @category models
 * @since 0.0.0
 */
export class ManagedSessionSteering extends S.Opaque<ManagedSessionSteering, { readonly brand: unique symbol }>()(
  S.Struct({ expectedTurnId: S.NonEmptyString, message: ManagedSessionMessage }).pipe(
    $I.annoteSchema("ManagedSessionSteering", {
      description: "Active-turn steering never queues behind a different turn.",
    })
  )
) {}

/**
 * Observed model response and terminal stop reason.
 * **Example** (Inspect terminal response)
 * ```ts
 * import { ManagedTurnResult } from "@beep/ai-provider-cli"
 * console.log(ManagedTurnResult.make({ messageId: "request-1", text: "ACK", stopReason: "end_turn" }).text)
 * ```
 * @category models
 * @since 0.0.0
 */
export class ManagedTurnResult extends S.Opaque<ManagedTurnResult, { readonly brand: unique symbol }>()(
  S.Struct({ messageId: S.NonEmptyString, text: S.String, stopReason: S.NonEmptyString }).pipe(
    $I.annoteSchema("ManagedTurnResult", {
      description: "Provider response, not broker acceptance or task-completion proof.",
    })
  )
) {}

/**
 * Best-effort bounded progress summary exposed to the controller.
 * **Details**
 * Sliding updates may coalesce under load; model text is collected separately
 * with a strict bound. These summaries are never durable delivery receipts.
 * **Example** (Inspect a runtime update)
 * ```ts
 * import { ManagedSessionEvent } from "@beep/ai-provider-cli"
 * console.log(ManagedSessionEvent.make({ kind: "update", payload: {} }).kind)
 * ```
 * @category models
 * @since 0.0.0
 */
export class ManagedSessionEvent extends S.Opaque<ManagedSessionEvent, { readonly brand: unique symbol }>()(
  S.Struct({ kind: S.Literals(["update", "permission-refused", "deferred", "closed"]), payload: S.Unknown }).pipe(
    $I.annoteSchema("ManagedSessionEvent", {
      description: "Runtime update stream with explicit refusal and local deferral facts.",
    })
  )
) {}
