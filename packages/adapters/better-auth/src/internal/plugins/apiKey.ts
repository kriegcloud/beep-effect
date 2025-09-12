import type { BetterAuthPlugin, GenericEndpointContext, InferOptionSchema } from "better-auth";
import { apiKey } from "better-auth/plugins";
import type { Statements } from "../../lib/better-auth.types";
import type { apiKeySchema } from "../../lib/better-auth-internal/apiKeySchema";

export interface ApiKeyOptions {
  /**
   * The header name to check for API key
   * @default "x-api-key"
   */
  apiKeyHeaders?: string | string[];
  /**
   * Disable hashing of the API key.
   *
   * ⚠️ Security Warning: It's strongly recommended to not disable hashing.
   * Storing API keys in plaintext makes them vulnerable to database breaches, potentially exposing all your users' API keys.
   *
   * @default false
   */
  disableKeyHashing?: boolean;
  /**
   * The function to get the API key from the context
   */
  customAPIKeyGetter?: (ctx: GenericEndpointContext) => string | null;
  /**
   * A custom function to validate the API key
   */
  customAPIKeyValidator?: (options: { ctx: GenericEndpointContext; key: string }) => boolean | Promise<boolean>;
  /**
   * custom key generation function
   */
  customKeyGenerator?: (options: {
    /**
     * The length of the API key to generate
     */
    length: number;
    /**
     * The prefix of the API key to generate
     */
    prefix: string | undefined;
  }) => string | Promise<string>;
  /**
   * The configuration for storing the starting characters of the API key in the database.
   *
   * Useful if you want to display the starting characters of an API key in the UI.
   */
  startingCharactersConfig?: {
    /**
     * Whether to store the starting characters in the database. If false, we will set `start` to `null`.
     *
     * @default true
     */
    shouldStore?: boolean;
    /**
     * The length of the starting characters to store in the database.
     *
     * This includes the prefix length.
     *
     * @default 6
     */
    charactersLength?: number;
  };
  /**
   * The length of the API key. Longer is better. Default is 64. (Doesn't include the prefix length)
   * @default 64
   */
  defaultKeyLength?: number;
  /**
   * The prefix of the API key.
   *
   * Note: We recommend you append an underscore to the prefix to make the prefix more identifiable. (eg `hello_`)
   */
  defaultPrefix?: string;
  /**
   * The maximum length of the prefix.
   *
   * @default 32
   */
  maximumPrefixLength?: number;
  /**
   * Whether to require a name for the API key.
   *
   * @default false
   */
  requireName?: boolean;
  /**
   * The minimum length of the prefix.
   *
   * @default 1
   */
  minimumPrefixLength?: number;
  /**
   * The maximum length of the name.
   *
   * @default 32
   */
  maximumNameLength?: number;
  /**
   * The minimum length of the name.
   *
   * @default 1
   */
  minimumNameLength?: number;
  /**
   * Whether to enable metadata for an API key.
   *
   * @default false
   */
  enableMetadata?: boolean;
  /**
   * Customize the key expiration.
   */
  keyExpiration?: {
    /**
     * The default expires time in milliseconds.
     *
     * If `null`, then there will be no expiration time.
     *
     * @default null
     */
    defaultExpiresIn?: number | null;
    /**
     * Whether to disable the expires time passed from the client.
     *
     * If `true`, the expires time will be based on the default values.
     *
     * @default false
     */
    disableCustomExpiresTime?: boolean;
    /**
     * The minimum expiresIn value allowed to be set from the client. in days.
     *
     * @default 1
     */
    minExpiresIn?: number;
    /**
     * The maximum expiresIn value allowed to be set from the client. in days.
     *
     * @default 365
     */
    maxExpiresIn?: number;
  };
  /**
   * Default rate limiting options.
   */
  rateLimit?: {
    /**
     * Whether to enable rate limiting.
     *
     * @default true
     */
    enabled?: boolean;
    /**
     * The duration in milliseconds where each request is counted.
     *
     * Once the `maxRequests` is reached, the request will be rejected until the `timeWindow` has passed, at which point the `timeWindow` will be reset.
     *
     * @default 1000 * 60 * 60 * 24 // 1 day
     */
    timeWindow?: number;
    /**
     * Maximum amount of requests allowed within a window
     *
     * Once the `maxRequests` is reached, the request will be rejected until the `timeWindow` has passed, at which point the `timeWindow` will be reset.
     *
     * @default 10 // 10 requests per day
     */
    maxRequests?: number;
  };
  /**
   * custom schema for the API key plugin
   */
  schema?: InferOptionSchema<ReturnType<typeof apiKeySchema>>;
  /**
   * An API Key can represent a valid session, so we automatically mock a session for the user if we find a valid API key in the request headers.
   *
   * @default false
   */
  disableSessionForAPIKeys?: boolean;
  /**
   * Permissions for the API key.
   */
  permissions?: {
    /**
     * The default permissions for the API key.
     */
    defaultPermissions?:
      | Statements
      | ((userId: string, ctx: GenericEndpointContext) => Statements | Promise<Statements>);
  };
}

export const makeApiKeyPlugin = (opts: ApiKeyOptions) =>
  apiKey({
    /**
     * The header name to check for API key
     * @default "x-api-key"
     */
    apiKeyHeaders: opts.apiKeyHeaders,
    /**
     * Disable hashing of the API key.
     *
     * ⚠️ Security Warning: It's strongly recommended to not disable hashing.
     * Storing API keys in plaintext makes them vulnerable to database breaches, potentially exposing all your users' API keys.
     *
     * @default false
     */
    disableKeyHashing: opts.disableKeyHashing,
    /**
     * The function to get the API key from the context
     */
    customAPIKeyGetter: opts.customAPIKeyGetter,
    /**
     * A custom function to validate the API key
     */
    customAPIKeyValidator: opts.customAPIKeyValidator,
    /**
     * custom key generation function
     */
    customKeyGenerator: opts.customKeyGenerator,
    /**
     * The configuration for storing the starting characters of the API key in the database.
     *
     * Useful if you want to display the starting characters of an API key in the UI.
     */
    startingCharactersConfig: {
      /**
       * Whether to store the starting characters in the database. If false, we will set `start` to `null`.
       *
       * @default true
       */
      shouldStore: opts.startingCharactersConfig?.shouldStore,
      /**
       * The length of the starting characters to store in the database.
       *
       * This includes the prefix length.
       *
       * @default 6
       */
      charactersLength: opts.startingCharactersConfig?.charactersLength,
    },
    /**
     * The length of the API key. Longer is better. Default is 64. (Doesn't include the prefix length)
     * @default 64
     */
    defaultKeyLength: opts.defaultKeyLength,
    /**
     * The prefix of the API key.
     *
     * Note: We recommend you append an underscore to the prefix to make the prefix more identifiable. (eg `hello_`)
     */
    defaultPrefix: opts.defaultPrefix,
    /**
     * The maximum length of the prefix.
     *
     * @default 32
     */
    maximumPrefixLength: opts.maximumPrefixLength,
    /**
     * Whether to require a name for the API key.
     *
     * @default false
     */
    requireName: opts.requireName,
    /**
     * The minimum length of the prefix.
     *
     * @default 1
     */
    minimumPrefixLength: opts.minimumPrefixLength,
    /**
     * The maximum length of the name.
     *
     * @default 32
     */
    maximumNameLength: opts.maximumNameLength,
    /**
     * The minimum length of the name.
     *
     * @default 1
     */
    minimumNameLength: opts.minimumNameLength,
    /**
     * Whether to enable metadata for an API key.
     *
     * @default false
     */
    enableMetadata: opts.enableMetadata,
    /**
     * Customize the key expiration.
     */
    keyExpiration: {
      /**
       * The default expires time in milliseconds.
       *
       * If `null`, then there will be no expiration time.
       *
       * @default null
       */
      defaultExpiresIn: opts.keyExpiration?.defaultExpiresIn,
      /**
       * Whether to disable the expires time passed from the client.
       *
       * If `true`, the expires time will be based on the default values.
       *
       * @default false
       */
      disableCustomExpiresTime: opts.keyExpiration?.disableCustomExpiresTime,
      /**
       * The minimum expiresIn value allowed to be set from the client. in days.
       *
       * @default 1
       */
      minExpiresIn: opts.keyExpiration?.minExpiresIn,
      /**
       * The maximum expiresIn value allowed to be set from the client. in days.
       *
       * @default 365
       */
      maxExpiresIn: opts.keyExpiration?.maxExpiresIn,
    },
    /**
     * Default rate limiting options.
     */
    rateLimit: {
      /**
       * Whether to enable rate limiting.
       *
       * @default true
       */
      enabled: opts.rateLimit?.enabled,
      /**
       * The duration in milliseconds where each request is counted.
       *
       * Once the `maxRequests` is reached, the request will be rejected until the `timeWindow` has passed, at which point the `timeWindow` will be reset.
       *
       * @default 1000 * 60 * 60 * 24 // 1 day
       */
      timeWindow: opts.rateLimit?.timeWindow,
      /**
       * Maximum amount of requests allowed within a window
       *
       * Once the `maxRequests` is reached, the request will be rejected until the `timeWindow` has passed, at which point the `timeWindow` will be reset.
       *
       * @default 10 // 10 requests per day
       */
      maxRequests: opts.rateLimit?.maxRequests,
    },
    /**
     * custom schema for the API key plugin
     */
    schema: opts.schema,
    /**
     * An API Key can represent a valid session, so we automatically mock a session for the user if we find a valid API key in the request headers.
     *
     * @default false
     */
    disableSessionForAPIKeys: opts.disableSessionForAPIKeys,
    /**
     * Permissions for the API key.
     */
    permissions: {
      defaultPermissions: opts.permissions?.defaultPermissions,
    },
  } satisfies ApiKeyOptions) satisfies BetterAuthPlugin;
