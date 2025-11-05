import type { SxProps, Theme } from "@mui/material/styles";
import type { DropzoneOptions } from "react-dropzone";
import type { MultiFilePreviewProps, PreviewOrientation } from "./components/multi-file-preview";
import type { RejectedFiles } from "./components/rejected-files";
import type { UploadWrapper } from "./default/styles";

export type FileUploadType = File | string | null;
export type FilesUploadType = (File | string)[];

export type UploadProps = DropzoneOptions & {
  readonly error?: boolean | undefined;
  readonly loading?: boolean | undefined;
  readonly className?: string | undefined;
  readonly sx?: SxProps<Theme> | undefined;
  readonly hideFilesRejected?: boolean | undefined;
  readonly helperText?: React.ReactNode | undefined;
  readonly placeholder?: React.ReactNode | undefined;
  readonly previewOrientation?: PreviewOrientation | undefined;
  readonly value?: FileUploadType | FilesUploadType | undefined;
  readonly onDelete?: (() => void) | undefined;
  readonly onUpload?: (() => void) | undefined;
  readonly onRemoveAll?: (() => void) | undefined;
  readonly onRemove?: ((file: File | string) => void) | undefined;
  readonly slotProps?:
    | {
        readonly wrapper?: React.ComponentProps<typeof UploadWrapper> | undefined;
        readonly multiPreview?: Partial<MultiFilePreviewProps> | undefined;
        readonly rejectedFiles?: React.ComponentProps<typeof RejectedFiles> | undefined;
      }
    | undefined;
};
