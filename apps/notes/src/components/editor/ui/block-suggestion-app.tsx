import { suggestionPlugin } from "@beep/notes/components/editor/plugins/suggestion-kit-app";
import { formatCommentDate } from "@beep/notes/lib/date/formatDate";
import { useDocumentId } from "@beep/notes/lib/navigation/routes";
import { Avatar, AvatarFallback, AvatarImage } from "@beep/notes/registry/ui/avatar";
import { Button } from "@beep/notes/registry/ui/button";
import type { RouterCommentItem, RouterDiscussionItem } from "@beep/notes/server/api/types";
import { useTRPC } from "@beep/notes/trpc/react";
import type { UnsafeTypes } from "@beep/types";
import {
  acceptSuggestion,
  getSuggestionKey,
  keyId2SuggestionId,
  rejectSuggestion,
  type TResolvedSuggestion,
} from "@platejs/suggestion";
import { useQuery } from "@tanstack/react-query";
import { CheckIcon, XIcon } from "lucide-react";
import {
  ElementApi,
  KEYS,
  type NodeEntry,
  type Path,
  PathApi,
  type TElement,
  TextApi,
  type TSuggestionText,
} from "platejs";
import { useEditorPlugin, useEditorRef } from "platejs/react";
import React, { useState } from "react";

import { Comment, CommentCreateForm } from "./comment-app";

export interface ResolvedSuggestion extends TResolvedSuggestion {
  comments: RouterCommentItem[];
}

export const BLOCK_SUGGESTION = "__block__";

export const TYPE_TEXT_MAP: Record<string, (node?: TElement) => string> = {
  [KEYS.audio]: () => "Audio",
  [KEYS.blockquote]: () => "Blockquote",
  [KEYS.callout]: () => "Callout",
  [KEYS.codeBlock]: () => "Code Block",
  [KEYS.columnGroup]: () => "Column",
  [KEYS.equation]: () => "Equation",
  [KEYS.file]: () => "File",
  [KEYS.h1]: () => `Heading 1`,
  [KEYS.h2]: () => `Heading 2`,
  [KEYS.h3]: () => `Heading 3`,
  [KEYS.h4]: () => `Heading 4`,
  [KEYS.h5]: () => `Heading 5`,
  [KEYS.h6]: () => `Heading 6`,
  [KEYS.hr]: () => "Horizontal Rule",
  [KEYS.img]: () => "Image",
  [KEYS.mediaEmbed]: () => "Media",
  [KEYS.p]: (node) => {
    if (node?.[KEYS.listType] === KEYS.listTodo) return "Todo List";
    if (node?.[KEYS.listType] === KEYS.ol) return "Ordered List";
    if (node?.[KEYS.listType] === KEYS.ul) return "List";

    return "Paragraph";
  },
  [KEYS.table]: () => "Table",
  [KEYS.toc]: () => "Table of Contents",
  [KEYS.toggle]: () => "Toggle",
  [KEYS.video]: () => "Video",
};

export const BlockSuggestionCard = ({
  idx,
  isLast,
  suggestion,
}: {
  readonly idx: number;
  readonly isLast: boolean;
  readonly suggestion: ResolvedSuggestion;
}) => {
  const trpc = useTRPC();

  const { data: userData } = useQuery(trpc.user.getUser.queryOptions({ id: suggestion.userId }));

  const { api, editor } = useEditorPlugin(suggestionPlugin);

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

  const [hovering, setHovering] = useState(false);

  const suggestionText2Array = (text: string) => {
    if (text === BLOCK_SUGGESTION) return ["line breaks"];

    return text.split(BLOCK_SUGGESTION).filter(Boolean);
  };

  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div
      key={`${suggestion.suggestionId}-${idx}`}
      className="relative"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className="flex flex-col p-4">
        <div className="relative flex items-center">
          {userData && (
            <Avatar className="mr-2 size-5">
              <AvatarImage alt={userData.name!} src={userData.profileImageUrl!} />
              <AvatarFallback>{userData.name?.[0]}</AvatarFallback>
            </Avatar>
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

                    <span key={index} className="text-sm">
                      {text}
                    </span>
                  </div>
                ))}
              </React.Fragment>
            )}

            {suggestion.type === "insert" && (
              <React.Fragment>
                {suggestionText2Array(suggestion.newText!).map((text, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Add:</span>

                    <span key={index} className="text-sm">
                      {text || "line breaks"}
                    </span>
                  </div>
                ))}
              </React.Fragment>
            )}

            {suggestion.type === "replace" && (
              <div className="flex flex-col gap-2">
                {suggestionText2Array(suggestion.newText!).map((text, index) => (
                  <React.Fragment key={index}>
                    <div key={index} className="flex items-center text-brand/80">
                      <span className="text-sm">with:</span>
                      <span className="text-sm">{text || "line breaks"}</span>
                    </div>
                  </React.Fragment>
                ))}

                {suggestionText2Array(suggestion.text!).map((text, index) => (
                  <React.Fragment key={index}>
                    <div key={index} className="flex items-center">
                      <span className="text-sm text-muted-foreground">{index === 0 ? "Replace:" : "Delete:"}</span>
                      <span className="text-sm">{text || "line breaks"}</span>
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
                <span className="text-sm">{suggestion.newText}</span>
              </div>
            )}
          </div>
        </div>

        {suggestion.comments.map((comment, index) => (
          <Comment
            key={comment.id ?? index}
            comment={comment}
            discussionLength={suggestion.comments.length}
            documentContent="__suggestion__"
            editingId={editingId}
            index={index}
            setEditingId={setEditingId}
          />
        ))}

        {hovering && (
          <div className="absolute top-4 right-4 flex gap-2">
            <Button variant="ghost" className="h-6 p-1 text-muted-foreground" onClick={() => accept(suggestion)}>
              <CheckIcon className="size-4" />
            </Button>

            <Button variant="ghost" className="h-6 p-1 text-muted-foreground" onClick={() => reject(suggestion)}>
              <XIcon className="size-4" />
            </Button>
          </div>
        )}

        <CommentCreateForm discussionId={suggestion.suggestionId} isSuggesting={suggestion.comments.length === 0} />
      </div>

      {!isLast && <div className="h-px w-full bg-muted" />}
    </div>
  );
};

export const useResolveSuggestion = (
  suggestionNodes: NodeEntry<TElement | TSuggestionText>[],
  blockPath: Path
): ResolvedSuggestion[] => {
  const editor = useEditorRef();
  const documentId = useDocumentId();
  const trpc = useTRPC();
  const { data } = useQuery(trpc.comment.discussions.queryOptions({ documentId: documentId }));

  const { api, getOption, setOption } = useEditorPlugin(suggestionPlugin);

  React.useEffect(() => {
    suggestionNodes.forEach(([node]) => {
      const id = api.suggestion.nodeId(node);
      const map = getOption("uniquePathMap");

      if (!id) return;

      const previousPath = map.get(id);

      // If there are no suggestion nodes in the corresponding path in the map, then update it.
      if (PathApi.isPath(previousPath)) {
        const nodes = api.suggestion.node({
          id,
          at: previousPath,
          isText: true,
        });
        const parentNode = editor.api.node(previousPath);
        let lineBreakId: string | null = null;

        if (parentNode && ElementApi.isElement(parentNode[0])) {
          lineBreakId = api.suggestion.nodeId(parentNode[0]) ?? null;
        }
        if (!nodes && lineBreakId !== id) {
          return setOption("uniquePathMap", new Map(map).set(id, blockPath));
        }

        return;
      }

      setOption("uniquePathMap", new Map(map).set(id, blockPath));
    });
  }, [api, blockPath, editor.api, getOption, setOption, suggestionNodes]);

  return React.useMemo(() => {
    const map = getOption("uniquePathMap");

    if (suggestionNodes.length === 0) return [];

    const suggestionIds = new Set(
      suggestionNodes
        .flatMap(([node]) => {
          if (TextApi.isText(node)) {
            const dataList = api.suggestion.dataList(node);
            const includeUpdate = dataList.some((data) => data.type === "update");

            if (!includeUpdate) return api.suggestion.nodeId(node);

            return dataList.filter((data) => data.type === "update").map((d) => d.id);
          }
          if (ElementApi.isElement(node)) {
            return api.suggestion.nodeId(node);
          }
          return undefined;
        })
        .filter(Boolean)
    );

    const res: ResolvedSuggestion[] = [];

    suggestionIds.forEach((id): void => {
      if (!id) return;

      const path = map.get(id);

      if (!path || !PathApi.isPath(path)) return;
      if (!PathApi.equals(path, blockPath)) return;

      const entries = [
        ...editor.api.nodes<TElement | TSuggestionText>({
          at: [],
          mode: "all",
          match: (n) => (n[KEYS.suggestion] && n[getSuggestionKey(id)]) || api.suggestion.nodeId(n as TElement) === id,
        }),
      ];

      if (entries.length === 0) return;

      // move line break to the end
      entries.sort(([, path1], [, path2]) => {
        return PathApi.isChild(path1, path2) ? -1 : 1;
      });

      let newText = "";
      let text = "";
      let properties: UnsafeTypes.UnsafeAny = {};
      let newProperties: UnsafeTypes.UnsafeAny = {};

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
              // No default
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

      const nodeData = api.suggestion.suggestionData(entries[0]?.[0] as UnsafeTypes.UnsafeAny);

      if (!nodeData) return;

      const comments = data?.discussions.find((d) => d.id === id)?.comments || [];
      const createdAt = new Date(nodeData.createdAt);

      const keyId = getSuggestionKey(id);

      if (nodeData.type === "update") {
        res.push({
          comments,
          createdAt,
          keyId,
          newProperties,
          newText,
          properties,
          suggestionId: keyId2SuggestionId(id),
          type: "update",
          userId: nodeData.userId,
        });
        return;
      }
      if (newText.length > 0 && text.length > 0) {
        res.push({
          comments,
          createdAt,
          keyId,
          newText,
          suggestionId: keyId2SuggestionId(id),
          text,
          type: "replace",
          userId: nodeData.userId,
        });
        return;
      }
      if (newText.length > 0) {
        res.push({
          comments,
          createdAt,
          keyId,
          newText,
          suggestionId: keyId2SuggestionId(id),
          type: "insert",
          userId: nodeData.userId,
        });
        return;
      }
      if (text.length > 0) {
        res.push({
          comments,
          createdAt,
          keyId,
          suggestionId: keyId2SuggestionId(id),
          text,
          type: "remove",
          userId: nodeData.userId,
        });
      }
    });

    return res;
  }, [api.suggestion, blockPath, data, editor.api, getOption, suggestionNodes]);
};

export const isResolvedSuggestion = (
  suggestion: ResolvedSuggestion | RouterDiscussionItem
): suggestion is ResolvedSuggestion => {
  return "suggestionId" in suggestion;
};
