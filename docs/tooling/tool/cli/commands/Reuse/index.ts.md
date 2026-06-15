---
title: index.ts
nav_order: 69
parent: "@beep/repo-cli"
---

## index.ts overview

Public structural-clone baseline helpers (gate diff + document builder) for tests and tooling.

Since v0.0.0

---
## Exports Grouped by Category
- [cli-commands](#cli-commands)
  - ["./Reuse.command.js" (namespace export)](#reusecommandjs-namespace-export)
  - ["./Reuse.errors.js" (namespace export)](#reuseerrorsjs-namespace-export)
- [utilities](#utilities)
  - [CloneBaselineDocument](#clonebaselinedocument)
  - [CloneBaselineEntry](#clonebaselineentry)
  - [buildCloneDocument](#buildclonedocument)
  - [diffCloneBaseline](#diffclonebaseline)
---

# cli-commands

## "./Reuse.command.js" (namespace export)

Re-exports all named exports from the "./Reuse.command.js" module.

**Signature**

```ts
export * from "./Reuse.command.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Reuse/index.ts#L25)

Since v0.0.0

## "./Reuse.errors.js" (namespace export)

Re-exports all named exports from the "./Reuse.errors.js" module.

**Signature**

```ts
export * from "./Reuse.errors.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Reuse/index.ts#L32)

Since v0.0.0

# utilities

## CloneBaselineDocument

Public structural-clone baseline helpers (gate diff + document builder) for tests and tooling.

**Signature**

```ts
declare const CloneBaselineDocument: typeof CloneBaselineDocument
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Reuse/index.ts#L15)

Since v0.0.0

## CloneBaselineEntry

Public structural-clone baseline helpers (gate diff + document builder) for tests and tooling.

**Signature**

```ts
declare const CloneBaselineEntry: typeof CloneBaselineEntry
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Reuse/index.ts#L16)

Since v0.0.0

## buildCloneDocument

Public structural-clone baseline helpers (gate diff + document builder) for tests and tooling.

**Signature**

```ts
declare const buildCloneDocument: (candidates: ReadonlyArray<ReuseCandidate>) => CloneBaselineDocument
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Reuse/index.ts#L14)

Since v0.0.0

## diffCloneBaseline

Public structural-clone baseline helpers (gate diff + document builder) for tests and tooling.

**Signature**

```ts
declare const diffCloneBaseline: (input: { readonly live: CloneBaselineDocument; readonly baseline: Option<CloneBaselineDocument>; }) => { readonly newClusters: ReadonlyArray<CloneBaselineEntry>; readonly grownClusters: ReadonlyArray<{ readonly entry: CloneBaselineEntry; readonly previousOccurrences: number; }>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Reuse/index.ts#L17)

Since v0.0.0