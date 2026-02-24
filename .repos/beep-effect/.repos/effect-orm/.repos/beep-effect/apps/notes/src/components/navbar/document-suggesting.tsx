import { Button } from "@beep/notes/registry/ui/button";
import { SuggestionPlugin } from "@platejs/suggestion/react";
import { PencilLineIcon, XIcon } from "lucide-react";
import { useEditorRef, usePluginOption } from "platejs/react";

export const DocumentSuggesting = () => {
  const editor = useEditorRef();
  const isSuggesting = usePluginOption(SuggestionPlugin, "isSuggesting");

  if (!isSuggesting) return null;

  return (
    <Button
      variant="ghost"
      className="text-brand/80 hover:text-brand"
      onClick={() => editor.setOption(SuggestionPlugin, "isSuggesting", false)}
      tooltip="Turn off suggesting"
    >
      <PencilLineIcon />
      <span className="text-xs">Suggesting</span>
      <XIcon />
    </Button>
  );
};
