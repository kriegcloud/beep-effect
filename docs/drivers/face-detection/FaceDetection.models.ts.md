---
title: FaceDetection.models.ts
nav_order: 2
parent: "@beep/face-detection"
---

## FaceDetection.models.ts overview

Schema-first public models for the ONNX face detection driver.

Since v0.0.0

---
## Exports Grouped by Category
- [codecs](#codecs)
  - [decodeFaceDetectionImageRequest](#decodefacedetectionimagerequest)
  - [decodeFaceDetectionModelConfig](#decodefacedetectionmodelconfig)
- [models](#models)
  - [FaceDetection (class)](#facedetection-class)
  - [FaceDetectionBox (class)](#facedetectionbox-class)
  - [FaceDetectionConfidence (type alias)](#facedetectionconfidence-type-alias)
  - [FaceDetectionImageRequest (class)](#facedetectionimagerequest-class)
  - [FaceDetectionLandmarks (class)](#facedetectionlandmarks-class)
  - [FaceDetectionModelConfig (class)](#facedetectionmodelconfig-class)
  - [FaceDetectionPercentage (type alias)](#facedetectionpercentage-type-alias)
  - [FaceDetectionPoint (class)](#facedetectionpoint-class)
  - [FaceDetectionResult (class)](#facedetectionresult-class)
  - [FaceDetectionTopK (type alias)](#facedetectiontopk-type-alias)
  - [PositivePixelDimension (type alias)](#positivepixeldimension-type-alias)
- [schemas](#schemas)
  - [FaceDetectionConfidence](#facedetectionconfidence)
  - [FaceDetectionPercentage](#facedetectionpercentage)
  - [FaceDetectionTopK](#facedetectiontopk)
  - [PositivePixelDimension](#positivepixeldimension)
---

# codecs

## decodeFaceDetectionImageRequest

Decode an image request from unknown input.

**Example**

```ts
import { decodeFaceDetectionImageRequest } from "@beep/face-detection/FaceDetection.models"

console.log(decodeFaceDetectionImageRequest)
```

**Signature**

```ts
declare const decodeFaceDetectionImageRequest: (input: unknown, options?: ParseOptions) => Effect<FaceDetectionImageRequest, S.SchemaError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/face-detection/src/FaceDetection.models.ts#L380)

Since v0.0.0

## decodeFaceDetectionModelConfig

Decode a model config from unknown input.

**Example**

```ts
import { decodeFaceDetectionModelConfig } from "@beep/face-detection/FaceDetection.models"

console.log(decodeFaceDetectionModelConfig)
```

**Signature**

```ts
declare const decodeFaceDetectionModelConfig: (input: unknown, options?: ParseOptions) => Effect<FaceDetectionModelConfig, S.SchemaError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/face-detection/src/FaceDetection.models.ts#L365)

Since v0.0.0

# models

## FaceDetection (class)

One face detection emitted for an image.

**Example**

```ts
import { FaceDetection } from "@beep/face-detection/FaceDetection.models"

console.log(FaceDetection)
```

**Signature**

```ts
declare class FaceDetection
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/face-detection/src/FaceDetection.models.ts#L316)

Since v0.0.0

## FaceDetectionBox (class)

Bounding box emitted by a face detector.

**Example**

```ts
import { FaceDetectionBox } from "@beep/face-detection/FaceDetection.models"

console.log(FaceDetectionBox)
```

**Signature**

```ts
declare class FaceDetectionBox
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/face-detection/src/FaceDetection.models.ts#L265)

Since v0.0.0

## FaceDetectionConfidence (type alias)

Detection confidence between zero and one.

**Signature**

```ts
type FaceDetectionConfidence = typeof FaceDetectionConfidence.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/face-detection/src/FaceDetection.models.ts#L95)

Since v0.0.0

## FaceDetectionImageRequest (class)

Request to detect faces in one image with a loaded detector.

**Example**

```ts
import { FaceDetectionImageRequest } from "@beep/face-detection"

const request = FaceDetectionImageRequest.make({ imagePath: "./photo.jpg" })
console.log(request)
```

**Signature**

```ts
declare class FaceDetectionImageRequest
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/face-detection/src/FaceDetection.models.ts#L217)

Since v0.0.0

## FaceDetectionLandmarks (class)

Five landmark points emitted by YuNet-compatible face detection models.

**Example**

```ts
import { FaceDetectionLandmarks } from "@beep/face-detection/FaceDetection.models"

console.log(FaceDetectionLandmarks)
```

**Signature**

```ts
declare class FaceDetectionLandmarks
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/face-detection/src/FaceDetection.models.ts#L290)

Since v0.0.0

## FaceDetectionModelConfig (class)

Request to load a YuNet-compatible ONNX face detector.

**Example**

```ts
import { FaceDetectionModelConfig } from "@beep/face-detection"

const config = FaceDetectionModelConfig.make({ modelPath: "./face_detection_yunet_2023mar.onnx" })
console.log(config)
```

**Signature**

```ts
declare class FaceDetectionModelConfig
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/face-detection/src/FaceDetection.models.ts#L194)

Since v0.0.0

## FaceDetectionPercentage (type alias)

Percentage threshold accepted by face-detection triage.

**Signature**

```ts
type FaceDetectionPercentage = typeof FaceDetectionPercentage.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/face-detection/src/FaceDetection.models.ts#L144)

Since v0.0.0

## FaceDetectionPoint (class)

Two-dimensional point emitted by a face detector.

**Example**

```ts
import { FaceDetectionPoint } from "@beep/face-detection/FaceDetection.models"

console.log(FaceDetectionPoint)
```

**Signature**

```ts
declare class FaceDetectionPoint
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/face-detection/src/FaceDetection.models.ts#L242)

Since v0.0.0

## FaceDetectionResult (class)

Face detection result for one image.

**Example**

```ts
import { FaceDetectionResult } from "@beep/face-detection/FaceDetection.models"

console.log(FaceDetectionResult)
```

**Signature**

```ts
declare class FaceDetectionResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/face-detection/src/FaceDetection.models.ts#L340)

Since v0.0.0

## FaceDetectionTopK (type alias)

Positive maximum number of detections to keep.

**Signature**

```ts
type FaceDetectionTopK = typeof FaceDetectionTopK.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/face-detection/src/FaceDetection.models.ts#L178)

Since v0.0.0

## PositivePixelDimension (type alias)

Pixel dimension greater than zero.

**Signature**

```ts
type PositivePixelDimension = typeof PositivePixelDimension.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/face-detection/src/FaceDetection.models.ts#L46)

Since v0.0.0

# schemas

## FaceDetectionConfidence

Detection confidence between zero and one.

**Example**

```ts
import { FaceDetectionConfidence } from "@beep/face-detection/FaceDetection.models"

console.log(FaceDetectionConfidence)
```

**Signature**

```ts
declare const FaceDetectionConfidence: AnnotatedSchema<S.Finite>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/face-detection/src/FaceDetection.models.ts#L61)

Since v0.0.0

## FaceDetectionPercentage

Percentage threshold accepted by face-detection triage.

**Example**

```ts
import { FaceDetectionPercentage } from "@beep/face-detection/FaceDetection.models"

console.log(FaceDetectionPercentage)
```

**Signature**

```ts
declare const FaceDetectionPercentage: AnnotatedSchema<S.Finite>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/face-detection/src/FaceDetection.models.ts#L110)

Since v0.0.0

## FaceDetectionTopK

Positive maximum number of detections to keep.

**Example**

```ts
import { FaceDetectionTopK } from "@beep/face-detection/FaceDetection.models"

console.log(FaceDetectionTopK)
```

**Signature**

```ts
declare const FaceDetectionTopK: AnnotatedSchema<S.Int>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/face-detection/src/FaceDetection.models.ts#L159)

Since v0.0.0

## PositivePixelDimension

Pixel dimension greater than zero.

**Example**

```ts
import { PositivePixelDimension } from "@beep/face-detection/FaceDetection.models"

console.log(PositivePixelDimension)
```

**Signature**

```ts
declare const PositivePixelDimension: AnnotatedSchema<S.Int>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/face-detection/src/FaceDetection.models.ts#L27)

Since v0.0.0