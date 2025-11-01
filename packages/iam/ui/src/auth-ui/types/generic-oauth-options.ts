import type { AuthClient } from "@beep/iam-sdk/adapters/better-auth/types";
import type { Provider } from "../lib/social-providers";

export type GenericOAuthOptions = {
  /**
   * Custom OAuth Providers
   * @default []
   */
  readonly providers: ReadonlyArray<Provider>;
  /**
   * Custom generic OAuth sign in function
   */
  readonly signIn?: undefined | ((params: Parameters<AuthClient["signIn"]["oauth2"]>[0]) => Promise<unknown>);
};
