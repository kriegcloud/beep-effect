/**
 * Canonical source-kind vocabulary for persisted entities.
 *
 * @module
 * @since 0.0.0
 */

import { $SharedDomainId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";

const $I = $SharedDomainId.create("entity/SourceKind");

/**
 * Denormalized source facet used by BaseEntity rows and audit filters.
 *
 * @example
 * ```ts
 * import { SourceKind } from "@beep/shared-domain/entity/SourceKind"
 *
 * console.log(SourceKind.is.Agent("Agent"))
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const SourceKind = LiteralKit(["User", "Agent", "Admin", "Application", "System", "Sync", "Connector"]).annotate(
  $I.annote("SourceKind", {
    description: "Canonical denormalized source of persisted entity data.",
  })
);

/**
 * Runtime type for {@link SourceKind}.
 *
 * @since 0.0.0
 * @category models
 */
export type SourceKind = typeof SourceKind.Type;
