import { invariant } from "@beep/invariant";
import { Regex } from "@beep/schema/custom";
import type { UpperLetter } from "@beep/types";
import * as S from "effect/Schema";

type SpecialCharacter = "_";

type IsValidUpperSnakeCase<S extends string> = S extends `${infer F}${infer R}`
  ? F extends UpperLetter | SpecialCharacter
    ? IsValidUpperSnakeCase<R>
    : false
  : true;

type InvalidKeyError<K extends string> =
  `Invalid error code key: "${K}" - must only contain uppercase letters (A-Z) and underscores (_)`;

export type ValidateErrorCodes<T> = {
  [K in keyof T]: K extends string ? (IsValidUpperSnakeCase<K> extends false ? InvalidKeyError<K> : T[K]) : T[K];
};

class ErrorCodeFormat extends S.NonEmptyTrimmedString.pipe(
  S.uppercased({
    message: () => "Error Code Must be an uppercased alpha char.",
  }),
  S.pattern(Regex.make(/^[A-Z]+(?:_[A-Z]+)*$/), {
    message: () => "must be in snake case format",
  }),
  S.minLength(1, {
    message: () => "must be at least 1 char long",
  }),
  S.maxLength(64, {
    message: () => "must be at most 64 chars long",
  })
) {
  static readonly formatGuard = (input: unknown): input is ErrorCodeFormat.Type => S.is(ErrorCodeFormat)(input);
}

declare namespace ErrorCodeFormat {
  export type Type = typeof ErrorCodeFormat.Type;
  export type Encoded = typeof ErrorCodeFormat.Encoded;
}

export declare namespace ErrorCode {
  export type Type<ErrorCode extends string> = IsValidUpperSnakeCase<ErrorCode>;
  export type Encoded<ErrorCode extends string> = IsValidUpperSnakeCase<ErrorCode>;
}

export const makeErrorCode = <const ErrorCode extends string>(
  code: IsValidUpperSnakeCase<ErrorCode> extends true ? ErrorCode : never
): ErrorCode => {
  invariant(ErrorCodeFormat.formatGuard(code), "Invalid error code format", {
    file: "./packages/shared/domain/src/factories/error-code.ts",
    line: 57,
    args: [code],
  });
  return code;
};
