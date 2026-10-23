/**
 * `@beep/xdg` base-directory differential against `systemd-path` (wave 4, 4-X, W4-c).
 *
 * Runs `systemd-path` with a cleared environment (only `PATH`, `HOME` and the
 * one variable under test) over a matrix of values and `$HOME` spellings, and
 * compares each answer with the package:
 *
 * - `base`: every `XdgBase` kind (`config`, `data`, `cache`, `state`,
 *   `runtime`) against `user-configuration`, `user-shared`,
 *   `user-state-cache`, `user-state-private` and `user-runtime`, through the
 *   pure `XdgBase.resolve`.
 * - `search`: `$XDG_CONFIG_DIRS` and `$XDG_DATA_DIRS` against the system half
 *   of `search-configuration` and `search-shared` (the entries after the user
 *   directory), through `Xdg.layer`.
 *
 * A difference is documented when it is one of the deliberate deviations:
 *
 * - `passwd-fallback`: `$HOME` is unset, empty or relative and no valid
 *   variable applies. `systemd-path` reads the home directory from the user
 *   database; `XdgBase` is HOME-optional and answers `Option.none()`. The
 *   report never records the user-database answer, so no home path of the
 *   machine that ran it is committed.
 * - `relative-entry`: `systemd-path` keeps relative entries of a search list;
 *   the spec says they are invalid and `Xdg.layer` drops them (a list left
 *   with no valid entry takes the default).
 * - `empty-list`: `systemd-path` reads an empty search list as "no system
 *   directories"; the spec says the default applies.
 * - `systemd-default`: with `$XDG_CONFIG_DIRS` unset, `systemd-path` searches
 *   `/etc`, its own convention; the spec default is `/etc/xdg`.
 *
 * Usage (from the repo root, on a host with `systemd-path`):
 *
 *   bun goals/effected-promotion/ops/xdg-systemd-differential.ts [--out <report.json>] [--golden <fixture.json>]
 *
 * `--golden` also writes the `base` lane as the frozen fixture the package
 * suite replays (`packages/foundation/capability/xdg/test/fixtures/systemd-path.golden.json`).
 * Exit status is non-zero when any difference is undocumented.
 */

import { Xdg } from "@beep/xdg/Xdg";
import { XdgBase, XdgBaseKind } from "@beep/xdg/XdgBase";
import { NodeRuntime, NodeServices } from "@effect/platform-node";
import * as A from "effect/Array";
import * as ConfigProvider from "effect/ConfigProvider";
import * as Console from "effect/Console";
import * as Context from "effect/Context";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import { pipe } from "effect/Function";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as ChildProcess from "effect/process/ChildProcess";
import * as ChildProcessSpawner from "effect/process/ChildProcessSpawner";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";

const TOOL = "goals/effected-promotion/ops/xdg-systemd-differential.ts";
const repoRoot = new URL("../../../", import.meta.url).pathname;

// --- matrix -----------------------------------------------------------------

/** `null` is an unset variable. */
const VALUES: ReadonlyArray<string | null> = [
  null,
  "",
  " ",
  "relative",
  "~/x",
  " /leading-space",
  "/abs",
  "/abs/",
  "/a//b",
  "/a/./b",
  "/a/../b",
  "/trailing-space ",
];

const HOMES: ReadonlyArray<string | null> = [
  null,
  "",
  "relative",
  "/home/h",
  "/home/h/",
  "/home/h//",
  "/",
  "//",
  "/./",
  "/..",
  "/a//b",
  "/a/./b",
  "/a/../b",
  "/a/b/..",
  "/home/h ",
];

const SYSTEMD_NAME = XdgBaseKind.match({
  config: () => "user-configuration",
  data: () => "user-shared",
  cache: () => "user-state-cache",
  state: () => "user-state-private",
  runtime: () => "user-runtime",
});

const SEARCH_LISTS: ReadonlyArray<string | null> = [
  null,
  "",
  ":::",
  "/a",
  "/a:/b/",
  "/a::/b",
  "relative",
  "relative:other",
  "/a:relative:/b",
  " /a",
];

// --- report schema ----------------------------------------------------------

const Nullable = S.NullOr(S.String);

const BaseCase = S.Struct({
  kind: XdgBaseKind,
  variable: S.String,
  value: Nullable,
  home: Nullable,
  // `null` when systemd-path answered from the user database (`passwd-fallback`)
  // or had no answer (the runtime directory without a valid variable).
  systemd: Nullable,
  xdg: Nullable,
  verdict: S.Literals(["equal", "passwd-fallback", "undocumented"]),
});
type BaseCase = typeof BaseCase.Type;

const SearchCase = S.Struct({
  variable: S.String,
  value: Nullable,
  systemd: S.Array(S.String),
  xdg: S.Array(S.String),
  verdict: S.Literals(["equal", "systemd-default", "relative-entry", "empty-list", "undocumented"]),
});
type SearchCase = typeof SearchCase.Type;

const Counts = S.Record(S.String, S.Int);

const DifferentialReport = S.Struct({
  schemaVersion: S.tag(1),
  tool: S.NonEmptyString,
  commit: S.String,
  systemd: S.String,
  base: S.Struct({ cases: S.Int, verdicts: Counts, differing: S.Array(BaseCase) }),
  search: S.Struct({ cases: S.Int, verdicts: Counts, differing: S.Array(SearchCase) }),
  undocumented: S.Int,
});

const encodeReport = S.encodeEffect(S.fromJsonString(DifferentialReport, { space: 2 }));
const encodeCounts = S.encodeEffect(S.fromJsonString(Counts));
const encodeJsonText = S.encodeEffect(S.fromJsonString(S.NullOr(S.Union([S.String, S.Int]))));

class XdgDifferentialMismatch extends Data.TaggedError("XdgDifferentialMismatch")<{
  readonly undocumented: number;
}> {}

/**
 * The fixture in the layout Biome formats it to, one `[kind, value, home, systemd]`
 * row per line, so a regenerated fixture diffs case by case. `systemd` is `null`
 * for a passwd-fallback answer or no answer at all.
 */
const goldenText = Effect.fn("XdgDifferential.goldenText")(function* (version: string, cases: ReadonlyArray<BaseCase>) {
  const field = (key: string, value: string | number | null) =>
    Effect.map(encodeJsonText(value), (text) => `  "${key}": ${text},`);
  const header = [yield* field("schemaVersion", 1), yield* field("tool", TOOL), yield* field("systemd", version)];
  const rows = yield* Effect.forEach(cases, (row) =>
    Effect.map(
      Effect.forEach([row.kind, row.value, row.home, row.systemd], (cell) => encodeJsonText(cell)),
      (cells) => `    [${A.join(cells, ", ")}]`
    )
  );
  return `{\n${A.join(header, "\n")}\n  "cases": [\n${A.join(rows, ",\n")}\n  ]\n}\n`;
});

// --- probes -----------------------------------------------------------------

const isAbsolute = (value: string | null): value is string => value !== null && Str.startsWith("/")(value);

const environment = (entries: ReadonlyArray<readonly [string, string | null]>): Record<string, string> =>
  R.fromEntries(A.flatMap(entries, ([key, value]) => (value === null ? [] : [[key, value] as const])));

/** One `systemd-path` answer, with only the final newline removed (values may end in a space). */
const systemdPath = Effect.fn("XdgDifferential.systemdPath")(function* (name: string, env: Record<string, string>) {
  const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
  const command = ChildProcess.make("systemd-path", [name], { env: { PATH: "/usr/bin:/bin", ...env } });
  const output = yield* spawner.string(command).pipe(Effect.orElseSucceed(() => ""));
  return pipe(Str.replace(/\n$/, "")(output), O.liftPredicate(Str.isNonEmpty));
});

const baseCase = Effect.fn("XdgDifferential.baseCase")(function* (
  kind: XdgBaseKind,
  value: string | null,
  home: string | null
) {
  const variable = XdgBase.variable(kind);
  const answer = yield* systemdPath(
    SYSTEMD_NAME(kind),
    environment([
      ["HOME", home],
      [variable, value],
    ])
  );
  const xdg = O.getOrNull(XdgBase.resolve(kind, { ...(value !== null && { value }), ...(home !== null && { home }) }));
  // Without a valid variable or an absolute HOME, systemd-path answers from the user database.
  const passwd = kind !== "runtime" && !isAbsolute(value) && !isAbsolute(home);
  const systemd = passwd ? null : O.getOrNull(answer);
  const verdict: BaseCase["verdict"] =
    passwd && xdg === null ? "passwd-fallback" : systemd === xdg ? "equal" : "undocumented";
  return { kind, variable, value, home, systemd, xdg, verdict } satisfies BaseCase;
});

const sameList = A.makeEquivalence(Str.Equivalence);

const SEARCH = [
  {
    variable: "XDG_CONFIG_DIRS",
    name: "search-configuration",
    field: "configDirs",
    fallback: ["/etc/xdg"],
    systemdDefault: ["/etc"],
  },
  {
    variable: "XDG_DATA_DIRS",
    name: "search-shared",
    field: "dataDirs",
    fallback: ["/usr/local/share", "/usr/share"],
    systemdDefault: ["/usr/local/share", "/usr/share"],
  },
] as const;

const searchCase = Effect.fn("XdgDifferential.searchCase")(function* (
  lane: (typeof SEARCH)[number],
  value: string | null
) {
  const env = environment([
    ["HOME", "/home/h"],
    [lane.variable, value],
  ]);
  const answer = yield* systemdPath(lane.name, env);
  // The first entry is the user directory; the rest is the system search list.
  const systemd = A.drop(O.match(answer, { onNone: A.empty<string>, onSome: Str.split(":") }), 1);
  const paths = yield* Layer.build(
    Layer.provide(Xdg.layer, ConfigProvider.layer(ConfigProvider.fromUnknown(env)))
  ).pipe(
    Effect.map((context) => Context.get(context, Xdg)),
    Effect.scoped
  );
  const xdg = paths[lane.field];
  const absolute = A.filter(systemd, isAbsolute);
  const usesFallback = sameList(xdg, lane.fallback);
  const verdict: SearchCase["verdict"] = sameList(systemd, xdg)
    ? "equal"
    : value === null && sameList(systemd, lane.systemdDefault) && usesFallback
      ? "systemd-default"
      : A.isReadonlyArrayNonEmpty(absolute)
        ? sameList(absolute, xdg)
          ? "relative-entry"
          : "undocumented"
        : usesFallback
          ? A.isReadonlyArrayNonEmpty(systemd)
            ? "relative-entry"
            : "empty-list"
          : "undocumented";
  return { variable: lane.variable, value, systemd, xdg, verdict } satisfies SearchCase;
});

const countVerdicts = <C extends { readonly verdict: string }>(cases: ReadonlyArray<C>): Record<string, number> =>
  A.reduce(cases, R.empty<string, number>(), (counts, item) =>
    R.set(counts, item.verdict, O.getOrElse(R.get(counts, item.verdict), () => 0) + 1)
  );

const flagValue = (flag: string): O.Option<string> =>
  pipe(
    A.findFirstIndex(process.argv, (arg) => arg === flag),
    O.flatMap((index) => A.get(process.argv, index + 1))
  );

const program = Effect.gen(function* () {
  const fileSystem = yield* FileSystem.FileSystem;
  const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
  const commit = Str.trim(yield* spawner.string(ChildProcess.make("git", ["rev-parse", "HEAD"], { cwd: repoRoot })));
  const version = pipe(
    yield* spawner.string(ChildProcess.make("systemd-path", ["--version"])),
    Str.split("\n"),
    A.headNonEmpty
  );

  const base = yield* Effect.forEach(XdgBaseKind.literals, (kind) =>
    Effect.forEach(VALUES, (value) => Effect.forEach(HOMES, (home) => baseCase(kind, value, home)))
  ).pipe(Effect.map((rows) => A.flatten(A.flatten(rows))));
  const search = yield* Effect.forEach(SEARCH, (lane) =>
    Effect.forEach(SEARCH_LISTS, (value) => searchCase(lane, value))
  ).pipe(Effect.map(A.flatten));

  const undocumented =
    A.length(A.filter(base, (row) => row.verdict === "undocumented")) +
    A.length(A.filter(search, (row) => row.verdict === "undocumented"));
  const report = yield* encodeReport({
    schemaVersion: 1,
    tool: TOOL,
    commit,
    systemd: version,
    base: {
      cases: A.length(base),
      verdicts: countVerdicts(base),
      differing: A.filter(base, (row) => row.verdict === "undocumented"),
    },
    search: {
      cases: A.length(search),
      verdicts: countVerdicts(search),
      differing: A.filter(search, (row) => row.verdict !== "equal"),
    },
    undocumented,
  });
  const baseCounts = yield* encodeCounts(countVerdicts(base));
  const searchCounts = yield* encodeCounts(countVerdicts(search));
  yield* Console.log(
    `base: ${A.length(base)} cases ${baseCounts}; search: ${A.length(search)} cases ${searchCounts}; ` +
      `undocumented ${undocumented}`
  );
  yield* O.match(flagValue("--out"), {
    onNone: () => Console.log(report),
    onSome: (path) => fileSystem.writeFileString(path, `${report}\n`),
  });
  yield* O.match(flagValue("--golden"), {
    onNone: () => Effect.void,
    onSome: (path) => Effect.flatMap(goldenText(version, base), (golden) => fileSystem.writeFileString(path, golden)),
  });
  if (undocumented > 0) {
    return yield* new XdgDifferentialMismatch({ undocumented });
  }
});

// The entry point builds the platform services once and runs the program in their context.
NodeRuntime.runMain(
  Layer.build(NodeServices.layer).pipe(
    Effect.flatMap((services) => program.pipe(Effect.provide(services))),
    Effect.scoped
  )
);
