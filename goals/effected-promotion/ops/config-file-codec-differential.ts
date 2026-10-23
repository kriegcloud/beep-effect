/**
 * `@beep/config-file` codec differential (wave 3, sub-wave 3-3, W3-e).
 *
 * Parses every git-tracked JSONC, YAML and TOML file in the repo through the
 * package's codecs and through the npm oracle for each grammar, and compares
 * the documents:
 *
 * - `jsonc`: `*.jsonc` through `JsoncCodec` against `jsonc-parser` `parse`
 *   with `allowTrailingComma` (a file the oracle reports errors for is
 *   oracle-rejected).
 * - `yaml`: `*.yaml` and `*.yml` through `YamlCodec` against `yaml`
 *   `parseDocument(...).toJS({ maxAliasCount: -1 })` (a document with errors,
 *   multi-document streams included, is oracle-rejected).
 * - `toml`: `*.toml` through `TomlCodec` against `smol-toml` `parse`.
 * - `docgen-inputs`: every tracked `package.json` and `docgen*.json` through
 *   `JsoncCodec` against the reader docgen used before 3-3 (`jsonc-parser`
 *   `parse` with its errors ignored). This is the parity capture for the
 *   docgen adopter: the same documents decode the same way, and a file the
 *   old reader accepted only by ignoring errors would now fail typed.
 *
 * Values are compared after one normalization: `Map` becomes an object,
 * `Set` an array, `bigint` a `<n>n` string, non-finite numbers and `-0` tags,
 * and every date or time value (oracle `Date`/`TomlDate`, the package's
 * `Toml*DateTime` classes) its ISO text with fractional seconds removed,
 * because `smol-toml` keeps milliseconds only. Key order is kept.
 *
 * Usage (from the repo root):
 *
 *   bun goals/effected-promotion/ops/config-file-codec-differential.ts [--out <report.json>]
 *     [--yaml-engine <path to another @beep/yaml src/index.ts>]
 *
 * The 3-3 record (`research/config-file-codec-differential-w3*.json`) was made
 * with the current tree and with the `@beep/yaml` source from before #2116:
 *
 *   mkdir -p tmp/yaml-base
 *   git archive c1d1462d3a^1 packages/foundation/modeling/yaml/src | tar -x -C tmp/yaml-base
 *   bun goals/effected-promotion/ops/config-file-codec-differential.ts \
 *     --yaml-engine "$PWD/tmp/yaml-base/packages/foundation/modeling/yaml/src/index.ts"
 *
 * Exit status is non-zero when any lane has a file where both sides accept the
 * text and the documents differ, or where the oracle accepts a text the codec
 * rejects. Files only the codec rejects, or only the oracle rejects, are
 * reported per lane.
 */

import { JsoncCodec } from "@beep/config-file/JsoncCodec";
import { TomlCodec } from "@beep/config-file/TomlCodec";
import { YamlCodec } from "@beep/config-file/YamlCodec";
import { NodeRuntime, NodeServices } from "@effect/platform-node";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import { pipe } from "effect/Function";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as Path from "effect/Path";
import * as P from "effect/Predicate";
import * as ChildProcess from "effect/process/ChildProcess";
import * as ChildProcessSpawner from "effect/process/ChildProcessSpawner";
import * as R from "effect/Record";
import * as Result from "effect/Result";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as jsoncParser from "jsonc-parser";
import { parse as parseToml } from "smol-toml";
import { parseDocument } from "yaml";
import type { ConfigCodec } from "@beep/config-file/ConfigCodec";

const TOOL = "goals/effected-promotion/ops/config-file-codec-differential.ts";
const repoRoot = new URL("../../../", import.meta.url).pathname;

// --- report schema ------------------------------------------------------------

const LaneId = S.Literals(["jsonc", "yaml", "toml", "docgen-inputs"]);
type LaneId = typeof LaneId.Type;

const LaneReport = S.Struct({
  lane: LaneId,
  pathspec: S.Array(S.String),
  oracle: S.NonEmptyString,
  files: S.Int,
  bothAcceptEqual: S.Int,
  bothAcceptDiffer: S.Int,
  oracleOnlyAccepts: S.Int,
  codecOnlyAccepts: S.Int,
  bothReject: S.Int,
  differing: S.Array(S.Struct({ file: S.String, at: S.String })),
  oracleOnlyAccepted: S.Array(S.String),
  codecOnlyAccepted: S.Array(S.String),
  // The same comparison restricted to configuration files: everything outside
  // the grammar packages' own test suites and the machine-written
  // `explorations/` extraction archives.
  configScope: S.Struct({ files: S.Int, mismatching: S.Int }),
});
type LaneReport = typeof LaneReport.Type;

const DifferentialReport = S.Struct({
  schemaVersion: S.tag(1),
  tool: S.NonEmptyString,
  commit: S.String,
  yamlEngine: S.String,
  lanes: S.Array(LaneReport),
});

const encodeReport = S.encodeEffect(S.fromJsonString(DifferentialReport, { space: 2 }));

class CodecDifferentialUsage extends Data.TaggedError("CodecDifferentialUsage")<{
  readonly message: string;
}> {}

class CodecDifferentialMismatch extends Data.TaggedError("CodecDifferentialMismatch")<{
  readonly lanes: ReadonlyArray<string>;
}> {}

// --- normalization ------------------------------------------------------------

const dropFraction = Str.replace(/\.\d+/, "");

const isTomlDateTime = (value: object): boolean =>
  pipe(value.constructor?.name ?? "", Str.startsWith("Toml"), (named) => named && !A.isArray(value));

const normalize = (value: unknown): unknown => {
  if (P.isBigInt(value)) return `${value}n`;
  if (P.isNumber(value)) {
    if (Number.isNaN(value)) return "$NaN";
    if (!Number.isFinite(value)) return value > 0 ? "$Infinity" : "$-Infinity";
    return Object.is(value, -0) ? "$-0" : value;
  }
  if (P.isUndefined(value)) return "$undefined";
  if (!P.isObjectOrArray(value)) return value;
  if (P.isDate(value)) {
    const iso = (value as Date & { readonly toISOString: () => string }).toISOString();
    return `$date:${dropFraction(iso)}`;
  }
  if (isTomlDateTime(value)) return `$date:${dropFraction(String(value))}`;
  if (value instanceof globalThis.Map) {
    return R.fromEntries(A.map(A.fromIterable(value.entries()), ([key, entry]) => [String(key), normalize(entry)]));
  }
  if (value instanceof globalThis.Set) return A.map(A.fromIterable(value), normalize);
  if (A.isArray(value)) return A.map(value, normalize);
  return R.map(value as Record<string, unknown>, normalize);
};

const canonical = (value: unknown): string => JSON.stringify(normalize(value));

// The JSON pointer of the first place two normalized documents part, for the report.
const firstDifference = (left: unknown, right: unknown, at: string): O.Option<string> => {
  if (P.isObjectOrArray(left) && P.isObjectOrArray(right) && A.isArray(left) === A.isArray(right)) {
    const leftKeys = R.keys(left as Record<string, unknown>);
    const rightKeys = R.keys(right as Record<string, unknown>);
    if (A.join(leftKeys, "\u0000") !== A.join(rightKeys, "\u0000")) return O.some(`${at} (keys)`);
    return A.findFirst(leftKeys, (key) =>
      O.isSome(
        firstDifference((left as Record<string, unknown>)[key], (right as Record<string, unknown>)[key], `${at}/${key}`)
      )
    ).pipe(
      O.flatMap((key) =>
        firstDifference((left as Record<string, unknown>)[key], (right as Record<string, unknown>)[key], `${at}/${key}`)
      )
    );
  }
  return JSON.stringify(left) === JSON.stringify(right) ? O.none() : O.some(at === "" ? "/" : at);
};

// --- oracles --------------------------------------------------------------------

type Outcome = Result.Result<unknown, string>;

const catching = (run: () => unknown): Outcome => {
  try {
    return Result.succeed(run());
  } catch (cause) {
    return Result.fail(String(cause));
  }
};

const jsoncOracle = (text: string): Outcome => {
  const errors: Array<jsoncParser.ParseError> = [];
  const value = jsoncParser.parse(text, errors, { allowTrailingComma: true, disallowComments: false });
  return A.isReadonlyArrayNonEmpty(errors)
    ? Result.fail(`${A.length(errors)} jsonc-parser errors`)
    : Result.succeed(value);
};

// docgen's reader before 3-3: `jsonc.parse(content)` with every error ignored.
const legacyDocgenReader = (text: string): Outcome => catching(() => jsoncParser.parse(text));

const yamlOracle = (text: string): Outcome =>
  catching(() => {
    const document = parseDocument(text);
    if (A.isReadonlyArrayNonEmpty(document.errors)) throw new Error(document.errors[0]?.message);
    return document.toJS({ maxAliasCount: -1 });
  });

const tomlOracle = (text: string): Outcome => catching(() => parseToml(text));

interface Lane {
  readonly codec: ConfigCodec;
  readonly id: LaneId;
  readonly oracle: (text: string) => Outcome;
  readonly oracleName: string;
  readonly pathspec: ReadonlyArray<string>;
}

const makeLanes = (yamlCodec: ConfigCodec): ReadonlyArray<Lane> => [
  {
    id: "jsonc",
    pathspec: ["*.jsonc"],
    oracleName: "jsonc-parser parse (allowTrailingComma, errors reject)",
    oracle: jsoncOracle,
    codec: JsoncCodec,
  },
  {
    id: "yaml",
    pathspec: ["*.yaml", "*.yml"],
    oracleName: "yaml parseDocument(...).toJS({ maxAliasCount: -1 }) (errors reject)",
    oracle: yamlOracle,
    codec: yamlCodec,
  },
  { id: "toml", pathspec: ["*.toml"], oracleName: "smol-toml parse", oracle: tomlOracle, codec: TomlCodec },
  {
    id: "docgen-inputs",
    pathspec: ["package.json", "**/package.json", "docgen*.json", "**/docgen*.json"],
    oracleName: "jsonc-parser parse with errors ignored (docgen before 3-3)",
    oracle: legacyDocgenReader,
    codec: JsoncCodec,
  },
];

// --- run ----------------------------------------------------------------------

const outsideSuites = (file: string): boolean =>
  !/^(explorations\/|packages\/foundation\/modeling\/(yaml|toml|jsonc)\/test\/)/.test(file);

const trackedFiles = Effect.fn("CodecDifferential.trackedFiles")(function* (pathspec: ReadonlyArray<string>) {
  const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
  const output = yield* spawner.string(
    ChildProcess.make("git", ["ls-files", "-z", "--", ...pathspec], { cwd: repoRoot })
  );
  return A.filter(Str.split(output, "\u0000"), Str.isNonEmpty);
});

const runLane = Effect.fn("CodecDifferential.runLane")(function* (lane: Lane) {
  const fileSystem = yield* FileSystem.FileSystem;
  const pathApi = yield* Path.Path;
  const files = yield* trackedFiles(lane.pathspec);
  const rows = yield* Effect.forEach(files, (file) =>
    Effect.gen(function* () {
      const text = yield* fileSystem.readFileString(pathApi.join(repoRoot, file));
      const oracle = lane.oracle(text);
      const ours = yield* Effect.result(lane.codec.parse(text));
      return { file, oracle, ours };
    })
  );
  const pick = (predicate: (row: (typeof rows)[number]) => boolean) =>
    A.map(A.filter(rows, predicate), (row) => row.file);
  const bothAccept = (row: (typeof rows)[number]) => Result.isSuccess(row.oracle) && Result.isSuccess(row.ours);
  const equal = (row: (typeof rows)[number]) =>
    Result.isSuccess(row.oracle) &&
    Result.isSuccess(row.ours) &&
    canonical(row.oracle.success) === canonical(row.ours.success);
  const differing = A.filterMap(
    A.filter(rows, (row) => bothAccept(row) && !equal(row)),
    (row) =>
      Result.isSuccess(row.oracle) && Result.isSuccess(row.ours)
        ? Result.succeed({
            file: row.file,
            at: O.getOrElse(firstDifference(normalize(row.ours.success), normalize(row.oracle.success), ""), () => "/"),
          })
        : Result.failVoid
  );
  const oracleOnlyAccepted = pick((row) => Result.isSuccess(row.oracle) && Result.isFailure(row.ours));
  const codecOnlyAccepted = pick((row) => Result.isFailure(row.oracle) && Result.isSuccess(row.ours));
  const mismatching = [...A.map(differing, (row) => row.file), ...oracleOnlyAccepted, ...codecOnlyAccepted];
  const report: LaneReport = {
    configScope: {
      files: A.length(A.filter(files, outsideSuites)),
      mismatching: A.length(A.filter(mismatching, outsideSuites)),
    },
    lane: lane.id,
    pathspec: lane.pathspec,
    oracle: lane.oracleName,
    files: A.length(rows),
    bothAcceptEqual: A.length(A.filter(rows, equal)),
    bothAcceptDiffer: A.length(differing),
    oracleOnlyAccepts: A.length(oracleOnlyAccepted),
    codecOnlyAccepts: A.length(codecOnlyAccepted),
    bothReject: A.length(A.filter(rows, (row) => Result.isFailure(row.oracle) && Result.isFailure(row.ours))),
    differing,
    oracleOnlyAccepted,
    codecOnlyAccepted,
  };
  return report;
});

const flagValue = (flag: string) =>
  pipe(
    A.findFirstIndex(process.argv, (arg) => arg === flag),
    O.flatMap((index) => A.get(process.argv, index + 1))
  );
const outPath = flagValue("--out");

// `--yaml-engine <module>` swaps the YAML lane's engine for another copy of the
// `@beep/yaml` source (its `index.ts`), wrapped the way `YamlCodec` wraps
// `Yaml.parse`. The 3-3 record uses it to measure the tree before the 3-Y fix.
type YamlParse = (raw: string) => Effect.Effect<unknown, unknown>;
const isYamlEngine = (module: unknown): module is { readonly Yaml: { readonly parse: YamlParse } } =>
  P.hasProperty(module, "Yaml") && P.hasProperty(module.Yaml, "parse") && P.isFunction(module.Yaml.parse);
const yamlCodecFrom = Effect.fn("CodecDifferential.yamlCodecFrom")(function* (engine: O.Option<string>) {
  if (O.isNone(engine)) return { codec: YamlCodec, engine: "@beep/yaml" };
  const loaded = yield* Effect.tryPromise(() => import(engine.value));
  if (!isYamlEngine(loaded)) {
    return yield* new CodecDifferentialUsage({ message: `${engine.value} does not export Yaml.parse` });
  }
  const { Yaml } = loaded;
  const codec: ConfigCodec = {
    ...YamlCodec,
    parse: (raw) => Effect.mapError(Yaml.parse(raw), (cause) => cause as never),
  };
  // Recorded repo-relative, so a committed report never carries a home path.
  const recorded = Str.startsWith(repoRoot)(engine.value) ? Str.slice(repoRoot.length)(engine.value) : engine.value;
  return { codec, engine: recorded };
});

const program = Effect.gen(function* () {
  const fileSystem = yield* FileSystem.FileSystem;
  const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
  const commit = Str.trim(yield* spawner.string(ChildProcess.make("git", ["rev-parse", "HEAD"], { cwd: repoRoot })));
  const yaml = yield* yamlCodecFrom(flagValue("--yaml-engine"));
  const reports = yield* Effect.forEach(makeLanes(yaml.codec), runLane);
  for (const report of reports) {
    yield* Console.log(
      `${report.lane}: ${report.files} files, ${report.bothAcceptEqual} equal, ${report.bothAcceptDiffer} differ, ` +
        `${report.oracleOnlyAccepts} oracle-only, ${report.codecOnlyAccepts} codec-only, ${report.bothReject} both reject; ` +
        `config scope ${report.configScope.files} files, ${report.configScope.mismatching} mismatching`
    );
  }
  const json = yield* encodeReport({ schemaVersion: 1, tool: TOOL, commit, yamlEngine: yaml.engine, lanes: reports });
  yield* O.match(outPath, {
    onNone: () => Console.log(json),
    onSome: (path) => fileSystem.writeFileString(path, `${json}\n`),
  });
  const failing = A.filter(reports, (report) => report.bothAcceptDiffer > 0 || report.oracleOnlyAccepts > 0);
  if (A.isReadonlyArrayNonEmpty(failing)) {
    return yield* new CodecDifferentialMismatch({ lanes: A.map(failing, (report) => report.lane) });
  }
});

// The entry point builds the platform services once and runs the program in their context.
NodeRuntime.runMain(
  Layer.build(NodeServices.layer).pipe(
    Effect.flatMap((services) => program.pipe(Effect.provide(services))),
    Effect.scoped
  )
);
