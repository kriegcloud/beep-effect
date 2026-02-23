import type { IamClientContext } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import { liftContextMethod } from "@beep/utils/effect";
import * as Context from "effect/Context";
import type { Group } from "./layer";

const $I = $IamClientId.create("connections/service");

export class Service extends Context.Tag($I`Service`)<Service, IamClientContext<typeof Group>>() {
  static readonly lift = liftContextMethod(Service);
}
