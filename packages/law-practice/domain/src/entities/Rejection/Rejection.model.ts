/**
 * Rejection entity model.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $LawPracticeDomainId } from "@beep/identity/packages";
import * as EntitySchema from "@beep/schema/EntitySchema";
import { BaseEntity } from "@beep/shared-domain/entity/BaseEntity";
import * as LawPractice from "@beep/shared-domain/identity/LawPractice";
import * as S from "effect/Schema";
import { RejectionGround } from "./Rejection.values.js";

const $I = $LawPracticeDomainId.create("entities/Rejection/Rejection.model");

/**
 * A rejection raised against a claim by an office action. The statutory
 * {@link RejectionGround} is persisted as JSONB so the per-statute prior-art
 * cardinality survives storage; pinned to both the claim it rejects and the
 * office action that raised it.
 *
 * @example
 * ```ts
 * import { Rejection } from "@beep/law-practice-domain"
 *
 * console.log(Rejection.definition.entityId.resource)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class Rejection extends BaseEntity.Class<Rejection>($I`Rejection`)(
  LawPractice.RejectionId,
  {
    fields: {
      claimFixtureKey: S.String,
      fixtureKey: S.String,
      ground: RejectionGround,
      officeActionFixtureKey: S.String,
    },
    persisted: {
      claimFixtureKey: EntitySchema.persist.text({
        columnName: "claim_fixture_key",
      }),
      fixtureKey: EntitySchema.persist.text({
        columnName: "fixture_key",
      }),
      ground: EntitySchema.persist.jsonb({
        columnName: "ground",
      }),
      officeActionFixtureKey: EntitySchema.persist.text({
        columnName: "office_action_fixture_key",
      }),
    },
  },
  $I.annote("Rejection", {
    description: "A statutory rejection raised against a claim by an office action.",
  })
) {}
