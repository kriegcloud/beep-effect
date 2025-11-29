"use client";

import { cn } from "@beep/notes/lib/utils";
import { commentPlugin } from "@beep/notes/registry/components/editor/plugins/comment-kit";
import { discussionPlugin, type TDiscussion } from "@beep/notes/registry/components/editor/plugins/discussion-kit";
import { suggestionPlugin } from "@beep/notes/registry/components/editor/plugins/suggestion-kit";
import { useDebouncedCallback } from "@beep/notes/registry/hooks/use-debounce-callback";
import { Avatar, AvatarFallback, AvatarImage } from "@beep/notes/registry/ui/avatar";
import { Button } from "@beep/notes/registry/ui/button";
import { getDraftCommentKey } from "@platejs/comment";
import { BlockSelectionPlugin } from "@platejs/selection/react";
import {
  acceptSuggestion,
  getSuggestionKey,
  getTransientSuggestionKey,
  keyId2SuggestionId,
  rejectSuggestion,
} from "@platejs/suggestion";
import { CheckIcon, PencilLineIcon, XIcon } from "lucide-react";
import {
  ElementApi,
  KEYS,
  type Node,
  NodeApi,
  type NodeEntry,
  PathApi,
  type SlateEditor,
  type TCommentText,
  type TElement,
  TextApi,
  type TSuggestionText,
} from "platejs";
import {
  type PlateEditor,
  useEditorContainerRef,
  useEditorMounted,
  useEditorPlugin,
  useEditorRef,
  useEditorSelector,
  useEditorVersion,
  usePluginOption,
  usePluginOptions,
} from "platejs/react";
import React, { useEffect, useReducer, useRef, useState } from "react";

import { BLOCK_SUGGESTION, type ResolvedSuggestion, TYPE_TEXT_MAP } from "./block-suggestion";
import { Comment, CommentCreateForm, formatCommentDate } from "./comment";

export function FloatingDiscussion() {
  const mounted = useEditorMounted();
  const isOverlapWithEditor = usePluginOption(commentPlugin, "isOverlapWithEditor");

  if (!mounted || isOverlapWithEditor) return null;

  return <FloatingDiscussionContent />;
}

const getCommentTop = (
  editor: SlateEditor,
  {
    node,
    relativeElement,
    topOffset = 30,
  }: {
    node: TCommentText | TElement | TSuggestionText;
    relativeElement: HTMLDivElement;
    topOffset?: number;
  }
) => {
  const commentLeafDomNode = editor.api.toDOMNode(node);

  if (!commentLeafDomNode) return 0;

  const relativeElementRect = relativeElement.getBoundingClientRect();
  const scrollTop = relativeElement.scrollTop;
  const commentLeafRect = commentLeafDomNode.getBoundingClientRect();

  const top = commentLeafRect.top - relativeElementRect.top + scrollTop;

  return top > topOffset ? top - topOffset : 0;
};

const updateActiveBelow = (
  topMap: Record<string, number>,
  domMap: Record<string, HTMLDivElement | null>,
  activeId: string
) => {
  const discussionArray = Object.entries(topMap)
    .map(([id, top]) => ({ id, top }))
    .sort((a, b) => a.top - b.top);

  const activeIndex = discussionArray.findIndex(({ id }) => id === activeId);

  if (activeIndex === -1 || activeIndex === discussionArray.length - 1) return topMap;

  const activeElement = discussionArray[activeIndex];
  if (!activeElement) return topMap;
  const start = activeElement.top;
  const end = start + (domMap[activeId]?.clientHeight ?? 100);

  const nextElement = discussionArray[activeIndex + 1];
  if (!nextElement) return topMap;
  const nextStart = nextElement.top;

  // Check if next element overlaps with active element
  if (nextStart <= end) {
    // Move all following elements down
    const offset = end - nextStart + 10; // Add 10px gap

    for (let i = activeIndex + 1; i < discussionArray.length; i++) {
      const item = discussionArray[i];
      if (item) item.top += offset;
    }

    return Object.fromEntries(discussionArray.map((d) => [d.id, d.top]));
  }

  return topMap;
};

const updateActiveTop = (
  topMap: Record<string, number>,
  domMap: Record<string, HTMLDivElement | null>,
  activeId: string,
  targetTop: number
) => {
  const discussionArray = Object.entries(topMap)
    .map(([id, top]) => ({ id, top }))
    .sort((a, b) => a.top - b.top);

  const index = discussionArray.findIndex(({ id }) => id === activeId);

  if (index === -1) return topMap;

  const activeItem = discussionArray[index];
  if (!activeItem) return topMap;

  const currentTop = activeItem.top;
  const diff = targetTop - currentTop;

  // Set position of active element
  activeItem.top = targetTop;

  if (diff < 0) {
    // Moving up - check for overlaps with previous elements
    for (let i = index - 1; i >= 0; i--) {
      const currentElement = discussionArray[i];
      const nextElement = discussionArray[i + 1];
      if (!currentElement || !nextElement) continue;

      const elementHeight = domMap[currentElement.id]?.clientHeight ?? 100;

      // Check if current element overlaps with next element
      if (currentElement.top + elementHeight + 10 > nextElement.top) {
        // Move current element up to avoid overlap
        currentElement.top = nextElement.top - elementHeight - 10;
      } else {
        break; // No more overlaps
      }
    }
  } else {
    // Moving down - check for overlaps with next elements
    const activeHeight = domMap[activeId]?.clientHeight ?? 100;
    let activeBottom = targetTop + activeHeight + 10;

    // Only move elements that would overlap with active element
    for (let i = index + 1; i < discussionArray.length; i++) {
      const item = discussionArray[i];
      if (!item) continue;

      if (item.top < activeBottom) {
        item.top = activeBottom;
        activeBottom = item.top + (domMap[item.id]?.clientHeight ?? 100) + 10;
      } else {
        break; // No more overlaps
      }
    }
  }

  return Object.fromEntries(discussionArray.map((d) => [d.id, d.top]));
};

const updateTopCommenting = (topMap: Record<string, number>, domMap: Record<string, HTMLDivElement | null>) => {
  const discussionArray = Object.entries(topMap)
    .map(([id, topDistance]) => ({ id, topDistance }))
    .sort((a, b) => a.topDistance - b.topDistance);

  const index = discussionArray.findIndex(({ id }) => id === getDraftCommentKey());

  if (index === -1) return topMap;

  const activeItem = discussionArray[index];
  if (!activeItem) return topMap;

  const targetTopDistance = activeItem.topDistance;

  // Find if any elements need to move up or down
  let moveDistance = 0;

  for (let i = 0; i < discussionArray.length; i++) {
    const current = discussionArray[i];
    if (!current) continue;

    const currentHeight = domMap[current.id]?.clientHeight ?? 100;

    if (i < index) {
      // Check if element needs to move up
      const minRequiredSpace = targetTopDistance - (currentHeight + 10);

      if (current.topDistance > minRequiredSpace) {
        const distance = current.topDistance - minRequiredSpace;
        moveDistance = Math.max(moveDistance, distance);
      }
    }
  }

  // Move elements up if needed
  if (moveDistance > 0) {
    for (let i = 0; i < index; i++) {
      const item = discussionArray[i];
      if (!item) continue;
      item.topDistance -= moveDistance;
    }
  }

  // Check if next element overlaps with current element
  const currentHeight = domMap[activeItem.id]?.clientHeight ?? 100;
  const currentBottom = targetTopDistance + currentHeight + 10;

  if (index + 1 < discussionArray.length) {
    const nextElement = discussionArray[index + 1];
    if (!nextElement) return Object.fromEntries(discussionArray.map((d) => [d.id, d.topDistance]));

    if (nextElement.topDistance < currentBottom) {
      // Only move elements that overlap
      let currentTop = currentBottom;

      for (let i = index + 1; i < discussionArray.length; i++) {
        const element = discussionArray[i];
        if (!element) continue;

        if (element.topDistance < currentTop) {
          element.topDistance = currentTop;
          const elementHeight = domMap[element.id]?.clientHeight ?? 100;
          currentTop += elementHeight + 10;
        } else {
          break; // No more overlaps
        }
      }
    }
  }

  return Object.fromEntries(discussionArray.map((d) => [d.id, d.topDistance]));
};

const resolveOverlappingTop = (topMap: Record<string, number>, domMap: Record<string, HTMLDivElement | null>) => {
  const discussionArray = Object.entries(topMap)
    .map(([id, topDistance]) => ({ id, topDistance }))
    .sort((a, b) => a.topDistance - b.topDistance);

  // Iterate through each discussion from top to bottom, checking for overlap with previous discussions
  for (let i = 1; i < discussionArray.length; i++) {
    const currentDiscussion = discussionArray[i];
    if (!currentDiscussion) continue;

    const currentElement = domMap[currentDiscussion.id];

    if (!currentElement) continue;

    // Calculate the range of current discussion
    const currentStart = currentDiscussion.topDistance;
    const currentEnd = currentStart + currentElement.clientHeight;

    // Check for overlap with all previous discussions
    for (let j = 0; j < i; j++) {
      const previousDiscussion = discussionArray[j];
      if (!previousDiscussion) continue;

      const previousElement = domMap[previousDiscussion.id];

      if (!previousElement) continue;

      const previousStart = previousDiscussion.topDistance;
      const previousEnd = previousStart + previousElement.clientHeight;

      // Check for overlap: condition for two intervals overlapping
      if (
        (currentStart <= previousEnd && currentEnd >= previousStart) ||
        (previousStart <= currentEnd && previousEnd >= currentStart)
      ) {
        // If overlapping, move current discussion below the previous one
        currentDiscussion.topDistance = previousEnd + 10;
        // Update current discussion range and check for overlaps again
        i--;

        break;
      }
    }
  }

  return Object.fromEntries(discussionArray.map((d) => [d.id, d.topDistance]));
};

const useCommentingNode = () => {
  return useEditorSelector((editor) => {
    if (!editor.selection || editor.api.isExpanded()) return;

    return editor.api.node<TCommentText>({
      match: (n) => TextApi.isText(n) && n[KEYS.comment] && n[getDraftCommentKey()],
    })?.[0];
  }, []);
};

function FloatingDiscussionContent() {
  const editorContainerRef = useEditorContainerRef();
  const editor = useEditorRef();
  const commentApi = editor.getApi(commentPlugin);
  const suggestionApi = editor.getApi(suggestionPlugin);

  const activeCommentId = usePluginOption(commentPlugin, "activeId");
  const activeSuggestionId = usePluginOption(suggestionPlugin, "activeId");
  const activeId = activeCommentId ?? activeSuggestionId;
  const isOverlapWithEditor = usePluginOption(commentPlugin, "isOverlapWithEditor");
  const updateTimestamp = usePluginOption(commentPlugin, "updateTimestamp");

  const discussions = usePluginOption(discussionPlugin, "discussions");
  const domRef = React.useRef<Record<string, HTMLDivElement | null>>({});
  const topRef = React.useRef<Record<string, number>>({});

  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  const commentingNode = useCommentingNode();
  const version = useEditorVersion();

  const suggestionEntriesMap = useRef<Record<string, NodeEntry<TElement | TSuggestionText>[]>>({});

  useEffect(() => {
    suggestionEntriesMap.current = {};

    const allSuggestionNodes = suggestionApi.suggestion
      .nodes({ at: [] })
      .filter(([node]) => !node[getTransientSuggestionKey()]);

    const suggestionIds = new Set(
      allSuggestionNodes
        .flatMap(([node]) => {
          if (TextApi.isText(node)) {
            const dataList = suggestionApi.suggestion.dataList(node);
            const includeUpdate = dataList.some((data) => data.type === "update");

            if (!includeUpdate) return suggestionApi.suggestion.nodeId(node);

            return dataList.filter((data) => data.type === "update").map((d) => d.id);
          }
          if (ElementApi.isElement(node)) {
            return suggestionApi.suggestion.nodeId(node);
          }
          return undefined;
        })
        .filter(Boolean)
    );

    suggestionIds.forEach((id) => {
      if (!id) return;

      const entries = [
        ...editor.api.nodes<TElement | TSuggestionText>({
          at: [],
          mode: "all",
          match: (n) =>
            (n[KEYS.suggestion] && n[getSuggestionKey(id)]) || suggestionApi.suggestion.nodeId(n as TElement) === id,
        }),
      ];

      suggestionEntriesMap.current[id] = entries;
    });
  }, [editor, suggestionApi.suggestion, version]);

  const suggestionList = Object.entries(suggestionEntriesMap.current).map(([id, entries]) => ({
    id,
    entries,
  }));

  const renderFloatingDiscussion = React.useCallback(() => {
    if (isOverlapWithEditor) return;

    topRef.current = {};

    discussions.forEach((discussion) => {
      if (discussion.isResolved || !commentApi.comment.has({ id: discussion.id })) return;

      const commentLeafEntry = commentApi.comment.node({
        id: discussion.id,
        at: [],
      });

      if (!commentLeafEntry) return;

      const commentLeaf = commentLeafEntry[0];

      const topDistance = getCommentTop(editor, {
        node: commentLeaf,
        relativeElement: editorContainerRef.current!,
      });

      topRef.current[discussion.id] = topDistance;
    });

    suggestionList.forEach(({ id, entries }) => {
      if (!id || !entries[0]) return;

      const topDistance = getCommentTop(editor, {
        node: entries[0][0],
        relativeElement: editorContainerRef.current!,
      });
      topRef.current[id] = topDistance;
    });

    topRef.current = resolveOverlappingTop(topRef.current, domRef.current);
    forceUpdate();
  }, [discussions.length, suggestionList.length, editorContainerRef, isOverlapWithEditor]);

  const renderFloatingCreateForm = React.useCallback(() => {
    if (!commentingNode || activeId !== getDraftCommentKey()) return;

    const topDistance = getCommentTop(editor, {
      node: commentingNode,
      relativeElement: editorContainerRef.current!,
    });

    topRef.current[getDraftCommentKey()] = topDistance;

    topRef.current = updateTopCommenting(topRef.current, domRef.current);

    forceUpdate();
  }, [activeId, commentingNode, editor, editorContainerRef]);

  const debouncedUpdateFloat = useDebouncedCallback(renderFloatingDiscussion, 500);

  useEffect(() => {
    if (updateTimestamp) {
      debouncedUpdateFloat();
    }
  }, [debouncedUpdateFloat, updateTimestamp]);

  useEffect(() => {
    if (!discussions) return;

    setTimeout(() => {
      renderFloatingDiscussion();
    }, 0);
  }, [discussions, renderFloatingDiscussion]);

  useEffect(() => {
    if (!activeId || !domRef.current[activeId]) return;

    const resizeObserver = new ResizeObserver(() => {
      topRef.current = updateActiveBelow(topRef.current, domRef.current, activeId);

      forceUpdate();
    });
    resizeObserver.observe(domRef.current[activeId]);

    return () => {
      resizeObserver.disconnect();
    };
  }, [activeId]);

  useEffect(() => {
    if (!activeId) {
      return renderFloatingDiscussion();
    }

    const activeNode = commentApi.comment.node({ id: activeId, at: [] });
    const activeSuggestionNode = suggestionApi.suggestion.node({
      id: activeId,
      at: [],
      isText: true,
    });

    if (!activeNode && !activeSuggestionNode) return;

    topRef.current = updateActiveTop(
      topRef.current,
      domRef.current,
      activeId,
      getCommentTop(editor, {
        node: activeNode?.[0] || activeSuggestionNode![0],
        relativeElement: editorContainerRef.current!,
      })
    );

    forceUpdate();
  }, [
    activeId,
    editor,
    commentingNode,
    editorContainerRef,
    renderFloatingDiscussion,
    commentApi.comment,
    suggestionApi.suggestion,
  ]);

  useEffect(() => {
    if (!commentingNode || !domRef.current[getDraftCommentKey()]) {
      return;
    }

    const resizeObserver = new ResizeObserver(() => {
      renderFloatingCreateForm();
    });
    resizeObserver.observe(domRef.current[getDraftCommentKey()]!);

    return () => {
      resizeObserver.disconnect();
    };
  }, [commentingNode, editor, editorContainerRef, renderFloatingCreateForm, renderFloatingDiscussion]);

  useEffect(() => {
    if (!isOverlapWithEditor) {
      renderFloatingDiscussion();
    }
  }, [isOverlapWithEditor, renderFloatingDiscussion]);

  return (
    <>
      {/* Unsubmit comment */}
      {commentingNode && (
        <div
          ref={(el) => {
            domRef.current[getDraftCommentKey()] = el;
          }}
          className="absolute right-[80px] w-[288px] cursor-pointer rounded-lg border bg-popover p-3 transition-transform duration-200"
          style={{
            top: topRef.current[getDraftCommentKey()] ?? -9999,
          }}
        >
          <CommentCreateForm focusOnMount />
        </div>
      )}

      {discussions.map(
        (discussion) =>
          !discussion.isResolved &&
          commentApi.comment.has({ id: discussion.id }) && (
            <FloatingCommentsContent
              key={discussion.id}
              ref={(el) => {
                domRef.current[discussion.id] = el;
              }}
              discussion={discussion}
              domRef={domRef}
              top={topRef.current[discussion.id] ?? 0}
            />
          )
      )}

      {suggestionList.map(
        ({ id, entries }) =>
          id && (
            <FloatingSuggestionContent
              id={id}
              key={id}
              ref={(el) => {
                domRef.current[id] = el;
              }}
              entries={entries}
              top={topRef.current[id] ?? 0}
            />
          )
      )}
    </>
  );
}

type FloatingCommentsContentProps = {
  discussion: TDiscussion;
  domRef: React.RefObject<Record<string, HTMLDivElement | null>>;
  top: number;
};

function FloatingCommentsContent({ discussion, ref, top }: React.ComponentProps<"div"> & FloatingCommentsContentProps) {
  const editor = useEditorRef();

  const { activeId, hoverId } = usePluginOptions(commentPlugin, ({ activeId, hoverId }) => ({
    activeId,
    hoverId,
  }));

  const [editingId, setEditingId] = React.useState<string | null>(null);

  const setHoverId = (id: string | null) => {
    // If dropdown menu open, do not unset the active state since it will make dropdown menu open in the wrong position
    // Notion has the same issue
    if (document.activeElement?.closest("[data-radix-menu-content]")) return;

    editor.setOption(commentPlugin, "hoverId", id);
  };

  const highlightDiscussion = (editor: PlateEditor, id: string) => {
    editor.setOption(commentPlugin, "activeId", id);
    editor.setOption(suggestionPlugin, "activeId", null);
    const leaf = editor.api.node({
      at: [],
      match: (n) => TextApi.isText(n) && n[KEYS.comment] && editor.getApi(commentPlugin).comment.nodeId(n) === id,
    });

    if (!leaf) return;

    const parent = NodeApi.get<Node>(editor, leaf[1].slice(0, 1));

    editor.getApi(BlockSelectionPlugin).blockSelection.addSelectedRow(parent!.id as string, {
      clear: false,
      delay: 1000,
    });
  };

  return (
    <div
      ref={ref}
      className={cn(
        "animate-fade-in absolute right-20 z-10 w-72 cursor-pointer rounded-lg border bg-popover p-3 transition-transform duration-200",
        "[&[data-hover=true][data-active=false]]:-translate-x-2 [&[data-hover=true][data-active=false]]:bg-muted",
        "[&[data-active=true]]:-translate-x-2"
      )}
      style={{
        top,
      }}
      onClick={() => highlightDiscussion(editor, discussion.id)}
      onMouseEnter={() => setHoverId(discussion.id)}
      onMouseLeave={() => setHoverId(null)}
      data-active={activeId === discussion.id}
      data-discussion-id={discussion.id}
      data-hover={hoverId === discussion.id}
    >
      {discussion.comments.length >= 3 &&
      activeId !== discussion.id &&
      discussion.comments[0] &&
      discussion.comments.at(-1) ? (
        <>
          <Comment
            key={discussion.comments[0].id}
            onEditorClick={() => highlightDiscussion(editor, discussion.id)}
            comment={discussion.comments[0]}
            discussionLength={discussion.comments.length}
            documentContent={discussion?.documentContent}
            editingId={editingId}
            index={0}
            setEditingId={setEditingId}
          />
          <div className="relative mb-1 ml-[26px] flex h-7 items-center rounded-md pl-1.5 text-sm text-muted-foreground hover:bg-muted">
            <div className="absolute top-[-5px] left-[-14px] h-full w-0.5 shrink-0 bg-muted" />
            <div className="ml-2">Show {discussion.comments.length - 2} replies</div>
          </div>
          {discussion.comments.at(-1) && (
            <Comment
              key={discussion.comments.at(-1)!.id}
              onEditorClick={() => highlightDiscussion(editor, discussion.id)}
              comment={discussion.comments.at(-1)!}
              discussionLength={discussion.comments.length}
              documentContent={discussion?.documentContent}
              editingId={editingId}
              index={discussion.comments.length - 1}
              setEditingId={setEditingId}
            />
          )}
        </>
      ) : (
        discussion.comments.map((comment, index) => (
          <Comment
            key={comment.id ?? index}
            onEditorClick={() => highlightDiscussion(editor, discussion.id)}
            comment={comment}
            discussionLength={discussion.comments.length}
            documentContent={discussion?.documentContent}
            editingId={editingId}
            index={index}
            setEditingId={setEditingId}
          />
        ))
      )}

      {activeId === discussion.id && <CommentCreateForm discussionId={discussion.id} />}
    </div>
  );
}

type FloatingSuggestionContentProps = {
  readonly id: string;
  readonly entries: NodeEntry<TElement | TSuggestionText>[];
  readonly top: number;
};

const FloatingSuggestionContent = ({
  id,
  entries,
  ref,
  top,
}: React.ComponentProps<"div"> & FloatingSuggestionContentProps) => {
  const { api, editor, setOption } = useEditorPlugin(suggestionPlugin);
  const firstEntry = entries[0];
  if (!firstEntry) return null;

  const nodeData = api.suggestion.suggestionData(firstEntry[0]);

  const { activeId, hoverId } = usePluginOptions(suggestionPlugin, ({ activeId, hoverId }) => ({
    activeId,
    hoverId,
  }));

  const userId = usePluginOption(discussionPlugin, "currentUserId");
  const userData = usePluginOption(discussionPlugin, "user", userId);
  const discussions = usePluginOption(discussionPlugin, "discussions");

  const [editingId, setEditingId] = useState<string | null>(null);

  if (entries.length === 0) return null;

  // move line break to the end
  entries.sort(([, path1], [, path2]) => {
    return PathApi.isChild(path1, path2) ? -1 : 1;
  });

  let newText = "";
  let text = "";
  let properties: any = {};
  let newProperties: any = {};

  // overlapping suggestion
  entries.forEach(([node]) => {
    if (TextApi.isText(node)) {
      const dataList = api.suggestion.dataList(node);

      dataList.forEach((data) => {
        if (data.id !== id) return;

        switch (data.type) {
          case "insert": {
            newText += node.text;

            break;
          }
          case "remove": {
            text += node.text;

            break;
          }
          case "update": {
            properties = {
              ...properties,
              ...data.properties,
            };
            newProperties = {
              ...newProperties,
              ...data.newProperties,
            };
            newText += node.text;

            break;
          }
        }
      });
    } else {
      const lineBreakData = api.suggestion.isBlockSuggestion(node) ? node.suggestion : undefined;

      if (lineBreakData?.id !== keyId2SuggestionId(id)) return;
      if (lineBreakData.type === "insert") {
        newText += lineBreakData.isLineBreak
          ? BLOCK_SUGGESTION
          : BLOCK_SUGGESTION + (TYPE_TEXT_MAP[node.type]?.(node) ?? "");
      } else if (lineBreakData.type === "remove") {
        text += lineBreakData.isLineBreak
          ? BLOCK_SUGGESTION
          : BLOCK_SUGGESTION + (TYPE_TEXT_MAP[node.type]?.(node) ?? "");
      }
    }
  });

  if (!nodeData) return null;

  const comments = discussions.find((d) => d.id === id)?.comments || [];
  const createdAt = new Date(nodeData.createdAt);
  const keyId = getSuggestionKey(id);

  const suggestionText2Array = (text: string) => {
    if (text === BLOCK_SUGGESTION) return ["line breaks"];

    return text.split(BLOCK_SUGGESTION).filter(Boolean);
  };

  const accept = (suggestion: ResolvedSuggestion) => {
    api.suggestion.withoutSuggestions(() => {
      acceptSuggestion(editor, suggestion);
    });
  };

  const reject = (suggestion: ResolvedSuggestion) => {
    api.suggestion.withoutSuggestions(() => {
      rejectSuggestion(editor, suggestion);
    });
  };

  let suggestion: ResolvedSuggestion;

  if (nodeData.type === "update") {
    suggestion = {
      comments,
      createdAt,
      keyId,
      newProperties,
      newText,
      properties,
      suggestionId: keyId2SuggestionId(id),
      type: "update",
      userId: nodeData.userId,
    };
  } else if (newText.length > 0 && text.length > 0) {
    suggestion = {
      comments,
      createdAt,
      keyId,
      newText,
      suggestionId: keyId2SuggestionId(id),
      text,
      type: "replace",
      userId: nodeData.userId,
    };
  } else if (newText.length > 0) {
    suggestion = {
      comments,
      createdAt,
      keyId,
      newText,
      suggestionId: keyId2SuggestionId(id),
      type: "insert",
      userId: nodeData.userId,
    };
  } else if (text.length > 0) {
    suggestion = {
      comments,
      createdAt,
      keyId,
      suggestionId: keyId2SuggestionId(id),
      text,
      type: "remove",
      userId: nodeData.userId,
    };
  } else {
    return null;
  }

  const highlightSuggestion = (editor: PlateEditor, id: string) => {
    editor.setOption(suggestionPlugin, "activeId", id);
    editor.setOption(commentPlugin, "activeId", null);

    const leaf = editor.api.node({
      at: [],
      match: (n) => n[KEYS.suggestion] && editor.getApi(suggestionPlugin).suggestion.nodeId(n as any) === id,
    });

    if (!leaf) return;

    const parent = NodeApi.get<Node>(editor, leaf[1].slice(0, 1));

    editor.getApi(BlockSelectionPlugin).blockSelection.addSelectedRow(parent!.id as string, {
      clear: false,
      delay: 1000,
    });
  };

  return (
    <div
      ref={ref}
      className={cn(
        "animate-fade-in absolute right-20 z-10 w-72 cursor-pointer rounded-lg border bg-popover p-3 transition-transform duration-200",
        "[&[data-hover=true][data-active=false]]:-translate-x-2 [&[data-hover=true][data-active=false]]:bg-muted",
        "[&[data-active=true]]:-translate-x-2"
      )}
      style={{ top }}
      onClick={() => highlightSuggestion(editor, id)}
      onMouseEnter={() => setOption("hoverId", id)}
      onMouseLeave={() => setOption("hoverId", null)}
      data-active={activeId === id}
      data-discussion-id={id}
      data-hover={hoverId === id}
    >
      <div className="flex flex-col">
        <div className="relative flex items-center">
          {userData && (
            <>
              <Avatar className="relative mr-2 size-6">
                <AvatarImage alt={userData.name} src={userData.avatarUrl} />
                <AvatarFallback>{userData.name?.[0]}</AvatarFallback>
              </Avatar>
              <PencilLineIcon className="absolute -bottom-2 left-4 size-4 rounded-[50%] bg-brand-foreground p-0.5 text-brand/80" />
            </>
          )}
          <h4 className="text-sm leading-none font-semibold">{userData?.name}</h4>
          <div className="ml-1.5 text-xs leading-none text-muted-foreground/80">
            <span className="mr-1">{formatCommentDate(suggestion.createdAt)}</span>
          </div>
        </div>

        <div className="relative mt-1 mb-4 pl-[32px]">
          <div className="flex flex-col gap-2">
            {suggestion.type === "remove" && (
              <React.Fragment>
                {suggestionText2Array(suggestion.text!).map((text, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Delete:</span>
                    <span className="text-sm">{text}</span>
                  </div>
                ))}
              </React.Fragment>
            )}

            {suggestion.type === "insert" && (
              <React.Fragment>
                {suggestionText2Array(suggestion.newText!).map((text, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Add:</span>
                    <span className="text-sm">"{text || "line breaks"}"</span>
                  </div>
                ))}
              </React.Fragment>
            )}

            {suggestion.type === "replace" && (
              <div className="flex flex-col gap-2">
                {suggestionText2Array(suggestion.newText!).map((text, index) => (
                  <React.Fragment key={index}>
                    <div className="flex items-center text-brand/80">
                      <span className="text-sm">With:</span>
                      <span className="text-sm">"{text || "line breaks"}"</span>
                    </div>
                  </React.Fragment>
                ))}

                {suggestionText2Array(suggestion.text!).map((text, index) => (
                  <React.Fragment key={index}>
                    <div className="flex items-center">
                      <span className="text-sm text-muted-foreground">{index === 0 ? "Replace:" : "Delete:"}</span>
                      <span className="text-sm">"{text || "line breaks"}"</span>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            )}

            {suggestion.type === "update" && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {Object.keys(suggestion.properties).map((key) => (
                    <span key={key}>Un{key}</span>
                  ))}
                  {Object.keys(suggestion.newProperties).map((key) => (
                    <span key={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                  ))}
                </span>
                <span className="text-sm">"{suggestion.newText}"</span>
              </div>
            )}
          </div>
        </div>

        {suggestion.comments.length >= 3 && activeId !== id && suggestion.comments[0] && suggestion.comments.at(-1) ? (
          <>
            <Comment
              key={suggestion.comments[0].id}
              comment={suggestion.comments[0]}
              discussionLength={suggestion.comments.length}
              documentContent="__suggestion__"
              editingId={editingId}
              index={0}
              setEditingId={setEditingId}
            />
            <div className="relative mb-1 ml-[26px] flex h-7 items-center rounded-md pl-1.5 text-sm text-muted-foreground hover:bg-muted">
              <div className="absolute top-[-5px] left-[-14px] h-full w-0.5 shrink-0 bg-muted" />
              <div className="ml-2">Show {suggestion.comments.length - 2} replies</div>
            </div>
            {suggestion.comments.at(-1) && (
              <Comment
                key={suggestion.comments.at(-1)!.id}
                comment={suggestion.comments.at(-1)!}
                discussionLength={suggestion.comments.length}
                documentContent="__suggestion__"
                editingId={editingId}
                index={suggestion.comments.length - 1}
                setEditingId={setEditingId}
              />
            )}
          </>
        ) : (
          suggestion.comments.map((comment, index) => (
            <Comment
              key={comment.id ?? index}
              comment={comment}
              discussionLength={suggestion.comments.length}
              documentContent="__suggestion__"
              editingId={editingId}
              index={index}
              setEditingId={setEditingId}
            />
          ))
        )}

        {hoverId === id && (
          <div className="absolute top-4 right-4 flex gap-2">
            <Button variant="ghost" className="h-6 p-1 text-muted-foreground" onClick={() => accept(suggestion)}>
              <CheckIcon className="size-4" />
            </Button>
            <Button variant="ghost" className="h-6 p-1 text-muted-foreground" onClick={() => reject(suggestion)}>
              <XIcon className="size-4" />
            </Button>
          </div>
        )}

        {activeId === id && <CommentCreateForm discussionId={suggestion.suggestionId} />}
      </div>
    </div>
  );
};
