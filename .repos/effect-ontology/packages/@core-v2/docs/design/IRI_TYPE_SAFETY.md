# IRI Type Safety Design Document

## Problem Statement

We discovered a bug where `getPropertiesForClass(classIri)` was comparing full IRIs against local names stored in property domains. This class of bug arises because the codebase lacks type-level distinction between:

- **Full IRIs**: `"http://visualdataweb.org/newOntology/Player"`
- **Local Names**: `"Player"`

Both are represented as `string`, allowing silent mismatches at runtime.

### Bugs Found and Fixed

1. **OntologyContext.getPropertiesForClass** (`Domain/Model/Ontology.ts:781`)
   - Compared `classIri` (full IRI) against `p.domain` (local names)
   - Fixed by extracting local name before comparison

2. **buildClassSnippet** (`Service/Extraction.ts:46`)
   - Compared `cls.id` (full IRI) against `p.domain` (local names)
   - Fixed by extracting local name before comparison

### Current Inconsistent Data Model

| Field | Contains | Type |
|-------|----------|------|
| `ClassDefinition.id` | Full IRI | `string` |
| `PropertyDefinition.id` | Full IRI | `string` |
| `PropertyDefinition.domain` | Local Names | `string[]` |
| `PropertyDefinition.range` | Local Names | `string[]` |
| `ClassDefinition.properties` | Local Names | `string[]` |
| `Entity.types` | Full IRIs | `string[]` |
| `Relation.predicate` | Full IRI | `string` |

This inconsistency is invisible at the type level, making bugs easy to introduce.

---

## Proposed Solution: Branded Types with Effect Schema

### 1. Define Branded Types

```typescript
// packages/@core-v2/src/Domain/Rdf/Types.ts

import { Brand, Schema } from "effect"

/**
 * Branded type for full IRIs (e.g., "http://example.org/Person")
 */
export type FullIRI = string & Brand.Brand<"FullIRI">

/**
 * Branded type for local names (e.g., "Person")
 */
export type LocalName = string & Brand.Brand<"LocalName">

/**
 * Branded type for entity IDs (snake_case identifiers)
 */
export type EntityId = string & Brand.Brand<"EntityId">

/**
 * Schema for validating and branding full IRIs
 */
export const FullIRISchema = Schema.String.pipe(
  Schema.filter((s) => s.includes("://") || s.includes(":"), {
    message: () => "Must be a valid IRI with scheme"
  }),
  Schema.brand("FullIRI")
)

/**
 * Schema for validating and branding local names
 */
export const LocalNameSchema = Schema.String.pipe(
  Schema.filter((s) => !s.includes("://") && !s.includes("/"), {
    message: () => "Must be a local name without scheme or path"
  }),
  Schema.brand("LocalName")
)

/**
 * Schema for entity IDs (snake_case)
 */
export const EntityIdSchema = Schema.String.pipe(
  Schema.pattern(/^[a-z][a-z0-9_]*$/),
  Schema.brand("EntityId")
)
```

### 2. Type-Safe Conversion Functions

```typescript
// packages/@core-v2/src/Utils/Rdf.ts

import { FullIRI, LocalName, FullIRISchema, LocalNameSchema } from "../Domain/Rdf/Types.js"
import { Schema } from "effect"

/**
 * Extract local name from full IRI with type safety
 */
export const fullIriToLocalName = (iri: FullIRI): LocalName => {
  const lastSlash = iri.lastIndexOf("/")
  const lastHash = iri.lastIndexOf("#")
  const lastIndex = Math.max(lastSlash, lastHash)
  const localName = lastIndex >= 0 ? iri.slice(lastIndex + 1) : iri
  return localName as LocalName
}

/**
 * Construct full IRI from base and local name
 */
export const localNameToFullIri = (base: string, localName: LocalName): FullIRI => {
  const separator = base.endsWith("/") || base.endsWith("#") ? "" : "/"
  return `${base}${separator}${localName}` as FullIRI
}

/**
 * Type-safe comparison: check if local names array includes the local name of an IRI
 */
export const localNamesIncludeIri = (
  localNames: ReadonlyArray<LocalName>,
  iri: FullIRI
): boolean => {
  const localName = fullIriToLocalName(iri)
  return localNames.includes(localName)
}

/**
 * Schema transform: FullIRI → LocalName
 */
export const FullIRIToLocalNameTransform = Schema.transform(
  FullIRISchema,
  LocalNameSchema,
  {
    decode: fullIriToLocalName,
    encode: (localName) => localName as unknown as FullIRI // lossy
  }
)

/**
 * Schema transform: Array<FullIRI> → Array<LocalName>
 */
export const FullIRIArrayToLocalNameArrayTransform = Schema.transform(
  Schema.Array(FullIRISchema),
  Schema.Array(LocalNameSchema),
  {
    decode: (iris) => iris.map(fullIriToLocalName),
    encode: (names) => names as unknown as FullIRI[] // lossy
  }
)
```

### 3. Updated Domain Models

```typescript
// packages/@core-v2/src/Domain/Model/Ontology.ts

import { Schema } from "effect"
import { FullIRI, LocalName, FullIRISchema, LocalNameSchema } from "../Rdf/Types.js"
import { localNamesIncludeIri } from "../../Utils/Rdf.js"

export class ClassDefinition extends Schema.Class<ClassDefinition>("ClassDefinition")({
  id: FullIRISchema,                           // Now branded as FullIRI
  label: Schema.String,
  comment: Schema.String,
  properties: Schema.Array(LocalNameSchema),   // Explicitly LocalName[]
  broader: Schema.Array(LocalNameSchema),
  narrower: Schema.Array(LocalNameSchema),
  // ... other fields
}) {
  /**
   * Get all properties for this class - type safe!
   */
  getApplicableProperties(
    allProperties: ReadonlyArray<PropertyDefinition>
  ): ReadonlyArray<PropertyDefinition> {
    // Type system ensures we're comparing correctly
    return allProperties.filter(
      (p) => localNamesIncludeIri(p.domain, this.id) || p.domain.length === 0
    )
  }
}

export class PropertyDefinition extends Schema.Class<PropertyDefinition>("PropertyDefinition")({
  id: FullIRISchema,                          // Full IRI
  label: Schema.String,
  comment: Schema.String,
  domain: Schema.Array(LocalNameSchema),      // Explicitly LocalName[]
  range: Schema.Array(LocalNameSchema),       // Explicitly LocalName[]
  rangeType: Schema.Literal("object", "datatype"),
  // ... other fields
}) {}
```

### 4. Compile-Time Safety Example

With branded types, the compiler catches mismatches:

```typescript
// BEFORE: Silent runtime bug
function getPropertiesForClass(classIri: string): PropertyDefinition[] {
  return properties.filter((p) => p.domain.includes(classIri)) // BUG: compares IRI to local names
}

// AFTER: Compile-time error
function getPropertiesForClass(classIri: FullIRI): PropertyDefinition[] {
  return properties.filter((p) => p.domain.includes(classIri))
  //                                              ^^^^^^^^
  // Error: Argument of type 'FullIRI' is not assignable to parameter of type 'LocalName'
}

// AFTER: Correct implementation
function getPropertiesForClass(classIri: FullIRI): PropertyDefinition[] {
  return properties.filter((p) => localNamesIncludeIri(p.domain, classIri))
  // Type-safe: function signature enforces correct usage
}
```

---

## Migration Path

### Phase 1: Add Branded Types (Non-Breaking)

1. Define `FullIRI`, `LocalName`, `EntityId` branded types
2. Add type-safe conversion functions
3. Add schema transforms
4. Keep existing `string` types working via type aliases

```typescript
// Backward compatible type alias
export type IRI = FullIRI | string  // Gradual migration
```

### Phase 2: Update Domain Models

1. Update `ClassDefinition` and `PropertyDefinition` schemas
2. Use branded types in new fields
3. Add JSDoc deprecation warnings on old accessors

### Phase 3: Update Service Layer

1. Update `OntologyService` to use branded types
2. Update `EntityExtractor` and `RelationExtractor`
3. Fix all comparison sites to use type-safe functions

### Phase 4: Update Workflow Layer

1. Update `StreamingExtraction` to use branded types
2. Update `TwoStageExtraction`
3. Remove backward compatibility shims

---

## Testing Strategy

### 1. Property-Based Tests

```typescript
import { Arbitrary } from "@effect/schema"
import { fc } from "@effect/vitest"

// Generate valid full IRIs
const fullIriArb = fc.webUrl().map((url) => url as FullIRI)

// Generate valid local names
const localNameArb = fc.string({ minLength: 1 })
  .filter((s) => !s.includes("/") && !s.includes(":"))
  .map((s) => s as LocalName)

it.prop([fullIriArb])("fullIriToLocalName extracts valid local name", (iri) => {
  const localName = fullIriToLocalName(iri)
  expect(localName).not.toContain("/")
  expect(localName).not.toContain("://")
})

it.prop([fullIriArb, fc.array(localNameArb)])("localNamesIncludeIri is consistent", (iri, names) => {
  const localName = fullIriToLocalName(iri)
  const expected = names.includes(localName)
  const actual = localNamesIncludeIri(names, iri)
  expect(actual).toBe(expected)
})
```

### 2. Schema Validation Tests

```typescript
it("FullIRISchema rejects local names", () => {
  const result = Schema.decodeUnknownEither(FullIRISchema)("Player")
  expect(Either.isLeft(result)).toBe(true)
})

it("LocalNameSchema rejects full IRIs", () => {
  const result = Schema.decodeUnknownEither(LocalNameSchema)("http://example.org/Player")
  expect(Either.isLeft(result)).toBe(true)
})
```

---

## Benefits

1. **Compile-Time Safety**: Mismatched comparisons become type errors
2. **Self-Documenting Code**: Types express intent clearly
3. **Refactoring Confidence**: Type checker guides changes
4. **Reduced Cognitive Load**: No need to remember which fields store what format
5. **Better IDE Support**: Autocompletion shows appropriate functions

---

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Breaking changes | Phased migration with backward compat |
| Performance overhead | Branded types have zero runtime cost |
| Complexity | Clear documentation and examples |
| Incomplete migration | Linting rules to catch `string` usage |

---

## Implementation Priority

1. **Immediate**: Fix remaining IRI/local-name comparison bugs (DONE)
2. **Short-term**: Add branded types and conversion functions
3. **Medium-term**: Update domain models
4. **Long-term**: Full migration with deprecation of string types

---

## References

- Effect Brand module: `docs/effect-source/effect/src/Brand.ts`
- Effect Schema brand: `docs/effect-source/schema/src/Schema.ts:3196`
- Existing IRI schema: `packages/@core-v2/src/Domain/Rdf/Types.ts`
- RDF utilities: `packages/@core-v2/src/Utils/Rdf.ts`
