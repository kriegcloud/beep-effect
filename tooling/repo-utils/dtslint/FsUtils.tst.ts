import type { Effect, FileSystem, Layer, Path } from "effect";
import { describe, expect, it } from "tstyche";
import { type DomainError, type FsUtils, FsUtilsLive, type FsUtilsShape, type NoSuchFileError } from "../src/index.js";

describe("FsUtils", () => {
  describe("FsUtilsShape", () => {
    it("glob returns Effect<ReadonlyArray<string>, DomainError>", () => {
      expect<ReturnType<FsUtilsShape["glob"]>>().type.toBe<Effect.Effect<ReadonlyArray<string>, DomainError>>();
    });

    it("readJson returns Effect<unknown, NoSuchFileError | DomainError>", () => {
      expect<ReturnType<FsUtilsShape["readJson"]>>().type.toBe<Effect.Effect<unknown, NoSuchFileError | DomainError>>();
    });

    it("writeJson returns Effect<void, DomainError>", () => {
      expect<ReturnType<FsUtilsShape["writeJson"]>>().type.toBe<Effect.Effect<void, DomainError>>();
    });

    it("modifyFile returns Effect<boolean, NoSuchFileError | DomainError>", () => {
      expect<ReturnType<FsUtilsShape["modifyFile"]>>().type.toBe<
        Effect.Effect<boolean, NoSuchFileError | DomainError>
      >();
    });

    it("existsOrThrow returns Effect<void, NoSuchFileError>", () => {
      expect<ReturnType<FsUtilsShape["existsOrThrow"]>>().type.toBe<Effect.Effect<void, NoSuchFileError>>();
    });

    it("isDirectory returns Effect<boolean, NoSuchFileError>", () => {
      expect<ReturnType<FsUtilsShape["isDirectory"]>>().type.toBe<Effect.Effect<boolean, NoSuchFileError>>();
    });

    it("getParentDirectory returns Effect<string>", () => {
      expect<ReturnType<FsUtilsShape["getParentDirectory"]>>().type.toBe<Effect.Effect<string>>();
    });
  });

  describe("FsUtilsLive", () => {
    it("provides FsUtils and requires FileSystem | Path", () => {
      expect(FsUtilsLive).type.toBe<Layer.Layer<FsUtils, never, FileSystem.FileSystem | Path.Path>>();
    });
  });
});
