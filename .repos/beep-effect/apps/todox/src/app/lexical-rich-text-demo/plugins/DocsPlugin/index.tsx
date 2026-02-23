"use client";

import type { JSX } from "react";

export default function DocsPlugin(): JSX.Element {
  return (
    <a target="__blank" href="https://lexical.dev/docs/intro">
      <button type="button" id="docs-button" className="editor-dev-button" title="Lexical Docs" />
    </a>
  );
}
