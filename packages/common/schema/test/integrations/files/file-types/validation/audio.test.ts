import { fileTypeChecker } from "@beep/schema/integrations/files";
import { assertFalse, assertTrue, describe, effect } from "@beep/testkit";
import * as Effect from "effect/Effect";

describe("validateFileType", () => {
  effect(
    "should return true when given an m4a file and using isAAC() without excluding similar files",
    Effect.fn(function* () {
      const file: Array<number> = [
        0, 0, 0, 24, 102, 116, 121, 112, 77, 52, 65, 32, 0, 0, 2, 0, 105, 115, 111, 109, 105, 115, 111, 50, 0, 0, 0, 8,
        102, 114, 101, 101,
      ];
      const detectedFile = fileTypeChecker.isAAC(file);

      assertTrue(detectedFile);
    })
  );

  effect(
    "should return false when given an m4a file and using isAAC() with excluding similar files",
    Effect.fn(function* () {
      const file: Array<number> = [
        0, 0, 0, 24, 102, 116, 121, 112, 77, 52, 65, 32, 0, 0, 2, 0, 105, 115, 111, 109, 105, 115, 111, 50, 0, 0, 0, 8,
        102, 114, 101, 101,
      ];
      const detectedFile = fileTypeChecker.isAAC(file, {
        excludeSimilarTypes: true,
      });

      assertFalse(detectedFile);
    })
  );
});
