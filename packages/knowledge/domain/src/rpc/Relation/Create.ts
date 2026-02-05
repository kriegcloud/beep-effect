import { $KnowledgeDomainId } from "@beep/identity/packages";
import { Relation } from "@beep/knowledge-domain/entities";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("rpc/Relation/Create");

export class Payload extends S.Class<Payload>($I`Payload`)(
  Relation.Model.insert,
  $I.annotations("Payload", {
    description: "relation_create payload",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  Relation.Model.json,
  $I.annotations("Success", {
    description: "relation_create succeeded",
  })
) {}

export const Contract = Rpc.make("create", {
  payload: Payload,
  success: Success,
});
