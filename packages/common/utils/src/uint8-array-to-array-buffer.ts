/**
 * @since 0.1.0
 */

import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
/**
 * Extracts the underlying ArrayBuffer from a Uint8Array, accounting for offset and length.
 *
 * @example
 * ```typescript
 * import { uint8arrayToArrayBuffer } from "@beep/utils"
 *
 * const buffer = uint8arrayToArrayBuffer(new Uint8Array([1, 2, 3]))
 * console.log(buffer.byteLength)
 * // => 3
 * ```
 *
 * @category transformations
 * @since 0.1.0
 */
export const uint8arrayToArrayBuffer = (data: Uint8Array<ArrayBufferLike>): ArrayBuffer =>
  data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;

/**
 * Error thrown when reading a file's array buffer fails.
 *
 * @example
 * ```typescript
 * import { FileReadError, readFileArrayBuffer } from "@beep/utils"
 * import * as Effect from "effect/Effect"
 *
 * const program = readFileArrayBuffer(file).pipe(
 *   Effect.catchTag("FileReadError", (error) =>
 *     Effect.succeed(new ArrayBuffer(0))
 *   )
 * )
 * ```
 *
 * @category errors
 * @since 0.1.0
 */
export class FileReadError extends Data.TaggedError("FileReadError")<{
  readonly message: string;
  readonly cause: unknown;
  readonly fileName?: string | undefined;
  readonly fileType?: string | undefined;
  readonly fileSize?: number | undefined;
  readonly phase?: "read" | "parse" | "decode" | undefined;
}> {}

/**
 * Reads a File object's contents as an ArrayBuffer using Effect.
 *
 * @example
 * ```typescript
 * import { readFileArrayBuffer } from "@beep/utils"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const buffer = yield* readFileArrayBuffer(file)
 *   console.log(buffer.byteLength)
 * })
 * ```
 *
 * @category utilities
 * @since 0.1.0
 */
export const readFileArrayBuffer = Effect.fn("readFileArrayBuffer")(function* (file: File) {
  return yield* Effect.tryPromise({
    try: () => file.arrayBuffer(),
    catch: (e) =>
      new FileReadError({
        message: "Array buffer could not be read",
        cause: e,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        phase: "read",
      }),
  });
});
