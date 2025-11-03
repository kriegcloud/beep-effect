import { client } from "@beep/iam-sdk/adapters";
import { MetadataFactory, withFetchOptions } from "@beep/iam-sdk/clients/_internal";
import {
  DeviceAuthorizationApproveContract,
  DeviceAuthorizationCodeContract,
  type DeviceAuthorizationCodePayload,
  DeviceAuthorizationContractKit,
  type DeviceAuthorizationDecisionPayload,
  DeviceAuthorizationDenyContract,
  DeviceAuthorizationStatusContract,
  type DeviceAuthorizationStatusPayload,
  DeviceAuthorizationTokenContract,
  type DeviceAuthorizationTokenPayload,
} from "@beep/iam-sdk/clients/device-authorization/device-authorization.contracts";
import { makeFailureContinuation } from "@beep/iam-sdk/clients/_internal";
import { IamError } from "@beep/iam-sdk/errors";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

const metadataFactory = new MetadataFactory("device-authorization");

const DeviceAuthorizationCodeMetadata = metadataFactory.make("code");

const DeviceAuthorizationTokenMetadata = metadataFactory.make("token");

const DeviceAuthorizationStatusMetadata = metadataFactory.make("status");

const DeviceAuthorizationApproveMetadata = metadataFactory.make("approve");

const DeviceAuthorizationDenyMetadata = metadataFactory.make("deny");

const DeviceAuthorizationCodeHandler = Effect.fn("DeviceAuthorizationCodeHandler")(
  function* (payload: DeviceAuthorizationCodePayload.Type) {
    const continuation = makeFailureContinuation({
      contract: "DeviceAuthorizationCode",
      metadata: DeviceAuthorizationCodeMetadata,
    });

    const result = yield* continuation.run((handlers) =>
      client.device.code({
        client_id: payload.client_id,
        ...(payload.scope === undefined ? {} : { scope: payload.scope }),
        fetchOptions: withFetchOptions(handlers),
      })
    );

    yield* continuation.raiseResult(result);

    if (result.data == null) {
      return yield* new IamError(
        {},
        "DeviceAuthorizationCodeHandler returned no payload from Better Auth",
        DeviceAuthorizationCodeMetadata()
      );
    }

    return yield* S.decodeUnknown(DeviceAuthorizationCodeContract.successSchema)(result.data);
  },
  Effect.catchTags({
    ParseError: (error) => Effect.fail(IamError.match(error, DeviceAuthorizationCodeMetadata())),
  })
);

const DeviceAuthorizationTokenHandler = Effect.fn("DeviceAuthorizationTokenHandler")(
  function* (payload: DeviceAuthorizationTokenPayload.Type) {
    const continuation = makeFailureContinuation({
      contract: "DeviceAuthorizationToken",
      metadata: DeviceAuthorizationTokenMetadata,
    });

    const result = yield* continuation.run((handlers) =>
      client.device.token({
        grant_type: payload.grant_type,
        device_code: payload.device_code,
        client_id: payload.client_id,
        fetchOptions: withFetchOptions(handlers),
      })
    );

    yield* continuation.raiseResult(result);

    if (result.data == null) {
      return yield* new IamError(
        {},
        "DeviceAuthorizationTokenHandler returned no payload from Better Auth",
        DeviceAuthorizationTokenMetadata()
      );
    }

    return yield* S.decodeUnknown(DeviceAuthorizationTokenContract.successSchema)(result.data);
  },
  Effect.catchTags({
    ParseError: (error) => Effect.fail(IamError.match(error, DeviceAuthorizationTokenMetadata())),
  })
);

const DeviceAuthorizationStatusHandler = Effect.fn("DeviceAuthorizationStatusHandler")(
  function* (payload: DeviceAuthorizationStatusPayload.Type) {
    const continuation = makeFailureContinuation({
      contract: "DeviceAuthorizationStatus",
      metadata: DeviceAuthorizationStatusMetadata,
    });

    const result = yield* continuation.run((handlers) =>
      client.device({
        query: {
          user_code: payload.user_code,
        },
        fetchOptions: withFetchOptions(handlers),
      })
    );

    yield* continuation.raiseResult(result);

    if (result.data == null) {
      return yield* new IamError(
        {},
        "DeviceAuthorizationStatusHandler returned no payload from Better Auth",
        DeviceAuthorizationStatusMetadata()
      );
    }

    return yield* S.decodeUnknown(DeviceAuthorizationStatusContract.successSchema)(result.data);
  },
  Effect.catchTags({
    ParseError: (error) => Effect.fail(IamError.match(error, DeviceAuthorizationStatusMetadata())),
  })
);

const DeviceAuthorizationApproveHandler = Effect.fn("DeviceAuthorizationApproveHandler")(
  function* (payload: DeviceAuthorizationDecisionPayload.Type) {
    const continuation = makeFailureContinuation({
      contract: "DeviceAuthorizationApprove",
      metadata: DeviceAuthorizationApproveMetadata,
    });

    const result = yield* continuation.run((handlers) =>
      client.device.approve({
        userCode: payload.userCode,
        fetchOptions: withFetchOptions(handlers),
      })
    );

    yield* continuation.raiseResult(result);

    if (result.data == null) {
      return yield* new IamError(
        {},
        "DeviceAuthorizationApproveHandler returned no payload from Better Auth",
        DeviceAuthorizationApproveMetadata()
      );
    }

    return yield* S.decodeUnknown(DeviceAuthorizationApproveContract.successSchema)(result.data);
  },
  Effect.catchTags({
    ParseError: (error) => Effect.fail(IamError.match(error, DeviceAuthorizationApproveMetadata())),
  })
);

const DeviceAuthorizationDenyHandler = Effect.fn("DeviceAuthorizationDenyHandler")(
  function* (payload: DeviceAuthorizationDecisionPayload.Type) {
    const continuation = makeFailureContinuation({
      contract: "DeviceAuthorizationDeny",
      metadata: DeviceAuthorizationDenyMetadata,
    });

    const result = yield* continuation.run((handlers) =>
      client.device.deny({
        userCode: payload.userCode,
        fetchOptions: withFetchOptions(handlers),
      })
    );

    yield* continuation.raiseResult(result);

    if (result.data == null) {
      return yield* new IamError(
        {},
        "DeviceAuthorizationDenyHandler returned no payload from Better Auth",
        DeviceAuthorizationDenyMetadata()
      );
    }

    return yield* S.decodeUnknown(DeviceAuthorizationDenyContract.successSchema)(result.data);
  },
  Effect.catchTags({
    ParseError: (error) => Effect.fail(IamError.match(error, DeviceAuthorizationDenyMetadata())),
  })
);

export const DeviceAuthorizationImplementations = DeviceAuthorizationContractKit.of({
  DeviceAuthorizationCode: DeviceAuthorizationCodeHandler,
  DeviceAuthorizationToken: DeviceAuthorizationTokenHandler,
  DeviceAuthorizationStatus: DeviceAuthorizationStatusHandler,
  DeviceAuthorizationApprove: DeviceAuthorizationApproveHandler,
  DeviceAuthorizationDeny: DeviceAuthorizationDenyHandler,
});
