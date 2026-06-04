import * as P from "effect/Predicate";
import * as R from "effect/Record";
import {
  createOntologyIdentity,
  makeClassDraft,
  makeDatatypePredicateDraft,
  makeObjectPredicateDraft,
  optionalString,
} from "./annotations.js";
import { assembleOntology } from "./assembly.js";
import { makeOntologyDefinitionMetadata, makeTermIri } from "./model.js";
import { parseJsonLdOntology, projectJsonLdOntology } from "./projections/jsonld.js";
import { projectTurtle } from "./projections/turtle.js";
import { makeReferenceTarget, normalizeIriInput, normalizeTermNameInput } from "./references.js";
import type { Effect } from "effect";
import type * as A from "effect/Array";
import type * as S from "effect/Schema";
import type {
  OntologyClassAnnotationInput,
  OntologyCreateInput,
  OntologyDatatypePredicateAnnotationInput,
  OntologyObjectPredicateAnnotationInput,
} from "./annotations.js";
import type {
  AssembledOntology,
  IRI,
  OntologyAssemblyError,
  OntologyClassAnnotationDraft,
  OntologyDatatypePredicateAnnotationDraft,
  OntologyObjectPredicateAnnotationDraft,
  OntologyReferenceTarget,
} from "./model.js";
import type { OntologyIriInput, OntologyReferenceTargetInput, OntologyTermNameInput } from "./references.js";

export const Ontology = {
  create: (input: OntologyCreateInput) => {
    const baseIri = normalizeIriInput(input.baseIri);
    const metadata = makeOntologyDefinitionMetadata({
      kind: "ontology",
      schemaIdentity: input.identity.string(),
      baseIri,
      preferredPrefix: input.preferredPrefix,
      label: input.label,
      ...R.getSomes({ comment: optionalString(input.comment) }),
    });
    const Ont = {
      termName: normalizeTermNameInput,
      iri: (value: OntologyIriInput, termName?: OntologyTermNameInput): IRI =>
        P.isUndefined(termName)
          ? normalizeIriInput(value)
          : makeTermIri(normalizeIriInput(value), normalizeTermNameInput(termName)),
      ref: (target: OntologyReferenceTargetInput): OntologyReferenceTarget => makeReferenceTarget(target),
      parent: (target: OntologyReferenceTargetInput): OntologyReferenceTarget => makeReferenceTarget(target),
      child: (target: OntologyReferenceTargetInput): OntologyReferenceTarget => makeReferenceTarget(target),
      equivalentClass: (target: OntologyReferenceTargetInput): OntologyReferenceTarget => makeReferenceTarget(target),
      exactMatch: (target: OntologyReferenceTargetInput): OntologyReferenceTarget => makeReferenceTarget(target),
      exact: (target: OntologyReferenceTargetInput): OntologyReferenceTarget => makeReferenceTarget(target),
      closeMatch: (target: OntologyReferenceTargetInput): OntologyReferenceTarget => makeReferenceTarget(target),
      sameAs: (target: OntologyReferenceTargetInput): OntologyReferenceTarget => makeReferenceTarget(target),
      class: (classInput: OntologyClassAnnotationInput): OntologyClassAnnotationDraft => makeClassDraft(classInput),
      dataPredicate: (predicate: OntologyDatatypePredicateAnnotationInput): OntologyDatatypePredicateAnnotationDraft =>
        makeDatatypePredicateDraft(predicate),
      objectPredicate: (predicate: OntologyObjectPredicateAnnotationInput): OntologyObjectPredicateAnnotationDraft =>
        makeObjectPredicateDraft(predicate),
      build: (schemas: A.NonEmptyReadonlyArray<S.Top>): Effect.Effect<AssembledOntology, OntologyAssemblyError> =>
        assembleOntology(metadata, schemas),
      toJsonLD: projectJsonLdOntology,
      fromJsonLD: parseJsonLdOntology,
      toTurtle: projectTurtle,
    };
    const $I = createOntologyIdentity(input.identity);

    return { Ont, $I, metadata };
  },
};
