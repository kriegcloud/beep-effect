import { Glob } from "@beep/schema";
import { describe, expect, it } from "@effect/vitest";
import * as S from "effect/Schema";

describe("Glob", () => {
  const decode = S.decodeUnknownSync(Glob);

  it("accepts portable glob patterns supported by the matcher stack", () => {
    expect(decode("src/**/*.ts")).toBe("src/**/*.ts");
    expect(decode("{src,test}/**/*.ts")).toBe("{src,test}/**/*.ts");
    expect(decode("foo/bar")).toBe("foo/bar");
    expect(decode("foo/[bar")).toBe("foo/[bar");
    expect(decode("foo/{bar")).toBe("foo/{bar");
  });

  it("rejects empty input", () => {
    expect(() => decode("")).toThrow("Glob pattern must not be empty");
  });

  it("rejects backslash-separated patterns", () => {
    expect(() => decode("src\\**\\*.ts")).toThrow("Glob pattern must use forward slashes instead of backslashes");
  });

  it("rejects patterns longer than the current matcher limit", () => {
    const tooLong = "a".repeat(65537);

    expect(() => decode(tooLong)).toThrow("Glob pattern must not exceed 65536 characters");
  });

  it("supports guard-style schema checks", () => {
    const isGlob = S.is(Glob);

    expect(isGlob("src/**/*.ts")).toBe(true);
    expect(isGlob("src\\**\\*.ts")).toBe(false);
  });

  it("reports nested field failures at the glob key", () => {
    const Payload = S.Struct({
      glob: Glob,
    });

    expect(() => S.decodeUnknownSync(Payload)({ glob: "src\\**\\*.ts" })).toThrow(`at ["glob"]`);
  });
});
