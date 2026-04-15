/**
 * Repo-local no-native-runtime parity checker.
 *
 * @module
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import { isNoNativeRuntimeErrorFile } from "@beep/repo-configs/eslint/NoNativeRuntimeHotspots";
import noNativeRuntimeRule from "@beep/repo-configs/eslint/NoNativeRuntimeRule";
import { TaggedErrorClass } from "@beep/schema";
import tsParser from "@typescript-eslint/parser";
import { Effect, Inspectable, Path } from "effect";
import * as A from "effect/Array";
import * as S from "effect/Schema";
import { Linter, type Linter as LinterTypes } from "eslint";
import { Project } from "ts-morph";
import { isExcludedTypeScriptSourcePath, toPosixPath } from "../Shared/TypeScriptSourceExclusions.ts";

const $I = $RepoCliId.create("commands/Laws/NoNativeRuntime");

const INCLUDED_GLOBS = [
  "apps/**/*.{ts,tsx}",
  "packages/**/*.{ts,tsx}",
  "tooling/**/*.{ts,tsx}",
  "infra/**/*.ts",
  ".claude/hooks/**/*.ts",
] as const;

/**
 * Runtime options for repo-local native runtime checks.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class NoNativeRuntimeRulesOptions extends S.Class<NoNativeRuntimeRulesOptions>($I`NoNativeRuntimeRulesOptions`)(
  {
    strictCheck: S.Boolean.pipe(
      S.withConstructorDefault(Effect.succeed(false)),
      S.withDecodingDefault(Effect.succeed(false))
    ),
    excludePaths: S.Array(S.String).pipe(
      S.withConstructorDefault(Effect.succeed(A.empty<string>())),
      S.withDecodingDefault(Effect.succeed(A.empty<string>()))
    ),
  },
  $I.annote("NoNativeRuntimeRulesOptions", {
    description: "Runtime options for repo-local native runtime checks.",
  })
) {}

const NoNativeRuntimeSeverity = S.Union([S.Literal("warn"), S.Literal("error")]);

/**
 * Single repo-local native runtime diagnostic.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class NoNativeRuntimeDiagnostic extends S.Class<NoNativeRuntimeDiagnostic>($I`NoNativeRuntimeDiagnostic`)(
  {
    severity: NoNativeRuntimeSeverity,
    file: S.String,
    line: S.Number,
    column: S.Number,
    message: S.String,
    messageId: S.String.pipe(S.UndefinedOr, S.optionalKey),
  },
  $I.annote("NoNativeRuntimeDiagnostic", {
    description: "Single repo-local native runtime diagnostic.",
  })
) {}

/**
 * Summary of repo-local native runtime checks.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class NoNativeRuntimeRulesSummary extends S.Class<NoNativeRuntimeRulesSummary>($I`NoNativeRuntimeRulesSummary`)(
  {
    scannedFiles: S.Number,
    touchedFiles: S.Number,
    warningCount: S.Number,
    errorCount: S.Number,
    strictFailure: S.Boolean,
    affectedFiles: S.Array(S.String).pipe(
      S.withConstructorDefault(Effect.succeed(A.empty<string>())),
      S.withDecodingDefault(Effect.succeed(A.empty<string>()))
    ),
    diagnostics: S.Array(NoNativeRuntimeDiagnostic).pipe(
      S.withConstructorDefault(Effect.succeed(A.empty<(typeof NoNativeRuntimeDiagnostic)["Type"]>())),
      S.withDecodingDefault(Effect.succeed(A.empty<(typeof NoNativeRuntimeDiagnostic)["Encoded"]>()))
    ),
  },
  $I.annote("NoNativeRuntimeRulesSummary", {
    description: "Summary of repo-local native runtime checks.",
  })
) {}

class NoNativeRuntimeRulesExecutionError extends TaggedErrorClass<NoNativeRuntimeRulesExecutionError>(
  $I`NoNativeRuntimeRulesExecutionError`
)(
  "NoNativeRuntimeRulesExecutionError",
  {
    message: S.String,
  },
  $I.annote("NoNativeRuntimeRulesExecutionError", {
    description: "Repo-local native runtime checks failed unexpectedly.",
  })
) {}

const noNativeRuntimeConfig: Array<LinterTypes.Config> = [
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "beep-laws": {
        rules: {
          "no-native-runtime": noNativeRuntimeRule,
        },
      },
    },
    rules: {
      "beep-laws/no-native-runtime": "error",
    },
  },
];

/**
 * Run repo-local native runtime checks.
 *
 * Non-hotspot files remain warning-only for `--check` so the P3 cutover preserves the
 * old warn-vs-error split while moving the blocking path away from the repo-wide ESLint lane.
 *
 * @category UseCase
 * @since 0.0.0
 */
export const runNoNativeRuntimeRules = Effect.fn(function* (options: NoNativeRuntimeRulesOptions) {
  const path = yield* Path.Path;

  const isExcludedFile = (filePath: string): boolean => {
    const normalized = toPosixPath(filePath);
    if (A.some(options.excludePaths, (excludePath) => normalized === toPosixPath(excludePath))) {
      return true;
    }
    return isExcludedTypeScriptSourcePath(normalized);
  };

  const project = new Project({
    tsConfigFilePath: path.join(process.cwd(), "tsconfig.json"),
    skipAddingFilesFromTsConfig: true,
  });

  for (const pattern of INCLUDED_GLOBS) {
    project.addSourceFilesAtPaths(pattern);
  }

  const sourceFiles = A.filter(project.getSourceFiles(), (sourceFile) => !isExcludedFile(sourceFile.getFilePath()));
  const linter = new Linter({ configType: "flat" });

  let warningCount = 0;
  let errorCount = 0;
  let affectedFiles = A.empty<string>();
  let diagnostics = A.empty<(typeof NoNativeRuntimeDiagnostic)["Type"]>();

  for (const sourceFile of sourceFiles) {
    const relativeFilePath = toPosixPath(path.relative(process.cwd(), sourceFile.getFilePath()));
    const baseSeverity = isNoNativeRuntimeErrorFile(relativeFilePath) ? "error" : "warn";

    const messages = yield* Effect.try({
      try: () => linter.verify(sourceFile.getFullText(), noNativeRuntimeConfig, relativeFilePath),
      catch: (cause) =>
        new NoNativeRuntimeRulesExecutionError({
          message: `Failed to evaluate ${relativeFilePath}: ${Inspectable.toStringUnknown(cause, 0)}`,
        }),
    });

    const ruleMessages = A.filter(messages, (message) => message.ruleId === "beep-laws/no-native-runtime");

    if (ruleMessages.length > 0) {
      affectedFiles = A.append(affectedFiles, relativeFilePath);
    }

    for (const message of ruleMessages) {
      const severity = message.messageId === "allowlistInvalid" || baseSeverity === "error" ? "error" : "warn";

      if (severity === "error") {
        errorCount += 1;
      } else {
        warningCount += 1;
      }

      diagnostics = A.append(
        diagnostics,
        new NoNativeRuntimeDiagnostic({
          severity,
          file: relativeFilePath,
          line: message.line,
          column: message.column,
          message: message.message,
          messageId: message.messageId,
        })
      );
    }
  }

  return new NoNativeRuntimeRulesSummary({
    scannedFiles: sourceFiles.length,
    touchedFiles: affectedFiles.length,
    warningCount,
    errorCount,
    strictFailure: options.strictCheck && errorCount > 0,
    affectedFiles,
    diagnostics,
  });
});
