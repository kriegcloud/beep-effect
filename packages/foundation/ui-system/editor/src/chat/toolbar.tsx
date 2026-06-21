/**
 * The fixed formatting toolbar mounted above the editable surface: text marks
 * (bold/italic/underline/strikethrough/inline-code), list blocks (bulleted/
 * numbered/check), quote, code block, and link. Button pressed-state mirrors the
 * current selection so the bar stays in sync as the caret moves.
 *
 * Per the repo atom-first law the selection-mirroring registration is a
 * per-editor `@effect/atom` binding ({@link toolbarSelectionAtom}) rather than a
 * `useState` + `useEffect` pair: the read fn registers the Lexical update +
 * selection-change listeners (torn down via the atom finalizer) and pushes the
 * derived selection snapshot with `get.setSelf`.
 *
 * @packageDocumentation \@beep/editor/chat/toolbar
 * @since 0.0.0
 */

import { Button } from "@beep/ui/components/button";
import { cn } from "@beep/ui/lib/utils";
import { useAtomValue } from "@effect/atom-react";
import { $createCodeNode, $isCodeNode } from "@lexical/code";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import {
  $isListNode,
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListNode,
  REMOVE_LIST_COMMAND,
} from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createQuoteNode, $isHeadingNode, $isQuoteNode } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { $findMatchingParent, $getNearestNodeOfType } from "@lexical/utils";
import {
  CodeBlockIcon,
  CodeIcon,
  LinkIcon,
  ListBulletsIcon,
  ListChecksIcon,
  ListNumbersIcon,
  QuotesIcon,
  TextBIcon,
  TextItalicIcon,
  TextStrikethroughIcon,
  TextUnderlineIcon,
} from "@phosphor-icons/react";
import { Atom } from "effect/unstable/reactivity";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import type { ElementNode, LexicalEditor, TextFormatType } from "lexical";
import type { JSX, ReactNode } from "react";

type BlockType =
  | "paragraph"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "quote"
  | "code"
  | "bullet"
  | "number"
  | "check";

interface SelectionState {
  readonly blockType: BlockType;
  readonly bold: boolean;
  readonly code: boolean;
  readonly italic: boolean;
  readonly link: boolean;
  readonly strikethrough: boolean;
  readonly underline: boolean;
}

const INITIAL_STATE: SelectionState = {
  bold: false,
  italic: false,
  underline: false,
  strikethrough: false,
  code: false,
  link: false,
  blockType: "paragraph",
};

// Maps a Lexical list type onto the toolbar's {@link BlockType}. Shared by the
// direct-list and ancestor-list branches so the mapping lives in one place.
const blockTypeFromListType = (listType: "number" | "bullet" | "check"): BlockType =>
  listType === "number" ? "number" : listType === "check" ? "check" : "bullet";

// Reads the current selection's marks + block type. Must run inside an
// editorState.read (a Lexical lexical-scope), where the `$`-prefixed helpers are
// valid.
const computeSelectionState = (): SelectionState => {
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) return INITIAL_STATE;
  const anchorNode = selection.anchor.getNode();
  const element = anchorNode.getKey() === "root" ? anchorNode : (anchorNode.getTopLevelElement() ?? anchorNode);

  let blockType: BlockType = "paragraph";
  if ($isListNode(element)) {
    blockType = blockTypeFromListType(element.getListType());
  } else {
    const parentList = $getNearestNodeOfType(anchorNode, ListNode);
    if (parentList !== null) {
      blockType = blockTypeFromListType(parentList.getListType());
    } else if ($isHeadingNode(element)) {
      blockType = element.getTag();
    } else if ($isQuoteNode(element)) {
      blockType = "quote";
    } else if ($isCodeNode(element)) {
      blockType = "code";
    }
  }

  const linkParent = $findMatchingParent(anchorNode, $isLinkNode);
  return {
    bold: selection.hasFormat("bold"),
    italic: selection.hasFormat("italic"),
    underline: selection.hasFormat("underline"),
    strikethrough: selection.hasFormat("strikethrough"),
    code: selection.hasFormat("code"),
    link: linkParent !== null,
    blockType,
  };
};

/**
 * Per-editor selection snapshot mirrored from the current Lexical selection. The
 * read fn registers the update + selection-change listeners (torn down via the
 * atom finalizer) and pushes new snapshots with `get.setSelf`.
 *
 * @category atoms
 * @since 0.0.0
 */
const toolbarSelectionAtom = Atom.family((editor: LexicalEditor) =>
  Atom.make((get) => {
    get.addFinalizer(
      editor.registerUpdateListener(({ editorState }) => {
        get.setSelf(editorState.read(computeSelectionState));
      })
    );
    get.addFinalizer(
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          get.setSelf(editor.getEditorState().read(computeSelectionState));
          return false;
        },
        COMMAND_PRIORITY_LOW
      )
    );
    return editor.getEditorState().read(computeSelectionState);
  })
);

interface ToolbarButtonProps {
  readonly active?: boolean;
  readonly children: ReactNode;
  readonly label: string;
  readonly onClick: () => void;
}

function ToolbarButton({ active = false, label, onClick, children }: ToolbarButtonProps): JSX.Element {
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={cn(active && "bg-accent text-accent-foreground")}
      // Keep the editor selection: a toolbar press must not blur the editor
      // before the format command runs.
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

function ToolbarDivider(): JSX.Element {
  return <span aria-hidden="true" className="bg-border mx-1 h-5 w-px" />;
}

/**
 * Fixed formatting toolbar plugin. Mount inside a `LexicalComposer`.
 *
 * @example
 * ```tsx
 * import { FixedToolbarPlugin } from "@beep/editor/chat"
 *
 * console.log(FixedToolbarPlugin.name) // "FixedToolbarPlugin"
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export function FixedToolbarPlugin(): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const state = useAtomValue(toolbarSelectionAtom(editor));

  const formatText = (format: TextFormatType): void => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  const setBlock = (target: BlockType, create: () => ElementNode): void => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, state.blockType === target ? () => $createParagraphNode() : create);
      }
    });
  };

  const toggleList = (target: BlockType, insert: typeof INSERT_UNORDERED_LIST_COMMAND): void => {
    if (state.blockType === target) {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(insert, undefined);
    }
  };

  return (
    <div
      role="toolbar"
      aria-label="Formatting"
      className="border-border flex flex-wrap items-center gap-0.5 border-b px-1.5 py-1"
    >
      <ToolbarButton active={state.bold} label="Bold" onClick={() => formatText("bold")}>
        <TextBIcon />
      </ToolbarButton>
      <ToolbarButton active={state.italic} label="Italic" onClick={() => formatText("italic")}>
        <TextItalicIcon />
      </ToolbarButton>
      <ToolbarButton active={state.underline} label="Underline" onClick={() => formatText("underline")}>
        <TextUnderlineIcon />
      </ToolbarButton>
      <ToolbarButton active={state.strikethrough} label="Strikethrough" onClick={() => formatText("strikethrough")}>
        <TextStrikethroughIcon />
      </ToolbarButton>
      <ToolbarButton active={state.code} label="Inline code" onClick={() => formatText("code")}>
        <CodeIcon />
      </ToolbarButton>
      <ToolbarDivider />
      <ToolbarButton
        active={state.blockType === "bullet"}
        label="Bulleted list"
        onClick={() => toggleList("bullet", INSERT_UNORDERED_LIST_COMMAND)}
      >
        <ListBulletsIcon />
      </ToolbarButton>
      <ToolbarButton
        active={state.blockType === "number"}
        label="Numbered list"
        onClick={() => toggleList("number", INSERT_ORDERED_LIST_COMMAND)}
      >
        <ListNumbersIcon />
      </ToolbarButton>
      <ToolbarButton
        active={state.blockType === "check"}
        label="Check list"
        onClick={() => toggleList("check", INSERT_CHECK_LIST_COMMAND)}
      >
        <ListChecksIcon />
      </ToolbarButton>
      <ToolbarDivider />
      <ToolbarButton
        active={state.blockType === "quote"}
        label="Quote"
        onClick={() => setBlock("quote", () => $createQuoteNode())}
      >
        <QuotesIcon />
      </ToolbarButton>
      <ToolbarButton
        active={state.blockType === "code"}
        label="Code block"
        onClick={() => setBlock("code", () => $createCodeNode())}
      >
        <CodeBlockIcon />
      </ToolbarButton>
      <ToolbarButton
        active={state.link}
        label="Link"
        onClick={() => editor.dispatchCommand(TOGGLE_LINK_COMMAND, state.link ? null : "https://")}
      >
        <LinkIcon />
      </ToolbarButton>
    </div>
  );
}
