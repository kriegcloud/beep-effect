/**
 * The json frontmatter codec module over `@beep/jsonc`.
 *
 * **Details**
 *
 * Importing this module is what loads the json engine; a consumer who
 * never touches json frontmatter never loads it.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { Jsonc } from "@beep/jsonc/Jsonc";
import { FrontmatterCodec } from "./Frontmatter.ts";

/**
 * The json frontmatter codec, over `@beep/jsonc`.
 *
 * **Details**
 *
 * Decodes a `---json`-fenced capture's raw value with `Jsonc.parse`, so the
 * jsonc engine's nesting depth cap fails through the typed channel: a hostile
 * frontmatter block surfaces as a {@link FrontmatterDecodeError} carrying the
 * `JsoncParseError` structurally, never a defect. JSONC being a JSON
 * superset, comments and trailing commas in a json capture decode rather than
 * fail — deliberate leniency, matching the kit's one JSON-family engine. An
 * empty capture fails typed: unlike yaml and toml, JSON has no
 * empty-document value.
 *
 * Encodes with `Jsonc.stringify` — plain 2-space JSON emission, never
 * comments; a circular reference, a `bigint` or a top-level unrepresentable
 * value fails as a {@link FrontmatterEncodeError} carrying the
 * `JsoncStringifyError` structurally. An empty object encodes to `{}`.
 *
 * `@beep/jsonc` is an optional peer — importing this module is what
 * requires it; a consumer who never touches json frontmatter never loads the
 * jsonc engine.
 *
 * **Example** (Decode a JSON capture and encode an empty object)
 *
 * ```ts
 * import { JsonFrontmatter } from "@beep/markdown/JsonFrontmatter";
 * import { Frontmatter } from "@beep/markdown/MarkdownNode";
 * import * as Effect from "effect/Effect";
 *
 * const node = Frontmatter.make({ format: "json", value: "{\"title\":\"Hi\"}" });
 * const data = Effect.runSync(JsonFrontmatter.decode(node));
 * console.log(JSON.stringify(data)); // {"title":"Hi"}
 * console.log(Effect.runSync(JsonFrontmatter.encode({}))); // {}
 * ```
 *
 * @public
 * @category codecs
 * @since 0.0.0
 */
export const JsonFrontmatter: FrontmatterCodec = FrontmatterCodec.make(
  "json",
  (text) => Jsonc.parseResult(text),
  (data) => Jsonc.stringifyResult(data)
);
