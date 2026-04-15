/**
 * Repo-local no-native-runtime parity checker.
 *
 * @module
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import { getAllowlistDiagnostics, isViolationAllowlisted } from "@beep/repo-configs/eslint/EffectLawsAllowlist";
import {
  isNoNativeRuntimeErrorFile,
  isNoNativeRuntimeExtraCheckHotspot,
} from "@beep/repo-configs/eslint/NoNativeRuntimeHotspots";
import { TaggedErrorClass } from "@beep/schema";
import { Effect, HashSet, Inspectable, Order, Path, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import {
  type BinaryExpression,
  type CallExpression,
  type ImportDeclaration,
  type NewExpression,
  Node,
  Project,
  type SourceFile,
  SyntaxKind,
} from "ts-morph";
import { isExcludedTypeScriptSourcePath, toPosixPath } from "../Shared/TypeScriptSourceExclusions.ts";

const $I = $RepoCliId.create("commands/Laws/NoNativeRuntime");

const INCLUDED_GLOBS = [
  "apps/**/*.{ts,tsx}",
  "packages/**/*.{ts,tsx}",
  "tooling/**/*.{ts,tsx}",
  "infra/**/*.ts",
  ".claude/hooks/**/*.ts",
] as const;
const ALLOWLIST_PATH = "standards/effect-laws.allowlist.jsonc";
const NO_NATIVE_RUNTIME_RULE_ID = "beep-laws/no-native-runtime";

const OBJECT_METHODS = HashSet.fromIterable([
  "keys",
  "values",
  "entries",
  "fromEntries",
  "assign",
  "hasOwn",
  "freeze",
  "seal",
  "create",
]);
const DATE_METHODS = HashSet.fromIterable(["now", "parse", "UTC"]);
const ARRAY_STATIC_METHODS = HashSet.fromIterable(["from", "isArray", "of"]);
const MAP_SET_CTORS = HashSet.fromIterable(["Map", "Set", "WeakMap", "WeakSet"]);
const NATIVE_ERROR_CTORS = HashSet.fromIterable([
  "AggregateError",
  "Error",
  "EvalError",
  "RangeError",
  "ReferenceError",
  "SyntaxError",
  "TypeError",
  "URIError",
]);
const NODE_RUNTIME_IMPORTS = HashSet.fromIterable(["node:fs", "node:path", "node:child_process"]);
const STRING_METHODS = HashSet.fromIterable(["split", "trim", "startsWith", "endsWith"]);
const EQUALITY_OPERATORS = HashSet.fromIterable(["===", "==", "!==", "!="]);
const TYPEOF_RUNTIME_LITERALS = HashSet.fromIterable([
  "string",
  "number",
  "boolean",
  "object",
  "function",
  "undefined",
  "symbol",
  "bigint",
]);

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

type MemberCall = readonly [string, string];

type ViolationData = Readonly<Record<string, string>>;

type NativeRuntimeViolation = Readonly<{
  kind: string;
  messageId: string;
  node: import("ts-morph").Node;
  data?: ViolationData;
}>;

type ScannedSourceFile = readonly [string, SourceFile];

const byScannedSourceFilePathAscending: Order.Order<ScannedSourceFile> = Order.mapInput(
  Order.String,
  ([relativeFilePath]) => relativeFilePath
);

const makeViolation = (
  node: import("ts-morph").Node,
  kind: string,
  messageId: string,
  data?: ViolationData
): NativeRuntimeViolation => (data === undefined ? { kind, messageId, node } : { kind, messageId, node, data });

const getMemberCall = (node: import("ts-morph").Node): O.Option<MemberCall> => {
  if (Node.isPropertyAccessExpression(node)) {
    const objectNode = node.getExpression();
    if (!Node.isIdentifier(objectNode)) {
      return O.none();
    }
    return O.some<MemberCall>([objectNode.getText(), node.getName()]);
  }

  if (Node.isElementAccessExpression(node)) {
    const objectNode = node.getExpression();
    const argumentNode = node.getArgumentExpression();

    if (!Node.isIdentifier(objectNode) || argumentNode === undefined || !Node.isStringLiteral(argumentNode)) {
      return O.none();
    }

    return O.some<MemberCall>([objectNode.getText(), argumentNode.getLiteralValue()]);
  }

  return O.none();
};

const getRuntimeTypeLiteral = (node: import("ts-morph").Node): O.Option<string> => {
  if (!Node.isStringLiteral(node)) {
    return O.none();
  }

  const value = node.getLiteralValue();
  return HashSet.has(TYPEOF_RUNTIME_LITERALS, value) ? O.some(value) : O.none();
};

const detectImportViolation = (node: ImportDeclaration, inHotspotScope: boolean): O.Option<NativeRuntimeViolation> => {
  if (!inHotspotScope) {
    return O.none();
  }

  const moduleName = node.getModuleSpecifierValue();
  return HashSet.has(NODE_RUNTIME_IMPORTS, moduleName)
    ? O.some(makeViolation(node, "node-runtime-import", "nodeRuntimeImport", { moduleName }))
    : O.none();
};

const detectNewExpressionViolation = (node: NewExpression): O.Option<NativeRuntimeViolation> => {
  const expression = node.getExpression();

  if (Node.isIdentifier(expression)) {
    const constructorName = expression.getText();

    if (HashSet.has(MAP_SET_CTORS, constructorName)) {
      return O.some(makeViolation(node, "new-map-set", "mapSetCtor", { ctor: constructorName }));
    }

    if (constructorName === "Date") {
      return O.some(makeViolation(node, "new-date", "newDate"));
    }

    if (HashSet.has(NATIVE_ERROR_CTORS, constructorName)) {
      return O.some(makeViolation(node, "native-error", "nativeError", { ctor: constructorName }));
    }

    return O.none();
  }

  return pipe(
    getMemberCall(expression),
    O.filter(
      ([objectName, propertyName]) => objectName === "globalThis" && HashSet.has(NATIVE_ERROR_CTORS, propertyName)
    ),
    O.map(([, ctor]) => makeViolation(node, "native-error", "nativeError", { ctor }))
  );
};

const detectCallExpressionViolation = (
  node: CallExpression,
  inHotspotScope: boolean
): O.Option<NativeRuntimeViolation> => {
  const expression = node.getExpression();

  if (Node.isIdentifier(expression)) {
    const calleeName = expression.getText();

    if (HashSet.has(NATIVE_ERROR_CTORS, calleeName)) {
      return O.some(makeViolation(node, "native-error", "nativeError", { ctor: calleeName }));
    }

    if (inHotspotScope && calleeName === "fetch") {
      return O.some(makeViolation(node, "native-fetch", "nativeFetch"));
    }

    return O.none();
  }

  return pipe(
    getMemberCall(expression),
    O.flatMap(([objectName, propertyName]) => {
      if (objectName === "globalThis" && HashSet.has(NATIVE_ERROR_CTORS, propertyName)) {
        return O.some(makeViolation(node, "native-error", "nativeError", { ctor: propertyName }));
      }

      if (inHotspotScope && objectName === "globalThis" && propertyName === "fetch") {
        return O.some(makeViolation(node, "native-fetch", "nativeFetch"));
      }

      if (objectName === "Object" && HashSet.has(OBJECT_METHODS, propertyName)) {
        return O.some(makeViolation(node, "object-method", "objectMethod", { method: propertyName }));
      }

      if (objectName === "Date" && HashSet.has(DATE_METHODS, propertyName)) {
        return O.some(makeViolation(node, "date-static", "dateStatic", { method: propertyName }));
      }

      if (objectName === "Array" && HashSet.has(ARRAY_STATIC_METHODS, propertyName)) {
        return O.some(makeViolation(node, "array-static", "arrayStatic", { method: propertyName }));
      }

      if (inHotspotScope && propertyName === "sort" && objectName !== "A") {
        return O.some(makeViolation(node, "native-sort", "nativeSort"));
      }

      if (inHotspotScope && HashSet.has(STRING_METHODS, propertyName) && objectName !== "Str") {
        return O.some(makeViolation(node, "string-method", "stringMethod", { method: propertyName }));
      }

      return O.none();
    })
  );
};

const detectBinaryExpressionViolation = (node: BinaryExpression): O.Option<NativeRuntimeViolation> => {
  const operator = node.getOperatorToken().getText();
  if (!HashSet.has(EQUALITY_OPERATORS, operator)) {
    return O.none();
  }

  const leftNode = node.getLeft();
  const rightNode = node.getRight();
  const leftIsTypeof = leftNode.getKind() === SyntaxKind.TypeOfExpression;
  const rightIsTypeof = rightNode.getKind() === SyntaxKind.TypeOfExpression;
  const leftLiteral = getRuntimeTypeLiteral(leftNode);
  const rightLiteral = getRuntimeTypeLiteral(rightNode);

  return (leftIsTypeof && O.isSome(rightLiteral)) || (rightIsTypeof && O.isSome(leftLiteral))
    ? O.some(makeViolation(node, "typeof-runtime", "typeofRuntime"))
    : O.none();
};

const formatViolationMessage = (violation: NativeRuntimeViolation): string => {
  const data = violation.data;

  if (violation.messageId === "allowlistInvalid") {
    return `Effect laws allowlist is invalid: ${data?.detail ?? ""}`;
  }

  if (violation.messageId === "objectMethod") {
    return `Avoid Object.${data?.method ?? ""} in domain logic. Use Effect modules or add an allowlist entry.`;
  }

  if (violation.messageId === "mapSetCtor") {
    return `Avoid new ${data?.ctor ?? ""} in domain logic. Use Effect HashMap/HashSet variants or add an allowlist entry.`;
  }

  if (violation.messageId === "newDate") {
    return "Avoid new Date() in domain logic. Use Effect DateTime/Clock or add an allowlist entry.";
  }

  if (violation.messageId === "nativeError") {
    return `Avoid native ${data?.ctor ?? ""} in production code. Use TaggedErrorClass or add an allowlist entry.`;
  }

  if (violation.messageId === "dateStatic") {
    return `Avoid Date.${data?.method ?? ""} in domain logic. Use Effect DateTime/Clock or add an allowlist entry.`;
  }

  if (violation.messageId === "arrayStatic") {
    return `Avoid Array.${data?.method ?? ""} in domain logic. Use effect/Array helpers or add an allowlist entry.`;
  }

  if (violation.messageId === "typeofRuntime") {
    return "Avoid runtime typeof checks. Use effect/Predicate guards (for example P.isString).";
  }

  if (violation.messageId === "nodeRuntimeImport") {
    return `Avoid ${data?.moduleName ?? ""} runtime imports in hotspot runtime code. Use Effect FileSystem/Path/process services.`;
  }

  if (violation.messageId === "nativeFetch") {
    return "Avoid native fetch in hotspot runtime code. Use effect/unstable/http HttpClient and runtime client layers.";
  }

  if (violation.messageId === "nativeSort") {
    return "Avoid native .sort in hotspot runtime code. Use A.sort with an explicit Order.";
  }

  return `Avoid native string method .${data?.method ?? ""} in hotspot runtime code. Prefer effect/String and shared schema transforms.`;
};

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
  const cwd = process.cwd();
  const allowlistDiagnostics = getAllowlistDiagnostics();

  const isExcludedFile = (filePath: string): boolean => {
    const normalized = toPosixPath(filePath);
    if (A.some(options.excludePaths, (excludePath) => normalized === toPosixPath(excludePath))) {
      return true;
    }
    return isExcludedTypeScriptSourcePath(normalized);
  };

  const project = new Project({
    tsConfigFilePath: path.join(cwd, "tsconfig.json"),
    skipAddingFilesFromTsConfig: true,
  });

  for (const pattern of INCLUDED_GLOBS) {
    project.addSourceFilesAtPaths(pattern);
  }

  let sourceFiles = A.empty<ScannedSourceFile>();

  for (const sourceFile of project.getSourceFiles()) {
    const relativeFilePath = toPosixPath(path.relative(cwd, sourceFile.getFilePath()));

    if (isExcludedFile(relativeFilePath)) {
      continue;
    }

    sourceFiles = A.append(sourceFiles, [relativeFilePath, sourceFile]);
  }

  sourceFiles = A.sort(sourceFiles, byScannedSourceFilePathAscending);

  let warningCount = 0;
  let errorCount = 0;
  let affectedFiles = A.empty<string>();
  let diagnostics = A.empty<(typeof NoNativeRuntimeDiagnostic)["Type"]>();

  for (const detail of allowlistDiagnostics) {
    errorCount += 1;
    diagnostics = A.append(
      diagnostics,
      new NoNativeRuntimeDiagnostic({
        severity: "error",
        file: ALLOWLIST_PATH,
        line: 1,
        column: 1,
        message: `Effect laws allowlist is invalid: ${detail}`,
        messageId: "allowlistInvalid",
      })
    );
  }

  if (A.length(allowlistDiagnostics) > 0) {
    affectedFiles = A.append(affectedFiles, ALLOWLIST_PATH);
  }

  const appendViolation = (
    sourceFile: SourceFile,
    relativeFilePath: string,
    baseSeverity: "warn" | "error",
    violation: NativeRuntimeViolation
  ): void => {
    const isAllowlisted = isViolationAllowlisted({
      ruleId: NO_NATIVE_RUNTIME_RULE_ID,
      filePath: relativeFilePath,
      kind: violation.kind,
    });

    if (isAllowlisted) {
      return;
    }

    const { line, column } = sourceFile.getLineAndColumnAtPos(violation.node.getStart());
    const severity = baseSeverity;

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
        line,
        column,
        message: formatViolationMessage(violation),
        messageId: violation.messageId,
      })
    );
  };

  for (const [relativeFilePath, sourceFile] of sourceFiles) {
    const inHotspotScope = isNoNativeRuntimeExtraCheckHotspot(relativeFilePath);
    const baseSeverity = isNoNativeRuntimeErrorFile(relativeFilePath) ? "error" : "warn";
    const diagnosticsBeforeFile = A.length(diagnostics);

    const scanSourceFile = Effect.try({
      try: () => {
        sourceFile.forEachDescendant((node: import("ts-morph").Node) => {
          const violation = Node.isImportDeclaration(node)
            ? detectImportViolation(node, inHotspotScope)
            : Node.isNewExpression(node)
              ? detectNewExpressionViolation(node)
              : Node.isCallExpression(node)
                ? detectCallExpressionViolation(node, inHotspotScope)
                : Node.isBinaryExpression(node)
                  ? detectBinaryExpressionViolation(node)
                  : O.none<NativeRuntimeViolation>();

          if (O.isSome(violation)) {
            appendViolation(sourceFile, relativeFilePath, baseSeverity, violation.value);
          }
        });
      },
      catch: (cause) =>
        new NoNativeRuntimeRulesExecutionError({
          message: `Failed to evaluate ${relativeFilePath}: ${Inspectable.toStringUnknown(cause, 0)}`,
        }),
    });

    yield* scanSourceFile;

    if (A.length(diagnostics) > diagnosticsBeforeFile) {
      affectedFiles = A.append(affectedFiles, relativeFilePath);
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
