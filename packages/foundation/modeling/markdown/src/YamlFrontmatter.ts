/**
 * The yaml frontmatter codec module over `@beep/yaml`.
 *
 * **Details**
 *
 * Importing this module is what loads the yaml engine; a consumer who
 * never touches yaml frontmatter never loads it.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { Yaml } from "@beep/yaml/Yaml";
import { FrontmatterCodec } from "./Frontmatter.ts";

/**
 * The yaml frontmatter codec, over `@beep/yaml`.
 *
 * **Details**
 *
 * Decodes a `---`-fenced capture's raw value with `Yaml.parse`, so the yaml
 * engine's input hardening — the alias-expansion budget and the nesting depth
 * cap — fails through the typed channel: a hostile frontmatter block surfaces
 * as a {@link FrontmatterDecodeError} carrying the `YamlParseError`
 * structurally, never a defect. An empty capture decodes to `null`, yaml's
 * empty-document value.
 *
 * Encodes with `Yaml.stringify`; an unserializable value fails as a
 * {@link FrontmatterEncodeError} carrying the `YamlStringifyError`
 * structurally. An empty object encodes to the flow mapping `{}` —
 * deliberately not an empty body, which would round-trip as `null` — so
 * `set`-then-decode recovers `{}` exactly.
 *
 * `@beep/yaml` is an optional peer — importing this module is what
 * requires it; a consumer who never touches yaml frontmatter never loads the
 * yaml engine.
 *
 * **Example** (Encode an empty frontmatter object)
 *
 * ```ts
 * import { YamlFrontmatter } from "@beep/markdown/YamlFrontmatter"
 * import * as Effect from "effect/Effect"
 *
 * const encoded = Effect.runSync(YamlFrontmatter.encode({}))
 * console.log(JSON.stringify(encoded)) // "{}\n"
 * ```
 *
 * @public
 * @category codecs
 * @since 0.0.0
 */
export const YamlFrontmatter: FrontmatterCodec = FrontmatterCodec.make(
  "yaml",
  (text) => Yaml.parseResult(text),
  (data) => Yaml.stringifyResult(data)
);
