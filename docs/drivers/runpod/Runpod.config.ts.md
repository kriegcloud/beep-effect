---
title: Runpod.config.ts
nav_order: 3
parent: "@beep/runpod"
---

## Runpod.config.ts overview

Runtime configuration models for the Runpod driver.

Since v0.1.0

---
## Exports Grouped by Category
- [constants](#constants)
  - [RUNPOD_API_URL](#runpod_api_url)
  - [RUNPOD_DOCS_INDEX_URL](#runpod_docs_index_url)
- [models](#models)
  - [RunpodConfigInput (class)](#runpodconfiginput-class)
  - [RunpodDocsConfigInput (class)](#runpoddocsconfiginput-class)
---

# constants

## RUNPOD_API_URL

Default Runpod REST API v1 base URL.

**Example**

```ts
import { RUNPOD_API_URL } from "@beep/runpod"

console.log(RUNPOD_API_URL)
```

**Signature**

```ts
declare const RUNPOD_API_URL: "https://rest.runpod.io/v1"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/runpod/src/Runpod.config.ts#L26)

Since v0.1.0

## RUNPOD_DOCS_INDEX_URL

Default Runpod documentation index URL for LLM-oriented docs.

**Example**

```ts
import { RUNPOD_DOCS_INDEX_URL } from "@beep/runpod"

console.log(RUNPOD_DOCS_INDEX_URL)
```

**Signature**

```ts
declare const RUNPOD_DOCS_INDEX_URL: "https://docs.runpod.io/llms.txt"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/runpod/src/Runpod.config.ts#L41)

Since v0.1.0

# models

## RunpodConfigInput (class)

Runtime configuration accepted by `Runpod.makeLayer`.

**Example**

```ts
import { RunpodConfigInput } from "@beep/runpod"

const config = RunpodConfigInput.make({
  apiUrl: "https://rest.runpod.io/v1",
  headers: { "x-client": "beep" }
})
console.log(config.apiUrl)
```

**Signature**

```ts
declare class RunpodConfigInput
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/runpod/src/Runpod.config.ts#L60)

Since v0.1.0

## RunpodDocsConfigInput (class)

Runtime configuration accepted by `RunpodDocs.makeLayer`.

**Example**

```ts
import { RunpodDocsConfigInput } from "@beep/runpod"

const config = RunpodDocsConfigInput.make({
  indexUrl: "https://docs.runpod.io/llms.txt"
})
console.log(config.indexUrl)
```

**Signature**

```ts
declare class RunpodDocsConfigInput
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/runpod/src/Runpod.config.ts#L87)

Since v0.1.0