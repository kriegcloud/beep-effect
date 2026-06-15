/**
 * Lightweight renderer for the in-flight assistant turn.
 *
 * Renders a `ReadonlyArray<AssistantBlock>` directly to DOM — no Lexical,
 * no schema decode — so blocks paint as each one finishes streaming. Trimmed to
 * the assistant block vocabulary (paragraph, heading, quote, list, code,
 * table, youtube) and inline vocabulary (styled text, link) defined by
 * `@beep/agents-domain`'s {@link AssistantBlock}.
 *
 * @packageDocumentation
 * @category components
 * @since 0.0.0
 */
"use client";

import { AssistantBlock, InlineNode } from "@beep/agents-domain/values/AssistantContent";
import { MermaidView, YouTubeEmbed } from "@beep/editor";
import { A } from "@beep/utils";
import type { TableBlock } from "@beep/agents-domain/values/AssistantContent";
import type { JSX, ReactNode } from "react";

const stableOccurrenceKey = <Item,>(
  items: ReadonlyArray<Item>,
  item: Item,
  index: number,
  renderKey: (item: Item) => string
): string => {
  const baseKey = renderKey(item);
  const occurrence = A.length(A.filter(A.take(items, index), (candidate) => renderKey(candidate) === baseKey));
  return occurrence === 0 ? baseKey : `${baseKey}#${occurrence}`;
};

const inlineRenderKey = (node: InlineNode): string =>
  InlineNode.match(node, {
    text: (t) =>
      `text:${t.text}:${t.bold === true ? "b" : ""}:${t.italic === true ? "i" : ""}:${t.code === true ? "c" : ""}`,
    link: (l) => `link:${l.url}:${l.text}`,
  });

const inlinesRenderKey = (nodes: ReadonlyArray<InlineNode>): string => A.join(A.map(nodes, inlineRenderKey), "|");

const tableCellRenderKey = (cell: TableBlock["rows"][number]["cells"][number]): string =>
  `cell:${inlinesRenderKey(cell.children)}`;

const tableRowRenderKey = (row: TableBlock["rows"][number]): string =>
  `row:${A.join(A.map(row.cells, tableCellRenderKey), "|")}`;

const blockRenderKey = (block: AssistantBlock): string =>
  AssistantBlock.match(block, {
    paragraph: (b) => `paragraph:${inlinesRenderKey(b.children)}`,
    heading: (b) => `heading:${b.level}:${inlinesRenderKey(b.children)}`,
    quote: (b) => `quote:${inlinesRenderKey(b.children)}`,
    list: (b) =>
      `list:${b.listType}:${A.join(
        A.map(b.items, (item) => inlinesRenderKey(item.children)),
        "|"
      )}`,
    code: (b) => `code:${b.language ?? ""}:${b.code}`,
    table: (b) => `table:${b.headerRow === true ? "header" : "body"}:${A.join(A.map(b.rows, tableRowRenderKey), "|")}`,
    youtube: (b) => `youtube:${b.videoId}`,
  });

const Inline = ({ node }: { readonly node: InlineNode }): ReactNode =>
  InlineNode.match(node, {
    text: (t) => {
      let el: ReactNode = t.text;
      if (t.code === true) el = <code className="rounded bg-muted px-1 py-0.5 text-sm">{el}</code>;
      if (t.italic === true) el = <em>{el}</em>;
      if (t.bold === true) el = <strong>{el}</strong>;
      return el;
    },
    link: (l) => (
      <a className="text-primary underline" href={l.url} target="_blank" rel="noreferrer">
        {l.text}
      </a>
    ),
  });

const Inlines = ({ nodes }: { readonly nodes: ReadonlyArray<InlineNode> }): JSX.Element => (
  <>
    {A.map(nodes, (node, i) => (
      <Inline key={stableOccurrenceKey(nodes, node, i, inlineRenderKey)} node={node} />
    ))}
  </>
);

const TableRow = ({
  cells,
  header,
}: {
  readonly cells: TableBlock["rows"][number]["cells"];
  readonly header: boolean;
}): JSX.Element => (
  <tr className="border-b last:border-b-0">
    {A.map(cells, (cell, i) =>
      header ? (
        <th
          key={stableOccurrenceKey(cells, cell, i, tableCellRenderKey)}
          className="bg-muted px-3 py-2 text-left font-medium"
        >
          <Inlines nodes={cell.children} />
        </th>
      ) : (
        <td key={stableOccurrenceKey(cells, cell, i, tableCellRenderKey)} className="px-3 py-2 align-top">
          <Inlines nodes={cell.children} />
        </td>
      )
    )}
  </tr>
);

const Table = ({ block }: { readonly block: TableBlock }): JSX.Element => {
  const hasHeader = block.headerRow === true;
  const headerRow = hasHeader ? block.rows[0] : undefined;
  const bodyRows = hasHeader ? A.drop(block.rows, 1) : block.rows;

  return (
    <div className="my-3 overflow-x-auto">
      <table className="w-full border-collapse overflow-hidden rounded border text-sm">
        {headerRow === undefined ? null : (
          <thead>
            <TableRow cells={headerRow.cells} header={true} />
          </thead>
        )}
        <tbody>
          {A.map(bodyRows, (row, i) => (
            <TableRow key={stableOccurrenceKey(bodyRows, row, i, tableRowRenderKey)} cells={row.cells} header={false} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Block = ({ block, renderKey }: { readonly block: AssistantBlock; readonly renderKey: string }): ReactNode =>
  AssistantBlock.match(block, {
    paragraph: (b) => (
      <p className="my-2 leading-relaxed">
        <Inlines nodes={b.children} />
      </p>
    ),
    heading: (b) => {
      const Tag = b.level;
      return (
        <Tag className="my-2 font-semibold">
          <Inlines nodes={b.children} />
        </Tag>
      );
    },
    quote: (b) => (
      <blockquote className="my-2 border-l-2 border-border pl-3 text-muted-foreground">
        <Inlines nodes={b.children} />
      </blockquote>
    ),
    list: (b) => {
      const items = A.map(b.items, (item, i) => (
        <li key={stableOccurrenceKey(b.items, item, i, (value) => inlinesRenderKey(value.children))} className="ml-4">
          <Inlines nodes={item.children} />
        </li>
      ));
      return b.listType === "number" ? (
        <ol className="my-2 list-decimal pl-4">{items}</ol>
      ) : (
        <ul className="my-2 list-disc pl-4">{items}</ul>
      );
    },
    code: (b) =>
      b.language === "mermaid" ? (
        <MermaidView renderKey={`stream:${renderKey}`} source={b.code} />
      ) : (
        <pre className="my-2 overflow-x-auto rounded bg-muted p-3 text-sm">
          <code>{b.code}</code>
        </pre>
      ),
    table: (b) => <Table block={b} />,
    youtube: (b) => <YouTubeEmbed videoID={b.videoId} />,
  });

/**
 * Renders the in-flight streamed assistant turn's blocks.
 *
 * @example
 * ```tsx
 * import { StreamingBlocks } from "@/chat/ui/StreamingBlocks"
 *
 * console.log(StreamingBlocks.name) // "StreamingBlocks"
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export function StreamingBlocks({ blocks }: { readonly blocks: ReadonlyArray<AssistantBlock> }): JSX.Element {
  const keyedBlocks = A.map(blocks, (block, i) => ({
    block,
    renderKey: stableOccurrenceKey(blocks, block, i, blockRenderKey),
  }));

  return (
    <div className="text-sm">
      {A.map(keyedBlocks, ({ block, renderKey }) => (
        <Block key={renderKey} block={block} renderKey={renderKey} />
      ))}
    </div>
  );
}
