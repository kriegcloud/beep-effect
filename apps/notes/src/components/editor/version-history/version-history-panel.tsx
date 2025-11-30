import { useCurrentUser } from "@beep/notes/components/auth/useCurrentUser";
import { useDebouncedValueVersion } from "@beep/notes/components/editor/utils";
import { DiffPlate } from "@beep/notes/components/editor/version-history/diff-plate";
import { pushModal } from "@beep/notes/components/modals";
import { Empty } from "@beep/notes/components/ui/empty";
import { Icons } from "@beep/notes/components/ui/icons";
import { useDocumentId } from "@beep/notes/lib/navigation/routes";
import { Avatar, AvatarFallback, AvatarImage } from "@beep/notes/registry/ui/avatar";
import { Button } from "@beep/notes/registry/ui/button";
import { useDocumentQueryOptions, useDocumentVersionsQueryOptions } from "@beep/notes/trpc/hooks/query-options";
import { api, useTRPC } from "@beep/notes/trpc/react";
import type { UnsafeTypes } from "@beep/types";
import { useQuery } from "@tanstack/react-query";
import { createAtomStore } from "jotai-x";
import { cloneDeep } from "lodash";
import type { Value } from "platejs";
import { useEditorRef } from "platejs/react";
import React, { memo, useEffect, useState } from "react";

import { VersionsSkeleton } from "../../context-panel/versions-skeleton";

/**
 * Format a date as a relative time string (e.g., "2 hours ago", "3 days ago").
 */
const formatRelativeTime = (date: Date, baseDate: Date = new Date()): string => {
  const diffMs = baseDate.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSeconds < 60) {
    return diffSeconds <= 1 ? "just now" : `${diffSeconds} seconds ago`;
  }
  if (diffMinutes < 60) {
    return diffMinutes === 1 ? "1 minute ago" : `${diffMinutes} minutes ago`;
  }
  if (diffHours < 24) {
    return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
  }
  if (diffDays < 30) {
    return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
  }
  if (diffMonths < 12) {
    return diffMonths === 1 ? "1 month ago" : `${diffMonths} months ago`;
  }
  return diffYears === 1 ? "1 year ago" : `${diffYears} years ago`;
};

export const { useVersionSet, useVersionState, useVersionValue, VersionProvider } = createAtomStore(
  {
    activeVersionId: null as number | string | null,
  },
  {
    name: "version",
  }
);

export default memo(function VersionHistoryPanel() {
  const documentId = useDocumentId();
  const currentUser = useCurrentUser();

  const trpc = useTRPC();
  const queryOptions = useDocumentQueryOptions();
  const found = useQuery({
    ...queryOptions,
    select: (data) => !!data.document,
  });
  const versions = useQuery(useDocumentVersionsQueryOptions());
  const createVersion = api.version.createVersion.useMutation({
    onSuccess: () => {
      void trpc.version.documentVersions.invalidate({ documentId });
    },
  });
  const deleteVersion = api.version.deleteVersion.useMutation({
    onSuccess: () => {
      void trpc.version.documentVersions.invalidate({ documentId });
    },
  });

  const onDeleteVersionDialog = React.useCallback(
    (id: string) => {
      pushModal("Confirm", {
        name: "version",
        onConfirm: () => {
          deleteVersion.mutate({ id });
        },
      });
    },
    [deleteVersion]
  );

  return (
    // <div className="mt-[44px] flex h-[calc(100vh-44px)] flex-col">
    <div className="flex h-[calc(100vh)] flex-col">
      <div className="flex shrink-0 items-center justify-between border-b">
        <div className="px-4 py-3 text-sm font-semibold text-subtle-foreground">Version history</div>

        <div className="px-4 py-3">
          <Button
            variant="brand"
            disabled={createVersion.isPending}
            onClick={() => {
              if (!found.data) return;

              createVersion.mutate({ documentId });
            }}
          >
            Save version
          </Button>
        </div>
      </div>

      <div className="grow overflow-y-auto text-sm">
        {documentId && versions.data && (versions.data as UnsafeTypes.UnsafeAny).versions?.length > 0 ? (
          (versions.data as UnsafeTypes.UnsafeAny).versions.map((version: UnsafeTypes.UnsafeAny, index: number) => {
            if (!version) return null;
            const previousVersion = index > 0 ? (versions.data as UnsafeTypes.UnsafeAny)?.versions[index - 1] : null;
            return (
              <div key={index} className="flex border-b px-4 pt-3">
                <Avatar className="mr-2 size-7">
                  <AvatarImage alt={version.username} src={version.profileImageUrl ?? undefined} />
                  <AvatarFallback>{version.username}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      {currentUser?.id === version.userId ? "You" : version.username}
                      &nbsp;saved <span className="font-semibold">{document.title}</span>
                    </div>

                    <div className="shrink-0">
                      <Button
                        variant="ghost"
                        className="mr-2 size-6 p-1"
                        onClick={() => {
                          pushModal("VersionHistory", {
                            activeVersionId: version.id,
                          });
                        }}
                        tooltip="View version for this update"
                      >
                        <Icons.clock />
                      </Button>

                      <Button
                        variant="ghost"
                        className="group size-6 p-1 hover:bg-destructive"
                        onClick={() => onDeleteVersionDialog(version.id)}
                      >
                        <Icons.trash className="group-hover:text-destructive-foreground" />
                      </Button>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground/80">
                    {formatRelativeTime(new Date(version.createdAt))}
                  </div>

                  <div>
                    {index === 0 ? (
                      <CurrentDiffPlate previous={version.contentRich as Value} />
                    ) : (
                      <DiffPlate
                        current={previousVersion?.contentRich as Value}
                        previous={version.contentRich as Value}
                        showDiff
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : versions.data ? (
          <Empty title="No saved versions." />
        ) : (
          <VersionsSkeleton />
        )}
      </div>
    </div>
  );
});

export function CurrentDiffPlate({ previous }: { readonly previous: Value | null }) {
  const editor = useEditorRef();
  const [current, setCurrent] = useState(cloneDeep(editor.children));
  const version = useDebouncedValueVersion(1000);

  useEffect(() => {
    if (version) {
      setCurrent(cloneDeep(editor.children));
    }
  }, [version, editor.children]);

  return <DiffPlate current={current} previous={previous} showDiff />;
}
