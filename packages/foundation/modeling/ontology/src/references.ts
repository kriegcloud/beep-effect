import { NamedNode } from "@beep/rdf/Rdf";
import { Effect, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import {
  isOntologyReference,
  isOntologyReferenceTarget,
  makeIri,
  makeOntologyReference,
  makeOntologyTermName,
  makeTermIri,
  OntologyAssemblyError,
  OntologyIriReferenceTarget,
  OntologySchemaReferenceTarget,
  OntologyTermReferenceTarget,
} from "./model.js";
import type {
  IRI,
  OntologyAssemblyErrorReason,
  OntologyReference,
  OntologyReferenceTarget,
  OntologyTermName,
} from "./model.js";

const isNamedNode = S.is(NamedNode);

export type OntologyIriInput = string | NamedNode;
export type OntologyTermNameInput = string | OntologyTermName;
export type OntologyReferenceTargetInput =
  | OntologyIriInput
  | OntologyTermNameInput
  | OntologyReference
  | OntologyReferenceTarget
  | S.Top;

type ReferenceResolutionContextFields = {
  readonly baseIri: IRI;
  readonly classesBySchemaIdentity: Readonly<Record<string, { readonly iri: IRI }>>;
};
export type ReferenceResolutionContext = ReferenceResolutionContextFields & {};

export const schemaIdentifier = (schema: S.Top): O.Option<string> =>
  pipe(S.resolveAnnotations(schema)?.identifier, O.fromUndefinedOr, O.filter(P.isString));

export const schemaIdentity = (schema: S.Top): O.Option<string> =>
  pipe(
    S.resolveAnnotations(schema)?.schemaId,
    O.fromUndefinedOr,
    O.filter(P.isSymbol),
    O.flatMap((current) => O.fromUndefinedOr(current.description))
  );

export const schemaKeyIdentifier = (schema: S.Top): O.Option<string> =>
  pipe(S.resolveAnnotationsKey(schema)?.identifier, O.fromUndefinedOr, O.filter(P.isString));

export const schemaKeyIdentity = (schema: S.Top): O.Option<string> =>
  pipe(
    S.resolveAnnotationsKey(schema)?.schemaId,
    O.fromUndefinedOr,
    O.filter(P.isSymbol),
    O.flatMap((current) => O.fromUndefinedOr(current.description))
  );

export const normalizeIriInput = (value: OntologyIriInput): IRI => (isNamedNode(value) ? value.value : makeIri(value));

export const normalizeTermNameInput = (value: OntologyTermNameInput): OntologyTermName => makeOntologyTermName(value);

export const makeReferenceTarget = (target: OntologyReferenceTargetInput): OntologyReferenceTarget => {
  if (isOntologyReferenceTarget(target)) {
    return target;
  }

  if (isOntologyReference(target)) {
    return OntologyIriReferenceTarget.make({ kind: "iri", iri: target.iri });
  }

  if (isNamedNode(target)) {
    return OntologyIriReferenceTarget.make({ kind: "iri", iri: target.value });
  }

  if (P.isString(target)) {
    return pipe(target, Str.includes(":"))
      ? OntologyIriReferenceTarget.make({ kind: "iri", iri: makeIri(target) })
      : OntologyTermReferenceTarget.make({ kind: "term", termName: makeOntologyTermName(target) });
  }

  return OntologySchemaReferenceTarget.make({
    kind: "schema",
    schemaIdentity: schemaIdentity(target),
    identifier: schemaIdentifier(target),
  });
};

export const optionalReferenceTargets = (
  value: ReadonlyArray<OntologyReferenceTargetInput> | undefined
): ReadonlyArray<OntologyReferenceTarget> =>
  pipe(O.fromUndefinedOr(value), O.getOrElse(A.empty<OntologyReferenceTargetInput>), A.map(makeReferenceTarget));

export const optionalReferenceTargetsOption = (
  value: ReadonlyArray<OntologyReferenceTargetInput> | undefined
): O.Option<ReadonlyArray<OntologyReferenceTarget>> =>
  pipe(O.fromUndefinedOr(value), O.map(A.map(makeReferenceTarget)));

type FailAssemblyInput = {
  readonly reason: OntologyAssemblyErrorReason;
  readonly message: string;
  readonly schemaIdentifier: O.Option<string>;
  readonly fieldName?: O.Option<string> | undefined;
};

export const failAssembly = (input: FailAssemblyInput): Effect.Effect<never, OntologyAssemblyError> =>
  Effect.fail(
    OntologyAssemblyError.make({
      reason: input.reason,
      message: input.message,
      schemaIdentifier: input.schemaIdentifier,
      fieldName: pipe(
        O.fromUndefinedOr(input.fieldName),
        O.getOrElse(() => O.none<string>())
      ),
    })
  );

export const resolveReferenceTarget = Effect.fn("Ontology.resolveReferenceTarget")(function* (
  context: ReferenceResolutionContext,
  ownerSchemaId: O.Option<string>,
  target: OntologyReferenceTarget
) {
  if (target.kind === "iri") {
    return makeOntologyReference(target.iri);
  }

  if (target.kind === "term") {
    return makeOntologyReference(makeTermIri(context.baseIri, target.termName));
  }

  const targetSchemaIdentity = yield* pipe(
    target.schemaIdentity,
    O.match({
      onNone: () =>
        failAssembly({
          reason: "unresolvedReferenceTarget",
          message: "Relationship target schema is missing identity metadata.",
          schemaIdentifier: ownerSchemaId,
        }),
      onSome: Effect.succeed,
    })
  );

  return yield* pipe(
    R.get(context.classesBySchemaIdentity, targetSchemaIdentity),
    O.map((metadata) => makeOntologyReference(metadata.iri)),
    O.match({
      onNone: () =>
        failAssembly({
          reason: "unresolvedReferenceTarget",
          message: `Relationship target schema was not included in this ontology build: ${targetSchemaIdentity}`,
          schemaIdentifier: ownerSchemaId,
        }),
      onSome: Effect.succeed,
    })
  );
});

type ResolveReferenceTargetsInput = {
  readonly context: ReferenceResolutionContext;
  readonly ownerSchemaId: O.Option<string>;
  readonly targets: ReadonlyArray<OntologyReferenceTarget>;
};

export const resolveReferenceTargets = (
  input: ResolveReferenceTargetsInput
): Effect.Effect<ReadonlyArray<OntologyReference>, OntologyAssemblyError> =>
  Effect.forEach(input.targets, (target) => resolveReferenceTarget(input.context, input.ownerSchemaId, target), {
    concurrency: 1,
  });
