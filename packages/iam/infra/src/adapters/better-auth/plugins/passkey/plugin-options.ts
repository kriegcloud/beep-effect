import type { AuthPluginSchema, InferOptionSchema } from "better-auth";

const schema = {
  passkey: {
    fields: {
      name: {
        type: "string",
        required: false,
      },
      publicKey: {
        type: "string",
        required: true,
      },
      userId: {
        type: "string",
        references: {
          model: "user",
          field: "id",
        },
        required: true,
      },
      credentialID: {
        type: "string",
        required: true,
      },
      counter: {
        type: "number",
        required: true,
      },
      deviceType: {
        type: "string",
        required: true,
      },
      backedUp: {
        type: "boolean",
        required: true,
      },
      transports: {
        type: "string",
        required: false,
      },
      createdAt: {
        type: "date",
        required: false,
      },
      aaguid: {
        type: "string",
        required: false,
      },
    },
  },
} satisfies AuthPluginSchema;
export interface PasskeyOptions {
  /**
   * A unique identifier for your website. 'localhost' is okay for
   * local dev
   *
   * @default "localhost"
   */
  rpID?: string;
  /**
   * Human-readable title for your website
   *
   * @default "Better Auth"
   */
  rpName?: string;
  /**
   * The URL at which registrations and authentications should occur.
   * `http://localhost` and `http://localhost:PORT` are also valid.
   * Do NOT include any trailing /
   *
   * if this isn't provided. The client itself will
   * pass this value.
   */
  origin?: string | null;

  /**
   * Allow customization of the authenticatorSelection options
   * during passkey registration.
   */
  authenticatorSelection?: AuthenticatorSelectionCriteria;

  /**
   * Advanced options
   */
  advanced?: {
    webAuthnChallengeCookie?: string;
  };
  /**
   * Schema for the passkey model
   */
  schema?: InferOptionSchema<typeof schema>;
}
