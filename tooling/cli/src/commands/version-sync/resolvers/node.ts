/**
 * Node.js version resolver.
 *
 * Reads `.nvmrc` as the source of truth and scans GitHub workflow YAML files
 * for `node-version:` fields that should match.
 *
 * @since 0.0.0
 * @module
 */

import { $RepoCliId } from "@beep/identity/packages";
import { NonNegativeInt } from "@beep/schema";
import { thunkFalse } from "@beep/utils";
import { Effect, FileSystem, Path, String as Str } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import { parseDocument } from "yaml";
import { VersionCategoryReport, VersionDriftItem, VersionSyncError } from "../types.js";

const $I = $RepoCliId.create("version-sync/resolvers/node");
// ── Types ───────────────────────────────────────────────────────────────────

/**
 * A workflow file location with a `node-version` field.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class NodeVersionLocation extends S.Class<NodeVersionLocation>($I`NodeVersionLocation`)({
  file: S.String,
  jobName: S.String,
  stepIndex: NonNegativeInt,
  currentValue: S.String,
  yamlPath: S.Array(S.Union([S.String, S.Number])),
}) {}

/**
 * Resolved Node version state.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class NodeVersionState extends S.Class<NodeVersionState>($I`NodeVersionState`)({
  nvmrc: S.String,
  workflowLocations: S.Array(NodeVersionLocation),
}) {}

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Resolve Node.js version state from `.nvmrc` and workflow files.
 *
 * @since 0.0.0
 * @category Utility
 */
export const resolveNodeVersions: (
  repoRoot: string
) => Effect.Effect<NodeVersionState, VersionSyncError, FileSystem.FileSystem | Path.Path> = Effect.fn(
  "resolveNodeVersions"
)(function* (repoRoot) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  // Read .nvmrc
  const nvmrcPath = path.join(repoRoot, ".nvmrc");
  const nvmrc = yield* fs.readFileString(nvmrcPath).pipe(
    Effect.map(Str.trim),
    Effect.mapError((e) => new VersionSyncError({ message: `Failed to read .nvmrc: ${String(e)}`, file: ".nvmrc" }))
  );

  // Scan workflow files
  const workflowDir = path.join(repoRoot, ".github", "workflows");
  const workflowDirExists = yield* fs.exists(workflowDir).pipe(Effect.orElseSucceed(thunkFalse));

  if (!workflowDirExists) {
    return { nvmrc, workflowLocations: A.empty<NodeVersionLocation>() };
  }

  const entries = yield* fs.readDirectory(workflowDir).pipe(Effect.orElseSucceed(A.empty<string>));

  const ymlFiles = A.filter(entries, P.or(Str.endsWith(".yml"), Str.endsWith(".yaml")));

  let locations = A.empty<NodeVersionLocation>();

  for (const ymlFile of ymlFiles) {
    const filePath = path.join(workflowDir, ymlFile);
    const content = yield* fs.readFileString(filePath).pipe(
      Effect.mapError(
        (e) =>
          new VersionSyncError({
            message: `Failed to read workflow file: ${String(e)}`,
            file: `.github/workflows/${ymlFile}`,
          })
      )
    );

    const found = findNodeVersionLocations(content, `.github/workflows/${ymlFile}`);
    for (const loc of found) {
      locations = A.append(locations, loc);
    }
  }

  return { nvmrc, workflowLocations: locations };
});

/**
 * Find `node-version:` field locations in a workflow YAML document.
 *
 * @since 0.0.0
 * @category Utility
 * @param content - The raw YAML content of the workflow file.
 * @param relativeFile - The relative path to the workflow file.
 * @returns An array of locations where `node-version` is declared.
 */
const findNodeVersionLocations = (content: string, relativeFile: string): Array<NodeVersionLocation> => {
  let locations = A.empty<NodeVersionLocation>();

  const doc = parseDocument(content);
  const root = doc.toJSON();

  if (!P.isObject(root) || !P.hasProperty(root, "jobs")) {
    return locations;
  }

  const jobs = root.jobs;
  if (!P.isObject(jobs)) {
    return locations;
  }

  for (const jobName of R.keys(jobs)) {
    const job = jobs[jobName];
    if (!P.isObject(job) || !P.hasProperty(job, "steps")) {
      continue;
    }

    const steps = job.steps;
    if (!A.isArray(steps)) {
      continue;
    }

    for (let stepIdx = 0; stepIdx < A.length(steps); stepIdx++) {
      const step = steps[stepIdx];
      if (!P.isObject(step)) {
        continue;
      }

      // Check for node-version in `with:` block
      if (P.hasProperty(step, "with") && P.isObject(step.with)) {
        const withBlock = step.with;
        if (P.hasProperty(withBlock, "node-version")) {
          const nodeVersion = String(withBlock["node-version"]);
          // Skip if already using node-version-file
          if (!P.hasProperty(withBlock, "node-version-file")) {
            locations = A.append(locations, {
              file: relativeFile,
              jobName,
              stepIndex: NonNegativeInt.makeUnsafe(stepIdx),
              currentValue: nodeVersion,
              yamlPath: ["jobs", jobName, "steps", stepIdx, "with", "node-version"],
            });
          }
        }
      }
    }
  }

  return locations;
};

/**
 * Build the Node category report from resolved state.
 *
 * @since 0.0.0
 * @category Utility
 * @param state - The resolved Node version state.
 * @returns The version category report for Node.js.
 */
export const buildNodeReport: (state: NodeVersionState) => VersionCategoryReport = (state) => {
  let items = A.empty<VersionDriftItem>();

  for (const loc of state.workflowLocations) {
    if (loc.currentValue !== state.nvmrc) {
      items = A.append(
        items,
        new VersionDriftItem({
          file: loc.file,
          field: `node-version (${loc.jobName}, step ${String(loc.stepIndex)})`,
          current: loc.currentValue,
          expected: state.nvmrc,
          line: O.none(),
        })
      );
    }
  }

  return VersionCategoryReport.cases.node.makeUnsafe({
    status: A.length(items) > 0 ? "drift" : "ok",
    items,
    latest: O.none(),
    error: O.none(),
  });
};
