/**
 * Canonical actor reference schemas.
 *
 * @packageDocumentation
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
 * @example
 * ```ts
 * import { SystemComponent } from "@beep/shared-domain/entity/Principal"
 *
 * console.log(SystemComponent.is.Runtime("Runtime"))
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const SystemComponent = LiteralKit(["Runtime", "Sync", "Migration", "Policy", "Generator"]).pipe(
  $I.annoteSchema("SystemComponent", {
    description: "System component allowed to appear in a system principal.",
  })
);

/**
 * Runtime type for {@link SystemComponent}.
 *
 * @example
 * ```ts
 * import type { SystemComponent } from "@beep/shared-domain/entity/Principal"
 *
 * const component: SystemComponent = "Runtime"
 * console.log(component)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type SystemComponent = typeof SystemComponent.Type;

/**
 * Principal variant for a user actor.
 *
 * @example
 * ```ts
 * import { UserPrincipal } from "@beep/shared-domain/entity/Principal"
 * import * as S from "effect/Schema"
 *
 * const principal = S.decodeUnknownSync(UserPrincipal)({
 *   kind: "User",
 *   userId: 1
 * })
 *
 * console.log(principal.kind)
 * ```
 *
 * @category models
 * @since 0.0.0
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
 * @example
 * ```ts
 * import { ServiceAccountPrincipal } from "@beep/shared-domain/entity/Principal"
 * import * as S from "effect/Schema"
 *
 * const principal = S.decodeUnknownSync(ServiceAccountPrincipal)({
 *   kind: "ServiceAccount",
 *   serviceAccountId: 1
 * })
 *
 * console.log(principal.kind)
 * ```
 *
 * @category models
 * @since 0.0.0
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
 * @example
 * ```ts
 * import { AgentPrincipal } from "@beep/shared-domain/entity/Principal"
 * import * as S from "effect/Schema"
 *
 * const principal = S.decodeUnknownSync(AgentPrincipal)({
 *   agentId: 1,
 *   agentVersionId: 2,
 *   kind: "Agent",
 *   onBehalfOfUserId: 3
 * })
 *
 * console.log(principal.kind)
 * ```
 *
 * @category models
 * @since 0.0.0
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
 * @example
 * ```ts
 * import { ConnectorAccountPrincipal } from "@beep/shared-domain/entity/Principal"
 * import * as S from "effect/Schema"
 *
 * const principal = S.decodeUnknownSync(ConnectorAccountPrincipal)({
 *   connectorAccountId: 1,
 *   kind: "ConnectorAccount"
 * })
 *
 * console.log(principal.kind)
 * ```
 *
 * @category models
 * @since 0.0.0
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
 * @example
 * ```ts
 * import { SystemPrincipal } from "@beep/shared-domain/entity/Principal"
 *
 * const principal = SystemPrincipal.make({
 *   kind: "System",
 *   component: "Runtime",
 * })
 * console.log(principal.component)
 * ```
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
 * import * as S from "effect/Schema"
 *
 * const principal = S.decodeUnknownSync(Principal)({
 *   kind: "System",
 *   component: "Runtime"
 * })
 *
 * console.log(principal.kind) // "System"
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const Principal = S.Union([
  UserPrincipal,
  ServiceAccountPrincipal,
  AgentPrincipal,
  ConnectorAccountPrincipal,
  SystemPrincipal,
]).pipe(
  $I.annoteSchema("Principal", {
    description: "Principal actor reference used by shared-kernel persisted entity fields.",
  }),
  S.toTaggedUnion("kind")
);

/**
 * Runtime type for {@link Principal}.
 *
 * @example
 * ```ts
 * import type { Principal } from "@beep/shared-domain/entity/Principal"
 *
 * const principal: Principal = {
 *   kind: "System",
 *   component: "Runtime",
 * }
 * console.log(principal.kind)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type Principal = typeof Principal.Type;

/**
 * Encoded boundary type for {@link Principal}.
 *
 * @example
 * ```ts
 * import type { Principal } from "@beep/shared-domain/entity/Principal"
 *
 * const encoded: Principal.Encoded = {
 *   kind: "System",
 *   component: "Runtime",
 * }
 * console.log(encoded.kind)
 * ```
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
