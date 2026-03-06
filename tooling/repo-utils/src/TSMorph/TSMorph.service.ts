import { $RepoUtilsId } from "@beep/identity/packages";
import { Effect, Layer, ServiceMap } from "effect";
import * as S from "effect/Schema";
import {
  TsMorphDiagnosticsRequest,
  TsMorphDiagnosticsResult,
  TsMorphFileOutline,
  TsMorphFileOutlineRequest,
  TsMorphProjectScope,
  TsMorphProjectScopeRequest,
  TsMorphSourceTextRequest,
  TsMorphSourceTextResult,
  TsMorphSymbolLookupRequest,
  TsMorphSymbolLookupResult,
  TsMorphSymbolSearchRequest,
  TsMorphSymbolSearchResult,
  TsMorphSymbolSourceRequest,
  TsMorphSymbolSourceResult,
} from "./TSMorph.model.js";

const $I = $RepoUtilsId.create("TSMorph/TSMorph.service");

/**
 * Typed error returned by the current placeholder TSMorphService implementation.
 * The contract is stable, but the live ts-morph-backed implementation is not wired yet.
 */
export class TsMorphServiceUnavailableError extends S.TaggedErrorClass<TsMorphServiceUnavailableError>(
  $I`TsMorphServiceUnavailableError`
)(
  "TsMorphServiceUnavailableError",
  {
    method: S.String,
    message: S.String,
  },
  $I.annote("TsMorphServiceUnavailableError", {
    description: "Typed error indicating that a TSMorphService method contract exists but is not yet backed by a live implementation.",
  })
) {}

export type TSMorphServiceError = TsMorphServiceUnavailableError;

/**
 * Read-only v1 service contract for ts-morph-backed scope, symbol, source, and diagnostic operations.
 */
export type TSMorphServiceShape = {
  readonly resolveProjectScope: (
    request: TsMorphProjectScopeRequest
  ) => Effect.Effect<TsMorphProjectScope, TSMorphServiceError>;
  readonly getFileOutline: (request: TsMorphFileOutlineRequest) => Effect.Effect<TsMorphFileOutline, TSMorphServiceError>;
  readonly getSymbolById: (
    request: TsMorphSymbolLookupRequest
  ) => Effect.Effect<TsMorphSymbolLookupResult, TSMorphServiceError>;
  readonly searchSymbols: (
    request: TsMorphSymbolSearchRequest
  ) => Effect.Effect<TsMorphSymbolSearchResult, TSMorphServiceError>;
  readonly readSourceText: (
    request: TsMorphSourceTextRequest
  ) => Effect.Effect<TsMorphSourceTextResult, TSMorphServiceError>;
  readonly readSymbolSource: (
    request: TsMorphSymbolSourceRequest
  ) => Effect.Effect<TsMorphSymbolSourceResult, TSMorphServiceError>;
  readonly getDiagnostics: (
    request: TsMorphDiagnosticsRequest
  ) => Effect.Effect<TsMorphDiagnosticsResult, TSMorphServiceError>;
};

/**
 * Service tag for the read-only v1 ts-morph contract.
 */
export class TSMorphService extends ServiceMap.Service<TSMorphService, TSMorphServiceShape>()($I`TSMorphService`) {}

const unavailable = <A>(method: string): Effect.Effect<A, TSMorphServiceError> =>
  Effect.fail(
    new TsMorphServiceUnavailableError({
      method,
      message: `TSMorphService.${method} is not implemented yet. The schema and service contract are available, but the live ts-morph-backed engine still needs to be wired.`,
    })
  );

/**
 * Construct the current placeholder implementation for the v1 TSMorphService contract.
 */
export const createTSMorphService = (): TSMorphServiceShape => ({
  resolveProjectScope: () => unavailable("resolveProjectScope"),
  getFileOutline: () => unavailable("getFileOutline"),
  getSymbolById: () => unavailable("getSymbolById"),
  searchSymbols: () => unavailable("searchSymbols"),
  readSourceText: () => unavailable("readSourceText"),
  readSymbolSource: () => unavailable("readSymbolSource"),
  getDiagnostics: () => unavailable("getDiagnostics"),
});

/**
 * Default live layer for the current placeholder TSMorphService contract.
 */
export const TSMorphServiceLive = Layer.succeed(TSMorphService, TSMorphService.of(createTSMorphService()));
