---
title: TSCategory.model.ts
nav_order: 39
parent: "@beep/repo-utils"
---

## TSCategory.model.ts overview

TypeScript category taxonomy schemas, fibration metadata, and classifier utilities.

Since v0.0.0

---
## Exports Grouped by Category
- [configuration](#configuration)
  - [APPLICABLE_TO_CATEGORY_ROUTING](#applicable_to_category_routing)
  - [CATEGORY_PRECEDENCE](#category_precedence)
  - [CATEGORY_TAXONOMY](#category_taxonomy)
  - [CONTEXT_FALLBACK_POLICY](#context_fallback_policy)
  - [DETERMINISTIC_CLASSIFICATION_THRESHOLD](#deterministic_classification_threshold)
  - [TESTING_FILE_PATTERNS](#testing_file_patterns)
  - [TESTING_IMPORT_PATTERNS](#testing_import_patterns)
  - [UNCATEGORIZED_GUARDRAIL_THRESHOLD](#uncategorized_guardrail_threshold)
- [models](#models)
  - [Category](#category)
  - [Category (type alias)](#category-type-alias)
  - [CategoryPurity](#categorypurity)
  - [CategoryPurity (type alias)](#categorypurity-type-alias)
  - [CategoryTag (type alias)](#categorytag-type-alias)
  - [ScoredCategoryCandidate (type alias)](#scoredcategorycandidate-type-alias)
  - [TSCategory (type alias)](#tscategory-type-alias)
  - [TSCategoryAnnotationPayload (type alias)](#tscategoryannotationpayload-type-alias)
  - [TSCategoryDefinition (class)](#tscategorydefinition-class)
  - [TSCategoryTag](#tscategorytag)
  - [TSCategoryTag (type alias)](#tscategorytag-type-alias)
  - [getTSCategoryMetadata](#gettscategorymetadata)
  - [make](#make)
- [utilities](#utilities)
  - [getCandidateCategories](#getcandidatecategories)
  - [getCategoriesByArchLayer](#getcategoriesbyarchlayer)
  - [getCategoriesByEffectAnalog](#getcategoriesbyeffectanalog)
  - [getCategoriesByPurity](#getcategoriesbypurity)
  - [getCategoriesForApplicableTo](#getcategoriesforapplicableto)
  - [getCategory](#getcategory)
  - [getCategoryPrecedence](#getcategoryprecedence)
  - [resolveContextFallback](#resolvecontextfallback)
---

# configuration

## APPLICABLE_TO_CATEGORY_ROUTING

Complete routing table from `ApplicableTo` node intent to candidate categories.
This makes taxonomy completeness auditable against HasJSDoc surfaces.

**Example**

```ts
import { APPLICABLE_TO_CATEGORY_ROUTING } from "@beep/repo-utils/JSDoc/models/TSCategory.model"

console.log(APPLICABLE_TO_CATEGORY_ROUTING)
```

**Signature**

```ts
declare const APPLICABLE_TO_CATEGORY_ROUTING: Readonly<Record<"function" | "identifier" | "file" | "method" | "class" | "classStaticBlock" | "interface" | "typeAlias" | "enum" | "enumMember" | "variable" | "constant" | "property" | "accessor" | "constructor" | "parameter" | "signature" | "indexSignature" | "typeParameter" | "tupleMember" | "exportSpecifier" | "statement" | "expression" | "module" | "namespace" | "event" | "mixin" | "any", ReadonlyArray<SchemaAST.LiteralValue>>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/TSCategory.model.ts#L1144)

Since v0.0.0

## CATEGORY_PRECEDENCE

Deterministic precedence for external classifier conflict resolution.

Ordering rationale - most-specific signals win:
  1. Library-specific imports (Validation, DataAccess, Integration) -
     schema/ORM/SDK imports are near-unambiguous signals.
  2. Structural patterns (Presentation, UseCase) -
     framework imports + structural shape are strong but broader.
  3. Naming and convention patterns (PortContract, Configuration, CrossCutting) -
     rely on naming heuristics which are project-dependent.
  4. Residual categories (DomainModel, DomainLogic, Utility) -
     identified by absence of other signals rather than presence.
  5. Uncategorized - last resort.

This policy is intentionally separate from `getCandidateCategories`,
which preserves canonical sorting by confidence and `_tag`.

**Example**

```ts
import { CATEGORY_PRECEDENCE } from "@beep/repo-utils/JSDoc/models/TSCategory.model"

console.log(CATEGORY_PRECEDENCE)
```

**Signature**

```ts
declare const CATEGORY_PRECEDENCE: ReadonlyArray<SchemaAST.LiteralValue>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/TSCategory.model.ts#L1092)

Since v0.0.0

## CATEGORY_TAXONOMY

Closed category taxonomy used by `@category` tags.

**Example**

```ts
import { CATEGORY_TAXONOMY } from "@beep/repo-utils/JSDoc/models/TSCategory.model"

console.log(CATEGORY_TAXONOMY)
```

**Signature**

```ts
declare const CATEGORY_TAXONOMY: ReadonlyArray<{ readonly _tag: "UseCase" | "CrossCutting" | "DomainModel" | "DomainLogic" | "PortContract" | "Validation" | "Utility" | "Presentation" | "DataAccess" | "Integration" | "Configuration" | "Uncategorized"; readonly definition: string; readonly classificationGuidance: string; readonly examples: readonly [string, ...string[]]; readonly counterExamples: ReadonlyArray<string>; readonly typicalSyntaxKinds: ReadonlyArray<string>; readonly astSignals: ReadonlyArray<{ readonly signal: string; readonly confidence: number; readonly detection: string; }>; readonly effectAnalog: string | null; readonly architecturalLayers: ReadonlyArray<"DomainEntity" | "UseCase" | "InterfaceAdapter" | "FrameworkDriver" | "Port" | "Adapter" | "Core" | "CrossCutting">; readonly purity: "pure" | "effectful" | "mixed"; readonly adjacentCategories: ReadonlyArray<string>; readonly typicalImportPatterns: ReadonlyArray<string>; readonly dependencyProfile: { readonly typicalFanIn: "low" | "medium" | "high"; readonly typicalFanOut: "low" | "medium" | "high"; }; readonly documentationPriority: number; }>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/TSCategory.model.ts#L1035)

Since v0.0.0

## CONTEXT_FALLBACK_POLICY

Explicit fallback policy for non-declaration nodes where direct classification
is ambiguous without structural context.

**Example**

```ts
import { CONTEXT_FALLBACK_POLICY } from "@beep/repo-utils/JSDoc/models/TSCategory.model"

console.log(CONTEXT_FALLBACK_POLICY)
```

**Signature**

```ts
declare const CONTEXT_FALLBACK_POLICY: { readonly appliesTo: readonly ["statement", "expression", "signature"]; readonly resolutionSteps: readonly ["Classify by nearest exportable ancestor symbol first.", "If no ancestor applies, classify by source-file dominant category.", "If ambiguity remains or score is below guardrail, classify as Uncategorized."]; readonly fallbackCategory: "Uncategorized"; readonly threshold: 0.45; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/TSCategory.model.ts#L1120)

Since v0.0.0

## DETERMINISTIC_CLASSIFICATION_THRESHOLD

Confidence threshold where deterministic classification can skip LLM inference.

**Example**

```ts
import { DETERMINISTIC_CLASSIFICATION_THRESHOLD } from "@beep/repo-utils/JSDoc/models/TSCategory.model"

console.log(DETERMINISTIC_CLASSIFICATION_THRESHOLD)
```

**Signature**

```ts
declare const DETERMINISTIC_CLASSIFICATION_THRESHOLD: 0.85
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/TSCategory.model.ts#L296)

Since v0.0.0

## TESTING_FILE_PATTERNS

File-path patterns that identify test infrastructure.
The classifier should exclude these files from category scoring
or route them to a dedicated test-handling path before applying
the main taxonomy.

**Example**

```ts
import { TESTING_FILE_PATTERNS } from "@beep/repo-utils/JSDoc/models/TSCategory.model"

console.log(TESTING_FILE_PATTERNS)
```

**Signature**

```ts
declare const TESTING_FILE_PATTERNS: readonly ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts", "**/*.spec.tsx", "**/__tests__/**", "**/__mocks__/**", "**/test/**", "**/tests/**", "**/*.stories.ts", "**/*.stories.tsx", "**/fixtures/**", "**/__fixtures__/**"]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/TSCategory.model.ts#L327)

Since v0.0.0

## TESTING_IMPORT_PATTERNS

Import patterns that strongly signal test infrastructure.
Used as a secondary signal when file paths are ambiguous
(e.g., test utilities not in a conventional test directory).

**Example**

```ts
import { TESTING_IMPORT_PATTERNS } from "@beep/repo-utils/JSDoc/models/TSCategory.model"

console.log(TESTING_IMPORT_PATTERNS)
```

**Signature**

```ts
declare const TESTING_IMPORT_PATTERNS: readonly ["vitest*", "jest*", "@jest/*", "@testing-library/*", "msw*", "playwright*", "@playwright/*", "cypress*", "supertest*", "nock*", "sinon*"]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/TSCategory.model.ts#L356)

Since v0.0.0

## UNCATEGORIZED_GUARDRAIL_THRESHOLD

Guardrail threshold used to route low-confidence matches to `Uncategorized`.

**Example**

```ts
import { UNCATEGORIZED_GUARDRAIL_THRESHOLD } from "@beep/repo-utils/JSDoc/models/TSCategory.model"

console.log(UNCATEGORIZED_GUARDRAIL_THRESHOLD)
```

**Signature**

```ts
declare const UNCATEGORIZED_GUARDRAIL_THRESHOLD: 0.45
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/TSCategory.model.ts#L310)

Since v0.0.0

# models

## Category

The TypeScript Category Tag

**Example**

```ts
import { Category } from "@beep/repo-utils/JSDoc/models/TSCategory.model"

console.log(Category)
```

**Signature**

```ts
declare const Category: AnnotatedSchema<S.Union<readonly [AnnotatedSchema<S.Literal<SchemaAST.LiteralValue>>, AnnotatedSchema<S.Literal<SchemaAST.LiteralValue>>, AnnotatedSchema<S.Literal<SchemaAST.LiteralValue>>, AnnotatedSchema<S.Literal<SchemaAST.LiteralValue>>, AnnotatedSchema<S.Literal<SchemaAST.LiteralValue>>, AnnotatedSchema<S.Literal<SchemaAST.LiteralValue>>, AnnotatedSchema<S.Literal<SchemaAST.LiteralValue>>, AnnotatedSchema<S.Literal<SchemaAST.LiteralValue>>, AnnotatedSchema<S.Literal<SchemaAST.LiteralValue>>, AnnotatedSchema<S.Literal<SchemaAST.LiteralValue>>, AnnotatedSchema<S.Literal<SchemaAST.LiteralValue>>, AnnotatedSchema<S.Literal<SchemaAST.LiteralValue>>]> & { decodeUnknown: (input: unknown, options?: SchemaAST.ParseOptions) => Effect<SchemaAST.LiteralValue, S.SchemaError, never>; }>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/TSCategory.model.ts#L1504)

Since v0.0.0

## Category (type alias)

Type for `Category`.

**Example**

```ts
import type { Category } from "@beep/repo-utils/JSDoc/models/TSCategory.model"

type Example = Category
const accept = <A extends Example>(value: A): A => value
console.log(accept)
```

**Signature**

```ts
type Category = typeof Category.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/TSCategory.model.ts#L1527)

Since v0.0.0

## CategoryPurity

Purity classification for a TSCategory taxonomy member.

**Example**

```ts
import { CategoryPurity } from "@beep/repo-utils/JSDoc/models/TSCategory.model"

console.log(CategoryPurity)
```

**Signature**

```ts
declare const CategoryPurity: AnnotatedSchema<LiteralKit<readonly ["pure", "effectful", "mixed"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/TSCategory.model.ts#L71)

Since v0.0.0

## CategoryPurity (type alias)

Inferred type for `CategoryPurity`.

**Example**

```ts
import type { CategoryPurity } from "@beep/repo-utils/JSDoc/models/TSCategory.model"

type Example = CategoryPurity
const accept = <A extends Example>(value: A): A => value
console.log(accept)
```

**Signature**

```ts
type CategoryPurity = typeof CategoryPurity.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/TSCategory.model.ts#L93)

Since v0.0.0

## CategoryTag (type alias)

All valid category tag values.

**Example**

```ts
import type { CategoryTag } from "@beep/repo-utils/JSDoc/models/TSCategory.model"

type Example = CategoryTag
const accept = <A extends Example>(value: A): A => value
console.log(accept)
```

**Signature**

```ts
type CategoryTag = TSCategoryTag
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/TSCategory.model.ts#L1062)

Since v0.0.0

## ScoredCategoryCandidate (type alias)

Scored category candidate shape produced by candidate resolution.

**Example**

```ts
import type { ScoredCategoryCandidate } from "@beep/repo-utils/JSDoc/models/TSCategory.model"

type Example = ScoredCategoryCandidate
const accept = <A extends Example>(value: A): A => value
console.log(accept)
```

**Signature**

```ts
type ScoredCategoryCandidate = Readonly<{
  readonly category: TSCategory;
  readonly combinedConfidence: number;
}>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/TSCategory.model.ts#L1351)

Since v0.0.0

## TSCategory (type alias)

Runtime encoded shape for TS category metadata.

**Example**

```ts
import type { TSCategory } from "@beep/repo-utils/JSDoc/models/TSCategory.model"

type Example = TSCategory
const accept = <A extends Example>(value: A): A => value
console.log(accept)
```

**Signature**

```ts
type TSCategory = typeof TSCategoryDefinition.Encoded
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/TSCategory.model.ts#L215)

Since v0.0.0

## TSCategoryAnnotationPayload (type alias)

The payload type stored in the `tsCategoryMetadata` annotation key.

**Example**

```ts
import type { TSCategoryAnnotationPayload } from "@beep/repo-utils/JSDoc/models/TSCategory.model"

type Example = TSCategoryAnnotationPayload
const accept = <A extends Example>(value: A): A => value
console.log(accept)
```

**Signature**

```ts
type TSCategoryAnnotationPayload = TSCategoryDefinition
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/TSCategory.model.ts#L231)

Since v0.0.0

## TSCategoryDefinition (class)

A single member of the closed taxonomy used to classify
TypeScript code elements in the knowledge graph.

**Example**

```ts
import { TSCategoryDefinition } from "@beep/repo-utils/JSDoc/models/TSCategory.model"

console.log(TSCategoryDefinition)
```

**Signature**

```ts
declare class TSCategoryDefinition
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/TSCategory.model.ts#L108)

Since v0.0.0

## TSCategoryTag

Strict literal union for all supported TypeDoc `@category` values.

**Example**

```ts
import { TSCategoryTag } from "@beep/repo-utils/JSDoc/models/TSCategory.model"

console.log(TSCategoryTag)
```

**Signature**

```ts
declare const TSCategoryTag: AnnotatedSchema<LiteralKit<readonly [SchemaAST.LiteralValue, SchemaAST.LiteralValue, SchemaAST.LiteralValue, SchemaAST.LiteralValue, SchemaAST.LiteralValue, SchemaAST.LiteralValue, SchemaAST.LiteralValue, SchemaAST.LiteralValue, SchemaAST.LiteralValue, SchemaAST.LiteralValue, SchemaAST.LiteralValue, SchemaAST.LiteralValue], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/TSCategory.model.ts#L973)

Since v0.0.0

## TSCategoryTag (type alias)

Inferred type for `TSCategoryTag`.

**Example**

```ts
import type { TSCategoryTag } from "@beep/repo-utils/JSDoc/models/TSCategory.model"

type Example = TSCategoryTag
const accept = <A extends Example>(value: A): A => value
console.log(accept)
```

**Signature**

```ts
type TSCategoryTag = typeof TSCategoryTag.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/TSCategory.model.ts#L1006)

Since v0.0.0

## getTSCategoryMetadata

Retrieve TS category metadata annotation from a schema, if present.

**Example**

```ts
import { getTSCategoryMetadata } from "@beep/repo-utils/JSDoc/models/TSCategory.model"

console.log(getTSCategoryMetadata)
```

**Signature**

```ts
declare const getTSCategoryMetadata: (schema: S.Top) => TSCategoryAnnotationPayload | undefined
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/TSCategory.model.ts#L255)

Since v0.0.0

## make

Build a TS category fibration schema for a concrete category tag.

Validates full taxonomy metadata with `TSCategoryDefinition` and
projects to a lean literal schema suitable for category value usage.

**Example**

```ts
import { make } from "@beep/repo-utils/JSDoc/models/TSCategory.model"

console.log(make)
```

**Signature**

```ts
declare const make: { <const Tag extends TSCategoryTagBase>(meta: Omit<TSCategory, "_tag">): (tag: Tag) => ReturnType<typeof S.Literal>; <const Tag extends TSCategoryTagBase>(_tag: Tag, meta: Omit<TSCategory, "_tag">): ReturnType<typeof S.Literal>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/TSCategory.model.ts#L276)

Since v0.0.0

# utilities

## getCandidateCategories

Get categories whose AST signals could match a code element.
Unknown categories are ignored.

Sorting policy:
1) `combinedConfidence` descending
2) `_tag` ascending

`CATEGORY_PRECEDENCE` is intentionally NOT used here.
It is an external conflict policy for classifier flows.

Combined confidence formula:
  1 - Π(1 - c_i)

**Example**

```ts
import { getCandidateCategories } from "@beep/repo-utils/JSDoc/models/TSCategory.model"

console.log(getCandidateCategories)
```

**Signature**

```ts
declare const getCandidateCategories: (signals: ReadonlyArray<{ category: TSCategoryTag; confidence: number; }>) => ReadonlyArray<ScoredCategoryCandidate>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/TSCategory.model.ts#L1393)

Since v0.0.0

## getCategoriesByArchLayer

Get categories by architectural layer.

**Example**

```ts
import { getCategoriesByArchLayer } from "@beep/repo-utils/JSDoc/models/TSCategory.model"

console.log(getCategoriesByArchLayer)
```

**Signature**

```ts
declare const getCategoriesByArchLayer: (layer: ArchitecturalLayerValue) => ReadonlyArray<TSCategory>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/TSCategory.model.ts#L1280)

Since v0.0.0

## getCategoriesByEffectAnalog

Get categories by Effect or monad analog.

**Example**

```ts
import { getCategoriesByEffectAnalog } from "@beep/repo-utils/JSDoc/models/TSCategory.model"

console.log(getCategoriesByEffectAnalog)
```

**Signature**

```ts
declare const getCategoriesByEffectAnalog: (analog: string) => ReadonlyArray<TSCategory>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/TSCategory.model.ts#L1306)

Since v0.0.0

## getCategoriesByPurity

Get categories by purity classification.

**Example**

```ts
import { getCategoriesByPurity } from "@beep/repo-utils/JSDoc/models/TSCategory.model"

console.log(getCategoriesByPurity)
```

**Signature**

```ts
declare const getCategoriesByPurity: (purity: TSCategory["purity"]) => ReadonlyArray<TSCategory>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/TSCategory.model.ts#L1259)

Since v0.0.0

## getCategoriesForApplicableTo

Get ordered candidate categories for an `ApplicableTo` node intent.

**Example**

```ts
import { getCategoriesForApplicableTo } from "@beep/repo-utils/JSDoc/models/TSCategory.model"

console.log(getCategoriesForApplicableTo)
```

**Signature**

```ts
declare const getCategoriesForApplicableTo: (applicableTo: ApplicableTo) => ReadonlyArray<TSCategory>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/TSCategory.model.ts#L1327)

Since v0.0.0

## getCategory

Lookup a category by `_tag`.

**Example**

```ts
import { getCategory } from "@beep/repo-utils/JSDoc/models/TSCategory.model"

console.log(getCategory)
```

**Signature**

```ts
declare const getCategory: (tag: TSCategoryTag) => TSCategory | undefined
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/TSCategory.model.ts#L1237)

Since v0.0.0

## getCategoryPrecedence

Get deterministic conflict precedence rank for a category tag.

**Example**

```ts
import { getCategoryPrecedence } from "@beep/repo-utils/JSDoc/models/TSCategory.model"

console.log(getCategoryPrecedence)
```

**Signature**

```ts
declare const getCategoryPrecedence: (tag: CategoryTag) => number
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/TSCategory.model.ts#L1215)

Since v0.0.0

## resolveContextFallback

Resolve category for non-declaration AST nodes using context fallback policy.

Resolution order:
1. Classify by nearest exportable ancestor symbol
2. Fall back to source-file dominant category
3. Return Uncategorized if below guardrail threshold

This is a stub - the actual implementation will need ts-morph node
traversal that depends on the extraction pipeline architecture.
The stub documents the contract and makes the fallback policy executable.

**Example**

```ts
import { resolveContextFallback } from "@beep/repo-utils/JSDoc/models/TSCategory.model"

console.log(resolveContextFallback)
```

**Signature**

```ts
declare const resolveContextFallback: (scoredCandidates: ReadonlyArray<ScoredCategoryCandidate>, ancestorCategory?: CategoryTag, sourceFileDominantCategory?: CategoryTag) => CategoryTag
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/TSCategory.model.ts#L1458)

Since v0.0.0