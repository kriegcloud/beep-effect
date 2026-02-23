/**
 * @fileoverview
 * List accounts contract schemas for the IAM client.
 *
 * Defines the success response schema for listing all linked accounts (auth methods)
 * for the current user.
 *
 * @module @beep/iam-client/core/list-accounts/contract
 * @category Core/ListAccounts
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("core/list-accounts");

/**
 * Schema representing a linked account (auth method).
 *
 * Uses Struct with Record extension to allow unknown properties from Better Auth
 * plugins that may add fields not reflected in TypeScript types.
 *
 * @example
 * ```typescript
 * import { ListAccounts } from "@beep/iam-client/core"
 * import * as S from "effect/Schema"
 *
 * const account = S.decodeUnknownSync(ListAccounts.Account)({
 *   id: "acc_123",
 *   providerId: "google",
 *   accountId: "google-user-id",
 *   userId: "user_123"
 * })
 * ```
 *
 * @category Core/ListAccounts/Schemas
 * @since 0.1.0
 */
export const Account = S.Struct(
  {
    id: IamEntityIds.AccountId,
    providerId: S.String, // External provider ID (e.g., "google", "github") - intentionally S.String
    accountId: S.String, // External account ID from provider - intentionally S.String
    userId: SharedEntityIds.UserId,
    accessToken: S.optionalWith(S.Redacted(S.String), { nullable: true }),
    refreshToken: S.optionalWith(S.Redacted(S.String), { nullable: true }),
    accessTokenExpiresAt: S.optionalWith(BS.DateFromAllAcceptable, { nullable: true }),
    refreshTokenExpiresAt: S.optionalWith(BS.DateFromAllAcceptable, { nullable: true }),
    scope: S.optionalWith(S.String, { nullable: true }),
    idToken: S.optionalWith(S.Redacted(S.String), { nullable: true }),
    expiresAt: S.optionalWith(BS.DateFromAllAcceptable, { nullable: true }),
    password: S.optionalWith(S.Redacted(S.String), { nullable: true }),
    createdAt: BS.DateFromAllAcceptable,
    updatedAt: BS.DateFromAllAcceptable,
  },
  S.Record({ key: S.String, value: S.Unknown })
).annotations(
  $I.annotations("Account", {
    description: "A linked account representing an authentication method for the user.",
  })
);

export type Account = S.Schema.Type<typeof Account>;

/**
 * Success response - array of linked accounts.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { ListAccounts } from "@beep/iam-client/core"
 *
 * const program = Effect.gen(function* () {
 *   const accounts = yield* ListAccounts.Handler
 *   console.log(`User has ${accounts.length} linked accounts`)
 * })
 * ```
 *
 * @category Core/ListAccounts/Schemas
 * @since 0.1.0
 */
export const Success = S.Array(Account).annotations(
  $I.annotations("Success", {
    description: "Array of linked accounts (authentication methods) for the current user.",
  })
);

/**
 * Contract wrapper for list accounts operations.
 *
 * No payload required - lists all accounts for the current user.
 *
 * @example
 * ```typescript
 * import { ListAccounts } from "@beep/iam-client/core"
 *
 * const handler = ListAccounts.Wrapper.implement(() => {
 *   // Implementation returns { data: Success } or { error: IamError }
 * })
 * ```
 *
 * @category Core/ListAccounts/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("ListAccounts", {
  success: Success,
  error: Common.IamError,
});
