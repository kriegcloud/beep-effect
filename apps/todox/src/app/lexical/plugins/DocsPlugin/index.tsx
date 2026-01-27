"use client";

import type { JSX } from "react";

import * as React from "react";

export default function DocsPlugin(): JSX.Element {
  return (
    <a target="__blank" href="https://lexical.dev/docs/intro">
      <button id="docs-button" className="editor-dev-button" title="Lexical Docs" />
    </a>
  );
}
