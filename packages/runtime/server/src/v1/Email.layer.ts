import { Email } from "@beep/shared-infra/Email";
import type * as Layer from "effect/Layer";

export type Services = Email.ResendService;

export const layer: Layer.Layer<Services, never, never> = Email.ResendService.layer;
