/**
 * The practice knowledge-graph provider, loaded lazily: its toolkit, PGlite
 * and DuckDB resources are imported only when the saved profile selects the
 * knowledge graph, so a missing or broken native sidecar disables only this
 * provider.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import { GatewaySettings } from "./GatewaySettings.ts";
import { ProviderUnavailable } from "./PracticeGateway.errors.ts";
import { ProfileStore } from "./ProfileStore.ts";
import { profileSelects } from "./Requirements.ts";
import { PRACTICE_GATEWAY_VERSION } from "./Version.ts";

const PRACTICE_KG_UNAVAILABLE = "The practice knowledge-graph engine could not be loaded on this computer.";

/**
 * Import the practice knowledge-graph host and toolkit modules.
 *
 * **Details**
 *
 * The modules pull in the DuckDB native binding and PGlite at evaluation
 * time, so they are imported dynamically: the gateway starts, and the setup
 * tools answer, on a machine where the DuckDB sidecar is missing. A failed
 * import is a {@link ProviderUnavailable} for `practice-kg`. The runtime caches
 * a successful import, so repeated loads are cheap.
 *
 * **Example** (Load the knowledge-graph modules)
 *
 * ```ts
 * import { loadPracticeKgModules } from "@beep/practice-gateway/PracticeKgProvider"
 * import * as Effect from "effect/Effect"
 *
 * const program = loadPracticeKgModules.pipe(
 *   Effect.map((modules) => typeof modules.runPracticeKgSelfCheck),
 *   Effect.catchTag("ProviderUnavailable", (error) => Effect.succeed(error.message))
 * )
 * console.log(Effect.isEffect(program))
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const loadPracticeKgModules = Effect.tryPromise({
  try: () =>
    Promise.all([import("@beep/law-practice-server/PracticeKgHost"), import("@beep/law-practice-server")]).then(
      ([host, server]) => ({
        loadPracticeKgBundleContext: host.loadPracticeKgBundleContext,
        makePracticeKgHostResourcesLayer: host.makePracticeKgHostResourcesLayer,
        runPracticeKgSelfCheck: host.runPracticeKgSelfCheck,
        PracticeKgToolkitLayer: server.PracticeKgToolkitLayer,
      })
    ),
  catch: (cause) => ProviderUnavailable.make({ provider: "practice-kg", cause, message: PRACTICE_KG_UNAVAILABLE }),
});

/**
 * The practice knowledge-graph toolkit, mounted in process when the saved
 * profile selects `practice-kg` and the extension settings name a bundle
 * that passes its self-check.
 *
 * **Details**
 *
 * Anything short of that mounts nothing and logs why: the setup tools must
 * stay reachable so `setup_status` can explain the problem. The provider's
 * modules are imported only after the profile selects it (see
 * {@link loadPracticeKgModules}). The profile is read once at startup, so a
 * newly saved profile takes effect after Claude restarts the gateway.
 *
 * **Example** (Compose the provider)
 *
 * ```ts
 * import { PracticeKgProviderLayer } from "@beep/practice-gateway/PracticeKgProvider"
 * import * as Layer from "effect/Layer"
 *
 * console.log(Layer.isLayer(PracticeKgProviderLayer))
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const PracticeKgProviderLayer = Layer.unwrap(
  Effect.gen(function* () {
    const settings = yield* GatewaySettings;
    const store = yield* ProfileStore;
    const profile = yield* store.get;
    const selected = O.exists(profile, profileSelects("practice-kg"));
    if (!selected || O.isNone(settings.bundleDir)) {
      return Layer.empty;
    }
    const bundleDir = settings.bundleDir.value;
    const corpusRoot = O.getOrUndefined(settings.corpusRoot);
    const modules = yield* loadPracticeKgModules;
    yield* modules.runPracticeKgSelfCheck({ extensionVersion: PRACTICE_GATEWAY_VERSION, bundleDir, corpusRoot });
    const context = yield* modules.loadPracticeKgBundleContext(bundleDir, corpusRoot);
    return modules.PracticeKgToolkitLayer.pipe(Layer.provide(modules.makePracticeKgHostResourcesLayer(context)));
  })
).pipe(
  Layer.catchCause((cause) =>
    Layer.effectDiscard(Effect.logWarning("The practice knowledge-graph tools were not mounted.", Cause.pretty(cause)))
  )
);
