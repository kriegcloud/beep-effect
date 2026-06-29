/**
 * explore slice entity-id registry.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $ScratchpadId } from "@beep/identity";
import * as EntityId from "@beep/shared-domain/entity/EntityId";

const $I = $ScratchpadId.create("identity/Explore");
const make = EntityId.factory("explore", $I);

/**
 * Explore client entity identifier.
 *
 * @example
 * ```ts
 * import * as Explore from "@beep/shared-domain/identity/Explore"
 *
 * console.log(Explore.ThreadId.entityType)
 * ```
 *
 * @category entity-ids
 * @since 0.0.0
 */
export const ThreadId = make("thread", {
	description: "Identifier for a explore thread entity.",
});

/**
 * Runtime type for {@link ThreadId}.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as Explore from "@beep/shared-domain/identity/Explore"
 * import * as S from "effect/Schema"
 *
 * const program = Effect.gen(function* () {
 *   const id: Explore.ThreadId = yield* S.decodeUnknownEffect(Explore.ThreadId)(1)
 *   return id
 * })
 * console.log(program)
 * ```
 *
 * @category entity-ids
 * @since 0.0.0
 */
export type ThreadId = typeof ThreadId.Type;

/**
 * Explore client entity identifier.
 *
 * @example
 * ```ts
 * import * as Explore from "@beep/shared-domain/identity/Explore"
 *
 * console.log(Explore.ProjectId.entityType)
 * ```
 *
 * @category entity-ids
 * @since 0.0.0
 */
export const ProjectId = make("project", {
	description: "Identifier for a explore project entity.",
});

/**
 * Runtime type for {@link ProjectId}.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as Explore from "@beep/shared-domain/identity/Explore"
 * import * as S from "effect/Schema"
 *
 * const program = Effect.gen(function* () {
 *   const id: Explore.ProjectId = yield* S.decodeUnknownEffect(Explore.ProjectId)(1)
 *   return id
 * })
 * console.log(program)
 * ```
 *
 * @category entity-ids
 * @since 0.0.0
 */
export type ProjectId = typeof ProjectId.Type;

/**
 * Explore client entity identifier.
 *
 * @example
 * ```ts
 * import * as Explore from "@beep/shared-domain/identity/Explore"
 *
 * console.log(Explore.EnvironmentId.entityType)
 * ```
 *
 * @category entity-ids
 * @since 0.0.0
 */
export const EnvironmentId = make("environment", {
	description: "Identifier for a explore environment entity.",
});

/**
 * Runtime type for {@link EnvironmentId}.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as Explore from "@beep/shared-domain/identity/Explore"
 * import * as S from "effect/Schema"
 *
 * const program = Effect.gen(function* () {
 *   const id: Explore.EnvironmentId = yield* S.decodeUnknownEffect(Explore.EnvironmentId)(1)
 *   return id
 * })
 * console.log(program)
 * ```
 *
 * @category entity-ids
 * @since 0.0.0
 */
export type EnvironmentId = typeof EnvironmentId.Type;

/**
 * Explore client entity identifier.
 *
 * @example
 * ```ts
 * import * as Explore from "@beep/shared-domain/identity/Explore"
 *
 * console.log(Explore.CommandId.entityType)
 * ```
 *
 * @category entity-ids
 * @since 0.0.0
 */
export const CommandId = make("command", {
	description: "Identifier for a explore command entity.",
});

/**
 * Runtime type for {@link CommandId}.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as Explore from "@beep/shared-domain/identity/Explore"
 * import * as S from "effect/Schema"
 *
 * const program = Effect.gen(function* () {
 *   const id: Explore.CommandId = yield* S.decodeUnknownEffect(Explore.CommandId)(1)
 *   return id
 * })
 * console.log(program)
 * ```
 *
 * @category entity-ids
 * @since 0.0.0
 */
export type CommandId = typeof CommandId.Type;

/**
 * Explore client entity identifier.
 *
 * @example
 * ```ts
 * import * as Explore from "@beep/shared-domain/identity/Explore"
 *
 * console.log(Explore.EventId.entityType)
 * ```
 *
 * @category entity-ids
 * @since 0.0.0
 */
export const EventId = make("event", {
	description: "Identifier for a explore event entity.",
});

/**
 * Runtime type for {@link EventId}.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as Explore from "@beep/shared-domain/identity/Explore"
 * import * as S from "effect/Schema"
 *
 * const program = Effect.gen(function* () {
 *   const id: Explore.EventId = yield* S.decodeUnknownEffect(Explore.EventId)(1)
 *   return id
 * })
 * console.log(program)
 * ```
 *
 * @category entity-ids
 * @since 0.0.0
 */
export type EventId = typeof EventId.Type;

/**
 * Explore client entity identifier.
 *
 * @example
 * ```ts
 * import * as Explore from "@beep/shared-domain/identity/Explore"
 *
 * console.log(Explore.MessageId.entityType)
 * ```
 *
 * @category entity-ids
 * @since 0.0.0
 */
export const MessageId = make("message", {
	description: "Identifier for a explore message entity.",
});

/**
 * Runtime type for {@link MessageId}.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as Explore from "@beep/shared-domain/identity/Explore"
 * import * as S from "effect/Schema"
 *
 * const program = Effect.gen(function* () {
 *   const id: Explore.MessageId = yield* S.decodeUnknownEffect(Explore.MessageId)(1)
 *   return id
 * })
 * console.log(program)
 * ```
 *
 * @category entity-ids
 * @since 0.0.0
 */
export type MessageId = typeof MessageId.Type;

/**
 * Explore client entity identifier.
 *
 * @example
 * ```ts
 * import * as Explore from "@beep/shared-domain/identity/Explore"
 *
 * console.log(Explore.TurnId.entityType)
 * ```
 *
 * @category entity-ids
 * @since 0.0.0
 */
export const TurnId = make("turn", {
	description: "Identifier for a explore turn entity.",
});

/**
 * Runtime type for {@link TurnId}.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as Explore from "@beep/shared-domain/identity/Explore"
 * import * as S from "effect/Schema"
 *
 * const program = Effect.gen(function* () {
 *   const id: Explore.TurnId = yield* S.decodeUnknownEffect(Explore.TurnId)(1)
 *   return id
 * })
 * console.log(program)
 * ```
 *
 * @category entity-ids
 * @since 0.0.0
 */
export type TurnId = typeof TurnId.Type;

/**
 * Explore client entity identifier.
 *
 * @example
 * ```ts
 * import * as Explore from "@beep/shared-domain/identity/Explore"
 *
 * console.log(Explore.AuthSessionId.entityType)
 * ```
 *
 * @category entity-ids
 * @since 0.0.0
 */
export const AuthSessionId = make("auth_session", {
	description: "Identifier for a explore auth_session entity.",
});

/**
 * Runtime type for {@link AuthSessionId}.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as Explore from "@beep/shared-domain/identity/Explore"
 * import * as S from "effect/Schema"
 *
 * const program = Effect.gen(function* () {
 *   const id: Explore.AuthSessionId = yield* S.decodeUnknownEffect(Explore.AuthSessionId)(1)
 *   return id
 * })
 * console.log(program)
 * ```
 *
 * @category entity-ids
 * @since 0.0.0
 */
export type AuthSessionId = typeof AuthSessionId.Type;

/**
 * Explore client entity identifier.
 *
 * @example
 * ```ts
 * import * as Explore from "@beep/shared-domain/identity/Explore"
 *
 * console.log(Explore.ProviderItemId.entityType)
 * ```
 *
 * @category entity-ids
 * @since 0.0.0
 */
export const ProviderItemId = make("provider_item", {
	description: "Identifier for a explore provider_item entity.",
});

/**
 * Runtime type for {@link ProviderItemId}.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as Explore from "@beep/shared-domain/identity/Explore"
 * import * as S from "effect/Schema"
 *
 * const program = Effect.gen(function* () {
 *   const id: Explore.ProviderItemId = yield* S.decodeUnknownEffect(Explore.ProviderItemId)(1)
 *   return id
 * })
 * console.log(program)
 * ```
 *
 * @category entity-ids
 * @since 0.0.0
 */
export type ProviderItemId = typeof ProviderItemId.Type;

/**
 * Explore client entity identifier.
 *
 * @example
 * ```ts
 * import * as Explore from "@beep/shared-domain/identity/Explore"
 *
 * console.log(Explore.RuntimeSessionId.entityType)
 * ```
 *
 * @category entity-ids
 * @since 0.0.0
 */
export const RuntimeSessionId = make("runtime_session", {
	description: "Identifier for a explore runtime_session entity.",
});

/**
 * Runtime type for {@link RuntimeSessionId}.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as Explore from "@beep/shared-domain/identity/Explore"
 * import * as S from "effect/Schema"
 *
 * const program = Effect.gen(function* () {
 *   const id: Explore.RuntimeSessionId = yield* S.decodeUnknownEffect(Explore.RuntimeSessionId)(1)
 *   return id
 * })
 * console.log(program)
 * ```
 *
 * @category entity-ids
 * @since 0.0.0
 */
export type RuntimeSessionId = typeof RuntimeSessionId.Type;

/**
 * Explore client entity identifier.
 *
 * @example
 * ```ts
 * import * as Explore from "@beep/shared-domain/identity/Explore"
 *
 * console.log(Explore.RuntimeItemId.entityType)
 * ```
 *
 * @category entity-ids
 * @since 0.0.0
 */
export const RuntimeItemId = make("runtime_item", {
	description: "Identifier for a explore runtime_item entity.",
});

/**
 * Runtime type for {@link RuntimeItemId}.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as Explore from "@beep/shared-domain/identity/Explore"
 * import * as S from "effect/Schema"
 *
 * const program = Effect.gen(function* () {
 *   const id: Explore.RuntimeItemId = yield* S.decodeUnknownEffect(Explore.RuntimeItemId)(1)
 *   return id
 * })
 * console.log(program)
 * ```
 *
 * @category entity-ids
 * @since 0.0.0
 */
export type RuntimeItemId = typeof RuntimeItemId.Type;

/**
 * Explore client entity identifier.
 *
 * @example
 * ```ts
 * import * as Explore from "@beep/shared-domain/identity/Explore"
 *
 * console.log(Explore.RuntimeRequestId.entityType)
 * ```
 *
 * @category entity-ids
 * @since 0.0.0
 */
export const RuntimeRequestId = make("runtime_request", {
	description: "Identifier for a explore runtime_request entity.",
});

/**
 * Runtime type for {@link RuntimeRequestId}.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as Explore from "@beep/shared-domain/identity/Explore"
 * import * as S from "effect/Schema"
 *
 * const program = Effect.gen(function* () {
 *   const id: Explore.RuntimeRequestId = yield* S.decodeUnknownEffect(Explore.RuntimeRequestId)(1)
 *   return id
 * })
 * console.log(program)
 * ```
 *
 * @category entity-ids
 * @since 0.0.0
 */
export type RuntimeRequestId = typeof RuntimeRequestId.Type;

/**
 * Explore client entity identifier.
 *
 * @example
 * ```ts
 * import * as Explore from "@beep/shared-domain/identity/Explore"
 *
 * console.log(Explore.RuntimeTaskId.entityType)
 * ```
 *
 * @category entity-ids
 * @since 0.0.0
 */
export const RuntimeTaskId = make("runtime_task", {
	description: "Identifier for a explore runtime_task entity.",
});

/**
 * Runtime type for {@link RuntimeTaskId}.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as Explore from "@beep/shared-domain/identity/Explore"
 * import * as S from "effect/Schema"
 *
 * const program = Effect.gen(function* () {
 *   const id: Explore.RuntimeTaskId = yield* S.decodeUnknownEffect(Explore.RuntimeTaskId)(1)
 *   return id
 * })
 * console.log(program)
 * ```
 *
 * @category entity-ids
 * @since 0.0.0
 */
export type RuntimeTaskId = typeof RuntimeTaskId.Type;

/**
 * Explore client entity identifier.
 *
 * @example
 * ```ts
 * import * as Explore from "@beep/shared-domain/identity/Explore"
 *
 * console.log(Explore.ApprovalRequestId.entityType)
 * ```
 *
 * @category entity-ids
 * @since 0.0.0
 */
export const ApprovalRequestId = make("approval_request", {
	description: "Identifier for a explore approval_request entity.",
});

/**
 * Runtime type for {@link ApprovalRequestId}.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as Explore from "@beep/shared-domain/identity/Explore"
 * import * as S from "effect/Schema"
 *
 * const program = Effect.gen(function* () {
 *   const id: Explore.ApprovalRequestId = yield* S.decodeUnknownEffect(Explore.ApprovalRequestId)(1)
 *   return id
 * })
 * console.log(program)
 * ```
 *
 * @category entity-ids
 * @since 0.0.0
 */
export type ApprovalRequestId = typeof ApprovalRequestId.Type;

/**
 * Explore client entity identifier.
 *
 * @example
 * ```ts
 * import * as Explore from "@beep/shared-domain/identity/Explore"
 *
 * console.log(Explore.CheckpointRefId.entityType)
 * ```
 *
 * @category entity-ids
 * @since 0.0.0
 */
export const CheckpointRefId = make("checkpoint_ref", {
	description: "Identifier for a explore checkpoint_ref entity.",
});

/**
 * Runtime type for {@link CheckpointRefId}.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as Explore from "@beep/shared-domain/identity/Explore"
 * import * as S from "effect/Schema"
 *
 * const program = Effect.gen(function* () {
 *   const id: Explore.CheckpointRefId = yield* S.decodeUnknownEffect(Explore.CheckpointRefId)(1)
 *   return id
 * })
 * console.log(program)
 * ```
 *
 * @category entity-ids
 * @since 0.0.0
 */
export type CheckpointRefId = typeof CheckpointRefId.Type;

