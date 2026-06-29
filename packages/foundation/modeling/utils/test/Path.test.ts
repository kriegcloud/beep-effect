import { Path } from "@beep/utils";
import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";

describe("Path helpers", () => {
  it("join concatenates segments with the platform separator", () => {
    expect(Path.join("a", "b", "c")).toBe(`a${Path.sep}b${Path.sep}c`);
  });

  it("resolve produces an absolute path", () => {
    expect(Path.isAbsolute(Path.resolve("a", "b"))).toBe(true);
  });

  it("normalize collapses . and .. segments", () => {
    expect(Path.normalize(`a${Path.sep}${Path.sep}b${Path.sep}..${Path.sep}c`)).toBe(`a${Path.sep}c`);
  });

  it("basename, dirname and extname split a path", () => {
    const file = Path.join("a", "b", "c.ts");
    expect(Path.basename(file, ".ts")).toBe("c");
    expect(Path.dirname(file)).toBe(Path.join("a", "b"));
    expect(Path.extname(file)).toBe(".ts");
  });

  it("parse and format round-trip a path", () => {
    const parsed = Path.parse(Path.join("a", "b", "c.ts"));
    expect(parsed.base).toBe("c.ts");
    expect(parsed.ext).toBe(".ts");
    expect(parsed.name).toBe("c");
    expect(Path.format(parsed)).toBe(Path.join("a", "b", "c.ts"));
  });

  it("isAbsolute distinguishes absolute from relative", () => {
    expect(Path.isAbsolute(Path.resolve("x"))).toBe(true);
    expect(Path.isAbsolute("x")).toBe(false);
  });

  it("toFileUrl and fromFileUrl round-trip an absolute path", () => {
    const absolute = Path.resolve("beep.txt");
    const url = Effect.runSync(Path.toFileUrl(absolute));
    expect(url.protocol).toBe("file:");
    expect(Effect.runSync(Path.fromFileUrl(url))).toBe(absolute);
  });

  it("fromFileUrl fails with a bare BadArgument for a non-file URL", () => {
    const error = Effect.runSync(Effect.flip(Path.fromFileUrl(new URL("https://example.com/file.txt"))));
    expect(error._tag).toBe("BadArgument");
    expect(error.module).toBe("Path");
    expect(error.method).toBe("fromFileUrl");
  });
});
