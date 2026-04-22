/**
 * Lexical editing surface for the canonical editor page model.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import {
  HeadingBlock,
  makeHeadingBlock,
  makeParagraphBlock,
  makeQuoteBlock,
  type PageDocument,
  ParagraphBlock,
  QuoteBlock,
  refreshPageDocument,
} from "@beep/editor-domain";
import { $EditorLexicalId } from "@beep/identity/packages";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  $isQuoteNode,
  HeadingNode,
  QuoteNode,
} from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { DateTime, identity, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getSelection,
  $isParagraphNode,
  $isRangeSelection,
  type EditorState,
  type LexicalEditor,
  ParagraphNode,
  TextNode,
} from "lexical";
import type { JSX } from "react";

const $I = $EditorLexicalId.create("EditorSurface");

const editorTheme = {
  ltr: "beep-editor-ltr",
  rtl: "beep-editor-rtl",
  paragraph: "beep-editor-paragraph",
  quote: "beep-editor-quote",
  heading: {
    h1: "beep-editor-heading beep-editor-heading-h1",
    h2: "beep-editor-heading beep-editor-heading-h2",
    h3: "beep-editor-heading beep-editor-heading-h3",
  },
  text: {
    bold: "beep-editor-bold",
    italic: "beep-editor-italic",
    underline: "beep-editor-underline",
    strikethrough: "beep-editor-strikethrough",
  },
} as const;

const editorNodes = [HeadingNode, ParagraphNode, QuoteNode, TextNode] as const;

const headingTagFromLevel = (level: 1 | 2 | 3): "h1" | "h2" | "h3" => {
  if (level === 2) {
    return "h2";
  }

  if (level === 3) {
    return "h3";
  }

  return "h1";
};

const headingLevelFromTag = (tag: string): 1 | 2 | 3 => {
  if (tag === "h2") {
    return 2;
  }

  if (tag === "h3") {
    return 3;
  }

  return 1;
};

const isHeadingBlock = (block: PageDocument["blocks"][number]): block is HeadingBlock => block.kind === "heading";

const isQuoteBlock = (block: PageDocument["blocks"][number]): block is QuoteBlock => block.kind === "quote";

const isParagraphBlock = (block: PageDocument["blocks"][number]): block is ParagraphBlock => block.kind === "paragraph";

const reuseOrCreateHeadingBlock = (page: PageDocument, index: number, nextText: string): HeadingBlock =>
  pipe(
    A.get(page.blocks, index),
    O.filter(isHeadingBlock),
    O.match({
      onNone: () => makeHeadingBlock(nextText, 1),
      onSome: identity,
    })
  );

const reuseOrCreateQuoteBlock = (page: PageDocument, index: number, nextText: string): QuoteBlock =>
  pipe(
    A.get(page.blocks, index),
    O.filter(isQuoteBlock),
    O.match({
      onNone: () => makeQuoteBlock(nextText),
      onSome: identity,
    })
  );

const reuseOrCreateParagraphBlock = (page: PageDocument, index: number, nextText: string): ParagraphBlock =>
  pipe(
    A.get(page.blocks, index),
    O.filter(isParagraphBlock),
    O.match({
      onNone: () => makeParagraphBlock(nextText),
      onSome: identity,
    })
  );

const appendPageBlock = (block: PageDocument["blocks"][number]) => {
  switch (block.kind) {
    case "heading": {
      const { level, text } = block;
      const node = $createHeadingNode(headingTagFromLevel(level));
      node.append($createTextNode(text));
      return node;
    }
    case "quote": {
      const { text } = block;
      const node = $createQuoteNode();
      node.append($createTextNode(text));
      return node;
    }
    case "paragraph": {
      const { text } = block;
      const node = $createParagraphNode();
      node.append($createTextNode(text));
      return node;
    }
  }
};

const initializeEditorState =
  (page: PageDocument) =>
  (editor: LexicalEditor): void => {
    editor.update(() => {
      const root = $getRoot();
      root.clear();

      pipe(
        page.blocks,
        A.map(appendPageBlock),
        A.forEach((node) => {
          root.append(node);
        })
      );

      if (root.getChildrenSize() === 0) {
        root.append($createParagraphNode());
      }
    });
  };

const blocksFromEditorState = (page: PageDocument, editorState: EditorState): PageDocument["blocks"] =>
  editorState.read(() =>
    pipe(
      $getRoot().getChildren(),
      A.reduce(A.empty<PageDocument["blocks"][number]>(), (blocks, node, index) => {
        if ($isHeadingNode(node)) {
          const previous = reuseOrCreateHeadingBlock(page, index, node.getTextContent());

          return A.append(
            blocks,
            new HeadingBlock({
              kind: "heading",
              id: previous.id,
              level: headingLevelFromTag(node.getTag()),
              text: node.getTextContent(),
            })
          );
        }

        if ($isQuoteNode(node)) {
          const previous = reuseOrCreateQuoteBlock(page, index, node.getTextContent());

          return A.append(
            blocks,
            new QuoteBlock({
              kind: "quote",
              id: previous.id,
              text: node.getTextContent(),
            })
          );
        }

        if ($isParagraphNode(node)) {
          const previous = reuseOrCreateParagraphBlock(page, index, node.getTextContent());

          return A.append(
            blocks,
            new ParagraphBlock({
              kind: "paragraph",
              id: previous.id,
              text: node.getTextContent(),
            })
          );
        }

        return blocks;
      }),
      A.match({
        onEmpty: () => [makeParagraphBlock("")],
        onNonEmpty: A.fromIterable,
      })
    )
  );

const projectEditorState = (page: PageDocument, editorState: EditorState): PageDocument =>
  refreshPageDocument(page, {
    title: page.title,
    slug: page.slug,
    blocks: blocksFromEditorState(page, editorState),
    now: DateTime.nowUnsafe(),
  });

const BlockTypeToolbar = () => {
  const [editor] = useLexicalComposerContext();

  const setParagraph = () => {
    editor.update(() => {
      const selection = $getSelection();

      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
  };

  const setHeading = (level: 1 | 2 | 3) => {
    editor.update(() => {
      const selection = $getSelection();

      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode(headingTagFromLevel(level)));
      }
    });
  };

  const setQuote = () => {
    editor.update(() => {
      const selection = $getSelection();

      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, $createQuoteNode);
      }
    });
  };

  return (
    <div className="beep-editor-toolbar" data-namespace={$I.make("toolbar")}>
      <button className="beep-editor-toolbar-button" type="button" onClick={setParagraph}>
        Paragraph
      </button>
      <button className="beep-editor-toolbar-button" type="button" onClick={() => setHeading(1)}>
        H1
      </button>
      <button className="beep-editor-toolbar-button" type="button" onClick={() => setHeading(2)}>
        H2
      </button>
      <button className="beep-editor-toolbar-button" type="button" onClick={() => setHeading(3)}>
        H3
      </button>
      <button className="beep-editor-toolbar-button" type="button" onClick={setQuote}>
        Quote
      </button>
    </div>
  );
};

/**
 * Lexical-powered editing surface for the canonical editor page model.
 *
 * @param props - The editor surface props containing the current page and change handler.
 * @returns The Lexical editor surface bound to the canonical page model.
 *
 * @example
 * ```ts
 * import { EditorSurface } from "@beep/editor-lexical"
 *
 * const component = EditorSurface
 * void component
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const EditorSurface = ({
  page,
  onChange,
}: {
  readonly page: PageDocument;
  readonly onChange: (page: PageDocument) => void;
}): JSX.Element => (
  <div className="beep-editor-shell">
    <LexicalComposer
      initialConfig={{
        namespace: $I.make("lexical"),
        theme: editorTheme,
        nodes: editorNodes,
        editorState: initializeEditorState(page),
        onError: (error) => {
          throw error;
        },
      }}
    >
      <BlockTypeToolbar />
      <RichTextPlugin
        contentEditable={<ContentEditable className="beep-editor-content" placeholder={null} />}
        placeholder={<div className="beep-editor-placeholder">Start writing...</div>}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <HistoryPlugin />
      <OnChangePlugin
        ignoreSelectionChange={true}
        onChange={(editorState) => onChange(projectEditorState(page, editorState))}
      />
    </LexicalComposer>
  </div>
);
