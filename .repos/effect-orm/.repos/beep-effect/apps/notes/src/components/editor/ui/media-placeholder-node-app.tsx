"use client";

// Todox-only
import { useDocumentId } from "@beep/notes/lib/navigation/routes";
import { cn } from "@beep/notes/lib/utils";
import { useUploadFile } from "@beep/notes/registry/hooks/use-upload-file";
import { BlockActionButton } from "@beep/notes/registry/ui/block-context-menu";
import { Button } from "@beep/notes/registry/ui/button";
import { Input } from "@beep/notes/registry/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@beep/notes/registry/ui/popover";
import { Spinner } from "@beep/notes/registry/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@beep/notes/registry/ui/tabs";
// Todox-only
import { api } from "@beep/notes/trpc/react";
import type { UnsafeTypes } from "@beep/types";
import { setMediaNode } from "@platejs/media";
import {
  PlaceholderPlugin,
  PlaceholderProvider,
  usePlaceholderElementState,
  usePlaceholderPopoverState,
} from "@platejs/media/react";
import { AudioLinesIcon, FileUpIcon, FilmIcon, ImageIcon } from "lucide-react";
import { KEYS, nanoid } from "platejs";
import { PlateElement, type PlateElementProps, useEditorPlugin, withHOC } from "platejs/react";
import type React from "react";
import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFilePicker } from "use-file-picker";

const CONTENT: Record<
  string,
  {
    readonly content: ReactNode;
    readonly icon: ReactNode;
  }
> = {
  [KEYS.audio]: {
    content: "Add an audio file",
    icon: <AudioLinesIcon />,
  },
  [KEYS.file]: {
    content: "Add a file",
    icon: <FileUpIcon />,
  },
  [KEYS.img]: {
    content: "Add an image",
    icon: <ImageIcon />,
  },
  [KEYS.video]: {
    content: "Add a video",
    icon: <FilmIcon />,
  },
};

const MEDIA_CONFIG: Record<
  string,
  {
    readonly accept: string[];
    readonly buttonText: string;
    readonly embedText: string;
  }
> = {
  [KEYS.audio]: {
    accept: ["audio/*"],
    buttonText: "Upload Audio",
    embedText: "Embed audio",
  },
  [KEYS.file]: {
    accept: ["*"],
    buttonText: "Choose a file",
    embedText: "Embed file",
  },
  [KEYS.img]: {
    accept: ["image/*"],
    buttonText: "Upload file",
    embedText: "Embed image",
  },
  [KEYS.video]: {
    accept: ["video/*"],
    buttonText: "Upload video",
    embedText: "Embed video",
  },
};

export const MediaPlaceholderPopover = ({ children }: { readonly children: React.ReactNode }) => {
  const {
    api: { placeholder },
    editor,
    getOption,
    tf,
  } = useEditorPlugin(PlaceholderPlugin);

  const { id, element, mediaType, readOnly, selected, setIsUploading, setProgresses, setUpdatedFiles, size } =
    usePlaceholderPopoverState();
  const [open, setOpen] = useState(false);

  // Todox-only
  const documentId = useDocumentId();
  const createFile = api.file.createFile.useMutation();

  const currentMedia = MEDIA_CONFIG[mediaType];

  // const mediaConfig = api.placeholder.getMediaConfig(mediaType as MediaKeys);
  const multiple = getOption("multiple") ?? true;

  const { isUploading, progress, uploadedFile, uploadFile, uploadingFile } = useUploadFile({
    onUploadComplete(file) {
      try {
        // Todox-only
        createFile.mutate({
          id: file.key,
          appUrl: file.appUrl,
          documentId: documentId,
          size: file.size,
          type: file.type,
          url: file.url,
        });
      } catch (error) {
        console.error(error, "error");
      }
    },
  });

  const replaceCurrentPlaceholder = useCallback(
    (file: File) => {
      setUpdatedFiles([file]);
      void uploadFile(file);
      placeholder.addUploadingFile(element.id as string, file);
    },

    [element.id]
  );

  /** Open file picker */
  const { openFilePicker } = useFilePicker({
    accept: currentMedia?.accept || ["*"],
    multiple,
    onFilesSelected: (data: UnsafeTypes.UnsafeAny) => {
      if (!("plainFiles" in data)) return;
      const updatedFiles: File[] = data.plainFiles;
      const firstFile = updatedFiles[0];
      if (!firstFile) return;
      const restFiles = updatedFiles.slice(1);

      replaceCurrentPlaceholder(firstFile);

      if (restFiles.length > 0) {
        // Convert File[] to FileList-like object
        const dataTransfer = new DataTransfer();
        restFiles.forEach((file) => dataTransfer.items.add(file));
        tf.insert.media(dataTransfer.files);
      }
    },
  });

  // React dev mode will call useEffect twice
  const isReplaced = useRef(false);
  /** Paste and drop */
  useEffect(() => {
    if (isReplaced.current) return;

    isReplaced.current = true;
    const currentFiles = placeholder.getUploadingFile(element.id as string);

    if (!currentFiles) return;

    replaceCurrentPlaceholder(currentFiles);
  }, [isReplaced]);

  useEffect(() => {
    if (!uploadedFile) return;

    const path = editor.api.findPath(element);

    const mediaNodeData: UnsafeTypes.UnsafeAny = {
      id: nanoid(),
      isUpload: true,
      name: mediaType === KEYS.file ? uploadedFile.name : "",
      placeholderId: element.id as string,
      type: mediaType!,
      url: uploadedFile.url,
    };
    if (size?.height !== undefined) mediaNodeData.initialHeight = size.height;
    if (size?.width !== undefined) mediaNodeData.initialWidth = size.width;

    if (path) {
      setMediaNode(editor, mediaNodeData, { at: path });
    } else {
      setMediaNode(editor, mediaNodeData);
    }
  }, [uploadedFile, element.id, size]);

  const [embedValue, setEmbedValue] = useState("");

  const onEmbed = useCallback(
    (value: string) => {
      setMediaNode(editor, {
        type: mediaType,
        url: value,
      });
    },
    [editor, mediaType]
  );

  useEffect(() => {
    setOpen(selected);
  }, [selected, setOpen]);

  useEffect(() => {
    if (isUploading) {
      setOpen(false);
    }
  }, [isUploading]);

  useEffect(() => {
    setProgresses({ [uploadingFile?.name ?? ""]: progress });
    setIsUploading(isUploading);
  }, [id, progress, isUploading, uploadingFile]);

  if (readOnly) return <>{children}</>;

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>

      <PopoverContent variant="media" className="flex flex-col" onOpenAutoFocus={(e) => e.preventDefault()}>
        <Tabs className="w-full shrink-0" defaultValue="account">
          <TabsList className="px-2" onMouseDown={(e) => e.preventDefault()}>
            <TabsTrigger value="account">Upload</TabsTrigger>
            <TabsTrigger value="password">Embed link</TabsTrigger>
          </TabsList>
          <TabsContent className="w-[300px] px-3 py-2" value="account">
            <Button variant="brand" className="w-full" onClick={openFilePicker}>
              {currentMedia?.buttonText || "Upload"}
            </Button>
            <div className="mt-3 text-xs text-muted-foreground">The maximum size per file is 5MB</div>
          </TabsContent>

          <TabsContent className="w-[300px] px-3 pt-2 pb-3 text-center" value="password">
            <Input value={embedValue} onChange={(e) => setEmbedValue(e.target.value)} placeholder="Paste the link..." />

            <Button variant="brand" className="mt-2 w-full max-w-[300px]" onClick={() => onEmbed(embedValue)}>
              {currentMedia?.embedText || "Embed"}
            </Button>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};

export const PlaceholderElement = withHOC(
  PlaceholderProvider,
  function PlaceholderElement({ children, ...props }: PlateElementProps) {
    const { mediaType, progresses, progressing, setSize, updatedFiles } = usePlaceholderElementState();

    const currentContent = CONTENT[mediaType];

    const isImage = mediaType === KEYS.img;

    const file: File | undefined = updatedFiles?.[0];
    const progress = file ? progresses?.[file.name] : undefined;

    const imageRef = useRef<HTMLImageElement>(null);
    useEffect(() => {
      if (!imageRef.current) return;

      const { height, width } = imageRef.current;

      setSize?.({
        height,
        width,
      });
    }, [imageRef.current]);

    return (
      <PlateElement className="relative my-1" {...props}>
        <MediaPlaceholderPopover>
          {(!progressing || !isImage) && (
            <div
              className={cn(
                "flex cursor-pointer items-center rounded-sm bg-muted p-3 pr-9 transition-bg-ease select-none hover:bg-primary/10"
              )}
              contentEditable={false}
              role="button"
            >
              <div className="relative mr-3 flex text-muted-foreground/80 [&_svg]:size-6">{currentContent?.icon}</div>
              <div className="text-sm whitespace-nowrap text-muted-foreground">
                <div>{progressing ? file?.name : currentContent?.content}</div>

                {progressing && !isImage && file && (
                  <div className="mt-1 flex items-center gap-1.5">
                    <div>{formatBytes(file.size)}</div>
                    <div>–</div>
                    <div className="flex items-center">
                      <Spinner className="mr-1 size-3.5" />
                      {progress ?? 0}%
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </MediaPlaceholderPopover>

        {isImage && progressing && file && progress !== undefined && (
          <ImageProgress file={file} imageRef={imageRef} progress={progress} />
        )}

        <BlockActionButton />

        {children}
      </PlateElement>
    );
  }
);

function ImageProgress({
  className,
  file,
  imageRef,
  progress = 0,
}: {
  readonly file: File;
  readonly className?: string;
  readonly imageRef?: React.RefObject<HTMLImageElement | null>;
  readonly progress?: number;
}) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setObjectUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  if (!objectUrl) {
    return null;
  }

  return (
    <div className={cn("relative", className)} contentEditable={false}>
      <img ref={imageRef} className="h-auto w-full rounded-xs object-cover" alt={file.name} src={objectUrl} />
      {progress < 100 && (
        <div className="absolute right-1 bottom-1 flex items-center space-x-2 rounded-full bg-black/50 px-1 py-0.5">
          <Spinner />
          <span className="text-xs font-medium text-white">{Math.round(progress)}%</span>
        </div>
      )}
    </div>
  );
}

function formatBytes(
  bytes: number,
  opts: {
    decimals?: number;
    sizeType?: "accurate" | "normal";
  } = {}
) {
  const { decimals = 0, sizeType = "normal" } = opts;

  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const accurateSizes = ["Bytes", "KiB", "MiB", "GiB", "TiB"];

  if (bytes === 0) return "0 Byte";

  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${(bytes / 1024 ** i).toFixed(decimals)} ${
    sizeType === "accurate" ? (accurateSizes[i] ?? "Bytest") : (sizes[i] ?? "Bytes")
  }`;
}
