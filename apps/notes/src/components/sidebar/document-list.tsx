"use client";

import { useSession } from "@beep/notes/components/auth/useSession";
import { templateList } from "@beep/notes/components/editor/utils/useTemplateDocument";
import { useLocalStorage } from "@beep/notes/hooks/useLocalStorage";
import { routes, useDocumentId } from "@beep/notes/lib/navigation/routes";
import { cn } from "@beep/notes/lib/utils";
import { useTRPC } from "@beep/notes/trpc/react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { useAuthGuard } from "../auth/useAuthGuard";
import { Icons } from "../ui/icons";
import { NavItem } from "./nav-item";

const STORAGE_KEY = "sidebar-expanded-state";

export const removeExpandedIdFromStorage = (documentId: string) => {
  const expandedIds = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]") as string[];

  if (expandedIds) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(expandedIds.filter((id) => id !== documentId)));
  }
};

export const DocumentList = ({ level = 0, parentDocumentId }: { level?: number; parentDocumentId?: string }) => {
  const authGuard = useAuthGuard();
  const documentId = useDocumentId();
  const router = useRouter();
  const session = useSession();
  const trpc = useTRPC();

  const { data, isLoading } = useQuery({
    ...trpc.document.documents.queryOptions({
      parentDocumentId,
    }),
    enabled: !!session,
  });

  const documents = session ? data?.documents : templateList;

  const [expandedIds, setExpandedIds] = useLocalStorage<string[]>(STORAGE_KEY, []);

  const onExpand = (documentId: string) => {
    setExpandedIds(
      expandedIds.includes(documentId) ? expandedIds.filter((id) => id !== documentId) : [...expandedIds, documentId]
    );
  };

  const onRedirect = (documentId: string) => {
    router.push(routes.document({ documentId }));
  };

  if (isLoading) {
    return (
      <>
        <NavItem loading level={level} />
        {level === 0 && (
          <>
            <NavItem loading level={level} />
            <NavItem loading level={level} />
          </>
        )}
      </>
    );
  }

  return (
    <>
      <p
        className={cn(
          "hidden cursor-pointer py-1 text-sm font-medium text-muted-foreground/80 select-none",
          expandedIds.length > 0 && "last:block",
          level === 0 && "hidden"
        )}
        style={{
          paddingLeft: `${16 + level * 16}px`,
        }}
      >
        {level === 0 ? "No pages" : "No pages inside"}
      </p>
      {documents?.map((document) => (
        <div key={document.id} className="space-y-0.5">
          <NavItem
            id={document.id}
            onClick={() => onRedirect(document.id)}
            onExpand={() => authGuard(() => onExpand(document.id))}
            label={document.title || "Untitled"}
            active={documentId === document.id}
            documentIcon={document.icon}
            expanded={expandedIds.includes(document.id)}
            icon={Icons.document}
            level={level}
            updatedAt={document.updatedAt}
          />
          {expandedIds.includes(document.id) && (
            // to display all the child documents under a parent document
            // all the documents with that parent document id
            <DocumentList level={level + 1} parentDocumentId={document.id} />
          )}
        </div>
      ))}
    </>
  );
};
