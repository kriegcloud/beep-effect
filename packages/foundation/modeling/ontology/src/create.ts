import { Effect } from "effect";
import * as A from "effect/Array";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import {
  createOntologyIdentity,
  makeClassDraft,
  makeDatatypePredicateDraft,
  makeObjectPredicateDraft,
  optionalString,
  type OntologyClassAnnotationInput,
  type OntologyCreateInput,
  type OntologyDatatypePredicateAnnotationInput,
  type OntologyObjectPredicateAnnotationInput,
} from "./annotations.js";
import { assembleOntology } from "./assembly.js";
import {
  type AssembledOntology,
  type IRI,
  makeOntologyDefinitionMetadata,
  makeTermIri,
  type OntologyAssemblyError,
  OntologyClassAnnotationDraft,
  OntologyDatatypePredicateAnnotationDraft,
  OntologyObjectPredicateAnnotationDraft,
  type OntologyReferenceTarget,
} from "./model.js";
import {
  makeReferenceTarget,
  normalizeIriInput,
  normalizeTermNameInput,
  type OntologyIriInput,
  type OntologyReferenceTargetInput,
  type OntologyTermNameInput,
} from "./references.js";
import { parseJsonLdOntology, projectJsonLdOntology } from "./projections/jsonld.js";
import { projectTurtle } from "./projections/turtle.js";

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
        P.isUndefined(termName) ? normalizeIriInput(value) : makeTermIri(normalizeIriInput(value), normalizeTermNameInput(termName)),
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
