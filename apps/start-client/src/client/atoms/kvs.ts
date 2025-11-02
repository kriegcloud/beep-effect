import * as BrowserKeyValueStore from "@effect/platform-browser/BrowserKeyValueStore";
import { Atom } from "@effect-atom/atom-react";

export const kvsRuntime = Atom.runtime(BrowserKeyValueStore.layerLocalStorage);
