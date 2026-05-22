import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import {
  type CanvasCommandBridgeEffect,
  CanvasCommandError,
  type CanvasScene,
  decodeCanvasNodeId,
  decodeCanvasProjectId,
  makeCanvasCommandRuntime,
  makeNativeCanvasCommandBridge,
  makePreviewCanvasCommandBridge,
} from "../src/commandBridge.js";

const runCanvasEffect = <A>(effect: CanvasCommandBridgeEffect<A>): Promise<A> => {
  const runtime = makeCanvasCommandRuntime();
  return runtime.runPromise(effect).finally(() => runtime.dispose());
};

describe("canvas command bridge", () => {
  it("roundtrips create/list/get/add/remove/save/load through the preview command bridge", () =>
    runCanvasEffect(
      Effect.gen(function* () {
        const bridge = yield* makePreviewCanvasCommandBridge();
        const health = yield* bridge.canvasHealth();
        expect(health.app).toBe("@beep/canvas");

        const created = yield* bridge.sceneCreate({ id: decodeCanvasProjectId("scene-test"), title: "Scene Test" });
        expect(created.nodes).toHaveLength(0);

        const added = yield* bridge.sceneNodeAdd({
          id: created.id,
          node: { id: decodeCanvasNodeId("node-test"), kind: "note", label: "Node Test" },
        });
        const listed = yield* bridge.sceneList();
        expect(added.nodes).toHaveLength(1);
        expect(listed.map((scene) => scene.id)).toContain(added.id);

        const loadedById = yield* bridge.sceneGet({ id: added.id });
        expect(loadedById.title).toBe("Scene Test");

        yield* bridge.sceneSave({ path: "ignored-in-preview.json", scene: added });
        const loaded = yield* bridge.sceneLoad({ path: "ignored-in-preview.json" });
        expect(loaded.nodes.map((node) => node.id)).toContain("node-test");

        const removed = yield* bridge.sceneNodeRemove({ id: loaded.id, nodeId: decodeCanvasNodeId("node-test") });
        expect(removed.nodes).toHaveLength(0);
      })
    ));

  it("translates public action failures from the app bridge", () =>
    expect(
      runCanvasEffect(
        Effect.gen(function* () {
          const bridge = yield* makePreviewCanvasCommandBridge();
          return yield* bridge.sceneGet({ id: decodeCanvasProjectId("missing-scene") });
        })
      )
    ).rejects.toThrow("CanvasProjectNotFound"));

  it("keeps native Tauri IO behind the domain-backed app command bridge", () => {
    const nativeCalls: Array<string> = [];
    let savedScene: CanvasScene | undefined;
    const invoke = <A>(command: string, args?: Record<string, unknown>): Promise<A> => {
      nativeCalls.push(command);
      if (command === "canvas_health") {
        return Promise.resolve({
          app: "@beep/canvas",
          commandSurface: [
            "canvas_health",
            "scene_create",
            "scene_list",
            "scene_get",
            "scene_archive",
            "scene_node_add",
            "scene_node_remove",
            "scene_save",
            "scene_load",
          ],
          nativeCommandSurface: ["canvas_health", "scene_save", "scene_load"],
          persistence: "app-local-json",
          status: "ready",
        } as A);
      }
      if (command === "scene_save") {
        savedScene = (args?.request as { readonly scene: CanvasScene }).scene;
        return Promise.resolve(savedScene as A);
      }
      if (command === "scene_load" && savedScene !== undefined) {
        return Promise.resolve(savedScene as A);
      }
      return Promise.reject(new CanvasCommandError({ message: `Unexpected native command: ${command}` }));
    };

    return runCanvasEffect(
      Effect.gen(function* () {
        const bridge = yield* makeNativeCanvasCommandBridge(invoke);
        const health = yield* bridge.canvasHealth();
        expect(health.commandSurface).toContain("scene_create");
        expect(health.nativeCommandSurface).toEqual(["canvas_health", "scene_save", "scene_load"]);

        const created = yield* bridge.sceneCreate({ id: decodeCanvasProjectId("native-scene"), title: "Native Scene" });
        const withNode = yield* bridge.sceneNodeAdd({
          id: created.id,
          node: { id: decodeCanvasNodeId("native-node"), kind: "note", label: "Native Node" },
        });
        yield* bridge.sceneSave({ path: "native-scene.json", scene: withNode });
        const loaded = yield* bridge.sceneLoad({ path: "native-scene.json" });

        expect(loaded.nodes.map((node) => node.id)).toContain("native-node");
        expect(nativeCalls).toEqual(["canvas_health", "scene_save", "scene_load"]);
      })
    );
  });
});
