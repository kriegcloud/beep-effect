---
title: TopoSort.command.ts
nav_order: 77
parent: "@beep/repo-cli"
---

## TopoSort.command.ts overview

Topological sort command - outputs workspace packages in dependency order.

Since v0.0.0

---
## Exports Grouped by Category
- [utilities](#utilities)
  - [topoSortCommand](#toposortcommand)
---

# utilities

## topoSortCommand

CLI command that builds the workspace dependency graph and prints package names
in topological order (leaf dependencies first, dependents last).

**Example**

```ts
console.log("topoSortCommand")
```

**Signature**

```ts
declare const topoSortCommand: Command.Command<"topo-sort", {}, {}, DomainError | NoSuchFileError | CyclicDependencyError, FileSystem | FsUtils>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/TopoSort/TopoSort.command.ts#L33)

Since v0.0.0