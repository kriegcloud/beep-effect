import type { AuthClient } from "@beep/iam-sdk/adapters/better-auth/types";
import type { SocialProvider } from "better-auth/social-providers";

export type SocialOptions = {
  /**
   * Array of Social Providers to enable
   * @remarks `SocialProvider[]`
   */
  readonly providers: ReadonlyArray<SocialProvider>;
  /**
   * Custom social sign in function
   */
  readonly signIn?: ((params: Parameters<AuthClient["signIn"]["social"]>[0]) => Promise<unknown>) | undefined;
};
