---
title: Model.datetime.ts
nav_order: 152
parent: "@beep/schema"
---

## Model.datetime.ts overview

Internal schema module support.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [Date (interface)](#date-interface)
  - [DateTimeInsert (interface)](#datetimeinsert-interface)
  - [DateTimeInsertFromDate (interface)](#datetimeinsertfromdate-interface)
  - [DateTimeInsertFromNumber (interface)](#datetimeinsertfromnumber-interface)
  - [DateTimeUpdate (interface)](#datetimeupdate-interface)
  - [DateTimeUpdateFromDate (interface)](#datetimeupdatefromdate-interface)
  - [DateTimeUpdateFromNumber (interface)](#datetimeupdatefromnumber-interface)
- [schemas](#schemas)
  - [Date](#date)
  - [DateTimeFromDateWithNow](#datetimefromdatewithnow)
  - [DateTimeFromNumberWithNow](#datetimefromnumberwithnow)
  - [DateTimeInsert](#datetimeinsert)
  - [DateTimeInsertFromDate](#datetimeinsertfromdate)
  - [DateTimeInsertFromNumber](#datetimeinsertfromnumber)
  - [DateTimeUpdate](#datetimeupdate)
  - [DateTimeUpdateFromDate](#datetimeupdatefromdate)
  - [DateTimeUpdateFromNumber](#datetimeupdatefromnumber)
  - [DateTimeWithNow](#datetimewithnow)
  - [DateWithNow](#datewithnow)
---

# models

## Date (interface)

Schema interface that decodes a `YYYY-MM-DD` string into `DateTime.Utc` with time removed.

**Example**

```ts
import * as Model from "@beep/schema/Model"

const field: Model.Date = Model.Date
console.log(field)
```

**Signature**

```ts
export interface Date extends S.decodeTo<S.instanceOf<DateTime.Utc>, S.String> {}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Model/Model.datetime.ts#L25)

Since v0.0.0

## DateTimeInsert (interface)

Interface for a string-backed datetime insert field.

**Example**

```ts
import * as Model from "@beep/schema/Model"

const field: Model.DateTimeInsert = Model.DateTimeInsert
console.log(field)
```

**Signature**

```ts
export interface DateTimeInsert
  extends VariantSchema.Field<{
    readonly select: S.DateTimeUtcFromString;
    readonly insert: Overridable<S.DateTimeUtcFromString>;
    readonly json: S.DateTimeUtcFromString;
  }> {}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Model/Model.datetime.ts#L133)

Since v0.0.0

## DateTimeInsertFromDate (interface)

Interface for a Date-backed datetime insert field.

**Example**

```ts
import * as Model from "@beep/schema/Model"

const field: Model.DateTimeInsertFromDate = Model.DateTimeInsertFromDate
console.log(field)
```

**Signature**

```ts
export interface DateTimeInsertFromDate
  extends VariantSchema.Field<{
    readonly select: S.DateTimeUtcFromDate;
    readonly insert: Overridable<S.DateTimeUtcFromDate>;
    readonly json: S.DateTimeUtcFromString;
  }> {}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Model/Model.datetime.ts#L179)

Since v0.0.0

## DateTimeInsertFromNumber (interface)

Interface for a number-backed datetime insert field.

**Example**

```ts
import * as Model from "@beep/schema/Model"

const field: Model.DateTimeInsertFromNumber = Model.DateTimeInsertFromNumber
console.log(field)
```

**Signature**

```ts
export interface DateTimeInsertFromNumber
  extends VariantSchema.Field<{
    readonly select: S.DateTimeUtcFromMillis;
    readonly insert: Overridable<S.DateTimeUtcFromMillis>;
    readonly json: S.DateTimeUtcFromMillis;
  }> {}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Model/Model.datetime.ts#L225)

Since v0.0.0

## DateTimeUpdate (interface)

Interface for a string-backed datetime update field.

**Example**

```ts
import * as Model from "@beep/schema/Model"

const field: Model.DateTimeUpdate = Model.DateTimeUpdate
console.log(field)
```

**Signature**

```ts
export interface DateTimeUpdate
  extends VariantSchema.Field<{
    readonly select: S.DateTimeUtcFromString;
    readonly insert: Overridable<S.DateTimeUtcFromString>;
    readonly update: Overridable<S.DateTimeUtcFromString>;
    readonly json: S.DateTimeUtcFromString;
  }> {}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Model/Model.datetime.ts#L271)

Since v0.0.0

## DateTimeUpdateFromDate (interface)

Interface for a Date-backed datetime update field.

**Example**

```ts
import * as Model from "@beep/schema/Model"

const field: Model.DateTimeUpdateFromDate = Model.DateTimeUpdateFromDate
console.log(field)
```

**Signature**

```ts
export interface DateTimeUpdateFromDate
  extends VariantSchema.Field<{
    readonly select: S.DateTimeUtcFromDate;
    readonly insert: Overridable<S.DateTimeUtcFromDate>;
    readonly update: Overridable<S.DateTimeUtcFromDate>;
    readonly json: S.DateTimeUtcFromString;
  }> {}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Model/Model.datetime.ts#L320)

Since v0.0.0

## DateTimeUpdateFromNumber (interface)

Interface for a number-backed datetime update field.

**Example**

```ts
import * as Model from "@beep/schema/Model"

const field: Model.DateTimeUpdateFromNumber = Model.DateTimeUpdateFromNumber
console.log(field)
```

**Signature**

```ts
export interface DateTimeUpdateFromNumber
  extends VariantSchema.Field<{
    readonly select: S.DateTimeUtcFromMillis;
    readonly insert: Overridable<S.DateTimeUtcFromMillis>;
    readonly update: Overridable<S.DateTimeUtcFromMillis>;
    readonly json: S.DateTimeUtcFromMillis;
  }> {}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Model/Model.datetime.ts#L369)

Since v0.0.0

# schemas

## Date

A schema for a `DateTime.Utc` that is serialized as a date string in the
format `YYYY-MM-DD`.

**Example**

```ts
import * as Schema from "effect/Schema"
import * as Model from "@beep/schema/Model"

class Event extends Model.Class<Event>("Event")({}) {}

console.log(Event)
```

**Signature**

```ts
declare const Date: Date
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Model/Model.datetime.ts#L44)

Since v0.0.0

## DateTimeFromDateWithNow

Overridable datetime field (Date-backed) that defaults to `DateTime.now`.

**Example**

```ts
import * as Model from "@beep/schema/Model"

console.log(Model.DateTimeFromDateWithNow)
```

**Signature**

```ts
declare const DateTimeFromDateWithNow: VariantSchema.Overridable<S.DateTimeUtcFromDate>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Model/Model.datetime.ts#L98)

Since v0.0.0

## DateTimeFromNumberWithNow

Overridable datetime field (number-backed) that defaults to `DateTime.now`.

**Example**

```ts
import * as Model from "@beep/schema/Model"

console.log(Model.DateTimeFromNumberWithNow)
```

**Signature**

```ts
declare const DateTimeFromNumberWithNow: VariantSchema.Overridable<S.DateTimeUtcFromMillis>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Model/Model.datetime.ts#L115)

Since v0.0.0

## DateTimeInsert

A field that represents a date-time value that is inserted as the current
`DateTime.Utc`. It is serialized as a string for the database.

It is omitted from updates and is available for selection.

**Example**

```ts
import * as Schema from "effect/Schema"
import * as Model from "@beep/schema/Model"

class Group extends Model.Class<Group>("Group")({}) {}

console.log(Group)
```

**Signature**

```ts
declare const DateTimeInsert: DateTimeInsert
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Model/Model.datetime.ts#L159)

Since v0.0.0

## DateTimeInsertFromDate

A field that represents a date-time value that is inserted as the current
`DateTime.Utc`. It is serialized as a `Date` for the database.

It is omitted from updates and is available for selection.

**Example**

```ts
import * as Schema from "effect/Schema"
import * as Model from "@beep/schema/Model"

class Group extends Model.Class<Group>("Group")({}) {}

console.log(Group)
```

**Signature**

```ts
declare const DateTimeInsertFromDate: DateTimeInsertFromDate
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Model/Model.datetime.ts#L205)

Since v0.0.0

## DateTimeInsertFromNumber

A field that represents a date-time value that is inserted as the current
`DateTime.Utc`. It is serialized as a `number`.

It is omitted from updates and is available for selection.

**Example**

```ts
import * as Schema from "effect/Schema"
import * as Model from "@beep/schema/Model"

class Group extends Model.Class<Group>("Group")({}) {}

console.log(Group)
```

**Signature**

```ts
declare const DateTimeInsertFromNumber: DateTimeInsertFromNumber
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Model/Model.datetime.ts#L251)

Since v0.0.0

## DateTimeUpdate

A field that represents a date-time value that is updated as the current
`DateTime.Utc`. It is serialized as a string for the database.

It is set to the current `DateTime.Utc` on updates and inserts and is
available for selection.

**Example**

```ts
import * as Schema from "effect/Schema"
import * as Model from "@beep/schema/Model"

class Group extends Model.Class<Group>("Group")({}) {}

console.log(Group)
```

**Signature**

```ts
declare const DateTimeUpdate: DateTimeUpdate
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Model/Model.datetime.ts#L299)

Since v0.0.0

## DateTimeUpdateFromDate

A field that represents a date-time value that is updated as the current
`DateTime.Utc`. It is serialized as a `Date` for the database.

It is set to the current `DateTime.Utc` on updates and inserts and is
available for selection.

**Example**

```ts
import * as Schema from "effect/Schema"
import * as Model from "@beep/schema/Model"

class Group extends Model.Class<Group>("Group")({}) {}

console.log(Group)
```

**Signature**

```ts
declare const DateTimeUpdateFromDate: DateTimeUpdateFromDate
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Model/Model.datetime.ts#L348)

Since v0.0.0

## DateTimeUpdateFromNumber

A field that represents a date-time value that is updated as the current
`DateTime.Utc`. It is serialized as a `number`.

It is set to the current `DateTime.Utc` on updates and inserts and is
available for selection.

**Example**

```ts
import * as Schema from "effect/Schema"
import * as Model from "@beep/schema/Model"

class Group extends Model.Class<Group>("Group")({}) {}

console.log(Group)
```

**Signature**

```ts
declare const DateTimeUpdateFromNumber: DateTimeUpdateFromNumber
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Model/Model.datetime.ts#L397)

Since v0.0.0

## DateTimeWithNow

Overridable datetime field (string-backed) that defaults to `DateTime.now`.

**Example**

```ts
import * as Model from "@beep/schema/Model"

console.log(Model.DateTimeWithNow)
```

**Signature**

```ts
declare const DateTimeWithNow: VariantSchema.Overridable<S.DateTimeUtcFromString>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Model/Model.datetime.ts#L81)

Since v0.0.0

## DateWithNow

Overridable date field that defaults to today's UTC date on insert.

**Example**

```ts
import * as Model from "@beep/schema/Model"

console.log(Model.DateWithNow)
```

**Signature**

```ts
declare const DateWithNow: VariantSchema.Overridable<Date>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Model/Model.datetime.ts#L64)

Since v0.0.0