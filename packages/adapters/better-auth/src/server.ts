import {makeAuth} from "./internal/auth";
import {Stripe} from "stripe";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

export const auth = makeAuth(
  {
    database: drizzleAdapter(NodePgDatabase, {
      provider: "pg",
      schema: {}
    })
  },
  // {
  //   admin: {
  //     _tag: "admin",
  //     options: {}
  //   },
  //   anonymous: {
  //     _tag: "anonymous",
  //     options: {}
  //   },
  //   apiKey: {
  //     _tag: "apiKey",
  //     options: {}
  //   },
  //   bearer: {
  //     _tag: "bearer",
  //     options: {}
  //   },
  //   captcha: {
  //     _tag: "captcha",
  //     options: {
  //       secretKey: "REPLACE_ME",
  //       provider: "google-recaptcha"
  //     }
  //   },
  //   customSession: {
  //     _tag: "customSession",
  //     options: async (session) => {
  //       // const userOrgs = await db.select({
  //       //   orgId: DbTypes.schema.organization.id,
  //       //   orgName: DbTypes.schema.organization.name,
  //       // })
  //       console.log(`custom session`, JSON.stringify(session, null, 2));
  //       return {
  //         ...session,
  //         user: {
  //           ...session.user,
  //           dd: "test",
  //         },
  //       };
  //     }
  //   },
  //   emailOTP: {
  //     _tag: "emailOTP",
  //     options: {
  //       sendVerificationOTP: async (params) => {
  //       }
  //     }
  //   },
  //   genericOAuth: {
  //     _tag: "genericOAuth",
  //     options: {
  //       config: []
  //     }
  //   },
  //   haveIBeenPwned: {
  //     _tag: "haveIBeenPwned",
  //     options: {}
  //   },
  //   jwt: {
  //     _tag: "jwt",
  //     options: {}
  //   },
  //   magicLink: {
  //     _tag: "magicLink",
  //     options: {
  //       sendMagicLink: async (params) => {
  //       }
  //     }
  //   },
  //   mcp: {
  //     _tag: "mcp",
  //     options: {
  //       loginPage: "/login"
  //     }
  //   },
  //   multiSession: {
  //     _tag: "multiSession",
  //     options: {}
  //   },
  //   nextCookies: {
  //     _tag: "nextCookies",
  //     options: {}
  //   },
  //   oAuthProxy: {
  //     _tag: "oAuthProxy",
  //     options: {}
  //   },
  //   oidcProvider: {
  //     _tag: "oidcProvider",
  //     options: {
  //       loginPage: "/login",
  //     }
  //   },
  //   oneTap: {
  //     _tag: "oneTap",
  //     options: {}
  //   },
  //   oneTimeToken: {
  //     _tag: "oneTimeToken",
  //     options: {}
  //   },
  //   openAPI: {
  //     _tag: "openAPI",
  //     options: {}
  //   },
  //   organization: {
  //     _tag: "organization",
  //     options: {
  //       teams: {
  //         enabled: true
  //       }
  //     }
  //   },
  //   passkey: {
  //     _tag: "passkey",
  //     options: {}
  //   },
  //   phoneNumber: {
  //     _tag: "phoneNumber",
  //     options: {
  //       sendOTP: async (params) => {
  //       }
  //     }
  //   },
  //   siwe: {
  //     _tag: "siwe",
  //     options: {
  //       domain: "http://localhost:3000",
  //       getNonce: async () => "Replace Me",
  //       verifyMessage: async (message) => {
  //         return true;
  //       }
  //     }
  //   },
  //   sso: {
  //     _tag: "sso",
  //     options: {}
  //   },
  //   stripe: {
  //     _tag: "stripe",
  //     options: {
  //       stripeClient: new Stripe("sk_test_"),
  //       stripeWebhookSecret: "Replace Me",
  //     }
  //   },
  //   twoFactor: {
  //     _tag: "twoFactor",
  //     options: {}
  //   },
  //   username: {
  //     _tag: "username",
  //     options: {}
  //   }
  // }
);
