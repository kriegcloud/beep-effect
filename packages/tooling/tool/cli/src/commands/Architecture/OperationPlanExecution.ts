/**
 * Architecture operation-plan filesystem execution.
 *
 * @packageDocumentation
 * @category cli-commands
 * @since 0.0.0
 */

import { DomainError } from "@beep/repo-utils";
import { normalizePath } from "@beep/schema";
import { A, Str, thunkFalse } from "@beep/utils";
import { Effect, FileSystem, Match, Path } from "effect";
import { dual } from "effect/Function";
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

const stringEquivalence = Str.equivalence;

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
      const checkWritableOperation = Effect.fn("checkWritableOperation")(function* (
        writableOperation: WriteFileOperation | WritePackageJsonOperation
      ) {
        const expected = yield* renderWritableOperation(writableOperation);
        if (!exists) {
          A.appendInPlace(missingPaths, writableOperation.path);
          A.appendInPlace(operationStatuses, checkStatusFor(writableOperation, "missing"));
          return;
        }

        const current = yield* fs
          .readFileString(operationPath)
          .pipe(Effect.mapError((cause) => DomainError.newCause(cause, `Failed to read "${writableOperation.path}"`)));
        if (!stringEquivalence(current, expected)) {
          A.appendInPlace(differingPaths, writableOperation.path);
          A.appendInPlace(operationStatuses, checkStatusFor(writableOperation, "differing"));
        } else {
          A.appendInPlace(operationStatuses, checkStatusFor(writableOperation, "matching"));
        }
      });

      yield* Match.value(operation).pipe(
        Match.withReturnType<Effect.Effect<void, DomainError>>(),
        Match.discriminatorsExhaustive("kind")({
          "ensure-file": (ensureFileOperation) =>
            Effect.sync(() => {
              if (!exists) {
                A.appendInPlace(missingPaths, ensureFileOperation.path);
                A.appendInPlace(operationStatuses, checkStatusFor(ensureFileOperation, "missing"));
              } else {
                A.appendInPlace(operationStatuses, checkStatusFor(ensureFileOperation, "matching"));
              }
            }),
          "ensure-absent-path": (ensureAbsentPathOperation) =>
            Effect.sync(() => {
              if (exists) {
                A.appendInPlace(unexpectedPaths, ensureAbsentPathOperation.path);
                A.appendInPlace(operationStatuses, checkStatusFor(ensureAbsentPathOperation, "unexpected"));
              } else {
                A.appendInPlace(operationStatuses, checkStatusFor(ensureAbsentPathOperation, "absent"));
              }
            }),
          "write-file": checkWritableOperation,
          "write-package-json": checkWritableOperation,
        })
      );
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
      const exists = yield* pathExists(operationPath);
      const applyWritableOperation = Effect.fn("applyWritableOperation")(function* (
        writableOperation: WriteFileOperation | WritePackageJsonOperation
      ) {
        const expected = yield* renderWritableOperation(writableOperation);
        if (exists) {
          const current = yield* fs
            .readFileString(operationPath)
            .pipe(
              Effect.mapError((cause) => DomainError.newCause(cause, `Failed to read "${writableOperation.path}"`))
            );
          if (stringEquivalence(current, expected)) {
            A.appendInPlace(skippedPaths, writableOperation.path);
          } else {
            return yield* DomainError.newMessage(
              `Architecture operation would overwrite a differing file: ${writableOperation.path}`
            );
          }
          return;
        }

        yield* fs
          .makeDirectory(path.dirname(operationPath), { recursive: true })
          .pipe(
            Effect.mapError((cause) =>
              DomainError.newCause(cause, `Failed to create parent directory for "${writableOperation.path}"`)
            )
          );
        yield* fs
          .writeFileString(operationPath, expected)
          .pipe(Effect.mapError((cause) => DomainError.newCause(cause, `Failed to write "${writableOperation.path}"`)));
        A.appendInPlace(writtenPaths, writableOperation.path);
      });

      yield* Match.value(operation).pipe(
        Match.withReturnType<Effect.Effect<void, DomainError>>(),
        Match.discriminatorsExhaustive("kind")({
          "ensure-file": Effect.fn("applyEnsureFileOperation")(function* (ensureFileOperation) {
            if (exists) {
              A.appendInPlace(skippedPaths, ensureFileOperation.path);
            } else {
              return yield* DomainError.newMessage(
                `Required architecture file is missing: ${ensureFileOperation.path}`
              );
            }
          }),
          "ensure-absent-path": Effect.fn("applyEnsureAbsentPathOperation")(function* (ensureAbsentPathOperation) {
            if (exists) {
              yield* fs
                .remove(operationPath, { force: true, recursive: true })
                .pipe(
                  Effect.mapError((cause) =>
                    DomainError.newCause(cause, `Failed to remove "${ensureAbsentPathOperation.path}"`)
                  )
                );
              A.appendInPlace(removedPaths, ensureAbsentPathOperation.path);
            } else {
              A.appendInPlace(skippedPaths, ensureAbsentPathOperation.path);
            }
          }),
          "write-file": applyWritableOperation,
          "write-package-json": applyWritableOperation,
        })
      );
    }

    return new OperationPlanApplyResult({ writtenPaths, skippedPaths, removedPaths });
  })
);
