import * as A from "effect/Array";
import { dual, pipe } from "effect/Function";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as Str from "effect/String";
import { Fmt, sanitize } from "../Fmt.ts";
import { counterLabel, countsTableOf, totalOf, visibleCountersOf } from "./counts.ts";
import { truncateSpans, widthOf, wrapSpans } from "./layout.ts";
import type { Block, Document, Inline, LinkTarget } from "../Doc.ts";
import type { RenderContext } from "../Render.ts";
import type { Style, TokenName } from "../Token.ts";
import type { Span } from "./layout.ts";

/**
 * One output line as spans; each span keeps its token and link until the line is finished.
 *
 * @category type-level
 * @since 0.0.0
 */
export type Line = ReadonlyArray<Span>;

/**
 * What differs between the text renderers. The walk, the layout and every width rule are shared; a renderer only
 * decides how inline content becomes spans, and how a finished line becomes a string.
 *
 * @internal
 * @category type-level
 * @since 0.0.0
 */
export interface Flavour {
  /** A finished line as the string that is printed. */
  readonly finish: {
    (line: Line, ctx: RenderContext): string;
    (ctx: RenderContext): (line: Line) => string;
  };
  /** Inline nodes as spans: code markers, the link policy, and whether tokens are kept. */
  readonly inline: {
    (inlines: ReadonlyArray<Inline>, ctx: RenderContext): ReadonlyArray<Span>;
    (ctx: RenderContext): (inlines: ReadonlyArray<Inline>) => ReadonlyArray<Span>;
  };
}

type Tone = TokenName | Style;

const span = (text: string, token?: Tone): Span => (token === undefined ? { text } : { text, token });

const textOf = (line: Line): string =>
  pipe(
    line,
    A.map((s) => s.text),
    A.join("")
  );

/**
 * A link target as plain text: the URL, or `path:line:col` through `displayPath`; a column needs a line.
 *
 * **Example** (Display a file location)
 *
 * ```ts
 * import { targetText } from "@beep/cli-kit/internal/renderDoc"
 * import { Render } from "@beep/cli-kit/Render"
 * const ctx = Render.contextOf({ audience: "human", color: "none" })
 * console.log(targetText({ file: "src/main.ts", line: 4, col: 2 }, ctx)) // src/main.ts:4:2
 * ```
 *
 * @category formatting
 * @since 0.0.0
 */
export const targetText: {
  (ctx: RenderContext): (target: LinkTarget) => string;
  (target: LinkTarget, ctx: RenderContext): string;
} = dual(2, (target: LinkTarget, ctx: RenderContext): string => {
  if ("url" in target) return sanitize(target.url);
  const path = sanitize(ctx.displayPath(target.file));
  if (target.line === undefined) return path;
  return target.col === undefined ? `${path}:${target.line}` : `${path}:${target.line}:${target.col}`;
});

/**
 * Whether a link's target follows its label where the link cannot be followed: the link's own `suffix` when it set one,
 * otherwise only when the label is not already the target's display form.
 *
 * **Example** (Choose a link target suffix)
 *
 * ```ts
 * import { showsSuffix } from "@beep/cli-kit/internal/renderDoc"
 * console.log(showsSuffix(undefined, "Guide", "https://example.com")) // true
 * console.log(showsSuffix(undefined, "https://example.com", "https://example.com")) // false
 * ```
 *
 * @category predicates
 * @since 0.0.0
 */
export const showsSuffix: {
  (label: string, target: string): (suffix: boolean | undefined) => boolean;
  (suffix: boolean | undefined, label: string, target: string): boolean;
} = dual(3, (suffix: boolean | undefined, label: string, target: string): boolean => suffix ?? label !== target);

/**
 * Drop trailing spaces, and any span they empty, so a line never ends in padding.
 *
 * **Example** (Remove trailing padding)
 *
 * ```ts
 * import { trimLine } from "@beep/cli-kit/internal/renderDoc"
 * console.log(JSON.stringify(trimLine([{ text: "Ready  " }, { text: " " }]))) // [{"text":"Ready"}]
 * ```
 *
 * @category formatting
 * @since 0.0.0
 */
export const trimLine = (line: Line): Line => {
  const out = [...line];
  while (out.length > 0) {
    const last = A.getUnsafe(out, out.length - 1);
    if (last.hold === true) break;
    const trimmed = Str.trimEnd(last.text);
    if (trimmed === "") {
      out.pop();
      continue;
    }
    if (trimmed !== last.text) out[out.length - 1] = { ...last, text: trimmed };
    break;
  }
  return out;
};

const oneLine = (spans: ReadonlyArray<Span>): ReadonlyArray<Span> =>
  A.map(spans, (s) => ({ ...s, text: Str.replace(/\r\n|\r|\n/g, " ")(s.text) }));

/** Give every span without a token of its own this one. */
const toned: {
  (spans: ReadonlyArray<Span>, token: Tone): ReadonlyArray<Span>;
  (token: Tone): (spans: ReadonlyArray<Span>) => ReadonlyArray<Span>;
} = dual(
  2,
  (spans: ReadonlyArray<Span>, token: Tone): ReadonlyArray<Span> =>
    A.map(spans, (s) => (s.token === undefined ? { ...s, token } : s))
);

const sliceSpans: {
  (spans: ReadonlyArray<Span>, end: number): ReadonlyArray<Span>;
  (end: number): (spans: ReadonlyArray<Span>) => ReadonlyArray<Span>;
} = dual(2, (spans: ReadonlyArray<Span>, end: number): ReadonlyArray<Span> => {
  const out: Array<Span> = [];
  let left = end;
  for (const s of spans) {
    if (left <= 0) break;
    out.push(s.text.length <= left ? s : { ...s, text: Str.slice(0, left)(s.text) });
    left -= s.text.length;
  }
  return out;
});

/**
 * The lines of a raw text, sanitized, without the empty line a trailing break would add.
 *
 * **Example** (Drop the trailing empty line)
 *
 * ```ts
 * import { textLines } from "@beep/cli-kit/internal/renderDoc"
 * console.log(JSON.stringify(textLines("first\nsecond\n"))) // ["first","second"]
 * ```
 *
 * @category parsing
 * @since 0.0.0
 */
export const textLines = (text: string): ReadonlyArray<string> => {
  const lines = Str.split(sanitize(text), /\r\n|\r|\n/);
  return lines.length > 1 && lines[lines.length - 1] === "" ? lines.slice(0, -1) : lines;
};

/** Join chunks with a separator, skipping empty ones. */
const joinChunks: {
  (chunks: ReadonlyArray<ReadonlyArray<Span>>, separator: string): Line;
  (separator: string): (chunks: ReadonlyArray<ReadonlyArray<Span>>) => Line;
} = dual(
  2,
  (chunks: ReadonlyArray<ReadonlyArray<Span>>, separator: string): Line =>
    pipe(
      chunks,
      A.filter((chunk) => chunk.length > 0),
      A.flatMap((chunk, index) => (index === 0 ? chunk : [span(separator), ...chunk]))
    )
);

/** Join table cells with a separator, keeping an empty one: a column that is empty in every row still takes its place. */
const joinCells: {
  (cells: ReadonlyArray<ReadonlyArray<Span>>, separator: string): Line;
  (separator: string): (cells: ReadonlyArray<ReadonlyArray<Span>>) => Line;
} = dual(
  2,
  (cells: ReadonlyArray<ReadonlyArray<Span>>, separator: string): Line =>
    A.flatMap(cells, (cell, index) => (index === 0 ? cell : [span(separator), ...cell]))
);

const blank = (width: number): Span => span(Str.repeat(width)(" "));

type Align = "left" | "right" | "center";

const pad: {
  (spans: ReadonlyArray<Span>, width: number, align: Align): Line;
  (width: number, align: Align): (spans: ReadonlyArray<Span>) => Line;
} = dual(3, (spans: ReadonlyArray<Span>, width: number, align: Align): Line => {
  const gap = Math.max(0, width - widthOf(spans));
  const before = align === "right" ? gap : align === "center" ? Math.floor(gap / 2) : 0;
  const after = gap - before;
  return [...(before > 0 ? [blank(before)] : []), ...spans, ...(after > 0 ? [blank(after)] : [])];
});

/** Put `first` before the first line and `rest` before the others. */
const hang: {
  (lines: ReadonlyArray<Line>, first: Line, rest: Line): ReadonlyArray<Line>;
  (first: Line, rest: Line): (lines: ReadonlyArray<Line>) => ReadonlyArray<Line>;
} = dual(
  3,
  (lines: ReadonlyArray<Line>, first: Line, rest: Line): ReadonlyArray<Line> =>
    lines.length === 0
      ? [trimLine(first)]
      : A.map(lines, (line, index) => trimLine([...(index === 0 ? first : rest), ...line]))
);

/**
 * A cap as a whole number of at least zero, or `undefined` for none.
 *
 * **Example** (Normalize a row cap)
 *
 * ```ts
 * import { capOf } from "@beep/cli-kit/internal/renderDoc"
 * console.log(capOf(2.9)) // 2
 * console.log(capOf(-1)) // 0
 * console.log(capOf(undefined)) // undefined
 * ```
 *
 * @category normalization
 * @since 0.0.0
 */
export const capOf = (cap: number | undefined): number | undefined =>
  cap === undefined || Number.isNaN(cap) ? undefined : Math.max(0, Math.floor(cap));

const shrink: {
  (widths: Array<number>, limit: number): void;
  (limit: number): (widths: Array<number>) => void;
} = dual(2, (widths: Array<number>, limit: number): void => {
  const gaps = 2 * Math.max(0, widths.length - 1);
  const total = (): number => A.reduce(widths, 0, (sum, w) => sum + w) + gaps;
  while (total() > limit) {
    let widest = 0;
    for (let i = 1; i < widths.length; i++) if (A.getUnsafe(widths, i) > A.getUnsafe(widths, widest)) widest = i;
    if (A.getUnsafe(widths, widest) <= 1) return;
    widths[widest] = A.getUnsafe(widths, widest) - 1;
  }
});

const callouts = {
  note: "info",
  tip: "success",
  important: "accent",
  warning: "warning",
  caution: "error",
} as const satisfies Record<string, TokenName>;

interface Walk {
  readonly ctx: RenderContext;
  readonly flavour: Flavour;
}

const inline: {
  (walk: Walk, inlines: ReadonlyArray<Inline>): ReadonlyArray<Span>;
  (inlines: ReadonlyArray<Inline>): (walk: Walk) => ReadonlyArray<Span>;
} = dual(
  2,
  (walk: Walk, inlines: ReadonlyArray<Inline>): ReadonlyArray<Span> => walk.flavour.inline(inlines, walk.ctx)
);

type Overflow = ((hidden: number) => ReadonlyArray<Inline>) | undefined;

const overflowLine: {
  (walk: Walk, overflow: Overflow, hidden: number): Line;
  (overflow: Overflow, hidden: number): (walk: Walk) => Line;
} = dual(
  3,
  (walk: Walk, overflow: Overflow, hidden: number): Line =>
    toned(
      overflow === undefined
        ? [span(`${walk.ctx.glyphs.ellipsis} ${hidden} more`)]
        : oneLine(inline(walk, overflow(hidden))),
      "muted"
    )
);

/** A table cell is one line: a line break is width 0 to a measure but breaks the row, so a cell keeps its first line. */
const cellOf: {
  (walk: Walk, inlines: ReadonlyArray<Inline> | undefined): Line;
  (inlines: ReadonlyArray<Inline> | undefined): (walk: Walk) => Line;
} = dual(2, (walk: Walk, inlines: ReadonlyArray<Inline> | undefined): Line => {
  if (inlines === undefined) return [];
  const spans = inline(walk, inlines);
  const text = textOf(spans);
  // Trailing line breaks are not content. A loop, not `/(?:\r\n|\r|\n)+$/`, which backtracks exponentially on a
  // CRLF run followed by more text, since it can read each CRLF as one break or two.
  let end = text.length;
  while (end > 0 && (text[end - 1] === "\n" || text[end - 1] === "\r")) end--;
  const joined = Str.slice(0, end)(text);
  return O.match(Str.search(joined, /\r\n|\r|\n/), {
    onNone: () => sliceSpans(spans, joined.length),
    onSome: (at) => [...sliceSpans(spans, at), span(walk.ctx.glyphs.ellipsis, "muted")],
  });
});

/**
 * The columns and capped row window shared by text and Markdown tables.
 * @category formatting
 * @since 0.0.0
 */
export const tableWindow = (block: Extract<Block, { readonly _tag: "Table" }>) => {
  const columns = Math.max(block.columns.length, ...A.map(block.rows, (row) => row.length));
  const cap = capOf(block.cap);
  const shown = cap === undefined ? block.rows : A.take(block.rows, cap);
  return { columns, shown, hidden: block.rows.length - shown.length };
};

/**
 * A capped text window with its omitted line count.
 * @category formatting
 * @since 0.0.0
 */
export const textWindow: {
  (text: string, cap: number | undefined): { readonly shown: ReadonlyArray<string>; readonly hidden: number };
  (cap: number | undefined): (text: string) => { readonly shown: ReadonlyArray<string>; readonly hidden: number };
} = dual(2, (text: string, cap: number | undefined) => {
  const lines = textLines(text);
  const shown = cap === undefined ? lines : A.take(lines, cap);
  return { shown, hidden: lines.length - shown.length };
});

type TableBlock = Extract<Block, { readonly _tag: "Table" }>;
type TreeBlock = Extract<Block, { readonly _tag: "Tree" }>;
type CountsBlock = Extract<Block, { readonly _tag: "Counts" }>;

const tableLines: {
  (walk: Walk, block: TableBlock, width: number): ReadonlyArray<Line>;
  (block: TableBlock, width: number): (walk: Walk) => ReadonlyArray<Line>;
} = dual(3, (walk: Walk, block: TableBlock, width: number): ReadonlyArray<Line> => {
  const { columns, shown, hidden } = tableWindow(block);
  if (columns === 0) return [];
  const header = A.makeBy(columns, (index) => toned(cellOf(walk, block.columns[index]?.header), "emphasis"));
  const body = A.map(shown, (row) => A.makeBy(columns, (index) => cellOf(walk, row[index])));
  const showHeader = A.some(header, (cell) => cell.length > 0);
  // No header text and no row shown, such as a counts table over zero projects: nothing to draw but the overflow line.
  if (!showHeader && body.length === 0) return hidden > 0 ? [overflowLine(walk, block.overflow, hidden)] : [];

  const widths = A.makeBy(columns, (index) =>
    Math.max(0, ...A.map([...(showHeader ? [header] : []), ...body], (row) => widthOf(A.getUnsafe(row, index))))
  );
  shrink(widths, width);

  const render = (row: ReadonlyArray<Line>, separator: string): Line =>
    trimLine(
      joinCells(
        A.map(row, (cell, index) => {
          const columnWidth = A.getUnsafe(widths, index);
          const cut = widthOf(cell) > columnWidth ? truncateSpans(cell, columnWidth, walk.ctx.glyphs.ellipsis) : cell;
          return pad(cut, columnWidth, block.columns[index]?.align ?? "left");
        }),
        separator
      )
    );
  const rule: Line = joinCells(
    A.map(widths, (w) => [span(Str.repeat(w)("-"), "muted")]),
    "  "
  );

  const pipeTable = (): ReadonlyArray<Line> => {
    // Istanbul's shape: each cell padded and joined with " | ", and a rule of dashes meeting at "|" above and
    // below the header and at the end.
    // The first column's rule has the cell and the space after it; every other has a space on each side.
    const pipeRule: Line = [
      span(
        pipe(
          widths,
          A.map((w, index) => Str.repeat(w + (index === 0 ? 1 : 2))("-")),
          A.join("|")
        ),
        "muted"
      ),
    ];
    const pipeRow = (row: ReadonlyArray<Line>): Line => render(row, " | ");
    const piped = [...(showHeader ? [pipeRule, pipeRow(header)] : []), pipeRule, ...A.map(body, pipeRow), pipeRule];
    return hidden > 0 ? [...piped, overflowLine(walk, block.overflow, hidden)] : piped;
  };

  if (block.style === "pipe") {
    return pipeTable();
  }
  const lines = [...(showHeader ? [render(header, "  "), rule] : []), ...A.map(body, (row) => render(row, "  "))];
  return hidden > 0 ? [...lines, overflowLine(walk, block.overflow, hidden)] : lines;
});

const treeLines: {
  (walk: Walk, block: TreeBlock): ReadonlyArray<Line>;
  (block: TreeBlock): (walk: Walk) => ReadonlyArray<Line>;
} = dual(2, (walk: Walk, block: TreeBlock): ReadonlyArray<Line> => {
  const glyphs = walk.ctx.glyphs.tree;
  const lines: Array<Line> = [trimLine(oneLine(inline(walk, block.root.label)))];
  type Children = typeof block.root.children;
  const visit: {
    (children: Children, prefix: string): void;
    (prefix: string): (children: Children) => void;
  } = dual(2, (children: Children, prefix: string): void => {
    A.forEach(children, (child, index) => {
      const last = index === children.length - 1;
      lines.push(
        trimLine([span(prefix + (last ? glyphs.last : glyphs.branch), "muted"), ...oneLine(inline(walk, child.label))])
      );
      visit(child.children, prefix + (last ? glyphs.blank : glyphs.pipe));
    });
  });
  visit(block.root.children, "");
  return lines;
});

const diffSide: {
  (walk: Walk, marker: string, token: Tone, text: string, cap: number | undefined): ReadonlyArray<Line>;
  (marker: string, token: Tone, text: string, cap: number | undefined): (walk: Walk) => ReadonlyArray<Line>;
} = dual(5, (walk: Walk, marker: string, token: Tone, text: string, cap: number | undefined): ReadonlyArray<Line> => {
  const { shown, hidden } = textWindow(text, cap);
  return [
    ...A.map(shown, (line) => trimLine([span(`${marker} ${line}`, token)])),
    ...(hidden > 0 ? [[span(`  ${walk.ctx.glyphs.ellipsis} ${hidden} more lines`, "muted")]] : []),
  ];
});

type KeptPaint = "all" | "glyph" | "none" | undefined;

/** What a `Counts` block's `paint` keeps: every token, only a status glyph's, or none. */
const keepPaint: {
  (paint: KeptPaint, lines: ReadonlyArray<Line>): ReadonlyArray<Line>;
  (lines: ReadonlyArray<Line>): (paint: KeptPaint) => ReadonlyArray<Line>;
} = dual(2, (paint: KeptPaint, lines: ReadonlyArray<Line>): ReadonlyArray<Line> => {
  if (paint === undefined || paint === "all") return lines;
  const unpainted = (s: Span): Span => {
    const { token: _token, ...rest } = s;
    return rest;
  };
  return A.map(lines, (line) => A.map(line, (s) => (paint === "glyph" && s.glyph === true ? s : unpainted(s))));
});

/**
 * An annotation is only `githubLog`'s; every other renderer skips it, without leaving a gap where it stood.
 *
 * **Example** (Recognize a workflow annotation)
 *
 * ```ts
 * import { isAnnotation } from "@beep/cli-kit/internal/renderDoc"
 * import { Doc } from "@beep/cli-kit/Doc"
 * console.log(isAnnotation(Doc.annotation({ level: "warning" }, "Check this"))) // true
 * console.log(isAnnotation(Doc.paragraph("Ready"))) // false
 * ```
 *
 * @category predicates
 * @since 0.0.0
 */
export const isAnnotation = (block: Block): boolean => block._tag === "Annotation";

const countsLines: {
  (walk: Walk, block: CountsBlock): ReadonlyArray<Line>;
  (block: CountsBlock): (walk: Walk) => ReadonlyArray<Line>;
} = dual(2, (walk: Walk, block: CountsBlock): ReadonlyArray<Line> => keepPaint(block.paint, countsLayout(walk, block)));

const countsColumns = (
  visible: ReturnType<typeof visibleCountersOf>,
  nameOf: (counter: ReturnType<typeof visibleCountersOf>[number]) => string,
  label: Line,
  qualifier: Line,
  duration: string,
  suffix: Line
): ReadonlyArray<Line> => {
  const labelWidth = Math.max(0, ...A.map(visible, (counter) => widthOf([span(nameOf(counter))])));
  const numberWidth = Math.max(0, ...A.map(visible, (counter) => String(counter.n).length));
  return [
    ...(label.length === 0 ? [] : [label]),
    ...A.map(visible, (counter) =>
      trimLine([
        ...pad([span(nameOf(counter), counter.status.def.token)], labelWidth, "left"),
        span("  "),
        ...pad([span(String(counter.n), counter.status.def.token)], numberWidth, "right"),
      ])
    ),
    ...(qualifier.length === 0 ? [] : [qualifier]),
    ...(duration === "" ? [] : [[span(duration, "muted")]]),
    ...(suffix.length === 0 ? [] : [suffix]),
  ];
};

const countsPart = (walk: Walk, value: ReadonlyArray<Inline> | undefined, tone: Tone): Line =>
  value === undefined ? [] : toned(oneLine(inline(walk, value)), tone);

const countsLayout: {
  (walk: Walk, block: CountsBlock): ReadonlyArray<Line>;
  (block: CountsBlock): (walk: Walk) => ReadonlyArray<Line>;
} = dual(2, (walk: Walk, block: CountsBlock): ReadonlyArray<Line> => {
  const visible = visibleCountersOf(block);
  const total = totalOf(block);
  const label = countsPart(walk, block.label, "emphasis");
  const qualifier = countsPart(walk, block.qualifier, "muted");
  const duration = block.durationMs === undefined ? "" : Fmt.duration(block.durationMs);
  const suffix = countsPart(walk, block.suffix, "muted");
  // A counter's label is one line, like the block's own label: a line break in it would start a line of its own.
  type Counter = (typeof visible)[number];
  const nameOf: {
    (counter: Counter, count?: number): string;
    (count?: number): (counter: Counter) => string;
  } = dual(
    (args) => P.isObjectKeyword(args[0]),
    (counter: Counter, count?: number): string =>
      Str.replace(/\r\n|\r|\n/g, " ")(sanitize(counterLabel(counter, count)))
  );
  // The first counter is the headline: it shows its share of the total, and its label reads by that total
  // ("1/3 repos", not "1/3 repo"), as the noun counts the denominator.
  const counters = A.map(visible, (counter, index): Line => {
    const share = index === 0 && block.share !== false;
    const name = nameOf(counter, share ? total : counter.n);
    return [span(share ? `${counter.n}/${total} ${name}` : `${counter.n} ${name}`, counter.status.def.token)];
  });

  if (block.layout === "row") {
    return [
      trimLine(
        joinChunks([label, ...counters, qualifier, duration === "" ? [] : [span(duration, "muted")], suffix], "  ")
      ),
    ];
  }
  if (block.layout === "columns") {
    return countsColumns(visible, nameOf, label, qualifier, duration, suffix);
  }
  const head = label.length === 0 ? [] : [...label, span(":")];
  const tally = joinChunks(counters, ", ");
  return [
    trimLine(
      joinChunks(
        [joinChunks([head, tally], " "), qualifier, duration === "" ? [] : [span(`(${duration})`, "muted")], suffix],
        " "
      )
    ),
  ];
});

/**
 * A block as lines. `compact` is set on a compact list's item: a section there joins its title and children with no
 * blank lines between them.
 */
const blockLines: {
  (walk: Walk, block: Block, width: number, compact?: boolean): ReadonlyArray<Line>;
  (block: Block, width: number, compact?: boolean): (walk: Walk) => ReadonlyArray<Line>;
} = dual(
  (args) => P.hasProperty(args[0], "flavour"),
  (walk: Walk, block: Block, width: number, compact?: boolean): ReadonlyArray<Line> =>
    Match.valueTags(block, {
      Heading: (block): ReadonlyArray<Line> => [trimLine(toned(oneLine(inline(walk, block.content)), "emphasis"))],
      Paragraph: (block): ReadonlyArray<Line> => {
        const spans = inline(walk, block.content);
        if (spans.length === 0) return [[]];
        return A.map(wrapSpans(spans, width, { hardBreak: false }), trimLine);
      },
      List: (block): ReadonlyArray<Line> => {
        const cap = capOf(block.cap);
        const items = A.filter(block.items, (item) => !isAnnotation(item));
        const shown = cap === undefined ? items : items.slice(0, cap);
        const compactItems = block.compact === true;
        const lines = A.flatMap(shown, (item) =>
          A.map(hang(blockLines(walk, item, width - 2, compactItems), [span("- ")], [span("  ")]), (line, index) =>
            // A compact item has no separator lines, so a blank line is the content's own (a diff's): it keeps the
            // indent, held against trimming, so the item stays one indented block.
            compactItems && index > 0 && line.length === 0 ? [{ text: "  ", hold: true as const }] : line
          )
        );
        const hidden = items.length - shown.length;
        return hidden > 0 ? [...lines, overflowLine(walk, block.overflow, hidden)] : lines;
      },
      Table: (block): ReadonlyArray<Line> => tableLines(walk, block, width),
      Tree: (block): ReadonlyArray<Line> => treeLines(walk, block),
      Collapsible: (block): ReadonlyArray<Line> => [
        trimLine(toned(oneLine(inline(walk, block.title)), "emphasis")),
        ...pipe(
          block.body,
          A.flatMap((child) => blockLines(walk, child, width - 2)),
          A.map((line) => trimLine([span("  "), ...line]))
        ),
      ],
      Callout: (block): ReadonlyArray<Line> => {
        const label = `${Str.toUpperCase(block.kind)}:`;
        const hanging = label.length + 1;
        const body = A.flatMap(block.body, (child) => blockLines(walk, child, width - hanging));
        const head = span(label, callouts[block.kind]);
        return body.length === 0 ? [[head]] : hang(body, [head, span(" ")], [blank(hanging)]);
      },
      CodeBlock: (block): ReadonlyArray<Line> =>
        A.map(textLines(block.text), (line) => trimLine([span(`    ${line}`)])),
      Diff: (block): ReadonlyArray<Line> => {
        const cap = capOf(block.cap);
        return [
          ...diffSide(walk, "-", "failure", block.expected, cap),
          ...diffSide(walk, "+", "success", block.received, cap),
        ];
      },
      Section: (block): ReadonlyArray<Line> => {
        const groups: Array<ReadonlyArray<Line>> = [
          ...(block.title === undefined ? [] : [[trimLine(toned(oneLine(inline(walk, block.title)), "emphasis"))]]),
          ...pipe(
            block.children,
            A.filter((child) => !isAnnotation(child)),
            A.map((child) => blockLines(walk, child, width))
          ),
        ];
        return A.flatMap(groups, (group, index) => (index === 0 || compact === true ? group : [[], ...group]));
      },
      Counts: (block): ReadonlyArray<Line> => countsLines(walk, block),
      Verbatim: (block): ReadonlyArray<Line> => {
        // Kept exactly: sanitized line by line, indented, and never wrapped or cut.
        const indent = Str.repeat(Math.max(0, Math.floor(block.indent ?? 0)))(" ");
        return A.map(textLines(block.text), (line) => [{ text: `${indent}${line}`, hold: true }]);
      },
      Annotation: (): ReadonlyArray<Line> => [],
      CountsTable: (block): ReadonlyArray<Line> => tableLines(walk, countsTableOf(block), width),
      Lines: (block): ReadonlyArray<Line> =>
        A.flatMap(block.lines, (entry): ReadonlyArray<Line> => {
          const spans = inline(walk, entry);
          return spans.length === 0 ? [[]] : A.map(wrapSpans(spans, width, { hardBreak: false }), trimLine);
        }),
      Line: (block): ReadonlyArray<Line> => {
        const spans = oneLine(inline(walk, block.content));
        if (block.truncate === true) return [trimLine(truncateSpans(spans, width, walk.ctx.glyphs.ellipsis))];
        // Kept atomic: one line whatever the width, so a finding stays greppable.
        if (block.wrap === false) return [trimLine(spans)];
        return spans.length === 0 ? [[]] : A.map(wrapSpans(spans, width, { hardBreak: false }), trimLine);
      },
      DiffText: (block): ReadonlyArray<Line> => {
        const cap = capOf(block.cap);
        const lines = textLines(block.text);
        const shown = cap === undefined ? lines : lines.slice(0, cap);
        const hidden = lines.length - shown.length;
        const tone = (line: string): Tone | undefined =>
          Str.startsWith("+")(line) ? "success" : Str.startsWith("-")(line) ? "failure" : undefined;
        const cut = (spans: Line): Line =>
          block.truncate === true ? truncateSpans(spans, width, walk.ctx.glyphs.ellipsis) : spans;
        return [
          ...A.map(shown, (line) => trimLine(cut([span(line, tone(line))]))),
          ...(hidden > 0 ? [[span(`${walk.ctx.glyphs.ellipsis} ${hidden} more lines`, "muted")]] : []),
        ];
      },
    })
);

/**
 * Render a document to its finished lines in the given flavour: a block that draws nothing contributes no line, where
 * the joined string could not tell it from one empty line.
 *
 * **Example** (Finish a paragraph with a plain flavour)
 *
 * ```ts
 * import { renderDocLines, type Flavour, type Line } from "@beep/cli-kit/internal/renderDoc"
 * import type { RenderContext } from "@beep/cli-kit/Render"
 * import { dual } from "effect/Function"
 * import { plainInline } from "@beep/cli-kit/internal/renderPlain"
 * import { Doc } from "@beep/cli-kit/Doc"
 * import { Render } from "@beep/cli-kit/Render"
 * const ctx = Render.contextOf({ audience: "human", color: "none" })
 * const flavour: Flavour = {
 *   inline: plainInline,
 *   finish: dual(2, (line: Line, _ctx: RenderContext): string => line.map((span) => span.text).join("")),
 * }
 * console.log(JSON.stringify(renderDocLines([Doc.paragraph("Ready")], ctx, flavour))) // ["Ready"]
 * ```
 *
 * @internal
 * @category formatting
 * @since 0.0.0
 */
export const renderDocLines: {
  (ctx: RenderContext, flavour: Flavour): (doc: Document) => ReadonlyArray<string>;
  (doc: Document, ctx: RenderContext, flavour: Flavour): ReadonlyArray<string>;
} = dual(3, (doc: Document, ctx: RenderContext, flavour: Flavour): ReadonlyArray<string> => {
  const width = Number.isNaN(ctx.width) ? 80 : Math.max(1, ctx.width);
  const walk: Walk = { ctx, flavour };
  return pipe(
    doc,
    A.flatMap((block) => blockLines(walk, block, width)),
    A.map((line) => flavour.finish(trimLine(line), ctx))
  );
});

/**
 * Render a document to lines of text in the given flavour.
 *
 * **Example** (Finish a paragraph with a plain flavour)
 *
 * ```ts
 * import { renderDoc, type Flavour, type Line } from "@beep/cli-kit/internal/renderDoc"
 * import type { RenderContext } from "@beep/cli-kit/Render"
 * import { dual } from "effect/Function"
 * import { plainInline } from "@beep/cli-kit/internal/renderPlain"
 * import { Doc } from "@beep/cli-kit/Doc"
 * import { Render } from "@beep/cli-kit/Render"
 * const ctx = Render.contextOf({ audience: "human", color: "none" })
 * const flavour: Flavour = {
 *   inline: plainInline,
 *   finish: dual(2, (line: Line, _ctx: RenderContext): string => line.map((span) => span.text).join("")),
 * }
 * console.log(renderDoc([Doc.paragraph("Ready")], ctx, flavour)) // Ready
 * ```
 *
 * @internal
 * @category formatting
 * @since 0.0.0
 */
export const renderDoc: {
  (ctx: RenderContext, flavour: Flavour): (doc: Document) => string;
  (doc: Document, ctx: RenderContext, flavour: Flavour): string;
} = dual(3, (doc: Document, ctx: RenderContext, flavour: Flavour): string =>
  A.join(renderDocLines(doc, ctx, flavour), "\n")
);
