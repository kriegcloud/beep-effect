/**
 * Upload primitives backed by `react-dropzone`.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
"use client";

import { Avatar, AvatarFallback } from "@beep/ui/components/avatar";
import { Badge } from "@beep/ui/components/badge";
import { Button } from "@beep/ui/components/button";
import { useAtomValue } from "@effect/atom-react";
import { UploadSimpleIcon, UserIcon } from "@phosphor-icons/react";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import { Atom } from "effect/unstable/reactivity";
import { useDropzone } from "react-dropzone";
import { cn } from "../lib/index.ts";
import type React from "react";
import type { Accept, DropzoneOptions, FileRejection } from "react-dropzone";

type UploadDropzoneOptions = Pick<
  DropzoneOptions,
  | "getFilesFromEvent"
  | "maxFiles"
  | "maxSize"
  | "minSize"
  | "noDrag"
  | "noDragEventsBubbling"
  | "noKeyboard"
  | "onError"
  | "onFileDialogCancel"
  | "onFileDialogOpen"
  | "preventDropOnDocument"
  | "useFsAccessApi"
  | "validator"
>;

/**
 * Props for {@link UploadBox}.
 *
 * @category models
 * @since 0.0.0
 */
export interface UploadBoxProps
  extends Omit<
      React.ComponentProps<"div">,
      | "children"
      | "defaultValue"
      | "onChange"
      | "onDragEnter"
      | "onDragLeave"
      | "onDragOver"
      | "onDrop"
      | "onError"
      | keyof UploadDropzoneOptions
    >,
    UploadDropzoneOptions {
  readonly accept?: Accept | undefined;
  readonly children?: React.ReactNode | ((props: UploadBoxRenderProps) => React.ReactNode);
  readonly disabled?: boolean | undefined;
  readonly inputId?: string | undefined;
  readonly inputName?: string | undefined;
  readonly multiple?: boolean | undefined;
  readonly onInputBlur?: React.FocusEventHandler<HTMLInputElement> | undefined;
  readonly onRejectedFilesChange?: ((rejections: ReadonlyArray<FileRejection>) => void) | undefined;
  readonly onValueChange?: ((files: ReadonlyArray<File>) => void) | undefined;
  readonly value?: ReadonlyArray<File> | undefined;
}

/**
 * Preview URL for a selected image file.
 *
 * @category models
 * @since 0.0.0
 */
type UploadImagePreview = {
  readonly file: File;
  readonly url: string;
};

/**
 * Render props exposed to custom {@link UploadBox} children.
 *
 * @category models
 * @since 0.0.0
 */
export interface UploadBoxRenderProps {
  readonly disabled: boolean;
  readonly open: () => void;
  readonly previews: ReadonlyArray<UploadImagePreview>;
  readonly value: ReadonlyArray<File>;
}

const fileNames = (files: ReadonlyArray<File>): string =>
  A.isReadonlyArrayNonEmpty(files)
    ? A.join(
        A.map(files, (file) => file.name),
        ", "
      )
    : "No files selected";

const isImageFile = (file: File): boolean =>
  file.type.startsWith("image/") || /\.(avif|gif|jpe?g|png|svg|webp)$/iu.test(file.name);

const uploadImagePreviewsAtom = Atom.family((files: ReadonlyArray<File>) =>
  Atom.make((get): ReadonlyArray<UploadImagePreview> => {
    if (!P.isFunction(URL.createObjectURL)) {
      return A.empty();
    }

    const previews = A.flatMap(files, (file) =>
      isImageFile(file) ? A.make({ file, url: URL.createObjectURL(file) }) : A.empty()
    );

    get.addFinalizer(() => {
      for (const preview of previews) {
        URL.revokeObjectURL(preview.url);
      }
    });

    return previews;
  })
);

const UploadPreviewGrid: React.FC<{ readonly previews: ReadonlyArray<UploadImagePreview> }> = ({ previews }) => (
  <div className="grid w-full max-w-sm grid-cols-3 gap-2">
    {previews.map((preview) => (
      <figure
        key={`${preview.file.name}:${preview.file.lastModified}:${preview.file.size}`}
        className="border-border bg-muted/30 overflow-hidden rounded-md border"
      >
        <img src={preview.url} alt={preview.file.name} className="aspect-square w-full object-cover" />
        <figcaption className="text-muted-foreground truncate px-2 py-1 text-xs">{preview.file.name}</figcaption>
      </figure>
    ))}
  </div>
);

/**
 * Dropzone upload box.
 *
 * @example
 * ```tsx
 * import { UploadBox } from "@beep/ui/components/upload"
 *
 * console.log(UploadBox)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export const UploadBox: React.FC<UploadBoxProps> = ({
  accept,
  children,
  className,
  disabled = false,
  getFilesFromEvent,
  inputId,
  inputName,
  maxFiles,
  maxSize,
  minSize,
  multiple = true,
  noDrag,
  noDragEventsBubbling,
  noKeyboard,
  onError,
  onFileDialogCancel,
  onFileDialogOpen,
  onInputBlur,
  onRejectedFilesChange,
  onValueChange,
  preventDropOnDocument,
  useFsAccessApi,
  validator,
  value = A.empty(),
  ...props
}) => {
  const previews = useAtomValue(uploadImagePreviewsAtom(value));
  const dropzoneOptions: DropzoneOptions = {
    disabled,
    multiple,
    noClick: true,
    onDrop: (acceptedFiles, fileRejections) => {
      onValueChange?.(acceptedFiles);
      onRejectedFilesChange?.(fileRejections);
    },
  };

  if (accept !== undefined) dropzoneOptions.accept = accept;
  if (getFilesFromEvent !== undefined) dropzoneOptions.getFilesFromEvent = getFilesFromEvent;
  if (maxFiles !== undefined) dropzoneOptions.maxFiles = maxFiles;
  if (maxSize !== undefined) dropzoneOptions.maxSize = maxSize;
  if (minSize !== undefined) dropzoneOptions.minSize = minSize;
  if (noDrag !== undefined) dropzoneOptions.noDrag = noDrag;
  if (noDragEventsBubbling !== undefined) dropzoneOptions.noDragEventsBubbling = noDragEventsBubbling;
  if (noKeyboard !== undefined) dropzoneOptions.noKeyboard = noKeyboard;
  if (onError !== undefined) dropzoneOptions.onError = onError;
  if (onFileDialogCancel !== undefined) dropzoneOptions.onFileDialogCancel = onFileDialogCancel;
  if (onFileDialogOpen !== undefined) dropzoneOptions.onFileDialogOpen = onFileDialogOpen;
  if (preventDropOnDocument !== undefined) dropzoneOptions.preventDropOnDocument = preventDropOnDocument;
  if (useFsAccessApi !== undefined) dropzoneOptions.useFsAccessApi = useFsAccessApi;
  if (validator !== undefined) dropzoneOptions.validator = validator;

  const { getInputProps, getRootProps, isDragAccept, isDragActive, isDragReject, open } = useDropzone(dropzoneOptions);
  const content = P.isFunction(children)
    ? children({
        disabled,
        open,
        previews,
        value,
      })
    : children;

  return (
    <div
      {...getRootProps({
        ...props,
        className: cn(
          "border-input bg-background text-foreground flex min-h-28 w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-4 text-center transition-colors",
          isDragActive && "border-ring bg-muted/50",
          isDragAccept && "border-primary",
          isDragReject && "border-destructive bg-destructive/5",
          disabled && "pointer-events-none opacity-50",
          className
        ),
      })}
    >
      <input {...getInputProps({ id: inputId, name: inputName, onBlur: onInputBlur })} />
      {content ?? (
        <>
          {A.isReadonlyArrayNonEmpty(previews) ? (
            <UploadPreviewGrid previews={previews} />
          ) : (
            <UploadSimpleIcon className="text-muted-foreground size-5" />
          )}
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">Drop files here</span>
            <span className="text-muted-foreground text-xs">{fileNames(value)}</span>
          </div>
          <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={open}>
            Choose files
          </Button>
        </>
      )}
    </div>
  );
};

/**
 * Props for {@link Upload}.
 *
 * @category models
 * @since 0.0.0
 */
export interface UploadProps extends UploadBoxProps {}

/**
 * Standard upload primitive.
 *
 * @example
 * ```tsx
 * import { Upload } from "@beep/ui/components/upload"
 *
 * console.log(Upload)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export const Upload: React.FC<UploadProps> = (props) => <UploadBox {...props} />;

/**
 * Props for {@link UploadAvatar}.
 *
 * @category models
 * @since 0.0.0
 */
export interface UploadAvatarProps extends Omit<UploadBoxProps, "multiple"> {}

/**
 * Avatar-shaped single-file upload primitive.
 *
 * @example
 * ```tsx
 * import { UploadAvatar } from "@beep/ui/components/upload"
 *
 * console.log(UploadAvatar)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export const UploadAvatar: React.FC<UploadAvatarProps> = ({ className, value = A.empty(), ...props }) => (
  <UploadBox {...props} multiple={false} value={value} className={cn("min-h-36", className)}>
    {({ disabled, open, previews }) => {
      const preview = O.getOrUndefined(A.head(previews));
      return (
        <>
          <Avatar className="size-16">
            {preview !== undefined ? (
              <img
                data-slot="avatar-image"
                src={preview.url}
                alt={preview.file.name}
                className="aspect-square size-full object-cover"
              />
            ) : (
              <AvatarFallback>
                <UserIcon className="size-6" />
              </AvatarFallback>
            )}
          </Avatar>
          {A.isReadonlyArrayNonEmpty(value) ? <Badge variant="secondary">{value[0].name}</Badge> : null}
          <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={open}>
            Choose image
          </Button>
        </>
      );
    }}
  </UploadBox>
);
