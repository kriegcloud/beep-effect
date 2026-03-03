// cspell:ignore scip tsmorph

import { createHash } from "node:crypto";
import { NonNegativeInt } from "@beep/schema";
import { Effect, MutableHashSet, Order, Path, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as Queue from "effect/Queue";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { type FunctionDeclaration, Node, type SourceFile, SyntaxKind, type VariableDeclaration } from "ts-morph";
import { CodebaseGraph, type EdgeKind, type NodeKind } from "../models.js";
import { type TsMorphQueryError, TsMorphSymbolNotFoundError } from "./errors.js";
import {
  type TsMorphDeclarationTarget,
  type TsMorphDeclarationTargetKind,
  type TsMorphProjectContext,
  type TsMorphSearchSymbolsRequest,
  TsMorphSymbolMatch,
  type TsMorphSymbolSelector,
  type TsMorphTraverseDependenciesRequest,
} from "./models.js";
import { parseSymbolId } from "./project-scope.js";

const normalizePath = (value: string): string => Str.replace(/\\/g, "/")(value);

const normalizeText = (value: string): string => Str.replace(/\s+/g, " ")(Str.trim(value));

const sha256Hex = (value: string): string => createHash("sha256").update(value, "utf8").digest("hex");
const decodeNonNegativeInt = S.decodeUnknownSync(NonNegativeInt);

const makeSymbolId = (
  kind: NodeKind,
  filePath: string,
  name: string,
  workspace: string,
  mode: "graph-v2" | "scip-hash"
): string => {
  const normalizedFilePath = normalizePath(filePath);
  const normalizedName = normalizeText(name);

  if (mode === "graph-v2") {
    return `${kind}::${normalizedFilePath}::${normalizedName}`;
  }

  const digest = sha256Hex([workspace, normalizedFilePath, normalizedName, kind].join("|"));
  return `${workspace}::${normalizedFilePath}::${normalizedName}::${kind}::${digest}`;
};

const optionValue = <A>(value: O.Option<A>): A | undefined => (O.isSome(value) ? value.value : undefined);

const toRelativePath = (path: Path.Path, absolutePath: string, rootDir: string): string =>
  normalizePath(path.relative(rootDir, absolutePath));

const isTestFile = (filePath: string): boolean =>
  Str.includes(".test.")(filePath) ||
  Str.includes(".spec.")(filePath) ||
  Str.includes("__tests__/")(filePath) ||
  Str.includes("__test__/")(filePath);

const isJsxDeclaration = (declaration: FunctionDeclaration | VariableDeclaration): boolean => {
  try {
    const returnType = declaration.getType().getText(declaration);
    if (
      Str.includes("JSX.Element")(returnType) ||
      Str.includes("ReactElement")(returnType) ||
      Str.includes("ReactNode")(returnType)
    ) {
      return true;
    }

    return (
      declaration.getDescendantsOfKind(SyntaxKind.JsxElement).length > 0 ||
      declaration.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement).length > 0
    );
  } catch {
    return false;
  }
};

const declarationTargetKind = (declaration: Node): O.Option<TsMorphDeclarationTargetKind> => {
  if (Node.isFunctionDeclaration(declaration)) {
    return O.some("function");
  }
  if (Node.isClassDeclaration(declaration)) {
    return O.some("class");
  }
  if (Node.isInterfaceDeclaration(declaration)) {
    return O.some("interface");
  }
  if (Node.isTypeAliasDeclaration(declaration)) {
    return O.some("type_alias");
  }
  if (Node.isEnumDeclaration(declaration)) {
    return O.some("enum");
  }
  if (Node.isMethodDeclaration(declaration)) {
    return O.some("method");
  }
  if (Node.isConstructorDeclaration(declaration)) {
    return O.some("constructor");
  }
  if (Node.isGetAccessorDeclaration(declaration)) {
    return O.some("getter");
  }
  if (Node.isSetAccessorDeclaration(declaration)) {
    return O.some("setter");
  }
  if (Node.isPropertyDeclaration(declaration) || Node.isPropertySignature(declaration)) {
    return O.some("property");
  }
  if (Node.isVariableDeclaration(declaration)) {
    return O.some("variable");
  }
  if (Node.isModuleDeclaration(declaration)) {
    return O.some("module_declaration");
  }

  return O.none();
};

const declarationGraphKind = (declaration: Node, kind: TsMorphDeclarationTargetKind): NodeKind => {
  if (kind === "function" && Node.isFunctionDeclaration(declaration) && isJsxDeclaration(declaration)) {
    return "jsx_component";
  }

  if (kind === "variable" && Node.isVariableDeclaration(declaration) && isJsxDeclaration(declaration)) {
    return "jsx_component";
  }

  return kind;
};

const fallbackAnonymousName = (declaration: Node): string => `<anonymous:${declaration.getStartLineNumber()}>`;

const parentClassName = (declaration: Node): string | undefined => {
  const cls = declaration.getParentIfKind(SyntaxKind.ClassDeclaration);
  return cls?.getName();
};

const parentInterfaceName = (declaration: Node): string | undefined => {
  const iface = declaration.getParentIfKind(SyntaxKind.InterfaceDeclaration);
  return iface?.getName();
};

const declarationSymbolName = (declaration: Node, kind: TsMorphDeclarationTargetKind): string => {
  if (kind === "function" && Node.isFunctionDeclaration(declaration)) {
    return declaration.getName() ?? fallbackAnonymousName(declaration);
  }

  if (kind === "class" && Node.isClassDeclaration(declaration)) {
    return declaration.getName() ?? fallbackAnonymousName(declaration);
  }

  if (kind === "interface" && Node.isInterfaceDeclaration(declaration)) {
    return declaration.getName();
  }

  if (kind === "type_alias" && Node.isTypeAliasDeclaration(declaration)) {
    return declaration.getName();
  }

  if (kind === "enum" && Node.isEnumDeclaration(declaration)) {
    return declaration.getName();
  }

  if (kind === "method" && Node.isMethodDeclaration(declaration)) {
    const owner = parentClassName(declaration) ?? parentInterfaceName(declaration) ?? "";
    return Str.isNonEmpty(owner) ? `${owner}.${declaration.getName()}` : declaration.getName();
  }

  if (kind === "constructor" && Node.isConstructorDeclaration(declaration)) {
    const owner = parentClassName(declaration) ?? "";
    return Str.isNonEmpty(owner) ? `${owner}.constructor` : "constructor";
  }

  if (kind === "getter" && Node.isGetAccessorDeclaration(declaration)) {
    const owner = parentClassName(declaration) ?? "";
    return Str.isNonEmpty(owner) ? `${owner}.get:${declaration.getName()}` : `get:${declaration.getName()}`;
  }

  if (kind === "setter" && Node.isSetAccessorDeclaration(declaration)) {
    const owner = parentClassName(declaration) ?? "";
    return Str.isNonEmpty(owner) ? `${owner}.set:${declaration.getName()}` : `set:${declaration.getName()}`;
  }

  if (kind === "property") {
    if (Node.isPropertyDeclaration(declaration) || Node.isPropertySignature(declaration)) {
      const classOwner = parentClassName(declaration);
      if (classOwner !== undefined) {
        return `${classOwner}.${declaration.getName()}`;
      }

      const interfaceOwner = parentInterfaceName(declaration);
      if (interfaceOwner !== undefined) {
        return `${interfaceOwner}.${declaration.getName()}`;
      }

      return declaration.getName();
    }
  }

  if (kind === "variable" && Node.isVariableDeclaration(declaration)) {
    return declaration.getName();
  }

  if (kind === "module_declaration" && Node.isModuleDeclaration(declaration)) {
    return declaration.getName();
  }

  return fallbackAnonymousName(declaration);
};

const listSourceFiles = (context: TsMorphProjectContext): ReadonlyArray<SourceFile> =>
  pipe(
    context.project.getSourceFiles(),
    A.filter((sourceFile) => {
      const filePath = sourceFile.getFilePath();
      return !Str.includes("node_modules")(filePath) && !Str.endsWith(".d.ts")(filePath);
    })
  );

const collectTargetsInSourceFile = (
  path: Path.Path,
  context: TsMorphProjectContext,
  sourceFile: SourceFile,
  rootDir: string,
  workspace: string
): ReadonlyArray<TsMorphDeclarationTarget> => {
  const filePath = toRelativePath(path, sourceFile.getFilePath(), rootDir);
  const targets: Array<TsMorphDeclarationTarget> = [];

  const pushDeclaration = (declaration: Node): void => {
    const targetKind = declarationTargetKind(declaration);
    if (O.isNone(targetKind)) {
      return;
    }

    const kind = targetKind.value;
    const symbolName = declarationSymbolName(declaration, kind);
    const graphKind = declarationGraphKind(declaration, kind);
    const symbolId = makeSymbolId(graphKind, filePath, symbolName, workspace, context.scope.idMode);

    targets.push({
      symbolId,
      filePath,
      symbolName,
      kind,
      declaration,
    });
  };

  for (const declaration of sourceFile.getFunctions()) {
    pushDeclaration(declaration);
  }

  for (const statement of sourceFile.getVariableStatements()) {
    for (const declaration of statement.getDeclarations()) {
      pushDeclaration(declaration);
    }
  }

  for (const declaration of sourceFile.getClasses()) {
    pushDeclaration(declaration);
    for (const constructorDeclaration of declaration.getConstructors()) {
      pushDeclaration(constructorDeclaration);
    }
    for (const method of declaration.getMethods()) {
      pushDeclaration(method);
    }
    for (const getter of declaration.getGetAccessors()) {
      pushDeclaration(getter);
    }
    for (const setter of declaration.getSetAccessors()) {
      pushDeclaration(setter);
    }
    for (const property of declaration.getProperties()) {
      pushDeclaration(property);
    }
  }

  for (const declaration of sourceFile.getInterfaces()) {
    pushDeclaration(declaration);
    for (const method of declaration.getMethods()) {
      pushDeclaration(method);
    }
    for (const property of declaration.getProperties()) {
      pushDeclaration(property);
    }
  }

  for (const declaration of sourceFile.getTypeAliases()) {
    pushDeclaration(declaration);
  }

  for (const declaration of sourceFile.getEnums()) {
    pushDeclaration(declaration);
  }

  for (const declaration of sourceFile.getModules()) {
    pushDeclaration(declaration);
  }

  return targets;
};

/**
 * Collect all declaration targets in a project context.
 *
 * @param context - Runtime project context.
 * @returns Deterministically-sorted declaration targets.
 * @category Uncategorized
 * @since 0.0.0
 */
export const collectProjectDeclarationTargets: (
  context: TsMorphProjectContext
) => Effect.Effect<ReadonlyArray<TsMorphDeclarationTarget>, never, Path.Path> = Effect.fn(function* (context) {
  const path = yield* Path.Path;
  const rootDir = path.dirname(context.scope.rootTsConfigPath);
  const workspace = path.basename(rootDir);

  return pipe(
    listSourceFiles(context),
    A.flatMap((sourceFile) => collectTargetsInSourceFile(path, context, sourceFile, rootDir, workspace)),
    A.sort(Order.mapInput(Order.String, (target: TsMorphDeclarationTarget) => target.symbolId))
  );
});

/**
 * Resolve a symbol selector to a declaration target.
 *
 * @param context - Runtime project context.
 * @param selector - Symbol selector payload.
 * @returns Resolved declaration target.
 * @category Uncategorized
 * @since 0.0.0
 */
export const resolveDeclarationTarget: (
  context: TsMorphProjectContext,
  selector: TsMorphSymbolSelector
) => Effect.Effect<TsMorphDeclarationTarget, TsMorphSymbolNotFoundError, Path.Path> = Effect.fn(
  function* (context, selector) {
    const parsedSymbol = parseSymbolId(selector.symbolId);
    const parsedKind = O.isSome(parsedSymbol) ? parsedSymbol.value[0] : undefined;
    const parsedFilePath = O.isSome(parsedSymbol) ? parsedSymbol.value[1] : undefined;
    const parsedSymbolName = O.isSome(parsedSymbol) ? parsedSymbol.value[2] : undefined;

    const requestedFilePath = optionValue(selector.filePath) ?? parsedFilePath;
    const requestedSymbolName = optionValue(selector.symbolName) ?? parsedSymbolName;

    const path = yield* Path.Path;
    const rootDir = path.dirname(context.scope.rootTsConfigPath);

    const allTargets = yield* collectProjectDeclarationTargets(context);

    const scopedTargets =
      requestedFilePath === undefined
        ? allTargets
        : pipe(
            allTargets,
            A.filter((target) => {
              const normalizedRequested = normalizePath(
                path.isAbsolute(requestedFilePath) ? requestedFilePath : path.resolve(rootDir, requestedFilePath)
              );
              const normalizedTarget = normalizePath(path.resolve(rootDir, target.filePath));
              return normalizedTarget === normalizedRequested;
            })
          );

    const byName =
      requestedSymbolName === undefined
        ? scopedTargets
        : pipe(
            scopedTargets,
            A.filter((target) => target.symbolName === requestedSymbolName)
          );

    const byKind =
      parsedKind === undefined
        ? byName
        : pipe(
            byName,
            A.filter((target) => {
              const candidate = parseSymbolId(target.symbolId);
              if (O.isNone(candidate)) {
                return false;
              }
              return candidate.value[0] === parsedKind;
            })
          );

    const exactById = pipe(
      byKind,
      A.filter((target) => target.symbolId === selector.symbolId)
    );
    const selected =
      exactById.length > 0
        ? exactById[0]
        : pipe(byKind, A.sort(Order.mapInput(Order.String, (target: TsMorphDeclarationTarget) => target.symbolId)))[0];

    if (selected === undefined) {
      return yield* new TsMorphSymbolNotFoundError({
        message: `Could not resolve symbol selector: ${selector.symbolId}`,
        symbolId: selector.symbolId,
      });
    }

    return selected;
  }
);

const searchMatchKind = (target: TsMorphDeclarationTarget): NodeKind => {
  const parsed = parseSymbolId(target.symbolId);
  return O.isSome(parsed) ? (parsed.value[0] as NodeKind) : target.kind;
};

/**
 * Search symbols in the current project scope.
 *
 * @param context - Runtime project context.
 * @param request - Query payload with text, optional kind filter, and limit.
 * @returns Deterministic symbol matches.
 * @category Uncategorized
 * @since 0.0.0
 */
export const searchSymbolsInContext: (
  context: TsMorphProjectContext,
  request: TsMorphSearchSymbolsRequest
) => Effect.Effect<ReadonlyArray<TsMorphSymbolMatch>, TsMorphQueryError, Path.Path> = Effect.fn(
  function* (context, request) {
    const query = Str.toLowerCase(request.query);
    const requestedKind = optionValue(request.kind);
    const limit = optionValue(request.limit) ?? 50;

    const targets = yield* collectProjectDeclarationTargets(context);

    const matches = pipe(
      targets,
      A.filter((target) => {
        const candidateKind = searchMatchKind(target);
        if (requestedKind !== undefined && candidateKind !== requestedKind) {
          return false;
        }

        return (
          Str.includes(query)(Str.toLowerCase(target.symbolName)) ||
          Str.includes(query)(Str.toLowerCase(target.symbolId)) ||
          Str.includes(query)(Str.toLowerCase(target.filePath))
        );
      }),
      A.map(
        (target) =>
          new TsMorphSymbolMatch({
            symbolId: target.symbolId,
            kind: searchMatchKind(target),
            label: target.symbolName,
            filePath: target.filePath,
            line: decodeNonNegativeInt(target.declaration.getStartLineNumber()),
          })
      ),
      A.sort(Order.mapInput(Order.String, (match: TsMorphSymbolMatch) => `${match.symbolId}|${match.line}`))
    );

    return matches.slice(0, limit);
  }
);

const countKinds = (nodes: ReadonlyArray<(typeof CodebaseGraph.Type.nodes)[number]>): Record<string, number> => {
  const counts: Record<string, number> = Object.create(null) as Record<string, number>;

  for (const node of nodes) {
    const current = counts[node.kind] ?? 0;
    counts[node.kind] = current + 1;
  }

  return counts;
};

const edgeTraversalKinds: ReadonlyArray<EdgeKind> = [
  "imports",
  "re_exports",
  "exports",
  "calls",
  "conditional_calls",
  "instantiates",
  "extends",
  "implements",
  "overrides",
  "contains",
  "has_method",
  "has_constructor",
  "has_property",
  "has_getter",
  "has_setter",
  "has_parameter",
  "has_member",
  "type_reference",
  "return_type",
  "generic_constraint",
  "reads_property",
  "writes_property",
  "decorates",
  "throws",
  "test_covers",
  "uses_type",
];

/**
 * Traverse dependencies in a pre-extracted graph.
 *
 * @param graph - Source graph.
 * @param request - Dependency traversal request.
 * @returns Dependency subgraph.
 * @category Uncategorized
 * @since 0.0.0
 */
export const traverseDependenciesInGraph: (
  graph: typeof CodebaseGraph.Type,
  request: TsMorphTraverseDependenciesRequest
) => Effect.Effect<typeof CodebaseGraph.Type, TsMorphQueryError> = Effect.fn(function* (graph, request) {
  const maxHops = optionValue(request.maxHops) ?? decodeNonNegativeInt(2);
  const visited = MutableHashSet.empty<string>();
  const queue = yield* Queue.unbounded<readonly [string, number]>();

  MutableHashSet.add(visited, request.symbolId);
  yield* Queue.offer(queue, [request.symbolId, 0] as const);

  while (true) {
    const currentItem = yield* Queue.poll(queue);
    if (O.isNone(currentItem)) {
      break;
    }

    const [current, hop] = currentItem.value;
    if (hop >= maxHops) {
      continue;
    }

    for (const edge of graph.edges) {
      if (!edgeTraversalKinds.includes(edge.kind)) {
        continue;
      }

      const neighbor =
        request.direction === "downstream"
          ? edge.source === current
            ? edge.target
            : undefined
          : edge.target === current
            ? edge.source
            : undefined;

      if (neighbor === undefined || MutableHashSet.has(visited, neighbor)) {
        continue;
      }

      MutableHashSet.add(visited, neighbor);
      yield* Queue.offer(queue, [neighbor, hop + 1] as const);
    }
  }

  const nodes = pipe(
    graph.nodes,
    A.filter((node) => MutableHashSet.has(visited, node.id)),
    A.sort(Order.mapInput(Order.String, (node: (typeof graph.nodes)[number]) => node.id))
  );

  const edges = pipe(
    graph.edges,
    A.filter((edge) => MutableHashSet.has(visited, edge.source) && MutableHashSet.has(visited, edge.target)),
    A.sort(
      Order.mapInput(
        Order.String,
        (edge: (typeof graph.edges)[number]) =>
          `${edge.source}|${edge.target}|${edge.kind}|${optionValue(edge.label) ?? ""}`
      )
    )
  );

  return new CodebaseGraph({
    nodes,
    edges,
    meta: {
      ...graph.meta,
      fileCount: pipe(
        nodes,
        A.filter((node) => node.kind === "file"),
        (value) => decodeNonNegativeInt(value.length)
      ),
      nodeCount: decodeNonNegativeInt(nodes.length),
      edgeCount: decodeNonNegativeInt(edges.length),
      nodeKinds: countKinds(nodes),
      nodeKindCounts: countKinds(nodes),
    },
  });
});

/**
 * Build a stable function-like signature text.
 *
 * @param target - Resolved declaration target.
 * @returns Signature text.
 * @category Uncategorized
 * @since 0.0.0
 */
export const buildDeclarationSignature = (target: TsMorphDeclarationTarget): string => {
  const declaration = target.declaration;
  const declarationPrefix = pipe(
    Str.split("{")(declaration.getText()),
    A.head,
    O.map(Str.trim),
    O.getOrElse(() => Str.trim(declaration.getText()))
  );

  if (Node.isFunctionDeclaration(declaration) || Node.isMethodDeclaration(declaration)) {
    return declarationPrefix;
  }

  if (Node.isConstructorDeclaration(declaration)) {
    return declarationPrefix;
  }

  if (Node.isGetAccessorDeclaration(declaration) || Node.isSetAccessorDeclaration(declaration)) {
    return declarationPrefix;
  }

  if (
    Node.isClassDeclaration(declaration) ||
    Node.isInterfaceDeclaration(declaration) ||
    Node.isTypeAliasDeclaration(declaration) ||
    Node.isEnumDeclaration(declaration)
  ) {
    return declarationPrefix;
  }

  if (Node.isVariableDeclaration(declaration)) {
    const statement = declaration.getVariableStatement();
    const exported = statement?.isExported() ?? false;
    const name = declaration.getName();
    const typeText = declaration.getType().getText(declaration);
    return `${exported ? "export " : ""}${name}: ${typeText}`;
  }

  if (Node.isModuleDeclaration(declaration)) {
    return declarationPrefix;
  }

  return Str.trim(declaration.getText());
};

/**
 * Detect whether a symbol corresponds to a test target candidate.
 *
 * @param target - Target symbol.
 * @returns Whether it belongs to non-test code.
 * @category Uncategorized
 * @since 0.0.0
 */
export const isProductionTarget = (target: TsMorphDeclarationTarget): boolean => !isTestFile(target.filePath);

/**
 * Decode an unknown graph payload into a `CodebaseGraph`.
 *
 * @param value - Unknown payload.
 * @returns Decoded graph.
 * @category Uncategorized
 * @since 0.0.0
 */
export const decodeCodebaseGraph = S.decodeUnknownEffect(CodebaseGraph);
