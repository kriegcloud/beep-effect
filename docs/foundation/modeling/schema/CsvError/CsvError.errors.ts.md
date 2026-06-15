---
title: CsvError.errors.ts
nav_order: 38
parent: "@beep/schema"
---

## CsvError.errors.ts overview

Shared CSV domain errors.

Since v0.0.0

---
## Exports Grouped by Category
- [schemas](#schemas)
  - [Error](#error)
  - [make](#make)
- [utilities](#utilities)
  - [csvError](#csverror)
- [validation](#validation)
  - [CsvError (class)](#csverror-class)
---

# schemas

## Error

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Error: typeof CsvError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CsvError/CsvError.errors.ts#L80)

Since v0.0.0

## make

Public aliases for concise namespace roles.

**Signature**

```ts
declare const make: { (message: string): CsvError; (offset: number): (message: string) => CsvError; (message: string, offset: number): CsvError; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CsvError/CsvError.errors.ts#L80)

Since v0.0.0

# utilities

## csvError

Construct a `CsvError`.

**Example**

```ts
import { csvError } from "@beep/schema/CsvError"

const error = csvError("Invalid CSV", 4)
console.log(error.offset)
```

**Signature**

```ts
declare const csvError: { (message: string): CsvError; (offset: number): (message: string) => CsvError; (message: string, offset: number): CsvError; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CsvError/CsvError.errors.ts#L59)

Since v0.0.0

# validation

## CsvError (class)

Raised when CSV parsing, header validation, or formatting fails.

**Example**

```ts
import { CsvError } from "@beep/schema/CsvError"

const error = CsvError.make({ message: "Invalid CSV" })
console.log(error.message)
```

**Signature**

```ts
declare class CsvError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CsvError/CsvError.errors.ts#L43)

Since v0.0.0