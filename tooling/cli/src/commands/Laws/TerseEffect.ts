/**
 * Terse Effect style migration and check logic.
 *
 * @module
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import { TaggedErrorClass } from "@beep/schema";
import { Effect, Inspectable, Order, Path, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { type ArrowFunction, type CallExpression, Node, Project, SyntaxKind } from "ts-morph";
import { isExcludedTypeScriptSourcePath, toPosixPath } from "../Shared/TypeScriptSourceExclusions.ts";

const $I = $RepoCliId.create("commands/Laws/TerseEffect");

/**
 * Runtime options for terse Effect style migration checks.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class TerseEffectRulesOptions extends S.Class<TerseEffectRulesOptions>($I`TerseEffectRulesOptions`)(
  {
    write: S.Boolean.pipe(
      S.withConstructorDefault(Effect.succeed(false)),
      S.withDecodingDefault(Effect.succeed(false))
    ),
    strictCheck: S.Boolean.pipe(
      S.withConstructorDefault(Effect.succeed(false)),
      S.withDecodingDefault(Effect.succeed(false))
    ),
    excludePaths: S.Array(S.String).pipe(
      S.withConstructorDefault(Effect.succeed(A.empty<string>())),
      S.withDecodingDefault(Effect.succeed(A.empty<string>()))
    ),
  },
  $I.annote("TerseEffectRulesOptions", {
    description: "Runtime options for terse Effect style migration checks.",
  })
) {}

/**
 * Summary of terse Effect style migration results.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class TerseEffectRulesSummary extends S.Class<TerseEffectRulesSummary>($I`TerseEffectRulesSummary`)(
  {
    touchedFiles: S.Number,
    helpersSimplified: S.Number,
    strictFailure: S.Boolean,
    changedFiles: S.Array(S.String).pipe(
      S.withConstructorDefault(Effect.succeed(A.empty<string>())),
      S.withDecodingDefault(Effect.succeed(A.empty<string>()))
    ),
  },
  $I.annote("TerseEffectRulesSummary", {
    description: "Summary of terse Effect style migration results.",
  })
) {}

class TerseEffectRulesPersistenceError extends TaggedErrorClass<TerseEffectRulesPersistenceError>(
  $I`TerseEffectRulesPersistenceError`
)(
  "TerseEffectRulesPersistenceError",
  {
    message: S.String,
  },
  $I.annote("TerseEffectRulesPersistenceError", {
    description: "Terse Effect rule updates could not be persisted to disk.",
  })
) {}

const INCLUDED_GLOBS = [
  "apps/**/*.{ts,tsx}",
  "packages/**/*.{ts,tsx}",
  "tooling/**/*.{ts,tsx}",
  "infra/**/*.ts",
  ".claude/hooks/**/*.ts",
] as const;

const getSimpleIdentifierParameterName = (arrowFunction: ArrowFunction): O.Option<string> => {
  const parameters = arrowFunction.getParameters();
  if (parameters.length !== 1) {
    return O.none();
  }

  const parameter = parameters[0];
  if (parameter === undefined || !Node.isIdentifier(parameter.getNameNode())) {
    return O.none();
  }

  return parameter.getText() === parameter.getName() ? O.some(parameter.getName()) : O.none();
};

const typeArgumentSuffix = (callExpression: CallExpression): string =>
  pipe(
    callExpression.getTypeArguments(),
    A.match({
      onEmpty: () => "",
      onNonEmpty: (typeArguments) =>
        `<${pipe(
          typeArguments,
          A.map((typeArgument) => typeArgument.getText()),
          A.join(", ")
        )}>`,
    })
  );

const getZeroArgHelperReference = (callExpression: CallExpression): O.Option<string> => {
  const expression = callExpression.getExpression();

  if (!Node.isPropertyAccessExpression(expression) || callExpression.getArguments().length !== 0) {
    return O.none();
  }

  const receiverText = expression.getExpression().getText();
  const propertyText = expression.getName();

  if ((receiverText === "A" && propertyText === "empty") || (receiverText === "O" && propertyText === "none")) {
    return O.some(`${receiverText}.${propertyText}${typeArgumentSuffix(callExpression)}`);
  }

  return O.none();
};

const getSingleArgHelperReference = (callExpression: CallExpression, parameterName: string): O.Option<string> => {
  const expression = callExpression.getExpression();
  const argumentsList = callExpression.getArguments();

  if (
    !Node.isPropertyAccessExpression(expression) ||
    argumentsList.length !== 1 ||
    argumentsList[0] === undefined ||
    !Node.isIdentifier(argumentsList[0]) ||
    argumentsList[0].getText() !== parameterName
  ) {
    return O.none();
  }

  const receiverText = expression.getExpression().getText();
  const propertyText = expression.getName();
  const suffix = typeArgumentSuffix(callExpression);

  if (receiverText === "A" && propertyText === "make") {
    return O.some(`A.of${suffix}`);
  }

  if (receiverText === "O" && propertyText === "some") {
    return O.some(`O.some${suffix}`);
  }

  return O.none();
};

const getArrowReplacement = (arrowFunction: ArrowFunction): O.Option<string> => {
  const body = arrowFunction.getBody();
  if (!Node.isCallExpression(body)) {
    return O.none();
  }

  if (arrowFunction.getParameters().length === 0) {
    return getZeroArgHelperReference(body);
  }

  return pipe(
    getSimpleIdentifierParameterName(arrowFunction),
    O.flatMap((parameterName) => getSingleArgHelperReference(body, parameterName))
  );
};

/**
 * Run terse Effect style migration/check logic.
 *
 * @category UseCase
 * @since 0.0.0
 */
export const runTerseEffectRules = Effect.fn(function* (options: TerseEffectRulesOptions) {
  const path = yield* Path.Path;

  const isExcludedFile = (filePath: string): boolean => {
    const normalized = toPosixPath(filePath);
    if (A.some(options.excludePaths, (excludePath) => normalized === toPosixPath(excludePath))) return true;
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

  let helpersSimplified = 0;
  let touchedFiles = 0;
  let changedFiles = A.empty<string>();

  for (const sourceFile of sourceFiles) {
    let fileTouched = false;
    const arrowFunctions = A.sort(
      sourceFile.getDescendantsOfKind(SyntaxKind.ArrowFunction),
      Order.mapInput(Order.Number, (arrowFunction: ArrowFunction) => -arrowFunction.getStart())
    );

    for (const arrowFunction of arrowFunctions) {
      pipe(
        getArrowReplacement(arrowFunction),
        O.map((replacement) => {
          arrowFunction.replaceWithText(replacement);
          helpersSimplified += 1;
          fileTouched = true;
        })
      );
    }

    if (fileTouched) {
      touchedFiles += 1;
      changedFiles = A.append(changedFiles, toPosixPath(path.relative(process.cwd(), sourceFile.getFilePath())));
    }
  }

  if (options.write) {
    yield* Effect.tryPromise({
      try: () => project.save(),
      catch: (cause) =>
        new TerseEffectRulesPersistenceError({
          message: `Failed to persist terse Effect style updates: ${Inspectable.toStringUnknown(cause, 0)}`,
        }),
    });
  }

  const strictFailure = options.strictCheck && helpersSimplified > 0;

  return new TerseEffectRulesSummary({
    touchedFiles,
    helpersSimplified,
    strictFailure,
    changedFiles,
  });
});
