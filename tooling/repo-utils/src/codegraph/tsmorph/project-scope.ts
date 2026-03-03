// cspell:ignore tsconfig tsmorph scip
import { Effect, FileSystem, MutableHashSet, Order, Path, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as Queue from "effect/Queue";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { Project } from "ts-morph";
import { TsMorphProjectInitError, TsMorphProjectScopeError } from "./errors.js";
import {
  resolveIdMode,
  type TsMorphProjectContext,
  TsMorphProjectScope,
  type TsMorphProjectScopeRequest,
} from "./models.js";

const TsConfigReference = S.Struct({
  path: S.String,
});

const TsConfigJson = S.Struct({
  references: S.OptionFromOptionalKey(S.Array(TsConfigReference)),
});

const decodeJson = S.decodeUnknownEffect(S.UnknownFromJsonString);
const decodeTsConfig = S.decodeUnknownEffect(TsConfigJson);

const normalizePath = (value: string): string => Str.replace(/\\/g, "/")(value);

const readTsConfigReferences: (
  fileSystem: FileSystem.FileSystem,
  filePath: string
) => Effect.Effect<ReadonlyArray<string>, TsMorphProjectScopeError> = Effect.fnUntraced(
  function* (fileSystem, filePath) {
    const content = yield* fileSystem.readFileString(filePath).pipe(
      Effect.mapError(
        (cause) =>
          new TsMorphProjectScopeError({
            message: `Failed reading tsconfig at ${filePath}`,
            cause,
          })
      )
    );

    const raw = yield* decodeJson(content).pipe(
      Effect.mapError(
        (cause) =>
          new TsMorphProjectScopeError({
            message: `Failed parsing tsconfig JSON at ${filePath}`,
            cause,
          })
      )
    );

    const decoded = yield* decodeTsConfig(raw).pipe(
      Effect.mapError(
        (cause) =>
          new TsMorphProjectScopeError({
            message: `Failed decoding tsconfig structure at ${filePath}`,
            cause,
          })
      )
    );

    return pipe(
      decoded.references,
      O.getOrElse(() => A.empty<typeof TsConfigReference.Type>()),
      A.map((entry) => entry.path)
    );
  }
);

const resolveReferencePath = (path: Path.Path, baseTsConfigPath: string, reference: string): string => {
  const baseDir = path.dirname(baseTsConfigPath);
  const absoluteBase = path.resolve(baseDir, reference);

  if (Str.endsWith(".json")(absoluteBase)) {
    return absoluteBase;
  }

  return path.join(absoluteBase, "tsconfig.json");
};

interface ScopeGraph {
  readonly resolved: ReadonlyArray<string>;
  readonly adjacency: Readonly<Record<string, ReadonlyArray<string>>>;
  readonly reverseAdjacency: Readonly<Record<string, ReadonlyArray<string>>>;
}

const insertAdjacency = (
  source: Record<string, ReadonlyArray<string>>,
  from: string,
  to: string
): Record<string, ReadonlyArray<string>> => {
  const existing = source[from] ?? A.empty<string>();
  if (A.contains(existing, to)) {
    return source;
  }
  source[from] = A.append(existing, to);
  return source;
};

const fileExists: (fileSystem: FileSystem.FileSystem, filePath: string) => Effect.Effect<boolean> = Effect.fnUntraced(
  function* (fileSystem, filePath) {
    return yield* fileSystem.exists(filePath).pipe(
      Effect.match({
        onFailure: () => false,
        onSuccess: (value) => value,
      })
    );
  }
);

const buildScopeGraph: (
  fileSystem: FileSystem.FileSystem,
  path: Path.Path,
  rootTsConfigPath: string
) => Effect.Effect<ScopeGraph, TsMorphProjectScopeError> = Effect.fnUntraced(
  function* (fileSystem, path, rootTsConfigPath) {
    const normalizedRoot = path.resolve(rootTsConfigPath);
    const visited = MutableHashSet.empty<string>();
    const queue = yield* Queue.unbounded<string>();
    const resolved: Array<string> = [];
    const adjacency: Record<string, ReadonlyArray<string>> = {};
    const reverseAdjacency: Record<string, ReadonlyArray<string>> = {};

    yield* Queue.offer(queue, normalizedRoot);

    while (true) {
      const current = yield* Queue.poll(queue);
      if (O.isNone(current)) {
        break;
      }

      const normalizedCurrent = path.resolve(current.value);
      if (MutableHashSet.has(visited, normalizedCurrent)) {
        continue;
      }

      MutableHashSet.add(visited, normalizedCurrent);
      const currentExists = yield* fileExists(fileSystem, normalizedCurrent);
      if (!currentExists) {
        continue;
      }

      resolved.push(normalizedCurrent);
      const references = yield* readTsConfigReferences(fileSystem, normalizedCurrent);

      for (const reference of references) {
        const target = resolveReferencePath(path, normalizedCurrent, reference);
        const targetExists = yield* fileExists(fileSystem, target);
        if (!targetExists) {
          continue;
        }

        insertAdjacency(adjacency, normalizedCurrent, target);
        insertAdjacency(reverseAdjacency, target, normalizedCurrent);
        yield* Queue.offer(queue, target);
      }
    }

    return {
      resolved: pipe(resolved, A.sort(Order.String)),
      adjacency,
      reverseAdjacency,
    };
  }
);

const resolveChangedFiles = (
  path: Path.Path,
  rootTsConfigPath: string,
  changedFiles: O.Option<ReadonlyArray<string>>
): ReadonlyArray<string> => {
  const rootDir = path.dirname(path.resolve(rootTsConfigPath));

  return pipe(
    changedFiles,
    O.getOrElse(() => A.empty<string>()),
    A.map((filePath) => {
      if (path.isAbsolute(filePath)) {
        return normalizePath(path.resolve(filePath));
      }
      return normalizePath(path.resolve(rootDir, filePath));
    }),
    A.dedupe,
    A.sort(Order.String)
  );
};

const scopeMatchesChangedFile = (path: Path.Path, tsConfigPath: string, changedFile: string): boolean => {
  const scopeDir = normalizePath(path.dirname(tsConfigPath));
  return Str.startsWith(`${scopeDir}/`)(changedFile) || changedFile === scopeDir;
};

const expandSelection: (
  seeds: ReadonlyArray<string>,
  adjacency: Readonly<Record<string, ReadonlyArray<string>>>
) => Effect.Effect<ReadonlyArray<string>> = Effect.fnUntraced(function* (seeds, adjacency) {
  const visited = MutableHashSet.empty<string>();
  const queue = yield* Queue.unbounded<string>();
  yield* Queue.offerAll(queue, seeds);

  while (true) {
    const current = yield* Queue.poll(queue);
    if (O.isNone(current) || MutableHashSet.has(visited, current.value)) {
      if (O.isNone(current)) {
        break;
      }
      continue;
    }

    MutableHashSet.add(visited, current.value);

    const forward = adjacency[current.value] ?? A.empty<string>();

    for (const next of forward) {
      if (!MutableHashSet.has(visited, next)) {
        yield* Queue.offer(queue, next);
      }
    }
  }

  return pipe(visited, A.fromIterable, A.sort(Order.String));
});

/**
 * Resolve a ts-morph project scope using root tsconfig references and changed-file hints.
 *
 * @param request - Scope request payload.
 * @returns Resolved project scope.
 * @category codegraph-tsmorph
 * @since 0.0.0
 */
export const resolveTsMorphProjectScope: (
  request: TsMorphProjectScopeRequest
) => Effect.Effect<TsMorphProjectScope, TsMorphProjectScopeError, FileSystem.FileSystem | Path.Path> = Effect.fn(
  function* (request) {
    const fileSystem = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;

    const rootTsConfigPath = path.resolve(request.rootTsConfigPath);
    const graph = yield* buildScopeGraph(fileSystem, path, rootTsConfigPath);
    if (graph.resolved.length === 0) {
      return yield* new TsMorphProjectScopeError({
        message: `No tsconfig files were resolved from ${rootTsConfigPath}`,
      });
    }

    const normalizedChangedFiles = resolveChangedFiles(path, rootTsConfigPath, request.changedFiles);

    const candidateSeedScopes =
      normalizedChangedFiles.length === 0
        ? graph.resolved
        : pipe(
            graph.resolved,
            A.filter((scopePath) =>
              normalizedChangedFiles.some((changedFile) => scopeMatchesChangedFile(path, scopePath, changedFile))
            )
          );

    const seedScopes =
      normalizedChangedFiles.length === 0
        ? candidateSeedScopes
        : pipe(
            candidateSeedScopes,
            A.filter((scopePath) => {
              const scopeDir = normalizePath(path.dirname(scopePath));
              return !candidateSeedScopes.some((otherScopePath) => {
                if (otherScopePath === scopePath) {
                  return false;
                }
                const otherDir = normalizePath(path.dirname(otherScopePath));
                return Str.startsWith(`${scopeDir}/`)(otherDir);
              });
            })
          );

    const selectedTsConfigPaths =
      seedScopes.length === 0 ? graph.resolved : yield* expandSelection(seedScopes, graph.adjacency);

    return new TsMorphProjectScope({
      rootTsConfigPath: normalizePath(rootTsConfigPath),
      resolvedTsConfigPaths: pipe(graph.resolved, A.map(normalizePath)),
      selectedTsConfigPaths: pipe(selectedTsConfigPaths, A.map(normalizePath)),
      changedFiles: normalizedChangedFiles,
      idMode: resolveIdMode(request.idMode),
    });
  }
);

/**
 * Construct a fresh ts-morph runtime context for a resolved scope.
 *
 * @param scope - Scope derived from project references and change hints.
 * @returns Runtime context with project and type checker.
 * @category codegraph-tsmorph
 * @since 0.0.0
 */
export const createTsMorphProjectContext: (
  scope: TsMorphProjectScope
) => Effect.Effect<TsMorphProjectContext, TsMorphProjectInitError> = Effect.fn(function* (scope) {
  return yield* Effect.try({
    try: () => {
      const project = new Project({
        skipAddingFilesFromTsConfig: true,
      });

      for (const configPath of scope.selectedTsConfigPaths) {
        project.addSourceFilesFromTsConfig(configPath);
      }

      const checker = project.getTypeChecker();

      return {
        scope,
        project,
        checker,
      };
    },
    catch: (cause) =>
      new TsMorphProjectInitError({
        message: `Failed creating ts-morph project for ${scope.rootTsConfigPath}`,
        cause,
      }),
  });
});

/**
 * Parse a symbol id into `{ kind, filePath, symbolName }` using graph-v2 or scip-hash shapes.
 *
 * @param symbolId - Symbol id to parse.
 * @returns Parsed components when the format is recognized.
 * @category codegraph-tsmorph
 * @since 0.0.0
 */
export const parseSymbolId = (symbolId: string): O.Option<readonly [string, string, string]> => {
  const segments = pipe(Str.split("::")(symbolId), A.filter(Str.isNonEmpty));

  const parsed =
    segments.length >= 5
      ? [segments[3], segments[1], segments[2]]
      : segments.length >= 3
        ? [segments[0], segments[1], segments[2]]
        : undefined;

  if (parsed === undefined) {
    return O.none();
  }

  const [kind, filePath, symbolName] = parsed;
  if (kind === undefined || filePath === undefined || symbolName === undefined) {
    return O.none();
  }

  return O.some([kind, filePath, symbolName] as const);
};
