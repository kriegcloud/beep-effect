import { $KnowledgeDomainId } from "@beep/identity/packages";
import { Relation } from "@beep/knowledge-domain/entities";
import { RelationNotFoundError } from "@beep/knowledge-domain/errors";
import { BS } from "@beep/schema";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("rpc/Relation/ListByPredicate");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    predicate: S.String,
    organizationId: SharedEntityIds.OrganizationId,
    ontologyId: S.optional(KnowledgeEntityIds.OntologyId),
    cursor: S.optional(KnowledgeEntityIds.RelationId),
    limit: S.optional(BS.PosInt),
  },
  $I.annotations("Payload", {
    description: "relation_listByPredicate payload",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  Relation.Model.json,
  $I.annotations("Success", {
    description: "relation_listByPredicate succeeded",
  })
) {}

export const Error = RelationNotFoundError.annotations(
  $I.annotations("Error", {
    description: "relation_listByPredicate failed",
  })
);

export const Contract = Rpc.make("listByPredicate", {
  payload: Payload,
  success: Success,
  stream: true,
});
