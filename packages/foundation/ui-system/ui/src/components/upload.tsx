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
import { pipe } from "effect/Function";
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

type UploadBoxDropzoneOptionName =
  | "accept"
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
  | "validator";

type UploadBoxDropzoneProps = {
  readonly [Name in UploadBoxDropzoneOptionName]: Required<Pick<UploadBoxProps, Name>>[Name] | undefined;
} & {
  readonly disabled: boolean;
  readonly multiple: boolean;
  readonly onRejectedFilesChange?: ((rejections: ReadonlyArray<FileRejection>) => void) | undefined;
  readonly onValueChange?: ((files: ReadonlyArray<File>) => void) | undefined;
};

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

const optionalDropzoneOptions = ({
  accept,
  getFilesFromEvent,
  maxFiles,
  maxSize,
  minSize,
  noDrag,
  noDragEventsBubbling,
  noKeyboard,
  onError,
  onFileDialogCancel,
  onFileDialogOpen,
  preventDropOnDocument,
  useFsAccessApi,
  validator,
}: UploadBoxDropzoneProps): Partial<DropzoneOptions> => {
  const entries: ReadonlyArray<readonly [keyof DropzoneOptions, unknown]> = [
    ["accept", accept],
    ["getFilesFromEvent", getFilesFromEvent],
    ["maxFiles", maxFiles],
    ["maxSize", maxSize],
    ["minSize", minSize],
    ["noDrag", noDrag],
    ["noDragEventsBubbling", noDragEventsBubbling],
    ["noKeyboard", noKeyboard],
    ["onError", onError],
    ["onFileDialogCancel", onFileDialogCancel],
    ["onFileDialogOpen", onFileDialogOpen],
    ["preventDropOnDocument", preventDropOnDocument],
    ["useFsAccessApi", useFsAccessApi],
    ["validator", validator],
  ];

  return pipe(
    entries,
    A.reduce({} as Partial<DropzoneOptions>, (options, [key, value]) =>
      value === undefined
        ? options
        : {
            ...options,
            [key]: value,
          }
    )
  );
};

const makeDropzoneOptions = (options: UploadBoxDropzoneProps): DropzoneOptions => ({
  disabled: options.disabled,
  multiple: options.multiple,
  noClick: true,
  onDrop: (acceptedFiles, fileRejections) => {
    options.onValueChange?.(acceptedFiles);
    options.onRejectedFilesChange?.(fileRejections);
  },
  ...optionalDropzoneOptions(options),
});

const renderCustomUploadContent = (
  children: UploadBoxProps["children"],
  renderProps: UploadBoxRenderProps
): React.ReactNode => (P.isFunction(children) ? children(renderProps) : children);

const uploadBoxClassName = ({
  className,
  disabled,
  isDragAccept,
  isDragActive,
  isDragReject,
}: {
  readonly className?: string | undefined;
  readonly disabled: boolean;
  readonly isDragAccept: boolean;
  readonly isDragActive: boolean;
  readonly isDragReject: boolean;
}): string =>
  cn(
    "border-input bg-background text-foreground flex min-h-28 w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-4 text-center transition-colors",
    ...pipe(
      [
        [isDragActive, "border-ring bg-muted/50"],
        [isDragAccept, "border-primary"],
        [isDragReject, "border-destructive bg-destructive/5"],
        [disabled, "pointer-events-none opacity-50"],
      ] satisfies ReadonlyArray<readonly [boolean, string]>,
      A.filter(([enabled]) => enabled),
      A.map(([, enabledClassName]) => enabledClassName)
    ),
    className
  );

const UploadDefaultContent: React.FC<UploadBoxRenderProps> = ({ disabled, open, previews, value }) => (
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
);

const uploadBoxContent = (content: React.ReactNode, renderProps: UploadBoxRenderProps): React.ReactNode =>
  content ?? <UploadDefaultContent {...renderProps} />;

const useUploadBoxState = ({
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
}: UploadBoxProps) => {
  const previews = useAtomValue(uploadImagePreviewsAtom(value));
  const dropzoneOptions = makeDropzoneOptions({
    accept,
    disabled,
    getFilesFromEvent,
    maxFiles,
    maxSize,
    minSize,
    multiple,
    noDrag,
    noDragEventsBubbling,
    noKeyboard,
    onError,
    onFileDialogCancel,
    onFileDialogOpen,
    onRejectedFilesChange,
    onValueChange,
    preventDropOnDocument,
    useFsAccessApi,
    validator,
  });
  const dropzone = useDropzone(dropzoneOptions);
  const renderProps = { disabled, open: dropzone.open, previews, value };
  const content = renderCustomUploadContent(children, renderProps);

  return {
    content,
    inputProps: dropzone.getInputProps({ id: inputId, name: inputName, onBlur: onInputBlur }),
    renderProps,
    rootProps: dropzone.getRootProps({
      ...props,
      className: uploadBoxClassName({
        className,
        disabled,
        isDragAccept: dropzone.isDragAccept,
        isDragActive: dropzone.isDragActive,
        isDragReject: dropzone.isDragReject,
      }),
    }),
  };
};

const UploadBoxRoot: React.FC<ReturnType<typeof useUploadBoxState>> = ({
  content,
  inputProps,
  renderProps,
  rootProps,
}) => (
  <div {...rootProps}>
    <input {...inputProps} />
    {uploadBoxContent(content, renderProps)}
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
export const UploadBox: React.FC<UploadBoxProps> = (props) => {
  const state = useUploadBoxState(props);

  return <UploadBoxRoot {...state} />;
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
