import type {BetterAuthPlugin} from "better-auth";
import {organization} from "better-auth/plugins";
import type {OrganizationOptions} from "better-auth/plugins/organization";


export const makeOrganizationPlugin = (
  opts: OrganizationOptions,
) => organization({
  allowUserToCreateOrganization: opts.allowUserToCreateOrganization ?? false,
  organizationLimit: opts.organizationLimit ?? 1,
  creatorRole: opts.creatorRole ?? "admin",
  membershipLimit: opts.membershipLimit ?? 1,
  ac: opts.ac,
  roles: opts.roles,
  teams: {
    enabled: opts.teams?.enabled ?? false,
    defaultTeam: {
      enabled: opts.teams?.defaultTeam?.enabled ?? false,
      customCreateDefaultTeam: opts.teams?.defaultTeam?.customCreateDefaultTeam
    },
    maximumTeams: opts.teams?.maximumTeams,
    maximumMembersPerTeam: opts.teams?.maximumMembersPerTeam,
    allowRemovingAllTeams: opts.teams?.allowRemovingAllTeams
  },
  invitationExpiresIn: opts.invitationExpiresIn,
  invitationLimit: opts.invitationLimit,
  cancelPendingInvitationsOnReInvite: opts.cancelPendingInvitationsOnReInvite,
  requireEmailVerificationOnInvitation: opts.requireEmailVerificationOnInvitation,
  sendInvitationEmail: opts.sendInvitationEmail,
  schema: opts.schema,
  organizationDeletion: {
    disabled: opts.organizationDeletion?.disabled ?? true,
    beforeDelete: opts.organizationDeletion?.beforeDelete,
    afterDelete: opts.organizationDeletion?.afterDelete
  },
  organizationCreation: {
    disabled: opts.organizationCreation?.disabled,
    beforeCreate: opts.organizationCreation?.beforeCreate,
    afterCreate: opts.organizationCreation?.afterCreate
  },
  autoCreateOrganizationOnSignUp: opts.autoCreateOrganizationOnSignUp
} satisfies OrganizationOptions) satisfies BetterAuthPlugin;