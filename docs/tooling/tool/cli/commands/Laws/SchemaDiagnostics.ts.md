---
title: SchemaDiagnostics.ts
nav_order: 53
parent: "@beep/repo-cli"
---

## SchemaDiagnostics.ts overview

Schema issue diagnostic formatting for laws tooling.

Since v0.0.0

---
## Exports Grouped by Category
- [utilities](#utilities)
  - [formatRedactedSchemaDiagnostics](#formatredactedschemadiagnostics)
  - [formatSchemaDiagnostics](#formatschemadiagnostics)
---

# utilities

## formatRedactedSchemaDiagnostics

Format a schema issue or schema error after redacting actual values.

**Example**

```ts
import { formatRedactedSchemaDiagnostics } from "@beep/repo-cli/commands/Laws/SchemaDiagnostics"

console.log(formatRedactedSchemaDiagnostics)
```

**Signature**

```ts
declare const formatRedactedSchemaDiagnostics: (errorOrIssue: S.SchemaError | SchemaIssue.Issue) => ReadonlyArray<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Laws/SchemaDiagnostics.ts#L66)

Since v0.0.0

## formatSchemaDiagnostics

Format a schema issue or schema error as path-prefixed Standard Schema V1 diagnostics.

**Example**

```ts
import { formatSchemaDiagnostics } from "@beep/repo-cli/commands/Laws/SchemaDiagnostics"

console.log(formatSchemaDiagnostics)
```

**Signature**

```ts
declare const formatSchemaDiagnostics: (errorOrIssue: S.SchemaError | SchemaIssue.Issue) => ReadonlyArray<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Laws/SchemaDiagnostics.ts#L50)

Since v0.0.0