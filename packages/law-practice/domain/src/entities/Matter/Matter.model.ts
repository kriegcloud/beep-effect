/**
 * Legal matter entity model.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $LawPracticeDomainId } from "@beep/identity/packages";
import { BaseEntity } from "@beep/shared-domain/entity/BaseEntity";
import * as LawPractice from "@beep/shared-domain/identity/LawPractice";
import { MatterProfilePack } from "./Matter.values.js";

const $I = $LawPracticeDomainId.create("entities/Matter/Matter.model");

/**
 * Legal matter context.
 *
 * @example
 * ```ts
 * import { Matter } from "@beep/law-practice-domain"
 *
 * console.log(Matter.definition.entityId.tableName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class Matter extends BaseEntity.extend<Matter>($I`Matter`)(
  LawPractice.MatterId,
  MatterProfilePack,
  {},
  $I.annote("Matter", {
    description: "Legal matter context.",
  })
) {}
