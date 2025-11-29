"use client";

import { useDocumentId } from "@beep/notes/lib/navigation/routes";
import { useUploadFile } from "@beep/notes/registry/hooks/use-upload-file";
import { Button } from "@beep/notes/registry/ui/button";
import { Input } from "@beep/notes/registry/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@beep/notes/registry/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@beep/notes/registry/ui/tabs";
import { useUpdateDocumentMutation } from "@beep/notes/trpc/hooks/document-hooks";
import type { UnsafeTypes } from "@beep/types";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { useFilePicker } from "use-file-picker";

export const COVER_GRADIENTS = {
  aurora: "bg-linear-to-br from-green-400 via-teal-500 to-blue-500",
  autumn: "bg-linear-to-br from-yellow-400 via-orange-500 to-red-500",
  dusk: "bg-linear-to-br from-purple-500 via-pink-500 to-red-500",
  lavender: "bg-linear-to-br from-indigo-300 via-purple-300 to-pink-300",
  mint: "bg-linear-to-br from-green-200 via-teal-300 to-blue-300",
  misty: "bg-linear-to-br from-gray-300 via-blue-200 to-gray-100",
  ocean: "bg-linear-to-br from-blue-400 via-teal-500 to-emerald-500",
  peach: "bg-linear-to-br from-red-200 via-orange-200 to-yellow-200",
  sunset: "bg-linear-to-br from-orange-400 via-pink-500 to-purple-500",
  twilight: "bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500",
};

export function CoverPopover({ children }: { readonly children: React.ReactNode }) {
  const documentId = useDocumentId();
  const updateDocument = useUpdateDocumentMutation();
  const [open, setOpen] = useState(false);

  const onRemove = () => {
    updateDocument.mutate({
      id: documentId!,
      coverImage: "",
    });
  };

  const { isUploading, uploadFile } = useUploadFile({
    onUploadComplete: (file) => {
      updateDocument.mutate({
        id: documentId!,
        coverImage: file.url,
      });
      toast.success("Cover updated");
      setOpen(false);
    },
  });

  const { openFilePicker } = useFilePicker({
    accept: ["image/*"],
    multiple: false,
    onFilesSelected: (data: UnsafeTypes.UnsafeAny) => {
      if ("plainFiles" in data && data.plainFiles) {
        const file = data.plainFiles[0];
        if (file) {
          void uploadFile(file);
          toast.info("Starting to upload");
        }
      }
    },
  });

  const [embedValue, setEmbedValue] = useState("");

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <Button size="xs" variant="outline" className="font-medium text-muted-foreground">
          {children}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[540px]" onOpenAutoFocus={(e) => e.preventDefault()}>
        <Tabs defaultValue="gallery">
          <TabsList onMouseDown={(e) => e.preventDefault()}>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="link">Link</TabsTrigger>

            <Button variant="ghost2" className="ml-auto" onClick={onRemove}>
              Remove
            </Button>
          </TabsList>

          <TabsContent className="my-3 space-y-3 px-2 text-center" value="gallery">
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(COVER_GRADIENTS).map(([key, value]) => (
                <Button
                  key={key}
                  className={`h-20 w-full ${value}`}
                  onClick={() => {
                    updateDocument.mutate({
                      id: documentId!,
                      coverImage: key,
                    });
                    setOpen(false);
                  }}
                >
                  {key}
                </Button>
              ))}
            </div>
          </TabsContent>

          <TabsContent className="my-3 space-y-3 px-2 text-center" value="upload">
            <Button size="md" variant="outline" className="w-full" disabled={isUploading} onClick={openFilePicker}>
              Upload file
            </Button>

            <div className="text-xs text-muted-foreground">Images wider than 1500 pixels work best</div>

            <div className="text-xs text-muted-foreground">The maximum size per file is 5MB</div>
          </TabsContent>

          <TabsContent className="my-3 space-y-3 px-2 text-center" value="link">
            <Input
              value={embedValue}
              onChange={(e) => setEmbedValue(e.target.value)}
              placeholder="Paste an image link..."
            />

            <Button
              variant="brand"
              className="mt-2 w-full max-w-[300px]"
              onClick={() => {
                updateDocument.mutate({
                  id: documentId!,
                  coverImage: embedValue,
                });
                setOpen(false);
              }}
            >
              Submit
            </Button>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
