import type { DefaultOmit } from "@beep/ui/inputs/Field";
import FormControl from "@mui/material/FormControl";
import { useStore } from "@tanstack/react-form";
import type React from "react";
import { useFieldContext } from "../form";
import { ColorPicker } from "./color";
import { HelperText } from "./components";
export type ColorFieldProps = DefaultOmit<React.ComponentProps<typeof ColorPicker>> & {
  readonly helperText?: string | undefined;
};
const ColorField = (props: ColorFieldProps) => {
  const field = useFieldContext<string | Array<string>>();
  const { error } = useStore(
    field.form.store,
    (state) =>
      ({
        error: state.errorMap.onSubmit?.[field.name],
      }) as const
  );

  return (
    <FormControl component={"fieldset"}>
      <ColorPicker value={field.state.value} onChange={(e) => field.handleChange(e)} options={props.options} />
      <HelperText disableGutters errorMessage={error} helperText={props.helperText} />
    </FormControl>
  );
};

export default ColorField;
