import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import * as SchemaIssue from "effect/SchemaIssue";
import type { RpcClientError } from "effect/unstable/rpc";

import * as AcpSchema from "../_generated/schema.gen.ts";
import * as AcpError from "../errors.ts";

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
    Effect.catchIf(S.is(AcpSchema.Error), (error) => Effect.fail(AcpError.AcpRequestError.fromProtocolError(error)))
  );

export const runHandler = Effect.fnUntraced(function* <A, B>(
  handler: ((payload: A) => Effect.Effect<B, AcpError.AcpError>) | undefined,
  payload: A,
  method: string
) {
  if (handler === undefined) {
    return yield* Effect.fail(AcpError.AcpRequestError.methodNotFound(method).toProtocolError());
  }
  return yield* handler(payload).pipe(
    Effect.mapError((error) =>
      S.is(AcpError.AcpRequestError)(error)
        ? error.toProtocolError()
        : AcpError.AcpRequestError.internalError(error.message).toProtocolError()
    )
  );
});

export function decodeExtRequestRegistration<A, I>(
  method: string,
  payload: S.Codec<A, I>,
  handler: (payload: A) => Effect.Effect<unknown, AcpError.AcpError>
) {
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

export function decodeExtNotificationRegistration<A, I>(
  method: string,
  payload: S.Codec<A, I>,
  handler: (payload: A) => Effect.Effect<void, AcpError.AcpError>
) {
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
