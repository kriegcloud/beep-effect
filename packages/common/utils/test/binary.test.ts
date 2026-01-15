import { expect } from "bun:test";
import { effect } from "@beep/testkit";
import { arrayBufferToBlob } from "@beep/utils/array-buffer-to-blob";
import { arrayBufferToUint8Array } from "@beep/utils/array-buffer-to-uint8-array";
import { uint8arrayToArrayBuffer } from "@beep/utils/uint8-array-to-array-buffer";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";

effect("binary helpers convert between ArrayBuffer, Blob, and Uint8Array",
  Effect.fn(function* () {
    const buffer = new Uint8Array([1, 2, 3]).buffer;
    const blob = arrayBufferToBlob(buffer);
    const uint8 = arrayBufferToUint8Array(buffer);
    const roundTrip = uint8arrayToArrayBuffer(uint8);

    expect(blob).toBeInstanceOf(Blob);
    expect(uint8).toBeInstanceOf(Uint8Array);
    expect(F.pipe(uint8, A.fromIterable)).toEqual([1, 2, 3]);
    expect(F.pipe(new Uint8Array(roundTrip), A.fromIterable)).toEqual([1, 2, 3]);
  })
);
