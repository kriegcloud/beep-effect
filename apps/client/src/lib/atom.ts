import { Layer } from "effect";
import { DevTools } from "effect/unstable/devtools";
import { Atom } from "effect/unstable/reactivity";
import { RpcClient } from "./rpc-client";

const ENABLE_DEVTOOLS = import.meta.env.VITE_ENABLE_DEVTOOLS === "true";

export const runtime = Atom.runtime(
  RpcClient.layer.pipe(
    Layer.provideMerge(ENABLE_DEVTOOLS ? DevTools.layer() : Layer.empty),
  ),
);
