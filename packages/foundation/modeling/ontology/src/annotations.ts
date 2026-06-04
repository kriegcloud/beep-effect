import { $OntologyId } from "@beep/identity";
import { A, dual, O, Str } from "@beep/utils";
import { flow, pipe } from "effect";
import * as R from "effect/Record";
import * as S from "effect/Schema";
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
  OntologyIriInput,
  OntologyReferenceTargetInput,
  OntologyTermNameInput,
  optionalReferenceTargets,
  optionalReferenceTargetsOption,
} from "./references.js";
import type { IdentityAnyAnnotationExtras, IdentityComposer, KeyAnnotationExtras } from "@beep/identity";
import type { OntologyMetadataAnnotationPayload, OntologyPredicateAnnotationDraft, OntologyTermName } from "./model.js";

const $I = $OntologyId.create("annotations");

class OntologyClassAnnotationInputFields extends S.Class<OntologyClassAnnotationInputFields>(
  $I`OntologyClassAnnotationInputFields`
)(
  {
    termName: S.optionalKey(OntologyTermNameInput),
    iri: S.optionalKey(OntologyIriInput),
    label: S.optionalKey(S.String),
    description: S.optionalKey(S.String),
    comment: S.optionalKey(S.String),
    altLabels: S.String.pipe(S.Array, S.optionalKey),
    definition: S.optionalKey(S.String),
    deprecated: S.optionalKey(S.Boolean),
    source: S.optionalKey(OntologyIriInput),
    parents: OntologyReferenceTargetInput.pipe(S.Array, S.optionalKey),
    children: OntologyReferenceTargetInput.pipe(S.Array, S.optionalKey),
    seeAlso: OntologyReferenceTargetInput.pipe(S.Array, S.optionalKey),
    isDefinedBy: OntologyReferenceTargetInput.pipe(S.Array, S.optionalKey),
    equivalentClasses: OntologyReferenceTargetInput.pipe(S.Array, S.optionalKey),
    exactMatches: OntologyReferenceTargetInput.pipe(S.Array, S.optionalKey),
    sameAs: OntologyReferenceTargetInput.pipe(S.Array, S.optionalKey),
  },
  $I.annote("OntologyClassAnnotationInputFields", {
    description:
      "Input fields for ontology class annotations, including term name, IRI, label, description, comment, alternative labels, definition, deprecation status, and source IRI.",
  })
) {}

export const OntologyClassAnnotationInput = S.StructWithRest(S.Struct(OntologyClassAnnotationInputFields.fields), [
  S.Record(S.PropertyKey, S.Any),
]).pipe(
  $I.annoteSchema("OntologyClassAnnotationInput", {
    description:
      "Input type for ontology class annotations, including term name, IRI, label, description, comment, alternative labels, definition, deprecation status, and source IRI.",
  })
);

export type OntologyClassAnnotationInput = typeof OntologyClassAnnotationInput.Type;

export class OntologyPredicateAnnotationInputFields extends S.Class<OntologyPredicateAnnotationInputFields>(
  $I`OntologyPredicateAnnotationInputFields`
)(
  {
    termName: S.optionalKey(OntologyTermNameInput),
    iri: S.optionalKey(OntologyIriInput),
    label: S.optionalKey(S.String),
    description: S.optionalKey(S.String),
    comment: S.optionalKey(S.String),
  },
  $I.annote("OntologyPredicateAnnotationInputFields", {
    description:
      "Fields for ontology predicate annotations, including term name, IRI, label, description, comment, alternative labels, definition, deprecation status, and source IRI.",
  })
) {}

export const OntologyPredicateAnnotationInput = S.StructWithRest(
  S.Struct(OntologyPredicateAnnotationInputFields.fields),
  [S.Record(S.PropertyKey, S.Any)]
).pipe(
  $I.annoteSchema("OntologyPredicateAnnotationInput", {
    description:
      "Input type for ontology predicate annotations, including term name, IRI, label, description, comment, alternative labels, definition, deprecation status, and source IRI.",
  })
);
export type OntologyPredicateAnnotationInput = typeof OntologyPredicateAnnotationInput.Type;

export const OntologyDatatypePredicateAnnotationInput = S.StructWithRest(
  S.Struct({
    ...OntologyPredicateAnnotationInputFields.fields,
    range: OntologyIriInput,
  }),
  [S.Record(S.PropertyKey, S.Any)]
).pipe(
  $I.annoteSchema("OntologyDatatypePredicateAnnotationInput", {
    description:
      "Input type for ontology datatype predicate annotations, including term name, IRI, label, description, comment, alternative labels, definition, deprecation status, source IRI, and range (datatype IRI).",
  })
);

export type OntologyDatatypePredicateAnnotationInput = typeof OntologyDatatypePredicateAnnotationInput.Type;

export const OntologyObjectPredicateAnnotationInput = S.StructWithRest(
  S.Struct({
    ...OntologyPredicateAnnotationInputFields.fields,
    range: OntologyReferenceTargetInput,
  }),
  [S.Record(S.PropertyKey, S.Any)]
).pipe(
  $I.annoteSchema("OntologyObjectPredicateAnnotationInput", {
    description:
      "Input type for ontology object predicate annotations, including term name, IRI, label, description, comment, alternative labels, definition, deprecation status, source IRI, and range (reference target IRI).",
  })
);
export type OntologyObjectPredicateAnnotationInput = typeof OntologyObjectPredicateAnnotationInput.Type;

export class OntologyCreateInputFields extends S.Class<OntologyCreateInputFields>($I`OntologyCreateInputFields`)(
  {
    identity: S.declare((u: unknown): u is IdentityComposer<string> => S.is(S.String)(u)),
    baseIri: OntologyIriInput,
    preferredPrefix: S.String,
    label: S.String,
    comment: S.optionalKey(S.String),
  },
  $I.annote("OntologyCreateInputFields", {
    description:
      "Fields for creating an ontology, including identity, base IRI, preferred prefix, label, and optional comment.",
  })
) {}

export type OntologyCreateInput = OntologyCreateInputFields & {};

export const optionalString = (value: string | undefined): O.Option<string> => O.fromUndefinedOr(value);

export const optionalArray = <Value>(value: ReadonlyArray<Value> | undefined): ReadonlyArray<Value> =>
  pipe(O.fromUndefinedOr(value), O.getOrElse(A.empty<Value>));

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

export const predicateLabel = flow(humanizedTermName, Str.toLowerCase);

export const keyLeafTermName = (identifier: string): OntologyTermName =>
  pipe(
    identifier,
    Str.split("."),
    A.last,
    O.getOrElse(() => identifier),
    normalizeTermNameInput
  );

export const draftMetadataComment: {
  (comment: O.Option<string>): (description: O.Option<string>) => O.Option<string>;
  (description: O.Option<string>, comment: O.Option<string>): O.Option<string>;
} = dual(
  2,
  (description: O.Option<string>, comment: O.Option<string>): O.Option<string> =>
    firstStringOption(comment, description)
);

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

  return Object.defineProperties(tag, {
    value: {
      value: identity.value,
      enumerable: true,
      writable: true,
      configurable: true,
    },
    identifier: {
      value: identity.identifier,
      enumerable: true,
      writable: true,
      configurable: true,
    },
    compose: {
      value: identity.compose,
      enumerable: true,
      writable: true,
      configurable: true,
    },
    create: {
      value: identity.create,
      enumerable: true,
      writable: true,
      configurable: true,
    },
    make: {
      value: identity.make,
      enumerable: true,
      writable: true,
      configurable: true,
    },
    string: {
      value: identity.string,
      enumerable: true,
      writable: true,
      configurable: true,
    },
    symbol: {
      value: identity.symbol,
      enumerable: true,
      writable: true,
      configurable: true,
    },
    annote: {
      value: annote,
      enumerable: true,
      writable: true,
      configurable: true,
    },
    annoteSchema: {
      value: identity.annoteSchema,
      enumerable: true,
      writable: true,
      configurable: true,
    },
    annoteKey: {
      value: annoteKey,
      enumerable: true,
      writable: true,
      configurable: true,
    },
    annoteHttp: {
      value: identity.annoteHttp,
      enumerable: true,
      writable: true,
      configurable: true,
    },
  }) as typeof identity & {
    readonly annote: typeof annote;
    readonly annoteKey: typeof annoteKey;
  };
};
