/**
 * installer-channels server use-case exports.
 *
 * @packageDocumentation
 * @category repositories
 * @since 0.0.0
 */

import { $InstallerChannelsUseCasesId } from "@beep/identity/packages";
import type { Effect } from "effect";
import { Context } from "effect";
import type * as S from "effect/Schema";
import type { DiscordChannelPlan } from "./public.js";

const $I = $InstallerChannelsUseCasesId.create("server");

/**
 * Channel use-case service shape.
 *
 * @category repositories
 * @since 0.0.0
 */
export interface InstallerChannelsUseCasesShape {
  readonly previewDiscordChannels: () => Effect.Effect<DiscordChannelPlan, S.SchemaError>;
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
