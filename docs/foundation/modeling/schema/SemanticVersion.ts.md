---
title: SemanticVersion.ts
nav_order: 197
parent: "@beep/schema"
---

## SemanticVersion.ts overview

Semantic version schema helpers for strings shaped like `MAJOR.MINOR.PATCH`.

**Example**

```ts
```typescript
import * as S from "effect/Schema";
import { SemanticVersion } from "@beep/schema/SemanticVersion";

const version = S.decodeUnknownSync(SemanticVersion)("1.24.0");

console.log(version);
```
```

Since v0.0.0

---
## Exports Grouped by Category
- [SemanticVersion (type alias)](#semanticversion-type-alias)
---

# validation

## SemanticVersion

A Semantic Versioning (SemVer) schema for validating `MAJOR.MINOR.PATCH` version strings.

Each segment must be a non-negative integer, and multi-digit segments may not start with `0`.

**Example**

```ts
```typescript
import * as S from "effect/Schema";
import { SemanticVersion } from "@beep/schema/SemanticVersion";

S.decodeUnknownSync(SemanticVersion)("0.1.2");
S.decodeUnknownSync(SemanticVersion)("12.34.56");
```
```

**Signature**

```ts
declare const SemanticVersion: AnnotatedSchema<S.TemplateLiteral<readonly [S.String, ".", S.String, ".", S.String]> & { decodeUnknownOption: (u: unknown) => Option<`${string}.${string}.${string}`>; }>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/SemanticVersion.ts#L46)

Since v0.0.0

## SemanticVersion (type alias)

{@inheritDoc SemanticVersion}

**Example**

```ts
```typescript
import type { SemanticVersion } from "@beep/schema/SemanticVersion";

const currentVersion: SemanticVersion = "2.3.4";
console.log(currentVersion);
```
```

**Signature**

```ts
type SemanticVersion = typeof SemanticVersion.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/SemanticVersion.ts#L75)

Since v0.0.0