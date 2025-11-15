import { client } from "@beep/iam-sdk/adapters";
import { withFetchOptions } from "@beep/iam-sdk/clients/_internal";
import {
  ApiKeyContractKit,
  ApiKeyCreateContract,
  ApiKeyDeleteContract,
  ApiKeyGetContract,
  ApiKeyListContract,
  ApiKeyUpdateContract,
} from "@beep/iam-sdk/clients/api-key/api-key.contracts";
import { IamError } from "@beep/iam-sdk/errors";
import { PolicyRecord } from "@beep/shared-domain/Policy";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const encodePermissions = F.flow(
  (permissions: string | null | undefined) => O.fromNullable(permissions),
  O.match({
    onNone: () => Effect.succeed(undefined),
    onSome: (permissions) => S.decode(S.parseJson(PolicyRecord))(permissions),
  })
);

const ApiKeyCreateHandler = ApiKeyCreateContract.implement(
  Effect.fn(
    function* (payload, { continuation }) {
      const encoded = yield* ApiKeyCreateContract.encodePayload(payload);

      const permissionsEncoded = yield* encodePermissions(encoded.permissions);

      const result = yield* continuation.run((handlers) =>
        client.apiKey.create({
          name: encoded.name ?? undefined,
          expiresIn: encoded.expiresIn,
          userId: encoded.userId,
          prefix: encoded.prefix ?? undefined,
          remaining: encoded.remaining,
          metadata: encoded.metadata,
          refillAmount: encoded.refillAmount ?? undefined,
          refillInterval: encoded.refillInterval ?? undefined,
          rateLimitTimeWindow: encoded.rateLimitTimeWindow,
          rateLimitMax: encoded.rateLimitMax,
          rateLimitEnabled: encoded.rateLimitEnabled,
          permissions: permissionsEncoded,
          fetchOptions: withFetchOptions(handlers),
        })
      );

      yield* continuation.raiseResult(result);

      if (result.data == null) {
        return yield* new IamError(
          {},
          "ApiKeyCreateHandler returned no payload from Better Auth",
          continuation.metadata
        );
      }

      return yield* ApiKeyCreateContract.decodeUnknownSuccess(result.data);
    },
    Effect.catchTags({
      ParseError: (error) => Effect.fail(IamError.match(error)),
    })
  )
);

const ApiKeyGetHandler = ApiKeyGetContract.implement(
  Effect.fn(function* (payload, { continuation }) {
    const result = yield* continuation.run((handlers) =>
      client.apiKey.get(
        {
          query: {
            id: payload.id,
          },
        },
        withFetchOptions(handlers)
      )
    );

    yield* continuation.raiseResult(result);

    if (result.data == null) {
      return yield* new IamError({}, "ApiKeyGetHandler returned no payload from Better Auth", continuation.metadata);
    }

    return yield* ApiKeyGetContract.decodeUnknownSuccess(result.data);
  })
);

const ApiKeyUpdateHandler = ApiKeyUpdateContract.implement(
  Effect.fn(
    function* (payload, { continuation }) {
      const encoded = yield* ApiKeyUpdateContract.encodePayload(payload);

      const permissionsEncoded = yield* encodePermissions(encoded.permissions);

      const result = yield* continuation.run((handlers) =>
        client.apiKey.update({
          keyId: encoded.keyId,
          userId: encoded.userId,
          name: encoded.name ?? undefined,
          enabled: encoded.enabled,
          remaining: encoded.remaining ?? undefined,
          refillAmount: encoded.refillAmount ?? undefined,
          refillInterval: encoded.refillInterval ?? undefined,
          metadata: encoded.metadata,
          expiresIn: encoded.expiresIn,
          rateLimitEnabled: encoded.rateLimitEnabled,
          rateLimitTimeWindow: encoded.rateLimitTimeWindow,
          rateLimitMax: encoded.rateLimitMax,
          permissions: permissionsEncoded,
          fetchOptions: withFetchOptions(handlers),
        })
      );

      yield* continuation.raiseResult(result);

      if (result.data == null) {
        return yield* new IamError(
          {},
          "ApiKeyUpdateHandler returned no payload from Better Auth",
          continuation.metadata
        );
      }

      return yield* ApiKeyUpdateContract.decodeUnknownSuccess(result.data);
    },
    Effect.catchTags({
      ParseError: (error) => Effect.fail(IamError.match(error)),
    })
  )
);

const ApiKeyDeleteHandler = ApiKeyDeleteContract.implement(
  Effect.fn(function* (payload, { continuation }) {
    const result = yield* continuation.run((handlers) =>
      client.apiKey.delete({
        keyId: payload.keyId,
        fetchOptions: withFetchOptions(handlers),
      })
    );

    yield* continuation.raiseResult(result);

    if (result.data == null) {
      return yield* new IamError({}, "ApiKeyDeleteHandler returned no payload from Better Auth", continuation.metadata);
    }

    return yield* ApiKeyDeleteContract.decodeUnknownSuccess(result.data);
  })
);

const ApiKeyListHandler = ApiKeyListContract.implement(
  Effect.fn(function* (_, { continuation }) {
    const result = yield* continuation.run((handlers) => client.apiKey.list(undefined, withFetchOptions(handlers)));

    yield* continuation.raiseResult(result);

    if (result.data == null) {
      return yield* new IamError({}, "ApiKeyListHandler returned no payload from Better Auth", continuation.metadata);
    }

    return yield* ApiKeyListContract.decodeUnknownSuccess(result.data);
  })
);

export const ApiKeyImplementations = ApiKeyContractKit.of({
  ApiKeyCreate: ApiKeyCreateHandler,
  ApiKeyGet: ApiKeyGetHandler,
  ApiKeyUpdate: ApiKeyUpdateHandler,
  ApiKeyDelete: ApiKeyDeleteHandler,
  ApiKeyList: ApiKeyListHandler,
});
