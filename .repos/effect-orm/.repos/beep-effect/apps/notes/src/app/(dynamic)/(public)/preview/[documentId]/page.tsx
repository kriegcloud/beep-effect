import { auth } from "@beep/notes/components/auth/rsc/auth";
import type { PageProps } from "@beep/notes/lib/navigation/next-types";
import { HydrateClient, trpc } from "@beep/notes/trpc/server";

import { DocumentPreviewClient } from "./document-preview-client";

export default async function DocumentPreviewPage(props: PageProps<{ readonly documentId: string }>) {
  const { documentId } = await props.params;
  const { user } = await auth();

  if (user) {
    void trpc.document.document.prefetch({ id: documentId });
  }

  return (
    <HydrateClient>
      <DocumentPreviewClient />
    </HydrateClient>
  );
}
