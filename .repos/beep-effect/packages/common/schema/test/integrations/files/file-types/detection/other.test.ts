import { fileTypeChecker } from "@beep/schema/integrations/files";
import { deepStrictEqual, describe, effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";

describe("detectFileOption", () => {
  effect(
    "should detect the file type of an Array<number> as a orc file",
    Effect.fn(function* () {
      const file: ReadonlyArray<number> = [
        79, 82, 67, 10, 5, 18, 3, 8, 136, 39, 10, 21, 10, 2, 0, 0, 18, 15, 8, 136, 39, 18, 10, 8, 2, 16, 144, 78, 24,
        200, 151, 246, 11, 10, 20, 10, 2, 0, 0, 18, 14, 8, 136, 39, 34, 9,
      ];
      const result = fileTypeChecker.detectFileOption(file);
      const detectedFile = F.pipe(result, O.getOrThrow);

      strictEqual(detectedFile.extension, "orc");
      strictEqual(detectedFile.mimeType, "application/x-orc");
      deepStrictEqual(detectedFile.signature.sequence, ["4f", "52", "43"]);
    })
  );

  effect(
    "should detect the file type of an Array<number> as a parquet file",
    Effect.fn(function* () {
      const file: ReadonlyArray<number> = [
        80, 65, 82, 49, 21, 0, 21, 238, 45, 21, 128, 20, 44, 21, 220, 5, 21, 0, 21, 6, 21, 6, 0, 0, 247, 22, 28, 3, 0,
        0, 0, 220,
      ];
      const result = fileTypeChecker.detectFileOption(file);
      const detectedFile = F.pipe(result, O.getOrThrow);

      strictEqual(detectedFile.extension, "parquet");
      strictEqual(detectedFile.mimeType, "application/vnd.apache.parquet");
      deepStrictEqual(detectedFile.signature.sequence, ["50", "41", "52", "31"]);
    })
  );

  effect(
    "should detect the file type of an Array<number> as a doc file",
    Effect.fn(function* () {
      const file: ReadonlyArray<number> = [
        208, 207, 17, 224, 161, 177, 26, 225, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 59, 0, 3, 0, 254, 255, 9,
        0,
      ];
      const result = fileTypeChecker.detectFileOption(file);
      const detectedFile = F.pipe(result, O.getOrThrow);

      strictEqual(detectedFile.extension, "doc");
      strictEqual(detectedFile.mimeType, "application/msword");
      deepStrictEqual(detectedFile.signature.sequence, ["d0", "cf", "11", "e0", "a1", "b1", "1a", "e1"]);
    })
  );

  effect(
    "should detect the file type of an Array<number> as a pcap file",
    Effect.fn(function* () {
      const file: ReadonlyArray<number> = [
        212, 195, 178, 161, 2, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 0, 0, 1, 0, 0, 0, 72, 244, 159, 69, 105, 94,
        3, 0,
      ];
      const result = fileTypeChecker.detectFileOption(file);
      const detectedFile = F.pipe(result, O.getOrThrow);

      strictEqual(detectedFile.extension, "pcap");
      strictEqual(detectedFile.mimeType, "application/vnd.tcpdump.pcap");
      deepStrictEqual(detectedFile.signature.sequence, ["d4", "c3", "b2", "a1"]);
    })
  );

  effect(
    "should detect the file type of an Array<number> as an exe file",
    Effect.fn(function* () {
      const file: ReadonlyArray<number> = [
        77, 90, 144, 0, 3, 0, 0, 0, 4, 0, 0, 0, 255, 255, 0, 0, 184, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0,
      ];
      const result = fileTypeChecker.detectFileOption(file);
      const detectedFile = F.pipe(result, O.getOrThrow);

      strictEqual(detectedFile.extension, "exe");
      strictEqual(detectedFile.mimeType, "application/x-msdownload");
      deepStrictEqual(detectedFile.signature.sequence, ["4d", "5a"]);
    })
  );

  effect(
    "should detect the file type of an Array<number> as an mach-o file",
    Effect.fn(function* () {
      const file: ReadonlyArray<number> = [
        207, 250, 237, 254, 7, 0, 0, 1, 3, 0, 0, 128, 2, 0, 0, 0, 16, 0, 0, 0, 216, 7, 0, 0, 133, 0, 32, 0, 0, 0, 0, 0,
      ];
      const result = fileTypeChecker.detectFileOption(file);
      const detectedFile = F.pipe(result, O.getOrThrow);

      strictEqual(detectedFile.extension, "macho");
      strictEqual(detectedFile.mimeType, "application/x-mach-binary");
      deepStrictEqual(detectedFile.signature.sequence, ["cf", "fa", "ed", "fe"]);
    })
  );
});
