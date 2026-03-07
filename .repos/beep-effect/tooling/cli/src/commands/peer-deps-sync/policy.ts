/**
 * @file Live peer dependency policy loader
 *
 * Loads and summarizes peer dependency policy evidence from the sibling
 * effect-v4 checkout without copying a snapshot into this repository.
 *
 * @module peer-deps-sync/policy
 * @since 0.1.0
 */

import { FsUtils, PackageJson } from "@beep/tooling-utils";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as Effect from "effect/Effect";
import * as Str from "effect/String";
import { PeerDepsSyncError, ReferenceRepoNotFoundError } from "./errors.js";

export const REFERENCE_REPO_ENV_VAR = "BEEP_EFFECT_V4_PATH";
export const DEFAULT_REFERENCE_REPO_RELATIVE_PATH = "../effect-v4";

const GLOB_IGNORE = ["**/node_modules/**", "**/dist/**", "**/build/**", "**/.turbo/**"] as const;

export interface ReferencePolicy {
  readonly referencePath: string;
  readonly defaultReferencePath: string;
  readonly packageCount: number;
  readonly peerOnlyNames: ReadonlySet<string>;
  readonly optionalPeerNames: ReadonlySet<string>;
  readonly requiredPeerNames: ReadonlySet<string>;
  readonly peerCounts: ReadonlyMap<string, number>;
}

const incrementCount = (counts: Map<string, number>, name: string): void => {
  counts.set(name, (counts.get(name) ?? 0) + 1);
};

export const loadReferencePolicy = (repoRoot: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path_ = yield* Path.Path;
    const utils = yield* FsUtils;

    const defaultReferencePath = path_.resolve(repoRoot, DEFAULT_REFERENCE_REPO_RELATIVE_PATH);
    const overridePath = process.env[REFERENCE_REPO_ENV_VAR];
    const referencePath =
      overridePath && Str.trim(overridePath).length > 0
        ? path_.isAbsolute(overridePath)
          ? overridePath
          : path_.resolve(repoRoot, overridePath)
        : defaultReferencePath;

    const referenceExists = yield* fs.exists(referencePath);
    if (!referenceExists) {
      return yield* Effect.fail(
        new ReferenceRepoNotFoundError({
          referencePath,
          defaultPath: defaultReferencePath,
          envVar: REFERENCE_REPO_ENV_VAR,
        })
      );
    }

    const manifestPaths = yield* utils
      .glob("packages/**/package.json", {
        cwd: referencePath,
        absolute: true,
        nodir: true,
        ignore: [...GLOB_IGNORE],
      })
      .pipe(
        Effect.mapError(
          (cause) => new PeerDepsSyncError({ filePath: referencePath, operation: "glob-reference", cause })
        )
      );

    const peerCounts = new Map<string, number>();
    const dependencyCounts = new Map<string, number>();
    const optionalPeerNames = new Set<string>();

    for (const manifestPath of manifestPaths) {
      const json = yield* utils
        .readJson(manifestPath)
        .pipe(
          Effect.mapError(
            (cause) => new PeerDepsSyncError({ filePath: manifestPath, operation: "read-reference", cause })
          )
        );
      const pkg = yield* PackageJson.decodeUnknown(json).pipe(
        Effect.mapError(
          (cause) => new PeerDepsSyncError({ filePath: manifestPath, operation: "decode-reference", cause })
        )
      );

      for (const name of Object.keys(pkg.dependencies ?? {})) {
        incrementCount(dependencyCounts, name);
      }

      for (const name of Object.keys(pkg.peerDependencies ?? {})) {
        incrementCount(peerCounts, name);
      }

      for (const name of Object.keys(pkg.peerDependenciesMeta ?? {})) {
        if (pkg.peerDependenciesMeta?.[name]?.optional === true) {
          optionalPeerNames.add(name);
        }
      }
    }

    const peerOnlyNames = new Set<string>();
    const requiredPeerNames = new Set<string>();

    for (const name of peerCounts.keys()) {
      if (!dependencyCounts.has(name)) {
        peerOnlyNames.add(name);
      }
      if (!optionalPeerNames.has(name)) {
        requiredPeerNames.add(name);
      }
    }

    return {
      referencePath,
      defaultReferencePath,
      packageCount: manifestPaths.length,
      peerOnlyNames,
      optionalPeerNames,
      requiredPeerNames,
      peerCounts,
    } satisfies ReferencePolicy;
  });
