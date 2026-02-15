import type {IamClientContext} from "@beep/iam-client/_internal";
import * as Context from "effect/Context";
import {$IamClientId} from "@beep/identity/packages";
import type { Group } from "./layer"

const $I = $IamClientId.create("connections/service");

export class Service extends Context.Tag($I`Service`)<
  Service,
  IamClientContext<typeof Group>
>() {
}
