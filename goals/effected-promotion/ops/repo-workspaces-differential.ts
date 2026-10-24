/**
 * `@beep/repo-workspaces` differential (wave 4-W-a, W4-f).
 *
 * Runs the package's discovery over this repository and compares three facts against oracles that do not
 * go through it:
 *
 * - **member set** — `WorkspaceDiscovery.listPackages` (relative path and name) against the `workspaces`
 *   section of the repo's `bun.lock`, which bun writes from its own reading of the root `workspaces` globs.
 *   The lockfile is parsed with `Bun.JSONC`, not `@beep/lockfiles`.
 * - **edge set** — `DependencyGraph.adjacency` against the workspace edges read straight from every
 *   member's `package.json` (`JSON.parse`): each name in `dependencies`, `devDependencies`,
 *   `peerDependencies` or `optionalDependencies` that names another member.
 * - **topological validity of `sort()`** — the order is a permutation of the members and places every
 *   oracle dependency before its dependent; a cycle is reported as the failure it is.
 *
 * The report records `commit` (HEAD) and `dirty` (uncommitted changes when the run started); a committed
 * report should come from a clean tree so `commit` names the script version that produced it.
 *
 * Usage (from the repo root):
 *
 *   bun goals/effected-promotion/ops/repo-workspaces-differential.ts [--out <report.json>]
 *
 * Exit code 1 when any gate fails.
 */
import { DependencyGraph, WorkspaceDiscovery, Workspaces } from "@beep/repo-workspaces";
import { NodeRuntime, NodeServices } from "@effect/platform-node";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import { pipe } from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as Path from "effect/Path";
import * as P from "effect/Predicate";
import * as ChildProcess from "effect/process/ChildProcess";
import * as ChildProcessSpawner from "effect/process/ChildProcessSpawner";
import * as R from "effect/Record";
import * as Str from "effect/String";

const TOOL = "goals/effected-promotion/ops/repo-workspaces-differential.ts";
const repoRoot = process.cwd();
const argv = process.argv.slice(2);
const outPath: O.Option<string> = pipe(
  A.findFirstIndex(argv, (arg) => arg === "--out"),
  O.flatMap((index) => A.get(argv, index + 1))
);

const DEPENDENCY_FIELDS = ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"] as const;

const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> => P.isObject(value) && !A.isArray(value);

/** `a -> b` for an edge from a dependent to its dependency. */
const edgeKey = (from: string, to: string): string => `${from} -> ${to}`;

/** The members bun recorded, as `relativePath -> name`, `""` spelled `.` as discovery spells the root. */
const lockfileMembers = Effect.fn("lockfileMembers")(function* (root: string) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const lock: unknown = Bun.JSONC.parse(yield* fs.readFileString(path.join(root, "bun.lock")));
  const workspaces = isRecord(lock) && isRecord(lock.workspaces) ? lock.workspaces : {};
  return R.fromEntries(
    A.map(R.toEntries(workspaces), ([relativePath, entry]) => [
      relativePath === "" ? "." : relativePath,
      isRecord(entry) && P.isString(entry.name) ? entry.name : "",
    ])
  );
});

/** Every workspace edge the members' manifests declare, read with `JSON.parse`. */
const manifestEdges = Effect.fn("manifestEdges")(function* (root: string, members: Readonly<Record<string, string>>) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const names = HashSet.fromIterable(R.values(members));
  const perMember = yield* Effect.forEach(
    R.toEntries(members),
    ([relativePath, name]) =>
      Effect.map(fs.readFileString(path.join(root, relativePath, "package.json")), (text) => {
        const manifest: unknown = JSON.parse(text);
        const declared = A.flatMap(DEPENDENCY_FIELDS, (field) =>
          isRecord(manifest) && isRecord(manifest[field]) ? R.keys(manifest[field]) : []
        );
        return A.map(
          A.dedupe(A.filter(declared, (dependency) => dependency !== name && HashSet.has(names, dependency))),
          (dependency) => edgeKey(name, dependency)
        );
      }),
    { concurrency: 16 }
  );
  return A.sort(A.flatten(perMember), Str.Order);
});

/** The members on one side and not the other, and the paths both have under different names. */
const diffMembers = (ours: Readonly<Record<string, string>>, oracle: Readonly<Record<string, string>>) => ({
  onlyDiscovery: A.sort(
    A.filter(R.keys(ours), (key) => !R.has(oracle, key)),
    Str.Order
  ),
  onlyLockfile: A.sort(
    A.filter(R.keys(oracle), (key) => !R.has(ours, key)),
    Str.Order
  ),
  nameMismatches: A.filter(
    A.map(
      A.filter(R.keys(ours), (key) => R.has(oracle, key)),
      (key) => ({ relativePath: key, discovery: ours[key] ?? "", lockfile: oracle[key] ?? "" })
    ),
    (row) => row.discovery !== row.lockfile
  ),
});

/** Every oracle edge `sort()` places the wrong way round, and the members it omits or repeats. */
const sortViolations = (order: ReadonlyArray<string>, names: ReadonlyArray<string>, edges: ReadonlyArray<string>) => {
  const position = HashMap.fromIterable(A.map(order, (name, index) => [name, index] as const));
  const misplaced = A.filter(edges, (edge) => {
    const [from = "", to = ""] = Str.split(edge, " -> ");
    return (
      O.getOrElse(HashMap.get(position, to), () => Number.POSITIVE_INFINITY) >=
      O.getOrElse(HashMap.get(position, from), () => -1)
    );
  });
  return {
    misplacedEdges: misplaced,
    missingMembers: A.filter(names, (name) => !HashMap.has(position, name)),
    repeated: order.length - HashMap.size(position),
  };
};

const program = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
  const commit = Str.trim(yield* spawner.string(ChildProcess.make("git", ["rev-parse", "HEAD"], { cwd: repoRoot })));
  const dirty = Str.isNonEmpty(
    Str.trim(yield* spawner.string(ChildProcess.make("git", ["status", "--porcelain"], { cwd: repoRoot })))
  );

  const discovery = yield* WorkspaceDiscovery;
  const root = (yield* discovery.info).root;
  const packages = yield* discovery.listPackages;
  const ours = R.fromEntries(A.map(packages, (pkg) => [pkg.relativePath, pkg.name] as const));
  const oracle = yield* lockfileMembers(root);
  const members = diffMembers(ours, oracle);

  const graph = DependencyGraph.make({ packages });
  const discoveredEdges = A.sort(
    A.flatMap(A.fromIterable(graph.adjacency), ([from, to]) =>
      A.map(A.fromIterable(to), (dependency) => edgeKey(from, dependency))
    ),
    Str.Order
  );
  const oracleEdges = yield* manifestEdges(root, oracle);
  const edges = {
    discovery: A.length(discoveredEdges),
    manifests: A.length(oracleEdges),
    onlyDiscovery: A.difference(discoveredEdges, oracleEdges),
    onlyManifests: A.difference(oracleEdges, discoveredEdges),
  };

  const sorted = yield* Effect.result(graph.sort());
  const sort =
    sorted._tag === "Success"
      ? { cycle: null, length: A.length(sorted.success), ...sortViolations(sorted.success, graph.names, oracleEdges) }
      : { cycle: sorted.failure.message, length: 0, misplacedEdges: [], missingMembers: graph.names, repeated: 0 };

  const gates = {
    memberSet:
      A.isReadonlyArrayEmpty(members.onlyDiscovery) &&
      A.isReadonlyArrayEmpty(members.onlyLockfile) &&
      A.isReadonlyArrayEmpty(members.nameMismatches),
    edgeSet: A.isReadonlyArrayEmpty(edges.onlyDiscovery) && A.isReadonlyArrayEmpty(edges.onlyManifests),
    topologicalSort:
      sort.cycle === null &&
      A.isReadonlyArrayEmpty(sort.misplacedEdges) &&
      A.isReadonlyArrayEmpty(sort.missingMembers) &&
      sort.repeated === 0,
  };
  const report = {
    tool: TOOL,
    commit,
    dirty,
    bun: Bun.version,
    oracles: {
      memberSet: "bun.lock `workspaces` keys and names, parsed with Bun.JSONC",
      edgeSet: "member package.json dependency fields, parsed with JSON.parse",
    },
    gates,
    members: { discovery: R.keys(ours).length, lockfile: R.keys(oracle).length, ...members },
    edges,
    sort,
  };
  // Committed output carries no machine paths: the checkout is `<repo>` and the home directory `~`.
  const json = Str.replaceAll(
    process.env.HOME ?? "~",
    "~"
  )(Str.replaceAll(repoRoot, "<repo>")(JSON.stringify(report, null, 2)));
  yield* O.match(outPath, {
    onNone: () => Console.log(json),
    onSome: (out) => fs.writeFileString(out, `${json}\n`),
  });
  yield* Console.error(
    `members: ${report.members.discovery} discovered, ${report.members.lockfile} in bun.lock; ` +
      `edges: ${edges.discovery} discovered, ${edges.manifests} in manifests; ` +
      `sort: ${sort.length} ordered, ${A.length(sort.misplacedEdges)} misplaced`
  );
  if (!gates.memberSet || !gates.edgeSet || !gates.topologicalSort) process.exitCode = 1;
});

// The entry point builds the platform and discovery services once and runs the program in their context.
NodeRuntime.runMain(
  Layer.build(Workspaces.layer({ cwd: repoRoot }).pipe(Layer.provideMerge(NodeServices.layer))).pipe(
    Effect.flatMap((services) => program.pipe(Effect.provide(services))),
    Effect.scoped
  )
);
