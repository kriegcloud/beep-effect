import { useStore } from "@tanstack/react-form";
import * as F from "effect/Function";
import { useFieldContext } from "../form";
import type { EditorProps } from "./editor";
import { Editor } from "./editor";

function EditorField({ helperText, ...other }: EditorProps) {
  const field = useFieldContext<string>();
  const { error, isError, isSubmitSuccessful } = useStore(field.form.store, (state) =>
    F.pipe(
      state.errorMap.onSubmit?.[field.name],
      (error) =>
        ({
          error,
          isError: !!error,
          isSubmitSuccessful: state.isSubmitSuccessful,
        }) as const
    )
  );
  return (
    <Editor
      onChange={(v) => field.handleChange(v)}
      value={field.state.value}
      onBlur={field.handleBlur}
      error={isError}
      helperText={error ?? helperText}
      resetValue={isSubmitSuccessful}
      {...other}
    />
  );
}

export default EditorField;
