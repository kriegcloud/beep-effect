/**
 * Comment-preserving YAML file updater via eemeli/yaml Document API.
 *
 * @module
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import { Effect, FileSystem, Inspectable, SchemaTransformation } from "effect";
import * as A from "effect/Array";
import { dual } from "effect/Function";
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

type UpdateYamlValueOptions = {
  readonly value: string;
};

/**
 * Update a value at a specific path in a YAML file, preserving comments and formatting.
 *
 * Uses eemeli/yaml `parseDocument()` + `doc.setIn()` + `doc.toString()`.
 * Returns `true` when the file was modified, `false` when already correct.
 *
 * @category Utility
 * @since 0.0.0
 */
export const updateYamlValue: {
  (
    filePath: string,
    yamlPath: ReadonlyArray<string | number>,
    options: UpdateYamlValueOptions
  ): Effect.Effect<boolean, VersionSyncError, FileSystem.FileSystem>;
  (
    yamlPath: ReadonlyArray<string | number>,
    options: UpdateYamlValueOptions
  ): (filePath: string) => Effect.Effect<boolean, VersionSyncError, FileSystem.FileSystem>;
} = dual(
  3,
  Effect.fn(function* (filePath: string, yamlPath: ReadonlyArray<string | number>, options: UpdateYamlValueOptions) {
    const fs = yield* FileSystem.FileSystem;

    const original = yield* fs.readFileString(filePath).pipe(
      Effect.mapError(
        (e) =>
          new VersionSyncError({
            message: `Failed to read ${filePath}: ${Inspectable.toStringUnknown(e, 0)}`,
            file: filePath,
          })
      )
    );

    const doc = parseDocument(original);
    const currentValue = doc.getIn(yamlPath);

    if (stringEquivalence(decodeYamlNodeValueAsString(currentValue), options.value)) {
      return false;
    }

    doc.setIn(yamlPath, options.value);
    const updated = doc.toString();

    if (stringEquivalence(updated, original)) {
      return false;
    }

    yield* fs.writeFileString(filePath, updated).pipe(
      Effect.mapError(
        (e) =>
          new VersionSyncError({
            message: `Failed to write ${filePath}: ${Inspectable.toStringUnknown(e, 0)}`,
            file: filePath,
          })
      )
    );

    return true;
  })
);

/**
 * Replace `node-version: <value>` with `node-version-file: .nvmrc` in a workflow YAML.
 *
 * This is a structural fix that eliminates future drift by having CI read `.nvmrc` directly.
 * Uses eemeli/yaml Document API for comment-preserving edits.
 * Returns `true` when the file was modified, `false` when no changes needed.
 *
 * @category Utility
 * @since 0.0.0
 */
export const replaceNodeVersionWithFile: {
  (
    filePath: string,
    locations: ReadonlyArray<{ readonly yamlPath: ReadonlyArray<string | number> }>
  ): Effect.Effect<boolean, VersionSyncError, FileSystem.FileSystem>;
  (
    locations: ReadonlyArray<{ readonly yamlPath: ReadonlyArray<string | number> }>
  ): (filePath: string) => Effect.Effect<boolean, VersionSyncError, FileSystem.FileSystem>;
} = dual(
  2,
  Effect.fn(function* (
    filePath: string,
    locations: ReadonlyArray<{ readonly yamlPath: ReadonlyArray<string | number> }>
  ) {
    const fs = yield* FileSystem.FileSystem;

    const original = yield* fs.readFileString(filePath).pipe(
      Effect.mapError(
        (e) =>
          new VersionSyncError({
            message: `Failed to read ${filePath}: ${Inspectable.toStringUnknown(e, 0)}`,
            file: filePath,
          })
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

    yield* fs.writeFileString(filePath, updated).pipe(
      Effect.mapError(
        (e) =>
          new VersionSyncError({
            message: `Failed to write ${filePath}: ${Inspectable.toStringUnknown(e, 0)}`,
            file: filePath,
          })
      )
    );

    return true;
  })
);
