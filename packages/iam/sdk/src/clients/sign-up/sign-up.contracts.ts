import { BS } from "@beep/schema";
import { paths } from "@beep/shared-domain";
import * as SharedEntities from "@beep/shared-domain/entities";
import * as ParseResult from "effect/ParseResult";
import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";
import * as Struct from "effect/Struct";

const SignUpFrom = S.Struct({
  email: BS.Email,
  rememberMe: BS.BoolWithDefault(false),
  redirectTo: BS.StringWithDefault(paths.root),
  gender: SharedEntities.User.Model.insert.fields.gender,
  password: BS.Password,
  passwordConfirm: BS.Password,
  firstName: S.NonEmptyTrimmedString,
  lastName: S.NonEmptyTrimmedString,
});

const SignUpTo = S.Struct({
  email: S.encodedSchema(BS.Email),
  rememberMe: BS.BoolWithDefault(false),
  callbackURL: BS.StringWithDefault(paths.root),
  gender: SharedEntities.User.Model.insert.fields.gender,
  password: S.encodedSchema(BS.Password),
  passwordConfirm: S.encodedSchema(BS.Password),
  firstName: S.NonEmptyTrimmedString,
  lastName: S.NonEmptyTrimmedString,
  name: S.NonEmptyTrimmedString,
});

export class SignUpValue extends S.transformOrFail(SignUpFrom, SignUpTo, {
  strict: true,
  decode: ({ rememberMe = false, ...value }, _, ast) =>
    ParseResult.try({
      try: () => {
        const name = `${value.firstName} ${value.lastName}`;
        return {
          firstName: value.firstName,
          lastName: value.lastName,
          gender: value.gender,
          email: Redacted.value(value.email),
          password: Redacted.value(value.password),
          passwordConfirm: Redacted.value(value.passwordConfirm),
          redirectTo: value.redirectTo,
          rememberMe,
          name,
        };
      },
      catch: () => new ParseResult.Type(ast, value, "could not decode signup"),
    }),
  encode: (value, _, ast) =>
    ParseResult.try({
      try: () => {
        return S.decodeSync(SignUpFrom)(Struct.omit(value, "name"));
      },
      catch: () => new ParseResult.Type(ast, value, "could not encode signup"),
    }),
}) {}

export namespace SignUpValue {
  export type Type = typeof SignUpValue.Type;
  export type Encoded = typeof SignUpValue.Encoded;
}

export class SignupContract extends BS.Class<SignupContract>("SignupContract")({
  value: S.typeSchema(SignUpValue),
  onSuccess: new BS.Fn({
    input: BS.URLPath,
    output: S.Void,
  }).Schema,
}) {}

export namespace SignupContract {
  export type Type = typeof SignupContract.Type;
  export type Encoded = typeof SignupContract.Encoded;
}
