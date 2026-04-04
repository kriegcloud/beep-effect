/**
 * Schema-first inventory and enforcement command.
 *
 * @module
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import { resolveWorkspaceDirs } from "@beep/repo-utils/Workspaces";
import { LiteralKit } from "@beep/schema";
import { thunkEmptyStr, thunkFalse, thunkSome, thunkSomeEmptyArray, thunkSomeFalse } from "@beep/utils";
import { Console, DateTime, Effect, FileSystem, HashMap, Order, Path, pipe, SchemaGetter } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { Command, Flag } from "effect/unstable/cli";
import { parse } from "jsonc-parser";
import { Node, Project, SyntaxKind, type TypeElementTypes } from "ts-morph";
import { isExcludedTypeScriptSourcePath, toPosixPath } from "../Shared/TypeScriptSourceExclusions.ts";

const $I = $RepoCliId.create("commands/Lint/SchemaFirst");
const INVENTORY_PATH = "standards/schema-first.inventory.jsonc";
const INCLUDED_GLOBS = [
  "apps/**/*.{ts,tsx}",
  "packages/**/*.{ts,tsx}",
  "tooling/**/*.{ts,tsx}",
  "infra/**/*.ts",
  ".claude/hooks/**/*.ts",
] as const;
const ENFORCED_ROOTS = [
  "tooling/cli/src",
  "tooling/repo-utils/src/FsUtils.ts",
  "tooling/repo-utils/src/UniqueDeps.ts",
  "tooling/repo-utils/src/schemas/WorkspaceDeps.ts",
  "packages/ai/sdk/src/claude/Schema/Session.ts",
  "packages/ai/sdk/src/claude/Storage/SessionIndexStore.ts",
  "packages/ai/sdk/src/claude/Storage/StorageConfig.ts",
] as const;
const IDENTIFIER_PROPERTY_PATTERN = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const FUNCTION_LIKE_TEXT_PATTERN = /=>|\bEffect\.Effect</;
const NON_SCHEMA_SIGNAL_PATTERN =
  /\bEffect\.Success<|\bLayer\.Layer<|\bAbortSignal\b|\bAbortController\b|\bUint8Array\b|\bEventJournal\.Entry\b|\bZod\b|\bz\./;

const stringifyJsonPretty = SchemaGetter.stringifyJson({ space: 2 });

const SchemaFirstEntryKind = LiteralKit([
  "exported-interface",
  "exported-type-literal",
  "object-struct-schema",
]).annotate(
  $I.annote("SchemaFirstEntryKind", {
    description: "Kinds of schema-first inventory findings.",
  })
);

const SchemaFirstEntryStatus = LiteralKit(["candidate", "exception"]).annotate(
  $I.annote("SchemaFirstEntryStatus", {
    description: "Tracked status for a schema-first inventory finding.",
  })
);

class SchemaFirstInventoryEntry extends S.Class<SchemaFirstInventoryEntry>($I`SchemaFirstInventoryEntry`)(
  {
    file: S.String,
    symbol: S.String,
    kind: SchemaFirstEntryKind,
    status: SchemaFirstEntryStatus,
    owner: S.String,
    reason: S.String,
  },
  $I.annote("SchemaFirstInventoryEntry", {
    description: "Single tracked schema-first finding for a source file symbol.",
  })
) {}

class SchemaFirstInventoryDocument extends S.Class<SchemaFirstInventoryDocument>($I`SchemaFirstInventoryDocument`)(
  {
    version: S.Literal(1),
    generatedOn: S.String,
    scope: S.Array(S.String).pipe(
      S.withConstructorDefault(thunkSome(A.fromIterable(INCLUDED_GLOBS))),
      S.withDecodingDefault(() => A.fromIterable(INCLUDED_GLOBS))
    ),
    enforcedRoots: S.Array(S.String).pipe(
      S.withConstructorDefault(thunkSome(A.fromIterable(ENFORCED_ROOTS))),
      S.withDecodingDefault(() => A.fromIterable(ENFORCED_ROOTS))
    ),
    entries: S.Array(SchemaFirstInventoryEntry).pipe(
      S.withConstructorDefault(thunkSomeEmptyArray<SchemaFirstInventoryEntry>),
      S.withDecodingDefault(A.empty<(typeof SchemaFirstInventoryEntry)["Encoded"]>)
    ),
  },
  $I.annote("SchemaFirstInventoryDocument", {
    description: "Committed schema-first inventory baseline for repo-wide lint enforcement.",
  })
) {}

class SchemaFirstLintOptions extends S.Class<SchemaFirstLintOptions>($I`SchemaFirstLintOptions`)(
  {
    write: S.Boolean.pipe(S.withConstructorDefault(thunkSomeFalse), S.withDecodingDefault(thunkFalse)),
  },
  $I.annote("SchemaFirstLintOptions", {
    description: "CLI options for schema-first inventory verification.",
  })
) {}

class SchemaFirstLintSummary extends S.Class<SchemaFirstLintSummary>($I`SchemaFirstLintSummary`)(
  {
    liveEntries: S.Number,
    trackedEntries: S.Number,
    missingEntries: S.Number,
    staleEntries: S.Number,
    enforcedCandidates: S.Number,
    wroteInventory: S.Boolean,
  },
  $I.annote("SchemaFirstLintSummary", {
    description: "Summary of schema-first inventory verification results.",
  })
) {}

const decodeInventoryDocument = S.decodeUnknownSync(SchemaFirstInventoryDocument);
const encodeInventoryDocument = S.encodeUnknownSync(SchemaFirstInventoryDocument);

const isExcludedFile = isExcludedTypeScriptSourcePath;

const makeEntryKey = (entry: SchemaFirstInventoryEntry): string => `${entry.file}::${entry.symbol}::${entry.kind}`;

const byEntryKeyAscending: Order.Order<SchemaFirstInventoryEntry> = Order.mapInput(Order.String, makeEntryKey);

const byWorkspacePathLengthDescending: Order.Order<readonly [string, string]> = Order.mapInput(
  Order.Number,
  (entry) => -entry[1].length
);

const sortEntries = (entries: ReadonlyArray<SchemaFirstInventoryEntry>): ReadonlyArray<SchemaFirstInventoryEntry> =>
  pipe(entries, A.sort(byEntryKeyAscending));

const isEnforcedFile = (filePath: string): boolean =>
  ENFORCED_ROOTS.some((root) => filePath === root || Str.startsWith(`${root}/`)(filePath));

const todayYmd = (): string => {
  const now = DateTime.nowUnsafe();
  const year = `${DateTime.getPartUtc(now, "year")}`;
  const month = `${DateTime.getPartUtc(now, "month")}`.padStart(2, "0");
  const day = `${DateTime.getPartUtc(now, "day")}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const readInventoryDocument = Effect.fn(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const absolutePath = path.resolve(process.cwd(), INVENTORY_PATH);

  if (!(yield* fs.exists(absolutePath))) {
    return O.none<typeof SchemaFirstInventoryDocument.Type>();
  }

  const content = yield* fs.readFileString(absolutePath);
  return yield* Effect.try({
    try: () => decodeInventoryDocument(parse(content)),
    catch: () => undefined,
  }).pipe(
    Effect.match({
      onFailure: O.none,
      onSuccess: O.some,
    })
  );
});

const writeInventoryDocument = Effect.fn(function* (document: SchemaFirstInventoryDocument) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const absolutePath = path.resolve(process.cwd(), INVENTORY_PATH);
  const encodedDocument = encodeInventoryDocument(document);
  const rendered = yield* stringifyJsonPretty.run(O.some(encodedDocument), {});
  const serialized = O.getOrElse(rendered, thunkEmptyStr);
  yield* fs.writeFileString(absolutePath, `${serialized}\n`);
});

const makeOwnerResolver = Effect.fn(function* () {
  const workspaces = yield* resolveWorkspaceDirs(process.cwd());
  const workspaceEntries = pipe(
    HashMap.toEntries(workspaces),
    A.map(([packageName, absolutePath]) => [packageName, toPosixPath(absolutePath)] as const),
    A.sort(byWorkspacePathLengthDescending)
  );
  const cwd = toPosixPath(process.cwd());

  return (absoluteFilePath: string): string => {
    const normalized = toPosixPath(absoluteFilePath);
    const relativePath = toPosixPath(normalized.replace(`${cwd}/`, ""));
    const workspaceMatch = A.findFirst(
      workspaceEntries,
      ([, workspacePath]) => normalized === workspacePath || Str.startsWith(`${workspacePath}/`)(normalized)
    );
    if (O.isSome(workspaceMatch)) {
      return workspaceMatch.value[0];
    }
    if (Str.startsWith(".claude/")(relativePath)) {
      return "@beep/claude";
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

const scanSchemaFirstInventory = Effect.fn(function* () {
  const path = yield* Path.Path;
  const ownerResolver = yield* makeOwnerResolver();
  const project = new Project({
    tsConfigFilePath: path.join(process.cwd(), "tsconfig.json"),
    skipAddingFilesFromTsConfig: true,
  });
  const thunkCandidate = () => "candidate" as const;
  const thunkException = () => "exception" as const;

  for (const pattern of INCLUDED_GLOBS) {
    project.addSourceFilesAtPaths(pattern);
  }

  const entries = A.empty<SchemaFirstInventoryEntry>();
  const pushEntry = (
    file: string,
    symbol: string,
    kind: typeof SchemaFirstEntryKind.Type,
    status: typeof SchemaFirstEntryStatus.Type,
    reason: string,
    owner: string
  ) =>
    void entries.push(
      new SchemaFirstInventoryEntry({
        file,
        symbol,
        kind,
        status,
        reason,
        owner,
      })
    );

  for (const sourceFile of project.getSourceFiles()) {
    const filePath = toPosixPath(path.relative(process.cwd(), sourceFile.getFilePath()));
    if (isExcludedFile(filePath)) {
      continue;
    }

    const owner = ownerResolver(sourceFile.getFilePath());

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
  }

  return new SchemaFirstInventoryDocument({
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

  return new SchemaFirstInventoryDocument({
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
 * @category UseCase
 * @since 0.0.0
 */
export const runSchemaFirstLint = Effect.fn(function* (options: SchemaFirstLintOptions) {
  const liveDocument = yield* scanSchemaFirstInventory();
  const existingDocument = yield* readInventoryDocument();
  const mergedDocument = mergeInventory(liveDocument, existingDocument);

  const liveByKey = HashMap.fromIterable(
    liveDocument.entries.map((entry): readonly [string, SchemaFirstInventoryEntry] => [makeEntryKey(entry), entry])
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
  const enforcedCandidates = A.filter(
    mergedDocument.entries,
    (entry) => entry.status === "candidate" && isEnforcedFile(entry.file)
  );

  if (options.write) {
    yield* writeInventoryDocument(mergedDocument);
  }

  yield* Console.log(`[schema-first] live_entries=${liveDocument.entries.length}`);
  yield* Console.log(`[schema-first] tracked_entries=${mergedDocument.entries.length}`);
  yield* Console.log(`[schema-first] missing_entries=${missingEntries.length}`);
  yield* Console.log(`[schema-first] stale_entries=${staleEntries.length}`);
  yield* Console.log(`[schema-first] enforced_candidates=${enforcedCandidates.length}`);
  if (options.write) {
    yield* Console.log(`[schema-first] wrote ${INVENTORY_PATH}`);
  }

  if (missingEntries.length > 0) {
    yield* Console.error("[schema-first] untracked live findings:");
    for (const entry of missingEntries) {
      yield* Console.error(`- ${entry.file} :: ${entry.symbol} [${entry.kind}] ${entry.reason}`);
    }
  }

  if (staleEntries.length > 0) {
    yield* Console.error("[schema-first] stale inventory entries:");
    for (const entry of staleEntries) {
      yield* Console.error(`- ${entry.file} :: ${entry.symbol} [${entry.kind}]`);
    }
  }

  if (enforcedCandidates.length > 0) {
    yield* Console.error("[schema-first] enforced roots still contain candidate findings:");
    for (const entry of enforcedCandidates) {
      yield* Console.error(`- ${entry.file} :: ${entry.symbol} [${entry.kind}] ${entry.reason}`);
    }
  }

  const hasFailures = options.write
    ? enforcedCandidates.length > 0
    : missingEntries.length > 0 || staleEntries.length > 0 || enforcedCandidates.length > 0;
  if (hasFailures) {
    process.exitCode = 1;
  }

  return new SchemaFirstLintSummary({
    liveEntries: liveDocument.entries.length,
    trackedEntries: mergedDocument.entries.length,
    missingEntries: missingEntries.length,
    staleEntries: staleEntries.length,
    enforcedCandidates: enforcedCandidates.length,
    wroteInventory: options.write,
  });
});

/**
 * Repo-wide schema-first lint command.
 *
 * @category UseCase
 * @since 0.0.0
 */
export const lintSchemaFirstCommand = Command.make(
  "schema-first",
  {
    write: Flag.boolean("write").pipe(Flag.withDescription("Refresh standards/schema-first.inventory.jsonc")),
  },
  Effect.fn(function* ({ write }) {
    yield* runSchemaFirstLint(new SchemaFirstLintOptions({ write }));
  })
).pipe(Command.withDescription("Verify the repo-wide schema-first inventory baseline"));
