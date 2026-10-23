/**
 * Shared TypeScript fence extraction for the Markdown-aware laws.
 *
 * **Details**
 *
 * One CommonMark-style pass finds every backtick or tilde fence of three or more
 * markers whose info string starts with a TypeScript language word
 * (`typescript`, `tsx`, `mts`, `cts` or `ts`). The closing fence repeats the
 * opening marker run exactly. Both the schema tag idiom law and the Markdown
 * fence typecheck law read fences through this module, so they agree on which
 * blocks are TypeScript.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import { A, Str, thunk0, thunkEmptyStr } from "@beep/utils";
import { pipe } from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const $I = $RepoCliId.create("commands/Laws/internal/TypeScriptFences");

const TYPESCRIPT_FENCE_PATTERN =
  /^ {0,3}(`{3,}|~{3,})(typescript|tsx|mts|cts|ts)(?![\w-])([^\r\n]*)\r?\n([\s\S]*?)^ {0,3}\1[ \t]*$/gimu;

/**
 * One TypeScript fence found in a Markdown or JSDoc text.
 *
 * **Details**
 *
 * `language` is the lowercased language word; `infoString` is the whole
 * trimmed info string after the opening marker run, language word included.
 * `openingLineIndex` is the 0-based line of the opening fence and
 * `codeLineIndex` the 0-based line where the body starts.
 *
 * **Example** (Describe a fence)
 *
 * ```ts
 * import { TypeScriptFence } from "@beep/repo-cli/test/Laws"
 *
 * const fence = TypeScriptFence.make({
 *   code: "const a = 1\n",
 *   infoString: "ts",
 *   language: "ts",
 *   openingLineIndex: 0,
 *   codeLineIndex: 1,
 * })
 * console.log(fence.codeLineIndex) // 1
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class TypeScriptFence extends S.Opaque<TypeScriptFence, { readonly brand: unique symbol }>()(
  S.Struct({
    code: S.String,
    infoString: S.String,
    language: S.String,
    openingLineIndex: S.Int,
    codeLineIndex: S.Int,
  }).pipe(
    $I.annoteSchema("TypeScriptFence", {
      description: "One TypeScript fence of a Markdown or JSDoc text with its info string and 0-based line indexes.",
    })
  )
) {}

// A capture group the pattern always matches; the fallback only satisfies the type.
const groupText = (match: RegExpMatchArray, group: number): string => O.getOrElse(A.get(match, group), thunkEmptyStr);

const lineIndexAt = (text: string, index: number): number => A.length(Str.split("\n")(Str.slice(0, index)(text))) - 1;

/**
 * Extract every TypeScript fence of a Markdown or JSDoc text.
 *
 * **Example** (Read a fence's info string and body line)
 *
 * ```ts
 * import { typescriptFences } from "@beep/repo-cli/test/Laws"
 *
 * const fence = "`".repeat(3)
 * const [first] = typescriptFences(["# Title", `${fence}ts skip-type-checking`, "const a = 1", fence].join("\n"))
 * console.log(first?.infoString, first?.codeLineIndex) // "ts skip-type-checking" 2
 * ```
 *
 * @param content - Markdown or JSDoc text.
 * @returns Fences in source order.
 * @category utilities
 * @since 0.0.0
 */
export const typescriptFences = (content: string): ReadonlyArray<TypeScriptFence> =>
  pipe(
    Str.matchAll(TYPESCRIPT_FENCE_PATTERN)(content),
    A.fromIterable,
    A.map((match) => {
      const start = O.getOrElse(O.fromNullishOr(match.index), thunk0);
      const openingLength = O.getOrElse(Str.indexOf("\n")(groupText(match, 0)), thunk0) + 1;
      const codeLineIndex = lineIndexAt(content, start + openingLength);
      return TypeScriptFence.make({
        code: groupText(match, 4),
        infoString: Str.trim(`${groupText(match, 2)}${groupText(match, 3)}`),
        language: Str.toLowerCase(groupText(match, 2)),
        openingLineIndex: codeLineIndex - 1,
        codeLineIndex,
      });
    })
  );
