---
title: Codegen.command.ts
nav_order: 16
parent: "@beep/repo-cli"
---

## Codegen.command.ts overview

Code generation command - generate barrel file exports for packages.

Scans a package's `src/` directory for TypeScript modules and generates
an `index.ts` barrel file with `export *` re-exports, each annotated
with `@since 0.0.0` JSDoc tags as required by `@beep/repo-docgen`.

Since v0.0.0

---
## Exports Grouped by Category
- [utilities](#utilities)
  - [codegenCommand](#codegencommand)
---

# utilities

## codegenCommand

CLI command that scans a package's `src/` directory and generates (or previews)
an `index.ts` barrel file with `export *` re-exports for every discovered module.

**Example**

```ts
console.log("codegenCommand")
```

**Signature**

```ts
declare const codegenCommand: Command.Command<"codegen", { readonly packageDir: string; readonly dryRun: boolean; }, {}, PlatformError, FileSystem.FileSystem | Path.Path | FsUtils>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Codegen/Codegen.command.ts#L250)

Since v0.0.0