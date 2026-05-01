/**
 * Patent asset entity model.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $LawPracticeDomainId } from "@beep/identity/packages";
import { BaseEntity } from "@beep/shared-domain/entity/BaseEntity";
import * as LawPractice from "@beep/shared-domain/identity/LawPractice";
import { PatentAssetProfilePack } from "./PatentAsset.values.js";

const $I = $LawPracticeDomainId.create("entities/PatentAsset/PatentAsset.model");

/**
 * Patent asset context.
 *
 * @example
 * ```ts
 * import { PatentAsset } from "@beep/law-practice-domain"
 *
 * console.log(PatentAsset.definition.entityId.resource)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class PatentAsset extends BaseEntity.extend<PatentAsset>($I`PatentAsset`)(
  LawPractice.PatentAssetId,
  PatentAssetProfilePack,
  {},
  $I.annote("PatentAsset", {
    description: "Patent asset context.",
  })
) {}
