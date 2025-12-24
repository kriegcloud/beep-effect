import { $YjsId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import type * as S from "effect/Schema";

const $I = $YjsId.create("protocol/NotificationSettings");
/**
 * Pre-defined notification channels support list.
 */
export class NotificationChannel extends BS.StringLiteralKit("email", "slack", "teams", "webPush").annotations(
  $I.annotations("NotificationChannel", {
    description: "Pre-defined notification channels support list.",
  })
) {}

export declare namespace NotificationChannel {
  export type Type = S.Schema.Type<typeof NotificationChannel>;
  export type Encoded = S.Schema.Encoded<typeof NotificationChannel>;
}

/**
 * `K` represents custom notification kinds
 * defined in the augmentation `ActivitiesData` (e.g `liveblocks.config.ts`).
 * It means the type `NotificationKind` will be shaped like:
 * thread | textMention | $customKind1 | $customKind2 | ...
 */
// export type NotificationKind<K extends keyof DAD = keyof DAD> =
//   | "thread"
//   | "textMention"
//   | K;

/**
 * A notification channel settings is a set of notification kinds.
 * One setting can have multiple kinds (+ augmentation)
 */
// export type NotificationChannelSettings = {
//   [K in NotificationKind]: boolean;
// };

/**
 * @private
 *
 * Base definition of notification settings.
 * Plain means it's a simple object coming from the remote backend.
 *
 * It's the raw settings object where somme channels cannot exists
 * because there are no notification kinds enabled on the dashboard.
 * And this object isn't yet proxied by the creator factory `createNotificationSettings`.
 */
// export type NotificationSettingsPlain = {
//   [C in NotificationChannel]?: NotificationChannelSettings;
// };

/**
 * @internal
 *
 * Symbol to branch plain value of notification settings
 * inside the NotificationSettings object.
 */
// const kPlain = Symbol.for("notification-settings-plain");

/**
 * @internal
 * Proxied `NotificationSettingsPlain` object.
 */
// type ProxiedNotificationSettings = NotificationSettingsPlain;
