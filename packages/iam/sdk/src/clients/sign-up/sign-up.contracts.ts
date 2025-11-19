import { Contract, ContractKit } from "@beep/contract";
import { BS } from "@beep/schema";
import { paths } from "@beep/shared-domain";
import * as SharedEntities from "@beep/shared-domain/entities";
import * as F from "effect/Function";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as Struct from "effect/Struct";
import { IamError } from "../../errors";

// =====================================================================================================================
// Sign Up Email Contract
// =====================================================================================================================
const SignUpFrom = S.Struct({
  email: BS.EmailBase,
  rememberMe: BS.BoolWithDefault(false),
  redirectTo: BS.StringWithDefault(paths.dashboard.root),
  gender: SharedEntities.User.Model.insert.fields.gender,
  password: BS.PasswordBase,
  passwordConfirm: BS.PasswordBase,
  firstName: S.NonEmptyTrimmedString,
  lastName: S.NonEmptyTrimmedString,
  captchaResponse: S.String,
});

const SignUpTo = S.Struct({
  email: S.encodedSchema(BS.Email),
  rememberMe: BS.BoolWithDefault(false),
  callbackURL: BS.StringWithDefault(paths.dashboard.root),
  gender: SharedEntities.User.Model.insert.fields.gender,
  password: BS.PasswordBase,
  passwordConfirm: BS.PasswordBase,
  firstName: S.NonEmptyTrimmedString,
  lastName: S.NonEmptyTrimmedString,
  name: S.NonEmptyTrimmedString,
  captchaResponse: S.String,
});

export class SignUpValue extends S.transformOrFail(SignUpFrom, SignUpTo, {
  strict: true,
  decode: ({ rememberMe = false, ...value }, _, ast) =>
    ParseResult.try({
      try: () => {
        const name = F.pipe(value.firstName, Str.concat(" "), Str.concat(value.lastName));
        return {
          firstName: value.firstName,
          lastName: value.lastName,
          gender: value.gender,
          email: value.email,
          password: value.password,
          passwordConfirm: value.passwordConfirm,
          redirectTo: value.redirectTo,
          rememberMe,
          captchaResponse: value.captchaResponse,
          name,
        } as const;
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

export declare namespace SignUpValue {
  export type Type = S.Schema.Type<typeof SignUpValue>;
  export type Encoded = S.Schema.Encoded<typeof SignUpValue>;
}

export class SignUpEmailPayload extends S.Class<SignUpEmailPayload>("SignUpEmailPayload")(
  {
    value: SignUpValue,
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/SignUpEmailPayload"),
    identifier: "SignUpEmailPayload",
    description: "Payload for signing up a new user via email.",
  }
) {}

export declare namespace SignUpEmailPayload {
  export type Type = S.Schema.Type<typeof SignUpEmailPayload>;
  export type Encoded = S.Schema.Encoded<typeof SignUpEmailPayload>;
}

export const SignUpEmailContract = Contract.make("SignUpEmail", {
  description: "Signs up a new user using email credentials.",
  payload: SignUpEmailPayload.fields,
  failure: IamError,
  success: S.Union(S.TaggedStruct("Success", {}), S.TaggedStruct("Failure", {})),
})
  .annotate(Contract.Title, "Sign Up Email")
  .annotate(Contract.Domain, "sign-up")
  .annotate(Contract.Method, "signUpEmail");

// =====================================================================================================================
// Sign Up Contract Set
// =====================================================================================================================

export const SignUpContractKit = ContractKit.make(SignUpEmailContract);
