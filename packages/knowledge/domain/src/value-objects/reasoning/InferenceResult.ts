import { $KnowledgeDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { Quad } from "../rdf/Quad";

const $I = $KnowledgeDomainId.create("value-objects/reasoning/InferenceResult");

export class InferenceProvenance extends S.Class<InferenceProvenance>($I`InferenceProvenance`)({
  ruleId: S.String.annotations({
    title: "Rule ID",
    description: "Identifier of the inference rule that was applied",
  }),

  sourceQuads: S.Array(S.String).annotations({
    title: "Source Quads",
    description: "Identifiers of quads that triggered this inference",
  }),
}) {}

export class InferenceStats extends S.Class<InferenceStats>($I`InferenceStats`)({
  iterations: S.NonNegativeInt.annotations({
    title: "Iterations",
    description: "Number of rule application iterations",
  }),

  triplesInferred: S.NonNegativeInt.annotations({
    title: "Triples Inferred",
    description: "Total number of new triples generated",
  }),

  durationMs: S.NonNegative.annotations({
    title: "Duration (ms)",
    description: "Execution time in milliseconds",
  }),
}) {}

export class InferenceResult extends S.Class<InferenceResult>($I`InferenceResult`)({
  derivedTriples: S.Array(Quad).annotations({
    title: "Derived Triples",
    description: "RDF quads generated through inference",
  }),

  provenance: S.Record({ key: S.String, value: InferenceProvenance }).annotations({
    title: "Provenance",
    description: "Maps derived triple IDs to their inference provenance",
  }),

  stats: InferenceStats.annotations({
    title: "Statistics",
    description: "Execution statistics for the reasoning operation",
  }),
}) {}

export const emptyInferenceResult = new InferenceResult({
  derivedTriples: [],
  provenance: {},
  stats: new InferenceStats({
    iterations: 0,
    triplesInferred: 0,
    durationMs: 0,
  }),
});
