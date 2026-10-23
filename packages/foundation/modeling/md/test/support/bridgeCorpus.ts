// The bridge-corpus ledger: every @beep/markdown conformance example run
// through Md.parse, with its loss reasons, safety tags, node counts and the
// MQ6 writer differential (Md.render against the kit's own stringify).
//
// The ledger is a conformance fixture, not an allow-list: nothing reads it
// to excuse a failure. A test regenerates it and compares the file, so any
// change in bridge behaviour shows up as a ledger diff in review.
//
// Corpora come from the `@beep/markdown/conformance/*` JSON subpaths. The
// mdast fixtures export only their reference trees, so an mdast row decodes
// the tree with `Mdast.fromMdastResult`, writes it with the kit's
// stringify, and parses that text.

import { Markdown, MarkdownDialect } from "@beep/markdown/Markdown";
import { MarkdownDocument } from "@beep/markdown/MarkdownDocument";
import { Mdast } from "@beep/markdown/Mdast";
import { Document } from "@beep/md/Md.model";
import { MdParseOptions, parseResult } from "@beep/md/Md.parse";
import { render } from "@beep/md/Md.render";
import { MdLossReason, refineSafe } from "@beep/md/Md.syntax";
import { LiteralKit } from "@beep/schema/LiteralKit";
import * as A from "effect/Array";
import { pipe } from "effect/Function";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as Result from "effect/Result";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { ROUND_TRIP_GAPS, RoundTripGap } from "./bridgeArbitrary.ts";
import type { MdFromSyntax } from "@beep/md/Md.syntax";

/** The conformance corpus a ledger row comes from. */
const BridgeCorpusName = LiteralKit(["commonmark", "gfm-spec", "gfm-extensions", "mdast"]);

/** Type for {@link BridgeCorpusName}. */
type BridgeCorpusName = typeof BridgeCorpusName.Type;

/** How one example crossed the bridge. */
const BridgeOutcome = LiteralKit(["lossless", "lossy", "unsafe", "parseError"]);

/**
 * Md.render against `Markdown.stringify` for one example: byte-identical
 * text, different text that re-parses to the same Md document, or neither.
 */
const WriterOutcome = LiteralKit([
  "byteEqual",
  "reparseEqual",
  "divergent",
  "renderError",
  "stringifyError",
  "notApplicable",
]);

/** Type for {@link WriterOutcome}. */
type WriterOutcome = typeof WriterOutcome.Type;

/** One spec example as the CommonMark and GFM corpora store it. */
class SpecExample extends S.Opaque<SpecExample, { readonly brand: unique symbol }>()(
  S.Struct({
    example: S.Finite,
    markdown: S.String,
    section: S.String,
  })
) {}

/** One mdast fixture: its name and reference tree. */
export class MdastFixture extends S.Opaque<MdastFixture, { readonly brand: unique symbol }>()(
  S.Struct({
    name: S.String,
    tree: S.Unknown,
  })
) {}

/** One example's ledger row. */
class BridgeCorpusRow extends S.Opaque<BridgeCorpusRow, { readonly brand: unique symbol }>()(
  S.Struct({
    corpus: BridgeCorpusName,
    example: S.String,
    section: S.String,
    outcome: BridgeOutcome,
    lossReasons: S.Array(MdLossReason),
    safety: S.Array(S.String),
    kitNodes: S.Int,
    mdNodes: S.Int,
    writer: WriterOutcome,
  })
) {}

/** Ledger totals, each count keyed in sorted order. */
class BridgeCorpusSummary extends S.Opaque<BridgeCorpusSummary, { readonly brand: unique symbol }>()(
  S.Struct({
    examples: S.Record(S.String, S.Int),
    outcomes: S.Record(S.String, S.Int),
    lossReasons: S.Record(S.String, S.Int),
    safety: S.Record(S.String, S.Int),
    writer: S.Record(S.String, S.Int),
  })
) {}

/** The whole ledger file. */
class BridgeCorpusLedger extends S.Opaque<BridgeCorpusLedger, { readonly brand: unique symbol }>()(
  S.Struct({
    summary: BridgeCorpusSummary,
    roundTripGaps: S.Array(RoundTripGap),
    rows: S.Array(BridgeCorpusRow),
  })
) {}

/** One corpus input: where it came from, its text, and the dialect it is read in. */
class CorpusInput extends S.Opaque<CorpusInput, { readonly brand: unique symbol }>()(
  S.Struct({
    corpus: BridgeCorpusName,
    example: S.String,
    section: S.String,
    markdown: S.String,
    dialect: MarkdownDialect,
  })
) {}

const decodeExamples = S.decodeUnknownResult(S.Array(SpecExample));

/** One spec corpus: its ledger name, the dialect it specifies, and its raw JSON examples. */
export class SpecCorpus extends S.Opaque<SpecCorpus, { readonly brand: unique symbol }>()(
  S.Struct({
    corpus: BridgeCorpusName,
    dialect: MarkdownDialect,
    examples: S.Unknown,
  })
) {}

/** A spec corpus as ledger inputs, read in the dialect it specifies. */
export const specInputs = ({ corpus, dialect, examples }: SpecCorpus): ReadonlyArray<CorpusInput> =>
  A.map(Result.getOrThrow(decodeExamples(examples)), (example) =>
    CorpusInput.make({
      corpus,
      example: `${example.example}`,
      section: example.section,
      markdown: example.markdown,
      dialect,
    })
  );

/** The mdast fixtures as ledger inputs: each reference tree written back to text by the kit. */
export const mdastInputs = (fixtures: ReadonlyArray<MdastFixture>): ReadonlyArray<CorpusInput> =>
  A.map(fixtures, ({ name, tree }) =>
    CorpusInput.make({
      corpus: "mdast",
      example: name,
      section: "mdast",
      markdown: Result.getOrThrow(Result.flatMap(Mdast.fromMdastResult(tree), Markdown.stringifyResult)),
      dialect: "gfm",
    })
  );

const childrenOf = (node: unknown): ReadonlyArray<unknown> =>
  P.hasProperty(node, "children") && A.isArray(node.children) ? node.children : [];

const countNodes = (node: unknown): number =>
  A.reduce(childrenOf(node), 1, (total, child) => total + countNodes(child));

const encodeDocument = S.encodeResult(S.fromJsonString(Document));

const sortedUnique = (values: ReadonlyArray<string>): ReadonlyArray<string> => A.sort(A.dedupe(values), Order.String);

const writerOutcome = (input: CorpusInput, document: MarkdownDocument, bridged: MdFromSyntax): WriterOutcome => {
  const options = MdParseOptions.make({ dialect: input.dialect });
  const reparse = (text: string): O.Option<string> =>
    pipe(
      Result.getSuccess(parseResult(text, options)),
      O.flatMap((result) => Result.getSuccess(encodeDocument(result.document)))
    );
  return Result.match(Markdown.stringifyResult(document.root), {
    onFailure: () => "stringifyError",
    onSuccess: (kitText) =>
      Result.match(render(bridged.document), {
        onFailure: () => "renderError",
        onSuccess: (mdText) => {
          if (kitText === mdText) {
            return "byteEqual";
          }
          const kitDocument = reparse(kitText);
          return O.isSome(kitDocument) && O.contains(reparse(mdText), kitDocument.value) ? "reparseEqual" : "divergent";
        },
      }),
  });
};

/** Run one corpus input through Md.parse and record its ledger row. */
export const bridgeCorpusRow = (input: CorpusInput): BridgeCorpusRow => {
  const base = { corpus: input.corpus, example: input.example, section: input.section };
  const kit = MarkdownDocument.parseResult(input.markdown, { dialect: input.dialect, frontmatter: true });
  const bridged = parseResult(input.markdown, { dialect: input.dialect });
  if (Result.isFailure(kit) || Result.isFailure(bridged)) {
    return BridgeCorpusRow.make({
      ...base,
      outcome: "parseError",
      lossReasons: [],
      safety: [],
      kitNodes: 0,
      mdNodes: 0,
      writer: "notApplicable",
    });
  }
  const result = bridged.success;
  const safety = Result.match(refineSafe(result), {
    onFailure: (error) => sortedUnique(A.map(error.violations, (violation) => violation._tag)),
    onSuccess: () => A.empty<string>(),
  });
  const lossReasons = A.sort(
    A.map(result.losses, (loss) => loss.reason),
    Order.String
  );
  return BridgeCorpusRow.make({
    ...base,
    outcome: A.isReadonlyArrayNonEmpty(safety)
      ? "unsafe"
      : A.isReadonlyArrayNonEmpty(lossReasons)
        ? "lossy"
        : "lossless",
    lossReasons,
    safety,
    kitNodes: countNodes(kit.success.root),
    mdNodes: result.sourceMap.entries.length,
    writer: writerOutcome(input, kit.success, result),
  });
};

const countBy = (values: ReadonlyArray<string>): Readonly<Record<string, number>> =>
  pipe(
    A.groupBy(values, (value) => value),
    R.map((group) => group.length),
    R.toEntries,
    A.sort(Order.mapInput(Order.String, ([key]: readonly [string, number]) => key)),
    R.fromEntries
  );

/** Build the ledger from its rows. */
export const bridgeCorpusLedger = (rows: ReadonlyArray<BridgeCorpusRow>): BridgeCorpusLedger =>
  BridgeCorpusLedger.make({
    summary: BridgeCorpusSummary.make({
      examples: countBy(A.map(rows, (row) => row.corpus)),
      outcomes: countBy(A.map(rows, (row) => row.outcome)),
      lossReasons: countBy(A.flatMap(rows, (row) => row.lossReasons)),
      safety: countBy(A.flatMap(rows, (row) => row.safety)),
      writer: countBy(A.map(rows, (row) => row.writer)),
    }),
    roundTripGaps: ROUND_TRIP_GAPS,
    rows,
  });

// The ledger is checked into a Biome-formatted tree, so the text follows
// Biome's JSON layout (80 columns, two-space indent): objects always expand,
// and an array stays on one line when that line, with its trailing comma,
// fits.
const JSON_LINE_WIDTH = 80;
const encodeJsonText = S.encodeResult(S.fromJsonString(S.String));
const encodeJsonString = (value: string): string => Result.getOrThrow(encodeJsonText(value));
const encodeLedgerJson = (ledger: BridgeCorpusLedger): S.Json =>
  Result.getOrThrow(S.encodeResult(BridgeCorpusLedger)(ledger));

const isJsonArray = (value: S.Json): value is ReadonlyArray<S.Json> => A.isArray(value);
const isJsonObject = (value: S.Json): value is S.JsonObject => P.isObject(value) && !A.isArray(value);

const inlineJson = (value: S.Json): string =>
  P.isString(value)
    ? encodeJsonString(value)
    : isJsonArray(value)
      ? `[${A.join(A.map(value, inlineJson), ", ")}]`
      : `${value}`;

const layoutJson = (value: S.Json, indent: string, prefix: string, suffix: string): ReadonlyArray<string> => {
  const inner = `${indent}  `;
  const members = (entries: ReadonlyArray<readonly [string, S.Json]>, open: string, close: string) =>
    A.isReadonlyArrayEmpty(entries)
      ? [`${indent}${prefix}${open}${close}${suffix}`]
      : [
          `${indent}${prefix}${open}`,
          ...A.flatMap(entries, ([key, member], index) =>
            layoutJson(member, inner, key, index === entries.length - 1 ? "" : ",")
          ),
          `${indent}${close}${suffix}`,
        ];
  if (isJsonArray(value)) {
    const line = `${indent}${prefix}${inlineJson(value)}${suffix}`;
    return Str.length(line) <= JSON_LINE_WIDTH && !A.some(value, isJsonObject)
      ? [line]
      : members(
          A.map(value, (member) => ["", member] as const),
          "[",
          "]"
        );
  }
  if (isJsonObject(value)) {
    return members(
      A.map(R.toEntries(value), ([key, member]) => [`${encodeJsonString(key)}: `, member] as const),
      "{",
      "}"
    );
  }
  return [`${indent}${prefix}${inlineJson(value)}${suffix}`];
};

/** The ledger's file text in Biome's JSON layout, ending in one newline. */
export const bridgeCorpusText = (ledger: BridgeCorpusLedger): string =>
  `${A.join(layoutJson(encodeLedgerJson(ledger), "", "", ""), "\n")}\n`;
