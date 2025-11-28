import { describe, expect, it } from "bun:test";
import type { UnsafeTypes } from "@beep/types";
import { fileTypeChecker } from "../../../../src/value-objects";

describe("validateFileType", () => {
  it("should return true when given an Array<number> of a png file and a list of accepted types that contains its type", () => {
    const fileArrayNumber: Array<number> = [
      137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 4, 0, 0, 0, 1, 244, 8, 6, 0, 0, 0, 163, 38,
      95, 43, 0, 0, 0, 9, 112, 72, 89, 115, 0, 0, 46, 35, 0, 0, 46, 35, 1, 120, 165, 63, 118, 0, 0, 0, 1, 115, 82, 71,
      66, 0, 174,
    ];
    const detectedFile: boolean = fileTypeChecker.validateFileType(fileArrayNumber, ["gif", "jpeg", "png"]);
    expect(detectedFile).toBeTruthy();
  });

  it("should return false when given an Array<number> of a png file and a list of accepted types that not contains its type", () => {
    const fileArrayNumber: Array<number> = [
      137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 4, 0, 0, 0, 1, 244, 8, 6, 0, 0, 0, 163, 38,
      95, 43, 0, 0, 0, 9, 112, 72, 89, 115, 0, 0, 46, 35, 0, 0, 46, 35, 1, 120, 165, 63, 118, 0, 0, 0, 1, 115, 82, 71,
      66, 0, 174,
    ];
    const detectedFile: boolean = fileTypeChecker.validateFileType(fileArrayNumber, ["gif", "jpeg"]);
    expect(detectedFile).toBeFalsy();
  });

  it("should return true when given an ArrayBuffer of a png file and a list of accepted types that contains its type", () => {
    const fileUint8Array = new Uint8Array([
      137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 4, 0, 0, 0, 1, 244, 8, 6, 0, 0, 0, 163, 38,
      95, 43, 0, 0, 0, 9, 112, 72, 89, 115, 0, 0, 46, 35, 0, 0, 46, 35, 1, 120, 165, 63, 118, 0, 0, 0, 1, 115, 82, 71,
      66, 0, 174,
    ]).buffer;
    const detectedFile: boolean = fileTypeChecker.validateFileType(fileUint8Array, ["gif", "jpeg", "png"]);
    expect(detectedFile).toBeTruthy();
  });

  it("should return false when given an ArrayBuffer of a png file and a list of accepted types that not contains its type", () => {
    const fileUint8Array = new Uint8Array([
      137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 4, 0, 0, 0, 1, 244, 8, 6, 0, 0, 0, 163, 38,
      95, 43, 0, 0, 0, 9, 112, 72, 89, 115, 0, 0, 46, 35, 0, 0, 46, 35, 1, 120, 165, 63, 118, 0, 0, 0, 1, 115, 82, 71,
      66, 0, 174,
    ]).buffer;
    const detectedFile: boolean = fileTypeChecker.validateFileType(fileUint8Array, ["gif", "jpeg"]);
    expect(detectedFile).toBeFalsy();
  });

  it("should return true when given an Uint8Array of a png file and a list of accepted types that contains its type", () => {
    const fileUint8Array = new Uint8Array([
      137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 4, 0, 0, 0, 1, 244, 8, 6, 0, 0, 0, 163, 38,
      95, 43, 0, 0, 0, 9, 112, 72, 89, 115, 0, 0, 46, 35, 0, 0, 46, 35, 1, 120, 165, 63, 118, 0, 0, 0, 1, 115, 82, 71,
      66, 0, 174,
    ]);
    const detectedFile: boolean = fileTypeChecker.validateFileType(fileUint8Array, ["gif", "jpeg", "png"]);
    expect(detectedFile).toBeTruthy();
  });

  it("should return false when given an Uint8Array of a png file and a list of accepted types that not contains its type", () => {
    const fileUint8Array = new Uint8Array([
      137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 4, 0, 0, 0, 1, 244, 8, 6, 0, 0, 0, 163, 38,
      95, 43, 0, 0, 0, 9, 112, 72, 89, 115, 0, 0, 46, 35, 0, 0, 46, 35, 1, 120, 165, 63, 118, 0, 0, 0, 1, 115, 82, 71,
      66, 0, 174,
    ]);
    const detectedFile: boolean = fileTypeChecker.validateFileType(fileUint8Array, ["gif", "jpeg"]);
    expect(detectedFile).toBeFalsy();
  });

  it("should return false when given an Array<number> of a png file and an empty list of accepted types", () => {
    const file: Array<number> = [
      137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 4, 0, 0, 0, 1, 244, 8, 6, 0, 0, 0, 163, 38,
      95, 43, 0, 0, 0, 9, 112, 72, 89, 115, 0, 0, 46, 35, 0, 0, 46, 35, 1, 120, 165, 63, 118, 0, 0, 0, 1, 115, 82, 71,
      66, 0, 174,
    ];
    const detectedFile: boolean = fileTypeChecker.validateFileType(file, []);
    expect(detectedFile).toBeFalsy();
  });

  it("should throw an error when given a corrupted Array<number>", () => {
    const file: UnsafeTypes.UnsafeAny = [
      null,
      80,
      78,
      71,
      13,
      10,
      26,
      null,
      0,
      0,
      0,
      null,
      73,
      72,
      68,
      82,
      0,
      0,
      null,
      0,
      0,
      89,
      115,
      0,
      0,
      `46`,
      35,
      0,
      0,
      true,
      35,
      1,
      120,
      165,
      63,
      false,
      0,
      0,
      "0",
      1,
      115,
      82,
      71,
      66,
      0,
      174,
    ];

    const func = () => {
      fileTypeChecker.validateFileType(file, ["png", "jpeg"]);
    };
    expect(func).toThrow(TypeError);
  });

  it("should throw an error when given an unsupported file type in the list of accepted types", () => {
    const file: Array<number> = [
      137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 4, 0, 0, 0, 1, 244, 8, 6, 0, 0, 0, 163, 38,
      95, 43, 0, 0, 0, 9, 112, 72, 89, 115, 0, 0, 46, 35, 0, 0, 46, 35, 1, 120, 165, 63, 118, 0, 0, 0, 1, 115, 82, 71,
      66, 0, 174,
    ];
    const func = () => {
      fileTypeChecker.validateFileType(file, [
        "gifz",
        "mp4",
        "avi",
        "png",
        "wavb", // intentional typo
      ]);
    };
    expect(func).toThrow(TypeError);
  });

  it("should return true when given an Array<number> of a png file and a list of accepted types that contains a duplicates of its type", () => {
    const file: Array<number> = [
      137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 4, 0, 0, 0, 1, 244, 8, 6, 0, 0, 0, 163, 38,
      95, 43, 0, 0, 0, 9, 112, 72, 89, 115, 0, 0, 46, 35, 0, 0, 46, 35, 1, 120, 165, 63, 118, 0, 0, 0, 1, 115, 82, 71,
      66, 0, 174,
    ];
    const detectedFile: boolean = fileTypeChecker.validateFileType(file, ["gif", "mp4", "png", "avi", "png"]);
    expect(detectedFile).toBeTruthy();
  });

  it("should return true when given an Array<number> of a mkv file and a list that contains its type without 'webm''", () => {
    const file: Array<number> = [
      26, 69, 223, 163, 163, 66, 134, 129, 1, 66, 247, 129, 1, 66, 242, 129, 4, 66, 243, 129, 8, 66, 130, 136, 109, 97,
      116, 114, 111, 115, 107, 97, 66, 135, 129, 4, 66, 133, 129, 2, 24, 83, 128, 103, 1, 0, 0, 0, 0, 74, 238, 203, 17,
      77, 155, 116, 193, 191, 132, 254, 50, 76, 130, 77,
    ];
    const detectedFile: boolean = fileTypeChecker.validateFileType(file, ["mkv", "gif"]);
    expect(detectedFile).toBeTruthy();
  });

  it("should return false when given an Array<number> of a mkv file and a list that contains 'webm' without 'mkv'", () => {
    const file: Array<number> = [
      26, 69, 223, 163, 163, 66, 134, 129, 1, 66, 247, 129, 1, 66, 242, 129, 4, 66, 243, 129, 8, 66, 130, 136, 109, 97,
      116, 114, 111, 115, 107, 97, 66, 135, 129, 4, 66, 133, 129, 2, 24, 83, 128, 103, 1, 0, 0, 0, 0, 74, 238, 203, 17,
      77, 155, 116, 193, 191, 132, 254, 50, 76, 130, 77,
    ];
    const detectedFile: boolean = fileTypeChecker.validateFileType(file, ["webm", "gif"]);
    expect(detectedFile).toBeFalsy();
  });

  it("should return true when given an Array<number> of a webm file and a list that contains 'webm' without 'mkv'", () => {
    const file: Array<number> = [
      26, 69, 223, 163, 159, 66, 134, 129, 1, 66, 247, 129, 1, 66, 242, 129, 4, 66, 243, 129, 8, 66, 130, 132, 119, 101,
      98, 109, 66, 135, 129, 2, 66, 133, 129, 2, 24, 83, 128, 103, 1, 0, 0, 0, 0, 128, 92, 20, 17, 77, 155, 116, 187,
      77, 187, 139, 83, 171, 132, 21, 73, 169, 102, 83,
    ];
    const detectedFile: boolean = fileTypeChecker.validateFileType(file, ["webm", "gif"]);
    expect(detectedFile).toBeTruthy();
  });

  it("should return false when given an Array<number> of a webm file and a list that contains 'mkv' without 'webm'", () => {
    const file: Array<number> = [
      26, 69, 223, 163, 159, 66, 134, 129, 1, 66, 247, 129, 1, 66, 242, 129, 4, 66, 243, 129, 8, 66, 130, 132, 119, 101,
      98, 109, 66, 135, 129, 2, 66, 133, 129, 2, 24, 83, 128, 103, 1, 0, 0, 0, 0, 128, 92, 20, 17, 77, 155, 116, 187,
      77, 187, 139, 83, 171, 132, 21, 73, 169, 102, 83,
    ];
    const detectedFile: boolean = fileTypeChecker.validateFileType(file, ["mkv", "gif"]);
    expect(detectedFile).toBeFalsy();
  });

  it("should return true when given an Array<number> of a m4v file and a list that contains 'm4v' without 'flv'", () => {
    const file: Array<number> = [
      26, 69, 223, 163, 159, 66, 134, 129, 1, 66, 247, 129, 1, 66, 242, 129, 4, 66, 243, 129, 8, 66, 130, 132, 119, 101,
      98, 109, 66, 135, 129, 2, 66, 133, 129, 2, 24, 83, 128, 103, 1, 0, 0, 0, 0, 128, 92, 20, 17, 77, 155, 116, 187,
      77, 187, 139, 83, 171, 132, 21, 73, 169, 102, 83,
    ];
    const detectedFile: boolean = fileTypeChecker.validateFileType(file, ["webm", "m4v"]);
    expect(detectedFile).toBeTruthy();
  });

  it("should return false when given an Array<number> of a m4v file and a list that contains 'flv' without 'm4v'", () => {
    const file: Array<number> = [
      26, 69, 223, 163, 159, 66, 134, 129, 1, 66, 247, 129, 1, 66, 242, 129, 4, 66, 243, 129, 8, 66, 130, 132, 119, 101,
      98, 109, 66, 135, 129, 2, 66, 133, 129, 2, 24, 83, 128, 103, 1, 0, 0, 0, 0, 128, 92, 20, 17, 77, 155, 116, 187,
      77, 187, 139, 83, 171, 132, 21, 73, 169, 102, 83,
    ];
    const detectedFile: boolean = fileTypeChecker.validateFileType(file, ["flv", "gif"]);
    expect(detectedFile).toBeFalsy();
  });

  it("should return true when given an Array<number> of a m4a file and a list that contains 'aac' (very similar to m4a)'", () => {
    const file: Array<number> = [
      0, 0, 0, 24, 102, 116, 121, 112, 77, 52, 65, 32, 0, 0, 2, 0, 105, 115, 111, 109, 105, 115, 111, 50, 0, 0, 0, 8,
      102, 114, 101, 101,
    ];
    const detectedFile: boolean = fileTypeChecker.validateFileType(file, ["aac", "gif"]);
    expect(detectedFile).toBeTruthy();
  });

  it("should return false when given an Array<number> of a m4a file and a list that contains 'aac' (very similar to m4a)' and 'excludeSimilarTypes' is true", () => {
    const file: Array<number> = [
      0, 0, 0, 24, 102, 116, 121, 112, 77, 52, 65, 32, 0, 0, 2, 0, 105, 115, 111, 109, 105, 115, 111, 50, 0, 0, 0, 8,
      102, 114, 101, 101,
    ];
    const detectedFile: boolean = fileTypeChecker.validateFileType(file, ["aac", "gif"], { excludeSimilarTypes: true });
    expect(detectedFile).toBeFalsy();
  });
});

it("should return false when validating an m4v file signature that shares the same signature as a heic file, with only 'heic' as the accepted type", () => {
  const fileArrayNumber: Array<number> = [
    0, 0, 0, 0, 0x66, 0x74, 0x79, 0x70, 0x6d, 0x70, 0x34, 0x32, 0, 0, 0, 32, 102, 116, 121, 112, 77, 52, 86, 72, 0, 0,
    0, 1, 77, 52, 86, 72, 77, 52, 65, 32, 109, 112, 52, 50, 105, 115, 111, 109,
  ];

  const isM4v: boolean = fileTypeChecker.validateFileType(fileArrayNumber, ["heic"]);
  expect(isM4v).toBeFalsy();
});

it("should return true when validating an m4v file signature with 'm4v' as the accepted type", () => {
  const fileArrayNumber: Array<number> = [
    0, 0, 0, 0, 0x66, 0x74, 0x79, 0x70, 0x6d, 0x70, 0x34, 0x32, 0, 0, 0, 32, 102, 116, 121, 112, 77, 52, 86, 72, 0, 0,
    0, 1, 77, 52, 86, 72, 77, 52, 65, 32, 109, 112, 52, 50, 105, 115, 111, 109,
  ];

  const isM4v: boolean = fileTypeChecker.validateFileType(fileArrayNumber, ["m4v"]);
  expect(isM4v).toBeTruthy();
});
