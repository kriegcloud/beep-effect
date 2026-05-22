import * as FilePathSchema from "@beep/schema/FilePath";
import type * as Brand from "effect/Brand";
import * as S from "effect/Schema";
import { describe, expect, it } from "tstyche";

describe("FilePath", () => {
  it("preserves the branded schema surface", () => {
    expect<FilePathSchema.FilePath>().type.toBe<string & Brand.Brand<"FilePath">>();
    expect<typeof FilePathSchema.FilePath.Encoded>().type.toBe<string>();
    expect<FilePathSchema.FilePath>().type.toBe<string & Brand.Brand<"FilePath">>();
  });

  it("exposes decode helpers that produce the branded type", () => {
    const decode = S.decodeSync(FilePathSchema.FilePath);
    const decoded = decode("./folder/file.txt");

    expect(decoded).type.toBe<FilePathSchema.FilePath>();
  });

  it("exposes a guard that narrows to the branded type", () => {
    const isFilePath = S.is(FilePathSchema.FilePath);
    const value: unknown = "./folder/file.txt";

    if (isFilePath(value)) {
      expect(value).type.toBe<FilePathSchema.FilePath>();
    }
  });

  it("integrates into object schemas with a filePath property", () => {
    const Payload = S.Struct({
      filePath: FilePathSchema.FilePath,
    });
    const decode = S.decodeUnknownSync(Payload);
    const payload = decode({ filePath: "./folder/file.txt" });

    expect<typeof Payload.Type>().type.toBe<Readonly<{ filePath: FilePathSchema.FilePath }>>();
    expect<typeof Payload.Encoded>().type.toBe<Readonly<{ filePath: string }>>();
    expect(payload).type.toBe<Readonly<{ filePath: FilePathSchema.FilePath }>>();
  });
});

describe("FilePath part schema surfaces", () => {
  it("keeps literal unions unbranded", () => {
    expect<FilePathSchema.SupportedPathFamily>().type.toBe<
      "posixAbsolute" | "posixRelative" | "windowsDrive" | "windowsUnc" | "windowsRelative"
    >();
    expect<FilePathSchema.SupportedPathFamily>().type.toBe<
      "posixAbsolute" | "posixRelative" | "windowsDrive" | "windowsUnc" | "windowsRelative"
    >();

    expect<FilePathSchema.WindowsDotSegment>().type.toBe<"." | "..">();
    expect<FilePathSchema.WindowsDotSegment>().type.toBe<"." | "..">();
  });

  it("brands the Windows path string schemas", () => {
    expect<FilePathSchema.WindowsDrivePath>().type.toBe<string & Brand.Brand<"WindowsDrivePath">>();
    expect<FilePathSchema.WindowsDrivePath>().type.toBe<string & Brand.Brand<"WindowsDrivePath">>();

    const decode = S.decodeSync(FilePathSchema.WindowsDrivePath);
    const decoded = decode("C:\\folder\\file.txt");

    expect(decoded).type.toBe<FilePathSchema.WindowsDrivePath>();
  });

  it("brands the Windows segment collection schemas", () => {
    expect<FilePathSchema.WindowsSegments>().type.toBe<
      readonly [FilePathSchema.ValidWindowsPathSegment, ...Array<FilePathSchema.ValidWindowsPathSegment>] &
        Brand.Brand<"WindowsSegments">
    >();
    expect<FilePathSchema.WindowsSegments>().type.toBe<
      readonly [FilePathSchema.ValidWindowsPathSegment, ...Array<FilePathSchema.ValidWindowsPathSegment>] &
        Brand.Brand<"WindowsSegments">
    >();
  });

  it("brands the UNC segment tuple schema", () => {
    expect<FilePathSchema.ValidWindowsUncSegments>().type.toBe<
      readonly [
        FilePathSchema.ValidWindowsRootSegment,
        FilePathSchema.ValidWindowsRootSegment,
        FilePathSchema.ValidWindowsPathSegment,
        ...Array<FilePathSchema.ValidWindowsPathSegment>,
      ] &
        Brand.Brand<"ValidWindowsUncSegments">
    >();
    expect<FilePathSchema.ValidWindowsUncSegments>().type.toBe<
      readonly [
        FilePathSchema.ValidWindowsRootSegment,
        FilePathSchema.ValidWindowsRootSegment,
        FilePathSchema.ValidWindowsPathSegment,
        ...Array<FilePathSchema.ValidWindowsPathSegment>,
      ] &
        Brand.Brand<"ValidWindowsUncSegments">
    >();
  });
});
