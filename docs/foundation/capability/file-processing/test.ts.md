---
title: test.ts
nav_order: 7
parent: "@beep/file-processing"
---

## test.ts overview

Synthetic file-processing fixtures and test engine.

Since v0.0.0

---
## Exports Grouped by Category
- [fixtures](#fixtures)
  - [TestFileProcessingEngine](#testfileprocessingengine)
  - [TestFileProcessingEngineDescriptor](#testfileprocessingenginedescriptor)
---

# fixtures

## TestFileProcessingEngine

Synthetic file-processing engine for generated fixtures.

**Example**

```ts
import { TestFileProcessingEngine } from "@beep/file-processing/test"

console.log(TestFileProcessingEngine.descriptor.engine) // "test"
```

**Signature**

```ts
declare const TestFileProcessingEngine: FileProcessingEngineShape
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/test.ts#L105)

Since v0.0.0

## TestFileProcessingEngineDescriptor

Synthetic engine descriptor used by tests and proof fixtures.

**Example**

```ts
import { TestFileProcessingEngineDescriptor } from "@beep/file-processing/test"

console.log(TestFileProcessingEngineDescriptor.supportedFormats.includes("pst")) // true
```

**Signature**

```ts
declare const TestFileProcessingEngineDescriptor: FileProcessingEngineDescriptor
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/test.ts#L37)

Since v0.0.0