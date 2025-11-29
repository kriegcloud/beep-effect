import { commentPlugin } from "@beep/notes/components/editor/plugins/comment-kit-app";
import { Comment, CommentCreateForm } from "@beep/notes/components/editor/ui/comment-app";
import { Empty } from "@beep/notes/components/ui/empty";
import { formatDiscussionDate } from "@beep/notes/lib/date/formatDate";
import { useDiscussionsQueryOptions } from "@beep/notes/trpc/hooks/query-options";
import type { UnsafeTypes } from "@beep/types";
import { useQuery } from "@tanstack/react-query";
import { useEditorPlugin } from "platejs/react";
import React, { memo, useMemo } from "react";

import { VersionsSkeleton } from "./versions-skeleton";

export default memo(function DiscussionPanel() {
  const { api } = useEditorPlugin(commentPlugin);
  const { data } = useQuery(useDiscussionsQueryOptions());

  const [editingId, setEditingId] = React.useState<string | null>(null);

  const discussions = (data as UnsafeTypes.UnsafeAny)?.discussions ?? [];

  const isEmpty = useMemo(() => {
    if (!discussions) return true;

    return (
      discussions.filter(
        (discussion: UnsafeTypes.UnsafeAny) => !discussion.isResolved && api.comment.has({ id: discussion.id })
      ).length === 0
    );
  }, [api.comment, discussions]);

  if (!data) return <VersionsSkeleton />;

  return (
    <div>
      <div className="border-b px-4 py-3 text-sm font-semibold text-subtle-foreground">Comments</div>

      <div className="h-[calc(100vh_-_89px)] overflow-y-auto">
        {isEmpty ? (
          <Empty title="No open comments or suggestions" />
        ) : (
          discussions.map(
            (discussion: UnsafeTypes.UnsafeAny) =>
              !discussion.isResolved &&
              api.comment.has({ id: discussion.id }) && (
                <div key={discussion.id} className="border-b p-4 hover:bg-accent/30">
                  <div className="mb-3 text-xs font-medium text-muted-foreground">
                    {formatDiscussionDate(discussion.createdAt)}
                  </div>

                  {discussion.comments.map((comment: UnsafeTypes.UnsafeAny, index: number) => (
                    <Comment
                      key={index}
                      comment={comment}
                      discussionLength={discussion.comments.length}
                      documentContent={discussion.documentContent}
                      editingId={editingId}
                      index={index}
                      setEditingId={setEditingId}
                      showDocumentContent
                    />
                  ))}
                  <CommentCreateForm discussionId={discussion.id} />
                </div>
              )
          )
        )}
      </div>
    </div>
  );
});
