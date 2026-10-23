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
import { YamlDocument } from "@beep/yaml/YamlDocument";
import * as A from "effect/Array";
import { flow } from "effect/Function";
import * as Match from "effect/Match";
import * as MutableHashMap from "effect/MutableHashMap";
import * as O from "effect/Option";
import * as Result from "effect/Result";
import * as S from "effect/Schema";
import { FrontmatterCodec, FrontmatterKeyError } from "./Frontmatter.ts";
import type { YamlMap, YamlNode, YamlPair, YamlSeq } from "@beep/yaml/YamlNode";
import type { FrontmatterKeyIssue } from "./Frontmatter.ts";

// The two spellings of the core `!!set` tag the AST keeps verbatim.
const isSetTag = S.is(S.Literals(["!!set", "!<tag:yaml.org,2002:set>"]));

const decodeDocument = S.decodeResult(YamlDocument.schema());

/** Anchors registered so far, in document order: an alias sees the latest. */
type Anchors = MutableHashMap.MutableHashMap<string, YamlNode>;

const keyError = (reason: FrontmatterKeyIssue, node: YamlNode): FrontmatterKeyError =>
  FrontmatterKeyError.make({ reason, offset: node.offset, length: node.length });

const isCollection = (node: YamlNode): node is YamlMap | YamlSeq => node._tag === "YamlMap" || node._tag === "YamlSeq";

const register = (anchors: Anchors, node: YamlNode): void => {
  if (node._tag !== "YamlAlias" && node.anchor !== undefined) MutableHashMap.set(anchors, node.anchor, node);
};

// A key with no JSON-string reading: a collection, or an alias to one.
const isComplexKey = (anchors: Anchors, key: YamlNode): boolean =>
  key._tag === "YamlAlias" ? O.exists(MutableHashMap.get(anchors, key.name), isCollection) : isCollection(key);

const pairIssue = (anchors: Anchors, pair: YamlPair): O.Option<FrontmatterKeyError> => {
  if (isComplexKey(anchors, pair.key)) return O.some(keyError("ComplexKey", pair.key));
  register(anchors, pair.key);
  return O.flatMap(O.fromNullOr(pair.value), (value) => firstKeyIssue(anchors, value));
};

const collectionIssue = (anchors: Anchors, node: YamlMap | YamlSeq): O.Option<FrontmatterKeyError> =>
  node.tag !== undefined && isSetTag(node.tag)
    ? O.some(keyError("SetCollection", node))
    : node._tag === "YamlMap"
      ? A.findFirst(node.items, (pair) => pairIssue(anchors, pair))
      : A.findFirst(node.items, (item) => firstKeyIssue(anchors, item));

// The first key or collection, in document order, with no faithful
// JSON-object reading. Recursion is bounded by the engine's nesting cap.
const firstKeyIssue = (anchors: Anchors, node: YamlNode): O.Option<FrontmatterKeyError> => {
  register(anchors, node);
  return Match.value(node).pipe(
    Match.tags({ YamlMap: (map) => collectionIssue(anchors, map), YamlSeq: (seq) => collectionIssue(anchors, seq) }),
    Match.orElse(() => O.none())
  );
};

// Runs after a successful value parse, so the document parse cannot fail on
// its own; its failure channel is kept rather than asserted away.
const rejectNonJsonKeys = (text: string): Result.Result<void, S.SchemaError | FrontmatterKeyError> =>
  Result.flatMap(
    decodeDocument(text),
    flow(
      (document) => O.flatMap(O.fromNullOr(document.contents), (root) => firstKeyIssue(MutableHashMap.empty(), root)),
      O.match({ onNone: () => Result.void, onSome: Result.fail })
    )
  );

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
 * A frontmatter value is a JSON-compatible object, so yaml that has no
 * faithful JSON reading fails typed instead of being rewritten: a
 * collection mapping key (`? [a, b]`), an alias key whose anchor is a
 * collection, and a `!!set` collection each surface as a
 * {@link FrontmatterDecodeError} carrying a {@link FrontmatterKeyError}
 * (`"ComplexKey"` or `"SetCollection"`) at the offending node. Scalar keys,
 * scalar alias keys and `<<` keys still decode; a `!!set` spelled through a
 * custom `%TAG` handle is not recognized. `Yaml.parse` itself keeps its
 * projection for its other consumers.
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
  (text) => Result.flatMap(Yaml.parseResult(text), (data) => Result.map(rejectNonJsonKeys(text), () => data)),
  (data) => Yaml.stringifyResult(data)
);
