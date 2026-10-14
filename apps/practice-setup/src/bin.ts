#!/usr/bin/env bun

/**
 * Entrypoint of `practice-setup.exe`, the unsigned Windows bootstrapper.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as BunServices from "@effect/platform-bun/BunServices";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import { flow } from "effect/Function";
import { FetchHttpClient } from "effect/http";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as Path from "effect/Path";
import * as Struct from "effect/Struct";
import { SetupFailure } from "./Setup.errors.ts";
import { runSetup } from "./Setup.program.ts";
import { liveSetupServices } from "./Setup.services.ts";

/**
 * File name the bootstrapper looks for beside its executable when it carries
 * no embedded gateway.
 *
 * **Example** (Read the file name)
 *
 * ```ts
 * import { BESIDE_BUNDLE_FILE } from "@/bin"
 *
 * console.log(BESIDE_BUNDLE_FILE) // "practice-gateway.mcpb"
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const BESIDE_BUNDLE_FILE = "practice-gateway.mcpb";

const program = Effect.fn("PracticeSetup.program")(
  function* (embeddedBundle: O.Option<string>) {
    if (process.platform !== "win32") {
      return yield* SetupFailure.make({ message: "This setup program runs on Windows only." });
    }
    const path = yield* Path.Path;
    const bundleSource = O.getOrElse(embeddedBundle, () =>
      path.join(path.dirname(process.execPath), BESIDE_BUNDLE_FILE)
    );
    const services = yield* Layer.build(liveSetupServices(bundleSource));
    const report = yield* Effect.provideContext(runSetup, services);
    if (!report.complete) {
      return yield* SetupFailure.make({ message: "Setup did not finish; see last-run.json." });
    }
    return report;
  },
  Effect.tapError(flow(Struct.get("message"), Console.error))
);

/**
 * Run the bootstrapper with the embedded gateway `.mcpb`, or the one beside
 * the executable.
 *
 * **Details**
 *
 * The packaged executable passes its embedded bundle; a plain run (`None`)
 * uses `practice-gateway.mcpb` beside the executable. The process exits non-zero when setup did not
 * reach the onboarding hand-off.
 *
 * **Example** (Read the entry function)
 *
 * ```ts
 * import { main } from "@/bin"
 *
 * console.log(typeof main) // "function"
 * ```
 *
 * @param embeddedBundle - Path of the embedded gateway `.mcpb`, if any.
 * @category programs
 * @since 0.0.0
 */
export const main = (embeddedBundle: O.Option<string>): void =>
  embeddedBundle.pipe(
    program,
    Effect.scoped,
    Layer.effectDiscard,
    Layer.provide(Layer.merge(BunServices.layer, FetchHttpClient.layer)),
    Layer.build,
    Effect.scoped,
    (effect) => BunRuntime.runMain(effect, { disableErrorReporting: true })
  );

if (import.meta.main) {
  main(O.none());
}
