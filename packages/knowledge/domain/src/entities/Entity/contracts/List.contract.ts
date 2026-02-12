import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as RpcSchema from "@effect/rpc/RpcSchema";
import * as S from "effect/Schema";
import { Model } from "../Entity.model";

const $I = $KnowledgeDomainId.create("entities/Entity/contracts/List.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    organizationId: SharedEntityIds.OrganizationId,
    ontologyId: S.optional(KnowledgeEntityIds.OntologyId),
    type: S.optional(S.String),
    cursor: S.optional(KnowledgeEntityIds.KnowledgeEntityId),
    limit: S.optional(BS.PosInt),
  },
  $I.annotations("Payload", {
    description: "entity_list payload",
  })
) {}

export class SuccessElement extends S.Class<SuccessElement>($I`SuccessElement`)(
  Model.json,
  $I.annotations("SuccessElement", {
    description: "entity_list succeeded",
  })
) {}

export const Success = RpcSchema.Stream({ success: SuccessElement, failure: S.Never });
export type Success = S.Schema.Type<typeof Success>;

export const Failure = S.Never;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "list",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotations("Contract", {
    description: "List entities Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
}
