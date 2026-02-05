import { $KnowledgeDomainId } from "@beep/identity/packages";
import { Entity } from "@beep/knowledge-domain/entities";
import { EntityNotFoundError } from "@beep/knowledge-domain/errors";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("rpc/Entity/Get");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: KnowledgeEntityIds.KnowledgeEntityId,
    organizationId: SharedEntityIds.OrganizationId,
  },
  $I.annotations("Payload", {
    description: "entity_get payload",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  Entity.Model.json,
  $I.annotations("Success", {
    description: "entity_get succeeded",
  })
) {}

export const Error = EntityNotFoundError.annotations(
  $I.annotations("Error", {
    description: "entity_get failed",
  })
);

export const Contract = Rpc.make("get", {
  payload: Payload,
  success: Success,
  error: Error,
});
