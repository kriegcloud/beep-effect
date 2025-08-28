"use client";
import { beep } from "@beep/rete";
import { consoleAuditor } from "@beep/rete/core/auditor";
import { BS } from "@beep/schema";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as S from "effect/Schema";

const FormSchema = S.Struct({
  meetsCriteria: S.Boolean.pipe(
    S.optional,
    S.withDefaults({
      constructor: () => false,
      decoding: () => false,
    })
  ),
  valid: S.Boolean.pipe(
    S.optional,
    S.withDefaults({
      constructor: () => false,
      decoding: () => false,
    })
  ),
  reason: S.String,
  password: S.String,
});
namespace FormSchema {
  export type Type = typeof FormSchema.Type;
  export type Encoded = typeof FormSchema.Encoded;
}

export const auditor = consoleAuditor();
export const session = beep<FormSchema.Type>(true, auditor);

const MIN_LENGTH = 12;
session
  .rule(`Password must be at least ${MIN_LENGTH} characters long`, ({ password }) => ({
    Password: {
      password,
    },
  }))
  .enact({
    then: ({ Password: { password } }) => {
      session.insert({
        Length: {
          meetsCriteria: password.length >= MIN_LENGTH,
        },
      });
    },
  });

session
  .rule("Password must contain special characters", ({ password }) => ({
    Password: {
      password,
    },
  }))
  .enact({
    then: ({ Password: { password } }) => {
      const specialCharacter = BS.Regex.make(/^(?=.*[~`!@#$%^&*()--+={}[\]|\\:;"'<>,.?/_₹]).*$/);
      session.insert({
        SpecialCharacters: {
          meetsCriteria: specialCharacter.test(password),
        },
      });
    },
  });

session
  .rule("Password must contain a digit", ({ password }) => ({
    Password: {
      password,
    },
  }))
  .enact({
    then: ({ Password: { password } }) => {
      const containsNumber = BS.Regex.make(/^(?=.*[0-9]).*$/);
      session.insert({
        Digit: {
          meetsCriteria: containsNumber.test(password),
        },
      });
    },
  });

session
  .rule("Password has an uppercase character", ({ password }) => ({
    Password: {
      password,
    },
  }))
  .enact({
    then: ({ Password: { password } }) => {
      const containsUpperCase = BS.Regex.make(/^(?=.*[A-Z]).*$/);
      session.insert({
        UpperCase: {
          meetsCriteria: containsUpperCase.test(password),
        },
      });
    },
  });

session
  .rule("Password has a lowercase character", ({ password }) => ({
    Password: {
      password,
    },
  }))
  .enact({
    then: ({ Password: { password } }) => {
      const containsLowerCase = BS.Regex.make(/^(?=.*[a-z]).*$/);
      session.insert({
        LowerCase: {
          meetsCriteria: containsLowerCase.test(password),
        },
      });
    },
  });

session
  .rule("Password is not a common password", ({ password }) => ({
    Password: {
      password,
    },
  }))
  .enact({
    then: ({ Password: { password } }) => {
      const commonPassword = ["123456", "abcdef", "111111", "222222", "password", "password123"];
      session.insert({
        IsNotCommon: {
          meetsCriteria: !commonPassword.includes(password),
        },
      });
    },
  });

session
  .rule("Password is trimmed", () => ({
    Password: {
      password: { then: false }, // Don't retrigger rule from insert in `then` block
    },
  }))
  .enact({
    then: ({ Password: { password } }) => {
      session.insert({
        Password: {
          password: password.trim(),
        },
      });
    },
  });

export const criteriaQuery = session
  .rule("Passwords meeting all criteria are valid", ({ meetsCriteria }) => ({
    $criteria: {
      meetsCriteria,
    },
  }))
  .enact({
    thenFinally: (results) =>
      session.insert({
        Password: {
          valid: F.pipe(
            results(),
            A.map(({ $criteria }) => $criteria.meetsCriteria)
          ).reduce((prev, cur) => prev && cur),
        },
      }),
  });

export const passwordQuery = session
  .rule("Password Query", ({ valid }) => ({
    Password: {
      valid,
    },
  }))
  .enact();
