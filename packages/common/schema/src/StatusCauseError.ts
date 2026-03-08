import * as O from "effect/Option";
import * as S from "effect/Schema";

/**
 * Shared field set for tagged errors that carry a message, transport status, and optional defect cause.
 *
 * @since 0.0.0
 * @category Validation
 */
export const StatusCauseFields = {
  message: S.String,
  status: S.Number,
  cause: S.OptionFromOptionalKey(S.DefectWithStack),
} as const;

/**
 * Normalize optional causes into the shared tagged-error payload shape.
 *
 * @since 0.0.0
 * @category Utility
 */
export const statusCauseInput = (message: string, status: number, cause?: unknown) => ({
  message,
  status,
  cause: O.isOption(cause) ? cause : O.fromUndefinedOr(cause),
});

/**
 * Input payload shape produced by {@link statusCauseInput}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type StatusCauseInput = ReturnType<typeof statusCauseInput>;

type StatusCauseErrorCtor<Input extends StatusCauseInput, Error> = new (value: Input) => Error;

/**
 * Build a `(message, status, cause?) => Error` constructor for a tagged error class using {@link StatusCauseFields}.
 *
 * @since 0.0.0
 * @category Utility
 */
export const makeStatusCauseError =
  <Input extends StatusCauseInput, Error>(ctor: StatusCauseErrorCtor<Input, Error>) =>
  (message: string, status: number, cause?: unknown): Error =>
    new ctor(statusCauseInput(message, status, cause) as Input);
