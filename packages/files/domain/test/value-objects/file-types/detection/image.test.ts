import { describe, expect, it } from "bun:test";
import type { DetectedFileInfo } from "../../../../src/value-objects";
import { fileTypeChecker } from "../../../../src/value-objects";

describe("detectFile", () => {
  it("should detect the file type of an Array<number> as a avif file", () => {
    const file: Array<number> = [0, 0, 0, 20, 102, 116, 121, 112, 97, 118, 105, 102, 0, 0];
    const detectedFile = fileTypeChecker.detectFile(file) as DetectedFileInfo.Type;
    expect(detectedFile.extension).toBe("avif");
    expect(detectedFile.mimeType).toBe("image/avif");
    expect(detectedFile.signature.sequence).toEqual(["0", "0", "0"]);
  });

  it("should detect the file type of an ArrayBuffer as a avif file", () => {
    const file: Array<number> = [0, 0, 0, 20, 102, 116, 121, 112, 97, 118, 105, 102, 0, 0];
    const buffer: ArrayBuffer = new Uint8Array(file).buffer;
    const detectedFile = fileTypeChecker.detectFile(buffer) as DetectedFileInfo.Type;
    expect(detectedFile.extension).toBe("avif");
    expect(detectedFile.mimeType).toBe("image/avif");
    expect(detectedFile.signature.sequence).toEqual(["0", "0", "0"]);
  });

  it("should not detect a corrupted Array<number> of an avif file which does not include the 'ftypavif' string", () => {
    const file: Array<number> = [0, 0, 0, 20, 102, 114, 121, 112, 97, 118, 105, 102, 0, 0];
    const detectedFile = fileTypeChecker.detectFile(file) as DetectedFileInfo.Type;
    expect(detectedFile).toBeUndefined();
  });

  it("should not detect a m4v file as a heic file, given an Array<number> of an m4v file (since heic files contain the m4v signature within their own signature)", () => {
    const file: Array<number> = [
      0, 0, 0, 0, 0x66, 0x74, 0x79, 0x70, 0x6d, 0x70, 0x34, 0x32, 0, 0, 0, 32, 102, 116, 121, 112, 77, 52, 86, 72, 0, 0,
      0, 1, 77, 52, 86, 72, 77, 52, 65, 32, 109, 112, 52, 50, 105, 115, 111, 109,
    ];

    const detectedFile = fileTypeChecker.detectFile(file) as DetectedFileInfo;
    expect(detectedFile.extension).toBe("m4v");
  });

  it("should detect the file type of an Array<number> as a heic file", () => {
    const file: Array<number> = [
      0, 0, 0, 24, 0x66, 0x74, 0x79, 0x70, 0x6d, 105, 102, 49, 0, 0, 0, 0, 109, 105, 102, 49, 104, 101, 105, 99, 0, 0,
      1, 254, 109, 101, 116, 97, 0, 0, 0, 0, 0, 0, 0, 33, 104, 100, 108,
    ];

    const detectedFile = fileTypeChecker.detectFile(file) as DetectedFileInfo.Type;
    expect(detectedFile.extension).toBe("heic");
    expect(detectedFile.mimeType).toBe("image/heic");
  });
});
