import { Effect, SchemaIssue } from "effect";
import * as S from "effect/Schema";
import type { RpcClientError } from "effect/unstable/rpc";
import * as AcpSchema from "../_generated/schema.gen.ts";
import * as AcpError from "../errors.ts";

const isAcpProtocolError = S.is(AcpSchema.Error);
const isAcpRequestError = S.is(AcpError.AcpRequestError);
const formatSchemaIssue = SchemaIssue.makeFormatterDefault();

export const callRpc = <A>(
  effect: Effect.Effect<A, RpcClientError.RpcClientError | AcpSchema.Error>
): Effect.Effect<A, AcpError.AcpError> =>
  effect.pipe(
    Effect.catchTag("RpcClientError", (error) =>
      Effect.fail(
        new AcpError.AcpTransportError({
          detail: error.message,
          cause: error,
        })
      )
    ),
    Effect.catchIf(isAcpProtocolError, (error) => Effect.fail(AcpError.AcpRequestError.fromProtocolError(error)))
  );

interface RunHandlerOptions<A, B> {
  readonly handler: ((payload: A) => Effect.Effect<B, AcpError.AcpError>) | undefined;
  readonly method: string;
  readonly payload: A;
}

interface DecodeExtRequestRegistrationOptions<A, I> {
  readonly handler: (payload: A) => Effect.Effect<unknown, AcpError.AcpError>;
  readonly method: string;
  readonly payload: S.Codec<A, I>;
}

interface DecodeExtNotificationRegistrationOptions<A, I> {
  readonly handler: (payload: A) => Effect.Effect<void, AcpError.AcpError>;
  readonly method: string;
  readonly payload: S.Codec<A, I>;
}

export const runHandler = Effect.fnUntraced(function* <A, B>({ handler, method, payload }: RunHandlerOptions<A, B>) {
  if (handler === undefined) {
    return yield* Effect.fail(AcpError.AcpRequestError.methodNotFound(method).toProtocolError());
  }
  return yield* handler(payload).pipe(
    Effect.mapError((error) =>
      isAcpRequestError(error)
        ? error.toProtocolError()
        : AcpError.AcpRequestError.internalError(error.message).toProtocolError()
    )
  );
});

export function decodeExtRequestRegistration<A, I>({
  handler,
  method,
  payload,
}: DecodeExtRequestRegistrationOptions<A, I>) {
  return (params: unknown): Effect.Effect<unknown, AcpError.AcpError> =>
    S.decodeUnknownEffect(payload)(params).pipe(
      Effect.mapError((error) =>
        AcpError.AcpRequestError.invalidParams(`Invalid ${method} payload: ${formatSchemaIssue(error.issue)}`, {
          issue: error.issue,
        })
      ),
      Effect.flatMap((decoded) => handler(decoded))
    );
}

export function decodeExtNotificationRegistration<A, I>({
  handler,
  method,
  payload,
}: DecodeExtNotificationRegistrationOptions<A, I>) {
  return (params: unknown): Effect.Effect<void, AcpError.AcpError> =>
    S.decodeUnknownEffect(payload)(params).pipe(
      Effect.mapError(
        (error) =>
          new AcpError.AcpProtocolParseError({
            detail: `Invalid ${method} notification payload: ${formatSchemaIssue(error.issue)}`,
            cause: error,
          })
      ),
      Effect.flatMap((decoded) => handler(decoded))
    );
}
