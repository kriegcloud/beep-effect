import { client } from "@beep/iam-sdk/adapters";
import {
  ApiKeyContractKit,
  ApiKeyCreateContract,
  ApiKeyCreatePayload,
  ApiKeyDeleteContract,
  type ApiKeyDeletePayload,
  ApiKeyGetContract,
  type ApiKeyGetPayload,
  ApiKeyListContract,
  ApiKeyUpdateContract,
  ApiKeyUpdatePayload,
} from "@beep/iam-sdk/clients/api-key/api-key.contracts";
import { makeFailureContinuation } from "@beep/iam-sdk/contract-kit";
import { IamError } from "@beep/iam-sdk/errors";
import { PolicyRecord } from "@beep/shared-domain/Policy";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const ApiKeyCreateMetadata = () =>
  ({
    plugin: "api-key",
    method: "create",
  }) as const;

const encodePermissions = F.flow(
  (permissions: string | null | undefined) => O.fromNullable(permissions),
  O.match({
    onNone: () => Effect.succeed(undefined),
    onSome: (permissions) => S.decode(S.parseJson(PolicyRecord))(permissions),
  })
);

const ApiKeyCreateHandler = Effect.fn("ApiKeyCreateHandler")(
  function* (payload: ApiKeyCreatePayload.Type) {
    const continuation = makeFailureContinuation({
      contract: "ApiKeyCreate",
      metadata: ApiKeyCreateMetadata,
    });

    const encoded = yield* S.encode(ApiKeyCreatePayload)(payload);

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
        fetchOptions: handlers.signal
          ? {
              onError: handlers.onError,
              signal: handlers.signal,
            }
          : {
              onError: handlers.onError,
            },
      })
    );

    yield* continuation.raiseResult(result);

    if (result.data == null) {
      return yield* new IamError({}, "ApiKeyCreateHandler returned no payload from Better Auth", {
        plugin: "api-key",
        method: "create",
      });
    }

    return yield* S.decodeUnknown(ApiKeyCreateContract.successSchema)(result.data);
  },
  Effect.catchTags({
    ParseError: (error) => Effect.fail(IamError.match(error, ApiKeyCreateMetadata())),
  })
);

const ApiKeyGetMetadata = () =>
  ({
    plugin: "api-key",
    method: "get",
  }) as const;

const ApiKeyGetHandler = Effect.fn("ApiKeyGetHandler")(
  function* (payload: ApiKeyGetPayload.Type) {
    const continuation = makeFailureContinuation({
      contract: "ApiKeyGet",
      metadata: ApiKeyGetMetadata,
    });

    const result = yield* continuation.run((handlers) =>
      client.apiKey.get(
        {
          query: {
            id: payload.id,
          },
        },
        handlers.signal
          ? {
              onError: handlers.onError,
              signal: handlers.signal,
            }
          : {
              onError: handlers.onError,
            }
      )
    );

    yield* continuation.raiseResult(result);

    if (result.data == null) {
      return yield* new IamError({}, "ApiKeyGetHandler returned no payload from Better Auth", {
        plugin: "api-key",
        method: "get",
      });
    }

    return yield* S.decodeUnknown(ApiKeyGetContract.successSchema)(result.data);
  },
  Effect.catchTags({
    ParseError: (error) => Effect.fail(IamError.match(error, ApiKeyGetMetadata())),
  })
);

const ApiKeyUpdateMetadata = () =>
  ({
    plugin: "api-key",
    method: "update",
  }) as const;

const ApiKeyUpdateHandler = Effect.fn("ApiKeyUpdateHandler")(
  function* (payload: ApiKeyUpdatePayload.Type) {
    const continuation = makeFailureContinuation({
      contract: "ApiKeyUpdate",
      metadata: ApiKeyUpdateMetadata,
    });

    const encoded = yield* S.encode(ApiKeyUpdatePayload)(payload);

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
        fetchOptions: handlers.signal
          ? {
              onError: handlers.onError,
              signal: handlers.signal,
            }
          : {
              onError: handlers.onError,
            },
      })
    );

    yield* continuation.raiseResult(result);

    if (result.data == null) {
      return yield* new IamError({}, "ApiKeyUpdateHandler returned no payload from Better Auth", {
        plugin: "api-key",
        method: "update",
      });
    }

    return yield* S.decodeUnknown(ApiKeyUpdateContract.successSchema)(result.data);
  },
  Effect.catchTags({
    ParseError: (error) => Effect.fail(IamError.match(error, ApiKeyUpdateMetadata())),
  })
);

const ApiKeyDeleteMetadata = {
  plugin: "api-key",
  method: "delete",
} as const;

const ApiKeyDeleteHandler = Effect.fn("ApiKeyDeleteHandler")(
  function* (payload: ApiKeyDeletePayload.Type) {
    const continuation = makeFailureContinuation({
      contract: "ApiKeyDelete",
      metadata: () => ApiKeyDeleteMetadata,
    });

    const result = yield* continuation.run((handlers) =>
      client.apiKey.delete({
        keyId: payload.keyId,
        fetchOptions: handlers.signal
          ? {
              onError: handlers.onError,
              signal: handlers.signal,
            }
          : {
              onError: handlers.onError,
            },
      })
    );

    yield* continuation.raiseResult(result);

    if (result.data == null) {
      return yield* new IamError({}, "ApiKeyDeleteHandler returned no payload from Better Auth", {
        plugin: "api-key",
        method: "delete",
      });
    }

    return yield* S.decodeUnknown(ApiKeyDeleteContract.successSchema)(result.data);
  },
  Effect.catchTags({
    ParseError: (error) => Effect.fail(IamError.match(error, ApiKeyDeleteMetadata)),
  })
);

const ApiKeyListMetadata = () =>
  ({
    plugin: "api-key",
    method: "list",
  }) as const;

const ApiKeyListHandler = Effect.fn("ApiKeyListHandler")(
  function* () {
    const continuation = makeFailureContinuation({
      contract: "ApiKeyList",
      metadata: ApiKeyListMetadata,
    });

    const result = yield* continuation.run((handlers) =>
      client.apiKey.list(
        undefined,
        handlers.signal
          ? {
              onError: handlers.onError,
              signal: handlers.signal,
            }
          : {
              onError: handlers.onError,
            }
      )
    );

    yield* continuation.raiseResult(result);

    if (result.data == null) {
      return yield* new IamError({}, "ApiKeyListHandler returned no payload from Better Auth", {
        plugin: "api-key",
        method: "list",
      });
    }

    return yield* S.decodeUnknown(ApiKeyListContract.successSchema)(result.data);
  },
  Effect.catchTags({
    ParseError: (error) => Effect.fail(IamError.match(error, ApiKeyListMetadata())),
  })
);

export const ApiKeyImplementations = ApiKeyContractKit.of({
  ApiKeyCreate: ApiKeyCreateHandler,
  ApiKeyGet: ApiKeyGetHandler,
  ApiKeyUpdate: ApiKeyUpdateHandler,
  ApiKeyDelete: ApiKeyDeleteHandler,
  ApiKeyList: ApiKeyListHandler,
});
