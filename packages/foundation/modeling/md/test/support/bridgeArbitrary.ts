// Generator and normalizer for the Md.render -> Md.parse round-trip property.
//
// The generator stays inside the writer contract the bridge can invert
// (wave-2d plan, Plan 2 section 7): no RawMarkdown or Embed, no nested
// links, emphasis-like children with alphanumeric edges, no CR or NUL, no
// whitespace at line edges, no newlines in headings, cells or alt text, no
// adjacent lists of the same marker family, tight list items only, and
// footnote references only to existing definitions. Every other exclusion
// is a named gap in `ROUND_TRIP_GAPS`, which the bridge-corpus ledger
// prints so the gaps stay visible in review.
//
// `normalizeBridgeDocument` erases only writer-contract canonicalization:
// adjacent Text runs merge (the parser reads one run where the generator
// joined several), RawHtml becomes Text (the built-in Markdown adapter
// escapes it), and footnote labels fold to lower case (CommonMark label
// matching is case-insensitive and the kit keeps the folded identifier).

import {
  Admonition,
  A as Anchor,
  BlockQuote,
  Br,
  Code,
  Del,
  Document,
  Em,
  FootnoteDefinition,
  FootnoteReference,
  Heading,
  Hr,
  Img,
  Inline,
  Li,
  Ol,
  P,
  Pre,
  RawHtml,
  Strong,
  Table,
  TableCell,
  TableRow,
  TaskItem,
  TaskList,
  Text,
  Ul,
  YouTube,
} from "@beep/md/Md.model";
import * as Arbitrary from "effect/Arbitrary";
import * as A from "effect/Array";
import { pipe } from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import type { Block } from "@beep/md/Md.model";

/** One construct the round-trip generator leaves out, and who owns the fix. */
export class RoundTripGap extends S.Opaque<RoundTripGap, { readonly brand: unique symbol }>()(
  S.Struct({
    id: S.String,
    owner: S.String,
    description: S.String,
  })
) {}

/** The named exclusions of {@link BridgeDocumentArbitrary}. */
export const ROUND_TRIP_GAPS: ReadonlyArray<RoundTripGap> = [
  RoundTripGap.make({
    id: "writerDollarAmpersand",
    owner: "wave 2d-3 writer fixes",
    description: "Md.render does not escape `$` or `&` in text, so generated values contain neither.",
  }),
  RoundTripGap.make({
    id: "mathRecognizerOff",
    owner: "wave 2d-3 writer fixes",
    description:
      "The math recognizer defaults off until the writer escapes `$`, so no MathBlock or InlineMath is generated.",
  }),
  RoundTripGap.make({
    id: "kitNestedTaskList",
    owner: "@beep/markdown",
    description:
      "The kit does not recognize a GFM task-list item inside a blockquote or a nested list, so task lists are top-level only.",
  }),
  RoundTripGap.make({
    id: "writerAdmonitionBody",
    owner: "wave 2d-3 writer fixes",
    description:
      "Md.render writes an admonition body directly under its marker line, so a first child of hr, table, YouTube or an ordered list starting above 1 merges into the marker paragraph.",
  }),
  RoundTripGap.make({
    id: "frontmatterCapturesLeadingHr",
    owner: "@beep/md bridge",
    description:
      "Md.parse always captures frontmatter, so a document starting with a thematic break and holding a later `---` line loses the span between them without a loss.",
  }),
];

const Word = Arbitrary.schema(S.Literals(["alpha", "beta", "gamma", "delta", "omega", "kappa", "zeta", "Note"]));

const Words = pipe(
  Arbitrary.array(Word, { minLength: 1, maxLength: 3 }),
  Arbitrary.map((words) => A.join(words, " "))
);

const OptionalWord = pipe(
  Arbitrary.all([Arbitrary.schema(S.Boolean), Word]),
  Arbitrary.map(([present, word]) => (present ? O.some(word) : O.none()))
);

const InlineKind = Arbitrary.schema(S.Literals(["text", "strong", "em", "del", "code", "a", "img", "rawHtml"]));

const InlineAtom: Arbitrary.Arbitrary<Inline> = pipe(
  Arbitrary.all([InlineKind, Words, Word, OptionalWord]),
  Arbitrary.map(([kind, words, word, title]): Inline => {
    switch (kind) {
      case "text":
        return Text.make({ value: words });
      case "strong":
        return Strong.make({ children: [Text.make({ value: words })] });
      case "em":
        return Em.make({ children: [Text.make({ value: words })] });
      case "del":
        return Del.make({ children: [Text.make({ value: words })] });
      case "code":
        return Code.make({ value: word });
      case "a":
        return Anchor.make({ href: `https://example.com/${word}`, title, children: [Text.make({ value: words })] });
      case "img":
        return Img.make({ src: `https://example.com/${word}.png`, alt: words, title });
      case "rawHtml":
        return RawHtml.make({ value: `<b>${word}</b>` });
    }
  })
);

const Separator = pipe(
  Arbitrary.schema(S.Literals(["space", "space", "break"])),
  Arbitrary.map((kind): Inline => (kind === "space" ? Text.make({ value: " " }) : Br.make({})))
);

// One inline run: atoms joined by a space or a hard break, so no two
// emphasis-like atoms touch and no run starts or ends with whitespace.
const InlineRun: Arbitrary.Arbitrary<ReadonlyArray<Inline>> = pipe(
  Arbitrary.all([Arbitrary.array(InlineAtom, { minLength: 1, maxLength: 3 }), Separator]),
  Arbitrary.map(([atoms, separator]) => A.intersperse(atoms, separator))
);

const TextRun = pipe(
  Words,
  Arbitrary.map((value): ReadonlyArray<Inline> => [Text.make({ value })])
);

const listFamily = (block: Block): O.Option<string> => {
  switch (block._tag) {
    case "ul":
    case "taskList":
      return O.some("bullet");
    case "ol":
      return O.some("ordered");
    default:
      return O.none();
  }
};

const noAdjacentListFamilies = (blocks: ReadonlyArray<Block>): boolean =>
  A.every(A.zip(blocks, A.drop(blocks, 1)), ([left, right]) => {
    const family = listFamily(left);
    return O.isNone(family) || !O.contains(listFamily(right), family.value);
  });

const LeafKinds = S.Literals(["p", "heading", "hr", "pre", "ul", "ol", "taskList", "table", "youtube"]);
type LeafKind = typeof LeafKinds.Type;
const LeafKind = Arbitrary.schema(LeafKinds);
const ContainedLeafKind = Arbitrary.schema(
  LeafKinds.pick(["p", "heading", "hr", "pre", "ul", "ol", "table", "youtube"])
);

const HeadingLevel = Arbitrary.schema(S.Literals([1, 2, 3, 4, 5, 6]));
const Alignment = Arbitrary.schema(S.Literals(["none", "left", "center", "right"]));
const Start = Arbitrary.schema(S.Literals([1, 2, 7]));
const VideoId = Arbitrary.schema(S.Literals(["dQw4w9WgXcQ", "M7lc1UVf-VE"]));

const LeafSeed = Arbitrary.all({
  run: InlineRun,
  items: Arbitrary.array(InlineRun, { minLength: 1, maxLength: 3 }),
  checks: Arbitrary.array(Arbitrary.schema(S.Boolean), { minLength: 3, maxLength: 3 }),
  level: HeadingLevel,
  language: OptionalWord,
  lines: Arbitrary.array(Words, { minLength: 1, maxLength: 3 }),
  start: Start,
  align: Arbitrary.array(Alignment, { minLength: 1, maxLength: 3 }),
  cells: Arbitrary.array(TextRun, { minLength: 3, maxLength: 3 }),
  rows: Arbitrary.array(Arbitrary.array(TextRun, { minLength: 3, maxLength: 3 }), { minLength: 0, maxLength: 2 }),
  videoId: VideoId,
});

type LeafSeed = typeof LeafSeed extends Arbitrary.Arbitrary<infer Seed> ? Seed : never;

const listItems = (seed: LeafSeed): ReadonlyArray<Li> => A.map(seed.items, (children) => Li.make({ children }));

const tableRow =
  (width: number) =>
  (cells: ReadonlyArray<ReadonlyArray<Inline>>): TableRow =>
    TableRow.make({ children: A.map(A.take(cells, width), (children) => TableCell.make({ children })) });

const leafBuilders: { readonly [Kind in LeafKind]: (seed: LeafSeed) => Block } = {
  p: (seed) => P.make({ children: seed.run }),
  heading: (seed) => Heading.make({ level: seed.level, children: seed.run }),
  hr: () => Hr.make({}),
  pre: (seed) => Pre.make({ language: seed.language, value: A.join(seed.lines, "\n") }),
  ul: (seed) => Ul.make({ children: listItems(seed) }),
  ol: (seed) => Ol.make({ start: seed.start, children: listItems(seed) }),
  taskList: (seed) =>
    TaskList.make({
      children: A.map(seed.items, (children, index) =>
        TaskItem.make({ checked: seed.checks[index] ?? false, children })
      ),
    }),
  table: (seed) =>
    Table.make({
      align: seed.align,
      headerRow: true,
      children: A.map([seed.cells, ...seed.rows], tableRow(seed.align.length)),
    }),
  youtube: (seed) => YouTube.make({ videoId: seed.videoId }),
};

const leafBlockOf = (kinds: Arbitrary.Arbitrary<LeafKind>): Arbitrary.Arbitrary<Block> =>
  pipe(
    Arbitrary.all([kinds, LeafSeed]),
    Arbitrary.map(([kind, seed]) => leafBuilders[kind](seed))
  );

// Task lists only at the top level: @beep/markdown does not recognize a
// GFM task-list item inside a blockquote or a nested list (gap
// `kitNestedTaskList`).
const topLeafBlock = leafBlockOf(LeafKind);
const containedLeafBlock = leafBlockOf(ContainedLeafKind);

const ContainerKind = Arbitrary.schema(S.Literals(["leaf", "leaf", "blockquote", "admonition"]));

// Md.render writes an admonition's body directly under its `[!KIND]` line,
// so a first child that cannot interrupt a paragraph merges into the marker
// paragraph (gap `writerAdmonitionBody`): a thematic break turns the marker
// into a setext heading, and an ordered list starting above 1, a table or
// a bare YouTube URL become paragraph continuation text.
const interruptsMarkerParagraph = (blocks: ReadonlyArray<Block>): boolean =>
  O.match(A.head(blocks), {
    onNone: () => true,
    onSome: (first) =>
      first._tag !== "hr" &&
      first._tag !== "table" &&
      first._tag !== "youtube" &&
      !(first._tag === "ol" && first.start !== 1),
  });
const AdmonitionKindArbitrary = Arbitrary.schema(S.Literals(["note", "tip", "important", "warning", "caution"]));

const blocksOf = (block: Arbitrary.Arbitrary<Block>): Arbitrary.Arbitrary<ReadonlyArray<Block>> =>
  pipe(Arbitrary.array(block, { minLength: 1, maxLength: 3 }), Arbitrary.filter(noAdjacentListFamilies));

const nestedBlock = (leaf: Arbitrary.Arbitrary<Block>, inner: Arbitrary.Arbitrary<Block>): Arbitrary.Arbitrary<Block> =>
  pipe(
    Arbitrary.all({
      kind: ContainerKind,
      leaf,
      children: blocksOf(inner),
      admonition: AdmonitionKindArbitrary,
      title: OptionalWord,
    }),
    Arbitrary.map((g): Block => {
      switch (g.kind) {
        case "leaf":
          return g.leaf;
        case "blockquote":
          return BlockQuote.make({ children: g.children });
        case "admonition":
          return Admonition.make({ kind: g.admonition, title: g.title, children: g.children });
      }
    }),
    Arbitrary.filter((block) => block._tag !== "admonition" || interruptsMarkerParagraph(block.children))
  );

// Md.parse always captures frontmatter, so a document whose first block is
// a thematic break (`---`) and that holds a second `---` line later reads
// the span between them as frontmatter (gap `frontmatterCapturesLeadingHr`).
const startsWithoutHr = (blocks: ReadonlyArray<Block>): boolean =>
  O.match(A.head(blocks), { onNone: () => true, onSome: (first) => first._tag !== "hr" });

/**
 * Md documents inside the bridge's invertible writer contract, two
 * container levels deep.
 */
const Frontmatter = pipe(
  Arbitrary.all([Arbitrary.schema(S.Boolean), Words, Arbitrary.schema(S.Literals([0, 3, -12])), Arbitrary.array(Word)]),
  Arbitrary.map(([present, title, count, tags]) =>
    present ? O.some<S.JsonObject>({ count, draft: false, tags, title }) : O.none()
  )
);

// A footnote is a referencing paragraph plus its definition, so every
// generated reference resolves and every definition is referenced once.
const footnoteBlocks = (identifier: string, body: string): ReadonlyArray<Block> => [
  P.make({ children: [Text.make({ value: "See" }), FootnoteReference.make({ identifier })] }),
  FootnoteDefinition.make({ identifier, children: [P.make({ children: [Text.make({ value: body })] })] }),
];

export const BridgeDocumentArbitrary: Arbitrary.Arbitrary<Document> = pipe(
  Arbitrary.all({
    children: pipe(
      blocksOf(nestedBlock(topLeafBlock, nestedBlock(containedLeafBlock, containedLeafBlock))),
      Arbitrary.filter(startsWithoutHr)
    ),
    frontmatter: Frontmatter,
    footnote: OptionalWord,
    body: Words,
  }),
  Arbitrary.map(({ body, children, footnote, frontmatter }) =>
    Document.make({
      frontmatter,
      children: O.match(footnote, {
        onNone: () => children,
        onSome: (identifier) => A.appendAll(children, footnoteBlocks(identifier, body)),
      }),
    })
  )
);

const mergeText = (inlines: ReadonlyArray<Inline>): ReadonlyArray<Inline> =>
  A.reduce(A.map(inlines, normalizeInline), A.empty<Inline>(), (merged, inline) => {
    const last = A.last(merged);
    return O.isSome(last) && last.value._tag === "text" && inline._tag === "text"
      ? A.append(A.dropRight(merged, 1), Text.make({ value: `${last.value.value}${inline.value}` }))
      : A.append(merged, inline);
  });

const normalizeInline = (inline: Inline): Inline => {
  switch (inline._tag) {
    case "strong":
      return Strong.make({ children: mergeText(inline.children) });
    case "em":
      return Em.make({ children: mergeText(inline.children) });
    case "del":
      return Del.make({ children: mergeText(inline.children) });
    case "a":
      return Anchor.make({ href: inline.href, title: inline.title, children: mergeText(inline.children) });
    case "rawHtml":
      return Text.make({ value: inline.value });
    case "footnoteReference":
      return FootnoteReference.make({ identifier: Str.toLowerCase(inline.identifier) });
    default:
      return inline;
  }
};

const normalizeBlock = (block: Block): Block => {
  switch (block._tag) {
    case "p":
      return P.make({ children: mergeText(block.children) });
    case "heading":
      return Heading.make({ level: block.level, children: mergeText(block.children) });
    case "ul":
      return Ul.make({ children: A.map(block.children, (li) => Li.make({ children: normalizeItem(li.children) })) });
    case "ol":
      return Ol.make({
        start: block.start,
        children: A.map(block.children, (li) => Li.make({ children: normalizeItem(li.children) })),
      });
    case "taskList":
      return TaskList.make({
        children: A.map(block.children, (item) =>
          TaskItem.make({ checked: item.checked, children: normalizeItem(item.children) })
        ),
      });
    case "blockquote":
      return BlockQuote.make({ children: A.map(block.children, normalizeBlock) });
    case "admonition":
      return Admonition.make({ kind: block.kind, title: block.title, children: A.map(block.children, normalizeBlock) });
    case "footnoteDefinition":
      return FootnoteDefinition.make({
        identifier: Str.toLowerCase(block.identifier),
        children: A.map(block.children, normalizeBlock),
      });
    default:
      return block;
  }
};

const isInline = S.is(Inline);

// Generated items hold one inline run, which Md.render writes as a tight item.
const normalizeItem = (children: Li["children"]): Li["children"] =>
  A.every(children, isInline) ? mergeText(children) : children;

/**
 * Erase the writer-contract canonicalization a render and re-parse applies
 * to a generated document, and nothing else.
 */
export const normalizeBridgeDocument = (document: Document): Document =>
  Document.make({ frontmatter: document.frontmatter, children: A.map(document.children, normalizeBlock) });
