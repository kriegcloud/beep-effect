import { IamDb } from "@beep/iam-infra/db";
import { IamDbSchema } from "@beep/iam-tables";
import { IamEntityIds } from "@beep/shared-domain";
import { Organization } from "@beep/shared-domain/entities";
import type { SqlError } from "@effect/sql/SqlError";
import type { OrganizationOptions } from "better-auth/plugins/organization";
import { organization } from "better-auth/plugins/organization";
import * as d from "drizzle-orm";
import type { ConfigError } from "effect/ConfigError";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as Runtime from "effect/Runtime";
import * as S from "effect/Schema";
import { AuthEmailService, InvitationEmailPayload } from "../../AuthEmail.service";
import { commonExtraFields } from "../../internal";

const organizationSchema = {
  additionalFields: {
    type: {
      type: "string",
      required: true,
      defaultValue: Organization.OrganizationTypeEnum.individual,
    },
    ownerUserId: {
      type: "string",
      required: false,
    },
    isPersonal: {
      type: "boolean",
      required: true,
    },
    maxMembers: {
      type: "number",
      required: false,
    },
    features: {
      type: "json", // jsonb in DB
      required: false,
    },
    settings: {
      type: "json", // jsonb in DB
      required: false,
    },
    subscriptionTier: {
      type: "string",
      required: false,
      defaultValue: Organization.SubscriptionTierEnum.free,
    },
    subscriptionStatus: {
      type: "string",
      required: false,
      defaultValue: Organization.SubscriptionStatusEnum.active,
    },
    ...commonExtraFields,
  },
} as const;
type OrganizationSchema = typeof organizationSchema;
const memberSchema = {
  additionalFields: {
    // Enhanced member tracking fields (see iam/tables/src/tables/member.table.ts)
    status: { type: "string", required: true, defaultValue: "active" },
    invitedBy: { type: "string", required: false },
    invitedAt: { type: "date", required: false },
    joinedAt: { type: "date", required: false },
    lastActiveAt: { type: "date", required: false },
    permissions: { type: "string", required: false }, // JSON string
    ...commonExtraFields,
  },
} as const;
type MemberSchema = typeof memberSchema;
const invitationSchema = {
  additionalFields: {
    ...commonExtraFields,
  },
} as const;
type InvitationSchema = typeof invitationSchema;

const teamSchema = {
  additionalFields: {
    // Align with shared team table (see shared/tables/src/tables/team.table.ts)
    description: { type: "string", required: false },
    metadata: { type: "string", required: false },
    logo: { type: "string", required: false },
    ...commonExtraFields,
  },
} as const;
type TeamSchema = typeof teamSchema;

const organizationRoleSchema = {
  additionalFields: {
    ...commonExtraFields,
  },
} as const;
type OrganizationRoleSchema = typeof organizationRoleSchema;
type OrgOpts = Omit<OrganizationOptions, "teams" | "schema" | "dynamicAccessControl"> & {
  schema: Omit<
    OrganizationOptions["schema"],
    "organization" | "member" | "invitation" | "team" | "organizationRole"
  > & {
    organization: OrganizationSchema;
    member: MemberSchema;
    invitation: InvitationSchema;
    team: TeamSchema;
    organizationRole: OrganizationRoleSchema;
  };
  teams: {
    enabled: true;
    maximumTeams: number;
    allowRemovingAllTeams: boolean;
  };
  dynamicAccessControl: {
    enabled: true;
  };
};

export const organizationPluginOptions = Effect.gen(function* () {
  const { execute } = yield* IamDb.IamDb;
  const { sendInvitation } = yield* AuthEmailService;
  const runtime = yield* Effect.runtime();
  const runPromise = Runtime.runPromise(runtime);
  const orgOpts: OrgOpts = {
    allowUserToCreateOrganization: true,
    organizationLimit: 1,
    creatorRole: "owner",
    membershipLimit: 2,
    sendInvitationEmail: async (params) =>
      void (await Effect.flatMap(
        S.decode(InvitationEmailPayload)({
          email: params.email,
          invitedByUsername: params.inviter.user.name,
          invitedByEmail: params.inviter.user.email,
          teamName: params.organization.name,
        }),
        sendInvitation
      ).pipe(runPromise)),
    teams: {
      enabled: true,
      maximumTeams: 10,
      allowRemovingAllTeams: false,
    },
    cancelPendingInvitationsOnReInvite: true,
    requireEmailVerificationOnInvitation: true,
    schema: {
      organization: {
        additionalFields: {
          type: {
            type: "string",
            required: true,
            defaultValue: Organization.OrganizationTypeEnum.individual,
          },
          ownerUserId: {
            type: "string",
            required: false,
          },
          isPersonal: {
            type: "boolean",
            required: true,
          },
          maxMembers: {
            type: "number",
            required: false,
          },
          features: {
            type: "json", // jsonb in DB
            required: false,
          },
          settings: {
            type: "json", // jsonb in DB
            required: false,
          },
          subscriptionTier: {
            type: "string",
            required: false,
            defaultValue: Organization.SubscriptionTierEnum.free,
          },
          subscriptionStatus: {
            type: "string",
            required: false,
            defaultValue: Organization.SubscriptionStatusEnum.active,
          },
          ...commonExtraFields,
        },
      },
      member: {
        additionalFields: {
          // Enhanced member tracking fields (see iam/tables/src/tables/member.table.ts)
          status: { type: "string", required: true, defaultValue: "active" },
          invitedBy: { type: "string", required: false },
          invitedAt: { type: "date", required: false },
          joinedAt: { type: "date", required: false },
          lastActiveAt: { type: "date", required: false },
          permissions: { type: "string", required: false }, // JSON string
          ...commonExtraFields,
        },
      },
      invitation: {
        additionalFields: {
          ...commonExtraFields,
        },
      },
      team: {
        additionalFields: {
          // Align with shared team table (see shared/tables/src/tables/team.table.ts)
          description: { type: "string", required: false },
          metadata: { type: "string", required: false },
          logo: { type: "string", required: false },
          ...commonExtraFields,
        },
      },
      organizationRole: {
        additionalFields: {
          ...commonExtraFields,
        },
      },
    },
    dynamicAccessControl: {
      enabled: true,
    },
    organizationHooks: {
      beforeCreateOrganization: async (params) => {
        const { organization, user } = params;
        return {
          data: {
            ...organization,
            type: Organization.OrganizationTypeEnum.team, // User-created orgs are team type
            ownerUserId: user.id,
            isPersonal: false, // User-created orgs are not personal
            subscriptionTier: Organization.SubscriptionTierEnum.free, // Default subscription
            subscriptionStatus: Organization.SubscriptionStatusEnum.active,
            source: "user_created",
          },
        };
      },
      afterCreateOrganization: async ({ organization, member, user }) => {
        // Set proper member tracking fields for the organization creator
        const program = Effect.gen(function* () {
          const nowUtc = yield* DateTime.now;
          const now = DateTime.toDate(nowUtc);
          return yield* execute((client) =>
            client
              .update(IamDbSchema.member)
              .set({
                status: Organization.SubscriptionStatusEnum.active,
                joinedAt: now,
                lastActiveAt: now,
              })
              .where(d.eq(IamDbSchema.member.id, S.decodeUnknownSync(IamEntityIds.MemberId)(member.id)))
          );
        }).pipe(
          Effect.match({
            onSuccess: () => console.log(`Team organization ${organization.name} created for user ${user.id}`),
            onFailure: (e) =>
              console.error(`Failed to create team organization ${organization.name} for user ${user.id}: ${e}`),
          })
        );
        await runPromise(program);
      },
    },
  };
  return orgOpts;
});

type Context = Effect.Effect.Context<typeof organizationPluginOptions>;

export type OrganizationPluginEffect = Effect.Effect<
  ReturnType<typeof organization<OrgOpts>>,
  SqlError | ConfigError,
  Context
>;

export type OrganizationPlugin = ReturnType<typeof organization<OrgOpts>>;

export const organizationPlugin: OrganizationPluginEffect = Effect.gen(function* () {
  const options = yield* organizationPluginOptions;
  return organization<OrgOpts>(options);
});
