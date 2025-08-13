import { useFieldContext } from "../form";
import type { FilesUploadType, UploadFieldProps } from "./upload";
import { FileUploadType, UploadBox } from "./upload";

function UploadBoxField({ name, ...other }: UploadFieldProps) {
  const field = useFieldContext<FileUploadType | FilesUploadType | undefined>();

  return (
    <UploadBox
      value={field.state.value}
      error={!!field.form.state.errorMap.onSubmit?.[field.name]}
      {...other}
    />
  );
}

export default UploadBoxField;
