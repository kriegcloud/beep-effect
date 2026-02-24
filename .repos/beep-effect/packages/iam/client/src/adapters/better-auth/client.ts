import type { Auth } from "@beep/iam-server";
import * as Organization from "@beep/shared-domain/entities/Organization";
import { clientEnv } from "@beep/shared-env/ClientEnv";
import { asyncNoOp } from "@beep/utils";
import type { BetterAuthClientOptions } from "@better-auth/core";
import { oauthProviderClient } from "@better-auth/oauth-provider/client";
import { passkeyClient } from "@better-auth/passkey/client";
import { ssoClient } from "@better-auth/sso/client";
import { stripeClient } from "@better-auth/stripe/client";
import {
  adminClient,
  anonymousClient,
  apiKeyClient,
  deviceAuthorizationClient,
  genericOAuthClient,
  inferAdditionalFields,
  jwtClient,
  lastLoginMethodClient,
  multiSessionClient,
  oneTapClient,
  oneTimeTokenClient,
  organizationClient,
  phoneNumberClient,
  siweClient,
  twoFactorClient,
  usernameClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import * as Duration from "effect/Duration";

const additionalFieldsCommon = {
  _rowId: {
    type: "number",
    required: false,
  },
  deletedAt: {
    type: "date",
    required: false,
  },
  updatedAt: {
    type: "date",
    required: false,
  },
  createdAt: {
    type: "date",
    required: false,
  },
  createdBy: {
    type: "string",
    required: false,
  },
  updatedBy: {
    type: "string",
    required: false,
  },
  deletedBy: {
    type: "string",
    required: false,
  },
  version: {
    type: "number",
    required: false,
  },
  source: {
    type: "string",
    required: false,
  },
} as const;
export const client = createAuthClient({
  baseURL: clientEnv.authUrl,
  basePath: clientEnv.authPath,
  plugins: [
    inferAdditionalFields<Auth.Auth>({
      session: {
        ...additionalFieldsCommon,
        activeOrganizationId: {
          type: "string",
          required: false,
        },
        activeTeamId: {
          type: "string",
          required: false,
        },
        // Plugin-managed fields (admin)
        impersonatedBy: {
          type: "string",
          required: false,
        },
      },
      user: {
        // Custom fields
        uploadLimit: {
          type: "number",
          required: false,
        },
        stripeCustomerId: {
          type: "string",
          required: false,
        },
        // Plugin-managed fields (admin)
        role: {
          type: "string",
          required: false,
        },
        banned: {
          type: "boolean",
          required: false,
        },
        banReason: {
          type: "string",
          required: false,
        },
        banExpires: {
          type: "date",
          required: false,
        },
        // Plugin-managed fields (anonymous)
        isAnonymous: {
          type: "boolean",
          required: false,
        },
        // Plugin-managed fields (phoneNumber)
        phoneNumber: {
          type: "string",
          required: false,
        },
        phoneNumberVerified: {
          type: "boolean",
          required: false,
        },
        // Plugin-managed fields (twoFactor)
        twoFactorEnabled: {
          type: "boolean",
          required: false,
        },
        // Plugin-managed fields (username)
        username: {
          type: "string",
          required: false,
        },
        displayUsername: {
          type: "string",
          required: false,
        },
        // Plugin-managed fields (lastLoginMethod)
        lastLoginMethod: {
          type: "string",
          required: false,
        },
        ...additionalFieldsCommon,
      },
    }),
    adminClient(),
    anonymousClient(),
    jwtClient(),
    apiKeyClient(),
    oauthProviderClient(),
    genericOAuthClient(),
    multiSessionClient(),
    oneTapClient({
      clientId: clientEnv.googleClientId,
      promptOptions: {
        baseDelay: Duration.toMillis(Duration.seconds(1)), // Base delay in ms (default: 1000)
        maxAttempts: 5, // Maximum number of attempts before triggering onPromptNotification (default: 5)
      },
      context: "signin",
    }),
    oneTimeTokenClient(),
    organizationClient({
      schema: {
        verification: {
          additionalFields: additionalFieldsCommon,
        },
        organization: {
          additionalFields: {
            type: {
              type: "string",
              required: false,
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
            ...additionalFieldsCommon,
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
            ...additionalFieldsCommon,
          },
        },
        invitation: {
          additionalFields: {
            // Align with iam/tables/src/tables/invitation.table.ts
            teamId: { type: "string", required: false }, // Optional team-specific invitation
            ...additionalFieldsCommon,
          },
        },
        team: {
          additionalFields: {
            // Align with shared team table (see shared/tables/src/tables/team.table.ts)
            // NOTE: slug is notNull in Drizzle but marked required: false here since
            // Better Auth doesn't auto-generate it. Callers should provide it or a
            // beforeCreateTeam hook should generate it from the name.
            slug: { type: "string", required: false },
            description: { type: "string", required: false },
            metadata: { type: "string", required: false },
            logo: { type: "string", required: false },
            ...additionalFieldsCommon,
          },
        },
        organizationRole: {
          additionalFields: {
            // Align with iam/tables/src/tables/organizationRole.table.ts
            role: { type: "string", required: true }, // Role name (e.g., 'admin', 'member')
            permission: { type: "string", required: true }, // Permission string for this role
            ...additionalFieldsCommon,
          },
        },
        teamMember: {
          additionalFields: {
            ...additionalFieldsCommon,
          },
          // NOTE: Better Auth organization plugin does NOT support additionalFields for teamMember.
          // Custom columns beyond core fields (id, teamId, userId, createdAt) will work at the
          // database level but will NOT appear in Better Auth's OpenAPI documentation or be
          // validated/transformed by Better Auth. OrgTable.make defaults are still in the DB
          // but not exposed via the API.
        },
      },
      teams: {
        enabled: true,
      },
      dynamicAccessControl: {
        enabled: true,
      },
    }),
    passkeyClient(),
    phoneNumberClient(),
    siweClient(),
    ssoClient(),
    twoFactorClient(),
    usernameClient(),
    stripeClient({
      subscription: true,
    }),
    deviceAuthorizationClient(),
    lastLoginMethodClient(),
  ],
} satisfies BetterAuthClientOptions);

export const { $store, signIn, signUp } = client;
export const email = async () => {
  const response = await signIn.email({
    email: "beep@hole.com",
    password: "password",
  });
  if (response.data !== null) {
    const data = response.data;
    const { user, ...rest } = data;
    console.log(rest);
    console.log(user);
  }
  console.log(response);
};
$store.listen("$sessionSignal", asyncNoOp);
