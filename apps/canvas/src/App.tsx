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
import {
  ArchiveIcon,
  FileArrowDownIcon,
  FileArrowUpIcon,
  HeartbeatIcon,
  ListPlusIcon,
  MinusCircleIcon,
  PlusCircleIcon,
} from "@phosphor-icons/react";
import { Effect } from "effect";
import * as S from "effect/Schema";
import { useEffect, useMemo, useState } from "react";
import {
  type CanvasCommandBridgeEffect,
  CanvasCommandError,
  type CanvasCommandRuntime,
  type CanvasHealth,
  type CanvasScene,
  type CanvasSceneNode,
  CanvasScene as CanvasSceneSchema,
  decodeCanvasNodeId,
  decodeCanvasProjectId,
  makeCanvasCommandBridge,
  makeCanvasCommandRuntime,
} from "./commandBridge.js";

type CanvasCommandBridge = Effect.Success<ReturnType<typeof makeCanvasCommandBridge>>;

type LoadState =
  | { readonly _tag: "loading" }
  | { readonly _tag: "loaded"; readonly bridge: CanvasCommandBridge; readonly health: CanvasHealth }
  | { readonly _tag: "failed"; readonly message: string };

let nextLocalId = 0;
const newId = (prefix: string): string => {
  nextLocalId += 1;
  return `${prefix}-${nextLocalId.toString(36)}`;
};
const firstOpenScene = (scenes: ReadonlyArray<CanvasScene>): CanvasScene | undefined =>
  scenes.find((scene) => scene.status === "open") ?? scenes[0];
const isCanvasSceneList = S.is(CanvasSceneSchema.pipe(S.Array));
const isCanvasCommandError = S.is(CanvasCommandError);
const isString = S.is(S.String);
const messageFromUnknown = (error: unknown, fallback: string): string =>
  isCanvasCommandError(error) ? error.message : isString(error) ? error : fallback;
const rejectMessage = (message: string): Effect.Effect<never, CanvasCommandError> =>
  Effect.fail(new CanvasCommandError({ message }));

/**
 * Canvas desktop shell root component.
 *
 * @category components
 * @since 0.0.0
 */
export function App({
  loadBridge = makeCanvasCommandBridge,
  runtime: providedRuntime,
}: {
  readonly loadBridge?: () => CanvasCommandBridgeEffect;
  readonly runtime?: CanvasCommandRuntime;
}) {
  const [runtime] = useState(() => providedRuntime ?? makeCanvasCommandRuntime());
  const [loadState, setLoadState] = useState<LoadState>({ _tag: "loading" });
  const [scenes, setScenes] = useState<ReadonlyArray<CanvasScene>>([]);
  const [selectedSceneId, setSelectedSceneId] = useState<string | undefined>();
  const [sceneTitle, setSceneTitle] = useState("First canvas scene");
  const [nodeLabel, setNodeLabel] = useState("Reference node");
  const [nodeKind, setNodeKind] = useState<CanvasSceneNode["kind"]>("note");
  const [savePath, setSavePath] = useState("canvas-scene.json");
  const [message, setMessage] = useState("Ready");

  useEffect(
    () => () => {
      if (providedRuntime === undefined) {
        void runtime.dispose();
      }
    },
    [providedRuntime, runtime]
  );

  useEffect(() => {
    let cancelled = false;

    void runtime
      .runPromise(
        loadBridge().pipe(
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
        if (!cancelled) {
          setLoadState({ _tag: "loaded", bridge, health });
          setScenes(loadedScenes);
          setSelectedSceneId(firstOpenScene(loadedScenes)?.id);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setLoadState({ _tag: "failed", message: messageFromUnknown(error, "Canvas bridge failed.") });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [loadBridge, runtime]);

  const bridge = loadState._tag === "loaded" ? loadState.bridge : undefined;
  const selectedScene = useMemo(
    () => scenes.find((scene) => scene.id === selectedSceneId) ?? firstOpenScene(scenes),
    [scenes, selectedSceneId]
  );

  const refreshScenes = (nextSelectedId?: string): Effect.Effect<void, CanvasCommandError> => {
    if (bridge === undefined) {
      return Effect.void;
    }
    return bridge.sceneList().pipe(
      Effect.tap((nextScenes) =>
        Effect.sync(() => {
          setScenes(nextScenes);
          setSelectedSceneId(nextSelectedId ?? selectedSceneId ?? firstOpenScene(nextScenes)?.id);
        })
      ),
      Effect.asVoid
    );
  };

  const runCommand = (
    operation: () => Effect.Effect<CanvasScene | ReadonlyArray<CanvasScene>, CanvasCommandError>,
    success: string
  ): void => {
    void runtime
      .runPromise(
        operation().pipe(
          Effect.flatMap((result) =>
            isCanvasSceneList(result)
              ? Effect.sync(() => {
                  setScenes(result);
                })
              : refreshScenes(result.id)
          ),
          Effect.tap(() => Effect.sync(() => setMessage(success)))
        )
      )
      .catch((error) => setMessage(messageFromUnknown(error, "Canvas command failed.")));
  };

  const createScene = () =>
    runCommand(
      () =>
        bridge?.sceneCreate({ id: decodeCanvasProjectId(newId("scene")), title: sceneTitle }) ??
        rejectMessage("Canvas bridge is not ready."),
      "Scene created"
    );
  const addNode = () =>
    selectedScene === undefined
      ? setMessage("Create a scene first.")
      : runCommand(
          () =>
            bridge?.sceneNodeAdd({
              id: selectedScene.id,
              node: { id: decodeCanvasNodeId(newId("node")), kind: nodeKind, label: nodeLabel },
            }) ?? rejectMessage("Canvas bridge is not ready."),
          "Node added"
        );
  const removeNode = (nodeId: string) =>
    selectedScene === undefined
      ? setMessage("Create a scene first.")
      : runCommand(
          () =>
            bridge?.sceneNodeRemove({ id: selectedScene.id, nodeId: decodeCanvasNodeId(nodeId) }) ??
            rejectMessage("Canvas bridge is not ready."),
          "Node removed"
        );
  const archiveScene = () =>
    selectedScene === undefined
      ? setMessage("Create a scene first.")
      : runCommand(
          () => bridge?.sceneArchive({ id: selectedScene.id }) ?? rejectMessage("Canvas bridge is not ready."),
          "Scene archived"
        );
  const saveScene = () =>
    selectedScene === undefined
      ? setMessage("Create a scene first.")
      : runCommand(
          () =>
            bridge?.sceneSave({ path: savePath, scene: selectedScene }) ?? rejectMessage("Canvas bridge is not ready."),
          "Scene saved"
        );
  const loadScene = () =>
    runCommand(
      () => bridge?.sceneLoad({ path: savePath }) ?? rejectMessage("Canvas bridge is not ready."),
      "Scene loaded"
    );

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
            {loadState._tag === "loaded" ? <Badge>{loadState.health.status}</Badge> : null}
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
              {loadState._tag === "loading" ? <p className="text-muted-foreground">Loading canvas bridge.</p> : null}
              {loadState._tag === "failed" ? <p className="text-destructive">{loadState.message}</p> : null}
              {loadState._tag === "loaded" ? (
                <>
                  <p className="font-medium">{loadState.health.app}</p>
                  <p className="text-muted-foreground">{loadState.health.persistence}</p>
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
                {scenes.map((scene) => (
                  <button
                    className="w-full rounded-md border bg-background px-3 py-2 text-left text-sm transition hover:bg-muted"
                    key={scene.id}
                    onClick={() => setSelectedSceneId(scene.id)}
                    type="button"
                  >
                    <span className="block font-medium">{scene.title}</span>
                    <span className="text-muted-foreground">
                      {scene.status} - {scene.nodes.length} nodes
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
              {selectedScene === undefined ? (
                <p className="text-sm text-muted-foreground">No scene selected.</p>
              ) : (
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
                      <Input id="node-label" value={nodeLabel} onChange={(event) => setNodeLabel(event.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Kind</Label>
                      <Select value={nodeKind} onValueChange={(value) => setNodeKind(value as CanvasSceneNode["kind"])}>
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
                    {selectedScene.nodes.map((node) => (
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
              )}
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
}
