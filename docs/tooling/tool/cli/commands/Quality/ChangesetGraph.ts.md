---
title: ChangesetGraph.ts
nav_order: 64
parent: "@beep/repo-cli"
---

## ChangesetGraph.ts overview

Changeset package graph validation for release safety.

Since v0.0.0

---
## Exports Grouped by Category
- [errors](#errors)
  - [ChangesetGraphError](#changesetgrapherror)
- [models](#models)
  - [ChangesetGraphPackageReference (class)](#changesetgraphpackagereference-class)
  - [ChangesetGraphSummary (class)](#changesetgraphsummary-class)
- [utilities](#utilities)
  - [changesetPackageReferencesFromText](#changesetpackagereferencesfromtext)
  - [findMissingChangesetPackageReferences](#findmissingchangesetpackagereferences)
  - [makeChangesetGraphSummary](#makechangesetgraphsummary)
  - [runChangesetGraphCheck](#runchangesetgraphcheck)
---

# errors

## ChangesetGraphError

Public changeset graph error export.

**Signature**

```ts
declare const ChangesetGraphError: typeof ChangesetGraphError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Quality/ChangesetGraph.ts#L27)

Since v0.0.0

# models

## ChangesetGraphPackageReference (class)

A package name referenced by a changeset file.

**Example**

```ts
import { ChangesetGraphPackageReference } from "@beep/repo-cli/commands/Quality/ChangesetGraph"

const reference = ChangesetGraphPackageReference.make({
  file: ".changeset/example.md",
  packageName: "@beep/schema"
})
console.log(reference.packageName)
```

**Signature**

```ts
declare class ChangesetGraphPackageReference
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Quality/ChangesetGraph.ts#L72)

Since v0.0.0

## ChangesetGraphSummary (class)

Summary emitted by the changeset package graph guard.

**Example**

```ts
import { ChangesetGraphSummary } from "@beep/repo-cli/commands/Quality/ChangesetGraph"

const summary = ChangesetGraphSummary.make({
  workspacePackages: 1,
  changesetFiles: 1,
  references: 1,
  missingReferences: []
})
console.log(summary.workspacePackages)
```

**Signature**

```ts
declare class ChangesetGraphSummary
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Quality/ChangesetGraph.ts#L102)

Since v0.0.0

# utilities

## changesetPackageReferencesFromText

Parse package references from one changeset Markdown document.

**Example**

```ts
import { Effect } from "effect"
import { changesetPackageReferencesFromText } from "@beep/repo-cli/commands/Quality/ChangesetGraph"

const program = changesetPackageReferencesFromText(
  ".changeset/example.md",
  "---\n\"@beep/schema\": patch\n---\n\nPatch schema."
)
Effect.runPromise(program)
```

**Signature**

```ts
declare const changesetPackageReferencesFromText: (file: string, content: string) => Effect.Effect<ReadonlyArray<ChangesetGraphPackageReference>, ChangesetGraphError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Quality/ChangesetGraph.ts#L309)

Since v0.0.0

## findMissingChangesetPackageReferences

Find changeset package references that are not in the workspace graph.

**Example**

```ts
import { ChangesetGraphPackageReference, findMissingChangesetPackageReferences } from "@beep/repo-cli/commands/Quality/ChangesetGraph"

const missing = findMissingChangesetPackageReferences(
  ["@beep/schema"],
  [ChangesetGraphPackageReference.make({ file: ".changeset/demo.md", packageName: "@beep/missing" })]
)
console.log(missing.length)
```

**Signature**

```ts
declare const findMissingChangesetPackageReferences: { (references: ReadonlyArray<ChangesetGraphPackageReference>): (workspacePackageNames: ReadonlyArray<string>) => ReadonlyArray<ChangesetGraphPackageReference>; (workspacePackageNames: ReadonlyArray<string>, references: ReadonlyArray<ChangesetGraphPackageReference>): ReadonlyArray<ChangesetGraphPackageReference>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Quality/ChangesetGraph.ts#L402)

Since v0.0.0

## makeChangesetGraphSummary

Build a changeset graph summary from already-collected inputs.

**Example**

```ts
import { makeChangesetGraphSummary } from "@beep/repo-cli/commands/Quality/ChangesetGraph"

const summary = makeChangesetGraphSummary(["@beep/schema"], [".changeset/demo.md"], [])
console.log(summary.changesetFiles)
```

**Signature**

```ts
declare const makeChangesetGraphSummary: (workspacePackageNames: ReadonlyArray<string>, changesetFiles: ReadonlyArray<string>, references: ReadonlyArray<ChangesetGraphPackageReference>) => ChangesetGraphSummary
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Quality/ChangesetGraph.ts#L449)

Since v0.0.0

## runChangesetGraphCheck

Run the non-mutating changeset package graph guard.

**Example**

```ts
import { runChangesetGraphCheck } from "@beep/repo-cli/commands/Quality/ChangesetGraph"

const program = runChangesetGraphCheck(process.cwd())
console.log(program)
```

**Signature**

```ts
declare const runChangesetGraphCheck: (repoRoot: string) => Effect.Effect<ChangesetGraphSummary, ChangesetGraphError, FileSystem.FileSystem | Path.Path | ChildProcessSpawner.ChildProcessSpawner>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Quality/ChangesetGraph.ts#L464)

Since v0.0.0