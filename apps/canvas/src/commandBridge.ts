/**
 * App-local canvas command bridge.
 *
 * @packageDocumentation
 * @category commands
 * @since 0.0.0
 */

import * as DomainCanvasProject from "@beep/canvas-domain/aggregates/CanvasProject";
import { CanvasProjectServer, CanvasServerLive } from "@beep/canvas-server/layer";
import { CanvasProject as CanvasProjectUseCases } from "@beep/canvas-use-cases/public";
import { $CanvasId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import { Effect, HashMap, ManagedRuntime, Ref } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const $I = $CanvasId.create("commandBridge");

/**
 * Managed runtime for app-local canvas command effects.
 *
 * @example
 * ```ts
 * import { makeCanvasCommandRuntime } from "@beep/canvas"
 *
 * const runtime = makeCanvasCommandRuntime()
 * void runtime.dispose()
 * ```
 *
 * @category commands
 * @since 0.0.0
 */
export const makeCanvasCommandRuntime = () => ManagedRuntime.make(CanvasServerLive);

/**
 * Runtime returned by {@link makeCanvasCommandRuntime}.
 *
 * @example
 * ```ts
 * import { makeCanvasCommandRuntime } from "@beep/canvas"
 * import type { CanvasCommandRuntime } from "@beep/canvas"
 *
 * const runtime: CanvasCommandRuntime = makeCanvasCommandRuntime()
 * void runtime.dispose()
 * ```
 *
 * @category commands
 * @since 0.0.0
 */
export type CanvasCommandRuntime = ReturnType<typeof makeCanvasCommandRuntime>;

/**
 * Native command names exposed by the canvas app shell.
 *
 * @example
 * ```ts
 * import { commandSurface } from "@beep/canvas"
 *
 * const exposesSave = commandSurface.includes("scene_save")
 * ```
 *
 * @category commands
 * @since 0.0.0
 */
export const commandSurface = [
  "canvas_health",
  "scene_create",
  "scene_list",
  "scene_get",
  "scene_archive",
  "scene_node_add",
  "scene_node_remove",
  "scene_save",
  "scene_load",
] as const;

/**
 * Native command name schema for the canvas app shell.
 *
 * @example
 * ```ts
 * import { CanvasCommandName } from "@beep/canvas"
 * import * as S from "effect/Schema"
 *
 * const decodeCommandName = S.decodeUnknownEffect(CanvasCommandName)
 * ```
 *
 * @category commands
 * @since 0.0.0
 */
export const CanvasCommandName = LiteralKit(commandSurface).pipe(
  $I.annoteSchema("CanvasCommandName", {
    description: "Native command name exposed by the canvas app shell.",
  })
);

/**
 * Type for {@link CanvasCommandName}.
 *
 * @example
 * ```ts
 * import type { CanvasCommandName } from "@beep/canvas"
 *
 * const commandName: CanvasCommandName = "canvas_health"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type CanvasCommandName = typeof CanvasCommandName.Type;

const CanvasHealthStatus = LiteralKit(["preview", "ready"] as const).pipe(
  $I.annoteSchema("CanvasHealthStatus", {
    description: "Canvas shell health lifecycle status.",
  })
);

/**
 * Canvas shell health payload.
 *
 * @example
 * ```ts
 * import { CanvasHealth } from "@beep/canvas"
 *
 * const health = new CanvasHealth({
 *   app: "@beep/canvas",
 *   commandSurface: ["canvas_health"],
 *   persistence: "app-local-json",
 *   status: "preview",
 * })
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class CanvasHealth extends S.Class<CanvasHealth>($I`CanvasHealth`)(
  {
    app: S.Literal("@beep/canvas"),
    commandSurface: CanvasCommandName.pipe(S.Array),
    nativeCommandSurface: CanvasCommandName.pipe(S.Array, S.optionalKey),
    persistence: S.Literal("app-local-json"),
    status: CanvasHealthStatus,
  },
  $I.annote("CanvasHealth", {
    title: "CanvasHealth",
    description: "Canvas shell health payload.",
  })
) {}

/**
 * Serializable scene shape crossing the app command bridge.
 *
 * @example
 * ```ts
 * import { CanvasScene } from "@beep/canvas"
 * import * as S from "effect/Schema"
 *
 * const decodeScene = S.decodeUnknownEffect(CanvasScene)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const CanvasScene = DomainCanvasProject.CanvasProject;

/**
 * Type for {@link CanvasScene}.
 *
 * @example
 * ```ts
 * import { decodeCanvasProjectId } from "@beep/canvas"
 * import type { CanvasScene } from "@beep/canvas"
 * import { Effect } from "effect"
 *
 * const sceneEffect = Effect.gen(function* () {
 *   const id = yield* decodeCanvasProjectId("scene-1")
 *   return {
 *     id,
 *     title: "Scene 1",
 *     status: "open",
 *     nodes: [],
 *   } satisfies CanvasScene
 * })
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type CanvasScene = typeof CanvasScene.Type;

/**
 * Serializable node shape crossing the app command bridge.
 *
 * @example
 * ```ts
 * import { CanvasSceneNode } from "@beep/canvas"
 * import * as S from "effect/Schema"
 *
 * const decodeNode = S.decodeUnknownEffect(CanvasSceneNode)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const CanvasSceneNode = DomainCanvasProject.CanvasNode;

/**
 * Type for {@link CanvasSceneNode}.
 *
 * @example
 * ```ts
 * import { decodeCanvasNodeId } from "@beep/canvas"
 * import type { CanvasSceneNode } from "@beep/canvas"
 * import { Effect } from "effect"
 *
 * const nodeEffect = Effect.gen(function* () {
 *   const id = yield* decodeCanvasNodeId("node-1")
 *   return {
 *     id,
 *     kind: "note",
 *     label: "Opening note",
 *   } satisfies CanvasSceneNode
 * })
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type CanvasSceneNode = typeof CanvasSceneNode.Type;

/**
 * Scene save request.
 *
 * @example
 * ```ts
 * import { decodeCanvasProjectId, SceneSaveRequest } from "@beep/canvas"
 * import type { CanvasScene } from "@beep/canvas"
 * import { Effect } from "effect"
 *
 * const requestEffect = Effect.gen(function* () {
 *   const id = yield* decodeCanvasProjectId("scene-1")
 *   const scene = {
 *     id,
 *     title: "Scene 1",
 *     status: "open",
 *     nodes: [],
 *   } satisfies CanvasScene
 *   return new SceneSaveRequest({ path: "scene-1.json", scene })
 * })
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class SceneSaveRequest extends S.Class<SceneSaveRequest>($I`SceneSaveRequest`)(
  {
    path: S.String,
    scene: CanvasScene,
  },
  $I.annote("SceneSaveRequest", {
    title: "SceneSaveRequest",
    description: "Scene save request for app-local JSON persistence.",
  })
) {}

/**
 * Scene load request.
 *
 * @example
 * ```ts
 * import { SceneLoadRequest } from "@beep/canvas"
 *
 * const request = new SceneLoadRequest({ path: "scene-1.json" })
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class SceneLoadRequest extends S.Class<SceneLoadRequest>($I`SceneLoadRequest`)(
  {
    path: S.String,
  },
  $I.annote("SceneLoadRequest", {
    title: "SceneLoadRequest",
    description: "Scene load request for app-local JSON persistence.",
  })
) {}

/**
 * App command bridge contract.
 *
 * @category commands
 * @since 0.0.0
 */
type CanvasCommandBridge = {
  readonly canvasHealth: () => Effect.Effect<CanvasHealth, CanvasCommandError>;
  readonly sceneArchive: (
    command: CanvasProjectUseCases.ArchiveCanvasProjectCommand
  ) => Effect.Effect<CanvasScene, CanvasCommandError>;
  readonly sceneCreate: (
    command: CanvasProjectUseCases.CreateCanvasProjectCommand
  ) => Effect.Effect<CanvasScene, CanvasCommandError>;
  readonly sceneGet: (
    query: CanvasProjectUseCases.GetCanvasProjectQuery
  ) => Effect.Effect<CanvasScene, CanvasCommandError>;
  readonly sceneList: (
    query?: CanvasProjectUseCases.ListCanvasProjectsQuery
  ) => Effect.Effect<ReadonlyArray<CanvasScene>, CanvasCommandError>;
  readonly sceneLoad: (request: SceneLoadRequest) => Effect.Effect<CanvasScene, CanvasCommandError>;
  readonly sceneNodeAdd: (
    command: CanvasProjectUseCases.AddCanvasNodeCommand
  ) => Effect.Effect<CanvasScene, CanvasCommandError>;
  readonly sceneNodeRemove: (
    command: CanvasProjectUseCases.RemoveCanvasNodeCommand
  ) => Effect.Effect<CanvasScene, CanvasCommandError>;
  readonly sceneSave: (request: SceneSaveRequest) => Effect.Effect<CanvasScene, CanvasCommandError>;
};

type NativeInvoke = (command: string, args?: Record<string, unknown>) => Promise<unknown>;

/**
 * Browser preview health payload.
 *
 * @example
 * ```ts
 * import { previewHealth } from "@beep/canvas"
 *
 * console.log(previewHealth.status)
 * ```
 *
 * @category commands
 * @since 0.0.0
 */
export const previewHealth: CanvasHealth = {
  app: "@beep/canvas",
  commandSurface,
  persistence: "app-local-json",
  status: "preview",
};

/**
 * App command bridge failure.
 *
 * @example
 * ```ts
 * import { CanvasCommandError } from "@beep/canvas"
 *
 * const error = CanvasCommandError.make({ message: "Canvas bridge is offline." })
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class CanvasCommandError extends S.TaggedErrorClass<CanvasCommandError>($I`CanvasCommandError`)(
  "CanvasCommandError",
  {
    message: S.String,
  },
  $I.annote("CanvasCommandError", {
    title: "Canvas command error",
    description: "Typed app command bridge failure.",
  })
) {}

class NativeCanvasCommandError extends S.Class<NativeCanvasCommandError>($I`NativeCanvasCommandError`)(
  {
    message: S.String,
    tag: S.String,
  },
  $I.annote("NativeCanvasCommandError", {
    title: "Native canvas command error",
    description: "Wire error payload returned by native Tauri canvas commands.",
  })
) {}
const isCanvasCommandError = S.is(CanvasCommandError);
const isString = S.is(S.String);
const decodeNativeCanvasCommandErrorOption = S.decodeUnknownOption(NativeCanvasCommandError);

const isDesktopShellRuntime = (): boolean => "__TAURI__" in globalThis || "__TAURI_INTERNALS__" in globalThis;

const nativeCanvasCommandErrorMessage = (error: unknown): string | undefined =>
  O.match(decodeNativeCanvasCommandErrorOption(error), {
    onNone: () => undefined,
    onSome: (value) => value.message,
  });

const errorMessage = (error: unknown): string => {
  if (isString(error)) {
    return error;
  }
  if (isCanvasCommandError(error)) {
    return error.message;
  }
  return nativeCanvasCommandErrorMessage(error) ?? "Canvas command failed.";
};

const isActionFailed = S.is(CanvasProjectUseCases.CanvasProjectActionFailed);

const publicErrorMessage = (error: CanvasProjectUseCases.CanvasProjectActionError): string =>
  isActionFailed(error)
    ? `${error._tag}: ${CanvasProjectUseCases.CANVAS_PROJECT_ACTION_UNAVAILABLE_REASON}`
    : `${error._tag}: ${"reason" in error ? error.reason : "canvasProjectId" in error ? error.canvasProjectId : "unknown"}`;

const toCommandError = (error: CanvasProjectUseCases.CanvasProjectActionError): CanvasCommandError =>
  CanvasCommandError.make({ message: publicErrorMessage(error) });

const decodeCanvasScene = (scene: unknown): Effect.Effect<CanvasScene, CanvasCommandError> =>
  S.decodeUnknownEffect(DomainCanvasProject.CanvasProject)(scene).pipe(
    Effect.mapError((error) => CanvasCommandError.make({ message: error.message }))
  );

const decodeCanvasHealth = (health: unknown): Effect.Effect<CanvasHealth, CanvasCommandError> =>
  S.decodeUnknownEffect(CanvasHealth)(health).pipe(
    Effect.mapError((error) => CanvasCommandError.make({ message: error.message }))
  );

const decodeSceneSaveRequest = (request: unknown): Effect.Effect<SceneSaveRequest, CanvasCommandError> =>
  S.decodeUnknownEffect(SceneSaveRequest)(request).pipe(
    Effect.mapError((error) => CanvasCommandError.make({ message: error.message }))
  );

const decodeSceneLoadRequest = (request: unknown): Effect.Effect<SceneLoadRequest, CanvasCommandError> =>
  S.decodeUnknownEffect(SceneLoadRequest)(request).pipe(
    Effect.mapError((error) => CanvasCommandError.make({ message: error.message }))
  );

const decodeCreateCanvasProjectCommand = (
  command: unknown
): Effect.Effect<CanvasProjectUseCases.CreateCanvasProjectCommand, CanvasCommandError> =>
  S.decodeUnknownEffect(CanvasProjectUseCases.CreateCanvasProjectCommand)(command).pipe(
    Effect.mapError((error) => CanvasCommandError.make({ message: error.message }))
  );

const decodeArchiveCanvasProjectCommand = (
  command: unknown
): Effect.Effect<CanvasProjectUseCases.ArchiveCanvasProjectCommand, CanvasCommandError> =>
  S.decodeUnknownEffect(CanvasProjectUseCases.ArchiveCanvasProjectCommand)(command).pipe(
    Effect.mapError((error) => CanvasCommandError.make({ message: error.message }))
  );

const decodeAddCanvasNodeCommand = (
  command: unknown
): Effect.Effect<CanvasProjectUseCases.AddCanvasNodeCommand, CanvasCommandError> =>
  S.decodeUnknownEffect(CanvasProjectUseCases.AddCanvasNodeCommand)(command).pipe(
    Effect.mapError((error) => CanvasCommandError.make({ message: error.message }))
  );

const decodeRemoveCanvasNodeCommand = (
  command: unknown
): Effect.Effect<CanvasProjectUseCases.RemoveCanvasNodeCommand, CanvasCommandError> =>
  S.decodeUnknownEffect(CanvasProjectUseCases.RemoveCanvasNodeCommand)(command).pipe(
    Effect.mapError((error) => CanvasCommandError.make({ message: error.message }))
  );

const decodeGetCanvasProjectQuery = (
  query: unknown
): Effect.Effect<CanvasProjectUseCases.GetCanvasProjectQuery, CanvasCommandError> =>
  S.decodeUnknownEffect(CanvasProjectUseCases.GetCanvasProjectQuery)(query).pipe(
    Effect.mapError((error) => CanvasCommandError.make({ message: error.message }))
  );

const decodeListCanvasProjectsQuery = (
  query: unknown
): Effect.Effect<CanvasProjectUseCases.ListCanvasProjectsQuery, CanvasCommandError> =>
  S.decodeUnknownEffect(CanvasProjectUseCases.ListCanvasProjectsQuery)(query).pipe(
    Effect.mapError((error) => CanvasCommandError.make({ message: error.message }))
  );

const runAppEffect = <A>(
  effect: Effect.Effect<A, CanvasProjectUseCases.CanvasProjectActionError>
): Effect.Effect<A, CanvasCommandError> => effect.pipe(Effect.mapError(toCommandError));

/**
 * Effect that builds or runs against the app-local canvas command bridge.
 *
 * @example
 * ```ts
 * import { makePreviewCanvasCommandBridge } from "@beep/canvas"
 * import type { CanvasCommandBridgeEffect } from "@beep/canvas"
 *
 * const bridgeEffect: CanvasCommandBridgeEffect = makePreviewCanvasCommandBridge
 * ```
 *
 * @category commands
 * @since 0.0.0
 */
export type CanvasCommandBridgeEffect<A = CanvasCommandBridge> = Effect.Effect<
  A,
  CanvasCommandError,
  CanvasProjectServer
>;

/**
 * Decode a user-provided string into a canvas project identifier.
 *
 * @example
 * ```ts
 * import { decodeCanvasProjectId } from "@beep/canvas"
 *
 * const idEffect = decodeCanvasProjectId("scene-1")
 * ```
 *
 * @category commands
 * @since 0.0.0
 */
export const decodeCanvasProjectId = (
  id: string
): Effect.Effect<DomainCanvasProject.CanvasProjectId, CanvasCommandError> =>
  S.decodeUnknownEffect(DomainCanvasProject.CanvasProjectId)(id).pipe(
    Effect.mapError((error) => CanvasCommandError.make({ message: error.message }))
  );

/**
 * Decode a user-provided string into a canvas node identifier.
 *
 * @example
 * ```ts
 * import { decodeCanvasNodeId } from "@beep/canvas"
 *
 * const idEffect = decodeCanvasNodeId("node-1")
 * ```
 *
 * @category commands
 * @since 0.0.0
 */
export const decodeCanvasNodeId = (id: string): Effect.Effect<DomainCanvasProject.CanvasNodeId, CanvasCommandError> =>
  S.decodeUnknownEffect(DomainCanvasProject.CanvasNodeId)(id).pipe(
    Effect.mapError((error) => CanvasCommandError.make({ message: error.message }))
  );

/**
 * Decode a user-provided value into a canvas node kind.
 *
 * @example
 * ```ts
 * import { decodeCanvasNodeKind } from "@beep/canvas"
 *
 * const kindEffect = decodeCanvasNodeKind("note")
 * ```
 *
 * @category commands
 * @since 0.0.0
 */
export const decodeCanvasNodeKind = (
  kind: unknown
): Effect.Effect<DomainCanvasProject.CanvasNodeKind, CanvasCommandError> =>
  S.decodeUnknownEffect(DomainCanvasProject.CanvasNodeKind)(kind).pipe(
    Effect.mapError((error) => CanvasCommandError.make({ message: error.message }))
  );

/**
 * Build a browser-safe preview bridge backed by the public CanvasProject use-case contract.
 *
 * @example
 * ```ts
 * import { makePreviewCanvasCommandBridge } from "@beep/canvas"
 *
 * const bridgeEffect = makePreviewCanvasCommandBridge
 * ```
 *
 * @category commands
 * @since 0.0.0
 */
export const makePreviewCanvasCommandBridge: CanvasCommandBridgeEffect = Effect.gen(function* () {
  const useCases = yield* CanvasProjectServer;
  const savedScenes = yield* Ref.make(HashMap.empty<string, CanvasScene>());

  return makeUseCaseCanvasCommandBridge(useCases, {
    canvasHealth: () => Effect.succeed(previewHealth),
    loadScene: ({ path }) =>
      Ref.get(savedScenes).pipe(
        Effect.flatMap((scenes) =>
          O.match(HashMap.get(scenes, path), {
            onNone: () =>
              Effect.fail(CanvasCommandError.make({ message: `No preview scene has been saved at ${path}.` })),
            onSome: Effect.succeed,
          })
        )
      ),
    saveScene: ({ path, scene }) =>
      decodeCanvasScene(scene).pipe(
        Effect.tap((decoded) => Ref.update(savedScenes, (scenes) => HashMap.set(scenes, path, decoded)))
      ),
  });
});

const loadThroughUseCases = (
  useCases: CanvasProjectUseCases.CanvasProjectUseCasesShape,
  scene: CanvasScene
): Effect.Effect<CanvasScene, CanvasCommandError> =>
  decodeCanvasScene(scene).pipe(
    Effect.flatMap((decoded) =>
      runAppEffect(useCases.restore(CanvasProjectUseCases.RestoreCanvasProjectCommand.make({ scene: decoded })))
    )
  );

const makeUseCaseCanvasCommandBridge = (
  useCases: CanvasProjectUseCases.CanvasProjectUseCasesShape,
  persistence: {
    readonly canvasHealth: () => Effect.Effect<CanvasHealth, CanvasCommandError>;
    readonly loadScene: (request: SceneLoadRequest) => Effect.Effect<CanvasScene, CanvasCommandError>;
    readonly saveScene: (request: SceneSaveRequest) => Effect.Effect<CanvasScene, CanvasCommandError>;
  }
): CanvasCommandBridge => ({
  canvasHealth: persistence.canvasHealth,
  sceneArchive: (command) =>
    decodeArchiveCanvasProjectCommand(command).pipe(
      Effect.flatMap((decoded) => runAppEffect(useCases.archive(decoded)))
    ),
  sceneCreate: (command) =>
    decodeCreateCanvasProjectCommand(command).pipe(Effect.flatMap((decoded) => runAppEffect(useCases.create(decoded)))),
  sceneGet: (query) =>
    decodeGetCanvasProjectQuery(query).pipe(Effect.flatMap((decoded) => runAppEffect(useCases.get(decoded)))),
  sceneList: (query) =>
    decodeListCanvasProjectsQuery(query ?? {}).pipe(Effect.flatMap((decoded) => runAppEffect(useCases.list(decoded)))),
  sceneLoad: (request) =>
    decodeSceneLoadRequest(request).pipe(
      Effect.flatMap(persistence.loadScene),
      Effect.flatMap((scene) => loadThroughUseCases(useCases, scene))
    ),
  sceneNodeAdd: (command) =>
    decodeAddCanvasNodeCommand(command).pipe(Effect.flatMap((decoded) => runAppEffect(useCases.addNode(decoded)))),
  sceneNodeRemove: (command) =>
    decodeRemoveCanvasNodeCommand(command).pipe(
      Effect.flatMap((decoded) => runAppEffect(useCases.removeNode(decoded)))
    ),
  sceneSave: (request) =>
    decodeSceneSaveRequest(request).pipe(Effect.flatMap((decoded) => persistence.saveScene(decoded))),
});

const invokeNative = (command: string, args?: Record<string, unknown>): Promise<unknown> =>
  import("@tauri-apps/api/core").then(({ invoke }) => invoke(command, args));

const invokeNativeEffect = (
  invoke: NativeInvoke,
  command: string,
  args?: Record<string, unknown>
): Effect.Effect<unknown, CanvasCommandError> =>
  Effect.tryPromise({
    try: () => invoke(command, args),
    catch: (error) => CanvasCommandError.make({ message: errorMessage(error) }),
  });

/**
 * Build the desktop bridge: Tauri owns only app-local OS/file IO while scene
 * mutations stay in the public CanvasProject use-case contract.
 *
 * @example
 * ```ts
 * import { makeNativeCanvasCommandBridge } from "@beep/canvas"
 *
 * const bridgeEffect = makeNativeCanvasCommandBridge()
 * ```
 *
 * @category commands
 * @since 0.0.0
 */
export const makeNativeCanvasCommandBridge = (invoke: NativeInvoke = invokeNative): CanvasCommandBridgeEffect =>
  Effect.map(CanvasProjectServer, (useCases) =>
    makeUseCaseCanvasCommandBridge(useCases, {
      canvasHealth: () => invokeNativeEffect(invoke, "canvas_health").pipe(Effect.flatMap(decodeCanvasHealth)),
      loadScene: (request) =>
        invokeNativeEffect(invoke, "scene_load", { request }).pipe(Effect.flatMap(decodeCanvasScene)),
      saveScene: (request) =>
        invokeNativeEffect(invoke, "scene_save", { request }).pipe(Effect.flatMap(decodeCanvasScene)),
    })
  );

/**
 * Build the default app command bridge.
 *
 * @example
 * ```ts
 * import { makeCanvasCommandBridge } from "@beep/canvas"
 *
 * const bridgeEffect = makeCanvasCommandBridge
 * ```
 *
 * @category commands
 * @since 0.0.0
 */
export const makeCanvasCommandBridge: CanvasCommandBridgeEffect = Effect.suspend(() => {
  if (!isDesktopShellRuntime()) {
    return makePreviewCanvasCommandBridge;
  }

  return makeNativeCanvasCommandBridge();
});
