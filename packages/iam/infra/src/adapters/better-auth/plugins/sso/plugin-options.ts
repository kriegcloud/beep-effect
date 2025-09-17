import type { OAuth2Tokens, User } from "better-auth";

export interface OIDCConfig {
  issuer: string;
  pkce: boolean;
  clientId: string;
  clientSecret: string;
  authorizationEndpoint?: string;
  discoveryEndpoint: string;
  userInfoEndpoint?: string;
  scopes?: string[];
  overrideUserInfo?: boolean;
  tokenEndpoint?: string;
  tokenEndpointAuthentication?: "client_secret_post" | "client_secret_basic";
  jwksEndpoint?: string;
  mapping?: {
    id?: string;
    email?: string;
    emailVerified?: string;
    name?: string;
    image?: string;
    extraFields?: Record<string, string>;
  };
}

export interface SSOProvider {
  issuer: string;
  oidcConfig: OIDCConfig;
  userId: string;
  providerId: string;
  organizationId?: string;
}
export interface SSOOptions {
  /**
   * custom function to provision a user when they sign in with an SSO provider.
   */
  provisionUser?: (data: {
    /**
     * The user object from the database
     */
    user: User & Record<string, any>;
    /**
     * The user info object from the provider
     */
    userInfo: Record<string, any>;
    /**
     * The OAuth2 tokens from the provider
     */
    token: OAuth2Tokens;
    /**
     * The SSO provider
     */
    provider: SSOProvider;
  }) => Promise<void>;
  /**
   * Organization provisioning options
   */
  organizationProvisioning?: {
    disabled?: boolean;
    defaultRole?: "member" | "admin";
    getRole?: (data: {
      /**
       * The user object from the database
       */
      user: User & Record<string, any>;
      /**
       * The user info object from the provider
       */
      userInfo: Record<string, any>;
      /**
       * The OAuth2 tokens from the provider
       */
      token: OAuth2Tokens;
      /**
       * The SSO provider
       */
      provider: SSOProvider;
    }) => Promise<"member" | "admin">;
  };
  /**
   * Disable implicit sign up for new users. When set to true for the provider,
   * sign-in need to be called with with requestSignUp as true to create new users.
   */
  disableImplicitSignUp?: boolean;
  /**
   * Override user info with the provider info.
   * @default false
   */
  defaultOverrideUserInfo?: boolean;
}
