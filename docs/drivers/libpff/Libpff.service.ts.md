---
title: Libpff.service.ts
nav_order: 3
parent: "@beep/libpff"
---

## Libpff.service.ts overview

libpff-backed file-processing engine scaffold.

Since v0.0.0

---
## Exports Grouped by Category
- [configuration](#configuration)
  - [LibpffFileProcessingEngineOptions (class)](#libpfffileprocessingengineoptions-class)
- [constructors](#constructors)
  - [makeLibpffFileProcessingEngine](#makelibpfffileprocessingengine)
- [services](#services)
  - [LibpffFileProcessingEngine](#libpfffileprocessingengine)
  - [LibpffFileProcessingEngineDescriptor](#libpfffileprocessingenginedescriptor)
---

# configuration

## LibpffFileProcessingEngineOptions (class)

Options for the P1 libpff engine scaffold.

**Example**

```ts
import { LibpffFileProcessingEngineOptions } from "@beep/libpff"

const options = LibpffFileProcessingEngineOptions.make({ syntheticExport: true })
console.log(options.syntheticExport) // true
```

**Signature**

```ts
declare class LibpffFileProcessingEngineOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/libpff/src/Libpff.service.ts#L137)

Since v0.0.0

# constructors

## makeLibpffFileProcessingEngine

Create the P1 libpff file-processing engine.

**Example**

```ts
import { makeLibpffFileProcessingEngine } from "@beep/libpff"

const engine = makeLibpffFileProcessingEngine()
console.log(engine.descriptor.engine)
```

**Signature**

```ts
declare const makeLibpffFileProcessingEngine: (options?: LibpffFileProcessingEngineOptions) => FileProcessingEngineShape
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/libpff/src/Libpff.service.ts#L162)

Since v0.0.0

# services

## LibpffFileProcessingEngine

P1 libpff file-processing engine value with typed unavailable deferrals.

**Example**

```ts
import { LibpffFileProcessingEngine } from "@beep/libpff"

console.log(LibpffFileProcessingEngine.descriptor.engine) // "libpff"
```

**Signature**

```ts
declare const LibpffFileProcessingEngine: FileProcessingEngineShape
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/libpff/src/Libpff.service.ts#L231)

Since v0.0.0

## LibpffFileProcessingEngineDescriptor

libpff file-processing engine descriptor.

**Example**

```ts
import { LibpffFileProcessingEngineDescriptor } from "@beep/libpff"

console.log(LibpffFileProcessingEngineDescriptor.name)
```

**Signature**

```ts
declare const LibpffFileProcessingEngineDescriptor: FileProcessingEngineDescriptor
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/libpff/src/Libpff.service.ts#L41)

Since v0.0.0