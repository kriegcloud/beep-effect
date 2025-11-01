import { makeErrorProps } from "@beep/iam-domain/errors/_internal";
import * as S from "effect/Schema";
import * as CoreErrors from "./core.errors";

const DEVICE_AUTHORIZATION_ERROR_CODES = {
  INVALID_DEVICE_CODE: "Invalid device code",
  EXPIRED_DEVICE_CODE: "Device code has expired",
  EXPIRED_USER_CODE: "User code has expired",
  AUTHORIZATION_PENDING: "Authorization pending",
  ACCESS_DENIED: "Access denied",
  INVALID_USER_CODE: "Invalid user code",
  DEVICE_CODE_ALREADY_PROCESSED: "Device code already processed",
  POLLING_TOO_FREQUENTLY: "Polling too frequently",
  USER_NOT_FOUND: "User not found",
  FAILED_TO_CREATE_SESSION: "Failed to create session",
  INVALID_DEVICE_CODE_STATUS: "Invalid device code status",
  AUTHENTICATION_REQUIRED: "Authentication required",
} as const;

export class InvalidDeviceCode extends S.TaggedError<InvalidDeviceCode>(
  "@beep/iam-domain/errors/device-authorization/InvalidDeviceCode"
)(...makeErrorProps("INVALID_DEVICE_CODE")(DEVICE_AUTHORIZATION_ERROR_CODES.INVALID_DEVICE_CODE)) {}

export class ExpiredDeviceCode extends S.TaggedError<ExpiredDeviceCode>(
  "@beep/iam-domain/errors/device-authorization/ExpiredDeviceCode"
)(...makeErrorProps("EXPIRED_DEVICE_CODE")(DEVICE_AUTHORIZATION_ERROR_CODES.EXPIRED_DEVICE_CODE)) {}

export class ExpiredUserCode extends S.TaggedError<ExpiredUserCode>(
  "@beep/iam-domain/errors/device-authorization/ExpiredUserCode"
)(...makeErrorProps("EXPIRED_USER_CODE")(DEVICE_AUTHORIZATION_ERROR_CODES.EXPIRED_USER_CODE)) {}

export class AuthorizationPending extends S.TaggedError<AuthorizationPending>(
  "@beep/iam-domain/errors/device-authorization/AuthorizationPending"
)(...makeErrorProps("AUTHORIZATION_PENDING")(DEVICE_AUTHORIZATION_ERROR_CODES.AUTHORIZATION_PENDING)) {}

export class AccessDenied extends S.TaggedError<AccessDenied>(
  "@beep/iam-domain/errors/device-authorization/AccessDenied"
)(...makeErrorProps("ACCESS_DENIED")(DEVICE_AUTHORIZATION_ERROR_CODES.ACCESS_DENIED)) {}

export class InvalidUserCode extends S.TaggedError<InvalidUserCode>(
  "@beep/iam-domain/errors/device-authorization/InvalidUserCode"
)(...makeErrorProps("INVALID_USER_CODE")(DEVICE_AUTHORIZATION_ERROR_CODES.INVALID_USER_CODE)) {}

export class DeviceCodeAlreadyProcessed extends S.TaggedError<DeviceCodeAlreadyProcessed>(
  "@beep/iam-domain/errors/device-authorization/DeviceCodeAlreadyProcessed"
)(...makeErrorProps("DEVICE_CODE_ALREADY_PROCESSED")(DEVICE_AUTHORIZATION_ERROR_CODES.DEVICE_CODE_ALREADY_PROCESSED)) {}

export class PollingTooFrequently extends S.TaggedError<PollingTooFrequently>(
  "@beep/iam-domain/errors/device-authorization/PollingTooFrequently"
)(...makeErrorProps("POLLING_TOO_FREQUENTLY")(DEVICE_AUTHORIZATION_ERROR_CODES.POLLING_TOO_FREQUENTLY)) {}

export class InvalidDeviceCodeStatus extends S.TaggedError<InvalidDeviceCodeStatus>(
  "@beep/iam-domain/errors/device-authorization/InvalidDeviceCodeStatus"
)(...makeErrorProps("INVALID_DEVICE_CODE_STATUS")(DEVICE_AUTHORIZATION_ERROR_CODES.INVALID_DEVICE_CODE_STATUS)) {}

export class AuthenticationRequired extends S.TaggedError<AuthenticationRequired>(
  "@beep/iam-domain/errors/device-authorization/AuthenticationRequired"
)(...makeErrorProps("AUTHENTICATION_REQUIRED")(DEVICE_AUTHORIZATION_ERROR_CODES.AUTHENTICATION_REQUIRED)) {}

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
