import { dual } from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
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
type StatusCauseContext = {
  readonly message: string;
  readonly status: number;
};
type StatusCauseErrorCauseHandler<Error> = (cause: unknown) => Error;
type StatusCauseErrorBuilder<Error> = {
  (message: string, status: number): StatusCauseErrorCauseHandler<Error>;
  (message: string, status: number, cause: unknown): Error;
};

const buildStatusCauseError = <Input extends StatusCauseInput, Error>(
  ctor: StatusCauseErrorCtor<Input, Error>,
  message: string,
  status: number,
  cause?: unknown
): Error => new ctor(statusCauseInput(message, status, cause) as Input);

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

  return function (message: string, status: number, cause?: unknown): StatusCauseErrorCauseHandler<Error> | Error {
    return arguments.length === 2
      ? fromCause({ message, status })
      : buildStatusCauseError(ctor, message, status, cause);
  } as StatusCauseErrorBuilder<Error>;
};

/**
 * Build a tagged error directly or derive a reusable `(message, status, cause) => Error` constructor using
 * {@link StatusCauseFields}.
 *
 * @since 0.0.0
 * @category Utility
 */
export const makeStatusCauseError: {
  <Input extends StatusCauseInput, Error>(ctor: StatusCauseErrorCtor<Input, Error>): StatusCauseErrorBuilder<Error>;
  <Input extends StatusCauseInput, Error>(
    ctor: StatusCauseErrorCtor<Input, Error>,
    message: string,
    status: number
  ): StatusCauseErrorCauseHandler<Error>;
  <Input extends StatusCauseInput, Error>(
    ctor: StatusCauseErrorCtor<Input, Error>,
    message: string,
    status: number,
    cause: unknown
  ): Error;
  (
    message: string,
    status: number
  ): <Input extends StatusCauseInput, Error>(
    ctor: StatusCauseErrorCtor<Input, Error>
  ) => StatusCauseErrorCauseHandler<Error>;
  (
    message: string,
    status: number,
    cause: unknown
  ): <Input extends StatusCauseInput, Error>(ctor: StatusCauseErrorCtor<Input, Error>) => Error;
} = dual(
  (args) => args.length === 1 || P.isFunction(args[0]),
  function <Input extends StatusCauseInput, Error>(
    ctor: StatusCauseErrorCtor<Input, Error>,
    message?: string,
    status?: number,
    cause?: unknown
  ): StatusCauseErrorBuilder<Error> | StatusCauseErrorCauseHandler<Error> | Error {
    const build = buildStatusCauseErrorBuilder(ctor);

    if (arguments.length === 1 || P.isUndefined(message) || P.isUndefined(status)) {
      return build;
    }

    return arguments.length === 3 ? build(message, status) : build(message, status, cause);
  }
);
