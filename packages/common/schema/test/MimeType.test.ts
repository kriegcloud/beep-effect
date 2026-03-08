import type { MimeTypesData } from "@beep/data";
import {
  AudioMimeType,
  extractMimeExtensions,
  extractMimeTypes,
  ImageMimeType,
  MimeType,
  TextMimeType,
} from "@beep/schema";
import { describe, expect, it } from "@effect/vitest";

describe("MimeType helpers", () => {
  it("dedupes extracted file extensions while preserving first-seen order", () => {
    const sample = {
      "application/example-a": {
        source: "repo",
        extensions: ["one", "two"] as const,
      },
      "application/example-b": {
        source: "repo",
        extensions: ["two", "three"] as const,
      },
    } as const;

    expect(extractMimeExtensions(sample)).toEqual(["one", "two", "three"]);
  });

  it("extracts MIME type keys without changing their order", () => {
    const sample = {
      "text/example-a": {
        source: "repo",
        extensions: ["a"] as const,
      },
      "text/example-b": {
        source: "repo",
        extensions: ["b"] as const,
      },
    } as const;

    expect(extractMimeTypes(sample)).toEqual(["text/example-a", "text/example-b"]);
  });
});

describe("MimeType kinds", () => {
  it("keeps representative category members on the exported schema kits", () => {
    expect(MimeType.kinds.Application.Options).toContain("application/json");
    expect(TextMimeType.Options).toContain("text/html");
    expect(ImageMimeType.Options).toContain("image/png");
    expect(AudioMimeType.Options).toContain("audio/mpeg");
  });

  it("keeps the category kits aligned with the vendored MIME data", () => {
    expect(MimeType.kinds.Application.Options).toContain("application/json");
    expect(MimeType.kinds.Application.Options).toContain("application/ld+json");
    expect(MimeType.kinds.Text.Options).toContain("text/html");
    expect(MimeType.kinds.Image.Options).toContain("image/png");
    expect(MimeType.kinds.Audio.Options).toContain("audio/mpeg");

    expect(MimeType.kinds.Application.Options).toContain(
      "application/json" satisfies keyof typeof MimeTypesData.application
    );
    expect(MimeType.kinds.Text.Options).toContain("text/html" satisfies keyof typeof MimeTypesData.text);
    expect(MimeType.kinds.Image.Options).toContain("image/png" satisfies keyof typeof MimeTypesData.image);
    expect(MimeType.kinds.Audio.Options).toContain("audio/mpeg" satisfies keyof typeof MimeTypesData.audio);
  });
});
