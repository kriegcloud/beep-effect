import type { AuthProviderNameValue } from "@beep/constants";
import type { IamDb } from "@beep/iam-infra/db/Db";
import type { SharedEntityIds } from "@beep/shared-domain";
import type { SqlError } from "@effect/sql/SqlError";
import type { BetterAuthOptions, betterAuth } from "better-auth";
import type { ConfigError } from "effect/ConfigError";
import type * as Effect from "effect/Effect";
import type { AuthEmailService } from "./AuthEmail.service";
import type { CommonExtraFields } from "./common";
import type { Plugins } from "./plugins/plugins";

export type Opts = Omit<BetterAuthOptions, "account" | "session" | "plugins" | "user"> & {
  readonly account: {
    readonly additionalFields: CommonExtraFields;
    readonly accountLinking: {
      readonly enabled: boolean;
      readonly allowDifferentEmails: boolean;
      readonly trustedProviders: AuthProviderNameValue.Type[];
    };
    readonly encryptOAuthTokens: boolean;
    readonly storeAccountCookie: boolean;
  };
  readonly session: {
    readonly modelName: typeof SharedEntityIds.SessionId.tableName;
    readonly additionalFields: CommonExtraFields & {
      readonly activeTeamId: {
        readonly type: "string";
        readonly required: false;
      };
      readonly activeOrganizationId: {
        readonly type: "string";
        readonly required: false;
      };
    };
    readonly cookieCache: {
      readonly enabled: true;
      readonly maxAge: number;
    };
    readonly expiresIn: number;
    readonly updateAge: number;
  };
  plugins: Plugins;
  user: {
    changeEmail: {
      enabled: true;
      sendChangeEmailVerification: (params: { newEmail: string; url: string }) => Promise<void>;
    };
    modelName: typeof SharedEntityIds.UserId.tableName;
    additionalFields: CommonExtraFields & {
      uploadLimit: {
        type: "number";
        required: false;
      };
      stripeCustomerId: {
        type: "string";
        required: false;
      };
      role: {
        type: "string";
        required: false;
      };
      isAnonymous: {
        type: "boolean";
        required: false;
      };
      twoFactorEnabled: {
        type: "boolean";
        required: false;
      };
      phoneNumberVerified: {
        type: "boolean";
        required: false;
      };
      banned: {
        type: "boolean";
        required: false;
      };
      banExpires: {
        type: "date";
        required: false;
      };
      lastLoginMethod: {
        type: "string";
        required: false;
      };
    };
  };
};

export type Auth = ReturnType<typeof betterAuth<Opts>>;
export type $Infer = Auth["$Infer"];
export type Session = $Infer["Session"];
export type User = $Infer["User"];
export type $ErrorCodes = Auth["$ERROR_CODES"];
export type Organization = $Infer["Organization"];
export type AuthPromiseApi = Auth["api"];
export type Account = $Infer["Account"];

export type AuthOptionsEffect = Effect.Effect<Opts, never, IamDb.IamDb | AuthEmailService>;
export type AuthServiceEffect = Effect.Effect<
  {
    readonly auth: Auth;
  },
  SqlError | ConfigError,
  AuthEmailService | IamDb.IamDb
>;
