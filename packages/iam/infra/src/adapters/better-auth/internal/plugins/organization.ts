import { DbError } from "@beep/core-db/errors";
import { IamDb } from "@beep/iam-infra/db";
import { IamDbSchema } from "@beep/iam-tables";
import { IamEntityIds } from "@beep/shared-domain";
import { Organization } from "@beep/shared-domain/entities";
import { organization } from "better-auth/plugins";
import * as d from "drizzle-orm";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { AuthEmailService, InvitationEmailPayload } from "../../AuthEmail.service";
import { commonExtraFields } from "../common";

export const OrganizationPlugin = Effect.gen(function* () {
  const { db } = yield* IamDb.IamDb;
  const { sendInvitation } = yield* AuthEmailService;
  return organization({
    allowUserToCreateOrganization: true,
    organizationLimit: 3,
    creatorRole: "owner",
    membershipLimit: 100,
    sendInvitationEmail: async (params) => {
      const program = Effect.flatMap(
        S.decode(InvitationEmailPayload)({
          email: params.email,
          invitedByUsername: params.inviter.user.name,
          invitedByEmail: params.inviter.user.email,
          teamName: params.organization.name,
        }),
        sendInvitation
      );

      await Effect.runPromise(program);
    },
    teams: {
      enabled: true,
      maximumTeams: 10,
      allowRemovingAllTeams: false,
    },
    cancelPendingInvitationsOnReInvite: true,
    requireEmailVerificationOnInvitation: true,
    schema: {
      organization: {
        id: {
          type: "number",
          name: "_rowId",
        },
        additionalFields: {
          type: {
            type: [...Organization.OrganizationTypeOptions],
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
            type: "string", // JSON string
            required: false,
          },
          settings: {
            type: "string", // JSON string
            required: false,
          },
          subscriptionTier: {
            type: [...Organization.SubscriptionTierOptions],
            required: false,
            defaultValue: Organization.SubscriptionTierEnum.free,
          },
          subscriptionStatus: {
            type: [...Organization.SubscriptionStatusOptions],
            required: false,
            defaultValue: Organization.SubscriptionStatusEnum.active,
          },
          ...commonExtraFields,
        },
      },
      member: {
        additionalFields: {
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
    organizationCreation: {
      beforeCreate: async (params) => {
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
      afterCreate: async ({ organization, member, user }) => {
        // Set proper member tracking fields for the organization creator
        const program = Effect.gen(function* () {
          const nowUtc = yield* DateTime.now;
          const now = DateTime.toDate(nowUtc);
          return yield* Effect.tryPromise({
            try: () =>
              db
                .update(IamDbSchema.memberTable)
                .set({
                  status: Organization.SubscriptionStatusEnum.active,
                  joinedAt: now,
                  lastActiveAt: now,
                })
                .where(d.eq(IamDbSchema.memberTable.id, S.decodeUnknownSync(IamEntityIds.MemberId)(member.id))),
            catch: (e) => Effect.fail(DbError.match(e)),
          });
        }).pipe(
          Effect.match({
            onSuccess: () => console.log(`Team organization ${organization.name} created for user ${user.id}`),
            onFailure: (e) =>
              console.error(`Failed to create team organization ${organization.name} for user ${user.id}: ${e}`),
          })
        );
        await Effect.runPromise(program);
      },
    },
  });
});
