import { client } from "@beep/iam-sdk/adapters";
import { withFetchOptions } from "@beep/iam-sdk/clients/_internal";
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

const DeviceAuthorizationCodeHandler = DeviceAuthorizationCodeContract.implement(
  Effect.fn(function* (payload, { continuation }) {
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
        continuation.metadata
      );
    }

    return yield* DeviceAuthorizationCodeContract.decodeUnknownSuccess(result.data);
  })
);

const DeviceAuthorizationTokenHandler = DeviceAuthorizationTokenContract.implement(
  Effect.fn(function* (payload, { continuation }) {
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
        continuation.metadata
      );
    }

    return yield* DeviceAuthorizationTokenContract.decodeUnknownSuccess(result.data);
  })
);

const DeviceAuthorizationStatusHandler = DeviceAuthorizationStatusContract.implement(
  Effect.fn(function* (payload, { continuation }) {
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
        continuation.metadata
      );
    }

    return yield* DeviceAuthorizationStatusContract.decodeUnknownSuccess(result.data);
  })
);

const DeviceAuthorizationApproveHandler = DeviceAuthorizationApproveContract.implement(
  Effect.fn(function* (payload, { continuation }) {
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
        continuation.metadata
      );
    }

    return yield* DeviceAuthorizationApproveContract.decodeUnknownSuccess(result.data);
  })
);

const DeviceAuthorizationDenyHandler = DeviceAuthorizationDenyContract.implement(
  Effect.fn(function* (payload, { continuation }) {
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
        continuation.metadata
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
