import * as Common from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("organization/get-active-member");

// =============================================================================
// PAYLOAD (No payload - empty struct)
// =============================================================================

export class Payload extends S.Class<Payload>($I`Payload`)({}) {}

// =============================================================================
// EMBEDDED USER
// =============================================================================

const EmbeddedUser = S.Struct({
  id: SharedEntityIds.UserId,
  name: S.String,
  email: BS.Email,
  image: S.NullOr(S.String),
});

// =============================================================================
// ACTIVE MEMBER
// =============================================================================

const ActiveMember = S.Struct({
  id: IamEntityIds.MemberId,
  organizationId: SharedEntityIds.OrganizationId,
  userId: SharedEntityIds.UserId,
  role: S.String,
  createdAt: BS.DateTimeUtcFromAllAcceptable,
  teamId: S.optional(SharedEntityIds.TeamId),
  user: EmbeddedUser,
});

// =============================================================================
// SUCCESS
// =============================================================================

export class Success extends S.Class<Success>($I`Success`)({
  member: S.NullOr(ActiveMember),
}) {}

// =============================================================================
// WRAPPER
// =============================================================================

export const Wrapper = W.Wrapper.make("GetActiveMember", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
