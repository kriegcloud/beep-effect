"use client";

import { useAuthValue } from "@beep/notes/components/auth/auth-provider-client";
import { Cover, CoverSkeleton } from "@beep/notes/components/cover/cover";
import { DocumentToolbar } from "@beep/notes/components/cover/document-toolbar";
import { PlateEditor } from "@beep/notes/components/editor/plate-editor";
import { DocumentPlate } from "@beep/notes/components/editor/plate-provider";
import { Skeleton } from "@beep/notes/components/ui/skeleton";
import { Button } from "@beep/notes/registry/ui/button";
import { useDocumentQueryOptions } from "@beep/notes/trpc/hooks/query-options";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

export function DocumentPreviewClient() {
  const user = useAuthValue("user");

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="mx-auto max-w-md space-y-6 rounded-lg border bg-card p-8 text-center shadow-sm">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">Login Required</h2>
            <p className="text-muted-foreground">
              This is a collaborative document. Please sign in to view and edit with others.
            </p>
          </div>
          <div className="flex justify-center gap-3">
            <Button variant="outline">
              <Link href="/api/login">Sign In</Link>
            </Button>
            <Button variant="outline">
              <Link href="/">Go to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <DocumentPreviewContent />;
}

function DocumentPreviewContent() {
  const queryOptions = useDocumentQueryOptions();

  const coverImage = useQuery({
    ...queryOptions,
    select: (data) => data.document?.coverImage,
  });
  const found = useQuery({
    ...queryOptions,
    select: (data) => !!data.document,
  });

  if (coverImage.isLoading) {
    return (
      <div>
        <CoverSkeleton />
        <div className="mx-auto mt-10 md:max-w-3xl lg:max-w-4xl">
          <div className="space-y-4 pt-4 pl-8">
            <Skeleton className="h-6 w-2/5" />
            <Skeleton className="h-8 w-3/5" />
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </div>
    );
  }
  if (!found.data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="mx-auto max-w-md space-y-6 rounded-lg border bg-card p-8 text-center shadow-sm">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">Document Not Found</h2>
            <p className="text-muted-foreground">
              The document you are looking for does not exist or has been removed.
            </p>
          </div>
          <div className="flex justify-center gap-3">
            <Button variant="outline">
              <Link href="/">Go to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DocumentPlate>
      <div className="pb-40">
        <Cover preview />
        <div className="mt-10">
          <DocumentToolbar preview />
          <PlateEditor />
        </div>
      </div>
    </DocumentPlate>
  );
}
