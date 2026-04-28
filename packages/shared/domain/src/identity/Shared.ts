/**
 * Shared-kernel entity-id registry.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $SharedDomainId } from "@beep/identity/packages";
import * as EntityId from "../entity/EntityId.js";

const $I = $SharedDomainId.create("identity/Shared");
const make = EntityId.factory("shared", $I);

/**
 * Organization entity identifier.
 *
 * @since 0.0.0
 * @category entity ids
 */
export const OrganizationId = make("organization", {
  description: "Identifier for a shared-kernel organization entity.",
});

/**
 * Companion type for {@link OrganizationId.Type}.
 *
 * @example
 * ```ts
 * import { OrganizationId } from "@beep/shared-domain/identity/Shared"
 * import * as S from "effect/Schema"
 *
 * const decodeOrganizationId = S.decodeUnknownSync(
 *   S.make<S.Decoder<typeof OrganizationId.Type>>(OrganizationId.ast)
 * )
 * const id = decodeOrganizationId(1)
 * console.log(id)
 * ```
 *
 * @since 0.0.0
 * @category entity ids
 */
export type OrganizationId = typeof OrganizationId.Type;

/**
 * User entity identifier.
 *
 * @since 0.0.0
 * @category entity ids
 */
export const UserId = make("user", {
  description: "Identifier for a shared-kernel user entity.",
});

/**
 * Companion type for {@link UserId.Type}.
 *
 * @example
 * ```ts
 * import { UserId } from "@beep/shared-domain/identity/Shared"
 * import * as S from "effect/Schema"
 *
 * const decodeUserId = S.decodeUnknownSync(S.make<S.Decoder<typeof UserId.Type>>(UserId.ast))
 * const id = decodeUserId(1)
 * console.log(id)
 * ```
 *
 * @since 0.0.0
 * @category entity ids
 */
export type UserId = typeof UserId.Type;

/**
 * Team entity identifier.
 *
 * @since 0.0.0
 * @category entity ids
 */
export const TeamId = make("team", {
  description: "Identifier for a shared-kernel team entity.",
});

/**
 * Companion type for {@link TeamId.Type}.
 *
 * @example
 * ```ts
 * import { TeamId } from "@beep/shared-domain/identity/Shared"
 * import * as S from "effect/Schema"
 *
 * const decodeTeamId = S.decodeUnknownSync(S.make<S.Decoder<typeof TeamId.Type>>(TeamId.ast))
 * const id = decodeTeamId(1)
 * console.log(id)
 * ```
 *
 * @since 0.0.0
 * @category entity ids
 */
export type TeamId = typeof TeamId.Type;

/**
 * Service-account entity identifier.
 *
 * @since 0.0.0
 * @category entity ids
 */
export const ServiceAccountId = make("service_account", {
  description: "Identifier for a shared-kernel service account entity.",
});

/**
 * Companion type for {@link ServiceAccountId.Type}.
 *
 * @example
 * ```ts
 * import { ServiceAccountId } from "@beep/shared-domain/identity/Shared"
 * import * as S from "effect/Schema"
 *
 * const decodeServiceAccountId = S.decodeUnknownSync(
 *   S.make<S.Decoder<typeof ServiceAccountId.Type>>(ServiceAccountId.ast)
 * )
 * const id = decodeServiceAccountId(1)
 * console.log(id)
 * ```
 *
 * @since 0.0.0
 * @category entity ids
 */
export type ServiceAccountId = typeof ServiceAccountId.Type;

/**
 * Agent entity identifier.
 *
 * @since 0.0.0
 * @category entity ids
 */
export const AgentId = make("agent", {
  description: "Identifier for a shared-kernel agent entity.",
});

/**
 * Companion type for {@link AgentId.Type}.
 *
 * @example
 * ```ts
 * import { AgentId } from "@beep/shared-domain/identity/Shared"
 * import * as S from "effect/Schema"
 *
 * const decodeAgentId = S.decodeUnknownSync(S.make<S.Decoder<typeof AgentId.Type>>(AgentId.ast))
 * const id = decodeAgentId(1)
 * console.log(id)
 * ```
 *
 * @since 0.0.0
 * @category entity ids
 */
export type AgentId = typeof AgentId.Type;

/**
 * Agent-version entity identifier.
 *
 * @since 0.0.0
 * @category entity ids
 */
export const AgentVersionId = make("agent_version", {
  description: "Identifier for a shared-kernel agent version entity.",
});

/**
 * Companion type for {@link AgentVersionId.Type}.
 *
 * @example
 * ```ts
 * import { AgentVersionId } from "@beep/shared-domain/identity/Shared"
 * import * as S from "effect/Schema"
 *
 * const decodeAgentVersionId = S.decodeUnknownSync(
 *   S.make<S.Decoder<typeof AgentVersionId.Type>>(AgentVersionId.ast)
 * )
 * const id = decodeAgentVersionId(1)
 * console.log(id)
 * ```
 *
 * @since 0.0.0
 * @category entity ids
 */
export type AgentVersionId = typeof AgentVersionId.Type;

/**
 * Connector-account entity identifier.
 *
 * @since 0.0.0
 * @category entity ids
 */
export const ConnectorAccountId = make("connector_account", {
  description: "Identifier for a shared-kernel connector account entity.",
});

/**
 * Companion type for {@link ConnectorAccountId.Type}.
 *
 * @example
 * ```ts
 * import { ConnectorAccountId } from "@beep/shared-domain/identity/Shared"
 * import * as S from "effect/Schema"
 *
 * const decodeConnectorAccountId = S.decodeUnknownSync(
 *   S.make<S.Decoder<typeof ConnectorAccountId.Type>>(ConnectorAccountId.ast)
 * )
 * const id = decodeConnectorAccountId(1)
 * console.log(id)
 * ```
 *
 * @since 0.0.0
 * @category entity ids
 */
export type ConnectorAccountId = typeof ConnectorAccountId.Type;

/**
 * Activity entity identifier used by provenance and lifecycle mixins.
 *
 * @since 0.0.0
 * @category entity ids
 */
export const ActivityId = make("activity", {
  description: "Identifier for a shared-kernel provenance activity entity.",
});

/**
 * Companion type for {@link ActivityId.Type}.
 *
 * @example
 * ```ts
 * import { ActivityId } from "@beep/shared-domain/identity/Shared"
 * import * as S from "effect/Schema"
 *
 * const decodeActivityId = S.decodeUnknownSync(S.make<S.Decoder<typeof ActivityId.Type>>(ActivityId.ast))
 * const id = decodeActivityId(1)
 * console.log(id)
 * ```
 *
 * @since 0.0.0
 * @category entity ids
 */
export type ActivityId = typeof ActivityId.Type;

/**
 * Local-machine entity identifier used by synchronization metadata.
 *
 * @since 0.0.0
 * @category entity ids
 */
export const LocalMachineId = make("local_machine", {
  description: "Identifier for a local machine participating in sync.",
});

/**
 * Companion type for {@link LocalMachineId.Type}.
 *
 * @example
 * ```ts
 * import { LocalMachineId } from "@beep/shared-domain/identity/Shared"
 * import * as S from "effect/Schema"
 *
 * const decodeLocalMachineId = S.decodeUnknownSync(
 *   S.make<S.Decoder<typeof LocalMachineId.Type>>(LocalMachineId.ast)
 * )
 * const id = decodeLocalMachineId(1)
 * console.log(id)
 * ```
 *
 * @since 0.0.0
 * @category entity ids
 */
export type LocalMachineId = typeof LocalMachineId.Type;
