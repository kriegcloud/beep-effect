/**
 * Comment-preserving YAML file updater via eemeli/yaml Document API.
 *
 * @since 0.0.0
 * @module
 */

import { $RepoCliId } from "@beep/identity/packages";
import { Effect, FileSystem, SchemaTransformation } from "effect";
import * as A from "effect/Array";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import { parseDocument } from "yaml";
import { VersionSyncError } from "../Models.js";

const $I = $RepoCliId.create("commands/VersionSync/internal/updaters/YamlFileUpdater");

const YamlNodeValueAsString = S.Unknown.pipe(
  S.decodeTo(
    S.String,
    SchemaTransformation.transform({
      decode: (value) => `${value}`,
      encode: (value) => value,
    })
  ),
  S.annotate(
    $I.annote("YamlNodeValueAsString", {
      description: "Schema transformation that normalizes arbitrary YAML node values into comparable strings.",
    })
  )
);

const decodeYamlNodeValueAsString = S.decodeUnknownSync(YamlNodeValueAsString);
const stringEquivalence = S.toEquivalence(S.String);

/**
 * Update a value at a specific path in a YAML file, preserving comments and formatting.
 *
 * Uses eemeli/yaml `parseDocument()` + `doc.setIn()` + `doc.toString()`.
 * Returns `true` when the file was modified, `false` when already correct.
 *
 * @since 0.0.0
 * @category Utility
 */
export const updateYamlValue: (
  filePath: string,
  yamlPath: ReadonlyArray<string | number>,
  value: string
) => Effect.Effect<boolean, VersionSyncError, FileSystem.FileSystem> = Effect.fn(function* (filePath, yamlPath, value) {
  const fs = yield* FileSystem.FileSystem;

  const original = yield* fs
    .readFileString(filePath)
    .pipe(
      Effect.mapError(
        (e) => new VersionSyncError({ message: `Failed to read ${filePath}: ${String(e)}`, file: filePath })
      )
    );

  const doc = parseDocument(original);
  const currentValue = doc.getIn(yamlPath);

  if (stringEquivalence(decodeYamlNodeValueAsString(currentValue), value)) {
    return false;
  }

  doc.setIn(yamlPath, value);
  const updated = doc.toString();

  if (stringEquivalence(updated, original)) {
    return false;
  }

  yield* fs
    .writeFileString(filePath, updated)
    .pipe(
      Effect.mapError(
        (e) => new VersionSyncError({ message: `Failed to write ${filePath}: ${String(e)}`, file: filePath })
      )
    );

  return true;
});

/**
 * Replace `node-version: <value>` with `node-version-file: .nvmrc` in a workflow YAML.
 *
 * This is a structural fix that eliminates future drift by having CI read `.nvmrc` directly.
 * Uses eemeli/yaml Document API for comment-preserving edits.
 * Returns `true` when the file was modified, `false` when no changes needed.
 *
 * @since 0.0.0
 * @category Utility
 */
export const replaceNodeVersionWithFile: (
  filePath: string,
  locations: ReadonlyArray<{ readonly yamlPath: ReadonlyArray<string | number> }>
) => Effect.Effect<boolean, VersionSyncError, FileSystem.FileSystem> = Effect.fn(function* (filePath, locations) {
  const fs = yield* FileSystem.FileSystem;

  const original = yield* fs
    .readFileString(filePath)
    .pipe(
      Effect.mapError(
        (e) => new VersionSyncError({ message: `Failed to read ${filePath}: ${String(e)}`, file: filePath })
      )
    );

  const doc = parseDocument(original);
  let changed = false;

  for (const loc of locations) {
    const currentValue = doc.getIn(loc.yamlPath);

    if (P.isNotUndefined(currentValue) && P.isNotNull(currentValue)) {
      // Remove node-version
      doc.deleteIn(loc.yamlPath);

      // Add node-version-file: .nvmrc at the same level
      const withPath = A.dropRight(loc.yamlPath, 1);
      const withNode = doc.getIn(withPath);

      if (P.isNotUndefined(withNode) && P.isNotNull(withNode) && P.isObject(withNode) && !A.isArray(withNode)) {
        // Set node-version-file on the `with:` block
        doc.setIn(A.append(withPath, "node-version-file"), ".nvmrc");
        changed = true;
      }
    }
  }

  if (!changed) {
    return false;
  }

  const updated = doc.toString();

  if (stringEquivalence(updated, original)) {
    return false;
  }

  yield* fs
    .writeFileString(filePath, updated)
    .pipe(
      Effect.mapError(
        (e) => new VersionSyncError({ message: `Failed to write ${filePath}: ${String(e)}`, file: filePath })
      )
    );

  return true;
});
