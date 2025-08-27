"use client";

import { Iconify, Image } from "@beep/ui/atoms";
import { mergeClasses, rgbaFromChannel } from "@beep/ui/utils";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { uploadClasses } from "./classes";
import { RejectionFiles } from "./components/rejection-files";

import type { UploadProps } from "./types";

export function UploadAvatar({ sx, error, value, disabled, helperText, className, ...other }: UploadProps) {
  const { getRootProps, getInputProps, isDragActive, isDragReject, fileRejections } = useDropzone({
    multiple: false,
    disabled,
    accept: { "image/*": [] },
    ...other,
  });

  const hasFile = !!value;

  const hasError = isDragReject || !!error;

  const [preview, setPreview] = useState("");

  useEffect(() => {
    if (typeof value === "string") {
      setPreview(value);
    } else if (value instanceof File) {
      setPreview(URL.createObjectURL(value));
    }
  }, [value]);

  const renderPreview = () =>
    hasFile && <Image alt="Avatar" src={preview} sx={{ width: 1, height: 1, borderRadius: "50%" }} />;

  const renderPlaceholder = () => (
    <Box
      className="upload-placeholder"
      sx={(theme) => ({
        top: 0,
        gap: 1,
        left: 0,
        width: 1,
        height: 1,
        zIndex: 9,
        display: "flex",
        borderRadius: "50%",
        position: "absolute",
        alignItems: "center",
        color: "text.disabled",
        flexDirection: "column",
        justifyContent: "center",
        bgcolor: rgbaFromChannel(theme.vars.palette.grey["500Channel"], 0.08),
        transition: theme.transitions.create(["opacity"], {
          duration: theme.transitions.duration.shorter,
        }),
        "&:hover": { opacity: 0.72 },
        ...(hasError && {
          color: "error.main",
          bgcolor: rgbaFromChannel(theme.vars.palette.error.mainChannel, 0.08),
        }),
        ...(hasFile && {
          zIndex: 9,
          opacity: 0,
          color: "common.white",
          bgcolor: rgbaFromChannel(theme.vars.palette.grey["900Channel"], 0.64),
        }),
      })}
    >
      <Iconify icon="solar:camera-add-bold" width={32} />

      <Typography variant="caption">{hasFile ? "Update photo" : "Upload photo"}</Typography>
    </Box>
  );

  const renderContent = () => (
    <Box
      sx={{
        width: 1,
        height: 1,
        overflow: "hidden",
        borderRadius: "50%",
        position: "relative",
      }}
    >
      {renderPreview()}
      {renderPlaceholder()}
    </Box>
  );

  return (
    <>
      <Box
        {...getRootProps()}
        className={mergeClasses([uploadClasses.uploadBox, className])}
        sx={[
          (theme) => ({
            p: 1,
            m: "auto",
            width: 144,
            height: 144,
            cursor: "pointer",
            overflow: "hidden",
            borderRadius: "50%",
            border: `1px dashed ${rgbaFromChannel(theme.vars.palette.grey["500Channel"], 0.2)}`,
            ...(isDragActive && { opacity: 0.72 }),
            ...(disabled && { opacity: 0.48, pointerEvents: "none" }),
            ...(hasError && { borderColor: "error.main" }),
            ...(hasFile && {
              ...(hasError && {
                bgcolor: rgbaFromChannel(theme.vars.palette.error.mainChannel, 0.08),
              }),
              "&:hover .upload-placeholder": { opacity: 1 },
            }),
          }),
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        <input {...getInputProps()} />

        {renderContent()}
      </Box>

      {helperText && helperText}

      {!!fileRejections.length && <RejectionFiles files={fileRejections} />}
    </>
  );
}
