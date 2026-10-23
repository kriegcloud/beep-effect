/**
 * `@beep/lockfiles` oracle (wave 3-5, W3-g).
 *
 * Two corpora, one schema-validated JSON report:
 *
 * 1. **Live.** The repo's own root `bun.lock`, parsed by `Lockfile.parse`, is
 *    compared against `bun pm ls --all`, bun's own reading of the same
 *    lockfile. Every tree line is a node_modules path (`parent/child` for a
 *    nested install, which is bun's lockfile key) with the `name@version` bun
 *    resolved there. External packages must agree on path, name and version;
 *    workspace packages must agree on name and directory. Resolved edges must
 *    point at instances the lockfile carries.
 * 2. **Fixtures.** Every tracked lockfile capture in the repo: the 38
 *    `@beep/lockfiles` fixtures plus the lab and repo-cli captures. Each one
 *    must parse, or fail when its directory is named `unsupported-*`. Each
 *    parsed one must keep its edges inside the lockfile, and its distinct
 *    external `name@version` set must equal the set an independent reader
 *    derives from the raw document (`JSON.parse` for npm, `jsonc-parser` for
 *    bun, the `yaml` package for pnpm and yarn Berry). The package fixtures
 *    must also still match `digests.json`.
 *
 * The in-package suite runs on the frozen fixtures only (a modeling package
 * must not read repo-root state in tests); this script is the live half and
 * stays out of CI. Its summary rides in the PR body.
 *
 * Usage (from the repo root, after `bun install`):
 *
 *   bun goals/effected-promotion/ops/lockfiles-oracle.ts [--out <report.json>]
 *
 * Exits non-zero when any check fails.
 */
import { Lockfile } from "@beep/lockfiles/Lockfile";
import { NodeRuntime, NodeServices } from "@effect/platform-node";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Data from "effect/Data";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as FileSystem from "effect/FileSystem";
import { pipe } from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as Path from "effect/Path";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { parse as parseJsonc } from "jsonc-parser";
import { parseAllDocuments } from "yaml";
import type { LockfileFormat } from "@beep/lockfiles/LockfileFormat";

// --- report schema ------------------------------------------------------------

const Sample = S.Array(S.String);

const LiveReport = S.Struct({
  lockfile: S.NonEmptyString,
  bunVersion: S.NonEmptyString,
  lockfilePackages: S.Int,
  lockfileExternals: S.Int,
  lockfileWorkspaces: S.Int,
  treeLines: S.Int,
  treeExternals: S.Int,
  treeWorkspaces: S.Int,
  externalsMatched: S.Int,
  externalsAliased: S.Int,
  externalsAliasedRows: Sample,
  externalsProtocol: S.Int,
  externalsProtocolRows: Sample,
  externalsMismatched: Sample,
  platformSkipped: S.Int,
  onlyInLockfile: Sample,
  onlyInTree: Sample,
  workspacesMatched: S.Int,
  workspacesMismatched: Sample,
  danglingResolvedEdges: Sample,
  ok: S.Boolean,
});
type LiveReport = typeof LiveReport.Type;

const FixtureOutcome = S.Literals(["parsed", "rejected", "not-a-lockfile", "parse-failed", "accepted-unsupported"]);

const FixtureReport = S.Struct({
  path: S.NonEmptyString,
  format: S.Literals(["bun", "npm", "pnpm", "yarn"]),
  outcome: FixtureOutcome,
  failure: S.optionalKey(S.String),
  packages: S.Int,
  workspaces: S.Int,
  importers: S.Int,
  externalNameVersions: S.Int,
  independentNameVersions: S.Int,
  onlyInKit: Sample,
  onlyInIndependent: Sample,
  danglingResolvedEdges: Sample,
  danglingWorkspaceEdges: Sample,
  ok: S.Boolean,
});
type FixtureReport = typeof FixtureReport.Type;

const OracleReport = S.Struct({
  schemaVersion: S.tag(1),
  commit: S.optionalKey(S.NonEmptyString),
  tool: S.NonEmptyString,
  generatedAt: S.NonEmptyString,
  live: LiveReport,
  fixtures: S.Struct({
    files: S.Int,
    parsed: S.Int,
    rejected: S.Int,
    failed: S.Int,
    digestsChecked: S.Int,
    digestMismatches: Sample,
    rows: S.Array(FixtureReport),
  }),
  ok: S.Boolean,
});
type OracleReport = typeof OracleReport.Type;

const OracleReportJson = S.fromJsonString(OracleReport, { space: 2 });
const encodeReport = S.encodeEffect(OracleReportJson);

const Digests = S.Struct({ logicalPath: S.String, sha256: S.String }).pipe(S.Array, S.fromJsonString);
const decodeDigests = S.decodeUnknownEffect(Digests);

class LockfilesOracleFailed extends Data.TaggedError("LockfilesOracleFailed")<{
  readonly failures: ReadonlyArray<string>;
}> {}

class LockfilesOracleCommandFailed extends Data.TaggedError("LockfilesOracleCommandFailed")<{
  readonly command: string;
  readonly exitCode: number;
}> {}

// --- configuration ------------------------------------------------------------

const TOOL = "goals/effected-promotion/ops/lockfiles-oracle.ts";
const SAMPLE_LIMIT = 20;
const repoRoot = new URL("../../..", import.meta.url).pathname;
const fixturePrefix = "packages/foundation/modeling/lockfiles/test/fixtures/";
const FIXTURE_SUFFIX = ".fixture";

const argv = A.drop(process.argv, 2);
const flagValue = (name: string): O.Option<string> =>
  pipe(
    A.findFirstIndex(argv, (arg) => arg === name),
    O.flatMap((index) => A.get(argv, index + 1))
  );

// `A.filterMap` takes a `Result` filter in Effect v4; these readers speak `Option`.
const keepSome = <X, B>(self: Iterable<X>, f: (x: X) => O.Option<B>): Array<B> =>
  A.getSomes(A.map(A.fromIterable(self), f));

const sample = (values: Iterable<string>): ReadonlyArray<string> =>
  A.take(A.sort(A.fromIterable(values), Order.String), SAMPLE_LIMIT);

const run = (command: ReadonlyArray<string>): Effect.Effect<string, LockfilesOracleCommandFailed> =>
  Effect.suspend(() => {
    const result = Bun.spawnSync([...command], { cwd: repoRoot, stdout: "pipe", stderr: "pipe" });
    return result.exitCode === 0
      ? Effect.succeed(result.stdout.toString())
      : Effect.fail(new LockfilesOracleCommandFailed({ command: A.join(command, " "), exitCode: result.exitCode }));
  });

const parseLockfile = (content: string, format: LockfileFormat, configOnly: boolean) =>
  Effect.runSyncExit(Lockfile.parse(content, { format, configOnly }));

// Split `name@version` at the `@` that ends the (possibly scoped) name.
const splitSpec = (spec: string): O.Option<readonly [string, string]> =>
  pipe(
    Str.indexOf("@")(Str.slice(1)(spec)),
    O.map((index) => [Str.slice(0, index + 1)(spec), Str.slice(index + 2)(spec)] as const)
  );

const danglingEdges = (lockfile: Lockfile): ReadonlyArray<string> => {
  const ids = HashSet.fromIterable(A.map(lockfile.packages, (pkg) => pkg.instanceId));
  return A.flatMap(lockfile.packages, (pkg) =>
    keepSome(Object.entries(pkg.resolved), ([name, target]) =>
      HashSet.has(ids, target) ? O.none() : O.some(`${pkg.instanceId} -> ${name}: ${target}`)
    )
  );
};

// --- live: root bun.lock vs `bun pm ls --all` ---------------------------------

type TreeRow = { readonly path: string; readonly name: string; readonly version: string };

// `bun pm ls --all` prints one line per node_modules entry: four characters of
// indent per depth (`│   ` or four spaces), a `├── `/`└── ` marker, then
// `name@version`. A nested entry's bun lockfile key is its ancestors' names and
// its own joined by `/`.
const parseTree = (text: string): ReadonlyArray<TreeRow> => {
  const stack: Array<string> = [];
  const rows: Array<TreeRow> = [];
  for (const line of Str.split("\n")(text)) {
    const marker = /^((?:│ {3}| {4})*)[├└]── (.+)$/.exec(line);
    if (marker === null) continue;
    const depth = (marker[1] ?? "").length / 4;
    const spec = marker[2] ?? "";
    const parts = splitSpec(spec);
    if (O.isNone(parts)) continue;
    const [name, version] = parts.value;
    stack.length = depth;
    stack.push(name);
    rows.push({ path: A.join(stack, "/"), name, version });
  }
  return rows;
};

// bun installs only the optional packages whose `os`/`cpu`/`libc` admit this
// host, and `bun pm ls` lists the install. A lockfile package absent from the
// tree is explained when its own raw constraints exclude the host, or when
// every package that resolves to it is itself excluded (a wasm or native
// binary's private dependency). The constraints are read from the raw
// document with `jsonc-parser`, not through the kit.
const admits = (constraint: unknown, host: string): boolean => {
  const values = typeof constraint === "string" ? [constraint] : Array.isArray(constraint) ? constraint : [];
  if (A.isReadonlyArrayEmpty(values)) return true;
  const negated = A.filter(values, (value) => typeof value === "string" && Str.startsWith("!")(value));
  return A.isReadonlyArrayEmpty(negated) ? A.contains(values, host) : !A.contains(values, `!${host}`);
};

const platformSkipped = (
  content: string,
  lockfile: Lockfile,
  absent: ReadonlyArray<Lockfile["packages"][number]>
): HashSet.HashSet<string> => {
  const document: unknown = parseJsonc(content, [], { allowTrailingComma: true });
  const packages = isRecord(document) && isRecord(document.packages) ? document.packages : {};
  const libc = process.platform === "linux" ? "glibc" : "";
  const excluded = (key: string): boolean => {
    const entry = packages[key];
    const meta = Array.isArray(entry) ? A.findFirst(entry, isRecord) : O.none();
    return O.match(meta, {
      onNone: () => false,
      onSome: (fields) =>
        !admits(fields.os, process.platform) || !admits(fields.cpu, process.arch) || !admits(fields.libc, libc),
    });
  };
  const absentIds = HashSet.fromIterable(A.map(absent, (pkg) => pkg.instanceId));
  const reverse = A.reduce(lockfile.packages, HashMap.empty<string, ReadonlyArray<string>>(), (index, pkg) =>
    A.reduce(Object.values(pkg.resolved), index, (acc, target) =>
      HashMap.set(
        acc,
        target,
        A.append(
          O.getOrElse(HashMap.get(acc, target), () => []),
          pkg.instanceId
        )
      )
    )
  );
  const referrersOf = (id: string): ReadonlyArray<string> => O.getOrElse(HashMap.get(reverse, id), () => []);
  let skipped = HashSet.filter(absentIds, excluded);
  for (let changed = true; changed; ) {
    changed = false;
    for (const id of absentIds) {
      if (HashSet.has(skipped, id)) continue;
      const from = referrersOf(id);
      if (A.isReadonlyArrayNonEmpty(from) && A.every(from, (referrer) => HashSet.has(skipped, referrer))) {
        skipped = HashSet.add(skipped, id);
        changed = true;
      }
    }
  }
  return skipped;
};

const liveOracle = Effect.fn("LockfilesOracle.live")(function* () {
  const fileSystem = yield* FileSystem.FileSystem;
  const pathApi = yield* Path.Path;
  const content = yield* fileSystem.readFileString(pathApi.join(repoRoot, "bun.lock"));
  const lockfile = yield* pipe(
    parseLockfile(content, "bun", false),
    Exit.match({
      onFailure: () =>
        Effect.fail(new LockfilesOracleFailed({ failures: ["root bun.lock does not parse with Lockfile.parse"] })),
      onSuccess: Effect.succeed,
    })
  );
  const bunVersion = Str.trim(yield* run(["bun", "--version"]));
  const tree = parseTree(yield* run(["bun", "pm", "ls", "--all"]));
  const isWorkspaceRow = (row: TreeRow): boolean => Str.startsWith("workspace:")(row.version);
  const treeWorkspaces = A.filter(tree, isWorkspaceRow);
  const treeExternals = A.filter(tree, (row) => !isWorkspaceRow(row));

  const externals = A.filter(lockfile.packages, (pkg) => !pkg.isWorkspace);
  const lockfileByPath = HashMap.fromIterable(A.map(externals, (pkg) => [pkg.instanceId, pkg] as const));
  // A path can repeat in the tree when the same nested install is listed under
  // more than one parent line; it is the same node_modules entry each time.
  const treeByPath = HashMap.fromIterable(A.map(treeExternals, (row) => [row.path, row] as const));

  const mismatched: Array<string> = [];
  const aliased: Array<string> = [];
  const protocol: Array<string> = [];
  const onlyInTree: Array<string> = [];
  let matched = 0;
  for (const row of HashMap.values(treeByPath)) {
    const pkg = HashMap.get(lockfileByPath, row.path);
    if (O.isNone(pkg)) {
      onlyInTree.push(`${row.path} = ${row.name}@${row.version}`);
      continue;
    }
    const { name, version } = pkg.value;
    const line = `${row.path}: tree ${row.name}@${row.version}, kit ${name}@${version}`;
    if (name === row.name && version === row.version) {
      matched += 1;
    } else if (name !== row.name && version === row.version && Str.endsWith(`/${row.name}`)(`/${row.path}`)) {
      // An npm alias (`"x-cjs": "npm:x@4"`): bun prints the install name, the
      // kit's `name` is the real package. `installName` is 3-A1 (W3-g).
      aliased.push(line);
    } else if (name === row.name && version !== row.version && Str.endsWith(`:${row.version}`)(version)) {
      // A `file:`/`link:` dependency: the kit keeps the protocol, bun drops it.
      protocol.push(line);
    } else {
      mismatched.push(line);
    }
  }
  const absent = A.filter(externals, (pkg) => !HashMap.has(treeByPath, pkg.instanceId));
  const skipped = platformSkipped(content, lockfile, absent);
  const onlyInLockfile = keepSome(absent, (pkg) =>
    HashSet.has(skipped, pkg.instanceId) ? O.none() : O.some(`${pkg.instanceId} = ${pkg.name}@${pkg.version}`)
  );

  const workspaceByName = HashMap.fromIterable(A.map(lockfile.workspacePackages, (pkg) => [pkg.name, pkg] as const));
  const workspacesMismatched: Array<string> = [];
  let workspacesMatched = 0;
  for (const row of treeWorkspaces) {
    const directory = Str.slice("workspace:".length)(row.version);
    const pkg = HashMap.get(workspaceByName, row.name);
    if (O.isSome(pkg) && (pkg.value.relativePath ?? "") === directory) {
      workspacesMatched += 1;
    } else {
      workspacesMismatched.push(
        `${row.name}: tree ${directory}, kit ${O.match(pkg, {
          onNone: () => "absent",
          onSome: (found) => found.relativePath ?? "(no path)",
        })}`
      );
    }
  }
  const missingWorkspaces = A.filter(
    lockfile.workspacePackages,
    (pkg) => pkg.relativePath !== "" && !A.some(treeWorkspaces, (row) => row.name === pkg.name)
  );
  for (const pkg of missingWorkspaces)
    workspacesMismatched.push(`${pkg.name}: kit ${pkg.relativePath ?? ""}, tree absent`);

  const dangling = danglingEdges(lockfile);
  const report: LiveReport = {
    lockfile: "bun.lock",
    bunVersion,
    lockfilePackages: lockfile.packages.length,
    lockfileExternals: externals.length,
    lockfileWorkspaces: lockfile.workspacePackages.length,
    treeLines: tree.length,
    treeExternals: HashMap.size(treeByPath),
    treeWorkspaces: treeWorkspaces.length,
    externalsMatched: matched,
    externalsAliased: aliased.length,
    externalsAliasedRows: sample(aliased),
    externalsProtocol: protocol.length,
    externalsProtocolRows: sample(protocol),
    externalsMismatched: sample(mismatched),
    platformSkipped: HashSet.size(skipped),
    onlyInLockfile: sample(onlyInLockfile),
    onlyInTree: sample(onlyInTree),
    workspacesMatched,
    workspacesMismatched: sample(workspacesMismatched),
    danglingResolvedEdges: sample(dangling),
    ok:
      A.isReadonlyArrayEmpty(mismatched) &&
      A.isReadonlyArrayEmpty(onlyInTree) &&
      A.isReadonlyArrayEmpty(onlyInLockfile) &&
      A.isReadonlyArrayEmpty(workspacesMismatched) &&
      A.isReadonlyArrayEmpty(dangling),
  };
  return report;
});

// --- fixtures: every tracked capture -------------------------------------------

const formatOf = (path: string): O.Option<LockfileFormat> => {
  const base = Str.endsWith(FIXTURE_SUFFIX)(path) ? Str.slice(0, path.length - FIXTURE_SUFFIX.length)(path) : path;
  if (Str.endsWith("bun.lock")(base)) return O.some("bun");
  if (Str.endsWith("package-lock.json")(base)) return O.some("npm");
  if (Str.endsWith("pnpm-lock.yaml")(base)) return O.some("pnpm");
  if (Str.endsWith("yarn.lock")(base)) return O.some("yarn");
  return O.none();
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const stringField = (value: unknown, key: string): O.Option<string> =>
  isRecord(value) && typeof value[key] === "string" ? O.some(value[key]) : O.none();

// Independent readers: the distinct `name@version` set of the external
// (non-workspace, non-link) packages, read straight from the raw document.
const independentBun = (content: string): ReadonlyArray<string> => {
  const document: unknown = parseJsonc(content, [], { allowTrailingComma: true });
  const packages = isRecord(document) && isRecord(document.packages) ? document.packages : {};
  return keepSome(Object.values(packages), (entry) =>
    Array.isArray(entry) && typeof entry[0] === "string" && !Str.includes("@workspace:")(entry[0])
      ? O.some(entry[0])
      : O.none()
  );
};

const independentNpm = (content: string): ReadonlyArray<string> => {
  const document: unknown = JSON.parse(content);
  const packages = isRecord(document) && isRecord(document.packages) ? document.packages : {};
  return keepSome(Object.entries(packages), ([key, entry]) => {
    if (!Str.includes("node_modules/")(key) || !isRecord(entry) || entry.link === true) return O.none();
    const name = O.getOrElse(stringField(entry, "name"), () => Str.slice(key.lastIndexOf("node_modules/") + 13)(key));
    return O.map(stringField(entry, "version"), (version) => `${name}@${version}`);
  });
};

const yamlDocuments = (content: string): ReadonlyArray<unknown> =>
  A.map(parseAllDocuments(content) as ReadonlyArray<{ toJS: () => unknown }>, (document) => document.toJS());

// pnpm `packages:` keys across lockfile versions: `name@version` (v9),
// `/name@version` (v6), `/name/version` (v5), each with an optional peer
// suffix `(…)` or `_…`.
const pnpmKey = (key: string): O.Option<string> => {
  const bare = Str.startsWith("/")(key) ? Str.slice(1)(key) : key;
  const unpeered = Str.split("(")(bare)[0] ?? bare;
  return pipe(
    splitSpec(unpeered),
    O.orElse(() => {
      const slash = unpeered.lastIndexOf("/");
      return slash > 0 ? O.some([Str.slice(0, slash)(unpeered), Str.slice(slash + 1)(unpeered)] as const) : O.none();
    }),
    O.map(([name, version]) => `${name}@${Str.split("_")(version)[0] ?? version}`)
  );
};

// pnpm 11+ may write an env document before the lockfile document: its only
// importer is `.` and carries `configDependencies`/`packageManagerDependencies`.
const isPnpmEnvDocument = (document: Record<string, unknown>): boolean => {
  const importers = isRecord(document.importers) ? document.importers : {};
  const root = importers["."];
  return (
    A.every(Object.keys(importers), (key) => key === ".") &&
    isRecord(root) &&
    ("configDependencies" in root || "packageManagerDependencies" in root)
  );
};

const DEPENDENCY_SECTIONS = ["dependencies", "devDependencies", "optionalDependencies", "peerDependencies"];

const pnpmDeclares = (content: string, from: string, to: string): boolean =>
  A.some(yamlDocuments(content), (document) => {
    if (!isRecord(document) || isPnpmEnvDocument(document) || !isRecord(document.importers)) return false;
    const importer = document.importers[from];
    return (
      isRecord(importer) &&
      A.some(DEPENDENCY_SECTIONS, (section) => {
        const declared = importer[section];
        return isRecord(declared) && to in declared;
      })
    );
  });

const independentPnpm = (content: string): ReadonlyArray<string> =>
  A.flatMap(yamlDocuments(content), (document) =>
    isRecord(document) && "lockfileVersion" in document && !isPnpmEnvDocument(document) && isRecord(document.packages)
      ? keepSome(Object.keys(document.packages), pnpmKey)
      : []
  );

const independentYarn = (content: string): ReadonlyArray<string> =>
  A.flatMap(yamlDocuments(content), (document) =>
    isRecord(document)
      ? keepSome(Object.entries(document), ([key, entry]) => {
          if (key === "__metadata") return O.none();
          return pipe(
            stringField(entry, "resolution"),
            O.filter((resolution) => !Str.includes("@workspace:")(resolution)),
            O.flatMap(splitSpec),
            O.flatMap(([name]) => O.map(stringField(entry, "version"), (version) => `${name}@${version}`))
          );
        })
      : []
  );

const independentOf = (format: LockfileFormat, content: string): ReadonlyArray<string> => {
  switch (format) {
    case "bun":
      return independentBun(content);
    case "npm":
      return independentNpm(content);
    case "pnpm":
      return independentPnpm(content);
    case "yarn":
      return independentYarn(content);
  }
};

const readable = (format: LockfileFormat, content: string): boolean => {
  try {
    if (format === "npm") return isRecord(JSON.parse(content));
    if (format === "bun") return isRecord(parseJsonc(content, [], { allowTrailingComma: true }));
    return A.some(yamlDocuments(content), isRecord);
  } catch {
    return false;
  }
};

const fixtureOracle = Effect.fn("LockfilesOracle.fixture")(function* (path: string, format: LockfileFormat) {
  const fileSystem = yield* FileSystem.FileSystem;
  const content = yield* fileSystem.readFileString(`${repoRoot}${path}`);
  const unsupported = Str.includes("/unsupported-")(path);
  const configOnly = Str.includes("/env-configonly-")(path);
  const exit = parseLockfile(content, format, configOnly);
  const base = {
    path,
    format,
    packages: 0,
    workspaces: 0,
    importers: 0,
    externalNameVersions: 0,
    independentNameVersions: 0,
    onlyInKit: [],
    onlyInIndependent: [],
    danglingResolvedEdges: [],
    danglingWorkspaceEdges: [],
  };
  if (Exit.isFailure(exit)) {
    const failure = pipe(
      Exit.findErrorOption(exit),
      O.map((error) => (isRecord(error) && typeof error._tag === "string" ? error._tag : "unknown")),
      O.getOrElse(() => "defect")
    );
    // A tracked file with a lockfile's name that is not a lockfile document
    // (the repo-cli proof-epoch digest input is a one-line placeholder): the
    // kit rejects it and so does the independent reader.
    const notALockfile = !unsupported && !readable(format, content);
    const row: FixtureReport = {
      ...base,
      outcome: unsupported ? "rejected" : notALockfile ? "not-a-lockfile" : "parse-failed",
      failure,
      ok: unsupported || notALockfile,
    };
    return row;
  }
  const lockfile = exit.value;
  const kit = HashSet.fromIterable(
    A.map(
      A.filter(lockfile.packages, (pkg) => !pkg.isWorkspace),
      (pkg) => `${pkg.name}@${pkg.version}`
    )
  );
  const independent = HashSet.fromIterable(independentOf(format, content));
  const onlyInKit = HashSet.difference(kit, independent);
  const onlyInIndependent = HashSet.difference(independent, kit);
  const names = HashSet.fromIterable(
    A.flatMap(lockfile.workspacePackages, (pkg) => [pkg.name, pkg.instanceId, pkg.relativePath ?? ""])
  );
  // pnpm records an edge by importer path and dependency name until
  // `withImporterNames` rewrites it, so `to` may be a name the importer declares
  // in the raw document (the root importer `.` included, which the kit's
  // `importers` leave out).
  const declares = (from: string, to: string): boolean => format === "pnpm" && pnpmDeclares(content, from, to);
  const danglingWorkspace = keepSome(lockfile.workspaceDependencies, (edge) =>
    (HashSet.has(names, edge.from) && HashSet.has(names, edge.to)) || declares(edge.from, edge.to)
      ? O.none()
      : O.some(`${edge.from} -> ${edge.to}`)
  );
  const dangling = danglingEdges(lockfile);
  const row: FixtureReport = {
    ...base,
    outcome: unsupported ? "accepted-unsupported" : "parsed",
    packages: lockfile.packages.length,
    workspaces: lockfile.workspacePackages.length,
    importers: lockfile.importers.length,
    externalNameVersions: HashSet.size(kit),
    independentNameVersions: HashSet.size(independent),
    onlyInKit: sample(onlyInKit),
    onlyInIndependent: sample(onlyInIndependent),
    danglingResolvedEdges: sample(dangling),
    danglingWorkspaceEdges: sample(danglingWorkspace),
    ok:
      !unsupported &&
      HashSet.size(onlyInKit) === 0 &&
      HashSet.size(onlyInIndependent) === 0 &&
      A.isReadonlyArrayEmpty(dangling) &&
      A.isReadonlyArrayEmpty(danglingWorkspace),
  };
  return row;
});

const sha256 = (text: string): string => new Bun.CryptoHasher("sha256").update(text).digest("hex");

const fixturesOracle = Effect.fn("LockfilesOracle.fixtures")(function* () {
  const fileSystem = yield* FileSystem.FileSystem;
  const tracked = Str.split("\n")(yield* run(["git", "ls-files"]));
  const captures = keepSome(tracked, (path) =>
    path === "bun.lock" ? O.none() : O.map(formatOf(path), (format) => [path, format] as const)
  );
  const rows = yield* Effect.forEach(captures, ([path, format]) => fixtureOracle(path, format));

  const digests = yield* decodeDigests(yield* fileSystem.readFileString(`${repoRoot}${fixturePrefix}digests.json`));
  const digestMismatches: Array<string> = [];
  for (const { logicalPath, sha256: expected } of digests) {
    const actual = sha256(
      yield* fileSystem.readFileString(`${repoRoot}${fixturePrefix}${logicalPath}${FIXTURE_SUFFIX}`)
    );
    if (actual !== expected) digestMismatches.push(logicalPath);
  }
  return {
    files: rows.length,
    parsed: A.filter(rows, (row) => row.outcome === "parsed").length,
    rejected: A.filter(rows, (row) => row.outcome === "rejected").length,
    failed: A.filter(rows, (row) => !row.ok).length,
    digestsChecked: digests.length,
    digestMismatches: sample(digestMismatches),
    rows,
  };
});

// --- main ---------------------------------------------------------------------

const gitHead = (): O.Option<string> => {
  const result = Bun.spawnSync(["git", "rev-parse", "HEAD"], { cwd: repoRoot });
  return pipe(
    O.some(result.stdout.toString().trim()),
    O.filter((text) => result.exitCode === 0 && /^[0-9a-f]{40}$/.test(text))
  );
};

const program = Effect.fn("LockfilesOracle.main")(function* () {
  const fileSystem = yield* FileSystem.FileSystem;
  const live = yield* liveOracle();
  const fixtures = yield* fixturesOracle();
  const ok = live.ok && fixtures.failed === 0 && A.isReadonlyArrayEmpty(fixtures.digestMismatches);
  const report: OracleReport = {
    schemaVersion: 1,
    ...O.match(gitHead(), { onNone: () => ({}), onSome: (sha) => ({ commit: sha }) }),
    tool: TOOL,
    generatedAt: DateTime.formatIso(yield* DateTime.now),
    live,
    fixtures,
    ok,
  };
  const encoded = yield* encodeReport(report);
  yield* O.match(flagValue("--out"), {
    onNone: () => Console.log(encoded),
    onSome: (out) => fileSystem.writeFileString(out, `${encoded}\n`),
  });
  yield* Console.log(
    `live: ${live.externalsMatched}/${live.lockfileExternals} externals (+${live.externalsAliased} aliases, +${live.externalsProtocol} file: deps, ${live.platformSkipped} skipped for this host) and ${live.workspacesMatched}/${live.lockfileWorkspaces} workspaces agree with bun pm ls --all (bun ${live.bunVersion}); fixtures: ${fixtures.files} files, ${fixtures.parsed} parsed, ${fixtures.rejected} rejected as unsupported, ${fixtures.failed} failing; digests ${fixtures.digestsChecked - fixtures.digestMismatches.length}/${fixtures.digestsChecked}`
  );
  if (!ok) {
    const failures = A.appendAll(
      live.ok ? [] : ["live corpus disagrees with bun pm ls --all"],
      keepSome(fixtures.rows, (row) => (row.ok ? O.none() : O.some(`${row.path}: ${row.outcome}`)))
    );
    return yield* new LockfilesOracleFailed({ failures });
  }
});

program().pipe(Effect.provide(NodeServices.layer), NodeRuntime.runMain);
