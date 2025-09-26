import { BS } from "@beep/schema";
import { makeFormOptions } from "@beep/ui/form";
import { formOptions } from "@tanstack/react-form";
import * as S from "effect/Schema";

export const FormSchema = S.Struct({
  email: BS.EmailBase,
  password: BS.Password,
  rememberMe: BS.BoolWithDefault(false),
});

export const FormOptions = formOptions(
  makeFormOptions({
    schema: FormSchema,
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    validator: "onSubmit",
  })
);
