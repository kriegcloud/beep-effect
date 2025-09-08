"use client";
import Box from "@mui/material/Box";
import { useFieldContext } from "../form";
import { HelperText } from "./components";
import type { FilesUploadType, UploadProps } from "./upload";
import { type FileUploadType, UploadAvatar } from "./upload";

function UploadAvatarField({ slotProps, ...other }: UploadProps) {
  const field = useFieldContext<FileUploadType | FilesUploadType | undefined>();

  const onDrop = (acceptedFiles: File[]) => {
    const value = acceptedFiles[0];

    field.handleChange(value);
  };

  return (
    <Box {...slotProps?.wrapper}>
      <UploadAvatar
        value={field.state.value}
        error={!!field.form.state.errorMap.onSubmit?.[field.name]}
        onDrop={onDrop}
        {...other}
      />

      <HelperText errorMessage={field.form.state.errorMap.onSubmit?.[field.name]} sx={{ textAlign: "center" }} />
    </Box>
  );
}

export default UploadAvatarField;
