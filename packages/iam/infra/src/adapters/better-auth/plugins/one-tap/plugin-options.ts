export interface OneTapOptions {
  /**
   * Disable the signup flow
   *
   * @default false
   */
  disableSignup?: boolean;
  /**
   * Google Client ID
   *
   * If a client ID is provided in the social provider configuration,
   * it will be used.
   */
  clientId?: string;
}
