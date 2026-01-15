import {$IamClientId} from "@beep/identity/packages";
import {BS} from "@beep/schema";
import * as Effect from "effect/Effect";
import * as ParseResult from "effect/ParseResult";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Common from "../../_common";

const $I = $IamClientId.create("sign-up/email/contract");

export class PayloadFrom extends S.Class<PayloadFrom>($I`PayloadFrom`)(
  {
    email: Common.UserEmail,
    rememberMe: Common.RememberMe,
    redirectTo: S.optionalWith(BS.URLPath, {default: () => BS.URLPath.make("/")}),
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
) {
}

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
    undefined
  ]
) {
}

export class Response extends S.Class<Response>($I`Response`)(
  {
    data: S.NullOr(
      S.Struct({
        user: Common.DomainUserFromBetterAuthUser,
        token: BS.OptionFromNullishOptionalProperty(S.Redacted(S.String), null),
      })
    ),
  },
  $I.annotations("Response", {
    description: "Response for sign-up/email",
  })
) {
}

export class Success extends Response.transformOrFail<Success>($I`Success`)(
  {
    user: Common.DomainUserFromBetterAuthUser,
    token: BS.OptionFromNullishOptionalProperty(S.Redacted(S.String), null),
  },
  {
    decode: (i, _, ast) =>
      Effect.gen(function* () {
        const {data} = i;
        if (P.isNullable(data)) {
          return yield* Effect.fail(new ParseResult.Type(ast, i, "i.data is null"));
        }
        return yield* Effect.succeed({
          data,
          user: data.user,
          token: data.token,
        });
      }),
    encode: (i) => Effect.succeed(i),
  },
  $I.annotations("Success", {
    description: "Success response for sign-up/email with non-null data",
  })
) {
}
