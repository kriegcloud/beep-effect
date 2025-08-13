import type { FileThumbnailProps } from "@beep/ui/atoms/file-thumbnail";
import type { BoxProps } from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import React from "react";
import type { DropzoneOptions } from "react-dropzone";

export type FileUploadType = File | string | null;

export type FilesUploadType = (File | string)[];

export type SingleFilePreviewProps = React.ComponentProps<"div"> & {
  file: File | string;
  sx?: SxProps<Theme>;
};

export type MultiFilePreviewProps = React.ComponentProps<"ul"> & {
  sx?: SxProps<Theme>;
  files: FilesUploadType;
  lastNode?: React.ReactNode;
  firstNode?: React.ReactNode;
  onRemove: UploadProps["onRemove"];
  thumbnail: UploadProps["thumbnail"];
  slotProps?: {
    thumbnail?: Omit<FileThumbnailProps, "file">;
  };
};

export type UploadProps = DropzoneOptions & {
  error?: boolean;
  sx?: SxProps<Theme>;
  className?: string;
  thumbnail?: boolean;
  helperText?: React.ReactNode;
  placeholder?: React.ReactNode;
  value?: FileUploadType | FilesUploadType;
  onDelete?: () => void;
  onUpload?: () => void;
  onRemoveAll?: () => void;
  onRemove?: (file: File | string) => void;
};

export type UploadFieldProps = UploadProps & {
  name: string;
  slotProps?: {
    wrapper?: BoxProps;
  };
};
