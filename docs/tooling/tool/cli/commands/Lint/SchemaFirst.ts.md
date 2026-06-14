---
title: SchemaFirst.ts
nav_order: 60
parent: "@beep/repo-cli"
---

## SchemaFirst.ts overview

Schema-first inventory and enforcement command.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [SchemaFirstInventoryEntry (namespace)](#schemafirstinventoryentry-namespace)
    - [Encoded (type alias)](#encoded-type-alias)
- [utilities](#utilities)
  - [lintSchemaFirstCommand](#lintschemafirstcommand)
  - [runSchemaFirstLint](#runschemafirstlint)
  - [sourceTextHasSchemaArbitraryPropertyCoverage](#sourcetexthasschemaarbitrarypropertycoverage)
---

# models

## SchemaFirstInventoryEntry (namespace)

Namespace for `SchemaFirstInventoryEntry` companion types.

**Example**

```ts
console.log("SchemaFirstInventoryEntry")
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Lint/SchemaFirst.ts#L193)

Since v0.0.0

### Encoded (type alias)

Encoded representation of `SchemaFirstInventoryEntry`.

**Example**

```ts
console.log("Encoded")
```

**Signature**

```ts
type Encoded = typeof SchemaFirstInventoryEntry.Encoded
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Lint/SchemaFirst.ts#L204)

Since v0.0.0

# utilities

## lintSchemaFirstCommand

Repo-wide schema-first lint command.

**Example**

```ts
console.log("lintSchemaFirstCommand")
```

**Signature**

```ts
declare const lintSchemaFirstCommand: Command.Command<"schema-first", { readonly write: boolean; }, {}, S.SchemaError | PlatformError | CliReportedExit | DomainError | NoSuchFileError | Issue, FileSystem.FileSystem | Path.Path | FsUtils>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Lint/SchemaFirst.ts#L1417)

Since v0.0.0

## runSchemaFirstLint

Run schema-first inventory verification against the committed baseline.

**Example**

```ts
console.log("runSchemaFirstLint")
```

**Signature**

```ts
declare const runSchemaFirstLint: (options: SchemaFirstLintOptions) => Effect.Effect<SchemaFirstLintSummary, S.SchemaError | PlatformError | CliReportedExit | DomainError | NoSuchFileError | Issue, FileSystem.FileSystem | Path.Path | FsUtils>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Lint/SchemaFirst.ts#L1274)

Since v0.0.0

## sourceTextHasSchemaArbitraryPropertyCoverage

Test whether source text contains schema-derived arbitrary coverage.

**Example**

```ts
import { sourceTextHasSchemaArbitraryPropertyCoverage } from "@beep/repo-cli/commands/Lint"

console.log(sourceTextHasSchemaArbitraryPropertyCoverage("fc.property(S.toArbitrary(Worker), (worker) => true)"))
```

**Signature**

```ts
declare const sourceTextHasSchemaArbitraryPropertyCoverage: (sourceText: string) => boolean
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Lint/SchemaFirst.ts#L993)

Since v0.0.0