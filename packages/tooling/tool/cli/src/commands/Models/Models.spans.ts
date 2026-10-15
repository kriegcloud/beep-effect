/**
 * Grammar-specific owned spans for model projections.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { A, O, Str } from "@beep/utils";
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import * as Match from "effect/Match";
import * as Order from "effect/Order";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as Regex from "effect/RegExp";
import * as S from "effect/Schema";
import { findNodeAtLocation, parseTree } from "jsonc-parser";
import { isScalar, parseDocument } from "yaml";
import { decodeTomlTextWith } from "../../internal/schema/TextCodec.ts";
import { ModelsLocatorError } from "./Models.errors.ts";
import { ModelsWriteSpan } from "./Models.manifest.schemas.ts";
import { generatedBlockBegin, generatedBlockEnd } from "./Models.render.ts";
import type { Node as JsonNode } from "jsonc-parser";
import type { ModelsLocatorWrite } from "./Models.manifest.schemas.ts";

const decodeToml = decodeTomlTextWith(S.decodeUnknownEffect(S.Record(S.String, S.Unknown)));
const encodeString = S.encodeEffect(S.fromJsonString(S.String));
const error = (message: string) => ModelsLocatorError.make({ message });

/**
 * Match the complete shell word owned by an assignment or model flag.
 *
 * **Example** (Respect assignment boundaries)
 *
 * ```ts
 * import { modelsShellWordPattern } from "@beep/repo-cli/commands/Models/Models.spans"
 * console.log(modelsShellWordPattern("MODEL").test("MODEL='example';")) // true
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const modelsShellWordPattern = (variable: string): RegExp =>
  new RegExp(
    `${/(?<![\w-])/.source}${Regex.escape(variable)}${/(?:=|[ \t]+)((?:"(?:\\.|[^"\\])*"|'[^']*'|\\.|[^'"\\\s;&|<>])+)/.source}`,
    "gd"
  );

// A deliberately bounded shell lexer: one bare or wholly quoted scalar.
// Concatenated quote components and expansion syntax need a shell AST owner.
const shellWordValue = Effect.fnUntraced(function* (token: string) {
  let quote = "";
  let quotedParts = 0;
  let bare = false;
  let value = "";
  for (let index = 0; index < token.length; index += 1) {
    const char = O.getOrElse(Str.charAt(index)(token), () => "");
    if (char === "\\" && quote !== "'") {
      index += 1;
      if (index >= token.length) return yield* error("Ambiguous shell word: trailing escape.");
      const escaped = O.getOrElse(Str.charAt(index)(token), () => "");
      if (quote === '"' && !/["\\$`]/.test(escaped)) value += "\\";
      value += escaped;
      if (quote === "") bare = true;
    } else if (char === quote) {
      quote = "";
    } else if (quote === "" && (char === "'" || char === '"')) {
      quote = char;
      quotedParts += 1;
    } else {
      if (quote !== "'" && /[$`]/.test(char)) return yield* error("Ambiguous shell word: expansion.");
      if (quote === "") bare = true;
      value += char;
    }
  }
  if (quote !== "" || quotedParts > 1 || (quotedParts > 0 && bare))
    return yield* error("Ambiguous shell word: concatenated or unbalanced quoting.");
  return value;
});

// Ignore locator-shaped text inside comments and quoted shell data. Values
// themselves are parsed separately, starting at the capture boundary.
const isShellCode = (content: string, end: number): boolean => {
  let quote = "";
  let comment = false;
  let boundary = true;
  for (let index = 0; index < end; index += 1) {
    const char = O.getOrElse(Str.charAt(index)(content), () => "");
    if (comment) {
      if (char === "\n") {
        comment = false;
        boundary = true;
      }
      continue;
    }
    if (char === "\\" && quote !== "'") {
      index += 1;
      boundary = false;
      continue;
    }
    if (quote !== "") {
      if (char === quote) quote = "";
      continue;
    }
    if (char === "#" && boundary) {
      comment = true;
      continue;
    }
    if (char === "'" || char === '"') quote = char;
    boundary = /[\s;&|<>()]/.test(char);
  }
  return !comment && quote === "";
};

const span = (content: string, start: number, end: number, after: string) =>
  ModelsWriteSpan.make({ start, end, before: Str.slice(start, end)(content), after });

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
    ModelsWriteSpan.make({ ...entry, start: entry.start + start, end: entry.end + start })
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
  Effect.try({ try: () => parseTree(content), catch: () => error("Cannot parse JSON target.") }).pipe(
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

const xmlSpans = Effect.fn("Models.xmlSpans")(
  (
    content: string,
    selector: string,
    attribute: string,
    after: string
  ): Effect.Effect<ReadonlyArray<ModelsWriteSpan>, ModelsLocatorError> => {
    const selected = /^([\w:.-]+)\[([\w:.-]+)="([^"]*)"\]$/.exec(selector);
    if (selected === null) return Effect.fail(error("Unsupported XML selector."));
    const tag = O.getOrElse(O.fromUndefinedOr(selected[1]), () => "");
    const key = O.getOrElse(O.fromUndefinedOr(selected[2]), () => "");
    const value = O.getOrElse(O.fromUndefinedOr(selected[3]), () => "");
    const elements = A.fromIterable(Str.matchAll(new RegExp(`<${Regex.escape(tag)}\\b[^>]*>`, "gd"))(content));
    const spans = A.flatMap(
      A.filter(elements, (m: RegExpMatchArray) =>
        new RegExp(`\\s${Regex.escape(key)}="${Regex.escape(value)}"`).test(m[0])
      ),
      (m: RegExpMatchArray) =>
        region(
          content,
          O.getOrElse(O.fromUndefinedOr(m.index), () => 0),
          O.getOrElse(O.fromUndefinedOr(m.index), () => 0) + Str.length(m[0]),
          new RegExp(`\\s${Regex.escape(attribute)}="([^"]*)"`, "gd"),
          after
        )
    );
    return one(spans);
  }
);

const escapeXml = (value: string) =>
  pipe(value, Str.replace(/&/g, "&amp;"), Str.replace(/"/g, "&quot;"), Str.replace(/</g, "&lt;"));

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
    Match.tag("yaml-path", ({ path }) =>
      Effect.try({
        try: () => {
          const doc = parseDocument(content);
          const node = doc.getIn([...path], true);
          return A.isReadonlyArrayEmpty(doc.errors) && isScalar(node) && node.range !== undefined && node.range !== null
            ? O.some(
                span(
                  content,
                  node.range[0],
                  node.range[1],
                  node.value === expected ? Str.slice(node.range[0], node.range[1])(content) : quoted
                )
              )
            : O.none<ModelsWriteSpan>();
        },
        catch: () => error("Cannot parse YAML target."),
      }).pipe(
        Effect.flatMap((entry) =>
          O.match(entry, {
            onNone: () => Effect.fail(error("YAML write requires an unambiguous scalar node.")),
            onSome: (value) => Effect.succeed([value]),
          })
        )
      )
    ),
    Match.tag("env-key", ({ key }) =>
      one(
        captures(
          content,
          new RegExp(
            `^[ \\t]*(?:export[ \\t]+)?${Regex.escape(key)}=("(?:\\\\.|[^"\\\\])*"|'[^']*'|[^#\\r\\n]*)(?=[ \\t]*(?:#|\\r?$))`,
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
    Match.tag("shell-assign", ({ variable, within }) => {
      const body = O.match(within, {
        onNone: () => Effect.succeed(span(content, 0, Str.length(content), "")),
        onSome: (name) => {
          const functions = captures(
            content,
            new RegExp(`^[ \\t]*(?:function\\s+)?${Regex.escape(name)}\\s*(?:\\(\\s*\\))?\\s*\\{([^]*?)^\\}`, "gmd"),
            ""
          );
          return one(functions).pipe(Effect.map((entries) => O.getOrThrow(A.head(entries))));
        },
      });
      return body.pipe(
        Effect.flatMap(({ start, end }) => {
          const spans = A.filter(
            region(
              content,
              start,
              end,
              modelsShellWordPattern(variable),
              /^[a-zA-Z0-9_./:+,-]+$/.test(expected) ? expected : `'${Str.replace(/'/g, "'\\''")(expected)}'`
            ),
            (entry) => isShellCode(content, entry.start)
          );
          if (A.isReadonlyArrayEmpty(spans)) return Effect.fail(error("Shell locator has no matches."));
          return Effect.forEach(
            spans,
            Effect.fnUntraced(function* (entry) {
              const next = O.getOrElse(Str.charAt(entry.end)(content), () => "");
              if (/[&|<>()'"]/.test(next)) return yield* error("Ambiguous shell word: adjacent operator.");
              const value = yield* shellWordValue(entry.before);
              // Accept the existing bare parenthesized model spelling only when
              // already equal, then quote it; other operator-like words refuse.
              if (/[()]/.test(entry.before) && value !== expected && !/^["']/.test(entry.before))
                return yield* error("Ambiguous shell word: parentheses.");
              return value === expected && (/^["']/.test(entry.before) || !/[()]/.test(entry.before))
                ? ModelsWriteSpan.make({ ...entry, after: entry.before })
                : entry;
            }),
            { concurrency: 1 }
          );
        })
      );
    }),
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
    Match.tag("xml-attribute", ({ elementSelector, attribute }) =>
      xmlSpans(content, elementSelector, attribute, escapeXml(expected))
    ),
    Match.tag("xml-escaped-json-attribute", ({ elementSelector, attribute, jsonPointer }) =>
      xmlSpans(content, elementSelector, attribute, "").pipe(
        Effect.flatMap(
          Effect.fnUntraced(function* (outer) {
            const entry = O.getOrThrow(A.head(outer));
            let decoded = "";
            let offset = 0;
            let boundaries: ReadonlyArray<number> = [0];
            const entities: ReadonlyArray<readonly [string, string]> = [
              ["&quot;", '"'],
              ["&amp;", "&"],
              ["&lt;", "<"],
              ["&gt;", ">"],
              ["&apos;", "'"],
            ];
            while (offset < Str.length(entry.before)) {
              const rest = Str.slice(offset)(entry.before);
              const entity = A.findFirst(entities, ([encoded]) => Str.startsWith(encoded)(rest));
              if (O.isSome(entity)) {
                decoded += entity.value[1];
                offset += Str.length(entity.value[0]);
              } else {
                if (Str.startsWith("&")(rest))
                  return yield* error("Unsupported XML entity in JSON attribute; refusing normalization.");
                decoded += Str.slice(offset, offset + 1)(entry.before);
                offset += 1;
              }
              boundaries = A.append(boundaries, offset);
            }
            const inner = yield* jsonSpans(decoded, jsonPointer, quoted);
            return A.map(inner, (owned) =>
              span(
                content,
                entry.start + O.getOrThrow(A.get(boundaries, owned.start)),
                entry.start + O.getOrThrow(A.get(boundaries, owned.end)),
                escapeXml(owned.after)
              )
            );
          })
        )
      )
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
