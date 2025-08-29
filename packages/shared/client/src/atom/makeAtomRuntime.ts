import { envVars } from "@beep/env/start";
import { Atom } from "@effect-atom/atom-react";
import { Layer, Logger, LogLevel } from "effect";

export const makeAtomRuntime = Atom.context({ memoMap: Atom.defaultMemoMap });
makeAtomRuntime.addGlobalLayer(
  Layer.provideMerge(
    Logger.pretty,
    Logger.minimumLogLevel(envVars.EFFECTIVE_ENV === "dev" ? LogLevel.Debug : LogLevel.Info)
  )
);
