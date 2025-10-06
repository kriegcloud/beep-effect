import type { AuthPluginSchema, InferOptionSchema, User } from "better-auth";

export interface UserWithPhoneNumber extends User {
  phoneNumber: string;
  phoneNumberVerified: boolean;
}
const schema = {
  user: {
    fields: {
      phoneNumber: {
        type: "string",
        required: false,
        unique: true,
        sortable: true,
        returned: true,
      },
      phoneNumberVerified: {
        type: "boolean",
        required: false,
        returned: true,
        input: false,
      },
    },
  },
} satisfies AuthPluginSchema;

export interface PhoneNumberOptions {
  /**
   * Length of the OTP code
   * @default 6
   */
  otpLength?: number;
  /**
   * Send OTP code to the user
   *
   * @param phoneNumber
   * @param code
   * @returns
   */
  sendOTP: (data: { phoneNumber: string; code: string }, request?: Request) => Promise<void> | void;
  /**
   * a callback to send otp on user requesting to reset their password
   *
   * @param data - contains phone number and code
   * @param request - the request object
   * @returns
   */
  sendPasswordResetOTP?: (data: { phoneNumber: string; code: string }, request?: Request) => Promise<void> | void;
  /**
   * a callback to send otp on user requesting to reset their password
   *
   * @param data - contains phone number and code
   * @param request - the request object
   * @returns
   * @deprecated Use sendPasswordResetOTP instead. This function will be removed in the next major version.
   */
  sendForgetPasswordOTP?: (data: { phoneNumber: string; code: string }, request?: Request) => Promise<void> | void;
  /**
   * Expiry time of the OTP code in seconds
   * @default 300
   */
  expiresIn?: number;
  /**
   * Function to validate phone number
   *
   * by default any string is accepted
   */
  phoneNumberValidator?: (phoneNumber: string) => boolean | Promise<boolean>;
  /**
   * Require a phone number verification before signing in
   *
   * @default false
   */
  requireVerification?: boolean;
  /**
   * Callback when phone number is verified
   */
  callbackOnVerification?: (
    data: {
      phoneNumber: string;
      user: UserWithPhoneNumber;
    },
    request?: Request
  ) => void | Promise<void>;
  /**
   * Sign up user after phone number verification
   *
   * the user will be signed up with the temporary email
   * and the phone number will be updated after verification
   */
  signUpOnVerification?: {
    /**
     * When a user signs up, a temporary email will be need to be created
     * to sign up the user. This function should return a temporary email
     * for the user given the phone number
     *
     * @param phoneNumber
     * @returns string (temporary email)
     */
    getTempEmail: (phoneNumber: string) => string;
    /**
     * When a user signs up, a temporary name will be need to be created
     * to sign up the user. This function should return a temporary name
     * for the user given the phone number
     *
     * @param phoneNumber
     * @returns string (temporary name)
     *
     * @default phoneNumber - the phone number will be used as the name
     */
    getTempName?: (phoneNumber: string) => string;
  };
  /**
   * Custom schema for the admin plugin
   */
  schema?: InferOptionSchema<typeof schema>;
  /**
   * Allowed attempts for the OTP code
   * @default 3
   */
  allowedAttempts?: number;
}
