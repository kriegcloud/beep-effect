/**
 * @fileoverview Email sign-up contract schemas for Better Auth integration.
 *
 * This module defines the payload and success schemas for email-based user registration.
 * The payload schema implements a complex transformation:
 * - Form layer: firstName/lastName/password/passwordConfirm (user-friendly input)
 * - Wire layer: name/password/email (Better Auth API format)
 *
 * Encoding validates password matching and combines firstName + lastName → name.
 * Decoding performs lossy name splitting for schema completeness (rarely used in production).
 *
 * @module @beep/iam-client/sign-up/email/contract
 * @category SignUp/Email
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { slice } from "@beep/utils/data/array.utils";
import * as W from "@beep/wrap";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import * as Str from "effect/String";

const $I = $IamClientId.create("sign-up/email");

// ============================================================================
// Form Input Schema (Decoded Type)
// ============================================================================

/**
 * Form input schema for email sign-up with user-friendly field names.
 *
 * This schema represents the decoded form layer that UI components bind to.
 * It includes firstName/lastName (split name fields) and passwordConfirm
 * (client-side validation) which are transformed during encoding.
 *
 * @remarks
 * This is the "To" side of the Payload transform schema. Forms collect this
 * structure, which is then encoded into Better Auth's wire format (name field,
 * no passwordConfirm) during submission.
 *
 * The class includes a computed `name` getter that combines firstName + lastName
 * for encoding convenience.
 *
 * @example
 * ```typescript
 * import { Email } from "@beep/iam-client/sign-up"
 *
 * const formData = Email.PayloadFrom.make({
 *   firstName: "Jane",
 *   lastName: "Doe",
 *   email: "jane@example.com",
 *   password: "SecurePass123!",
 *   passwordConfirm: "SecurePass123!",
 *   rememberMe: true,
 *   redirectTo: "/dashboard"
 * })
 *
 * // Access computed name
 * console.log(formData.name) // "Jane Doe"
 * ```
 *
 * @category SignUp/Email/Schemas
 * @since 0.1.0
 */
export class PayloadFrom extends S.Class<PayloadFrom>($I`PayloadFrom`)(
  {
    email: Common.UserEmail,
    rememberMe: Common.RememberMe,
    redirectTo: S.optionalWith(BS.URLPath, { default: () => BS.URLPath.make("/" as const) }),
    password: BS.Password,
    passwordConfirm: BS.Password,
    firstName: BS.NameAttribute,
    lastName: BS.NameAttribute,
  },
  // Default form values use Encoded types (plain strings for Redacted fields, etc.)
  formValuesAnnotation({
    email: "",
    rememberMe: true,
    redirectTo: "/",
    password: "",
    passwordConfirm: "",
    firstName: "",
    lastName: "",
  })
) {
  /**
   * Computed full name from firstName and lastName.
   */
  get name() {
    return `${this.firstName} ${this.lastName}`;
  }
}

// ============================================================================
// API Payload Schema (Encoded Type)
// ============================================================================

/**
 * Wire format for Better Auth's signUp.email endpoint.
 *
 * This is what gets sent to the API - has `name` instead of firstName/lastName,
 * and omits passwordConfirm (validation happens during encoding).
 */
const PayloadEncodedStruct = S.Struct({
  email: S.String,
  name: S.String,
  password: S.String,
  rememberMe: S.optional(S.Boolean),
  callbackURL: S.optional(S.String),
});

// ============================================================================
// Payload Transform Schema
// ============================================================================

/**
 * Transform schema for email sign-up with asymmetric encoding/decoding.
 *
 * This schema bridges the gap between user-friendly form input (PayloadFrom)
 * and Better Auth's wire format (PayloadEncodedStruct). The transformation
 * is asymmetric:
 *
 * - **Encode** (Form → API): Validates password matching, combines firstName + lastName → name
 * - **Decode** (API → Form): Lossy name splitting (rarely used in production)
 *
 * @remarks
 * **Encoding Flow (Primary Use Case)**:
 * 1. Form submits PayloadFrom with firstName/lastName/password/passwordConfirm
 * 2. Schema validates password === passwordConfirm
 * 3. Schema combines firstName + lastName → name field
 * 4. Encoded payload (name/password/email) goes to Better Auth
 *
 * **Decoding Flow (Schema Completeness Only)**:
 * This is a lossy conversion used only for schema bidirectionality.
 * Better Auth's API provides only `name: string`, so we split heuristically:
 * - First space-delimited word → firstName
 * - Remainder → lastName (or empty string for single-word names)
 *
 * In production, the decode path is rarely exercised since:
 * 1. Form submissions use the encode path
 * 2. API responses use the Success schema, not Payload decode
 *
 * **Name Splitting Examples**:
 * - "Ludwig van Beethoven" → firstName: "Ludwig", lastName: "van Beethoven"
 * - "Madonna" → firstName: "Madonna", lastName: ""
 *
 * @example
 * ```typescript
 * import * as S from "effect/Schema"
 * import { Email } from "@beep/iam-client/sign-up"
 *
 * // Encode form data to API format
 * const formData = Email.PayloadFrom.make({
 *   firstName: "John",
 *   lastName: "Smith",
 *   email: "john@example.com",
 *   password: "Pass123!",
 *   passwordConfirm: "Pass123!",
 *   rememberMe: true,
 *   redirectTo: "/dashboard"
 * })
 *
 * const encoded = S.encodeSync(Email.Payload)(formData)
 * // { name: "John Smith", email: "john@example.com", password: "Pass123!", ... }
 * ```
 *
 * @category SignUp/Email/Schemas
 * @since 0.1.0
 */
export const Payload = S.transformOrFail(PayloadEncodedStruct, PayloadFrom, {
  strict: true,
  // Decode: API format → Form format (lossy conversion - see remarks above)
  // Returns To.Encoded (plain strings) - field schemas handle string → Redacted
  decode: Effect.fn(function* (api, _, ast) {
    const nameParts = Str.split(" ")(api.name);
    const firstName = F.pipe(
      nameParts,
      A.head,
      O.getOrElse(() => "")
    );

    // Fail only if name is completely empty
    if (Str.isEmpty(firstName)) {
      return yield* Effect.fail(new ParseResult.Type(ast, api, "Name cannot be empty"));
    }

    // lastName is remainder after first word, or empty string for single-word names
    const lastName = F.pipe(nameParts, slice(1), A.join(" "));

    return {
      email: api.email,
      firstName,
      lastName,
      password: api.password,
      passwordConfirm: api.password,
      rememberMe: api.rememberMe ?? true,
      redirectTo: BS.URLPath.make(api.callbackURL ?? ("/" as const)),
    };
  }),
  // Encode: Form format → API format (the main use case)
  // encodedFields = To.Encoded (plain strings - field schemas already handled Redacted → string)
  // formInstance = the PayloadFrom class instance with .name getter (4th param)
  encode: Effect.fnUntraced(function* (encodedFields, _, ast, formInstance) {
    // Validate passwords match (both are plain strings in encoded form)
    if (encodedFields.password !== encodedFields.passwordConfirm) {
      return yield* Effect.fail(new ParseResult.Type(ast, encodedFields, "Passwords do not match"));
    }

    // Return API payload (From.Type = plain strings)
    // Use class instance (4th param) to access the .name getter
    return {
      email: encodedFields.email,
      name: formInstance.name,
      password: encodedFields.password,
      rememberMe: encodedFields.rememberMe,
      callbackURL: encodedFields.redirectTo,
    };
  }),
}).annotations(
  $I.annotations("Payload", {
    description: "Payload for sign-up/email with password validation and name computation",
  })
);

/**
 * Type utilities for the Payload transform schema.
 *
 * Provides access to both decoded (PayloadFrom) and encoded (Better Auth wire format) types.
 *
 * @example
 * ```typescript
 * import type { Email } from "@beep/iam-client/sign-up"
 *
 * type FormInput = Email.Payload.Type      // PayloadFrom with firstName/lastName
 * type ApiPayload = Email.Payload.Encoded  // Better Auth format with name field
 * ```
 *
 * @category SignUp/Email/Schemas
 * @since 0.1.0
 */
export declare namespace Payload {
  export type Type = S.Schema.Type<typeof Payload>;
  export type Encoded = S.Schema.Encoded<typeof Payload>;
}

// ============================================================================
// Success Schema
// ============================================================================

/**
 * Success response schema for email sign-up.
 *
 * Decodes the response.data from Better Auth's signUp.email endpoint.
 * Returns the created user object and an optional session token.
 *
 * @remarks
 * The user field is transformed via DomainUserFromBetterAuthUser to align
 * with the application's User model. The token field is optional and redacted
 * (suppressed from logs) when present.
 *
 * @example
 * ```typescript
 * import { Email } from "@beep/iam-client/sign-up"
 *
 * // In handler implementation:
 * const response = yield* client.signUp.email(payload)
 * const success = yield* S.decodeUnknown(Email.Success)(response.data)
 *
 * console.log(success.user.email) // "jane@example.com"
 * console.log(success.token)      // Option<Redacted<string>>
 * ```
 *
 * @category SignUp/Email/Schemas
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    user: Common.DomainUserFromBetterAuthUser,
    token: BS.OptionFromNullishOptionalProperty(S.Redacted(S.String), null),
  },
  $I.annotations("Success", {
    description: "Success response for sign-up/email - decodes response.data directly",
  })
) {}

/**
 * Wrapper contract combining payload, success, and error schemas with captcha middleware.
 *
 * This wrapper integrates the email sign-up flow with the application's
 * contract system, enabling type-safe handler implementation and middleware
 * composition.
 *
 * @remarks
 * The wrapper applies CaptchaMiddleware to validate reCAPTCHA responses
 * before executing the sign-up handler. This protects against automated
 * sign-up abuse.
 *
 * @example
 * ```typescript
 * import * as Common from "@beep/iam-client/_internal"
 * import { client } from "@beep/iam-client/adapters"
 * import * as Contract from "./contract.ts"
 *
 * export const Handler = Contract.Wrapper.implement(
 *   Common.wrapIamMethod({
 *     wrapper: Contract.Wrapper,
 *     mutatesSession: true,
 *     before: Common.withCaptchaResponse,
 *   })((encodedPayload, captchaResponse) =>
 *     client.signUp.email({
 *       ...encodedPayload,
 *       fetchOptions: {
 *         headers: { "x-captcha-response": captchaResponse }
 *       }
 *     })
 *   )
 * )
 * ```
 *
 * @category SignUp/Email/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("Email", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
}).middleware(Common.CaptchaMiddleware);
