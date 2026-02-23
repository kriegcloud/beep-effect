"use client";

import { useCurrentUser } from "@beep/notes/components/auth/useCurrentUser";
import { commentPlugin } from "@beep/notes/components/editor/plugins/comment-kit-app";
import { Icons } from "@beep/notes/components/ui/icons";
import { formatCommentDate } from "@beep/notes/lib/date/formatDate";
import { mergeDefined } from "@beep/notes/lib/mergeDefined";
import { useDocumentId } from "@beep/notes/lib/navigation/routes";
import { omitNil } from "@beep/notes/lib/omitNull";
import { cn } from "@beep/notes/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@beep/notes/registry/ui/avatar";
import { Button } from "@beep/notes/registry/ui/button";
import { useCommentEditor } from "@beep/notes/registry/ui/comment";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@beep/notes/registry/ui/dropdown-menu";
import { Editor, EditorContainer } from "@beep/notes/registry/ui/editor";
import type { RouterCommentItem } from "@beep/notes/server/api/types";
import { api, useTRPC } from "@beep/notes/trpc/react";
import type { UnsafeTypes } from "@beep/types";
import { getCommentKey, getDraftCommentKey } from "@platejs/comment";
import { CommentPlugin, useCommentId } from "@platejs/comment/react";
import { produce } from "immer";
import { NodeApi, type Value } from "platejs";
import { Plate, useEditorPlugin, useEditorRef } from "platejs/react";
import React, { useEffect, useMemo, useState } from "react";

export function Comment(props: {
  readonly comment: RouterCommentItem;
  readonly discussionLength: number;
  readonly documentContent: string;
  readonly editingId: string | null;
  readonly index: number;
  readonly setEditingId: React.Dispatch<React.SetStateAction<string | null>>;
  readonly showDocumentContent?: undefined | boolean;
  readonly onEditorClick?: undefined | (() => void);
}) {
  const {
    comment,
    discussionLength,
    documentContent,
    editingId,
    index,
    setEditingId,
    showDocumentContent = false,
    onEditorClick,
  } = props;
  const { user } = comment;

  const trpc = useTRPC();
  const documentId = useDocumentId();
  const resolveDiscussion = api.comment.resolveDiscussion.useMutation({
    onError(_, __, context: UnsafeTypes.UnsafeAny) {
      if (context?.previousDiscussions) {
        trpc.comment.discussions.setData({ documentId }, context.previousDiscussions);
      }
    },
    onMutate: async (input) => {
      await trpc.comment.discussions.cancel();
      const previousDiscussions = trpc.comment.discussions.getData({
        documentId,
      });

      trpc.comment.discussions.setData({ documentId }, (old) =>
        produce(old, (draft) => {
          if (!draft) return draft;

          const index = draft.discussions.findIndex((comment) => comment.id === input.id);

          if (index === -1) return;

          const discussion = draft.discussions[index];
          if (discussion) {
            discussion.isResolved = true;
          }
        })
      );

      return { previousDiscussions };
    },
    onSuccess: () => {
      void trpc.comment.discussions.invalidate({ documentId });
    },
  });

  const removeDiscussion = api.comment.removeDiscussion.useMutation({
    onError(_, __, context: UnsafeTypes.UnsafeAny) {
      if (context?.previousDiscussions) {
        trpc.comment.discussions.setData({ documentId }, context.previousDiscussions);
      }
    },
    onMutate: async (input) => {
      await trpc.comment.discussions.cancel();
      const previousDiscussions = trpc.comment.discussions.getData({
        documentId,
      });

      trpc.comment.discussions.setData({ documentId }, (old) =>
        produce(old, (draft) => {
          if (!draft) return draft;

          const index = draft.discussions.findIndex((comment) => comment.id === input.id);

          if (index === -1) return;

          draft.discussions.splice(index, 1);
        })
      );

      return { previousDiscussions };
    },
    onSuccess: () => {
      void trpc.comment.discussions.invalidate({ documentId });
    },
  });

  const updateComment = api.comment.updateComment.useMutation({
    onError(_, __, context: UnsafeTypes.UnsafeAny) {
      if (context?.previousDiscussions) {
        trpc.comment.discussions.setData({ documentId }, context.previousDiscussions);
      }
    },
    onMutate: async (input) => {
      await trpc.comment.discussions.cancel();
      const previousDiscussions = trpc.comment.discussions.getData({
        documentId,
      });

      trpc.comment.discussions.setData({ documentId }, (old) =>
        produce(old, (draft) => {
          if (!draft) return draft;

          const discussionsIndex = draft.discussions.findIndex((discussion) => discussion.id === input.discussionId);

          if (discussionsIndex === -1) return;

          const discussion = draft.discussions[discussionsIndex];
          if (!discussion) return;

          const replyIndex = discussion.comments.findIndex((comment) => comment.id === input.id);

          if (replyIndex === -1) return;

          const comment = discussion.comments[replyIndex];
          if (!comment) return;

          comment.isEdited = true;
          comment.contentRich = input.contentRich as UnsafeTypes.UnsafeAny;
          comment.updatedAt = new Date();
        })
      );

      return { previousDiscussions };
    },
    onSuccess: () => {
      void trpc.comment.discussions.invalidate({ documentId });
    },
  });

  const { id: currentUserId } = useCurrentUser();
  const { tf } = useEditorPlugin(commentPlugin);

  const isMyComment = useMemo(() => currentUserId === user.id, [currentUserId, user.id]);

  const initialValue = comment.contentRich as Value;

  const commentEditor = useCommentEditor(
    {
      id: comment.id,
      value: initialValue,
    },
    [initialValue]
  );

  const onCancel = () => {
    setEditingId(null);
    commentEditor.tf.replaceNodes(initialValue, {
      at: [],
      children: true,
    });
  };

  const onSave = () => {
    updateComment.mutate({
      id: comment.id,
      contentRich: commentEditor.children,
      discussionId: comment.discussionId,
      isEdited: true,
    });
    setEditingId(null);
  };

  const onResolveComment = () => {
    resolveDiscussion.mutate({ id: comment.discussionId });
    tf.comment.unsetMark({ id: comment.discussionId });
  };

  const isFirst = index === 0;
  const isLast = index === discussionLength - 1;
  const isEditing = editingId && editingId === comment.id;

  const [hovering, setHovering] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}>
      <div className="relative flex items-center">
        {user && (
          <Avatar className="mr-2 size-6">
            <AvatarImage alt={user.name!} src={user.profileImageUrl!} />
            <AvatarFallback>{user.name?.[0]}</AvatarFallback>
          </Avatar>
        )}

        <h4 className="text-sm leading-none font-semibold">{user?.name}</h4>

        <div className="ml-1.5 text-xs leading-none text-muted-foreground/80">
          <span className="mr-1">{formatCommentDate(comment.createdAt)}</span>
          {comment.isEdited && <span>(edited)</span>}
        </div>

        {isMyComment && (hovering || dropdownOpen) && (
          <div className="absolute top-0 right-0 flex">
            {index === 0 && (
              <Button
                variant="ghost"
                className="mr-1 h-6 p-1 text-muted-foreground"
                onClick={onResolveComment}
                tooltip="Resolve"
                type="button"
              >
                <Icons.check className="size-4" />
              </Button>
            )}

            <CommentMoreDropdown
              onCloseAutoFocus={() => {
                setTimeout(() => {
                  commentEditor.tf.focus({ edge: "endEditor" });
                }, 0);
              }}
              onRemoveComment={() => {
                if (discussionLength === 1) {
                  tf.comment.unsetMark({ id: comment.discussionId });
                  removeDiscussion.mutate({ id: comment.discussionId });
                }
              }}
              comment={comment}
              dropdownOpen={dropdownOpen}
              setDropdownOpen={setDropdownOpen}
              setEditingId={setEditingId}
            />
          </div>
        )}
      </div>

      {isFirst && showDocumentContent && (
        <div className="relative mt-1 flex pl-[32px] text-sm text-subtle-foreground">
          {discussionLength > 1 && <div className="absolute top-[5px] left-3 h-full w-0.5 shrink-0 bg-muted" />}
          <div className="my-px w-0.5 shrink-0 bg-highlight" />
          <div className="ml-2">{documentContent}</div>
        </div>
      )}

      <div className="relative my-1 pl-[26px]">
        {!isLast && <div className="absolute top-0 left-3 h-full w-0.5 shrink-0 bg-muted" />}
        <Plate readOnly={!isEditing} editor={commentEditor}>
          <EditorContainer variant="comment">
            <Editor variant="comment" className="w-auto grow" onClick={() => onEditorClick?.()} />

            {isEditing && (
              <div className="ml-auto flex shrink-0 gap-1">
                <Button
                  size="iconSm"
                  variant="ghost"
                  className="size-[28px]"
                  onClick={(e) => {
                    e.stopPropagation();
                    void onCancel();
                  }}
                >
                  <div className="flex size-5 items-center justify-center rounded-full bg-primary/40">
                    <Icons.x className="!size-3 stroke-[3px] text-background" />
                  </div>
                </Button>

                <Button
                  size="iconSm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    void onSave();
                  }}
                >
                  <div className="flex size-5 items-center justify-center rounded-full bg-brand">
                    <Icons.check className="!size-3 stroke-[3px] text-background" />
                  </div>
                </Button>
              </div>
            )}
          </EditorContainer>
        </Plate>
      </div>
    </div>
  );
}

function CommentMoreDropdown(props: {
  readonly comment: RouterCommentItem;
  readonly dropdownOpen: boolean;
  readonly setDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  readonly setEditingId: React.Dispatch<React.SetStateAction<string | null>>;
  readonly onCloseAutoFocus?: undefined | (() => void);
  readonly onRemoveComment?: undefined | (() => void);
}) {
  const { comment, dropdownOpen, setDropdownOpen, setEditingId, onCloseAutoFocus, onRemoveComment } = props;

  const trpc = useTRPC();
  const documentId = useDocumentId();
  const deleteComment = api.comment.deleteComment.useMutation({
    onError(_, __, context: UnsafeTypes.UnsafeAny) {
      if (context?.previousDiscussions) {
        trpc.comment.discussions.setData({ documentId }, context.previousDiscussions);
      }
    },
    onMutate: async (input) => {
      await trpc.comment.discussions.cancel();
      const previousDiscussions = trpc.comment.discussions.getData({
        documentId,
      });

      trpc.comment.discussions.setData({ documentId }, (old) =>
        produce(old, (draft) => {
          if (!draft) return draft;

          const discussionId = draft.discussions.findIndex((discussion) => discussion.id === input.discussionId);

          if (discussionId === -1) return;

          const discussions = draft.discussions[discussionId];
          if (!discussions) return;

          const replyIndex = discussions.comments.findIndex((comment) => comment.id === input.id);

          if (replyIndex !== -1) {
            discussions.comments.splice(replyIndex, 1);
          }
        })
      );

      return { previousDiscussions };
    },
    onSuccess: () => {
      void trpc.comment.discussions.invalidate({ documentId });
      onRemoveComment?.();
    },
  });

  const selectedEditCommentRef = React.useRef<boolean>(false);

  const onDeleteComment = React.useCallback(() => {
    if (!comment.id) return alert("You are operating too quickly, please try again later.");

    deleteComment.mutate({
      id: comment.id,
      discussionId: comment.discussionId,
    });
  }, [comment.discussionId, comment.id, deleteComment]);

  const onEditComment = React.useCallback(() => {
    selectedEditCommentRef.current = true;

    if (!comment.id) return alert("You are operating too quickly, please try again later.");

    setEditingId(comment.id);
  }, [comment.id, setEditingId]);

  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen} modal={false}>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" className="h-6 p-1 text-muted-foreground" tooltip="More actions">
          <Icons.more className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-48"
        onCloseAutoFocus={(e) => {
          if (selectedEditCommentRef.current) {
            onCloseAutoFocus?.();
            selectedEditCommentRef.current = false;
          }

          return e.preventDefault();
        }}
      >
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={onEditComment}>
            <Icons.edit className="size-4" />
            Edit comment
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDeleteComment}>
            <Icons.trash className="size-4" />
            Delete comment
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function CommentCreateForm({
  autoFocus = false,
  className,
  discussionId: discussionIdProp,
  focusOnMount = false,
  isSuggesting,
}: {
  readonly autoFocus?: boolean;
  readonly className?: string;
  readonly discussionId?: string;
  readonly focusOnMount?: boolean;
  readonly isSuggesting?: boolean;
}) {
  const trpc = useTRPC();
  const current = useCurrentUser();
  const documentId = useDocumentId();

  const createComment = api.comment.createComment.useMutation({
    onError(_, __, context: UnsafeTypes.UnsafeAny) {
      if (context?.previousDiscussions) {
        trpc.comment.discussions.setData({ documentId }, context.previousDiscussions);
      }
    },
    onMutate: async (input) => {
      await trpc.comment.discussions.cancel();
      const previousDiscussions = trpc.comment.discussions.getData({
        documentId,
      });

      trpc.comment.discussions.setData({ documentId }, (old) =>
        produce(old, (draft) => {
          if (!draft) return draft;

          const comments = draft.discussions.find((comment) => comment.id === input.discussionId)?.comments;

          const newUserInfo = mergeDefined(omitNil(input), {
            id: crypto.randomUUID(),
            isEdited: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            user: omitNil(current),
          });

          comments?.push(newUserInfo as UnsafeTypes.UnsafeAny);
        })
      );

      return { previousDiscussions };
    },
    onSuccess: () => {
      void trpc.comment.discussions.invalidate({ documentId });
    },
  });
  const createDiscussionWithComment = api.comment.createDiscussionWithComment.useMutation({
    onError(_, __, context: UnsafeTypes.UnsafeAny) {
      if (context?.previousDiscussions) {
        trpc.comment.discussions.setData({ documentId }, context.previousDiscussions);
      }
    },
    onMutate: async () => {
      await trpc.comment.discussions.cancel();
      const previousDiscussions = trpc.comment.discussions.getData({
        documentId,
      });

      return { previousDiscussions };
    },
    onSuccess: () => {
      void trpc.comment.discussions.invalidate({ documentId });
    },
  });

  const editor = useEditorRef();
  const currentUser = useCurrentUser();
  const discussionId = useCommentId() ?? discussionIdProp;
  const [resetKey, setResetKey] = React.useState(0);

  const [commentValue, setCommentValue] = React.useState<Value | undefined>();
  const commentContent = useMemo(
    () => (commentValue ? NodeApi.string({ children: commentValue as UnsafeTypes.UnsafeAny, type: "p" }) : ""),
    [commentValue]
  );
  const commentEditor = useCommentEditor({}, [resetKey]);

  useEffect(() => {
    if (commentEditor && focusOnMount) {
      commentEditor.tf.focus();
    }
  }, [commentEditor, focusOnMount]);

  const onAddComment = React.useCallback(async () => {
    setResetKey((prev) => prev + 1);

    if (discussionId) {
      createComment.mutate({
        contentRich: commentValue as UnsafeTypes.UnsafeAny,
        discussionId: discussionId,
      });

      return;
    }

    const commentsNodeEntry = editor.getApi(CommentPlugin).comment.nodes({ at: [], isDraft: true });

    if (commentsNodeEntry.length === 0) return;

    const documentContent = commentsNodeEntry.map(([node]) => node.text).join("");

    const { id } = await createDiscussionWithComment.mutateAsync({
      contentRich: commentValue as UnsafeTypes.UnsafeAny,
      documentContent: documentContent,
      documentId,
    });

    commentsNodeEntry.forEach(([_, path]) => {
      editor.tf.setNodes(
        {
          [getCommentKey(id)]: true,
        },
        { at: path, split: true }
      );
      editor.tf.unsetNodes([getDraftCommentKey()], { at: path });
    });
  }, [discussionId, editor, createDiscussionWithComment, commentValue, documentId, createComment]);

  const onAddSuggestion = React.useCallback(async () => {
    if (!discussionId) return;

    const suggestionId = discussionId;

    await createDiscussionWithComment.mutateAsync({
      contentRich: commentValue as UnsafeTypes.UnsafeAny,
      discussionId: suggestionId,
      documentContent: "__suggestion__",
      documentId,
    });
  }, [discussionId, createDiscussionWithComment, commentValue, documentId]);

  return (
    <div className={cn("flex w-full", className)}>
      <div className="mt-1 shrink-0">
        {currentUser && (
          <Avatar className="mr-2 size-6">
            <AvatarImage alt={currentUser.name!} src={currentUser.profileImageUrl!} />
            <AvatarFallback>{currentUser.name?.[0]}</AvatarFallback>
          </Avatar>
        )}
      </div>

      <div className="relative -ml-1 flex grow gap-2">
        <Plate
          onChange={({ value }) => {
            setCommentValue(value);
          }}
          editor={commentEditor}
        >
          <EditorContainer variant="comment">
            <Editor
              variant="comment"
              className="min-h-[25px] grow pt-0.5 pr-8"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();

                  if (isSuggesting) {
                    void onAddSuggestion();
                  } else {
                    void onAddComment();
                  }
                }
              }}
              placeholder="Reply..."
              autoComplete="off"
              autoFocus={autoFocus}
            />

            <Button
              size="iconSm"
              variant="ghost"
              className="absolute right-0 bottom-0 ml-auto shrink-0"
              disabled={commentContent.trim().length === 0}
              onClick={(e) => {
                e.stopPropagation();

                if (isSuggesting) {
                  void onAddSuggestion();
                } else {
                  void onAddComment();
                }
              }}
            >
              <div className="flex size-6 items-center justify-center rounded-full bg-brand">
                <Icons.arrowUp className="size-4 stroke-[3px] text-background" />
              </div>
            </Button>
          </EditorContainer>
        </Plate>
      </div>
    </div>
  );
}
