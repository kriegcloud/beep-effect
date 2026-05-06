/**
 * Fixture-lab specimen entity-id registry.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $FixtureLabSpecimenId } from "@beep/identity/packages";
import * as EntityId from "../entity/EntityId.js";

const $I = $FixtureLabSpecimenId.create("identity/FixtureLabSpecimen");
const make = EntityId.factory("fixture_lab_specimen", $I);

/**
 * Fixture-lab specimen entity identifier.
 *
 * @example
 * ```ts
 * import * as FixtureLabSpecimen from "@beep/shared-domain/identity/FixtureLabSpecimen"
 *
 * console.log(FixtureLabSpecimen.SpecimenId.entityType)
 * ```
 *
 * @category entity-ids
 * @since 0.0.0
 */
export const SpecimenId = make("specimen", {
  description: "Identifier for a fixture-lab specimen entity.",
});

/**
 * Runtime type for {@link SpecimenId}.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as FixtureLabSpecimen from "@beep/shared-domain/identity/FixtureLabSpecimen"
 * import * as S from "effect/Schema"
 *
 * const program = Effect.gen(function* () {
 *   const id: FixtureLabSpecimen.SpecimenId = yield* S.decodeUnknownEffect(FixtureLabSpecimen.SpecimenId)(1)
 *   return id
 * })
 * void program
 * ```
 *
 * @category entity-ids
 * @since 0.0.0
 */
export type SpecimenId = typeof SpecimenId.Type;
