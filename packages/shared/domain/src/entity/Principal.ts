/**
 * Canonical actor reference schemas.
 *
 * @module
 * @since 0.0.0
 */

import { $SharedDomainId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";
import * as Shared from "../identity/Shared.js";

const $I = $SharedDomainId.create("entity/Principal");

/**
 * Shared system components that can author persisted rows.
 *
 * @since 0.0.0
 * @category schemas
 */
export const SystemComponent = LiteralKit(["Runtime", "Sync", "Migration", "Policy", "Generator"]).annotate(
  $I.annote("SystemComponent", {
    description: "System component allowed to appear in a system principal.",
  })
);

/**
 * Runtime type for {@link SystemComponent}.
 *
 * @since 0.0.0
 * @category models
 */
export type SystemComponent = typeof SystemComponent.Type;

/**
 * Principal variant for a user actor.
 *
 * @since 0.0.0
 * @category models
 */
export class UserPrincipal extends S.Class<UserPrincipal>($I`UserPrincipal`)(
  {
    kind: S.tag("User"),
    userId: Shared.UserId,
  },
  $I.annote("UserPrincipal", {
    description: "Canonical actor reference for a user.",
  })
) {}

/**
 * Principal variant for a service account.
 *
 * @since 0.0.0
 * @category models
 */
export class ServiceAccountPrincipal extends S.Class<ServiceAccountPrincipal>($I`ServiceAccountPrincipal`)(
  {
    kind: S.tag("ServiceAccount"),
    onBehalfOfUserId: S.OptionFromOptionalKey(Shared.UserId),
    serviceAccountId: Shared.ServiceAccountId,
  },
  $I.annote("ServiceAccountPrincipal", {
    description: "Canonical actor reference for a service account.",
  })
) {}

/**
 * Principal variant for an AI agent acting in the system.
 *
 * @since 0.0.0
 * @category models
 */
export class AgentPrincipal extends S.Class<AgentPrincipal>($I`AgentPrincipal`)(
  {
    agentId: Shared.AgentId,
    agentVersionId: Shared.AgentVersionId,
    kind: S.tag("Agent"),
    onBehalfOfTeamId: S.OptionFromOptionalKey(Shared.TeamId),
    onBehalfOfUserId: Shared.UserId,
  },
  $I.annote("AgentPrincipal", {
    description: "Canonical actor reference for an agent.",
  })
) {}

/**
 * Principal variant for a connector account.
 *
 * @since 0.0.0
 * @category models
 */
export class ConnectorAccountPrincipal extends S.Class<ConnectorAccountPrincipal>($I`ConnectorAccountPrincipal`)(
  {
    connectorAccountId: Shared.ConnectorAccountId,
    kind: S.tag("ConnectorAccount"),
    onBehalfOfUserId: S.OptionFromOptionalKey(Shared.UserId),
  },
  $I.annote("ConnectorAccountPrincipal", {
    description: "Canonical actor reference for a connector account.",
  })
) {}

/**
 * Principal variant for internal system work.
 *
 * @since 0.0.0
 * @category models
 */
export class SystemPrincipal extends S.Class<SystemPrincipal>($I`SystemPrincipal`)(
  {
    component: SystemComponent,
    kind: S.tag("System"),
  },
  $I.annote("SystemPrincipal", {
    description: "Canonical actor reference for a system component.",
  })
) {}

/**
 * Tagged union used by every BaseEntity field that names an actor.
 *
 * @example
 * ```ts
 * import { Principal } from "@beep/shared-domain/entity/Principal"
 *
 * console.log(Principal)
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const Principal = S.Union([
  UserPrincipal,
  ServiceAccountPrincipal,
  AgentPrincipal,
  ConnectorAccountPrincipal,
  SystemPrincipal,
]).pipe(
  S.toTaggedUnion("kind"),
  $I.annoteSchema("Principal", {
    description: "Principal actor reference used by shared-kernel persisted entity fields.",
  })
);

/**
 * Runtime type for {@link Principal}.
 *
 * @since 0.0.0
 * @category models
 */
export type Principal = typeof Principal.Type;

/**
 * Encoded boundary type for {@link Principal}.
 *
 * @since 0.0.0
 * @category models
 */
export declare namespace Principal {
  /**
   * Encoded boundary companion type for {@link Principal}.
   *
   * @example
   * ```ts
   * import type { Principal } from "@beep/shared-domain/entity/Principal"
   *
   * const encoded: Principal.Encoded = {
   *   kind: "System",
   *   component: "Runtime",
   * }
   * console.log(encoded)
   * ```
   *
   * @category models
   * @since 0.0.0
   */
  export type Encoded = typeof Principal.Encoded;
}
