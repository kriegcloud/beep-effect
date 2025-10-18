import { Contract, ContractSet } from "@beep/iam-sdk/contractkit";
import { BS } from "@beep/schema";
import { paths } from "@beep/shared-domain";
import * as SharedEntities from "@beep/shared-domain/entities";
import * as F from "effect/Function";
import * as ParseResult from "effect/ParseResult";
import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as Struct from "effect/Struct";
import { IamError } from "../../errors";

const SignUpFrom = S.Struct({
  email: BS.Email,
  rememberMe: BS.BoolWithDefault(false),
  redirectTo: BS.StringWithDefault(paths.dashboard.root),
  gender: SharedEntities.User.Model.insert.fields.gender,
  password: BS.Password,
  passwordConfirm: BS.Password,
  firstName: S.NonEmptyTrimmedString,
  lastName: S.NonEmptyTrimmedString,
  captchaResponse: S.Redacted(S.String),
});

const SignUpTo = S.Struct({
  email: S.encodedSchema(BS.Email),
  rememberMe: BS.BoolWithDefault(false),
  callbackURL: BS.StringWithDefault(paths.dashboard.root),
  gender: SharedEntities.User.Model.insert.fields.gender,
  password: S.encodedSchema(BS.Password),
  passwordConfirm: S.encodedSchema(BS.Password),
  firstName: S.NonEmptyTrimmedString,
  lastName: S.NonEmptyTrimmedString,
  name: S.NonEmptyTrimmedString,
  captchaResponse: S.Redacted(S.String),
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
          email: Redacted.value(value.email),
          password: Redacted.value(value.password),
          passwordConfirm: Redacted.value(value.passwordConfirm),
          redirectTo: value.redirectTo,
          rememberMe,
          captchaResponse: Redacted.value(value.captchaResponse),
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

export class SignUpEmailPayload extends BS.Class<SignUpEmailPayload>("SignUpEmailPayload")(
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
  parameters: SignUpEmailPayload.fields,
  failure: S.instanceOf(IamError),
  success: S.Union(S.TaggedStruct("Success", {}), S.TaggedStruct("Failure", {})),
});

export const SignUpContractSet = ContractSet.make(SignUpEmailContract);
