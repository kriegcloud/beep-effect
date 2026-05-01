/**
 * Legal client entity model.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $LawPracticeDomainId } from "@beep/identity/packages";
import { BaseEntity } from "@beep/shared-domain/entity/BaseEntity";
import * as LawPractice from "@beep/shared-domain/identity/LawPractice";
import { LegalClientProfilePack } from "./LegalClient.values.js";

const $I = $LawPracticeDomainId.create("entities/LegalClient/LegalClient.model");

/**
 * Legal client context.
 *
 * @example
 * ```ts
 * import { LegalClient } from "@beep/law-practice-domain"
 *
 * console.log(LegalClient.definition.entityId.tableName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class LegalClient extends BaseEntity.extend<LegalClient>($I`LegalClient`)(
  LawPractice.LegalClientId,
  LegalClientProfilePack,
  {},
  $I.annote("LegalClient", {
    description: "Legal client context.",
  })
) {}
