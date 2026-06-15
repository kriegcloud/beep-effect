/**
 * Mermaid diagram renderer shared by persisted editor and streaming chat
 * surfaces.
 *
 * @packageDocumentation \@beep/editor/mermaid-view
 * @since 0.0.0
 */
"use client";

import { useEffect, useId, useMemo, useState } from "react";
import type { JSX } from "react";

type MermaidRenderState =
  | { readonly _tag: "pending" }
  | { readonly _tag: "ok"; readonly svg: string }
  | { readonly _tag: "failed"; readonly message: string };

const pendingState: MermaidRenderState = { _tag: "pending" };

const fallbackErrorMessage = "Unable to render diagram.";

const hashString = (value: string): string => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = Math.imul(31, hash) + value.charCodeAt(index);
  }
  return (hash >>> 0).toString(36);
};

const sanitizeIdPart = (value: string): string => {
  const sanitized = value.replace(/[^a-zA-Z0-9_-]/gu, "-");
  return sanitized.length === 0 ? "diagram" : sanitized;
};

const errorMessage = (error: unknown): string => (error instanceof Error ? error.message : fallbackErrorMessage);

/**
 * Renders Mermaid source to SVG and falls back to source text on render
 * failure.
 *
 * @example
 * ```tsx
 * import { MermaidView } from "@beep/editor/mermaid-view"
 *
 * console.log(MermaidView.name) // "MermaidView"
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export function MermaidView({
  source,
  renderKey,
}: {
  readonly source: string;
  readonly renderKey: string;
}): JSX.Element {
  const reactId = useId();
  const renderId = useMemo(
    () => `mermaid-${sanitizeIdPart(reactId)}-${sanitizeIdPart(renderKey)}-${hashString(source)}`,
    [reactId, renderKey, source]
  );
  const [state, setState] = useState<MermaidRenderState>(pendingState);

  useEffect(() => {
    let active = true;
    setState(pendingState);

    void import("mermaid")
      .then(({ default: mermaid }) => {
        mermaid.initialize({ startOnLoad: false, securityLevel: "strict" });
        return mermaid.render(renderId, source);
      })
      .then((rendered) => {
        if (active) {
          setState({ _tag: "ok", svg: rendered.svg });
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setState({ _tag: "failed", message: errorMessage(error) });
        }
      });

    return () => {
      active = false;
    };
  }, [renderId, source]);

  if (state._tag === "ok") {
    return (
      <div
        className="my-3 overflow-x-auto rounded border bg-background p-3"
        data-testid="mermaid-diagram"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Mermaid renders diagrams as SVG markup; securityLevel strict is set at render time.
        dangerouslySetInnerHTML={{ __html: state.svg }}
      />
    );
  }

  if (state._tag === "failed") {
    return (
      <div className="my-3 rounded border border-destructive/40 bg-muted p-3" data-testid="mermaid-diagram">
        <div className="mb-2 text-xs text-muted-foreground">{state.message}</div>
        <pre className="overflow-x-auto rounded bg-background p-3 text-sm">
          <code>{source}</code>
        </pre>
      </div>
    );
  }

  return (
    <div className="my-3 rounded border bg-muted p-3 text-sm text-muted-foreground" data-testid="mermaid-diagram">
      Rendering diagram...
    </div>
  );
}
