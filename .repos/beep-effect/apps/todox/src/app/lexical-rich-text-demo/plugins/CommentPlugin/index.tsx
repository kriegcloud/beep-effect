"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@beep/todox/components/ui/alert-dialog";
import { Button } from "@beep/todox/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@beep/todox/components/ui/drawer";
import {
  $createMarkNode,
  $getMarkIDs,
  $isMarkNode,
  $unwrapMarkNode,
  $wrapSelectionInMarkNode,
  MarkNode,
} from "@lexical/mark";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import { useCollaborationContext } from "@lexical/react/LexicalCollaborationContext";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { EditorRefPlugin } from "@lexical/react/LexicalEditorRefPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";
import { createDOMRange, createRectsFromDOMRange } from "@lexical/selection";
import { $isRootTextContentEmpty, $rootTextContent } from "@lexical/text";
import { mergeRegister, registerNestedElementResolver } from "@lexical/utils";
import { ChatCircleIcon, ChatTextIcon, PaperPlaneRightIcon, TrashIcon } from "@phosphor-icons/react";
import * as A from "effect/Array";
import * as MutableHashMap from "effect/MutableHashMap";
import * as MutableHashSet from "effect/MutableHashSet";
import * as O from "effect/Option";
import * as Str from "effect/String";
import type { EditorState, LexicalCommand, LexicalEditor, NodeKey, RangeSelection } from "lexical";
import {
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  CLEAR_EDITOR_COMMAND,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_NORMAL,
  createCommand,
  getDOMSelection,
  KEY_ESCAPE_COMMAND,
} from "lexical";
import type { JSX } from "react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Doc } from "yjs";
import { Comment, CommentStore, type Comments, type ProviderWithDoc, Thread, useCommentStore } from "../../commenting";
import { commentEditorTheme } from "../../themes/editor-theme";
import ContentEditable from "../../ui/ContentEditable";

export const INSERT_INLINE_COMMAND: LexicalCommand<void> = createCommand("INSERT_INLINE_COMMAND");

function AddCommentBox({
  anchorKey,
  editor,
  onAddComment,
}: {
  readonly anchorKey: NodeKey;
  readonly editor: LexicalEditor;
  readonly onAddComment: () => void;
}): JSX.Element {
  const boxRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    const boxElem = boxRef.current;
    const rootElement = editor.getRootElement();
    const anchorElement = editor.getElementByKey(anchorKey);

    if (boxElem !== null && rootElement !== null && anchorElement !== null) {
      const { right } = rootElement.getBoundingClientRect();
      const { top } = anchorElement.getBoundingClientRect();
      boxElem.style.left = `${right - 20}px`;
      boxElem.style.top = `${top - 30}px`;
    }
  }, [anchorKey, editor]);

  useEffect(() => {
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("resize", updatePosition);
    };
  }, [editor, updatePosition]);

  useLayoutEffect(() => {
    updatePosition();
  }, [anchorKey, editor, updatePosition]);

  return (
    <div className="absolute z-50" ref={boxRef}>
      <Button type="button" variant="outline" size="icon-sm" onClick={onAddComment} title="Add comment">
        <ChatTextIcon className="size-4" />
      </Button>
    </div>
  );
}

function EscapeHandlerPlugin({ onEscape }: { readonly onEscape: (e: KeyboardEvent) => boolean }): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      KEY_ESCAPE_COMMAND,
      (event: KeyboardEvent) => {
        return onEscape(event);
      },
      COMMAND_PRIORITY_NORMAL
    );
  }, [editor, onEscape]);

  return null;
}

function PlainTextEditor({
  className,
  autoFocus,
  onEscape,
  onChange,
  editorRef,
  placeholder = "Type a comment...",
  placeholderClassName,
}: {
  readonly autoFocus?: undefined | boolean;
  readonly className?: undefined | string;
  readonly editorRef?: undefined | { current: null | LexicalEditor };
  readonly onChange: (editorState: EditorState, editor: LexicalEditor) => void;
  readonly onEscape: (e: KeyboardEvent) => boolean;
  readonly placeholder?: undefined | string;
  readonly placeholderClassName?: undefined | string;
}) {
  const initialConfig = {
    namespace: "Commenting",
    nodes: [],
    // LEXICAL FRAMEWORK CALLBACK - Must throw natively for LexicalErrorBoundary compatibility
    // Errors thrown here are caught by the LexicalErrorBoundary component (line 147)
    // This is the expected Lexical error propagation pattern, not a violation of Effect error handling
    onError: (error: Error) => {
      throw error;
    },
    theme: commentEditorTheme,
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="flex-1 relative">
        <PlainTextPlugin
          contentEditable={
            <ContentEditable
              placeholder={placeholder}
              className={className}
              placeholderClassName={
                placeholderClassName ??
                "text-sm text-muted-foreground overflow-hidden absolute text-ellipsis top-2 left-2.5 right-2.5 select-none whitespace-nowrap inline-block pointer-events-none"
              }
            />
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <OnChangePlugin onChange={onChange} />
        <HistoryPlugin />
        {autoFocus !== false && <AutoFocusPlugin />}
        <EscapeHandlerPlugin onEscape={onEscape} />
        <ClearEditorPlugin />
        {editorRef !== undefined && <EditorRefPlugin editorRef={editorRef} />}
      </div>
    </LexicalComposer>
  );
}

function useOnChange(setContent: (text: string) => void, setCanSubmit: (canSubmit: boolean) => void) {
  return useCallback(
    (editorState: EditorState, _editor: LexicalEditor) => {
      editorState.read(() => {
        setContent($rootTextContent());
        setCanSubmit(!$isRootTextContentEmpty(_editor.isComposing(), true));
      });
    },
    [setCanSubmit, setContent]
  );
}

interface SelectionPosition {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly bottom: number;
  readonly rects: Array<DOMRect>;
}

function CommentInputBox({
  editor,
  cancelAddComment,
  submitAddComment,
  initialSelection,
  initialPosition,
}: {
  readonly cancelAddComment: () => void;
  readonly editor: LexicalEditor;
  readonly initialPosition: SelectionPosition | null;
  readonly initialSelection: RangeSelection | null;
  readonly submitAddComment: (
    commentOrThread: Comment | Thread,
    isInlineComment: boolean,
    thread?: undefined | Thread,
    selection?: undefined | RangeSelection | null
  ) => void;
}) {
  const [content, setContent] = useState("");
  const [canSubmit, setCanSubmit] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const selectionState = useMemo(
    () => ({
      container: document.createElement("div"),
      elements: [] as Array<HTMLSpanElement>,
    }),
    []
  );
  // Use initial selection passed from parent (captured before DOM selection was cleared)
  const selectionRef = useRef<RangeSelection | null>(initialSelection);
  const author = useCollabAuthorName();

  const updateLocation = useCallback(() => {
    const boxElem = boxRef.current;
    if (boxElem === null) return;

    // Use initialPosition if available (captured before DOM selection was cleared)
    // This ensures accurate positioning even after clicking outside the editor
    if (initialPosition !== null) {
      const { left, bottom, width, rects: selectionRects } = initialPosition;
      // Box width is w-64 = 256px, so half is 128
      const boxHalfWidth = 128;
      // Always center the box on the selection's bounding box
      let correctedLeft = left + width / 2 - boxHalfWidth;
      // Ensure it doesn't go off the left edge
      if (correctedLeft < 10) {
        correctedLeft = 10;
      }
      // Ensure it doesn't go off the right edge
      const maxLeft = window.innerWidth - 256 - 10;
      if (correctedLeft > maxLeft) {
        correctedLeft = maxLeft;
      }
      boxElem.style.left = `${correctedLeft}px`;
      boxElem.style.top = `${bottom + 20 + (window.pageYOffset || document.documentElement.scrollTop)}px`;

      // Draw selection highlight rectangles
      const selectionRectsLength = selectionRects.length;
      const { container } = selectionState;
      const elements = selectionState.elements;
      const elementsLength = elements.length;

      for (let i = 0; i < selectionRectsLength; i++) {
        const selectionRect = selectionRects[i]!;
        let elem: HTMLSpanElement = elements[i]!;
        if (elem === undefined) {
          elem = document.createElement("span");
          elements[i] = elem;
          container.appendChild(elem);
        }
        const color = "255, 212, 0";
        elem.style.cssText = `position:absolute;top:${
          selectionRect.top + (window.pageYOffset || document.documentElement.scrollTop)
        }px;left:${selectionRect.left}px;height:${selectionRect.height}px;width:${
          selectionRect.width
        }px;background-color:rgba(${color}, 0.3);pointer-events:none;z-index:5;`;
      }
      for (let i = elementsLength - 1; i >= selectionRectsLength; i--) {
        const elem = elements[i]!;
        container.removeChild(elem);
        // Note: Using native pop() here because elements is a mutable DOM state array
        // that requires in-place mutation for DOM synchronization
        elements.pop();
      }
      return;
    }

    // Fallback: try to get position from current editor state
    editor.getEditorState().read(() => {
      const selection = $getSelection();

      if ($isRangeSelection(selection)) {
        const anchor = selection.anchor;
        const focus = selection.focus;
        const range = createDOMRange(editor, anchor.getNode(), anchor.offset, focus.getNode(), focus.offset);
        if (range !== null) {
          const { left, bottom, width } = range.getBoundingClientRect();
          const selectionRects = createRectsFromDOMRange(editor, range);
          const boxHalfWidth = 128;
          let correctedLeft = left + width / 2 - boxHalfWidth;
          if (correctedLeft < 10) {
            correctedLeft = 10;
          }
          const maxLeft = window.innerWidth - 256 - 10;
          if (correctedLeft > maxLeft) {
            correctedLeft = maxLeft;
          }
          boxElem.style.left = `${correctedLeft}px`;
          boxElem.style.top = `${bottom + 20 + (window.pageYOffset || document.documentElement.scrollTop)}px`;

          const selectionRectsLength = selectionRects.length;
          const { container } = selectionState;
          const elements = selectionState.elements;
          const elementsLength = elements.length;

          for (let i = 0; i < selectionRectsLength; i++) {
            const selectionRect = selectionRects[i]!;
            let elem: HTMLSpanElement = elements[i]!;
            if (elem === undefined) {
              elem = document.createElement("span");
              elements[i] = elem;
              container.appendChild(elem);
            }
            const color = "255, 212, 0";
            elem.style.cssText = `position:absolute;top:${
              selectionRect.top + (window.pageYOffset || document.documentElement.scrollTop)
            }px;left:${selectionRect.left}px;height:${selectionRect.height}px;width:${
              selectionRect.width
            }px;background-color:rgba(${color}, 0.3);pointer-events:none;z-index:5;`;
          }
          for (let i = elementsLength - 1; i >= selectionRectsLength; i--) {
            const elem = elements[i]!;
            container.removeChild(elem);
            elements.pop();
          }
        }
      }
    });
  }, [editor, initialPosition, selectionState]);

  useLayoutEffect(() => {
    updateLocation();
    const container = selectionState.container;
    const body = document.body;
    if (body !== null) {
      body.appendChild(container);
      return () => {
        body.removeChild(container);
      };
    }
  }, [selectionState.container, updateLocation]);

  useEffect(() => {
    window.addEventListener("resize", updateLocation);

    return () => {
      window.removeEventListener("resize", updateLocation);
    };
  }, [updateLocation]);

  const onEscape = (event: KeyboardEvent): boolean => {
    event.preventDefault();
    cancelAddComment();
    return true;
  };

  const submitComment = () => {
    if (canSubmit) {
      let quote = editor.getEditorState().read(() => {
        const selection = selectionRef.current;
        return selection ? selection.getTextContent() : "";
      });
      if (Str.length(quote) > 100) {
        quote = `${Str.takeLeft(quote, 99)}…`;
      }
      submitAddComment(
        Thread.create({ quote, comments: [Comment.create({ content, author })] }),
        true,
        undefined,
        selectionRef.current
      );
      selectionRef.current = null;
    }
  };

  const onChange = useOnChange(setContent, setCanSubmit);

  return (
    <div className="absolute z-50 w-64 bg-popover border border-border rounded-lg shadow-lg p-3 space-y-3" ref={boxRef}>
      <PlainTextEditor
        className="relative min-h-16 w-full border-input dark:bg-input/30 focus-within:border-ring focus-within:ring-ring/50 rounded-lg border bg-transparent px-2.5 py-2 text-base transition-colors focus-within:ring-[3px] md:text-sm outline-none"
        onEscape={onEscape}
        onChange={onChange}
      />
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={cancelAddComment}>
          Cancel
        </Button>
        <Button variant="default" size="sm" onClick={submitComment} disabled={!canSubmit}>
          Comment
        </Button>
      </div>
    </div>
  );
}

function CommentsComposer({
  submitAddComment,
  thread,
  placeholder,
}: {
  readonly placeholder?: undefined | string;
  readonly submitAddComment: (commentOrThread: Comment, isInlineComment: boolean, thread?: undefined | Thread) => void;
  readonly thread?: undefined | Thread;
}) {
  const [content, setContent] = useState("");
  const [canSubmit, setCanSubmit] = useState(false);
  const editorRef = useRef<LexicalEditor>(null);
  const author = useCollabAuthorName();

  const onChange = useOnChange(setContent, setCanSubmit);

  const submitComment = () => {
    if (canSubmit) {
      submitAddComment(Comment.create({ content, author }), false, thread);
      const editor = editorRef.current;
      if (editor !== null) {
        editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
      }
    }
  };

  return (
    <>
      <PlainTextEditor
        className="relative flex-1 min-h-8 border-input dark:bg-input/30 focus-within:border-ring focus-within:ring-ring/50 rounded-lg border bg-transparent px-2.5 py-2 text-sm transition-colors focus-within:ring-[3px] outline-none"
        autoFocus={false}
        onEscape={() => {
          return true;
        }}
        onChange={onChange}
        editorRef={editorRef}
        placeholder={placeholder}
      />
      <Button variant="outline" size="icon-sm" onClick={submitComment} disabled={!canSubmit}>
        <PaperPlaneRightIcon className="size-4" />
      </Button>
    </>
  );
}

function DeleteCommentOrThreadDialog({
  commentOrThread,
  deleteCommentOrThread,
  thread,
  triggerButton,
}: {
  readonly commentOrThread: Comment | Thread;
  readonly deleteCommentOrThread: (comment: Comment | Thread, thread?: undefined | Thread) => void;
  readonly thread?: undefined | Thread;
  readonly triggerButton: JSX.Element;
}): JSX.Element {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={triggerButton} />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {commentOrThread.type}</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this {commentOrThread.type}? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={() => deleteCommentOrThread(commentOrThread, thread)}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function CommentsPanelListComment({
  comment,
  deleteComment,
  thread,
  rtf,
}: {
  readonly comment: Comment;
  readonly deleteComment: (commentOrThread: Comment | Thread, thread?: undefined | Thread) => void;
  readonly rtf: Intl.RelativeTimeFormat;
  readonly thread?: undefined | Thread;
}): JSX.Element {
  const seconds = Math.round((comment.timeStamp.epochMillis - (performance.timeOrigin + performance.now())) / 1000);
  const minutes = Math.round(seconds / 60);

  return (
    <li className="group flex flex-col gap-1">
      <div className="flex items-center gap-2 text-xs">
        <span className="font-medium text-foreground">{comment.author}</span>
        <span className="text-muted-foreground">· {seconds > -10 ? "Just now" : rtf.format(minutes, "minute")}</span>
      </div>
      <div className="flex items-start justify-between gap-2">
        <p className={`text-sm ${comment.deleted ? "text-muted-foreground line-through" : "text-foreground"}`}>
          {comment.content}
        </p>
        {!comment.deleted && (
          <DeleteCommentOrThreadDialog
            commentOrThread={comment}
            deleteCommentOrThread={deleteComment}
            thread={thread}
            triggerButton={
              <Button
                variant="ghost"
                size="icon-sm"
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
              >
                <TrashIcon className="size-4" />
              </Button>
            }
          />
        )}
      </div>
    </li>
  );
}

function CommentsPanelList({
  activeIDs,
  comments,
  deleteCommentOrThread,
  listRef,
  submitAddComment,
  markNodeMap,
}: {
  readonly activeIDs: Array<string>;
  readonly comments: Comments.Type;
  readonly deleteCommentOrThread: (commentOrThread: Comment | Thread, thread?: undefined | Thread) => void;
  readonly listRef: { readonly current: null | HTMLUListElement };
  readonly markNodeMap: MutableHashMap.MutableHashMap<string, MutableHashSet.MutableHashSet<NodeKey>>;
  readonly submitAddComment: (
    commentOrThread: Comment | Thread,
    isInlineComment: boolean,
    thread?: undefined | Thread
  ) => void;
}): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [counter, setCounter] = useState(0);
  const rtf = useMemo(
    () =>
      new Intl.RelativeTimeFormat("en", {
        localeMatcher: "best fit",
        numeric: "auto",
        style: "short",
      }),
    []
  );

  useEffect(() => {
    // Used to keep the time stamp up to date
    const id = setTimeout(() => {
      setCounter(counter + 1);
    }, 10000);

    return () => {
      clearTimeout(id);
    };
  }, [counter]);

  return (
    <ul className="flex-1 overflow-y-auto p-2 space-y-2" ref={listRef}>
      {A.map(comments, (commentOrThread) => {
        const id = commentOrThread.id;
        if (commentOrThread.type === "thread") {
          const handleClickThread = () => {
            const markNodeKeys = O.getOrUndefined(MutableHashMap.get(markNodeMap, id));
            if (markNodeKeys !== undefined && (activeIDs === null || !A.contains(activeIDs, id))) {
              const activeElement = document.activeElement;
              // Move selection to the start of the mark, so that we
              // update the UI with the selected thread.
              editor.update(
                () => {
                  const markNodeKey = A.fromIterable(markNodeKeys)[0]!;
                  const markNode = $getNodeByKey<MarkNode>(markNodeKey);
                  if ($isMarkNode(markNode)) {
                    markNode.selectStart();
                  }
                },
                {
                  onUpdate() {
                    // Restore selection to the previous element
                    if (activeElement instanceof HTMLElement) {
                      activeElement.focus();
                    }
                  },
                }
              );
            }
          };

          return (
            <li
              key={id}
              onClick={handleClickThread}
              className={`p-3 rounded-lg border border-border bg-card ${
                O.isSome(MutableHashMap.get(markNodeMap, id)) ? "cursor-pointer hover:bg-accent/50" : ""
              } ${!A.contains(activeIDs, id) ? "" : "ring-2 ring-primary"}`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <blockquote className="text-sm text-muted-foreground italic border-l-2 border-muted pl-2 flex-1">
                  {commentOrThread.quote}
                </blockquote>
                <DeleteCommentOrThreadDialog
                  commentOrThread={commentOrThread}
                  deleteCommentOrThread={deleteCommentOrThread}
                  triggerButton={
                    <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-destructive">
                      <TrashIcon className="size-4" />
                    </Button>
                  }
                />
              </div>
              <ul className="space-y-2 mb-2">
                {A.map(commentOrThread.comments, (comment) => (
                  <CommentsPanelListComment
                    key={comment.id}
                    comment={comment}
                    deleteComment={deleteCommentOrThread}
                    thread={commentOrThread}
                    rtf={rtf}
                  />
                ))}
              </ul>
              <div className="flex gap-2 items-end pt-2 border-t border-border">
                <CommentsComposer
                  submitAddComment={submitAddComment}
                  thread={commentOrThread}
                  placeholder="Reply to comment..."
                />
              </div>
            </li>
          );
        }
        return (
          <CommentsPanelListComment
            key={id}
            comment={commentOrThread}
            deleteComment={deleteCommentOrThread}
            rtf={rtf}
          />
        );
      })}
    </ul>
  );
}

function CommentsPanelContent({
  activeIDs,
  deleteCommentOrThread,
  comments,
  submitAddComment,
  markNodeMap,
}: {
  readonly activeIDs: Array<string>;
  readonly comments: Comments.Type;
  readonly deleteCommentOrThread: (commentOrThread: Comment | Thread, thread?: undefined | Thread) => void;
  readonly markNodeMap: MutableHashMap.MutableHashMap<string, MutableHashSet.MutableHashSet<NodeKey>>;
  readonly submitAddComment: (
    commentOrThread: Comment | Thread,
    isInlineComment: boolean,
    thread?: undefined | Thread
  ) => void;
}): JSX.Element {
  const listRef = useRef<HTMLUListElement>(null);
  const isEmpty = A.isEmptyReadonlyArray(comments);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {isEmpty ? (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">No Comments</div>
      ) : (
        <CommentsPanelList
          activeIDs={activeIDs}
          comments={comments}
          deleteCommentOrThread={deleteCommentOrThread}
          listRef={listRef}
          submitAddComment={submitAddComment}
          markNodeMap={markNodeMap}
        />
      )}
    </div>
  );
}

function useCollabAuthorName(): string {
  const collabContext = useCollaborationContext();
  const { yjsDocMap, name } = collabContext;
  return yjsDocMap.has("comments") ? name : "Playground User";
}

export default function CommentPlugin({
  providerFactory,
}: {
  readonly providerFactory?: undefined | ((id: string, yjsDocMap: Map<string, Doc>) => ProviderWithDoc.Type);
}): JSX.Element {
  const collabContext = useCollaborationContext();
  const [editor] = useLexicalComposerContext();
  const commentStoreRef = useRef(new CommentStore(editor));
  const commentStore = commentStoreRef.current;
  const comments = useCommentStore(commentStore);
  const markNodeMapRef = useRef(MutableHashMap.empty<string, MutableHashSet.MutableHashSet<NodeKey>>());
  const markNodeMap = markNodeMapRef.current;
  const [activeAnchorKey, setActiveAnchorKey] = useState<NodeKey | null>();
  const [activeIDs, setActiveIDs] = useState<Array<string>>([]);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [showComments, setShowComments] = useState(false);
  // Stores the selection captured when INSERT_INLINE_COMMAND is dispatched,
  // before DOM selection is cleared
  const pendingSelectionRef = useRef<RangeSelection | null>(null);
  // Stores the position (bounding rect) of the selection when captured
  const pendingPositionRef = useRef<SelectionPosition | null>(null);
  const { yjsDocMap } = collabContext;

  useEffect(() => {
    if (providerFactory) {
      const provider = providerFactory("comments", yjsDocMap);
      return commentStore.registerCollaboration(provider);
    }
  }, [commentStore, providerFactory, yjsDocMap]);

  const cancelAddComment = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      // Restore selection
      if (selection !== null) {
        selection.dirty = true;
      }
    });
    pendingSelectionRef.current = null;
    pendingPositionRef.current = null;
    setShowCommentInput(false);
  }, [editor]);

  const deleteCommentOrThread = useCallback(
    (comment: Comment | Thread, thread?: undefined | Thread) => {
      if (comment.type === "comment") {
        const deletionInfo = commentStore.deleteCommentOrThread(comment, thread);
        if (O.isNone(deletionInfo)) {
          return;
        }
        const { markedComment, index } = deletionInfo.value;
        commentStore.addComment({
          commentOrThread: markedComment,
          thread,
          offset: index,
        });
      } else {
        commentStore.deleteCommentOrThread(comment);
        // Remove ids from associated marks
        const id = thread !== undefined ? thread.id : comment.id;
        const markNodeKeys = O.getOrUndefined(MutableHashMap.get(markNodeMap, id));
        if (markNodeKeys !== undefined) {
          // Do async to avoid causing a React infinite loop
          setTimeout(() => {
            editor.update(() => {
              for (const key of markNodeKeys) {
                const node: null | MarkNode = $getNodeByKey(key);
                if ($isMarkNode(node)) {
                  node.deleteID(id);
                  if (node.getIDs().length === 0) {
                    $unwrapMarkNode(node);
                  }
                }
              }
            });
          });
        }
      }
    },
    [commentStore, editor, markNodeMap]
  );

  const submitAddComment = useCallback(
    (
      commentOrThread: Comment | Thread,
      isInlineComment: boolean,
      thread?: undefined | Thread,
      selection?: undefined | RangeSelection | null
    ) => {
      commentStore.addComment({ commentOrThread, thread });
      if (isInlineComment) {
        editor.update(() => {
          if ($isRangeSelection(selection)) {
            const isBackward = selection.isBackward();
            const id = commentOrThread.id;

            // Wrap content in a MarkNode
            $wrapSelectionInMarkNode(selection, isBackward, id);
          }
        });
        pendingSelectionRef.current = null;
        pendingPositionRef.current = null;
        setShowCommentInput(false);
      }
    },
    [commentStore, editor]
  );

  useEffect(() => {
    const changedElems: Array<HTMLElement> = [];
    for (let i = 0; i < activeIDs.length; i++) {
      const id = activeIDs[i];
      if (id === undefined) continue;
      const keys = O.getOrUndefined(MutableHashMap.get(markNodeMap, id));
      if (keys !== undefined) {
        for (const key of keys) {
          const elem = editor.getElementByKey(key);
          if (elem !== null) {
            elem.classList.add("selected");
            changedElems.push(elem);
            setShowComments(true);
          }
        }
      }
    }
    return () => {
      for (let i = 0; i < changedElems.length; i++) {
        const changedElem = changedElems[i];
        if (changedElem) {
          changedElem.classList.remove("selected");
        }
      }
    };
  }, [activeIDs, editor, markNodeMap]);

  useEffect(() => {
    const markNodeKeysToIDs = MutableHashMap.empty<NodeKey, Array<string>>();

    return mergeRegister(
      registerNestedElementResolver<MarkNode>(
        editor,
        MarkNode,
        (from: MarkNode) => {
          return $createMarkNode(from.getIDs());
        },
        (from: MarkNode, to: MarkNode) => {
          // Merge the IDs
          const ids = from.getIDs();
          A.forEach(ids, (id) => {
            to.addID(id);
          });
        }
      ),
      editor.registerMutationListener(
        MarkNode,
        (mutations) => {
          editor.getEditorState().read(() => {
            for (const [key, mutation] of mutations) {
              const node: null | MarkNode = $getNodeByKey(key);
              let ids: NodeKey[] = [];

              if (mutation === "destroyed") {
                ids = O.getOrElse(MutableHashMap.get(markNodeKeysToIDs, key), () => []);
              } else if ($isMarkNode(node)) {
                ids = node.getIDs();
              }

              for (let i = 0; i < ids.length; i++) {
                const id = ids[i]!;
                let markNodeKeys = O.getOrUndefined(MutableHashMap.get(markNodeMap, id));
                MutableHashMap.set(markNodeKeysToIDs, key, ids);

                if (mutation === "destroyed") {
                  if (markNodeKeys !== undefined) {
                    MutableHashSet.remove(markNodeKeys, key);
                    if (MutableHashSet.size(markNodeKeys) === 0) {
                      MutableHashMap.remove(markNodeMap, id);
                    }
                  }
                } else {
                  if (markNodeKeys === undefined) {
                    markNodeKeys = MutableHashSet.empty<NodeKey>();
                    MutableHashMap.set(markNodeMap, id, markNodeKeys);
                  }
                  if (!MutableHashSet.has(markNodeKeys, key)) {
                    MutableHashSet.add(markNodeKeys, key);
                  }
                }
              }
            }
          });
        },
        { skipInitialization: false }
      ),
      editor.registerUpdateListener(({ editorState, tags }) => {
        editorState.read(() => {
          const selection = $getSelection();
          let hasActiveIds = false;
          let hasAnchorKey = false;

          if ($isRangeSelection(selection)) {
            const anchorNode = selection.anchor.getNode();

            if ($isTextNode(anchorNode)) {
              const commentIDs = $getMarkIDs(anchorNode, selection.anchor.offset);
              if (commentIDs !== null) {
                setActiveIDs(commentIDs);
                hasActiveIds = true;
              }
              if (!selection.isCollapsed()) {
                setActiveAnchorKey(anchorNode.getKey());
                hasAnchorKey = true;
              }
            }
          }
          if (!hasActiveIds) {
            setActiveIDs((_activeIds) => (A.isEmptyReadonlyArray(_activeIds) ? _activeIds : []));
          }
          if (!hasAnchorKey) {
            setActiveAnchorKey(null);
          }
          // Note: Removed automatic showCommentInput reset on selection change.
          // This was causing a race condition where clicking "Add comment" would:
          // 1. Set showCommentInput(true) in the command handler
          // 2. The DOM selection change would trigger an update
          // 3. If Lexical's internal selection was still a range, it would reset to false
          // Users can cancel via Cancel button or Escape key instead.
        });
      }),
      editor.registerCommand(
        INSERT_INLINE_COMMAND,
        () => {
          // Capture the selection and its position BEFORE clearing DOM ranges
          // This is critical because clearing DOM ranges can cause Lexical to
          // update its internal selection state, making it unavailable later
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            pendingSelectionRef.current = selection.clone();

            // Capture position from DOM range while selection is still valid
            const anchor = selection.anchor;
            const focus = selection.focus;
            const range = createDOMRange(editor, anchor.getNode(), anchor.offset, focus.getNode(), focus.offset);
            if (range !== null) {
              const rect = range.getBoundingClientRect();
              const rects = createRectsFromDOMRange(editor, range);
              pendingPositionRef.current = {
                left: rect.left,
                top: rect.top,
                width: rect.width,
                bottom: rect.bottom,
                rects: A.fromIterable(rects),
              };
            }
          }

          const domSelection = getDOMSelection(editor._window);
          if (domSelection !== null) {
            domSelection.removeAllRanges();
          }
          setShowCommentInput(true);
          return true;
        },
        COMMAND_PRIORITY_EDITOR
      )
    );
  }, [editor, markNodeMap]);

  const onAddComment = () => {
    editor.dispatchCommand(INSERT_INLINE_COMMAND, undefined);
  };

  return (
    <>
      {showCommentInput &&
        createPortal(
          <CommentInputBox
            editor={editor}
            cancelAddComment={cancelAddComment}
            submitAddComment={submitAddComment}
            initialSelection={pendingSelectionRef.current}
            initialPosition={pendingPositionRef.current}
          />,
          document.body
        )}
      {activeAnchorKey !== null &&
        activeAnchorKey !== undefined &&
        !showCommentInput &&
        createPortal(
          <AddCommentBox anchorKey={activeAnchorKey} editor={editor} onAddComment={onAddComment} />,
          document.body
        )}
      <Drawer direction="right" open={showComments} onOpenChange={setShowComments}>
        <DrawerTrigger asChild>
          <Button
            variant="outline"
            className={`fixed bottom-4 right-4 z-50 ${showComments ? "bg-accent" : ""}`}
            title={showComments ? "Hide Comments" : "Show Comments"}
            size="icon"
          >
            <ChatCircleIcon className="size-4" />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="h-full w-80 max-w-sm">
          <DrawerHeader className="border-b border-border">
            <DrawerTitle>Comments</DrawerTitle>
          </DrawerHeader>
          <CommentsPanelContent
            comments={comments}
            submitAddComment={submitAddComment}
            deleteCommentOrThread={deleteCommentOrThread}
            activeIDs={activeIDs}
            markNodeMap={markNodeMap}
          />
        </DrawerContent>
      </Drawer>
    </>
  );
}
