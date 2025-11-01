import { makeErrorProps } from "@beep/iam-domain/errors/_internal";
import * as S from "effect/Schema";

export const API_KEY_ERROR_CODES = {
  INVALID_METADATA_TYPE: "metadata must be an object or undefined",
  REFILL_AMOUNT_AND_INTERVAL_REQUIRED: "refillAmount is required when refillInterval is provided",
  REFILL_INTERVAL_AND_AMOUNT_REQUIRED: "refillInterval is required when refillAmount is provided",
  USER_BANNED: "User is banned",
  UNAUTHORIZED_SESSION: "Unauthorized or invalid session",
  KEY_NOT_FOUND: "API Key not found",
  KEY_DISABLED: "API Key is disabled",
  KEY_EXPIRED: "API Key has expired",
  USAGE_EXCEEDED: "API Key has reached its usage limit",
  KEY_NOT_RECOVERABLE: "API Key is not recoverable",
  EXPIRES_IN_IS_TOO_SMALL: "The expiresIn is smaller than the predefined minimum value.",
  EXPIRES_IN_IS_TOO_LARGE: "The expiresIn is larger than the predefined maximum value.",
  INVALID_REMAINING: "The remaining count is either too large or too small.",
  INVALID_PREFIX_LENGTH: "The prefix length is either too large or too small.",
  INVALID_NAME_LENGTH: "The name length is either too large or too small.",
  METADATA_DISABLED: "Metadata is disabled.",
  RATE_LIMIT_EXCEEDED: "Rate limit exceeded.",
  NO_VALUES_TO_UPDATE: "No values to update.",
  KEY_DISABLED_EXPIRATION: "Custom key expiration values are disabled.",
  INVALID_API_KEY: "Invalid API key.",
  INVALID_USER_ID_FROM_API_KEY: "The user id from the API key is invalid.",
  INVALID_API_KEY_GETTER_RETURN_TYPE: "API Key getter returned an invalid key type. Expected string.",
  SERVER_ONLY_PROPERTY: "The property you're trying to set can only be set from the server auth instance only.",
};

export class InvalidMetadataType extends S.TaggedError<InvalidMetadataType>(
  "@beep/iam-domain/errors/api-key/InvalidMetadataType"
)(...makeErrorProps("INVALID_METADATA_TYPE")(API_KEY_ERROR_CODES.INVALID_METADATA_TYPE)) {}

export class RefillAmountAndIntervalRequired extends S.TaggedError<RefillAmountAndIntervalRequired>(
  "@beep/iam-domain/errors/api-key/RefillAmountAndIntervalRequired"
)(...makeErrorProps("REFILL_AMOUNT_AND_INTERVAL_REQUIRED")(API_KEY_ERROR_CODES.REFILL_AMOUNT_AND_INTERVAL_REQUIRED)) {}

export class RefillIntervalAndAmountRequired extends S.TaggedError<RefillIntervalAndAmountRequired>(
  "@beep/iam-domain/errors/api-key/RefillIntervalAndAmountRequired"
)(...makeErrorProps("REFILL_INTERVAL_AND_AMOUNT_REQUIRED")(API_KEY_ERROR_CODES.REFILL_INTERVAL_AND_AMOUNT_REQUIRED)) {}

export class UserBanned extends S.TaggedError<UserBanned>("@beep/iam-domain/errors/api-key/UserBanned")(
  ...makeErrorProps("USER_BANNED")(API_KEY_ERROR_CODES.USER_BANNED)
) {}

export class UnauthorizedSession extends S.TaggedError<UnauthorizedSession>(
  "@beep/iam-domain/errors/api-key/UnauthorizedSession"
)(...makeErrorProps("UNAUTHORIZED_SESSION")(API_KEY_ERROR_CODES.UNAUTHORIZED_SESSION)) {}

export class KeyNotFound extends S.TaggedError<KeyNotFound>("@beep/iam-domain/errors/api-key/KeyNotFound")(
  ...makeErrorProps("KEY_NOT_FOUND")(API_KEY_ERROR_CODES.KEY_NOT_FOUND)
) {}

export class KeyDisabled extends S.TaggedError<KeyDisabled>("@beep/iam-domain/errors/api-key/KeyDisabled")(
  ...makeErrorProps("KEY_DISABLED")(API_KEY_ERROR_CODES.KEY_DISABLED)
) {}

export class KeyExpired extends S.TaggedError<KeyExpired>("@beep/iam-domain/errors/api-key/KeyExpired")(
  ...makeErrorProps("KEY_EXPIRED")(API_KEY_ERROR_CODES.KEY_EXPIRED)
) {}

export class UsageExceeded extends S.TaggedError<UsageExceeded>("@beep/iam-domain/errors/api-key/UsageExceeded")(
  ...makeErrorProps("USAGE_EXCEEDED")(API_KEY_ERROR_CODES.USAGE_EXCEEDED)
) {}

export class KeyNotRecoverable extends S.TaggedError<KeyNotRecoverable>(
  "@beep/iam-domain/errors/api-key/KeyNotRecoverable"
)(...makeErrorProps("KEY_NOT_RECOVERABLE")(API_KEY_ERROR_CODES.KEY_NOT_RECOVERABLE)) {}

export class ExpiresInIsTooSmall extends S.TaggedError<ExpiresInIsTooSmall>(
  "@beep/iam-domain/errors/api-key/ExpiresInIsTooSmall"
)(...makeErrorProps("EXPIRES_IN_IS_TOO_SMALL")(API_KEY_ERROR_CODES.EXPIRES_IN_IS_TOO_SMALL)) {}

export class ExpiresInIsTooLarge extends S.TaggedError<ExpiresInIsTooLarge>(
  "@beep/iam-domain/errors/api-key/ExpiresInIsTooLarge"
)(...makeErrorProps("EXPIRES_IN_IS_TOO_LARGE")(API_KEY_ERROR_CODES.EXPIRES_IN_IS_TOO_LARGE)) {}

export class InvalidRemaining extends S.TaggedError<InvalidRemaining>(
  "@beep/iam-domain/errors/api-key/InvalidRemaining"
)(...makeErrorProps("INVALID_REMAINING")(API_KEY_ERROR_CODES.INVALID_REMAINING)) {}

export class InvalidPrefixLength extends S.TaggedError<InvalidPrefixLength>(
  "@beep/iam-domain/errors/api-key/InvalidPrefixLength"
)(...makeErrorProps("INVALID_PREFIX_LENGTH")(API_KEY_ERROR_CODES.INVALID_PREFIX_LENGTH)) {}

export class InvalidNameLength extends S.TaggedError<InvalidNameLength>(
  "@beep/iam-domain/errors/api-key/InvalidNameLength"
)(...makeErrorProps("INVALID_NAME_LENGTH")(API_KEY_ERROR_CODES.INVALID_NAME_LENGTH)) {}

export class MetadataDisabled extends S.TaggedError<MetadataDisabled>(
  "@beep/iam-domain/errors/api-key/MetadataDisabled"
)(...makeErrorProps("METADATA_DISABLED")(API_KEY_ERROR_CODES.METADATA_DISABLED)) {}

export class RateLimitExceeded extends S.TaggedError<RateLimitExceeded>(
  "@beep/iam-domain/errors/api-key/RateLimitExceeded"
)(...makeErrorProps("RATE_LIMIT_EXCEEDED")(API_KEY_ERROR_CODES.RATE_LIMIT_EXCEEDED)) {}

export class NoValuesToUpdate extends S.TaggedError<NoValuesToUpdate>(
  "@beep/iam-domain/errors/api-key/NoValuesToUpdate"
)(...makeErrorProps("NO_VALUES_TO_UPDATE")(API_KEY_ERROR_CODES.NO_VALUES_TO_UPDATE)) {}

export class KeyDisabledExpiration extends S.TaggedError<KeyDisabledExpiration>(
  "@beep/iam-domain/errors/api-key/KeyDisabledExpiration"
)(...makeErrorProps("KEY_DISABLED_EXPIRATION")(API_KEY_ERROR_CODES.KEY_DISABLED_EXPIRATION)) {}

export class InvalidApiKey extends S.TaggedError<InvalidApiKey>("@beep/iam-domain/errors/api-key/InvalidApiKey")(
  ...makeErrorProps("INVALID_API_KEY")(API_KEY_ERROR_CODES.INVALID_API_KEY)
) {}

export class InvalidUserIdFromApiKey extends S.TaggedError<InvalidUserIdFromApiKey>(
  "@beep/iam-domain/errors/api-key/InvalidUserIdFromApiKey"
)(...makeErrorProps("INVALID_USER_ID_FROM_API_KEY")(API_KEY_ERROR_CODES.INVALID_USER_ID_FROM_API_KEY)) {}

export class InvalidApiKeyGetterReturnType extends S.TaggedError<InvalidApiKeyGetterReturnType>(
  "@beep/iam-domain/errors/api-key/InvalidApiKeyGetterReturnType"
)(...makeErrorProps("INVALID_API_KEY_GETTER_RETURN_TYPE")(API_KEY_ERROR_CODES.INVALID_API_KEY_GETTER_RETURN_TYPE)) {}

export class ServerOnlyProperty extends S.TaggedError<ServerOnlyProperty>(
  "@beep/iam-domain/errors/api-key/ServerOnlyProperty"
)(...makeErrorProps("SERVER_ONLY_PROPERTY")(API_KEY_ERROR_CODES.SERVER_ONLY_PROPERTY)) {}

export class ApiKeyErrors extends S.Union(
  InvalidMetadataType,
  RefillAmountAndIntervalRequired,
  RefillIntervalAndAmountRequired,
  UserBanned,
  UnauthorizedSession,
  KeyNotFound,
  KeyDisabled,
  KeyExpired,
  UsageExceeded,
  KeyNotRecoverable,
  ExpiresInIsTooSmall,
  ExpiresInIsTooLarge,
  InvalidRemaining,
  InvalidPrefixLength,
  InvalidNameLength,
  MetadataDisabled,
  RateLimitExceeded,
  NoValuesToUpdate,
  KeyDisabledExpiration,
  InvalidApiKey,
  InvalidUserIdFromApiKey,
  InvalidApiKeyGetterReturnType,
  ServerOnlyProperty
) {}

export declare namespace ApiKeyErrors {
  export type Type = typeof ApiKeyErrors.Type;
  export type Encoded = typeof ApiKeyErrors.Encoded;
}
