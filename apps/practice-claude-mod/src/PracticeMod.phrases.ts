/**
 * Plain-language sentences for practice-kg tool calls, so the attorney reads
 * what Claude is doing instead of a raw tool name and JSON input.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $PracticeClaudeModId } from "@beep/identity/packages";
import * as A from "effect/Array";
import { dual, pipe } from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { PracticeKgToolName } from "./PracticeMod.values.ts";

const $I = $PracticeClaudeModId.create("PracticeMod.phrases");

/**
 * The fields of a practice-kg tool input the sentences read. Every field is
 * optional: a call that lacks one still gets a sentence.
 *
 * @category models
 * @since 0.0.0
 */
class PhraseInput extends S.Opaque<PhraseInput, { readonly brand: unique symbol }>()(
  S.Struct({
    address: S.optionalKey(S.String),
    application_number: S.optionalKey(S.String),
    docket: S.optionalKey(S.String),
    family: S.optionalKey(S.String),
    organized_path: S.optionalKey(S.String),
    patent_number: S.optionalKey(S.String),
    query: S.optionalKey(S.String),
    reference: S.optionalKey(S.String),
    sender: S.optionalKey(S.String),
  }).pipe(
    $I.annoteSchema("PhraseInput", {
      description: "The practice-kg tool input fields a plain-language sentence reads.",
    })
  )
) {}

const decodePhraseInput = S.decodeUnknownOption(PhraseInput);

const isPracticeKgToolName = S.is(PracticeKgToolName);

const MaxQuoted = 60;

const quoted = (text: string): string =>
  Str.length(text) > MaxQuoted ? `"${Str.trimEnd(Str.slice(0, MaxQuoted)(text))}..."` : `"${text}"`;

const lastSegment = (path: string): string =>
  pipe(
    Str.split(/[\\/]/)(path),
    A.last,
    O.getOrElse(() => path)
  );

const sentenceFor = (tool: PracticeKgToolName, input: PhraseInput): string =>
  PracticeKgToolName.match(tool, {
    kg_clients: () => "Listing the firm's clients",
    kg_docket_family: () =>
      input.application_number !== undefined
        ? `Looking up the family of application ${input.application_number}`
        : input.family !== undefined
          ? `Looking up the docket family ${input.family}`
          : "Looking up a docket family",
    kg_application_lookup: () =>
      input.patent_number !== undefined
        ? `Looking up patent ${input.patent_number}`
        : input.application_number !== undefined
          ? `Looking up application ${input.application_number}`
          : input.docket !== undefined
            ? `Looking up docket ${input.docket}`
            : "Looking up an application",
    kg_find: () =>
      input.query !== undefined
        ? `Searching the firm's records for ${quoted(input.query)}`
        : "Searching the firm's records",
    corpus_search_text: () =>
      input.query !== undefined
        ? `Searching the firm's documents for ${quoted(input.query)}`
        : "Searching the firm's documents",
    corpus_get_document: () =>
      input.organized_path !== undefined ? `Opening ${lastSegment(input.organized_path)}` : "Opening a document",
    email_search: () => {
      const subject = input.query !== undefined ? ` for ${quoted(input.query)}` : "";
      const from = input.sender !== undefined ? ` from ${input.sender}` : "";
      return `Searching filed email${subject}${from}`;
    },
    kg_candidate_claims: () =>
      input.docket !== undefined
        ? `Reading the candidate claims for ${input.docket}`
        : input.family !== undefined
          ? `Reading the candidate claims for family ${input.family}`
          : "Reading candidate claims",
    kg_matter_lookup: () =>
      input.reference !== undefined ? `Looking up matter ${input.reference}` : "Looking up a matter",
    kg_correspondent_lookup: () =>
      input.address !== undefined
        ? `Finding the matters ${input.address} writes about`
        : "Finding the matters a sender writes about",
    kg_provenance: () => "Checking where this information came from",
  });

/**
 * The practice-kg tool a transcript tool name refers to, when it refers to
 * one on one of the given MCP servers.
 *
 * **Details**
 *
 * Claude Code names an MCP tool `mcp__<server>__<tool>`. Only servers in
 * `servers` count, so a same-named tool on another server keeps its own row.
 *
 * **Example** (Recognize a practice-kg tool)
 *
 * ```ts
 * import * as O from "effect/Option"
 * import { practiceKgToolOf } from "@/PracticeMod.phrases"
 *
 * console.log(O.getOrNull(practiceKgToolOf(["practice-kg"], "mcp__practice-kg__kg_find"))) // "kg_find"
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const practiceKgToolOf: {
  (toolName: string): (servers: ReadonlyArray<string>) => O.Option<PracticeKgToolName>;
  (servers: ReadonlyArray<string>, toolName: string): O.Option<PracticeKgToolName>;
} = dual(2, (servers: ReadonlyArray<string>, toolName: string): O.Option<PracticeKgToolName> => {
  const parts = Str.split("__")(toolName);
  return parts.length === 3 && parts[0] === "mcp" && A.contains(servers, parts[1] ?? "")
    ? O.liftPredicate(parts[2] ?? "", isPracticeKgToolName)
    : O.none();
});

/**
 * The plain-language sentence for one practice-kg tool call.
 *
 * **Example** (Phrase a matter lookup)
 *
 * ```ts
 * import { phraseToolCall } from "@/PracticeMod.phrases"
 *
 * console.log(phraseToolCall("kg_matter_lookup", { reference: "12345.10008US01" }))
 * // "Looking up matter 12345.10008US01"
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const phraseToolCall: {
  (input: unknown): (tool: PracticeKgToolName) => string;
  (tool: PracticeKgToolName, input: unknown): string;
} = dual(2, (tool: PracticeKgToolName, input: unknown): string =>
  sentenceFor(
    tool,
    O.getOrElse(decodePhraseInput(input), () => PhraseInput.make({}))
  )
);
