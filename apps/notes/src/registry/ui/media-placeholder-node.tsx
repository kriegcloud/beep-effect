"use client";

import { cn } from "@beep/notes/lib/utils";
import { useUploadFile } from "@beep/notes/registry/hooks/use-upload-file";

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

import { BlockActionButton } from "./block-context-menu";
import { Button } from "./button";
import { Input } from "./input";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Spinner } from "./spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

const CONTENT: Record<
  string,
  {
    content: ReactNode;
    icon: ReactNode;
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

export const PlaceholderElement = withHOC(PlaceholderProvider, (props: PlateElementProps) => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageRef.current]);

  return (
    <PlateElement className="my-1" {...props}>
      <MediaPlaceholderPopover>
        {(!progressing || !isImage) && (
          <div
            className={cn(
              "flex cursor-pointer items-center rounded-sm bg-muted p-3 pr-9 transition-bg-ease select-none hover:bg-primary/10"
            )}
            contentEditable={false}
            role="button"
          >
            <div className="relative mr-3 flex text-muted-foreground/80 [&_svg]:size-6">{currentContent.icon}</div>
            <div className="text-sm whitespace-nowrap text-muted-foreground">
              <div>{progressing ? file?.name : currentContent.content}</div>

              {progressing && !isImage && (
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

      {isImage && progressing && file && <ImageProgress file={file} imageRef={imageRef} progress={progress} />}

      <BlockActionButton />

      {props.children}
    </PlateElement>
  );
});

const MEDIA_CONFIG: Record<
  string,
  {
    accept: string[];
    buttonText: string;
    embedText: string;
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

function MediaPlaceholderPopover({ children }: { children: React.ReactNode }) {
  const { api, editor, getOption, tf } = useEditorPlugin(PlaceholderPlugin);

  const { id, element, mediaType, readOnly, selected, setIsUploading, setProgresses, setUpdatedFiles, size } =
    usePlaceholderPopoverState();
  const [open, setOpen] = useState(false);

  // Todox-only
  // const documentId = useDocumentId();
  // const createFile = trpc.file.createFile.useMutation();
  const currentMedia = MEDIA_CONFIG[mediaType];

  // const mediaConfig = api.placeholder.getMediaConfig(mediaType as MediaKeys);
  const multiple = getOption("multiple") ?? true;

  const { isUploading, progress, uploadedFile, uploadFile, uploadingFile } = useUploadFile({
    onUploadComplete() {
      // Todox-only
      // createFile.mutate({
      //   id: file.key,
      //   appUrl: file.appUrl,
      //   documentId: documentId,
      //   size: file.size,
      //   type: file.type,
      //   url: file.url,
      // });
    },
  });

  const replaceCurrentPlaceholder = useCallback(
    (file: File) => {
      setUpdatedFiles([file]);
      void uploadFile(file);
      api.placeholder.addUploadingFile(element.id as string, file);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [element.id]
  );

  /** Open file picker */
  const { openFilePicker } = useFilePicker({
    accept: currentMedia.accept,
    multiple,
    onFilesSelected: ({ plainFiles: updatedFiles }) => {
      const firstFile = updatedFiles[0];
      const restFiles = updatedFiles.slice(1);

      replaceCurrentPlaceholder(firstFile);

      restFiles.length > 0 && tf.insert.media(restFiles);
    },
  });

  // React dev mode will call useEffect twice
  const isReplaced = useRef(false);
  /** Paste and drop */
  useEffect(() => {
    if (isReplaced.current) return;

    isReplaced.current = true;
    const currentFiles = api.placeholder.getUploadingFile(element.id as string);

    if (!currentFiles) return;

    replaceCurrentPlaceholder(currentFiles);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReplaced]);

  useEffect(() => {
    if (!uploadedFile) return;

    const path = editor.api.findPath(element);

    setMediaNode(
      editor,
      {
        id: nanoid(),
        initialHeight: size?.height,
        initialWidth: size?.width,
        isUpload: true,
        name: mediaType === KEYS.file ? uploadedFile.name : "",
        placeholderId: element.id as string,
        type: mediaType!,
        url: uploadedFile.url,
      },
      { at: path }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
              {currentMedia.buttonText}
            </Button>
            <div className="mt-3 text-xs text-muted-foreground">The maximum size per file is 5MB</div>
          </TabsContent>

          <TabsContent className="w-[300px] px-3 pt-2 pb-3 text-center" value="password">
            <Input value={embedValue} onChange={(e) => setEmbedValue(e.target.value)} placeholder="Paste the link..." />

            <Button variant="brand" className="mt-2 w-full max-w-[300px]" onClick={() => onEmbed(embedValue)}>
              {currentMedia.embedText}
            </Button>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}

function ImageProgress({
  className,
  file,
  imageRef,
  progress = 0,
}: {
  file: File;
  className?: string;
  imageRef?: React.RefObject<HTMLImageElement | null>;
  progress?: number;
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
