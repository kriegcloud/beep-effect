/**
 * Effect import style migration and check logic.
 *
 * @since 0.0.0
 * @module
 */

import path from "node:path";
import { $RepoCliId } from "@beep/identity/packages";
import { Effect, MutableHashSet, String as Str } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { Project } from "ts-morph";

const $I = $RepoCliId.create("commands/Laws/EffectImports");

/**
 * Runtime options for effect import law migration checks.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class EffectImportRulesOptions extends S.Class<EffectImportRulesOptions>($I`EffectImportRulesOptions`)(
  {
    write: S.Boolean.pipe(
      S.withConstructorDefault(() => O.some(false)),
      S.withDecodingDefault(() => false)
    ),
    strictCheck: S.Boolean.pipe(
      S.withConstructorDefault(() => O.some(false)),
      S.withDecodingDefault(() => false)
    ),
    excludePaths: S.Array(S.String).pipe(
      S.withConstructorDefault(() => O.some([])),
      S.withDecodingDefault(() => [])
    ),
  },
  $I.annote("EffectImportRulesOptions", {
    description: "Runtime options for effect import law migration checks.",
  })
) {}

/**
 * Summary of effect import law migration results.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class EffectImportRulesSummary extends S.Class<EffectImportRulesSummary>($I`EffectImportRulesSummary`)(
  {
    touchedFiles: S.Number,
    aliasRenamed: S.Number,
    stableConverted: S.Number,
    strictFailure: S.Boolean,
    changedFiles: S.Array(S.String).pipe(
      S.withConstructorDefault(() => O.some([])),
      S.withDecodingDefault(() => [])
    ),
  },
  $I.annote("EffectImportRulesSummary", {
    description: "Summary of effect import law migration results.",
  })
) {}

class EffectImportRulesPersistenceError extends S.TaggedErrorClass<EffectImportRulesPersistenceError>(
  $I`EffectImportRulesPersistenceError`
)(
  "EffectImportRulesPersistenceError",
  {
    message: S.String,
  },
  $I.annote("EffectImportRulesPersistenceError", {
    description: "Effect import rules could not be persisted to disk.",
  })
) {}

const ALIAS_RULES = {
  "effect/Array": "A",
  "effect/Option": "O",
  "effect/Predicate": "P",
  "effect/Record": "R",
  "effect/Schema": "S",
} as const;

const INCLUDED_GLOBS = ["apps/**/*.{ts,tsx}", "packages/**/*.{ts,tsx}", "tooling/**/*.{ts,tsx}", "infra/**/*.ts"] as const;
const EXCLUDED_SEGMENTS = ["/test/", "/tests/", "/dtslint/", "/dist/", "/.next/", "/.turbo/"] as const;
const EXCLUDED_SUFFIXES = [".d.ts", ".test.ts", ".test.tsx", ".spec.ts", ".spec.tsx", ".stories.tsx"] as const;

const toPosix = (value: string): string => value.replaceAll("\\", "/");
const isStableSubmodule = (moduleName: string): boolean =>
  moduleName.startsWith("effect/") && !moduleName.startsWith("effect/unstable/");

/**
 * Run effect import style migration/check logic.
 *
 * @since 0.0.0
 * @category UseCase
 */
export const runEffectImportRules = Effect.fn(function* (options: EffectImportRulesOptions) {
  const excludePaths = MutableHashSet.empty<string>();
  for (const excludePath of options.excludePaths) {
    MutableHashSet.add(excludePaths, toPosix(excludePath));
  }

  const isExcludedFile = (filePath: string): boolean => {
    const normalized = toPosix(filePath);
    if (MutableHashSet.has(excludePaths, normalized)) return true;
    if (EXCLUDED_SUFFIXES.some((suffix) => normalized.endsWith(suffix))) return true;
    return EXCLUDED_SEGMENTS.some((segment) => normalized.includes(segment));
  };

  const project = new Project({
    tsConfigFilePath: path.join(process.cwd(), "tsconfig.json"),
    skipAddingFilesFromTsConfig: true,
  });

  for (const pattern of INCLUDED_GLOBS) {
    project.addSourceFilesAtPaths(pattern);
  }

  const sourceFiles = project.getSourceFiles().filter((sourceFile) => !isExcludedFile(sourceFile.getFilePath()));

  let aliasRenamed = 0;
  let stableConverted = 0;
  let touchedFiles = 0;
  const changedFiles = [] as Array<string>;

  const ensureRootImport = (sourceFile: (typeof sourceFiles)[number]) => {
    const existing = sourceFile
      .getImportDeclarations()
      .find((importDeclaration) => importDeclaration.getModuleSpecifierValue() === "effect" && !importDeclaration.isTypeOnly());

    if (existing) {
      return existing;
    }

    return sourceFile.addImportDeclaration({ moduleSpecifier: "effect" });
  };

  for (const sourceFile of sourceFiles) {
    const importDeclarations = [...sourceFile.getImportDeclarations()];
    let fileTouched = false;

    for (const importDeclaration of importDeclarations) {
      const moduleName = importDeclaration.getModuleSpecifierValue();

      if (!isStableSubmodule(moduleName)) {
        continue;
      }

      const expectedAlias = ALIAS_RULES[moduleName as keyof typeof ALIAS_RULES];

      if (expectedAlias !== undefined) {
        const namespaceImport = importDeclaration.getNamespaceImport();
        const hasOnlyNamespaceImport = namespaceImport !== undefined && importDeclaration.getNamedImports().length === 0;

        if (!hasOnlyNamespaceImport || namespaceImport === undefined) {
          continue;
        }

        const currentAlias = namespaceImport.getText();
        if (currentAlias !== expectedAlias) {
          namespaceImport.rename(expectedAlias);
          aliasRenamed += 1;
          fileTouched = true;
        }

        continue;
      }

      const stableName = Str.slice("effect/".length)(moduleName);
      if (stableName.length === 0 || stableName.includes("/")) {
        continue;
      }

      if (importDeclaration.isTypeOnly()) {
        continue;
      }

      const namespaceImport = importDeclaration.getNamespaceImport();
      const hasOnlyNamespaceImport = namespaceImport !== undefined && importDeclaration.getNamedImports().length === 0;

      if (!hasOnlyNamespaceImport || namespaceImport === undefined) {
        continue;
      }

      const localAlias = namespaceImport.getText();
      const rootImport = ensureRootImport(sourceFile);
      const targetAlias = localAlias === stableName ? undefined : localAlias;

      const hasNamedImport = rootImport.getNamedImports().some((namedImport) => {
        const currentAlias = namedImport.getAliasNode()?.getText();
        return namedImport.getName() === stableName && currentAlias === targetAlias;
      });

      if (!hasNamedImport) {
        if (targetAlias === undefined) {
          rootImport.addNamedImport(stableName);
        } else {
          rootImport.addNamedImport({ name: stableName, alias: targetAlias });
        }
      }

      importDeclaration.remove();
      stableConverted += 1;
      fileTouched = true;
    }

    if (fileTouched) {
      sourceFile.organizeImports();
      touchedFiles += 1;
      changedFiles.push(toPosix(path.relative(process.cwd(), sourceFile.getFilePath())));
    }
  }

  if (options.write) {
    yield* Effect.tryPromise({
      try: () => project.save(),
      catch: (cause) =>
        new EffectImportRulesPersistenceError({
          message: `Failed to persist effect import updates: ${String(cause)}`,
        }),
    });
  }

  const strictFailure = options.strictCheck && (aliasRenamed > 0 || stableConverted > 0);

  return new EffectImportRulesSummary({
    touchedFiles,
    aliasRenamed,
    stableConverted,
    strictFailure,
    changedFiles,
  });
});
