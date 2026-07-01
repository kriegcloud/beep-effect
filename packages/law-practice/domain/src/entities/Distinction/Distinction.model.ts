/**
 * Distinction entity model.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $LawPracticeDomainId } from "@beep/identity/packages";
import { TextAnchor } from "@beep/provenance";
import * as EntitySchema from "@beep/schema/EntitySchema";
import { BaseEntity } from "@beep/shared-domain/entity/BaseEntity";
import * as LawPractice from "@beep/shared-domain/identity/LawPractice";
import { ClaimLifecycle } from "@beep/shared-domain/values/ClaimLifecycle";
import * as S from "effect/Schema";
import { DistinctionDetail } from "./Distinction.values.ts";

const $I = $LawPracticeDomainId.create("entities/Distinction/Distinction.model");

/**
 * Distinction entity asserted to overcome a rejection against a claim.
 *
 * Stores the argued {@link DistinctionDetail}, a source {@link TextAnchor}, and
 * the {@link ClaimLifecycle} state while linking to the claim it defends and the
 * rejection it answers.
 *
 * @example
 * ```ts
 * import { Distinction } from "@beep/law-practice-domain"
 * import * as S from "effect/Schema"
 *
 * const systemPrincipal = { component: "Runtime", kind: "System" }
 * const distinction = S.decodeUnknownSync(Distinction)({
 *   anchor: { endChar: 58, quote: "does not disclose the hinged lid", startChar: 21 },
 *   claimFixtureKey: "claim.1",
 *   createdAt: 1,
 *   createdByPrincipal: systemPrincipal,
 *   detail: {
 *     kind: "missing_limitation",
 *     limitation: "a hinge coupling the lid to the base",
 *   },
 *   entityType: "LawPracticeDistinction",
 *   fixtureKey: "distinction.hinge",
 *   id: 5,
 *   lifecycleState: "candidate",
 *   orgId: 1,
 *   rejectionFixtureKey: "rejection-example",
 *   rowVersion: 1,
 *   schemaVersion: "0.0.0",
 *   source: "System",
 *   updatedAt: 1,
 *   updatedByPrincipal: systemPrincipal,
 * })
 *
 * console.log(distinction.detail.kind) // "missing_limitation"
 * ```
 *
 * @category entities
 * @since 0.0.0
 */
export class Distinction extends BaseEntity.Class<Distinction>($I`Distinction`)(
  LawPractice.DistinctionId,
  {
    fields: {
      anchor: TextAnchor,
      claimFixtureKey: S.String,
      detail: DistinctionDetail,
      fixtureKey: S.String,
      lifecycleState: ClaimLifecycle,
      rejectionFixtureKey: S.String,
    },
    persisted: {
      anchor: EntitySchema.persist.jsonb({
        columnName: "anchor",
      }),
      claimFixtureKey: EntitySchema.persist.text({
        columnName: "claim_fixture_key",
      }),
      detail: EntitySchema.persist.jsonb({
        columnName: "detail",
      }),
      fixtureKey: EntitySchema.persist.text({
        columnName: "fixture_key",
      }),
      lifecycleState: EntitySchema.persist.literal({
        columnName: "lifecycle_state",
      }),
      rejectionFixtureKey: EntitySchema.persist.text({
        columnName: "rejection_fixture_key",
      }),
    },
  },
  $I.annote("Distinction", {
    description: "Distinction entity asserted to overcome a rejection against a claim.",
  })
) {}
