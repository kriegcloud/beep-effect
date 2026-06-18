import { TSMorphServiceLive } from "@beep/repo-utils";
import { NodeServices } from "@effect/platform-node";
import * as NodePath from "@effect/platform-node/NodePath";
import { Context, Effect, Layer, Path } from "effect";

const PlatformLayer = Layer.mergeAll(NodeServices.layer);

export const TestLayer = TSMorphServiceLive.pipe(Layer.provideMerge(PlatformLayer));

const pathApi = Effect.runSync(Effect.scoped(Layer.build(NodePath.layer).pipe(Effect.map(Context.get(Path.Path)))));

export const REPO_ROOT = pathApi.resolve(__dirname, "..", "..", "..", "..", "..");

export const WORKSPACE_ROOT = pathApi.resolve(__dirname, "..");
