/**
 * Typed errors raised by the ONNX face detection driver.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $FaceDetectionId } from "@beep/identity/packages";
import { TaggedErrorClass } from "@beep/schema";
import { P } from "@beep/utils";
import { pipe } from "effect";
import { dual } from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const $I = $FaceDetectionId.create("FaceDetection.errors");

const causeFromUnknown = (cause: unknown): unknown | undefined =>
  P.hasInspectableObjectShape(cause) && S.is(S.Defect({ includeStack: true }))(cause) ? cause : undefined;

const causeMessage = (cause: unknown): O.Option<string> =>
  cause instanceof Error && cause.message.length > 0 ? O.some(cause.message) : O.none();

const existingFaceDetectionError = (cause: unknown): O.Option<FaceDetectionError> =>
  S.is(FaceDetectionError)(cause) ? O.some(cause) : O.none();

const messageWithCause = (message: string, cause: unknown): string =>
  pipe(
    causeMessage(cause),
    O.map((detail) => `${message}: ${detail}`),
    O.getOrElse(() => message)
  );

/**
 * Options used when normalizing unknown face detection boundary failures.
 *
 * @example
 * ```ts
 * import { FaceDetectionErrorFromUnknownOptions } from "@beep/face-detection"
 *
 * const options = FaceDetectionErrorFromUnknownOptions.make({ modelPath: "./yunet.onnx" })
 * console.log(options)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class FaceDetectionErrorFromUnknownOptions extends S.Class<FaceDetectionErrorFromUnknownOptions>(
  $I`FaceDetectionErrorFromUnknownOptions`
)(
  {
    cause: S.optionalKey(S.Defect({ includeStack: true })),
    imagePath: S.optionalKey(S.String),
    modelPath: S.optionalKey(S.String),
  },
  $I.annote("FaceDetectionErrorFromUnknownOptions", {
    description: "Options used when normalizing unknown face detection failures.",
  })
) {}

/**
 * Technical failure raised by the `@beep/face-detection` driver boundary.
 *
 * @remarks
 * This error is reserved for driver concerns such as ONNX Runtime loading,
 * model session creation, image preprocessing, request decoding, and
 * post-processing tensor validation. Product-level "no face found" decisions
 * should be modeled outside this driver.
 *
 * @example
 * ```ts
 * import { FaceDetectionError } from "@beep/face-detection"
 *
 * const error = FaceDetectionError.make({ message: "model failed", operation: "loadModel" })
 * console.log(error.message)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class FaceDetectionError extends TaggedErrorClass<FaceDetectionError>($I`FaceDetectionError`)(
  "FaceDetectionError",
  {
    cause: S.optionalKey(S.Defect({ includeStack: true })),
    imagePath: S.optionalKey(S.String),
    message: S.String,
    modelPath: S.optionalKey(S.String),
    operation: S.String,
  },
  $I.annote("FaceDetectionError", {
    description: "Technical ONNX face detection driver failure scoped to a driver operation.",
  })
) {
  /**
   * Normalize an unknown model, platform, or image failure into a {@link FaceDetectionError}.
   *
   * @example
   * ```ts
   * import { FaceDetectionError } from "@beep/face-detection"
   *
   * const error = FaceDetectionError.fromUnknown("loadModel", "failed", {
   *   cause: new Error("missing file"),
   *   modelPath: "./yunet.onnx"
   * })
   * console.log(error.message)
   * ```
   *
   * @category errors
   * @since 0.0.0
   */
  static readonly fromUnknown: {
    (operation: string, message: string, options: FaceDetectionErrorFromUnknownOptions): FaceDetectionError;
    (message: string, options: FaceDetectionErrorFromUnknownOptions): (operation: string) => FaceDetectionError;
  } = dual(
    3,
    (operation: string, message: string, options: FaceDetectionErrorFromUnknownOptions): FaceDetectionError => {
      const { cause, ...context } = options;
      return O.getOrElse(existingFaceDetectionError(cause), () =>
        FaceDetectionError.make({
          ...context,
          cause: causeFromUnknown(cause),
          message: messageWithCause(message, cause),
          operation,
        })
      );
    }
  );
}
