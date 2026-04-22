/**
 * @module @beep/repo-utils/models/ArchitecturalLayer.model
 * @description Architectural layer taxonomy model definitions.
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoUtilsId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";

const $I = $RepoUtilsId.create("JSDoc/models/ArchitecturalLayer.model");

/**
 * Architectural layer mappings across established patterns.
 * Enables cross-framework queries such as "show me all code in the
 * domain core that depends on infrastructure".
 *
 *
 * @example
 * ```ts
 * import { ArchitecturalLayer } from "@beep/repo-utils/JSDoc/models/ArchitecturalLayer.model"
 *
 * void ArchitecturalLayer
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const ArchitecturalLayer = LiteralKit([
  "DomainEntity",
  "UseCase",
  "InterfaceAdapter",
  "FrameworkDriver",
  "Port",
  "Adapter",
  "Core",
  "CrossCutting",
]).annotate(
  $I.annote("ArchitecturalLayer", {
    description:
      'Architectural layer mappings across established patterns.\nEnables cross-framework queries such as "show me all code in the\ndomain core that depends on infrastructure".',
  })
);

/**
 * Inferred type for {@link ArchitecturalLayer}.
 *
 *
 * @example
 * ```ts
 * import type { ArchitecturalLayer } from "@beep/repo-utils/JSDoc/models/ArchitecturalLayer.model"
 *
 * type Example = ArchitecturalLayer
 * const accept = <A extends Example>(value: A): A => value
 * void accept
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type ArchitecturalLayer = typeof ArchitecturalLayer.Type;
