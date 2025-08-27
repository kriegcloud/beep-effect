import { Iconify } from "@beep/ui/atoms";
import { mergeClasses, rgbaFromChannel } from "@beep/ui/utils";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormHelperText from "@mui/material/FormHelperText";
import { useDropzone } from "react-dropzone";
import { uploadClasses } from "./classes";
import { UploadPlaceholder } from "./components/placeholder";
import { MultiFilePreview } from "./components/preview-multi-file";
import { DeleteButton, SingleFilePreview } from "./components/preview-single-file";
import { RejectionFiles } from "./components/rejection-files";

import type { UploadProps } from "./types";

export function Upload({
  sx,
  value,
  error,
  disabled,
  onDelete,
  onUpload,
  onRemove,
  thumbnail,
  helperText,
  onRemoveAll,
  className,
  multiple = false,
  ...other
}: UploadProps) {
  const { getRootProps, getInputProps, isDragActive, isDragReject, fileRejections } = useDropzone({
    multiple,
    disabled,
    ...other,
  });

  const isArray = Array.isArray(value) && multiple;

  const hasFile = !isArray && !!value;
  const hasFiles = isArray && !!value.length;

  const hasError = isDragReject || !!error;

  const renderMultiPreview = () =>
    hasFiles && (
      <>
        <MultiFilePreview files={value} thumbnail={thumbnail} onRemove={onRemove} sx={{ my: 3 }} />

        {(onRemoveAll || onUpload) && (
          <Box sx={{ gap: 1.5, display: "flex", justifyContent: "flex-end" }}>
            {onRemoveAll && (
              <Button color="inherit" variant="outlined" size="small" onClick={onRemoveAll}>
                Remove all
              </Button>
            )}

            {onUpload && (
              <Button
                size="small"
                variant="contained"
                onClick={onUpload}
                startIcon={<Iconify icon="eva:cloud-upload-fill" />}
              >
                Upload
              </Button>
            )}
          </Box>
        )}
      </>
    );

  return (
    <Box
      className={mergeClasses([uploadClasses.upload, className])}
      sx={[{ width: 1, position: "relative" }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <Box
        {...getRootProps()}
        sx={[
          (theme) => ({
            p: 5,
            outline: "none",
            borderRadius: 1,
            cursor: "pointer",
            overflow: "hidden",
            position: "relative",
            bgcolor: rgbaFromChannel(theme.vars.palette.grey["500Channel"], 0.08),
            border: `1px dashed ${rgbaFromChannel(theme.vars.palette.grey["500Channel"], 0.2)}`,
            transition: theme.transitions.create(["opacity", "padding"]),
            "&:hover": { opacity: 0.72 },
            ...(isDragActive && { opacity: 0.72 }),
            ...(disabled && { opacity: 0.48, pointerEvents: "none" }),
            ...(hasError && {
              color: "error.main",
              borderColor: "error.main",
              bgcolor: rgbaFromChannel(theme.vars.palette.error.mainChannel, 0.08),
            }),
            ...(hasFile && { padding: "28% 0" }),
          }),
        ]}
      >
        <input {...getInputProps()} />

        {/* Single file */}
        {hasFile ? <SingleFilePreview file={value as File} /> : <UploadPlaceholder />}
      </Box>

      {/* Single file */}
      {hasFile && <DeleteButton onClick={onDelete} />}

      {helperText && (
        <FormHelperText error={!!error} sx={{ mx: 1.75 }}>
          {helperText}
        </FormHelperText>
      )}

      {!!fileRejections.length && <RejectionFiles files={fileRejections} />}

      {/* Multi files */}
      {renderMultiPreview()}
    </Box>
  );
}
