/**
 * Schema-first public models for the ONNX face detection driver.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $FaceDetectionId } from "@beep/identity/packages";
import { Effect } from "effect";
import * as S from "effect/Schema";

const $I = $FaceDetectionId.create("FaceDetection.models");

/**
 * Pixel dimension greater than zero.
 *
 * @example
 * ```ts
 * import { PositivePixelDimension } from "@beep/face-detection/FaceDetection.models"
 *
 * console.log(PositivePixelDimension)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const PositivePixelDimension = S.Int.check(
  S.isGreaterThan(0, {
    identifier: $I`PositivePixelDimensionGreaterThanZeroCheck`,
    title: "Positive Pixel Dimension",
    description: "Image pixel dimensions must be greater than zero.",
    message: "Expected a positive pixel dimension",
  })
).pipe(
  $I.annoteSchema("PositivePixelDimension", {
    description: "A positive integer pixel dimension.",
  })
);

/**
 * Pixel dimension greater than zero.
 *
 * @category models
 * @since 0.0.0
 */
export type PositivePixelDimension = typeof PositivePixelDimension.Type;

/**
 * Detection confidence between zero and one.
 *
 * @example
 * ```ts
 * import { FaceDetectionConfidence } from "@beep/face-detection/FaceDetection.models"
 *
 * console.log(FaceDetectionConfidence)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FaceDetectionConfidence = S.Number.check(
  S.makeFilterGroup(
    [
      S.isGreaterThanOrEqualTo(0, {
        identifier: $I`FaceDetectionConfidenceGreaterThanOrEqualToZeroCheck`,
        title: "Face Detection Confidence Minimum",
        description: "Detection confidence must be greater than or equal to zero.",
        message: "Expected confidence greater than or equal to zero",
      }),
      S.isLessThanOrEqualTo(1, {
        identifier: $I`FaceDetectionConfidenceLessThanOrEqualToOneCheck`,
        title: "Face Detection Confidence Maximum",
        description: "Detection confidence must be less than or equal to one.",
        message: "Expected confidence less than or equal to one",
      }),
    ],
    {
      identifier: $I`FaceDetectionConfidenceChecks`,
      title: "Face Detection Confidence",
      description: "Checks for normalized face detection confidence values.",
    }
  )
).pipe(
  $I.annoteSchema("FaceDetectionConfidence", {
    description: "Normalized face detection confidence between zero and one.",
  })
);

/**
 * Detection confidence between zero and one.
 *
 * @category models
 * @since 0.0.0
 */
export type FaceDetectionConfidence = typeof FaceDetectionConfidence.Type;

/**
 * Percentage threshold accepted by face-detection triage.
 *
 * @example
 * ```ts
 * import { FaceDetectionPercentage } from "@beep/face-detection/FaceDetection.models"
 *
 * console.log(FaceDetectionPercentage)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FaceDetectionPercentage = S.Number.check(
  S.makeFilterGroup(
    [
      S.isGreaterThanOrEqualTo(0, {
        identifier: $I`FaceDetectionPercentageGreaterThanOrEqualToZeroCheck`,
        title: "Face Detection Percentage Minimum",
        description: "Face-detection percentage values must be greater than or equal to zero.",
        message: "Expected percentage greater than or equal to zero",
      }),
      S.isLessThanOrEqualTo(100, {
        identifier: $I`FaceDetectionPercentageLessThanOrEqualToOneHundredCheck`,
        title: "Face Detection Percentage Maximum",
        description: "Face-detection percentage values must be less than or equal to 100.",
        message: "Expected percentage less than or equal to 100",
      }),
    ],
    {
      identifier: $I`FaceDetectionPercentageChecks`,
      title: "Face Detection Percentage",
      description: "Checks for percentage values accepted by face-detection triage.",
    }
  )
).pipe(
  $I.annoteSchema("FaceDetectionPercentage", {
    description: "Percentage value between zero and 100.",
  })
);

/**
 * Percentage threshold accepted by face-detection triage.
 *
 * @category models
 * @since 0.0.0
 */
export type FaceDetectionPercentage = typeof FaceDetectionPercentage.Type;

/**
 * Positive maximum number of detections to keep.
 *
 * @example
 * ```ts
 * import { FaceDetectionTopK } from "@beep/face-detection/FaceDetection.models"
 *
 * console.log(FaceDetectionTopK)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FaceDetectionTopK = S.Int.check(
  S.isGreaterThan(0, {
    identifier: $I`FaceDetectionTopKGreaterThanZeroCheck`,
    title: "Face Detection Top K",
    description: "The maximum number of detections must be greater than zero.",
    message: "Expected top-k greater than zero",
  })
).pipe(
  $I.annoteSchema("FaceDetectionTopK", {
    description: "Positive maximum number of face detections kept after non-maximum suppression.",
  })
);

/**
 * Positive maximum number of detections to keep.
 *
 * @category models
 * @since 0.0.0
 */
export type FaceDetectionTopK = typeof FaceDetectionTopK.Type;

/**
 * Request to load a YuNet-compatible ONNX face detector.
 *
 * @example
 * ```ts
 * import { FaceDetectionModelConfig } from "@beep/face-detection"
 *
 * const config = FaceDetectionModelConfig.make({ modelPath: "./face_detection_yunet_2023mar.onnx" })
 * console.log(config)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FaceDetectionModelConfig extends S.Class<FaceDetectionModelConfig>($I`FaceDetectionModelConfig`)(
  {
    modelPath: S.String,
  },
  $I.annote("FaceDetectionModelConfig", {
    description: "Request to load a YuNet-compatible ONNX face detector.",
  })
) {}

/**
 * Request to detect faces in one image with a loaded detector.
 *
 * @example
 * ```ts
 * import { FaceDetectionImageRequest } from "@beep/face-detection"
 *
 * const request = FaceDetectionImageRequest.make({ imagePath: "./photo.jpg" })
 * console.log(request)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FaceDetectionImageRequest extends S.Class<FaceDetectionImageRequest>($I`FaceDetectionImageRequest`)(
  {
    imagePath: S.String,
    minConfidence: FaceDetectionConfidence.pipe(
      S.withConstructorDefault(Effect.succeed(0.75)),
      S.withDecodingDefault(Effect.succeed(0.75))
    ),
    nmsThreshold: FaceDetectionConfidence.pipe(
      S.withConstructorDefault(Effect.succeed(0.3)),
      S.withDecodingDefault(Effect.succeed(0.3))
    ),
    topK: FaceDetectionTopK.pipe(
      S.withConstructorDefault(Effect.succeed(5000)),
      S.withDecodingDefault(Effect.succeed(5000))
    ),
  },
  $I.annote("FaceDetectionImageRequest", {
    description: "Request to detect faces in one image with a loaded YuNet-compatible detector.",
  })
) {}

/**
 * Two-dimensional point emitted by a face detector.
 *
 * @example
 * ```ts
 * import { FaceDetectionPoint } from "@beep/face-detection/FaceDetection.models"
 *
 * console.log(FaceDetectionPoint)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FaceDetectionPoint extends S.Class<FaceDetectionPoint>($I`FaceDetectionPoint`)(
  {
    x: S.Number,
    y: S.Number,
  },
  $I.annote("FaceDetectionPoint", {
    description: "Two-dimensional image point emitted by a face detector.",
  })
) {}

/**
 * Bounding box emitted by a face detector.
 *
 * @example
 * ```ts
 * import { FaceDetectionBox } from "@beep/face-detection/FaceDetection.models"
 *
 * console.log(FaceDetectionBox)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FaceDetectionBox extends S.Class<FaceDetectionBox>($I`FaceDetectionBox`)(
  {
    height: S.Number,
    width: S.Number,
    x: S.Number,
    y: S.Number,
  },
  $I.annote("FaceDetectionBox", {
    description: "Face bounding box using top-left x/y coordinates plus width and height.",
  })
) {}

/**
 * Five landmark points emitted by YuNet-compatible face detection models.
 *
 * @example
 * ```ts
 * import { FaceDetectionLandmarks } from "@beep/face-detection/FaceDetection.models"
 *
 * console.log(FaceDetectionLandmarks)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FaceDetectionLandmarks extends S.Class<FaceDetectionLandmarks>($I`FaceDetectionLandmarks`)(
  {
    leftEye: FaceDetectionPoint,
    leftMouth: FaceDetectionPoint,
    nose: FaceDetectionPoint,
    rightEye: FaceDetectionPoint,
    rightMouth: FaceDetectionPoint,
  },
  $I.annote("FaceDetectionLandmarks", {
    description: "Five face landmarks emitted by a YuNet-compatible detector.",
  })
) {}

/**
 * One face detection emitted for an image.
 *
 * @example
 * ```ts
 * import { FaceDetection } from "@beep/face-detection/FaceDetection.models"
 *
 * console.log(FaceDetection)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FaceDetection extends S.Class<FaceDetection>($I`FaceDetection`)(
  {
    box: FaceDetectionBox,
    confidence: FaceDetectionConfidence,
    landmarks: FaceDetectionLandmarks,
  },
  $I.annote("FaceDetection", {
    description: "One detected face with confidence, bounding box, and landmarks.",
  })
) {}

/**
 * Face detection result for one image.
 *
 * @example
 * ```ts
 * import { FaceDetectionResult } from "@beep/face-detection/FaceDetection.models"
 *
 * console.log(FaceDetectionResult)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FaceDetectionResult extends S.Class<FaceDetectionResult>($I`FaceDetectionResult`)(
  {
    faces: S.Array(FaceDetection),
    height: PositivePixelDimension,
    imagePath: S.String,
    width: PositivePixelDimension,
  },
  $I.annote("FaceDetectionResult", {
    description: "Face detection result for one image.",
  })
) {}

/**
 * Decode a model config from unknown input.
 *
 * @example
 * ```ts
 * import { decodeFaceDetectionModelConfig } from "@beep/face-detection/FaceDetection.models"
 *
 * console.log(decodeFaceDetectionModelConfig)
 * ```
 *
 * @category codecs
 * @since 0.0.0
 */
export const decodeFaceDetectionModelConfig = S.decodeUnknownEffect(FaceDetectionModelConfig);

/**
 * Decode an image request from unknown input.
 *
 * @example
 * ```ts
 * import { decodeFaceDetectionImageRequest } from "@beep/face-detection/FaceDetection.models"
 *
 * console.log(decodeFaceDetectionImageRequest)
 * ```
 *
 * @category codecs
 * @since 0.0.0
 */
export const decodeFaceDetectionImageRequest = S.decodeUnknownEffect(FaceDetectionImageRequest);
