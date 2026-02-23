import { describe, expect, it } from "bun:test";
import { fileTypeChecker } from "@beep/schema/integrations/files";

describe("validateFileType", () => {
  it("should return true when given an Array<number> of a m4v file and using the isMP4() function without excluding similar files", () => {
    const fileArrayNumber: Array<number> = [
      0, 0, 0, 0, 0x66, 0x74, 0x79, 0x70, 0x6d, 0x70, 0x34, 0x32, 0, 0, 0, 32, 102, 116, 121, 112, 77, 52, 86, 72, 0, 0,
      0, 1, 77, 52, 86, 72, 77, 52, 65, 32, 109, 112, 52, 50, 105, 115, 111, 109,
    ];

    const isMp4: boolean = fileTypeChecker.isMP4(fileArrayNumber);
    expect(isMp4).toBeTruthy();
  });

  it("should return false when given an Array<number> of a m4v file and using the isMP4() function with excluding similar files", () => {
    const fileArrayNumber: Array<number> = [
      0, 0, 0, 0, 0x66, 0x74, 0x79, 0x70, 0x6d, 0x70, 0x34, 0x32, 0, 0, 0, 32, 102, 116, 121, 112, 77, 52, 86, 72, 0, 0,
      0, 1, 77, 52, 86, 72, 77, 52, 65, 32, 109, 112, 52, 50, 105, 115, 111, 109,
    ];

    const isMp4: boolean = fileTypeChecker.isMP4(fileArrayNumber, {
      excludeSimilarTypes: true,
    });
    expect(isMp4).toBeFalsy();
  });

  it("should return true when given an Array<number> of a mp4 file and using the validateFileType() function with excluding similar files", () => {
    const fileArrayNumber: Array<number> = [
      0, 0, 0, 32, 102, 116, 121, 112, 105, 115, 111, 109, 0, 0, 2, 0, 105, 115, 111, 109, 105, 115, 111, 50, 97, 118,
      99, 49, 109, 112, 52, 49,
    ];

    const isMp4: boolean = fileTypeChecker.validateFileType(fileArrayNumber, ["mp4"], {
      excludeSimilarTypes: true,
    });
    expect(isMp4).toBeTruthy();
  });

  it("should return true when given an Array<number> of a avi file and using the isAVI()", () => {
    const fileArrayNumber: Array<number> = [
      82, 73, 70, 70, 226, 213, 22, 0, 65, 86, 73, 32, 76, 73, 83, 84, 192, 0, 0, 0, 104, 100, 114, 108, 97, 118, 105,
      104, 56, 0, 0, 0,
    ];

    const isAvi: boolean = fileTypeChecker.isAVI(fileArrayNumber);
    expect(isAvi).toBeTruthy();
  });
});
