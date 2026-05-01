/**
 * Usage record entity model.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $EpistemicDomainId } from "@beep/identity/packages";
import { BaseEntity } from "@beep/shared-domain/entity/BaseEntity";
import * as Epistemic from "@beep/shared-domain/identity/Epistemic";
import { UsageRecordProfilePack } from "./UsageRecord.values.js";

const $I = $EpistemicDomainId.create("entities/UsageRecord/UsageRecord.model");

/**
 * Usage attribution record for a fixture agent run.
 *
 * @example
 * ```ts
 * import { UsageRecord } from "@beep/epistemic-domain"
 *
 * console.log(UsageRecord.definition.entityId.tableName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class UsageRecord extends BaseEntity.extend<UsageRecord>($I`UsageRecord`)(
  Epistemic.UsageRecordId,
  UsageRecordProfilePack,
  {},
  $I.annote("UsageRecord", {
    description: "Usage attribution record for a fixture agent run.",
  })
) {}
