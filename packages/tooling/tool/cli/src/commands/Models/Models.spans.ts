/**
 * Grammar-specific owned spans for model projections.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { A, O, Str } from "@beep/utils";
import * as Effect from "effect/Effect";
import { dual, pipe } from "effect/Function";
import * as Match from "effect/Match";
import * as Order from "effect/Order";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as Regex from "effect/RegExp";
import * as S from "effect/Schema";
import * as Tuple from "effect/Tuple";
import { findNodeAtLocation, parseTree } from "jsonc-parser";
import { decodeTomlTextWith } from "../../internal/schema/TextCodec.ts";
import { ModelsLocatorError } from "./Models.errors.ts";
import { ModelsWriteSpan } from "./Models.manifest.schemas.ts";
import { generatedBlockBegin, generatedBlockEnd } from "./Models.render.ts";
import type { Node as JsonNode } from "jsonc-parser";
import type { Locator, ModelsLocatorWrite } from "./Models.manifest.schemas.ts";

const decodeToml = decodeTomlTextWith(S.decodeUnknownEffect(S.Record(S.String, S.Unknown)));
const encodeString = S.encodeEffect(S.fromJsonString(S.String));
const error = (message: string) => ModelsLocatorError.make({ message });

/**
 * Name the format refused by the TOML/JSON-only native writer.
 *
 * **Example** (Identify a check-only YAML target)
 *
 * ```ts
 * import { modelsCheckOnlyFormat } from "@beep/repo-cli/commands/Models/Models.spans"
 * import { LocatorBinding } from "@beep/repo-cli/commands/Models"
 * import * as O from "effect/Option"
 * const format = modelsCheckOnlyFormat({
 *   _tag: "yaml-path", path: ["model"], render: { _tag: "verbatim" },
 *   binding: LocatorBinding.make({ role: "codex.heavy", surface: "codex-cli", field: "model" })
 * })
 * console.log(O.getOrElse(format, () => "writable")) // "YAML"
 * ```
 *
 * @param locator - The grammar whose write capability is being checked.
 * @returns The refused format name, or None for TOML/JSON.
 * @category utilities
 * @since 0.0.0
 */
export const modelsCheckOnlyFormat = (locator: Locator): O.Option<string> =>
  Match.value(locator).pipe(
    Match.tag("toml-top-level-key", "toml-table-key", "json-key", () => O.none<string>()),
    Match.tag("yaml-path", () => O.some("YAML")),
    Match.tag("xml-attribute", "xml-escaped-json-attribute", () => O.some("XML")),
    Match.tag("shell-assign", "env-key", () => O.some("Shell")),
    Match.tag("ts-literal", () => O.some("TypeScript")),
    Match.tag("line-value", "md-generated-block", () => O.some("Text")),
    Match.exhaustive
  );

// Decode only a single literal shell word. Concatenated quote components,
// expansions and unbalanced quoting need a shell AST owner and fail closed.
const shellWordValue = Effect.fnUntraced(function* (token: string) {
  if (/^'[^']*'$/.test(token)) return Str.slice(1, -1)(token);
  const doubleQuoted = /^"(?:\\.|[^"\\])*"$/.test(token);
  const value = doubleQuoted ? Str.slice(1, -1)(token) : token;
  if (/(?:^|[^\\])(?:\\\\)*[$`]/.test(value)) return yield* error("Unsupported shell form: expansion.");
  if (doubleQuoted) return Str.replace(/\\(["\\$`])/g, "$1")(value);
  if (!/^(?:\\.|[^'"\\])+$/.test(token))
    return yield* error("Unsupported shell form: concatenated or unbalanced quoting.");
  return Str.replace(/\\(.)/g, "$1")(token);
});

// Tokenize every word, including words outside the locator. If any part of a
// relevant line is outside this literal grammar, its value cannot prove sync.
const shellTokens = /[ \t]+|#[^\n]*$|&&|\|\||[;&|()]|(?:"(?:\\.|[^"\\\n])*"|'[^'\n]*'|\\[^\n]|[^'"\\\s;&|()<>])+/gy;
const unsupportedShell = "Unsupported shell form";

const shellControl = /^(?:&&|\|\||[;&|()])$/;

const shellLineTokens = (line: string) => {
  const tokens = new RegExp(shellTokens.source, "gy");
  const words: Array<string> = [];
  let consumed = 0;
  while (consumed < Str.length(line)) {
    const match = tokens.exec(line);
    if (match === null) return Tuple.make(words, O.some(Str.slice(consumed)(line)));
    const token = match[0];
    consumed = tokens.lastIndex;
    if (Str.startsWith("#")(token)) break;
    if (!/^[ \t]+$/.test(token)) words.push(token);
  }
  return Tuple.make(words, O.none<string>());
};

const shellTokenValue = Effect.fnUntraced(function* (token: string, variable: string) {
  const word = Str.startsWith(`${variable}=`)(token)
    ? Str.slice(Str.length(variable) + 1)(token)
    : Str.replace(/^[A-Za-z_][A-Za-z_0-9]*=/, "")(token);
  const literal = /^'[^']*'$|^"(?:\\.|[^"\\])*"$/.test(word);
  // Admit an explicit literal alphabet, rather than enumerating expansion
  // operators. Every other unquoted form is unsupported by construction.
  const bare = /^(?:\\.|[A-Za-z0-9_./:@+,=-])+$/.test(word) && !/^=/.test(word);
  const escapedBoundary = /\\[ \t;&|()<>]/.test(word);
  const code = shellControl.test(word) || /^[{}]$/.test(word);
  if (!literal && (escapedBoundary || (!bare && !code))) return O.none<string>();
  const prefix = Str.slice(0, Str.length(token) - Str.length(word))(token);
  return yield* shellWordValue(word).pipe(Effect.option, Effect.map(O.map((value) => `${prefix}${value}`)));
});

const ownedShellValue = (
  words: ReadonlyArray<string>,
  decoded: ReadonlyArray<O.Option<string>>,
  index: number,
  variable: string
) => {
  const token = O.getOrElse(A.get(words, index), () => "");
  const value = O.flatten(A.get(decoded, index));
  if (Str.startsWith(`${variable}=`)(token)) return O.map(value, Str.slice(Str.length(variable) + 1));
  if (!Str.startsWith("-")(variable)) return O.none<string>();
  if (token === variable) {
    const next = O.getOrElse(A.get(words, index + 1), () => "");
    return O.some(
      shellControl.test(next)
        ? unsupportedShell
        : O.getOrElse(O.flatten(A.get(decoded, index + 1)), () => unsupportedShell)
    );
  }
  if (new RegExp(`^${Regex.escape(variable)}=`).test(Str.replace(/\\(.)/g, "$1")(token)))
    return O.some(unsupportedShell);
  // A quoted/escaped option name is outside the canonical locator grammar.
  // Recognize its decoded identity and report it instead of dropping it.
  return O.exists(value, (word) => word === variable || Str.startsWith(`${variable}=`)(word))
    ? O.some(unsupportedShell)
    : O.none<string>();
};

const recognizedShellOffsets = (
  line: string,
  words: ReadonlyArray<string>,
  decoded: ReadonlyArray<O.Option<string>>,
  variable: string
) => {
  const recognized: Array<number> = [];
  let cursor = 0;
  let declaration = false;
  for (const [index, word] of A.entries(words)) {
    const offset = line.indexOf(word, cursor);
    cursor = offset + Str.length(word);
    if (shellControl.test(word)) declaration = false;
    if (/^(?:declare|typeset|local|unset)$/.test(word)) declaration = true;
    const value = ownedShellValue(words, decoded, index, variable);
    if (!declaration && O.exists(value, (word) => word !== unsupportedShell)) recognized.push(offset);
  }
  return recognized;
};

/**
 * Read literal assignment or flag words; unsupported relevant lines report drift.
 *
 * **Details**
 *
 * Every textual occurrence of the owned name must be a recognized assignment or flag.
 * Occurrences in comments and quoted data intentionally report unsupported drift.
 * The scanner accounts for every word on a physical line. A here-document or
 * unclosed quote makes the remaining document unsupported; no later line is
 * trusted after a containing form this grammar cannot resolve.
 *
 * **Example** (Decode an escaped assignment)
 *
 * ```ts
 * import { modelsShellWords } from "@beep/repo-cli/commands/Models/Models.spans"
 * import * as Effect from "effect/Effect"
 * console.log(Effect.isEffect(modelsShellWords("MODEL=old", "MODEL"))) // true
 * ```
 *
 * @param content - Shell text to read.
 * @param variable - Exact assignment name or model flag.
 * @returns Literal values or explicit unsupported-form drift evidence.
 * @category utilities
 * @since 0.0.0
 */
export const modelsShellWords = Effect.fn("Models.shellWords")(function* (content: string, variable: string) {
  const values: Array<string> = [];
  let continued = false;
  let unsafeRemainder = false;
  let lineNumber = 0;
  for (const line of Str.split(content, "\n")) {
    lineNumber += 1;
    const [words, remainder] = shellLineTokens(line);
    const decoded = yield* Effect.forEach(words, (word) => shellTokenValue(word, variable), { concurrency: 1 });
    const owned = A.getSomes(A.map(words, (_, index) => ownedShellValue(words, decoded, index, variable)));
    const occurrences = A.fromIterable(Str.matchAll(new RegExp(Regex.escape(variable), "g"))(line));
    const recognized = recognizedShellOffsets(line, words, decoded, variable);
    const mentions = A.isReadonlyArrayNonEmpty(occurrences) || Str.includes(variable)(Str.replace(/[\\'"]/g, "")(line));
    const unmatched = A.some(occurrences, (match) => !A.contains(recognized, match.index));
    const unsupported =
      mentions &&
      (continued ||
        unsafeRemainder ||
        O.isSome(remainder) ||
        /\\$/.test(line) ||
        A.some(decoded, O.isNone) ||
        A.contains(owned, unsupportedShell) ||
        unmatched);
    unsafeRemainder = unsafeRemainder || O.exists(remainder, (rest) => /['"<]/.test(rest));
    continued = /\\$/.test(line);
    values.push(...(unsupported ? [`${unsupportedShell}: line ${lineNumber}`] : owned));
  }
  return values;
});

const unboundedShellScopeLine = (line: string) => {
  const [words, remainder] = shellLineTokens(line);
  return (
    O.isSome(remainder) ||
    A.some(words, (word) => !/^'[^']*'$|^"(?:\\.|[^"\\])*"$/.test(word) && /[{}]/.test(Str.replace(/\\./g, "")(word)))
  );
};

/**
 * Resolve one plain multiline function without dropping ambiguous body text.
 *
 * **Details**
 *
 * Owned inline, nested, duplicate and unterminated definitions are unsupported.
 * An absent definition yields an empty body; unsupported scope yields None.
 * Quoted or escaped braces are data and do not terminate a supported body.
 *
 * **Example** (Resolve a simple function)
 *
 * ```ts
 * import { modelsShellScope } from "@beep/repo-cli/commands/Models/Models.spans"
 * import * as O from "effect/Option"
 * const source = "route() {\nMODEL=old\n}\n"
 * console.log(O.isSome(modelsShellScope(source, "route", "MODEL"))) // true
 * ```
 *
 * @param content - Complete shell document.
 * @param name - Named function whose literal body is owned.
 * @param variable - Owned name used to exclude unrelated lines from scope checks.
 * @returns A supported body, an empty missing body, or None for unsupported scope.
 * @category utilities
 * @since 0.0.0
 */
export const modelsShellScope: {
  (content: string, name: string, variable: string): O.Option<string>;
  (name: string, variable: string): (content: string) => O.Option<string>;
} = dual(3, (content: string, name: string, variable: string): O.Option<string> => {
  if (!/^[A-Za-z_][A-Za-z0-9_-]*$/.test(name)) return O.none();
  const header = /^[ \t]*(?:function[ \t]+)?([A-Za-z_][A-Za-z0-9_-]*)[ \t]*(?:\([ \t]*\))?[ \t]*\{[ \t]*$/;
  const close = /^[ \t]*}[ \t]*$/;
  const lines = Str.split(content, "\n");
  const headers = A.getSomes(
    A.map(lines, (line, index) =>
      O.flatMap(O.fromNullishOr(header.exec(line)), (match) =>
        O.map(O.fromUndefinedOr(match[1]), (name) => Tuple.make(index, name))
      )
    )
  );
  const ends = A.getSomes(A.map(lines, (line, index) => (close.test(line) ? O.some(index) : O.none())));
  const aligned =
    A.length(headers) === A.length(ends) &&
    A.every(headers, ([start], index) => {
      const end = O.getOrElse(A.get(ends, index), () => -1);
      const next = O.getOrElse(
        O.map(A.get(headers, index + 1), ([start]) => start),
        () => A.length(lines)
      );
      return start < end && end < next;
    });
  const bounded = A.every(
    lines,
    (line) =>
      !unboundedShellScopeLine(line) ||
      header.test(line) ||
      close.test(line) ||
      (!Str.includes(variable)(Str.replace(/[\\'"]/g, "")(line)) && !Str.includes(name)(line))
  );
  if (!aligned || !bounded || A.length(A.filter(headers, ([, candidate]) => candidate === name)) > 1) return O.none();
  return O.match(
    A.findFirstIndex(headers, ([, candidate]) => candidate === name),
    {
      onNone: () => O.some(""),
      onSome: (index) =>
        O.flatMap(A.get(headers, index), ([start]) =>
          O.map(A.get(ends, index), (end) => A.join(A.slice(lines, { start: start + 1, end }), "\n"))
        ),
    }
  );
});

const span = (content: string, start: number, end: number, after: string) =>
  ModelsWriteSpan.make({
    start,
    end,
    before: Str.slice(start, end)(content),
    after,
  });

// Resolve regex captures with indices, never by searching for the captured value:
// a native file can contain the same token in several unowned places.
const captures = (content: string, pattern: RegExp, after: string): ReadonlyArray<ModelsWriteSpan> =>
  pipe(
    Str.matchAll(pattern)(content),
    A.fromIterable,
    A.map((match) =>
      pipe(
        O.fromUndefinedOr(match.indices),
        O.flatMap((indices) => O.fromUndefinedOr(indices[1])),
        O.map(([start, end]) => span(content, start, end, after))
      )
    ),
    A.getSomes
  );

const one = (
  spans: ReadonlyArray<ModelsWriteSpan>
): Effect.Effect<ReadonlyArray<ModelsWriteSpan>, ModelsLocatorError> =>
  A.length(spans) === 1 ? Effect.succeed(spans) : Effect.fail(error("Scalar locator is missing or ambiguous."));

const region = (content: string, start: number, end: number, pattern: RegExp, after: string) =>
  A.map(captures(Str.slice(start, end)(content), pattern, after), (entry) =>
    ModelsWriteSpan.make({
      ...entry,
      start: entry.start + start,
      end: entry.end + start,
    })
  );

const tableRegion = Effect.fn("Models.tableRegion")(
  (content: string, table: O.Option<string>): Effect.Effect<ReadonlyArray<number>, ModelsLocatorError> => {
    const headers = A.fromIterable(Str.matchAll(/^[ \t]*\[[^\n]+\][ \t]*(?:#[^\r\n]*)?\r?$/dgm)(content));
    if (O.isNone(table))
      return Effect.succeed([
        0,
        O.getOrElse(
          O.map(A.head(headers), (m) => O.getOrElse(O.fromUndefinedOr(m.index), () => 0)),
          () => Str.length(content)
        ),
      ]);
    const matches = A.filter(headers, (m) =>
      new RegExp(`^[ \\t]*\\[${Regex.escape(table.value)}\\][ \\t]*(?:#[^\\r\\n]*)?\\r?$`).test(m[0])
    );
    if (A.length(matches) !== 1) return Effect.fail(error("TOML table is missing or ambiguous."));
    const found = O.getOrThrow(A.head(matches));
    const end = O.getOrElse(
      O.map(
        A.findFirst(
          headers,
          (m) => O.getOrElse(O.fromUndefinedOr(m.index), () => 0) > O.getOrElse(O.fromUndefinedOr(found.index), () => 0)
        ),
        (m) => O.getOrElse(O.fromUndefinedOr(m.index), () => 0)
      ),
      () => Str.length(content)
    );
    return Effect.succeed([O.getOrElse(O.fromUndefinedOr(found.index), () => 0) + Str.length(found[0]), end]);
  }
);

const tomlSpans = Effect.fnUntraced(function* (
  content: string,
  key: string,
  table: O.Option<string>,
  after: string,
  expected: string
) {
  const bounds = yield* tableRegion(content, table);
  const start = O.getOrElse(A.get(bounds, 0), () => 0);
  const end = O.getOrElse(A.get(bounds, 1), () => Str.length(content));
  const spans = yield* one(
    region(
      content,
      start,
      end,
      new RegExp(
        `^[ \\t]*${Regex.escape(key)}[ \\t]*=[ \\t]*("(?:\\\\.|[^"\\\\])*"|'[^']*'|[^#\\r\\n]+?)(?=[ \\t]*(?:#|\\r?$))`,
        "gmd"
      ),
      after
    )
  );
  return yield* Effect.forEach(
    spans,
    Effect.fnUntraced(function* (entry) {
      const parsed = yield* decodeToml(`value = ${entry.before}`).pipe(
        ModelsLocatorError.mapError("Invalid TOML scalar.")
      );
      return parsed.value === expected ? ModelsWriteSpan.make({ ...entry, after: entry.before }) : entry;
    })
  );
});

const jsonSpans = (content: string, pointer: ReadonlyArray<string>, after: string) =>
  Effect.try({
    try: () => parseTree(content),
    catch: () => error("Cannot parse JSON target."),
  }).pipe(
    Effect.flatMap((tree) => {
      if (tree === undefined) return Effect.fail(error("Cannot parse JSON target."));
      const node = A.reduce(pointer, O.some(tree), (current, segment) =>
        O.flatMap(current, (parent) => {
          if (parent.type === "object") {
            const matches = A.filter(
              O.getOrElse(O.fromUndefinedOr(parent.children), () => []),
              (child: JsonNode) =>
                O.exists(O.fromUndefinedOr(child.children), (children) =>
                  O.exists(A.head(children), (key) => key.value === segment)
                )
            );
            if (A.length(matches) !== 1) return O.none<JsonNode>();
          }
          const address: O.Option<string | number> =
            parent.type === "array" ? S.decodeOption(S.FiniteFromString)(segment) : O.some(segment);
          return O.flatMap(address, (key) => O.fromUndefinedOr(findNodeAtLocation(parent, [key])));
        })
      );
      return O.isNone(node) || node.value.type !== "string"
        ? Effect.fail(error("JSON write requires an existing string at its primary pointer."))
        : Effect.succeed([span(content, node.value.offset, node.value.offset + node.value.length, after)]);
    })
  );

/**
 * Resolve the complete owned range set, rejecting missing or ambiguous addresses.
 * JSON fallbacks are read compatibility only: writes own the primary pointer.
 *
 * **Example** (Prepare a quoted model)
 *
 * ```ts
 * import { modelsWriteSpans } from "@beep/repo-cli/commands/Models/Models.spans"
 * import * as Effect from "effect/Effect"
 * console.log(typeof modelsWriteSpans === "function")
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const modelsWriteSpans = Effect.fn("Models.writeSpans")(function* (
  content: string,
  request: ModelsLocatorWrite
): Effect.fn.Return<ReadonlyArray<ModelsWriteSpan>, ModelsLocatorError> {
  if (request.remove === true) {
    if (request.locator._tag !== "toml-top-level-key")
      return yield* error("Removal owns only a top-level TOML assignment.");
    const ownedKey = request.locator.key;
    const bounds = yield* tableRegion(content, O.none());
    const end = O.getOrElse(A.get(bounds, 1), () => Str.length(content));
    const parsed = yield* decodeToml(content).pipe(ModelsLocatorError.mapError("Invalid TOML removal target."));
    if (!R.has(parsed, ownedKey) || P.isObject(parsed[ownedKey])) return [];
    // Match the source spelling, then use the TOML parser to establish key identity.
    const assignments = captures(
      Str.slice(0, end)(content),
      /(^[ \t]*(?:[\w-]+|"(?:\\.|[^"\\])*"|'[^']*')[ \t]*=[^\r\n]*(?:\r?\n|$))/dgm,
      ""
    );
    const matches = yield* Effect.filter(
      assignments,
      Effect.fnUntraced(function* (entry) {
        const key = Str.slice(
          0,
          O.getOrElse(Str.indexOf("=")(entry.before), () => 0)
        )(entry.before);
        const fields = yield* decodeToml(`${key}= true`).pipe(
          ModelsLocatorError.mapError("Cannot resolve TOML removal key.")
        );
        return O.contains(R.get(fields, ownedKey), true);
      })
    );
    return yield* one(matches);
  }
  const quoted = yield* encodeString(request.expected).pipe(ModelsLocatorError.mapError("Cannot encode scalar."));
  const expected = request.expected;
  return yield* Match.value(request.locator).pipe(
    Match.tag("toml-top-level-key", ({ key }) => tomlSpans(content, key, O.none(), quoted, expected)),
    Match.tag("toml-table-key", ({ key, table }) => tomlSpans(content, key, O.some(table), quoted, expected)),
    Match.tag("json-key", ({ pointer }) => jsonSpans(content, pointer, quoted)),
    Match.tag("yaml-path", () => Effect.fail(error("YAML targets are check-only; edit by hand."))),
    Match.tag("env-key", ({ key }) =>
      one(
        captures(
          content,
          new RegExp(
            `^[ \\t]*(?:export[ \\t]+)?${Regex.escape(key)}=("(?:\\\\.|[^"\\\\])*"|'[^']*'|[^#\\r\\n]*?)(?=[ \\t]*(?:#|\\r?$))`,
            "gmd"
          ),
          quoted
        )
      ).pipe(
        Effect.map(
          A.map((entry) => {
            const token = Str.trim(entry.before);
            const decoded = Str.startsWith('"')(token) || Str.startsWith("'")(token) ? Str.slice(1, -1)(token) : token;
            return decoded === expected ? ModelsWriteSpan.make({ ...entry, after: entry.before }) : entry;
          })
        )
      )
    ),
    Match.tag("ts-literal", ({ symbol }) =>
      one(
        captures(
          content,
          new RegExp(`export\\s+const\\s+${Regex.escape(symbol)}\\s*(?::[^=]+)?=\\s*("(?:\\\\.|[^"\\\\])*")`, "gd"),
          quoted
        )
      )
    ),
    Match.tag("shell-assign", () => Effect.fail(error("Shell targets are check-only; edit by hand."))),
    Match.tag("line-value", ({ linePrefix, before, after }) => {
      const lines = A.fromIterable(Str.matchAll(new RegExp(`^${Regex.escape(linePrefix)}[^\\r\\n]*`, "gmd"))(content));
      const spans = A.flatMap(lines, (m) =>
        region(
          content,
          O.getOrElse(O.fromUndefinedOr(m.index), () => 0),
          O.getOrElse(O.fromUndefinedOr(m.index), () => 0) + Str.length(m[0]),
          new RegExp(`${Regex.escape(before)}(.*?)${Regex.escape(after)}`, "gd"),
          expected
        )
      );
      return A.isReadonlyArrayEmpty(spans) ? Effect.fail(error("Line locator has no matches.")) : Effect.succeed(spans);
    }),
    Match.tag("xml-attribute", "xml-escaped-json-attribute", () =>
      Effect.fail(error("XML targets are check-only; edit by hand."))
    ),
    Match.tag("md-generated-block", ({ blockId }) => {
      const begin = generatedBlockBegin(blockId);
      const end = generatedBlockEnd(blockId);
      const open = O.getOrElse(Str.indexOf(begin)(content), () => -1);
      const close = O.getOrElse(Str.indexOf(end)(content), () => -1);
      if (
        open < 0 ||
        close < open ||
        O.isSome(Str.indexOf(begin)(Str.slice(open + 1)(content))) ||
        O.isSome(Str.indexOf(end)(Str.slice(close + 1)(content)))
      )
        return Effect.fail(error("Generated block markers are missing or ambiguous."));
      return Effect.succeed([span(content, open + Str.length(begin), close, `\n${expected}\n`)]);
    }),
    Match.exhaustive
  );
});

/**
 * Apply disjoint, drift-fenced spans; every byte outside those ranges survives.
 *
 * **Example** (Preserve an unowned suffix)
 *
 * ```ts
 * import { modelsApplySpans } from "@beep/repo-cli/commands/Models/Models.spans"
 * import { ModelsWriteSpan } from "@beep/repo-cli/commands/Models/Models.manifest.schemas"
 * import * as Effect from "effect/Effect"
 * console.log(Effect.isEffect(modelsApplySpans("abc", [ModelsWriteSpan.make({ start: 1, end: 2, before: "b", after: "B" })])))
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const modelsApplySpans = Effect.fn("Models.applySpans")(function* (
  content: string,
  spans: ReadonlyArray<ModelsWriteSpan>
) {
  const ordered = A.sort(
    spans,
    Order.mapInput(Order.Number, (entry: ModelsWriteSpan) => entry.start)
  );
  let cursor = 0;
  let output = "";
  for (const entry of ordered) {
    if (
      entry.start < cursor ||
      entry.end < entry.start ||
      entry.end > Str.length(content) ||
      Str.slice(entry.start, entry.end)(content) !== entry.before
    )
      return yield* error("Owned spans overlap, leave the file, or have drifted.");
    output += Str.slice(cursor, entry.start)(content) + entry.after;
    cursor = entry.end;
  }
  return output + Str.slice(cursor)(content);
});
