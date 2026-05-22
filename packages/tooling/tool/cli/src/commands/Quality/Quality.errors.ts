/**
 * Tagged errors for the Quality command suite.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $RepoCliId } from "@beep/identity/packages";
import { TaggedErrorClass } from "@beep/schema";
import { Runtime } from "effect";
import * as S from "effect/Schema";

const $I = $RepoCliId.create("commands/Quality/Quality.errors"); /**
 * Failure raised while validating changeset package references.
 *
 * @example
 * ```ts
 * import { ChangesetGraphError } from "@beep/repo-cli/commands/Quality/ChangesetGraph"
 *
 * const error = new ChangesetGraphError({
 *   message: "Changeset graph validation failed."
 * })
 * console.log(error.message)
 * ```
 * @category error-handling
 * @since 0.0.0
 */
export class ChangesetGraphError extends TaggedErrorClass<ChangesetGraphError>($I`ChangesetGraphError`)(
  "ChangesetGraphError",
  {
    message: S.String,
    file: S.optionalKey(S.String),
    cause: S.optionalKey(S.Defect),
  },
  $I.annote("ChangesetGraphError", {
    description: "Failure raised while validating changeset package references.",
  })
) {}

/**
 * Typed failure for repo operational commands.
 *
 * @example
 * ```ts
 * import { QualityScriptCommandError } from "@beep/repo-cli/commands/Quality/Quality.command"
 * const error = new QualityScriptCommandError({ message: "failed" })
 * ```
 * @category errors
 * @since 0.0.0
 */
export class QualityScriptCommandError extends TaggedErrorClass<QualityScriptCommandError>(
  $I`QualityScriptCommandError`
)(
  "QualityScriptCommandError",
  {
    message: S.String,
    command: S.optionalKey(S.String),
    exitCode: S.optionalKey(S.Number),
    cause: S.optionalKey(S.Defect),
  },
  $I.annote("QualityScriptCommandError", {
    description: "Failure raised while running a migrated repo operational command.",
  })
) {
  /** Process exit code reported when this error reaches the runtime boundary. */
  override readonly [Runtime.errorExitCode] = this.exitCode ?? 1;
}

/**
 * Error raised when a quality task subprocess exits unsuccessfully.
 *
 * @example
 * ```ts
 * import { QualityTaskFailed } from "@beep/repo-cli/commands/Quality/Tasks"
 * const failure = new QualityTaskFailed({
 *   label: "lint",
 *   command: "bunx turbo run lint",
 *   exitCode: 1
 * })
 * ```
 * @category error-handling
 * @since 0.0.0
 */
export class QualityTaskFailed extends TaggedErrorClass<QualityTaskFailed>($I`QualityTaskFailed`)(
  "QualityTaskFailed",
  {
    label: S.String,
    command: S.String,
    exitCode: S.Number,
  },
  $I.annote("QualityTaskFailed", {
    description: "A quality subprocess exited with a non-zero status code.",
  })
) {
  /** Process exit code reported when this error reaches the runtime boundary. */
  override readonly [Runtime.errorExitCode] = this.exitCode;
}

/**
 * Error raised when a bounded quality task group completes with failed steps.
 *
 * @example
 * ```ts
 * import { QualityTaskGroupFailed, QualityTaskFailed } from "@beep/repo-cli/commands/Quality/Tasks"
 * const failure = new QualityTaskGroupFailed({
 *   label: "lint:policies",
 *   exitCode: 1,
 *   failures: [
 *     new QualityTaskFailed({
 *       label: "lint:spell",
 *       command: "bunx cspell .",
 *       exitCode: 1
 *     })
 *   ]
 * })
 * ```
 * @category error-handling
 * @since 0.0.0
 */
export class QualityTaskGroupFailed extends TaggedErrorClass<QualityTaskGroupFailed>($I`QualityTaskGroupFailed`)(
  "QualityTaskGroupFailed",
  {
    label: S.String,
    exitCode: S.Number,
    failures: S.Array(QualityTaskFailed),
  },
  $I.annote("QualityTaskGroupFailed", {
    description: "A bounded quality task group completed with one or more failed subprocesses.",
  })
) {
  /** Process exit code reported when this error reaches the runtime boundary. */
  override readonly [Runtime.errorExitCode] = this.exitCode;
}

/**
 * Error raised when a quality task cannot resolve its required configuration.
 *
 * @example
 * ```ts
 * import { QualityTaskConfigurationError } from "@beep/repo-cli/commands/Quality/Tasks"
 * const error = new QualityTaskConfigurationError({
 *   message: "Could not find package.json"
 * })
 * ```
 * @category error-handling
 * @since 0.0.0
 */
export class QualityTaskConfigurationError extends TaggedErrorClass<QualityTaskConfigurationError>(
  $I`QualityTaskConfigurationError`
)(
  "QualityTaskConfigurationError",
  {
    message: S.String,
  },
  $I.annote("QualityTaskConfigurationError", {
    description: "Quality task configuration could not be resolved.",
  })
) {}

/**
 * Error raised when an unexpected quality task cause reaches the command boundary.
 *
 * @example
 * ```ts
 * import { UnexpectedQualityTaskFailure } from "@beep/repo-cli/commands/Quality/Tasks"
 * const error = new UnexpectedQualityTaskFailure({
 *   message: "Unexpected quality task failure"
 * })
 * ```
 * @category error-handling
 * @since 0.0.0
 */
export class UnexpectedQualityTaskFailure extends TaggedErrorClass<UnexpectedQualityTaskFailure>(
  $I`UnexpectedQualityTaskFailure`
)(
  "UnexpectedQualityTaskFailure",
  {
    message: S.String,
  },
  $I.annote("UnexpectedQualityTaskFailure", {
    description: "Unexpected quality task failure preserved for the process runtime boundary.",
  })
) {}
