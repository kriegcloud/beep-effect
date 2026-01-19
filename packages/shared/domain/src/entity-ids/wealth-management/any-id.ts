/**
 * Wealth Management any entity ID union
 *
 * @module wealth-management/entity-ids/any-id
 * @since 0.1.0
 */
import { $SharedDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import * as Ids from "./ids";

const $I = $SharedDomainId.create("entity-ids/wealth-management/any-id");

/**
 * Union of all wealth-management entity IDs.
 *
 * @since 0.1.0
 * @category ids
 */
export class AnyId extends S.Union(
  Ids.WmClientId,
  Ids.WmAccountId,
  Ids.WmInvestmentId,
  Ids.WmTrustId,
  Ids.WmHouseholdId,
  Ids.WmBeneficiaryId,
  Ids.WmCustodianId,
  Ids.WmLegalEntityId
).annotations(
  $I.annotations("AnyWmId", {
    description: "Any entity id within the wealth-management domain context",
  })
) {}

export declare namespace AnyId {
  export type Type = S.Schema.Type<typeof AnyId>;
  export type Encoded = S.Schema.Encoded<typeof AnyId>;
}
