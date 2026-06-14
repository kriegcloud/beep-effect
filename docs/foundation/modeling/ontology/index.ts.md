---
title: index.ts
nav_order: 1
parent: "@beep/ontology"
---

## index.ts overview

Package version.

Since v0.0.0

---
## Exports Grouped by Category
- [configuration](#configuration)
  - [VERSION](#version)
- [constructors](#constructors)
  - [Ontology](#ontology)
- [projections](#projections)
  - [parseJsonLdOntology](#parsejsonldontology)
  - [projectJsonLdContext](#projectjsonldcontext)
  - [projectJsonLdOntology](#projectjsonldontology)
  - [projectMarkdown](#projectmarkdown)
  - [projectTurtle](#projectturtle)
- [utilities](#utilities)
  - [OntologyAssemblyError](#ontologyassemblyerror)
  - [getOntologyKeyMetadata](#getontologykeymetadata)
  - [getOntologyMetadata](#getontologymetadata)
  - [isOntologyClassAnnotationDraft](#isontologyclassannotationdraft)
  - [isOntologyPredicateAnnotationDraft](#isontologypredicateannotationdraft)
---

# configuration

## VERSION

Package version.

**Signature**

```ts
declare const VERSION: "0.0.0"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/ontology/src/index.ts#L14)

Since v0.0.0

# constructors

## Ontology

Ontology authoring scope factory.

**Signature**

```ts
declare const Ontology: { create: (input: OntologyCreateInput) => { Ont: { termName: (value: OntologyTermNameInput) => OntologyTermName; iri: (value: OntologyIriInput, termName?: OntologyTermNameInput) => IRI; ref: (target: OntologyReferenceTargetInput) => OntologyReferenceTarget; parent: (target: OntologyReferenceTargetInput) => OntologyReferenceTarget; child: (target: OntologyReferenceTargetInput) => OntologyReferenceTarget; equivalentClass: (target: OntologyReferenceTargetInput) => OntologyReferenceTarget; exactMatch: (target: OntologyReferenceTargetInput) => OntologyReferenceTarget; exact: (target: OntologyReferenceTargetInput) => OntologyReferenceTarget; closeMatch: (target: OntologyReferenceTargetInput) => OntologyReferenceTarget; sameAs: (target: OntologyReferenceTargetInput) => OntologyReferenceTarget; skosConcept: (input: OntologySkosConceptProfileInput) => OntologySkosConceptProfileDraft; skosConceptScheme: (input: OntologySkosConceptSchemeProfileInput) => OntologySkosConceptSchemeProfileDraft; provenance: (input: OntologyProvenanceMetadataInput) => OntologyProvenanceMetadata; class: (classInput: OntologyClassAnnotationInput) => OntologyClassAnnotationDraft; dataPredicate: (predicate: OntologyDatatypePredicateAnnotationInput) => OntologyDatatypePredicateAnnotationDraft; objectPredicate: (predicate: OntologyObjectPredicateAnnotationInput) => OntologyObjectPredicateAnnotationDraft; build: (schemas: NonEmptyReadonlyArray<Top>) => Effect<AssembledOntology, OntologyAssemblyError>; toJsonLD: (ontology: AssembledOntology) => { readonly "@context": { readonly [x: string]: string | { readonly "@id": string; readonly "@type"?: string | undefined; } | { readonly "@reverse": string; readonly "@type"?: "@id" | undefined; }; }; readonly "@id": string; readonly schemaIdentity: string; readonly preferredPrefix: string; readonly label: string; readonly "@graph": ReadonlyArray<{ readonly "@id": string; readonly "@type": "rdfs:Class" | ReadonlyArray<"rdfs:Class" | "skos:Concept" | "skos:ConceptScheme">; readonly schemaIdentity: string; readonly termName: string; readonly "rdfs:label": string; readonly "skos:prefLabel": ReadonlyArray<{ readonly "@value": string; readonly "@language"?: string | undefined; }>; readonly "skos:altLabel": ReadonlyArray<string | { readonly "@value": string; readonly "@language"?: string | undefined; }>; readonly "skos:hiddenLabel": ReadonlyArray<{ readonly "@value": string; readonly "@language"?: string | undefined; }>; readonly "skos:scopeNote": ReadonlyArray<{ readonly "@value": string; readonly "@language"?: string | undefined; }>; readonly "skos:editorialNote": ReadonlyArray<{ readonly "@value": string; readonly "@language"?: string | undefined; }>; readonly "skos:historyNote": ReadonlyArray<{ readonly "@value": string; readonly "@language"?: string | undefined; }>; readonly "skos:broader": ReadonlyArray<{ readonly "@id": string; }>; readonly "skos:narrower": ReadonlyArray<{ readonly "@id": string; }>; readonly "skos:related": ReadonlyArray<{ readonly "@id": string; }>; readonly "skos:broadMatch": ReadonlyArray<{ readonly "@id": string; }>; readonly "skos:narrowMatch": ReadonlyArray<{ readonly "@id": string; }>; readonly "skos:relatedMatch": ReadonlyArray<{ readonly "@id": string; }>; readonly "skos:inScheme": ReadonlyArray<{ readonly "@id": string; }>; readonly "skos:topConceptOf": ReadonlyArray<{ readonly "@id": string; }>; readonly "skos:hasTopConcept": ReadonlyArray<{ readonly "@id": string; }>; readonly "owl:deprecated": boolean; readonly "rdfs:subClassOf": ReadonlyArray<{ readonly "@id": string; }>; readonly children: ReadonlyArray<{ readonly "@id": string; }>; readonly "rdfs:seeAlso": ReadonlyArray<{ readonly "@id": string; }>; readonly "rdfs:isDefinedBy": ReadonlyArray<{ readonly "@id": string; }>; readonly "owl:equivalentClass": ReadonlyArray<{ readonly "@id": string; }>; readonly "skos:exactMatch": ReadonlyArray<{ readonly "@id": string; }>; readonly "skos:closeMatch": ReadonlyArray<{ readonly "@id": string; }>; readonly "owl:sameAs": ReadonlyArray<{ readonly "@id": string; }>; readonly "rdfs:comment"?: string | undefined; readonly "skos:definition"?: string | ReadonlyArray<string | { readonly "@value": string; readonly "@language"?: string | undefined; }> | undefined; readonly "dcterms:source"?: string | undefined; readonly provenance?: { readonly sourceIri?: string | undefined; readonly sourceUri?: string | undefined; readonly sourceLabel?: string | undefined; readonly sourceCitation?: string | undefined; readonly sourceSpan?: string | undefined; readonly sourceSelector?: string | undefined; readonly extractionMethod?: string | undefined; readonly verificationStatus?: "unverified" | "machine-extracted" | "human-reviewed" | "verified" | undefined; readonly updatedAt?: string | undefined; } | undefined; } | { readonly "@id": string; readonly "@type": "owl:DatatypeProperty" | "owl:ObjectProperty"; readonly kind: "datatypePredicate" | "objectPredicate"; readonly schemaIdentity: string; readonly fieldName: string; readonly termName: string; readonly "rdfs:label": string; readonly "rdfs:domain": { readonly "@id": string; }; readonly "rdfs:range": { readonly "@id": string; }; readonly "rdfs:comment"?: string | undefined; }>; readonly comment?: string | undefined; }; fromJsonLD: (input: unknown) => Result<AssembledOntology, SchemaError | OntologyAssemblyError>; toTurtle: (ontology: AssembledOntology) => string; toMarkdown: (ontology: AssembledOntology, options?: void | { readonly linkMode?: "portable" | "obsidian" | undefined; } | undefined) => string; }; $I: IdentityComposer<string> & { readonly annote: { (identifier: string, draft: OntologyClassAnnotationDraft): Annotations.Annotations; (identifier: string, extras?: undefined | IdentityAnyAnnotationExtras<unknown>): Annotations.Annotations; }; readonly annoteKey: { (identifier: string, draft: OntologyPredicateAnnotationDraft): <Schema extends Top>(self: Schema) => Schema["Rebuild"]; (identifier: string, extras?: undefined | KeyAnnotationExtras<unknown>): <Schema extends Top>(self: Schema) => Schema["Rebuild"]; }; }; metadata: OntologyDefinitionMetadata; }; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/ontology/src/index.ts#L22)

Since v0.0.0

# projections

## parseJsonLdOntology

JSON-LD projection helpers.

**Signature**

```ts
declare const parseJsonLdOntology: (input: unknown) => Result<AssembledOntology, SchemaError | OntologyAssemblyError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/ontology/src/index.ts#L42)

Since v0.0.0

## projectJsonLdContext

JSON-LD projection helpers.

**Signature**

```ts
declare const projectJsonLdContext: (ontology: AssembledOntology) => { readonly "@context": { readonly [x: string]: string | { readonly "@id": string; readonly "@type"?: string | undefined; } | { readonly "@reverse": string; readonly "@type"?: "@id" | undefined; }; }; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/ontology/src/index.ts#L42)

Since v0.0.0

## projectJsonLdOntology

JSON-LD projection helpers.

**Signature**

```ts
declare const projectJsonLdOntology: (ontology: AssembledOntology) => { readonly "@context": { readonly [x: string]: string | { readonly "@id": string; readonly "@type"?: string | undefined; } | { readonly "@reverse": string; readonly "@type"?: "@id" | undefined; }; }; readonly "@id": string; readonly schemaIdentity: string; readonly preferredPrefix: string; readonly label: string; readonly "@graph": ReadonlyArray<{ readonly "@id": string; readonly "@type": "rdfs:Class" | ReadonlyArray<"rdfs:Class" | "skos:Concept" | "skos:ConceptScheme">; readonly schemaIdentity: string; readonly termName: string; readonly "rdfs:label": string; readonly "skos:prefLabel": ReadonlyArray<{ readonly "@value": string; readonly "@language"?: string | undefined; }>; readonly "skos:altLabel": ReadonlyArray<string | { readonly "@value": string; readonly "@language"?: string | undefined; }>; readonly "skos:hiddenLabel": ReadonlyArray<{ readonly "@value": string; readonly "@language"?: string | undefined; }>; readonly "skos:scopeNote": ReadonlyArray<{ readonly "@value": string; readonly "@language"?: string | undefined; }>; readonly "skos:editorialNote": ReadonlyArray<{ readonly "@value": string; readonly "@language"?: string | undefined; }>; readonly "skos:historyNote": ReadonlyArray<{ readonly "@value": string; readonly "@language"?: string | undefined; }>; readonly "skos:broader": ReadonlyArray<{ readonly "@id": string; }>; readonly "skos:narrower": ReadonlyArray<{ readonly "@id": string; }>; readonly "skos:related": ReadonlyArray<{ readonly "@id": string; }>; readonly "skos:broadMatch": ReadonlyArray<{ readonly "@id": string; }>; readonly "skos:narrowMatch": ReadonlyArray<{ readonly "@id": string; }>; readonly "skos:relatedMatch": ReadonlyArray<{ readonly "@id": string; }>; readonly "skos:inScheme": ReadonlyArray<{ readonly "@id": string; }>; readonly "skos:topConceptOf": ReadonlyArray<{ readonly "@id": string; }>; readonly "skos:hasTopConcept": ReadonlyArray<{ readonly "@id": string; }>; readonly "owl:deprecated": boolean; readonly "rdfs:subClassOf": ReadonlyArray<{ readonly "@id": string; }>; readonly children: ReadonlyArray<{ readonly "@id": string; }>; readonly "rdfs:seeAlso": ReadonlyArray<{ readonly "@id": string; }>; readonly "rdfs:isDefinedBy": ReadonlyArray<{ readonly "@id": string; }>; readonly "owl:equivalentClass": ReadonlyArray<{ readonly "@id": string; }>; readonly "skos:exactMatch": ReadonlyArray<{ readonly "@id": string; }>; readonly "skos:closeMatch": ReadonlyArray<{ readonly "@id": string; }>; readonly "owl:sameAs": ReadonlyArray<{ readonly "@id": string; }>; readonly "rdfs:comment"?: string | undefined; readonly "skos:definition"?: string | ReadonlyArray<string | { readonly "@value": string; readonly "@language"?: string | undefined; }> | undefined; readonly "dcterms:source"?: string | undefined; readonly provenance?: { readonly sourceIri?: string | undefined; readonly sourceUri?: string | undefined; readonly sourceLabel?: string | undefined; readonly sourceCitation?: string | undefined; readonly sourceSpan?: string | undefined; readonly sourceSelector?: string | undefined; readonly extractionMethod?: string | undefined; readonly verificationStatus?: "unverified" | "machine-extracted" | "human-reviewed" | "verified" | undefined; readonly updatedAt?: string | undefined; } | undefined; } | { readonly "@id": string; readonly "@type": "owl:DatatypeProperty" | "owl:ObjectProperty"; readonly kind: "datatypePredicate" | "objectPredicate"; readonly schemaIdentity: string; readonly fieldName: string; readonly termName: string; readonly "rdfs:label": string; readonly "rdfs:domain": { readonly "@id": string; }; readonly "rdfs:range": { readonly "@id": string; }; readonly "rdfs:comment"?: string | undefined; }>; readonly comment?: string | undefined; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/ontology/src/index.ts#L42)

Since v0.0.0

## projectMarkdown

Markdown documentation projection helper.

**Signature**

```ts
declare const projectMarkdown: (ontology: AssembledOntology, options?: void | { readonly linkMode?: "portable" | "obsidian" | undefined; } | undefined) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/ontology/src/index.ts#L49)

Since v0.0.0

## projectTurtle

Turtle projection helper.

**Signature**

```ts
declare const projectTurtle: (ontology: AssembledOntology) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/ontology/src/index.ts#L56)

Since v0.0.0

# utilities

## OntologyAssemblyError

Annotation display-map readers and draft guards.

**Signature**

```ts
declare const OntologyAssemblyError: typeof OntologyAssemblyError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/ontology/src/index.ts#L34)

Since v0.0.0

## getOntologyKeyMetadata

Annotation display-map readers and draft guards.

**Signature**

```ts
declare const getOntologyKeyMetadata: (schema: Top) => OntologyMetadataAnnotationPayload | undefined
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/ontology/src/index.ts#L30)

Since v0.0.0

## getOntologyMetadata

Annotation display-map readers and draft guards.

**Signature**

```ts
declare const getOntologyMetadata: (schema: Top) => OntologyMetadataAnnotationPayload | undefined
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/ontology/src/index.ts#L31)

Since v0.0.0

## isOntologyClassAnnotationDraft

Annotation display-map readers and draft guards.

**Signature**

```ts
declare const isOntologyClassAnnotationDraft: <I>(input: I) => input is I & OntologyClassAnnotationDraft
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/ontology/src/index.ts#L32)

Since v0.0.0

## isOntologyPredicateAnnotationDraft

Annotation display-map readers and draft guards.

**Signature**

```ts
declare const isOntologyPredicateAnnotationDraft: <I>(input: I) => input is I & (OntologyDatatypePredicateAnnotationDraft | OntologyObjectPredicateAnnotationDraft)
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/ontology/src/index.ts#L33)

Since v0.0.0