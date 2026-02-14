"use client";

/**
 * Canonical LexicalEditor component for the beep-effect monorepo.
 *
 * Uses defineExtension + LexicalExtensionComposer (newer Lexical API).
 * Mounts 16 email-compose plugins + 6 built-in plugins with 10 email-compose nodes.
 * Supports fullscreen toggle, markdown serialization, and a clean props API.
 */
import { $convertFromMarkdownString, $convertToMarkdownString } from "@lexical/markdown";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalExtensionComposer } from "@lexical/react/LexicalExtensionComposer";
import { defineExtension } from "lexical";
import type { JSX, MutableRefObject, ReactNode, ReactPortal } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { SharedHistoryContext } from "./context/SharedHistoryContext";
import { ToolbarContextWrapper } from "./context/toolbar-context";
import { useMarkdownOnChange } from "./hooks/use-markdown-editor";
import { EMAIL_COMPOSE_NODES } from "./nodes/email-compose-nodes";
import { EmailComposePlugins } from "./plugins";
import { EMAIL_COMPOSE_TRANSFORMERS } from "./plugins/MarkdownTransformers";
import { editorTheme } from "./themes/editor-theme";

// ============================================================================
// Props
// ============================================================================

export interface LexicalEditorProps {
  /** Initial markdown content to populate the editor with. */
  readonly initialMarkdown?: string;
  /** Callback fired on every editor state change, with the current markdown. */
  readonly onChange?: (markdown: string) => void;
  /** Whether the fullscreen toggle is enabled. Defaults to true. */
  readonly fullscreenEnabled?: boolean;
  /** Additional CSS class for the outer wrapper. */
  readonly className?: string;
  /** Placeholder text shown when the editor is empty. */
  readonly placeholder?: string;
}

// ============================================================================
// Markdown onChange bridge (must be inside LexicalExtensionComposer)
// ============================================================================

function MarkdownBridge({ onChange }: { readonly onChange?: (markdown: string) => void }): null {
  useMarkdownOnChange(onChange);
  return null;
}

// ============================================================================
// Content tracker (keeps contentRef in sync with editor state)
// ============================================================================

function ContentTracker({ contentRef }: { readonly contentRef: MutableRefObject<string> }): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        contentRef.current = $convertToMarkdownString(EMAIL_COMPOSE_TRANSFORMERS);
      });
    });
  }, [editor, contentRef]);

  return null;
}

// ============================================================================
// Fullscreen wrapper
// ============================================================================

function FullscreenOverlay({ children }: { readonly children: ReactNode }): ReactPortal {
  return createPortal(
    <>
      <div className="lexical-editor-fullscreen-backdrop" />
      <div className="lexical-editor-fullscreen">{children}</div>
    </>,
    document.body
  );
}

// ============================================================================
// Main component
// ============================================================================

export function LexicalEditor({
  initialMarkdown,
  onChange,
  fullscreenEnabled = true,
  className,
  placeholder = "Write something...",
}: LexicalEditorProps): JSX.Element {
  const [fullscreen, setFullscreen] = useState(false);
  const [rerenderKey, setRerenderKey] = useState(0);

  // Ref that continuously tracks the latest markdown from the editor.
  // Used to restore content when the editor is re-mounted on fullscreen toggle.
  const contentRef = useRef(initialMarkdown ?? "");

  // Build $initialEditorState from the latest tracked content.
  // Depends on rerenderKey so a fresh closure is created after each toggle.
  const $initialEditorState = useMemo(() => {
    const md = contentRef.current;
    if (md === "") {
      return undefined;
    }
    return () => {
      $convertFromMarkdownString(md, EMAIL_COMPOSE_TRANSFORMERS);
    };
    // rerenderKey triggers a fresh $initialEditorState after fullscreen toggle
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rerenderKey]);

  // Define the Lexical extension
  const extension = useMemo(
    () =>
      defineExtension({
        $initialEditorState,
        name: "@beep/lexical-editor",
        namespace: "LexicalEditor",
        nodes: [...EMAIL_COMPOSE_NODES],
        theme: editorTheme,
      }),
    // rerenderKey forces a fresh extension after fullscreen toggle
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [$initialEditorState, rerenderKey]
  );

  // Fullscreen toggle handler - contentRef is always up to date.
  // Known limitation: Fullscreen toggle remounts the editor, which resets undo history.
  // Content is preserved via contentRef, but HistoryPlugin state is lost.
  const handleToggleFullscreen = useCallback(() => {
    if (!fullscreenEnabled) {
      return;
    }
    setFullscreen((prev) => !prev);
    setRerenderKey((prev) => prev + 1);
  }, [fullscreenEnabled]);

  // Escape key exits fullscreen
  const handleExitFullscreen = useCallback((event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setFullscreen(false);
      setRerenderKey((prev) => prev + 1);
    }
  }, []);

  // Register/unregister escape key listener and lock body scroll
  useEffect(() => {
    if (!fullscreen) {
      return;
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleExitFullscreen);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleExitFullscreen);
    };
  }, [fullscreen, handleExitFullscreen]);

  // Build the editor tree
  const editorTree = (
    <LexicalExtensionComposer key={rerenderKey} extension={extension} contentEditable={null}>
      <SharedHistoryContext>
        <ToolbarContextWrapper>
          <div className="editor-shell">
            <ContentTracker contentRef={contentRef} />
            <MarkdownBridge onChange={onChange} />
            <EmailComposePlugins
              placeholder={placeholder}
              onToggleFullscreen={handleToggleFullscreen}
              isFullscreen={fullscreen}
            />
          </div>
        </ToolbarContextWrapper>
      </SharedHistoryContext>
    </LexicalExtensionComposer>
  );

  // Wrap in fullscreen overlay when active
  if (fullscreen) {
    return (
      <div className={className}>
        <FullscreenOverlay>{editorTree}</FullscreenOverlay>
      </div>
    );
  }

  return <div className={`lexical-editor-wrapper ${className ?? ""}`}>{editorTree}</div>;
}
