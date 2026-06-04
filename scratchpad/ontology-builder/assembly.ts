import { Effect, pipe, SchemaAST } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import {
  AssembledDatatypePredicate,
  AssembledObjectPredicate,
  AssembledOntology,
  AssembledOntologyClass,
  type AssembledOntologyPredicate,
  type IRI,
  getOntologyKeyMetadata,
  getOntologyMetadata,
  isOntologyClassAnnotationDraft,
  isOntologyPredicateAnnotationDraft,
  makeOntologyClassMetadata,
  makeOntologyDatatypePredicateMetadata,
  makeOntologyObjectPredicateMetadata,
  makeOntologyTermName,
  makeTermIri,
  OntologyClassAnnotationDraft,
  type OntologyClassMetadata,
  type OntologyDefinitionMetadata,
  OntologyIriReferenceTarget,
  type OntologyPredicateAnnotationDraft,
  type OntologyPredicateMetadata,
} from "./model.js";
import {
  classLabel,
  draftMetadataComment,
  keyLeafTermName,
  predicateLabel,
} from "./annotations.js";
import {
  failAssembly,
  resolveReferenceTargets,
  schemaIdentifier,
  schemaIdentity,
  schemaKeyIdentifier,
  schemaKeyIdentity,
  type ReferenceResolutionContext,
} from "./references.js";

type ClassAssemblySeed = {
  readonly schema: S.Top;
  readonly schemaIdentity: string;
  readonly identifier: string;
  readonly termName: ReturnType<typeof makeOntologyTermName>;
  readonly iri: IRI;
  readonly draft: OntologyClassAnnotationDraft;
};

const requireSchemaIdentifier = Effect.fn("ScratchpadOntology.requireSchemaIdentifier")(function* (schema: S.Top) {
  return yield* pipe(
    schemaIdentifier(schema),
    O.match({
      onNone: () =>
        failAssembly("invalidClassMetadata", "Schema is missing identity annotation identifier.", O.none()),
      onSome: Effect.succeed,
    })
  );
});

const requireSchemaIdentity = Effect.fn("ScratchpadOntology.requireSchemaIdentity")(function* (schema: S.Top) {
  return yield* pipe(
    schemaIdentity(schema),
    O.match({
      onNone: () =>
        failAssembly("invalidClassMetadata", "Schema is missing identity annotation schemaId.", schemaIdentifier(schema)),
      onSome: Effect.succeed,
    })
  );
});

const requireClassDraft = Effect.fn("ScratchpadOntology.requireClassDraft")(function* (schema: S.Top) {
  const metadata = getOntologyMetadata(schema);
  if (metadata === undefined) {
    return yield* failAssembly(
      "missingClassMetadata",
      "Schema is missing ontology class metadata.",
      schemaIdentifier(schema)
    );
  }

  if (isOntologyClassAnnotationDraft(metadata)) {
    return metadata;
  }

  return yield* failAssembly(
    "invalidClassMetadata",
    "Schema ontology metadata is not class authoring metadata.",
    schemaIdentifier(schema)
  );
});

const classAssemblySeed = Effect.fn("ScratchpadOntology.classAssemblySeed")(function* (
  baseIri: IRI,
  schema: S.Top
) {
  const draft = yield* requireClassDraft(schema);
  const identifier = yield* requireSchemaIdentifier(schema);
  const currentSchemaIdentity = yield* requireSchemaIdentity(schema);
  const termName = pipe(
    draft.termName,
    O.getOrElse(() => makeOntologyTermName(identifier))
  );
  const iri = pipe(
    draft.iri,
    O.getOrElse(() => makeTermIri(baseIri, termName))
  );

  return {
    schema,
    schemaIdentity: currentSchemaIdentity,
    identifier,
    termName,
    iri,
    draft,
  } satisfies ClassAssemblySeed;
});

const classReferenceIndex = (seeds: ReadonlyArray<ClassAssemblySeed>): ReferenceResolutionContext["classesBySchemaIdentity"] =>
  pipe(
    seeds,
    A.reduce(R.empty<string, { readonly iri: IRI }>(), (current, seed) =>
      R.set(current, seed.schemaIdentity, { iri: seed.iri })
    )
  );

const finalizeClassMetadata = Effect.fn("ScratchpadOntology.finalizeClassMetadata")(function* (
  context: ReferenceResolutionContext,
  seed: ClassAssemblySeed
) {
  const ownerSchemaId = O.some(seed.schemaIdentity);
  const draft = seed.draft;
  const comment = draftMetadataComment(draft.description, draft.comment);
  const defaultIsDefinedBy = [OntologyIriReferenceTarget.make({ kind: "iri", iri: seed.iri })];

  const parents = yield* resolveReferenceTargets(context, ownerSchemaId, draft.parents);
  const children = yield* resolveReferenceTargets(context, ownerSchemaId, draft.children);
  const seeAlso = yield* resolveReferenceTargets(context, ownerSchemaId, draft.seeAlso);
  const isDefinedBy = yield* resolveReferenceTargets(
    context,
    ownerSchemaId,
    pipe(
      draft.isDefinedBy,
      O.getOrElse(() => defaultIsDefinedBy)
    )
  );
  const equivalentClasses = yield* resolveReferenceTargets(context, ownerSchemaId, draft.equivalentClasses);
  const exactMatches = yield* resolveReferenceTargets(context, ownerSchemaId, draft.exactMatches);
  const closeMatches = yield* resolveReferenceTargets(context, ownerSchemaId, draft.closeMatches);
  const sameAs = yield* resolveReferenceTargets(context, ownerSchemaId, draft.sameAs);

  return makeOntologyClassMetadata({
    kind: "class",
    schemaIdentity: seed.schemaIdentity,
    termName: seed.termName,
    iri: seed.iri,
    label: pipe(
      draft.label,
      O.getOrElse(() => classLabel(seed.termName))
    ),
    altLabels: draft.altLabels,
    deprecated: draft.deprecated,
    parents,
    children,
    seeAlso,
    isDefinedBy,
    equivalentClasses,
    exactMatches,
    closeMatches,
    sameAs,
    ...R.getSomes({ comment }),
    ...R.getSomes({ definition: draft.definition }),
    ...R.getSomes({ source: draft.source }),
  });
});

const objectAstFromSchema = (schema: S.Top): O.Option<SchemaAST.Objects> => {
  if (SchemaAST.isObjects(schema.ast)) {
    return O.some(schema.ast);
  }

  if (SchemaAST.isDeclaration(schema.ast)) {
    return pipe(schema.ast.typeParameters, A.findFirst(SchemaAST.isObjects));
  }

  return O.none();
};

const requireObjectAst = Effect.fn("ScratchpadOntology.requireObjectAst")(function* (schema: S.Top) {
  return yield* pipe(
    objectAstFromSchema(schema),
    O.match({
      onNone: () =>
        failAssembly("unsupportedClassAst", "Schema does not expose object property signatures.", schemaIdentity(schema)),
      onSome: Effect.succeed,
    })
  );
});

const requireStringFieldName = Effect.fn("ScratchpadOntology.requireStringFieldName")(function* (
  schema: S.Top,
  property: SchemaAST.PropertySignature
) {
  if (P.isString(property.name) && Str.isNonEmpty(property.name)) {
    return property.name;
  }

  return yield* failAssembly("unsupportedFieldName", "Only string field names are supported.", schemaIdentity(schema));
});

const requirePredicateDraft = Effect.fn("ScratchpadOntology.requirePredicateDraft")(function* (
  schema: S.Top,
  fieldName: string,
  property: SchemaAST.PropertySignature
) {
  const propertySchema = S.make<S.Top>(property.type);
  const metadata = getOntologyKeyMetadata(propertySchema);
  if (metadata === undefined) {
    return yield* failAssembly(
      "missingPredicateMetadata",
      "Field is missing ontology predicate metadata.",
      schemaIdentity(schema),
      O.some(fieldName)
    );
  }

  if (isOntologyPredicateAnnotationDraft(metadata)) {
    return {
      draft: metadata,
      schemaIdentity: yield* pipe(
        schemaKeyIdentity(propertySchema),
        O.match({
          onNone: () =>
            failAssembly(
              "invalidPredicateMetadata",
              "Field ontology metadata is missing schema identity.",
              schemaIdentity(schema),
              O.some(fieldName)
            ),
          onSome: Effect.succeed,
        })
      ),
      identifier: yield* pipe(
        schemaKeyIdentifier(propertySchema),
        O.match({
          onNone: () =>
            failAssembly(
              "invalidPredicateMetadata",
              "Field ontology metadata is missing key identifier.",
              schemaIdentity(schema),
              O.some(fieldName)
            ),
          onSome: Effect.succeed,
        })
      ),
    };
  }

  return yield* failAssembly(
    "invalidPredicateMetadata",
    "Field ontology metadata is not predicate authoring metadata.",
    schemaIdentity(schema),
    O.some(fieldName)
  );
});

const finalizePredicateMetadata = (
  baseIri: IRI,
  schemaIdentityValue: string,
  identifier: string,
  draft: OntologyPredicateAnnotationDraft
): OntologyPredicateMetadata => {
  const fallbackTermName = keyLeafTermName(identifier);
  const termName = pipe(
    draft.termName,
    O.getOrElse(() => fallbackTermName)
  );
  const iri = pipe(
    draft.iri,
    O.getOrElse(() => makeTermIri(baseIri, termName))
  );
  const label = pipe(
    draft.label,
    O.getOrElse(() => predicateLabel(termName))
  );
  const comment = draftMetadataComment(draft.description, draft.comment);
  const common = {
    schemaIdentity: schemaIdentityValue,
    termName,
    iri,
    label,
    ...R.getSomes({ comment }),
  };

  return draft.kind === "datatypePredicateDraft"
    ? makeOntologyDatatypePredicateMetadata({
        kind: "datatypePredicate",
        ...common,
        rangeDatatypeIri: draft.rangeDatatypeIri,
      })
    : makeOntologyObjectPredicateMetadata({
        kind: "objectPredicate",
        ...common,
        rangeClassIri: draft.rangeClassIri,
      });
};

const assemblePredicate = (
  classMetadata: OntologyClassMetadata,
  fieldName: string,
  predicateMetadata: OntologyPredicateMetadata
): AssembledOntologyPredicate =>
  predicateMetadata.kind === "datatypePredicate"
    ? AssembledDatatypePredicate.make({
        kind: "datatypePredicate",
        schemaIdentity: predicateMetadata.schemaIdentity,
        fieldName,
        termName: predicateMetadata.termName,
        iri: predicateMetadata.iri,
        label: predicateMetadata.label,
        comment: predicateMetadata.comment,
        domainClassIri: classMetadata.iri,
        rangeDatatypeIri: predicateMetadata.rangeDatatypeIri,
      })
    : AssembledObjectPredicate.make({
        kind: "objectPredicate",
        schemaIdentity: predicateMetadata.schemaIdentity,
        fieldName,
        termName: predicateMetadata.termName,
        iri: predicateMetadata.iri,
        label: predicateMetadata.label,
        comment: predicateMetadata.comment,
        domainClassIri: classMetadata.iri,
        rangeClassIri: predicateMetadata.rangeClassIri,
      });

const assembleClass = Effect.fn("ScratchpadOntology.assembleClass")(function* (
  context: ReferenceResolutionContext,
  seed: ClassAssemblySeed
) {
  const metadata = yield* finalizeClassMetadata(context, seed);
  const objectAst = yield* requireObjectAst(seed.schema);
  const predicates = yield* Effect.forEach(
    objectAst.propertySignatures,
    (property) =>
      Effect.gen(function* () {
        const fieldName = yield* requireStringFieldName(seed.schema, property);
        const { draft, identifier, schemaIdentity: currentSchemaIdentity } = yield* requirePredicateDraft(
          seed.schema,
          fieldName,
          property
        );
        const predicateMetadata = finalizePredicateMetadata(context.baseIri, currentSchemaIdentity, identifier, draft);
        return assemblePredicate(metadata, fieldName, predicateMetadata);
      }),
    { concurrency: 1 }
  );

  return AssembledOntologyClass.make({
    schemaIdentity: metadata.schemaIdentity,
    termName: metadata.termName,
    iri: metadata.iri,
    label: metadata.label,
    comment: metadata.comment,
    altLabels: metadata.altLabels,
    definition: metadata.definition,
    deprecated: metadata.deprecated,
    source: metadata.source,
    parents: metadata.parents,
    children: metadata.children,
    seeAlso: metadata.seeAlso,
    isDefinedBy: metadata.isDefinedBy,
    equivalentClasses: metadata.equivalentClasses,
    exactMatches: metadata.exactMatches,
    closeMatches: metadata.closeMatches,
    sameAs: metadata.sameAs,
    predicates,
  });
});

export const assembleOntology = Effect.fn("ScratchpadOntology.assembleOntology")(function* (
  metadata: OntologyDefinitionMetadata,
  schemas: A.NonEmptyReadonlyArray<S.Top>
) {
  const seeds = yield* Effect.forEach(schemas, (schema) => classAssemblySeed(metadata.baseIri, schema), { concurrency: 1 });
  const context = {
    baseIri: metadata.baseIri,
    classesBySchemaIdentity: classReferenceIndex(seeds),
  } satisfies ReferenceResolutionContext;
  const classes = yield* Effect.forEach(seeds, (seed) => assembleClass(context, seed), { concurrency: 1 });
  return AssembledOntology.make({ metadata, classes });
});
