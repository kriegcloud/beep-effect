/**
 * Grammar-specific owned spans for model projections.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { A, O, pipe, Str } from "@beep/utils";
import * as Effect from "effect/Effect";
import * as Match from "effect/Match";
import * as Order from "effect/Order";
import * as S from "effect/Schema";
import { findNodeAtLocation, parseTree } from "jsonc-parser";
import { isScalar, parseDocument } from "yaml";
import { ModelsLocatorError } from "./Models.errors.ts";
import { ModelsWriteSpan } from "./Models.manifest.schemas.ts";
import { generatedBlockBegin, generatedBlockEnd } from "./Models.render.ts";
import type { Node as JsonNode } from "jsonc-parser";
import type { ModelsLocatorWrite } from "./Models.manifest.schemas.ts";

const encodeString = S.encodeEffect(S.fromJsonString(S.String));
const escape = (value: string) => Str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")(value);
const error = (message: string) => ModelsLocatorError.make({ message });

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
      new RegExp(`^[ \\t]*\\[${escape(table.value)}\\][ \\t]*(?:#[^\\r\\n]*)?\\r?$`).test(m[0])
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

const tomlSpans = Effect.fnUntraced(function* (content: string, key: string, table: O.Option<string>, after: string) {
  const bounds = yield* tableRegion(content, table);
  const start = O.getOrElse(A.get(bounds, 0), () => 0);
  const end = O.getOrElse(A.get(bounds, 1), () => Str.length(content));
  return yield* one(
    region(
      content,
      start,
      end,
      new RegExp(
        `^[ \\t]*${escape(key)}[ \\t]*=[ \\t]*("(?:\\\\.|[^"\\\\])*"|'[^']*'|[^#\\r\\n]+?)(?=[ \\t]*(?:#|\\r?$))`,
        "gmd"
      ),
      after
    )
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
    const elements = A.fromIterable(Str.matchAll(new RegExp(`<${escape(tag)}\\b[^>]*>`, "gd"))(content));
    const spans = A.flatMap(
      A.filter(elements, (m: RegExpMatchArray) => new RegExp(`\\s${escape(key)}="${escape(value)}"`).test(m[0])),
      (m: RegExpMatchArray) =>
        region(
          content,
          O.getOrElse(O.fromUndefinedOr(m.index), () => 0),
          O.getOrElse(O.fromUndefinedOr(m.index), () => 0) + Str.length(m[0]),
          new RegExp(`\\s${escape(attribute)}="([^"]*)"`, "gd"),
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
 * @category editing
 * @since 0.0.0
 */
export const modelsWriteSpans = Effect.fn("Models.writeSpans")(function* (
  content: string,
  request: ModelsLocatorWrite
): Effect.fn.Return<ReadonlyArray<ModelsWriteSpan>, ModelsLocatorError> {
  const quoted = yield* encodeString(request.expected).pipe(ModelsLocatorError.mapError("Cannot encode scalar."));
  const expected = request.expected;
  return yield* Match.value(request.locator).pipe(
    Match.tag("toml-top-level-key", ({ key }) => tomlSpans(content, key, O.none(), quoted)),
    Match.tag("toml-table-key", ({ key, table }) => tomlSpans(content, key, O.some(table), quoted)),
    Match.tag("json-key", ({ pointer }) => jsonSpans(content, pointer, quoted)),
    Match.tag("yaml-path", ({ path }) =>
      Effect.try({
        try: () => {
          const doc = parseDocument(content);
          const node = doc.getIn([...path], true);
          return A.isReadonlyArrayEmpty(doc.errors) && isScalar(node) && node.range !== undefined && node.range !== null
            ? O.some(span(content, node.range[0], node.range[1], quoted))
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
            `^[ \\t]*(?:export[ \\t]+)?${escape(key)}=("(?:\\\\.|[^"\\\\])*"|'[^']*'|[^#\\r\\n]*)(?=[ \\t]*(?:#|\\r?$))`,
            "gmd"
          ),
          quoted
        )
      )
    ),
    Match.tag("ts-literal", ({ symbol }) =>
      one(
        captures(
          content,
          new RegExp(`export\\s+const\\s+${escape(symbol)}\\s*(?::[^=]+)?=\\s*("(?:\\\\.|[^"\\\\])*")`, "gd"),
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
            new RegExp(`^[ \\t]*(?:function\\s+)?${escape(name)}\\s*(?:\\(\\s*\\))?\\s*\\{([^]*?)^\\}`, "gmd"),
            ""
          );
          return one(functions).pipe(Effect.map((entries) => O.getOrThrow(A.head(entries))));
        },
      });
      return body.pipe(
        Effect.flatMap(({ start, end }) => {
          const spans = region(
            content,
            start,
            end,
            new RegExp(`(?<![\\w-])${escape(variable)}(?:=|[ \\t]+)["']?([^'"\\s;]+)`, "gd"),
            expected
          );
          return A.isReadonlyArrayEmpty(spans)
            ? Effect.fail(error("Shell locator has no matches."))
            : Effect.succeed(spans);
        })
      );
    }),
    Match.tag("line-value", ({ linePrefix, before, after }) => {
      const lines = A.fromIterable(Str.matchAll(new RegExp(`^${escape(linePrefix)}[^\\r\\n]*`, "gmd"))(content));
      const spans = A.flatMap(lines, (m) =>
        region(
          content,
          O.getOrElse(O.fromUndefinedOr(m.index), () => 0),
          O.getOrElse(O.fromUndefinedOr(m.index), () => 0) + Str.length(m[0]),
          new RegExp(`${escape(before)}(.*?)${escape(after)}`, "gd"),
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
      const open = content.indexOf(begin);
      const close = content.indexOf(end);
      if (open < 0 || close < open || content.indexOf(begin, open + 1) >= 0 || content.indexOf(end, close + 1) >= 0)
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
 * import * as Effect from "effect/Effect"
 * console.log(Effect.isEffect(modelsApplySpans("abc", [{ start: 1, end: 2, before: "b", after: "B" }])))
 * ```
 *
 * @category editing
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
