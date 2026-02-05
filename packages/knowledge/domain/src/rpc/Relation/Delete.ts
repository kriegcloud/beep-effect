import { $KnowledgeDomainId } from "@beep/identity/packages";
import { RelationNotFoundError } from "@beep/knowledge-domain/errors";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("rpc/Relation/Delete");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: KnowledgeEntityIds.RelationId,
    organizationId: SharedEntityIds.OrganizationId,
  },
  $I.annotations("Payload", {
    description: "relation_delete payload",
  })
) {}

export const Error = RelationNotFoundError.annotations(
  $I.annotations("Error", {
    description: "relation_delete failed",
  })
);

export const Contract = Rpc.make("delete", {
  payload: Payload,
  error: Error,
});
