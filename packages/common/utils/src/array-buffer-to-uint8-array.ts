/**
 * Binary conversion helpers for producing `Uint8Array` views from raw
 * `ArrayBuffer` references so consumers can rely on the namespace export
 * without tracking deep paths.
 *
 * @example
 * import type * as FooTypes from "@beep/types/common.types";
 * import * as Utils from "@beep/utils";
 *
 * const arrayBufferToUint8ArrayExample: FooTypes.Prettify<{ buffer: ArrayBuffer }> = {
 *   buffer: new ArrayBuffer(4),
 * };
 * const arrayBufferToUint8ArrayBytes = Utils.arrayBufferToUint8Array(arrayBufferToUint8ArrayExample.buffer);
 * void arrayBufferToUint8ArrayBytes;
 *
 * @category Documentation/Modules
 * @since 0.1.0
 */
type ArrayBufferToUint8Array = (buffer: ArrayBuffer) => Uint8Array;
/**
 * Wraps an `ArrayBuffer` with a `Uint8Array` view.
 *
 * @example
 * import { arrayBufferToUint8Array } from "@beep/utils/array-buffer-to-uint8-array";
 *
 * const bytes = arrayBufferToUint8Array(new ArrayBuffer(4));
 *
 * @category Binary/Conversion
 * @since 0.1.0
 */
export const arrayBufferToUint8Array: ArrayBufferToUint8Array = (buffer: ArrayBuffer) => new Uint8Array(buffer);
