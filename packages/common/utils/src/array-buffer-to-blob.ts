/**
 * Binary conversion helpers bridging `ArrayBuffer` payloads to `Blob` instances
 * while keeping the usage consistent with the `@beep/utils` namespace export.
 *
 * @example
 * import type * as FooTypes from "@beep/types/common.types";
 * import * as Utils from "@beep/utils";
 *
 * const arrayBufferModuleExample: FooTypes.Prettify<{ buffer: ArrayBuffer }> = {
 *   buffer: new ArrayBuffer(8),
 * };
 * const arrayBufferModuleBlob = Utils.arrayBufferToBlob(arrayBufferModuleExample.buffer);
 * void arrayBufferModuleBlob;
 *
 * @category Documentation/Modules
 * @since 0.1.0
 */
type ArrayBufferToBlob = (buffer: ArrayBuffer) => Blob;
/**
 * Converts an `ArrayBuffer` into a `Blob`, useful for constructing file-like
 * objects in browser contexts.
 *
 * @example
 * import { arrayBufferToBlob } from "@beep/utils/array-buffer-to-blob";
 *
 * const blob = arrayBufferToBlob(new ArrayBuffer(8));
 *
 * @category Binary/Conversion
 * @since 0.1.0
 */
export const arrayBufferToBlob: ArrayBufferToBlob = (buffer: ArrayBuffer) => new Blob([new Uint8Array(buffer)]);
