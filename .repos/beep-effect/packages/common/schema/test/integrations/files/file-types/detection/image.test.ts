import { fileTypeChecker } from "@beep/schema/integrations/files";
import { assertNone, deepStrictEqual, describe, effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";

describe("detectFileOption", () => {
  effect(
    "should detect the file type of an Array<number> as a avif file",
    Effect.fn(function* () {
      const file: ReadonlyArray<number> = [0, 0, 0, 20, 102, 116, 121, 112, 97, 118, 105, 102, 0, 0];
      const result = fileTypeChecker.detectFileOption(file);

      const detectedFile = F.pipe(result, O.getOrThrow);

      strictEqual(detectedFile.extension, "avif");
      strictEqual(detectedFile.mimeType, "image/avif");
      deepStrictEqual(detectedFile.signature.sequence, ["0", "0", "0"]);
    })
  );

  effect(
    "should detect the file type of an ArrayBuffer as a avif file",
    Effect.fn(function* () {
      const file: ReadonlyArray<number> = [0, 0, 0, 20, 102, 116, 121, 112, 97, 118, 105, 102, 0, 0];
      const buffer: ArrayBuffer = new Uint8Array(file).buffer;
      const result = fileTypeChecker.detectFileOption(buffer);

      const detectedFile = F.pipe(result, O.getOrThrow);

      strictEqual(detectedFile.extension, "avif");
      strictEqual(detectedFile.mimeType, "image/avif");
      deepStrictEqual(detectedFile.signature.sequence, ["0", "0", "0"]);
    })
  );

  effect(
    "should not detect a corrupted Array<number> of an avif file which does not include the 'ftypavif' string",
    () =>
      Effect.gen(function* () {
        const file: ReadonlyArray<number> = [0, 0, 0, 20, 102, 114, 121, 112, 97, 118, 105, 102, 0, 0];
        const result = fileTypeChecker.detectFileOption(file);

        assertNone(result);
      })
  );

  effect(
    "should not detect a m4v file as a heic file",
    Effect.fn(function* () {
      // m4v files contain the m4v signature within their own signature
      const file: ReadonlyArray<number> = [
        0, 0, 0, 0, 0x66, 0x74, 0x79, 0x70, 0x6d, 0x70, 0x34, 0x32, 0, 0, 0, 32, 102, 116, 121, 112, 77, 52, 86, 72, 0,
        0, 0, 1, 77, 52, 86, 72, 77, 52, 65, 32, 109, 112, 52, 50, 105, 115, 111, 109,
      ];

      const result = fileTypeChecker.detectFileOption(file);
      const detectedFile = F.pipe(result, O.getOrThrow);

      strictEqual(detectedFile.extension, "m4v");
    })
  );

  effect(
    "should detect the file type of an Array<number> as a heic file",
    Effect.fn(function* () {
      const file: ReadonlyArray<number> = [
        0, 0, 0, 24, 0x66, 0x74, 0x79, 0x70, 0x6d, 105, 102, 49, 0, 0, 0, 0, 109, 105, 102, 49, 104, 101, 105, 99, 0, 0,
        1, 254, 109, 101, 116, 97, 0, 0, 0, 0, 0, 0, 0, 33, 104, 100, 108,
      ];

      const result = fileTypeChecker.detectFileOption(file);
      const detectedFile = F.pipe(result, O.getOrThrow);

      strictEqual(detectedFile.extension, "heic");
      strictEqual(detectedFile.mimeType, "image/heic");
    })
  );
});
