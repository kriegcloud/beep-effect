"use client";

import { useSession } from "@beep/notes/components/auth/useSession";
import { useDocumentId } from "@beep/notes/lib/navigation/routes";
import { useTRPC } from "@beep/notes/trpc/react";

type UseTRPCReturnType = ReturnType<typeof useTRPC>;

type QueryOptionsTRPCReturn = ReturnType<UseTRPCReturnType["document"]["document"]["queryOptions"]> & {
  readonly enabled: boolean;
  readonly staleTime: number;
};
export const useDocumentQueryOptions: () => QueryOptionsTRPCReturn = () => {
  const documentId = useDocumentId();
  const session = useSession();

  return {
    ...(useTRPC() as ReturnType<typeof useTRPC>).document.document.queryOptions({
      id: documentId,
    }),
    enabled: !!session && !!documentId,
    // Prevent automatic refetch that might override optimistic updates
    staleTime: 2000, // Consider data fresh for 2 seconds
  };
};
type UseDiscussionsQueryOptions = ReturnType<UseTRPCReturnType["comment"]["discussions"]["queryOptions"]>;
export function useDiscussionsQueryOptions() {
  const documentId = useDocumentId();

  return useTRPC().comment.discussions.queryOptions({
    documentId,
  }) as UseDiscussionsQueryOptions;
}

type UseDocumentVersionsQueryOptions = ReturnType<UseTRPCReturnType["version"]["documentVersions"]["queryOptions"]>;
export const useDocumentVersionsQueryOptions: () => UseDocumentVersionsQueryOptions = () => {
  const documentId = useDocumentId();

  return useTRPC().version.documentVersions.queryOptions({
    documentId,
  }) as UseDocumentVersionsQueryOptions;
};
