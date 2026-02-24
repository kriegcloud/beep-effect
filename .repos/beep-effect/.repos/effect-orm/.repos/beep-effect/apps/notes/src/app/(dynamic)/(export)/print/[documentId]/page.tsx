import { isAuth } from "@beep/notes/components/auth/rsc/auth";
import { Cover } from "@beep/notes/components/cover/cover";
import { DocumentToolbar } from "@beep/notes/components/cover/document-toolbar";
import { PlateEditor } from "@beep/notes/components/editor/plate-editor";
import { PrintPlate } from "@beep/notes/components/editor/plate-provider";
import type { PageProps } from "@beep/notes/lib/navigation/next-types";
import { HydrateClient, trpc } from "@beep/notes/trpc/server";
import { redirect } from "next/navigation";

export default async function PrintDocumentPage(props: PageProps<{ readonly documentId: string }>) {
  if (!(await isAuth())) return redirect("/");

  const { documentId } = await props.params;

  void trpc.document.document.prefetch({ id: documentId });

  return (
    <HydrateClient>
      <PrintPlate>
        <div className="flex h-full flex-col">
          <Cover />
          <div className="flex w-full flex-1 flex-col">
            <DocumentToolbar preview />
            <PlateEditor mode="print" />
          </div>
        </div>
      </PrintPlate>
    </HydrateClient>
  );
}
