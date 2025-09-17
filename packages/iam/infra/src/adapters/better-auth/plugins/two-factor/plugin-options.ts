import type { AuthPluginSchema, InferOptionSchema, User } from "better-auth";
import type { AuthEndpoint } from "better-auth/api";
import type { LiteralString } from "../../internal";
export const schema = {
  user: {
    fields: {
      twoFactorEnabled: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
    },
  },
  twoFactor: {
    fields: {
      secret: {
        type: "string",
        required: true,
        returned: false,
      },
      backupCodes: {
        type: "string",
        required: true,
        returned: false,
      },
      userId: {
        type: "string",
        required: true,
        returned: false,
        references: {
          model: "user",
          field: "id",
        },
      },
    },
  },
} satisfies AuthPluginSchema;

export interface OTPOptions {
  /**
   * How long the opt will be valid for in
   * minutes
   *
   * @default "3 mins"
   */
  period?: number;
  /**
   * Number of digits for the OTP code
   *
   * @default 6
   */
  digits?: number;
  /**
   * Send the otp to the user
   *
   * @param user - The user to send the otp to
   * @param otp - The otp to send
   * @param request - The request object
   * @returns void | Promise<void>
   */
  sendOTP?: (
    /**
     * The user to send the otp to
     * @type UserWithTwoFactor
     * @default UserWithTwoFactors
     */
    data: {
      user: UserWithTwoFactor;
      otp: string;
    },
    /**
     * The request object
     */
    request?: Request
  ) => Promise<void> | void;
  /**
   * The number of allowed attempts for the OTP
   *
   * @default 5
   */
  allowedAttempts?: number;
  storeOTP?:
    | "plain"
    | "encrypted"
    | "hashed"
    | { hash: (token: string) => Promise<string> }
    | {
        encrypt: (token: string) => Promise<string>;
        decrypt: (token: string) => Promise<string>;
      };
}

export type TOTPOptions = {
  /**
   * Issuer
   */
  issuer?: string;
  /**
   * How many digits the otp to be
   *
   * @default 6
   */
  digits?: 6 | 8;
  /**
   * Period for otp in seconds.
   * @default 30
   */
  period?: number;
  /**
   * Backup codes configuration
   */
  backupCodes?: BackupCodeOptions;
  /**
   * Disable totp
   */
  disable?: boolean;
};

export interface BackupCodeOptions {
  /**
   * The amount of backup codes to generate
   *
   * @default 10
   */
  amount?: number;
  /**
   * The length of the backup codes
   *
   * @default 10
   */
  length?: number;
  /**
   * An optional custom function to generate backup codes
   */
  customBackupCodesGenerate?: () => string[];
  /**
   * How to store the backup codes in the database, whether encrypted or plain.
   */
  storeBackupCodes?:
    | "plain"
    | "encrypted"
    | {
        encrypt: (token: string) => Promise<string>;
        decrypt: (token: string) => Promise<string>;
      };
}

export interface TwoFactorOptions {
  /**
   * Application Name
   */
  issuer?: string;
  /**
   * TOTP OPtions
   */
  totpOptions?: Omit<TOTPOptions, "issuer">;
  /**
   * OTP Options
   */
  otpOptions?: OTPOptions;
  /**
   * Backup code options
   */
  backupCodeOptions?: BackupCodeOptions;
  /**
   * Skip verification on enabling two factor authentication.
   * @default false
   */
  skipVerificationOnEnable?: boolean;
  /**
   * Custom schema for the two factor plugin
   */
  schema?: InferOptionSchema<typeof schema>;
}

export interface UserWithTwoFactor extends User {
  /**
   * If the user has enabled two factor authentication.
   */
  twoFactorEnabled: boolean;
}

export interface TwoFactorProvider {
  id: LiteralString;
  endpoints?: Record<string, AuthEndpoint>;
}

export interface TwoFactorTable {
  userId: string;
  secret: string;
  backupCodes: string;
  enabled: boolean;
}
