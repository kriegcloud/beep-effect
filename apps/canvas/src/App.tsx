/**
 * Canvas desktop shell.
 *
 * @packageDocumentation
 * @category components
 * @since 0.0.0
 */

import { Badge } from "@beep/ui/components/badge";
import { Button } from "@beep/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@beep/ui/components/card";
import { Input } from "@beep/ui/components/input";
import { Label } from "@beep/ui/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@beep/ui/components/select";
import { Separator } from "@beep/ui/components/separator";
import { Textarea } from "@beep/ui/components/textarea";
import { RegistryProvider, useAtom, useAtomMount, useAtomSet, useAtomValue } from "@effect/atom-react";
import {
  ArchiveIcon,
  FileArrowDownIcon,
  FileArrowUpIcon,
  HeartbeatIcon,
  ListPlusIcon,
  MinusCircleIcon,
  PlusCircleIcon,
} from "@phosphor-icons/react";
import { Data, Effect, Match, pipe, Random } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Atom from "effect/unstable/reactivity/Atom";
import {
  CanvasCommandError,
  CanvasScene as CanvasSceneSchema,
  decodeCanvasNodeId,
  decodeCanvasNodeKind,
  decodeCanvasProjectId,
  makeCanvasCommandBridge,
  makeCanvasCommandRuntime,
} from "./commandBridge.js";
import type {
  CanvasCommandBridgeEffect,
  CanvasCommandRuntime,
  CanvasHealth,
  CanvasScene,
  CanvasSceneNode,
} from "./commandBridge.js";

type CanvasCommandBridge = Effect.Success<CanvasCommandBridgeEffect>;

type LoadState = Data.TaggedEnum<{
  readonly loading: {};
  readonly loaded: { readonly bridge: CanvasCommandBridge; readonly health: CanvasHealth };
  readonly failed: { readonly message: string };
}>;

const loadState = Data.taggedEnum<LoadState>();

const newId = (prefix: string): Effect.Effect<string> =>
  Effect.all([
    Random.nextIntBetween(0, 0x100000000, { halfOpen: true }),
    Random.nextIntBetween(0, 0x100000000, { halfOpen: true }),
  ]).pipe(Effect.map(([left, right]) => `${prefix}-${left.toString(36)}-${right.toString(36)}`));
const firstOpenScene = (scenes: ReadonlyArray<CanvasScene>): O.Option<CanvasScene> =>
  pipe(
    scenes,
    A.findFirst((scene) => scene.status === "open"),
    O.orElse(() => A.head(scenes))
  );
const firstOpenSceneId = (scenes: ReadonlyArray<CanvasScene>): O.Option<CanvasScene["id"]> =>
  pipe(
    firstOpenScene(scenes),
    O.map((scene) => scene.id)
  );
const isCanvasSceneList = S.is(CanvasSceneSchema.pipe(S.Array));
const isCanvasCommandError = S.is(CanvasCommandError);
const isString = S.is(S.String);
const messageFromUnknown = (error: unknown, fallback: string): string =>
  Match.value(error).pipe(
    Match.when(isCanvasCommandError, (commandError) => commandError.message),
    Match.when(isString, (message) => message),
    Match.orElse(() => fallback)
  );

type CanvasCommandResult = CanvasScene | ReadonlyArray<CanvasScene>;

type CanvasCommandRequest = {
  readonly operation: (bridge: CanvasCommandBridge) => Effect.Effect<CanvasCommandResult, CanvasCommandError>;
  readonly success: string;
};

type CanvasAppScope = {
  readonly isActive: () => boolean;
};

type CanvasAppAtoms = ReturnType<typeof makeCanvasAppAtoms>;

const DefaultRuntimeCacheKey = Symbol.for("@beep/canvas/default-runtime");

const canvasAppAtomsCache = new Map<
  CanvasCommandBridgeEffect,
  Map<CanvasCommandRuntime | typeof DefaultRuntimeCacheKey, CanvasAppAtoms>
>();

const setSelectedScene = (
  ctx: Atom.WriteContext<unknown>,
  selectedSceneIdAtom: Atom.Writable<O.Option<CanvasScene["id"]>>,
  scenes: ReadonlyArray<CanvasScene>,
  nextSelectedId: O.Option<CanvasScene["id"]>
): void =>
  ctx.set(
    selectedSceneIdAtom,
    pipe(
      nextSelectedId,
      O.orElse(() => ctx.get(selectedSceneIdAtom)),
      O.orElse(() => firstOpenSceneId(scenes))
    )
  );

const makeCanvasAppScope = (get: Atom.AtomContext): CanvasAppScope => {
  let active = true;

  get.addFinalizer(() => {
    active = false;
  });

  return {
    isActive: () => active,
  };
};

const makeCanvasAppAtoms = (
  loadBridge: CanvasCommandBridgeEffect,
  providedRuntime: CanvasCommandRuntime | undefined
) => {
  const runtimeAtom = Atom.make((get) => {
    if (providedRuntime !== undefined) {
      return providedRuntime;
    }

    const runtime = makeCanvasCommandRuntime();
    get.addFinalizer(() => {
      void runtime.dispose();
    });
    return runtime;
  });

  const appScopeAtom = Atom.make(makeCanvasAppScope);
  const loadStateAtom = Atom.make<LoadState>(loadState.loading());
  const scenesAtom = Atom.make<ReadonlyArray<CanvasScene>>([]);
  const selectedSceneIdAtom = Atom.make<O.Option<CanvasScene["id"]>>(O.none());
  const sceneTitleAtom = Atom.make("First canvas scene");
  const nodeLabelAtom = Atom.make("Reference node");
  const nodeKindAtom = Atom.make<CanvasSceneNode["kind"]>("note");
  const savePathAtom = Atom.make("canvas-scene.json");
  const messageAtom = Atom.make("Ready");

  const selectedSceneAtom = Atom.make((get) => {
    const scenes = get(scenesAtom);
    return pipe(
      get(selectedSceneIdAtom),
      O.flatMap((sceneId) => A.findFirst(scenes, (scene) => scene.id === sceneId)),
      O.orElse(() => firstOpenScene(scenes))
    );
  });

  const refreshScenes = (
    ctx: Atom.WriteContext<unknown>,
    bridge: CanvasCommandBridge,
    nextSelectedId: O.Option<CanvasScene["id"]>,
    appScope: CanvasAppScope
  ): Effect.Effect<void, CanvasCommandError> =>
    bridge.sceneList().pipe(
      Effect.tap((nextScenes) =>
        Effect.sync(() => {
          if (!appScope.isActive()) {
            return;
          }

          ctx.set(scenesAtom, nextScenes);
          setSelectedScene(ctx, selectedSceneIdAtom, nextScenes, nextSelectedId);
        })
      ),
      Effect.asVoid
    );

  const bootstrapAtom = Atom.make((get) => {
    const appScope = get(appScopeAtom);
    const runtime = get(runtimeAtom);
    const currentLoadState = get(loadStateAtom);

    if (!loadState.$is("loading")(currentLoadState)) {
      return currentLoadState;
    }

    let cancelled = false;

    void runtime
      .runPromise(
        loadBridge.pipe(
          Effect.flatMap((bridge) =>
            Effect.all([bridge.canvasHealth(), bridge.sceneList()], { concurrency: 2 }).pipe(
              Effect.map(([health, loadedScenes]) => ({
                bridge,
                health,
                loadedScenes,
              }))
            )
          )
        )
      )
      .then(({ bridge, health, loadedScenes }) => {
        if (!cancelled && appScope.isActive()) {
          get.set(loadStateAtom, loadState.loaded({ bridge, health }));
          get.set(scenesAtom, loadedScenes);
          get.set(selectedSceneIdAtom, firstOpenSceneId(loadedScenes));
        }
      })
      .catch((error: unknown) => {
        if (!cancelled && appScope.isActive()) {
          get.set(loadStateAtom, loadState.failed({ message: messageFromUnknown(error, "Canvas bridge failed.") }));
        }
      });

    get.addFinalizer(() => {
      cancelled = true;
    });

    return currentLoadState;
  });

  const commandAtom = Atom.writable(
    (get) => {
      get(appScopeAtom);
    },
    (ctx, request: CanvasCommandRequest) => {
      const appScope = ctx.get(appScopeAtom);
      const currentLoadState = ctx.get(loadStateAtom);

      if (!loadState.$is("loaded")(currentLoadState)) {
        ctx.set(messageAtom, "Canvas bridge is not ready.");
        return;
      }

      const { bridge } = currentLoadState;

      void ctx
        .get(runtimeAtom)
        .runPromise(
          request.operation(bridge).pipe(
            Effect.flatMap((result) =>
              isCanvasSceneList(result)
                ? Effect.sync(() => {
                    if (!appScope.isActive()) {
                      return;
                    }

                    ctx.set(scenesAtom, result);
                  })
                : refreshScenes(ctx, bridge, O.some(result.id), appScope)
            ),
            Effect.tap(() =>
              Effect.sync(() => {
                if (appScope.isActive()) {
                  ctx.set(messageAtom, request.success);
                }
              })
            )
          )
        )
        .catch((error: unknown) => {
          if (appScope.isActive()) {
            ctx.set(messageAtom, messageFromUnknown(error, "Canvas command failed."));
          }
        });
    }
  );

  const nodeKindInputAtom = Atom.writable(
    (get) => {
      get(appScopeAtom);
    },
    (ctx, value: unknown) => {
      const appScope = ctx.get(appScopeAtom);

      void ctx
        .get(runtimeAtom)
        .runPromise(decodeCanvasNodeKind(value))
        .then((nextNodeKind) => {
          if (appScope.isActive()) {
            ctx.set(nodeKindAtom, nextNodeKind);
          }
        })
        .catch((error: unknown) => {
          if (appScope.isActive()) {
            ctx.set(messageAtom, messageFromUnknown(error, "Invalid node kind."));
          }
        });
    }
  );

  return {
    bootstrapAtom,
    commandAtom,
    loadStateAtom,
    messageAtom,
    nodeKindAtom,
    nodeKindInputAtom,
    nodeLabelAtom,
    savePathAtom,
    sceneTitleAtom,
    scenesAtom,
    selectedSceneAtom,
    selectedSceneIdAtom,
  };
};

const getCanvasAppAtoms = (
  loadBridge: CanvasCommandBridgeEffect,
  providedRuntime: CanvasCommandRuntime | undefined
): CanvasAppAtoms => {
  const runtimeKey = providedRuntime ?? DefaultRuntimeCacheKey;
  const runtimeAtoms = canvasAppAtomsCache.get(loadBridge) ?? new Map();
  const cached = runtimeAtoms.get(runtimeKey);

  if (cached !== undefined) {
    return cached;
  }

  const atoms = makeCanvasAppAtoms(loadBridge, providedRuntime);
  runtimeAtoms.set(runtimeKey, atoms);
  canvasAppAtomsCache.set(loadBridge, runtimeAtoms);
  return atoms;
};

/**
 * Canvas desktop shell root component.
 *
 * @example
 * ```tsx
 * import { App } from "@beep/canvas"
 *
 * export const CanvasPreview = () => <App />
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export function App({
  loadBridge = makeCanvasCommandBridge,
  runtime: providedRuntime,
}: {
  readonly loadBridge?: CanvasCommandBridgeEffect;
  readonly runtime?: CanvasCommandRuntime;
}) {
  return (
    <RegistryProvider>
      <CanvasAppShell atoms={getCanvasAppAtoms(loadBridge, providedRuntime)} />
    </RegistryProvider>
  );
}

const CanvasAppShell = ({ atoms }: { readonly atoms: CanvasAppAtoms }) => {
  useAtomMount(atoms.bootstrapAtom);

  const currentLoadState = useAtomValue(atoms.loadStateAtom);
  const scenes = useAtomValue(atoms.scenesAtom);
  const selectedScene = useAtomValue(atoms.selectedSceneAtom);
  const message = useAtomValue(atoms.messageAtom);
  const runCommand = useAtomSet(atoms.commandAtom);
  const setMessage = useAtomSet(atoms.messageAtom);
  const setSelectedSceneId = useAtomSet(atoms.selectedSceneIdAtom);
  const setNodeKindFromInput = useAtomSet(atoms.nodeKindInputAtom);
  const [sceneTitle, setSceneTitle] = useAtom(atoms.sceneTitleAtom);
  const [nodeLabel, setNodeLabel] = useAtom(atoms.nodeLabelAtom);
  const [nodeKind] = useAtom(atoms.nodeKindAtom);
  const [savePath, setSavePath] = useAtom(atoms.savePathAtom);
  const bridge = loadState.$is("loaded")(currentLoadState) ? currentLoadState.bridge : undefined;

  const createScene = () =>
    runCommand({
      operation: (bridge) =>
        newId("scene").pipe(
          Effect.flatMap(decodeCanvasProjectId),
          Effect.flatMap((id) => bridge.sceneCreate({ id, title: sceneTitle }))
        ),
      success: "Scene created",
    });
  const addNode = () =>
    O.match(selectedScene, {
      onNone: () => setMessage("Create a scene first."),
      onSome: (scene) =>
        runCommand({
          operation: (bridge) =>
            newId("node").pipe(
              Effect.flatMap(decodeCanvasNodeId),
              Effect.flatMap((id) =>
                bridge.sceneNodeAdd({
                  id: scene.id,
                  node: { id, kind: nodeKind, label: nodeLabel },
                })
              )
            ),
          success: "Node added",
        }),
    });
  const removeNode = (nodeId: CanvasSceneNode["id"]) =>
    O.match(selectedScene, {
      onNone: () => setMessage("Create a scene first."),
      onSome: (scene) =>
        runCommand({
          operation: (bridge) => bridge.sceneNodeRemove({ id: scene.id, nodeId }),
          success: "Node removed",
        }),
    });
  const archiveScene = () =>
    O.match(selectedScene, {
      onNone: () => setMessage("Create a scene first."),
      onSome: (scene) =>
        runCommand({
          operation: (bridge) => bridge.sceneArchive({ id: scene.id }),
          success: "Scene archived",
        }),
    });
  const saveScene = () =>
    O.match(selectedScene, {
      onNone: () => setMessage("Create a scene first."),
      onSome: (scene) =>
        runCommand({
          operation: (bridge) => bridge.sceneSave({ path: savePath, scene }),
          success: "Scene saved",
        }),
    });
  const loadScene = () =>
    runCommand({
      operation: (bridge) => bridge.sceneLoad({ path: savePath }),
      success: "Scene loaded",
    });

  return (
    <div className="min-h-screen bg-muted/30 text-foreground">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">@beep/canvas</p>
            <h1 className="text-3xl font-semibold tracking-tight">Canvas</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">Tauri</Badge>
            <Badge variant="secondary">P1/P2 Bootstrap</Badge>
            {loadState.$is("loaded")(currentLoadState) ? <Badge>{currentLoadState.health.status}</Badge> : null}
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-5 px-6 py-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <section className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <HeartbeatIcon className="size-5" weight="bold" />
                Bridge
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {loadState.$is("loading")(currentLoadState) ? (
                <p className="text-muted-foreground">Loading canvas bridge.</p>
              ) : null}
              {loadState.$is("failed")(currentLoadState) ? (
                <p className="text-destructive">{currentLoadState.message}</p>
              ) : null}
              {loadState.$is("loaded")(currentLoadState) ? (
                <>
                  <p className="font-medium">{currentLoadState.health.app}</p>
                  <p className="text-muted-foreground">{currentLoadState.health.persistence}</p>
                  <Separator />
                  <Textarea readOnly value={message} className="min-h-20 resize-none" />
                </>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Scenes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="scene-title">Title</Label>
                <Input id="scene-title" value={sceneTitle} onChange={(event) => setSceneTitle(event.target.value)} />
              </div>
              <Button className="w-full" onClick={createScene} disabled={bridge === undefined}>
                <ListPlusIcon className="mr-2 size-4" weight="bold" />
                Create Scene
              </Button>
              <div className="space-y-2">
                {A.map(scenes, (scene) => (
                  <button
                    className="w-full rounded-md border bg-background px-3 py-2 text-left text-sm transition hover:bg-muted"
                    key={scene.id}
                    onClick={() => setSelectedSceneId(O.some(scene.id))}
                    type="button"
                  >
                    <span className="block font-medium">{scene.title}</span>
                    <span className="text-muted-foreground">
                      {scene.status} - {A.length(scene.nodes)} nodes
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Scene Detail</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {O.match(selectedScene, {
                onNone: () => <p className="text-sm text-muted-foreground">No scene selected.</p>,
                onSome: (selectedScene) => (
                  <>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h2 className="text-xl font-semibold">{selectedScene.title}</h2>
                        <p className="text-sm text-muted-foreground">{selectedScene.id}</p>
                      </div>
                      <Button variant="outline" onClick={archiveScene}>
                        <ArchiveIcon className="mr-2 size-4" weight="bold" />
                        Archive
                      </Button>
                    </div>
                    <Separator />
                    <div className="grid gap-3 md:grid-cols-[1fr_10rem_auto]">
                      <div className="space-y-2">
                        <Label htmlFor="node-label">Node label</Label>
                        <Input
                          id="node-label"
                          value={nodeLabel}
                          onChange={(event) => setNodeLabel(event.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Kind</Label>
                        <Select value={nodeKind} onValueChange={setNodeKindFromInput}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="note">note</SelectItem>
                            <SelectItem value="shape">shape</SelectItem>
                            <SelectItem value="asset">asset</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button className="self-end" onClick={addNode}>
                        <PlusCircleIcon className="mr-2 size-4" weight="bold" />
                        Add
                      </Button>
                    </div>
                    <div className="grid gap-2">
                      {A.map(selectedScene.nodes, (node) => (
                        <div
                          className="flex items-center justify-between rounded-md border bg-background px-3 py-2"
                          key={node.id}
                        >
                          <div>
                            <p className="font-medium">{node.label}</p>
                            <p className="text-sm text-muted-foreground">{node.kind}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeNode(node.id)}
                            aria-label={`Remove ${node.label}`}
                          >
                            <MinusCircleIcon className="size-4" weight="bold" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </>
                ),
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Local JSON</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
              <Input
                value={savePath}
                onChange={(event) => setSavePath(event.target.value)}
                aria-label="Scene file path"
              />
              <Button variant="outline" onClick={saveScene} disabled={bridge === undefined}>
                <FileArrowDownIcon className="mr-2 size-4" weight="bold" />
                Save
              </Button>
              <Button variant="outline" onClick={loadScene} disabled={bridge === undefined}>
                <FileArrowUpIcon className="mr-2 size-4" weight="bold" />
                Load
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};
