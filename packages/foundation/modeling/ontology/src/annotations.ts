import { pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as Str from "effect/String";
import {
  isOntologyClassAnnotationDraft,
  isOntologyPredicateAnnotationDraft,
  OntologyClassAnnotationDraft,
  OntologyDatatypePredicateAnnotationDraft,
  OntologyObjectPredicateAnnotationDraft,
} from "./model.js";
import {
  makeReferenceTarget,
  normalizeIriInput,
  normalizeTermNameInput,
  optionalReferenceTargets,
  optionalReferenceTargetsOption,
} from "./references.js";
import type { IdentityAnyAnnotationExtras, IdentityComposer, KeyAnnotationExtras } from "@beep/identity";
import type * as S from "effect/Schema";
import type { OntologyMetadataAnnotationPayload, OntologyPredicateAnnotationDraft, OntologyTermName } from "./model.js";
import type { OntologyIriInput, OntologyReferenceTargetInput, OntologyTermNameInput } from "./references.js";

export type OntologyClassAnnotationInput = {
  readonly termName?: OntologyTermNameInput | undefined;
  readonly iri?: OntologyIriInput | undefined;
  readonly label?: string | undefined;
  readonly description?: string | undefined;
  readonly comment?: string | undefined;
  readonly altLabels?: ReadonlyArray<string> | undefined;
  readonly definition?: string | undefined;
  readonly deprecated?: boolean | undefined;
  readonly source?: OntologyIriInput | undefined;
  readonly parents?: ReadonlyArray<OntologyReferenceTargetInput> | undefined;
  readonly children?: ReadonlyArray<OntologyReferenceTargetInput> | undefined;
  readonly seeAlso?: ReadonlyArray<OntologyReferenceTargetInput> | undefined;
  readonly isDefinedBy?: ReadonlyArray<OntologyReferenceTargetInput> | undefined;
  readonly equivalentClasses?: ReadonlyArray<OntologyReferenceTargetInput> | undefined;
  readonly exactMatches?: ReadonlyArray<OntologyReferenceTargetInput> | undefined;
  readonly closeMatches?: ReadonlyArray<OntologyReferenceTargetInput> | undefined;
  readonly sameAs?: ReadonlyArray<OntologyReferenceTargetInput> | undefined;
};

export type OntologyPredicateAnnotationInput = {
  readonly termName?: OntologyTermNameInput | undefined;
  readonly iri?: OntologyIriInput | undefined;
  readonly label?: string | undefined;
  readonly description?: string | undefined;
  readonly comment?: string | undefined;
};

export type OntologyDatatypePredicateAnnotationInput = OntologyPredicateAnnotationInput & {
  readonly range: OntologyIriInput;
};

export type OntologyObjectPredicateAnnotationInput = OntologyPredicateAnnotationInput & {
  readonly range: OntologyReferenceTargetInput;
};

export type OntologyCreateInput = {
  readonly identity: IdentityComposer<string>;
  readonly baseIri: OntologyIriInput;
  readonly preferredPrefix: string;
  readonly label: string;
  readonly comment?: string | undefined;
};

export const optionalString = (value: string | undefined): O.Option<string> => O.fromUndefinedOr(value);

export const optionalArray = <Value>(value: ReadonlyArray<Value> | undefined): ReadonlyArray<Value> =>
  pipe(
    O.fromUndefinedOr(value),
    O.getOrElse(() => A.empty<Value>())
  );

export const optionalTermName = (value: OntologyTermNameInput | undefined): O.Option<OntologyTermName> =>
  pipe(O.fromUndefinedOr(value), O.map(normalizeTermNameInput));

export const optionalIri = (value: OntologyIriInput | undefined) =>
  pipe(O.fromUndefinedOr(value), O.map(normalizeIriInput));

const firstStringOption = (first: O.Option<string>, second: O.Option<string>): O.Option<string> =>
  pipe([first, second], O.firstSomeOf);

export const humanizedTermName = (termName: OntologyTermName): string =>
  pipe(
    termName,
    Str.replace(/([a-z0-9])([A-Z])/g, "$1 $2"),
    Str.replace(/[._-]+/g, " "),
    Str.replace(/\s+/g, " "),
    Str.trim
  );

export const classLabel = (termName: OntologyTermName): string =>
  pipe(humanizedTermName(termName), (label) => `${Str.toUpperCase(Str.slice(0, 1)(label))}${Str.slice(1)(label)}`);

export const predicateLabel = (termName: OntologyTermName): string =>
  pipe(termName, humanizedTermName, Str.toLowerCase);

export const keyLeafTermName = (identifier: string): OntologyTermName =>
  pipe(
    identifier,
    Str.split("."),
    A.last,
    O.getOrElse(() => identifier),
    normalizeTermNameInput
  );

export const draftMetadataComment = (description: O.Option<string>, comment: O.Option<string>): O.Option<string> =>
  firstStringOption(comment, description);

const draftAnnotationExtras = (
  description: O.Option<string>,
  comment: O.Option<string>,
  ontologyMetadata: OntologyMetadataAnnotationPayload
): IdentityAnyAnnotationExtras<unknown> => ({
  ...R.getSomes({ description: firstStringOption(description, comment) }),
  ontologyMetadata,
});

export const makeClassDraft = (input: OntologyClassAnnotationInput): OntologyClassAnnotationDraft =>
  OntologyClassAnnotationDraft.make({
    kind: "classDraft",
    termName: optionalTermName(input.termName),
    iri: optionalIri(input.iri),
    label: optionalString(input.label),
    description: optionalString(input.description),
    comment: optionalString(input.comment),
    altLabels: optionalArray(input.altLabels),
    definition: optionalString(input.definition),
    deprecated: pipe(
      O.fromUndefinedOr(input.deprecated),
      O.getOrElse(() => false)
    ),
    source: optionalIri(input.source),
    parents: optionalReferenceTargets(input.parents),
    children: optionalReferenceTargets(input.children),
    seeAlso: optionalReferenceTargets(input.seeAlso),
    isDefinedBy: optionalReferenceTargetsOption(input.isDefinedBy),
    equivalentClasses: optionalReferenceTargets(input.equivalentClasses),
    exactMatches: optionalReferenceTargets(input.exactMatches),
    closeMatches: optionalReferenceTargets(input.closeMatches),
    sameAs: optionalReferenceTargets(input.sameAs),
  });

export const makeDatatypePredicateDraft = (
  input: OntologyDatatypePredicateAnnotationInput
): OntologyDatatypePredicateAnnotationDraft =>
  OntologyDatatypePredicateAnnotationDraft.make({
    kind: "datatypePredicateDraft",
    termName: optionalTermName(input.termName),
    iri: optionalIri(input.iri),
    label: optionalString(input.label),
    description: optionalString(input.description),
    comment: optionalString(input.comment),
    rangeDatatypeIri: normalizeIriInput(input.range),
  });

export const makeObjectPredicateDraft = (
  input: OntologyObjectPredicateAnnotationInput
): OntologyObjectPredicateAnnotationDraft =>
  OntologyObjectPredicateAnnotationDraft.make({
    kind: "objectPredicateDraft",
    termName: optionalTermName(input.termName),
    iri: optionalIri(input.iri),
    label: optionalString(input.label),
    description: optionalString(input.description),
    comment: optionalString(input.comment),
    rangeClass: makeReferenceTarget(input.range),
  });

export const createOntologyIdentity = (identity: IdentityComposer<string>) => {
  function annote(identifier: string, draft: OntologyClassAnnotationDraft): S.Annotations.Annotations;
  function annote(
    identifier: string,
    extras?: undefined | IdentityAnyAnnotationExtras<unknown>
  ): S.Annotations.Annotations;
  function annote(
    identifier: string,
    extras?: undefined | IdentityAnyAnnotationExtras<unknown> | OntologyClassAnnotationDraft
  ): S.Annotations.Annotations {
    if (extras !== undefined && isOntologyClassAnnotationDraft(extras)) {
      return identity.annote(identifier, draftAnnotationExtras(extras.description, extras.comment, extras));
    }

    return identity.annote(identifier, extras);
  }

  function annoteKey(
    identifier: string,
    draft: OntologyPredicateAnnotationDraft
  ): <Schema extends S.Top>(self: Schema) => Schema["Rebuild"];
  function annoteKey(
    identifier: string,
    extras?: undefined | KeyAnnotationExtras<unknown>
  ): <Schema extends S.Top>(self: Schema) => Schema["Rebuild"];
  function annoteKey(
    identifier: string,
    extras?: undefined | KeyAnnotationExtras<unknown> | OntologyPredicateAnnotationDraft
  ): <Schema extends S.Top>(self: Schema) => Schema["Rebuild"] {
    if (extras !== undefined && isOntologyPredicateAnnotationDraft(extras)) {
      return identity.annoteKey(identifier, draftAnnotationExtras(extras.description, extras.comment, extras));
    }

    return identity.annoteKey(identifier, extras);
  }

  const tag = (strings: TemplateStringsArray, ...values: ReadonlyArray<unknown>) => identity(strings, ...values);

  return Object.assign(tag, identity, {
    annote,
    annoteKey,
  });
};
