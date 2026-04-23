/**
 * Shared status/cause error payload helpers.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { dual } from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";

/**
 * Shared field set for tagged errors that carry a message, HTTP status, and optional defect cause.
 *
 * @example
 * ```ts
 * import { TaggedErrorClass } from "@beep/schema"
 * import { StatusCauseFields } from "@beep/schema/StatusCauseError"
 *
 * class AppError extends TaggedErrorClass<AppError>()("AppError", StatusCauseFields) {}
 *
 * const error = new AppError({
 *   message: "not found",
 *   status: 404
 * })
 *
 * void error
 * ```
 *
 * @category fields
 * @since 0.0.0
 */
export const StatusCauseFields = {
  message: S.String,
  status: S.Number,
  cause: S.OptionFromOptionalKey(S.DefectWithStack),
} as const;

/**
 * Build the payload object expected by errors using {@link StatusCauseFields}.
 *
 * Normalizes an optional raw cause into an `Option`.
 *
 * @example
 * ```ts
 * import { statusCauseInput } from "@beep/schema/StatusCauseError"
 *
 * const payload = statusCauseInput("not found", 404)
 * console.log(payload.message) // "not found"
 * console.log(payload.status)  // 404
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
type StatusCauseInputOptions = {
  readonly status: number;
  readonly cause?: unknown;
};

export type StatusCauseInput = {
  readonly message: string;
  readonly status: number;
  readonly cause: O.Option<unknown>;
};

export const statusCauseInput: {
  (message: string, options: StatusCauseInputOptions): StatusCauseInput;
  (options: StatusCauseInputOptions): (message: string) => StatusCauseInput;
} = dual(2, (message: string, options: StatusCauseInputOptions) => ({
  message,
  status: options.status,
  cause: O.isOption(options.cause) ? options.cause : O.fromUndefinedOr(options.cause),
}));

/**
 * Input payload shape produced by {@link statusCauseInput}.
 *
 * @example
 * ```ts
 * import { statusCauseInput, type StatusCauseInput } from "@beep/schema/StatusCauseError"
 *
 * const payload: StatusCauseInput = statusCauseInput("not found", 404)
 *
 * void payload
 * ```
 *
 * @category models
 * @since 0.0.0
 */
type StatusCauseErrorCtor<Input extends StatusCauseInput, Error> = new (value: Input) => Error;
type StatusCauseContext = {
  readonly message: string;
  readonly status: number;
};
type StatusCauseErrorInput = StatusCauseContext & {
  readonly cause: unknown;
};
type StatusCauseErrorCauseHandler<Error> = (cause: unknown) => Error;
type StatusCauseErrorBuilder<Error> = {
  (input: StatusCauseContext): StatusCauseErrorCauseHandler<Error>;
  (input: StatusCauseErrorInput): Error;
};

const buildStatusCauseError = <Input extends StatusCauseInput, Error>(
  ctor: StatusCauseErrorCtor<Input, Error>,
  message: string,
  status: number,
  cause?: unknown
): Error => new ctor(statusCauseInput(message, { status, cause }) as Input);

const buildStatusCauseErrorBuilder = <Input extends StatusCauseInput, Error>(
  ctor: StatusCauseErrorCtor<Input, Error>
): StatusCauseErrorBuilder<Error> => {
  const fromCause: {
    (input: StatusCauseContext): StatusCauseErrorCauseHandler<Error>;
    (cause: unknown, input: StatusCauseContext): Error;
  } = dual(
    2,
    (cause: unknown, input: StatusCauseContext): Error =>
      buildStatusCauseError(ctor, input.message, input.status, cause)
  );

  return ((input: StatusCauseContext | StatusCauseErrorInput): StatusCauseErrorCauseHandler<Error> | Error =>
    "cause" in input
      ? buildStatusCauseError(ctor, input.message, input.status, input.cause)
      : fromCause({ message: input.message, status: input.status })) as StatusCauseErrorBuilder<Error>;
};

/**
 * Build a tagged error directly or derive a reusable `(message, status, cause?) => Error` builder.
 *
 * Supports multiple calling conventions via `dual`:
 * - `makeStatusCauseError(Ctor)` returns a builder function.
 * - `makeStatusCauseError(Ctor, message, status)` returns a cause handler.
 * - `makeStatusCauseError(Ctor, message, status, cause)` returns the error directly.
 *
 * @example
 * ```ts
 * import { TaggedErrorClass } from "@beep/schema"
 * import { StatusCauseFields, makeStatusCauseError } from "@beep/schema/StatusCauseError"
 *
 * class AppError extends TaggedErrorClass<AppError>()("AppError", StatusCauseFields) {}
 *
 * const build = makeStatusCauseError(AppError)
 * const err = build("not found", 404, new Error("missing"))
 *
 * void err
 *
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const makeStatusCauseError: {
  <Input extends StatusCauseInput, Error>(ctor: StatusCauseErrorCtor<Input, Error>): StatusCauseErrorBuilder<Error>;
  <Input extends StatusCauseInput, Error>(
    ctor: StatusCauseErrorCtor<Input, Error>,
    input: StatusCauseContext
  ): StatusCauseErrorCauseHandler<Error>;
  <Input extends StatusCauseInput, Error>(
    ctor: StatusCauseErrorCtor<Input, Error>,
    input: StatusCauseErrorInput
  ): Error;
  (
    input: StatusCauseContext
  ): <Input extends StatusCauseInput, Error>(
    ctor: StatusCauseErrorCtor<Input, Error>
  ) => StatusCauseErrorCauseHandler<Error>;
  (
    input: StatusCauseErrorInput
  ): <Input extends StatusCauseInput, Error>(ctor: StatusCauseErrorCtor<Input, Error>) => Error;
} = dual(
  (args) => P.isFunction(args[0]),
  function <Input extends StatusCauseInput, Error>(
    ctor: StatusCauseErrorCtor<Input, Error>,
    input?: StatusCauseContext | StatusCauseErrorInput
  ): StatusCauseErrorBuilder<Error> | StatusCauseErrorCauseHandler<Error> | Error {
    const build = buildStatusCauseErrorBuilder(ctor);

    if (arguments.length === 1 || P.isUndefined(input)) {
      return build;
    }

    return build(input);
  }
);
