import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("entities/SameAsLink/contracts/ResolveCanonical.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    entityId: KnowledgeEntityIds.KnowledgeEntityId,
    organizationId: SharedEntityIds.OrganizationId,
  },
  $I.annotations("Payload", {
    description:
      "Payload for the ResolveCanonical SameAsLink contract (recursive CTE to walk sameAs chains).",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    canonicalId: KnowledgeEntityIds.KnowledgeEntityId,
  },
  $I.annotations("Success", {
    description:
      "Success response for the ResolveCanonical SameAsLink contract. Returns the resolved canonical entity ID (may be the input ID if no chain exists).",
  })
) {}

export const Failure = S.Never;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "ResolveCanonical",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Resolve canonical entity ID via recursive sameAs chain traversal Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.get("ResolveCanonical", "/resolve")
    .setPayload(Payload)
    .addSuccess(Success);
}
