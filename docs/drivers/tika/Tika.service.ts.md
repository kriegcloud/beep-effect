---
title: Tika.service.ts
nav_order: 3
parent: "@beep/tika"
---

## Tika.service.ts overview

Tika-backed file-processing engine scaffold.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [makeTikaFileProcessingEngine](#maketikafileprocessingengine)
- [services](#services)
  - [TikaFileProcessingEngine](#tikafileprocessingengine)
  - [TikaFileProcessingEngineDescriptor](#tikafileprocessingenginedescriptor)
---

# constructors

## makeTikaFileProcessingEngine

Create the P1 Tika file-processing engine.

**Example**

```ts
import { makeTikaFileProcessingEngine } from "@beep/tika"

const engine = makeTikaFileProcessingEngine()
console.log(engine.descriptor.engine)
```

**Signature**

```ts
declare const makeTikaFileProcessingEngine: () => FileProcessingEngineShape
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/tika/src/Tika.service.ts#L141)

Since v0.0.0

# services

## TikaFileProcessingEngine

P1 Tika file-processing engine value.

**Example**

```ts
import { TikaFileProcessingEngine } from "@beep/tika"

console.log(TikaFileProcessingEngine.descriptor.supportedFormats.includes("docx")) // true
```

**Signature**

```ts
declare const TikaFileProcessingEngine: FileProcessingEngineShape
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/tika/src/Tika.service.ts#L231)

Since v0.0.0

## TikaFileProcessingEngineDescriptor

Tika file-processing engine descriptor.

**Example**

```ts
import { TikaFileProcessingEngineDescriptor } from "@beep/tika"

console.log(TikaFileProcessingEngineDescriptor.name)
```

**Signature**

```ts
declare const TikaFileProcessingEngineDescriptor: FileProcessingEngineDescriptor
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/tika/src/Tika.service.ts#L38)

Since v0.0.0