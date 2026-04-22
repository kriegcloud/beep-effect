/**
 * Report rendering service for version-sync output.
 *
 * @module
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import { Console, Context, Effect, Layer } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import {
  VersionCategoryReport,
  type VersionCategoryReport as VersionCategoryReportValue,
  VersionCategoryStatusMatch,
  type VersionCategoryStatus as VersionCategoryStatusValue,
  VersionSyncModeMatch,
  type VersionSyncMode as VersionSyncModeValue,
  type VersionSyncReport,
} from "../Models.js";

const $I = $RepoCliId.create("commands/VersionSync/internal/services/ReportRendererService");
const stringEquivalence = S.toEquivalence(S.String);

/**
 * Service contract for rendering a version-sync report to console.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type ReportRendererServiceShape = {
  readonly renderCategoryReport: (report: VersionCategoryReportValue) => Effect.Effect<void>;
  readonly renderReport: (report: VersionSyncReport, mode: VersionSyncModeValue) => Effect.Effect<void>;
};

/**
 * Service tag for report rendering.
 *
 * @category PortContract
 * @since 0.0.0
 */
export class ReportRendererService extends Context.Service<ReportRendererService, ReportRendererServiceShape>()(
  $I`ReportRendererService`
) {}

const renderCategoryLabel = (report: VersionCategoryReportValue): string =>
  VersionCategoryReport.match(report, {
    bun: () => "Bun Runtime",
    node: () => "Node.js Runtime",
    docker: () => "Docker Images",
    biome: () => "Biome Schema",
    effect: () => "Effect Catalog",
  });

const renderStatusLabel = (status: VersionCategoryStatusValue): string =>
  VersionCategoryStatusMatch(status, {
    ok: () => "OK",
    drift: () => "DRIFT",
    unpinned: () => "UNPINNED",
    error: () => "ERROR",
  });

const renderCategoryReport: ReportRendererServiceShape["renderCategoryReport"] = Effect.fn(function* (report) {
  yield* Console.log(`\n${renderCategoryLabel(report)}:`);

  yield* O.match(report.latest, {
    onNone: () => Effect.void,
    onSome: (latest) => Console.log(`  Latest: ${latest}`),
  });

  const hasItems = yield* A.match(report.items, {
    onEmpty: () => Effect.succeed(false),
    onNonEmpty: (items) =>
      Effect.forEach(items, (item) => {
        const arrow = stringEquivalence(item.current, item.expected) ? "" : ` -> ${item.expected}`;
        return Console.log(`  ${item.file} ${item.field}: ${item.current}${arrow}`);
      }).pipe(Effect.as(true)),
  });

  if (!hasItems && report.status === "ok" && O.isNone(report.error)) {
    yield* Console.log("  Status: OK (no drift)");
    return;
  }

  yield* Console.log(`  Status: ${renderStatusLabel(report.status)}`);

  yield* O.match(report.error, {
    onNone: () => Effect.void,
    onSome: (error) => Console.log(`  Error: ${error}`),
  });
});

const renderModeLabel = (mode: VersionSyncModeValue): string =>
  VersionSyncModeMatch(mode, {
    check: () => "Check",
    "dry-run": () => "Dry Run",
    write: () => "Write",
  });

const renderReport: ReportRendererServiceShape["renderReport"] = Effect.fn(function* (report, mode) {
  yield* Console.log(`\nVersion Sync Report (${renderModeLabel(mode)})`);
  yield* Console.log("===================");

  for (const category of report.categories) {
    yield* renderCategoryReport(category);
  }

  if (!report.hasDrift) {
    yield* Console.log("\nAll versions are in sync.");
    return;
  }

  yield* VersionSyncModeMatch(mode, {
    check: () => Console.log("\nRun `beep version-sync --write` to apply fixes."),
    "dry-run": () => Console.log("\nRun `beep version-sync --write` to apply these changes."),
    write: () => Effect.void,
  });
});

/**
 * Live layer for report rendering.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const ReportRendererServiceLive = Layer.succeed(
  ReportRendererService,
  ReportRendererService.of({
    renderCategoryReport,
    renderReport,
  })
);
