---
title: index.ts
nav_order: 37
parent: "@beep/nlp"
---

## index.ts overview

The 11-stratum text-kind ontology, typed-text payloads, smart constructors,
and the containment poset.

**Example**

```ts
```typescript
import { Kind } from "@beep/nlp/Ontology"

console.log(Kind.canContain("Document", "Sentence")) // true
```
```

Since v0.0.0

---
## Exports Grouped by Category

---

# models

## Kind (namespace export)

Re-exports all named exports from the "./Kind.ts" module as `Kind`.

**Example**

```ts
```typescript
import { Kind } from "@beep/nlp/Ontology"

console.log(Kind.canContain("Document", "Sentence")) // true
```
```

**Signature**

```ts
export * as Kind from "./Kind.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Ontology/index.ts#L22)

Since v0.0.0