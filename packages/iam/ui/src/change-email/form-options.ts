import { BS } from "@beep/schema";
import { makeFormOptions } from "@beep/ui/form";
import { formOptions } from "@tanstack/react-form";
import * as S from "effect/Schema";

export const FormSchema = S.Struct({
  email: BS.Email,
});

export const FormOptions = formOptions(
  makeFormOptions({
    schema: FormSchema,
    defaultValues: {
      email: "",
    },
    validator: "onSubmit",
  })
);
