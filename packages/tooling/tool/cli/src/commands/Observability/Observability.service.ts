/**
 * Instrumentation catalog service: harvests span names, loads every
 * `*.instruments.ts` declarations file, merges them, and writes or checks the
 * generated catalog and the standard's generated section.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import * as Catalog from "@beep/observability/catalog";
import { FsUtils } from "@beep/repo-utils/FsUtils";
import { findRepoRoot } from "@beep/repo-utils/Root";
import { isExcludedTypeScriptSourcePath, toPosixPath } from "@beep/repo-utils/schemas/TypeScriptSourceExclusions";
import { PosixPath } from "@beep/schema/PosixPath";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as Path from "effect/Path";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { Project } from "ts-morph";
import { createWorkspaceOwnerResolver } from "../../internal/tsmorph/index.ts";
import { ObservabilityCommandError } from "./Observability.errors.ts";
import { combineHarvests, harvestSourceFile } from "./Observability.harvest.ts";
import {
  buildCatalog,
  familySpanCounts,
  renderCatalogText,
  renderStandardSection,
  spliceStandardSection,
} from "./Observability.render.ts";
import {
  CatalogRunReport,
  DeclarationsFile,
  GeneratedFileStatus,
  INSTRUMENTATION_CATALOG_PATH,
  OBSERVABILITY_STANDARD_PATH,
  SpanNameFindingKind,
} from "./Observability.schemas.ts";
import type { CatalogRunMode, SpanHarvest } from "./Observability.schemas.ts";

const $I = $RepoCliId.create("commands/Observability/Observability.service");

const SOURCE_GLOBS = ["packages/**/src/**/*.{ts,tsx}", "apps/**/src/**/*.{ts,tsx}"];
const DECLARATION_GLOBS = ["packages/**/src/**/*.instruments.ts", "apps/**/src/**/*.instruments.ts"];
const SOURCE_IGNORE = ["**/node_modules/**", "**/test/**", "**/scratchpad/**", "**/dist/**"];

const decodePackageName = S.decodeUnknownOption(Catalog.PackageName);
const isInstrumentDeclarations = S.is(Catalog.InstrumentDeclarations);

const failure =
  (path: string, message: string) =>
  (cause: unknown): ObservabilityCommandError =>
    ObservabilityCommandError.make({ path, message, cause });

/**
 * Operations of the instrumentation catalog command.
 *
 * @category services
 * @since 0.0.0
 */
export interface InstrumentationCatalogShape {
  /** Scans `packages/**\/src` and `apps/**\/src` for span names. */
  readonly harvest: Effect.Effect<SpanHarvest, ObservabilityCommandError>;
  /** Imports every `src/**\/*.instruments.ts` file and keeps its declarations exports. */
  readonly loadDeclarations: Effect.Effect<ReadonlyArray<DeclarationsFile>, ObservabilityCommandError>;
  /** Builds the catalog, then writes or checks the generated files. */
  readonly run: (mode: CatalogRunMode) => Effect.Effect<CatalogRunReport, ObservabilityCommandError>;
}

/**
 * Instrumentation catalog operations bound to one repository checkout.
 *
 * **Example** (Prepare a check run)
 *
 * ```ts
 * import * as Effect from "effect/Effect"
 * import { InstrumentationCatalog } from "@beep/repo-cli/commands/Observability"
 *
 * const program = InstrumentationCatalog.use((catalog) => catalog.run("check"))
 * console.log(Effect.isEffect(program)) // true
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export class InstrumentationCatalog extends Context.Service<InstrumentationCatalog, InstrumentationCatalogShape>()(
  $I`InstrumentationCatalog`
) {}

const makeInstrumentationCatalog = Effect.fn("InstrumentationCatalog.make")(function* (repoRoot: string) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const fsUtils = yield* FsUtils;
  const relative = (absolute: string): string => toPosixPath(path.relative(repoRoot, absolute));

  const ownerOf = yield* createWorkspaceOwnerResolver({ root: repoRoot, fallbackOwner: "@beep/root" }).pipe(
    Effect.mapError(failure(repoRoot, "Failed to resolve workspace packages."))
  );

  const harvest = Effect.gen(function* () {
    const files = yield* fsUtils
      .globFiles(SOURCE_GLOBS, { absolute: true, cwd: repoRoot, ignore: SOURCE_IGNORE })
      .pipe(Effect.mapError(failure(repoRoot, "Failed to list source files.")));
    const project = new Project({ skipAddingFilesFromTsConfig: true });
    const harvests = yield* Effect.forEach(
      A.filter(A.sort(files, Str.Order), (file) => !isExcludedTypeScriptSourcePath(relative(file))),
      (file) =>
        O.match(decodePackageName(ownerOf(file)), {
          onNone: () =>
            Effect.fail(
              ObservabilityCommandError.make({ path: relative(file), message: "Owning package name is invalid." })
            ),
          onSome: (owner) =>
            Effect.try({
              try: () => {
                const sourceFile = project.addSourceFileAtPath(file);
                const result = harvestSourceFile(sourceFile, PosixPath.make(relative(file)), owner);
                project.removeSourceFile(sourceFile);
                return result;
              },
              catch: failure(relative(file), "Failed to parse source file."),
            }),
        })
    );
    return combineHarvests(harvests);
  }).pipe(Effect.withSpan("InstrumentationCatalog.harvest"));

  const loadDeclarations = Effect.gen(function* () {
    const files = yield* fsUtils
      .globFiles(DECLARATION_GLOBS, { absolute: true, cwd: repoRoot, ignore: SOURCE_IGNORE })
      .pipe(Effect.mapError(failure(repoRoot, "Failed to list instruments files.")));
    return yield* Effect.forEach(A.sort(files, Str.Order), (file) =>
      Effect.tryPromise({
        try: (): Promise<Record<string, unknown>> => import(file),
        catch: failure(relative(file), "Failed to import instrument declarations."),
      }).pipe(
        Effect.flatMap((module) => {
          const declarations = A.filter(R.values(module), isInstrumentDeclarations);
          return A.isReadonlyArrayNonEmpty(declarations)
            ? Effect.succeed(DeclarationsFile.make({ file: PosixPath.make(relative(file)), declarations }))
            : Effect.fail(
                ObservabilityCommandError.make({
                  path: relative(file),
                  message: "Instruments file exports no InstrumentDeclarations value.",
                })
              );
        })
      )
    );
  }).pipe(Effect.withSpan("InstrumentationCatalog.loadDeclarations"));

  const sync = Effect.fn("InstrumentationCatalog.sync")(function* (
    mode: CatalogRunMode,
    relativePath: string,
    next: (current: O.Option<string>) => Effect.Effect<string, ObservabilityCommandError>
  ) {
    const absolute = path.join(repoRoot, relativePath);
    const exists = yield* fs.exists(absolute).pipe(Effect.mapError(failure(relativePath, "Failed to stat file.")));
    const current = exists
      ? O.some(yield* fs.readFileString(absolute).pipe(Effect.mapError(failure(relativePath, "Failed to read file."))))
      : O.none<string>();
    const content = yield* next(current);
    if (mode === "write") {
      yield* fs
        .writeFileString(absolute, content)
        .pipe(Effect.mapError(failure(relativePath, "Failed to write file.")));
      return GeneratedFileStatus.Enum.wrote;
    }
    return O.match(current, {
      onNone: () => GeneratedFileStatus.Enum.missing,
      onSome: (text) => (text === content ? GeneratedFileStatus.Enum.current : GeneratedFileStatus.Enum.stale),
    });
  });

  const run = Effect.fn("InstrumentationCatalog.run")(function* (mode: CatalogRunMode) {
    const harvested = yield* harvest;
    const files = yield* loadDeclarations;
    const build = buildCatalog(
      harvested,
      A.flatMap(files, (file) => file.declarations)
    );
    const catalogText = yield* renderCatalogText(build.document).pipe(
      Effect.mapError(failure(INSTRUMENTATION_CATALOG_PATH, "Failed to encode the catalog."))
    );
    const section = renderStandardSection(build.document);
    const catalog = yield* sync(mode, INSTRUMENTATION_CATALOG_PATH, () => Effect.succeed(catalogText));
    const standard = yield* sync(mode, OBSERVABILITY_STANDARD_PATH, (current) =>
      Effect.fromOption(O.flatMap(current, spliceStandardSection(section))).pipe(
        Effect.mapError(() =>
          ObservabilityCommandError.make({
            path: OBSERVABILITY_STANDARD_PATH,
            message: "Generated section markers are missing.",
          })
        )
      )
    );
    const interpolated = A.filter(harvested.findings, (finding) => SpanNameFindingKind.is.interpolated(finding.kind));
    const nonLiteral = A.filter(harvested.findings, (finding) => SpanNameFindingKind.is["non-literal"](finding.kind));
    const spans = build.document.spans;
    const conforming = A.length(A.filter(spans, (row) => row.conforms));
    const filesCurrent = A.every([catalog, standard], (status) => status !== "stale" && status !== "missing");
    return CatalogRunReport.make({
      mode,
      catalog,
      standard,
      spans: A.length(spans),
      conforming,
      nonConforming: A.length(spans) - conforming,
      families: familySpanCounts(spans),
      attributes: A.length(build.document.attributes),
      declaredInstruments: A.length(build.document.instruments),
      declarationFiles: A.map(files, (file) => file.file),
      interpolated,
      nonLiteral,
      conflicts: build.conflicts,
      ok: filesCurrent && A.isReadonlyArrayEmpty(interpolated) && A.isReadonlyArrayEmpty(build.conflicts),
    });
  });

  return InstrumentationCatalog.of({ harvest, loadDeclarations, run });
});

/**
 * Binds the catalog operations to the checkout that contains the working
 * directory.
 *
 * **Example** (Inspect the live layer)
 *
 * ```ts
 * import * as Layer from "effect/Layer"
 * import { InstrumentationCatalogLive } from "@beep/repo-cli/commands/Observability"
 *
 * console.log(Layer.isLayer(InstrumentationCatalogLive)) // true
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const InstrumentationCatalogLive = Layer.effect(
  InstrumentationCatalog,
  Effect.flatMap(
    findRepoRoot().pipe(Effect.mapError(failure(".", "Failed to find the repository root."))),
    makeInstrumentationCatalog
  )
);
