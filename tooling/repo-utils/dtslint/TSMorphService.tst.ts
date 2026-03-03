import {
  type TSMorphService,
  TSMorphServiceLive,
  type TSMorphServiceShape,
  type TsMorphFunctionExplanation,
  type TsMorphJSDocDriftReport,
  type TsMorphJSDocValidationReport,
  type TsMorphJSDocWritePlan,
  type TsMorphJSDocWriteReceipt,
  type TsMorphProjectScope,
  type TsMorphServiceError,
  type TsMorphSymbolMatch,
} from "@beep/repo-utils";
import type { Effect, FileSystem, Layer, Path } from "effect";
import { describe, expect, it } from "tstyche";

describe("TSMorphService", () => {
  describe("TSMorphServiceShape", () => {
    it("resolveProjectScope returns Effect<TsMorphProjectScope, TsMorphServiceError>", () => {
      expect<ReturnType<TSMorphServiceShape["resolveProjectScope"]>>().type.toBe<
        Effect.Effect<TsMorphProjectScope, TsMorphServiceError>
      >();
    });

    it("searchSymbols returns Effect<ReadonlyArray<TsMorphSymbolMatch>, TsMorphServiceError>", () => {
      expect<ReturnType<TSMorphServiceShape["searchSymbols"]>>().type.toBe<
        Effect.Effect<ReadonlyArray<TsMorphSymbolMatch>, TsMorphServiceError>
      >();
    });

    it("explainFunction returns Effect<TsMorphFunctionExplanation, TsMorphServiceError>", () => {
      expect<ReturnType<TSMorphServiceShape["explainFunction"]>>().type.toBe<
        Effect.Effect<TsMorphFunctionExplanation, TsMorphServiceError>
      >();
    });

    it("validateJSDoc returns Effect<TsMorphJSDocValidationReport, TsMorphServiceError>", () => {
      expect<ReturnType<TSMorphServiceShape["validateJSDoc"]>>().type.toBe<
        Effect.Effect<TsMorphJSDocValidationReport, TsMorphServiceError>
      >();
    });

    it("planJSDocWrites returns Effect<TsMorphJSDocWritePlan, TsMorphServiceError>", () => {
      expect<ReturnType<TSMorphServiceShape["planJSDocWrites"]>>().type.toBe<
        Effect.Effect<TsMorphJSDocWritePlan, TsMorphServiceError>
      >();
    });

    it("applyJSDocWrites returns Effect<TsMorphJSDocWriteReceipt, TsMorphServiceError>", () => {
      expect<ReturnType<TSMorphServiceShape["applyJSDocWrites"]>>().type.toBe<
        Effect.Effect<TsMorphJSDocWriteReceipt, TsMorphServiceError>
      >();
    });

    it("checkJSDocDrift returns Effect<TsMorphJSDocDriftReport, TsMorphServiceError>", () => {
      expect<ReturnType<TSMorphServiceShape["checkJSDocDrift"]>>().type.toBe<
        Effect.Effect<TsMorphJSDocDriftReport, TsMorphServiceError>
      >();
    });
  });

  describe("TSMorphServiceLive", () => {
    it("provides TSMorphService and requires FileSystem | Path", () => {
      expect(TSMorphServiceLive).type.toBe<Layer.Layer<TSMorphService, never, FileSystem.FileSystem | Path.Path>>();
    });
  });
});
