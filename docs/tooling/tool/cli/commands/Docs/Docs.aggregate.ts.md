---
title: Docs.aggregate.ts
nav_order: 25
parent: "@beep/repo-cli"
---

## Docs.aggregate.ts overview

Docs aggregation command implementation.

This command delegates to the shared human-first docgen aggregation helper so
`beep docs aggregate` and `beep docgen aggregate` cannot drift.

Since v0.0.0

---
## Exports Grouped by Category
- [utilities](#utilities)
  - [docsAggregateCommand](#docsaggregatecommand)
---

# utilities

## docsAggregateCommand

Aggregate generated package docs into the root `docs/` layout.

**Example**

```ts
console.log("docsAggregateCommand")
```

**Signature**

```ts
declare const docsAggregateCommand: Command.Command<"aggregate", { readonly package: O.Option<string>; readonly filter: O.Option<string>; readonly clean: boolean; }, {}, CliReportedExit, FileSystem | Path | FsUtils>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Docs/Docs.aggregate.ts#L75)

Since v0.0.0