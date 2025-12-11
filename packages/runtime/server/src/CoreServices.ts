import { AuthEmailService } from "@beep/iam-infra";
import type { Email } from "@beep/shared-infra/Email";
import { Live, type SharedServices } from "@beep/shared-infra/Live";
import * as Layer from "effect/Layer";
export type CoreServicesLive = Layer.Layer<Email.ResendService | AuthEmailService | SharedServices, never, never>;

const layer = Layer.mergeAll(Live);

export const CoreServicesLive: CoreServicesLive = AuthEmailService.DefaultWithoutDependencies.pipe(
  Layer.provideMerge(layer)
);
