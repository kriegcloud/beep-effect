import { Contract, ContractKit } from "@beep/contract";
import { IamError } from "@beep/iam-client/errors";
import { Invitation, Member, Organization, OrganizationRole } from "@beep/iam-domain/entities";
import { BS } from "@beep/schema";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { User } from "@beep/shared-domain/entities";
import { PolicyRecord } from "@beep/shared-domain/Policy";
import * as S from "effect/Schema";

const MetadataSchema = S.optional(
  S.NullOr(
    S.Record({
      key: S.NonEmptyTrimmedString,
      value: S.Any,
    })
  )
);

const OrganizationViewFields = {
  ...Organization.Model.select.pick("id", "name", "slug", "logo", "createdAt").fields,
  metadata: MetadataSchema,
} as const;

export class OrganizationView extends S.Class<OrganizationView>("OrganizationView")(S.Struct(OrganizationViewFields), {
  schemaId: Symbol.for("@beep/iam-client/clients/organization/OrganizationView"),
  identifier: "OrganizationView",
  title: "Organization Summary",
  description: "Minimal organization information returned by Better Auth organization APIs.",
}) {}

export declare namespace OrganizationView {
  export type Type = S.Schema.Type<typeof OrganizationView>;
  export type Encoded = S.Schema.Encoded<typeof OrganizationView>;
}

const MemberCoreFields = Member.Model.select.pick("id", "organizationId", "userId", "role", "createdAt").fields;

export class OrganizationMemberView extends S.Class<OrganizationMemberView>("OrganizationMemberView")(
  S.Struct({
    ...MemberCoreFields,
  }),
  {
    schemaId: Symbol.for("@beep/iam-client/clients/organization/OrganizationMemberView"),
    identifier: "OrganizationMemberView",
    title: "Organization Member View",
    description: "Member information returned by Better Auth without embedded user details.",
  }
) {}

export declare namespace OrganizationMemberView {
  export type Type = S.Schema.Type<typeof OrganizationMemberView>;
  export type Encoded = S.Schema.Encoded<typeof OrganizationMemberView>;
}

export class OrganizationMemberUserView extends S.Class<OrganizationMemberUserView>("OrganizationMemberUserView")(
  S.Struct({
    ...User.Model.select.pick("id", "name", "email", "image").fields,
  }),
  {
    schemaId: Symbol.for("@beep/iam-client/clients/organization/OrganizationMemberUserView"),
    identifier: "OrganizationMemberUserView",
    title: "Organization Member User View",
    description: "User profile details embedded in organization member responses.",
  }
) {}

export declare namespace OrganizationMemberUserView {
  export type Type = S.Schema.Type<typeof OrganizationMemberUserView>;
  export type Encoded = S.Schema.Encoded<typeof OrganizationMemberUserView>;
}

const OrganizationMemberWithUserFields = {
  ...MemberCoreFields,
  user: OrganizationMemberUserView,
} as const;

export class OrganizationMemberWithUserView extends S.Class<OrganizationMemberWithUserView>(
  "OrganizationMemberWithUserView"
)(S.Struct(OrganizationMemberWithUserFields), {
  schemaId: Symbol.for("@beep/iam-client/clients/organization/OrganizationMemberWithUserView"),
  identifier: "OrganizationMemberWithUserView",
  title: "Organization Member With User View",
  description: "Member information including the related user profile.",
}) {}

export declare namespace OrganizationMemberWithUserView {
  export type Type = S.Schema.Type<typeof OrganizationMemberWithUserView>;
  export type Encoded = S.Schema.Encoded<typeof OrganizationMemberWithUserView>;
}

const OrganizationInvitationFields = Invitation.Model.select.pick(
  "id",
  "organizationId",
  "email",
  "role",
  "status",
  "teamId",
  "inviterId",
  "expiresAt"
).fields;

export class OrganizationInvitationView extends S.Class<OrganizationInvitationView>("OrganizationInvitationView")(
  S.Struct(OrganizationInvitationFields),
  {
    schemaId: Symbol.for("@beep/iam-client/clients/organization/OrganizationInvitationView"),
    identifier: "OrganizationInvitationView",
    title: "Organization Invitation View",
    description: "Invitation record returned by Better Auth organization APIs.",
  }
) {}

export declare namespace OrganizationInvitationView {
  export type Type = S.Schema.Type<typeof OrganizationInvitationView>;
  export type Encoded = S.Schema.Encoded<typeof OrganizationInvitationView>;
}

const OrganizationInvitationDetailFields = {
  ...OrganizationInvitationFields,
  organizationName: S.String,
  organizationSlug: S.String,
  inviterEmail: S.String,
} as const;

export class OrganizationInvitationDetailView extends S.Class<OrganizationInvitationDetailView>(
  "OrganizationInvitationDetailView"
)(S.Struct(OrganizationInvitationDetailFields), {
  schemaId: Symbol.for("@beep/iam-client/clients/organization/OrganizationInvitationDetailView"),
  identifier: "OrganizationInvitationDetailView",
  title: "Organization Invitation Detail View",
  description: "Invitation details enriched with organization and inviter context.",
}) {}

export declare namespace OrganizationInvitationDetailView {
  export type Type = S.Schema.Type<typeof OrganizationInvitationDetailView>;
  export type Encoded = S.Schema.Encoded<typeof OrganizationInvitationDetailView>;
}

export class OrganizationCreatePayload extends S.Class<OrganizationCreatePayload>("OrganizationCreatePayload")(
  S.Struct(OrganizationView.fields),
  {
    schemaId: Symbol.for("@beep/iam-client/clients/organization/OrganizationCreatePayload"),
    identifier: "OrganizationCreatePayload",
    title: "Organization Create Payload",
    description: "Payload for creating an organization via Better Auth.",
  }
) {}

export declare namespace OrganizationCreatePayload {
  export type Type = S.Schema.Type<typeof OrganizationCreatePayload>;
  export type Encoded = S.Schema.Encoded<typeof OrganizationCreatePayload>;
}

export class OrganizationCreateSuccess extends S.Class<OrganizationCreateSuccess>("OrganizationCreateSuccess")(
  OrganizationView.fields,
  {
    schemaId: Symbol.for("@beep/iam-client/clients/organization/OrganizationCreateSuccess"),
    identifier: "OrganizationCreateSuccess",
    title: "Organization Create Success",
    description: "Response returned after successfully creating an organization.",
  }
) {}

export declare namespace OrganizationCreateSuccess {
  export type Type = S.Schema.Type<typeof OrganizationCreateSuccess>;
  export type Encoded = S.Schema.Encoded<typeof OrganizationCreateSuccess>;
}

const OrganizationCheckSlugPayloadFields = {
  slug: Organization.Model.select.pick("slug").fields.slug,
} as const;

export class OrganizationCheckSlugPayload extends S.Class<OrganizationCheckSlugPayload>("OrganizationCheckSlugPayload")(
  OrganizationCheckSlugPayloadFields,
  {
    schemaId: Symbol.for("@beep/iam-client/clients/organization/OrganizationCheckSlugPayload"),
    identifier: "OrganizationCheckSlugPayload",
    title: "Organization Check Slug Payload",
    description: "Payload for checking organization slug availability.",
  }
) {}

export declare namespace OrganizationCheckSlugPayload {
  export type Type = S.Schema.Type<typeof OrganizationCheckSlugPayload>;
  export type Encoded = S.Schema.Encoded<typeof OrganizationCheckSlugPayload>;
}

const OrganizationCheckSlugSuccessFields = {
  status: S.Boolean,
} as const;

export class OrganizationCheckSlugSuccess extends S.Class<OrganizationCheckSlugSuccess>("OrganizationCheckSlugSuccess")(
  OrganizationCheckSlugSuccessFields,
  {
    schemaId: Symbol.for("@beep/iam-client/clients/organization/OrganizationCheckSlugSuccess"),
    identifier: "OrganizationCheckSlugSuccess",
    title: "Organization Check Slug Success",
    description: "Response indicating slug availability.",
  }
) {}

export declare namespace OrganizationCheckSlugSuccess {
  export type Type = S.Schema.Type<typeof OrganizationCheckSlugSuccess>;
  export type Encoded = S.Schema.Encoded<typeof OrganizationCheckSlugSuccess>;
}

const OrganizationSetActivePayloadFields = {
  organizationId: S.optional(S.NullOr(SharedEntityIds.OrganizationId)),
  organizationSlug: S.optional(S.String),
} as const;

export class OrganizationSetActivePayload extends S.Class<OrganizationSetActivePayload>("OrganizationSetActivePayload")(
  S.Struct(OrganizationSetActivePayloadFields),
  {
    schemaId: Symbol.for("@beep/iam-client/clients/organization/OrganizationSetActivePayload"),
    identifier: "OrganizationSetActivePayload",
    title: "Organization Set Active Payload",
    description: "Payload for setting or clearing the active organization.",
  }
) {}

export declare namespace OrganizationSetActivePayload {
  export type Type = S.Schema.Type<typeof OrganizationSetActivePayload>;
  export type Encoded = S.Schema.Encoded<typeof OrganizationSetActivePayload>;
}

const OrganizationGetFullPayloadFields = {
  organizationId: S.optional(SharedEntityIds.OrganizationId),
  organizationSlug: S.optional(S.String),
  membersLimit: S.optional(S.Number),
} as const;

export class OrganizationGetFullPayload extends S.Class<OrganizationGetFullPayload>("OrganizationGetFullPayload")(
  S.Struct(OrganizationGetFullPayloadFields),
  {
    schemaId: Symbol.for("@beep/iam-client/clients/organization/OrganizationGetFullPayload"),
    identifier: "OrganizationGetFullPayload",
    title: "Organization Get Full Payload",
    description: "Query parameters for retrieving full organization data.",
  }
) {}

export declare namespace OrganizationGetFullPayload {
  export type Type = S.Schema.Type<typeof OrganizationGetFullPayload>;
  export type Encoded = S.Schema.Encoded<typeof OrganizationGetFullPayload>;
}

const OrganizationTeamFields = {
  id: SharedEntityIds.TeamId,
  organizationId: SharedEntityIds.OrganizationId,
  name: S.String,
  createdAt: BS.DateTimeUtcFromAllAcceptable,
  updatedAt: S.optional(BS.DateTimeUtcFromAllAcceptable),
} as const;

export class OrganizationTeamView extends S.Class<OrganizationTeamView>("OrganizationTeamView")(
  S.Struct(OrganizationTeamFields),
  {
    schemaId: Symbol.for("@beep/iam-client/clients/organization/OrganizationTeamView"),
    identifier: "OrganizationTeamView",
    title: "Organization Team View",
    description: "Team information returned when teams are enabled.",
  }
) {}

export declare namespace OrganizationTeamView {
  export type Type = S.Schema.Type<typeof OrganizationTeamView>;
  export type Encoded = S.Schema.Encoded<typeof OrganizationTeamView>;
}

const OrganizationFullFields = {
  ...OrganizationViewFields,
  members: S.Array(OrganizationMemberWithUserView),
  invitations: S.Array(OrganizationInvitationView),
  teams: S.optional(S.Array(OrganizationTeamView)),
} as const;

export class OrganizationFullView extends S.Class<OrganizationFullView>("OrganizationFullView")(
  S.Struct(OrganizationFullFields),
  {
    schemaId: Symbol.for("@beep/iam-client/clients/organization/OrganizationFullView"),
    identifier: "OrganizationFullView",
    title: "Organization Full View",
    description: "Detailed organization representation including members, invitations, and teams.",
  }
) {}

export declare namespace OrganizationFullView {
  export type Type = S.Schema.Type<typeof OrganizationFullView>;
  export type Encoded = S.Schema.Encoded<typeof OrganizationFullView>;
}

const OrganizationUpdateDataFields = {
  ...Organization.Model.update.pick("name", "slug", "logo").fields,
  metadata: MetadataSchema,
} as const;

export class OrganizationUpdateData extends S.Class<OrganizationUpdateData>("OrganizationUpdateData")(
  S.Struct(OrganizationUpdateDataFields),
  {
    schemaId: Symbol.for("@beep/iam-client/clients/organization/OrganizationUpdateData"),
    identifier: "OrganizationUpdateData",
    title: "Organization Update Data",
    description: "Mutable fields for updating an organization.",
  }
) {}

export declare namespace OrganizationUpdateData {
  export type Type = S.Schema.Type<typeof OrganizationUpdateData>;
  export type Encoded = S.Schema.Encoded<typeof OrganizationUpdateData>;
}

const OrganizationUpdatePayloadFields = {
  organizationId: SharedEntityIds.OrganizationId,
  data: OrganizationView,
} as const;

export class OrganizationUpdatePayload extends S.Class<OrganizationUpdatePayload>("OrganizationUpdatePayload")(
  S.Struct(OrganizationUpdatePayloadFields),
  {
    schemaId: Symbol.for("@beep/iam-client/clients/organization/OrganizationUpdatePayload"),
    identifier: "OrganizationUpdatePayload",
    title: "Organization Update Payload",
    description: "Payload for updating organization metadata.",
  }
) {}

export declare namespace OrganizationUpdatePayload {
  export type Type = S.Schema.Type<typeof OrganizationUpdatePayload>;
  export type Encoded = S.Schema.Encoded<typeof OrganizationUpdatePayload>;
}

// const OrganizationDeletePayloadFields = {
//   organizationId: SharedEntityIds.OrganizationId,
// } as const;

export class OrganizationDeletePayload extends S.Class<OrganizationDeletePayload>("OrganizationDeletePayload")(
  OrganizationView.fields,
  {
    schemaId: Symbol.for("@beep/iam-client/clients/organization/OrganizationDeletePayload"),
    identifier: "OrganizationDeletePayload",
    title: "Organization Delete Payload",
    description: "Payload for deleting an organization.",
  }
) {}

export declare namespace OrganizationDeletePayload {
  export type Type = S.Schema.Type<typeof OrganizationDeletePayload>;
  export type Encoded = S.Schema.Encoded<typeof OrganizationDeletePayload>;
}

const AcceptInvitationPayloadFields = {
  invitationId: IamEntityIds.InvitationId,
} as const;

export class AcceptInvitationPayload extends S.Class<AcceptInvitationPayload>("AcceptInvitationPayload")(
  AcceptInvitationPayloadFields,
  {
    schemaId: Symbol.for("@beep/iam-client/clients/organization/AcceptInvitationPayload"),
    identifier: "AcceptInvitationPayload",
    description: "Payload for accepting an organization invitation.",
  }
) {}

export declare namespace AcceptInvitationPayload {
  export type Type = S.Schema.Type<typeof AcceptInvitationPayload>;
  export type Encoded = S.Schema.Encoded<typeof AcceptInvitationPayload>;
}

const AcceptInvitationSuccessFields = {
  invitation: OrganizationInvitationView,
  member: OrganizationMemberView,
} as const;

export class AcceptInvitationSuccess extends S.Class<AcceptInvitationSuccess>("AcceptInvitationSuccess")(
  S.Struct(AcceptInvitationSuccessFields),
  {
    schemaId: Symbol.for("@beep/iam-client/clients/organization/AcceptInvitationSuccess"),
    identifier: "AcceptInvitationSuccess",
    title: "Accept Invitation Success",
    description: "Response returned after successfully accepting an invitation.",
  }
) {}

export declare namespace AcceptInvitationSuccess {
  export type Type = S.Schema.Type<typeof AcceptInvitationSuccess>;
  export type Encoded = S.Schema.Encoded<typeof AcceptInvitationSuccess>;
}

const RoleValueSchema = S.Union(Member.MemberRole, S.mutable(S.Array(Member.MemberRole)));
const TeamIdentifierSchema = S.Union(SharedEntityIds.TeamId, S.Array(SharedEntityIds.TeamId));

const OrganizationInviteMemberPayloadFields = {
  email: Invitation.Model.insert.pick("email").fields.email,
  role: RoleValueSchema,
  organizationId: S.optional(SharedEntityIds.OrganizationId),
  resend: S.optional(S.Boolean),
  teamId: S.optional(TeamIdentifierSchema),
} as const;

export class OrganizationInviteMemberPayload extends S.Class<OrganizationInviteMemberPayload>(
  "OrganizationInviteMemberPayload"
)(S.Struct(OrganizationInviteMemberPayloadFields), {
  schemaId: Symbol.for("@beep/iam-client/clients/organization/OrganizationInviteMemberPayload"),
  identifier: "OrganizationInviteMemberPayload",
  title: "Organization Invite Member Payload",
  description: "Payload for inviting a member to an organization through Better Auth.",
}) {}

export declare namespace OrganizationInviteMemberPayload {
  export type Type = S.Schema.Type<typeof OrganizationInviteMemberPayload>;
  export type Encoded = S.Schema.Encoded<typeof OrganizationInviteMemberPayload>;
}

const OrganizationCancelInvitationPayloadFields = {
  invitationId: IamEntityIds.InvitationId,
} as const;

export class OrganizationCancelInvitationPayload extends S.Class<OrganizationCancelInvitationPayload>(
  "OrganizationCancelInvitationPayload"
)(OrganizationCancelInvitationPayloadFields, {
  schemaId: Symbol.for("@beep/iam-client/clients/organization/OrganizationCancelInvitationPayload"),
  identifier: "OrganizationCancelInvitationPayload",
  title: "Organization Cancel Invitation Payload",
  description: "Payload for cancelling a pending organization invitation.",
}) {}

export declare namespace OrganizationCancelInvitationPayload {
  export type Type = S.Schema.Type<typeof OrganizationCancelInvitationPayload>;
  export type Encoded = S.Schema.Encoded<typeof OrganizationCancelInvitationPayload>;
}

const OrganizationRejectInvitationPayloadFields = {
  invitationId: IamEntityIds.InvitationId,
} as const;

export class OrganizationRejectInvitationPayload extends S.Class<OrganizationRejectInvitationPayload>(
  "OrganizationRejectInvitationPayload"
)(OrganizationRejectInvitationPayloadFields, {
  schemaId: Symbol.for("@beep/iam-client/clients/organization/OrganizationRejectInvitationPayload"),
  identifier: "OrganizationRejectInvitationPayload",
  title: "Organization Reject Invitation Payload",
  description: "Payload for rejecting an organization invitation as the invitee.",
}) {}

export declare namespace OrganizationRejectInvitationPayload {
  export type Type = S.Schema.Type<typeof OrganizationRejectInvitationPayload>;
  export type Encoded = S.Schema.Encoded<typeof OrganizationRejectInvitationPayload>;
}

export class OrganizationRejectInvitationSuccess extends S.Class<OrganizationRejectInvitationSuccess>(
  "OrganizationRejectInvitationSuccess"
)(
  S.Struct({
    invitation: S.NullOr(OrganizationInvitationView),
    member: S.Null,
  }),
  {
    schemaId: Symbol.for("@beep/iam-client/clients/organization/OrganizationRejectInvitationSuccess"),
    identifier: "OrganizationRejectInvitationSuccess",
    title: "Organization Reject Invitation Success",
    description: "Response returned after rejecting a pending invitation.",
  }
) {}

export declare namespace OrganizationRejectInvitationSuccess {
  export type Type = S.Schema.Type<typeof OrganizationRejectInvitationSuccess>;
  export type Encoded = S.Schema.Encoded<typeof OrganizationRejectInvitationSuccess>;
}

const OrganizationListInvitationsPayloadFields = {
  organizationId: S.optional(SharedEntityIds.OrganizationId),
} as const;

export class OrganizationListInvitationsPayload extends S.Class<OrganizationListInvitationsPayload>(
  "OrganizationListInvitationsPayload"
)(S.Struct(OrganizationListInvitationsPayloadFields), {
  schemaId: Symbol.for("@beep/iam-client/clients/organization/OrganizationListInvitationsPayload"),
  identifier: "OrganizationListInvitationsPayload",
  title: "Organization List Invitations Payload",
  description: "Query parameters for listing invitations within an organization.",
}) {}

export declare namespace OrganizationListInvitationsPayload {
  export type Type = S.Schema.Type<typeof OrganizationListInvitationsPayload>;
  export type Encoded = S.Schema.Encoded<typeof OrganizationListInvitationsPayload>;
}

const OrganizationListUserInvitationsPayloadFields = {
  email: S.optional(Invitation.Model.select.pick("email").fields.email),
} as const;

export class OrganizationListUserInvitationsPayload extends S.Class<OrganizationListUserInvitationsPayload>(
  "OrganizationListUserInvitationsPayload"
)(S.Struct(OrganizationListUserInvitationsPayloadFields), {
  schemaId: Symbol.for("@beep/iam-client/clients/organization/OrganizationListUserInvitationsPayload"),
  identifier: "OrganizationListUserInvitationsPayload",
  title: "Organization List User Invitations Payload",
  description: "Query parameters for listing invitations associated with a specific user email.",
}) {}

export declare namespace OrganizationListUserInvitationsPayload {
  export type Type = S.Schema.Type<typeof OrganizationListUserInvitationsPayload>;
  export type Encoded = S.Schema.Encoded<typeof OrganizationListUserInvitationsPayload>;
}

const OrganizationGetInvitationPayloadFields = {
  id: IamEntityIds.InvitationId,
} as const;

export class OrganizationGetInvitationPayload extends S.Class<OrganizationGetInvitationPayload>(
  "OrganizationGetInvitationPayload"
)(OrganizationGetInvitationPayloadFields, {
  schemaId: Symbol.for("@beep/iam-client/clients/organization/OrganizationGetInvitationPayload"),
  identifier: "OrganizationGetInvitationPayload",
  title: "Organization Get Invitation Payload",
  description: "Payload for retrieving a specific invitation by identifier.",
}) {}

export declare namespace OrganizationGetInvitationPayload {
  export type Type = S.Schema.Type<typeof OrganizationGetInvitationPayload>;
  export type Encoded = S.Schema.Encoded<typeof OrganizationGetInvitationPayload>;
}

const FilterOperatorSchema = S.Literal("eq", "ne", "lt", "lte", "gt", "gte", "contains");
const OrganizationListMembersPayloadFields = {
  limit: S.optional(S.NumberFromString),
  offset: S.optional(S.NumberFromString),
  sortBy: S.optional(S.String),
  sortDirection: S.optional(S.Literal("asc", "desc")),
  filterField: S.optional(S.String),
  filterValue: S.optional(S.Union(S.String, S.Number, S.Boolean)),
  filterOperator: S.optional(FilterOperatorSchema),
  organizationId: S.optional(SharedEntityIds.OrganizationId),
} as const;

export class OrganizationListMembersPayload extends S.Class<OrganizationListMembersPayload>(
  "OrganizationListMembersPayload"
)(S.Struct(OrganizationListMembersPayloadFields), {
  schemaId: Symbol.for("@beep/iam-client/clients/organization/OrganizationListMembersPayload"),
  identifier: "OrganizationListMembersPayload",
  title: "Organization List Members Payload",
  description: "Query parameters supported by Better Auth for listing organization members.",
}) {}

export declare namespace OrganizationListMembersPayload {
  export type Type = S.Schema.Type<typeof OrganizationListMembersPayload>;
  export type Encoded = S.Schema.Encoded<typeof OrganizationListMembersPayload>;
}

const OrganizationListMembersSuccessFields = {
  members: S.Array(OrganizationMemberView),
  total: S.Number,
} as const;

export class OrganizationListMembersSuccess extends S.Class<OrganizationListMembersSuccess>(
  "OrganizationListMembersSuccess"
)(S.Struct(OrganizationListMembersSuccessFields), {
  schemaId: Symbol.for("@beep/iam-client/clients/organization/OrganizationListMembersSuccess"),
  identifier: "OrganizationListMembersSuccess",
  title: "Organization List Members Success",
  description: "Response payload containing members and pagination metadata.",
}) {}

export declare namespace OrganizationListMembersSuccess {
  export type Type = S.Schema.Type<typeof OrganizationListMembersSuccess>;
  export type Encoded = S.Schema.Encoded<typeof OrganizationListMembersSuccess>;
}

const OrganizationRemoveMemberPayloadFields = {
  memberIdOrEmail: S.String,
  organizationId: S.optional(SharedEntityIds.OrganizationId),
} as const;

export class OrganizationRemoveMemberPayload extends S.Class<OrganizationRemoveMemberPayload>(
  "OrganizationRemoveMemberPayload"
)(S.Struct(OrganizationRemoveMemberPayloadFields), {
  schemaId: Symbol.for("@beep/iam-client/clients/organization/OrganizationRemoveMemberPayload"),
  identifier: "OrganizationRemoveMemberPayload",
  title: "Organization Remove Member Payload",
  description: "Payload for removing a member from an organization.",
}) {}

export declare namespace OrganizationRemoveMemberPayload {
  export type Type = S.Schema.Type<typeof OrganizationRemoveMemberPayload>;
  export type Encoded = S.Schema.Encoded<typeof OrganizationRemoveMemberPayload>;
}

export class OrganizationRemoveMemberSuccess extends S.Class<OrganizationRemoveMemberSuccess>(
  "OrganizationRemoveMemberSuccess"
)(
  S.Struct({
    member: OrganizationMemberView,
  }),
  {
    schemaId: Symbol.for("@beep/iam-client/clients/organization/OrganizationRemoveMemberSuccess"),
    identifier: "OrganizationRemoveMemberSuccess",
    title: "Organization Remove Member Success",
    description: "Response returned after successfully removing an organization member.",
  }
) {}

export declare namespace OrganizationRemoveMemberSuccess {
  export type Type = S.Schema.Type<typeof OrganizationRemoveMemberSuccess>;
  export type Encoded = S.Schema.Encoded<typeof OrganizationRemoveMemberSuccess>;
}

const OrganizationUpdateMemberRolePayloadFields = {
  memberId: IamEntityIds.MemberId,
  role: RoleValueSchema,
  organizationId: S.optional(SharedEntityIds.OrganizationId),
} as const;

export class OrganizationUpdateMemberRolePayload extends S.Class<OrganizationUpdateMemberRolePayload>(
  "OrganizationUpdateMemberRolePayload"
)(S.Struct(OrganizationUpdateMemberRolePayloadFields), {
  schemaId: Symbol.for("@beep/iam-client/clients/organization/OrganizationUpdateMemberRolePayload"),
  identifier: "OrganizationUpdateMemberRolePayload",
  title: "Organization Update Member Role Payload",
  description: "Payload for updating a member's role within an organization.",
}) {}

export declare namespace OrganizationUpdateMemberRolePayload {
  export type Type = S.Schema.Type<typeof OrganizationUpdateMemberRolePayload>;
  export type Encoded = S.Schema.Encoded<typeof OrganizationUpdateMemberRolePayload>;
}

export class OrganizationUpdateMemberRoleSuccess extends S.Class<OrganizationUpdateMemberRoleSuccess>(
  "OrganizationUpdateMemberRoleSuccess"
)(
  S.Struct({
    member: OrganizationMemberView,
  }),
  {
    schemaId: Symbol.for("@beep/iam-client/clients/organization/OrganizationUpdateMemberRoleSuccess"),
    identifier: "OrganizationUpdateMemberRoleSuccess",
    title: "Organization Update Member Role Success",
    description: "Response returned after updating an organization member's role.",
  }
) {}

export declare namespace OrganizationUpdateMemberRoleSuccess {
  export type Type = S.Schema.Type<typeof OrganizationUpdateMemberRoleSuccess>;
  export type Encoded = S.Schema.Encoded<typeof OrganizationUpdateMemberRoleSuccess>;
}

const OrganizationGetActiveMemberRolePayloadFields = {
  userId: S.optional(SharedEntityIds.UserId),
  organizationId: S.optional(SharedEntityIds.OrganizationId),
} as const;

export class OrganizationGetActiveMemberRolePayload extends S.Class<OrganizationGetActiveMemberRolePayload>(
  "OrganizationGetActiveMemberRolePayload"
)(S.Struct(OrganizationGetActiveMemberRolePayloadFields), {
  schemaId: Symbol.for("@beep/iam-client/clients/organization/OrganizationGetActiveMemberRolePayload"),
  identifier: "OrganizationGetActiveMemberRolePayload",
  title: "Organization Get Active Member Role Payload",
  description: "Payload for retrieving the active member role for the current or specified user.",
}) {}

export declare namespace OrganizationGetActiveMemberRolePayload {
  export type Type = S.Schema.Type<typeof OrganizationGetActiveMemberRolePayload>;
  export type Encoded = S.Schema.Encoded<typeof OrganizationGetActiveMemberRolePayload>;
}

export class OrganizationGetActiveMemberRoleSuccess extends S.Class<OrganizationGetActiveMemberRoleSuccess>(
  "OrganizationGetActiveMemberRoleSuccess"
)(
  S.Struct({
    role: S.String,
  }),
  {
    schemaId: Symbol.for("@beep/iam-client/clients/organization/OrganizationGetActiveMemberRoleSuccess"),
    identifier: "OrganizationGetActiveMemberRoleSuccess",
    title: "Organization Get Active Member Role Success",
    description: "Response containing the role associated with the active member.",
  }
) {}

export declare namespace OrganizationGetActiveMemberRoleSuccess {
  export type Type = S.Schema.Type<typeof OrganizationGetActiveMemberRoleSuccess>;
  export type Encoded = S.Schema.Encoded<typeof OrganizationGetActiveMemberRoleSuccess>;
}

const OrganizationLeavePayloadFields = {
  organizationId: SharedEntityIds.OrganizationId,
} as const;

export class OrganizationLeavePayload extends S.Class<OrganizationLeavePayload>("OrganizationLeavePayload")(
  OrganizationLeavePayloadFields,
  {
    schemaId: Symbol.for("@beep/iam-client/clients/organization/OrganizationLeavePayload"),
    identifier: "OrganizationLeavePayload",
    title: "Organization Leave Payload",
    description: "Payload for leaving an organization.",
  }
) {}

export declare namespace OrganizationLeavePayload {
  export type Type = S.Schema.Type<typeof OrganizationLeavePayload>;
  export type Encoded = S.Schema.Encoded<typeof OrganizationLeavePayload>;
}

const OrganizationRoleViewFields = {
  ...OrganizationRole.Model.select.pick("id", "organizationId", "role", "permission", "createdAt", "updatedAt").fields,
} as const;

export class OrganizationRoleView extends S.Class<OrganizationRoleView>("OrganizationRoleView")(
  S.Struct(OrganizationRoleViewFields),
  {
    schemaId: Symbol.for("@beep/iam-client/clients/organization/OrganizationRoleView"),
    identifier: "OrganizationRoleView",
    title: "Organization Role View",
    description: "Representation of a dynamic access-control role tied to an organization.",
  }
) {}

export declare namespace OrganizationRoleView {
  export type Type = S.Schema.Type<typeof OrganizationRoleView>;
  export type Encoded = S.Schema.Encoded<typeof OrganizationRoleView>;
}

const OrganizationRoleCreatePayloadFields = {
  organizationId: S.optional(SharedEntityIds.OrganizationId),
  role: S.String,
  permission: PolicyRecord,
} as const;

export class OrganizationRoleCreatePayload extends S.Class<OrganizationRoleCreatePayload>(
  "OrganizationRoleCreatePayload"
)(S.Struct(OrganizationRoleCreatePayloadFields), {
  schemaId: Symbol.for("@beep/iam-client/clients/organization/OrganizationRoleCreatePayload"),
  identifier: "OrganizationRoleCreatePayload",
  title: "Organization Role Create Payload",
  description: "Payload for creating a dynamic access-control role.",
}) {}

export declare namespace OrganizationRoleCreatePayload {
  export type Type = S.Schema.Type<typeof OrganizationRoleCreatePayload>;
  export type Encoded = S.Schema.Encoded<typeof OrganizationRoleCreatePayload>;
}

const OrganizationRoleCreateSuccessFields = {
  success: S.Boolean,
  roleData: OrganizationRoleView,
  statements: PolicyRecord,
} as const;

export class OrganizationRoleCreateSuccess extends S.Class<OrganizationRoleCreateSuccess>(
  "OrganizationRoleCreateSuccess"
)(S.Struct(OrganizationRoleCreateSuccessFields), {
  schemaId: Symbol.for("@beep/iam-client/clients/organization/OrganizationRoleCreateSuccess"),
  identifier: "OrganizationRoleCreateSuccess",
  title: "Organization Role Create Success",
  description: "Response returned after creating an organization role.",
}) {}

export declare namespace OrganizationRoleCreateSuccess {
  export type Type = S.Schema.Type<typeof OrganizationRoleCreateSuccess>;
  export type Encoded = S.Schema.Encoded<typeof OrganizationRoleCreateSuccess>;
}

const OrganizationRoleIdentifierFields = {
  organizationId: S.optional(SharedEntityIds.OrganizationId),
  roleId: S.optional(IamEntityIds.OrganizationRoleId),
  roleName: S.optional(S.String),
} as const;

export class OrganizationRoleDeletePayload extends S.Class<OrganizationRoleDeletePayload>(
  "OrganizationRoleDeletePayload"
)(S.Struct(OrganizationRoleIdentifierFields), {
  schemaId: Symbol.for("@beep/iam-client/clients/organization/OrganizationRoleDeletePayload"),
  identifier: "OrganizationRoleDeletePayload",
  title: "Organization Role Delete Payload",
  description: "Payload identifying the role to delete from an organization.",
}) {}

export declare namespace OrganizationRoleDeletePayload {
  export type Type = S.Schema.Type<typeof OrganizationRoleDeletePayload>;
  export type Encoded = S.Schema.Encoded<typeof OrganizationRoleDeletePayload>;
}

export class OrganizationRoleDeleteSuccess extends S.Class<OrganizationRoleDeleteSuccess>(
  "OrganizationRoleDeleteSuccess"
)(S.Struct({ success: S.Boolean }), {
  schemaId: Symbol.for("@beep/iam-client/clients/organization/OrganizationRoleDeleteSuccess"),
  identifier: "OrganizationRoleDeleteSuccess",
  title: "Organization Role Delete Success",
  description: "Response indicating whether the role deletion succeeded.",
}) {}

export declare namespace OrganizationRoleDeleteSuccess {
  export type Type = S.Schema.Type<typeof OrganizationRoleDeleteSuccess>;
  export type Encoded = S.Schema.Encoded<typeof OrganizationRoleDeleteSuccess>;
}

const OrganizationRoleListPayloadFields = {
  organizationId: S.optional(SharedEntityIds.OrganizationId),
} as const;

export class OrganizationRoleListPayload extends S.Class<OrganizationRoleListPayload>("OrganizationRoleListPayload")(
  S.Struct(OrganizationRoleListPayloadFields),
  {
    schemaId: Symbol.for("@beep/iam-client/clients/organization/OrganizationRoleListPayload"),
    identifier: "OrganizationRoleListPayload",
    title: "Organization Role List Payload",
    description: "Query parameters for listing organization roles.",
  }
) {}

export declare namespace OrganizationRoleListPayload {
  export type Type = S.Schema.Type<typeof OrganizationRoleListPayload>;
  export type Encoded = S.Schema.Encoded<typeof OrganizationRoleListPayload>;
}

export const OrganizationCreateContract = Contract.make("OrganizationCreate", {
  description: "Creates a new organization.",
  payload: OrganizationCreatePayload.fields,
  failure: IamError,
  success: OrganizationCreateSuccess,
})
  .annotate(Contract.Title, "Organization Create Contract")
  .annotate(Contract.Domain, "Organizations")
  .annotate(Contract.Method, "create");

export const OrganizationCheckSlugContract = Contract.make("OrganizationCheckSlug", {
  description: "Checks whether an organization slug is available.",
  payload: OrganizationCheckSlugPayload.fields,
  failure: IamError,
  success: OrganizationCheckSlugSuccess,
})
  .annotate(Contract.Title, "Organization Check Slug Contract")
  .annotate(Contract.Domain, "Organizations")
  .annotate(Contract.Method, "checkSlug");

export const OrganizationListContract = Contract.make("OrganizationList", {
  description: "Lists organizations the current user belongs to.",
  payload: {},
  failure: IamError,
  success: S.Array(OrganizationView),
})
  .annotate(Contract.Title, "Organization List Contract")
  .annotate(Contract.Domain, "Organizations")
  .annotate(Contract.Method, "list");

export const OrganizationSetActiveContract = Contract.make("OrganizationSetActive", {
  description: "Sets or unsets the active organization for the current session.",
  payload: OrganizationSetActivePayload.fields,
  failure: IamError,
  success: S.NullOr(OrganizationView),
})
  .annotate(Contract.Title, "Organization Set Active Contract")
  .annotate(Contract.Domain, "Organizations")
  .annotate(Contract.Method, "setActive");

export const OrganizationGetFullContract = Contract.make("OrganizationGetFull", {
  description: "Retrieves a fully populated organization including members and invitations.",
  payload: OrganizationGetFullPayload.fields,
  failure: IamError,
  success: S.NullOr(OrganizationFullView),
})
  .annotate(Contract.Title, "Organization Get Full Contract")
  .annotate(Contract.Domain, "Organizations")
  .annotate(Contract.Method, "getFull");

export const OrganizationUpdateContract = Contract.make("OrganizationUpdate", {
  description: "Updates mutable organization attributes.",
  payload: OrganizationUpdatePayload.fields,
  failure: IamError,
  success: OrganizationView,
})
  .annotate(Contract.Title, "Organization Update Contract")
  .annotate(Contract.Domain, "Organizations")
  .annotate(Contract.Method, "update");

export const OrganizationDeleteContract = Contract.make("OrganizationDelete", {
  description: "Deletes an organization by identifier.",
  payload: OrganizationDeletePayload.fields,
  failure: IamError,
  success: OrganizationView,
})
  .annotate(Contract.Title, "Organization Delete Contract")
  .annotate(Contract.Domain, "Organizations")
  .annotate(Contract.Method, "delete");

export const AcceptInvitationContract = Contract.make("AcceptInvitation", {
  description: "Accepts an organization invitation.",
  payload: AcceptInvitationPayload.fields,
  failure: IamError,
  success: AcceptInvitationSuccess,
})
  .annotate(Contract.Title, "Accept Invitation Contract")
  .annotate(Contract.Domain, "Organizations")
  .annotate(Contract.Method, "acceptInvitation");

export const OrganizationInviteMemberContract = Contract.make("OrganizationInviteMember", {
  description: "Invites a user to join an organization.",
  payload: OrganizationInviteMemberPayload.fields,
  failure: IamError,
  success: OrganizationInvitationView,
})
  .annotate(Contract.Title, "Organization Invite Member Contract")
  .annotate(Contract.Domain, "Organizations")
  .annotate(Contract.Method, "inviteMember");

export const OrganizationCancelInvitationContract = Contract.make("OrganizationCancelInvitation", {
  description: "Cancels a pending invitation before it is accepted.",
  payload: OrganizationCancelInvitationPayload.fields,
  failure: IamError,
  success: S.NullOr(OrganizationInvitationView),
})
  .annotate(Contract.Title, "Organization Cancel Invitation Contract")
  .annotate(Contract.Domain, "Organizations")
  .annotate(Contract.Method, "cancelInvitation");

export const OrganizationRejectInvitationContract = Contract.make("OrganizationRejectInvitation", {
  description: "Rejects an organization invitation as the invitee.",
  payload: OrganizationRejectInvitationPayload.fields,
  failure: IamError,
  success: OrganizationRejectInvitationSuccess,
})
  .annotate(Contract.Title, "Organization Reject Invitation Contract")
  .annotate(Contract.Domain, "Organizations")
  .annotate(Contract.Method, "rejectInvitation");

export const OrganizationListInvitationsContract = Contract.make("OrganizationListInvitations", {
  description: "Lists pending invitations for an organization.",
  payload: OrganizationListInvitationsPayload.fields,
  failure: IamError,
  success: S.Array(OrganizationInvitationView),
})
  .annotate(Contract.Title, "Organization List Invitations Contract")
  .annotate(Contract.Domain, "Organizations")
  .annotate(Contract.Method, "listInvitations");

export const OrganizationListUserInvitationsContract = Contract.make("OrganizationListUserInvitations", {
  description: "Lists invitations addressed to the current or specified user email.",
  payload: OrganizationListUserInvitationsPayload.fields,
  failure: IamError,
  success: S.Array(OrganizationInvitationView),
})
  .annotate(Contract.Title, "Organization List User Invitations Contract")
  .annotate(Contract.Domain, "Organizations")
  .annotate(Contract.Method, "listUserInvitations");

export const OrganizationGetInvitationContract = Contract.make("OrganizationGetInvitation", {
  description: "Retrieves an invitation with enriched organization context.",
  payload: OrganizationGetInvitationPayload.fields,
  failure: IamError,
  success: OrganizationInvitationDetailView,
})
  .annotate(Contract.Title, "Organization Get Invitation Contract")
  .annotate(Contract.Domain, "Organizations")
  .annotate(Contract.Method, "getInvitation");

export const OrganizationListMembersContract = Contract.make("OrganizationListMembers", {
  description: "Lists organization members with pagination and sorting.",
  payload: OrganizationListMembersPayload.fields,
  failure: IamError,
  success: OrganizationListMembersSuccess,
})
  .annotate(Contract.Title, "Organization List Members Contract")
  .annotate(Contract.Domain, "Organizations")
  .annotate(Contract.Method, "listMembers");

export const OrganizationRemoveMemberContract = Contract.make("OrganizationRemoveMember", {
  description: "Removes a member by identifier or email.",
  payload: OrganizationRemoveMemberPayload.fields,
  failure: IamError,
  success: OrganizationRemoveMemberSuccess,
})
  .annotate(Contract.Title, "Organization Remove Member Contract")
  .annotate(Contract.Domain, "Organizations")
  .annotate(Contract.Method, "removeMember");

export const OrganizationUpdateMemberRoleContract = Contract.make("OrganizationUpdateMemberRole", {
  description: "Updates the role assignments for a member.",
  payload: OrganizationUpdateMemberRolePayload.fields,
  failure: IamError,
  success: OrganizationUpdateMemberRoleSuccess,
})
  .annotate(Contract.Title, "Organization Update Member Role Contract")
  .annotate(Contract.Domain, "Organizations")
  .annotate(Contract.Method, "updateMemberRole");

export const OrganizationGetActiveMemberContract = Contract.make("OrganizationGetActiveMember", {
  description: "Retrieves the member record tied to the active organization.",
  payload: {},
  failure: IamError,
  success: OrganizationMemberView,
})
  .annotate(Contract.Title, "Organization Get Active Member Contract")
  .annotate(Contract.Domain, "Organizations")
  .annotate(Contract.Method, "getActiveMember");

export const OrganizationGetActiveMemberRoleContract = Contract.make("OrganizationGetActiveMemberRole", {
  description: "Retrieves the role string for the active member.",
  payload: OrganizationGetActiveMemberRolePayload.fields,
  failure: IamError,
  success: OrganizationGetActiveMemberRoleSuccess,
})
  .annotate(Contract.Title, "Organization Get Active Member Role Contract")
  .annotate(Contract.Domain, "Organizations")
  .annotate(Contract.Method, "getActiveMemberRole");

export const OrganizationLeaveContract = Contract.make("OrganizationLeave", {
  description: "Removes the current user from the specified organization.",
  payload: OrganizationLeavePayload.fields,
  failure: IamError,
  success: OrganizationMemberView,
})
  .annotate(Contract.Title, "Organization Leave Contract")
  .annotate(Contract.Domain, "Organizations")
  .annotate(Contract.Method, "leave");

export const OrganizationCreateRoleContract = Contract.make("OrganizationCreateRole", {
  description: "Creates a dynamic access-control role for an organization.",
  payload: OrganizationRoleCreatePayload.fields,
  failure: IamError,
  success: OrganizationRoleCreateSuccess,
})
  .annotate(Contract.Title, "Organization Create Role Contract")
  .annotate(Contract.Domain, "Organizations")
  .annotate(Contract.Method, "createRole");

export const OrganizationDeleteRoleContract = Contract.make("OrganizationDeleteRole", {
  description: "Deletes a dynamic access-control role from an organization.",
  payload: OrganizationRoleDeletePayload.fields,
  failure: IamError,
  success: OrganizationRoleDeleteSuccess,
})
  .annotate(Contract.Title, "Organization Delete Role Contract")
  .annotate(Contract.Domain, "Organizations")
  .annotate(Contract.Method, "deleteRole");

export const OrganizationListRolesContract = Contract.make("OrganizationListRoles", {
  description: "Lists all dynamic access-control roles for the active organization.",
  payload: OrganizationRoleListPayload.fields,
  failure: IamError,
  success: S.Array(OrganizationRoleView),
})
  .annotate(Contract.Title, "Organization List Roles Contract")
  .annotate(Contract.Domain, "Organizations")
  .annotate(Contract.Method, "listRoles");

export const OrganizationContractKit = ContractKit.make(
  OrganizationCreateContract,
  OrganizationCheckSlugContract,
  OrganizationListContract,
  OrganizationSetActiveContract,
  OrganizationGetFullContract,
  OrganizationUpdateContract,
  OrganizationDeleteContract,
  AcceptInvitationContract,
  OrganizationInviteMemberContract,
  OrganizationCancelInvitationContract,
  OrganizationRejectInvitationContract,
  OrganizationListInvitationsContract,
  OrganizationListUserInvitationsContract,
  OrganizationGetInvitationContract,
  OrganizationListMembersContract,
  OrganizationRemoveMemberContract,
  OrganizationUpdateMemberRoleContract,
  OrganizationGetActiveMemberContract,
  OrganizationGetActiveMemberRoleContract,
  OrganizationLeaveContract,
  OrganizationCreateRoleContract,
  OrganizationDeleteRoleContract,
  OrganizationListRolesContract
);
