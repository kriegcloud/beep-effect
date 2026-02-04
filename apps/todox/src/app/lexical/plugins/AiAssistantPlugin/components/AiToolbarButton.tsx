"use client";

import { Button } from "@beep/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@beep/ui/components/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@beep/ui/components/tooltip";
import { cn } from "@beep/todox/lib/utils";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { CaretDownIcon, CircleNotchIcon, SparkleIcon } from "@phosphor-icons/react";
import { useAiContext } from "../../../context/AiContext";
import { OPEN_AI_PANEL_COMMAND } from "../commands";
import { PREDEFINED_PROMPTS } from "../prompts";

interface AiToolbarButtonProps {
  readonly disabled?: boolean;
}

export function AiToolbarButton({ disabled }: AiToolbarButtonProps) {
  const [editor] = useLexicalComposerContext();
  const { operationState } = useAiContext();

  const isLoading = operationState === "streaming";

  const handleOpenPanel = () => {
    editor.dispatchCommand(OPEN_AI_PANEL_COMMAND, null);
  };

  // Get first 5 prompts for quick access
  const quickPrompts = PREDEFINED_PROMPTS.slice(0, 5);

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger
          render={(props) => (
            <DropdownMenuTrigger
              {...props}
              render={(props) => (
                <Button
                  {...props}
                  variant="ghost"
                  size="sm"
                  disabled={disabled || isLoading}
                  aria-label="AI Assistant"
                  className={cn("gap-1", "toolbar-item")}
                >
                  {isLoading ? <CircleNotchIcon className="size-4 animate-spin" /> : <SparkleIcon className="size-4" />}
                  <CaretDownIcon className="size-3 opacity-50" />
                </Button>
              )}
            />
          )}
        />
        <TooltipContent side="bottom" sideOffset={4}>
          AI Assistant (Cmd+Shift+I)
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent
        align="start"
        sideOffset={4}
        className="min-w-48 bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100"
      >
        <DropdownMenuItem onClick={handleOpenPanel} className="cursor-pointer flex items-center gap-2">
          <SparkleIcon className="size-4" />
          <span>Open AI Panel...</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {quickPrompts.map((prompt) => (
          <DropdownMenuItem
            key={prompt.id}
            onClick={() => {
              // Open panel with this prompt pre-selected
              // For now, just open the panel - prompt selection can be enhanced later
              handleOpenPanel();
            }}
            className="cursor-pointer"
          >
            <span>{prompt.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
