import type { Email } from "@beep/shared-infra/Email";
import { Live, type SharedServices } from "@beep/shared-infra/Live";
import type * as Layer from "effect/Layer";
export type CoreServicesLive = Layer.Layer<Email.ResendService | SharedServices, never, never>;

export const CoreServicesLive: CoreServicesLive = Live;
