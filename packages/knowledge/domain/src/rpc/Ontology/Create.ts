import { $KnowledgeDomainId } from "@beep/identity/packages";
import { Ontology } from "@beep/knowledge-domain/entities";
import { OntologyMutationError } from "@beep/knowledge-domain/errors";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("rpc/Ontology/Create");

export class Payload extends S.Class<Payload>($I`Payload`)(
  Ontology.Model.insert,
  $I.annotations("Payload", {
    description: "ontology_create payload",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  Ontology.Model.json,
  $I.annotations("Success", {
    description: "ontology_create succeeded",
  })
) {}

export const Error = OntologyMutationError.annotations(
  $I.annotations("Error", {
    description: "ontology_create failed",
  })
);

export const Contract = Rpc.make("create", {
  payload: Payload,
  success: Success,
  error: Error,
});
