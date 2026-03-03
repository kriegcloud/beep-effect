// cspell:ignore tsmorph scip

import { createHash } from "node:crypto";
import { NonNegativeInt } from "@beep/schema";
import { Effect, HashSet, MutableHashMap, MutableHashSet, Order, type Path, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import {
  type ArrowFunction,
  type ConstructorDeclaration,
  type FunctionDeclaration,
  type FunctionExpression,
  type GetAccessorDeclaration,
  type JSDocableNode,
  type MethodDeclaration,
  Node,
  type SetAccessorDeclaration,
  type Type,
} from "ts-morph";
import {
  TsMorphSymbolNotFoundError,
  TsMorphValidationError,
  TsMorphWriteApplyError,
  TsMorphWriteConflictError,
} from "./errors.js";
import {
  type TsMorphCheckDriftRequest,
  type TsMorphDeclarationTarget,
  type TsMorphDeterministicJSDocRequest,
  TsMorphDeterministicTag,
  type TsMorphEffectChannels,
  type TsMorphEffectDecompositionRequest,
  TsMorphJSDocDriftEntry,
  TsMorphJSDocDriftReport,
  TsMorphJSDocTagInput,
  TsMorphJSDocValidationIssue,
  TsMorphJSDocValidationReport,
  TsMorphJSDocWriteConflict,
  TsMorphJSDocWriteOperation,
  type TsMorphJSDocWritePlan,
  TsMorphJSDocWriteReceipt,
  type TsMorphPlanJSDocWritesRequest,
  type TsMorphProjectContext,
  type TsMorphValidateJSDocRequest,
} from "./models.js";
import { buildDeclarationSignature, collectProjectDeclarationTargets, resolveDeclarationTarget } from "./query.js";

const optionValue = <A>(value: O.Option<A>): A | undefined => (O.isSome(value) ? value.value : undefined);
const decodeNonNegativeInt = S.decodeUnknownSync(NonNegativeInt);

const normalizeTypeText = (value: string): string =>
  pipe(value, Str.replace(/import\([^)]*\)\./g, ""), Str.replace(/\s+/g, " "), Str.trim);

const splitTopLevel = (value: string, delimiter: string): ReadonlyArray<string> => {
  const result: Array<string> = [];
  let depth = 0;
  let current = "";

  for (const char of value) {
    if (char === "<" || char === "(" || char === "[" || char === "{") {
      depth += 1;
      current += char;
      continue;
    }
    if (char === ">" || char === ")" || char === "]" || char === "}") {
      depth -= 1;
      current += char;
      continue;
    }
    if (char === delimiter && depth === 0) {
      result.push(Str.trim(current));
      current = "";
      continue;
    }
    current += char;
  }

  if (Str.isNonEmpty(Str.trim(current))) {
    result.push(Str.trim(current));
  }

  return result;
};

const parseEffectChannelsFromText = (
  value: string
): O.Option<readonly [ReadonlyArray<string>, ReadonlyArray<string>]> => {
  const normalized = normalizeTypeText(value);
  const marker = Str.startsWith("Effect.Effect<")(normalized)
    ? "Effect.Effect<"
    : Str.startsWith("Effect<")(normalized)
      ? "Effect<"
      : undefined;
  if (marker === undefined) {
    return O.none();
  }

  const inner = Str.slice(marker.length, -1)(normalized);
  const parts = splitTopLevel(inner, ",");
  if (parts.length < 3) {
    return O.none();
  }

  const errors = pipe(
    splitTopLevel(parts[1] ?? "", "|"),
    A.map(normalizeTypeText),
    A.filter((entry) => entry.length > 0 && entry !== "never" && entry !== "void" && entry !== "unknown"),
    A.dedupe,
    A.sort(Order.String)
  );

  const requirements = pipe(
    splitTopLevel(parts[2] ?? "", "|"),
    A.map(normalizeTypeText),
    A.filter((entry) => entry.length > 0 && entry !== "never" && entry !== "void" && entry !== "unknown"),
    A.dedupe,
    A.sort(Order.String)
  );

  return O.some([errors, requirements] as const);
};

const typeNamesFromType = (type: Type): ReadonlyArray<string> => {
  const visit = (current: Type): ReadonlyArray<string> => {
    if (current.isUnion()) {
      return pipe(
        current.getUnionTypes(),
        A.flatMap((member) => visit(member))
      );
    }

    if (current.isIntersection()) {
      return pipe(
        current.getIntersectionTypes(),
        A.flatMap((member) => visit(member))
      );
    }

    const symbolName = current.getSymbol()?.getName() ?? current.getAliasSymbol()?.getName();
    const text = normalizeTypeText(current.getText());
    const value = symbolName ?? text;

    if (
      value.length === 0 ||
      value === "never" ||
      value === "void" ||
      value === "unknown" ||
      value === "undefined" ||
      value === "null"
    ) {
      return A.empty<string>();
    }

    return [value];
  };

  return pipe(
    visit(type),
    A.map((entry) => normalizeTypeText(entry)),
    A.filter((entry) => entry.length > 0),
    A.dedupe,
    A.sort(Order.String)
  );
};

const extractEffectType = (type: Type): O.Option<Type> => {
  const symbolName = type.getSymbol()?.getName() ?? type.getAliasSymbol()?.getName();

  if (symbolName === "Effect") {
    return O.some(type);
  }

  const text = normalizeTypeText(type.getText());
  if (Str.startsWith("Effect<")(text) || Str.startsWith("Effect.Effect<")(text)) {
    return O.some(type);
  }

  if (type.isUnion()) {
    for (const member of type.getUnionTypes()) {
      const maybe = extractEffectType(member);
      if (O.isSome(maybe)) {
        return maybe;
      }
    }
  }

  return O.none();
};

const functionLikeReturnType = (target: TsMorphDeclarationTarget): O.Option<Type> => {
  const declaration = target.declaration;

  if (Node.isFunctionDeclaration(declaration) || Node.isMethodDeclaration(declaration)) {
    return O.some(declaration.getReturnType());
  }

  if (Node.isGetAccessorDeclaration(declaration)) {
    return O.some(declaration.getReturnType());
  }

  if (Node.isSetAccessorDeclaration(declaration)) {
    return O.some(declaration.getParameters()[0]?.getType() ?? declaration.getType());
  }

  if (Node.isVariableDeclaration(declaration)) {
    const initializer = declaration.getInitializer();
    if (initializer !== undefined && (Node.isArrowFunction(initializer) || Node.isFunctionExpression(initializer))) {
      return O.some(initializer.getReturnType());
    }

    return O.some(declaration.getType());
  }

  return O.none();
};

const decomposeEffectChannelsForTarget = (target: TsMorphDeclarationTarget): TsMorphEffectChannels => {
  const returnType = functionLikeReturnType(target);
  if (O.isNone(returnType)) {
    return {
      errors: A.empty<string>(),
      requirements: A.empty<string>(),
      isEffectReturn: false,
    };
  }

  const effectType = extractEffectType(returnType.value);
  if (O.isNone(effectType)) {
    return {
      errors: A.empty<string>(),
      requirements: A.empty<string>(),
      isEffectReturn: false,
    };
  }

  const typeArguments = effectType.value.getTypeArguments();
  const errorType = typeArguments[1];
  const requirementType = typeArguments[2];
  const parsedFromText = parseEffectChannelsFromText(effectType.value.getText());
  const textErrors = O.isSome(parsedFromText) ? parsedFromText.value[0] : A.empty<string>();
  const textRequirements = O.isSome(parsedFromText) ? parsedFromText.value[1] : A.empty<string>();

  return {
    errors:
      errorType === undefined
        ? textErrors
        : pipe(typeNamesFromType(errorType), A.appendAll(textErrors), A.dedupe, A.sort(Order.String)),
    requirements:
      requirementType === undefined
        ? textRequirements
        : pipe(typeNamesFromType(requirementType), A.appendAll(textRequirements), A.dedupe, A.sort(Order.String)),
    isEffectReturn: true,
  };
};

const deterministicTagOrder: ReadonlyArray<string> = [
  "@param",
  "@returns",
  "@template",
  "@async",
  "@implements",
  "@extends",
  "@export",
  "@access",
  "@readonly",
  "@abstract",
  "@override",
  "@static",
  "@throws",
  "@requires",
];

const deterministicTagWeight = (tag: string): number => {
  const index = deterministicTagOrder.indexOf(tag);
  return index >= 0 ? index : deterministicTagOrder.length;
};

const compareTags = (left: TsMorphDeterministicTag, right: TsMorphDeterministicTag): number => {
  const byTag = deterministicTagWeight(left.tag) - deterministicTagWeight(right.tag);
  if (byTag !== 0) {
    return byTag;
  }

  const leftValue = optionValue(left.value) ?? "";
  const rightValue = optionValue(right.value) ?? "";
  return Str.localeCompare(rightValue)(leftValue);
};

/**
 * Decompose Effect channels for a symbol.
 *
 * @param context - Runtime project context.
 * @param input - Decomposition request.
 * @returns Deterministic Effect channel decomposition.
 * @category codegraph-tsmorph
 * @since 0.0.0
 */
export const decomposeEffectChannelsFromContext: (
  context: TsMorphProjectContext,
  input: TsMorphEffectDecompositionRequest
) => Effect.Effect<TsMorphEffectChannels, TsMorphSymbolNotFoundError, Path.Path> = Effect.fn(
  function* (context, input) {
    const target = yield* resolveDeclarationTarget(context, input.symbol);
    return decomposeEffectChannelsForTarget(target);
  }
);

const pushTag = (
  accumulator: Array<TsMorphDeterministicTag>,
  tag: TsMorphDeterministicTag["tag"],
  value?: string,
  confidence = 1
): void => {
  const normalizedValue = value === undefined ? undefined : Str.trim(value);

  const duplicate = accumulator.some((entry) => {
    if (entry.tag !== tag) {
      return false;
    }

    const left = optionValue(entry.value) ?? "";
    const right = normalizedValue ?? "";
    return left === right;
  });

  if (duplicate) {
    return;
  }

  accumulator.push(
    new TsMorphDeterministicTag({
      tag,
      value: normalizedValue === undefined ? O.none() : O.some(normalizedValue),
      confidence,
    })
  );
};

const parameterSummary = (
  declaration:
    | FunctionDeclaration
    | MethodDeclaration
    | ConstructorDeclaration
    | GetAccessorDeclaration
    | SetAccessorDeclaration
    | ArrowFunction
    | FunctionExpression
): ReadonlyArray<string> =>
  declaration
    .getParameters()
    .map((parameter) => `${parameter.getName()} ${normalizeTypeText(parameter.getType().getText(parameter))}`);

const typeParameterSummary = (declaration: Node): ReadonlyArray<string> => {
  if (
    Node.isFunctionDeclaration(declaration) ||
    Node.isMethodDeclaration(declaration) ||
    Node.isClassDeclaration(declaration) ||
    Node.isInterfaceDeclaration(declaration) ||
    Node.isTypeAliasDeclaration(declaration)
  ) {
    return declaration.getTypeParameters().map((parameter) => {
      const constraint = parameter.getConstraint();
      if (constraint === undefined) {
        return parameter.getName();
      }

      return `${parameter.getName()} extends ${normalizeTypeText(constraint.getText())}`;
    });
  }

  return A.empty<string>();
};

const scopeValue = (declaration: Node): string | undefined => {
  if (Node.isMethodDeclaration(declaration)) {
    return declaration.getScope() ?? "public";
  }

  if (Node.isPropertyDeclaration(declaration)) {
    return declaration.getScope() ?? "public";
  }

  if (Node.isGetAccessorDeclaration(declaration)) {
    return declaration.getScope() ?? "public";
  }

  if (Node.isSetAccessorDeclaration(declaration)) {
    return declaration.getScope() ?? "public";
  }

  if (Node.isConstructorDeclaration(declaration)) {
    return declaration.getScope() ?? "public";
  }

  return undefined;
};

const returnTypeSummary = (target: TsMorphDeclarationTarget): string | undefined => {
  const declaration = target.declaration;

  if (
    Node.isFunctionDeclaration(declaration) ||
    Node.isMethodDeclaration(declaration) ||
    Node.isGetAccessorDeclaration(declaration)
  ) {
    return normalizeTypeText(declaration.getReturnType().getText(declaration));
  }

  if (Node.isVariableDeclaration(declaration)) {
    const initializer = declaration.getInitializer();
    if (initializer !== undefined && (Node.isArrowFunction(initializer) || Node.isFunctionExpression(initializer))) {
      return normalizeTypeText(initializer.getReturnType().getText(initializer));
    }

    return normalizeTypeText(declaration.getType().getText(declaration));
  }

  return undefined;
};

/**
 * Derive deterministic Layer-1 JSDoc tags from AST + type info.
 *
 * @param context - Runtime project context.
 * @param input - Deterministic derivation request.
 * @returns Deterministic tags.
 * @category codegraph-tsmorph
 * @since 0.0.0
 */
export const deriveDeterministicJSDocFromContext: (
  context: TsMorphProjectContext,
  input: TsMorphDeterministicJSDocRequest
) => Effect.Effect<ReadonlyArray<TsMorphDeterministicTag>, TsMorphSymbolNotFoundError, Path.Path> = Effect.fn(
  function* (context, input) {
    const target = yield* resolveDeclarationTarget(context, input.symbol);
    const declaration = target.declaration;
    const tags: Array<TsMorphDeterministicTag> = [];

    if (
      Node.isFunctionDeclaration(declaration) ||
      Node.isMethodDeclaration(declaration) ||
      Node.isConstructorDeclaration(declaration) ||
      Node.isGetAccessorDeclaration(declaration) ||
      Node.isSetAccessorDeclaration(declaration)
    ) {
      for (const parameter of parameterSummary(declaration)) {
        pushTag(tags, "@param", parameter);
      }
    }

    if (Node.isVariableDeclaration(declaration)) {
      const initializer = declaration.getInitializer();
      if (initializer !== undefined && (Node.isArrowFunction(initializer) || Node.isFunctionExpression(initializer))) {
        for (const parameter of parameterSummary(initializer)) {
          pushTag(tags, "@param", parameter);
        }
      }
    }

    const returnType = returnTypeSummary(target);
    if (returnType !== undefined && returnType !== "void") {
      pushTag(tags, "@returns", returnType);
    }

    for (const template of typeParameterSummary(declaration)) {
      pushTag(tags, "@template", template);
    }

    if ((Node.isFunctionDeclaration(declaration) || Node.isMethodDeclaration(declaration)) && declaration.isAsync()) {
      pushTag(tags, "@async");
    }

    if (Node.isVariableDeclaration(declaration)) {
      const initializer = declaration.getInitializer();
      if (
        initializer !== undefined &&
        (Node.isArrowFunction(initializer) || Node.isFunctionExpression(initializer)) &&
        initializer.isAsync()
      ) {
        pushTag(tags, "@async");
      }
    }

    if (Node.isClassDeclaration(declaration)) {
      const extension = declaration.getExtends();
      if (extension !== undefined) {
        pushTag(tags, "@extends", normalizeTypeText(extension.getText()));
      }

      for (const implemented of declaration.getImplements()) {
        pushTag(tags, "@implements", normalizeTypeText(implemented.getText()));
      }

      if (declaration.isAbstract()) {
        pushTag(tags, "@abstract");
      }
    }

    if (Node.isExportable(declaration) && declaration.isExported()) {
      pushTag(tags, "@export");
    }

    const access = scopeValue(declaration);
    if (access !== undefined) {
      pushTag(tags, "@access", access);
    }

    if (Node.isPropertyDeclaration(declaration) && declaration.isReadonly()) {
      pushTag(tags, "@readonly");
    }

    if (
      (Node.isMethodDeclaration(declaration) || Node.isPropertyDeclaration(declaration)) &&
      declaration.hasOverrideKeyword()
    ) {
      pushTag(tags, "@override");
    }

    if (
      (Node.isMethodDeclaration(declaration) ||
        Node.isPropertyDeclaration(declaration) ||
        Node.isGetAccessorDeclaration(declaration) ||
        Node.isSetAccessorDeclaration(declaration)) &&
      declaration.isStatic()
    ) {
      pushTag(tags, "@static");
    }

    const channels = decomposeEffectChannelsForTarget(target);
    for (const errorType of channels.errors) {
      pushTag(tags, "@throws", errorType, 0.95);
    }

    for (const requirementType of channels.requirements) {
      pushTag(tags, "@requires", requirementType, 0.95);
    }

    return tags.sort(compareTags);
  }
);

const allowedTags = HashSet.make(
  "@param",
  "@returns",
  "@template",
  "@async",
  "@implements",
  "@extends",
  "@export",
  "@access",
  "@readonly",
  "@abstract",
  "@override",
  "@static",
  "@throws",
  "@requires",
  "@description",
  "@example",
  "@signatureHash"
);

const repeatableTags = HashSet.make("@param", "@throws", "@requires", "@template");

const requiresValueTags = HashSet.make(
  "@param",
  "@returns",
  "@template",
  "@implements",
  "@extends",
  "@throws",
  "@requires",
  "@access",
  "@signatureHash"
);

const makeValidationIssue = (code: string, message: string, tag?: string): TsMorphJSDocValidationIssue =>
  new TsMorphJSDocValidationIssue({
    code,
    message,
    tag: tag === undefined ? O.none() : O.some(tag),
  });

/**
 * Validate user-provided JSDoc tags against deterministic constraints.
 *
 * @param context - Runtime project context.
 * @param input - Validation request.
 * @returns Validation report.
 * @category codegraph-tsmorph
 * @since 0.0.0
 */
export const validateJSDocInContext: (
  context: TsMorphProjectContext,
  input: TsMorphValidateJSDocRequest
) => Effect.Effect<TsMorphJSDocValidationReport, TsMorphSymbolNotFoundError | TsMorphValidationError, Path.Path> =
  Effect.fn(function* (context, input) {
    return yield* Effect.gen(function* () {
      const target = yield* resolveDeclarationTarget(context, input.symbol);
      const issues: Array<TsMorphJSDocValidationIssue> = [];

      const seenSingleTag = MutableHashSet.empty<string>();

      for (const entry of input.tags) {
        if (!/^@[a-zA-Z][\w-]*$/.test(entry.tag)) {
          issues.push(
            makeValidationIssue("invalid_tag_format", `Tag "${entry.tag}" is not a valid JSDoc tag.`, entry.tag)
          );
        }

        if (!HashSet.has(allowedTags, entry.tag)) {
          issues.push(
            makeValidationIssue("unsupported_tag", `Tag "${entry.tag}" is not supported by this service.`, entry.tag)
          );
        }

        if (HashSet.has(requiresValueTags, entry.tag) && optionValue(entry.value) === undefined) {
          issues.push(makeValidationIssue("missing_tag_value", `Tag "${entry.tag}" requires a value.`, entry.tag));
        }

        const singleKey = `${target.symbolId}|${entry.tag}`;
        if (!HashSet.has(repeatableTags, entry.tag)) {
          if (MutableHashSet.has(seenSingleTag, singleKey)) {
            issues.push(
              makeValidationIssue(
                "duplicate_singleton_tag",
                `Tag "${entry.tag}" cannot appear more than once.`,
                entry.tag
              )
            );
          }
          MutableHashSet.add(seenSingleTag, singleKey);
        }
      }

      const suggestions: Array<string> = [];

      if (issues.length === 0 && input.tags.length === 0) {
        suggestions.push("No tags provided. Consider using deriveDeterministicJSDoc for a deterministic baseline.");
      }

      return new TsMorphJSDocValidationReport({
        symbolId: target.symbolId,
        valid: issues.length === 0,
        issues,
        suggestions,
      });
    }).pipe(
      Effect.mapError((cause) => {
        if (cause instanceof TsMorphSymbolNotFoundError) {
          return cause;
        }

        return new TsMorphValidationError({
          message: "Failed to validate JSDoc payload.",
          cause,
        });
      })
    );
  });

const confidenceOfTag = (tag: TsMorphJSDocTagInput): number => optionValue(tag.confidence) ?? 0.5;

const compareWriteTags = (left: TsMorphJSDocTagInput, right: TsMorphJSDocTagInput): number => {
  const byTag = Str.localeCompare(right.tag)(left.tag);
  if (byTag !== 0) {
    return byTag;
  }

  const byConfidence = confidenceOfTag(right) - confidenceOfTag(left);
  if (byConfidence !== 0) {
    return byConfidence;
  }

  const leftValue = optionValue(left.value) ?? "";
  const rightValue = optionValue(right.value) ?? "";
  return Str.localeCompare(rightValue)(leftValue);
};

const resolveTagConflicts = (
  symbolId: string,
  tags: ReadonlyArray<TsMorphJSDocTagInput>
): readonly [ReadonlyArray<TsMorphJSDocTagInput>, ReadonlyArray<TsMorphJSDocWriteConflict>] => {
  const sorted = [...tags].sort(compareWriteTags);
  const retained: Array<TsMorphJSDocTagInput> = [];
  const conflicts: Array<TsMorphJSDocWriteConflict> = [];

  const singletonByTag = MutableHashMap.empty<string, TsMorphJSDocTagInput>();

  for (const tag of sorted) {
    const value = optionValue(tag.value);

    if (HashSet.has(repeatableTags, tag.tag)) {
      const duplicate = retained.some(
        (entry) => entry.tag === tag.tag && (optionValue(entry.value) ?? "") === (value ?? "")
      );
      if (!duplicate) {
        retained.push(tag);
      }
      continue;
    }

    const currentOption = MutableHashMap.get(singletonByTag, tag.tag);
    if (O.isNone(currentOption)) {
      MutableHashMap.set(singletonByTag, tag.tag, tag);
      retained.push(tag);
      continue;
    }
    const current = currentOption.value;

    const currentConfidence = confidenceOfTag(current);
    const candidateConfidence = confidenceOfTag(tag);
    const currentValue = optionValue(current.value) ?? "";
    const candidateValue = optionValue(tag.value) ?? "";

    const keepCurrent =
      currentConfidence > candidateConfidence ||
      (currentConfidence === candidateConfidence && Str.localeCompare(candidateValue)(currentValue) <= 0);

    if (!keepCurrent) {
      MutableHashMap.set(singletonByTag, tag.tag, tag);
      const index = retained.indexOf(current);
      if (index >= 0) {
        retained[index] = tag;
      }
    }

    const kept = keepCurrent ? current : tag;
    const dropped = keepCurrent ? tag : current;
    const keptValue = optionValue(kept.value);
    const droppedValue = optionValue(dropped.value);

    conflicts.push(
      new TsMorphJSDocWriteConflict({
        symbolId,
        tag: tag.tag,
        keptValue: keptValue === undefined ? O.none() : O.some(keptValue),
        droppedValue: droppedValue === undefined ? O.none() : O.some(droppedValue),
        reason: "Higher confidence singleton tag retained.",
      })
    );
  }

  return [
    retained.sort(compareWriteTags),
    conflicts.sort((left, right) =>
      Str.localeCompare(`${right.symbolId}|${right.tag}`)(`${left.symbolId}|${left.tag}`)
    ),
  ] as const;
};

/**
 * Plan deterministic JSDoc writes with conflict resolution.
 *
 * @param context - Runtime project context.
 * @param input - Plan request.
 * @returns Deterministic write operations + conflicts.
 * @category codegraph-tsmorph
 * @since 0.0.0
 */
export const planJSDocWritesInContext: (
  context: TsMorphProjectContext,
  input: TsMorphPlanJSDocWritesRequest
) => Effect.Effect<
  Readonly<{
    operations: ReadonlyArray<TsMorphJSDocWriteOperation>;
    conflicts: ReadonlyArray<TsMorphJSDocWriteConflict>;
  }>,
  TsMorphValidationError,
  Path.Path
> = Effect.fn(function* (context, input) {
  const bySymbol = MutableHashMap.empty<string, { filePath: string; tags: Array<TsMorphJSDocTagInput> }>();

  for (const operation of input.operations) {
    const target = yield* resolveDeclarationTarget(context, {
      symbolId: operation.symbolId,
      filePath: O.some(operation.filePath),
      symbolName: O.none(),
    }).pipe(
      Effect.mapError(
        () =>
          new TsMorphValidationError({
            message: `Operation references unresolved symbol: ${operation.symbolId}`,
          })
      )
    );

    const current = pipe(
      MutableHashMap.get(bySymbol, target.symbolId),
      O.getOrElse((): { filePath: string; tags: Array<TsMorphJSDocTagInput> } => ({
        filePath: target.filePath,
        tags: [],
      }))
    );
    current.filePath = target.filePath;
    current.tags.push(...operation.tags);
    MutableHashMap.set(bySymbol, target.symbolId, current);
  }

  const operations: Array<TsMorphJSDocWriteOperation> = [];
  const conflicts: Array<TsMorphJSDocWriteConflict> = [];

  const orderedSymbols = pipe(Array.from(MutableHashMap.keys(bySymbol)), A.sort(Order.String));
  for (const symbolId of orderedSymbols) {
    const entry = MutableHashMap.get(bySymbol, symbolId);
    if (O.isNone(entry)) {
      continue;
    }

    const [resolvedTags, resolvedConflicts] = resolveTagConflicts(symbolId, entry.value.tags);
    conflicts.push(...resolvedConflicts);

    operations.push(
      new TsMorphJSDocWriteOperation({
        symbolId,
        filePath: entry.value.filePath,
        tags: resolvedTags,
      })
    );
  }

  return {
    operations,
    conflicts: conflicts.sort((left, right) =>
      Str.localeCompare(`${right.symbolId}|${right.tag}`)(`${left.symbolId}|${left.tag}`)
    ),
  };
});

const signatureHash = (target: TsMorphDeclarationTarget): string =>
  createHash("sha256").update(buildDeclarationSignature(target), "utf8").digest("hex");

const renderJSDocBlock = (tags: ReadonlyArray<TsMorphJSDocTagInput>): string =>
  tags
    .map((tag) => {
      const value = optionValue(tag.value);
      const normalizedValue = value === undefined ? undefined : Str.trim(value);
      return normalizedValue === undefined || Str.isEmpty(normalizedValue) ? tag.tag : `${tag.tag} ${normalizedValue}`;
    })
    .join("\n");

type JSDocWritableNode = Node & JSDocableNode;

const resolveJSDocWritableNode = (target: TsMorphDeclarationTarget): O.Option<JSDocWritableNode> => {
  const declaration = target.declaration;
  if (Node.isJSDocable(declaration)) {
    return O.some(declaration);
  }

  if (Node.isVariableDeclaration(declaration)) {
    const variableStatement = declaration.getVariableStatement();
    if (variableStatement !== undefined && Node.isJSDocable(variableStatement)) {
      return O.some(variableStatement);
    }
  }

  return O.none();
};

const readExistingSignatureHash = (target: TsMorphDeclarationTarget): O.Option<string> => {
  const writableNode = resolveJSDocWritableNode(target);
  if (O.isNone(writableNode)) {
    return O.none();
  }

  for (const jsDoc of writableNode.value.getJsDocs()) {
    const match = /@signatureHash\s+([a-f0-9]{64})/i.exec(jsDoc.getInnerText());
    if (match?.[1] !== undefined) {
      return O.some(match[1]);
    }
  }

  return O.none();
};

/**
 * Apply a JSDoc write plan to source files.
 *
 * @param context - Runtime project context.
 * @param plan - Deterministic write plan.
 * @returns Write receipt.
 * @category codegraph-tsmorph
 * @since 0.0.0
 */
export const applyJSDocWritesInContext: (
  context: TsMorphProjectContext,
  plan: TsMorphJSDocWritePlan
) => Effect.Effect<TsMorphJSDocWriteReceipt, TsMorphWriteApplyError | TsMorphWriteConflictError, Path.Path> = Effect.fn(
  function* (context, plan) {
    const snapshots = MutableHashMap.empty<string, string>();
    const touched = MutableHashSet.empty<string>();

    const rollback = Effect.sync(() => {
      for (const [filePath, originalText] of snapshots) {
        const sourceFile = context.project.getSourceFile(filePath);
        if (sourceFile !== undefined) {
          sourceFile.replaceWithText(originalText);
          sourceFile.saveSync();
        }
      }
    }).pipe(Effect.catchDefect(() => Effect.void));

    const apply = Effect.gen(function* () {
      for (const operation of plan.operations) {
        const target = yield* resolveDeclarationTarget(context, {
          symbolId: operation.symbolId,
          filePath: O.some(operation.filePath),
          symbolName: O.none(),
        }).pipe(
          Effect.mapError(
            () =>
              new TsMorphWriteConflictError({
                message: `Plan operation references unresolved symbol: ${operation.symbolId}`,
                symbolId: operation.symbolId,
                tag: "@symbol",
              })
          )
        );

        const writableNode = resolveJSDocWritableNode(target);
        if (O.isNone(writableNode)) {
          return yield* new TsMorphWriteConflictError({
            message: `Symbol ${operation.symbolId} is not JSDoc-writable.`,
            symbolId: operation.symbolId,
            tag: "@jsdoc",
          });
        }

        const sourceFile = target.declaration.getSourceFile();
        const sourcePath = sourceFile.getFilePath();

        if (!MutableHashMap.has(snapshots, sourcePath)) {
          MutableHashMap.set(snapshots, sourcePath, sourceFile.getFullText());
        }

        MutableHashSet.add(touched, target.filePath);

        for (const existingDoc of writableNode.value.getJsDocs()) {
          existingDoc.remove();
        }

        const hashTag = new TsMorphJSDocTagInput({
          tag: "@signatureHash",
          value: O.some(signatureHash(target)),
          confidence: O.some(1),
        });

        const hasHashTag = operation.tags.some((tag) => tag.tag === "@signatureHash");
        const finalTags = hasHashTag ? operation.tags : [...operation.tags, hashTag];

        writableNode.value.addJsDoc(renderJSDocBlock(finalTags));
      }

      for (const filePath of MutableHashMap.keys(snapshots)) {
        const sourceFile = context.project.getSourceFile(filePath);
        sourceFile?.saveSync();
      }

      return new TsMorphJSDocWriteReceipt({
        appliedOperations: decodeNonNegativeInt(plan.operations.length),
        touchedFiles: pipe(touched, A.fromIterable, A.sort(Order.String)),
        conflicts: plan.conflicts,
      });
    });

    return yield* apply.pipe(
      Effect.catchTag("TsMorphWriteConflictError", (error) => rollback.pipe(Effect.andThen(Effect.fail(error)))),
      Effect.catch((cause) =>
        rollback.pipe(
          Effect.andThen(
            Effect.fail(
              new TsMorphWriteApplyError({
                message: "Failed applying JSDoc write plan.",
                cause,
              })
            )
          )
        )
      ),
      Effect.catchDefect((cause) =>
        rollback.pipe(
          Effect.andThen(
            Effect.fail(
              new TsMorphWriteApplyError({
                message: "Failed applying JSDoc write plan.",
                cause,
              })
            )
          )
        )
      )
    );
  }
);

/**
 * Check signature drift for a symbol set.
 *
 * @param context - Runtime project context.
 * @param input - Drift request.
 * @returns Drift report.
 * @category codegraph-tsmorph
 * @since 0.0.0
 */
export const checkJSDocDriftInContext: (
  context: TsMorphProjectContext,
  input: TsMorphCheckDriftRequest
) => Effect.Effect<TsMorphJSDocDriftReport, TsMorphValidationError, Path.Path> = Effect.fn(function* (context, input) {
  const requestedSymbolIds = optionValue(input.symbolIds);

  const symbols =
    requestedSymbolIds ??
    pipe(
      yield* collectProjectDeclarationTargets(context),
      A.map((target) => target.symbolId),
      A.sort(Order.String)
    );

  const entries: Array<TsMorphJSDocDriftEntry> = [];

  for (const symbolId of symbols) {
    const target = yield* resolveDeclarationTarget(context, {
      symbolId,
      filePath: O.none(),
      symbolName: O.none(),
    }).pipe(
      Effect.mapError(
        () =>
          new TsMorphValidationError({
            message: `Could not resolve symbol for drift check: ${symbolId}`,
          })
      )
    );

    const currentHash = signatureHash(target);
    const previousHash = readExistingSignatureHash(target);
    const driftDetected = O.isSome(previousHash) && previousHash.value !== currentHash;

    entries.push(
      new TsMorphJSDocDriftEntry({
        symbolId,
        driftDetected,
        previousSignatureHash: O.isSome(previousHash) ? O.some(previousHash.value) : O.none(),
        currentSignatureHash: currentHash,
      })
    );
  }

  const sortedEntries = entries.sort((left, right) => Str.localeCompare(right.symbolId)(left.symbolId));

  return new TsMorphJSDocDriftReport({
    entries: sortedEntries,
    checkedSymbols: decodeNonNegativeInt(sortedEntries.length),
    driftedSymbols: decodeNonNegativeInt(sortedEntries.filter((entry) => entry.driftDetected).length),
  });
});
