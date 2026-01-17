import { $IamClientId } from "@beep/identity/packages";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Common from "../_common";
import { Group, layer } from "./layer.ts";

const $I = $IamClientId.create("sign-up/service");

export class Service extends Effect.Service<Service>()($I`Service`, {
  accessors: true,
  effect: Group.accessHandlers("Email"),
}) {}

export const runtime = Common.makeAtomRuntime(Service.Default.pipe(Layer.provide(layer)));
