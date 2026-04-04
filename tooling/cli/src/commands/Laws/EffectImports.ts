/**
 * Effect import style migration and check logic.
 *
 * @module
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import { TaggedErrorClass } from "@beep/schema";
import { thunkEmptyReadonlyArray, thunkFalse, thunkSomeEmptyArray, thunkSomeFalse } from "@beep/utils";
import { Effect, Inspectable, MutableHashSet, Path, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { Project } from "ts-morph";
import { isExcludedTypeScriptSourcePath, toPosixPath } from "../Shared/TypeScriptSourceExclusions.ts";

const $I = $RepoCliId.create("commands/Laws/EffectImports");

/**
 * Runtime options for effect import law migration checks.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class EffectImportRulesOptions extends S.Class<EffectImportRulesOptions>($I`EffectImportRulesOptions`)(
  {
    write: S.Boolean.pipe(S.withConstructorDefault(thunkSomeFalse), S.withDecodingDefault(thunkFalse)),
    strictCheck: S.Boolean.pipe(S.withConstructorDefault(thunkSomeFalse), S.withDecodingDefault(thunkFalse)),
    excludePaths: S.Array(S.String).pipe(
      S.withConstructorDefault(thunkSomeEmptyArray<string>),
      S.withDecodingDefault(thunkEmptyReadonlyArray<string>())
    ),
  },
  $I.annote("EffectImportRulesOptions", {
    description: "Runtime options for effect import law migration checks.",
  })
) {}

/**
 * Summary of effect import law migration results.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class EffectImportRulesSummary extends S.Class<EffectImportRulesSummary>($I`EffectImportRulesSummary`)(
  {
    touchedFiles: S.Number,
    aliasRenamed: S.Number,
    stableConverted: S.Number,
    strictFailure: S.Boolean,
    changedFiles: S.Array(S.String).pipe(
      S.withConstructorDefault(thunkSomeEmptyArray<string>),
      S.withDecodingDefault(thunkEmptyReadonlyArray<string>())
    ),
  },
  $I.annote("EffectImportRulesSummary", {
    description: "Summary of effect import law migration results.",
  })
) {}

class EffectImportRulesPersistenceError extends TaggedErrorClass<EffectImportRulesPersistenceError>(
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

const ALIAS_RULES: Readonly<Record<string, string>> = {
  "effect/Array": "A",
  "effect/Option": "O",
  "effect/Predicate": "P",
  "effect/Record": "R",
  "effect/Schema": "S",
  "effect/String": "Str",
  "effect/Equal": "Eq",
  "effect/Boolean": "Bool",
};

const INCLUDED_GLOBS = [
  "apps/**/*.{ts,tsx}",
  "packages/**/*.{ts,tsx}",
  "tooling/**/*.{ts,tsx}",
  "infra/**/*.ts",
  ".claude/hooks/**/*.ts",
] as const;
const toStableName = Str.slice("effect/".length);
const isStableSubmodule = P.and(Str.startsWith("effect/"), Str.startsWith("effect/unstable/"));

/**
 * Run effect import style migration/check logic.
 *
 * @category UseCase
 * @since 0.0.0
 */
export const runEffectImportRules = Effect.fn(function* (options: EffectImportRulesOptions) {
  const path = yield* Path.Path;

  const excludePaths = MutableHashSet.empty<string>();
  for (const excludePath of options.excludePaths) {
    MutableHashSet.add(excludePaths, toPosixPath(excludePath));
  }

  const isExcludedFile = (filePath: string): boolean => {
    const normalized = toPosixPath(filePath);
    if (MutableHashSet.has(excludePaths, normalized)) return true;
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

  let aliasRenamed = 0;
  let stableConverted = 0;
  let touchedFiles = 0;
  let changedFiles = A.empty<string>();

  const ensureRootImport = (sourceFile: (typeof sourceFiles)[number]) =>
    pipe(
      sourceFile.getImportDeclarations(),
      A.findFirst(
        (importDeclaration) =>
          importDeclaration.getModuleSpecifierValue() === "effect" && !importDeclaration.isTypeOnly()
      ),
      O.getOrElse(() => sourceFile.addImportDeclaration({ moduleSpecifier: "effect" }))
    );

  for (const sourceFile of sourceFiles) {
    const importDeclarations = [...sourceFile.getImportDeclarations()];
    let fileTouched = false;

    const ensureNamespaceImport = (moduleName: string, alias: string): boolean => {
      let renamed = false;

      pipe(
        sourceFile.getImportDeclarations(),
        A.findFirst(
          (importDeclaration) =>
            importDeclaration.getModuleSpecifierValue() === moduleName && !importDeclaration.isTypeOnly()
        ),
        O.match({
          onNone: () => void sourceFile.addImportDeclaration({ moduleSpecifier: moduleName, namespaceImport: alias }),
          onSome: (importDeclaration) => {
            const namespaceImport = importDeclaration.getNamespaceImport();

            if (P.isUndefined(namespaceImport)) {
              if (importDeclaration.getNamedImports().length === 0) {
                importDeclaration.setNamespaceImport(alias);
              } else {
                sourceFile.addImportDeclaration({ moduleSpecifier: moduleName, namespaceImport: alias });
              }
              return;
            }

            if (namespaceImport.getText() !== alias) {
              namespaceImport.rename(alias);
              renamed = true;
            }
          },
        })
      );

      return renamed;
    };

    for (const importDeclaration of importDeclarations) {
      const moduleName = importDeclaration.getModuleSpecifierValue();

      if (moduleName === "effect" && !importDeclaration.isTypeOnly()) {
        const namedImports = importDeclaration.getNamedImports().slice();

        for (const namedImport of namedImports) {
          const aliasedModuleName = `effect/${namedImport.getName()}`;
          const expectedAlias = ALIAS_RULES[aliasedModuleName];
          const currentAlias = namedImport.getAliasNode()?.getText();

          if (expectedAlias === undefined || currentAlias !== expectedAlias) {
            continue;
          }

          if (ensureNamespaceImport(aliasedModuleName, expectedAlias)) {
            aliasRenamed += 1;
          }
          namedImport.remove();
          stableConverted += 1;
          fileTouched = true;
        }

        if (
          A.isReadonlyArrayEmpty(importDeclaration.getNamedImports()) &&
          P.isUndefined(importDeclaration.getDefaultImport()) &&
          P.isUndefined(importDeclaration.getNamespaceImport())
        ) {
          importDeclaration.remove();
          fileTouched = true;
        }

        continue;
      }

      if (!isStableSubmodule(moduleName)) {
        continue;
      }

      const expectedAlias = ALIAS_RULES[moduleName];

      if (P.isNotUndefined(expectedAlias)) {
        const namespaceImport = importDeclaration.getNamespaceImport();
        const hasOnlyNamespaceImport =
          P.isNotUndefined(namespaceImport) && A.isReadonlyArrayEmpty(importDeclaration.getNamedImports());

        if (!hasOnlyNamespaceImport || P.isUndefined(namespaceImport)) {
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

      const stableName = toStableName(moduleName);
      if (P.or(Str.isEmpty, Str.includes("/"))(stableName)) {
        continue;
      }

      if (importDeclaration.isTypeOnly()) {
        continue;
      }

      const namespaceImport = importDeclaration.getNamespaceImport();
      const hasOnlyNamespaceImport =
        P.isNotUndefined(namespaceImport) && A.isReadonlyArrayEmpty(importDeclaration.getNamedImports());

      if (!hasOnlyNamespaceImport || P.isUndefined(namespaceImport)) {
        continue;
      }

      const localAlias = namespaceImport.getText();
      const rootImport = ensureRootImport(sourceFile);
      const targetAlias = localAlias === stableName ? undefined : localAlias;

      const hasNamedImport = A.some(rootImport.getNamedImports(), (namedImport) => {
        const currentAlias = namedImport.getAliasNode()?.getText();
        return namedImport.getName() === stableName && currentAlias === targetAlias;
      });

      if (!hasNamedImport) {
        if (P.isUndefined(targetAlias)) {
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
      changedFiles = A.append(changedFiles, toPosixPath(path.relative(process.cwd(), sourceFile.getFilePath())));
    }
  }

  if (options.write) {
    yield* Effect.tryPromise({
      try: () => project.save(),
      catch: (cause) =>
        new EffectImportRulesPersistenceError({
          message: `Failed to persist effect import updates: ${Inspectable.toStringUnknown(cause, 0)}`,
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
