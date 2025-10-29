import { makeErrorProps } from "@beep/iam-domain/errors/_internal";
import * as S from "effect/Schema";
import * as CoreErrors from "./core.errors";

export class InvalidDeviceCode extends S.TaggedError<InvalidDeviceCode>(
  "@beep/iam-domain/errors/device-authorization/InvalidDeviceCode"
)(...makeErrorProps("INVALID_DEVICE_CODE")("Invalid device code")) {}

export class ExpiredDeviceCode extends S.TaggedError<ExpiredDeviceCode>(
  "@beep/iam-domain/errors/device-authorization/ExpiredDeviceCode"
)(...makeErrorProps("EXPIRED_DEVICE_CODE")("Device code has expired")) {}

export class ExpiredUserCode extends S.TaggedError<ExpiredUserCode>(
  "@beep/iam-domain/errors/device-authorization/ExpiredUserCode"
)(...makeErrorProps("EXPIRED_USER_CODE")("User code has expired")) {}

export class AuthorizationPending extends S.TaggedError<AuthorizationPending>(
  "@beep/iam-domain/errors/device-authorization/AuthorizationPending"
)(...makeErrorProps("AUTHORIZATION_PENDING")("Authorization pending")) {}

export class AccessDenied extends S.TaggedError<AccessDenied>(
  "@beep/iam-domain/errors/device-authorization/AccessDenied"
)(...makeErrorProps("ACCESS_DENIED")("Access denied")) {}

export class InvalidUserCode extends S.TaggedError<InvalidUserCode>(
  "@beep/iam-domain/errors/device-authorization/InvalidUserCode"
)(...makeErrorProps("INVALID_USER_CODE")("Invalid user code")) {}

export class DeviceCodeAlreadyProcessed extends S.TaggedError<DeviceCodeAlreadyProcessed>(
  "@beep/iam-domain/errors/device-authorization/DeviceCodeAlreadyProcessed"
)(...makeErrorProps("DEVICE_CODE_ALREADY_PROCESSED")("Device code already processed")) {}

export class PollingTooFrequently extends S.TaggedError<PollingTooFrequently>(
  "@beep/iam-domain/errors/device-authorization/PollingTooFrequently"
)(...makeErrorProps("POLLING_TOO_FREQUENTLY")("Polling too frequently")) {}

export class InvalidDeviceCodeStatus extends S.TaggedError<InvalidDeviceCodeStatus>(
  "@beep/iam-domain/errors/device-authorization/InvalidDeviceCodeStatus"
)(...makeErrorProps("INVALID_DEVICE_CODE_STATUS")("Invalid device code status")) {}

export class AuthenticationRequired extends S.TaggedError<AuthenticationRequired>(
  "@beep/iam-domain/errors/device-authorization/AuthenticationRequired"
)(...makeErrorProps("AUTHENTICATION_REQUIRED")("Authentication required")) {}

export class DeviceAuthorizationError extends S.Union(
  InvalidDeviceCode,
  ExpiredDeviceCode,
  ExpiredUserCode,
  AuthorizationPending,
  AccessDenied,
  InvalidUserCode,
  DeviceCodeAlreadyProcessed,
  PollingTooFrequently,
  CoreErrors.UserNotFound,
  CoreErrors.FailedToCreateSession,
  InvalidDeviceCodeStatus,
  AuthenticationRequired
) {}

export declare namespace DeviceAuthorizationError {
  export type Type = typeof DeviceAuthorizationError.Type;
  export type Encoded = typeof DeviceAuthorizationError.Encoded;
}
