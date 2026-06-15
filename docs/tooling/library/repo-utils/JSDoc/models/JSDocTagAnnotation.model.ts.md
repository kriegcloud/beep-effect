---
title: JSDocTagAnnotation.model.ts
nav_order: 20
parent: "@beep/repo-utils"
---

## JSDocTagAnnotation.model.ts overview

JSDoc metadata models.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [JSDocTagAnnotationPayload (type alias)](#jsdoctagannotationpayload-type-alias)
  - [getJSDocTagMetadata](#getjsdoctagmetadata)
---

# models

## JSDocTagAnnotationPayload (type alias)

The payload type stored in the `jsDocTagMetadata` annotation key.

**Example**

```ts
import type { JSDocTagAnnotationPayload } from "@beep/repo-utils/JSDoc/models/JSDocTagAnnotation.model"

type Example = JSDocTagAnnotationPayload
const accept = <A extends Example>(value: A): A => value
console.log(accept)
```

**Signature**

```ts
type JSDocTagAnnotationPayload = JSDocTagDefinition
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/JSDocTagAnnotation.model.ts#L25)

Since v0.0.0

## getJSDocTagMetadata

Retrieve the JSDoc tag metadata annotation from a schema, if present.

**Example**

```ts
import { getJSDocTagMetadata } from "@beep/repo-utils/JSDoc/models/JSDocTagAnnotation.model"

console.log(getJSDocTagMetadata)
```

**Signature**

```ts
declare const getJSDocTagMetadata: (schema: S.Top) => JSDocTagAnnotationPayload | undefined
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/JSDocTagAnnotation.model.ts#L49)

Since v0.0.0