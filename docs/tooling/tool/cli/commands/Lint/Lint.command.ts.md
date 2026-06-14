---
title: Lint.command.ts
nav_order: 56
parent: "@beep/repo-cli"
---

## Lint.command.ts overview

Lint policy command suite.

Since v0.0.0

---
## Exports Grouped by Category
- [utilities](#utilities)
  - [collectTypeScriptFiles](#collecttypescriptfiles)
  - [lintCommand](#lintcommand)
---

# utilities

## collectTypeScriptFiles

Collect TypeScript source files under a lint root without following symlink escapes.

**Example**

```ts
console.log("collectTypeScriptFiles")
```

**Signature**

```ts
declare const collectTypeScriptFiles: (root: string) => Effect.Effect<ReadonlyArray<string>, LintFileDiscoveryError, FileSystem.FileSystem | Path.Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Lint/Lint.command.ts#L132)

Since v0.0.0

## lintCommand

Lint command group.

**Example**

```ts
console.log("lintCommand")
```

**Signature**

```ts
declare const lintCommand: Command.Command<"lint", {} | {}, {}, S.SchemaError | PlatformError | CliReportedExit | DomainError | NoSuchFileError | Issue | LintCircularAnalysisError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Lint/Lint.command.ts#L652)

Since v0.0.0