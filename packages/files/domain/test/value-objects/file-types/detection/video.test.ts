import { describe, expect, it } from "bun:test";
import type { UnsafeTypes } from "@beep/types";
import type { DetectedFileInfo } from "../../../../src/value-objects";
import { fileTypeChecker } from "../../../../src/value-objects";

describe("detectFile", () => {
  it("should detect the file type of an Array<number> as a png file", () => {
    const fileArrayNumber: Array<number> = [
      137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 4, 0, 0, 0, 1, 244, 8, 6, 0, 0, 0, 163, 38,
      95, 43, 0, 0, 0, 9, 112, 72, 89, 115, 0, 0, 46, 35, 0, 0, 46, 35, 1, 120, 165, 63, 118, 0, 0, 0, 1, 115, 82, 71,
      66, 0, 174,
    ];
    const detectedFile = fileTypeChecker.detectFile(fileArrayNumber) as DetectedFileInfo;
    expect(detectedFile.extension).toBe("png");
    expect(detectedFile.mimeType).toBe("image/png");
    expect(detectedFile.signature.sequence).toEqual(["89", "50", "4e", "47", "d", "a", "1a", "a"]);
  });

  it("should detect the file type of an ArrayBuffer as a png file", () => {
    const fileArrayBuffer = new Uint8Array([
      137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 4, 0, 0, 0, 1, 244, 8, 6, 0, 0, 0, 163, 38,
      95, 43, 0, 0, 0, 9, 112, 72, 89, 115, 0, 0, 46, 35, 0, 0, 46, 35, 1, 120, 165, 63, 118, 0, 0, 0, 1, 115, 82, 71,
      66, 0, 174,
    ]).buffer;
    const detectedFile = fileTypeChecker.detectFile(fileArrayBuffer) as DetectedFileInfo;
    expect(detectedFile.extension).toBe("png");
    expect(detectedFile.mimeType).toBe("image/png");
    expect(detectedFile.signature.sequence).toEqual(["89", "50", "4e", "47", "d", "a", "1a", "a"]);
  });

  it("should detect the file type of a fileUint8Array as a png file", () => {
    const fileUint8Array = new Uint8Array([
      137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 4, 0, 0, 0, 1, 244, 8, 6, 0, 0, 0, 163, 38,
      95, 43, 0, 0, 0, 9, 112, 72, 89, 115, 0, 0, 46, 35, 0, 0, 46, 35, 1, 120, 165, 63, 118, 0, 0, 0, 1, 115, 82, 71,
      66, 0, 174,
    ]);
    const detectedFile = fileTypeChecker.detectFile(fileUint8Array) as DetectedFileInfo;
    expect(detectedFile.extension).toBe("png");
    expect(detectedFile.mimeType).toBe("image/png");
    expect(detectedFile.signature.sequence).toEqual(["89", "50", "4e", "47", "d", "a", "1a", "a"]);
  });

  it("should return undefined if no file type is detected", () => {
    const file = [1, 2, 3, 4, 5];
    const detectedFile = fileTypeChecker.detectFile(file);
    expect(detectedFile).toBeUndefined();
  });

  it("should throw a TypeError if the file type is not valid", () => {
    const file: UnsafeTypes.UnsafeAny = "10";
    const func = () => {
      fileTypeChecker.detectFile(file);
    };
    expect(func).toThrow(TypeError);
  });

  it("should return undefined if the Array<number> file is empty", () => {
    const file: Array<number> = [];
    const detectedFile = fileTypeChecker.detectFile(file);
    expect(detectedFile).toBeUndefined();
  });

  it("should return undefined if chunkSize is too short", () => {
    const file: Array<number> = [
      137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 4, 0, 0, 0, 1, 244, 8, 6, 0, 0, 0, 163, 38,
      95, 43, 0, 0, 0, 9, 112, 72, 89, 115, 0, 0, 46, 35, 0, 0, 46, 35, 1, 120, 165, 63, 118, 0, 0, 0, 1, 115, 82, 71,
      66, 0, 174,
    ];
    const detectedFile = fileTypeChecker.detectFile(file, { chunkSize: 4 });
    expect(detectedFile).toBeUndefined();
  });

  it("should throw a RangeError if chunkSize is zero", () => {
    const file: Array<number> = [
      137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 4, 0, 0, 0, 1, 244, 8, 6, 0, 0, 0, 163, 38,
      95, 43, 0, 0, 0, 9, 112, 72, 89, 115, 0, 0, 46, 35, 0, 0, 46, 35, 1, 120, 165, 63, 118, 0, 0, 0, 1, 115, 82, 71,
      66, 0, 174,
    ];
    const func = () => {
      fileTypeChecker.detectFile(file, { chunkSize: 0 });
    };
    expect(func).toThrow(RangeError);
  });

  it("should throw a RangeError if chunkSize is less than zero", () => {
    const file: Array<number> = [
      137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 4, 0, 0, 0, 1, 244, 8, 6, 0, 0, 0, 163, 38,
      95, 43, 0, 0, 0, 9, 112, 72, 89, 115, 0, 0, 46, 35, 0, 0, 46, 35, 1, 120, 165, 63, 118, 0, 0, 0, 1, 115, 82, 71,
      66, 0, 174,
    ];
    const func = () => {
      fileTypeChecker.detectFile(file, { chunkSize: 0 });
    };
    expect(func).toThrow(RangeError);
  });

  it("should detect the file type of an Array<number> as a png file and chunkSize of 32 bytes", () => {
    const file: Array<number> = [
      137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 4, 0, 0, 0, 1, 244, 8, 6, 0, 0, 0, 163, 38,
      95, 43, 0, 0, 0, 9, 112, 72, 89, 115, 0, 0, 46, 35, 0, 0, 46, 35, 1, 120, 165, 63, 118, 0, 0, 0, 1, 115, 82, 71,
      66, 0, 174,
    ];
    const detectedFile = fileTypeChecker.detectFile(file, {
      chunkSize: 32,
    }) as DetectedFileInfo;
    expect(detectedFile.extension).toBe("png");
    expect(detectedFile.mimeType).toBe("image/png");
    expect(detectedFile.signature.sequence).toEqual(["89", "50", "4e", "47", "d", "a", "1a", "a"]);
  });
});
