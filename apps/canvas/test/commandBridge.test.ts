import {
  type CanvasCommandBridgeEffect,
  CanvasCommandError,
  type CanvasScene,
  decodeCanvasNodeId,
  decodeCanvasProjectId,
  makeCanvasCommandRuntime,
  makeNativeCanvasCommandBridge,
  makePreviewCanvasCommandBridge,
} from "@beep/canvas";
import { Effect } from "effect";
import { describe, expect, it } from "vitest";

const runCanvasEffect = <A>(effect: CanvasCommandBridgeEffect<A>): Promise<A> => {
  const runtime = makeCanvasCommandRuntime();
  return runtime.runPromise(effect).finally(() => runtime.dispose());
};

describe("canvas command bridge", () => {
  it("roundtrips create/list/get/add/remove/save/load through the preview command bridge", () =>
    runCanvasEffect(
      Effect.gen(function* () {
        const bridge = yield* makePreviewCanvasCommandBridge;
        const health = yield* bridge.canvasHealth();
        const sceneId = yield* decodeCanvasProjectId("scene-test");
        const nodeId = yield* decodeCanvasNodeId("node-test");
        expect(health.app).toBe("@beep/canvas");

        const created = yield* bridge.sceneCreate({ id: sceneId, title: "Scene Test" });
        expect(created.nodes).toHaveLength(0);

        const added = yield* bridge.sceneNodeAdd({
          id: created.id,
          node: { id: nodeId, kind: "note", label: "Node Test" },
        });
        const listed = yield* bridge.sceneList();
        expect(added.nodes).toHaveLength(1);
        expect(listed.map((scene) => scene.id)).toContain(added.id);

        const loadedById = yield* bridge.sceneGet({ id: added.id });
        expect(loadedById.title).toBe("Scene Test");

        yield* bridge.sceneSave({ path: "ignored-in-preview.json", scene: added });
        const loaded = yield* bridge.sceneLoad({ path: "ignored-in-preview.json" });
        expect(loaded.nodes.map((node) => node.id)).toContain("node-test");

        const removed = yield* bridge.sceneNodeRemove({ id: loaded.id, nodeId });
        expect(removed.nodes).toHaveLength(0);
      })
    ));

  it("restores saved scene contents when in-memory state diverges", () =>
    runCanvasEffect(
      Effect.gen(function* () {
        const bridge = yield* makePreviewCanvasCommandBridge;
        const sceneId = yield* decodeCanvasProjectId("restore-scene");
        const savedNodeId = yield* decodeCanvasNodeId("restore-node-saved");
        const divergentNodeId = yield* decodeCanvasNodeId("restore-node-divergent");

        const created = yield* bridge.sceneCreate({ id: sceneId, title: "Restore Scene" });
        const saved = yield* bridge.sceneNodeAdd({
          id: created.id,
          node: { id: savedNodeId, kind: "note", label: "Saved Node" },
        });
        yield* bridge.sceneSave({ path: "restore-scene.json", scene: saved });
        yield* bridge.sceneNodeAdd({
          id: created.id,
          node: { id: divergentNodeId, kind: "shape", label: "Divergent Node" },
        });

        const loaded = yield* bridge.sceneLoad({ path: "restore-scene.json" });
        const reloaded = yield* bridge.sceneGet({ id: sceneId });

        expect(loaded.nodes.map((node) => node.id)).toEqual(["restore-node-saved"]);
        expect(reloaded.nodes.map((node) => node.id)).toEqual(["restore-node-saved"]);
      })
    ));

  it("loads preview scene contents from the requested path", () =>
    runCanvasEffect(
      Effect.gen(function* () {
        const bridge = yield* makePreviewCanvasCommandBridge;
        const alphaSceneId = yield* decodeCanvasProjectId("preview-alpha");
        const betaSceneId = yield* decodeCanvasProjectId("preview-beta");
        const alphaNodeId = yield* decodeCanvasNodeId("preview-alpha-node");
        const betaNodeId = yield* decodeCanvasNodeId("preview-beta-node");

        const alpha = yield* bridge.sceneCreate({ id: alphaSceneId, title: "Preview Alpha" });
        const savedAlpha = yield* bridge.sceneNodeAdd({
          id: alpha.id,
          node: { id: alphaNodeId, kind: "note", label: "Alpha Node" },
        });
        yield* bridge.sceneSave({ path: "preview-alpha.json", scene: savedAlpha });

        const beta = yield* bridge.sceneCreate({ id: betaSceneId, title: "Preview Beta" });
        const savedBeta = yield* bridge.sceneNodeAdd({
          id: beta.id,
          node: { id: betaNodeId, kind: "shape", label: "Beta Node" },
        });
        yield* bridge.sceneSave({ path: "preview-beta.json", scene: savedBeta });

        const loadedAlpha = yield* bridge.sceneLoad({ path: "preview-alpha.json" });
        const loadedBeta = yield* bridge.sceneLoad({ path: "preview-beta.json" });

        expect(loadedAlpha.title).toBe("Preview Alpha");
        expect(loadedAlpha.nodes.map((node) => node.id)).toEqual(["preview-alpha-node"]);
        expect(loadedBeta.title).toBe("Preview Beta");
        expect(loadedBeta.nodes.map((node) => node.id)).toEqual(["preview-beta-node"]);
      })
    ));

  it("translates public action failures from the app bridge", () =>
    expect(
      runCanvasEffect(
        Effect.gen(function* () {
          const bridge = yield* makePreviewCanvasCommandBridge;
          const sceneId = yield* decodeCanvasProjectId("missing-scene");
          return yield* bridge.sceneGet({ id: sceneId });
        })
      )
    ).rejects.toThrow("CanvasProjectNotFound"));

  it("keeps native Tauri IO behind the domain-backed app command bridge", () => {
    const nativeCalls: Array<string> = [];
    let savedScene: CanvasScene | undefined;
    const invoke = (command: string, args?: Record<string, unknown>): Promise<unknown> => {
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
        });
      }
      if (command === "scene_save") {
        savedScene = (args?.request as { readonly scene: CanvasScene }).scene;
        return Promise.resolve(savedScene);
      }
      if (command === "scene_load" && savedScene !== undefined) {
        return Promise.resolve(savedScene);
      }
      return Promise.reject(CanvasCommandError.make({ message: `Unexpected native command: ${command}` }));
    };

    return runCanvasEffect(
      Effect.gen(function* () {
        const bridge = yield* makeNativeCanvasCommandBridge(invoke);
        const sceneId = yield* decodeCanvasProjectId("native-scene");
        const nodeId = yield* decodeCanvasNodeId("native-node");
        const health = yield* bridge.canvasHealth();
        expect(health.commandSurface).toContain("scene_create");
        expect(health.nativeCommandSurface).toEqual(["canvas_health", "scene_save", "scene_load"]);

        const created = yield* bridge.sceneCreate({ id: sceneId, title: "Native Scene" });
        const withNode = yield* bridge.sceneNodeAdd({
          id: created.id,
          node: { id: nodeId, kind: "note", label: "Native Node" },
        });
        yield* bridge.sceneSave({ path: "native-scene.json", scene: withNode });
        const loaded = yield* bridge.sceneLoad({ path: "native-scene.json" });

        expect(loaded.nodes.map((node) => node.id)).toContain("native-node");
        expect(nativeCalls).toEqual(["canvas_health", "scene_save", "scene_load"]);
      })
    );
  });

  it("decodes native success payloads and preserves native command error messages", () => {
    const invoke = (command: string): Promise<unknown> => {
      if (command === "canvas_health") {
        return Promise.resolve({ app: "wrong" });
      }
      return Promise.reject({
        message: "Scene path must use the .json extension.",
        tag: "CanvasCommandInvalidRequest",
      });
    };

    return runCanvasEffect(
      Effect.gen(function* () {
        const bridge = yield* makeNativeCanvasCommandBridge(invoke);
        const healthError = yield* bridge.canvasHealth().pipe(
          Effect.match({
            onFailure: (error) => error,
            onSuccess: () => {
              throw new Error("Expected native health decode to fail.");
            },
          })
        );
        const loadError = yield* bridge.sceneLoad({ path: "bad.txt" }).pipe(
          Effect.match({
            onFailure: (error) => error,
            onSuccess: () => {
              throw new Error("Expected native load to fail.");
            },
          })
        );

        expect(healthError.message).not.toBe("Canvas command failed.");
        expect(loadError.message).toBe("Scene path must use the .json extension.");
      })
    );
  });

  it("decodes malformed scene save requests before persistence", () =>
    runCanvasEffect(
      Effect.gen(function* () {
        const bridge = yield* makePreviewCanvasCommandBridge;
        const saveUnknown = bridge.sceneSave as (request: unknown) => Effect.Effect<CanvasScene, CanvasCommandError>;
        const error = yield* saveUnknown(undefined).pipe(
          Effect.match({
            onFailure: (error) => error,
            onSuccess: () => {
              throw new Error("Expected scene save decode to fail.");
            },
          })
        );

        expect(error).toBeInstanceOf(CanvasCommandError);
        expect(error.message).not.toContain("Cannot destructure");
      })
    ));
});
