---
title: FaceDetection.errors.ts
nav_order: 1
parent: "@beep/face-detection"
---

## FaceDetection.errors.ts overview

Typed errors raised by the ONNX face detection driver.

Since v0.0.0

---
## Exports Grouped by Category
- [errors](#errors)
  - [FaceDetectionError (class)](#facedetectionerror-class)
  - [FaceDetectionErrorFromUnknownOptions (class)](#facedetectionerrorfromunknownoptions-class)
---

# errors

## FaceDetectionError (class)

Technical failure raised by the `@beep/face-detection` driver boundary.

**Example**

```ts
import { FaceDetectionError } from "@beep/face-detection"

const error = FaceDetectionError.make({ message: "model failed", operation: "loadModel" })
console.log(error.message)
```

**Signature**

```ts
declare class FaceDetectionError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/face-detection/src/FaceDetection.errors.ts#L75)

Since v0.0.0

## FaceDetectionErrorFromUnknownOptions (class)

Options used when normalizing unknown face detection boundary failures.

**Example**

```ts
import { FaceDetectionErrorFromUnknownOptions } from "@beep/face-detection"

const options = FaceDetectionErrorFromUnknownOptions.make({ modelPath: "./yunet.onnx" })
console.log(options)
```

**Signature**

```ts
declare class FaceDetectionErrorFromUnknownOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/face-detection/src/FaceDetection.errors.ts#L48)

Since v0.0.0