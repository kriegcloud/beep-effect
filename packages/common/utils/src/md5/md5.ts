/**
 * Pure functional MD5 hashing implementation using Effect
 * @module
 */

import { thunkZero } from "@beep/utils/thunk";
import * as A from "effect/Array";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Str from "effect/String";
import { Md5ComputationError, UnicodeEncodingError } from "./errors";
// Re-export error types for backward compatibility
export { Md5ComputationError, UnicodeEncodingError };

/**
 * Immutable MD5 hasher state
 * @since 1.0.0
 * @category Models
 */
export interface Md5State {
  readonly dataLength: number;
  readonly bufferLength: number;
  readonly state: Int32Array;
  readonly buffer: ArrayBuffer;
  readonly buffer8: Uint8Array;
  readonly buffer32: Uint32Array;
}

/**
 * Serializable hasher state for transferring between workers
 * @since 1.0.0
 * @category Models
 */
export interface SerializableMd5State {
  readonly buffer: string;
  readonly buflen: number;
  readonly length: number;
  readonly state: ReadonlyArray<number>;
}

/**
 * Constants for MD5 algorithm
 * @internal
 */
const STATE_IDENTITY = new Int32Array([1732584193, -271733879, -1732584194, 271733878]);

const BUFFER32_IDENTITY = new Int32Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

const HEX_CHARS = "0123456789abcdef";

const EMPTY_STATE = new Int32Array(4);

const MAX_UNICODE_CODEPOINT = 0x10ffff;

/**
 * Create initial MD5 state
 * @since 1.0.0
 * @category Constructors
 */
export const makeState = (): Md5State => {
  const buffer = new ArrayBuffer(68);
  const buffer8 = new Uint8Array(buffer, 0, 68);
  const buffer32 = new Uint32Array(buffer, 0, 17);
  const state = new Int32Array(STATE_IDENTITY);

  return Data.struct({
    dataLength: 0,
    bufferLength: 0,
    state,
    buffer,
    buffer8,
    buffer32,
  });
};

/**
 * MD5 cycle function - the core compression function
 *
 * @internal
 *
 * @remarks
 * **Performance-Critical Mutation Exception**
 *
 * This function intentionally mutates the input array `x` and uses mutable
 * local variables for the MD5 compression rounds. This violates our standard
 * functional purity guidelines but is acceptable here because:
 *
 * 1. **Isolated Scope**: Mutation is confined to this single internal function
 * 2. **No Shared State**: Arrays are never shared across `Md5State` boundaries
 * 3. **Public API Purity**: The public API remains purely functional via `Data.struct`
 * 4. **Performance Critical**: MD5 requires ~1000 bitwise operations per 64-byte block
 * 5. **Industry Standard**: Matches reference implementations for correctness
 *
 * **TypedArray Indexing**: Direct indexing with `?? 0` fallback is used instead of
 * `A.get` because Effect's Array utilities do not support TypedArrays (Int32Array,
 * Uint32Array). The `?? 0` pattern satisfies `noUncheckedIndexedAccess` while
 * maintaining the performance characteristics required for cryptographic operations.
 *
 * **Architecture Rule**: Do NOT replicate this pattern elsewhere without explicit
 * review. This is a documented exception for cryptographic primitives only.
 *
 * @see {@link https://tools.ietf.org/html/rfc1321} - MD5 Algorithm Specification
 */
const md5Cycle = (x: Int32Array | Uint32Array, k: Int32Array | Uint32Array): void => {
  let a = x[0] ?? 0;
  let b = x[1] ?? 0;
  let c = x[2] ?? 0;
  let d = x[3] ?? 0;

  // ff()
  a += (((b & c) | (~b & d)) + (k[0] ?? 0) - 680876936) | 0;
  a = (((a << 7) | (a >>> 25)) + b) | 0;
  d += (((a & b) | (~a & c)) + (k[1] ?? 0) - 389564586) | 0;
  d = (((d << 12) | (d >>> 20)) + a) | 0;
  c += (((d & a) | (~d & b)) + (k[2] ?? 0) + 606105819) | 0;
  c = (((c << 17) | (c >>> 15)) + d) | 0;
  b += (((c & d) | (~c & a)) + (k[3] ?? 0) - 1044525330) | 0;
  b = (((b << 22) | (b >>> 10)) + c) | 0;
  a += (((b & c) | (~b & d)) + (k[4] ?? 0) - 176418897) | 0;
  a = (((a << 7) | (a >>> 25)) + b) | 0;
  d += (((a & b) | (~a & c)) + (k[5] ?? 0) + 1200080426) | 0;
  d = (((d << 12) | (d >>> 20)) + a) | 0;
  c += (((d & a) | (~d & b)) + (k[6] ?? 0) - 1473231341) | 0;
  c = (((c << 17) | (c >>> 15)) + d) | 0;
  b += (((c & d) | (~c & a)) + (k[7] ?? 0) - 45705983) | 0;
  b = (((b << 22) | (b >>> 10)) + c) | 0;
  a += (((b & c) | (~b & d)) + (k[8] ?? 0) + 1770035416) | 0;
  a = (((a << 7) | (a >>> 25)) + b) | 0;
  d += (((a & b) | (~a & c)) + (k[9] ?? 0) - 1958414417) | 0;
  d = (((d << 12) | (d >>> 20)) + a) | 0;
  c += (((d & a) | (~d & b)) + (k[10] ?? 0) - 42063) | 0;
  c = (((c << 17) | (c >>> 15)) + d) | 0;
  b += (((c & d) | (~c & a)) + (k[11] ?? 0) - 1990404162) | 0;
  b = (((b << 22) | (b >>> 10)) + c) | 0;
  a += (((b & c) | (~b & d)) + (k[12] ?? 0) + 1804603682) | 0;
  a = (((a << 7) | (a >>> 25)) + b) | 0;
  d += (((a & b) | (~a & c)) + (k[13] ?? 0) - 40341101) | 0;
  d = (((d << 12) | (d >>> 20)) + a) | 0;
  c += (((d & a) | (~d & b)) + (k[14] ?? 0) - 1502002290) | 0;
  c = (((c << 17) | (c >>> 15)) + d) | 0;
  b += (((c & d) | (~c & a)) + (k[15] ?? 0) + 1236535329) | 0;
  b = (((b << 22) | (b >>> 10)) + c) | 0;

  // gg()
  a += (((b & d) | (c & ~d)) + (k[1] ?? 0) - 165796510) | 0;
  a = (((a << 5) | (a >>> 27)) + b) | 0;
  d += (((a & c) | (b & ~c)) + (k[6] ?? 0) - 1069501632) | 0;
  d = (((d << 9) | (d >>> 23)) + a) | 0;
  c += (((d & b) | (a & ~b)) + (k[11] ?? 0) + 643717713) | 0;
  c = (((c << 14) | (c >>> 18)) + d) | 0;
  b += (((c & a) | (d & ~a)) + (k[0] ?? 0) - 373897302) | 0;
  b = (((b << 20) | (b >>> 12)) + c) | 0;
  a += (((b & d) | (c & ~d)) + (k[5] ?? 0) - 701558691) | 0;
  a = (((a << 5) | (a >>> 27)) + b) | 0;
  d += (((a & c) | (b & ~c)) + (k[10] ?? 0) + 38016083) | 0;
  d = (((d << 9) | (d >>> 23)) + a) | 0;
  c += (((d & b) | (a & ~b)) + (k[15] ?? 0) - 660478335) | 0;
  c = (((c << 14) | (c >>> 18)) + d) | 0;
  b += (((c & a) | (d & ~a)) + (k[4] ?? 0) - 405537848) | 0;
  b = (((b << 20) | (b >>> 12)) + c) | 0;
  a += (((b & d) | (c & ~d)) + (k[9] ?? 0) + 568446438) | 0;
  a = (((a << 5) | (a >>> 27)) + b) | 0;
  d += (((a & c) | (b & ~c)) + (k[14] ?? 0) - 1019803690) | 0;
  d = (((d << 9) | (d >>> 23)) + a) | 0;
  c += (((d & b) | (a & ~b)) + (k[3] ?? 0) - 187363961) | 0;
  c = (((c << 14) | (c >>> 18)) + d) | 0;
  b += (((c & a) | (d & ~a)) + (k[8] ?? 0) + 1163531501) | 0;
  b = (((b << 20) | (b >>> 12)) + c) | 0;
  a += (((b & d) | (c & ~d)) + (k[13] ?? 0) - 1444681467) | 0;
  a = (((a << 5) | (a >>> 27)) + b) | 0;
  d += (((a & c) | (b & ~c)) + (k[2] ?? 0) - 51403784) | 0;
  d = (((d << 9) | (d >>> 23)) + a) | 0;
  c += (((d & b) | (a & ~b)) + (k[7] ?? 0) + 1735328473) | 0;
  c = (((c << 14) | (c >>> 18)) + d) | 0;
  b += (((c & a) | (d & ~a)) + (k[12] ?? 0) - 1926607734) | 0;
  b = (((b << 20) | (b >>> 12)) + c) | 0;

  // hh()
  a += ((b ^ c ^ d) + (k[5] ?? 0) - 378558) | 0;
  a = (((a << 4) | (a >>> 28)) + b) | 0;
  d += ((a ^ b ^ c) + (k[8] ?? 0) - 2022574463) | 0;
  d = (((d << 11) | (d >>> 21)) + a) | 0;
  c += ((d ^ a ^ b) + (k[11] ?? 0) + 1839030562) | 0;
  c = (((c << 16) | (c >>> 16)) + d) | 0;
  b += ((c ^ d ^ a) + (k[14] ?? 0) - 35309556) | 0;
  b = (((b << 23) | (b >>> 9)) + c) | 0;
  a += ((b ^ c ^ d) + (k[1] ?? 0) - 1530992060) | 0;
  a = (((a << 4) | (a >>> 28)) + b) | 0;
  d += ((a ^ b ^ c) + (k[4] ?? 0) + 1272893353) | 0;
  d = (((d << 11) | (d >>> 21)) + a) | 0;
  c += ((d ^ a ^ b) + (k[7] ?? 0) - 155497632) | 0;
  c = (((c << 16) | (c >>> 16)) + d) | 0;
  b += ((c ^ d ^ a) + (k[10] ?? 0) - 1094730640) | 0;
  b = (((b << 23) | (b >>> 9)) + c) | 0;
  a += ((b ^ c ^ d) + (k[13] ?? 0) + 681279174) | 0;
  a = (((a << 4) | (a >>> 28)) + b) | 0;
  d += ((a ^ b ^ c) + (k[0] ?? 0) - 358537222) | 0;
  d = (((d << 11) | (d >>> 21)) + a) | 0;
  c += ((d ^ a ^ b) + (k[3] ?? 0) - 722521979) | 0;
  c = (((c << 16) | (c >>> 16)) + d) | 0;
  b += ((c ^ d ^ a) + (k[6] ?? 0) + 76029189) | 0;
  b = (((b << 23) | (b >>> 9)) + c) | 0;
  a += ((b ^ c ^ d) + (k[9] ?? 0) - 640364487) | 0;
  a = (((a << 4) | (a >>> 28)) + b) | 0;
  d += ((a ^ b ^ c) + (k[12] ?? 0) - 421815835) | 0;
  d = (((d << 11) | (d >>> 21)) + a) | 0;
  c += ((d ^ a ^ b) + (k[15] ?? 0) + 530742520) | 0;
  c = (((c << 16) | (c >>> 16)) + d) | 0;
  b += ((c ^ d ^ a) + (k[2] ?? 0) - 995338651) | 0;
  b = (((b << 23) | (b >>> 9)) + c) | 0;

  // ii()
  a += ((c ^ (b | ~d)) + (k[0] ?? 0) - 198630844) | 0;
  a = (((a << 6) | (a >>> 26)) + b) | 0;
  d += ((b ^ (a | ~c)) + (k[7] ?? 0) + 1126891415) | 0;
  d = (((d << 10) | (d >>> 22)) + a) | 0;
  c += ((a ^ (d | ~b)) + (k[14] ?? 0) - 1416354905) | 0;
  c = (((c << 15) | (c >>> 17)) + d) | 0;
  b += ((d ^ (c | ~a)) + (k[5] ?? 0) - 57434055) | 0;
  b = (((b << 21) | (b >>> 11)) + c) | 0;
  a += ((c ^ (b | ~d)) + (k[12] ?? 0) + 1700485571) | 0;
  a = (((a << 6) | (a >>> 26)) + b) | 0;
  d += ((b ^ (a | ~c)) + (k[3] ?? 0) - 1894986606) | 0;
  d = (((d << 10) | (d >>> 22)) + a) | 0;
  c += ((a ^ (d | ~b)) + (k[10] ?? 0) - 1051523) | 0;
  c = (((c << 15) | (c >>> 17)) + d) | 0;
  b += ((d ^ (c | ~a)) + (k[1] ?? 0) - 2054922799) | 0;
  b = (((b << 21) | (b >>> 11)) + c) | 0;
  a += ((c ^ (b | ~d)) + (k[8] ?? 0) + 1873313359) | 0;
  a = (((a << 6) | (a >>> 26)) + b) | 0;
  d += ((b ^ (a | ~c)) + (k[15] ?? 0) - 30611744) | 0;
  d = (((d << 10) | (d >>> 22)) + a) | 0;
  c += ((a ^ (d | ~b)) + (k[6] ?? 0) - 1560198380) | 0;
  c = (((c << 15) | (c >>> 17)) + d) | 0;
  b += ((d ^ (c | ~a)) + (k[13] ?? 0) + 1309151649) | 0;
  b = (((b << 21) | (b >>> 11)) + c) | 0;
  a += ((c ^ (b | ~d)) + (k[4] ?? 0) - 145523070) | 0;
  a = (((a << 6) | (a >>> 26)) + b) | 0;
  d += ((b ^ (a | ~c)) + (k[11] ?? 0) - 1120210379) | 0;
  d = (((d << 10) | (d >>> 22)) + a) | 0;
  c += ((a ^ (d | ~b)) + (k[2] ?? 0) + 718787259) | 0;
  c = (((c << 15) | (c >>> 17)) + d) | 0;
  b += ((d ^ (c | ~a)) + (k[9] ?? 0) - 343485551) | 0;
  b = (((b << 21) | (b >>> 11)) + c) | 0;

  x[0] = (a + (x[0] ?? 0)) | 0;
  x[1] = (b + (x[1] ?? 0)) | 0;
  x[2] = (c + (x[2] ?? 0)) | 0;
  x[3] = (d + (x[3] ?? 0)) | 0;
};

/**
 * Convert Int32Array to hex string
 *
 * @internal
 *
 * @remarks
 * **Performance-Critical Loop**
 *
 * This function uses imperative loops and direct TypedArray indexing for
 * performance. Converting to functional style (A.range + A.reduce) would
 * add unnecessary overhead for a function called once per hash computation.
 *
 * **TypedArray Indexing**: Direct indexing with `?? 0` is required because
 * Effect's `A.get` does not support TypedArrays. The pattern satisfies
 * `noUncheckedIndexedAccess` constraints.
 */
const toHex = (x: Int32Array): string => {
  const hexOut: Array<string> = [];

  for (let i = 0; i < 4; i += 1) {
    const offset = i * 8;
    let n = x[i] ?? 0;

    for (let j = 0; j < 8; j += 2) {
      hexOut[offset + 1 + j] = F.pipe(
        HEX_CHARS,
        Str.charAt(n & 0x0f),
        O.getOrElse(() => "0")
      );
      n >>>= 4;
      hexOut[offset + 0 + j] = F.pipe(
        HEX_CHARS,
        Str.charAt(n & 0x0f),
        O.getOrElse(() => "0")
      );
      n >>>= 4;
    }
  }

  return F.pipe(hexOut, A.join(""));
};

/**
 * Append UTF-8 string to hasher state
 *
 * @since 1.0.0
 * @category Operations
 *
 * @remarks
 * **Performance-Critical Loop**
 *
 * This function uses imperative loops for UTF-8 encoding because:
 * 1. Character-by-character processing requires stateful lookahead for surrogate pairs
 * 2. Buffer management (filling 64-byte blocks, calling md5Cycle) is inherently sequential
 * 3. Converting to functional style would add significant overhead for large strings
 *
 * **TypedArray Indexing**: Direct indexing on `buf8` (Uint8Array) and `buf32` (Uint32Array)
 * is required because Effect's `A.get` does not support TypedArrays.
 */
export const appendStr =
  (str: string) =>
  (state: Md5State): Effect.Effect<Md5State, UnicodeEncodingError> =>
    Effect.gen(function* () {
      const buf8 = state.buffer8;
      const buf32 = state.buffer32;
      let bufLen = state.bufferLength;
      let dataLen = state.dataLength;

      const strLen = F.pipe(str, Str.length);

      for (let i = 0; i < strLen; i += 1) {
        const codeOpt = F.pipe(str, Str.charCodeAt(i));

        if (O.isNone(codeOpt)) {
          continue;
        }

        let code = codeOpt.value;

        if (code < 128) {
          buf8[bufLen++] = code;
        } else if (code < 0x800) {
          buf8[bufLen++] = (code >>> 6) + 0xc0;
          buf8[bufLen++] = (code & 0x3f) | 0x80;
        } else if (code < 0xd800 || code > 0xdbff) {
          buf8[bufLen++] = (code >>> 12) + 0xe0;
          buf8[bufLen++] = ((code >>> 6) & 0x3f) | 0x80;
          buf8[bufLen++] = (code & 0x3f) | 0x80;
        } else {
          const nextCodeOpt = F.pipe(str, Str.charCodeAt(++i));
          if (O.isNone(nextCodeOpt)) {
            return yield* new UnicodeEncodingError({
              message: "Invalid UTF-16 surrogate pair",
              codePoint: code,
            });
          }

          code = (code - 0xd800) * 0x400 + (nextCodeOpt.value - 0xdc00) + 0x10000;

          if (code > MAX_UNICODE_CODEPOINT) {
            return yield* new UnicodeEncodingError({
              message: `Unicode standard supports code points up to U+10FFFF, got ${code.toString(16)}`,
              codePoint: code,
            });
          }

          buf8[bufLen++] = (code >>> 18) + 0xf0;
          buf8[bufLen++] = ((code >>> 12) & 0x3f) | 0x80;
          buf8[bufLen++] = ((code >>> 6) & 0x3f) | 0x80;
          buf8[bufLen++] = (code & 0x3f) | 0x80;
        }

        if (bufLen >= 64) {
          dataLen += 64;
          md5Cycle(state.state, buf32);
          bufLen -= 64;
          buf32[0] = buf32[16] ?? 0;
        }
      }

      return Data.struct({
        ...state,
        dataLength: dataLen,
        bufferLength: bufLen,
      });
    });

/**
 * Append ASCII string to hasher state
 *
 * @since 1.0.0
 * @category Operations
 *
 * @remarks
 * **Performance-Critical Loop**
 *
 * This function uses imperative while loops for ASCII byte copying because:
 * 1. Buffer management requires filling 64-byte blocks and calling md5Cycle
 * 2. The inner loop processes bytes until buffer is full or string is exhausted
 * 3. Converting to functional style would add significant overhead for large strings
 *
 * **TypedArray Indexing**: Direct indexing on `buf8` (Uint8Array) is required
 * because Effect's `A.get` does not support TypedArrays.
 */
export const appendAsciiStr =
  (str: string) =>
  (state: Md5State): Md5State => {
    const buf8 = state.buffer8;
    const buf32 = state.buffer32;
    let bufLen = state.bufferLength;
    let dataLen = state.dataLength;
    let j = 0;
    const strLen = F.pipe(str, Str.length);

    while (true) {
      const i = Math.min(strLen - j, 64 - bufLen);
      let remaining = i;

      while (remaining > 0) {
        const charCodeOpt = F.pipe(str, Str.charCodeAt(j));
        buf8[bufLen++] = O.getOrElse(charCodeOpt, thunkZero);
        j++;
        remaining--;
      }

      if (bufLen < 64) {
        break;
      }

      dataLen += 64;
      md5Cycle(state.state, buf32);
      bufLen = 0;
    }

    return Data.struct({
      ...state,
      dataLength: dataLen,
      bufferLength: bufLen,
    });
  };

/**
 * Append byte array to hasher state
 *
 * @since 1.0.0
 * @category Operations
 *
 * @remarks
 * **Performance-Critical Loop**
 *
 * This function uses imperative while loops for byte array copying because:
 * 1. Buffer management requires filling 64-byte blocks and calling md5Cycle
 * 2. The inner loop copies bytes until buffer is full or input is exhausted
 * 3. Converting to functional style would add significant overhead for large arrays
 *
 * **TypedArray Indexing**: Direct indexing on `buf8` (Uint8Array) and `input` (Uint8Array)
 * is required because Effect's `A.get` does not support TypedArrays.
 */
export const appendByteArray =
  (input: Uint8Array) =>
  (state: Md5State): Md5State => {
    const buf8 = state.buffer8;
    const buf32 = state.buffer32;
    let bufLen = state.bufferLength;
    let dataLen = state.dataLength;
    let j = 0;
    const inputLen = input.length;

    while (true) {
      const i = Math.min(inputLen - j, 64 - bufLen);
      let remaining = i;

      while (remaining > 0) {
        buf8[bufLen++] = input[j] ?? 0;
        j++;
        remaining--;
      }

      if (bufLen < 64) {
        break;
      }

      dataLen += 64;
      md5Cycle(state.state, buf32);
      bufLen = 0;
    }

    return Data.struct({
      ...state,
      dataLength: dataLen,
      bufferLength: bufLen,
    });
  };

/**
 * Finalize hash computation and return result
 * @since 1.0.0
 * @category Operations
 */
export const finalize =
  (raw: boolean) =>
  (state: Md5State): Effect.Effect<string | Int32Array, Md5ComputationError> =>
    Effect.gen(function* () {
      const bufLen = state.bufferLength;
      const buf8 = state.buffer8;
      const buf32 = state.buffer32;
      const i = (bufLen >> 2) + 1;

      const dataLen = state.dataLength + bufLen;
      const dataBitsLen = dataLen * 8;

      buf8[bufLen] = 0x80;
      buf8[bufLen + 1] = 0;
      buf8[bufLen + 2] = 0;
      buf8[bufLen + 3] = 0;

      const subArray = BUFFER32_IDENTITY.subarray(i);
      buf32.set(subArray, i);

      if (bufLen > 55) {
        md5Cycle(state.state, buf32);
        buf32.set(BUFFER32_IDENTITY);
      }

      if (dataBitsLen <= 0xffffffff) {
        buf32[14] = dataBitsLen;
      } else {
        const hexStr = dataBitsLen.toString(16);
        const matchesOpt = F.pipe(hexStr, Str.match(/(.*?)(.{0,8})$/));

        if (O.isNone(matchesOpt)) {
          return raw ? EMPTY_STATE : "";
        }

        const matches = matchesOpt.value;
        const loOpt = F.pipe(matches, A.get(2));
        const hiOpt = F.pipe(matches, A.get(1));

        if (O.isNone(loOpt)) {
          return raw ? EMPTY_STATE : "";
        }

        const lo = Number.parseInt(loOpt.value, 16);
        const hi = F.pipe(
          hiOpt,
          O.flatMap((s) => (F.pipe(s, Str.isEmpty) ? O.none() : O.some(Number.parseInt(s, 16)))),
          O.getOrElse(thunkZero)
        );

        buf32[14] = lo;
        buf32[15] = hi;
      }

      md5Cycle(state.state, buf32);

      return raw ? state.state : toHex(state.state);
    });

/**
 * Hash a UTF-8 string
 * @since 1.0.0
 * @category Hashing
 */
export const hashStr = (
  str: string,
  raw = false
): Effect.Effect<string | Int32Array, UnicodeEncodingError | Md5ComputationError> =>
  Effect.gen(function* () {
    const state = makeState();
    const withStr = yield* F.pipe(state, appendStr(str));
    return yield* F.pipe(withStr, finalize(raw));
  });

/**
 * Hash an ASCII string
 * @since 1.0.0
 * @category Hashing
 */
export const hashAsciiStr = (str: string, raw = false): Effect.Effect<string | Int32Array, Md5ComputationError> =>
  Effect.gen(function* () {
    const state = makeState();
    const withStr = F.pipe(state, appendAsciiStr(str));
    return yield* F.pipe(withStr, finalize(raw));
  });

/**
 * Get serializable state for transfer between workers
 *
 * @since 1.0.0
 * @category State Management
 *
 * @remarks
 * **TypedArray Indexing**: The `state.state` field is an `Int32Array`, which
 * does not work with Effect's `A.get`. Direct indexing with `?? 0` fallback
 * is used to satisfy `noUncheckedIndexedAccess` constraints.
 */
export const getSerializableState = (state: Md5State): SerializableMd5State => {
  const s = state.state;
  const bufferArray = F.pipe(state.buffer8, A.fromIterable);

  const bufferStr = F.pipe(
    bufferArray,
    A.map((code) => String.fromCharCode(code)),
    A.join("")
  );

  return {
    buffer: bufferStr,
    buflen: state.bufferLength,
    length: state.dataLength,
    state: [s[0] ?? 0, s[1] ?? 0, s[2] ?? 0, s[3] ?? 0],
  };
};

/**
 * Restore state from serializable format
 *
 * @since 1.0.0
 * @category State Management
 *
 * @remarks
 * **Performance Consideration**
 *
 * This function uses an imperative loop to restore buffer contents from a
 * serialized string. While not as performance-critical as the core MD5
 * operations, it still benefits from direct TypedArray access.
 *
 * **TypedArray and Regular Array Indexing**:
 * - `state.state` (Int32Array) and `state.buffer8` (Uint8Array) require direct indexing
 *   because Effect's `A.get` does not support TypedArrays
 * - `serializedState.state` (ReadonlyArray<number>) uses `?? 0` for `noUncheckedIndexedAccess`
 *   compliance; converting to `A.get` would work but adds overhead for fixed 4-element access
 */
export const setSerializableState = (serializedState: SerializableMd5State): Md5State => {
  const state = makeState();
  const buf = serializedState.buffer;
  const x = serializedState.state;
  const s = state.state;

  s[0] = x[0] ?? 0;
  s[1] = x[1] ?? 0;
  s[2] = x[2] ?? 0;
  s[3] = x[3] ?? 0;

  const bufLen = F.pipe(buf, Str.length);
  for (let i = 0; i < bufLen; i += 1) {
    const charCodeOpt = F.pipe(buf, Str.charCodeAt(i));
    state.buffer8[i] = O.getOrElse(charCodeOpt, thunkZero);
  }

  return Data.struct({
    ...state,
    dataLength: serializedState.length,
    bufferLength: serializedState.buflen,
  });
};

/**
 * Self-test to verify MD5 implementation
 * @since 1.0.0
 * @category Testing
 */
export const selfTest = (): Effect.Effect<void, Md5ComputationError | UnicodeEncodingError> =>
  Effect.gen(function* () {
    const result = yield* hashStr("hello");

    if (result !== "5d41402abc4b2a76b9719d911017c592") {
      return yield* new Md5ComputationError({
        message: "MD5 self-test failed",
        cause: { expected: "5d41402abc4b2a76b9719d911017c592", actual: result },
      });
    }
  });

// Run self-test at module initialization
Effect.runSync(selfTest());
