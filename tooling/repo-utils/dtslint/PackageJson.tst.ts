import {
  applyPackageJsonPatchEffect,
  type DomainError,
  decodePackageJson,
  decodePackageJsonEffect,
  decodePackageJsonExit,
  diffPackageJsonEffect,
  encodePackageJsonCanonicalPrettyEffect,
  encodePackageJsonEffect,
  encodePackageJsonPrettyEffect,
  encodePackageJsonToJsonEffect,
  type NpmPackageJson,
  normalizePackageJsonEffect,
  type PackageJson,
} from "@beep/repo-utils";
import type { Effect, Exit, Schema } from "effect";
import type * as JsonPatch from "effect/JsonPatch";
import type * as O from "effect/Option";
import { describe, expect, it } from "tstyche";

describe("PackageJson", () => {
  describe("PackageJson schema", () => {
    it("Type has required name field", () => {
      expect<PackageJson["name"]>().type.toBe<string>();
    });

    it("Type has optional version field", () => {
      expect<PackageJson["version"]>().type.toBe<O.Option<string>>();
    });

    it("Type has optional dependencies record", () => {
      expect<PackageJson["dependencies"]>().type.toBe<O.Option<{ readonly [x: string]: string }>>();
    });

    it("Type has widened workspaces union", () => {
      expect<PackageJson["workspaces"]>().type.toBe<
        O.Option<
          | ReadonlyArray<string>
          | {
              readonly packages?: ReadonlyArray<string>;
              readonly nohoist?: ReadonlyArray<string>;
            }
        >
      >();
    });

    it("Type has repo-local catalog field", () => {
      expect<PackageJson["catalog"]>().type.toBe<O.Option<{ readonly [x: string]: string }>>();
    });

    it("NpmPackageJson keeps packageManager but not repo-only fields", () => {
      expect<NpmPackageJson["packageManager"]>().type.toBe<O.Option<string>>();
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
    it("returns Effect<PackageJson.Encoded, SchemaError>", () => {
      expect(encodePackageJsonEffect({ name: "test" })).type.toBe<
        Effect.Effect<PackageJson.Encoded, Schema.SchemaError>
      >();
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

  describe("normalizePackageJsonEffect", () => {
    it("returns Effect<PackageJson.Encoded, SchemaError>", () => {
      expect(normalizePackageJsonEffect({ name: "test" })).type.toBe<
        Effect.Effect<PackageJson.Encoded, Schema.SchemaError>
      >();
    });
  });

  describe("encodePackageJsonCanonicalPrettyEffect", () => {
    it("returns Effect<string, SchemaError | DomainError>", () => {
      expect(encodePackageJsonCanonicalPrettyEffect({ name: "test" })).type.toBe<
        Effect.Effect<string, Schema.SchemaError | DomainError>
      >();
    });
  });

  describe("diffPackageJsonEffect", () => {
    it("returns Effect<JsonPatch, SchemaError>", () => {
      expect(diffPackageJsonEffect({ name: "before" }, { name: "after" })).type.toBe<
        Effect.Effect<JsonPatch.JsonPatch, Schema.SchemaError>
      >();
    });
  });

  describe("applyPackageJsonPatchEffect", () => {
    it("returns Effect<PackageJson, SchemaError | DomainError>", () => {
      expect(applyPackageJsonPatchEffect({ name: "test" }, [])).type.toBe<
        Effect.Effect<PackageJson, Schema.SchemaError | DomainError>
      >();
    });
  });
});
