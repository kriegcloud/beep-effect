/**
 * `@beep/repo-tsconfig` differential (wave 3-2, W3-c).
 *
 * Compares `TsconfigLoader.resolve` against `tsc --showConfig` (the authority, `@typescript/native`, which
 * stays installed) and, with `--three-way`, against `get-tsconfig` `parseTsconfig`. The drop commit removes
 * get-tsconfig from the root catalog and repo-cli, so after it `--three-way` works only while drizzle-kit
 * keeps get-tsconfig@4.14.3 hoisted into the root `node_modules` (no declared dependency remains).
 *
 * The report records `commit` (HEAD) and `dirty` (uncommitted changes when the run started); a committed
 * report should come from a clean tree so `commit` names the script version that produced it.
 *
 * Corpus A is every git-tracked `*tsconfig*.json` outside packet research output. It compares the fields the repo-cli adopters read:
 * `references` (absolute and realpathed), `include` / `exclude` / `files` (absolute against the top config),
 * the path-valued compiler options (`outDir`, `rootDir`, `declarationDir`, `tsBuildInfoFile`, `baseUrl`) and
 * `paths`. `tsc --showConfig` does not print `compilerOptions.plugins`, so plugins are compared against
 * get-tsconfig only. Two tsc outputs are tsc's own expansions, not resolution results, and are classified
 * rather than counted (W3-c: no implied-option or implicit-exclude expansion):
 *
 * - an `exclude` tsc fills in from `outDir` / `declarationDir` when no config in the chain declares one;
 * - `files`, which `--showConfig` prints as the expanded program file list. It is compared only when the
 *   chain declares `files` and no `include`, where the expansion is the declared list;
 * - an empty declared list (`"exclude": []`), which `--showConfig` omits.
 *
 * Corpus B writes one config per synthetic package specifier (`<pkg>`, `<pkg>/tsconfig.json`,
 * `<pkg>/tsconfig`, for every package under the repo's `node_modules` that ships a root `tsconfig*.json` or a
 * `tsconfig` manifest field) into a scoped temporary directory whose `node_modules` links the repo's. The gate
 * is loader verdict == tsc verdict for every specifier. A tsc success means `--showConfig` stdout parses as a
 * JSON object with no `error TS` on stderr AND `--listFilesOnly` reports none of the extends-resolution
 * codes. The second probe is needed because tsgo 7 `--showConfig` drops an unresolvable `extends` silently
 * (exit 0, valid JSON, no diagnostic), so the literal verdict alone passes every specifier; the report keeps
 * that literal count too (`tscLiteralVerdictSucceeds`).
 *
 * Usage (from the repo root):
 *
 *   bun goals/effected-promotion/ops/repo-tsconfig-differential.ts [--three-way] [--out <report.json>]
 *
 * Exit code 1 when either gate fails.
 */
import { TsconfigLoader } from "@beep/repo-tsconfig/TsconfigLoader";
import { NodeRuntime, NodeServices } from "@effect/platform-node";
import * as A from "effect/Array";
import * as Console from "effect/Console";
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
import * as Stream from "effect/Stream";
import * as Str from "effect/String";

const repoRoot = process.cwd();
const argv = process.argv.slice(2);
const hasFlag = (flag: string): boolean => A.contains(argv, flag);
const flagValue = (flag: string): O.Option<string> =>
  pipe(
    A.findFirstIndex(argv, (arg) => arg === flag),
    O.flatMap((index) => A.get(argv, index + 1))
  );
const threeWay = hasFlag("--three-way");
const CONCURRENCY = 8;
const tscBin = "node_modules/.bin/tsc";

/** Path-valued compiler options the adopters (and tsc's absolutization) cover. */
const PATH_OPTIONS = ["outDir", "rootDir", "declarationDir", "tsBuildInfoFile", "baseUrl"] as const;
const FIELDS = ["references", "include", "exclude", "files", ...PATH_OPTIONS, "paths"] as const;

type Json = unknown;
type Projection = Readonly<Record<string, Json>>;

const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> => P.isObject(value) && !A.isArray(value);
const stable = (value: Json): string => JSON.stringify(value ?? null);
const stringsOf = (value: unknown): O.Option<ReadonlyArray<string>> =>
  A.isArray(value) ? O.some(A.filter(value, P.isString)) : O.none();

// --- process ------------------------------------------------------------------

interface ProcessResult {
  readonly exitCode: number;
  readonly stderr: string;
  readonly stdout: string;
}

const run = Effect.fnUntraced(function* (command: string, args: ReadonlyArray<string>) {
  const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
  return yield* Effect.scoped(
    Effect.gen(function* () {
      const handle = yield* spawner.spawn(ChildProcess.make(command, [...args], { cwd: repoRoot }));
      const [stdout, stderr, exitCode] = yield* Effect.all(
        [
          Stream.mkString(Stream.decodeText(handle.stdout)),
          Stream.mkString(Stream.decodeText(handle.stderr)),
          handle.exitCode,
        ],
        { concurrency: "unbounded" }
      );
      const result: ProcessResult = { exitCode: Number(exitCode), stdout, stderr };
      return result;
    })
  );
});

/** The first `error TS` line of a tsc run, trimmed. */
const firstTsError = (result: ProcessResult): O.Option<string> =>
  pipe(
    Str.split(`${result.stdout}\n${result.stderr}`, "\n"),
    A.findFirst((line) => Str.includes("error TS")(line)),
    O.map(Str.trim)
  );

/**
 * tsc's printed config and its literal verdict: stdout is one JSON object and stderr has no `error TS`.
 *
 * **Gotchas**
 *
 * tsgo 7.0.2 `--showConfig` exits 0 and prints the config with NO diagnostic when an `extends` target does
 * not resolve; it silently drops the base. So the literal verdict alone calls every unresolvable specifier
 * a success. {@link configDiagnostics} supplies the extends verdict.
 */
const showConfig = Effect.fnUntraced(function* (configPath: string) {
  const result = yield* run(tscBin, ["--showConfig", "-p", configPath]);
  const parsed = O.liftThrowable((text: string): unknown => JSON.parse(text))(result.stdout);
  const config = O.filter(parsed, isRecord);
  const ok = O.isSome(config) && !Str.includes("error TS")(result.stderr);
  return { ok, config: ok ? config : O.none(), exitCode: result.exitCode, firstError: firstTsError(result) };
});

/**
 * The diagnostic codes tsc raises when an `extends` target does not resolve: `TS6053` (file not found),
 * `TS5083` (cannot read file) and `TS18000` (circularity). Every other code is about the resolved options
 * (`TS5102`/`TS5108`, an option tsgo 7 removed) or the program (`TS6059`, rootDir), which the loader does
 * not validate (W3-c).
 */
const EXTENDS_FAILURE_CODES = ["TS6053", "TS5083", "TS18000"];

/**
 * tsc's diagnostics for one config: `--listFilesOnly` parses the config (extends included), builds the
 * program root set and prints the diagnostics without type checking. tsgo writes them to stdout, so both
 * streams are searched.
 */
const configDiagnostics = Effect.fnUntraced(function* (configPath: string) {
  const result = yield* run(tscBin, ["-p", configPath, "--noEmit", "--listFilesOnly"]);
  const codes = A.dedupe(
    A.map(Array.from(`${result.stdout}\n${result.stderr}`.matchAll(/error (TS\d+)/g)), (match) => match[1] ?? "")
  );
  return {
    exitCode: result.exitCode,
    codes,
    extendsFailed: A.some(codes, (code) => A.contains(EXTENDS_FAILURE_CODES, code)),
    firstError: firstTsError(result),
  };
});

// --- projections --------------------------------------------------------------

const projector = Effect.fnUntraced(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const real = (p: string): Effect.Effect<string> => fs.realPath(p).pipe(Effect.orElseSucceed(() => p));
  const absList = (base: string, value: unknown): O.Option<ReadonlyArray<string>> =>
    O.map(
      stringsOf(value),
      A.map((entry) => path.resolve(base, entry))
    );
  const references = (base: string, value: unknown): Effect.Effect<O.Option<ReadonlyArray<string>>> =>
    A.isArray(value)
      ? Effect.map(
          Effect.forEach(
            A.getSomes(A.map(value, (ref) => (isRecord(ref) && P.isString(ref.path) ? O.some(ref.path) : O.none()))),
            (ref) => real(path.resolve(base, ref))
          ),
          O.some
        )
      : Effect.succeed(O.none());
  /**
   * One printed or resolved config as comparable absolute data.
   *
   * @param top - The top config's absolute path.
   * @param doc - The config document (`compilerOptions` plus the file lists and references).
   */
  const project = Effect.fnUntraced(function* (top: string, doc: Readonly<Record<string, unknown>>) {
    const base = path.dirname(top);
    const options = isRecord(doc.compilerOptions) ? doc.compilerOptions : {};
    const entries: Array<readonly [string, Json]> = [];
    const put = (key: string, value: O.Option<Json>): void => {
      if (O.isSome(value)) entries.push([key, value.value]);
    };
    put("references", yield* references(base, doc.references));
    put("include", absList(base, doc.include));
    put("exclude", absList(base, doc.exclude));
    put("files", absList(base, doc.files));
    for (const key of PATH_OPTIONS) {
      const value = options[key];
      put(key, P.isString(value) ? O.some(path.resolve(base, value)) : O.none());
    }
    put("paths", isRecord(options.paths) ? O.some(options.paths) : O.none());
    put("plugins", A.isArray(options.plugins) ? O.some(options.plugins) : O.none());
    const projection: Projection = R.fromEntries(entries);
    return projection;
  });
  return { project, path };
});

type Classified = "equal" | "diff" | "tsc-implicit-exclude" | "tsc-expanded-files" | "tsc-omits-empty-list";

/** Classify one field, loader against tsc. */
const classifyAgainstTsc = (field: string, loader: Projection, tsc: Projection): Classified => {
  if (stable(loader[field]) === stable(tsc[field])) return "equal";
  if (field === "exclude" && loader.exclude === undefined) {
    const implicit = A.filter([tsc.outDir, tsc.declarationDir], P.isString);
    const printed = O.getOrElse(stringsOf(tsc.exclude), () => A.empty<string>());
    if (A.every(printed, (entry) => A.contains(implicit, entry))) return "tsc-implicit-exclude";
  }
  if (stable(loader[field]) === "[]" && tsc[field] === undefined) return "tsc-omits-empty-list";
  if (field === "files" && !(loader.files !== undefined && loader.include === undefined)) {
    return "tsc-expanded-files";
  }
  return "diff";
};

// --- corpus A -----------------------------------------------------------------

type GetTsconfig = { readonly parseTsconfig: (path: string) => unknown };

const loadGetTsconfig = Effect.tryPromise({
  try: (): Promise<GetTsconfig> => import("get-tsconfig"),
  catch: (cause) => cause,
});

interface CorpusAEntry {
  readonly config: string;
  readonly getTsconfigDiffFields: ReadonlyArray<string>;
  readonly getTsconfigOk: boolean | null;
  readonly loaderError: string | null;
  readonly loaderOk: boolean;
  readonly tscClassified: Readonly<Record<string, number>>;
  readonly tscDiffs: ReadonlyArray<{ readonly field: string; readonly loader: Json; readonly tsc: Json }>;
  readonly tscError: string | null;
  readonly tscOk: boolean;
}

const corpusA = Effect.fnUntraced(function* () {
  const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
  const { project, path } = yield* projector();
  const files = A.filter(
    yield* spawner.lines(
      ChildProcess.make("git", ["ls-files", "--", "*tsconfig*.json", ":(exclude)goals/**/research/**"], {
        cwd: repoRoot,
      })
    ),
    Str.isNonEmpty
  );
  const getTsconfig = threeWay ? O.some(yield* loadGetTsconfig) : O.none<GetTsconfig>();
  const started = performance.now();
  const entries = yield* Effect.forEach(
    files,
    Effect.fnUntraced(function* (relative: string) {
      const top = path.join(repoRoot, relative);
      const loaded = yield* Effect.result(TsconfigLoader.resolve(top));
      const loaderProjection =
        loaded._tag === "Success"
          ? O.some(yield* project(top, loaded.success as unknown as Readonly<Record<string, unknown>>))
          : O.none<Projection>();
      const tsc = yield* showConfig(top);
      const tscProjection = O.isSome(tsc.config) ? O.some(yield* project(top, tsc.config.value)) : O.none();
      const getProjection = yield* O.match(getTsconfig, {
        onNone: () => Effect.succeed(O.none<O.Option<Projection>>()),
        onSome: (module) =>
          pipe(
            O.liftThrowable(module.parseTsconfig)(top),
            O.filter(isRecord),
            O.match({
              onNone: () => Effect.succeed(O.some(O.none<Projection>())),
              onSome: (doc) => Effect.map(project(top, doc), (projection) => O.some(O.some(projection))),
            })
          ),
      });
      const tscDiffs: Array<{ field: string; loader: Json; tsc: Json }> = [];
      const tscClassified: Record<string, number> = {};
      if (O.isSome(loaderProjection) && O.isSome(tscProjection)) {
        for (const field of FIELDS) {
          const verdict = classifyAgainstTsc(field, loaderProjection.value, tscProjection.value);
          tscClassified[verdict] = (tscClassified[verdict] ?? 0) + 1;
          if (verdict === "diff") {
            tscDiffs.push({ field, loader: loaderProjection.value[field], tsc: tscProjection.value[field] });
          }
        }
      }
      const getTsconfigDiffFields = pipe(
        O.flatten(getProjection),
        O.flatMap((g) =>
          O.map(loaderProjection, (l) =>
            A.filter([...FIELDS, "plugins"], (field) => stable(l[field]) !== stable(g[field]))
          )
        ),
        O.getOrElse(() => A.empty<string>())
      );
      const entry: CorpusAEntry = {
        config: relative,
        loaderOk: O.isSome(loaderProjection),
        tscOk: tsc.ok,
        getTsconfigOk: O.match(getProjection, { onNone: () => null, onSome: O.isSome }),
        loaderError: loaded._tag === "Failure" ? String(loaded.failure) : null,
        tscError: O.getOrNull(tsc.firstError),
        tscDiffs,
        tscClassified,
        getTsconfigDiffFields,
      };
      return entry;
    }),
    { concurrency: CONCURRENCY }
  );
  const count = (predicate: (entry: CorpusAEntry) => boolean): number => A.length(A.filter(entries, predicate));
  const fieldCounts = (pick: (entry: CorpusAEntry) => ReadonlyArray<string>): Record<string, number> => {
    const counts: Record<string, number> = {};
    for (const entry of entries) for (const field of pick(entry)) counts[field] = (counts[field] ?? 0) + 1;
    return counts;
  };
  const classified: Record<string, number> = {};
  for (const entry of entries) {
    for (const [key, value] of R.toEntries(entry.tscClassified)) classified[key] = (classified[key] ?? 0) + value;
  }
  const adopterDiffs = A.flatMap(entries, (entry) =>
    A.map(entry.tscDiffs, (diff) => ({ config: entry.config, ...diff }))
  );
  return {
    configs: A.length(files),
    wallMs: Math.round(performance.now() - started),
    loaderOk: count((entry) => entry.loaderOk),
    tscOk: count((entry) => entry.tscOk),
    getTsconfigOk: threeWay ? count((entry) => entry.getTsconfigOk === true) : null,
    loaderFailsTscSucceeds: A.map(
      A.filter(entries, (entry) => !entry.loaderOk && entry.tscOk),
      (entry) => ({ config: entry.config, error: entry.loaderError })
    ),
    tscFails: A.map(
      A.filter(entries, (entry) => !entry.tscOk),
      (entry) => ({ config: entry.config, loaderOk: entry.loaderOk, error: entry.tscError })
    ),
    fieldVerdictsAgainstTsc: classified,
    adopterFieldDiffsAgainstTsc: A.length(adopterDiffs),
    adopterFieldDiffExamples: A.take(adopterDiffs, 20),
    getTsconfigDiffFieldCounts: threeWay ? fieldCounts((entry) => entry.getTsconfigDiffFields) : null,
  };
});

// --- corpus B -----------------------------------------------------------------

const packagesWithTsconfig = Effect.fnUntraced(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const modules = path.join(repoRoot, "node_modules");
  const top = A.filter(yield* fs.readDirectory(modules), (name) => !Str.startsWith(".")(name));
  const names = A.flatten(
    yield* Effect.forEach(top, (name) =>
      Str.startsWith("@")(name)
        ? Effect.map(
            fs.readDirectory(path.join(modules, name)).pipe(Effect.orElseSucceed(() => A.empty<string>())),
            A.map((child) => `${name}/${child}`)
          )
        : Effect.succeed([name])
    )
  );
  const shipping = yield* Effect.filter(
    A.sort(names, (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0)),
    Effect.fnUntraced(function* (name: string) {
      const dir = path.join(modules, name);
      const listing = yield* fs.readDirectory(dir).pipe(Effect.orElseSucceed(() => A.empty<string>()));
      if (A.some(listing, (file) => /^tsconfig.*\.json$/.test(file))) return true;
      const manifest = yield* fs
        .readFileString(path.join(dir, "package.json"))
        .pipe(Effect.option, Effect.map(O.flatMap(O.liftThrowable((text: string): unknown => JSON.parse(text)))));
      return O.isSome(manifest) && isRecord(manifest.value) && P.isString(manifest.value.tsconfig);
    }),
    { concurrency: CONCURRENCY }
  );
  return shipping;
});

const corpusB = Effect.fnUntraced(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const packages = yield* packagesWithTsconfig();
  const getTsconfig = threeWay ? O.some(yield* loadGetTsconfig) : O.none<GetTsconfig>();
  const specifiers = A.flatMap(packages, (name) => [name, `${name}/tsconfig.json`, `${name}/tsconfig`]);
  const root = yield* fs.realPath(yield* fs.makeTempDirectoryScoped({ prefix: "repo-tsconfig-differential-" }));
  yield* fs.symlink(path.join(repoRoot, "node_modules"), path.join(root, "node_modules"));
  const started = performance.now();
  const cases = yield* Effect.forEach(
    A.map(specifiers, (spec, index) => ({ spec, dir: path.join(root, `case-${index}`) })),
    Effect.fnUntraced(function* ({ spec, dir }) {
      yield* fs.makeDirectory(dir, { recursive: true });
      yield* fs.writeFileString(path.join(dir, "index.ts"), "export {};\n");
      const configPath = path.join(dir, "tsconfig.json");
      yield* fs.writeFileString(configPath, `${JSON.stringify({ extends: spec, files: ["index.ts"] })}\n`);
      const loaded = yield* Effect.result(TsconfigLoader.resolve(configPath));
      const tsc = yield* showConfig(configPath);
      const diagnostics = yield* configDiagnostics(configPath);
      return {
        spec,
        loaderOk: loaded._tag === "Success",
        tscLiteralOk: tsc.ok,
        tscOk: tsc.ok && !diagnostics.extendsFailed,
        tscCodes: diagnostics.codes,
        getTsconfigOk: O.match(getTsconfig, {
          onNone: () => null,
          onSome: (module) => O.isSome(O.liftThrowable(module.parseTsconfig)(configPath)),
        }),
        tscExitCode: tsc.exitCode,
        loaderError: loaded._tag === "Failure" ? String(loaded.failure) : null,
        tscError: O.getOrNull(O.orElse(tsc.firstError, () => diagnostics.firstError)),
      };
    }),
    { concurrency: CONCURRENCY }
  );
  const tally = (loaderOk: boolean, tscOk: boolean): number =>
    A.length(A.filter(cases, (entry) => entry.loaderOk === loaderOk && entry.tscOk === tscOk));
  const mismatches = A.filter(cases, (entry) => entry.loaderOk !== entry.tscOk);
  const codesWhereBothSucceed: Record<string, number> = {};
  for (const entry of A.filter(cases, (candidate) => candidate.loaderOk && candidate.tscOk)) {
    for (const code of entry.tscCodes) codesWhereBothSucceed[code] = (codesWhereBothSucceed[code] ?? 0) + 1;
  }
  return {
    packages: A.length(packages),
    specifiers: A.length(specifiers),
    wallMs: Math.round(performance.now() - started),
    verdict:
      "tsc success = `--showConfig` stdout parses as a JSON object, its stderr has no `error TS`, and " +
      `\`--listFilesOnly\` reports none of the extends-resolution codes ${A.join(EXTENDS_FAILURE_CODES, ", ")}`,
    tscLiteralVerdictSucceeds: A.length(A.filter(cases, (entry) => entry.tscLiteralOk)),
    tscAnyErrorSucceeds: A.length(
      A.filter(cases, (entry) => entry.tscLiteralOk && A.isReadonlyArrayEmpty(entry.tscCodes))
    ),
    tscCodesWhereBothSucceed: codesWhereBothSucceed,
    bothSucceed: tally(true, true),
    bothFail: tally(false, false),
    loaderOnly: tally(true, false),
    tscOnly: tally(false, true),
    mismatches,
    getTsconfigAgainstTsc: threeWay
      ? {
          agree: A.length(A.filter(cases, (entry) => entry.getTsconfigOk === entry.tscOk)),
          getTsconfigOnly: A.length(A.filter(cases, (entry) => entry.getTsconfigOk === true && !entry.tscOk)),
          tscOnly: A.length(A.filter(cases, (entry) => entry.getTsconfigOk === false && entry.tscOk)),
        }
      : null,
    tscExitCodes: R.fromEntries(
      A.map(A.dedupe(A.map(cases, (entry) => String(entry.tscExitCode))), (code) => [
        code,
        A.length(A.filter(cases, (entry) => String(entry.tscExitCode) === code)),
      ])
    ),
  };
});

// --- program ------------------------------------------------------------------

const program = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
  const commit = Str.trim(yield* spawner.string(ChildProcess.make("git", ["rev-parse", "HEAD"], { cwd: repoRoot })));
  const dirty = Str.isNonEmpty(
    Str.trim(yield* spawner.string(ChildProcess.make("git", ["status", "--porcelain"], { cwd: repoRoot })))
  );
  const tscVersion = Str.trim((yield* run(tscBin, ["--version"])).stdout);
  const a = yield* corpusA();
  const b = yield* Effect.scoped(corpusB());
  const gates = {
    corpusA: a.adopterFieldDiffsAgainstTsc === 0 && A.isReadonlyArrayEmpty(a.loaderFailsTscSucceeds),
    corpusB: A.isReadonlyArrayEmpty(b.mismatches),
  };
  const report = {
    tool: "goals/effected-promotion/ops/repo-tsconfig-differential.ts",
    commit,
    dirty,
    tsc: tscVersion,
    mode: threeWay ? "three-way (loader, get-tsconfig, tsc)" : "two-way (loader, tsc)",
    fields: { againstTsc: FIELDS, againstGetTsconfigAlso: ["plugins"] },
    gates,
    corpusA: a,
    corpusB: b,
  };
  // Committed output carries no machine paths: the checkout is `<repo>` and the home directory `~`.
  const json = Str.replaceAll(
    process.env.HOME ?? "~",
    "~"
  )(Str.replaceAll(repoRoot, "<repo>")(JSON.stringify(report, null, 2)));
  yield* O.match(flagValue("--out"), {
    onNone: () => Console.log(json),
    onSome: (out) => fs.writeFileString(out, `${json}\n`),
  });
  yield* Console.error(
    `corpus A: ${a.configs} configs, ${a.adopterFieldDiffsAgainstTsc} adopter-field diffs against tsc; ` +
      `corpus B: ${b.specifiers} specifiers, ${A.length(b.mismatches)} loader/tsc mismatches`
  );
  if (!gates.corpusA || !gates.corpusB) process.exitCode = 1;
});

// The entry point builds the platform services once and runs the program in their context.
NodeRuntime.runMain(
  Layer.build(NodeServices.layer).pipe(
    Effect.flatMap((services) => program.pipe(Effect.provide(services))),
    Effect.scoped
  )
);
