/**
 * App-local canvas command bridge.
 *
 * @packageDocumentation
 * @category commands
 * @since 0.0.0
 */

import * as DomainCanvasProject from "@beep/canvas-domain/aggregates/CanvasProject";
import { CanvasProject as CanvasProjectServer } from "@beep/canvas-server";
import { CanvasProject as CanvasProjectUseCases } from "@beep/canvas-use-cases/public";
import { $CanvasId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import { Effect, ManagedRuntime, Match } from "effect";
import * as S from "effect/Schema";

const $I = $CanvasId.create("commandBridge");

/**
 * Managed runtime for app-local canvas command effects.
 *
 * @category commands
 * @since 0.0.0
 */
export const makeCanvasCommandRuntime = () => ManagedRuntime.make(CanvasProjectServer.CanvasProjectServerLayer);

/**
 * Runtime returned by {@link makeCanvasCommandRuntime}.
 *
 * @category commands
 * @since 0.0.0
 */
export type CanvasCommandRuntime = ReturnType<typeof makeCanvasCommandRuntime>;

/**
 * Native command names exposed by the canvas app shell.
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
 * @category models
 * @since 0.0.0
 */
export const CanvasScene = DomainCanvasProject.CanvasProject;

/**
 * Type for {@link CanvasScene}.
 *
 * @category models
 * @since 0.0.0
 */
export type CanvasScene = typeof CanvasScene.Type;

/**
 * Serializable node shape crossing the app command bridge.
 *
 * @category models
 * @since 0.0.0
 */
export const CanvasSceneNode = DomainCanvasProject.CanvasNode;

/**
 * Type for {@link CanvasSceneNode}.
 *
 * @category models
 * @since 0.0.0
 */
export type CanvasSceneNode = typeof CanvasSceneNode.Type;

/**
 * Scene save request.
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

type NativeInvoke = <A>(command: string, args?: Record<string, unknown>) => Promise<A>;

/**
 * Browser preview health payload.
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
 * @category errors
 * @since 0.0.0
 */
export class CanvasCommandError extends S.TaggedErrorClass<CanvasCommandError>($I`CanvasCommandError`)(
  "CanvasCommandError",
  {
    message: S.String,
  }
) {}

const isCanvasCommandError = S.is(CanvasCommandError);
const isString = S.is(S.String);

const isDesktopShellRuntime = (): boolean => "__TAURI__" in globalThis || "__TAURI_INTERNALS__" in globalThis;

const errorMessage = (error: unknown): string =>
  Match.value(error).pipe(
    Match.when(isString, (value) => value),
    Match.when(isCanvasCommandError, (value) => value.message),
    Match.orElse(() => "Canvas command failed.")
  );

const publicErrorMessage = (error: CanvasProjectUseCases.CanvasProjectActionError): string =>
  `${error._tag}: ${"reason" in error ? error.reason : "canvasProjectId" in error ? error.canvasProjectId : "unknown"}`;

const toCommandError = (error: CanvasProjectUseCases.CanvasProjectActionError): CanvasCommandError =>
  new CanvasCommandError({ message: publicErrorMessage(error) });

const decodeCanvasScene = (scene: unknown): Effect.Effect<CanvasScene, CanvasCommandError> =>
  S.decodeUnknownEffect(DomainCanvasProject.CanvasProject)(scene).pipe(
    Effect.mapError((error) => new CanvasCommandError({ message: error.message }))
  );

const runAppEffect = <A>(
  effect: Effect.Effect<A, CanvasProjectUseCases.CanvasProjectActionError>
): Effect.Effect<A, CanvasCommandError> => effect.pipe(Effect.mapError(toCommandError));

/**
 * Effect that builds or runs against the app-local canvas command bridge.
 *
 * @category commands
 * @since 0.0.0
 */
export type CanvasCommandBridgeEffect<A = CanvasCommandBridge> = Effect.Effect<
  A,
  CanvasCommandError,
  CanvasProjectServer.CanvasProjectServer
>;

/**
 * Decode a user-provided string into a canvas project identifier.
 *
 * @category commands
 * @since 0.0.0
 */
export const decodeCanvasProjectId = (id: string): DomainCanvasProject.CanvasProjectId =>
  S.decodeUnknownSync(DomainCanvasProject.CanvasProjectId)(id);

/**
 * Decode a user-provided string into a canvas node identifier.
 *
 * @category commands
 * @since 0.0.0
 */
export const decodeCanvasNodeId = (id: string): DomainCanvasProject.CanvasNodeId =>
  S.decodeUnknownSync(DomainCanvasProject.CanvasNodeId)(id);

/**
 * Build a browser-safe preview bridge backed by the public CanvasProject use-case contract.
 *
 * @category commands
 * @since 0.0.0
 */
export const makePreviewCanvasCommandBridge = (): CanvasCommandBridgeEffect =>
  Effect.map(CanvasProjectServer.CanvasProjectServer, (useCases) => {
    let savedScene: CanvasScene | undefined;

    return makeUseCaseCanvasCommandBridge(useCases, {
      canvasHealth: () => Effect.succeed(previewHealth),
      loadScene: () => {
        if (savedScene === undefined) {
          return Effect.fail(new CanvasCommandError({ message: "No preview scene has been saved." }));
        }
        return Effect.succeed(savedScene);
      },
      saveScene: ({ scene }) =>
        decodeCanvasScene(scene).pipe(
          Effect.tap((decoded) =>
            Effect.sync(() => {
              savedScene = decoded;
            })
          )
        ),
    });
  });

const loadThroughUseCases = (
  useCases: CanvasProjectUseCases.CanvasProjectUseCasesShape,
  scene: CanvasScene
): Effect.Effect<CanvasScene, CanvasCommandError> =>
  decodeCanvasScene(scene).pipe(
    Effect.flatMap((decoded) =>
      runAppEffect(useCases.get({ id: decoded.id })).pipe(
        Effect.catch(() =>
          runAppEffect(useCases.create({ id: decoded.id, title: decoded.title })).pipe(
            Effect.flatMap(() =>
              Effect.forEach(decoded.nodes, (node) => runAppEffect(useCases.addNode({ id: decoded.id, node })), {
                concurrency: 1,
              })
            ),
            Effect.flatMap(() =>
              decoded.status === "archived"
                ? runAppEffect(useCases.archive({ id: decoded.id }))
                : Effect.succeed(decoded)
            )
          )
        )
      )
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
  sceneArchive: (command) => runAppEffect(useCases.archive(command)),
  sceneCreate: (command) => runAppEffect(useCases.create(command)),
  sceneGet: (query) => runAppEffect(useCases.get(query)),
  sceneList: (query = new CanvasProjectUseCases.ListCanvasProjectsQuery({})) => runAppEffect(useCases.list(query)),
  sceneLoad: (request) =>
    persistence.loadScene(request).pipe(Effect.flatMap((scene) => loadThroughUseCases(useCases, scene))),
  sceneNodeAdd: (command) => runAppEffect(useCases.addNode(command)),
  sceneNodeRemove: (command) => runAppEffect(useCases.removeNode(command)),
  sceneSave: ({ path, scene }) =>
    decodeCanvasScene(scene).pipe(Effect.flatMap((decoded) => persistence.saveScene({ path, scene: decoded }))),
});

const invokeNative = <A>(command: string, args?: Record<string, unknown>): Promise<A> =>
  import("@tauri-apps/api/core").then(({ invoke }) => invoke<A>(command, args));

const invokeNativeEffect = <A>(
  invoke: NativeInvoke,
  command: string,
  args?: Record<string, unknown>
): Effect.Effect<A, CanvasCommandError> =>
  Effect.tryPromise({
    try: () => invoke<A>(command, args),
    catch: (error) => new CanvasCommandError({ message: errorMessage(error) }),
  });

/**
 * Build the desktop bridge: Tauri owns only app-local OS/file IO while scene
 * mutations stay in the public CanvasProject use-case contract.
 *
 * @category commands
 * @since 0.0.0
 */
export const makeNativeCanvasCommandBridge = (invoke: NativeInvoke = invokeNative): CanvasCommandBridgeEffect =>
  Effect.map(CanvasProjectServer.CanvasProjectServer, (useCases) =>
    makeUseCaseCanvasCommandBridge(useCases, {
      canvasHealth: () => invokeNativeEffect(invoke, "canvas_health"),
      loadScene: (request) => invokeNativeEffect(invoke, "scene_load", { request }),
      saveScene: (request) => invokeNativeEffect(invoke, "scene_save", { request }),
    })
  );

/**
 * Build the default app command bridge.
 *
 * @category commands
 * @since 0.0.0
 */
export const makeCanvasCommandBridge = (): CanvasCommandBridgeEffect => {
  if (!isDesktopShellRuntime()) {
    return makePreviewCanvasCommandBridge();
  }

  return makeNativeCanvasCommandBridge();
};
