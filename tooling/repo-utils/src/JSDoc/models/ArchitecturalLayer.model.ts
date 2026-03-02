/**
 * @module @beep/repo-utils/models/ArchitecturalLayer.model
 *
 * @description
 *
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
 * @since 0.0.0
 * @category DomainModel
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

export type ArchitecturalLayer = typeof ArchitecturalLayer.Type;
