import { client } from "@beep/iam-sdk/adapters";
import {
  DeviceAuthorizationApproveContract,
  DeviceAuthorizationCodeContract,
  type DeviceAuthorizationCodePayload,
  DeviceAuthorizationContractSet,
  type DeviceAuthorizationDecisionPayload,
  DeviceAuthorizationDenyContract,
  DeviceAuthorizationStatusContract,
  type DeviceAuthorizationStatusPayload,
  DeviceAuthorizationTokenContract,
  type DeviceAuthorizationTokenPayload,
} from "@beep/iam-sdk/clients/device-authorization/device-authorization.contracts";
import { makeFailureContinuation } from "@beep/iam-sdk/contract-kit";
import { IamError } from "@beep/iam-sdk/errors";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

const DeviceAuthorizationCodeHandler = Effect.fn("DeviceAuthorizationCodeHandler")(
  function* (payload: DeviceAuthorizationCodePayload.Type) {
    const continuation = makeFailureContinuation({
      contract: "DeviceAuthorizationCode",
      metadata: () => ({
        plugin: "device-authorization",
        method: "code",
      }),
    });

    const result = yield* continuation.run((handlers) =>
      client.device.code({
        client_id: payload.client_id,
        ...(payload.scope === undefined ? {} : { scope: payload.scope }),
        fetchOptions: handlers.signal
          ? { onError: handlers.onError, signal: handlers.signal }
          : { onError: handlers.onError },
      })
    );

    yield* continuation.raiseResult(result);

    if (result.data == null) {
      return yield* new IamError({}, "DeviceAuthorizationCodeHandler returned no payload from Better Auth", {
        plugin: "device-authorization",
        method: "code",
      });
    }

    return yield* S.decodeUnknown(DeviceAuthorizationCodeContract.successSchema)(result.data);
  },
  Effect.catchTags({
    ParseError: (error) =>
      Effect.dieMessage(`DeviceAuthorizationCodeHandler failed to parse response: ${error.message}`),
  })
);

const DeviceAuthorizationTokenHandler = Effect.fn("DeviceAuthorizationTokenHandler")(
  function* (payload: DeviceAuthorizationTokenPayload.Type) {
    const continuation = makeFailureContinuation({
      contract: "DeviceAuthorizationToken",
      metadata: () => ({
        plugin: "device-authorization",
        method: "token",
      }),
    });

    const result = yield* continuation.run((handlers) =>
      client.device.token({
        grant_type: payload.grant_type,
        device_code: payload.device_code,
        client_id: payload.client_id,
        fetchOptions: handlers.signal
          ? { onError: handlers.onError, signal: handlers.signal }
          : { onError: handlers.onError },
      })
    );

    yield* continuation.raiseResult(result);

    if (result.data == null) {
      return yield* new IamError({}, "DeviceAuthorizationTokenHandler returned no payload from Better Auth", {
        plugin: "device-authorization",
        method: "token",
      });
    }

    return yield* S.decodeUnknown(DeviceAuthorizationTokenContract.successSchema)(result.data);
  },
  Effect.catchTags({
    ParseError: (error) =>
      Effect.dieMessage(`DeviceAuthorizationTokenHandler failed to parse response: ${error.message}`),
  })
);

const DeviceAuthorizationStatusHandler = Effect.fn("DeviceAuthorizationStatusHandler")(
  function* (payload: DeviceAuthorizationStatusPayload.Type) {
    const continuation = makeFailureContinuation({
      contract: "DeviceAuthorizationStatus",
      metadata: () => ({
        plugin: "device-authorization",
        method: "status",
      }),
    });

    const result = yield* continuation.run((handlers) =>
      client.device({
        query: {
          user_code: payload.user_code,
        },
        fetchOptions: handlers.signal
          ? { onError: handlers.onError, signal: handlers.signal }
          : { onError: handlers.onError },
      })
    );

    yield* continuation.raiseResult(result);

    if (result.data == null) {
      return yield* new IamError({}, "DeviceAuthorizationStatusHandler returned no payload from Better Auth", {
        plugin: "device-authorization",
        method: "status",
      });
    }

    return yield* S.decodeUnknown(DeviceAuthorizationStatusContract.successSchema)(result.data);
  },
  Effect.catchTags({
    ParseError: (error) =>
      Effect.dieMessage(`DeviceAuthorizationStatusHandler failed to parse response: ${error.message}`),
  })
);

const DeviceAuthorizationApproveHandler = Effect.fn("DeviceAuthorizationApproveHandler")(
  function* (payload: DeviceAuthorizationDecisionPayload.Type) {
    const continuation = makeFailureContinuation({
      contract: "DeviceAuthorizationApprove",
      metadata: () => ({
        plugin: "device-authorization",
        method: "approve",
      }),
    });

    const result = yield* continuation.run((handlers) =>
      client.device.approve({
        userCode: payload.userCode,
        fetchOptions: handlers.signal
          ? { onError: handlers.onError, signal: handlers.signal }
          : { onError: handlers.onError },
      })
    );

    yield* continuation.raiseResult(result);

    if (result.data == null) {
      return yield* new IamError({}, "DeviceAuthorizationApproveHandler returned no payload from Better Auth", {
        plugin: "device-authorization",
        method: "approve",
      });
    }

    return yield* S.decodeUnknown(DeviceAuthorizationApproveContract.successSchema)(result.data);
  },
  Effect.catchTags({
    ParseError: (error) =>
      Effect.dieMessage(`DeviceAuthorizationApproveHandler failed to parse response: ${error.message}`),
  })
);

const DeviceAuthorizationDenyHandler = Effect.fn("DeviceAuthorizationDenyHandler")(
  function* (payload: DeviceAuthorizationDecisionPayload.Type) {
    const continuation = makeFailureContinuation({
      contract: "DeviceAuthorizationDeny",
      metadata: () => ({
        plugin: "device-authorization",
        method: "deny",
      }),
    });

    const result = yield* continuation.run((handlers) =>
      client.device.deny({
        userCode: payload.userCode,
        fetchOptions: handlers.signal
          ? { onError: handlers.onError, signal: handlers.signal }
          : { onError: handlers.onError },
      })
    );

    yield* continuation.raiseResult(result);

    if (result.data == null) {
      return yield* new IamError({}, "DeviceAuthorizationDenyHandler returned no payload from Better Auth", {
        plugin: "device-authorization",
        method: "deny",
      });
    }

    return yield* S.decodeUnknown(DeviceAuthorizationDenyContract.successSchema)(result.data);
  },
  Effect.catchTags({
    ParseError: (error) =>
      Effect.dieMessage(`DeviceAuthorizationDenyHandler failed to parse response: ${error.message}`),
  })
);

export const DeviceAuthorizationImplementations = DeviceAuthorizationContractSet.of({
  DeviceAuthorizationCode: DeviceAuthorizationCodeHandler,
  DeviceAuthorizationToken: DeviceAuthorizationTokenHandler,
  DeviceAuthorizationStatus: DeviceAuthorizationStatusHandler,
  DeviceAuthorizationApprove: DeviceAuthorizationApproveHandler,
  DeviceAuthorizationDeny: DeviceAuthorizationDenyHandler,
});
