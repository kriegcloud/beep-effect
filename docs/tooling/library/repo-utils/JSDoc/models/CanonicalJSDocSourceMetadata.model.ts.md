---
title: CanonicalJSDocSourceMetadata.model.ts
nav_order: 16
parent: "@beep/repo-utils"
---

## CanonicalJSDocSourceMetadata.model.ts overview

JSDoc metadata models.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [CanonicalJSDocSourceMetadata (class)](#canonicaljsdocsourcemetadata-class)
  - [CanonicalJSDocSourceMetadata (namespace)](#canonicaljsdocsourcemetadata-namespace)
    - [Encoded (type alias)](#encoded-type-alias)
  - [make](#make)
---

# models

## CanonicalJSDocSourceMetadata (class)

Metadata for a canonical documentation source used in tag catalogs.

**Example**

```ts
import { CanonicalJSDocSourceMetadata } from "@beep/repo-utils/JSDoc/models/CanonicalJSDocSourceMetadata.model"

console.log(CanonicalJSDocSourceMetadata)
```

**Signature**

```ts
declare class CanonicalJSDocSourceMetadata
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/CanonicalJSDocSourceMetadata.model.ts#L25)

Since v0.0.0

## CanonicalJSDocSourceMetadata (namespace)

Runtime codec companion types for `CanonicalJSDocSourceMetadata`.

**Example**

```ts
import { CanonicalJSDocSourceMetadata } from "@beep/repo-utils/JSDoc/models/CanonicalJSDocSourceMetadata.model"

console.log(CanonicalJSDocSourceMetadata)
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/CanonicalJSDocSourceMetadata.model.ts#L50)

Since v0.0.0

### Encoded (type alias)

Encoded wire shape for `CanonicalJSDocSourceMetadata`.

**Signature**

```ts
type Encoded = typeof CanonicalJSDocSourceMetadata.Encoded
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/CanonicalJSDocSourceMetadata.model.ts#L57)

Since v0.0.0

## make

Constructs a model instance from its encoded wire representation.

**Example**

```ts
import { make } from "@beep/repo-utils/JSDoc/models/CanonicalJSDocSourceMetadata.model"

console.log(make)
```

**Signature**

```ts
declare const make: (input: CanonicalJSDocSourceMetadata.Encoded) => CanonicalJSDocSourceMetadata
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/CanonicalJSDocSourceMetadata.model.ts#L74)

Since v0.0.0