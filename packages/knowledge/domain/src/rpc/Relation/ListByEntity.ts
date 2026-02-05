import { $KnowledgeDomainId } from "@beep/identity/packages";
import { Relation } from "@beep/knowledge-domain/entities";
import { RelationDirection } from "@beep/knowledge-domain/value-objects";
import { BS } from "@beep/schema";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("rpc/Relation/ListByEntity");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    entityId: KnowledgeEntityIds.KnowledgeEntityId,
    organizationId: SharedEntityIds.OrganizationId,
    direction: S.optional(RelationDirection),
    limit: S.optional(BS.PosInt),
  },
  $I.annotations("Payload", {
    description: "relation_listByEntity payload",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  Relation.Model.json,
  $I.annotations("Success", {
    description: "relation_listByEntity succeeded",
  })
) {}

export const Contract = Rpc.make("listByEntity", {
  payload: Payload,
  success: Success,
  stream: true,
});
