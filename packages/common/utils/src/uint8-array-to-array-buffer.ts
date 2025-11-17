/**
 * Binary helpers for peeling a backing `ArrayBuffer` from a `Uint8Array`,
 * enabling downstream callers to navigate between streaming and blob
 * interfaces with the `@beep/utils` namespace.
 *
 * @example
 * import type * as FooTypes from "@beep/types/common.types";
 * import * as Utils from "@beep/utils";
 *
 * const uint8ArrayToArrayBufferExample: FooTypes.Prettify<{ data: Uint8Array }> = {
 *   data: new Uint8Array([1, 2, 3]),
 * };
 * const uint8ArrayToArrayBufferBuffer = Utils.uint8arrayToArrayBuffer(uint8ArrayToArrayBufferExample.data);
 * void uint8ArrayToArrayBufferBuffer;
 *
 * @category Documentation/Modules
 * @since 0.1.0
 */
/**
 * Extracts the underlying `ArrayBuffer` from a `Uint8Array`, accounting for
 * offset/length.
 *
 * @example
 * import { uint8arrayToArrayBuffer } from "@beep/utils/uint8-array-to-array-buffer";
 *
 * const buffer = uint8arrayToArrayBuffer(new Uint8Array([1, 2]));
 *
 * @category Binary/Conversion
 * @since 0.1.0
 */
export const uint8arrayToArrayBuffer = (data: Uint8Array<ArrayBufferLike>): ArrayBuffer =>
  data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
