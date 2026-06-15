import { TSMorphServiceLive } from "@beep/repo-utils";
import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem";
import * as NodePath from "@effect/platform-node/NodePath";
import { Context, Effect, Layer, Path } from "effect";

const PlatformLayer = Layer.mergeAll(NodeFileSystem.layer, NodePath.layer);

export const TestLayer = TSMorphServiceLive.pipe(Layer.provideMerge(PlatformLayer));

const pathApi = Effect.runSync(Effect.scoped(Layer.build(NodePath.layer).pipe(Effect.map(Context.get(Path.Path)))));

export const REPO_ROOT = pathApi.resolve(__dirname, "..", "..", "..", "..", "..");

export const WORKSPACE_ROOT = pathApi.resolve(__dirname, "..");
