import { client } from "@beep/iam-sdk/adapters";
import {
  ApiKeyContractSet,
  ApiKeyCreateContract,
  type ApiKeyCreatePayload,
  ApiKeyDeleteContract,
  type ApiKeyDeletePayload,
  ApiKeyGetContract,
  type ApiKeyGetPayload,
  ApiKeyListContract,
  ApiKeyUpdateContract,
  type ApiKeyUpdatePayload,
} from "@beep/iam-sdk/clients/api-key/api-key.contracts";
import { makeFailureContinuation } from "@beep/iam-sdk/contract-kit";
import { IamError } from "@beep/iam-sdk/errors";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

const ApiKeyCreateHandler = Effect.fn("ApiKeyCreateHandler")(
  function* (payload: ApiKeyCreatePayload.Type) {
    const continuation = makeFailureContinuation({
      contract: "ApiKeyCreate",
      metadata: () => ({
        plugin: "api-key",
        method: "create",
      }),
    });

    const result = yield* continuation.run((handlers) =>
      client.apiKey.create({
        ...(payload.name === undefined ? {} : { name: payload.name }),
        ...(payload.expiresIn === undefined ? {} : { expiresIn: payload.expiresIn }),
        ...(payload.userId === undefined ? {} : { userId: payload.userId }),
        ...(payload.prefix === undefined ? {} : { prefix: payload.prefix }),
        ...(payload.remaining === undefined ? {} : { remaining: payload.remaining }),
        ...(payload.metadata === undefined ? {} : { metadata: payload.metadata }),
        ...(payload.refillAmount === undefined ? {} : { refillAmount: payload.refillAmount }),
        ...(payload.refillInterval === undefined ? {} : { refillInterval: payload.refillInterval }),
        ...(payload.rateLimitTimeWindow === undefined ? {} : { rateLimitTimeWindow: payload.rateLimitTimeWindow }),
        ...(payload.rateLimitMax === undefined ? {} : { rateLimitMax: payload.rateLimitMax }),
        ...(payload.rateLimitEnabled === undefined ? {} : { rateLimitEnabled: payload.rateLimitEnabled }),
        ...(payload.permissions === undefined ? {} : { permissions: payload.permissions }),
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
    ParseError: (error) => Effect.dieMessage(`ApiKeyCreateHandler failed to parse response: ${error.message}`),
  })
);

const ApiKeyGetHandler = Effect.fn("ApiKeyGetHandler")(
  function* (payload: ApiKeyGetPayload.Type) {
    const continuation = makeFailureContinuation({
      contract: "ApiKeyGet",
      metadata: () => ({
        plugin: "api-key",
        method: "get",
      }),
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
    ParseError: (error) => Effect.dieMessage(`ApiKeyGetHandler failed to parse response: ${error.message}`),
  })
);

const ApiKeyUpdateHandler = Effect.fn("ApiKeyUpdateHandler")(
  function* (payload: ApiKeyUpdatePayload.Type) {
    const continuation = makeFailureContinuation({
      contract: "ApiKeyUpdate",
      metadata: () => ({
        plugin: "api-key",
        method: "update",
      }),
    });

    const result = yield* continuation.run((handlers) =>
      client.apiKey.update({
        keyId: payload.keyId,
        ...(payload.userId === undefined ? {} : { userId: payload.userId }),
        ...(payload.name === undefined ? {} : { name: payload.name }),
        ...(payload.enabled === undefined ? {} : { enabled: payload.enabled }),
        ...(payload.remaining === undefined ? {} : { remaining: payload.remaining }),
        ...(payload.refillAmount === undefined ? {} : { refillAmount: payload.refillAmount }),
        ...(payload.refillInterval === undefined ? {} : { refillInterval: payload.refillInterval }),
        ...(payload.metadata === undefined ? {} : { metadata: payload.metadata }),
        ...(payload.expiresIn === undefined ? {} : { expiresIn: payload.expiresIn }),
        ...(payload.rateLimitEnabled === undefined ? {} : { rateLimitEnabled: payload.rateLimitEnabled }),
        ...(payload.rateLimitTimeWindow === undefined ? {} : { rateLimitTimeWindow: payload.rateLimitTimeWindow }),
        ...(payload.rateLimitMax === undefined ? {} : { rateLimitMax: payload.rateLimitMax }),
        ...(payload.permissions === undefined ? {} : { permissions: payload.permissions }),
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
    ParseError: (error) => Effect.dieMessage(`ApiKeyUpdateHandler failed to parse response: ${error.message}`),
  })
);

const ApiKeyDeleteHandler = Effect.fn("ApiKeyDeleteHandler")(
  function* (payload: ApiKeyDeletePayload.Type) {
    const continuation = makeFailureContinuation({
      contract: "ApiKeyDelete",
      metadata: () => ({
        plugin: "api-key",
        method: "delete",
      }),
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
    ParseError: (error) => Effect.dieMessage(`ApiKeyDeleteHandler failed to parse response: ${error.message}`),
  })
);

const ApiKeyListHandler = Effect.fn("ApiKeyListHandler")(
  function* () {
    const continuation = makeFailureContinuation({
      contract: "ApiKeyList",
      metadata: () => ({
        plugin: "api-key",
        method: "list",
      }),
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
    ParseError: (error) => Effect.dieMessage(`ApiKeyListHandler failed to parse response: ${error.message}`),
  })
);

export const ApiKeyImplementations = ApiKeyContractSet.of({
  ApiKeyCreate: ApiKeyCreateHandler,
  ApiKeyGet: ApiKeyGetHandler,
  ApiKeyUpdate: ApiKeyUpdateHandler,
  ApiKeyDelete: ApiKeyDeleteHandler,
  ApiKeyList: ApiKeyListHandler,
});
