import { $KnowledgeDomainId } from "@beep/identity/packages";
import { Entity } from "@beep/knowledge-domain/entities";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("rpc/Entity/Create");

export class Payload extends S.Class<Payload>($I`Payload`)(
  Entity.Model.insert,
  $I.annotations("Payload", {
    description: "entity_create payload",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  Entity.Model.json,
  $I.annotations("Success", {
    description: "entity_create succeeded",
  })
) {}

export const Contract = Rpc.make("create", {
  payload: Payload,
  success: Success,
});
