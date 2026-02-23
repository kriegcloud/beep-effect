"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@beep/todox/components/ui/tooltip";
import { cn } from "@beep/todox/lib/utils";
import { MinusIcon, PlusIcon } from "@phosphor-icons/react";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Str from "effect/String";
import type { LexicalEditor } from "lexical";
import * as React from "react";
import { MAX_ALLOWED_FONT_SIZE, MIN_ALLOWED_FONT_SIZE } from "../../context/toolbar-context";
import { isKeyboardInput } from "../../utils/focusUtils";
import { SHORTCUTS } from "../ShortcutsPlugin/shortcuts";
import { UpdateFontSizeType, updateFontSize, updateFontSizeInSelection } from "./utils";

function parseFontSize(input: string): [number, string] | null {
  return F.pipe(
    input,
    Str.match(/^(\d+(?:\.\d+)?)(px|pt)$/),
    O.flatMap((match) =>
      O.fromNullable(match[1]).pipe(
        O.flatMap((numStr) =>
          O.fromNullable(match[2]).pipe(O.map((unit) => [Number(numStr), unit] as [number, string]))
        )
      )
    ),
    O.getOrNull
  );
}

function normalizeToPx(fontSize: number, unit: string): number {
  return unit === "pt" ? Math.round((fontSize * 4) / 3) : fontSize;
}

function isValidFontSize(fontSizePx: number): boolean {
  return fontSizePx >= MIN_ALLOWED_FONT_SIZE && fontSizePx <= MAX_ALLOWED_FONT_SIZE;
}

export function parseFontSizeForToolbar(input: string): string {
  const parsed = parseFontSize(input);
  if (!parsed) {
    return "";
  }

  const [fontSize, unit] = parsed;
  const fontSizePx = normalizeToPx(fontSize, unit);
  return `${fontSizePx}px`;
}

export function parseAllowedFontSize(input: string): string {
  const parsed = parseFontSize(input);
  if (!parsed) {
    return "";
  }

  const [fontSize, unit] = parsed;
  const fontSizePx = normalizeToPx(fontSize, unit);
  return isValidFontSize(fontSizePx) ? input : "";
}

export default function FontSize({
  selectionFontSize,
  disabled,
  editor,
}: {
  readonly selectionFontSize: string;
  readonly disabled: boolean;
  readonly editor: LexicalEditor;
}) {
  const [inputValue, setInputValue] = React.useState<string>(selectionFontSize);
  const [inputChangeFlag, setInputChangeFlag] = React.useState<boolean>(false);
  const [isMouseMode, setIsMouseMode] = React.useState(false);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const inputValueNumber = Number(inputValue);

    if (e.key === "Tab") {
      return;
    }
    if (["e", "E", "+", "-"].includes(e.key) || Number.isNaN(inputValueNumber)) {
      e.preventDefault();
      setInputValue("");
      return;
    }
    setInputChangeFlag(true);
    if (e.key === "Enter" || e.key === "Escape") {
      e.preventDefault();

      updateFontSizeByInputValue(inputValueNumber, !isMouseMode);
    }
  };

  const handleInputBlur = () => {
    setIsMouseMode(false);

    if (inputValue !== "" && inputChangeFlag) {
      const inputValueNumber = Number(inputValue);
      updateFontSizeByInputValue(inputValueNumber);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    setIsMouseMode(true);
  };

  const updateFontSizeByInputValue = (inputValueNumber: number, skipRefocus = false) => {
    let updatedFontSize = inputValueNumber;
    if (inputValueNumber > MAX_ALLOWED_FONT_SIZE) {
      updatedFontSize = MAX_ALLOWED_FONT_SIZE;
    } else if (inputValueNumber < MIN_ALLOWED_FONT_SIZE) {
      updatedFontSize = MIN_ALLOWED_FONT_SIZE;
    }

    setInputValue(String(updatedFontSize));
    updateFontSizeInSelection(editor, O.some(`${String(updatedFontSize)}px`), O.none(), skipRefocus);
    setInputChangeFlag(false);
  };

  React.useEffect(() => {
    setInputValue(selectionFontSize);
  }, [selectionFontSize]);

  return (
    <>
      <Tooltip>
        <TooltipTrigger
          render={(props) => (
            <button
              {...props}
              type="button"
              disabled={disabled || (selectionFontSize !== "" && Number(inputValue) <= MIN_ALLOWED_FONT_SIZE)}
              onClick={(e) => {
                updateFontSize(editor, UpdateFontSizeType.decrement, inputValue, isKeyboardInput(e));
              }}
              className="toolbar-item"
              aria-label="Decrease font size"
            >
              <MinusIcon className="size-4" />
            </button>
          )}
        />
        <TooltipContent side="bottom" sideOffset={4}>
          Decrease font size ({SHORTCUTS.DECREASE_FONT_SIZE})
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger
          render={(props) => (
            <input
              {...props}
              type="number"
              value={inputValue}
              disabled={disabled}
              className={cn(
                "toolbar-item font-bold text-xs rounded border border-border",
                "h-6 px-1 py-0.5 text-center w-8 self-center",
                "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                "disabled:opacity-20 disabled:cursor-not-allowed"
              )}
              min={MIN_ALLOWED_FONT_SIZE}
              max={MAX_ALLOWED_FONT_SIZE}
              onChange={(e) => setInputValue(e.target.value)}
              onClick={handleClick}
              onKeyDown={handleKeyPress}
              onBlur={handleInputBlur}
            />
          )}
        />
        <TooltipContent side="bottom" sideOffset={4}>
          Font size
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger
          render={(props) => (
            <button
              {...props}
              type="button"
              disabled={disabled || (selectionFontSize !== "" && Number(inputValue) >= MAX_ALLOWED_FONT_SIZE)}
              onClick={(e) => {
                updateFontSize(editor, UpdateFontSizeType.increment, inputValue, isKeyboardInput(e));
              }}
              className="toolbar-item"
              aria-label="Increase font size"
            >
              <PlusIcon className="size-4" />
            </button>
          )}
        />
        <TooltipContent side="bottom" sideOffset={4}>
          Increase font size ({SHORTCUTS.INCREASE_FONT_SIZE})
        </TooltipContent>
      </Tooltip>
    </>
  );
}
