import { $KnowledgeDomainId } from "@beep/identity/packages";
import { Ontology } from "@beep/knowledge-domain/entities";
import { OntologyMutationError, OntologyNotFoundError } from "@beep/knowledge-domain/errors";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("rpc/Ontology/Update");

export class Payload extends S.Class<Payload>($I`Payload`)(
  Ontology.Model.update,
  $I.annotations("Payload", {
    description: "ontology_update payload",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  Ontology.Model.json,
  $I.annotations("Success", {
    description: "ontology_update succeeded",
  })
) {}

export const Error = S.Union(OntologyNotFoundError, OntologyMutationError).annotations(
  $I.annotations("Error", {
    description: "ontology_update failed",
  })
);

export declare namespace Error {
  export type Type = typeof Error.Type;
  export type Encoded = typeof Error.Encoded;
}
export const Contract = Rpc.make("update", {
  payload: Payload,
  success: Success,
  error: Error,
});
