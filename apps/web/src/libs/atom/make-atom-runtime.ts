import { clientEnv } from "@beep/core-env/client";
import { Atom } from "@effect-atom/atom-react";
import * as Layer from "effect/Layer";
import * as Logger from "effect/Logger";
import * as LogLevel from "effect/LogLevel";
export const makeAtomRuntime = Atom.context({
  memoMap: Atom.defaultMemoMap,
});

makeAtomRuntime.addGlobalLayer(
  Layer.provideMerge(Logger.pretty, Logger.minimumLogLevel(clientEnv.env === "dev" ? LogLevel.Debug : LogLevel.Info))
);
