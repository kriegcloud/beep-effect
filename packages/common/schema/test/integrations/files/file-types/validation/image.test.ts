import { fileTypeChecker } from "@beep/schema/integrations/files";
import { assertFalse, assertTrue, describe, effect } from "@beep/testkit";
import * as Effect from "effect/Effect";

describe("image validation", () => {
  effect(
    "should return false for a corrupted Array<number> of an avif file which does not include the 'ftypavif' string",
    () =>
      Effect.gen(function* () {
        const fileArrayNumber: Array<number> = [0, 0, 0, 20, 66, 74, 79, 72, 61, 76, 69, 66, 0, 0];
        const detectedFile = fileTypeChecker.isAVIF(fileArrayNumber);

        assertFalse(detectedFile);
      })
  );

  effect("should detect the type of a given Array<number> to be a bmp file",
    Effect.fn(function* () {
      const fileArrayNumber: Array<number> = [
        66, 77, 138, 123, 12, 0, 0, 0, 0, 0, 138, 0, 0, 0, 124, 0, 0, 0, 128, 2, 0, 0, 170, 1, 0, 0, 1, 0, 24, 0, 0, 0,
        0, 0, 0, 123, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 0, 0, 255, 0, 0, 255, 0,
      ];
      const detectedFile = fileTypeChecker.isBMP(fileArrayNumber);

      assertTrue(detectedFile);
    })
  );

  effect("should detect the type of a given Array<number> to be a avif file",
    Effect.fn(function* () {
      const fileArrayNumber: Array<number> = [0, 0, 0, 20, 102, 116, 121, 112, 97, 118, 105, 102, 0, 0];
      const detectedFile = fileTypeChecker.isAVIF(fileArrayNumber);

      assertTrue(detectedFile);
    })
  );

  effect("should return false for a corrupted avif file signature",
    Effect.fn(function* () {
      const fileArrayNumber: Array<number> = [0, 0, 0, 20, 66, 74, 79, 72, 61, 76, 69, 66, 0, 0];
      const detectedFile = fileTypeChecker.isAVIF(fileArrayNumber);

      assertFalse(detectedFile);
    })
  );

  effect("should return false when given an m4v file and checking for HEIC",
    Effect.fn(function* () {
      // heic files contain the m4v signature within their own signature
      const fileArrayNumber: Array<number> = [
        0, 0, 0, 0, 0x66, 0x74, 0x79, 0x70, 0x6d, 0x70, 0x34, 0x32, 0, 0, 0, 32, 102, 116, 121, 112, 77, 52, 86, 72, 0,
        0, 0, 1, 77, 52, 86, 72, 77, 52, 65, 32, 109, 112, 52, 50, 105, 115, 111, 109,
      ];

      const isHEIC = fileTypeChecker.isHEIC(fileArrayNumber);

      assertFalse(isHEIC);
    })
  );

  effect("should return true when given an Array<number> of a heic file and using the isHEIC() function",
    Effect.fn(function* () {
      const fileArrayNumber: Array<number> = [
        0, 0, 0, 24, 0x66, 0x74, 0x79, 0x70, 0x6d, 105, 102, 49, 0, 0, 0, 0, 109, 105, 102, 49, 104, 101, 105, 99, 0, 0,
        1, 254, 109, 101, 116, 97, 0, 0, 0, 0, 0, 0, 0, 33, 104, 100, 108,
      ];

      const isHEIC = fileTypeChecker.isHEIC(fileArrayNumber);

      assertTrue(isHEIC);
    })
  );
});
