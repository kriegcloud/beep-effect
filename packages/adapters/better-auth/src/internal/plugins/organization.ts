import type { BetterAuthPlugin } from "better-auth";
import { organization } from "better-auth/plugins";
import type { OrganizationOptions } from "better-auth/plugins/organization";

export type { OrganizationOptions };
/**
 * TODO factor out
 * @param opts
 */
export const makeOrganizationPlugin = (opts: OrganizationOptions) =>
  organization({
    /**
     * Configure whether new users are able to create new organizations.
     * You can also pass a function that returns a boolean.
     *
     *  @example
     * ```ts
     * allowUserToCreateOrganization: async (user) => {
     *    const plan = await getUserPlan(user);
     *      return plan.name === "pro";
     * }
     * ```
     * @default true
     */
    allowUserToCreateOrganization: opts.allowUserToCreateOrganization ?? false,
    /**
     * The maximum number of organizations a user can create.
     *
     * You can also pass a function that returns a boolean
     */
    organizationLimit: opts.organizationLimit ?? 1,
    /**
     * The role that is assigned to the creator of the
     * organization.
     *
     * @default "owner"
     */
    creatorRole: opts.creatorRole ?? "admin",
    /**
     * The maximum number of members allowed in an organization.
     *
     * @default 100
     */
    membershipLimit: opts.membershipLimit ?? 1,
    /**
     * Configure the roles and permissions for the
     * organization plugin.
     */
    ac: opts.ac,
    /**
     * Custom permissions for roles.
     */
    roles: opts.roles,
    /**
     * Support for team.
     */
    teams: {
      /**
       * Enable team features.
       */
      enabled: opts.teams?.enabled ?? false,
      /**
       * Default team configuration
       */
      defaultTeam: {
        /**
         * Enable creating a default team when an organization is created
         *
         * @default true
         */
        enabled: opts.teams?.defaultTeam?.enabled ?? false,
        /**
         * Pass a custom default team creator function
         */
        customCreateDefaultTeam: opts.teams?.defaultTeam?.customCreateDefaultTeam,
      },
      /**
       * Maximum number of teams an organization can have.
       *
       * You can pass a number or a function that returns a number
       *
       * @default "unlimited"
       *
       * @param organization
       * @param request
       * @returns
       */
      maximumTeams: opts.teams?.maximumTeams,
      /**
       * The maximum number of members per team.
       *
       * if `undefined`, there is no limit.
       *
       * @default undefined
       */
      maximumMembersPerTeam: opts.teams?.maximumMembersPerTeam,
      /**
       * By default, if an organization does only have one team, they'll not be able to remove it.
       *
       * You can disable this behavior by setting this to `false.
       *
       * @default false
       */
      allowRemovingAllTeams: opts.teams?.allowRemovingAllTeams,
    },
    /**
     * The expiration time for the invitation link.
     *
     * @default 48 hours
     */
    invitationExpiresIn: opts.invitationExpiresIn,
    /**
     * The maximum invitation a user can send.
     *
     * @default 100
     */
    invitationLimit: opts.invitationLimit,
    /**
     * Cancel pending invitations on re-invite.
     *
     * @default false
     */
    cancelPendingInvitationsOnReInvite: opts.cancelPendingInvitationsOnReInvite,
    /**
     * Require email verification on accepting or rejecting an invitation
     *
     * @default false
     */
    requireEmailVerificationOnInvitation: opts.requireEmailVerificationOnInvitation,
    /**
     * Send an email with the
     * invitation link to the user.
     *
     * Note: Better Auth doesn't
     * generate invitation URLs.
     * You'll need to construct the
     * URL using the invitation ID
     * and pass it to the
     * acceptInvitation endpoint for
     * the user to accept the
     * invitation.
     *
     * @example
     * ```ts
     * sendInvitationEmail: async (data) => {
     *  const url = `https://yourapp.com/organization/
     * accept-invitation?id=${data.id}`;
     *  await sendEmail(data.email, "Invitation to join
     * organization", `Click the link to join the
     * organization: ${url}`);
     * }
     * ```
     */
    sendInvitationEmail: opts.sendInvitationEmail,
    /**
     * The schema for the organization plugin.
     */
    schema: opts.schema,
    /**
     * Configure how organization deletion is handled
     */
    organizationDeletion: {
      /**
       * disable deleting organization
       */
      disabled: opts.organizationDeletion?.disabled ?? true,
      /**
       * A callback that runs before the organization is
       * deleted
       *
       * @param data - organization and user object
       * @param request - the request object
       * @returns
       */
      beforeDelete: opts.organizationDeletion?.beforeDelete,
      /**
       * A callback that runs after the organization is
       * deleted
       *
       * @param data - organization and user object
       * @param request - the request object
       * @returns
       */
      afterDelete: opts.organizationDeletion?.afterDelete,
    },

    organizationCreation: {
      disabled: opts.organizationCreation?.disabled,
      beforeCreate: opts.organizationCreation?.beforeCreate,
      afterCreate: opts.organizationCreation?.afterCreate,
    },
    /**
     * Automatically create an organization for the user on sign up.
     *
     * @default false
     */
    autoCreateOrganizationOnSignUp: opts.autoCreateOrganizationOnSignUp,
  } satisfies OrganizationOptions) satisfies BetterAuthPlugin;
