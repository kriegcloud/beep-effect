import { client } from "@beep/iam-sdk/adapters";
import { MetadataFactory, makeFailureContinuation, withFetchOptions } from "@beep/iam-sdk/clients/_internal";
import {
  DeviceAuthorizationApproveContract,
  DeviceAuthorizationCodeContract,
  DeviceAuthorizationContractKit,
  DeviceAuthorizationDenyContract,
  DeviceAuthorizationStatusContract,
  DeviceAuthorizationTokenContract,
} from "@beep/iam-sdk/clients/device-authorization/device-authorization.contracts";
import { IamError } from "@beep/iam-sdk/errors";
import * as Effect from "effect/Effect";

const metadataFactory = new MetadataFactory("device-authorization");

const DeviceAuthorizationCodeMetadata = metadataFactory.make("code");

const DeviceAuthorizationTokenMetadata = metadataFactory.make("token");

const DeviceAuthorizationStatusMetadata = metadataFactory.make("status");

const DeviceAuthorizationApproveMetadata = metadataFactory.make("approve");

const DeviceAuthorizationDenyMetadata = metadataFactory.make("deny");

const DeviceAuthorizationCodeHandler = DeviceAuthorizationCodeContract.implement(
  Effect.fn(function* (payload) {
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

    return yield* DeviceAuthorizationCodeContract.decodeUnknownSuccess(result.data);
  })
);

const DeviceAuthorizationTokenHandler = DeviceAuthorizationTokenContract.implement(
  Effect.fn(function* (payload) {
    const continuation = makeFailureContinuation({
      contract: DeviceAuthorizationTokenContract.name,
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

    return yield* DeviceAuthorizationTokenContract.decodeUnknownSuccess(result.data);
  })
);

const DeviceAuthorizationStatusHandler = DeviceAuthorizationStatusContract.implement(
  Effect.fn(function* (payload) {
    const continuation = makeFailureContinuation({
      contract: DeviceAuthorizationStatusContract.name,
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

    return yield* DeviceAuthorizationStatusContract.decodeUnknownSuccess(result.data);
  })
);

const DeviceAuthorizationApproveHandler = DeviceAuthorizationApproveContract.implement(
  Effect.fn(function* (payload) {
    const continuation = makeFailureContinuation({
      contract: DeviceAuthorizationApproveContract.name,
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

    return yield* DeviceAuthorizationApproveContract.decodeUnknownSuccess(result.data);
  })
);

const DeviceAuthorizationDenyHandler = DeviceAuthorizationDenyContract.implement(
  Effect.fn(function* (payload) {
    const continuation = makeFailureContinuation({
      contract: DeviceAuthorizationDenyContract.name,
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

    return yield* DeviceAuthorizationDenyContract.decodeUnknownSuccess(result.data);
  })
);

export const DeviceAuthorizationImplementations = DeviceAuthorizationContractKit.of({
  DeviceAuthorizationCode: DeviceAuthorizationCodeHandler,
  DeviceAuthorizationToken: DeviceAuthorizationTokenHandler,
  DeviceAuthorizationStatus: DeviceAuthorizationStatusHandler,
  DeviceAuthorizationApprove: DeviceAuthorizationApproveHandler,
  DeviceAuthorizationDeny: DeviceAuthorizationDenyHandler,
});
