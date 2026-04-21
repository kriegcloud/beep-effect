/**
 * Terse Effect style migration and check logic.
 *
 * @module
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import { TaggedErrorClass } from "@beep/schema";
import { thunkEmptyStr } from "@beep/utils";
import { Effect, HashMap, Inspectable, Order, Path, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import {
  type ArrowFunction,
  type CallExpression,
  Node,
  type ObjectLiteralExpression,
  Project,
  SyntaxKind,
} from "ts-morph";
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
    thunkHelpersSimplified: S.Number,
    flowCandidatesDetected: S.Number,
    optionObjectCompactionCandidatesDetected: S.Number,
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

const THUNK_HELPER_NAMES = [
  "thunkUndefined",
  "thunkEmptyStr",
  "thunkNull",
  "thunkTrue",
  "thunkFalse",
  "thunk0",
] as const;

type ThunkHelperName = (typeof THUNK_HELPER_NAMES)[number];

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
      onEmpty: thunkEmptyStr,
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

const getImportedThunkHelperAliases = (sourceFile: import("ts-morph").SourceFile): HashMap.HashMap<string, string> => {
  let aliases = HashMap.empty<string, string>();

  for (const importDeclaration of sourceFile.getImportDeclarations()) {
    if (importDeclaration.getModuleSpecifierValue() !== "@beep/utils" || importDeclaration.isTypeOnly()) {
      continue;
    }

    for (const importSpecifier of importDeclaration.getNamedImports()) {
      if (importSpecifier.isTypeOnly()) {
        continue;
      }

      const importedName = importSpecifier.getName();
      if (!A.some(THUNK_HELPER_NAMES, (helperName) => helperName === importedName)) {
        continue;
      }

      aliases = HashMap.set(aliases, importedName, importSpecifier.getAliasNode()?.getText() ?? importedName);
    }
  }

  return aliases;
};

const getLiteralThunkHelperName = (expression: import("ts-morph").Node): O.Option<ThunkHelperName> => {
  if (Node.isIdentifier(expression) && expression.getText() === "undefined") {
    return O.some("thunkUndefined");
  }

  if (Node.isStringLiteral(expression) && expression.getLiteralText() === "") {
    return O.some("thunkEmptyStr");
  }

  if (expression.getKind() === SyntaxKind.NullKeyword) {
    return O.some("thunkNull");
  }

  if (expression.getKind() === SyntaxKind.TrueKeyword) {
    return O.some("thunkTrue");
  }

  if (expression.getKind() === SyntaxKind.FalseKeyword) {
    return O.some("thunkFalse");
  }

  if (Node.isNumericLiteral(expression) && expression.getText() === "0") {
    return O.some("thunk0");
  }

  return O.none();
};

const getThunkHelperReplacement = (
  arrowFunction: ArrowFunction,
  thunkHelperAliases: HashMap.HashMap<string, string>
): O.Option<string> => {
  if (arrowFunction.getParameters().length !== 0) {
    return O.none();
  }

  return pipe(
    getLiteralThunkHelperName(arrowFunction.getBody()),
    O.flatMap((helperName) => HashMap.get(thunkHelperAliases, helperName))
  );
};

const isFlowCandidate = (arrowFunction: ArrowFunction): boolean =>
  pipe(
    getSimpleIdentifierParameterName(arrowFunction),
    O.flatMap((parameterName) => {
      const body = arrowFunction.getBody();
      if (!Node.isCallExpression(body)) {
        return O.none();
      }

      const expression = body.getExpression();
      if (!Node.isIdentifier(expression) || expression.getText() !== "pipe") {
        return O.none();
      }

      return pipe(
        body.getArguments().length >= 1 ? O.fromNullishOr(body.getArguments()[0]) : O.none(),
        O.filter(Node.isIdentifier),
        O.filter((firstArgument) => firstArgument.getText() === parameterName)
      );
    }),
    O.isSome
  );

const isOptionMatchExpression = (callExpression: CallExpression): boolean => {
  const expression = callExpression.getExpression();

  if (!Node.isPropertyAccessExpression(expression) || expression.getName() !== "match") {
    return false;
  }

  const receiverText = expression.getExpression().getText();
  return receiverText === "O" || receiverText === "Option";
};

const getOptionMatchHandlers = (callExpression: CallExpression): O.Option<ObjectLiteralExpression> => {
  if (!isOptionMatchExpression(callExpression)) {
    return O.none();
  }

  const args = callExpression.getArguments();
  const maybeHandlers = args.length === 1 ? args[0] : args[1];

  return maybeHandlers !== undefined && Node.isObjectLiteralExpression(maybeHandlers)
    ? O.some(maybeHandlers)
    : O.none();
};

const getPropertyInitializer = (
  objectLiteral: ObjectLiteralExpression,
  propertyName: string
): O.Option<import("ts-morph").Node> =>
  pipe(
    objectLiteral.getProperties(),
    A.findFirst((property) => Node.isPropertyAssignment(property) && property.getName() === propertyName),
    O.flatMap((property) =>
      Node.isPropertyAssignment(property) ? O.fromNullishOr(property.getInitializer()) : O.none()
    )
  );

const getObjectLiteralArrowBody = (node: import("ts-morph").Node): O.Option<ObjectLiteralExpression> => {
  if (!Node.isArrowFunction(node)) {
    return O.none();
  }

  const body = node.getBody();
  if (Node.isObjectLiteralExpression(body)) {
    return O.some(body);
  }

  if (Node.isParenthesizedExpression(body)) {
    const expression = body.getExpression();
    if (Node.isObjectLiteralExpression(expression)) {
      return O.some(expression);
    }
  }

  return O.none();
};

const isEmptyObjectThunk = (node: import("ts-morph").Node): boolean =>
  pipe(
    getObjectLiteralArrowBody(node),
    O.exists((body) => A.length(body.getProperties()) === 0)
  );

const isObjectLiteralThunk = (node: import("ts-morph").Node): boolean =>
  pipe(
    getObjectLiteralArrowBody(node),
    O.exists((body) => A.length(body.getProperties()) > 0)
  );

const isOptionObjectCompactionCandidate = (callExpression: CallExpression): boolean =>
  pipe(
    getOptionMatchHandlers(callExpression),
    O.flatMap((handlers) =>
      pipe(
        O.all({
          onNone: getPropertyInitializer(handlers, "onNone"),
          onSome: getPropertyInitializer(handlers, "onSome"),
        }),
        O.filter(({ onNone, onSome }) => isEmptyObjectThunk(onNone) && isObjectLiteralThunk(onSome))
      )
    ),
    O.isSome
  );

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
  let thunkHelpersSimplified = 0;
  let flowCandidatesDetected = 0;
  let optionObjectCompactionCandidatesDetected = 0;
  let touchedFiles = 0;
  let changedFiles = A.empty<string>();

  for (const sourceFile of sourceFiles) {
    let fileTouched = false;
    let fileMutated = false;
    const thunkHelperAliases = getImportedThunkHelperAliases(sourceFile);
    const arrowFunctions = A.sort(
      sourceFile.getDescendantsOfKind(SyntaxKind.ArrowFunction),
      Order.mapInput(Order.Number, (arrowFunction: ArrowFunction) => -arrowFunction.getStart())
    );

    for (const arrowFunction of arrowFunctions) {
      if (
        pipe(
          getArrowReplacement(arrowFunction),
          O.map((replacement) => {
            if (options.write) {
              arrowFunction.replaceWithText(replacement);
              fileMutated = true;
            }
            helpersSimplified += 1;
            fileTouched = true;
          }),
          O.isSome
        )
      ) {
        continue;
      }

      if (
        pipe(
          getThunkHelperReplacement(arrowFunction, thunkHelperAliases),
          O.map((replacement) => {
            if (options.write) {
              arrowFunction.replaceWithText(replacement);
              fileMutated = true;
            }
            thunkHelpersSimplified += 1;
            fileTouched = true;
          }),
          O.isSome
        )
      ) {
        continue;
      }

      if (isFlowCandidate(arrowFunction)) {
        flowCandidatesDetected += 1;
        fileTouched = true;
      }
    }

    for (const callExpression of sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)) {
      if (isOptionObjectCompactionCandidate(callExpression)) {
        optionObjectCompactionCandidatesDetected += 1;
        fileTouched = true;
      }
    }

    if (fileMutated) {
      sourceFile.organizeImports();
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

  const strictFailure =
    options.strictCheck &&
    (helpersSimplified > 0 ||
      thunkHelpersSimplified > 0 ||
      flowCandidatesDetected > 0 ||
      optionObjectCompactionCandidatesDetected > 0);

  return new TerseEffectRulesSummary({
    touchedFiles,
    helpersSimplified,
    thunkHelpersSimplified,
    flowCandidatesDetected,
    optionObjectCompactionCandidatesDetected,
    strictFailure,
    changedFiles,
  });
});
