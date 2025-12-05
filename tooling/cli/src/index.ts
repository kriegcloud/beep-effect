import { FsUtils } from "@beep/tooling-utils";
import * as CliCommand from "@effect/cli/Command";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as BunTerminal from "@effect/platform-bun/BunTerminal";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { envCommand } from "./commands/env.js";
import { pruneUnusedDepsCommand } from "./commands/prune-unused-deps.js";
import { syncCommand } from "./commands/sync.js";

const repoCommand = CliCommand.make("beep").pipe(
  CliCommand.withDescription("Beep repository maintenance CLI."),
  CliCommand.withSubcommands([envCommand, syncCommand, pruneUnusedDepsCommand])
);

const runBeepCli = CliCommand.run(repoCommand, {
  name: "beep",
  version: "0.1.0",
});

// FsUtils.Live already includes BunFileSystem.layer and BunPath.layerPosix internally
const runtimeLayers = Layer.mergeAll(BunContext.layer, BunTerminal.layer, FsUtils.FsUtilsLive);

export const runRepoCli = (argv: ReadonlyArray<string>) =>
  runBeepCli(argv).pipe(Effect.provide(runtimeLayers), BunRuntime.runMain);

if (import.meta.main) {
  runRepoCli(process.argv);
}
