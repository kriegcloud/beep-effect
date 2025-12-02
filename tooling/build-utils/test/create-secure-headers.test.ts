import {
  createHeadersObject,
  createSecureHeaders,
} from "@beep/build-utils/create-secure-headers";
import { describe, expect, it } from "@beep/testkit";
import { Effect } from "effect";

const runEffect = <A, E>(effect: Effect.Effect<A, E, never>): Promise<A> =>
  Effect.runPromise(effect);

describe("createHeadersObject", () => {
  describe("when called with default options", () => {
    it("should return default security headers", async () => {
      const result = await runEffect(createHeadersObject());

      expect(result).toHaveProperty(
        "Strict-Transport-Security",
        "max-age=63072000"
      );
      expect(result).toHaveProperty("X-Frame-Options", "deny");
      expect(result).toHaveProperty("X-Download-Options", "noopen");
      expect(result).toHaveProperty("X-Content-Type-Options", "nosniff");
      expect(result).toHaveProperty("X-XSS-Protection", "1");
    });
  });

  describe("when called with custom options", () => {
    it("should return headers based on provided options", async () => {
      const result = await runEffect(
        createHeadersObject({
          frameGuard: "sameorigin",
          referrerPolicy: "same-origin",
        })
      );

      expect(result).toHaveProperty("X-Frame-Options", "sameorigin");
      expect(result).toHaveProperty("Referrer-Policy", "same-origin");
    });
  });

  describe("when options are set to false", () => {
    it("should omit those headers", async () => {
      const result = await runEffect(
        createHeadersObject({
          noopen: false,
          nosniff: false,
        })
      );

      expect(result).not.toHaveProperty("X-Download-Options");
      expect(result).not.toHaveProperty("X-Content-Type-Options");
    });
  });

  describe("when CSP is provided", () => {
    it("should include Content-Security-Policy header", async () => {
      const result = await runEffect(
        createHeadersObject({
          contentSecurityPolicy: { directives: { scriptSrc: "'self'" } },
        })
      );

      expect(result).toHaveProperty(
        "Content-Security-Policy",
        "script-src 'self'"
      );
    });
  });

  describe("when expectCT is provided", () => {
    it("should include Expect-CT header", async () => {
      const result = await runEffect(
        createHeadersObject({
          expectCT: [true, { maxAge: 123, enforce: true }],
        })
      );

      expect(result).toHaveProperty("Expect-CT", "max-age=123, enforce");
    });
  });
});

describe("createSecureHeaders", () => {
  it("should return default headers in { key, value } format", async () => {
    const result = await runEffect(createSecureHeaders());

    // Check that all expected headers are present
    expect(result).toContainEqual({ key: "Strict-Transport-Security", value: "max-age=63072000" });
    expect(result).toContainEqual({ key: "X-Frame-Options", value: "deny" });
    expect(result).toContainEqual({ key: "X-Download-Options", value: "noopen" });
    expect(result).toContainEqual({ key: "X-Content-Type-Options", value: "nosniff" });
    expect(result).toContainEqual({ key: "X-XSS-Protection", value: "1" });
    expect(result).toContainEqual({ key: "X-Permitted-Cross-Domain-Policies", value: "none" });
  });

  it("should return default headers when given empty options", async () => {
    const result = await runEffect(createSecureHeaders({}));

    // Check that all expected headers are present
    expect(result).toContainEqual({ key: "Strict-Transport-Security", value: "max-age=63072000" });
    expect(result).toContainEqual({ key: "X-Frame-Options", value: "deny" });
    expect(result).toContainEqual({ key: "X-Download-Options", value: "noopen" });
    expect(result).toContainEqual({ key: "X-Content-Type-Options", value: "nosniff" });
    expect(result).toContainEqual({ key: "X-XSS-Protection", value: "1" });
    expect(result).toContainEqual({ key: "X-Permitted-Cross-Domain-Policies", value: "none" });
  });

  it("should return customized headers when options are provided", async () => {
    const result = await runEffect(
      createSecureHeaders({ frameGuard: "sameorigin", referrerPolicy: "same-origin" })
    );

    // Check that all expected headers are present
    expect(result).toContainEqual({ key: "Strict-Transport-Security", value: "max-age=63072000" });
    expect(result).toContainEqual({ key: "X-Frame-Options", value: "sameorigin" });
    expect(result).toContainEqual({ key: "X-Download-Options", value: "noopen" });
    expect(result).toContainEqual({ key: "X-Content-Type-Options", value: "nosniff" });
    expect(result).toContainEqual({ key: "Referrer-Policy", value: "same-origin" });
    expect(result).toContainEqual({ key: "X-XSS-Protection", value: "1" });
    expect(result).toContainEqual({ key: "X-Permitted-Cross-Domain-Policies", value: "none" });
  });
});
