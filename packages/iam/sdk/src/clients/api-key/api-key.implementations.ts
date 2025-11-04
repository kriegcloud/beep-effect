import { client } from "@beep/iam-sdk/adapters";
import { MetadataFactory, makeFailureContinuation, withFetchOptions } from "@beep/iam-sdk/clients/_internal";
import type { ApiKeyDeletePayload, ApiKeyGetPayload } from "@beep/iam-sdk/clients/api-key/api-key.contracts";
import {
  ApiKeyContractKit,
  ApiKeyCreateContract,
  ApiKeyCreatePayload,
  ApiKeyDeleteContract,
  ApiKeyGetContract,
  ApiKeyListContract,
  ApiKeyUpdateContract,
  ApiKeyUpdatePayload,
} from "@beep/iam-sdk/clients/api-key/api-key.contracts";
import { IamError } from "@beep/iam-sdk/errors";
import { PolicyRecord } from "@beep/shared-domain/Policy";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const metadataFactory = new MetadataFactory("api-key");

const ApiKeyCreateMetadata = metadataFactory.make("create");

const ApiKeyGetMetadata = metadataFactory.make("get");

const ApiKeyUpdateMetadata = metadataFactory.make("update");

const ApiKeyDeleteMetadata = metadataFactory.make("delete");

const ApiKeyListMetadata = metadataFactory.make("list");

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
        fetchOptions: withFetchOptions(handlers),
      })
    );

    yield* continuation.raiseResult(result);

    if (result.data == null) {
      return yield* new IamError(
        {},
        "ApiKeyCreateHandler returned no payload from Better Auth",
        ApiKeyCreateMetadata()
      );
    }

    return yield* S.decodeUnknown(ApiKeyCreateContract.successSchema)(result.data);
  },
  Effect.catchTags({
    ParseError: (error) => Effect.fail(IamError.match(error, ApiKeyCreateMetadata())),
  })
);

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
        withFetchOptions(handlers)
      )
    );

    yield* continuation.raiseResult(result);

    if (result.data == null) {
      return yield* new IamError({}, "ApiKeyGetHandler returned no payload from Better Auth", ApiKeyGetMetadata());
    }

    return yield* S.decodeUnknown(ApiKeyGetContract.successSchema)(result.data);
  },
  Effect.catchTags({
    ParseError: (error) => Effect.fail(IamError.match(error, ApiKeyGetMetadata())),
  })
);

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
        fetchOptions: withFetchOptions(handlers),
      })
    );

    yield* continuation.raiseResult(result);

    if (result.data == null) {
      return yield* new IamError(
        {},
        "ApiKeyUpdateHandler returned no payload from Better Auth",
        ApiKeyUpdateMetadata()
      );
    }

    return yield* S.decodeUnknown(ApiKeyUpdateContract.successSchema)(result.data);
  },
  Effect.catchTags({
    ParseError: (error) => Effect.fail(IamError.match(error, ApiKeyUpdateMetadata())),
  })
);

const ApiKeyDeleteHandler = Effect.fn("ApiKeyDeleteHandler")(
  function* (payload: ApiKeyDeletePayload.Type) {
    const continuation = makeFailureContinuation({
      contract: "ApiKeyDelete",
      metadata: ApiKeyDeleteMetadata,
    });

    const result = yield* continuation.run((handlers) =>
      client.apiKey.delete({
        keyId: payload.keyId,
        fetchOptions: withFetchOptions(handlers),
      })
    );

    yield* continuation.raiseResult(result);

    if (result.data == null) {
      return yield* new IamError(
        {},
        "ApiKeyDeleteHandler returned no payload from Better Auth",
        ApiKeyDeleteMetadata()
      );
    }

    return yield* S.decodeUnknown(ApiKeyDeleteContract.successSchema)(result.data);
  },
  Effect.catchTags({
    ParseError: (error) => Effect.fail(IamError.match(error, ApiKeyDeleteMetadata())),
  })
);

const ApiKeyListHandler = Effect.fn("ApiKeyListHandler")(
  function* () {
    const continuation = makeFailureContinuation({
      contract: "ApiKeyList",
      metadata: ApiKeyListMetadata,
    });

    const result = yield* continuation.run((handlers) => client.apiKey.list(undefined, withFetchOptions(handlers)));

    yield* continuation.raiseResult(result);

    if (result.data == null) {
      return yield* new IamError({}, "ApiKeyListHandler returned no payload from Better Auth", ApiKeyListMetadata());
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
