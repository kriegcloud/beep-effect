---
title: DomainModel.ts
nav_order: 48
parent: "@beep/schema"
---

## DomainModel.ts overview

Shared domain model base with audit and bookkeeping fields.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [DomainModel (class)](#domainmodel-class)
  - [defaultFields](#defaultfields)
---

# models

## DomainModel (class)

Base class for persisted domain models that share audit metadata.

**Example**

```ts
import { DomainModel } from "@beep/schema/DomainModel"
import * as Model from "@beep/schema/Model"
import * as S from "effect/Schema"

const OrganizationId = S.String.pipe(S.brand("OrganizationId"))

class Organization extends DomainModel.extend<Organization, typeof DomainModel>("Organization")({
  id: Model.Generated(OrganizationId)
}) {}

console.log(Organization.insert)
```

**Signature**

```ts
declare class DomainModel
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/DomainModel.ts#L65)

Since v0.0.0

## defaultFields

Default audit and bookkeeping fields for persisted domain models.

The base intentionally does not include an `id` field. Derived models add the
branded identifier that belongs to their aggregate or entity.

**Example**

```ts
import { defaultFields } from "@beep/schema/DomainModel"

const fieldNames = Object.keys(defaultFields)

console.log(fieldNames)
```

**Signature**

```ts
declare const defaultFields: { readonly createdAt: Model.DateTimeInsertFromNumber; readonly updatedAt: Model.DateTimeUpdateFromNumber; readonly deletedAt: Model.FieldOption<S.DateTimeUtcFromMillis>; readonly createdBy: Model.FieldOption<S.String>; readonly updatedBy: Model.FieldOption<S.String>; readonly deletedBy: Model.FieldOption<S.String>; readonly version: Model.Generated<AnnotatedSchema<S.brand<S.brand<S.Int, "Int">, "NonNegativeInt">>>; readonly source: Model.FieldOption<S.String>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/DomainModel.ts#L33)

Since v0.0.0