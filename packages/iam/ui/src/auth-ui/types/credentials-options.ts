import type { PasswordValidation } from "./password-validation";

export type CredentialsOptions = {
  /**
   * Enable or disable the Confirm Password input
   * @default false
   */
  readonly confirmPassword?: undefined | boolean;

  /**
   * Enable or disable Forgot Password flow
   * @default true
   */
  readonly forgotPassword?: undefined | boolean;

  /**
   * Customize the password validation
   */
  readonly passwordValidation?: undefined | PasswordValidation;

  /**
   * Enable or disable Remember Me checkbox
   * @default false
   */
  readonly rememberMe?: undefined | boolean;

  /**
   * Enable or disable Username support
   * @default false
   */
  readonly username?: undefined | boolean;
};
