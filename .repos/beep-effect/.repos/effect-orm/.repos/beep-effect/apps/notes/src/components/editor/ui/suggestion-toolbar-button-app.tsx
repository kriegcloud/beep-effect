"use client";

import { useAuthGuard } from "@beep/notes/components/auth/useAuthGuard";
import { suggestionPlugin } from "@beep/notes/components/editor/plugins/suggestion-kit-app";
import { cn } from "@beep/notes/lib/utils";
import { ToolbarButton } from "@beep/notes/registry/ui/toolbar";
import { PencilLineIcon } from "lucide-react";
import { useEditorPlugin, usePluginOption } from "platejs/react";

export function SuggestionToolbarButton() {
  const { setOption } = useEditorPlugin(suggestionPlugin);
  const isSuggesting = usePluginOption(suggestionPlugin, "isSuggesting");
  const authGuard = useAuthGuard();

  return (
    <ToolbarButton
      className={cn(isSuggesting && "text-brand/80 hover:text-brand/80")}
      onClick={() => authGuard(() => setOption("isSuggesting", !isSuggesting))}
      onMouseDown={(e) => e.preventDefault()}
      tooltip={isSuggesting ? "Turn off suggesting" : "Suggestion edits"}
    >
      <PencilLineIcon />
    </ToolbarButton>
  );
}
