import { fileTypeChecker } from "@beep/schema/integrations/files";
import { assertNone, deepStrictEqual, describe, effect, strictEqual, throws } from "@beep/testkit";
import type { UnsafeTypes } from "@beep/types";
import * as Effect from "effect/Effect";
import * as Either from "effect/Either";
import * as F from "effect/Function";
import * as O from "effect/Option";

describe("detectFileOption", () => {
  effect("should detect the file type of an Array<number> as a png file", () =>
    Effect.gen(function* () {
      const fileArrayNumber: ReadonlyArray<number> = [
        137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 4, 0, 0, 0, 1, 244, 8, 6, 0, 0, 0, 163, 38,
        95, 43, 0, 0, 0, 9, 112, 72, 89, 115, 0, 0, 46, 35, 0, 0, 46, 35, 1, 120, 165, 63, 118, 0, 0, 0, 1, 115, 82, 71,
        66, 0, 174,
      ];
      const result = fileTypeChecker.detectFileOption(fileArrayNumber);
      const detectedFile = F.pipe(result, O.getOrThrow);

      strictEqual(detectedFile.extension, "png");
      strictEqual(detectedFile.mimeType, "image/png");
      deepStrictEqual(detectedFile.signature.sequence, ["89", "50", "4e", "47", "d", "a", "1a", "a"]);
    })
  );

  effect("should detect the file type of an ArrayBuffer as a png file", () =>
    Effect.gen(function* () {
      const fileArrayBuffer = new Uint8Array([
        137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 4, 0, 0, 0, 1, 244, 8, 6, 0, 0, 0, 163, 38,
        95, 43, 0, 0, 0, 9, 112, 72, 89, 115, 0, 0, 46, 35, 0, 0, 46, 35, 1, 120, 165, 63, 118, 0, 0, 0, 1, 115, 82, 71,
        66, 0, 174,
      ]).buffer;
      const result = fileTypeChecker.detectFileOption(fileArrayBuffer);
      const detectedFile = F.pipe(result, O.getOrThrow);

      strictEqual(detectedFile.extension, "png");
      strictEqual(detectedFile.mimeType, "image/png");
      deepStrictEqual(detectedFile.signature.sequence, ["89", "50", "4e", "47", "d", "a", "1a", "a"]);
    })
  );

  effect("should detect the file type of a fileUint8Array as a png file", () =>
    Effect.gen(function* () {
      const fileUint8Array = new Uint8Array([
        137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 4, 0, 0, 0, 1, 244, 8, 6, 0, 0, 0, 163, 38,
        95, 43, 0, 0, 0, 9, 112, 72, 89, 115, 0, 0, 46, 35, 0, 0, 46, 35, 1, 120, 165, 63, 118, 0, 0, 0, 1, 115, 82, 71,
        66, 0, 174,
      ]);
      const result = fileTypeChecker.detectFileOption(fileUint8Array);
      const detectedFile = F.pipe(result, O.getOrThrow);

      strictEqual(detectedFile.extension, "png");
      strictEqual(detectedFile.mimeType, "image/png");
      deepStrictEqual(detectedFile.signature.sequence, ["89", "50", "4e", "47", "d", "a", "1a", "a"]);
    })
  );

  effect("should return None if no file type is detected", () =>
    Effect.gen(function* () {
      const file = [1, 2, 3, 4, 5];
      const result = fileTypeChecker.detectFileOption(file);

      assertNone(result);
    })
  );

  effect("should return Left with InvalidFileTypeError for invalid file input via Either API", () =>
    Effect.gen(function* () {
      const file: UnsafeTypes.UnsafeAny = "10";
      const result = fileTypeChecker.detectFileEither(file);

      if (Either.isLeft(result)) {
        strictEqual(result.left._tag, "InvalidFileTypeError");
      } else {
        throw new Error("Expected Left but got Right");
      }
    })
  );

  effect("should throw a TypeError when using detectFile with invalid input", () =>
    Effect.gen(function* () {
      const file: UnsafeTypes.UnsafeAny = "10";

      throws(() => {
        fileTypeChecker.detectFile(file);
      });
    })
  );

  effect("should return None if the Array<number> file is empty", () =>
    Effect.gen(function* () {
      const file: ReadonlyArray<number> = [];
      const result = fileTypeChecker.detectFileOption(file);

      assertNone(result);
    })
  );

  effect("should return None if chunkSize is too short", () =>
    Effect.gen(function* () {
      const file: ReadonlyArray<number> = [
        137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 4, 0, 0, 0, 1, 244, 8, 6, 0, 0, 0, 163, 38,
        95, 43, 0, 0, 0, 9, 112, 72, 89, 115, 0, 0, 46, 35, 0, 0, 46, 35, 1, 120, 165, 63, 118, 0, 0, 0, 1, 115, 82, 71,
        66, 0, 174,
      ];
      const result = fileTypeChecker.detectFileOption(file, { chunkSize: 4 });

      assertNone(result);
    })
  );

  effect("should return Left with InvalidChunkSizeError when chunkSize is zero via Either API", () =>
    Effect.gen(function* () {
      const file: ReadonlyArray<number> = [
        137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 4, 0, 0, 0, 1, 244, 8, 6, 0, 0, 0, 163, 38,
        95, 43, 0, 0, 0, 9, 112, 72, 89, 115, 0, 0, 46, 35, 0, 0, 46, 35, 1, 120, 165, 63, 118, 0, 0, 0, 1, 115, 82, 71,
        66, 0, 174,
      ];
      const result = fileTypeChecker.detectFileEither(file, { chunkSize: 0 });

      if (Either.isLeft(result)) {
        strictEqual(result.left._tag, "InvalidChunkSizeError");
      } else {
        throw new Error("Expected Left but got Right");
      }
    })
  );

  effect("should throw a RangeError when using detectFile with chunkSize zero", () =>
    Effect.gen(function* () {
      const file: ReadonlyArray<number> = [
        137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 4, 0, 0, 0, 1, 244, 8, 6, 0, 0, 0, 163, 38,
        95, 43, 0, 0, 0, 9, 112, 72, 89, 115, 0, 0, 46, 35, 0, 0, 46, 35, 1, 120, 165, 63, 118, 0, 0, 0, 1, 115, 82, 71,
        66, 0, 174,
      ];

      throws(() => {
        fileTypeChecker.detectFile(file, { chunkSize: 0 });
      });
    })
  );

  effect("should return Left with InvalidChunkSizeError when chunkSize is negative via Either API", () =>
    Effect.gen(function* () {
      const file: ReadonlyArray<number> = [
        137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 4, 0, 0, 0, 1, 244, 8, 6, 0, 0, 0, 163, 38,
        95, 43, 0, 0, 0, 9, 112, 72, 89, 115, 0, 0, 46, 35, 0, 0, 46, 35, 1, 120, 165, 63, 118, 0, 0, 0, 1, 115, 82, 71,
        66, 0, 174,
      ];
      const result = fileTypeChecker.detectFileEither(file, { chunkSize: -1 });

      if (Either.isLeft(result)) {
        strictEqual(result.left._tag, "InvalidChunkSizeError");
      } else {
        throw new Error("Expected Left but got Right");
      }
    })
  );

  effect("should detect the file type of an Array<number> as a png file with chunkSize of 32 bytes", () =>
    Effect.gen(function* () {
      const file: ReadonlyArray<number> = [
        137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 4, 0, 0, 0, 1, 244, 8, 6, 0, 0, 0, 163, 38,
        95, 43, 0, 0, 0, 9, 112, 72, 89, 115, 0, 0, 46, 35, 0, 0, 46, 35, 1, 120, 165, 63, 118, 0, 0, 0, 1, 115, 82, 71,
        66, 0, 174,
      ];
      const result = fileTypeChecker.detectFileOption(file, { chunkSize: 32 });
      const detectedFile = F.pipe(result, O.getOrThrow);

      strictEqual(detectedFile.extension, "png");
      strictEqual(detectedFile.mimeType, "image/png");
      deepStrictEqual(detectedFile.signature.sequence, ["89", "50", "4e", "47", "d", "a", "1a", "a"]);
    })
  );
});
