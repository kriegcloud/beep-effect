---
title: Purge.command.ts
nav_order: 63
parent: "@beep/repo-cli"
---

## Purge.command.ts overview

Purge command - remove root and workspace build artifacts.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [PurgeSummary (class)](#purgesummary-class)
- [utilities](#utilities)
  - [purgeAtRoot](#purgeatroot)
  - [purgeCommand](#purgecommand)
---

# models

## PurgeSummary (class)

Summary statistics returned after a purge run.

**Example**

```ts
console.log("PurgeSummary")
```

**Signature**

```ts
declare class PurgeSummary
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Purge/Purge.command.ts#L127)

Since v0.0.0

# utilities

## purgeAtRoot

Purge root/workspace artifacts under a specific root directory.

**Example**

```ts
console.log("purgeAtRoot")
```

**Signature**

```ts
declare const purgeAtRoot: { (rootDir: string, removeLock: boolean): Effect.Effect<PurgeSummary, DomainError, FileSystem.FileSystem | Path.Path>; (removeLock: boolean): (rootDir: string) => Effect.Effect<PurgeSummary, DomainError, FileSystem.FileSystem | Path.Path>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Purge/Purge.command.ts#L192)

Since v0.0.0

## purgeCommand

CLI command to purge workspace/root build artifacts.

**Example**

```ts
console.log("purgeCommand")
```

**Signature**

```ts
declare const purgeCommand: Command.Command<"purge", { readonly lock: boolean; }, {}, DomainError | NoSuchFileError, FileSystem.FileSystem | Path.Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Purge/Purge.command.ts#L249)

Since v0.0.0