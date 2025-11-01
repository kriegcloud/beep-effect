import type { BS } from "@beep/schema";
export type PasswordValidation = {
  /**
   * Maximum password length
   */
  readonly maxLength?: undefined | number;

  /**
   * Minimum password length
   */
  readonly minLength?: undefined | number;

  /**
   * Password validation regex
   */
  readonly regex?: undefined | BS.Regex.Type;
};
