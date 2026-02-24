import { describe, expect, test } from "@beep/testkit";
import * as Md5 from "@beep/utils/md5";
import { thunkZero } from "@beep/utils/thunk";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Str from "effect/String";

/**
 * Convert a string to a Uint8Array using Effect utilities.
 *
 * @remarks
 * This is test helper code, so we use functional patterns even though
 * the final TypedArray assignment still requires imperative indexing
 * (TypedArrays don't support Effect's A.set).
 */
const stringToArray = (str: string): Uint8Array => {
  const length = F.pipe(str, Str.length);
  const buff = new ArrayBuffer(length);
  const arr = new Uint8Array(buff);

  // Build array of char codes using Effect utilities
  const charCodes = F.pipe(
    A.range(0, length - 1),
    A.map((i) => F.pipe(str, Str.charCodeAt(i), O.getOrElse(thunkZero)))
  );

  // Copy to TypedArray (TypedArrays don't support A.set, so we use forEach)
  F.pipe(
    charCodes,
    A.forEach((code, i) => {
      arr[i] = code;
    })
  );

  return arr;
};

describe("MD5 hashing with Effect", () => {
  test("should pass the self test", () => {
    const result = Effect.runSync(Md5.hashStr("hello"));
    expect(result).toEqual("5d41402abc4b2a76b9719d911017c592");
  });

  test("should hash a 64 byte string", () => {
    const str = "5d41402abc4b2a76b9719d911017c5925d41402abc4b2a76b9719d911017c592";
    const expectedResult = "e0b153045b08d59d4e18a98ab823ac42";
    const arr = stringToArray(str);

    const result1 = Effect.runSync(
      Effect.gen(function* () {
        const state = Md5.makeState();
        const withBytes = F.pipe(state, Md5.appendByteArray(arr));
        return yield* F.pipe(withBytes, Md5.finalize(false));
      })
    );

    expect(result1).toEqual(expectedResult);

    const result2 = Effect.runSync(Md5.hashStr(str));
    expect(result2).toEqual(expectedResult);
  });

  test("should hash a 128 byte string", () => {
    const str =
      "5d41402abc4b2a76b9719d911017c5925d41402abc4b2a76b9719d911017c5925d41402abc4b2a76b9719d911017c5925d41402abc4b2a76b9719d911017c592";
    const expectedResult = "b12bc24f5507eba4ee27092f70148415";
    const arr = stringToArray(str);

    const result1 = Effect.runSync(
      Effect.gen(function* () {
        const state = Md5.makeState();
        const withBytes = F.pipe(state, Md5.appendByteArray(arr));
        return yield* F.pipe(withBytes, Md5.finalize(false));
      })
    );

    expect(result1).toEqual(expectedResult);

    const result2 = Effect.runSync(Md5.hashStr(str));
    expect(result2).toEqual(expectedResult);
  });

  test("should hash a 160 byte string", () => {
    const str =
      "5d41402abc4b2a76b9719d911017c5925d41402abc4b2a76b9719d911017c5925d41402abc4b2a765d41402abc4b2a76b9719d911017c5925d41402abc4b2a76b9719d911017c5925d41402abc4b2a76";
    const expectedResult = "66a1e6b119bf30ade63378f770e52549";
    const arr = stringToArray(str);

    const result1 = Effect.runSync(
      Effect.gen(function* () {
        const state = Md5.makeState();
        const withBytes = F.pipe(state, Md5.appendByteArray(arr));
        return yield* F.pipe(withBytes, Md5.finalize(false));
      })
    );

    expect(result1).toEqual(expectedResult);

    const result2 = Effect.runSync(Md5.hashStr(str));
    expect(result2).toEqual(expectedResult);
  });

  test("should work incrementally", () => {
    const result1 = Effect.runSync(
      Effect.gen(function* () {
        let state = Md5.makeState();
        state = yield* F.pipe(state, Md5.appendStr("5d41402abc4b2a421456"));
        state = yield* F.pipe(state, Md5.appendStr("5d41402abc4b2a421456"));
        state = yield* F.pipe(state, Md5.appendStr("5d41402abc4b2a421456a234"));
        return yield* F.pipe(state, Md5.finalize(false));
      })
    );

    expect(result1).toEqual("014d4bbb02c66c98249114dc674a7187");

    const result2 = Effect.runSync(
      Effect.gen(function* () {
        let state = Md5.makeState();
        state = F.pipe(state, Md5.appendByteArray(stringToArray("5d41402abc4b2a421456")));
        state = F.pipe(state, Md5.appendByteArray(stringToArray("5d41402abc4b2a421456")));
        state = F.pipe(state, Md5.appendByteArray(stringToArray("5d41402abc4b2a421456a234")));
        return yield* F.pipe(state, Md5.finalize(false));
      })
    );

    expect(result2).toEqual("014d4bbb02c66c98249114dc674a7187");

    const result3 = Effect.runSync(
      Effect.gen(function* () {
        let state = Md5.makeState();
        state = yield* F.pipe(state, Md5.appendStr("5d41402abc4b2a421456"));
        state = yield* F.pipe(state, Md5.appendStr("5d41402abc4b2a4214565d41402abc4b2a4214565d41402abc4b2a421456"));
        state = yield* F.pipe(state, Md5.appendStr("5d41402abc4b2a421456"));
        return yield* F.pipe(state, Md5.finalize(false));
      })
    );

    expect(result3).toEqual("45762198a57a35c8523915898fb8c68c");

    const result4 = Effect.runSync(
      Effect.gen(function* () {
        let state = Md5.makeState();
        state = F.pipe(state, Md5.appendByteArray(stringToArray("5d41402abc4b2a421456")));
        state = F.pipe(
          state,
          Md5.appendByteArray(stringToArray("5d41402abc4b2a4214565d41402abc4b2a4214565d41402abc4b2a421456"))
        );
        state = F.pipe(state, Md5.appendByteArray(stringToArray("5d41402abc4b2a421456")));
        return yield* F.pipe(state, Md5.finalize(false));
      })
    );

    expect(result4).toEqual("45762198a57a35c8523915898fb8c68c");
  });

  test("should be resumable", () => {
    const result = Effect.runSync(
      Effect.gen(function* () {
        let state = Md5.makeState();
        state = yield* F.pipe(state, Md5.appendStr("5d41402abc4b2a421456"));
        state = yield* F.pipe(state, Md5.appendStr("5d41402abc4b2a421456"));
        state = yield* F.pipe(state, Md5.appendStr("5d41402abc4b2a421456"));
        state = yield* F.pipe(state, Md5.appendStr("5d41402abc4b2a421456a234"));
        return yield* F.pipe(state, Md5.finalize(false));
      })
    );

    // Test state serialization/deserialization with AppendStr
    const result1 = Effect.runSync(
      Effect.gen(function* () {
        let state = Md5.makeState();
        state = yield* F.pipe(state, Md5.appendStr("5d41402abc4b2a421456"));
        state = yield* F.pipe(state, Md5.appendStr("5d41402abc4b2a421456"));
        state = yield* F.pipe(state, Md5.appendStr("5d41402abc4b2a421456"));
        const serialized = Md5.getSerializableState(state);

        // Restore and continue
        let restored = Md5.setSerializableState(serialized);
        restored = yield* F.pipe(restored, Md5.appendStr("5d41402abc4b2a421456a234"));
        return yield* F.pipe(restored, Md5.finalize(false));
      })
    );

    expect(result1).toEqual(result);

    // Test with AppendByteArray
    const result2 = Effect.runSync(
      Effect.gen(function* () {
        let state = Md5.makeState();
        state = F.pipe(state, Md5.appendByteArray(stringToArray("5d41402abc4b2a421456")));
        state = F.pipe(state, Md5.appendByteArray(stringToArray("5d41402abc4b2a421456")));
        state = F.pipe(state, Md5.appendByteArray(stringToArray("5d41402abc4b2a421456")));
        const serialized = Md5.getSerializableState(state);

        // Restore and continue
        let restored = Md5.setSerializableState(serialized);
        restored = F.pipe(restored, Md5.appendByteArray(stringToArray("5d41402abc4b2a421456a234")));
        return yield* F.pipe(restored, Md5.finalize(false));
      })
    );

    expect(result2).toEqual(result);
  });

  test("can handle UTF8 strings", () => {
    const str1 = "räksmörgås";
    const arr1 = stringToArray(str1);

    const result1 = Effect.runSync(
      Effect.gen(function* () {
        const state = Md5.makeState();
        const withBytes = F.pipe(state, Md5.appendByteArray(arr1));
        return yield* F.pipe(withBytes, Md5.finalize(false));
      })
    );

    expect(result1).toEqual("09d9d71ec8a8e3bc74e51ebd587154f3");

    const result2 = Effect.runSync(Md5.hashAsciiStr(str1));
    expect(result2).toEqual("09d9d71ec8a8e3bc74e51ebd587154f3");

    const result3 = Effect.runSync(Md5.hashStr(str1));
    expect(result3).toEqual("e462805dcf84413d5eddca45a4b88a5e");

    const str2 = "\u30b9\u3092\u98df";
    const arr2 = stringToArray(str2);

    const result4 = Effect.runSync(
      Effect.gen(function* () {
        const state = Md5.makeState();
        const withBytes = F.pipe(state, Md5.appendByteArray(arr2));
        return yield* F.pipe(withBytes, Md5.finalize(false));
      })
    );

    expect(result4).toEqual("4664c02a4cf6b69392f8309b6d6256f5");

    const result5 = Effect.runSync(Md5.hashAsciiStr(str2));
    expect(result5).toEqual("4664c02a4cf6b69392f8309b6d6256f5");

    const result6 = Effect.runSync(Md5.hashStr(str2));
    expect(result6).toEqual("453931ab48a4a5af69f3da3c21064fc9");
  });
});
