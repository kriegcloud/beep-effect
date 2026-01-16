import { $IamClientId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as Effect from "effect/Effect";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import * as Common from "../../_common";

const $I = $IamClientId.create("sign-up/email/contract");

export class PayloadFrom extends S.Class<PayloadFrom>($I`PayloadFrom`)(
  {
    email: Common.UserEmail,
    rememberMe: Common.RememberMe,
    redirectTo: S.optionalWith(BS.URLPath, { default: () => BS.URLPath.make("/") }),
    password: BS.Password,
    passwordConfirm: BS.Password,
    firstName: BS.NameAttribute,
    lastName: BS.NameAttribute,
  },
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
  }
) {}

export class Payload extends PayloadFrom.transformOrFailFrom<Payload>($I`Payload`)(
  {
    name: S.String,
  },
  {
    decode: (i, _, ast) =>
      Effect.gen(function* () {
        if (i.password !== i.passwordConfirm) {
          return yield* Effect.fail(
            new ParseResult.Type(
              ast,
              {
                password: i.password,
                passwordConfirm: i.passwordConfirm,
              },
              "Passwords do not match"
            )
          );
        }

        return yield* Effect.succeed({
          name: `${i.firstName} ${i.lastName}`,
          ...i,
        });
      }),
    encode: (i) =>
      Effect.succeed({
        ...i,
        password: i.password,
        passwordConfirm: i.passwordConfirm,
      }),
  },
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
    },
    undefined,
  ]
) {}

/**
 * Success schema for sign-up/email.
 *
 * Directly decodes `response.data` from Better Auth (not the full response wrapper).
 * This allows the handler factory pattern to work correctly.
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
