import { $KnowledgeDomainId } from "@beep/identity/packages";
import { Relation } from "@beep/knowledge-domain/entities";
import { RelationNotFoundError } from "@beep/knowledge-domain/errors";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("rpc/Relation/Get");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: KnowledgeEntityIds.RelationId,
    organizationId: SharedEntityIds.OrganizationId,
  },
  $I.annotations("Payload", {
    description: "relation_get payload",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  Relation.Model.json,
  $I.annotations("Success", {
    description: "relation_get succeeded",
  })
) {}

export const Error = RelationNotFoundError.annotations(
  $I.annotations("Error", {
    description: "relation_get failed",
  })
);

export const Contract = Rpc.make("get", {
  payload: Payload,
  success: Success,
  error: Error,
});
