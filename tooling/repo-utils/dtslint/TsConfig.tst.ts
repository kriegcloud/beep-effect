import {
  collectTsConfigPaths,
  type DomainError,
  decodeTSConfig,
  decodeTSConfigEffect,
  decodeTSConfigExit,
  decodeTSConfigFromJsoncTextEffect,
  encodeTSConfigEffect,
  encodeTSConfigPrettyEffect,
  encodeTSConfigToJsonEffect,
  type FsUtils,
  type NoSuchFileError,
  type TSConfig,
} from "@beep/repo-utils";
import type { Effect, Exit, HashMap, Schema } from "effect";
import type * as O from "effect/Option";
import { describe, expect, it } from "tstyche";

describe("TsConfig", () => {
  it("collectTsConfigPaths returns HashMap<string, ReadonlyArray<string>>", () => {
    expect(collectTsConfigPaths("/root")).type.toBe<
      Effect.Effect<HashMap.HashMap<string, ReadonlyArray<string>>, NoSuchFileError | DomainError, FsUtils>
    >();
  });

  describe("TSConfig schema", () => {
    type CompilerOptions = TSConfig["compilerOptions"] extends O.Option<infer Value> ? Value : never;
    type TsNodeConfig = TSConfig["ts-node"] extends O.Option<infer Value> ? Value : never;

    it("Type exposes optional top-level sections as Option", () => {
      expect<TSConfig["extends"]>().type.toBe<O.Option<string | ReadonlyArray<string>>>();
      expect<TSConfig["references"]>().type.toBe<O.Option<ReadonlyArray<{ readonly path: string }>>>();
      expect<TSConfig["compilerOptions"]>().type.toBe<O.Option<CompilerOptions>>();
      expect<TSConfig["ts-node"]>().type.toBe<O.Option<TsNodeConfig>>();
    });

    it("Type exposes representative nested compilerOptions fields", () => {
      expect<CompilerOptions["module"]>().type.toBe<
        O.Option<
          | "commonjs"
          | "amd"
          | "system"
          | "umd"
          | "es6"
          | "es2015"
          | "es2020"
          | "esnext"
          | "none"
          | "es2022"
          | "node16"
          | "node18"
          | "node20"
          | "nodenext"
          | "preserve"
        >
      >();
      expect<CompilerOptions["paths"]>().type.toBe<
        O.Option<{
          readonly [x: string]: ReadonlyArray<string> | null;
        }>
      >();
      expect<CompilerOptions["types"]>().type.toBe<O.Option<ReadonlyArray<string>>>();
    });

    it("Type exposes representative nested ts-node fields", () => {
      expect<TsNodeConfig["moduleTypes"]>().type.toBe<
        O.Option<{
          readonly [x: string]: "cjs" | "esm" | "package";
        }>
      >();
    });

    it("Encoded helper type is available", () => {
      const encoded: TSConfig.Encoded = {
        extends: "./tsconfig.base.json",
        compilerOptions: {
          target: "es2022",
        },
      };

      expect(encoded).type.toBe<TSConfig.Encoded>();
    });
  });

  describe("TSConfig helpers", () => {
    it("decodeTSConfig returns TSConfig", () => {
      expect(decodeTSConfig({})).type.toBe<TSConfig>();
    });

    it("decodeTSConfigExit returns Exit<TSConfig, SchemaError>", () => {
      expect(decodeTSConfigExit({})).type.toBe<Exit.Exit<TSConfig, Schema.SchemaError>>();
    });

    it("decodeTSConfigEffect returns Effect<TSConfig, SchemaError>", () => {
      expect(decodeTSConfigEffect({})).type.toBe<Effect.Effect<TSConfig, Schema.SchemaError>>();
    });

    it("decodeTSConfigFromJsoncTextEffect returns Effect<TSConfig, SchemaError>", () => {
      expect(decodeTSConfigFromJsoncTextEffect("{}")).type.toBe<Effect.Effect<TSConfig, Schema.SchemaError>>();
    });

    it("encodeTSConfigEffect returns Effect<TSConfig.Encoded, SchemaError>", () => {
      expect(encodeTSConfigEffect({})).type.toBe<Effect.Effect<TSConfig.Encoded, Schema.SchemaError>>();
    });

    it("encodeTSConfigToJsonEffect returns Effect<string, SchemaError>", () => {
      expect(encodeTSConfigToJsonEffect({})).type.toBe<Effect.Effect<string, Schema.SchemaError>>();
    });

    it("encodeTSConfigPrettyEffect returns Effect<string, SchemaError | DomainError>", () => {
      expect(encodeTSConfigPrettyEffect({})).type.toBe<Effect.Effect<string, Schema.SchemaError | DomainError>>();
    });
  });
});
