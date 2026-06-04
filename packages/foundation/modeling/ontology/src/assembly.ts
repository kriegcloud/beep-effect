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
  getOntologyKeyMetadata,
  getOntologyMetadata,
  type IRI,
  isOntologyClassAnnotationDraft,
  isOntologyPredicateAnnotationDraft,
  makeOntologyClassMetadata,
  makeOntologyDatatypePredicateMetadata,
  makeOntologyObjectPredicateMetadata,
  makeOntologyTermName,
  makeTermIri,
  OntologyClassAnnotationDraft,
  type OntologyDefinitionMetadata,
  OntologyIriReferenceTarget,
  type OntologyPredicateAnnotationDraft,
} from "./model.js";
import { classLabel, draftMetadataComment, keyLeafTermName, predicateLabel } from "./annotations.js";
import {
  failAssembly,
  resolveReferenceTarget,
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

const requireSchemaIdentifier = Effect.fn("Ontology.requireSchemaIdentifier")(function* (schema: S.Top) {
  return yield* pipe(
    schemaIdentifier(schema),
    O.match({
      onNone: () => failAssembly("invalidClassMetadata", "Schema is missing identity annotation identifier.", O.none()),
      onSome: Effect.succeed,
    })
  );
});

const requireSchemaIdentity = Effect.fn("Ontology.requireSchemaIdentity")(function* (schema: S.Top) {
  return yield* pipe(
    schemaIdentity(schema),
    O.match({
      onNone: () =>
        failAssembly("invalidClassMetadata", "Schema is missing identity annotation schemaId.", schemaIdentifier(schema)),
      onSome: Effect.succeed,
    })
  );
});

const requireClassDraft = Effect.fn("Ontology.requireClassDraft")(function* (schema: S.Top) {
  const metadata = getOntologyMetadata(schema);
  if (metadata === undefined) {
    return yield* failAssembly("missingClassMetadata", "Schema is missing ontology class metadata.", schemaIdentifier(schema));
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

const classAssemblySeed = Effect.fn("Ontology.classAssemblySeed")(function* (baseIri: IRI, schema: S.Top) {
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

const finalizeClassMetadata = Effect.fn("Ontology.finalizeClassMetadata")(function* (
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

const requireObjectAst = Effect.fn("Ontology.requireObjectAst")(function* (schema: S.Top) {
  return yield* pipe(
    objectAstFromSchema(schema),
    O.match({
      onNone: () =>
        failAssembly("unsupportedClassAst", "Schema does not expose object property signatures.", schemaIdentity(schema)),
      onSome: Effect.succeed,
    })
  );
});

const requireStringFieldName = Effect.fn("Ontology.requireStringFieldName")(function* (
  schema: S.Top,
  property: SchemaAST.PropertySignature
) {
  if (P.isString(property.name) && Str.isNonEmpty(property.name)) {
    return property.name;
  }

  return yield* failAssembly("unsupportedFieldName", "Only string field names are supported.", schemaIdentity(schema));
});

const requirePredicateDraft = Effect.fn("Ontology.requirePredicateDraft")(function* (
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

const finalizePredicateMetadata = Effect.fn("Ontology.finalizePredicateMetadata")(function* (
  context: ReferenceResolutionContext,
  schemaIdentityValue: string,
  identifier: string,
  draft: OntologyPredicateAnnotationDraft
) {
  const fallbackTermName = keyLeafTermName(identifier);
  const termName = pipe(
    draft.termName,
    O.getOrElse(() => fallbackTermName)
  );
  const iri = pipe(
    draft.iri,
    O.getOrElse(() => makeTermIri(context.baseIri, termName))
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

  if (draft.kind === "datatypePredicateDraft") {
    return makeOntologyDatatypePredicateMetadata({
      kind: "datatypePredicate",
      ...common,
      rangeDatatypeIri: draft.rangeDatatypeIri,
    });
  }

  const rangeClass = yield* resolveReferenceTarget(context, O.some(schemaIdentityValue), draft.rangeClass);

  return makeOntologyObjectPredicateMetadata({
    kind: "objectPredicate",
    ...common,
    rangeClassIri: rangeClass.iri,
  });
});

const collectPredicates = Effect.fn("Ontology.collectPredicates")(function* (
  context: ReferenceResolutionContext,
  schema: S.Top,
  classIri: IRI
) {
  const objectAst = yield* requireObjectAst(schema);
  return yield* Effect.forEach(
    objectAst.propertySignatures,
    Effect.fn("Ontology.collectPredicate")(function* (property) {
      const fieldName = yield* requireStringFieldName(schema, property);
      const { draft, schemaIdentity: predicateSchemaIdentity, identifier } = yield* requirePredicateDraft(
        schema,
        fieldName,
        property
      );
      const metadata = yield* finalizePredicateMetadata(context, predicateSchemaIdentity, identifier, draft);
      return metadata.kind === "datatypePredicate"
        ? AssembledDatatypePredicate.make({
            kind: "datatypePredicate",
            schemaIdentity: metadata.schemaIdentity,
            fieldName,
            termName: metadata.termName,
            iri: metadata.iri,
            label: metadata.label,
            comment: metadata.comment,
            domainClassIri: classIri,
            rangeDatatypeIri: metadata.rangeDatatypeIri,
          })
        : AssembledObjectPredicate.make({
            kind: "objectPredicate",
            schemaIdentity: metadata.schemaIdentity,
            fieldName,
            termName: metadata.termName,
            iri: metadata.iri,
            label: metadata.label,
            comment: metadata.comment,
            domainClassIri: classIri,
            rangeClassIri: metadata.rangeClassIri,
          });
    }),
    { concurrency: 1 }
  );
});

const assembleClass = Effect.fn("Ontology.assembleClass")(function* (context: ReferenceResolutionContext, seed: ClassAssemblySeed) {
  const classMetadata = yield* finalizeClassMetadata(context, seed);
  const predicates: ReadonlyArray<AssembledOntologyPredicate> = yield* collectPredicates(
    context,
    seed.schema,
    classMetadata.iri
  );
  return AssembledOntologyClass.make({
    schemaIdentity: classMetadata.schemaIdentity,
    termName: classMetadata.termName,
    iri: classMetadata.iri,
    label: classMetadata.label,
    comment: classMetadata.comment,
    altLabels: classMetadata.altLabels,
    definition: classMetadata.definition,
    deprecated: classMetadata.deprecated,
    source: classMetadata.source,
    parents: classMetadata.parents,
    children: classMetadata.children,
    seeAlso: classMetadata.seeAlso,
    isDefinedBy: classMetadata.isDefinedBy,
    equivalentClasses: classMetadata.equivalentClasses,
    exactMatches: classMetadata.exactMatches,
    closeMatches: classMetadata.closeMatches,
    sameAs: classMetadata.sameAs,
    predicates,
  });
});

export const assembleOntology = Effect.fn("Ontology.assembleOntology")(function* (
  metadata: OntologyDefinitionMetadata,
  schemas: A.NonEmptyReadonlyArray<S.Top>
) {
  const seeds = yield* Effect.forEach(schemas, (schema) => classAssemblySeed(metadata.baseIri, schema), { concurrency: 1 });
  const context = {
    baseIri: metadata.baseIri,
    classesBySchemaIdentity: classReferenceIndex(seeds),
  };
  const classes = yield* Effect.forEach(seeds, (seed) => assembleClass(context, seed), { concurrency: 1 });

  return AssembledOntology.make({
    metadata,
    classes,
  });
});
