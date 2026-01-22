import * as Common from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
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
  id: S.String,
  name: S.String,
  email: S.String,
  image: S.NullOr(S.String),
});

// =============================================================================
// ACTIVE MEMBER
// =============================================================================

const ActiveMember = S.Struct({
  id: S.String,
  organizationId: S.String,
  userId: S.String,
  role: S.String,
  createdAt: S.DateFromString,
  teamId: S.optional(S.String),
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
