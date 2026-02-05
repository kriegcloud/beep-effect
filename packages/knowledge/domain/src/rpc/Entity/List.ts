import { $KnowledgeDomainId } from "@beep/identity/packages";
import { Entity } from "@beep/knowledge-domain/entities";
import { BS } from "@beep/schema";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("rpc/Entity/List");

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

export class Success extends S.Class<Success>($I`Success`)(
  Entity.Model.json,
  $I.annotations("Success", {
    description: "entity_list succeeded",
  })
) {}

export const Contract = Rpc.make("list", {
  payload: Payload,
  success: Success,
  stream: true,
});
