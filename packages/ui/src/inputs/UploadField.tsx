import type { UnsafeTypes } from "@beep/types";
import { useFieldContext } from "../form";
import type { UploadFieldProps } from "./upload";
import { Upload } from "./upload";

function UploadField({ name, multiple, helperText, ...other }: UploadFieldProps) {
  const field = useFieldContext<UnsafeTypes.UnsafeAny>();
  const uploadProps = {
    multiple,
    accept: { "image/*": [] },
    error: !!field.form.state.errorMap.onSubmit?.[field.name],
    helperText: field.form.state.errorMap.onSubmit?.[field.name] ?? helperText,
  };
  const onDrop = (acceptedFiles: File[]) => {
    const value = multiple ? [...field.state.value, ...acceptedFiles] : acceptedFiles[0];

    field.handleChange([value]);
  };
  return <Upload {...uploadProps} value={field.state.value} onDrop={onDrop} {...other} />;
}

export default UploadField;
