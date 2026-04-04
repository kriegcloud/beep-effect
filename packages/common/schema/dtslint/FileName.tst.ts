import { FileName, type FileName as FileNameType } from "@beep/schema";
import * as S from "effect/Schema";
import { describe, expect, it } from "tstyche";

describe("FileName", () => {
  it("preserves the simplified template-literal schema surface", () => {
    expect<typeof FileName.Type>().type.toBe<`${string}.${string}`>();
    expect<typeof FileName.Encoded>().type.toBe<`${string}.${string}`>();
    expect<FileNameType>().type.toBe<`${string}.${string}`>();
  });

  it("exposes decode helpers that produce the template-literal type", () => {
    const decode = S.decodeSync(FileName);
    const decoded = decode("archive.tar.gz");

    expect(decoded).type.toBe<FileNameType>();
  });

  it("exposes a guard that narrows to the template-literal type", () => {
    const isFileName = S.is(FileName);
    const value: unknown = "photo.png";

    if (isFileName(value)) {
      expect(value).type.toBe<FileNameType>();
    }
  });

  it("integrates into object schemas with a fileName property", () => {
    const Payload = S.Struct({
      fileName: FileName,
    });
    const decode = S.decodeUnknownSync(Payload);
    const payload = decode({ fileName: "archive.tar.gz" });

    expect<typeof Payload.Type>().type.toBe<Readonly<{ fileName: FileNameType }>>();
    expect<typeof Payload.Encoded>().type.toBe<Readonly<{ fileName: `${string}.${string}` }>>();
    expect(payload).type.toBe<Readonly<{ fileName: FileNameType }>>();
  });
});
