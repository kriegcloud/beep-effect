import { describe, expect, it } from "bun:test";
import * as S from "effect/Schema";
import { ExifMetadata } from "../../src/value-objects";

// Helper to make a simple NumberTag (id/description/value)
const numberTag = (value: number, description = "tag", id = 1) => ({ id, description, value });

describe("@beep/schema EXIF schemas", () => {
  it("decodes minimal EXIF structure via ExpandedTags", () => {
    const input = {
      exif: {
        ImageWidth: numberTag(1024, "ImageWidth", 256),
        ImageLength: numberTag(768, "ImageLength", 257),
      },
    };

    const decoded = S.decodeSync(ExifMetadata)(input);

    expect(decoded.exif).toBeDefined();
    expect(decoded.exif?.imageWidth?.value).toBe(1024);
    expect(decoded.exif?.imageLength?.value).toBe(768);
  });

  it("omitKnownLargeFields removes known heavy keys in icc/xmp/iptc/thumbnail", () => {
    const raw = {
      icc: { base64: "a".repeat(2000), data: "b".repeat(2000), buffer: new ArrayBuffer(2048), profile: "ok" },
      xmp: { base64: "c".repeat(2000), rawXml: "<xml/>", data: "d".repeat(2000), other: "ok" },
      iptc: { base64: "e".repeat(2000), data: "f".repeat(2000), buffer: new ArrayBuffer(1024), keep: "ok" },
      thumbnail: { image: new ArrayBuffer(2048), base64: "g".repeat(2000), blob: "h".repeat(2000), buffer: "i" },
    } as const;

    const cleaned = ExifMetadata.omitKnownLargeFields(raw);

    expect(cleaned.icc?.base64).toBeUndefined();
    expect(cleaned.icc?.data).toBeUndefined();
    expect(cleaned.icc?.buffer).toBeUndefined();
    expect(cleaned.icc?.profile).toBe("ok");

    expect(cleaned.xmp?.base64).toBeUndefined();
    expect(cleaned.xmp?.rawXml).toBeUndefined();
    expect(cleaned.xmp?.data).toBeUndefined();
    expect(cleaned.xmp?.other).toBe("ok");

    expect(cleaned.iptc?.base64).toBeUndefined();
    expect(cleaned.iptc?.data).toBeUndefined();
    expect(cleaned.iptc?.buffer).toBeUndefined();
    expect(cleaned.iptc?.keep).toBe("ok");

    expect(cleaned.thumbnail?.image).toBeUndefined();
    expect(cleaned.thumbnail?.base64).toBeUndefined();
    expect(cleaned.thumbnail?.blob).toBeUndefined();
    expect(cleaned.thumbnail?.buffer).toBeUndefined();
  });
});
