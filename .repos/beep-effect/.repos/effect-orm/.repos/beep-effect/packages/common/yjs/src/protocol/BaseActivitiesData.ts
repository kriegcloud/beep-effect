import { $YjsId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { ActivityData } from "./InboxNotifications";

const $I = $YjsId.create("protocol/BaseActivitiesData");

const BaseActivitiesDataKey = S.TemplateLiteral("$", S.String).annotations(
  $I.annotations("BaseActivitiesDataKey", {
    description: "Base activities data key for Yjs protocol",
  })
);

export declare namespace BaseActivitiesDataKey {
  export type Type = S.Schema.Type<typeof BaseActivitiesDataKey>;
  export type Encoded = S.Schema.Encoded<typeof BaseActivitiesDataKey>;
}

export class BaseActivitiesData extends S.Record({
  key: BaseActivitiesDataKey,
  value: ActivityData,
}).annotations(
  $I.annotations("BaseActivitiesData", {
    description: "Base activities data for Yjs protocol",
  })
) {}

export declare namespace BaseActivitiesData {
  export type Type = S.Schema.Type<typeof BaseActivitiesData>;
  export type Encoded = S.Schema.Encoded<typeof BaseActivitiesData>;
}
