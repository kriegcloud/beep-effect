import { $DocumentsDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as DocumentSource from "../DocumentSource.model";

const $I = $DocumentsDomainId.create("entities/DocumentSource/contracts/FindByMappingKey.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    organizationId: SharedEntityIds.OrganizationId,
    providerAccountId: IamEntityIds.AccountId,
    sourceType: S.String,
    sourceId: S.String,
    includeDeleted: BS.BoolWithDefault(false),
  },
  $I.annotations("Payload", {
    description: "Payload for the FindByMappingKey DocumentSource contract.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: BS.FieldOptionOmittable(DocumentSource.Model.json),
  },
  $I.annotations("Success", {
    description: "Success response for the FindByMappingKey DocumentSource contract. Data is absent when no matching source exists.",
  })
) {}

export const Failure = S.Never;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "FindByMappingKey",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "FindByMappingKey DocumentSource Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.get("FindByMappingKey", "/by-mapping-key")
    .setPayload(Payload)
    .addSuccess(Success);
}
