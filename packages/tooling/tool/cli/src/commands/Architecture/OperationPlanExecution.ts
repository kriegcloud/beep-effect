/**
 * Architecture operation-plan filesystem execution.
 *
 * @packageDocumentation
 * @category cli-commands
 * @since 0.0.0
 */

import { DomainError } from "@beep/repo-utils";
import { normalizePath } from "@beep/schema";
import { thunkFalse } from "@beep/utils";
import { Effect, FileSystem, Path } from "effect";
import { dual } from "effect/Function";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import {
  type ArchitectureOperation,
  ArchitectureOperationCheck,
  type ArchitectureOperationCheckStatus,
  type CanonicalSliceOperationPlan,
  OperationPlanApplyResult,
  OperationPlanCheckResult,
  type WriteFileOperation,
  type WritePackageJsonOperation,
} from "./OperationPlan.js";
import { renderPackageJsonOperation } from "./OperationPlanPackageJson.js";

const stringEquivalence = S.toEquivalence(S.String);

const operationIdFor = (kind: ArchitectureOperation["kind"], operationPath: string): string =>
  `${kind}:${operationPath}`;

const pathExists = Effect.fn(function* (absolutePath: string) {
  const fs = yield* FileSystem.FileSystem;
  return yield* fs.exists(absolutePath).pipe(Effect.orElseSucceed(thunkFalse));
});

const resolveOperationPath = Effect.fn(function* (rootDir: string, operationPath: string) {
  const path = yield* Path.Path;
  const resolvedRoot = path.resolve(rootDir);
  const resolvedPath = path.resolve(resolvedRoot, operationPath);
  const relativeFromRoot = normalizePath(path.relative(resolvedRoot, resolvedPath));

  if (path.isAbsolute(operationPath) || relativeFromRoot === ".." || Str.startsWith("../")(relativeFromRoot)) {
    return yield* DomainError.newMessage(`Architecture operation path escapes repository root: ${operationPath}`);
  }

  return resolvedPath;
});

const checkStatusFor = (
  operation: ArchitectureOperation,
  status: ArchitectureOperationCheckStatus
): ArchitectureOperationCheck =>
  new ArchitectureOperationCheck({
    operationId: stringEquivalence(operation.operationId, "legacy-operation")
      ? operationIdFor(operation.kind, operation.path)
      : operation.operationId,
    kind: operation.kind,
    path: operation.path,
    status,
  });

const renderWritableOperation = (
  operation: WriteFileOperation | WritePackageJsonOperation
): Effect.Effect<string, DomainError> => {
  if (operation.kind === "write-file") return Effect.succeed(operation.content);
  return renderPackageJsonOperation(operation);
};

/**
 * Validate a decoded operation plan against a repository root.
 *
 * @example
 * ```ts
 * import {
 *   checkCanonicalSliceOperationPlan,
 *   makeCanonicalSliceOperationPlan,
 * } from "@beep/repo-cli/commands/Architecture/index"
 *
 * const program = checkCanonicalSliceOperationPlan("/workspace/beep-effect", makeCanonicalSliceOperationPlan())
 * console.log(program)
 * ```
 * @category utilities
 * @since 0.0.0
 */
export const checkCanonicalSliceOperationPlan: {
  (
    plan: CanonicalSliceOperationPlan
  ): (rootDir: string) => Effect.Effect<OperationPlanCheckResult, DomainError, FileSystem.FileSystem | Path.Path>;
  (
    rootDir: string,
    plan: CanonicalSliceOperationPlan
  ): Effect.Effect<OperationPlanCheckResult, DomainError, FileSystem.FileSystem | Path.Path>;
} = dual(
  2,
  Effect.fn(function* (rootDir: string, plan: CanonicalSliceOperationPlan) {
    const fs = yield* FileSystem.FileSystem;
    const missingPaths: Array<string> = [];
    const differingPaths: Array<string> = [];
    const unexpectedPaths: Array<string> = [];
    const operationStatuses: Array<ArchitectureOperationCheck> = [];

    for (const operation of plan.operations) {
      const operationPath = yield* resolveOperationPath(rootDir, operation.path);
      const exists = yield* pathExists(operationPath);
      if (operation.kind === "ensure-file" && !exists) {
        missingPaths.push(operation.path);
        operationStatuses.push(checkStatusFor(operation, "missing"));
      }
      if (operation.kind === "ensure-file" && exists) {
        operationStatuses.push(checkStatusFor(operation, "matching"));
      }
      if (operation.kind === "ensure-absent-path" && exists) {
        unexpectedPaths.push(operation.path);
        operationStatuses.push(checkStatusFor(operation, "unexpected"));
      }
      if (operation.kind === "ensure-absent-path" && !exists) {
        operationStatuses.push(checkStatusFor(operation, "absent"));
      }
      if (operation.kind === "write-file" || operation.kind === "write-package-json") {
        const expected = yield* renderWritableOperation(operation);
        if (!exists) {
          missingPaths.push(operation.path);
          operationStatuses.push(checkStatusFor(operation, "missing"));
        } else {
          const current = yield* fs
            .readFileString(operationPath)
            .pipe(Effect.mapError((cause) => DomainError.newCause(cause, `Failed to read "${operation.path}"`)));
          if (!stringEquivalence(current, expected)) {
            differingPaths.push(operation.path);
            operationStatuses.push(checkStatusFor(operation, "differing"));
          } else {
            operationStatuses.push(checkStatusFor(operation, "matching"));
          }
        }
      }
    }

    return new OperationPlanCheckResult({
      idempotent: missingPaths.length === 0 && differingPaths.length === 0 && unexpectedPaths.length === 0,
      operationStatuses,
      missingPaths,
      differingPaths,
      unexpectedPaths,
    });
  })
);

/**
 * Apply a decoded operation plan with failsafe conflict behavior.
 *
 * @example
 * ```ts
 * import {
 *   applyCanonicalSliceOperationPlan,
 *   makeCanonicalSliceOperationPlan,
 * } from "@beep/repo-cli/commands/Architecture/index"
 *
 * const program = applyCanonicalSliceOperationPlan("/workspace/beep-effect", makeCanonicalSliceOperationPlan())
 * console.log(program)
 * ```
 * @category utilities
 * @since 0.0.0
 */
export const applyCanonicalSliceOperationPlan: {
  (
    plan: CanonicalSliceOperationPlan
  ): (rootDir: string) => Effect.Effect<OperationPlanApplyResult, DomainError, FileSystem.FileSystem | Path.Path>;
  (
    rootDir: string,
    plan: CanonicalSliceOperationPlan
  ): Effect.Effect<OperationPlanApplyResult, DomainError, FileSystem.FileSystem | Path.Path>;
} = dual(
  2,
  Effect.fn(function* (rootDir: string, plan: CanonicalSliceOperationPlan) {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const writtenPaths: Array<string> = [];
    const skippedPaths: Array<string> = [];
    const removedPaths: Array<string> = [];

    for (const operation of plan.operations) {
      const operationPath = yield* resolveOperationPath(rootDir, operation.path);
      if (operation.kind === "ensure-file") {
        if (yield* pathExists(operationPath)) {
          skippedPaths.push(operation.path);
        } else {
          return yield* DomainError.newMessage(`Required architecture file is missing: ${operation.path}`);
        }
      }
      if (operation.kind === "ensure-absent-path") {
        if (yield* pathExists(operationPath)) {
          yield* fs
            .remove(operationPath, { force: true, recursive: true })
            .pipe(Effect.mapError((cause) => DomainError.newCause(cause, `Failed to remove "${operation.path}"`)));
          removedPaths.push(operation.path);
        } else {
          skippedPaths.push(operation.path);
        }
      }
      if (operation.kind === "write-file" || operation.kind === "write-package-json") {
        const expected = yield* renderWritableOperation(operation);
        if (yield* pathExists(operationPath)) {
          const current = yield* fs
            .readFileString(operationPath)
            .pipe(Effect.mapError((cause) => DomainError.newCause(cause, `Failed to read "${operation.path}"`)));
          if (stringEquivalence(current, expected)) {
            skippedPaths.push(operation.path);
          } else {
            return yield* DomainError.newMessage(
              `Architecture operation would overwrite a differing file: ${operation.path}`
            );
          }
        } else {
          yield* fs
            .makeDirectory(path.dirname(operationPath), { recursive: true })
            .pipe(
              Effect.mapError((cause) =>
                DomainError.newCause(cause, `Failed to create parent directory for "${operation.path}"`)
              )
            );
          yield* fs
            .writeFileString(operationPath, expected)
            .pipe(Effect.mapError((cause) => DomainError.newCause(cause, `Failed to write "${operation.path}"`)));
          writtenPaths.push(operation.path);
        }
      }
    }

    return new OperationPlanApplyResult({ writtenPaths, skippedPaths, removedPaths });
  })
);
