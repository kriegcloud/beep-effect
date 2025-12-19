import { IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { User } from "@beep/shared-domain/entities";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as HttpApiSchema from "@effect/platform/HttpApiSchema";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/core/account-info");

/**
 * Account data schema for OAuth provider information.
 *
 * @since 1.0.0
 * @category Schema
 */
export const AccountData = S.Record({ key: S.String, value: S.Unknown });

/**
 * Success response with account info from OAuth provider.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    /**
     * The user object.
     */
    user: User.Model.annotations({
      description: "The user object.",
    }),

    /**
     * Account info data from the OAuth provider.
     */
    data: AccountData.annotations({
      description: "Account info data from the OAuth provider.",
    }),
  },
  $I.annotations("AccountInfoSuccess", {
    description: "Success response with account info from OAuth provider.",
  })
) {}

/**
 * Get account info endpoint contract.
 *
 * GET /account-info
 *
 * Retrieves account info from the linked OAuth provider.
 *
 * @since 1.0.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.get("account-info", "/account-info")
  .addSuccess(Success)
  .addError(
    IamAuthError.annotations(
      HttpApiSchema.annotations({
        status: BS.HttpStatusCode.DecodedEnum.UNAUTHORIZED,
      })
    )
  );
