import type { AuthPluginSchema, InferOptionSchema } from "better-auth";
import type { StringValue } from "ms";

export const schema = {
  deviceCode: {
    fields: {
      deviceCode: {
        type: "string",
        required: true,
      },
      userCode: {
        type: "string",
        required: true,
      },
      userId: {
        type: "string",
        required: false,
      },
      expiresAt: {
        type: "date",
        required: true,
      },
      status: {
        type: "string",
        required: true,
      },
      lastPolledAt: {
        type: "date",
        required: false,
      },
      pollingInterval: {
        type: "number",
        required: false,
      },
      clientId: {
        type: "string",
        required: false,
      },
      scope: {
        type: "string",
        required: false,
      },
    },
  },
} satisfies AuthPluginSchema;

export type DeviceAuthorizationOptions = {
  /* Time in seconds until the device code expires. Use formats like '30m', '5s', '1h', etc. */
  expiresIn: StringValue;
  /* Time in seconds between polling attempts. Use formats like '30m', '5s', '1h', etc. */
  interval: StringValue;
  /* Length of the device code to be generated. Default is 40 characters. */
  deviceCodeLength: number;
  /* Length of the user code to be generated. Default is 8 characters. */
  userCodeLength: number;
  /* Length of the user code to be generated. Default is 8 characters. */
  generateDeviceCode?: () => string | Promise<string>;
  /* Function to generate a user code. If not provided, a default random string generator will be used. */
  generateUserCode?: () => string | Promise<string>;
  /* Function to validate the client ID. If not provided, no validation will be performed. */
  validateClient?: (clientId: string) => boolean | Promise<boolean>;
  /* Function to handle device authorization requests. If not provided, no additional actions will be taken. */
  onDeviceAuthRequest?: (clientId: string, scope: string | undefined) => void | Promise<void>;
  schema?: InferOptionSchema<typeof schema>;
};
