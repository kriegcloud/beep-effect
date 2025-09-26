import { BS } from "@beep/schema";
import { makeFormOptions } from "@beep/ui/form";
import { formOptions } from "@tanstack/react-form";
import * as Equal from "effect/Equal";
import * as S from "effect/Schema";

export const FormSchema = S.Struct({
  firstName: S.NonEmptyTrimmedString,
  lastName: S.NonEmptyTrimmedString,
  email: BS.EmailBase,
  password: BS.Password,
  confirmPassword: BS.Password,
  rememberMe: BS.BoolWithDefault(false),
}).pipe(
  S.filter(({ password, confirmPassword }) => !Equal.equals(password, confirmPassword) || "Passwords do not match")
);

export const FormOptions = formOptions(
  makeFormOptions({
    schema: FormSchema,
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      rememberMe: false,
    },
    validator: "onSubmit",
  })
);
