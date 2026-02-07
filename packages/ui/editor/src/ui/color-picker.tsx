"use client";

/**
 * ColorPicker component refactored to use pure @effect-atom/atom-react patterns.
 * No useState, useEffect, useCallback, useMemo, or useRef.
 *
 * @since 0.1.0
 */

import { Slider as SliderPrimitive } from "@base-ui/react/slider";
import { $UiEditorId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { Button } from "@beep/ui/components/button";
import { Input } from "@beep/ui/components/input";
import { Popover, PopoverContent, PopoverTrigger } from "@beep/ui/components/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@beep/ui/components/select";
import { cn } from "@beep/ui-core/utils";
import { Atom, AtomRef, useAtomMount, useAtomRef, useAtomValue } from "@effect-atom/atom-react";
import { cva, type VariantProps } from "class-variance-authority";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as Num from "effect/Number";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as React from "react";
import { useId } from "react";

// ============================================================================
// Types & Constants
// ============================================================================
const $I = $UiEditorId.create("ui/color-picker");

export class ColorFormat extends BS.StringLiteralKit("hex", "rgb", "hsl", "hsb").annotations(
  $I.annotations("ColorFormat", {
    description: "Color format",
  })
) {}

export declare namespace ColorFormat {
  export type Type = typeof ColorFormat.Type;
}

interface ColorValue {
  readonly r: number;
  readonly g: number;
  readonly b: number;
  readonly a: number;
}

interface HSVColorValue {
  readonly h: number;
  readonly s: number;
  readonly v: number;
  readonly a: number;
}

interface HSLColorValue {
  readonly h: number;
  readonly s: number;
  readonly l: number;
}

type Direction = "ltr" | "rtl";

// ============================================================================
// Color Conversion Utilities (Pure Functions)
// ============================================================================

/**
 * Converts a hex color string to RGB color value.
 */
function hexToRgb(hex: string, alpha?: number): ColorValue {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: Number.parseInt(result[1] ?? "0", 16),
        g: Number.parseInt(result[2] ?? "0", 16),
        b: Number.parseInt(result[3] ?? "0", 16),
        a: alpha ?? 1,
      }
    : { r: 0, g: 0, b: 0, a: alpha ?? 1 };
}

/**
 * Converts an RGB color value to hex string.
 */
function rgbToHex(color: ColorValue): string {
  const toHex = (n: number): string => {
    const hex = Math.round(n).toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  };
  return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
}

/**
 * Converts an RGB color value to HSV.
 */
function rgbToHsv(color: ColorValue): HSVColorValue {
  const r = color.r / 255;
  const g = color.g / 255;
  const b = color.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;

  let h = 0;
  if (diff !== 0) {
    if (max === r) {
      h = ((g - b) / diff) % 6;
    } else if (max === g) {
      h = (b - r) / diff + 2;
    } else if (max === b) {
      h = (r - g) / diff + 4;
    }
  }
  h = Math.round(h * 60);
  if (h < 0) h += 360;

  const s = max === 0 ? 0 : diff / max;
  return {
    h,
    s: Math.round(s * 100),
    v: Math.round(max * 100),
    a: color.a,
  };
}

/**
 * Converts an HSV color value to RGB.
 */
function hsvToRgb(hsv: HSVColorValue): ColorValue {
  const h = hsv.h / 360;
  const s = hsv.s / 100;
  const v = hsv.v / 100;

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  return Match.value(i % 6).pipe(
    Match.when(0, () => ({ r: Math.round(v * 255), g: Math.round(t * 255), b: Math.round(p * 255), a: hsv.a })),
    Match.when(1, () => ({ r: Math.round(q * 255), g: Math.round(v * 255), b: Math.round(p * 255), a: hsv.a })),
    Match.when(2, () => ({ r: Math.round(p * 255), g: Math.round(v * 255), b: Math.round(t * 255), a: hsv.a })),
    Match.when(3, () => ({ r: Math.round(p * 255), g: Math.round(q * 255), b: Math.round(v * 255), a: hsv.a })),
    Match.when(4, () => ({ r: Math.round(t * 255), g: Math.round(p * 255), b: Math.round(v * 255), a: hsv.a })),
    Match.when(5, () => ({ r: Math.round(v * 255), g: Math.round(p * 255), b: Math.round(q * 255), a: hsv.a })),
    Match.orElse(() => ({ r: 0, g: 0, b: 0, a: hsv.a }))
  );
}

/**
 * Converts an RGB color value to HSL.
 */
function rgbToHsl(color: ColorValue): HSLColorValue {
  const r = color.r / 255;
  const g = color.g / 255;
  const b = color.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  const sum = max + min;

  const l = sum / 2;

  let h = 0;
  let s = 0;

  if (diff !== 0) {
    s = l > 0.5 ? diff / (2 - sum) : diff / sum;

    if (max === r) {
      h = (g - b) / diff + (g < b ? 6 : 0);
    } else if (max === g) {
      h = (b - r) / diff + 2;
    } else if (max === b) {
      h = (r - g) / diff + 4;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Converts an HSL color value to RGB.
 */
function hslToRgb(hsl: HSLColorValue, alpha = 1): ColorValue {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
  const m = l - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (h >= 0 && h < 1 / 6) {
    r = c;
    g = x;
    b = 0;
  } else if (h >= 1 / 6 && h < 2 / 6) {
    r = x;
    g = c;
    b = 0;
  } else if (h >= 2 / 6 && h < 3 / 6) {
    r = 0;
    g = c;
    b = x;
  } else if (h >= 3 / 6 && h < 4 / 6) {
    r = 0;
    g = x;
    b = c;
  } else if (h >= 4 / 6 && h < 5 / 6) {
    r = x;
    g = 0;
    b = c;
  } else if (h >= 5 / 6 && h < 1) {
    r = c;
    g = 0;
    b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
    a: alpha,
  };
}

/**
 * Converts a color value to string based on the format.
 * Uses Match for format selection instead of switch.
 */
function colorToString(color: ColorValue, format?: undefined | ColorFormat.Type): string {
  return Match.value(format ?? ColorFormat.Enum.hex).pipe(
    Match.when(ColorFormat.Enum.hex, () => rgbToHex(color)),
    Match.when(ColorFormat.Enum.rgb, () =>
      color.a < 1 ? `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})` : `rgb(${color.r}, ${color.g}, ${color.b})`
    ),
    Match.when(ColorFormat.Enum.hsl, () => {
      const hsl = rgbToHsl(color);
      return color.a < 1 ? `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${color.a})` : `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    }),
    Match.when(ColorFormat.Enum.hsb, () => {
      const hsv = rgbToHsv(color);
      return color.a < 1 ? `hsba(${hsv.h}, ${hsv.s}%, ${hsv.v}%, ${color.a})` : `hsb(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`;
    }),
    Match.exhaustive
  );
}

/**
 * Parses a hex color string to ColorValue.
 * Returns Option for null-safety.
 */
const parseHexColor = (value: string): O.Option<ColorValue> =>
  F.pipe(
    value,
    O.liftPredicate((v) => v.startsWith("#")),
    O.flatMap((v) => O.fromNullable(/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/.exec(v))),
    O.map(() => hexToRgb(value))
  );

/**
 * Parses an RGB/RGBA color string to ColorValue.
 * Returns Option for null-safety.
 */
const parseRgbColor = (value: string): O.Option<ColorValue> =>
  F.pipe(
    O.fromNullable(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)$/.exec(value)),
    O.map((match) => ({
      r: Number.parseInt(match[1] ?? "0", 10),
      g: Number.parseInt(match[2] ?? "0", 10),
      b: Number.parseInt(match[3] ?? "0", 10),
      a: match[4] ? Number.parseFloat(match[4]) : 1,
    }))
  );

/**
 * Parses an HSL/HSLA color string to ColorValue.
 * Returns Option for null-safety.
 */
const parseHslColor = (value: string): O.Option<ColorValue> =>
  F.pipe(
    O.fromNullable(/^hsla?\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,\s*([\d.]+))?\s*\)$/.exec(value)),
    O.map((match) => {
      const h = Number.parseInt(match[1] ?? "0", 10);
      const s = Number.parseInt(match[2] ?? "0", 10);
      const l = Number.parseInt(match[3] ?? "0", 10);
      const a = match[4] ? Number.parseFloat(match[4]) : 1;
      return hslToRgb({ h, s, l }, a);
    })
  );

/**
 * Parses an HSB/HSBA color string to ColorValue.
 * Returns Option for null-safety.
 */
const parseHsbColor = (value: string): O.Option<ColorValue> =>
  F.pipe(
    O.fromNullable(/^hsba?\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,\s*([\d.]+))?\s*\)$/.exec(value)),
    O.map((match) => {
      const h = Number.parseInt(match[1] ?? "0", 10);
      const s = Number.parseInt(match[2] ?? "0", 10);
      const v = Number.parseInt(match[3] ?? "0", 10);
      const a = match[4] ? Number.parseFloat(match[4]) : 1;
      return hsvToRgb({ h, s, v, a });
    })
  );

/**
 * Parses a color string to ColorValue.
 * Returns Option for null-safety instead of null.
 */
function parseColorString(value: string): O.Option<ColorValue> {
  const trimmed = Str.trim(value);

  return F.pipe(
    parseHexColor(trimmed),
    O.orElse(() => parseRgbColor(trimmed)),
    O.orElse(() => parseHslColor(trimmed)),
    O.orElse(() => parseHsbColor(trimmed))
  );
}

// ============================================================================
// State Interfaces
// ============================================================================

/**
 * State for ColorPicker.
 */
interface ColorPickerState {
  readonly color: ColorValue;
  readonly hsv: HSVColorValue;
  readonly open: boolean;
  readonly format: ColorFormat.Type;
}

/**
 * Refs for ColorPicker DOM elements.
 */
interface ColorPickerRefs {
  readonly formTriggerRef: AtomRef.AtomRef<O.Option<HTMLDivElement>>;
  readonly areaRef: AtomRef.AtomRef<O.Option<HTMLDivElement>>;
  readonly isDraggingRef: AtomRef.AtomRef<boolean>;
}

/**
 * Static configuration for ColorPicker.
 */
interface ColorPickerConfig {
  readonly dir: Direction;
  readonly disabled: boolean;
  readonly inline: boolean;
  readonly readOnly: boolean;
  readonly required: boolean;
}

// ============================================================================
// Tagged Error Schemas
// ============================================================================

/**
 * Error thrown when ColorPicker context is accessed outside of ColorPickerRoot.
 */
class ColorPickerContextNotMountedError extends S.TaggedError<ColorPickerContextNotMountedError>()(
  "ColorPickerContextNotMountedError",
  {
    message: S.String,
    hook: S.String,
  }
) {}

/**
 * Error thrown when EyeDropper fails.
 */
class EyeDropperError extends S.TaggedError<EyeDropperError>()("EyeDropperError", {
  message: S.String,
  cause: S.optional(S.Defect),
}) {}

// ============================================================================
// Atom Families (Module Level)
// ============================================================================

/**
 * Atom family for ColorPicker state - keyed by instance ID.
 */
const colorPickerStateFamily = Atom.family((_key: string) =>
  Atom.make<AtomRef.AtomRef<ColorPickerState>>((_get) =>
    AtomRef.make<ColorPickerState>({
      color: { r: 0, g: 0, b: 0, a: 1 },
      hsv: { h: 0, s: 0, v: 0, a: 1 },
      open: false,
      format: ColorFormat.Enum.hex,
    })
  )
);

/**
 * Atom family for ColorPicker refs - keyed by instance ID.
 */
const colorPickerRefsFamily = Atom.family((_key: string) =>
  Atom.make<ColorPickerRefs>((_get) => ({
    formTriggerRef: AtomRef.make<O.Option<HTMLDivElement>>(O.none()),
    areaRef: AtomRef.make<O.Option<HTMLDivElement>>(O.none()),
    isDraggingRef: AtomRef.make<boolean>(false),
  }))
);

/**
 * State for VisuallyHiddenInput refs.
 */
interface VisuallyHiddenRefsState {
  readonly inputRef: AtomRef.AtomRef<O.Option<HTMLInputElement>>;
  readonly sizeRef: AtomRef.AtomRef<{ width?: number; height?: number }>;
  readonly controlRef: AtomRef.AtomRef<O.Option<HTMLElement>>;
}

/**
 * Atom family for VisuallyHiddenInput refs - keyed by instance ID.
 */
const visuallyHiddenRefsFamily = Atom.family((_key: string) =>
  Atom.make<VisuallyHiddenRefsState>((_get) => ({
    inputRef: AtomRef.make<O.Option<HTMLInputElement>>(O.none()),
    sizeRef: AtomRef.make<{ width?: number; height?: number }>({}),
    controlRef: AtomRef.make<O.Option<HTMLElement>>(O.none()),
  }))
);

/**
 * Atom family for ResizeObserver effect - keyed by instance ID.
 * Reads control from the refs stored in visuallyHiddenRefsFamily.
 */
const resizeObserverAtomFamily = Atom.family((key: string) =>
  Atom.make<void>((get) => {
    const refs = get(visuallyHiddenRefsFamily(key));
    const controlOption = refs.controlRef.value;

    const control = F.pipe(
      controlOption,
      O.getOrElse(() => null as HTMLElement | null)
    );

    if (!control) {
      refs.sizeRef.set({});
      return;
    }

    refs.sizeRef.set({
      width: control.offsetWidth,
      height: control.offsetHeight,
    });

    if (typeof window === "undefined") return;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      let width: number;
      let height: number;

      if ("borderBoxSize" in entry) {
        const borderSizeEntry = entry.borderBoxSize;
        const borderSize = Array.isArray(borderSizeEntry) ? borderSizeEntry[0] : borderSizeEntry;
        width = borderSize?.inlineSize ?? control.offsetWidth;
        height = borderSize?.blockSize ?? control.offsetHeight;
      } else {
        width = control.offsetWidth;
        height = control.offsetHeight;
      }

      refs.sizeRef.set({ width, height });
    });

    resizeObserver.observe(control, { box: "border-box" });

    get.addFinalizer(() => {
      resizeObserver.disconnect();
    });
  })
);

// ============================================================================
// Context Providers (Static Config Only)
// ============================================================================

/**
 * Context for static ColorPicker configuration.
 */
const ColorPickerConfigContext = React.createContext<ColorPickerConfig | null>(null);

/**
 * Context for ColorPicker instance ID.
 */
const ColorPickerIdContext = React.createContext<string | null>(null);

/**
 * Context for ColorPicker callbacks.
 */
interface ColorPickerCallbacks {
  readonly onValueChange?: ((value: string) => void) | undefined;
  readonly onOpenChange?: ((open: boolean) => void) | undefined;
  readonly onFormatChange?: ((format: ColorFormat.Type) => void) | undefined;
}

const ColorPickerCallbacksContext = React.createContext<ColorPickerCallbacks>({});

/**
 * Direction context for RTL support.
 */
const DirectionContext = React.createContext<Direction | undefined>(undefined);

/**
 * Hook to get the direction, preferring prop over context.
 */
function useDirection(dirProp?: Direction): Direction {
  const contextDir = React.useContext(DirectionContext);
  return dirProp ?? contextDir ?? "ltr";
}

// ============================================================================
// Custom Hooks for State Access
// ============================================================================

/**
 * Hook to get ColorPicker instance ID from context.
 */
function useColorPickerId(): string {
  const id = React.useContext(ColorPickerIdContext);
  return O.getOrThrowWith(
    O.fromNullable(id),
    () =>
      new ColorPickerContextNotMountedError({
        message: "useColorPickerId must be used within ColorPickerRoot",
        hook: "useColorPickerId",
      })
  );
}

/**
 * Hook to get ColorPicker state ref.
 */
function useColorPickerStateRef(): AtomRef.AtomRef<ColorPickerState> {
  const id = useColorPickerId();
  return useAtomValue(colorPickerStateFamily(id));
}

/**
 * Hook to get ColorPicker state value.
 */
function useColorPickerState(): ColorPickerState {
  const stateRef = useColorPickerStateRef();
  return useAtomRef(stateRef);
}

/**
 * Hook to get ColorPicker refs.
 */
function useColorPickerRefs(): ColorPickerRefs {
  const id = useColorPickerId();
  return useAtomValue(colorPickerRefsFamily(id));
}

/**
 * Hook to get ColorPicker static configuration.
 */
function useColorPickerConfig(): ColorPickerConfig {
  const config = React.useContext(ColorPickerConfigContext);
  return O.getOrThrowWith(
    O.fromNullable(config),
    () =>
      new ColorPickerContextNotMountedError({
        message: "useColorPickerConfig must be used within ColorPickerRoot",
        hook: "useColorPickerConfig",
      })
  );
}

/**
 * Hook to get ColorPicker callbacks.
 */
function useColorPickerCallbacks(): ColorPickerCallbacks {
  return React.useContext(ColorPickerCallbacksContext);
}

// ============================================================================
// VisuallyHiddenInput Component
// ============================================================================

interface VisuallyHiddenInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "checked"> {
  readonly value?: string;
  readonly control: HTMLElement | null;
}

/**
 * Visually hidden input for form integration.
 * Uses AtomRef for DOM element and size tracking.
 */
function VisuallyHiddenInput(props: VisuallyHiddenInputProps): React.JSX.Element {
  const { control, value, type = "hidden", style, ...inputProps } = props;

  const id = useId();

  // Use module-level atom family for refs
  const refs = useAtomValue(visuallyHiddenRefsFamily(id));
  const size = useAtomRef(refs.sizeRef);

  // Update controlRef when control prop changes
  refs.controlRef.set(O.fromNullable(control));

  // Use module-level resize observer atom family
  useAtomMount(resizeObserverAtomFamily(id));

  // Compute style inline - no useMemo
  const composedStyle: React.CSSProperties = {
    ...style,
    ...(size.width !== undefined && size.height !== undefined ? size : {}),
    border: 0,
    clip: "rect(0 0 0 0)",
    clipPath: "inset(50%)",
    height: "1px",
    margin: "-1px",
    overflow: "hidden",
    padding: 0,
    position: "absolute",
    whiteSpace: "nowrap",
    width: "1px",
  };

  return (
    <input
      type={type}
      {...inputProps}
      ref={(el) => {
        refs.inputRef.set(O.fromNullable(el));
      }}
      aria-hidden
      tabIndex={-1}
      defaultValue={value}
      style={composedStyle}
    />
  );
}

// ============================================================================
// EyeDropper API Declaration
// ============================================================================

interface EyeDropper {
  open: (options?: { signal?: AbortSignal }) => Promise<{ sRGBHex: string }>;
}

declare global {
  interface Window {
    EyeDropper?: {
      new (): EyeDropper;
    };
  }
}

// ============================================================================
// ColorPicker Components
// ============================================================================

interface ColorPickerRootProps
  extends Omit<React.ComponentProps<"div">, "onValueChange">,
    Pick<React.ComponentProps<typeof Popover>, "defaultOpen" | "open" | "modal"> {
  readonly value?: string;
  readonly defaultValue?: string;
  readonly onValueChange?: (value: string) => void;
  readonly onOpenChange?: (open: boolean) => void;
  readonly dir?: Direction;
  readonly format?: ColorFormat.Type;
  readonly defaultFormat?: ColorFormat.Type;
  readonly onFormatChange?: (format: ColorFormat.Type) => void;
  readonly name?: string;
  readonly disabled?: boolean;
  readonly inline?: boolean;
  readonly readOnly?: boolean;
  readonly required?: boolean;
}

/**
 * Root component for ColorPicker.
 * Sets up state atoms and provides context to children.
 */
function ColorPickerRoot(props: ColorPickerRootProps): React.JSX.Element {
  const {
    value: valueProp,
    defaultValue = "#000000",
    onValueChange,
    format: formatProp,
    defaultFormat = ColorFormat.Enum.hex,
    onFormatChange,
    defaultOpen,
    open: openProp,
    onOpenChange,
    name,
    disabled = false,
    inline = false,
    readOnly = false,
    required = false,
    dir: dirProp,
    modal,
    ref,
    children,
    ...rootProps
  } = props;

  const id = useId();
  const dir = useDirection(dirProp);

  // Get state ref for this instance
  const stateRef = useAtomValue(colorPickerStateFamily(id));
  const refs = useAtomValue(colorPickerRefsFamily(id));

  // Subscribe to state changes
  const state = useAtomRef(stateRef);

  // Initialize state from props on first render (when color is default black)
  // This is synchronous state setting, not a side effect, so no Atom.make needed
  const isDefaultState =
    state.color.r === 0 &&
    state.color.g === 0 &&
    state.color.b === 0 &&
    state.format === ColorFormat.Enum.hex &&
    !state.open;

  if (isDefaultState) {
    const colorString = valueProp ?? defaultValue;
    const color = hexToRgb(colorString);
    const hsv = rgbToHsv(color);

    stateRef.set({
      color,
      hsv,
      open: openProp ?? defaultOpen ?? false,
      format: formatProp ?? defaultFormat,
    });
  }

  // Sync controlled value prop - direct update, no Atom.make needed
  if (valueProp !== undefined) {
    const currentHex = rgbToHex(state.color);
    if (currentHex !== valueProp) {
      const color = hexToRgb(valueProp, state.color.a);
      const hsv = rgbToHsv(color);
      stateRef.update((s) => ({ ...s, color, hsv }));
    }
  }

  // Sync controlled open prop - direct update, no Atom.make needed
  if (openProp !== undefined && state.open !== openProp) {
    stateRef.update((s) => ({ ...s, open: openProp }));
  }

  // Sync controlled format prop - direct update, no Atom.make needed
  if (formatProp !== undefined && state.format !== formatProp) {
    stateRef.update((s) => ({ ...s, format: formatProp }));
  }
  const formTriggerOption = useAtomRef(refs.formTriggerRef);
  const formTrigger = F.pipe(
    formTriggerOption,
    O.getOrElse(() => null as HTMLDivElement | null)
  );

  const isFormControl = formTrigger ? !!formTrigger.closest("form") : true;

  // Static config for context
  const config: ColorPickerConfig = {
    dir,
    disabled,
    inline,
    readOnly,
    required,
  };

  // Callbacks for context
  const callbacks: ColorPickerCallbacks = {
    onValueChange,
    onOpenChange,
    onFormatChange,
  };

  const hexValue = rgbToHex(state.color);

  if (inline) {
    return (
      <ColorPickerIdContext.Provider value={id}>
        <ColorPickerConfigContext.Provider value={config}>
          <ColorPickerCallbacksContext.Provider value={callbacks}>
            <div
              {...rootProps}
              ref={(el: HTMLDivElement | null) => {
                refs.formTriggerRef.set(O.fromNullable(el));
                if (typeof ref === "function") {
                  ref(el);
                } else if (ref) {
                  ref.current = el;
                }
              }}
            >
              {children}
            </div>
            {isFormControl && (
              <VisuallyHiddenInput
                type="hidden"
                control={formTrigger}
                name={name}
                value={hexValue}
                disabled={disabled}
                readOnly={readOnly}
                required={required}
              />
            )}
          </ColorPickerCallbacksContext.Provider>
        </ColorPickerConfigContext.Provider>
      </ColorPickerIdContext.Provider>
    );
  }

  // Build popover props conditionally to satisfy exactOptionalPropertyTypes
  // Adapt onOpenChange to base-ui's signature: (open: boolean, eventDetails: PopoverRootChangeEventDetails) => void
  const popoverProps = {
    open: state.open,
    onOpenChange: (newOpen: boolean, _eventDetails: unknown) => {
      stateRef.update((s) => ({ ...s, open: newOpen }));
      onOpenChange?.(newOpen);
    },
    ...(defaultOpen !== undefined && { defaultOpen }),
    ...(modal !== undefined && { modal }),
  };

  return (
    <ColorPickerIdContext.Provider value={id}>
      <ColorPickerConfigContext.Provider value={config}>
        <ColorPickerCallbacksContext.Provider value={callbacks}>
          <Popover {...popoverProps}>
            <div
              {...rootProps}
              ref={(el: HTMLDivElement | null) => {
                refs.formTriggerRef.set(O.fromNullable(el));
                if (typeof ref === "function") {
                  ref(el);
                } else if (ref) {
                  ref.current = el;
                }
              }}
            >
              {children}
            </div>
            {isFormControl && (
              <VisuallyHiddenInput
                type="hidden"
                control={formTrigger}
                name={name}
                value={hexValue}
                disabled={disabled}
                readOnly={readOnly}
                required={required}
              />
            )}
          </Popover>
        </ColorPickerCallbacksContext.Provider>
      </ColorPickerConfigContext.Provider>
    </ColorPickerIdContext.Provider>
  );
}

interface ColorPickerTriggerProps extends React.ComponentProps<typeof Button> {}

/**
 * Trigger button for ColorPicker popover.
 */
function ColorPickerTrigger(props: ColorPickerTriggerProps): React.JSX.Element {
  const { ...triggerProps } = props;
  const config = useColorPickerConfig();

  return (
    <PopoverTrigger disabled={config.disabled} render={<Button data-slot="color-picker-trigger" {...triggerProps} />} />
  );
}

interface ColorPickerContentProps extends React.ComponentProps<typeof PopoverContent> {}

/**
 * Content container for ColorPicker.
 */
function ColorPickerContent(props: ColorPickerContentProps): React.JSX.Element {
  const { className, children, ...popoverContentProps } = props;
  const config = useColorPickerConfig();

  if (config.inline) {
    return (
      <div
        data-slot="color-picker-content"
        {...popoverContentProps}
        className={cn("flex w-[340px] flex-col gap-4 p-4", className)}
      >
        {children}
      </div>
    );
  }

  // Build props conditionally to satisfy exactOptionalPropertyTypes
  const contentProps = {
    "data-slot": "color-picker-content",
    className: cn("flex w-[340px] flex-col gap-4 p-4", className),
    ...popoverContentProps,
  };

  return <PopoverContent {...contentProps}>{children}</PopoverContent>;
}

interface ColorPickerAreaProps extends React.ComponentProps<"div"> {}

/**
 * Color saturation/brightness picking area.
 */
function ColorPickerArea(props: ColorPickerAreaProps): React.JSX.Element {
  const { className, ref, ...areaProps } = props;
  const config = useColorPickerConfig();
  const stateRef = useColorPickerStateRef();
  const state = useColorPickerState();
  const pickerRefs = useColorPickerRefs();
  const callbacks = useColorPickerCallbacks();

  const isDragging = useAtomRef(pickerRefs.isDraggingRef);

  const updateColorFromPosition = (clientX: number, clientY: number): void => {
    const areaOption = pickerRefs.areaRef.value;

    F.pipe(
      areaOption,
      O.map((area) => {
        const rect = area.getBoundingClientRect();
        const x = Num.clamp((clientX - rect.left) / rect.width, { minimum: 0, maximum: 1 });
        const y = Num.clamp(1 - (clientY - rect.top) / rect.height, { minimum: 0, maximum: 1 });

        const newHsv: HSVColorValue = {
          h: state.hsv.h,
          s: Math.round(x * 100),
          v: Math.round(y * 100),
          a: state.hsv.a,
        };

        const newColor = hsvToRgb(newHsv);
        stateRef.update((s) => ({ ...s, hsv: newHsv, color: newColor }));
        callbacks.onValueChange?.(colorToString(newColor, state.format));
      })
    );
  };

  const hue = state.hsv.h;
  const backgroundHue = hsvToRgb({ h: hue, s: 100, v: 100, a: 1 });

  return (
    <div
      data-slot="color-picker-area"
      {...areaProps}
      className={cn(
        "relative h-40 w-full cursor-crosshair touch-none rounded-sm border",
        config.disabled && "pointer-events-none opacity-50",
        className
      )}
      ref={(el: HTMLDivElement | null) => {
        pickerRefs.areaRef.set(O.fromNullable(el));
        if (typeof ref === "function") {
          ref(el);
        } else if (ref) {
          ref.current = el;
        }
      }}
      onPointerDown={(event: React.PointerEvent) => {
        if (config.disabled) return;

        pickerRefs.isDraggingRef.set(true);
        const area = event.currentTarget as HTMLDivElement;
        area.setPointerCapture(event.pointerId);
        updateColorFromPosition(event.clientX, event.clientY);
      }}
      onPointerMove={(event: React.PointerEvent) => {
        if (isDragging) {
          updateColorFromPosition(event.clientX, event.clientY);
        }
      }}
      onPointerUp={(event: React.PointerEvent) => {
        pickerRefs.isDraggingRef.set(false);
        const area = event.currentTarget as HTMLDivElement;
        area.releasePointerCapture(event.pointerId);
      }}
    >
      <div className="absolute inset-0 overflow-hidden rounded-sm">
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: `rgb(${backgroundHue.r}, ${backgroundHue.g}, ${backgroundHue.b})`,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to right, #fff, transparent)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to bottom, transparent, #000)",
          }}
        />
      </div>
      <div
        className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-sm"
        style={{
          left: `${state.hsv.s}%`,
          top: `${100 - state.hsv.v}%`,
        }}
      />
    </div>
  );
}

interface ColorPickerHueSliderProps extends SliderPrimitive.Root.Props {}

/**
 * Hue slider component.
 */
function ColorPickerHueSlider(props: ColorPickerHueSliderProps): React.JSX.Element {
  const { className, ref, ...sliderProps } = props;
  const config = useColorPickerConfig();
  const stateRef = useColorPickerStateRef();
  const state = useColorPickerState();
  const callbacks = useColorPickerCallbacks();

  return (
    <SliderPrimitive.Root
      data-slot="color-picker-hue-slider"
      {...sliderProps}
      {...(ref !== undefined ? { ref } : {})}
      max={360}
      step={1}
      value={[state.hsv.h]}
      onValueChange={(value: number | readonly number[], _eventDetails: unknown) => {
        const values = Array.isArray(value) ? value : [value];
        const newHsv: HSVColorValue = {
          h: values[0] ?? 0,
          s: state.hsv.s,
          v: state.hsv.v,
          a: state.hsv.a,
        };
        const newColor = hsvToRgb(newHsv);
        stateRef.update((s) => ({ ...s, hsv: newHsv, color: newColor }));
        callbacks.onValueChange?.(colorToString(newColor, state.format));
      }}
      disabled={config.disabled}
    >
      <SliderPrimitive.Control className={cn("relative flex w-full touch-none items-center select-none", className)}>
        <SliderPrimitive.Track className="relative h-3 w-full grow overflow-hidden rounded-full bg-[linear-gradient(to_right,#ff0000_0%,#ffff00_16.66%,#00ff00_33.33%,#00ffff_50%,#0000ff_66.66%,#ff00ff_83.33%,#ff0000_100%)]">
          <SliderPrimitive.Indicator className="absolute h-full" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="border-primary/50 bg-background focus-visible:ring-ring block size-4 rounded-full border shadow transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50" />
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}

interface ColorPickerAlphaSliderProps extends SliderPrimitive.Root.Props {}

/**
 * Alpha/transparency slider component.
 */
function ColorPickerAlphaSlider(props: ColorPickerAlphaSliderProps): React.JSX.Element {
  const { className, ref, ...sliderProps } = props;
  const config = useColorPickerConfig();
  const stateRef = useColorPickerStateRef();
  const state = useColorPickerState();
  const callbacks = useColorPickerCallbacks();

  const gradientColor = `rgb(${state.color.r}, ${state.color.g}, ${state.color.b})`;

  return (
    <SliderPrimitive.Root
      data-slot="color-picker-alpha-slider"
      {...sliderProps}
      {...(ref !== undefined ? { ref } : {})}
      max={100}
      step={1}
      disabled={config.disabled}
      value={[Math.round(state.color.a * 100)]}
      onValueChange={(value: number | readonly number[], _eventDetails: unknown) => {
        const values = Array.isArray(value) ? value : [value];
        const alpha = (values[0] ?? 0) / 100;
        const newColor = { ...state.color, a: alpha };
        const newHsv = { ...state.hsv, a: alpha };
        stateRef.update((s) => ({ ...s, color: newColor, hsv: newHsv }));
        callbacks.onValueChange?.(colorToString(newColor, state.format));
      }}
    >
      <SliderPrimitive.Control className={cn("relative flex w-full touch-none items-center select-none", className)}>
        <SliderPrimitive.Track
          className="relative h-3 w-full grow overflow-hidden rounded-full"
          style={{
            background:
              "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)",
            backgroundSize: "8px 8px",
            backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0px",
          }}
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `linear-gradient(to right, transparent, ${gradientColor})`,
            }}
          />
          <SliderPrimitive.Indicator className="absolute h-full" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="border-primary/50 bg-background focus-visible:ring-ring block size-4 rounded-full border shadow transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50" />
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}

interface ColorPickerSwatchProps extends React.ComponentProps<"div"> {}

/**
 * Color swatch preview component.
 */
function ColorPickerSwatch(props: ColorPickerSwatchProps): React.JSX.Element {
  const { className, ...swatchProps } = props;
  const config = useColorPickerConfig();
  const state = useColorPickerState();

  // Compute background style inline - no useMemo
  const color = state.color;
  const backgroundStyle = F.pipe(
    O.fromNullable(color),
    O.match({
      onNone: () => ({
        background:
          "linear-gradient(to bottom right, transparent calc(50% - 1px), hsl(var(--destructive)) calc(50% - 1px) calc(50% + 1px), transparent calc(50% + 1px)) no-repeat",
      }),
      onSome: (c) => {
        const colorString = `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a})`;

        if (c.a < 1) {
          return {
            background: `linear-gradient(${colorString}, ${colorString}), repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 0% 50% / 8px 8px`,
          };
        }

        return { backgroundColor: colorString };
      },
    })
  );

  const ariaLabel = `Current color: ${colorToString(color, state.format)}`;

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      data-slot="color-picker-swatch"
      {...swatchProps}
      className={cn("box-border size-8 rounded-sm border shadow-sm", config.disabled && "opacity-50", className)}
      style={{
        ...backgroundStyle,
        forcedColorAdjust: "none",
      }}
    />
  );
}

interface ColorPickerEyeDropperProps extends React.ComponentProps<typeof Button> {}

/**
 * Creates an Effect to open the EyeDropper and pick a color.
 */
const openEyeDropperEffect = (
  stateRef: AtomRef.AtomRef<ColorPickerState>,
  currentAlpha: number,
  format: ColorFormat.Type,
  onValueChange?: ((value: string) => void) | undefined
): Effect.Effect<void, EyeDropperError> =>
  F.pipe(
    Effect.tryPromise({
      try: () => {
        if (!window.EyeDropper) {
          return Promise.reject(new Error("EyeDropper not available"));
        }
        const eyeDropper = new window.EyeDropper();
        return eyeDropper.open();
      },
      catch: (error) =>
        new EyeDropperError({
          message: "Failed to open EyeDropper",
          cause: error instanceof Error ? error : undefined,
        }),
    }),
    Effect.flatMap((result) =>
      Effect.sync(() => {
        if (result.sRGBHex) {
          const newColor = hexToRgb(result.sRGBHex, currentAlpha);
          const newHsv = rgbToHsv(newColor);
          stateRef.update((s) => ({ ...s, color: newColor, hsv: newHsv }));
          onValueChange?.(colorToString(newColor, format));
        }
      })
    ),
    Effect.catchAll((error) =>
      Effect.sync(() => {
        console.warn("EyeDropper error:", error.message);
      })
    )
  );

/**
 * EyeDropper button for picking colors from the screen.
 */
function ColorPickerEyeDropper(props: ColorPickerEyeDropperProps): React.JSX.Element | null {
  const { children, size, ...buttonProps } = props;
  const config = useColorPickerConfig();
  const stateRef = useColorPickerStateRef();
  const state = useColorPickerState();
  const callbacks = useColorPickerCallbacks();

  const hasEyeDropper = typeof window !== "undefined" && !!window.EyeDropper;

  if (!hasEyeDropper) return null;

  const buttonSize = size ?? (children ? "default" : "icon");

  return (
    <Button
      data-slot="color-picker-eye-dropper"
      {...buttonProps}
      variant="outline"
      size={buttonSize}
      onClick={() => {
        const effect = openEyeDropperEffect(stateRef, state.color.a, state.format, callbacks.onValueChange);
        Effect.runCallback(effect);
      }}
      disabled={config.disabled}
    >
      {children ?? <PipetteIcon />}
    </Button>
  );
}

/**
 * Pipette icon for EyeDropper button.
 */
function PipetteIcon(): React.JSX.Element {
  return (
    <svg
      role="image"
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m2 22 1-1h3l9-9" />
      <path d="M3 21v-3l9-9" />
      <path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z" />
    </svg>
  );
}

interface ColorPickerFormatSelectProps
  extends Omit<React.ComponentProps<typeof Select>, "value" | "onValueChange">,
    Pick<React.ComponentProps<typeof SelectTrigger>, "size" | "className"> {}

/**
 * Format selector for switching between color formats.
 */
function ColorPickerFormatSelect(props: ColorPickerFormatSelectProps): React.JSX.Element {
  const { size, className, ...selectProps } = props;
  const config = useColorPickerConfig();
  const stateRef = useColorPickerStateRef();
  const state = useColorPickerState();
  const callbacks = useColorPickerCallbacks();

  return (
    <Select
      data-slot="color-picker-format-select"
      {...selectProps}
      value={state.format}
      onValueChange={(value: unknown, _eventDetails: unknown) => {
        const format = value as ColorFormat.Type;
        stateRef.update((s) => ({ ...s, format }));
        callbacks.onFormatChange?.(format);
      }}
      disabled={config.disabled}
    >
      <SelectTrigger data-slot="color-picker-format-select-trigger" size={size ?? "sm"} className={cn(className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ColorFormat.Options.map((format) => (
          <SelectItem key={format} value={format}>
            {Str.toUpperCase(format)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// ============================================================================
// Input Components
// ============================================================================

interface ColorPickerInputProps extends Omit<React.ComponentProps<typeof Input>, "value" | "onChange" | "color"> {
  readonly withoutAlpha?: boolean;
}

/**
 * Color input component that adapts to the current format.
 */
function ColorPickerInput(props: ColorPickerInputProps): React.JSX.Element | null {
  const state = useColorPickerState();

  return Match.value(state.format).pipe(
    Match.when(ColorFormat.Enum.hex, () => <HexInput {...props} />),
    Match.when(ColorFormat.Enum.rgb, () => <RgbInput {...props} />),
    Match.when(ColorFormat.Enum.hsl, () => <HslInput {...props} />),
    Match.when(ColorFormat.Enum.hsb, () => <HsbInput {...props} />),
    Match.exhaustive
  );
}

const inputGroupItemVariants = cva(
  "h-8 [-moz-appearance:_textfield] focus-visible:z-10 focus-visible:ring-1 [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none",
  {
    variants: {
      position: {
        first: "rounded-e-none",
        middle: "-ms-px rounded-none border-l-0",
        last: "-ms-px rounded-s-none border-l-0",
        isolated: "",
      },
    },
    defaultVariants: {
      position: "isolated",
    },
  }
);

interface InputGroupItemProps extends React.ComponentProps<typeof Input>, VariantProps<typeof inputGroupItemVariants> {}

function InputGroupItem({ className, position, ...props }: InputGroupItemProps): React.JSX.Element {
  return (
    <Input data-slot="color-picker-input" className={cn(inputGroupItemVariants({ position }), className)} {...props} />
  );
}

/**
 * Hex color input component.
 */
function HexInput(props: ColorPickerInputProps): React.JSX.Element {
  const { withoutAlpha, className, ...inputProps } = props;
  const config = useColorPickerConfig();
  const stateRef = useColorPickerStateRef();
  const state = useColorPickerState();
  const callbacks = useColorPickerCallbacks();

  const hexValue = rgbToHex(state.color);
  const alphaValue = Math.round(state.color.a * 100);

  if (withoutAlpha) {
    return (
      <InputGroupItem
        aria-label="Hex color value"
        position="isolated"
        {...inputProps}
        placeholder="#000000"
        className={cn("font-mono", className)}
        value={hexValue}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          const value = event.target.value;
          F.pipe(
            parseColorString(value),
            O.map((parsedColor) => {
              const newColor = { ...parsedColor, a: state.color.a };
              const newHsv = rgbToHsv(newColor);
              stateRef.update((s) => ({ ...s, color: newColor, hsv: newHsv }));
              callbacks.onValueChange?.(colorToString(newColor, state.format));
            })
          );
        }}
        disabled={config.disabled}
      />
    );
  }

  return (
    <div data-slot="color-picker-input-wrapper" className={cn("flex items-center", className)}>
      <InputGroupItem
        aria-label="Hex color value"
        position="first"
        {...inputProps}
        placeholder="#000000"
        className="flex-1 font-mono"
        value={hexValue}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          const value = event.target.value;
          F.pipe(
            parseColorString(value),
            O.map((parsedColor) => {
              const newColor = { ...parsedColor, a: state.color.a };
              const newHsv = rgbToHsv(newColor);
              stateRef.update((s) => ({ ...s, color: newColor, hsv: newHsv }));
              callbacks.onValueChange?.(colorToString(newColor, state.format));
            })
          );
        }}
        disabled={config.disabled}
      />
      <InputGroupItem
        aria-label="Alpha transparency percentage"
        position="last"
        {...inputProps}
        placeholder="100"
        inputMode="numeric"
        pattern="[0-9]*"
        min="0"
        max="100"
        className="w-14"
        value={alphaValue}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          const value = Number.parseInt(event.target.value, 10);
          if (!Number.isNaN(value) && value >= 0 && value <= 100) {
            const newColor = { ...state.color, a: value / 100 };
            const newHsv = { ...state.hsv, a: value / 100 };
            stateRef.update((s) => ({ ...s, color: newColor, hsv: newHsv }));
            callbacks.onValueChange?.(colorToString(newColor, state.format));
          }
        }}
        disabled={config.disabled}
      />
    </div>
  );
}

/**
 * RGB color input component.
 */
function RgbInput(props: ColorPickerInputProps): React.JSX.Element {
  const { withoutAlpha, className, ...inputProps } = props;
  const config = useColorPickerConfig();
  const stateRef = useColorPickerStateRef();
  const state = useColorPickerState();
  const callbacks = useColorPickerCallbacks();

  const rValue = Math.round(state.color.r);
  const gValue = Math.round(state.color.g);
  const bValue = Math.round(state.color.b);
  const alphaValue = Math.round(state.color.a * 100);

  const onChannelChange =
    (channel: "r" | "g" | "b" | "a", max: number, isAlpha = false) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number.parseInt(event.target.value, 10);
      if (!Number.isNaN(value) && value >= 0 && value <= max) {
        const newValue = isAlpha ? value / 100 : value;
        const newColor = { ...state.color, [channel]: newValue };
        const newHsv = rgbToHsv(newColor);
        stateRef.update((s) => ({ ...s, color: newColor, hsv: newHsv }));
        callbacks.onValueChange?.(colorToString(newColor, state.format));
      }
    };

  return (
    <div data-slot="color-picker-input-wrapper" className={cn("flex items-center", className)}>
      <InputGroupItem
        aria-label="Red color component (0-255)"
        position="first"
        {...inputProps}
        placeholder="0"
        inputMode="numeric"
        pattern="[0-9]*"
        min="0"
        max="255"
        className="w-14"
        value={rValue}
        onChange={onChannelChange("r", 255)}
        disabled={config.disabled}
      />
      <InputGroupItem
        aria-label="Green color component (0-255)"
        position="middle"
        {...inputProps}
        placeholder="0"
        inputMode="numeric"
        pattern="[0-9]*"
        min="0"
        max="255"
        className="w-14"
        value={gValue}
        onChange={onChannelChange("g", 255)}
        disabled={config.disabled}
      />
      <InputGroupItem
        aria-label="Blue color component (0-255)"
        position={withoutAlpha ? "last" : "middle"}
        {...inputProps}
        placeholder="0"
        inputMode="numeric"
        pattern="[0-9]*"
        min="0"
        max="255"
        className="w-14"
        value={bValue}
        onChange={onChannelChange("b", 255)}
        disabled={config.disabled}
      />
      {!withoutAlpha && (
        <InputGroupItem
          aria-label="Alpha transparency percentage"
          position="last"
          {...inputProps}
          placeholder="100"
          inputMode="numeric"
          pattern="[0-9]*"
          min="0"
          max="100"
          className="w-14"
          value={alphaValue}
          onChange={onChannelChange("a", 100, true)}
          disabled={config.disabled}
        />
      )}
    </div>
  );
}

/**
 * HSL color input component.
 */
function HslInput(props: ColorPickerInputProps): React.JSX.Element {
  const { withoutAlpha, className, ...inputProps } = props;
  const config = useColorPickerConfig();
  const stateRef = useColorPickerStateRef();
  const state = useColorPickerState();
  const callbacks = useColorPickerCallbacks();

  // Compute HSL inline - no useMemo
  const hsl = rgbToHsl(state.color);
  const alphaValue = Math.round(state.color.a * 100);

  const onHslChannelChange =
    (channel: "h" | "s" | "l", max: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number.parseInt(event.target.value, 10);
      if (!Number.isNaN(value) && value >= 0 && value <= max) {
        const newHsl = { ...hsl, [channel]: value };
        const newColor = hslToRgb(newHsl, state.color.a);
        const newHsv = rgbToHsv(newColor);
        stateRef.update((s) => ({ ...s, color: newColor, hsv: newHsv }));
        callbacks.onValueChange?.(colorToString(newColor, state.format));
      }
    };

  return (
    <div data-slot="color-picker-input-wrapper" className={cn("flex items-center", className)}>
      <InputGroupItem
        aria-label="Hue degree (0-360)"
        position="first"
        {...inputProps}
        placeholder="0"
        inputMode="numeric"
        pattern="[0-9]*"
        min="0"
        max="360"
        className="w-14"
        value={hsl.h}
        onChange={onHslChannelChange("h", 360)}
        disabled={config.disabled}
      />
      <InputGroupItem
        aria-label="Saturation percentage (0-100)"
        position="middle"
        {...inputProps}
        placeholder="0"
        inputMode="numeric"
        pattern="[0-9]*"
        min="0"
        max="100"
        className="w-14"
        value={hsl.s}
        onChange={onHslChannelChange("s", 100)}
        disabled={config.disabled}
      />
      <InputGroupItem
        aria-label="Lightness percentage (0-100)"
        position={withoutAlpha ? "last" : "middle"}
        {...inputProps}
        placeholder="0"
        inputMode="numeric"
        pattern="[0-9]*"
        min="0"
        max="100"
        className="w-14"
        value={hsl.l}
        onChange={onHslChannelChange("l", 100)}
        disabled={config.disabled}
      />
      {!withoutAlpha && (
        <InputGroupItem
          aria-label="Alpha transparency percentage"
          position="last"
          {...inputProps}
          placeholder="100"
          inputMode="numeric"
          pattern="[0-9]*"
          min="0"
          max="100"
          className="w-14"
          value={alphaValue}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            const value = Number.parseInt(event.target.value, 10);
            if (!Number.isNaN(value) && value >= 0 && value <= 100) {
              const newColor = { ...state.color, a: value / 100 };
              const newHsv = { ...state.hsv, a: value / 100 };
              stateRef.update((s) => ({ ...s, color: newColor, hsv: newHsv }));
              callbacks.onValueChange?.(colorToString(newColor, state.format));
            }
          }}
          disabled={config.disabled}
        />
      )}
    </div>
  );
}

/**
 * HSB color input component.
 */
function HsbInput(props: ColorPickerInputProps): React.JSX.Element {
  const { withoutAlpha, className, ...inputProps } = props;
  const config = useColorPickerConfig();
  const stateRef = useColorPickerStateRef();
  const state = useColorPickerState();
  const callbacks = useColorPickerCallbacks();

  const alphaValue = Math.round(state.hsv.a * 100);

  const onHsvChannelChange =
    (channel: "h" | "s" | "v", max: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number.parseInt(event.target.value, 10);
      if (!Number.isNaN(value) && value >= 0 && value <= max) {
        const newHsv = { ...state.hsv, [channel]: value };
        const newColor = hsvToRgb(newHsv);
        stateRef.update((s) => ({ ...s, hsv: newHsv, color: newColor }));
        callbacks.onValueChange?.(colorToString(newColor, state.format));
      }
    };

  return (
    <div data-slot="color-picker-input-wrapper" className={cn("flex items-center", className)}>
      <InputGroupItem
        aria-label="Hue degree (0-360)"
        position="first"
        {...inputProps}
        placeholder="0"
        inputMode="numeric"
        pattern="[0-9]*"
        min="0"
        max="360"
        className="w-14"
        value={state.hsv.h}
        onChange={onHsvChannelChange("h", 360)}
        disabled={config.disabled}
      />
      <InputGroupItem
        aria-label="Saturation percentage (0-100)"
        position="middle"
        {...inputProps}
        placeholder="0"
        inputMode="numeric"
        pattern="[0-9]*"
        min="0"
        max="100"
        className="w-14"
        value={state.hsv.s}
        onChange={onHsvChannelChange("s", 100)}
        disabled={config.disabled}
      />
      <InputGroupItem
        aria-label="Brightness percentage (0-100)"
        position={withoutAlpha ? "last" : "middle"}
        {...inputProps}
        placeholder="0"
        inputMode="numeric"
        pattern="[0-9]*"
        min="0"
        max="100"
        className="w-14"
        value={state.hsv.v}
        onChange={onHsvChannelChange("v", 100)}
        disabled={config.disabled}
      />
      {!withoutAlpha && (
        <InputGroupItem
          aria-label="Alpha transparency percentage"
          position="last"
          {...inputProps}
          placeholder="100"
          inputMode="numeric"
          pattern="[0-9]*"
          min="0"
          max="100"
          className="w-14"
          value={alphaValue}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            const value = Number.parseInt(event.target.value, 10);
            if (!Number.isNaN(value) && value >= 0 && value <= 100) {
              const currentColor = hsvToRgb(state.hsv);
              const newColor = { ...currentColor, a: value / 100 };
              const newHsv = { ...state.hsv, a: value / 100 };
              stateRef.update((s) => ({ ...s, color: newColor, hsv: newHsv }));
              callbacks.onValueChange?.(colorToString(newColor, state.format));
            }
          }}
          disabled={config.disabled}
        />
      )}
    </div>
  );
}

// ============================================================================
// Exports
// ============================================================================

export {
  ColorPickerRoot as ColorPicker,
  ColorPickerTrigger,
  ColorPickerContent,
  ColorPickerArea,
  ColorPickerHueSlider,
  ColorPickerAlphaSlider,
  ColorPickerSwatch,
  ColorPickerEyeDropper,
  ColorPickerFormatSelect,
  ColorPickerInput,
  //
  ColorPickerRoot as Root,
  ColorPickerTrigger as Trigger,
  ColorPickerContent as Content,
  ColorPickerArea as Area,
  ColorPickerHueSlider as HueSlider,
  ColorPickerAlphaSlider as AlphaSlider,
  ColorPickerSwatch as Swatch,
  ColorPickerEyeDropper as EyeDropper,
  ColorPickerFormatSelect as FormatSelect,
  ColorPickerInput as Input,
  //
  useColorPickerState as useColorPicker,
  // Pure utility exports for testing
  hexToRgb,
  rgbToHex,
  rgbToHsv,
  hsvToRgb,
  rgbToHsl,
  hslToRgb,
  colorToString,
  parseColorString,
  // Type exports
  type ColorValue,
  type HSVColorValue,
  type HSLColorValue,
  type ColorPickerState,
};
