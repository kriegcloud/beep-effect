import { HelperText } from "@beep/ui/inputs/components";
import { EmojiPicker } from "@beep/ui/inputs/emoji";
import { useStore } from "@tanstack/react-form";
import * as F from "effect/Function";
import type React from "react";
import { useFieldContext } from "../form";

export type Props = Omit<React.ComponentProps<typeof EmojiPicker>, "handleEmojiSelect"> & {
  readonly helperText: string;
};

const EmojiField: React.FC<Props> = (props) => {
  const field = useFieldContext<string>();

  const { error, isError } = useStore(field.form.store, (state) =>
    F.pipe(
      state.errorMap.onSubmit?.[field.name],
      (error) =>
        ({
          error,
          isError: !!error,
        }) as const
    )
  );

  return (
    <>
      <EmojiPicker {...props} handleEmojiSelect={(e) => field.handleChange(e)} />
      <HelperText errorMessage={isError && error ? error : props.helperText} />
    </>
  );
};

export default EmojiField;
