/**
 * Schema-first inventory and enforcement command.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import { isExcludedTypeScriptSourcePath, toPosixPath } from "@beep/repo-utils/schemas/TypeScriptSourceExclusions";
import { resolveWorkspaceDirs } from "@beep/repo-utils/Workspaces";
import { LiteralKit } from "@beep/schema";
import { A, Str, thunkEmptyStr } from "@beep/utils";
import { Console, DateTime, Effect, FileSystem, flow, HashMap, Order, Path, pipe, SchemaGetter } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { Command, Flag } from "effect/unstable/cli";
import { parse } from "jsonc-parser";
import { Node, Project, SyntaxKind } from "ts-morph";
import { failWithReportedExit } from "../../internal/cli/ExitCodeError.js";
import type { TypeElementTypes } from "ts-morph";

const $I = $RepoCliId.create("commands/Lint/SchemaFirst");
const INVENTORY_PATH = "standards/schema-first.inventory.jsonc";
const INCLUDED_GLOBS = ["apps/**/*.{ts,tsx}", "packages/**/*.{ts,tsx}", "infra/**/*.ts"] as const;
const SOURCE_FILE_GLOBS = [...INCLUDED_GLOBS, "!**/docs/**"] as const;
const ENFORCED_ROOTS = [
  "packages/tooling/tool/cli/src",
  "packages/tooling/library/repo-utils/src/FsUtils.ts",
  "packages/tooling/library/repo-utils/src/UniqueDeps.ts",
  "packages/tooling/library/repo-utils/src/schemas/WorkspaceDeps.ts",
] as const;
const IDENTIFIER_PROPERTY_PATTERN = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const FUNCTION_LIKE_TEXT_PATTERN = /=>|\bEffect\.Effect</;
const NON_SCHEMA_SIGNAL_PATTERN =
  /\bEffect\.Success<|\bLayer\.Layer<|\bAbortSignal\b|\bAbortController\b|\bUint8Array\b|\bEventJournal\.Entry\b|\bZod\b|\bz\.|\bAtom\.|\bNodeJS\.(?:Readable|Writable)Stream\b|\bStartedTestContainer\b|\bpulumi\.Input<|\bWinkMethods\b|\b(?:Any)?OperationResult\b/;
const SCHEMA_FIELDS_CALL_PATTERN = /\bS\.(?:Class|Struct|TaggedClass|TaggedStruct|ErrorClass|TaggedErrorClass)\b/;
const SCHEMA_CLASS_FIELDS_CALL_PATTERN = /\bS\.(?:Class|TaggedClass|ErrorClass|TaggedErrorClass)\b/;
const NUMERIC_DOMAIN_TOKENS = ["timeout", "count", "size", "rate", "limit", "ms", "seconds"] as const;
const STATIC_API_SCHEMA_SIGNAL_PATTERN = /\b(?:S\.(?:TaggedUnion|toTaggedUnion)|LiteralKit|MappedLiteralKit)\s*\(/;
const DEFAULTS_SCHEMA_SIGNAL_PATTERN =
  /\b(?:S\.(?:Class|Struct|TaggedClass|TaggedStruct|ErrorClass|TaggedErrorClass)|withConstructorDefault|withDecodingDefault|SchemaUtils\.withKeyDefaults)\b/;
const EQUIVALENCE_SCHEMA_SIGNAL_PATTERN =
  /\b(?:S\.(?:Class|Struct|TaggedClass|TaggedStruct|ErrorClass|TaggedErrorClass|toEquivalence|overrideToEquivalence)|SchemaUtils\.toEquivalence)\b/;
const SCHEMA_DERIVED_EQUIVALENCE_PATTERN =
  /\b(?:S|Schema)\.(?:toEquivalence|overrideToEquivalence)\b|SchemaUtils\.toEquivalence\b/;
const MANUAL_EQUALITY_COMPARISON_PATTERN = /===|!==/;
const BROAD_EMAIL_SCHEMA_PATTERN = /^S\.optionalKey\(S\.String(?:\)|,)|^S\.String(?:$|\.pipe\()/;
const DEFAULT_PARAMETER_NAMES = ["options", "params", "config", "request", "args", "input"] as const;
const SCHEMA_CODEC_HELPERS = [
  // Effect-returning codecs.
  "decodeUnknownEffect",
  "decodeEffect",
  "encodeUnknownEffect",
  "encodeEffect",
  // Result-returning codecs.
  "decodeUnknownResult",
  "decodeResult",
  "encodeUnknownResult",
  "encodeResult",
  // Option-returning codecs.
  "decodeUnknownOption",
  "decodeOption",
  "encodeUnknownOption",
  "encodeOption",
  // Exit-returning codecs.
  "decodeUnknownExit",
  "decodeExit",
  "encodeUnknownExit",
  "encodeExit",
  // Promise-returning codecs.
  "decodeUnknownPromise",
  "decodePromise",
  "encodeUnknownPromise",
  "encodePromise",
  // Synchronous throwing codecs (most common in unit tests).
  "decodeUnknownSync",
  "decodeSync",
  "encodeUnknownSync",
  "encodeSync",
] as const;
// Schema-derived property coverage requires deriving the arbitrary from the
// schema itself, either directly (S.toArbitrary / Schema.toArbitrary, including
// toArbitraryLazy) or through repo-owned helpers that perform that derivation.
// A bare fc.property/assert/check over a hand-rolled arbitrary is not
// schema-derived coverage and must not suppress the advisory.
const SCHEMA_ARBITRARY_PROPERTY_PATTERN = /\b(?:(?:S|Schema)\.toArbitrary|assertSchemaArbitraryDecodesToSelf)\b/;
const TEST_FILE_PATTERN = /(?:\/test\/|\/tests\/|\.test\.tsx?$|\.spec\.tsx?$)/;
const TEST_FILE_EXCLUDED_SEGMENTS = [
  "/.repos/",
  "/node_modules/",
  "/dist/",
  "/build/",
  "/coverage/",
  "/docs/",
  "/_generated/",
  "/generated/",
  "/dtslint/",
] as const;
const SCHEMA_DISCRIMINATOR_TOKENS = [
  "_tag",
  "tag",
  "kind",
  "status",
  "type",
  "mode",
  "reason",
  "state",
  "category",
  "profile",
  "family",
  "subtype",
] as const;

const stringifyJsonPretty = SchemaGetter.stringifyJson({ space: 2 });
const stringifyJsonLine = SchemaGetter.stringifyJson({ space: 0 });

const SchemaFirstPolicyRuleId = LiteralKit([
  "schema-first-inventory",
  "literal-kit-const-assertion",
  "SFV4-defaults",
  "SFV4-static-api",
  "SFV4-precision-audit",
  "SFV4-arbitrary-tests",
  "SFV4-equivalence",
  "SFV4-numeric-domain",
  "SFV4-boundary-codec",
]).pipe(
  $I.annoteSchema("SchemaFirstPolicyRuleId", {
    description: "Stable schema-first policy rule identifiers emitted for lint and Yeet issue routing.",
  })
);

const SchemaFirstPolicySeverity = LiteralKit(["warning", "error"]).pipe(
  $I.annoteSchema("SchemaFirstPolicySeverity", {
    description: "Severity levels emitted by schema-first policy lint findings.",
  })
);

const SchemaFirstEntryKind = LiteralKit([
  "exported-interface",
  "exported-type-literal",
  "object-struct-schema",
  "schema-policy-advisory",
]).pipe(
  $I.annoteSchema("SchemaFirstEntryKind", {
    description: "Kinds of schema-first inventory findings.",
  })
);

const SchemaFirstEntryStatus = LiteralKit(["candidate", "exception", "advisory"]).pipe(
  $I.annoteSchema("SchemaFirstEntryStatus", {
    description: "Tracked status for a schema-first inventory finding.",
  })
);

class SchemaFirstInventoryEntry extends S.Class<SchemaFirstInventoryEntry>($I`SchemaFirstInventoryEntry`)(
  {
    file: S.String,
    symbol: S.String,
    kind: SchemaFirstEntryKind,
    status: SchemaFirstEntryStatus,
    ruleId: S.optionalKey(SchemaFirstPolicyRuleId),
    line: S.optionalKey(S.Finite),
    owner: S.String,
    reason: S.String,
  },
  $I.annote("SchemaFirstInventoryEntry", {
    description: "Single tracked schema-first finding for a source file symbol.",
  })
) {}

class SchemaFirstPolicyFinding extends S.Class<SchemaFirstPolicyFinding>($I`SchemaFirstPolicyFinding`)(
  {
    category: S.Literal("schema-first-policy"),
    ruleId: SchemaFirstPolicyRuleId,
    severity: SchemaFirstPolicySeverity,
    file: S.String,
    line: S.optionalKey(S.Finite),
    symbol: S.optionalKey(S.String),
    message: S.String,
    remediation: S.String,
  },
  $I.annote("SchemaFirstPolicyFinding", {
    description: "Machine-readable schema-first lint finding consumed by Yeet quality issue packets.",
  })
) {}

/**
 * Namespace for {@link SchemaFirstInventoryEntry} companion types.
 *
 * @example
 * ```ts
 * console.log("SchemaFirstInventoryEntry")
 * ```
 * @category models
 * @since 0.0.0
 */
export declare namespace SchemaFirstInventoryEntry {
  /**
   * Encoded representation of {@link SchemaFirstInventoryEntry}.
   *
   * @example
   * ```ts
   * console.log("Encoded")
   * ```
   * @category models
   * @since 0.0.0
   */
  export type Encoded = typeof SchemaFirstInventoryEntry.Encoded;
}

class SchemaFirstInventoryDocument extends S.Class<SchemaFirstInventoryDocument>($I`SchemaFirstInventoryDocument`)(
  {
    version: S.Literal(1),
    generatedOn: S.String,
    scope: S.Array(S.String).pipe(
      S.withConstructorDefault(Effect.succeed(A.fromIterable(INCLUDED_GLOBS))),
      S.withDecodingDefault(Effect.succeed(A.fromIterable(INCLUDED_GLOBS)))
    ),
    enforcedRoots: S.Array(S.String).pipe(
      S.withConstructorDefault(Effect.succeed(A.fromIterable(ENFORCED_ROOTS))),
      S.withDecodingDefault(Effect.succeed(A.fromIterable(ENFORCED_ROOTS)))
    ),
    entries: S.Array(SchemaFirstInventoryEntry).pipe(
      S.withConstructorDefault(Effect.succeed(A.empty<SchemaFirstInventoryEntry>())),
      S.withDecodingDefault(Effect.succeed(A.empty<SchemaFirstInventoryEntry.Encoded>()))
    ),
  },
  $I.annote("SchemaFirstInventoryDocument", {
    description: "Committed schema-first inventory baseline for repo-wide lint enforcement.",
  })
) {}

class SchemaFirstLintOptions extends S.Class<SchemaFirstLintOptions>($I`SchemaFirstLintOptions`)(
  {
    write: S.Boolean.pipe(
      S.withConstructorDefault(Effect.succeed(false)),
      S.withDecodingDefault(Effect.succeed(false))
    ),
  },
  $I.annote("SchemaFirstLintOptions", {
    description: "CLI options for schema-first inventory verification.",
  })
) {}

class SchemaFirstLintSummary extends S.Class<SchemaFirstLintSummary>($I`SchemaFirstLintSummary`)(
  {
    liveEntries: S.Finite,
    trackedEntries: S.Finite,
    missingEntries: S.Finite,
    staleEntries: S.Finite,
    enforcedCandidates: S.Finite,
    literalKitConstAssertions: S.Finite,
    boundaryCodecAdvisories: S.Finite,
    defaultsAdvisories: S.Finite,
    staticApiAdvisories: S.Finite,
    equivalenceAdvisories: S.Finite,
    precisionAuditAdvisories: S.Finite,
    arbitraryTestsAdvisories: S.Finite,
    numericDomainAdvisories: S.Finite,
    wroteInventory: S.Boolean,
  },
  $I.annote("SchemaFirstLintSummary", {
    description: "Summary of schema-first inventory verification results.",
  })
) {}

class LiteralKitConstAssertionViolation extends S.Class<LiteralKitConstAssertionViolation>(
  $I`LiteralKitConstAssertionViolation`
)(
  {
    file: S.String,
    line: S.Finite,
    argument: S.Finite,
  },
  $I.annote("LiteralKitConstAssertionViolation", {
    description: "Direct LiteralKit call argument that redundantly asserts an inline array as const.",
  })
) {}

const decodeInventoryDocument = S.decodeUnknownEffect(SchemaFirstInventoryDocument);
const encodeInventoryDocument = S.encodeUnknownEffect(SchemaFirstInventoryDocument);
const encodePolicyFinding = S.encodeUnknownEffect(SchemaFirstPolicyFinding);

const isExcludedFile = isExcludedTypeScriptSourcePath;

const makeEntryKey = (entry: SchemaFirstInventoryEntry): string =>
  `${entry.file}::${entry.symbol}::${entry.kind}::${entry.ruleId ?? ""}::${entry.line ?? ""}`;

const byEntryKeyAscending: Order.Order<SchemaFirstInventoryEntry> = Order.mapInput(Order.String, makeEntryKey);

const byWorkspacePathLengthDescending: Order.Order<readonly [string, string]> = Order.mapInput(
  Order.Number,
  (entry) => -entry[1].length
);

const sortEntries: (entries: ReadonlyArray<SchemaFirstInventoryEntry>) => ReadonlyArray<SchemaFirstInventoryEntry> =
  flow(A.sort(byEntryKeyAscending));

const isActiveRuleAdvisory =
  (ruleId: typeof SchemaFirstPolicyRuleId.Type) =>
  (entry: SchemaFirstInventoryEntry): boolean =>
    entry.ruleId === ruleId && entry.status === "advisory";

const optionalProp = <Key extends string, Value>(key: Key, value: O.Option<Value>): { readonly [K in Key]?: Value } =>
  O.isSome(value) ? ({ [key]: value.value } as { readonly [K in Key]?: Value }) : {};

const renderPolicyFindingLine = Effect.fn("renderPolicyFindingLine")(function* (finding: SchemaFirstPolicyFinding) {
  const encoded = yield* encodePolicyFinding(finding);
  const rendered = yield* stringifyJsonLine.run(O.some(encoded), {});
  return `[schema-first:issue] ${O.getOrElse(rendered, thunkEmptyStr)}`;
});

const inventoryEntryFinding = (
  entry: SchemaFirstInventoryEntry,
  message: string,
  remediation: string
): SchemaFirstPolicyFinding =>
  SchemaFirstPolicyFinding.make({
    category: "schema-first-policy",
    ruleId: entry.ruleId ?? "schema-first-inventory",
    severity: entry.status === "advisory" ? "warning" : "error",
    file: entry.file,
    symbol: entry.symbol,
    message,
    remediation,
    ...optionalProp("line", O.fromUndefinedOr(entry.line)),
  });

const missingEntryRemediation = (entry: SchemaFirstInventoryEntry): string => {
  if (entry.ruleId === "SFV4-static-api") {
    return "Prefer schema-derived .match/.guards/.cases or LiteralKit helpers, or run bun run beep lint schema-first --write with a justification when behavior intentionally differs.";
  }
  if (entry.ruleId === "SFV4-numeric-domain") {
    return "Review the numeric domain and replace broad S.Number/S.NumberFromString with S.Finite, S.Int, or checks; then run bun run beep lint schema-first --write if the broad domain is intentional.";
  }
  if (entry.ruleId === "SFV4-boundary-codec") {
    return "Replace direct JSON.parse with S.UnknownFromJsonString or S.fromJsonString(schema) plus an Effect/Result/Option decoder, or inventory the exception when the protocol is intentionally non-standard.";
  }
  if (entry.ruleId === "SFV4-defaults") {
    return "Move option/request fallback values into schema fields with S.withConstructorDefault, S.withDecodingDefault*, or SchemaUtils.withKeyDefaults; inventory the exception only when the fallback intentionally differs from schema construction semantics.";
  }
  if (entry.ruleId === "SFV4-equivalence") {
    return "Derive comparison from S.toEquivalence(schema) or SchemaUtils.toEquivalence(schema); use S.overrideToEquivalence only when schema semantics intentionally differ.";
  }
  if (entry.ruleId === "SFV4-precision-audit") {
    return "Replace broad email S.String fields with @beep/schema Email or a local precise email schema; inventory only external protocol fields that intentionally allow non-email strings.";
  }
  if (entry.ruleId === "SFV4-arbitrary-tests") {
    return "Add a focused property test using S.toArbitrary(sourceSchema) and fast-check, or keep the inventory entry when the file is intentionally golden/snapshot/regression-only coverage.";
  }
  return "Run bun run beep lint schema-first --write after reviewing the finding, or migrate the symbol to an annotated schema.";
};

const literalKitConstAssertionFinding = (violation: LiteralKitConstAssertionViolation): SchemaFirstPolicyFinding =>
  SchemaFirstPolicyFinding.make({
    category: "schema-first-policy",
    ruleId: "literal-kit-const-assertion",
    severity: "error",
    file: violation.file,
    line: violation.line,
    symbol: "LiteralKit",
    message: "Inline LiteralKit array arguments do not need as const.",
    remediation: "Remove the redundant as const assertion; LiteralKit already uses const type parameters.",
  });

const logPolicyFinding = Effect.fn("logPolicyFinding")(function* (finding: SchemaFirstPolicyFinding) {
  yield* Console.error(yield* renderPolicyFindingLine(finding));
});

const todayYmd = (): string => {
  const now = DateTime.nowUnsafe();
  const year = `${DateTime.getPartUtc(now, "year")}`;
  const month = Str.padStart(2, "0")(`${DateTime.getPartUtc(now, "month")}`);
  const day = Str.padStart(2, "0")(`${DateTime.getPartUtc(now, "day")}`);
  return `${year}-${month}-${day}`;
};

const readInventoryDocument = Effect.fn(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const absolutePath = path.resolve(process.cwd(), INVENTORY_PATH);

  if (!(yield* fs.exists(absolutePath))) {
    return O.none<SchemaFirstInventoryDocument>();
  }

  const content = yield* fs.readFileString(absolutePath);
  return yield* decodeInventoryDocument(parse(content)).pipe(Effect.option);
});

const writeInventoryDocument = Effect.fn("writeInventoryDocument")(function* (document: SchemaFirstInventoryDocument) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const absolutePath = path.resolve(process.cwd(), INVENTORY_PATH);
  const encodedDocument = yield* encodeInventoryDocument(document);
  const rendered = yield* stringifyJsonPretty.run(O.some(encodedDocument), {});
  const serialized = O.getOrElse(rendered, thunkEmptyStr);
  yield* fs.writeFileString(absolutePath, `${serialized}\n`);
});

const makeOwnerResolver = Effect.fn("makeOwnerResolver")(function* () {
  const workspaces = yield* resolveWorkspaceDirs(process.cwd());
  const workspaceEntries = pipe(
    HashMap.toEntries(workspaces),
    A.map(([packageName, absolutePath]) => [packageName, toPosixPath(absolutePath)] as const),
    A.sort(byWorkspacePathLengthDescending)
  );
  const cwd = toPosixPath(process.cwd());

  return (absoluteFilePath: string): string => {
    const normalized = toPosixPath(absoluteFilePath);
    const relativePath = toPosixPath(Str.replace(`${cwd}/`, "")(normalized));
    const workspaceMatch = A.findFirst(
      workspaceEntries,
      ([, workspacePath]) => normalized === workspacePath || Str.startsWith(`${workspacePath}/`)(normalized)
    );
    if (O.isSome(workspaceMatch)) {
      return workspaceMatch.value[0];
    }
    if (Str.startsWith("infra/")(relativePath)) {
      return "@beep/infra";
    }
    return "@beep/root";
  };
});

const isFunctionLikeMember = (member: Node): boolean => {
  if (
    Node.isMethodSignature(member) ||
    Node.isCallSignatureDeclaration(member) ||
    Node.isConstructSignatureDeclaration(member)
  ) {
    return true;
  }
  if (Node.isPropertySignature(member)) {
    const typeNode = member.getTypeNode();
    return typeNode !== undefined && typeNode.getKind() === SyntaxKind.FunctionType;
  }
  return false;
};

const isTypeNodeUnsafe = (typeText: string): boolean =>
  FUNCTION_LIKE_TEXT_PATTERN.test(typeText) || NON_SCHEMA_SIGNAL_PATTERN.test(typeText);

const typeLiteralMembersUnsafe = (members: ReadonlyArray<Node>): boolean =>
  A.some(members, (member) => {
    if (isFunctionLikeMember(member)) {
      return true;
    }
    if (Node.isPropertySignature(member)) {
      const typeText = member.getTypeNode()?.getText() ?? "";
      return isTypeNodeUnsafe(typeText);
    }
    return false;
  });

const detectInterfaceReason = (node: import("ts-morph").InterfaceDeclaration): O.Option<string> => {
  if (node.getTypeParameters().length > 0) {
    return O.some("Generic interface requires manual modeling and is tracked as an exception.");
  }
  if (node.getExtends().length > 0) {
    return O.some("Derived interface with extends clauses is tracked as an exception.");
  }
  if (typeLiteralMembersUnsafe(node.getMembers())) {
    return O.some("Interface contains non-schema signals such as function members or runtime handles.");
  }
  return O.none();
};

const detectTypeAliasReason = (node: import("ts-morph").TypeAliasDeclaration): O.Option<string> => {
  if (node.getTypeParameters().length > 0) {
    return O.some("Generic type alias requires manual modeling and is tracked as an exception.");
  }
  const typeNode = node.getTypeNode();
  if (typeNode === undefined || typeNode.getKind() !== SyntaxKind.TypeLiteral) {
    return O.some("Non-literal type alias is out of scope for automatic schema-first enforcement.");
  }
  const members = Node.isTypeLiteral(typeNode) ? typeNode.getMembers() : A.empty<TypeElementTypes>();
  if (typeLiteralMembersUnsafe(members)) {
    return O.some("Type alias contains non-schema signals such as function members or runtime handles.");
  }
  return O.none();
};

const isFunctionLocalNode = (node: Node): boolean =>
  node.getFirstAncestor(
    (ancestor) =>
      Node.isFunctionDeclaration(ancestor) ||
      Node.isFunctionExpression(ancestor) ||
      Node.isArrowFunction(ancestor) ||
      Node.isMethodDeclaration(ancestor)
  ) !== undefined;

const isStructFieldsInputForSchemaClass = (callExpression: import("ts-morph").CallExpression): boolean => {
  const variableDeclaration = callExpression.getFirstAncestorByKind(SyntaxKind.VariableDeclaration);
  if (variableDeclaration === undefined) {
    return false;
  }

  const variableName = variableDeclaration.getName();
  return A.some(callExpression.getSourceFile().getDescendantsOfKind(SyntaxKind.CallExpression), (candidate) => {
    if (candidate === callExpression || !SCHEMA_CLASS_FIELDS_CALL_PATTERN.test(candidate.getExpression().getText())) {
      return false;
    }
    return candidate.getArguments()[0]?.getText() === variableName;
  });
};

const detectStructReason = (callExpression: import("ts-morph").CallExpression): O.Option<string> => {
  const firstArgument = callExpression.getArguments()[0];
  if (firstArgument === undefined || !Node.isObjectLiteralExpression(firstArgument)) {
    return O.some("S.Struct usage without a plain object literal stays tracked as an exception.");
  }
  const invalidKeys = A.some(firstArgument.getProperties(), (property) => {
    if (Node.isSpreadAssignment(property)) {
      return true;
    }
    const nameNode = "getNameNode" in property ? property.getNameNode() : undefined;
    if (nameNode === undefined) {
      return true;
    }
    const propertyName = Str.replace(/^["']|["']$/g, "")(nameNode.getText());
    return !IDENTIFIER_PROPERTY_PATTERN.test(propertyName);
  });
  if (invalidKeys) {
    return O.some("S.Struct with non-identifier or spread keys stays tracked as an exception.");
  }
  if (callExpression.getFirstAncestorByKind(SyntaxKind.PropertyAssignment) !== undefined) {
    return O.some("Inline nested S.Struct boundary shapes stay tracked until a dedicated class extraction pass.");
  }
  if (isStructFieldsInputForSchemaClass(callExpression)) {
    return O.some("Internal S.Struct field block feeds an S.Class constructor and stays tied to the class model.");
  }
  if (isFunctionLocalNode(callExpression)) {
    return O.some("Function-local S.Struct wrappers used for transient decode envelopes stay tracked as exceptions.");
  }
  return O.none();
};

const inferStructSymbol = (callExpression: import("ts-morph").CallExpression): string =>
  pipe(
    O.fromNullishOr(callExpression.getFirstAncestorByKind(SyntaxKind.VariableDeclaration)),
    O.map((declaration) => declaration.getName()),
    O.getOrElse(() => {
      const line = callExpression.getSourceFile().getLineAndColumnAtPos(callExpression.getStart()).line;
      return `anonymous@${line}`;
    })
  );

const propertyNameText = (property: import("ts-morph").PropertyAssignment): O.Option<string> =>
  pipe(
    O.fromNullishOr(property.getNameNode()),
    O.map((nameNode) => Str.replace(/^["']|["']$/g, "")(nameNode.getText())),
    O.filter(Str.isNonEmpty)
  );

const fieldNameTokens = (fieldName: string): ReadonlyArray<string> =>
  pipe(
    fieldName,
    Str.replace(/([a-z0-9])([A-Z])/g, "$1 $2"),
    Str.replace(/[^A-Za-z0-9]+/g, " "),
    Str.trim,
    Str.split(/\s+/),
    A.map(Str.toLowerCase),
    A.filter(Str.isNonEmpty)
  );

const isNumericDomainFieldName = (fieldName: string): boolean =>
  A.some(fieldNameTokens(fieldName), (token) =>
    A.some(NUMERIC_DOMAIN_TOKENS, (numericToken) => Str.Equivalence(token, numericToken))
  );

const isBroadNumberSchemaExpression = (initializer: Node): boolean => {
  const text = initializer.getText();
  if (/S\.(?:Finite|Int)\b|\.check\(/.test(text)) {
    return false;
  }
  return (
    text === "S.Number" ||
    text === "S.NumberFromString" ||
    Str.startsWith("S.Number.pipe(")(text) ||
    Str.startsWith("S.NumberFromString.pipe(")(text)
  );
};

const isSchemaFieldsObjectLiteral = (node: Node): boolean => {
  if (!Node.isObjectLiteralExpression(node)) {
    return false;
  }
  const parent = node.getParent();
  return Node.isCallExpression(parent) && SCHEMA_FIELDS_CALL_PATTERN.test(parent.getExpression().getText());
};

const inferSchemaContainerSymbol = (node: Node): string => {
  const classDeclaration = node.getFirstAncestorByKind(SyntaxKind.ClassDeclaration);
  if (classDeclaration !== undefined) {
    return classDeclaration.getName() ?? "anonymous-class";
  }
  const variableDeclaration = node.getFirstAncestorByKind(SyntaxKind.VariableDeclaration);
  if (variableDeclaration !== undefined) {
    return variableDeclaration.getName();
  }
  const line = node.getSourceFile().getLineAndColumnAtPos(node.getStart()).line;
  return `anonymous@${line}`;
};

const numericDomainEntryFromProperty = (
  property: import("ts-morph").PropertyAssignment,
  file: string,
  owner: string
): O.Option<SchemaFirstInventoryEntry> => {
  const parent = property.getParent();
  if (!isSchemaFieldsObjectLiteral(parent)) {
    return O.none();
  }

  const fieldName = propertyNameText(property);
  if (O.isNone(fieldName) || !isNumericDomainFieldName(fieldName.value)) {
    return O.none();
  }

  const initializer = property.getInitializer();
  if (initializer === undefined || !isBroadNumberSchemaExpression(initializer)) {
    return O.none();
  }

  const field = fieldName.value;
  const container = inferSchemaContainerSymbol(parent);
  return O.some(
    SchemaFirstInventoryEntry.make({
      file,
      symbol: `${container}.${field}`,
      kind: "schema-policy-advisory",
      status: "advisory",
      ruleId: "SFV4-numeric-domain",
      line: property.getSourceFile().getLineAndColumnAtPos(property.getStart()).line,
      owner,
      reason: `Broad numeric schema field "${field}" should use S.Finite, S.Int, or a range check unless NaN and infinity are intentional.`,
    })
  );
};

const isBroadEmailSchemaExpression = (initializer: Node): boolean => {
  const text = initializer.getText();
  if (/\b(?:Email|ContactEmail)\b|S\.NonEmptyString\b|\.check\(/.test(text)) {
    return false;
  }
  return BROAD_EMAIL_SCHEMA_PATTERN.test(text);
};

const precisionAuditEntryFromProperty = (
  property: import("ts-morph").PropertyAssignment,
  file: string,
  owner: string
): O.Option<SchemaFirstInventoryEntry> => {
  const parent = property.getParent();
  if (!isSchemaFieldsObjectLiteral(parent)) {
    return O.none();
  }

  const fieldName = propertyNameText(property);
  if (O.isNone(fieldName) || !Str.Equivalence(fieldName.value, "email")) {
    return O.none();
  }

  const initializer = property.getInitializer();
  if (initializer === undefined || !isBroadEmailSchemaExpression(initializer)) {
    return O.none();
  }

  const container = inferSchemaContainerSymbol(parent);
  return O.some(
    SchemaFirstInventoryEntry.make({
      file,
      symbol: `${container}.email`,
      kind: "schema-policy-advisory",
      status: "advisory",
      ruleId: "SFV4-precision-audit",
      line: property.getSourceFile().getLineAndColumnAtPos(property.getStart()).line,
      owner,
      reason:
        'Broad string field "email" should use @beep/schema Email, a local precise email schema, or a documented external-protocol exception.',
    })
  );
};

const sourceHasStaticApiSchemaSignal = (sourceFile: import("ts-morph").SourceFile): boolean =>
  STATIC_API_SCHEMA_SIGNAL_PATTERN.test(sourceFile.getFullText());

const isSchemaDiscriminatorToken = (token: string): boolean =>
  A.some(SCHEMA_DISCRIMINATOR_TOKENS, (discriminatorToken) => Str.Equivalence(discriminatorToken, token));

const schemaDiscriminatorExpressionText = (expression: Node): O.Option<string> => {
  if (Node.isIdentifier(expression) && isSchemaDiscriminatorToken(expression.getText())) {
    return O.some(expression.getText());
  }
  if (Node.isPropertyAccessExpression(expression) && isSchemaDiscriminatorToken(expression.getName())) {
    return O.some(expression.getText());
  }
  return O.none();
};

const inferExecutableContainerSymbol = (node: Node): string => {
  const functionDeclaration = node.getFirstAncestorByKind(SyntaxKind.FunctionDeclaration);
  if (functionDeclaration !== undefined) {
    return functionDeclaration.getName() ?? "anonymous-function";
  }
  const arrowFunction = node.getFirstAncestorByKind(SyntaxKind.ArrowFunction);
  const arrowVariableDeclaration = arrowFunction?.getFirstAncestorByKind(SyntaxKind.VariableDeclaration);
  if (arrowVariableDeclaration !== undefined) {
    return arrowVariableDeclaration.getName();
  }
  const functionExpression = node.getFirstAncestorByKind(SyntaxKind.FunctionExpression);
  const functionExpressionVariableDeclaration = functionExpression?.getFirstAncestorByKind(
    SyntaxKind.VariableDeclaration
  );
  if (functionExpressionVariableDeclaration !== undefined) {
    return functionExpressionVariableDeclaration.getName();
  }
  return inferSchemaContainerSymbol(node);
};

const staticApiEntryFromSwitch = (
  switchStatement: import("ts-morph").SwitchStatement,
  file: string,
  owner: string
): O.Option<SchemaFirstInventoryEntry> =>
  pipe(
    schemaDiscriminatorExpressionText(switchStatement.getExpression()),
    O.map((expressionText) => {
      const line = switchStatement.getSourceFile().getLineAndColumnAtPos(switchStatement.getStart()).line;
      return SchemaFirstInventoryEntry.make({
        file,
        symbol: `${inferExecutableContainerSymbol(switchStatement)}.switch(${expressionText})`,
        kind: "schema-policy-advisory",
        status: "advisory",
        ruleId: "SFV4-static-api",
        line,
        owner,
        reason: `Schema-modeled discriminator switch "${expressionText}" should use schema-derived .match/.guards or LiteralKit.$match when semantics match.`,
      });
    })
  );

const isJsonParseCallExpression = (callExpression: import("ts-morph").CallExpression): boolean => {
  const expression = callExpression.getExpression();
  return (
    Node.isPropertyAccessExpression(expression) &&
    expression.getExpression().getText() === "JSON" &&
    expression.getName() === "parse"
  );
};

const boundaryCodecEntryFromJsonParse = (
  callExpression: import("ts-morph").CallExpression,
  file: string,
  owner: string
): SchemaFirstInventoryEntry =>
  SchemaFirstInventoryEntry.make({
    file,
    symbol: `${inferExecutableContainerSymbol(callExpression)}.JSON.parse`,
    kind: "schema-policy-advisory",
    status: "advisory",
    ruleId: "SFV4-boundary-codec",
    line: callExpression.getSourceFile().getLineAndColumnAtPos(callExpression.getStart()).line,
    owner,
    reason:
      "Direct JSON.parse boundary should use S.UnknownFromJsonString or S.fromJsonString(schema) so parsing and validation stay schema-owned.",
  });

const sourceHasDefaultsSchemaSignal = (sourceFile: import("ts-morph").SourceFile): boolean =>
  DEFAULTS_SCHEMA_SIGNAL_PATTERN.test(sourceFile.getFullText());

const isDefaultParameterName = (name: string): boolean =>
  A.some(DEFAULT_PARAMETER_NAMES, (parameterName) => Str.Equivalence(parameterName, name));

const isNonEmptyObjectLiteral = (node: Node): node is import("ts-morph").ObjectLiteralExpression =>
  Node.isObjectLiteralExpression(node) && node.getProperties().length > 0;

const defaultsEntryFromParameter = (
  parameter: import("ts-morph").ParameterDeclaration,
  file: string,
  owner: string
): O.Option<SchemaFirstInventoryEntry> => {
  const initializer = parameter.getInitializer();
  if (initializer === undefined || !isNonEmptyObjectLiteral(initializer)) {
    return O.none();
  }

  const parameterName = parameter.getName();
  if (!isDefaultParameterName(parameterName)) {
    return O.none();
  }

  return O.some(
    SchemaFirstInventoryEntry.make({
      file,
      symbol: `${inferExecutableContainerSymbol(parameter)}.${parameterName}`,
      kind: "schema-policy-advisory",
      status: "advisory",
      ruleId: "SFV4-defaults",
      line: parameter.getSourceFile().getLineAndColumnAtPos(parameter.getStart()).line,
      owner,
      reason: `Parameter default object for "${parameterName}" should move fallback values into schema defaults so construction, decoding, and tests share one source of truth.`,
    })
  );
};

const sourceHasEquivalenceSchemaSignal = (sourceFile: import("ts-morph").SourceFile): boolean =>
  EQUIVALENCE_SCHEMA_SIGNAL_PATTERN.test(sourceFile.getFullText());

const isSchemaDerivedEquivalenceExpression = (text: string): boolean => SCHEMA_DERIVED_EQUIVALENCE_PATTERN.test(text);

const hasManualEqualityComparison = (text: string): boolean => MANUAL_EQUALITY_COMPARISON_PATTERN.test(text);

const isExportedEqualsVariableDeclaration = (declaration: import("ts-morph").VariableDeclaration): boolean => {
  if (!Str.Equivalence(declaration.getName(), "equals")) {
    return false;
  }
  const variableStatement = declaration.getFirstAncestorByKind(SyntaxKind.VariableStatement);
  return variableStatement?.isExported() ?? false;
};

const equivalenceEntryFromVariableDeclaration = (
  declaration: import("ts-morph").VariableDeclaration,
  file: string,
  owner: string
): O.Option<SchemaFirstInventoryEntry> => {
  if (!isExportedEqualsVariableDeclaration(declaration)) {
    return O.none();
  }

  const initializerText = declaration.getInitializer()?.getText() ?? "";
  if (isSchemaDerivedEquivalenceExpression(initializerText) || !hasManualEqualityComparison(initializerText)) {
    return O.none();
  }

  return O.some(
    SchemaFirstInventoryEntry.make({
      file,
      symbol: declaration.getName(),
      kind: "schema-policy-advisory",
      status: "advisory",
      ruleId: "SFV4-equivalence",
      line: declaration.getSourceFile().getLineAndColumnAtPos(declaration.getStart()).line,
      owner,
      reason:
        'Exported schema-modeled equality helper "equals" should derive from S.toEquivalence(schema) unless comparison intentionally differs from schema semantics.',
    })
  );
};

const isSchemaFirstTestFile = (filePath: string): boolean =>
  TEST_FILE_PATTERN.test(filePath) &&
  !A.some(TEST_FILE_EXCLUDED_SEGMENTS, (segment) => Str.includes(segment)(`/${filePath}`));

const isSchemaCodecHelperName = (name: string): boolean =>
  A.some(SCHEMA_CODEC_HELPERS, (helperName) => Str.Equivalence(helperName, name));

// Matches schema codec calls of the form `<Identifier>.<codecHelper>(...)`. This
// covers the namespace forms `S.decodeUnknownSync(Schema)` / `Schema.decode...`
// AND the class-local static API promoted by this repo, e.g.
// `NamedNode.decodeUnknownResult(...)` or `ContactSubmission.decodeUnknownEffect(...)`,
// so migrating to class statics cannot silently evade the advisory. The codec
// helper names are Effect-Schema-specific, so any-identifier objects are safe.
const isSchemaCodecCallExpression = (callExpression: import("ts-morph").CallExpression): boolean => {
  const expression = callExpression.getExpression();
  return (
    Node.isPropertyAccessExpression(expression) &&
    isSchemaCodecHelperName(expression.getName()) &&
    Node.isIdentifier(expression.getExpression())
  );
};

/**
 * Test whether source text contains schema-derived arbitrary coverage.
 *
 * @param sourceText - TypeScript source text to inspect.
 * @returns Whether the text contains schema-derived arbitrary coverage.
 * @example
 * ```ts
 * import { sourceTextHasSchemaArbitraryPropertyCoverage } from "@beep/repo-cli/commands/Lint"
 *
 * console.log(sourceTextHasSchemaArbitraryPropertyCoverage("S.toArbitrary(Worker)"))
 * ```
 * @category utilities
 * @since 0.0.0
 */
export const sourceTextHasSchemaArbitraryPropertyCoverage = (sourceText: string): boolean =>
  SCHEMA_ARBITRARY_PROPERTY_PATTERN.test(sourceText);

const sourceHasSchemaArbitraryPropertyCoverage = (sourceFile: import("ts-morph").SourceFile): boolean =>
  sourceTextHasSchemaArbitraryPropertyCoverage(sourceFile.getFullText());

const arbitraryTestsEntryFromSourceFile = (
  sourceFile: import("ts-morph").SourceFile,
  file: string,
  owner: string
): O.Option<SchemaFirstInventoryEntry> => {
  if (!isSchemaFirstTestFile(file) || sourceHasSchemaArbitraryPropertyCoverage(sourceFile)) {
    return O.none();
  }

  const schemaCodecCalls = A.filter(
    sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression),
    isSchemaCodecCallExpression
  );
  if (schemaCodecCalls.length < 3) {
    return O.none();
  }

  const line = sourceFile.getLineAndColumnAtPos(schemaCodecCalls[0]?.getStart() ?? sourceFile.getStart()).line;
  return O.some(
    SchemaFirstInventoryEntry.make({
      file,
      symbol: "schema-codec-tests",
      kind: "schema-policy-advisory",
      status: "advisory",
      ruleId: "SFV4-arbitrary-tests",
      line,
      owner,
      reason: `Schema-heavy test file has ${schemaCodecCalls.length} Schema codec assertions but no schema-derived property coverage.`,
    })
  );
};

const isLiteralKitConstAssertionArgument = (argument: Node): boolean =>
  Node.isAsExpression(argument) &&
  Node.isArrayLiteralExpression(argument.getExpression()) &&
  argument.getTypeNode()?.getText() === "const";

const collectLiteralKitConstAssertionViolations = Effect.fn(function* () {
  const path = yield* Path.Path;
  const project = new Project({
    tsConfigFilePath: path.join(process.cwd(), "tsconfig.json"),
    skipAddingFilesFromTsConfig: true,
  });

  project.addSourceFilesAtPaths(SOURCE_FILE_GLOBS);

  const violations = A.empty<LiteralKitConstAssertionViolation>();

  for (const sourceFile of project.getSourceFiles()) {
    const filePath = toPosixPath(path.relative(process.cwd(), sourceFile.getFilePath()));
    if (isExcludedFile(filePath)) {
      continue;
    }

    for (const callExpression of sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)) {
      if (callExpression.getExpression().getText() !== "LiteralKit") {
        continue;
      }

      const args = callExpression.getArguments();
      for (let argumentIndex = 0; argumentIndex < args.length; argumentIndex += 1) {
        const argument = args[argumentIndex];
        if (!isLiteralKitConstAssertionArgument(argument)) {
          continue;
        }

        A.appendInPlace(
          violations,
          LiteralKitConstAssertionViolation.make({
            file: filePath,
            line: sourceFile.getLineAndColumnAtPos(argument.getStart()).line,
            argument: argumentIndex + 1,
          })
        );
      }
    }
  }

  return violations;
});

const scanSchemaFirstInventory = Effect.fn(function* () {
  const path = yield* Path.Path;
  const ownerResolver = yield* makeOwnerResolver();
  const project = new Project({
    tsConfigFilePath: path.join(process.cwd(), "tsconfig.json"),
    skipAddingFilesFromTsConfig: true,
  });
  const thunkCandidate = () => "candidate" as const;
  const thunkException = () => "exception" as const;

  project.addSourceFilesAtPaths(SOURCE_FILE_GLOBS);

  const entries = A.empty<SchemaFirstInventoryEntry>();
  const pushEntry = (
    file: string,
    symbol: string,
    kind: typeof SchemaFirstEntryKind.Type,
    status: typeof SchemaFirstEntryStatus.Type,
    reason: string,
    owner: string,
    options: {
      readonly line?: number;
      readonly ruleId?: typeof SchemaFirstPolicyRuleId.Type;
    } = {}
  ) =>
    void A.appendInPlace(
      entries,
      SchemaFirstInventoryEntry.make({
        file,
        symbol,
        kind,
        status,
        ...options,
        reason,
        owner,
      })
    );

  for (const sourceFile of project.getSourceFiles()) {
    const filePath = toPosixPath(path.relative(process.cwd(), sourceFile.getFilePath()));
    const owner = ownerResolver(sourceFile.getFilePath());
    const arbitraryTestsEntry = arbitraryTestsEntryFromSourceFile(sourceFile, filePath, owner);
    if (O.isSome(arbitraryTestsEntry)) {
      A.appendInPlace(entries, arbitraryTestsEntry.value);
    }
    if (isExcludedFile(filePath)) {
      continue;
    }

    for (const declaration of sourceFile.getInterfaces()) {
      if (!declaration.isExported()) {
        continue;
      }
      const reasonOption = detectInterfaceReason(declaration);
      pushEntry(
        filePath,
        declaration.getName(),
        "exported-interface",
        O.match(reasonOption, {
          onNone: thunkCandidate,
          onSome: thunkException,
        }),
        O.getOrElse(reasonOption, () => "Exported pure-data interface should be modeled as an annotated schema."),
        owner
      );
    }

    for (const declaration of sourceFile.getTypeAliases()) {
      if (!declaration.isExported()) {
        continue;
      }
      const typeNode = declaration.getTypeNode();
      if (typeNode === undefined || typeNode.getKind() !== SyntaxKind.TypeLiteral) {
        continue;
      }
      const reasonOption = detectTypeAliasReason(declaration);
      pushEntry(
        filePath,
        declaration.getName(),
        "exported-type-literal",
        O.match(reasonOption, {
          onNone: thunkCandidate,
          onSome: thunkException,
        }),
        O.getOrElse(reasonOption, () => "Exported pure-data type alias should be modeled as an annotated schema."),
        owner
      );
    }

    for (const callExpression of sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)) {
      if (callExpression.getExpression().getText() !== "S.Struct") {
        if (isJsonParseCallExpression(callExpression)) {
          A.appendInPlace(entries, boundaryCodecEntryFromJsonParse(callExpression, filePath, owner));
        }
        continue;
      }
      const reasonOption = detectStructReason(callExpression);
      pushEntry(
        filePath,
        inferStructSymbol(callExpression),
        "object-struct-schema",
        O.match(reasonOption, {
          onNone: thunkCandidate,
          onSome: thunkException,
        }),
        O.getOrElse(reasonOption, () => "Object schema should prefer an annotated S.Class over S.Struct."),
        owner
      );
    }

    for (const property of sourceFile.getDescendantsOfKind(SyntaxKind.PropertyAssignment)) {
      const entry = numericDomainEntryFromProperty(property, filePath, owner);
      if (O.isSome(entry)) {
        A.appendInPlace(entries, entry.value);
      }
      const precisionEntry = precisionAuditEntryFromProperty(property, filePath, owner);
      if (O.isSome(precisionEntry)) {
        A.appendInPlace(entries, precisionEntry.value);
      }
    }

    if (sourceHasStaticApiSchemaSignal(sourceFile)) {
      for (const switchStatement of sourceFile.getDescendantsOfKind(SyntaxKind.SwitchStatement)) {
        const entry = staticApiEntryFromSwitch(switchStatement, filePath, owner);
        if (O.isSome(entry)) {
          A.appendInPlace(entries, entry.value);
        }
      }
    }

    if (sourceHasDefaultsSchemaSignal(sourceFile)) {
      for (const parameter of sourceFile.getDescendantsOfKind(SyntaxKind.Parameter)) {
        const entry = defaultsEntryFromParameter(parameter, filePath, owner);
        if (O.isSome(entry)) {
          A.appendInPlace(entries, entry.value);
        }
      }
    }

    if (sourceHasEquivalenceSchemaSignal(sourceFile)) {
      for (const declaration of sourceFile.getDescendantsOfKind(SyntaxKind.VariableDeclaration)) {
        const entry = equivalenceEntryFromVariableDeclaration(declaration, filePath, owner);
        if (O.isSome(entry)) {
          A.appendInPlace(entries, entry.value);
        }
      }
    }
  }

  return SchemaFirstInventoryDocument.make({
    version: 1,
    generatedOn: todayYmd(),
    scope: A.fromIterable(INCLUDED_GLOBS),
    enforcedRoots: A.fromIterable(ENFORCED_ROOTS),
    entries: sortEntries(A.dedupeWith(entries, (left, right) => makeEntryKey(left) === makeEntryKey(right))),
  });
});

const mergeInventory = (
  liveDocument: SchemaFirstInventoryDocument,
  existingDocument: O.Option<SchemaFirstInventoryDocument>
): SchemaFirstInventoryDocument => {
  const existingByKey = pipe(
    existingDocument,
    O.map((document) =>
      HashMap.fromIterable(
        A.map(document.entries, (entry): readonly [string, SchemaFirstInventoryEntry] => [makeEntryKey(entry), entry])
      )
    ),
    O.getOrElse(HashMap.empty<string, SchemaFirstInventoryEntry>)
  );

  const mergedEntries = pipe(
    liveDocument.entries,
    A.map((entry) => O.getOrElse(HashMap.get(existingByKey, makeEntryKey(entry)), () => entry))
  );

  return SchemaFirstInventoryDocument.make({
    version: 1,
    generatedOn: liveDocument.generatedOn,
    scope: liveDocument.scope,
    enforcedRoots: liveDocument.enforcedRoots,
    entries: sortEntries(mergedEntries),
  });
};

/**
 * Run schema-first inventory verification against the committed baseline.
 *
 * @example
 * ```ts
 * console.log("runSchemaFirstLint")
 * ```
 * @category utilities
 * @since 0.0.0
 */
export const runSchemaFirstLint = Effect.fn(function* (options: SchemaFirstLintOptions) {
  const liveDocument = yield* scanSchemaFirstInventory();
  const literalKitConstAssertionViolations = yield* collectLiteralKitConstAssertionViolations();
  const existingDocument = yield* readInventoryDocument();
  const mergedDocument = mergeInventory(liveDocument, existingDocument);

  const liveByKey = HashMap.fromIterable(
    A.map(liveDocument.entries, (entry): readonly [string, SchemaFirstInventoryEntry] => [makeEntryKey(entry), entry])
  );
  const trackedByKey = pipe(
    existingDocument,
    O.map((document) =>
      HashMap.fromIterable(
        A.map(document.entries, (entry): readonly [string, SchemaFirstInventoryEntry] => [makeEntryKey(entry), entry])
      )
    ),
    O.getOrElse(HashMap.empty<string, SchemaFirstInventoryEntry>)
  );

  const missingEntries = pipe(
    liveDocument.entries,
    A.filter((entry) => !HashMap.has(trackedByKey, makeEntryKey(entry)))
  );
  const staleEntries = pipe(
    O.map(existingDocument, (document) =>
      A.filter(document.entries, (entry) => !HashMap.has(liveByKey, makeEntryKey(entry)))
    ),
    O.getOrElse(A.empty<SchemaFirstInventoryEntry>)
  );
  const enforcedCandidates = A.filter(mergedDocument.entries, (entry) => entry.status === "candidate");
  const boundaryCodecAdvisories = A.filter(mergedDocument.entries, isActiveRuleAdvisory("SFV4-boundary-codec"));
  const defaultsAdvisories = A.filter(mergedDocument.entries, isActiveRuleAdvisory("SFV4-defaults"));
  const staticApiAdvisories = A.filter(mergedDocument.entries, isActiveRuleAdvisory("SFV4-static-api"));
  const equivalenceAdvisories = A.filter(mergedDocument.entries, isActiveRuleAdvisory("SFV4-equivalence"));
  const precisionAuditAdvisories = A.filter(mergedDocument.entries, isActiveRuleAdvisory("SFV4-precision-audit"));
  const arbitraryTestsAdvisories = A.filter(mergedDocument.entries, isActiveRuleAdvisory("SFV4-arbitrary-tests"));
  const numericDomainAdvisories = A.filter(mergedDocument.entries, isActiveRuleAdvisory("SFV4-numeric-domain"));

  if (options.write) {
    yield* writeInventoryDocument(mergedDocument);
  }

  yield* Console.log(`[schema-first] live_entries=${liveDocument.entries.length}`);
  yield* Console.log(`[schema-first] tracked_entries=${mergedDocument.entries.length}`);
  yield* Console.log(`[schema-first] missing_entries=${missingEntries.length}`);
  yield* Console.log(`[schema-first] stale_entries=${staleEntries.length}`);
  yield* Console.log(`[schema-first] enforced_candidates=${enforcedCandidates.length}`);
  yield* Console.log(`[schema-first] literal_kit_const_assertions=${literalKitConstAssertionViolations.length}`);
  yield* Console.log(`[schema-first] sfv4_boundary_codec_advisories=${boundaryCodecAdvisories.length}`);
  yield* Console.log(`[schema-first] sfv4_defaults_advisories=${defaultsAdvisories.length}`);
  yield* Console.log(`[schema-first] sfv4_static_api_advisories=${staticApiAdvisories.length}`);
  yield* Console.log(`[schema-first] sfv4_equivalence_advisories=${equivalenceAdvisories.length}`);
  yield* Console.log(`[schema-first] sfv4_precision_audit_advisories=${precisionAuditAdvisories.length}`);
  yield* Console.log(`[schema-first] sfv4_arbitrary_tests_advisories=${arbitraryTestsAdvisories.length}`);
  yield* Console.log(`[schema-first] sfv4_numeric_domain_advisories=${numericDomainAdvisories.length}`);
  if (options.write) {
    yield* Console.log(`[schema-first] wrote ${INVENTORY_PATH}`);
  }

  if (missingEntries.length > 0) {
    yield* Console.error("[schema-first] untracked live findings:");
    for (const entry of missingEntries) {
      yield* Console.error(`- ${entry.file} :: ${entry.symbol} [${entry.kind}] ${entry.reason}`);
      yield* logPolicyFinding(inventoryEntryFinding(entry, entry.reason, missingEntryRemediation(entry)));
    }
  }

  if (staleEntries.length > 0) {
    yield* Console.error("[schema-first] stale inventory entries:");
    for (const entry of staleEntries) {
      yield* Console.error(`- ${entry.file} :: ${entry.symbol} [${entry.kind}]`);
      yield* logPolicyFinding(
        inventoryEntryFinding(
          entry,
          "Stale schema-first inventory entry is no longer present in the live scan.",
          "Run bun run beep lint schema-first --write after confirming the source removal or rename."
        )
      );
    }
  }

  if (enforcedCandidates.length > 0) {
    yield* Console.error("[schema-first] repo still contains candidate findings:");
    for (const entry of enforcedCandidates) {
      yield* Console.error(`- ${entry.file} :: ${entry.symbol} [${entry.kind}] ${entry.reason}`);
      yield* logPolicyFinding(
        inventoryEntryFinding(
          entry,
          entry.reason,
          "Model the exported data with an annotated schema or record a justified exception in standards/schema-first.inventory.jsonc."
        )
      );
    }
  }

  if (literalKitConstAssertionViolations.length > 0) {
    yield* Console.error("[schema-first] redundant LiteralKit const assertions:");
    for (const violation of literalKitConstAssertionViolations) {
      yield* Console.error(
        `- ${violation.file}:${violation.line} arg${violation.argument} [literal-kit-const-assertion] Inline LiteralKit array arguments do not need as const.`
      );
      yield* logPolicyFinding(literalKitConstAssertionFinding(violation));
    }
  }

  const hasFailures = options.write
    ? enforcedCandidates.length > 0 || literalKitConstAssertionViolations.length > 0
    : missingEntries.length > 0 ||
      staleEntries.length > 0 ||
      enforcedCandidates.length > 0 ||
      literalKitConstAssertionViolations.length > 0;
  if (hasFailures) {
    return yield* failWithReportedExit("schema-first: inventory enforcement failed.");
  }

  return SchemaFirstLintSummary.make({
    liveEntries: liveDocument.entries.length,
    trackedEntries: mergedDocument.entries.length,
    missingEntries: missingEntries.length,
    staleEntries: staleEntries.length,
    enforcedCandidates: enforcedCandidates.length,
    literalKitConstAssertions: literalKitConstAssertionViolations.length,
    boundaryCodecAdvisories: boundaryCodecAdvisories.length,
    defaultsAdvisories: defaultsAdvisories.length,
    staticApiAdvisories: staticApiAdvisories.length,
    equivalenceAdvisories: equivalenceAdvisories.length,
    precisionAuditAdvisories: precisionAuditAdvisories.length,
    arbitraryTestsAdvisories: arbitraryTestsAdvisories.length,
    numericDomainAdvisories: numericDomainAdvisories.length,
    wroteInventory: options.write,
  });
});

/**
 * Repo-wide schema-first lint command.
 *
 * @example
 * ```ts
 * console.log("lintSchemaFirstCommand")
 * ```
 * @category utilities
 * @since 0.0.0
 */
export const lintSchemaFirstCommand = Command.make(
  "schema-first",
  {
    write: Flag.boolean("write").pipe(Flag.withDescription("Refresh standards/schema-first.inventory.jsonc")),
  },
  Effect.fn(function* ({ write }) {
    yield* runSchemaFirstLint(SchemaFirstLintOptions.make({ write }));
  })
).pipe(Command.withDescription("Verify the repo-wide schema-first inventory baseline"));
