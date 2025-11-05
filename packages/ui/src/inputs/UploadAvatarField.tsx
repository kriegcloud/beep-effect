"use client";
import Box from "@mui/material/Box";
import { useFieldContext } from "../form";
import { HelperText } from "./components";
import type { FilesUploadType, FileUploadType, UploadProps } from "./upload";
import { UploadAvatar } from "./upload";

function UploadAvatarField({ slotProps, ...other }: UploadProps) {
  const field = useFieldContext<FileUploadType | FilesUploadType | undefined>();

  const onDrop = (acceptedFiles: File[]) => {
    const value = acceptedFiles[0];

    field.handleChange(value);
  };

  const boxSlotPropsWrapper = slotProps?.wrapper ?? {};
  const ref = boxSlotPropsWrapper.ref ? { ref: boxSlotPropsWrapper.ref } : {};
  return (
    <Box
      {...ref}
      {...(slotProps?.wrapper
        ? {
            ...(slotProps.wrapper.ref ? { ref: slotProps.wrapper.ref } : {}),
          }
        : {})}
    >
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
