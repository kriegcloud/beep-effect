/**
 * Tagged error types for ReCaptcha v3 operations.
 * @module
 */

import { $SharedClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $SharedClientId.create("services/react-recaptcha-v3/errors");

/**
 * Error thrown when ReCaptcha script fails to load.
 *
 * @category Errors
 * @since 0.1.0
 */
export class ReCaptchaScriptLoadError extends S.TaggedError<ReCaptchaScriptLoadError>($I`ReCaptchaScriptLoadError`)(
  "ReCaptchaScriptLoadError",
  {
    message: S.String,
    src: S.String,
    cause: S.optional(S.Unknown),
  }
) {}

/** @since 0.1.0 @category Errors */
export declare namespace ReCaptchaScriptLoadError {
  /** @since 0.1.0 */
  export type Type = S.Schema.Type<typeof ReCaptchaScriptLoadError>;
  /** @since 0.1.0 */
  export type Encoded = S.Schema.Encoded<typeof ReCaptchaScriptLoadError>;
}

/**
 * Error thrown when attempting to load ReCaptcha with different parameters.
 *
 * @category Errors
 * @since 0.1.0
 */
export class ReCaptchaAlreadyLoadedError extends S.TaggedError<ReCaptchaAlreadyLoadedError>(
  $I`ReCaptchaAlreadyLoadedError`
)("ReCaptchaAlreadyLoadedError", {
  message: S.String,
  existingUrl: S.String,
  requestedUrl: S.String,
}) {}

/** @since 0.1.0 @category Errors */
export declare namespace ReCaptchaAlreadyLoadedError {
  /** @since 0.1.0 */
  export type Type = S.Schema.Type<typeof ReCaptchaAlreadyLoadedError>;
  /** @since 0.1.0 */
  export type Encoded = S.Schema.Encoded<typeof ReCaptchaAlreadyLoadedError>;
}

/**
 * Error thrown when ReCaptcha is not ready.
 *
 * @category Errors
 * @since 0.1.0
 */
export class ReCaptchaNotReadyError extends S.TaggedError<ReCaptchaNotReadyError>($I`ReCaptchaNotReadyError`)(
  "ReCaptchaNotReadyError",
  {
    message: S.String,
  }
) {}

/** @since 0.1.0 @category Errors */
export declare namespace ReCaptchaNotReadyError {
  /** @since 0.1.0 */
  export type Type = S.Schema.Type<typeof ReCaptchaNotReadyError>;
  /** @since 0.1.0 */
  export type Encoded = S.Schema.Encoded<typeof ReCaptchaNotReadyError>;
}

/**
 * Error thrown when ReCaptcha instance is not found.
 *
 * @category Errors
 * @since 0.1.0
 */
export class ReCaptchaNotFoundError extends S.TaggedError<ReCaptchaNotFoundError>($I`ReCaptchaNotFoundError`)(
  "ReCaptchaNotFoundError",
  {
    message: S.String,
  }
) {}

/** @since 0.1.0 @category Errors */
export declare namespace ReCaptchaNotFoundError {
  /** @since 0.1.0 */
  export type Type = S.Schema.Type<typeof ReCaptchaNotFoundError>;
  /** @since 0.1.0 */
  export type Encoded = S.Schema.Encoded<typeof ReCaptchaNotFoundError>;
}

/**
 * Error thrown when ReCaptcha container element is not found.
 *
 * @category Errors
 * @since 0.1.0
 */
export class ReCaptchaContainerNotFoundError extends S.TaggedError<ReCaptchaContainerNotFoundError>(
  $I`ReCaptchaContainerNotFoundError`
)("ReCaptchaContainerNotFoundError", {
  message: S.String,
  selector: S.String,
}) {}

/** @since 0.1.0 @category Errors */
export declare namespace ReCaptchaContainerNotFoundError {
  /** @since 0.1.0 */
  export type Type = S.Schema.Type<typeof ReCaptchaContainerNotFoundError>;
  /** @since 0.1.0 */
  export type Encoded = S.Schema.Encoded<typeof ReCaptchaContainerNotFoundError>;
}

/**
 * Error thrown when ReCaptcha execution fails.
 *
 * @category Errors
 * @since 0.1.0
 */
export class ReCaptchaExecutionError extends S.TaggedError<ReCaptchaExecutionError>($I`ReCaptchaExecutionError`)(
  "ReCaptchaExecutionError",
  {
    message: S.String,
    action: S.optional(S.String),
    cause: S.optional(S.Unknown),
  }
) {}

/** @since 0.1.0 @category Errors */
export declare namespace ReCaptchaExecutionError {
  /** @since 0.1.0 */
  export type Type = S.Schema.Type<typeof ReCaptchaExecutionError>;
  /** @since 0.1.0 */
  export type Encoded = S.Schema.Encoded<typeof ReCaptchaExecutionError>;
}

/**
 * Error thrown when ReCaptcha client is not mounted.
 *
 * @category Errors
 * @since 0.1.0
 */
export class ReCaptchaClientNotMountedError extends S.TaggedError<ReCaptchaClientNotMountedError>(
  $I`ReCaptchaClientNotMountedError`
)("ReCaptchaClientNotMountedError", {
  message: S.String,
}) {}

/** @since 0.1.0 @category Errors */
export declare namespace ReCaptchaClientNotMountedError {
  /** @since 0.1.0 */
  export type Type = S.Schema.Type<typeof ReCaptchaClientNotMountedError>;
  /** @since 0.1.0 */
  export type Encoded = S.Schema.Encoded<typeof ReCaptchaClientNotMountedError>;
}

/**
 * Union of all ReCaptcha errors.
 *
 * @category Errors
 * @since 0.1.0
 */
export type ReCaptchaError =
  | ReCaptchaScriptLoadError
  | ReCaptchaAlreadyLoadedError
  | ReCaptchaNotReadyError
  | ReCaptchaNotFoundError
  | ReCaptchaContainerNotFoundError
  | ReCaptchaExecutionError
  | ReCaptchaClientNotMountedError;

/**
 * Schema for ReCaptcha error union (for serialization).
 *
 * @category Schemas
 * @since 0.1.0
 */
export const ReCaptchaErrorSchema = S.Union(
  ReCaptchaScriptLoadError,
  ReCaptchaAlreadyLoadedError,
  ReCaptchaNotReadyError,
  ReCaptchaNotFoundError,
  ReCaptchaContainerNotFoundError,
  ReCaptchaExecutionError,
  ReCaptchaClientNotMountedError
).annotations(
  $I.annotations("ReCaptchaErrorSchema", {
    description: "Schema for ReCaptcha error union (for serialization).",
  })
);

/** @since 0.1.0 @category Schemas */
export declare namespace ReCaptchaErrorSchema {
  /** @since 0.1.0 */
  export type Type = S.Schema.Type<typeof ReCaptchaErrorSchema>;
  /** @since 0.1.0 */
  export type Encoded = S.Schema.Encoded<typeof ReCaptchaErrorSchema>;
}
