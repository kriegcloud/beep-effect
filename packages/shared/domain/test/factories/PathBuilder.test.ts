import { describe, expect, it } from "bun:test";
import { PathBuilder } from "@beep/shared-domain/factories/path-builder";

describe("PathBuilder", () => {
  describe("make", () => {
    it("creates a PathInstance from a root path", () => {
      const root = PathBuilder.make("/");
      expect(root.string()).toBe("/");
    });

    it("creates a PathInstance from a nested path", () => {
      const auth = PathBuilder.make("/auth");
      expect(auth.string()).toBe("/auth");
    });
  });

  describe("tagged template", () => {
    it("appends segment to root path without double slash", () => {
      const root = PathBuilder.make("/");
      expect(root`dashboard`).toBe("/dashboard");
    });

    it("appends segment to nested path", () => {
      const auth = PathBuilder.make("/auth");
      expect(auth`sign-in`).toBe("/auth/sign-in");
    });

    it("throws on interpolations", () => {
      const root = PathBuilder.make("/");
      const segment = "test";
      expect(() => root`path/${segment}`).toThrow("does not allow interpolations");
    });

    it("throws on empty segment", () => {
      const root = PathBuilder.make("/");
      expect(() => root``).toThrow("must not be empty");
    });

    it("throws on segment with leading slash", () => {
      const root = PathBuilder.make("/");
      expect(() => root`/bad`).toThrow('must not start with "/"');
    });

    it("throws on segment with trailing slash", () => {
      const root = PathBuilder.make("/");
      expect(() => root`bad/`).toThrow('must not end with "/"');
    });

    it("throws on segment with middle slash", () => {
      const root = PathBuilder.make("/");
      expect(() => root`a/b`).toThrow('must not contain "/"');
    });
  });

  describe("create", () => {
    it("returns a new PathInstance with appended segment", () => {
      const root = PathBuilder.make("/");
      const auth = root.create("auth");
      expect(auth.string()).toBe("/auth");
    });

    it("composes recursively", () => {
      const root = PathBuilder.make("/");
      const settings = root.create("dashboard").create("settings");
      expect(settings.string()).toBe("/dashboard/settings");
    });

    it("created instance can use tagged templates", () => {
      const auth = PathBuilder.make("/").create("auth");
      expect(auth`sign-in`).toBe("/auth/sign-in");
    });
  });

  describe("dynamic", () => {
    it("appends a dynamic param to the path", () => {
      const api = PathBuilder.make("/api");
      expect(api.dynamic("users")).toBe("/api/users");
    });

    it("works from root path", () => {
      const root = PathBuilder.make("/");
      expect(root.dynamic("page")).toBe("/page");
    });
  });

  describe("withQuery", () => {
    it("appends query parameters to the path", () => {
      const settings = PathBuilder.make("/settings");
      const result = settings.withQuery({ tab: "general" });
      expect(result).toBe("/settings?tab=general");
    });

    it("appends multiple query parameters", () => {
      const search = PathBuilder.make("/search");
      const result = search.withQuery({ q: "test", page: "1" });
      expect(result).toContain("/search?");
      expect(result).toContain("q=test");
      expect(result).toContain("page=1");
    });
  });

  describe("collection", () => {
    it("validates and brands path values", () => {
      const root = PathBuilder.make("/");
      const paths = PathBuilder.collection({
        home: root.string(),
        about: root`about`,
      } as const);

      expect(paths.home).toBe("/");
      expect(paths.about).toBe("/about");
    });

    it("handles nested collections", () => {
      const root = PathBuilder.make("/");
      const auth = root.create("auth");

      const paths = PathBuilder.collection({
        root: root.string(),
        auth: {
          signIn: auth`sign-in`,
          signUp: auth`sign-up`,
        },
      } as const);

      expect(paths.auth.signIn).toBe("/auth/sign-in");
      expect(paths.auth.signUp).toBe("/auth/sign-up");
    });

    it("allows query strings in generated paths", () => {
      const paths = PathBuilder.collection({
        auth: {
          verification: {
            email: {
              verify: (token: string) => `/auth/verify-email?token=${token}` as const,
            },
          },
        },
      } as const);

      expect(paths.auth.verification.email.verify("abc.def")).toBe("/auth/verify-email?token=abc.def");
    });
  });
});
