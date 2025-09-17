import type { AuthContext, AuthPluginSchema, InferOptionSchema, Session, User } from "better-auth";
import type { UserWithAnonymous } from "better-auth/plugins/anonymous";
import type { EndpointContext } from "better-call";

const schema = {
  user: {
    fields: {
      isAnonymous: {
        type: "boolean",
        required: false,
      },
    },
  },
} satisfies AuthPluginSchema;

export interface AnonymousOptions {
  /**
   * Configure the domain name of the temporary email
   * address for anonymous users in the database.
   * @default "baseURL"
   */
  emailDomainName?: string;
  /**
   * A useful hook to run after an anonymous user
   * is about to link their account.
   */
  onLinkAccount?: (data: {
    anonymousUser: {
      user: UserWithAnonymous & Record<string, any>;
      session: Session & Record<string, any>;
    };
    newUser: {
      user: User & Record<string, any>;
      session: Session & Record<string, any>;
    };
  }) => Promise<void> | void;
  /**
   * Disable deleting the anonymous user after linking
   */
  disableDeleteAnonymousUser?: boolean;
  /**
   * A hook to generate a name for the anonymous user.
   * Useful if you want to have random names for anonymous users, or if `name` is unique in your database.
   * @returns The name for the anonymous user.
   */
  generateName?: (
    ctx: EndpointContext<
      "/sign-in/anonymous",
      {
        method: "POST";
      },
      AuthContext
    >
  ) => Promise<string> | string;
  /**
   * Custom schema for the anonymous plugin
   */
  schema?: InferOptionSchema<typeof schema>;
}
