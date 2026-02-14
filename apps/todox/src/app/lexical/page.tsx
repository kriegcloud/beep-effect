"use client";

import dynamic from "next/dynamic";
import "../../components/editor/themes/editor-theme.css";

// Dynamic import to avoid SSR issues with Lexical
// Lexical requires browser APIs and must be rendered client-side only
const PlaygroundApp = dynamic(() => import("../../components/editor/App"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="text-muted-foreground">Loading editor...</div>
    </div>
  ),
});

export default function LexicalPage() {
  // Force light mode for Lexical editor - it has its own light theme CSS
  return (
    <div className="lexical-editor-wrapper" data-theme="light">
      <PlaygroundApp />
    </div>
  );
}
