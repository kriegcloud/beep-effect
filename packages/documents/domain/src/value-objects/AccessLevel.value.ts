import { $DocumentsDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";

const $I = $DocumentsDomainId.create("value-objects/AccessLevel.value");

export class AccessLevel extends BS.StringLiteralKit("view", "comment", "edit", "full").annotations(
  $I.annotations("AccessLevel", {
    description: "Granular permission level: view (read-only), comment (view + annotate), edit (view + modify content), full (edit + manage sharing + delete)",
  })
) {}

export declare namespace AccessLevel {
  export type Type = typeof AccessLevel.Type;
  export type Encoded = typeof AccessLevel.Encoded;
}
