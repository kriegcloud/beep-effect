import { serverEnv } from "@beep/env/server";
import { Atom } from "@effect-atom/atom-react";
import { Layer, Logger, LogLevel } from "effect";

export const makeAtomRuntime = Atom.context({ memoMap: Atom.defaultMemoMap });
makeAtomRuntime.addGlobalLayer(
  Layer.provideMerge(
    Logger.pretty,
    Logger.minimumLogLevel(serverEnv.app.env === "dev" ? LogLevel.Debug : LogLevel.Info)
  )
);
