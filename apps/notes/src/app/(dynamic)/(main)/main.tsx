"use client";

import { SearchCommand } from "@beep/notes/components/search/search-command";
import type { UnsafeTypes } from "@beep/types";
import { AIChatPlugin } from "@platejs/ai/react";
import { composeRefs, useEditorScrollRef, usePluginOption } from "platejs/react";

export function Main({ children }: { readonly children: React.ReactNode }) {
  const ref = useEditorScrollRef();
  const scrollRef = usePluginOption(AIChatPlugin, "scrollRef") as UnsafeTypes.UnsafeAny;

  return (
    <main
      id="scroll_container"
      ref={composeRefs(ref, scrollRef)}
      className="relative h-[calc(100vh-44px-2px)] overflow-y-auto"
    >
      <SearchCommand />
      {children}
    </main>
  );
}
