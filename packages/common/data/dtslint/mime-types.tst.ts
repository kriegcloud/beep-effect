import { type FileExtension, getExtensions, getTypes, lookup, type MimeType, mimeTypes } from "@beep/data/MimeTypes";
import { describe, expect, it } from "tstyche";

describe("MimeType", () => {
  it("includes known MIME type literals", () => {
    expect<"application/json">().type.toBeAssignableTo<MimeType>();
    expect<"text/html">().type.toBeAssignableTo<MimeType>();
    expect<"image/png">().type.toBeAssignableTo<MimeType>();
    expect<"audio/mpeg">().type.toBeAssignableTo<MimeType>();
    expect<"video/mp4">().type.toBeAssignableTo<MimeType>();
  });

  it("rejects unknown MIME type strings", () => {
    expect<"not/a-mime-type">().type.not.toBeAssignableTo<MimeType>();
    expect<"foo">().type.not.toBeAssignableTo<MimeType>();
  });
});

describe("FileExtension", () => {
  it("includes known file extensions", () => {
    expect<"json">().type.toBeAssignableTo<FileExtension>();
    expect<"html">().type.toBeAssignableTo<FileExtension>();
    expect<"png">().type.toBeAssignableTo<FileExtension>();
    expect<"mp3">().type.toBeAssignableTo<FileExtension>();
  });

  it("rejects unknown file extensions", () => {
    expect<"zzzzz">().type.not.toBeAssignableTo<FileExtension>();
    expect<"notanext">().type.not.toBeAssignableTo<FileExtension>();
  });
});

describe("mimeTypes", () => {
  it("is typed as Record<MimeType, { source: string; extensions: FileExtension[] }>", () => {
    expect(mimeTypes).type.toBeAssignableTo<Record<MimeType, { source: string; extensions: FileExtension[] }>>();
  });

  it("allows indexing with a MimeType key", () => {
    expect(mimeTypes["application/json"]).type.toBe<{
      source: string;
      extensions: FileExtension[];
    }>();
  });
});

describe("getTypes", () => {
  it("returns Record<FileExtension, MimeType>", () => {
    expect(getTypes()).type.toBe<Record<FileExtension, MimeType>>();
  });
});

describe("getExtensions", () => {
  it("returns Record<MimeType, FileExtension[]>", () => {
    expect(getExtensions()).type.toBe<Record<MimeType, FileExtension[]>>();
  });
});

describe("lookup", () => {
  it("accepts a string and returns false | MimeType", () => {
    expect(lookup("json")).type.toBe<false | MimeType>();
  });

  it("rejects non-string arguments", () => {
    expect(lookup(123)).type.toRaiseError();
  });
});
