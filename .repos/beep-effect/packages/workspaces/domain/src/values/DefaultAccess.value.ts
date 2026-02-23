import { $WorkspacesDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";

const $I = $WorkspacesDomainId.create("values/DefaultAccess.value");

export class DefaultAccess extends BS.StringLiteralKit("private", "restricted", "organization").annotations(
  $I.annotations("DefaultAccess", {
    description:
      "Base visibility of a page: private (creator only), restricted (explicit shares only), organization (all org members can view)",
  })
) {}

export declare namespace DefaultAccess {
  export type Type = typeof DefaultAccess.Type;
  export type Encoded = typeof DefaultAccess.Encoded;
}
