/**
 * The per-grammar locator readers for `beep models`.
 *
 * **Details**
 *
 * One reader per {@link Locator} tag, each reading the text it is handed and
 * performing no I/O of its own. Every reader is line- or node-anchored rather
 * than whole-file, so a future writer can edit in place without rewriting a
 * file a machine appends to.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import { A, flow, O, P, pipe, R, Str } from "@beep/utils";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import { dual } from "effect/Function";
import * as Layer from "effect/Layer";
import * as Match from "effect/Match";
import * as Regex from "effect/RegExp";
import { XMLParser } from "fast-xml-parser";
import { isMap, isScalar as isYamlScalar, parseDocument, visit } from "yaml";
import { ModelsLocatorError } from "./Models.errors.ts";
import { parseJsonText } from "./Models.paths.ts";
import { extractGeneratedBlock } from "./Models.render.ts";
import { modelsShellScope, modelsShellWords } from "./Models.spans.ts";
import type { Locator } from "./Models.manifest.schemas.ts";
import type { ModelsTargetFile } from "./Models.paths.ts";

const $I = $RepoCliId.create("commands/Models/Models.locator.service");

const firstMatch = (lines: ReadonlyArray<string>, pattern: RegExp): O.Option<string> =>
  pipe(
    lines,
    A.map((line) => O.fromNullishOr(pattern.exec(line))),
    O.firstSomeOf,
    O.flatMap((match) => O.fromNullishOr(match[1]))
  );

/**
 * Reads the value a locator currently points at.
 *
 * @category services
 * @since 0.0.0
 */
export interface ModelsLocatorReaderShape {
  readonly read: (file: ModelsTargetFile, locator: Locator) => Effect.Effect<O.Option<string>, ModelsLocatorError>;
}

/**
 * Per-grammar readers for every locator tag.
 *
 * **Example** (Describe a locator read)
 *
 * ```ts
 * import { LocatorBinding, ModelsLocatorReader, ModelsTargetFile } from "@beep/repo-cli/commands/Models"
 * import * as Effect from "effect/Effect"
 *
 * const program = ModelsLocatorReader.use((reader) =>
 *   reader.read(
 *     ModelsTargetFile.make({ root: "repo", absolutePath: "/repo/a.ts", content: 'export const x = "y";' }),
 *     {
 *       _tag: "ts-literal",
 *       binding: LocatorBinding.make({ role: "qa.judge", surface: "codex-plugin", field: "model" }),
 *       render: { _tag: "verbatim" },
 *       symbol: "x"
 *     }
 *   )
 * )
 * console.log(Effect.isEffect(program)) // true
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export class ModelsLocatorReader extends Context.Service<ModelsLocatorReader, ModelsLocatorReaderShape>()(
  $I`ModelsLocatorReader`
) {}

const unquote = (value: string): string =>
  pipe(Str.trim(value), (trimmed) =>
    (Str.startsWith('"')(trimmed) && Str.endsWith('"')(trimmed)) ||
    (Str.startsWith("'")(trimmed) && Str.endsWith("'")(trimmed))
      ? Str.slice(1, Str.length(trimmed) - 1)(trimmed)
      : trimmed
  );

const isTableHeader = (line: string): boolean => Str.startsWith("[")(Str.trim(line));

// A quoted TOML value may itself contain `#`, so the comment cut is anchored
// on the closing quote when the value is quoted and on the first `#` only when
// it is not.
const quotedTomlValue = /^(["'])(?:\\.|(?!\1).)*\1/;

const stripInlineComment = (value: string): string =>
  pipe(Str.trim(value), (trimmed) =>
    O.match(O.fromNullishOr(quotedTomlValue.exec(trimmed)), {
      onNone: () => Str.trim(A.headNonEmpty(Str.split(trimmed, "#"))),
      onSome: (match) => match[0],
    })
  );

const readKeyFromLines = (lines: ReadonlyArray<string>, key: string): O.Option<string> =>
  O.map(
    firstMatch(lines, new RegExp(`^\\s*${Regex.escape(key)}\\s*=\\s*(.+?)\\s*$`)),
    flow(stripInlineComment, unquote)
  );

const topLevelLines = (content: string): ReadonlyArray<string> =>
  pipe(
    Str.split(content, "\n"),
    A.takeWhile((line) => !isTableHeader(line))
  );

const tableLines = (content: string, table: string): ReadonlyArray<string> =>
  pipe(
    Str.split(content, "\n"),
    A.dropWhile((line) => Str.trim(line) !== `[${table}]`),
    A.drop(1),
    A.takeWhile((line) => !isTableHeader(line))
  );

/**
 * Read shell drift without authorizing a shell write.
 *
 * **Details**
 *
 * Only one distinct literal can establish synchronization. Conflicting values
 * carry unsupported-form drift, so a joined display can never equal a scalar
 * expectation and hide an incorrect occurrence.
 *
 * **Example** (Read an assignment)
 *
 * ```ts
 * import { modelsReadShellAssign } from "@beep/repo-cli/commands/Models/Models.locator.service"
 * import * as Effect from "effect/Effect"
 * import * as O from "effect/Option"
 * console.log(Effect.isEffect(modelsReadShellAssign("MODEL=old", "MODEL", O.none())))
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const modelsReadShellAssign: {
  (content: string, variable: string, within: O.Option<string>): Effect.Effect<O.Option<string>>;
  (variable: string, within: O.Option<string>): (content: string) => Effect.Effect<O.Option<string>>;
} = dual(
  3,
  Effect.fn("Models.readShellAssign")(function* (content: string, variable: string, within: O.Option<string>) {
    // Scope extraction cannot erase an ambiguous containing shell document,
    // such as a function-looking block inside a here-document or open quote.
    const allWords = yield* modelsShellWords(content, variable);
    const words =
      O.isSome(within) && !A.some(allWords, Str.startsWith("Unsupported shell form"))
        ? yield* O.match(modelsShellScope(content, within.value, variable), {
            onNone: () =>
              Effect.succeed([
                `Unsupported shell form: line ${A.length(
                  Str.split(
                    Str.slice(
                      0,
                      O.getOrElse(Str.indexOf(variable)(content), () => 0)
                    )(content),
                    "\n"
                  )
                )}; ambiguous function scope`,
              ]),
            onSome: (body) => modelsShellWords(body, variable),
          })
        : allWords;
    const unsupported = A.findFirst(words, Str.startsWith("Unsupported shell form"));
    if (O.isSome(unsupported)) return unsupported;
    return pipe(
      words,
      A.dedupe,
      A.match({
        onEmpty: O.none<string>,
        onNonEmpty: (values) =>
          O.some(
            A.length(values) === 1
              ? A.headNonEmpty(values)
              : `Unsupported shell form: conflicting values ${A.join(values, ", ")}`
          ),
      })
    );
  })
);

const readTsLiteral = (content: string, symbol: string): O.Option<string> =>
  firstMatch([content], new RegExp(`export\\s+const\\s+${Regex.escape(symbol)}\\s*(?::[^=]+)?=\\s*"([^"]*)"`));

// Literal delimiters keep this read-only locator bounded to named examples
// and doctrine spellings (R9). Keep every distinct value, so a mixed file
// cannot look current just because its first occurrence is current.
const readLineValues = (content: string, linePrefix: string, before: string, after: string): O.Option<string> => {
  const valuesOnLine = (line: string): ReadonlyArray<string> => {
    const values: Array<string> = [];
    let cursor = 0;
    while (cursor < Str.length(line)) {
      // Effect String.indexOf has no start offset; the native offset form avoids
      // copying each suffix and keeps missing closing delimiters linear.
      const start = line.indexOf(before, cursor);
      if (start < 0) break;
      const valueStart = start + Str.length(before);
      const end = line.indexOf(after, valueStart);
      if (end < 0) break;
      values.push(Str.slice(valueStart, end)(line));
      cursor = end + Str.length(after);
    }
    return values;
  };
  const values = pipe(
    Str.split(content, "\n"),
    A.filter(Str.startsWith(linePrefix)),
    A.flatMap(valuesOnLine),
    A.dedupe
  );
  return A.isReadonlyArrayNonEmpty(values) ? O.some(A.join(values, ", ")) : O.none();
};

const isScalar = P.some<unknown>([P.isString, P.isNumber, P.isBoolean]);

const scalarText = (leaf: unknown): O.Option<string> => (isScalar(leaf) ? O.some(`${leaf}`) : O.none<string>());

const childrenOf = (node: unknown): O.Option<ReadonlyArray<unknown>> =>
  A.isArray(node) ? O.some(node) : O.none<ReadonlyArray<unknown>>();

const fieldsOf = (node: unknown): O.Option<Readonly<Record<string, unknown>>> =>
  P.isObjectOrArray(node) ? O.some(node as Readonly<Record<string, unknown>>) : O.none();

const walkPointer = (value: unknown, pointer: ReadonlyArray<string>): O.Option<string> =>
  pipe(
    pointer,
    A.reduce(O.some(value), (current: O.Option<unknown>, segment) =>
      O.flatMap(current, (node) => O.flatMap(fieldsOf(node), (fields) => O.fromNullishOr(fields[segment])))
    ),
    O.flatMap(scalarText)
  );

// Reconcile every textual name occurrence with ranges independently established
// by a simple-form reader. Comments and quoted name tokens deliberately fail.
const unsupportedOccurrence = (
  content: string,
  names: ReadonlyArray<string>,
  ranges: ReadonlyArray<readonly [number, number]>,
  format: string
): O.Option<string> => {
  const unmatched = A.findFirst(
    A.flatMap(A.dedupe(names), (name) => A.fromIterable(Str.matchAll(new RegExp(Regex.escape(name), "g"))(content))),
    (match) =>
      !A.some(ranges, ([start, end]) => start <= (match.index ?? 0) && (match.index ?? 0) + Str.length(match[0]) <= end)
  );
  return O.map(
    unmatched,
    (match) => `Unsupported ${format} form: line ${A.length(Str.split(Str.slice(0, match.index)(content), "\n"))}`
  );
};

const readYamlPath = (content: string, path: ReadonlyArray<string | number>): O.Option<string> => {
  const names = A.map(path, (segment) => `${segment}`);
  const ranges: Array<readonly [number, number]> = [];
  const doc = parseDocument(content);
  // Only simple block mappings are modeled. No aliases, anchors, tags,
  // flow collections, complex keys, multiline scalars or multiple documents.
  let supported = A.isReadonlyArrayEmpty(doc.errors) && A.isReadonlyArrayEmpty(doc.warnings);
  visit(doc, {
    Node: (_, node) => {
      if (node.anchor !== undefined || node.tag !== undefined) supported = false;
      if (isMap(node)) {
        if (node.flow === true) supported = false;
        for (const pair of node.items) {
          if (!isYamlScalar(pair.key) || pair.key.type !== "PLAIN" || pair.key.range == null) {
            supported = false;
            continue;
          }
          // A key occurrence is owned only at the requested block path.
          const owned = A.some(A.range(0, A.length(path) - 1), (depth) => {
            const parent = doc.getIn(A.take(path, depth), true);
            return (
              isMap(parent) &&
              A.some(
                parent.items,
                (candidate) => candidate === pair && isYamlScalar(pair.key) && pair.key.value === path[depth]
              )
            );
          });
          if (owned) ranges.push([pair.key.range[0], pair.key.range[1]]);
        }
      } else if (!isYamlScalar(node) || node.type === "BLOCK_LITERAL" || node.type === "BLOCK_FOLDED")
        supported = false;
    },
  });
  const unsupported = unsupportedOccurrence(content, names, supported ? ranges : [], "YAML");
  if (O.isSome(unsupported)) return unsupported;
  const value = doc.getIn([...path]);
  return scalarText(value);
};

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  parseAttributeValue: false,
  processEntities: true,
});

const selectorPattern = /^([A-Za-z0-9_:.-]+)\[([A-Za-z0-9_:.-]+)="([^"]*)"\]$/;

interface AttributeQuery {
  readonly attribute: string;
  readonly matchAttribute: string;
  readonly matchValue: string;
  readonly tag: string;
}

const attributeOfCandidate = (candidate: unknown, query: AttributeQuery): O.Option<string> =>
  pipe(
    fieldsOf(candidate),
    O.filter((fields) => fields[`@_${query.matchAttribute}`] === query.matchValue),
    O.flatMap((fields) => O.fromNullishOr(fields[`@_${query.attribute}`])),
    O.flatMap(scalarText)
  );

const findAttributes = (node: unknown, query: AttributeQuery): ReadonlyArray<string> => {
  const children = childrenOf(node);
  if (O.isSome(children)) return A.flatMap(children.value, (child) => findAttributes(child, query));
  return O.match(fieldsOf(node), {
    onNone: () => [],
    onSome: (fields) =>
      A.flatMap(R.toEntries(fields), ([key, value]) =>
        key === query.tag
          ? A.getSomes(
              A.map(
                O.getOrElse(childrenOf(value), (): ReadonlyArray<unknown> => [value]),
                (candidate) => attributeOfCandidate(candidate, query)
              )
            )
          : findAttributes(value, query)
      ),
  });
};

const readXmlAttribute = Effect.fnUntraced(function* (
  file: ModelsTargetFile,
  elementSelector: string,
  attribute: string
) {
  const selector = selectorPattern.exec(elementSelector);
  if (selector === null) {
    return yield* ModelsLocatorError.make({
      message: `Unsupported element selector "${elementSelector}"; expected tag[attribute="value"].`,
      path: file.absolutePath,
    });
  }

  const tag = selector[1] ?? "";
  const matchAttribute = selector[2] ?? "";
  const matchValue = selector[3] ?? "";
  const names = [tag, matchAttribute, matchValue, attribute];
  const ranges: Array<readonly [number, number]> = [];
  // Scan complete simple tags, never a prefix such as option-extra or a tag
  // inside a comment, CDATA or processing instruction. Attribute quoting may
  // be single or double; the XML parser independently validates the document.
  const tokens = /<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<\?[\s\S]*?\?>|<[^>]*>/g;
  const simple = /^<\/?[A-Za-z_][\w:.-]*(?:\s+[A-Za-z_][\w:.-]*\s*=\s*(?:"[^"<]*"|'[^'<]*'))*\s*\/?>(?:)$/;
  for (const token of Str.matchAll(tokens)(file.content)) {
    if (!simple.test(token[0])) continue;
    const offset = token.index ?? 0;
    // Only exact lexical names count. An option-extra token cannot account
    // for the occurrence of option embedded in its different element name.
    const element = /^<\/?([A-Za-z_][\w:.-]*)(?=[\s/>])/.exec(token[0]);
    if (element?.[1] === tag) {
      const start = offset + (Str.startsWith("</")(token[0]) ? 2 : 1);
      ranges.push([start, start + Str.length(tag)]);
    }
    // Attribute identifiers and their values have separate identities. A
    // selector value used as an unrelated attribute name cannot account for it.
    const attributes = /([A-Za-z_][\w:.-]*)\s*=\s*("[^"<]*"|'[^'<]*')/g;
    for (const candidate of Str.matchAll(attributes)(token[0])) {
      if (candidate[1] !== matchAttribute && candidate[1] !== attribute) continue;
      const start = offset + (candidate.index ?? 0);
      ranges.push([start, start + Str.length(candidate[1])]);
      // Only the exact element's selector and owned attribute scalar forms
      // account for names inside quotes. Arbitrary quoted data cannot hide them.
      if (element?.[1] === tag) ranges.push([start, start + Str.length(candidate[0])]);
    }
  }
  const unsupported = unsupportedOccurrence(file.content, names, ranges, "XML");
  if (O.isSome(unsupported)) return unsupported;
  const parsed = yield* Effect.try({
    try: () => xmlParser.parse(file.content, true) as unknown,
    catch: () => ModelsLocatorError.make({ message: "Unsupported XML form: line 1", path: file.absolutePath }),
  }).pipe(Effect.option);
  if (O.isNone(parsed)) return O.some("Unsupported XML form: line 1");
  const values = A.dedupe(findAttributes(parsed.value, { tag, matchAttribute, matchValue, attribute }));
  return A.length(values) > 1
    ? O.some(`Unsupported XML form: line 1; conflicting values ${A.join(values, ", ")}`)
    : A.head(values);
});

/**
 * Pointer segment that stands for the bound model id.
 *
 * **Details**
 *
 * A JSON pointer that addresses a per-model entry (Claude Code's
 * `modelSettings[<model>]`) writes this token instead of a literal id, so the
 * key follows the binding when the seed or an adopted manifest moves it.
 * {@link bindLocatorModel} substitutes it before the read.
 *
 * **Example** (Address the bound model's effort)
 *
 * ```ts
 * import { BOUND_MODEL_SEGMENT } from "@beep/repo-cli/commands/Models"
 *
 * console.log(["modelSettings", BOUND_MODEL_SEGMENT, "effortLevel"].join(".")) // "modelSettings.{model}.effortLevel"
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const BOUND_MODEL_SEGMENT = "{model}";

const bindSegments = (segments: ReadonlyArray<string>, modelId: string): ReadonlyArray<string> =>
  A.map(segments, (segment) => (segment === BOUND_MODEL_SEGMENT ? modelId : segment));

/**
 * Resolve {@link BOUND_MODEL_SEGMENT} in a locator's JSON pointers to the bound model id.
 *
 * **Details**
 *
 * Only `json-key` locators carry pointers; every other locator is returned
 * unchanged. The check calls this with the binding the locator names, so a
 * per-model pointer always reads the entry the client applies.
 *
 * **Example** (Bind a per-model effort pointer)
 *
 * ```ts
 * import { BOUND_MODEL_SEGMENT, bindLocatorModel, Locator } from "@beep/repo-cli/commands/Models"
 * import * as S from "effect/Schema"
 *
 * const locator = S.decodeUnknownSync(Locator)({
 *   _tag: "json-key",
 *   binding: { role: "orchestrator", surface: "claude-code", field: "effort" },
 *   render: { _tag: "verbatim" },
 *   pointer: ["modelSettings", BOUND_MODEL_SEGMENT, "effortLevel"],
 *   fallbacks: [["effortLevel"]],
 * })
 * const bound = bindLocatorModel(locator, "claude-opus-5-6")
 * console.log(bound._tag === "json-key" ? bound.pointer.join(".") : "") // "modelSettings.claude-opus-5-6.effortLevel"
 * ```
 *
 * @param locator - The locator to resolve.
 * @param modelId - The model id of the binding the locator names.
 * @returns The locator with every bound-model segment replaced.
 * @category utilities
 * @since 0.0.0
 */
export const bindLocatorModel: {
  (modelId: string): (locator: Locator) => Locator;
  (locator: Locator, modelId: string): Locator;
} = dual(
  2,
  (locator: Locator, modelId: string): Locator =>
    locator._tag === "json-key"
      ? {
          ...locator,
          pointer: bindSegments(locator.pointer, modelId),
          fallbacks: A.map(locator.fallbacks, (fallback) => bindSegments(fallback, modelId)),
        }
      : locator
);

/**
 * Read one model locator from supplied text without filesystem access.
 *
 * **Example** (Read a plain YAML scalar)
 *
 * ```ts
 * import { modelsReadLocator } from "@beep/repo-cli/commands/Models/Models.locator.service"
 * import { LocatorBinding, ModelsTargetFile } from "@beep/repo-cli/commands/Models"
 * import * as Effect from "effect/Effect"
 * const read = modelsReadLocator(
 *   ModelsTargetFile.make({ root: "home", absolutePath: "synthetic.yaml", content: "model: old\n" }),
 *   { _tag: "yaml-path", path: ["model"], render: { _tag: "verbatim" },
 *     binding: LocatorBinding.make({ role: "codex.heavy", surface: "codex-cli", field: "model" }) }
 * )
 * console.log(Effect.isEffect(read)) // true
 * ```
 *
 * @category parsing
 * @since 0.0.0
 */
export const modelsReadLocator = Effect.fn("Models.readLocator")(function* (file: ModelsTargetFile, locator: Locator) {
  return yield* Match.value(locator).pipe(
    Match.tag("md-generated-block", ({ blockId }) => Effect.succeed(extractGeneratedBlock(file.content, blockId))),
    Match.tag("toml-top-level-key", ({ key }) => Effect.succeed(readKeyFromLines(topLevelLines(file.content), key))),
    Match.tag("toml-table-key", ({ table, key }) =>
      Effect.succeed(readKeyFromLines(tableLines(file.content, table), key))
    ),
    Match.tag("yaml-path", ({ path: yamlPath }) => Effect.succeed(readYamlPath(file.content, yamlPath))),
    Match.tag("json-key", ({ pointer, fallbacks }) =>
      Effect.succeed(
        pipe(
          parseJsonText(file.content),
          O.flatMap((json) =>
            A.reduce(fallbacks, walkPointer(json, pointer), (found, fallback) =>
              O.orElse(found, () => walkPointer(json, fallback))
            )
          )
        )
      )
    ),
    Match.tag("env-key", ({ key }) => modelsReadShellAssign(file.content, key, O.none())),
    Match.tag("shell-assign", ({ variable, within }) => modelsReadShellAssign(file.content, variable, within)),
    Match.tag("xml-attribute", ({ elementSelector, attribute }) => readXmlAttribute(file, elementSelector, attribute)),
    Match.tag("xml-escaped-json-attribute", ({ elementSelector, attribute, jsonPointer }) =>
      readXmlAttribute(file, elementSelector, attribute).pipe(
        Effect.map(
          O.flatMap((raw) =>
            Str.startsWith("Unsupported XML form")(raw)
              ? O.some(raw)
              : pipe(
                  parseJsonText(raw),
                  O.flatMap((json) => walkPointer(json, jsonPointer))
                )
          )
        )
      )
    ),
    Match.tag("ts-literal", ({ symbol }) => Effect.succeed(readTsLiteral(file.content, symbol))),
    Match.tag("line-value", ({ linePrefix, before, after }) =>
      Effect.succeed(readLineValues(file.content, linePrefix, before, after))
    ),
    Match.exhaustive
  );
});

/**
 * Live locator reader; it reads text it is handed and performs no I/O.
 *
 * **Example** (Confirm the layer)
 *
 * ```ts
 * import { ModelsLocatorReaderLive } from "@beep/repo-cli/commands/Models"
 * import * as Layer from "effect/Layer"
 *
 * console.log(Layer.isLayer(ModelsLocatorReaderLive)) // true
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const ModelsLocatorReaderLive: Layer.Layer<ModelsLocatorReader> = Layer.succeed(
  ModelsLocatorReader,
  ModelsLocatorReader.of({ read: modelsReadLocator })
);
