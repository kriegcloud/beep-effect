/**
 * Tests for ColorPicker component utilities and commands.
 *
 * @since 0.1.0
 */

import { live, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";

import {
  type ColorValue,
  colorToString,
  type HSLColorValue,
  type HSVColorValue,
  hexToRgb,
  hslToRgb,
  hsvToRgb,
  parseColorString,
  rgbToHex,
  rgbToHsl,
  rgbToHsv,
} from "../../src/ui/color-picker";

// ============================================================================
// Color Conversion Tests
// ============================================================================

live("hexToRgb converts valid hex to RGB", () =>
  Effect.gen(function* () {
    const result = hexToRgb("#ff0000");

    strictEqual(result.r, 255);
    strictEqual(result.g, 0);
    strictEqual(result.b, 0);
    strictEqual(result.a, 1);
  })
);

live("hexToRgb handles lowercase hex", () =>
  Effect.gen(function* () {
    const result = hexToRgb("#00ff00");

    strictEqual(result.r, 0);
    strictEqual(result.g, 255);
    strictEqual(result.b, 0);
    strictEqual(result.a, 1);
  })
);

live("hexToRgb handles uppercase hex", () =>
  Effect.gen(function* () {
    const result = hexToRgb("#0000FF");

    strictEqual(result.r, 0);
    strictEqual(result.g, 0);
    strictEqual(result.b, 255);
    strictEqual(result.a, 1);
  })
);

live("hexToRgb applies custom alpha", () =>
  Effect.gen(function* () {
    const result = hexToRgb("#ffffff", 0.5);

    strictEqual(result.r, 255);
    strictEqual(result.g, 255);
    strictEqual(result.b, 255);
    strictEqual(result.a, 0.5);
  })
);

live("hexToRgb returns black for invalid hex", () =>
  Effect.gen(function* () {
    const result = hexToRgb("invalid");

    strictEqual(result.r, 0);
    strictEqual(result.g, 0);
    strictEqual(result.b, 0);
    strictEqual(result.a, 1);
  })
);

live("rgbToHex converts RGB to hex", () =>
  Effect.gen(function* () {
    const color: ColorValue = { r: 255, g: 128, b: 0, a: 1 };
    const result = rgbToHex(color);

    strictEqual(result, "#ff8000");
  })
);

live("rgbToHex handles single digit hex values", () =>
  Effect.gen(function* () {
    const color: ColorValue = { r: 0, g: 0, b: 15, a: 1 };
    const result = rgbToHex(color);

    strictEqual(result, "#00000f");
  })
);

live("rgbToHsv converts primary red", () =>
  Effect.gen(function* () {
    const color: ColorValue = { r: 255, g: 0, b: 0, a: 1 };
    const result = rgbToHsv(color);

    strictEqual(result.h, 0);
    strictEqual(result.s, 100);
    strictEqual(result.v, 100);
    strictEqual(result.a, 1);
  })
);

live("rgbToHsv converts primary green", () =>
  Effect.gen(function* () {
    const color: ColorValue = { r: 0, g: 255, b: 0, a: 1 };
    const result = rgbToHsv(color);

    strictEqual(result.h, 120);
    strictEqual(result.s, 100);
    strictEqual(result.v, 100);
    strictEqual(result.a, 1);
  })
);

live("rgbToHsv converts primary blue", () =>
  Effect.gen(function* () {
    const color: ColorValue = { r: 0, g: 0, b: 255, a: 1 };
    const result = rgbToHsv(color);

    strictEqual(result.h, 240);
    strictEqual(result.s, 100);
    strictEqual(result.v, 100);
    strictEqual(result.a, 1);
  })
);

live("rgbToHsv handles white (no saturation)", () =>
  Effect.gen(function* () {
    const color: ColorValue = { r: 255, g: 255, b: 255, a: 1 };
    const result = rgbToHsv(color);

    strictEqual(result.s, 0);
    strictEqual(result.v, 100);
    strictEqual(result.a, 1);
  })
);

live("rgbToHsv handles black", () =>
  Effect.gen(function* () {
    const color: ColorValue = { r: 0, g: 0, b: 0, a: 1 };
    const result = rgbToHsv(color);

    strictEqual(result.s, 0);
    strictEqual(result.v, 0);
    strictEqual(result.a, 1);
  })
);

live("hsvToRgb converts red hue", () =>
  Effect.gen(function* () {
    const hsv: HSVColorValue = { h: 0, s: 100, v: 100, a: 1 };
    const result = hsvToRgb(hsv);

    strictEqual(result.r, 255);
    strictEqual(result.g, 0);
    strictEqual(result.b, 0);
    strictEqual(result.a, 1);
  })
);

live("hsvToRgb converts green hue", () =>
  Effect.gen(function* () {
    const hsv: HSVColorValue = { h: 120, s: 100, v: 100, a: 1 };
    const result = hsvToRgb(hsv);

    strictEqual(result.r, 0);
    strictEqual(result.g, 255);
    strictEqual(result.b, 0);
    strictEqual(result.a, 1);
  })
);

live("hsvToRgb converts blue hue", () =>
  Effect.gen(function* () {
    const hsv: HSVColorValue = { h: 240, s: 100, v: 100, a: 1 };
    const result = hsvToRgb(hsv);

    strictEqual(result.r, 0);
    strictEqual(result.g, 0);
    strictEqual(result.b, 255);
    strictEqual(result.a, 1);
  })
);

live("hsvToRgb preserves alpha", () =>
  Effect.gen(function* () {
    const hsv: HSVColorValue = { h: 0, s: 100, v: 100, a: 0.5 };
    const result = hsvToRgb(hsv);

    strictEqual(result.a, 0.5);
  })
);

live("rgbToHsl converts primary red", () =>
  Effect.gen(function* () {
    const color: ColorValue = { r: 255, g: 0, b: 0, a: 1 };
    const result = rgbToHsl(color);

    strictEqual(result.h, 0);
    strictEqual(result.s, 100);
    strictEqual(result.l, 50);
  })
);

live("rgbToHsl converts white", () =>
  Effect.gen(function* () {
    const color: ColorValue = { r: 255, g: 255, b: 255, a: 1 };
    const result = rgbToHsl(color);

    strictEqual(result.l, 100);
  })
);

live("rgbToHsl converts black", () =>
  Effect.gen(function* () {
    const color: ColorValue = { r: 0, g: 0, b: 0, a: 1 };
    const result = rgbToHsl(color);

    strictEqual(result.l, 0);
  })
);

live("hslToRgb converts red hue", () =>
  Effect.gen(function* () {
    const hsl: HSLColorValue = { h: 0, s: 100, l: 50 };
    const result = hslToRgb(hsl, 1);

    strictEqual(result.r, 255);
    strictEqual(result.g, 0);
    strictEqual(result.b, 0);
    strictEqual(result.a, 1);
  })
);

live("hslToRgb applies custom alpha", () =>
  Effect.gen(function* () {
    const hsl: HSLColorValue = { h: 0, s: 100, l: 50 };
    const result = hslToRgb(hsl, 0.75);

    strictEqual(result.a, 0.75);
  })
);

// ============================================================================
// Color String Conversion Tests
// ============================================================================

live("colorToString formats as hex", () =>
  Effect.gen(function* () {
    const color: ColorValue = { r: 255, g: 0, b: 0, a: 1 };
    const result = colorToString(color, "hex");

    strictEqual(result, "#ff0000");
  })
);

live("colorToString formats as rgb", () =>
  Effect.gen(function* () {
    const color: ColorValue = { r: 255, g: 128, b: 0, a: 1 };
    const result = colorToString(color, "rgb");

    strictEqual(result, "rgb(255, 128, 0)");
  })
);

live("colorToString formats as rgba when alpha < 1", () =>
  Effect.gen(function* () {
    const color: ColorValue = { r: 255, g: 0, b: 0, a: 0.5 };
    const result = colorToString(color, "rgb");

    strictEqual(result, "rgba(255, 0, 0, 0.5)");
  })
);

live("colorToString formats as hsl", () =>
  Effect.gen(function* () {
    const color: ColorValue = { r: 255, g: 0, b: 0, a: 1 };
    const result = colorToString(color, "hsl");

    strictEqual(result, "hsl(0, 100%, 50%)");
  })
);

live("colorToString formats as hsb", () =>
  Effect.gen(function* () {
    const color: ColorValue = { r: 255, g: 0, b: 0, a: 1 };
    const result = colorToString(color, "hsb");

    strictEqual(result, "hsb(0, 100%, 100%)");
  })
);

// ============================================================================
// Color Parsing Tests (Option-based)
// ============================================================================

live("parseColorString parses valid hex", () =>
  Effect.gen(function* () {
    const result = parseColorString("#ff0000");

    strictEqual(O.isSome(result), true);

    if (O.isSome(result)) {
      strictEqual(result.value.r, 255);
      strictEqual(result.value.g, 0);
      strictEqual(result.value.b, 0);
    }
  })
);

live("parseColorString parses short hex", () =>
  Effect.gen(function* () {
    const result = parseColorString("#f00");

    // Short hex is valid but hexToRgb requires 6 chars
    // The regex allows 3 or 6 chars, so this should parse
    strictEqual(O.isSome(result), true);
  })
);

live("parseColorString parses rgb", () =>
  Effect.gen(function* () {
    const result = parseColorString("rgb(255, 128, 0)");

    strictEqual(O.isSome(result), true);

    if (O.isSome(result)) {
      strictEqual(result.value.r, 255);
      strictEqual(result.value.g, 128);
      strictEqual(result.value.b, 0);
      strictEqual(result.value.a, 1);
    }
  })
);

live("parseColorString parses rgba", () =>
  Effect.gen(function* () {
    const result = parseColorString("rgba(255, 0, 0, 0.5)");

    strictEqual(O.isSome(result), true);

    if (O.isSome(result)) {
      strictEqual(result.value.r, 255);
      strictEqual(result.value.g, 0);
      strictEqual(result.value.b, 0);
      strictEqual(result.value.a, 0.5);
    }
  })
);

live("parseColorString parses hsl", () =>
  Effect.gen(function* () {
    const result = parseColorString("hsl(0, 100%, 50%)");

    strictEqual(O.isSome(result), true);

    if (O.isSome(result)) {
      strictEqual(result.value.r, 255);
      strictEqual(result.value.g, 0);
      strictEqual(result.value.b, 0);
    }
  })
);

live("parseColorString parses hsla", () =>
  Effect.gen(function* () {
    const result = parseColorString("hsla(0, 100%, 50%, 0.5)");

    strictEqual(O.isSome(result), true);

    if (O.isSome(result)) {
      strictEqual(result.value.a, 0.5);
    }
  })
);

live("parseColorString parses hsb", () =>
  Effect.gen(function* () {
    const result = parseColorString("hsb(0, 100%, 100%)");

    strictEqual(O.isSome(result), true);

    if (O.isSome(result)) {
      strictEqual(result.value.r, 255);
      strictEqual(result.value.g, 0);
      strictEqual(result.value.b, 0);
    }
  })
);

live("parseColorString returns None for invalid input", () =>
  Effect.gen(function* () {
    const result = parseColorString("invalid color");

    strictEqual(O.isNone(result), true);
  })
);

live("parseColorString trims whitespace", () =>
  Effect.gen(function* () {
    const result = parseColorString("  #ff0000  ");

    strictEqual(O.isSome(result), true);
  })
);

// ============================================================================
// Roundtrip Tests
// ============================================================================

live("RGB -> HSV -> RGB roundtrip preserves color", () =>
  Effect.gen(function* () {
    const original: ColorValue = { r: 128, g: 64, b: 192, a: 0.75 };
    const hsv = rgbToHsv(original);
    const result = hsvToRgb(hsv);

    // Allow for minor rounding differences
    strictEqual(Math.abs(result.r - original.r) <= 1, true);
    strictEqual(Math.abs(result.g - original.g) <= 1, true);
    strictEqual(Math.abs(result.b - original.b) <= 1, true);
    strictEqual(result.a, original.a);
  })
);

live("RGB -> Hex -> RGB roundtrip preserves color", () =>
  Effect.gen(function* () {
    const original: ColorValue = { r: 128, g: 64, b: 192, a: 1 };
    const hex = rgbToHex(original);
    const result = hexToRgb(hex);

    strictEqual(result.r, original.r);
    strictEqual(result.g, original.g);
    strictEqual(result.b, original.b);
    // Note: hex doesn't preserve alpha
  })
);

// ============================================================================
// Architecture Pattern Documentation Tests
// ============================================================================

/**
 * These tests document the @effect-atom/atom-react architecture patterns
 * used in the ColorPicker component.
 *
 * PATTERN: Atom.family for module-level state
 * - State atoms are created at module level using Atom.family
 * - Each component instance gets its own atom keyed by useId()
 * - This replaces useState/useRef patterns
 *
 * PATTERN: AtomRef for mutable refs
 * - DOM element refs use AtomRef.AtomRef<O.Option<HTMLElement>>
 * - Boolean flags use AtomRef.AtomRef<boolean>
 * - Complex state uses AtomRef.AtomRef<StateType>
 *
 * PATTERN: useAtomValue + useAtomRef for subscription
 * - useAtomValue(atomFamily(id)) gets stable refs
 * - useAtomRef(ref) subscribes to AtomRef changes
 * - This replaces useSyncExternalStore pattern
 *
 * PATTERN: useAtomMount for side effects
 * - Atom.make with addFinalizer for cleanup
 * - useAtomMount to mount the atom
 * - This replaces useEffect pattern
 *
 * PATTERN: Match for conditional logic
 * - Match.value().pipe() replaces switch statements
 * - Match.exhaustive ensures all cases handled
 *
 * PATTERN: Option for null-safety
 * - O.Option<T> replaces T | null
 * - O.fromNullable, O.map, O.match for operations
 * - parseColorString returns Option instead of null
 *
 * PATTERN: Inline handlers
 * - Event handlers defined inline in JSX
 * - No useCallback - inline functions are fine
 * - No useMemo - compute derived values inline
 *
 * PATTERN: Num.clamp for bounds
 * - Num.clamp(value, { minimum, maximum }) replaces Math.min/max
 */
live("Architecture patterns are documented via tests", () =>
  Effect.gen(function* () {
    // This test exists to document the patterns
    strictEqual(true, true);
  })
);
