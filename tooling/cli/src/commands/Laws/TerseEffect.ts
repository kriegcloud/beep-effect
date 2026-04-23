/**
 * Terse Effect style migration and check logic.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import { TaggedErrorClass } from "@beep/schema";
import { thunkEmptyStr } from "@beep/utils";
import { Effect, HashMap, Inspectable, Order, Path, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import {
  type ArrowFunction,
  type CallExpression,
  type FunctionDeclaration,
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
 * @example
 * ```ts
 * console.log("TerseEffectRulesOptions")
 * ```
 * @category models
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
 * @example
 * ```ts
 * console.log("TerseEffectRulesSummary")
 * ```
 * @category models
 * @since 0.0.0
 */
export class TerseEffectRulesSummary extends S.Class<TerseEffectRulesSummary>($I`TerseEffectRulesSummary`)(
  {
    touchedFiles: S.Number,
    helpersSimplified: S.Number,
    thunkHelpersSimplified: S.Number,
    flowCandidatesDetected: S.Number,
    optionObjectCompactionCandidatesDetected: S.Number,
    nestedOptionMatchCandidatesDetected: S.Number,
    nestedBoolMatchCandidatesDetected: S.Number,
    dualOverloadCandidatesDetected: S.Number,
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

const OPTION_MATCH_HANDLER_NAMES = ["onNone", "onSome"] as const;

const BOOL_MATCH_HANDLER_NAMES = ["onFalse", "onTrue"] as const;

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

const getCallExpressionArgument = (callExpression: CallExpression, index: number): O.Option<import("ts-morph").Node> =>
  A.get(callExpression.getArguments(), index);

const getSimpleIdentifierParameterName = (arrowFunction: ArrowFunction): O.Option<string> => {
  const parameters = arrowFunction.getParameters();
  if (parameters.length !== 1) {
    return O.none();
  }

  const parameter = parameters[0];
  if (
    P.isUndefined(parameter) ||
    !Node.isIdentifier(parameter.getNameNode()) ||
    P.isNotUndefined(parameter.getInitializer()) ||
    parameter.hasQuestionToken() ||
    parameter.isRestParameter()
  ) {
    return O.none();
  }

  return O.some(parameter.getName());
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
    !pipe(
      getCallExpressionArgument(callExpression, 0),
      O.exists((argument) => Node.isIdentifier(argument) && argument.getText() === parameterName)
    )
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

const nodeContainsIdentifier = (node: import("ts-morph").Node, identifierName: string): boolean =>
  (Node.isIdentifier(node) && node.getText() === identifierName) ||
  pipe(
    node.getDescendantsOfKind(SyntaxKind.Identifier),
    A.some((identifier) => identifier.getText() === identifierName)
  );

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
        getCallExpressionArgument(body, 0),
        O.filter(Node.isIdentifier),
        O.filter((firstArgument) => firstArgument.getText() === parameterName),
        O.filter(() =>
          pipe(
            body.getArguments(),
            A.drop(1),
            A.every((argument) => !nodeContainsIdentifier(argument, parameterName))
          )
        )
      );
    }),
    O.isSome
  );

const isKnownMatcherExpression = (
  callExpression: CallExpression,
  receiverNames: ReadonlyArray<string>,
  propertyName: string
): boolean => {
  const expression = callExpression.getExpression();

  if (!Node.isPropertyAccessExpression(expression) || expression.getName() !== propertyName) {
    return false;
  }

  const receiverText = expression.getExpression().getText();
  return A.some(receiverNames, (receiverName) => receiverName === receiverText);
};

const isOptionMatchExpression = (callExpression: CallExpression): boolean =>
  isKnownMatcherExpression(callExpression, ["O", "Option"], "match");

const isBoolMatchExpression = (callExpression: CallExpression): boolean =>
  isKnownMatcherExpression(callExpression, ["Bool", "Boolean"], "match");

const getMatcherHandlers = (
  callExpression: CallExpression,
  isMatcherExpression: (callExpression: CallExpression) => boolean
): O.Option<ObjectLiteralExpression> => {
  if (!isMatcherExpression(callExpression)) {
    return O.none();
  }

  return pipe(
    getCallExpressionArgument(callExpression, 1),
    O.orElse(() => getCallExpressionArgument(callExpression, 0)),
    O.filter(Node.isObjectLiteralExpression)
  );
};

const getOptionMatchHandlers = (callExpression: CallExpression): O.Option<ObjectLiteralExpression> =>
  getMatcherHandlers(callExpression, isOptionMatchExpression);

const getBoolMatchHandlers = (callExpression: CallExpression): O.Option<ObjectLiteralExpression> =>
  getMatcherHandlers(callExpression, isBoolMatchExpression);

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

const getHandlerInitializers = (
  objectLiteral: ObjectLiteralExpression,
  handlerNames: ReadonlyArray<string>
): ReadonlyArray<import("ts-morph").Node> =>
  pipe(
    handlerNames,
    A.flatMap((handlerName) =>
      pipe(
        getPropertyInitializer(objectLiteral, handlerName),
        O.match({
          onNone: A.empty<import("ts-morph").Node>,
          onSome: A.of,
        })
      )
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

const nodeContainsCallExpression = (
  node: import("ts-morph").Node,
  predicate: (callExpression: CallExpression) => boolean
): boolean =>
  (Node.isCallExpression(node) && predicate(node)) ||
  pipe(node.getDescendantsOfKind(SyntaxKind.CallExpression), A.some(predicate));

const isNestedMatcherCandidate = (
  callExpression: CallExpression,
  getHandlers: (callExpression: CallExpression) => O.Option<ObjectLiteralExpression>,
  isMatcherExpression: (callExpression: CallExpression) => boolean,
  handlerNames: ReadonlyArray<string>
): boolean =>
  pipe(
    getHandlers(callExpression),
    O.exists((handlers) =>
      pipe(
        getHandlerInitializers(handlers, handlerNames),
        A.some((handler) => nodeContainsCallExpression(handler, isMatcherExpression))
      )
    )
  );

const isNestedOptionMatchCandidate = (callExpression: CallExpression): boolean =>
  isNestedMatcherCandidate(callExpression, getOptionMatchHandlers, isOptionMatchExpression, OPTION_MATCH_HANDLER_NAMES);

const isNestedBoolMatchCandidate = (callExpression: CallExpression): boolean =>
  isNestedMatcherCandidate(callExpression, getBoolMatchHandlers, isBoolMatchExpression, BOOL_MATCH_HANDLER_NAMES);

const hasFunctionReturnType = (functionDeclaration: FunctionDeclaration): boolean =>
  pipe(O.fromNullishOr(functionDeclaration.getReturnTypeNode()), O.exists(Node.isFunctionTypeNode));

const isExplicitDualOverloadCandidate = (functionDeclaration: FunctionDeclaration): boolean => {
  if (!functionDeclaration.isExported() || P.isUndefined(functionDeclaration.getBody())) {
    return false;
  }

  const overloads = functionDeclaration.getOverloads();
  const dataFirstParameterCounts = pipe(
    overloads,
    A.filter((overload) => !hasFunctionReturnType(overload)),
    A.map((overload) => overload.getParameters().length)
  );
  const dataLastParameterCounts = pipe(
    overloads,
    A.filter(hasFunctionReturnType),
    A.filter((overload) => overload.getParameters().length > 0),
    A.map((overload) => overload.getParameters().length)
  );

  return pipe(
    dataLastParameterCounts,
    A.some((dataLastParameterCount) =>
      pipe(
        dataFirstParameterCounts,
        A.some((dataFirstParameterCount) => dataLastParameterCount < dataFirstParameterCount)
      )
    )
  );
};

/**
 * Run terse Effect style migration/check logic.
 *
 * @example
 * ```ts
 * console.log("runTerseEffectRules")
 * ```
 * @category utilities
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
  let nestedOptionMatchCandidatesDetected = 0;
  let nestedBoolMatchCandidatesDetected = 0;
  let dualOverloadCandidatesDetected = 0;
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

      if (isNestedOptionMatchCandidate(callExpression)) {
        nestedOptionMatchCandidatesDetected += 1;
        fileTouched = true;
      }

      if (isNestedBoolMatchCandidate(callExpression)) {
        nestedBoolMatchCandidatesDetected += 1;
        fileTouched = true;
      }
    }

    for (const functionDeclaration of sourceFile.getFunctions()) {
      if (isExplicitDualOverloadCandidate(functionDeclaration)) {
        dualOverloadCandidatesDetected += 1;
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
      optionObjectCompactionCandidatesDetected > 0 ||
      nestedOptionMatchCandidatesDetected > 0 ||
      nestedBoolMatchCandidatesDetected > 0 ||
      dualOverloadCandidatesDetected > 0);

  return new TerseEffectRulesSummary({
    touchedFiles,
    helpersSimplified,
    thunkHelpersSimplified,
    flowCandidatesDetected,
    optionObjectCompactionCandidatesDetected,
    nestedOptionMatchCandidatesDetected,
    nestedBoolMatchCandidatesDetected,
    dualOverloadCandidatesDetected,
    strictFailure,
    changedFiles,
  });
});
