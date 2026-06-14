---
title: JSDocCategories.ts
nav_order: 49
parent: "@beep/repo-utils"
---

## JSDocCategories.ts overview

Canonical repository JSDoc category taxonomy.

Since v0.0.0

---
## Exports Grouped by Category
- [configuration](#configuration)
  - [CANONICAL_JSDOC_CATEGORIES](#canonical_jsdoc_categories)
- [models](#models)
  - [JSDocCategoryNormalization (class)](#jsdoccategorynormalization-class)
  - [JSDocCategoryNormalizationStatus](#jsdoccategorynormalizationstatus)
- [normalization](#normalization)
  - [normalizeJSDocCategory](#normalizejsdoccategory)
  - [normalizeJSDocCategoryKey](#normalizejsdoccategorykey)
- [predicates](#predicates)
  - [isAcceptedJSDocCategory](#isacceptedjsdoccategory)
  - [isCanonicalJSDocCategory](#iscanonicaljsdoccategory)
- [type-level](#type-level)
  - [JSDocCategory (type alias)](#jsdoccategory-type-alias)
  - [JSDocCategoryNormalizationStatus (type alias)](#jsdoccategorynormalizationstatus-type-alias)
---

# configuration

## CANONICAL_JSDOC_CATEGORIES

Closed set of canonical `@category` values accepted by repo docgen checks.

**Example**

```ts
import { CANONICAL_JSDOC_CATEGORIES } from "@beep/repo-utils/schemas/JSDocCategories"
const categories = CANONICAL_JSDOC_CATEGORIES
console.log(categories)
```

**Signature**

```ts
declare const CANONICAL_JSDOC_CATEGORIES: readonly ["models", "schemas", "type-level", "constructors", "factories", "destructors", "combinators", "predicates", "guards", "refinements", "assertions", "getters", "setters", "mapping", "filtering", "folding", "sequencing", "concurrency", "resource-management", "error-handling", "utilities", "layers", "aggregates", "entities", "value-objects", "domain-events", "policies", "specifications", "identifiers", "entity-ids", "type-ids", "symbols", "errors", "use-cases", "commands", "queries", "events", "workflows", "processes", "schedulers", "protocols", "ports", "services", "handlers", "endpoints", "clients", "adapters", "repositories", "projections", "read-models", "tables", "validation", "parsing", "encoding", "decoding", "serialization", "codecs", "formatting", "normalization", "dtos", "mappers", "components", "hooks", "providers", "themes", "tokens", "forms", "atoms", "tools", "tool-schemas", "cli-commands", "configuration", "constants", "observability", "diagnostics", "fixtures", "testing", "streams", "resources", "interop"]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/JSDocCategories.ts#L31)

Since v0.0.0

# models

## JSDocCategoryNormalization (class)

Normalized interpretation of a single `@category` tag value.

**Example**

```ts
import { normalizeJSDocCategory } from "@beep/repo-utils/schemas/JSDocCategories"
const normalized = normalizeJSDocCategory("DomainModel")
console.log(normalized)
```

**Signature**

```ts
declare class JSDocCategoryNormalization
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/JSDocCategories.ts#L171)

Since v0.0.0

## JSDocCategoryNormalizationStatus

Normalization status for an observed `@category` value.

**Example**

```ts
import { JSDocCategoryNormalizationStatus } from "@beep/repo-utils/schemas/JSDocCategories"
const status = JSDocCategoryNormalizationStatus
console.log(status)
```

**Signature**

```ts
declare const JSDocCategoryNormalizationStatus: AnnotatedSchema<LiteralKit<readonly ["canonical", "alias", "rejected", "unknown"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/JSDocCategories.ts#L140)

Since v0.0.0

# normalization

## normalizeJSDocCategory

Normalize and classify a single observed `@category` value.

**Example**

```ts
import { normalizeJSDocCategory } from "@beep/repo-utils/schemas/JSDocCategories"
const normalized = normalizeJSDocCategory("ToolSchemas")
console.log(normalized)
```

**Signature**

```ts
declare const normalizeJSDocCategory: (value: string) => JSDocCategoryNormalization
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/JSDocCategories.ts#L365)

Since v0.0.0

## normalizeJSDocCategoryKey

Normalize free-form category text to the repo slug key format.

**Example**

```ts
import { normalizeJSDocCategoryKey } from "@beep/repo-utils/schemas/JSDocCategories"
const key = normalizeJSDocCategoryKey("Resource Management & Finalization")
console.log(key)
```

**Signature**

```ts
declare const normalizeJSDocCategoryKey: (value: string) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/JSDocCategories.ts#L295)

Since v0.0.0

# predicates

## isAcceptedJSDocCategory

Return true when a category is canonical or accepted as a migration alias.

**Example**

```ts
import { isAcceptedJSDocCategory } from "@beep/repo-utils/schemas/JSDocCategories"
const accepted = isAcceptedJSDocCategory("DomainModel")
console.log(accepted)
```

**Signature**

```ts
declare const isAcceptedJSDocCategory: (value: string) => boolean
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/JSDocCategories.ts#L452)

Since v0.0.0

## isCanonicalJSDocCategory

Check whether a string is already a canonical category slug.

**Example**

```ts
import { isCanonicalJSDocCategory } from "@beep/repo-utils/schemas/JSDocCategories"
const isCanonical = isCanonicalJSDocCategory("tool-schemas")
console.log(isCanonical)
```

**Signature**

```ts
declare const isCanonicalJSDocCategory: (value: string) => value is JSDocCategory
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/JSDocCategories.ts#L348)

Since v0.0.0

# type-level

## JSDocCategory (type alias)

Canonical category literal used by `@category` JSDoc tags.

**Example**

```ts
import type { JSDocCategory } from "@beep/repo-utils/schemas/JSDocCategories"
const category: JSDocCategory = "validation"
console.log(category)
```

**Signature**

```ts
type JSDocCategory = (typeof CANONICAL_JSDOC_CATEGORIES)[number]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/JSDocCategories.ts#L126)

Since v0.0.0

## JSDocCategoryNormalizationStatus (type alias)

Normalization status for an observed `@category` value.

**Example**

```ts
import type { JSDocCategoryNormalizationStatus } from "@beep/repo-utils/schemas/JSDocCategories"
const status: JSDocCategoryNormalizationStatus = "canonical"
console.log(status)
```

**Signature**

```ts
type JSDocCategoryNormalizationStatus = typeof JSDocCategoryNormalizationStatus.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/JSDocCategories.ts#L157)

Since v0.0.0