/**
 * Composition of the practice gateway: the setup services, the always-on
 * setup tools, and the provider toolkits the saved profile selects, served
 * over stdio.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { SetupDoctor } from "@beep/law-practice-use-cases/PracticeSetup";
import { handshakeMcpProtocols } from "@beep/mcp-kit";
import { WindowsSecretStore } from "@beep/windows-secrets";
import * as McpServer from "effect/ai/McpServer";
import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { ElicitedApprovals } from "./Approvals.ts";
import { BoxDriveProviderLayer } from "./BoxDriveTools.ts";
import { GatewaySettings } from "./GatewaySettings.ts";
import { PracticeKgProviderLayer } from "./PracticeKgProvider.ts";
import { GatewaySetupProbes } from "./Probes.ts";
import { ProfileStore } from "./ProfileStore.ts";
import { SetupToolsLayer } from "./SetupTools.ts";
import { PRACTICE_GATEWAY_VERSION } from "./Version.ts";
import { WindowsHost } from "./WindowsHost.ts";

/**
 * Instructions the gateway sends on `initialize`.
 *
 * **Example** (Read the instructions)
 *
 * ```ts
 * import { PRACTICE_GATEWAY_INSTRUCTIONS } from "@beep/practice-gateway/Server"
 *
 * console.log(PRACTICE_GATEWAY_INSTRUCTIONS.includes("setup_status")) // true
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const PRACTICE_GATEWAY_INSTRUCTIONS =
  "Practice gateway for a law practice's workstation. setup_status checks this computer against the saved practice profile and lists the steps only the lawyer can take; setup_repair runs one automatic repair after the lawyer approves it in a prompt; setup_profile_get and setup_profile_save read and write the onboarding interview's profile. Practice tools (such as the practice knowledge graph) appear when the saved profile selects them and Claude restarts the gateway.";

const logLayerFailure = (message: string) => (cause: Cause.Cause<unknown>) =>
  Layer.effectDiscard(Effect.logWarning(message, Cause.pretty(cause)));

// Off Windows there is no secret store; probes that need it answer "only on Windows".
const SetupProbesForPlatform = Layer.unwrap(
  GatewaySettings.useSync((settings) =>
    settings.isWindows
      ? GatewaySetupProbes.pipe(
          Layer.provide(
            WindowsSecretStore.layerWindows.pipe(
              Layer.catchCause(logLayerFailure("The Windows secret store could not be opened."))
            )
          )
        )
      : GatewaySetupProbes
  )
);

/**
 * Setup services: settings, profile store, Windows host and the setup doctor
 * with the gateway's probes and elicited approvals. The settings, profile
 * store and Windows host are also exposed to the provider layers.
 *
 * **Details**
 *
 * Needs the platform file system, path and child-process services
 * (`BunServices.layer` in the executable).
 *
 * **Example** (Compose the setup services)
 *
 * ```ts
 * import { GatewayServicesLayer } from "@beep/practice-gateway/Server"
 * import * as Layer from "effect/Layer"
 *
 * console.log(Layer.isLayer(GatewayServicesLayer))
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const GatewayServicesLayer = SetupDoctor.layer.pipe(
  Layer.provide(Layer.merge(SetupProbesForPlatform, ElicitedApprovals)),
  Layer.provideMerge(WindowsHost.layer),
  Layer.provideMerge(ProfileStore.layer),
  Layer.provideMerge(GatewaySettings.layer)
);

/**
 * The full stdio gateway: setup tools plus selected providers over the setup
 * services.
 *
 * **Example** (Compose the stdio gateway)
 *
 * ```ts
 * import { GatewayServerLayer } from "@beep/practice-gateway/Server"
 * import * as Layer from "effect/Layer"
 *
 * console.log(Layer.isLayer(GatewayServerLayer))
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const GatewayServerLayer = Layer.mergeAll(SetupToolsLayer, PracticeKgProviderLayer, BoxDriveProviderLayer).pipe(
  Layer.provide(
    McpServer.layerStdio({
      name: "beep-practice-gateway",
      version: PRACTICE_GATEWAY_VERSION,
      instructions: PRACTICE_GATEWAY_INSTRUCTIONS,
      protocols: handshakeMcpProtocols,
    })
  ),
  Layer.provide(GatewayServicesLayer),
  Layer.orDie
);
