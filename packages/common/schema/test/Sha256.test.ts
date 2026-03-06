import { Sha256Hex, Sha256HexFromBytes, Sha256HexFromHexBytes } from "@beep/schema";
import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import * as S from "effect/Schema";

const knownDigest = "d01b7ce9154ef0264ce71e457ea81903b87a58d6cf2cd6be474886fdbc6f61d9";
const emptyDigest = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

describe("Sha256Hex", () => {
  const decode = S.decodeUnknownSync(Sha256Hex);

  it("accepts canonical lowercase digests", () => {
    expect(decode(knownDigest)).toBe(knownDigest);
  });

  it("rejects uppercase digests", () => {
    expect(() => decode(knownDigest.toUpperCase())).toThrow(
      "SHA-256 digest must contain only lowercase hexadecimal characters"
    );
  });

  it("rejects digests with the wrong length", () => {
    expect(() => decode("abc123")).toThrow("SHA-256 digest must be exactly 64 characters long");
  });

  it("rejects 64-character strings with non-hex characters", () => {
    expect(() => decode(`${"g".repeat(63)}z`)).toThrow(
      "SHA-256 digest must contain only lowercase hexadecimal characters"
    );
  });
});

describe("Sha256HexFromBytes", () => {
  const decode = S.decodeUnknownEffect(Sha256HexFromBytes);
  const encode = S.encodeEffect(Sha256HexFromBytes);

  it("decodes bytes into a canonical lowercase SHA-256 hex digest", async () => {
    const input = new TextEncoder().encode("beep");

    await expect(Effect.runPromise(decode(input))).resolves.toBe(knownDigest);
  });

  it("hashes empty bytes to the canonical empty SHA-256 digest", async () => {
    await expect(Effect.runPromise(decode(new Uint8Array()))).resolves.toBe(emptyDigest);
  });

  it("forbids encoding the digest back to source bytes", async () => {
    const digest = S.decodeUnknownSync(Sha256Hex)(knownDigest);

    await expect(Effect.runPromise(encode(digest))).rejects.toThrow(
      "Encoding Sha256Hex back to original bytes is not supported"
    );
  });
});

describe("Sha256HexFromHexBytes", () => {
  const decode = S.decodeUnknownEffect(Sha256HexFromHexBytes);
  const encode = S.encodeEffect(Sha256HexFromHexBytes);

  it("decodes hex-encoded bytes into a canonical lowercase SHA-256 hex digest", async () => {
    await expect(Effect.runPromise(decode("62656570"))).resolves.toBe(knownDigest);
  });

  it("preserves hex transport validation errors", async () => {
    await expect(Effect.runPromise(decode("0"))).rejects.toThrow("Length must be a multiple of 2, but is 1");
  });

  it("forbids encoding the digest back to source hex bytes", async () => {
    const digest = S.decodeUnknownSync(Sha256Hex)(knownDigest);

    await expect(Effect.runPromise(encode(digest))).rejects.toThrow(
      "Encoding Sha256Hex back to original bytes is not supported"
    );
  });
});
