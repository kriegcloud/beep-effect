/**
 * Semver owner switch differential (roadmap PR R1, W4-h).
 *
 * R1 deletes `@beep/schema/Semver` and moves the hand-rolled version code in repo-cli `VersionSync`
 * (`BunResolver`, `DockerResolver`) and the `CacheClientPin.version` regex in `@beep/repo-configs` onto
 * `@beep/semver`. This script compares the old behaviour against the kit over one corpus:
 *
 * - every resolved version in `bun.lock` (`"name": ["name@version", ...]`);
 * - every git-tracked `package.json`: `version`, the `packageManager` version, and every dependency specifier
 *   that is a bare version after stripping one leading `^`, `~` or `=`;
 * - every `version` of a committed Cache client pin (`goals/turborepo-cache-conformance/research/*.json` and
 *   `explorations/turborepo-quality-cache/research/*.json`);
 * - `GENERATED` strict versions sampled from `Arbitrary.schema(SemVer)` with a fixed seed (the property half);
 * - `PROBES`: hand-written near misses (leading `v`, `MAJOR.MINOR`, leading zeros, empty identifiers, build
 *   metadata, mixed-case prereleases) so every classified divergence has a witness.
 *
 * Sections, each with a gate on unclassified differences:
 *
 * 1. `schemaSemver`: old `Semver.fromStr` / `Semver.compare` against `SemVer.parseResult` / `SemVer.compare`.
 *    Parse verdicts are classified (`loose-normalization` is the old module's documented `v`-prefix,
 *    `MAJOR.MINOR` and inner-whitespace normalization, which the kit does not do). Ordering is compared on
 *    every pair of versions both accept; `old-locale-compare` classifies pairs whose first differing
 *    prerelease identifiers are both alphanumeric and order differently under `String.localeCompare` (the
 *    old module) than under ASCII order (SemVer 2.0.0 §11.4.2, the kit). This section needs the old module,
 *    which R1 deletes: after the deletion commit it reports `skipped` and the committed report is the record.
 * 2. `bunLocal`: the pre-R1 `BunResolver` pattern and comparator (copied below as `oldBun*`, from
 *    `BunResolver.ts:158-322` at 6c0bb54d55) against the shipped `buildBunReport` target selection, over
 *    every ordered pair of Bun-shaped corpus strings.
 * 3. `docker`: the pre-R1 `DockerResolver` strategies (copied as `oldDocker*`, `DockerResolver.ts:182-319`)
 *    against the shipped `selectLatestDockerTag`, over seeded tag lists built from the corpus, for `redis`,
 *    `pgvector/pgvector` (current tag `pg17`) and `grafana/otel-lgtm`.
 * 4. `cachePin`: the old `CacheClientPin.version` regex against `SemVer.PinnableVersionString`; the gate also
 *    requires every committed pin to pass both.
 *
 * Usage (from the repo root):
 *
 *   bun goals/effected-promotion/ops/semver-owner-switch-differential.ts [--out <report.json>]
 *
 * Exit code 1 when any gate fails.
 */
import { SemVer } from "@beep/semver/SemVer";
import { NodeRuntime, NodeServices } from "@effect/platform-node";
import * as Arbitrary from "effect/Arbitrary";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as ChildProcess from "effect/process/ChildProcess";
import * as ChildProcessSpawner from "effect/process/ChildProcessSpawner";
import * as Result from "effect/Result";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import {
  BunVersionState,
  buildBunReport,
} from "../../../packages/tooling/tool/cli/src/commands/VersionSync/internal/resolvers/BunResolver.ts";
import { selectLatestDockerTag } from "../../../packages/tooling/tool/cli/src/commands/VersionSync/internal/resolvers/DockerResolver.ts";

const repoRoot = process.cwd();
const argv = process.argv.slice(2);
const flagValue = (flag: string): O.Option<string> =>
  O.flatMap(
    A.findFirstIndex(argv, (arg) => arg === flag),
    (index) => A.get(argv, index + 1)
  );

const SEED = 20261023;
const GENERATED_COUNT = 1500;
const DOCKER_LISTS = 3000;
const MAX_EXAMPLES = 12;

const PROBES: ReadonlyArray<string> = [
  "v1.2.3",
  "V1.2.3",
  "=1.2.3",
  "1.2",
  "v1.2",
  " 1.2.3 ",
  "1. 2.3",
  "01.2.3",
  "1.02.3",
  "1.2.03",
  "1.2.3-01",
  "1.2.3-a..b",
  "1.2.3-",
  "1.2.3+",
  "1.2.3+build.5",
  "1.2.3-rc.1+build.5",
  "1.2.3-alpha",
  "1.2.3-Alpha",
  "1.2.3-beta",
  "1.2.3-Beta",
  "1.2.3-a-b",
  "1.2.3-a.b",
  "1.2.3-rc.10",
  "1.2.3-rc.9",
  "9007199254740992.0.0",
  "1.2.3.4",
  "latest",
  "",
];

// --- pre-R1 oracles (copied, behaviour-for-behaviour, from 6c0bb54d55) --------------------------------------

type OldBunIdentifier = number | string;
interface OldBunSemver {
  readonly core: readonly [number, number, number];
  readonly prerelease: ReadonlyArray<OldBunIdentifier> | undefined;
}
const OLD_BUN_SEMVER_PATTERN = /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/;
const oldBunPart = (value: string): number | undefined => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : undefined;
};
const oldBunParse = (value: string): OldBunSemver | undefined => {
  const match = OLD_BUN_SEMVER_PATTERN.exec(value);
  if (match === null) return undefined;
  const major = oldBunPart(match[1] ?? "");
  const minor = oldBunPart(match[2] ?? "");
  const patch = oldBunPart(match[3] ?? "");
  if (major === undefined || minor === undefined || patch === undefined) return undefined;
  // `parsePrerelease`: empty identifiers are dropped; an all-empty list means no prerelease at all.
  const identifiers = (match[4] ?? "").split(".").filter((identifier) => identifier.length > 0);
  const prerelease =
    identifiers.length === 0
      ? undefined
      : identifiers.map((identifier): OldBunIdentifier => (/^\d+$/.test(identifier) ? Number(identifier) : identifier));
  return { core: [major, minor, patch], prerelease };
};
const oldBunCompareIdentifier = (left: OldBunIdentifier, right: OldBunIdentifier): number => {
  if (typeof left === "number" && typeof right === "number") return left - right;
  if (typeof left === "number") return -1;
  if (typeof right === "number") return 1;
  return left < right ? -1 : left > right ? 1 : 0;
};
const oldBunCompare = (left: OldBunSemver, right: OldBunSemver): number => {
  for (let i = 0; i < 3; i++) {
    const delta = (left.core[i] ?? 0) - (right.core[i] ?? 0);
    if (delta !== 0) return delta;
  }
  if (left.prerelease === undefined && right.prerelease === undefined) return 0;
  if (left.prerelease === undefined) return 1;
  if (right.prerelease === undefined) return -1;
  const n = Math.min(left.prerelease.length, right.prerelease.length);
  for (let i = 0; i < n; i++) {
    const result = oldBunCompareIdentifier(left.prerelease[i] ?? "", right.prerelease[i] ?? "");
    if (result !== 0) return result;
  }
  return left.prerelease.length - right.prerelease.length;
};
const oldBunSelect = (bunVersionFile: string, packageManagerField: string): string => {
  const a = oldBunParse(bunVersionFile);
  const b = oldBunParse(packageManagerField);
  if (a !== undefined && b !== undefined) return oldBunCompare(a, b) >= 0 ? bunVersionFile : packageManagerField;
  if (a !== undefined) return bunVersionFile;
  if (b !== undefined) return packageManagerField;
  return bunVersionFile.length > 0 ? bunVersionFile : packageManagerField;
};

const OLD_STABLE_DOCKER_TAG = /^(?!latest$)(?!.*(?:rc|beta|alpha|nightly|dev|snapshot)).+$/i;
const OLD_DOCKER_SEMVER = /^v?(\d+)\.(\d+)\.(\d+)$/;
const OLD_DOCKER_VERSION = /v?(\d+)\.(\d+)\.(\d+)/;
type Triple = readonly [number, number, number];
const oldTriple = (match: RegExpMatchArray | null): Triple | undefined => {
  if (match === null) return undefined;
  const parts = [match[1], match[2], match[3]].map((part) => (part === undefined ? Number.NaN : Number(part)));
  return parts.every((part) => !Number.isNaN(part)) ? [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0] : undefined;
};
const oldTripleCompare = (a: Triple, b: Triple): number =>
  a[0] !== b[0] ? a[0] - b[0] : a[1] !== b[1] ? a[1] - b[1] : a[2] - b[2];
const oldDockerLatestPure = (tags: ReadonlyArray<string>): string | undefined => {
  let best: Triple | undefined;
  let bestTag = "";
  for (const tag of tags) {
    if (!OLD_STABLE_DOCKER_TAG.test(tag)) continue;
    const version = oldTriple(tag.match(OLD_DOCKER_SEMVER));
    if (version !== undefined && (best === undefined || oldTripleCompare(version, best) > 0)) {
      best = version;
      bestTag = tag;
    }
  }
  return bestTag === "" ? undefined : bestTag;
};
const oldDockerLatestPgvector = (tags: ReadonlyArray<string>, currentTag: string): string | undefined => {
  const prefix = currentTag.match(/^(pg\d+)/)?.[1] ?? currentTag;
  const candidates: Array<{ readonly tag: string; readonly version: Triple }> = [];
  for (const tag of tags) {
    if (!tag.startsWith(prefix)) continue;
    if (!OLD_STABLE_DOCKER_TAG.test(tag)) continue;
    const version = oldTriple(tag.match(OLD_DOCKER_VERSION));
    if (version !== undefined) candidates.push({ tag, version });
  }
  if (candidates.length === 0) return undefined;
  return [...candidates].sort((a, b) => oldTripleCompare(b.version, a.version))[0]?.tag;
};
const oldDockerSelect = (repository: string, currentTag: string, tags: ReadonlyArray<string>): string | undefined => {
  const lower = repository.toLowerCase();
  if (lower === "redis" || lower === "library/redis") return oldDockerLatestPure(tags);
  if (lower.includes("pgvector")) return oldDockerLatestPgvector(tags, currentTag);
  return oldDockerLatestPure(tags);
};

const OLD_CACHE_PIN = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;

// --- corpus -----------------------------------------------------------------------------------------------

const BARE_SPEC = /^[\^~=]?(\d[^\s|<>]*)$/;

const spawnLines = Effect.fnUntraced(function* (args: ReadonlyArray<string>) {
  const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
  return A.filter(yield* spawner.lines(ChildProcess.make("git", [...args], { cwd: repoRoot })), Str.isNonEmpty);
});

const collectCorpus = Effect.fnUntraced(function* () {
  const fs = yield* FileSystem.FileSystem;
  const lock = yield* fs.readFileString(`${repoRoot}/bun.lock`);
  const lockVersions: Array<string> = [];
  for (const match of lock.matchAll(/^ {4}"[^"]+": \["((?:@[^@"/]+\/)?[^@"]+)@([^"]+)"/gm)) {
    if (match[2] !== undefined) lockVersions.push(match[2]);
  }
  const manifests = yield* spawnLines(["ls-files", "--", "package.json", "**/package.json"]);
  const manifestVersions: Array<string> = [];
  for (const file of manifests) {
    const text = yield* fs.readFileString(`${repoRoot}/${file}`);
    const json: unknown = yield* Effect.try(() => JSON.parse(text)).pipe(Effect.orElseSucceed(() => undefined));
    if (typeof json !== "object" || json === null) continue;
    const record = json as Record<string, unknown>;
    if (typeof record.version === "string") manifestVersions.push(record.version);
    if (typeof record.packageManager === "string") {
      const at = record.packageManager.lastIndexOf("@");
      if (at > 0) manifestVersions.push(record.packageManager.slice(at + 1).split("+")[0] ?? "");
    }
    for (const key of ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"]) {
      const deps = record[key];
      if (typeof deps !== "object" || deps === null) continue;
      for (const spec of Object.values(deps as Record<string, unknown>)) {
        if (typeof spec !== "string") continue;
        const bare = BARE_SPEC.exec(spec)?.[1];
        if (bare !== undefined) manifestVersions.push(bare);
      }
    }
  }
  const pinFiles = yield* spawnLines([
    "ls-files",
    "--",
    "goals/turborepo-cache-conformance/research/*.json",
    "explorations/turborepo-quality-cache/research/*.json",
  ]);
  const pins: Array<string> = [];
  for (const file of pinFiles) {
    const text = yield* fs.readFileString(`${repoRoot}/${file}`);
    for (const match of text.matchAll(/"version": ?"([^"]*)"/g)) {
      if (match[1] !== undefined) pins.push(match[1]);
    }
  }
  const generated = A.map(
    yield* Arbitrary.sampleEffect(Arbitrary.schema(SemVer), { count: GENERATED_COUNT, seed: SEED }),
    (version) => version.toString()
  );
  return {
    lockVersions: A.dedupe(lockVersions),
    manifestVersions: A.dedupe(manifestVersions),
    pins: A.dedupe(pins),
    generated: A.dedupe(generated),
  };
});

// --- comparison helpers -----------------------------------------------------------------------------------

const sign = (n: number): -1 | 0 | 1 => (n < 0 ? -1 : n > 0 ? 1 : 0);
const kitParse = (input: string): O.Option<SemVer> => Result.getSuccess(SemVer.parseResult(input));

interface Bucket {
  count: number;
  readonly examples: Array<unknown>;
}
const bump = (buckets: Record<string, Bucket>, key: string, example: unknown): void => {
  const bucket = buckets[key] ?? { count: 0, examples: [] };
  bucket.count++;
  if (bucket.examples.length < MAX_EXAMPLES) bucket.examples.push(example);
  buckets[key] = bucket;
};

/** A seeded linear congruential generator, so the Docker tag lists are reproducible without a service. */
const lcg = (seed: number): (() => number) => {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x1_0000_0000;
  };
};

interface OldSchemaSemverModule {
  readonly Semver: {
    readonly fromStr: (value: string) => O.Option<unknown>;
    readonly compare: (left: unknown, right: unknown) => number;
    readonly format: (value: never) => string;
    readonly normalizeStr: (value: string) => string;
  };
}

// --- sections ---------------------------------------------------------------------------------------------

const schemaSemverSection = Effect.fnUntraced(function* (strings: ReadonlyArray<string>) {
  const loaded: O.Option<OldSchemaSemverModule> = yield* Effect.tryPromise(
    () => import("@beep/schema/Semver" as string) as Promise<OldSchemaSemverModule>
  ).pipe(Effect.option);
  if (O.isNone(loaded)) {
    return {
      status: "skipped",
      reason: "@beep/schema/Semver is gone (deleted by R1); the committed report is the record",
    };
  }
  const { Semver } = loaded.value;
  const parse: Record<string, Bucket> = {};
  const accepted: Array<{ readonly input: string; readonly old: unknown; readonly kit: SemVer }> = [];
  for (const input of strings) {
    const old = Semver.fromStr(input);
    const kit = kitParse(input);
    if (O.isSome(old) && O.isSome(kit)) {
      const oldText = Semver.format(old.value as never);
      const kitText = kit.value.toString();
      if (oldText === kitText) {
        bump(parse, "both-accept-same-format", input);
        accepted.push({ input, old: old.value, kit: kit.value });
      } else {
        bump(parse, "UNCLASSIFIED both-accept-format-differs", { input, oldText, kitText });
      }
    } else if (O.isSome(old)) {
      const normalized = Semver.normalizeStr(input);
      const strictAfterNormalize = O.isSome(kitParse(normalized)) && normalized !== Str.trim(input);
      bump(parse, strictAfterNormalize ? "old-only loose-normalization" : "UNCLASSIFIED old-only", input);
    } else if (O.isSome(kit)) {
      bump(parse, "UNCLASSIFIED kit-only", input);
    } else {
      bump(parse, "both-reject", input);
    }
  }
  const ordering: Record<string, Bucket> = {};
  let pairs = 0;
  for (let i = 0; i < accepted.length; i++) {
    for (let j = 0; j < accepted.length; j++) {
      const left = accepted[i];
      const right = accepted[j];
      if (left === undefined || right === undefined) continue;
      pairs++;
      const oldSign = sign(Semver.compare(left.old, right.old));
      const kitSign = SemVer.compare(left.kit, right.kit);
      if (oldSign === kitSign) continue;
      const leftPre = left.kit.prerelease;
      const rightPre = right.kit.prerelease;
      const k = A.findFirstIndex(A.zip(leftPre, rightPre), ([l, r]) => l !== r);
      const localeCase = O.match(k, {
        onNone: () => false,
        onSome: (index) => {
          const l = leftPre[index];
          const r = rightPre[index];
          return (
            typeof l === "string" &&
            typeof r === "string" &&
            sign(l.localeCompare(r)) !== sign(l < r ? -1 : l > r ? 1 : 0)
          );
        },
      });
      bump(ordering, localeCase ? "old-locale-compare" : "UNCLASSIFIED ordering", {
        left: left.input,
        right: right.input,
        old: oldSign,
        kit: kitSign,
      });
    }
  }
  const unclassified =
    A.reduce(Object.entries(parse), 0, (n, [key, bucket]) => (key.startsWith("UNCLASSIFIED") ? n + bucket.count : n)) +
    A.reduce(Object.entries(ordering), 0, (n, [key, bucket]) =>
      key.startsWith("UNCLASSIFIED") ? n + bucket.count : n
    );
  return { status: "ran", strings: strings.length, accepted: accepted.length, pairs, parse, ordering, unclassified };
});

const bunTarget = (bunVersionFile: string, packageManagerField: string): string => {
  const report = buildBunReport(BunVersionState.make({ bunVersionFile, packageManagerField, latest: O.none() }));
  return O.match(
    A.findFirst(report.items, (item) => item.file === ".bun-version" || item.file === "package.json"),
    {
      onNone: () => bunVersionFile,
      onSome: (item) => (item.file === "package.json" ? Str.replace(/^bun@/, "")(item.expected) : item.expected),
    }
  );
};

const bunSection = (strings: ReadonlyArray<string>) => {
  const shaped = A.filter(strings, (input) => /^v?\d/.test(input));
  const buckets: Record<string, Bucket> = {};
  let pairs = 0;
  for (const a of shaped) {
    for (const b of shaped) {
      if (a === b) continue;
      pairs++;
      const oldPick = oldBunSelect(a, b);
      const newPick = bunTarget(a, b);
      if (oldPick === newPick) {
        bump(buckets, "same", [a, b]);
        continue;
      }
      // Classify: the kit rejects what the old pattern accepted (leading zeros, empty identifiers, unsafe
      // integers) or accepts what it rejected (build metadata never: `isPinnable` refuses it).
      const oldA = oldBunParse(a) !== undefined;
      const oldB = oldBunParse(b) !== undefined;
      const kitA = O.isSome(kitParse(Str.replace(/^v/, "")(a)));
      const kitB = O.isSome(kitParse(Str.replace(/^v/, "")(b)));
      const key =
        oldA !== kitA || oldB !== kitB ? "non-semver-pin (old pattern accepted, kit rejects)" : "UNCLASSIFIED";
      bump(buckets, key, { bunVersionFile: a, packageManagerField: b, old: oldPick, new: newPick });
    }
  }
  const sameCount = buckets.same?.count ?? 0;
  delete buckets.same;
  const unclassified = buckets.UNCLASSIFIED?.count ?? 0;
  return { strings: shaped.length, pairs, same: sameCount, differences: buckets, unclassified };
};

const dockerSection = (strings: ReadonlyArray<string>) => {
  const random = lcg(SEED);
  const pool = A.flatMap(strings, (version) => [
    version,
    `v${version}`,
    `${version}-alpine`,
    `${version}-bookworm`,
    `pg17-v${version}`,
    `pg17-${version}`,
    `pg16-v${version}`,
    `pg17-v${version}-rc1`,
  ]);
  const extras = ["latest", "8", "17", "pg17", "alpine", "nightly", "8.2-rc1"];
  const fullPool = A.appendAll(pool, extras);
  const images = [
    { repository: "redis", tag: "8.10.2" },
    { repository: "pgvector/pgvector", tag: "pg17" },
    { repository: "grafana/otel-lgtm", tag: "0.37.0" },
  ];
  const buckets: Record<string, Bucket> = {};
  let lists = 0;
  let same = 0;
  for (let n = 0; n < DOCKER_LISTS; n++) {
    const size = 1 + Math.floor(random() * 40);
    const tags = A.makeBy(size, () => fullPool[Math.floor(random() * fullPool.length)] ?? "latest");
    for (const image of images) {
      lists++;
      const oldPick = oldDockerSelect(image.repository, image.tag, tags);
      const newPick = O.getOrUndefined(selectLatestDockerTag(image, tags));
      if (oldPick === newPick) {
        same++;
        continue;
      }
      // The kit rejects non-SemVer cores the old `Number(...)` triple accepted (leading zeros, unsafe
      // integers); every other difference is unclassified.
      const nonSemverCore = A.some(tags, (tag) => {
        const match = tag.match(OLD_DOCKER_VERSION);
        return match !== null && O.isNone(kitParse(`${match[1]}.${match[2]}.${match[3]}`));
      });
      bump(buckets, nonSemverCore ? "non-semver-core (old triple accepted, kit rejects)" : "UNCLASSIFIED", {
        repository: image.repository,
        old: oldPick ?? null,
        new: newPick ?? null,
        tags,
      });
    }
  }
  const unclassified = buckets.UNCLASSIFIED?.count ?? 0;
  return { lists, same, differences: buckets, unclassified };
};

const cachePinSection = (strings: ReadonlyArray<string>, pins: ReadonlyArray<string>) => {
  const isPinnable = S.is(SemVer.PinnableVersionString);
  const buckets: Record<string, Bucket> = {};
  for (const input of strings) {
    const old = input.length > 0 && OLD_CACHE_PIN.test(input);
    const kit = isPinnable(input);
    if (old === kit) {
      bump(buckets, old ? "both-accept" : "both-reject", input);
      continue;
    }
    const leadingZeroOrEmpty = /(?:^|\.|-)0\d|\.\.|-$|\.$|-\./.test(input) || /^\d+\.\d+\.\d+-.*\.$/.test(input);
    const unsafe = O.isNone(kitParse(input)) && /^\d{16,}/.test(input);
    bump(
      buckets,
      old && !kit && (leadingZeroOrEmpty || unsafe)
        ? "old-only non-semver (leading zero, empty identifier, unsafe integer)"
        : "UNCLASSIFIED",
      input
    );
  }
  const pinVerdicts = A.map(pins, (pin) => ({ pin, old: OLD_CACHE_PIN.test(pin), kit: isPinnable(pin) }));
  const pinsOk = A.every(pinVerdicts, (verdict) => verdict.old && verdict.kit);
  const unclassified = buckets.UNCLASSIFIED?.count ?? 0;
  return { strings: strings.length, verdicts: buckets, committedPins: pinVerdicts, pinsOk, unclassified };
};

// --- program ----------------------------------------------------------------------------------------------

const program = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
  const commit = Str.trim(yield* spawner.string(ChildProcess.make("git", ["rev-parse", "HEAD"], { cwd: repoRoot })));
  const dirty = Str.isNonEmpty(
    Str.trim(yield* spawner.string(ChildProcess.make("git", ["status", "--porcelain"], { cwd: repoRoot })))
  );
  const corpus = yield* collectCorpus();
  const real = A.dedupe([...corpus.lockVersions, ...corpus.manifestVersions, ...corpus.pins]);
  const all = A.dedupe([...real, ...corpus.generated, ...PROBES]);
  const schemaSemver = yield* schemaSemverSection(all);
  // The Bun and Docker sections are quadratic; they take the real corpus plus the probes.
  const bunLocal = bunSection(A.dedupe([...real, ...PROBES]));
  const docker = dockerSection(A.dedupe([...corpus.lockVersions.slice(0, 400), ...PROBES]));
  const cachePin = cachePinSection(all, corpus.pins);
  const gates = {
    schemaSemver: schemaSemver.status === "skipped" || (schemaSemver as { unclassified: number }).unclassified === 0,
    bunLocal: bunLocal.unclassified === 0,
    docker: docker.unclassified === 0,
    cachePin: cachePin.unclassified === 0 && cachePin.pinsOk,
  };
  const report = {
    tool: "goals/effected-promotion/ops/semver-owner-switch-differential.ts",
    commit,
    dirty,
    seed: SEED,
    corpus: {
      bunLockVersions: corpus.lockVersions.length,
      packageJsonVersions: corpus.manifestVersions.length,
      committedCachePins: corpus.pins.length,
      generated: corpus.generated.length,
      probes: PROBES.length,
      distinct: all.length,
    },
    gates,
    schemaSemver,
    bunLocal,
    docker,
    cachePin,
  };
  const json = JSON.stringify(report, null, 2);
  yield* O.match(flagValue("--out"), {
    onNone: () => Console.log(json),
    onSome: (out) => fs.writeFileString(out, `${json}\n`),
  });
  yield* Console.error(`gates: ${JSON.stringify(gates)}`);
  if (!A.every(Object.values(gates), (ok) => ok)) process.exitCode = 1;
});

NodeRuntime.runMain(
  Layer.build(NodeServices.layer).pipe(
    Effect.flatMap((services) => program.pipe(Effect.provide(services))),
    Effect.scoped
  )
);
