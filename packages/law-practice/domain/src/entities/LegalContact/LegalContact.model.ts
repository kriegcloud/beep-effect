/**
 * Legal contact entity model.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $LawPracticeDomainId } from "@beep/identity/packages";
import * as EntitySchema from "@beep/schema/EntitySchema";
import { BaseEntity } from "@beep/shared-domain/entity/BaseEntity";
import * as LawPractice from "@beep/shared-domain/identity/LawPractice";
import * as S from "effect/Schema";
import { LegalContactRole } from "./LegalContact.values.js";

const $I = $LawPracticeDomainId.create("entities/LegalContact/LegalContact.model");

/**
 * Legal contact context.
 *
 * @example
 * ```ts
 * import { LegalContact } from "@beep/law-practice-domain"
 *
 * console.log(LegalContact.definition.entityId.resource)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class LegalContact extends BaseEntity.Class<LegalContact>($I`LegalContact`)(
  LawPractice.LegalContactId,
  {
    fields: {
      displayName: S.String,
      fixtureKey: S.String,
      legalClientFixtureKey: S.String,
      role: LegalContactRole,
    },
    persisted: {
      displayName: EntitySchema.persist.text({
        columnName: "display_name",
      }),
      fixtureKey: EntitySchema.persist.text({
        columnName: "fixture_key",
      }),
      legalClientFixtureKey: EntitySchema.persist.text({
        columnName: "legal_client_fixture_key",
      }),
      role: EntitySchema.persist.literal({
        columnName: "role",
      }),
    },
  },
  $I.annote("LegalContact", {
    description: "Legal contact context.",
  })
) {}
