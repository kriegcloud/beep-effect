---
title: LegalContact.values.ts
nav_order: 7
parent: "@beep/law-practice-domain"
---

## LegalContact.values.ts overview

Legal contact value schemas.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [LegalContactRole (type alias)](#legalcontactrole-type-alias)
- [schemas](#schemas)
  - [LegalContactRole](#legalcontactrole)
---

# models

## LegalContactRole (type alias)

Runtime type for `LegalContactRole`.

**Example**

```ts
import type { LegalContactRole } from "@beep/law-practice-domain"

const value: LegalContactRole = "founder"
console.log(value)
```

**Signature**

```ts
type LegalContactRole = typeof LegalContactRole.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/law-practice/domain/src/entities/LegalContact/LegalContact.values.ts#L46)

Since v0.0.0

# schemas

## LegalContactRole

Legal contact role vocabulary represented in proof seeds.

**Example**

```ts
import { LegalContactRole } from "@beep/law-practice-domain"

console.log(LegalContactRole.is.founder("founder"))
```

**Signature**

```ts
declare const LegalContactRole: AnnotatedSchema<LiteralKit<readonly ["founder"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/law-practice/domain/src/entities/LegalContact/LegalContact.values.ts#L26)

Since v0.0.0