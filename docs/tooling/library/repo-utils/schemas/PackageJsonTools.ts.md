---
title: PackageJsonTools.ts
nav_order: 51
parent: "@beep/repo-utils"
---

## PackageJsonTools.ts overview

Canonicalization, artifact export, diff/patch, and diagnostics helpers for package.json schemas.

Since v0.0.0

---
## Exports Grouped by Category
- [combinators](#combinators)
  - [applyPackageJsonPatchEffect](#applypackagejsonpatcheffect)
  - [diffPackageJsonEffect](#diffpackagejsoneffect)
  - [encodePackageJsonCanonicalPrettyEffect](#encodepackagejsoncanonicalprettyeffect)
  - [normalizePackageJsonEffect](#normalizepackagejsoneffect)
- [models](#models)
  - [PackageJsonValidationIssue (class)](#packagejsonvalidationissue-class)
- [utilities](#utilities)
  - [getPackageJsonSchemaIssues](#getpackagejsonschemaissues)
  - [npmPackageJsonJsonSchema](#npmpackagejsonjsonschema)
  - [packageJsonJsonSchema](#packagejsonjsonschema)
---

# combinators

## applyPackageJsonPatchEffect

Apply a typed JSON Patch document to a package.json value.

**Example**

```ts
import { applyPackageJsonPatchEffect } from "@beep/repo-utils/schemas/PackageJsonTools"
const program = applyPackageJsonPatchEffect(
  { name: "@beep/example", version: "0.0.0" },
  []
)
console.log(program)
```

**Signature**

```ts
declare const applyPackageJsonPatchEffect: { (patch: JsonPatch.JsonPatch): (base: unknown) => Effect.Effect<PackageJson.Type, S.SchemaError | DomainError>; (base: unknown, patch: JsonPatch.JsonPatch): Effect.Effect<PackageJson.Type, S.SchemaError | DomainError>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/PackageJsonTools.ts#L392)

Since v0.0.0

## diffPackageJsonEffect

Compute a typed JSON Patch diff between two package.json values.

**Example**

```ts
import { diffPackageJsonEffect } from "@beep/repo-utils/schemas/PackageJsonTools"
const program = diffPackageJsonEffect(
  { name: "@beep/example", version: "0.0.0" },
  { name: "@beep/example", version: "0.0.1" }
)
console.log(program)
```

**Signature**

```ts
declare const diffPackageJsonEffect: { (after: unknown): (before: unknown) => Effect.Effect<JsonPatch.JsonPatch, S.SchemaError>; (before: unknown, after: unknown): Effect.Effect<JsonPatch.JsonPatch, S.SchemaError>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/PackageJsonTools.ts#L365)

Since v0.0.0

## encodePackageJsonCanonicalPrettyEffect

Encode an unknown package.json value to a canonical pretty JSON string.

**Example**

```ts
import { encodePackageJsonCanonicalPrettyEffect } from "@beep/repo-utils/schemas/PackageJsonTools"
const program = encodePackageJsonCanonicalPrettyEffect({
  name: "@beep/example",
  version: "0.0.0"
})
console.log(program)
```

**Signature**

```ts
declare const encodePackageJsonCanonicalPrettyEffect: (input: unknown) => Effect.Effect<string, S.SchemaError | DomainError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/PackageJsonTools.ts#L341)

Since v0.0.0

## normalizePackageJsonEffect

Normalize an unknown package.json value into a canonical encoded object.

**Example**

```ts
import { normalizePackageJsonEffect } from "@beep/repo-utils/schemas/PackageJsonTools"
const program = normalizePackageJsonEffect({
  name: "@beep/example",
  version: "0.0.0"
})
console.log(program)
```

**Signature**

```ts
declare const normalizePackageJsonEffect: (input: unknown) => Effect.Effect<PackageJson.Encoded, S.SchemaError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/PackageJsonTools.ts#L320)

Since v0.0.0

# models

## PackageJsonValidationIssue (class)

Structured package.json validation issue.

**Example**

```ts
import { PackageJsonValidationIssue } from "@beep/repo-utils/schemas/PackageJsonTools"
const issue = PackageJsonValidationIssue.make({
  message: "Expected string",
  path: ["name"],
  pointer: "/name"
})
console.log(issue.pointer)
```

**Signature**

```ts
declare class PackageJsonValidationIssue
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/PackageJsonTools.ts#L266)

Since v0.0.0

# utilities

## getPackageJsonSchemaIssues

Format a SchemaError into package.json validation issues with JSON Pointers.

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import { getPackageJsonSchemaIssues } from "@beep/repo-utils/schemas/PackageJsonTools"
const program = S.decodeUnknownEffect(S.String)(1).pipe(
  Effect.mapError(getPackageJsonSchemaIssues)
)
console.log(program)
```

**Signature**

```ts
declare const getPackageJsonSchemaIssues: (error: S.SchemaError) => ReadonlyArray<PackageJsonValidationIssue>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/PackageJsonTools.ts#L424)

Since v0.0.0

## npmPackageJsonJsonSchema

Draft 2020-12 JSON Schema document for the npm-only package.json schema.

**Example**

```ts
import { npmPackageJsonJsonSchema } from "@beep/repo-utils/schemas/PackageJsonTools"
const schema = npmPackageJsonJsonSchema
console.log(schema)
```

**Signature**

```ts
declare const npmPackageJsonJsonSchema: Document<"draft-2020-12">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/PackageJsonTools.ts#L303)

Since v0.0.0

## packageJsonJsonSchema

Draft 2020-12 JSON Schema document for the repo-aware package.json schema.

**Example**

```ts
import { packageJsonJsonSchema } from "@beep/repo-utils/schemas/PackageJsonTools"
const schema = packageJsonJsonSchema
console.log(schema)
```

**Signature**

```ts
declare const packageJsonJsonSchema: Document<"draft-2020-12">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/PackageJsonTools.ts#L289)

Since v0.0.0