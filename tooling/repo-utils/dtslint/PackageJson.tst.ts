import {
  type DomainError,
  decodePackageJson,
  decodePackageJsonEffect,
  decodePackageJsonExit,
  encodePackageJsonEffect,
  encodePackageJsonPrettyEffect,
  encodePackageJsonToJsonEffect,
  type PackageJson,
} from "@beep/repo-utils";
import type { Effect, Exit, Schema } from "effect";
import { describe, expect, it } from "tstyche";

describe("PackageJson", () => {
  describe("PackageJson schema", () => {
    it("Type has required name field", () => {
      expect<PackageJson["name"]>().type.toBe<string>();
    });

    it("Type has optional version field", () => {
      expect<PackageJson["version"]>().type.toBe<string | undefined>();
    });

    it("Type has optional dependencies record", () => {
      expect<PackageJson["dependencies"]>().type.toBe<{ readonly [x: string]: string } | undefined>();
    });

    it("Type has optional workspaces array", () => {
      expect<PackageJson["workspaces"]>().type.toBe<ReadonlyArray<string> | undefined>();
    });
  });

  describe("decodePackageJson (sync)", () => {
    it("returns PackageJson from unknown", () => {
      expect(decodePackageJson({ name: "test" })).type.toBe<PackageJson>();
    });
  });

  describe("decodePackageJsonExit", () => {
    it("returns Exit<PackageJson, SchemaError>", () => {
      expect(decodePackageJsonExit({ name: "test" })).type.toBe<Exit.Exit<PackageJson, Schema.SchemaError>>();
    });
  });

  describe("decodePackageJsonEffect", () => {
    it("returns Effect<PackageJson, SchemaError>", () => {
      expect(decodePackageJsonEffect({ name: "test" })).type.toBe<Effect.Effect<PackageJson, Schema.SchemaError>>();
    });
  });

  describe("encodePackageJsonEffect", () => {
    it("returns Effect<PackageJson, SchemaError>", () => {
      expect(encodePackageJsonEffect({ name: "test" })).type.toBe<Effect.Effect<PackageJson, Schema.SchemaError>>();
    });
  });

  describe("encodePackageJsonToJsonEffect", () => {
    it("returns Effect<string, SchemaError>", () => {
      expect(encodePackageJsonToJsonEffect({ name: "test" })).type.toBe<Effect.Effect<string, Schema.SchemaError>>();
    });
  });

  describe("encodePackageJsonPrettyEffect", () => {
    it("returns Effect<string, SchemaError | DomainError>", () => {
      expect(encodePackageJsonPrettyEffect({ name: "test" })).type.toBe<
        Effect.Effect<string, Schema.SchemaError | DomainError>
      >();
    });
  });
});
