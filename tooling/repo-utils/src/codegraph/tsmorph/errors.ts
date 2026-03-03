// cspell:ignore tsmorph
import { $RepoUtilsId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $RepoUtilsId.create("codegraph/tsmorph/errors");

/**
 * Scope resolution failure while deriving tsconfig inputs.
 *
 * @category codegraph-tsmorph
 * @since 0.0.0
 */
export class TsMorphProjectScopeError extends S.TaggedErrorClass<TsMorphProjectScopeError>(
  $I`TsMorphProjectScopeError`
)(
  "TsMorphProjectScopeError",
  {
    message: S.String,
    cause: S.optional(S.Defect),
  },
  $I.annote("TsMorphProjectScopeError", {
    description: "Failed to resolve tsconfig scope for a ts-morph operation.",
  })
) {}

/**
 * Project initialization failure while constructing ts-morph runtime state.
 *
 * @category codegraph-tsmorph
 * @since 0.0.0
 */
export class TsMorphProjectInitError extends S.TaggedErrorClass<TsMorphProjectInitError>($I`TsMorphProjectInitError`)(
  "TsMorphProjectInitError",
  {
    message: S.String,
    cause: S.optional(S.Defect),
  },
  $I.annote("TsMorphProjectInitError", {
    description: "Failed to initialize ts-morph project or type checker state.",
  })
) {}

/**
 * Symbol selector did not resolve to a declaration target.
 *
 * @category codegraph-tsmorph
 * @since 0.0.0
 */
export class TsMorphSymbolNotFoundError extends S.TaggedErrorClass<TsMorphSymbolNotFoundError>(
  $I`TsMorphSymbolNotFoundError`
)(
  "TsMorphSymbolNotFoundError",
  {
    message: S.String,
    symbolId: S.String,
    cause: S.optional(S.Defect),
  },
  $I.annote("TsMorphSymbolNotFoundError", {
    description: "No declaration target was found for the requested symbol selector.",
  })
) {}

/**
 * Declaration target is not supported by an operation.
 *
 * @category codegraph-tsmorph
 * @since 0.0.0
 */
export class TsMorphUnsupportedSymbolError extends S.TaggedErrorClass<TsMorphUnsupportedSymbolError>(
  $I`TsMorphUnsupportedSymbolError`
)(
  "TsMorphUnsupportedSymbolError",
  {
    message: S.String,
    symbolId: S.String,
    kind: S.String,
    cause: S.optional(S.Defect),
  },
  $I.annote("TsMorphUnsupportedSymbolError", {
    description: "The resolved symbol declaration kind is unsupported for this operation.",
  })
) {}

/**
 * Validation failure in a user-supplied JSDoc payload.
 *
 * @category codegraph-tsmorph
 * @since 0.0.0
 */
export class TsMorphValidationError extends S.TaggedErrorClass<TsMorphValidationError>($I`TsMorphValidationError`)(
  "TsMorphValidationError",
  {
    message: S.String,
    cause: S.optional(S.Defect),
  },
  $I.annote("TsMorphValidationError", {
    description: "Input payload validation failed for a ts-morph operation.",
  })
) {}

/**
 * Planning conflict could not be reconciled safely.
 *
 * @category codegraph-tsmorph
 * @since 0.0.0
 */
export class TsMorphWriteConflictError extends S.TaggedErrorClass<TsMorphWriteConflictError>(
  $I`TsMorphWriteConflictError`
)(
  "TsMorphWriteConflictError",
  {
    message: S.String,
    symbolId: S.String,
    tag: S.String,
    cause: S.optional(S.Defect),
  },
  $I.annote("TsMorphWriteConflictError", {
    description: "A write conflict could not be resolved deterministically.",
  })
) {}

/**
 * Failure while applying a JSDoc write plan.
 *
 * @category codegraph-tsmorph
 * @since 0.0.0
 */
export class TsMorphWriteApplyError extends S.TaggedErrorClass<TsMorphWriteApplyError>($I`TsMorphWriteApplyError`)(
  "TsMorphWriteApplyError",
  {
    message: S.String,
    cause: S.optional(S.Defect),
  },
  $I.annote("TsMorphWriteApplyError", {
    description: "Applying a JSDoc write plan failed.",
  })
) {}

/**
 * Failure while extracting graph data from source files.
 *
 * @category codegraph-tsmorph
 * @since 0.0.0
 */
export class TsMorphExtractionError extends S.TaggedErrorClass<TsMorphExtractionError>($I`TsMorphExtractionError`)(
  "TsMorphExtractionError",
  {
    message: S.String,
    cause: S.optional(S.Defect),
  },
  $I.annote("TsMorphExtractionError", {
    description: "Code graph extraction from ts-morph traversal failed.",
  })
) {}

/**
 * Failure while executing symbol search or dependency traversal.
 *
 * @category codegraph-tsmorph
 * @since 0.0.0
 */
export class TsMorphQueryError extends S.TaggedErrorClass<TsMorphQueryError>($I`TsMorphQueryError`)(
  "TsMorphQueryError",
  {
    message: S.String,
    cause: S.optional(S.Defect),
  },
  $I.annote("TsMorphQueryError", {
    description: "Query operation over extracted graph data failed.",
  })
) {}

/**
 * Composite error channel for `TSMorphService` APIs.
 *
 * @category codegraph-tsmorph
 * @since 0.0.0
 */
export type TsMorphServiceError =
  | TsMorphExtractionError
  | TsMorphProjectInitError
  | TsMorphProjectScopeError
  | TsMorphQueryError
  | TsMorphSymbolNotFoundError
  | TsMorphUnsupportedSymbolError
  | TsMorphValidationError
  | TsMorphWriteApplyError
  | TsMorphWriteConflictError;
