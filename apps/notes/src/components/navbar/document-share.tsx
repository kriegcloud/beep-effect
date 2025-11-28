"use client";

import { useOrigin } from "@beep/notes/hooks/useOrigin";
import { useDocumentId } from "@beep/notes/lib/navigation/routes";
import { useCopyToClipboard } from "@beep/notes/registry/hooks/use-copy-to-clipboard";
import { Button, LinkButton } from "@beep/notes/registry/ui/button";
import { Input } from "@beep/notes/registry/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@beep/notes/registry/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@beep/notes/registry/ui/tabs";
import { useUpdateDocumentMutation } from "@beep/notes/trpc/hooks/document-hooks";
import { useDocumentQueryOptions } from "@beep/notes/trpc/hooks/query-options";
import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { toast } from "sonner";

import { useAuthGuard } from "../auth/useAuthGuard";
import { Icons } from "../ui/icons";

export const DocumentShare = () => {
  const authGuard = useAuthGuard();
  const documentId = useDocumentId();
  const { data: isPublished } = useQuery({
    ...useDocumentQueryOptions(),
    select: (data) => data.document?.isPublished,
  });

  const origin = useOrigin();
  const updateDocument = useUpdateDocumentMutation();
  const { copyToClipboard, isCopied } = useCopyToClipboard();

  const url = `${origin}/preview/${documentId!}`;

  const copyUrl = () => {
    copyToClipboard(url);
  };

  //
  const onPublish = () => {
    const promise = updateDocument.mutateAsync({
      id: documentId!,
      isPublished: true,
    });

    toast.promise(promise, {
      error: "Failed to publish note!",
      loading: "Publishing...",
      success: "Note published.",
    });
  };

  const onUnpublish = () => {
    const promise = updateDocument.mutateAsync({
      id: documentId!,
      isPublished: false,
    });

    toast.promise(promise, {
      error: "Failed to unpublish note!",
      loading: "Unpublishing...",
      success: "Note unpublished.",
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="relative" tooltip="Collaborate in real-time">
          <Users className="mr-2 size-4" />
          Collaborate
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80" align="end" alignOffset={8}>
        <Tabs defaultValue="publish">
          <TabsList>
            <TabsTrigger value="publish">Publish</TabsTrigger>
          </TabsList>

          <TabsContent value="publish">
            {isPublished ? (
              <div className="space-y-4 p-3">
                <div className="relative">
                  <Input
                    className="h-8 w-full flex-1 truncate border bg-muted pr-[32px] pl-2 text-muted-foreground"
                    readOnly
                    value={url}
                  />
                  <Button
                    size="menuAction"
                    variant="menuAction"
                    className="absolute top-1 right-1"
                    disabled={isCopied}
                    onClick={copyUrl}
                  >
                    {isCopied ? <Icons.check variant="muted" /> : <Icons.copyLink variant="muted" />}
                  </Button>
                </div>
                <div className="flex items-center justify-center gap-x-2 px-3">
                  <Button
                    size="md"
                    variant="outline"
                    className="font-medium"
                    disabled={updateDocument.isPending}
                    onClick={() => authGuard(onUnpublish)}
                  >
                    Unpublish
                  </Button>
                  <LinkButton size="md" variant="brand" href={url} target="_blank">
                    View site
                  </LinkButton>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-5">
                <p className="font-semibold">Publish to web</p>
                <span className="mt-1 text-sm text-muted-foreground">Share your document with others</span>

                <Button
                  variant="brand"
                  className="mt-4 w-full"
                  disabled={updateDocument.isPending}
                  onClick={() => authGuard(onPublish)}
                >
                  Publish
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};
