"use client";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@beep/todox/components/ui/command";
import { type KeyboardEvent, useCallback, useState } from "react";
import { type AiPromptTemplate, PREDEFINED_PROMPTS } from "../prompts";

interface AiCommandMenuProps {
  readonly onSelect: (promptId: string, instruction: string) => void;
}

/**
 * Command palette for selecting AI prompts.
 *
 * Displays predefined prompts with search/filter capability.
 * When no matches are found, allows entering a custom prompt.
 */
export function AiCommandMenu({ onSelect }: AiCommandMenuProps) {
  const [searchValue, setSearchValue] = useState("");
  const [customInstruction, setCustomInstruction] = useState("");

  const handlePromptSelect = useCallback(
    (prompt: AiPromptTemplate) => {
      onSelect(prompt.id, prompt.systemPrompt);
    },
    [onSelect]
  );

  const handleCustomSubmit = useCallback(() => {
    const trimmed = customInstruction.trim();
    if (trimmed.length > 0) {
      onSelect("custom", trimmed);
      setCustomInstruction("");
    }
  }, [customInstruction, onSelect]);

  const handleCustomKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        event.preventDefault();
        handleCustomSubmit();
      }
    },
    [handleCustomSubmit]
  );

  return (
    <Command className="w-80 rounded-lg border shadow-md bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100">
      <CommandInput placeholder="Search prompts or type custom..." value={searchValue} onValueChange={setSearchValue} />
      <CommandList>
        <CommandEmpty>
          <div className="flex flex-col gap-2 px-2 text-left">
            <p className="text-muted-foreground text-sm">No matching prompts. Use custom instruction:</p>
            <input
              type="text"
              className="bg-input/30 border-input/50 w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
              placeholder="Enter custom instruction..."
              value={customInstruction}
              onChange={(e) => setCustomInstruction(e.target.value)}
              onKeyDown={handleCustomKeyDown}
            />
            <p className="text-muted-foreground text-xs">Press Enter to submit</p>
          </div>
        </CommandEmpty>
        <CommandGroup heading="AI Actions">
          {PREDEFINED_PROMPTS.map((prompt) => (
            <CommandItem
              key={prompt.id}
              value={`${prompt.label} ${prompt.description}`}
              onSelect={() => handlePromptSelect(prompt)}
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-medium">{prompt.label}</span>
                <span className="text-muted-foreground text-xs">{prompt.description}</span>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
