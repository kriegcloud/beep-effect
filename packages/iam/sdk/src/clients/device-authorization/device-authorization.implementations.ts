import { client } from "@beep/iam-sdk/adapters";
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
import { makeFailureContinuation } from "@beep/iam-sdk/contract-kit";
import { IamError } from "@beep/iam-sdk/errors";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

const DeviceAuthorizationCodeMetadata = {
  plugin: "device-authorization",
  method: "code",
} as const;

const DeviceAuthorizationTokenMetadata = {
  plugin: "device-authorization",
  method: "token",
} as const;

const DeviceAuthorizationStatusMetadata = {
  plugin: "device-authorization",
  method: "status",
} as const;

const DeviceAuthorizationApproveMetadata = {
  plugin: "device-authorization",
  method: "approve",
} as const;

const DeviceAuthorizationDenyMetadata = {
  plugin: "device-authorization",
  method: "deny",
} as const;

const DeviceAuthorizationCodeHandler = Effect.fn("DeviceAuthorizationCodeHandler")(
  function* (payload: DeviceAuthorizationCodePayload.Type) {
    const continuation = makeFailureContinuation({
      contract: "DeviceAuthorizationCode",
      metadata: () => DeviceAuthorizationCodeMetadata,
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
    ParseError: (error) => Effect.fail(IamError.match(error, DeviceAuthorizationCodeMetadata)),
  })
);

const DeviceAuthorizationTokenHandler = Effect.fn("DeviceAuthorizationTokenHandler")(
  function* (payload: DeviceAuthorizationTokenPayload.Type) {
    const continuation = makeFailureContinuation({
      contract: "DeviceAuthorizationToken",
      metadata: () => DeviceAuthorizationTokenMetadata,
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
    ParseError: (error) => Effect.fail(IamError.match(error, DeviceAuthorizationTokenMetadata)),
  })
);

const DeviceAuthorizationStatusHandler = Effect.fn("DeviceAuthorizationStatusHandler")(
  function* (payload: DeviceAuthorizationStatusPayload.Type) {
    const continuation = makeFailureContinuation({
      contract: "DeviceAuthorizationStatus",
      metadata: () => DeviceAuthorizationStatusMetadata,
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
    ParseError: (error) => Effect.fail(IamError.match(error, DeviceAuthorizationStatusMetadata)),
  })
);

const DeviceAuthorizationApproveHandler = Effect.fn("DeviceAuthorizationApproveHandler")(
  function* (payload: DeviceAuthorizationDecisionPayload.Type) {
    const continuation = makeFailureContinuation({
      contract: "DeviceAuthorizationApprove",
      metadata: () => DeviceAuthorizationApproveMetadata,
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
    ParseError: (error) => Effect.fail(IamError.match(error, DeviceAuthorizationApproveMetadata)),
  })
);

const DeviceAuthorizationDenyHandler = Effect.fn("DeviceAuthorizationDenyHandler")(
  function* (payload: DeviceAuthorizationDecisionPayload.Type) {
    const continuation = makeFailureContinuation({
      contract: "DeviceAuthorizationDeny",
      metadata: () => DeviceAuthorizationDenyMetadata,
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
    ParseError: (error) => Effect.fail(IamError.match(error, DeviceAuthorizationDenyMetadata)),
  })
);

export const DeviceAuthorizationImplementations = DeviceAuthorizationContractKit.of({
  DeviceAuthorizationCode: DeviceAuthorizationCodeHandler,
  DeviceAuthorizationToken: DeviceAuthorizationTokenHandler,
  DeviceAuthorizationStatus: DeviceAuthorizationStatusHandler,
  DeviceAuthorizationApprove: DeviceAuthorizationApproveHandler,
  DeviceAuthorizationDeny: DeviceAuthorizationDenyHandler,
});
