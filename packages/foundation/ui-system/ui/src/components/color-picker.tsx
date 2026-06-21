/**
 * Hex color picker primitive backed by `react-colorful` and `@beep/schema/Color`.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
"use client";

import * as Color from "@beep/schema/Color";
import { Button } from "@beep/ui/components/button";
import { Input } from "@beep/ui/components/input";
import { Popover, PopoverContent, PopoverTrigger } from "@beep/ui/components/popover";
import { make as makeScopedAtom, useAtom } from "@effect/atom-react";
import { pipe, Result } from "effect";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import { Atom } from "effect/unstable/reactivity";
import { HexColorPicker } from "react-colorful";
import { cn } from "../lib/index.ts";
import type React from "react";

const defaultColorValue = "#000000";

/**
 * Normalizes a boundary hex color into canonical `#rrggbb` form.
 *
 * @example
 * ```tsx
 * import { normalizeHexColorInput } from "@beep/ui/components/color-picker"
 *
 * console.log(normalizeHexColorInput("#3bf"))
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const normalizeHexColorInput = (value: string): string | undefined =>
  pipe(
    S.decodeUnknownResult(Color.NormalizeHexColor)(value),
    Result.match({
      onFailure: () => undefined,
      onSuccess: (color) => color,
    })
  );

/**
 * Props for {@link ColorPicker}.
 *
 * @category models
 * @since 0.0.0
 */
export interface ColorPickerProps extends Omit<React.ComponentProps<"div">, "defaultValue" | "onChange"> {
  readonly defaultValue?: string | undefined;
  readonly disabled?: boolean | undefined;
  readonly id?: string | undefined;
  readonly name?: string | undefined;
  readonly onBlur?: React.FocusEventHandler<HTMLInputElement> | undefined;
  readonly onValueChange?: ((value: string) => void) | undefined;
  readonly placeholder?: string | undefined;
  readonly value?: string | undefined;
}

interface ColorPickerState {
  readonly draftValue: string;
  readonly open: boolean;
}

const ColorPickerScope = makeScopedAtom((defaultValue: string) =>
  Atom.make<ColorPickerState>({
    draftValue: normalizeHexColorInput(defaultValue) ?? defaultColorValue,
    open: false,
  })
);

/**
 * Popover hex color picker with a text input fallback.
 *
 * @example
 * ```tsx
 * import { ColorPicker } from "@beep/ui/components/color-picker"
 *
 * console.log(ColorPicker)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export const ColorPicker: React.FC<ColorPickerProps> = (props) => (
  <ColorPickerScope.Provider value={props.defaultValue ?? props.value ?? defaultColorValue}>
    <ColorPickerInner {...props} />
  </ColorPickerScope.Provider>
);

const ColorPickerInner: React.FC<ColorPickerProps> = ({
  className,
  defaultValue,
  disabled = false,
  id,
  name,
  onBlur,
  onValueChange,
  placeholder = "#000000",
  value,
  ...props
}) => {
  const [state, setState] = useAtom(ColorPickerScope.use());
  const controlled = P.isString(value);
  const normalizedValue = controlled ? normalizeHexColorInput(value) : undefined;
  const color = normalizedValue ?? state.draftValue;

  const commitColor = (nextValue: string) => {
    const normalized = normalizeHexColorInput(nextValue);
    setState((current) => ({ ...current, draftValue: normalized ?? nextValue }));
    if (normalized !== undefined) {
      onValueChange?.(normalized);
    }
  };

  return (
    <div className={cn("flex w-full flex-col gap-2", className)} {...props}>
      <div className="flex items-center gap-2">
        <Popover open={state.open} onOpenChange={(open) => setState((current) => ({ ...current, open }))}>
          <PopoverTrigger
            render={
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={disabled}
                aria-label="Choose color"
                className="p-1"
              >
                <span className="size-5 rounded-sm border" style={{ backgroundColor: color }} />
              </Button>
            }
          />
          <PopoverContent className="w-auto p-3 [&_.react-colorful]:h-44 [&_.react-colorful]:w-56">
            <HexColorPicker color={color} onChange={commitColor} />
          </PopoverContent>
        </Popover>
        <Input
          id={id}
          name={name}
          disabled={disabled}
          value={color}
          placeholder={placeholder}
          onBlur={onBlur}
          onChange={(event) => commitColor(event.target.value)}
        />
      </div>
    </div>
  );
};
