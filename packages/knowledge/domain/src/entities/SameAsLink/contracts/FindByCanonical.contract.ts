import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as SameAsLink from "../SameAsLink.model";

const $I = $KnowledgeDomainId.create("entities/SameAsLink/contracts/FindByCanonical.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    canonicalId: KnowledgeEntityIds.KnowledgeEntityId,
    organizationId: SharedEntityIds.OrganizationId,
  },
  $I.annotations("Payload", {
    description: "Payload for the FindByCanonical SameAsLink contract.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: S.Array(SameAsLink.Model.json),
  },
  $I.annotations("Success", {
    description: "Success response for the FindByCanonical SameAsLink contract.",
  })
) {}

export const Failure = S.Never;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "FindByCanonical",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Find SameAsLinks by canonical entity ID Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.get("FindByCanonical", "/by-canonical")
    .setPayload(Payload)
    .addSuccess(Success);
}
