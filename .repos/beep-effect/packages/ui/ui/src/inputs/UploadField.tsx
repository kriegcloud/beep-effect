import type { UnsafeTypes } from "@beep/types";
import type { BoxProps } from "@mui/material/Box";
import Box from "@mui/material/Box";
import { useFieldContext } from "../form";
import { HelperText } from "./components";
import type { UploadProps } from "./upload";
import { Upload } from "./upload";

function UploadField({
  slotProps,
  multiple,
  helperText,
  ...other
}: UploadProps & {
  readonly slotProps?:
    | {
        readonly wrapper?: BoxProps | undefined;
      }
    | undefined;
}) {
  const field = useFieldContext<UnsafeTypes.UnsafeAny>();
  const uploadProps = {
    multiple,
    accept: { "image/*": [] },
    error: !!field.form.state.errorMap.onSubmit?.[field.name],
    helperText: field.form.state.errorMap.onSubmit?.[field.name] ?? helperText,
  };
  const onDrop = (acceptedFiles: File[]) => {
    const value = multiple ? [...(field.state.value || []), ...acceptedFiles] : acceptedFiles[0];
    field.handleChange(value);
  };
  return (
    <Box {...slotProps?.wrapper}>
      <Upload {...uploadProps} value={field.state.value} onDrop={onDrop} {...other} />
      <HelperText errorMessage={field.form.state.errorMap.onSubmit?.[field.name]} sx={{ justifyContent: "center" }} />
    </Box>
  );
}

export default UploadField;
