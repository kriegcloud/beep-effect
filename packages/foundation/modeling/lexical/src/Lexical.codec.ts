/**
 * Md ↔ Lexical codecs over the canonical `@beep/md` AST.
 *
 * The supported round-trip profile and its documented degradations live in
 * the package README ("Lossiness profile"). In short: md-core blocks
 * (paragraph, heading, code, list, quote with a single paragraph, inline
 * strong/em/del/code/link/br) and `artifact-ref` round-trip; Lexical-only
 * presentation state (alignment, indent, direction, underline and other
 * non-md format bits, inline styles, NodeState) is dropped on the way to Md.
 *
 * @packageDocumentation \@beep/lexical-schema/Lexical.codec
 * @since 0.0.0
 */

import * as Md from "@beep/md/Md.model";
import { PosInt } from "@beep/schema";
import { A, dual, O, Str } from "@beep/utils";
import { Effect, flow, Match, pipe } from "effect";
import * as S from "effect/Schema";
import {
  ArtifactRefId,
  ArtifactRefNode,
  CodeNode,
  HeadingNode,
  hasTextFormat,
  LexicalIndentDepth,
  LexicalNode,
  LineBreakNode,
  LinkNode,
  ListItemNode,
  ListNode,
  nodeToPlainText,
  ParagraphNode,
  QuoteNode,
  RootNode,
  SerializedEditorState,
  TableCellNode,
  TableNode,
  TableRowNode,
  TextDetailMask,
  TextFormatBits,
  TextFormatMask,
  TextNode,
  withTextFormat,
  YouTubeNode,
} from "./Lexical.model.ts";
import type { NonNegativeInt } from "@beep/schema";
import type { TableCellHeaderState, TableCellSpan, TableDimension } from "./Lexical.model.ts";

/**
 * URI scheme that round-trips {@link ArtifactRefNode} through the Md AST as a
 * paragraph wrapping a single link.
 *
 * @example
 * ```ts
 * import { ARTIFACT_URI_PREFIX } from "@beep/lexical-schema/Lexical.codec"
 *
 * console.log(ARTIFACT_URI_PREFIX) // "artifact://"
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const ARTIFACT_URI_PREFIX = "artifact://";

const emptyTextFormat = TextFormatMask.make(0);
const emptyTextDetail = TextDetailMask.make(0);
const zeroIndent = LexicalIndentDepth.make(0);
const lexicalNodeVersion = 1 as const;
const firstOrdinal = PosInt.make(1);
const noTableCellHeader = 0 satisfies TableCellHeaderState;
const rowTableCellHeader = 1 satisfies TableCellHeaderState;
const decodeArtifactRefIdOption = S.decodeUnknownOption(ArtifactRefId);

const elementDefaults = {
  version: lexicalNodeVersion,
  $: O.none<Record<string, unknown>>(),
  direction: O.none<"ltr" | "rtl">(),
  format: "" as const,
  indent: zeroIndent,
  textFormat: O.none<TextFormatMask>(),
  textStyle: O.none<string>(),
};

const leafDefaults = {
  version: lexicalNodeVersion,
  $: O.none<Record<string, unknown>>(),
};

const tableCellDefaults = {
  colSpan: O.none<TableCellSpan>(),
  rowSpan: O.none<TableCellSpan>(),
  width: O.none<TableDimension>(),
  backgroundColor: O.none<string | null>(),
  verticalAlign: O.none<string>(),
};

const tableNodeDefaults = {
  colWidths: O.none<ReadonlyArray<TableDimension>>(),
  rowStriping: O.none<boolean>(),
  frozenColumnCount: O.none<NonNegativeInt>(),
  frozenRowCount: O.none<NonNegativeInt>(),
};

const textLeaf: {
  (text: string, format: TextFormatMask): Effect.Effect<TextNode, S.SchemaError>;
  (format: TextFormatMask): (text: string) => Effect.Effect<TextNode, S.SchemaError>;
} = dual(
  2,
  (text: string, format: TextFormatMask): Effect.Effect<TextNode, S.SchemaError> =>
    TextNode.makeEffect({
      ...leafDefaults,
      detail: emptyTextDetail,
      format,
      mode: "normal",
      style: "",
      text,
    })
);

const lineBreak = () => LineBreakNode.makeEffect({ ...leafDefaults });

const mdInlineText = Match.type<Md.Inline>().pipe(
  Match.tagsExhaustive({
    text: (node) => node.value,
    rawMarkdown: (node) => node.value,
    rawHtml: (node) => node.value,
    strong: (node) => mdInlinesText(node.children),
    em: (node) => mdInlinesText(node.children),
    del: (node) => mdInlinesText(node.children),
    code: (node) => node.value,
    a: (node) => mdInlinesText(node.children),
    img: (node) => node.alt,
    br: () => "\n",
  })
);

const mdInlinesText: (inlines: ReadonlyArray<Md.Inline>) => string = flow(A.map(mdInlineText), A.join(""));

const isMdInline = S.is(Md.Inline);

const mdListItemChildrenText = (children: ReadonlyArray<Md.ListItemChild>): string => {
  const chunks: Array<string> = [];
  let pendingInlines: Array<Md.Inline> = [];
  const flushInlines = (): void => {
    if (pendingInlines.length > 0) {
      A.appendInPlace(chunks, mdInlinesText(pendingInlines));
      pendingInlines = [];
    }
  };

  for (const child of children) {
    if (isMdInline(child)) {
      A.appendInPlace(pendingInlines, child);
    } else {
      flushInlines();
      A.appendInPlace(chunks, mdBlockText(child));
    }
  }

  flushInlines();

  return A.join(chunks, "\n");
};

const mdBlockText = (block: Md.Block): string =>
  Match.value(block).pipe(
    Match.tagsExhaustive({
      h1: (node) => mdInlinesText(node.children),
      h2: (node) => mdInlinesText(node.children),
      h3: (node) => mdInlinesText(node.children),
      h4: (node) => mdInlinesText(node.children),
      h5: (node) => mdInlinesText(node.children),
      h6: (node) => mdInlinesText(node.children),
      p: (node) => mdInlinesText(node.children),
      blockquote: (node) => A.join(A.map(node.children, mdBlockText), "\n"),
      pre: (node) => node.value,
      ul: (node) =>
        A.join(
          A.map(node.children, (item) => mdListItemChildrenText(item.children)),
          "\n"
        ),
      ol: (node) =>
        A.join(
          A.map(node.children, (item) => mdListItemChildrenText(item.children)),
          "\n"
        ),
      taskList: (node) =>
        A.join(
          A.map(node.children, (item) => mdListItemChildrenText(item.children)),
          "\n"
        ),
      table: (node) =>
        A.join(
          A.map(node.children, (row) =>
            A.join(
              A.map(row.children, (cell) => mdInlinesText(cell.children)),
              "\t"
            )
          ),
          "\n"
        ),
      youtube: (node) => `https://www.youtube.com/watch?v=${node.videoId}`,
      hr: () => "---",
    })
  );

const inlinesToLexical = (
  inlines: ReadonlyArray<Md.Inline>,
  format: TextFormatMask
): Effect.Effect<ReadonlyArray<LexicalNode>, S.SchemaError> =>
  Effect.map(
    Effect.forEach(inlines, (inline) => inlineToLexical(inline, format)),
    A.flatten
  );

const inlineToLexical = (
  inline: Md.Inline,
  format: TextFormatMask
): Effect.Effect<ReadonlyArray<LexicalNode>, S.SchemaError> =>
  Match.value(inline).pipe(
    Match.tagsExhaustive({
      text: (node) => Effect.map(textLeaf(node.value, format), A.of<LexicalNode>), // Trusted raw runs have no Lexical equivalent; they degrade to plain
      // text runs (README "Lossiness profile").
      rawMarkdown: (node) => Effect.map(textLeaf(node.value, format), A.of<LexicalNode>),
      rawHtml: (node) => Effect.map(textLeaf(node.value, format), A.of<LexicalNode>),
      strong: (node) => inlinesToLexical(node.children, withTextFormat(format, TextFormatBits.bold)),
      em: (node) => inlinesToLexical(node.children, withTextFormat(format, TextFormatBits.italic)),
      del: (node) => inlinesToLexical(node.children, withTextFormat(format, TextFormatBits.strikethrough)),
      code: (node) => Effect.map(textLeaf(node.value, withTextFormat(format, TextFormatBits.code)), A.of<LexicalNode>),
      a: (node) =>
        Effect.flatMap(inlinesToLexical(node.children, format), (children) =>
          Effect.map(
            LinkNode.makeEffect({
              ...elementDefaults,
              url: node.href,
              rel: O.none(),
              target: O.none(),
              title: O.none(),
              children,
            }),
            A.of<LexicalNode>
          )
        ), // Images degrade to links so the destination survives (README).
      img: (node) =>
        Effect.flatMap(textLeaf(node.alt, format), (alt) =>
          Effect.map(
            LinkNode.makeEffect({
              ...elementDefaults,
              url: node.src,
              rel: O.none(),
              target: O.none(),
              title: O.none(),
              children: [alt],
            }),
            A.of<LexicalNode>
          )
        ),
      br: () => Effect.map(lineBreak(), A.of<LexicalNode>),
    })
  );

const headingToLexical = (
  tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6",
  children: ReadonlyArray<Md.Inline>
): Effect.Effect<LexicalNode, S.SchemaError> =>
  Effect.flatMap(inlinesToLexical(children, emptyTextFormat), (inlines) =>
    HeadingNode.makeEffect({
      ...elementDefaults,
      tag,
      children: inlines,
    })
  );

const listItemsToLexical = (
  items: ReadonlyArray<{
    readonly children: ReadonlyArray<Md.ListItemChild>;
    readonly checked?: boolean;
  }>
): Effect.Effect<ReadonlyArray<LexicalNode>, S.SchemaError> =>
  Effect.forEach(items, (item, index) =>
    Effect.flatMap(listItemChildrenToLexical(item.children), (children) =>
      ListItemNode.makeEffect({
        ...elementDefaults,
        checked: O.fromUndefinedOr(item.checked),
        value: PosInt.make(index + 1),
        children,
      })
    )
  );

const listItemChildrenToLexical = (
  children: ReadonlyArray<Md.ListItemChild>
): Effect.Effect<ReadonlyArray<LexicalNode>, S.SchemaError> => {
  const inlines = A.filter(children, isMdInline);

  return inlines.length === children.length
    ? inlinesToLexical(inlines, emptyTextFormat)
    : Effect.map(textLeaf(mdListItemChildrenText(children), emptyTextFormat), A.of<LexicalNode>);
};

const quoteChildToInlines = (block: Md.Block): Effect.Effect<ReadonlyArray<LexicalNode>, S.SchemaError> =>
  block._tag === "p"
    ? inlinesToLexical(block.children, emptyTextFormat)
    : Effect.map(textLeaf(mdBlockText(block), emptyTextFormat), A.of<LexicalNode>);

const paragraphArtifactRef = (
  block: Md.P
): O.Option<{
  readonly artifactId: ArtifactRefId;
  readonly label: O.Option<string>;
}> => {
  const child = block.children.length === 1 ? block.children[0] : undefined;
  if (child === undefined || child._tag !== "a" || !Str.startsWith(ARTIFACT_URI_PREFIX)(child.href)) {
    return O.none();
  }
  const artifactId = decodeArtifactRefIdOption(Str.slice(ARTIFACT_URI_PREFIX.length)(child.href));
  if (O.isNone(artifactId)) {
    return O.none();
  }
  const label = mdInlinesText(child.children);
  return O.some({
    artifactId: artifactId.value,
    label: label === artifactId.value || label.length === 0 ? O.none() : O.some(label),
  });
};

/**
 * Lift one Md block into its serialized Lexical node.
 *
 * @example
 * ```ts
 * import * as Effect from "effect/Effect"
 * import { P, Text } from "@beep/md/Md.model"
 * import { blockToLexical } from "@beep/lexical-schema/Lexical.codec"
 *
 * const node = Effect.runSync(blockToLexical(P.make({ children: [Text.make({ value: "Hello" })] })))
 * console.log(node.type) // "paragraph"
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const blockToLexical = Match.type<Md.Block>().pipe(
  Match.tagsExhaustive({
    h1: (node) => headingToLexical("h1", node.children),
    h2: (node) => headingToLexical("h2", node.children),
    h3: (node) => headingToLexical("h3", node.children),
    h4: (node) => headingToLexical("h4", node.children),
    h5: (node) => headingToLexical("h5", node.children),
    h6: (node) => headingToLexical("h6", node.children),
    p: (node) =>
      O.match(paragraphArtifactRef(node), {
        onNone: () =>
          Effect.flatMap(inlinesToLexical(node.children, emptyTextFormat), (children) =>
            ParagraphNode.makeEffect({
              ...elementDefaults,
              children,
            })
          ),
        onSome: (ref) =>
          ArtifactRefNode.makeEffect({
            ...leafDefaults,
            artifactId: ref.artifactId,
            label: ref.label,
          }),
      }),
    blockquote: Effect.fn(function* (node: Md.BlockQuote) {
      const runs = yield* Effect.forEach(node.children, quoteChildToInlines);
      const children: Array<LexicalNode> = [];
      for (const [index, run] of runs.entries()) {
        if (index > 0) children.push(yield* lineBreak());
        children.push(...run);
      }
      return yield* QuoteNode.makeEffect({
        ...elementDefaults,
        children,
      });
    }),
    pre: (node) =>
      Effect.flatMap(
        Effect.map(
          Effect.forEach(Str.split(node.value, "\n"), (line, index) =>
            index === 0
              ? Effect.map(textLeaf(line, emptyTextFormat), A.of<LexicalNode>)
              : Effect.zipWith(
                  lineBreak(),
                  textLeaf(line, emptyTextFormat),
                  (brk, text) => [brk, text] as ReadonlyArray<LexicalNode>
                )
          ),
          A.flatten
        ),
        (children) =>
          CodeNode.makeEffect({
            ...elementDefaults,
            language: node.language,
            theme: O.none(),
            children,
          })
      ),
    table: Effect.fn("Lexical.codec.blockToLexical.table")(function* (node: Md.Table) {
      const rows = yield* Effect.forEach(
        node.children,
        Effect.fnUntraced(function* (row: Md.TableRow, rowIndex) {
          const cells = yield* Effect.forEach(
            row.children,
            Effect.fnUntraced(function* (cell: Md.TableCell) {
              const inlines = yield* inlinesToLexical(cell.children, emptyTextFormat);
              const paragraph = yield* ParagraphNode.makeEffect({
                ...elementDefaults,
                children: inlines,
              });

              return yield* TableCellNode.makeEffect({
                ...elementDefaults,
                ...tableCellDefaults,
                headerState: node.headerRow && rowIndex === 0 ? rowTableCellHeader : noTableCellHeader,
                children: [paragraph],
              });
            })
          );

          return yield* TableRowNode.makeEffect({
            ...elementDefaults,
            height: O.none(),
            children: cells,
          });
        })
      );

      return yield* TableNode.makeEffect({
        ...elementDefaults,
        ...tableNodeDefaults,
        children: rows,
      });
    }),
    youtube: (node) =>
      YouTubeNode.makeEffect({
        ...leafDefaults,
        videoID: node.videoId,
        format: "",
      }),
    ul: (node) =>
      Effect.flatMap(listItemsToLexical(node.children), (children) =>
        ListNode.makeEffect({
          ...elementDefaults,
          listType: "bullet",
          start: firstOrdinal,
          tag: "ul",
          children,
        })
      ),
    ol: (node) =>
      Effect.flatMap(listItemsToLexical(node.children), (children) =>
        ListNode.makeEffect({
          ...elementDefaults,
          listType: "number",
          start: firstOrdinal,
          tag: "ol",
          children,
        })
      ),
    taskList: (node) =>
      Effect.flatMap(
        listItemsToLexical(
          A.map(node.children, (item) => ({
            children: item.children,
            checked: item.checked,
          }))
        ),
        (children) =>
          ListNode.makeEffect({
            ...elementDefaults,
            listType: "check",
            start: firstOrdinal,
            tag: "ul",
            children,
          })
      ), // Thematic breaks are outside the v1 node scope; they degrade to a
    // literal "---" paragraph (README "Lossiness profile").
    hr: () =>
      Effect.flatMap(textLeaf("---", emptyTextFormat), (text) =>
        ParagraphNode.makeEffect({
          ...elementDefaults,
          children: [text],
        })
      ),
  })
);

/**
 * Lift a full Md document into a serialized Lexical editor state.
 *
 * @example
 * ```ts
 * import * as Effect from "effect/Effect"
 * import { Document, P, Text } from "@beep/md/Md.model"
 * import { documentToEditorState } from "@beep/lexical-schema/Lexical.codec"
 *
 * const document = Document.make({ children: [P.make({ children: [Text.make({ value: "Hello" })] })] })
 * const state = Effect.runSync(documentToEditorState(document))
 * console.log(state.root.children.length) // 1
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const documentToEditorState = (document: Md.Document): Effect.Effect<SerializedEditorState, S.SchemaError> =>
  Effect.flatMap(Effect.forEach(document.children, blockToLexical), (children) =>
    Effect.flatMap(
      RootNode.makeEffect({
        ...elementDefaults,
        children,
      }),
      (root) => SerializedEditorState.makeEffect({ root })
    )
  );

const wrapMarks = (base: Md.Inline, format: TextFormatMask): Md.Inline => {
  let inline = base;
  if (hasTextFormat(format, TextFormatBits.strikethrough)) inline = Md.Del.make({ children: [inline] });
  if (hasTextFormat(format, TextFormatBits.italic)) inline = Md.Em.make({ children: [inline] });
  if (hasTextFormat(format, TextFormatBits.bold)) inline = Md.Strong.make({ children: [inline] });
  return inline;
};

const textRunToInlines = (children: ReadonlyArray<LexicalNode>): ReadonlyArray<Md.Inline> =>
  A.map(children, inlineNodeToMd);

const inlineNodeToMd: (node: LexicalNode) => Md.Inline = LexicalNode.match({
  text: (node) =>
    wrapMarks(
      hasTextFormat(node.format, TextFormatBits.code)
        ? Md.Code.make({ value: node.text })
        : Md.Text.make({ value: node.text }),
      node.format
    ),
  tab: () => Md.Text.make({ value: "\t" }),
  linebreak: () => Md.Br.make(),
  link: (node) =>
    Md.A.make({
      href: node.url,
      children: textRunToInlines(node.children),
    }),
  "artifact-ref": (node) =>
    Md.A.make({
      href: `${ARTIFACT_URI_PREFIX}${node.artifactId}`,
      children: [Md.Text.make({ value: O.getOrElse(node.label, () => node.artifactId) })],
    }), // Element nodes have no inline Md equivalent; they degrade to their plain
  // text (README "Lossiness profile").
  root: (node) => Md.Text.make({ value: nodeToPlainText(node) }),
  paragraph: (node) => Md.Text.make({ value: nodeToPlainText(node) }),
  heading: (node) => Md.Text.make({ value: nodeToPlainText(node) }),
  quote: (node) => Md.Text.make({ value: nodeToPlainText(node) }),
  list: (node) => Md.Text.make({ value: nodeToPlainText(node) }),
  listitem: (node) => Md.Text.make({ value: nodeToPlainText(node) }),
  code: (node) => Md.Text.make({ value: nodeToPlainText(node) }),
  youtube: (node) => Md.Text.make({ value: nodeToPlainText(node) }),
  table: (node) => Md.Text.make({ value: nodeToPlainText(node) }),
  tablerow: (node) => Md.Text.make({ value: nodeToPlainText(node) }),
  tablecell: (node) => Md.Text.make({ value: nodeToPlainText(node) }),
});

const codeChildText: (node: LexicalNode) => string = LexicalNode.match({
  text: (node) => node.text,
  tab: () => "\t",
  linebreak: () => "\n",
  "artifact-ref": nodeToPlainText,
  root: nodeToPlainText,
  paragraph: nodeToPlainText,
  heading: nodeToPlainText,
  quote: nodeToPlainText,
  list: nodeToPlainText,
  listitem: nodeToPlainText,
  link: nodeToPlainText,
  code: nodeToPlainText,
  youtube: nodeToPlainText,
  table: nodeToPlainText,
  tablerow: nodeToPlainText,
  tablecell: nodeToPlainText,
});

const isListNode = (node: LexicalNode): node is ListNode => S.is(ListNode)(node);
const isTableCellNode = (node: LexicalNode): node is TableCellNode => S.is(TableCellNode)(node);
const isTableRowNode = (node: LexicalNode): node is TableRowNode => S.is(TableRowNode)(node);

// Nested lists flatten into the parent list level (README "Lossiness
// profile") — `@beep/md` list items hold inline content only.
const collectListItems = (
  list: ListNode
): ReadonlyArray<{
  readonly checked: O.Option<boolean>;
  readonly inlines: ReadonlyArray<Md.Inline>;
}> =>
  A.flatMap(list.children, (child) =>
    child.type === "listitem"
      ? A.match(A.filter(child.children, isListNode), {
          onEmpty: () => [
            {
              checked: child.checked,
              inlines: textRunToInlines(child.children),
            } as const,
          ],
          onNonEmpty: (nested) => {
            const own = A.filter(child.children, (node) => !isListNode(node));
            const head =
              own.length === 0
                ? []
                : [
                    {
                      checked: child.checked,
                      inlines: textRunToInlines(own),
                    } as const,
                  ];
            return A.appendAll(head, A.flatMap(nested, collectListItems));
          },
        })
      : isListNode(child)
        ? collectListItems(child)
        : [
            {
              checked: O.none<boolean>(),
              inlines: [inlineNodeToMd(child)],
            } as const,
          ]
  );

const listToBlock = (node: ListNode): Md.Block => {
  const items = collectListItems(node);
  if (node.listType === "check") {
    return Md.TaskList.make({
      children: A.map(items, (item) =>
        Md.TaskItem.make({
          checked: O.getOrElse(item.checked, () => false),
          children: item.inlines,
        })
      ),
    });
  }
  const children = A.map(items, (item) => Md.Li.make({ children: item.inlines }));
  return node.listType === "number" ? Md.Ol.make({ children }) : Md.Ul.make({ children });
};

const headingConstructors = {
  h1: Md.H1,
  h2: Md.H2,
  h3: Md.H3,
  h4: Md.H4,
  h5: Md.H5,
  h6: Md.H6,
} as const;

const tableChildToInlines = (node: LexicalNode): ReadonlyArray<Md.Inline> =>
  node.type === "paragraph" ? textRunToInlines(node.children) : [Md.Text.make({ value: nodeToPlainText(node) })];

const tableCellToMd = (node: TableCellNode): Md.TableCell =>
  Md.TableCell.make({
    children: A.flatMap(node.children, tableChildToInlines),
  });

const tableRowToMd = (node: TableRowNode): Md.TableRow =>
  Md.TableRow.make({
    children: A.map(node.children, (child) =>
      isTableCellNode(child)
        ? tableCellToMd(child)
        : Md.TableCell.make({ children: [Md.Text.make({ value: nodeToPlainText(child) })] })
    ),
  });

const tableHasHeaderRow = (node: TableNode): boolean =>
  pipe(
    node.children,
    A.findFirst(isTableRowNode),
    O.map((row) => A.some(row.children, (child) => isTableCellNode(child) && child.headerState !== noTableCellHeader)),
    O.getOrElse(() => false)
  );

const tableToBlock = (node: TableNode): Md.Table =>
  Md.Table.make({
    headerRow: tableHasHeaderRow(node),
    children: A.map(A.filter(node.children, isTableRowNode), tableRowToMd),
  });

// The lexical `YouTubeNode.videoID` is an unconstrained string, while the Md
// `YouTube` embed enforces the CSF-026 guard (a bare 11-character video id) so
// that downstream percent-encoders cannot be crashed by a malformed id. Project
// the embed only when the id satisfies that schema; otherwise drop it (the embed
// is presentation-only, so omitting it keeps the document valid) so the
// Lexical -> Md projection stays total on arbitrary/untrusted input.
const isValidYouTubeVideoId: (videoId: string) => boolean = S.is(Md.YouTubeVideoId);

const youtubeToBlocks = (node: YouTubeNode): ReadonlyArray<Md.Block> =>
  isValidYouTubeVideoId(node.videoID) ? [Md.YouTube.make({ videoId: node.videoID })] : A.empty<Md.Block>();

/**
 * Project one serialized Lexical node onto Md blocks.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { LexicalNode } from "@beep/lexical-schema/Lexical.model"
 * import { nodeToBlocks } from "@beep/lexical-schema/Lexical.codec"
 *
 * const node = S.decodeUnknownSync(LexicalNode)({
 *   type: "artifact-ref", version: 1, artifactId: "artifact-123"
 * })
 * console.log(nodeToBlocks(node)[0]?._tag) // "p"
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const nodeToBlocks: (node: LexicalNode) => ReadonlyArray<Md.Block> = LexicalNode.match({
  root: (node) => A.flatMap(node.children, nodeToBlocks),
  paragraph: (node) => [Md.P.make({ children: textRunToInlines(node.children) })],
  heading: (node) => [headingConstructors[node.tag].make({ children: textRunToInlines(node.children) })],
  quote: (node) => [Md.BlockQuote.make({ children: [Md.P.make({ children: textRunToInlines(node.children) })] })],
  code: (node) => [
    Md.Pre.make({
      value: A.join(A.map(node.children, codeChildText), ""),
      language: node.language,
    }),
  ],
  table: (node) => [tableToBlock(node)],
  tablerow: (node) => [Md.Table.make({ headerRow: false, children: [tableRowToMd(node)] })],
  tablecell: (node) => [Md.P.make({ children: tableCellToMd(node).children })],
  youtube: (node) => youtubeToBlocks(node),
  list: (node) => [listToBlock(node)],
  listitem: (node) => [Md.P.make({ children: textRunToInlines(node.children) })],
  "artifact-ref": (node) => [Md.P.make({ children: [inlineNodeToMd(node)] })], // Loose leaves outside an element wrap into a paragraph.
  text: (node) => [Md.P.make({ children: [inlineNodeToMd(node)] })],
  tab: (node) => [Md.P.make({ children: [inlineNodeToMd(node)] })],
  linebreak: (node) => [Md.P.make({ children: [inlineNodeToMd(node)] })],
  link: (node) => [Md.P.make({ children: [inlineNodeToMd(node)] })],
});

/**
 * Project a serialized Lexical editor state onto the canonical Md document
 * AST, applying the documented lossiness profile.
 *
 * @example
 * ```ts
 * import * as Effect from "effect/Effect"
 * import { Document, P, Text } from "@beep/md/Md.model"
 * import { documentToEditorState, editorStateToDocument } from "@beep/lexical-schema/Lexical.codec"
 *
 * const document = Document.make({ children: [P.make({ children: [Text.make({ value: "Hello" })] })] })
 * const state = Effect.runSync(documentToEditorState(document))
 * console.log(editorStateToDocument(state).children[0]?._tag) // "p"
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const editorStateToDocument = (state: SerializedEditorState): Md.Document =>
  Md.Document.make({
    children: A.flatMap(state.root.children, nodeToBlocks),
  });
