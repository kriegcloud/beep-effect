import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { Organization } from "../../_common/index.ts";

const $I = $IamClientId.create("organization/crud/list");

// No payload - list returns all user's organizations
export const Success = S.Array(Organization).annotations(
  $I.annotations("Success", {
    description: "Array of organizations the user belongs to.",
  })
);
