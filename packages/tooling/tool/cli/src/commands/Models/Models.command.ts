/**
 * `beep models` — check every routing surface against one operator manifest.
 *
 * **Details**
 *
 * `check` reports drift and exits non-zero on it,
 * `catalog` prints the assembled layered catalog, and `init` seeds a manifest
 * only when none exists. `apply --write` performs journaled owned-field writes; restore rejects native drift.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { findRepoRoot } from "@beep/repo-utils";
import { A, O, pipe, Str } from "@beep/utils";
import * as Config from "effect/Config";
import * as Console from "effect/Console";
import { Command, Flag } from "effect/cli";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Match from "effect/Match";
import * as Path from "effect/Path";
import * as S from "effect/Schema";
import { failWithReportedExit } from "../../internal/cli/ExitCodeError.ts";
import { writeContainedFileString } from "../../internal/cli/FsGuards.ts";
import { formatJsonValue } from "../../internal/cli/Json.ts";
import { ModelsApply, ModelsApplyLive } from "./Models.apply.service.ts";
import { CatalogSnapshot } from "./Models.catalog.schemas.ts";
import { ModelsCatalogOptions } from "./Models.catalog.service.ts";
import { ModelsCommandError } from "./Models.errors.ts";
import { bindLocatorModel } from "./Models.locator.service.ts";
import { ModelsLocatorWrite } from "./Models.manifest.schemas.ts";
import { ModelsTargetLocation, resolveTargetPath } from "./Models.paths.ts";
import { expectedLocatorValue, renderGeneratedBlockBody } from "./Models.render.ts";
import { ModelsCheckReport } from "./Models.report.schemas.ts";
import { seedModelsManifest } from "./Models.seed.ts";
import {
  defaultManifestRelativePath,
  filterBindings,
  ModelsCatalog,
  ModelsCheck,
  ModelsCheckOptions,
  ModelsLive,
  ModelsLocatorReader,
  ModelsManifestStore,
} from "./Models.service.ts";
import type { Locator, ModelSyncTarget, ModelsApplyMode, ModelsManifest } from "./Models.manifest.schemas.ts";
import type { DriftFinding } from "./Models.report.schemas.ts";

const encodeReport = S.encodeUnknownEffect(ModelsCheckReport);
const encodeSnapshot = S.encodeUnknownEffect(CatalogSnapshot);

const homeFlag = Flag.String("home").pipe(
  Flag.optional,
  Flag.withDescription("Operator home directory the $HOME targets resolve against (default: $HOME)")
);
const repoFlag = Flag.String("repo").pipe(
  Flag.optional,
  Flag.withDescription("Repo checkout the repo targets resolve against (default: the enclosing checkout)")
);
const manifestFlag = Flag.String("manifest").pipe(
  Flag.optional,
  Flag.withDescription("Routing manifest path (default: $HOME/.config/beep/models.yaml)")
);
const jsonFlag = Flag.Boolean("json").pipe(
  Flag.withDefault(false),
  Flag.withDescription("Print the schema-encoded report or catalog snapshot")
);
const reportDirFlag = Flag.String("report-dir").pipe(
  Flag.optional,
  Flag.withDescription("Write models-report.md and models-report.json into this directory")
);
const offlineFlag = Flag.Boolean("offline").pipe(
  Flag.withDefault(false),
  Flag.withDescription("Skip the upstream fetch and assemble from the local overlays alone")
);

const adoptFlag = Flag.Boolean("adopt").pipe(
  Flag.withDefault(false),
  Flag.withDescription("init only: rewrite an existing manifest from the bundled seed, keeping a timestamped backup")
);

const modelsFlags = {
  adopt: adoptFlag,
  home: homeFlag,
  repo: repoFlag,
  manifest: manifestFlag,
  json: jsonFlag,
  reportDir: reportDirFlag,
  offline: offlineFlag,
};

// Every subcommand takes the same flag set, so the three runners share one
// named shape rather than three copies of the same literal.
interface ModelsCommandFlags {
  readonly adopt: boolean;
  readonly home: O.Option<string>;
  readonly json: boolean;
  readonly manifest: O.Option<string>;
  readonly offline: boolean;
  readonly repo: O.Option<string>;
  readonly reportDir: O.Option<string>;
}

interface ResolvedPaths {
  readonly home: string;
  readonly manifestPath: string;
  readonly repo: string;
}

const resolvePaths = Effect.fnUntraced(function* (
  flags: Pick<ModelsCommandFlags, "home" | "manifest" | "repo">
): Effect.fn.Return<ResolvedPaths, ModelsCommandError, FileSystem.FileSystem | Path.Path> {
  const path = yield* Path.Path;
  const home = yield* pipe(
    flags.home,
    O.match({
      onNone: () =>
        Config.String("HOME").pipe(
          Effect.mapError(() => ModelsCommandError.make({ message: "HOME is unset; pass --home <dir> explicitly." }))
        ),
      onSome: Effect.succeed,
    })
  );
  const repo = yield* pipe(
    flags.repo,
    O.match({
      onNone: () => findRepoRoot().pipe(ModelsCommandError.mapError("Failed to locate the repo checkout root")),
      onSome: Effect.succeed,
    })
  );

  return {
    home,
    repo,
    manifestPath: O.getOrElse(flags.manifest, () => path.join(home, defaultManifestRelativePath)),
  };
});

const renderFinding = (entry: DriftFinding): string =>
  `models: ${entry.kind} ${entry.targetId} [${entry.locator._tag}] ${entry.path}` +
  pipe(
    entry.current,
    O.map((current) => ` current=${JSON.stringify(current)}`),
    O.getOrElse(() => "")
  ) +
  ` expected=${JSON.stringify(entry.expected)}`;

// An offline run leaves `diff` empty on purpose, so the counts would read as
// "catalog stable" to an operator. Say which of the two it is.
const renderCatalogDiff = (report: ModelsCheckReport): string =>
  Match.value(report.diffScope).pipe(
    Match.when("suppressed-offline", () => "catalog diff: suppressed (offline run)"),
    Match.when(
      "full",
      () =>
        `catalog diff: ${A.length(report.diff.added)} added, ${A.length(report.diff.removed)} removed, ` +
        `${A.length(report.diff.levelsChanged)} effort ladder(s) changed`
    ),
    Match.exhaustive
  );

const renderReportMarkdown = (report: ModelsCheckReport): string =>
  pipe(
    [
      "# Model Routing Check",
      "",
      `Catalog: ${report.catalog.modelCount} model(s) from ${A.join(report.catalog.sources, ", ")}`,
      renderCatalogDiff(report),
      `Unbound Codex candidates (propose only): ${A.join(report.candidates, ", ")}`,
      `Drift: ${report.hasDrift ? "yes" : "no"} (${A.length(report.findings)} finding(s))`,
      "",
      "| Target | Locator | Kind | Current | Expected |",
      "| --- | --- | --- | --- | --- |",
      ...A.map(
        report.findings,
        (entry) =>
          `| ${entry.targetId} | ${entry.locator._tag} | ${entry.kind} | ${pipe(
            entry.current,
            O.getOrElse(() => "—")
          )} | ${Str.slice(0, 60)(entry.expected)} |`
      ),
    ],
    A.join("\n")
  );

const writeReports = Effect.fnUntraced(function* (
  reportDir: O.Option<string>,
  report: ModelsCheckReport
): Effect.fn.Return<void, ModelsCommandError, FileSystem.FileSystem | Path.Path> {
  if (O.isNone(reportDir)) {
    return;
  }
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const encoded = yield* encodeReport(report).pipe(
    ModelsCommandError.mapError("Failed to encode the models check report")
  );

  yield* fs
    .makeDirectory(reportDir.value, { recursive: true })
    .pipe(ModelsCommandError.mapError(`Failed to create ${reportDir.value}`));
  yield* writeContainedFileString(
    reportDir.value,
    path.resolve(reportDir.value, "models-report.json"),
    formatJsonValue(encoded)
  ).pipe(ModelsCommandError.mapError("Failed to write models-report.json"));
  yield* writeContainedFileString(
    reportDir.value,
    path.resolve(reportDir.value, "models-report.md"),
    `${renderReportMarkdown(report)}\n`
  ).pipe(ModelsCommandError.mapError("Failed to write models-report.md"));
});

const runCheck = Effect.fnUntraced(function* (flags: ModelsCommandFlags) {
  const paths = yield* resolvePaths(flags);
  const check = yield* ModelsCheck;
  const report = yield* check.run(
    ModelsCheckOptions.make({
      home: paths.home,
      repo: paths.repo,
      manifestPath: paths.manifestPath,
      offline: flags.offline,
    })
  );

  if (flags.json) {
    const encoded = yield* encodeReport(report).pipe(
      ModelsCommandError.mapError("Failed to encode the models check report")
    );
    yield* Console.log(formatJsonValue(encoded));
  } else {
    yield* Effect.forEach(report.findings, (entry) => Console.log(renderFinding(entry)), { discard: true });
    yield* Console.log(
      `models: ${A.length(report.findings)} finding(s) across ${report.catalog.modelCount} catalog model(s) ` +
        `from ${A.join(report.catalog.sources, ", ")}`
    );
    yield* Console.log(`models: ${renderCatalogDiff(report)}`);
    yield* Effect.forEach(
      report.candidates,
      (id) => Console.log(`models: candidate ${id} (routable Codex model without a manifest binding; propose only)`),
      { discard: true }
    );
  }

  yield* writeReports(flags.reportDir, report);

  if (report.hasDrift) {
    return yield* failWithReportedExit(`models: drift detected in ${A.length(report.findings)} locator(s).`);
  }
});

const runCatalog = Effect.fnUntraced(function* (flags: ModelsCommandFlags) {
  const paths = yield* resolvePaths(flags);
  const catalog = yield* ModelsCatalog;
  const snapshot = yield* catalog
    .snapshot(ModelsCatalogOptions.make({ home: paths.home, offline: flags.offline }))
    .pipe(Effect.mapError(ModelsCommandError.fromInternal));

  if (flags.json) {
    const encoded = yield* encodeSnapshot(snapshot).pipe(
      ModelsCommandError.mapError("Failed to encode the catalog snapshot")
    );
    return yield* Console.log(formatJsonValue(encoded));
  }

  yield* Effect.forEach(
    snapshot.models,
    (model) =>
      Console.log(
        `models: ${model.id} origin=${model.origin} levels=${A.join(model.levels, "|")} ` +
          `proxy=${model.availability.proxy} codex=${model.availability.codexCli} ` +
          `grok=${model.availability.grokCli} cursor=${model.availability.cursor}`
      ),
    { discard: true }
  );
  yield* Console.log(`models: ${snapshot.summary.modelCount} model(s) from ${A.join(snapshot.summary.sources, ", ")}`);
});

const runInit = Effect.fnUntraced(function* (flags: ModelsCommandFlags) {
  const paths = yield* resolvePaths(flags);
  const store = yield* ModelsManifestStore;
  if (flags.adopt) {
    const adoption = yield* store
      .adopt(paths.manifestPath, seedModelsManifest)
      .pipe(Effect.mapError(ModelsCommandError.fromInternal));
    yield* Console.log(
      O.match(adoption.backup, {
        onNone: () => `models: seeded ${adoption.file}`,
        onSome: (backup) => `models: adopted the seed into ${adoption.file} (previous manifest kept at ${backup})`,
      })
    );
    return;
  }
  const written = yield* store
    .init(paths.manifestPath, seedModelsManifest)
    .pipe(Effect.mapError(ModelsCommandError.fromInternal));

  yield* Console.log(`models: seeded ${written}`);
});

const failWithModelsError = Effect.fnUntraced(function* (error: ModelsCommandError) {
  const message = `models: ${error.message}`;
  yield* Console.error(message);
  return yield* failWithReportedExit(message);
});

const checkCommand = Command.make(
  "check",
  modelsFlags,
  Effect.fn(runCheck, Effect.catchTag("ModelsCommandError", failWithModelsError))
).pipe(Command.withDescription("Report routing drift for every declared target and exit non-zero on drift"));

const catalogCommand = Command.make(
  "catalog",
  modelsFlags,
  Effect.fn(runCatalog, Effect.catchTag("ModelsCommandError", failWithModelsError))
).pipe(Command.withDescription("Print the layered model catalog assembled for this box"));

const initCommand = Command.make(
  "init",
  modelsFlags,
  Effect.fn(runInit, Effect.catchTag("ModelsCommandError", failWithModelsError))
).pipe(
  Command.withDescription("Seed the routing manifest when none exists; --adopt rewrites an existing one with a backup")
);

const resolveApplyFile = Effect.fnUntraced(function* (paths: ResolvedPaths, target: ModelSyncTarget) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const file = resolveTargetPath(ModelsTargetLocation.make({ ...paths, root: target.root, path: target.path }));
  if (O.isNone(file)) return yield* ModelsCommandError.make({ message: `Target ${target.id} escapes its root.` });
  const exists = yield* fs.exists(file.value).pipe(ModelsCommandError.mapError("Cannot inspect target."));
  if (!exists && target.optional) return O.none<string>();
  const root = yield* fs
    .realPath(target.root === "home" ? paths.home : paths.repo)
    .pipe(ModelsCommandError.mapError("Cannot resolve target root."));
  const actual = yield* fs.realPath(file.value).pipe(ModelsCommandError.mapError("Cannot resolve target file."));
  const relative = path.relative(root, actual);
  if (relative === ".." || Str.startsWith(`..${path.sep}`)(relative) || path.isAbsolute(relative))
    return yield* ModelsCommandError.make({ message: `Target ${target.id} symlink escapes its root.` });
  return O.some(actual);
});

const renderModelWrite = Effect.fnUntraced(function* (manifest: ModelsManifest, locator: Locator) {
  if (locator._tag === "md-generated-block")
    return ModelsLocatorWrite.make({
      locator,
      expected: renderGeneratedBlockBody(
        filterBindings(manifest, locator.filter),
        manifest.superseded,
        locator.includeSuperseded
      ),
    });
  const binding = A.findFirst(
    manifest.bindings,
    (entry) => entry.role === locator.binding.role && entry.surface === locator.binding.surface
  );
  if (O.isNone(binding)) return yield* ModelsCommandError.make({ message: "Unbound model locator." });
  const expected = expectedLocatorValue(binding.value, locator.binding.field, locator.render);
  if (O.isNone(expected)) return yield* ModelsCommandError.make({ message: "Unrenderable model locator." });
  return ModelsLocatorWrite.make({
    locator: bindLocatorModel(locator, binding.value.modelId),
    expected: expected.value,
  });
});

const previewModelWrites = Effect.fnUntraced(function* (
  file: string,
  target: ModelSyncTarget,
  writes: ReadonlyArray<ModelsLocatorWrite>
) {
  const fs = yield* FileSystem.FileSystem;
  const reader = yield* ModelsLocatorReader;
  const content = yield* fs.readFileString(file).pipe(ModelsCommandError.mapError("Cannot preview target."));
  for (const request of writes) {
    const current = yield* reader
      .read({ root: target.root, absolutePath: file, content }, request.locator)
      .pipe(Effect.mapError(ModelsCommandError.fromInternal));
    yield* Console.log(
      `models: preview ${target.id} [${request.locator._tag}] change=${!O.contains(current, request.expected)} expected=${request.expected}`
    );
  }
});

const applyModelTarget = Effect.fnUntraced(function* (
  paths: ResolvedPaths,
  manifest: ModelsManifest,
  target: ModelSyncTarget,
  mode: ModelsApplyMode
) {
  const file = yield* resolveApplyFile(paths, target);
  if (O.isNone(file)) return;
  const path = yield* Path.Path;
  const writer = yield* ModelsApply;
  const writes = yield* Effect.forEach(target.locators, (locator) => renderModelWrite(manifest, locator), {
    concurrency: 1,
  });
  if (mode === "dry-run") yield* previewModelWrites(file.value, target, writes);
  const journal = yield* writer
    .apply(file.value, writes, mode, path.join(paths.home, ".config-backups"))
    .pipe(Effect.mapError(ModelsCommandError.fromInternal));
  yield* Console.log(
    `models: ${mode} ${target.id}; ${O.isSome(journal) ? `journal ${journal.value.id}` : "no file written"}`
  );
  if (O.isSome(journal)) yield* Console.log(`models: restore --journal ${journal.value.id}`);
});

const applyCommand = Command.make(
  "apply",
  {
    ...modelsFlags,
    check: Flag.Boolean("check").pipe(Flag.withDefault(false)),
    dryRun: Flag.Boolean("dry-run").pipe(Flag.withDefault(false)),
    write: Flag.Boolean("write").pipe(Flag.withDefault(false)),
    target: Flag.String("target").pipe(Flag.optional),
  },
  Effect.fn("ModelsCommand.apply")(function* (flags) {
    if (A.length(A.filter([flags.check, flags.dryRun, flags.write], (value) => value)) > 1)
      return yield* ModelsCommandError.make({ message: "Choose one of --check, --dry-run, --write." });
    const paths = yield* resolvePaths(flags);
    const store = yield* ModelsManifestStore;
    const manifest = yield* store.load(paths.manifestPath).pipe(Effect.mapError(ModelsCommandError.fromInternal));
    const targets = A.filter(manifest.targets, (target) => O.isNone(flags.target) || target.id === flags.target.value);
    if (A.isReadonlyArrayEmpty(targets))
      return yield* ModelsCommandError.make({ message: "No manifest target matched." });
    const mode = flags.write ? "write" : flags.check ? "check" : "dry-run";
    yield* Effect.forEach(targets, (target) => applyModelTarget(paths, manifest, target, mode), { concurrency: 1 });
  })
).pipe(Command.withDescription("Check or preview owned native fields; --write backs up and journals each replacement"));

const restoreCommand = Command.make(
  "restore",
  {
    ...modelsFlags,
    journal: Flag.String("journal"),
  },
  Effect.fn("ModelsCommand.restore")(function* (flags) {
    const paths = yield* resolvePaths(flags);
    const path = yield* Path.Path;
    const writer = yield* ModelsApply;
    if (!/^models-[\w-]+$/.test(flags.journal))
      return yield* ModelsCommandError.make({ message: "Pass a journal id, not a file path." });
    const directory = path.join(paths.home, ".config-backups");
    yield* writer
      .restore(path.join(directory, `${flags.journal}.json`), directory)
      .pipe(Effect.mapError(ModelsCommandError.fromInternal));
    yield* Console.log(`models: restored ${flags.journal}`);
  })
).pipe(
  Command.withDescription("Restore a writer backup only when the live file still matches its applied fingerprint")
);

/**
 * The `beep models` command group.
 *
 * **Details**
 *
 * The bare group runs `check`, which is the default a timer or a pre-push hook
 * wants. Every subcommand takes the same flags so a scripted invocation can
 * move between them without rewriting its argument list.
 *
 * **Example** (Inspect the command identity)
 *
 * ```ts
 * import { modelsCommand } from "@beep/repo-cli/commands/Models"
 *
 * console.log(modelsCommand.name) // "models"
 * ```
 *
 * @category cli-commands
 * @since 0.0.0
 */
export const modelsCommand = Command.make(
  "models",
  modelsFlags,
  Effect.fn(runCheck, Effect.catchTag("ModelsCommandError", failWithModelsError))
).pipe(
  Command.withDescription("Check every routing surface against the operator model manifest"),
  Command.withSubcommands([checkCommand, catalogCommand, initCommand, applyCommand, restoreCommand]),
  Command.provide(ModelsApplyLive),
  Command.provide(ModelsLive)
);
