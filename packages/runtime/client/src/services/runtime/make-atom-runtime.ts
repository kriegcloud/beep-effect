import { clientRuntimeLayer } from "@beep/runtime-client/services/runtime/live-layer";
import { Atom } from "@effect-atom/atom-react";

export const makeAtomRuntime = Atom.context({
  memoMap: Atom.defaultMemoMap,
});

makeAtomRuntime.addGlobalLayer(clientRuntimeLayer);
