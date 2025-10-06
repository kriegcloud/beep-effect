import type { GenericEndpointContext, User } from "better-auth";
import type { Dub } from "dub";
export interface DubConfig {
  /**
   * Dub instance
   */
  dubClient: Dub;
  /**
   * Disable dub tracking for sign up events
   *
   * @default false
   */
  disableLeadTracking?: boolean;
  /**
   * Event name for sign up leads
   *
   * @default "Sign Up"
   */
  leadEventName?: string;
  /**
   * Custom lead track function
   */
  customLeadTrack?: (user: User, ctx: GenericEndpointContext) => Promise<void>;
  /**
   * Dub OAuth configuration
   */
  oauth?: {
    /**
     * Client ID
     */
    clientId: string;
    /**
     * Client secret
     */
    clientSecret: string;
    /**
     * Enable PKCE
     *
     * @default true
     */
    pkce?: boolean;
  };
}
