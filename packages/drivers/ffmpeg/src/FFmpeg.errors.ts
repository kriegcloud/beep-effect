/**
 * Typed errors raised by the native FFmpeg driver.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $FfmpegId } from "@beep/identity/packages";
import { TaggedErrorClass } from "@beep/schema";
import { dual } from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const $I = $FfmpegId.create("FFmpeg.errors");

/**
 * Additional process context captured for an FFmpeg failure.
 *
 * @example
 * ```ts
 * import { FFmpegErrorContext } from "@beep/ffmpeg"
 *
 * const context = FFmpegErrorContext.make({ command: "ffmpeg", exitCode: 1 })
 * void context
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class FFmpegErrorContext extends S.Class<FFmpegErrorContext>($I`FFmpegErrorContext`)(
  {
    command: S.optionalKey(S.String),
    exitCode: S.optionalKey(S.Number),
    stderr: S.optionalKey(S.String),
    stdout: S.optionalKey(S.String),
  },
  $I.annote("FFmpegErrorContext", {
    description: "Additional process context captured for an FFmpeg failure.",
  })
) {}

const causeFromUnknown = (cause: unknown): unknown | undefined => (S.is(S.DefectWithStack)(cause) ? cause : undefined);

const existingFfmpegError = (cause: unknown): O.Option<FFmpegError> =>
  S.is(FFmpegError)(cause) ? O.some(cause) : O.none();

/**
 * Options used when normalizing unknown FFmpeg boundary failures.
 *
 * @example
 * ```ts
 * import { FFmpegErrorFromUnknownOptions } from "@beep/ffmpeg"
 *
 * const options = FFmpegErrorFromUnknownOptions.make({
 *   command: "ffmpeg",
 *   exitCode: 1,
 *   stderr: "invalid input"
 * })
 * void options
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class FFmpegErrorFromUnknownOptions extends S.Class<FFmpegErrorFromUnknownOptions>(
  $I`FFmpegErrorFromUnknownOptions`
)(
  {
    cause: S.optionalKey(S.DefectWithStack),
    command: S.optionalKey(S.String),
    exitCode: S.optionalKey(S.Number),
    stderr: S.optionalKey(S.String),
    stdout: S.optionalKey(S.String),
  },
  $I.annote("FFmpegErrorFromUnknownOptions", {
    description: "Options used when normalizing unknown FFmpeg boundary failures.",
  })
) {}

/**
 * Technical failure raised by the `@beep/ffmpeg` driver boundary.
 *
 * @example
 * ```ts
 * import { FFmpegError } from "@beep/ffmpeg"
 *
 * const error = FFmpegError.make({ message: "ffmpeg failed", operation: "extractFrames" })
 * void error.message
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class FFmpegError extends TaggedErrorClass<FFmpegError>($I`FFmpegError`)(
  "FFmpegError",
  {
    command: S.optionalKey(S.String),
    cause: S.optionalKey(S.DefectWithStack),
    exitCode: S.optionalKey(S.Number),
    message: S.String,
    operation: S.String,
    stderr: S.optionalKey(S.String),
    stdout: S.optionalKey(S.String),
  },
  $I.annote("FFmpegError", {
    description: "Technical FFmpeg driver failure scoped to a driver operation.",
  })
) {
  /**
   * Normalize an unknown process or platform failure into a {@link FFmpegError}.
   *
   * @example
   * ```ts
   * import { FFmpegError } from "@beep/ffmpeg"
   *
   * const error = FFmpegError.fromUnknown("probeVideo", "ffprobe failed", { cause: new Error("boom") })
   * void error
   * ```
   *
   * @category errors
   * @since 0.0.0
   */
  static readonly fromUnknown: {
    (operation: string, message: string, options: FFmpegErrorFromUnknownOptions): FFmpegError;
    (message: string, options: FFmpegErrorFromUnknownOptions): (operation: string) => FFmpegError;
  } = dual(3, (operation: string, message: string, options: FFmpegErrorFromUnknownOptions): FFmpegError => {
    const { cause, ...context } = options;
    return O.getOrElse(
      existingFfmpegError(cause),
      () =>
        FFmpegError.make({
          ...context,
          cause: causeFromUnknown(cause),
          message,
          operation,
        })
    );
  });
}
