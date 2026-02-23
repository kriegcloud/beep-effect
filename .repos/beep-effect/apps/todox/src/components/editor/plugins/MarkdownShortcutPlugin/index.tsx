"use client";

import type { Transformer } from "@lexical/markdown";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import type { JSX } from "react";

import { PLAYGROUND_TRANSFORMERS } from "../MarkdownTransformers";

export default function MarkdownPlugin({
  transformers = PLAYGROUND_TRANSFORMERS,
}: {
  readonly transformers?: ReadonlyArray<Transformer>;
}): JSX.Element {
  return <MarkdownShortcutPlugin transformers={transformers as Array<Transformer>} />;
}
