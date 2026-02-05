import { $KnowledgeDomainId } from "@beep/identity/packages";
import { Entity } from "@beep/knowledge-domain/entities";
import { EntityNotFoundError } from "@beep/shared-domain/errors";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("rpc/Entity/Update");

export class Payload extends S.Class<Payload>($I`Payload`)(
  Entity.Model.update,
  $I.annotations("Payload", {
    description: "entity_update payload",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  Entity.Model.json,
  $I.annotations("Success", {
    description: "entity_update succeeded",
  })
) {}

export class Error extends EntityNotFoundError.annotations(
  $I.annotations("Error", {
    description: "entity_update failed",
  })
) {}

export const Contract = Rpc.make("update", {
  payload: Payload,
  success: Success,
  error: Error,
});
