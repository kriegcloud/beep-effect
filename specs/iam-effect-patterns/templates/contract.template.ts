/**
 * Contract Template
 *
 * This template demonstrates the canonical pattern for defining
 * Effect Schema contracts for Better Auth methods.
 *
 * Copy this template when implementing new Better Auth contracts.
 */

import { $IamClientId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";
import * as Common from "../../_common";

/**
 * Create scoped identifier for this contract
 * Pattern: "{{domain}}/{{method}}"
 */
const $I = $IamClientId.create("{{domain}}/{{method}}");

/**
 * Payload Schema
 *
 * Defines the input structure for the handler.
 * Use withFormAnnotations to provide form defaults.
 *
 * Guidelines:
 * - Use Common.* schemas for shared types (UserEmail, UserPassword, etc.)
 * - Use S.Redacted(S.String) for sensitive fields
 * - Use S.optionalWith for optional fields with defaults
 * - Form defaults should be Encoded types (strings, not Redacted)
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    // Required fields
    email: Common.UserEmail,
    password: Common.UserPassword,

    // Optional fields with defaults
    rememberMe: Common.RememberMe,
    callbackURL: Common.CallbackURL,
  },
  // Use withFormAnnotations helper for consistent form defaults
  Common.withFormAnnotations(
    $I.annotations("Payload", {
      description: "The payload for {{description}}.",
    }),
    // Form defaults use ENCODED types (plain strings for Redacted fields)
    {
      email: "",
      password: "",
      rememberMe: true,
      callbackURL: "/",
    }
  )
) {}

/**
 * Success Schema
 *
 * Defines the successful response structure from Better Auth.
 *
 * Guidelines:
 * - Use S.optionalWith for nullable fields from API
 * - Use BS.OptionFromNullishOptionalProperty for fields that should become Option
 * - Include user/session data using Common.Domain* transformations
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    // Common success fields
    redirect: S.optionalWith(S.Boolean, { default: () => true }),
    token: S.optionalWith(S.Redacted(S.String), { as: "Option", nullable: true }),
    url: BS.OptionFromNullishOptionalProperty(BS.URLString, null),
    user: Common.DomainUserFromBetterAuthUser,
  },
  $I.annotations("Success", {
    description: "The success response for {{description}}.",
  })
) {}

/**
 * Alternative: Response + Success with transformation
 *
 * For complex responses that need validation/transformation:
 *
 * export class Response extends S.Class<Response>($I`Response`)({
 *   data: S.NullOr(S.Struct({
 *     user: Common.DomainUserFromBetterAuthUser,
 *     token: BS.OptionFromNullishOptionalProperty(S.Redacted(S.String), null),
 *   })),
 * }) {}
 *
 * export class Success extends Response.transformOrFail<Success>($I`Success`)(
 *   {
 *     user: Common.DomainUserFromBetterAuthUser,
 *     token: BS.OptionFromNullishOptionalProperty(S.Redacted(S.String), null),
 *   },
 *   {
 *     decode: (i, _, ast) =>
 *       Effect.gen(function* () {
 *         if (P.isNullable(i.data)) {
 *           return yield* Effect.fail(new ParseResult.Type(ast, i, "data is null"));
 *         }
 *         return yield* Effect.succeed({ ...i, user: i.data.user, token: i.data.token });
 *       }),
 *     encode: (i) => Effect.succeed(i),
 *   }
 * ) {}
 */

/**
 * Alternative: Payload with transformation (e.g., password confirmation)
 *
 * For payloads that need cross-field validation:
 *
 * export class PayloadFrom extends S.Class<PayloadFrom>($I`PayloadFrom`)({
 *   email: Common.UserEmail,
 *   password: BS.Password,
 *   passwordConfirm: BS.Password,
 * }) {}
 *
 * export class Payload extends PayloadFrom.transformOrFailFrom<Payload>($I`Payload`)(
 *   { validated: S.Boolean },
 *   {
 *     decode: (i, _, ast) =>
 *       Effect.gen(function* () {
 *         if (i.password !== i.passwordConfirm) {
 *           return yield* Effect.fail(
 *             new ParseResult.Type(ast, i, "Passwords do not match")
 *           );
 *         }
 *         return yield* Effect.succeed({ ...i, validated: true });
 *       }),
 *     encode: (i) => Effect.succeed({ ...i }),
 *   }
 * ) {}
 */
