/**
 * @module list-accounts
 *
 * Domain contract for listing linked accounts for the authenticated user.
 *
 * @category exports
 * @since 0.1.0
 */

import { IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as HttpApiSchema from "@effect/platform/HttpApiSchema";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/core/list-accounts");

/**
 * Model for a linked account.
 *
 * @since 0.1.0
 * @category Schema
 */
export class Account extends S.Class<Account>($I`Account`)(
  {
    /**
     * Unique identifier of the linked account.
     */
    id: S.String.annotations({
      description: "Unique identifier of the linked account.",
    }),

    /**
     * The provider ID (e.g., "google", "github").
     */
    providerId: S.String.annotations({
      description: "The provider ID (e.g., 'google', 'github').",
    }),

    /**
     * The account ID from the provider.
     */
    accountId: S.String.annotations({
      description: "The account ID from the provider.",
    }),

    /**
     * When the account was linked.
     */
    createdAt: BS.DateTimeUtcFromAllAcceptable.annotations({
      description: "When the account was linked.",
    }),

    /**
     * When the account was last updated.
     */
    updatedAt: BS.DateTimeUtcFromAllAcceptable.annotations({
      description: "When the account was last updated.",
    }),
  },
  $I.annotations("LinkedAccount", {
    description: "A linked account from an external provider.",
  })
) {}

/**
 * Success response with list of linked accounts.
 *
 * @since 0.1.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    /**
     * List of linked accounts for the user.
     */
    accounts: S.Array(Account).annotations({
      description: "List of linked accounts for the user.",
    }),
  },
  $I.annotations("ListAccountsSuccess", {
    description: "Success response with list of linked accounts.",
  })
) {}

/**
 * List accounts endpoint contract.
 *
 * GET /list-accounts
 *
 * Returns all linked accounts for the authenticated user.
 *
 * @since 0.1.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.get("listAccounts", "/list-accounts")
  .addSuccess(Success)
  .addError(
    IamAuthError.annotations(
      HttpApiSchema.annotations({
        status: BS.HttpStatusCode.DecodedEnum.UNAUTHORIZED,
      })
    )
  );
