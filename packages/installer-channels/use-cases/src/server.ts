/**
 * installer-channels server use-case exports.
 *
 * @packageDocumentation
 * @category repositories
 * @since 0.0.0
 */

import { $InstallerChannelsUseCasesId } from "@beep/identity/packages";
import { Context, type Effect, type Redacted } from "effect";
import type * as S from "effect/Schema";
import type { DiscordChannelPlan, DiscordLiveValidationRequest, DiscordLiveValidationResult } from "./public.js";

const $I = $InstallerChannelsUseCasesId.create("server");

/**
 * Channel use-case service shape.
 *
 * @category repositories
 * @since 0.0.0
 */
interface InstallerChannelsUseCasesShape {
  readonly previewDiscordChannels: () => Effect.Effect<DiscordChannelPlan, S.SchemaError>;
  readonly validateDiscordChannel: (
    request: DiscordLiveValidationRequest,
    botToken: Redacted.Redacted<string>
  ) => Effect.Effect<DiscordLiveValidationResult, S.SchemaError>;
}

/**
 * Channel use-case service key.
 *
 * @category repositories
 * @since 0.0.0
 */
export class InstallerChannelsUseCases extends Context.Service<
  InstallerChannelsUseCases,
  InstallerChannelsUseCasesShape
>()($I`InstallerChannelsUseCases`) {}
