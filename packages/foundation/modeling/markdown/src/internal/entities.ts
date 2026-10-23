// Ported from commonmark.js@0.31.2 (https://github.com/commonmark/commonmark.js)
// Copyright (c) 2014-2023 John MacFarlane
// License: BSD-2-Clause
//
// Character-reference decoding. Upstream delegates the whole job to the
// `entities` package's `decodeHTMLStrict`; this package owns its engine, so
// the named references come from `entityMap.ts`, generated once from that
// package's data and committed (see `__test__/tools/generate-entities.ts`).
// The numeric forms need no table at all and decode here.

import * as HashMap from "effect/HashMap";
import * as O from "effect/Option";
import * as Str from "effect/String";
import { ENTITY_MAP } from "./entityMap.ts";

/** The largest code point Unicode defines. */
const MAX_CODE_POINT = 0x10ffff;

/**
 * Decodes one character reference, brackets included (`&#35;`, `&amp;`).
 *
 * **Details**
 *
 * Named references require a known name and a terminating semicolon. Numeric
 * references accept decimal or hexadecimal digits; zero, surrogate code points
 * and values above the Unicode range decode to the replacement character.
 *
 * **Gotchas**
 *
 * Returns `O.none()` when the reference is not one this engine can decode,
 * which the caller must render as the literal source text — never as an
 * empty string.
 *
 * **Example** (Decode named and numeric references)
 *
 * ```ts
 * import * as O from "effect/Option"
 * import { decodeEntity } from "@beep/markdown/internal/entities"
 *
 * console.log(O.getOrElse(decodeEntity("&amp;"), () => "missing")) // &
 * console.log(O.getOrElse(decodeEntity("&#35;"), () => "missing")) // #
 * console.log(O.getOrElse(decodeEntity("&#x41;"), () => "missing")) // A
 * console.log(O.getOrElse(decodeEntity("&#0;"), () => "missing")) // �
 * console.log(O.isNone(decodeEntity("&unknown;"))) // true
 * ```
 *
 * @category decoding
 * @since 0.0.0
 */
export const decodeEntity = (entity: string): O.Option<string> => {
  if (!Str.startsWith("&")(entity) || !Str.endsWith(";")(entity)) {
    return O.none();
  }

  const body = Str.slice(1, -1)(entity);
  // A named reference. An unknown name is not an error — the caller keeps
  // the literal source text, as upstream's decoder does.
  return Str.startsWith("#")(body) ? decodeNumeric(body) : HashMap.get(ENTITY_MAP, body);
};

/** A numeric reference body, `#` included: `#x` and hex digits, or decimal digits. */
const reHexBody = /^#[xX][0-9a-fA-F]+$/;
const reDecimalBody = /^#[0-9]+$/;

/** Decode a numeric reference body such as `#x41` or `#65`. */
const decodeNumeric = (body: string): O.Option<string> => {
  if (reHexBody.test(body)) {
    return O.some(codePointText(Number.parseInt(Str.slice(2)(body), 16)));
  }
  return reDecimalBody.test(body) ? O.some(codePointText(Number.parseInt(Str.slice(1)(body), 10))) : O.none();
};

/**
 * The character a numeric reference names. The spec: U+0000, an
 * out-of-range value and a surrogate all decode to the replacement character
 * rather than failing.
 */
const codePointText = (code: number): string =>
  code === 0 || code > MAX_CODE_POINT || (code >= 0xd800 && code <= 0xdfff) ? "\uFFFD" : String.fromCodePoint(code);
