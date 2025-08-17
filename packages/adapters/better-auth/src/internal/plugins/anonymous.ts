import type { BetterAuthPlugin } from "better-auth";
import { anonymous } from "better-auth/plugins";
import type { AnonymousOptions } from "better-auth/plugins/anonymous";

export type { AnonymousOptions };

export const makeAnonymousPlugin = (opts: AnonymousOptions) =>
  anonymous({
    /**
     * Configure the domain name of the temporary email
     * address for anonymous users in the database.
     * @default "baseURL"
     */
    emailDomainName: opts.emailDomainName,
    /**
     * A useful hook to run after an anonymous user
     * is about to link their account.
     */
    onLinkAccount: opts.onLinkAccount,
    /**
     * Disable deleting the anonymous user after linking
     */
    disableDeleteAnonymousUser: opts.disableDeleteAnonymousUser,
    /**
     * A hook to generate a name for the anonymous user.
     * Useful if you want to have random names for anonymous users, or if `name` is unique in your database.
     * @returns The name for the anonymous user.
     */
    generateName: opts.generateName,
    /**
     * Custom schema for the anonymous plugin
     */
    schema: opts.schema,
  } satisfies AnonymousOptions) satisfies BetterAuthPlugin;
