// Shared re-quoting semantics: the ONE definition of "which scalar can
// be re-quoted to the target style, and with what replacement text", so the
// `quoted-strings` lint fix and `YamlFormat`'s opt-in `requoteScalars` option
// cannot drift into two dialects of "re-quotable".
//
// Two modes, deliberately distinct:
//
// - `"conservative"` is the lint fix's shipped behavior, byte-exact: a quote
//   swap or a wrap happens only when the raw inner text IS the parsed value
//   (no escapes, no doubled quotes in play) and the target quote never
//   appears in it — otherwise no replacement. The lint fix delegates here so
//   its behavior is pinned by this module rather than re-derived.
// - `"escaping"` is the format path's semantics-preserving transform: it
//   re-renders the parsed value through the stringifier's own quote
//   renderers, applying proper double-quote escaping for single→double and
//   `''` doubling for double→single. Double→single returns no replacement
//   whenever the value carries characters single-quoted style cannot express
//   (newlines, tabs, carriage returns, control and other non-printable
//   characters — single quotes can escape nothing but `'`). Only
//   already-quoted, single-line, untagged, unanchored source scalars are
//   candidates: plain scalars stay plain and block scalars stay block.
//
// The escaping mode's replacement text comes from `renderDoubleQuoted` /
// `renderSingleQuoted` — the same functions the stringifier itself uses to
// emit a scalar of that style — so a format-path caller that flips a node's
// `style` and re-stringifies produces exactly this replacement.
//
// Like the stringifier, this module reuses the public AST's scalar style;
// YamlNode has no runtime dependency on this module, so initialization stays acyclic.

import { $YamlId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema/LiteralKit";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { ScalarStyle } from "../YamlNode.ts";
import { renderDoubleQuoted, renderSingleQuoted } from "./stringifier.ts";

const $I = $YamlId.create("internal/requote");

/**
 * The structural slice of a scalar node the re-quoting decision reads —
 * satisfied by a public `YamlScalar` without this module depending on the
 * class itself.
 *
 * **Example** (Describe a source scalar span)
 *
 * ```ts
 * import { RequoteScalarInput } from "@beep/yaml/internal/requote"
 * const scalar = RequoteScalarInput.make({ value: "hello", style: "plain", offset: 0, length: 5 })
 * console.log(scalar.length) // 5
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export class RequoteScalarInput extends S.Opaque<RequoteScalarInput, { readonly brand: unique symbol }>()(
  S.Struct({
    value: S.Unknown.pipe(
      $I.annoteKey("RequoteScalarInput.value", { description: "Parsed scalar value considered for quote conversion." })
    ),
    style: ScalarStyle.pipe(
      $I.annoteKey("RequoteScalarInput.style", { description: "Presentation style of the source scalar." })
    ),
    tag: S.optionalKey(S.String).pipe(
      $I.annoteKey("RequoteScalarInput.tag", { description: "Optional tag preventing quote conversion when present." })
    ),
    anchor: S.optionalKey(S.String).pipe(
      $I.annoteKey("RequoteScalarInput.anchor", {
        description: "Optional anchor preventing quote conversion when present.",
      })
    ),
    offset: S.Finite.pipe(
      $I.annoteKey("RequoteScalarInput.offset", { description: "Start of the raw scalar span in UTF-16 code units." })
    ),
    length: S.Finite.pipe(
      $I.annoteKey("RequoteScalarInput.length", { description: "Length of the raw scalar span in UTF-16 code units." })
    ),
  }).pipe(
    $I.annoteSchema("RequoteScalarInput", {
      description: "Structural scalar payload accepted without per-call decoding by quote conversion.",
    })
  )
) {}

/**
 * Selects the safety policy for changing a scalar's quote style.
 *
 * **Details**
 *
 * See the module header: `"conservative"` = lint-fix semantics, `"escaping"` = format-path semantics.
 *
 * **Example** (Choose value-based quote escaping)
 *
 * ```ts
 * import type { RequoteMode } from "@beep/yaml/internal/requote"
 * const mode: RequoteMode = "escaping"
 * console.log(mode) // escaping
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const RequoteMode = LiteralKit(["conservative", "escaping"]).pipe(
  $I.annoteSchema("RequoteMode", {
    description: "Safety policies for byte-preserving or value-preserving quote conversion.",
  })
);

/**
 * The quote-conversion policy inferred from its literal vocabulary.
 *
 * @category type-level
 * @since 0.0.0
 */
export type RequoteMode = typeof RequoteMode.Type;

/**
 * True when `value` can be carried by a single-quoted flow scalar on one
 * line. Single-quoted style has exactly one escape (`''`), so a character
 * double-quote escape sequences exist to encode — newline, carriage return,
 * tab, C0 controls, DEL and the C1 range — has no single-quoted spelling and
 * makes the conversion impossible rather than lossy-but-tempting.
 */
function isSingleQuotable(value: string): boolean {
  for (let i = 0; i < value.length; i++) {
    if (singleQuoteUnsafe.test(Str.slice(i, i + 1)(value))) return false;
  }
  return true;
}

// Tab, LF and CR are the escapable whitespace; DEL and the C1 range join the
// C0 controls as characters single-quoted style cannot spell.
const singleQuoteUnsafe = /[\x00-\x1f\x7f-\x9f]/;

/**
 * The replacement raw text that re-quotes `scalar` with `quote`, or
 * `None` when no value-preserving replacement exists under `mode`
 * (skipping is always correct; corrupting never is).
 *
 * **Example** (Convert a single-quoted scalar)
 *
 * ```ts
 * import { requoteScalarText } from "@beep/yaml/internal/requote"
 * import * as O from "effect/Option"
 * import { RequoteScalarInput } from "@beep/yaml/internal/requote"
 *
 * const scalar = RequoteScalarInput.make({ value: "hello", style: "single-quoted", offset: 0, length: 7 })
 * console.log(O.getOrUndefined(requoteScalarText("'hello'", scalar, '"', "escaping"))) // "hello"
 * ```
 *
 * @category formatting
 * @since 0.0.0
 */
export function requoteScalarText(
  text: string,
  ...[scalar, quote, mode]: [
    scalar: S.Struct.Type<typeof RequoteScalarInput.fields>,
    quote: '\"' | "'",
    mode: RequoteMode,
  ]
): O.Option<string> {
  if (!isRequoteCandidate(scalar)) return O.none();
  const raw = Str.slice(scalar.offset, scalar.offset + scalar.length)(text);
  // A multi-line source scalar folds line breaks into its value; re-quoting
  // it from the value would collapse the layout, so it is skipped whole.
  // A lone `\r` is a YAML line break too (b-carriage-return), so a scalar
  // folded on CR-only breaks is just as multi-line as an LF one.
  if (Str.includes("\n")(raw) || Str.includes("\r")(raw)) return O.none();
  return mode === "conservative"
    ? requoteConservative(raw, scalar.style, scalar.value, quote)
    : requoteEscaping(scalar.style, scalar.value, quote);
}

type RequoteCandidate = S.Struct.Type<typeof RequoteScalarInput.fields> & { readonly value: string };

const isRequoteCandidate = (scalar: S.Struct.Type<typeof RequoteScalarInput.fields>): scalar is RequoteCandidate =>
  scalar.tag === undefined && scalar.anchor === undefined && P.isString(scalar.value);

// Only when the raw inner text IS the value (no escapes, no doubled
// quotes) and the target quote never appears in it does requoting
// provably preserve the value.
function requoteConservative(raw: string, style: ScalarStyle, value: string, quote: '"' | "'"): O.Option<string> {
  const inner = style === "plain" ? raw : Str.slice(1, -1)(raw);
  if (inner !== value || Str.includes(quote)(inner)) return O.none();
  if (quote === '"' && Str.includes("\\")(inner)) return O.none();
  return O.some(`${quote}${inner}${quote}`);
}

// Escaping mode: quote-style conversion only — the source must already be
// quoted in the opposite style. Plain scalars stay plain, block scalars
// stay block, same-style scalars need nothing.
function requoteEscaping(style: ScalarStyle, value: string, quote: '"' | "'"): O.Option<string> {
  if (quote === '"') {
    return style === "single-quoted" ? O.some(renderDoubleQuoted(value)) : O.none();
  }
  return style === "double-quoted" && isSingleQuotable(value) ? O.some(renderSingleQuoted(value)) : O.none();
}
