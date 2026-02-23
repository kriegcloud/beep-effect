import { BS } from "@beep/schema";
import * as Calendar from "./calendar";
import * as Comms from "./comms";
import * as Customization from "./customization";
import * as Documents from "./documents";
import * as Iam from "./iam";
import * as Knowledge from "./knowledge";
import * as Shared from "./shared";

export class Action extends BS.StringLiteralKit(
  "*",
  ...Calendar.Action.Options,
  ...Comms.Action.Options,
  ...Customization.Action.Options,
  ...Documents.Action.Options,
  ...Iam.Action.Options,
  ...Knowledge.Action.Options,
  ...Shared.Action.Options
) {}

export declare namespace Action {
  export type Type = typeof Action.Type;
}
