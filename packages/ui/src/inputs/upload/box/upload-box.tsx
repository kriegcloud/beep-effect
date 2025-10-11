import { Iconify } from "@beep/ui/atoms";
import { mergeClasses } from "@beep/ui-core/utils";
import { useDropzone } from "react-dropzone";
import { uploadClasses } from "../classes";
import type { UploadProps } from "../types";
import { UploadArea } from "./styles";

export function UploadBox({ sx, error, disabled, className, placeholder, ...dropzoneOptions }: UploadProps) {
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    disabled,
    ...dropzoneOptions,
  });

  const hasError = isDragReject || !!error;

  return (
    <UploadArea
      {...getRootProps()}
      className={mergeClasses([uploadClasses.box, className], {
        [uploadClasses.state.dragActive]: isDragActive,
        [uploadClasses.state.disabled]: disabled,
        [uploadClasses.state.error]: hasError,
      })}
      sx={sx}
    >
      <input {...getInputProps()} />
      {placeholder ?? <Iconify icon="eva:cloud-upload-fill" width={28} />}
    </UploadArea>
  );
}
