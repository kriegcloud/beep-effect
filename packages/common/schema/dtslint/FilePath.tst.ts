import {
  FilePath,
  type FilePath as FilePathType,
  type SupportedPathFamily,
  type SupportedPathFamily as SupportedPathFamilyType,
  type ValidWindowsPathSegment as ValidWindowsPathSegmentType,
  type ValidWindowsRootSegment as ValidWindowsRootSegmentType,
  type ValidWindowsUncSegments,
  type ValidWindowsUncSegments as ValidWindowsUncSegmentsType,
  type WindowsDotSegment,
  type WindowsDotSegment as WindowsDotSegmentType,
  WindowsDrivePath,
  type WindowsDrivePath as WindowsDrivePathType,
  type WindowsSegments,
  type WindowsSegments as WindowsSegmentsType,
} from "@beep/schema";
import type * as Brand from "effect/Brand";
import * as S from "effect/Schema";
import { describe, expect, it } from "tstyche";

describe("FilePath", () => {
  it("preserves the branded schema surface", () => {
    expect<typeof FilePath.Type>().type.toBe<string & Brand.Brand<"FilePath">>();
    expect<typeof FilePath.Encoded>().type.toBe<string>();
    expect<FilePathType>().type.toBe<string & Brand.Brand<"FilePath">>();
  });

  it("exposes decode helpers that produce the branded type", () => {
    const decode = S.decodeSync(FilePath);
    const decoded = decode("./folder/file.txt");

    expect(decoded).type.toBe<FilePathType>();
  });

  it("exposes a guard that narrows to the branded type", () => {
    const isFilePath = S.is(FilePath);
    const value: unknown = "./folder/file.txt";

    if (isFilePath(value)) {
      expect(value).type.toBe<FilePathType>();
    }
  });

  it("integrates into object schemas with a filePath property", () => {
    const Payload = S.Struct({
      filePath: FilePath,
    });
    const decode = S.decodeUnknownSync(Payload);
    const payload = decode({ filePath: "./folder/file.txt" });

    expect<typeof Payload.Type>().type.toBe<Readonly<{ filePath: FilePathType }>>();
    expect<typeof Payload.Encoded>().type.toBe<Readonly<{ filePath: string }>>();
    expect(payload).type.toBe<Readonly<{ filePath: FilePathType }>>();
  });
});

describe("FilePath part schema surfaces", () => {
  it("keeps literal unions unbranded", () => {
    expect<typeof SupportedPathFamily.Type>().type.toBe<
      "posixAbsolute" | "posixRelative" | "windowsDrive" | "windowsUnc" | "windowsRelative"
    >();
    expect<SupportedPathFamilyType>().type.toBe<
      "posixAbsolute" | "posixRelative" | "windowsDrive" | "windowsUnc" | "windowsRelative"
    >();

    expect<typeof WindowsDotSegment.Type>().type.toBe<"." | "..">();
    expect<WindowsDotSegmentType>().type.toBe<"." | "..">();
  });

  it("brands the Windows path string schemas", () => {
    expect<typeof WindowsDrivePath.Type>().type.toBe<string & Brand.Brand<"WindowsDrivePath">>();
    expect<WindowsDrivePathType>().type.toBe<string & Brand.Brand<"WindowsDrivePath">>();

    const decode = S.decodeSync(WindowsDrivePath);
    const decoded = decode("C:\\folder\\file.txt");

    expect(decoded).type.toBe<WindowsDrivePathType>();
  });

  it("brands the Windows segment collection schemas", () => {
    expect<typeof WindowsSegments.Type>().type.toBe<
      readonly [ValidWindowsPathSegmentType, ...Array<ValidWindowsPathSegmentType>] & Brand.Brand<"WindowsSegments">
    >();
    expect<WindowsSegmentsType>().type.toBe<
      readonly [ValidWindowsPathSegmentType, ...Array<ValidWindowsPathSegmentType>] & Brand.Brand<"WindowsSegments">
    >();
  });

  it("brands the UNC segment tuple schema", () => {
    expect<typeof ValidWindowsUncSegments.Type>().type.toBe<
      readonly [
        ValidWindowsRootSegmentType,
        ValidWindowsRootSegmentType,
        ValidWindowsPathSegmentType,
        ...Array<ValidWindowsPathSegmentType>,
      ] &
        Brand.Brand<"ValidWindowsUncSegments">
    >();
    expect<ValidWindowsUncSegmentsType>().type.toBe<
      readonly [
        ValidWindowsRootSegmentType,
        ValidWindowsRootSegmentType,
        ValidWindowsPathSegmentType,
        ...Array<ValidWindowsPathSegmentType>,
      ] &
        Brand.Brand<"ValidWindowsUncSegments">
    >();
  });
});
