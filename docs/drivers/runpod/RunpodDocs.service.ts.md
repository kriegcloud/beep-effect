---
title: RunpodDocs.service.ts
nav_order: 6
parent: "@beep/runpod"
---

## RunpodDocs.service.ts overview

Runpod LLM documentation index client.

Since v0.1.0

---
## Exports Grouped by Category
- [models](#models)
  - [RunpodDocsIndex (class)](#runpoddocsindex-class)
  - [RunpodDocsIndexEntry (class)](#runpoddocsindexentry-class)
- [parsing](#parsing)
  - [parseRunpodDocsIndex](#parserunpoddocsindex)
- [services](#services)
  - [RunpodDocs (class)](#runpoddocs-class)
---

# models

## RunpodDocsIndex (class)

Parsed Runpod documentation index.

**Example**

```ts
import { RunpodDocsIndex } from "@beep/runpod"

const index = RunpodDocsIndex.make({
  entries: [],
  title: "Runpod Documentation"
})
console.log(index.title)
```

**Signature**

```ts
declare class RunpodDocsIndex
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/runpod/src/RunpodDocs.service.ts#L70)

Since v0.1.0

## RunpodDocsIndexEntry (class)

One Markdown documentation link parsed from Runpod's `llms.txt` index.

**Example**

```ts
import { RunpodDocsIndexEntry } from "@beep/runpod"

const entry = RunpodDocsIndexEntry.make({
  section: "Pods",
  title: "Create a pod",
  url: "https://docs.runpod.io/pods"
})
console.log(entry.title)
```

**Signature**

```ts
declare class RunpodDocsIndexEntry
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/runpod/src/RunpodDocs.service.ts#L41)

Since v0.1.0

# parsing

## parseRunpodDocsIndex

Parse Runpod's `llms.txt` Markdown index into a structured schema model.

**Example**

```ts
import { Effect } from "effect"
import { parseRunpodDocsIndex } from "@beep/runpod"

const markdown = "# Runpod Docs\n\n## Pods\n- [Create a pod](https://docs.runpod.io/pods)"
const program = parseRunpodDocsIndex(markdown)
Effect.runPromise(program).then((index) => console.log(index.entries.length))
```

**Signature**

```ts
declare const parseRunpodDocsIndex: (text: string) => Effect.Effect<RunpodDocsIndex, RunpodDocsError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/runpod/src/RunpodDocs.service.ts#L205)

Since v0.1.0

# services

## RunpodDocs (class)

Effect service for the Runpod LLM documentation index.

**Example**

```ts
import { RunpodDocs, RunpodDocsConfigInput } from "@beep/runpod"

const layer = RunpodDocs.makeLayer(
  RunpodDocsConfigInput.make({ indexUrl: "https://docs.runpod.io/llms.txt" })
)
console.log(layer)
```

**Signature**

```ts
declare class RunpodDocs
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/runpod/src/RunpodDocs.service.ts#L308)

Since v0.1.0