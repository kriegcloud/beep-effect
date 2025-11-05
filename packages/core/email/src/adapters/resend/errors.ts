import * as Data from "effect/Data";
import * as Match from "effect/Match";
import * as S from "effect/Schema";

const makeResendErrorMember = <ErrorCodeKey extends string>(codeKey: ErrorCodeKey) =>
  S.Struct({
    message: S.String,
    name: S.Literal(codeKey),
  });

export const ResendErrorSchema = S.Union(
  makeResendErrorMember("missing_required_field"),
  makeResendErrorMember("invalid_idempotency_key"),
  makeResendErrorMember("invalid_idempotent_request"),
  makeResendErrorMember("concurrent_idempotent_requests"),
  makeResendErrorMember("invalid_access"),
  makeResendErrorMember("invalid_parameter"),
  makeResendErrorMember("invalid_region"),
  makeResendErrorMember("rate_limit_exceeded"),
  makeResendErrorMember("missing_api_key"),
  makeResendErrorMember("invalid_api_key"),
  makeResendErrorMember("invalid_from_address"),
  makeResendErrorMember("validation_error"),
  makeResendErrorMember("not_found"),
  makeResendErrorMember("method_not_allowed"),
  makeResendErrorMember("application_error"),
  makeResendErrorMember("internal_server_error")
);

export type ResendErrorResponse = typeof ResendErrorSchema.Type;

export class ResendError extends Data.TaggedError("ResendError")<{
  readonly error: ResendErrorResponse;
  readonly input: unknown;
}> {
  constructor(error: ResendErrorResponse, input: unknown) {
    super({ error, input });
  }
}

export class UnknownResendError extends Data.TaggedError("UnknownResendError")<{
  readonly cause: unknown;
  readonly input: unknown;
}> {}

export const matchResendError = (error: unknown, input: unknown) => {
  if (S.is(ResendErrorSchema)(error)) {
    return Match.value(error).pipe(
      Match.discriminators("name")({
        missing_required_field: (e) => new ResendError(e, input),
        invalid_idempotency_key: (e) => new ResendError(e, input),
        invalid_idempotent_request: (e) => new ResendError(e, input),
        concurrent_idempotent_requests: (e) => new ResendError(e, input),
        invalid_access: (e) => new ResendError(e, input),
        invalid_parameter: (e) => new ResendError(e, input),
        invalid_region: (e) => new ResendError(e, input),
        rate_limit_exceeded: (e) => new ResendError(e, input),
        missing_api_key: (e) => new ResendError(e, input),
        invalid_api_key: (e) => new ResendError(e, input),
        invalid_from_address: (e) => new ResendError(e, input),
        validation_error: (e) => new ResendError(e, input),
        not_found: (e) => new ResendError(e, input),
        method_not_allowed: (e) => new ResendError(e, input),
        application_error: (e) => new ResendError(e, input),
        internal_server_error: (e) => new ResendError(e, input),
      }),
      Match.orElse(() => new UnknownResendError({ cause: error, input }))
    );
  }
  return new UnknownResendError({ cause: error, input });
};
