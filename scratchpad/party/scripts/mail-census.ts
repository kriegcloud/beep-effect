// @effect-diagnostics globalConsole:skip-file strictEffectProvide:skip-file preferSchemaOverJson:skip-file
/**
 * Run the mail-index adapter over corpus provenance JSONL files and write a
 * count-only census.
 *
 * Usage:
 *   bun scratchpad/party/scripts/mail-census.ts <out.json> <filter-regex|-> <index.jsonl>...
 *
 * `filter-regex` (case-insensitive) is matched against the raw JSONL line, so
 * a subset can be selected without this script naming any matter. `-` = all.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { BunRuntime } from "@effect/platform-bun";
import * as BunServices from "@effect/platform-bun/BunServices";
import { MailMessageIndexRecord } from "@beep/repo-cli/commands/Corpus";
import * as A from "effect/Array";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Stream from "effect/Stream";
import * as Str from "effect/String";
import { pipe } from "effect/Function";
import { emptyCensus, observe, summarize } from "../adapters/MailCensus.ts";
import { adaptMailRecord } from "../adapters/MailIndex.ts";
import { ActivityId } from "../Ids.ts";
import { UtcInstant } from "../Time.ts";
import { thunkTrue } from "@beep/utils";

const decodeRow = S.decodeUnknownEffect(S.fromJsonString(MailMessageIndexRecord));

const program = Effect.fn("mail-census")(function* (out: string, filter: O.Option<RegExp>, inputs: ReadonlyArray<string>) {
  const fs = yield* FileSystem.FileSystem;
  const census = emptyCensus();
  const producedBy = ActivityId.make("act:mail-index-adapter@0.0.0");
  const observedAt = UtcInstant.make(pipe(yield* DateTime.now, DateTime.formatIso, Str.replace(/\.\d+Z$/, "Z")));

  for (const input of inputs) {
    yield* fs.stream(input).pipe(
      Stream.decodeText,
      Stream.splitLines,
      Stream.filter((line) => Str.isNonEmpty(line) && O.match(filter, { onNone: thunkTrue, onSome: (re) => re.test(line) })),
      Stream.runForEach((line) =>
        decodeRow(line).pipe(
          Effect.match({
            onFailure: () => {
              census.rows += 1;
              census.decodeFailures += 1;
            },
            onSuccess: (record) =>
              observe({ census, ingest: adaptMailRecord({ record, side: "client-file", producedBy, observedAt }) }),
          })
        )
      )
    );
  }

  const summary = { inputs: A.length(inputs), filtered: O.isSome(filter), ...summarize(census) };
  yield* fs.writeFileString(out, `${JSON.stringify(summary, null, 2)}\n`);
  yield* Effect.log(`census written: ${out} (${summary.rows} rows)`);
});

const [out, filterArg, ...inputs] = A.drop(process.argv, 2);
if (out === undefined || filterArg === undefined || A.isReadonlyArrayEmpty(inputs)) {
  console.error("usage: mail-census.ts <out.json> <filter-regex|-> <index.jsonl>...");
  process.exit(2);
}
const filter = filterArg === "-" ? O.none() : O.some(new RegExp(filterArg, "i"));

program(out, filter, inputs).pipe(Effect.provide(BunServices.layer), BunRuntime.runMain);
