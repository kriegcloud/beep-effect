---
title: PackageTestImports.ts
nav_order: 58
parent: "@beep/repo-cli"
---

## PackageTestImports.ts overview

Package test import policy command.

Since v0.0.0

---
## Exports Grouped by Category
- [utilities](#utilities)
  - [lintPackageTestImportsCommand](#lintpackagetestimportscommand)
---

# utilities

## lintPackageTestImportsCommand

Lint command for enforcing package aliases from package test and dtslint files.

**Example**

```ts
console.log("bun run beep lint package-test-imports")
```

**Signature**

```ts
declare const lintPackageTestImportsCommand: Command.Command<"package-test-imports", {}, {}, CliReportedExit, FileSystem.FileSystem | Path.Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Lint/PackageTestImports.ts#L319)

Since v0.0.0