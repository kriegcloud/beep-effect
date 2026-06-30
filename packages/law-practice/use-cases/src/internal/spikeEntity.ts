/**
 * Spike-only BaseEntity input shim.
 *
 * The law-practice domain entities (and the epistemic `CandidateClaim` /
 * `Evidence` the review loop builds) extend `BaseEntity.Class`, so decoding one
 * requires the full audit envelope (`id`, `createdAt`/`updatedAt`,
 * `createdByPrincipal`/`updatedByPrincipal`, `orgId`, `rowVersion`,
 * `schemaVersion`, `source`). `@beep/test-utils` `baseEntityFixtureInput`
 * produces exactly this shape, but it is a devDependency and cannot be imported
 * from `src`. This module mirrors that helper as a spike affordance.
 *
 * In production these fields are NOT synthesized inline: `id` comes from an id
 * generator, the timestamps from `Clock`, and the principals from the
 * request/runtime context. This shim exists only so the spike can construct
 * fully-formed entities deterministically without a database or runtime.
 *
 * Covered by the package's `./internal/*: null` export guard — not part of the
 * public surface.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $LawPracticeUseCasesId } from "@beep/identity";
import { SchemaUtils } from "@beep/schema";
import { dual } from "effect/Function";
import * as S from "effect/Schema";

const $I = $LawPracticeUseCasesId.create("internal/spikeEntity");

const systemPrincipal = {
  component: "Runtime",
  kind: "System",
} as const;

/**
 * Build the BaseEntity audit envelope for a spike entity decode.
 *
 * @example
 * ```ts
 * import { spikeEntityInput } from "./spikeEntity.ts"
 *
 * console.log(spikeEntityInput("LawPracticeOfficeAction", 1).entityType)
 * ```
 *
 * @category testing
 * @since 0.0.0
 */
export const spikeEntityInput: {
  (entityType: string, id: number): EntityInput;
  (id: number): (entityType: string) => EntityInput;
} = dual(
  2,
  (entityType: string, id: number): EntityInput =>
    EntityInput.make({
      createdAt: id,
      createdByPrincipal: systemPrincipal,
      entityType,
      id,
      orgId: 1,
      rowVersion: 1,
      schemaVersion: "0.0.0",
      source: "System",
      updatedAt: id + 1,
      updatedByPrincipal: systemPrincipal,
    })
);

export class EntityInput extends S.Class<EntityInput>($I`EnitytInput`)(
  {
    createdAt: S.Finite,
    createdByPrincipal: S.Struct({
      component: S.tag("Runtime"),
      kind: S.tag("System"),
    }).pipe(SchemaUtils.withKeyDefaults(systemPrincipal)),
    entityType: S.String,
    id: S.Finite,
    orgId: S.tag(1),
    rowVersion: S.tag(1),
    schemaVersion: S.tag("0.0.0"),
    source: S.tag("System"),
    updatedAt: S.Finite,
    updatedByPrincipal: S.Struct({
      component: S.tag("Runtime"),
      kind: S.tag("System"),
    }).pipe(SchemaUtils.withKeyDefaults(systemPrincipal)),
  },
  $I.annote("EntityInput", {
    description: "Input for constructing a spike entity",
  })
) {}
