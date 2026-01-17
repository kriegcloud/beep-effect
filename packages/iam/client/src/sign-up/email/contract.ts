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
import * as Common from "../../_common";

const $I = $IamClientId.create("sign-up/email/contract");

// ============================================================================
// Form Input Schema (Decoded Type)
// ============================================================================

/**
 * Form input schema for sign-up/email.
 *
 * This is what forms bind to - includes firstName, lastName for user-friendly
 * input and passwordConfirm for client-side validation.
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
  [
    undefined,
    {
      [BS.DefaultFormValuesAnnotationId]: {
        email: "",
        rememberMe: true,
        redirectTo: "/",
        password: "",
        passwordConfirm: "",
        firstName: "",
        lastName: "",
      },
      undefined,
    },
  ]
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
 * Payload schema for sign-up/email with custom encoding.
 *
 * - Type (decoded): PayloadFrom - form input with firstName, lastName, passwordConfirm
 * - Encoded: API payload with name field, no passwordConfirm
 *
 * Encoding validates passwords match and combines firstName + lastName → name.
 * This allows the handler factory to pass encoded payload directly to Better Auth.
 *
 * @remarks
 * **Decode Path (API → Form)**: This is a lossy conversion used only for schema
 * completeness. Better Auth's API provides only a `name: string`, so we must
 * heuristically split it. The first space-delimited word becomes firstName,
 * the remainder becomes lastName (or empty if single-word name).
 *
 * In production, the decode path is rarely exercised since:
 * 1. Form submissions use the encode path (Form → API)
 * 2. API responses use the Success schema, not Payload decode
 *
 * For names like "Ludwig van Beethoven", decode produces:
 * - firstName: "Ludwig"
 * - lastName: "van Beethoven"
 *
 * For single-word names like "Madonna", decode produces:
 * - firstName: "Madonna"
 * - lastName: ""
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

export declare namespace Payload {
  export type Type = S.Schema.Type<typeof Payload>;
  export type Encoded = S.Schema.Encoded<typeof Payload>;
}

// ============================================================================
// Success Schema
// ============================================================================

/**
 * Success schema for sign-up/email.
 *
 * Decodes `response.data` from Better Auth directly (flat structure, no wrapper).
 * This matches the pattern used by sign-in/email and other handlers.
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

export const Wrapper = W.Wrapper.make("Email", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
}).middleware(Common.CaptchaMiddleware);
