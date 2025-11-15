import { useFieldContext } from "../form";
import type { FilesUploadType, FileUploadType, UploadProps } from "./upload";
import { UploadBox } from "./upload";

function UploadBoxField({ ...other }: UploadProps) {
  const field = useFieldContext<FileUploadType | FilesUploadType | undefined>();

  return <UploadBox value={field.state.value} error={!!field.form.state.errorMap.onSubmit?.[field.name]} {...other} />;
}

export default UploadBoxField;
