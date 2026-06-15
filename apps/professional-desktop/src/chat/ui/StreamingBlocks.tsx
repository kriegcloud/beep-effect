/**
 * Lightweight renderer for the in-flight assistant turn.
 *
 * Renders a `ReadonlyArray<Turn.AssistantBlock>` directly to DOM — no Lexical,
 * no schema decode — so blocks paint as each one finishes streaming. Trimmed to
 * the v1 block vocabulary (paragraph, heading, quote, list, code) and inline
 * vocabulary (styled text, link) defined by `@beep/agents-domain`'s
 * {@link Turn.AssistantBlock}.
 *
 * @packageDocumentation
 * @category components
 * @since 0.0.0
 */
"use client";

import { Turn } from "@beep/agents-domain";
import { A } from "@beep/utils";
import type { JSX, ReactNode } from "react";

const Inline = ({ node }: { readonly node: Turn.InlineNode }): ReactNode =>
  Turn.InlineNode.match(node, {
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

const Inlines = ({ nodes }: { readonly nodes: ReadonlyArray<Turn.InlineNode> }): JSX.Element => (
  <>
    {A.map(nodes, (node, i) => (
      <Inline key={i} node={node} />
    ))}
  </>
);

const Block = ({ block }: { readonly block: Turn.AssistantBlock }): ReactNode =>
  Turn.AssistantBlock.match(block, {
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
        <li key={i} className="ml-4">
          <Inlines nodes={item.children} />
        </li>
      ));
      return b.listType === "number" ? (
        <ol className="my-2 list-decimal pl-4">{items}</ol>
      ) : (
        <ul className="my-2 list-disc pl-4">{items}</ul>
      );
    },
    code: (b) => (
      <pre className="my-2 overflow-x-auto rounded bg-muted p-3 text-sm">
        <code>{b.code}</code>
      </pre>
    ),
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
export function StreamingBlocks({ blocks }: { readonly blocks: ReadonlyArray<Turn.AssistantBlock> }): JSX.Element {
  return (
    <div className="text-sm">
      {A.map(blocks, (block, i) => (
        <Block key={i} block={block} />
      ))}
    </div>
  );
}
