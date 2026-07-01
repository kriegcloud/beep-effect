/**
 * `@beep/face-detection` ONNX face detection driver package.
 *
 * @remarks
 * This package owns the technical boundary for YuNet-compatible ONNX face
 * detection: model-session loading, image preprocessing, tensor
 * post-processing, and schema-first detection results. Product triage,
 * persistence, and policy decisions belong in downstream packages.
 *
 * @example
 * ```ts
 * import { FaceDetectionImageRequest } from "@beep/face-detection"
 *
 * const request = FaceDetectionImageRequest.make({
 *   imagePath: "./photo.jpg",
 *   minConfidence: 0.8,
 *   nmsThreshold: 0.3,
 *   topK: 20
 * })
 * console.log(request.minConfidence)
 * ```
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * Public ONNX face detection driver error exports.
 *
 * @example
 * ```ts
 * import { FaceDetectionError } from "@beep/face-detection"
 *
 * const error = FaceDetectionError.make({
 *   message: "model failed",
 *   operation: "loadSession"
 * })
 * console.log(error.operation)
 * ```
 *
 * @since 0.0.0
 * @category errors
 */
export * from "./FaceDetection.errors.ts";
/**
 * Public ONNX face detection driver model exports.
 *
 * @example
 * ```ts
 * import { FaceDetectionImageRequest } from "@beep/face-detection"
 *
 * const request = FaceDetectionImageRequest.make({
 *   imagePath: "./photo.jpg",
 *   minConfidence: 0.8,
 *   nmsThreshold: 0.3,
 *   topK: 20
 * })
 * console.log(request.topK)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export * from "./FaceDetection.models.ts";
/**
 * Public ONNX face detection driver service exports.
 *
 * @example
 * ```ts
 * import { makeFaceDetectionService } from "@beep/face-detection"
 *
 * const service = makeFaceDetectionService()
 * console.log(typeof service.withDetector)
 * ```
 *
 * @since 0.0.0
 * @category services
 */
export * from "./FaceDetection.service.ts";
