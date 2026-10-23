/**
 * `Fmt.stripControls` byte differential (wave 4, 4-C, W4-d).
 *
 * `@beep/cli-kit` `Fmt.stripControls` replaces two private sanitizers: repo-cli
 * `Yeet/internal/MonitorComments.ts` and `@beep/repo-ai-metrics`
 * `src/agent-effectiveness.ts`, both named `stripTerminalControlSequences`. The
 * two oracle chains below are copied verbatim from origin/main 230b4a4101
 * (MonitorComments.ts:759, agent-effectiveness.ts:2669); they are the same four
 * replacements in the same order.
 *
 * The corpus: every string of one and two code units drawn from an alphabet of
 * the control, escape-introducer, terminator and printable code units that the
 * four passes distinguish; every ESC + X pair for X in U+0000..U+00FF; a fixed
 * list of hostile shapes (OSC 8 hyperlinks, OSC 52 clipboard writes, CSI with
 * every intermediate, unterminated OSC, ST variants, CRLF runs, astral and
 * lone-surrogate text); and 200,000 seeded random strings over the same
 * alphabet. Each input goes through all three functions; the run fails on the
 * first difference, and the report records the counts.
 *
 * Usage (from the repo root):
 *
 *   bun goals/effected-promotion/ops/cli-kit-sanitize-differential.ts [--out <report.json>]
 */

import { Fmt } from "@beep/cli-kit/Fmt";
import { NodeRuntime, NodeServices } from "@effect/platform-node";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import { flow } from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";

// --- the two adopter copies (oracles) ------------------------------------------

const monitorComments: (value: string) => string = flow(
  Str.replace(/\u001B\][\s\S]*?(?:\u0007|\u001B\\)/gu, ""),
  Str.replace(/\u001B\[[0-?]*[ -/]*[@-~]/gu, ""),
  Str.replace(/\u001B[@-Z\\-_]/gu, ""),
  Str.replace(/[\u0000-\u001F\u007F-\u009F]/gu, "")
);

const agentEffectiveness: (value: string) => string = flow(
  Str.replace(/\u001B\][\s\S]*?(?:\u0007|\u001B\\)/gu, ""),
  Str.replace(/\u001B\[[0-?]*[ -/]*[@-~]/gu, ""),
  Str.replace(/\u001B[@-Z\\-_]/gu, ""),
  Str.replace(/[\u0000-\u001F\u007F-\u009F]/gu, "")
);

// --- corpus --------------------------------------------------------------------

const ALPHABET: ReadonlyArray<string> = [
  "\u001B",
  "]",
  "[",
  "\\",
  "\u0007",
  "\u009B",
  "\u009C",
  "\u009D",
  "\u0000",
  "\t",
  "\n",
  "\r",
  "\u007F",
  "\u0085",
  "0",
  "1",
  ";",
  "?",
  " ",
  "/",
  "@",
  "A",
  "m",
  "~",
  "_",
  "^",
  "Z",
  "a",
  "é",
  "界",
  "🙂",
  "\uD83D",
  "\uDE42",
  "​",
];

const FIXED: ReadonlyArray<string> = [
  "",
  "plain text",
  "\u001B]8;;https://evil.test\u0007click\u001B]8;;\u0007",
  "\u001B]8;;https://evil.test\u001B\\click\u001B]8;;\u001B\\",
  "\u001B]52;c;aGVsbG8=\u0007copied",
  "\u001B]0;title",
  "unterminated \u001B]8;;https://x",
  "\u001B[31mred\u001B[0m",
  "\u001B[38;2;255;0;0mtruecolor\u001B[39m",
  "\u001B[?25l\u001B[2J\u001B[H",
  "\u001B[ q\u001B[!p\u001B[1;2'z",
  "\u001B[",
  "\u001B[1",
  "\u001Bc\u001B7\u001B8\u001BM\u001B_\u001B^\u001B\\",
  "line\r\nbreak\nand\rcarriage",
  "tab\there",
  "\u009B31mC1 CSI\u009C",
  "nul\u0000del\u007Fnel\u0085",
  "[yeet] new PR issue comment: @mallory\n::error::spoofed",
  "astral 🙂 and lone \uD83D surrogate",
];

const pairs: ReadonlyArray<string> = A.flatMap(ALPHABET, (a) => [a, ...A.map(ALPHABET, (b) => a + b)]);
const escPairs: ReadonlyArray<string> = A.makeBy(256, (code) => `\u001B${String.fromCharCode(code)}x`);

// A 32-bit linear congruential generator, so the random corpus is the same on every run.
const random = (count: number, seed: number): ReadonlyArray<string> => {
  let state = seed >>> 0;
  const next = (bound: number): number => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state % bound;
  };
  return A.makeBy(count, () =>
    A.join(
      A.makeBy(1 + next(24), () => A.getUnsafe(ALPHABET, next(ALPHABET.length))),
      ""
    )
  );
};

// --- report ----------------------------------------------------------------------

const Report = S.Struct({
  schemaVersion: S.tag("cli-kit-sanitize-differential/v1"),
  oracleBase: S.String,
  inputs: S.Int,
  differences: S.Int,
  changedByOracle: S.Int,
  firstDifference: S.optionalKey(S.Struct({ input: S.String, oracle: S.String, expected: S.String, actual: S.String })),
});
type Report = typeof Report.Type;

class DifferentialFailed extends Data.TaggedError("DifferentialFailed")<{ readonly report: Report }> {}

const flag = (name: string): O.Option<string> => {
  const index = process.argv.indexOf(name);
  return index < 0 ? O.none() : O.fromUndefinedOr(process.argv[index + 1]);
};

const program = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const inputs = [...FIXED, ...pairs, ...escPairs, ...random(200_000, 0x4c43)];
  let differences = 0;
  let changedByOracle = 0;
  let first: Report["firstDifference"];
  for (const input of inputs) {
    const actual = Fmt.stripControls(input);
    for (const [oracle, expected] of [
      ["MonitorComments", monitorComments(input)],
      ["agent-effectiveness", agentEffectiveness(input)],
    ] as const) {
      if (expected !== actual) {
        differences += 1;
        first ??= { input, oracle, expected, actual };
      }
    }
    if (monitorComments(input) !== input) changedByOracle += 1;
  }
  const report: Report = {
    schemaVersion: "cli-kit-sanitize-differential/v1",
    oracleBase: "230b4a4101",
    inputs: inputs.length,
    differences,
    changedByOracle,
    ...(first === undefined ? {} : { firstDifference: first }),
  };
  yield* Console.log(
    `cli-kit sanitize differential: ${report.inputs} inputs (${report.changedByOracle} changed by the oracles), ${report.differences} differences`
  );
  const out = flag("--out");
  if (O.isSome(out))
    yield* fs.writeFileString(out.value, `${yield* S.encodeEffect(S.fromJsonString(Report))(report)}\n`);
  if (differences > 0) return yield* new DifferentialFailed({ report });
});

NodeRuntime.runMain(program.pipe(Effect.provide(NodeServices.layer)));
