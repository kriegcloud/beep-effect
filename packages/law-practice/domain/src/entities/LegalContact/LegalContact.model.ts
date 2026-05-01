/**
 * Legal contact entity model.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $LawPracticeDomainId } from "@beep/identity/packages";
import { BaseEntity } from "@beep/shared-domain/entity/BaseEntity";
import * as LawPractice from "@beep/shared-domain/identity/LawPractice";
import { LegalContactProfilePack } from "./LegalContact.values.js";

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
export class LegalContact extends BaseEntity.extend<LegalContact>($I`LegalContact`)(
  LawPractice.LegalContactId,
  LegalContactProfilePack,
  {},
  $I.annote("LegalContact", {
    description: "Legal contact context.",
  })
) {}
