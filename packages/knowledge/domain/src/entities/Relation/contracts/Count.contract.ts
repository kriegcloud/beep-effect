import { $KnowledgeDomainId } from "@beep/identity/packages";
import { CountResult } from "@beep/knowledge-domain/value-objects";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("entities/Relation/contracts/Count.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    organizationId: SharedEntityIds.OrganizationId,
    entityId: S.optional(KnowledgeEntityIds.KnowledgeEntityId),
    predicate: S.optional(S.String),
  },
  $I.annotations("Payload", {
    description: "relation_count payload",
  })
) {}

export class Success extends CountResult.extend<Success>($I`Success`)(
  {},
  $I.annotations("Success", {
    description: "relation_count succeeded",
  })
) {}

export const Failure = S.Never;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "count",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Count relations Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.post("Count", "/count").setPayload(Payload).addSuccess(Success);
}
