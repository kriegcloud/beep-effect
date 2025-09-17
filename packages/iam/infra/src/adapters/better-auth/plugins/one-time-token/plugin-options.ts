import type { GenericEndpointContext, Session, User } from "better-auth";

export interface OneTimeTokenOptions {
  /**
   * Expires in minutes
   *
   * @default 3
   */
  expiresIn?: number;
  /**
   * Only allow server initiated requests
   */
  disableClientRequest?: boolean;
  /**
   * Generate a custom token
   */
  generateToken?: (
    session: {
      user: User & Record<string, any>;
      session: Session & Record<string, any>;
    },
    ctx: GenericEndpointContext
  ) => Promise<string>;
  /**
   * This option allows you to configure how the token is stored in your database.
   * Note: This will not affect the token that's sent, it will only affect the token stored in your database.
   *
   * @default "plain"
   */
  storeToken?: "plain" | "hashed" | { type: "custom-hasher"; hash: (token: string) => Promise<string> };
}
