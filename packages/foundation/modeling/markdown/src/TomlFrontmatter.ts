/**
 * The toml frontmatter codec module over `@beep/toml`.
 *
 * **Details**
 *
 * Importing this module is what loads the toml engine; a consumer who
 * never touches toml frontmatter never loads it.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { Toml } from "@beep/toml/Toml";
import { FrontmatterCodec } from "./Frontmatter.ts";

/**
 * The toml frontmatter codec, over `@beep/toml`.
 *
 * **Details**
 *
 * Decodes a `+++`-fenced capture's raw value with `Toml.parse`, so the toml
 * engine's nesting depth cap fails through the typed channel: a hostile
 * frontmatter block surfaces as a {@link FrontmatterDecodeError} carrying the
 * `TomlParseError` structurally, never a defect. An empty capture decodes to
 * an empty table (`{}`), toml's empty-document value.
 *
 * Encodes with `Toml.stringify`; a value toml cannot represent fails as a
 * {@link FrontmatterEncodeError} carrying the `TomlStringifyError`
 * structurally. An empty object encodes to the **empty body** — the mirror
 * of an empty capture decoding to `{}` — rendering as adjacent `+++` fences,
 * so `set`-then-decode recovers `{}` exactly.
 *
 * `@beep/toml` is an optional peer — importing this module is what
 * requires it; a consumer who never touches toml frontmatter never loads the
 * toml engine.
 *
 * **Example** (Encode an empty frontmatter object)
 *
 * ```ts
 * import { TomlFrontmatter } from "@beep/markdown/TomlFrontmatter"
 * import * as Effect from "effect/Effect"
 *
 * const encoded = Effect.runSync(TomlFrontmatter.encode({}))
 * console.log(JSON.stringify(encoded)) // ""
 * ```
 *
 * @public
 * @category codecs
 * @since 0.0.0
 */
export const TomlFrontmatter: FrontmatterCodec = FrontmatterCodec.make(
  "toml",
  (text) => Toml.parseResult(text),
  (data) => Toml.stringifyResult(data)
);
