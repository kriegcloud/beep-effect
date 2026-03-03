/**
 * Node.js version resolver.
 *
 * Reads `.nvmrc` as the source of truth and scans GitHub workflow YAML files
 * for `node-version:` fields that should match.
 *
 * @since 0.0.0
 * @module
 */

import { Effect, FileSystem, Path, String as Str } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import { parseDocument } from "yaml";
import type { VersionCategoryReport, VersionDriftItem } from "../types.js";
import { VersionSyncError } from "../types.js";

// ── Types ───────────────────────────────────────────────────────────────────

/**
 * A workflow file location with a `node-version` field.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export interface NodeVersionLocation {
  readonly file: string;
  readonly jobName: string;
  readonly stepIndex: number;
  readonly currentValue: string;
  readonly yamlPath: ReadonlyArray<string | number>;
}

/**
 * Resolved Node version state.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export interface NodeVersionState {
  readonly nvmrc: string;
  readonly workflowLocations: ReadonlyArray<NodeVersionLocation>;
}

// ── Public API ──────────────────────────────────────────────────────────────

const isRecord = (value: unknown): value is Record<string, unknown> => P.isObject(value) && !A.isArray(value);

/**
 * Resolve Node.js version state from `.nvmrc` and workflow files.
 *
 * @since 0.0.0
 * @category Utility
 */
export const resolveNodeVersions: (
  repoRoot: string
) => Effect.Effect<NodeVersionState, VersionSyncError, FileSystem.FileSystem | Path.Path> = Effect.fn(
  function* (repoRoot) {
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
    const workflowDirExists = yield* fs.exists(workflowDir).pipe(Effect.orElseSucceed(() => false));

    if (!workflowDirExists) {
      return { nvmrc, workflowLocations: A.empty<NodeVersionLocation>() };
    }

    const entries = yield* fs.readDirectory(workflowDir).pipe(Effect.orElseSucceed(A.empty<string>));

    const ymlFiles = A.filter(entries, (entry) => Str.endsWith(".yml")(entry) || Str.endsWith(".yaml")(entry));

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
  }
);

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

  if (!isRecord(root) || !("jobs" in root)) {
    return locations;
  }

  const jobs = root.jobs;
  if (!isRecord(jobs)) {
    return locations;
  }

  for (const jobName of R.keys(jobs)) {
    const job = jobs[jobName];
    if (!isRecord(job) || !("steps" in job)) {
      continue;
    }

    const steps = job.steps;
    if (!A.isArray(steps)) {
      continue;
    }

    for (let stepIdx = 0; stepIdx < A.length(steps); stepIdx++) {
      const step = steps[stepIdx];
      if (!isRecord(step)) {
        continue;
      }

      // Check for node-version in `with:` block
      if ("with" in step && isRecord(step.with)) {
        const withBlock = step.with;
        if ("node-version" in withBlock) {
          const nodeVersion = String(withBlock["node-version"]);
          // Skip if already using node-version-file
          if (!("node-version-file" in withBlock)) {
            locations = A.append(locations, {
              file: relativeFile,
              jobName,
              stepIndex: stepIdx,
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
      items = A.append(items, {
        file: loc.file,
        field: `node-version (${loc.jobName}, step ${String(loc.stepIndex)})`,
        current: loc.currentValue,
        expected: state.nvmrc,
        line: O.none(),
      });
    }
  }

  return {
    category: "node" as const,
    status: A.length(items) > 0 ? "drift" : "ok",
    items,
    latest: O.none(),
    error: O.none(),
  };
};
