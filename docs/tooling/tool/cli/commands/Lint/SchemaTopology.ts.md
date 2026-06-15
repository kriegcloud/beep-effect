---
title: SchemaTopology.ts
nav_order: 61
parent: "@beep/repo-cli"
---

## SchemaTopology.ts overview

Schema package topology lint command.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [SchemaTopologyViolation (class)](#schematopologyviolation-class)
- [utilities](#utilities)
  - [collectSchemaTopologyViolations](#collectschematopologyviolations)
  - [lintSchemaTopologyCommand](#lintschematopologycommand)
  - [runSchemaTopologyLint](#runschematopologylint)
---

# models

## SchemaTopologyViolation (class)

Schema topology lint violation.

**Example**

```ts
import { SchemaTopologyViolation } from "@beep/repo-cli/commands/Lint"

const violation = SchemaTopologyViolation.make({
  detail: "legacy schema export",
  file: "packages/foundation/modeling/schema/package.json",
})
console.log(violation.detail)
```

**Signature**

```ts
declare class SchemaTopologyViolation
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Lint/SchemaTopology.ts#L63)

Since v0.0.0

# utilities

## collectSchemaTopologyViolations

Collect schema topology violations without mutating process state.

**Example**

```ts
import { collectSchemaTopologyViolations } from "@beep/repo-cli/commands/Lint"
import { Effect } from "effect"

const program = Effect.gen(function* () {
  const violations = yield* collectSchemaTopologyViolations()
  console.log(violations.length)
})
console.log(program)
```

**Signature**

```ts
declare const collectSchemaTopologyViolations: () => Effect.Effect<ReadonlyArray<SchemaTopologyViolation>, never, FileSystem.FileSystem | Path.Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Lint/SchemaTopology.ts#L434)

Since v0.0.0

## lintSchemaTopologyCommand

Lint command for enforcing canonical `@beep/schema` topology.

**Example**

```ts
console.log("bun run beep lint schema-topology")
```

**Signature**

```ts
declare const lintSchemaTopologyCommand: Command.Command<"schema-topology", {}, {}, CliReportedExit, FileSystem.FileSystem | Path.Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Lint/SchemaTopology.ts#L492)

Since v0.0.0

## runSchemaTopologyLint

Run the schema topology lint command.

**Example**

```ts
console.log("bun run beep lint schema-topology")
```

**Signature**

```ts
declare const runSchemaTopologyLint: () => Effect.Effect<undefined, CliReportedExit, FileSystem.FileSystem | Path.Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Lint/SchemaTopology.ts#L466)

Since v0.0.0