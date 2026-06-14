---
title: FaceDetection.service.ts
nav_order: 3
parent: "@beep/face-detection"
---

## FaceDetection.service.ts overview

ONNX face detection driver service.

Since v0.0.0

---
## Exports Grouped by Category
- [services](#services)
  - [FaceDetectionService (class)](#facedetectionservice-class)
  - [FaceDetectionServiceShape (interface)](#facedetectionserviceshape-interface)
  - [LoadedFaceDetector (interface)](#loadedfacedetector-interface)
  - [makeFaceDetectionService](#makefacedetectionservice)
- [use-cases](#use-cases)
  - [withDetector](#withdetector)
---

# services

## FaceDetectionService (class)

Service tag for ONNX face detection.

**Example**

```ts
import { FaceDetectionService } from "@beep/face-detection/FaceDetection.service"

console.log(FaceDetectionService)
```

**Signature**

```ts
declare class FaceDetectionService
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/face-detection/src/FaceDetection.service.ts#L131)

Since v0.0.0

## FaceDetectionServiceShape (interface)

Runtime shape exposed by the `FaceDetectionService`.

**Example**

```ts
import type { FaceDetectionServiceShape } from "@beep/face-detection/FaceDetection.service"

const value = {} as FaceDetectionServiceShape
console.log(value)
```

**Signature**

```ts
export interface FaceDetectionServiceShape {
  readonly withDetector: <A, E, R>(
    config: FaceDetectionModelConfig,
    use: (detector: LoadedFaceDetector) => Effect.Effect<A, E, R>
  ) => Effect.Effect<A, E | FaceDetectionError, R>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/face-detection/src/FaceDetection.service.ts#L111)

Since v0.0.0

## LoadedFaceDetector (interface)

Loaded face detector bound to one model session.

**Example**

```ts
import type { LoadedFaceDetector } from "@beep/face-detection/FaceDetection.service"

const value = {} as LoadedFaceDetector
console.log(value)
```

**Signature**

```ts
export interface LoadedFaceDetector {
  readonly detect: (request: FaceDetectionImageRequest) => Effect.Effect<FaceDetectionResult, FaceDetectionError>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/face-detection/src/FaceDetection.service.ts#L93)

Since v0.0.0

## makeFaceDetectionService

Construct the live ONNX Runtime service implementation.

**Example**

```ts
import { makeFaceDetectionService } from "@beep/face-detection/FaceDetection.service"

console.log(makeFaceDetectionService)
```

**Signature**

```ts
declare const makeFaceDetectionService: () => FaceDetectionServiceShape
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/face-detection/src/FaceDetection.service.ts#L616)

Since v0.0.0

# use-cases

## withDetector

Run a workflow with a loaded face detector.

**Example**

```ts
import { withDetector } from "@beep/face-detection/FaceDetection.service"

console.log(withDetector)
```

**Signature**

```ts
declare const withDetector: <A, E, R>(config: FaceDetectionModelConfig, use: (detector: LoadedFaceDetector) => Effect.Effect<A, E, R>) => Effect.Effect<A, E | FaceDetectionError, R | FaceDetectionService>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/face-detection/src/FaceDetection.service.ts#L652)

Since v0.0.0