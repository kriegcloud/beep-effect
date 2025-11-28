import { describe, expect, it } from "bun:test";
import { fileTypeChecker } from "../../../../src/value-objects";

describe("validateFileType", () => {
  it("should return true when given an Array<number> of a m4a file and using the isAAC() function without excluding similar files", () => {
    const file: Array<number> = [
      0, 0, 0, 24, 102, 116, 121, 112, 77, 52, 65, 32, 0, 0, 2, 0, 105, 115, 111, 109, 105, 115, 111, 50, 0, 0, 0, 8,
      102, 114, 101, 101,
    ];
    const detectedFile: boolean = fileTypeChecker.isAAC(file);
    expect(detectedFile).toBeTruthy();
  });

  it("should return false when given an Array<number> of a m4a file and using the isAAC() function with excluding similar files", () => {
    const file: Array<number> = [
      0, 0, 0, 24, 102, 116, 121, 112, 77, 52, 65, 32, 0, 0, 2, 0, 105, 115, 111, 109, 105, 115, 111, 50, 0, 0, 0, 8,
      102, 114, 101, 101,
    ];
    const detectedFile: boolean = fileTypeChecker.isAAC(file, {
      excludeSimilarTypes: true,
    });
    expect(detectedFile).toBeFalsy();
  });
});
