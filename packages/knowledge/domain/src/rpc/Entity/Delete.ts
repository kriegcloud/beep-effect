import { $KnowledgeDomainId } from "@beep/identity/packages";
import { EntityNotFoundError } from "@beep/knowledge-domain/errors";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("rpc/Entity/Delete");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: KnowledgeEntityIds.KnowledgeEntityId,
    organizationId: SharedEntityIds.OrganizationId,
  },
  $I.annotations("Payload", {
    description: "entity_delete payload",
  })
) {}

export const Error = EntityNotFoundError.annotations(
  $I.annotations("Error", {
    description: "entity_delete failed",
  })
);

export const Contract = Rpc.make("delete", {
  payload: Payload,
  error: Error,
});
