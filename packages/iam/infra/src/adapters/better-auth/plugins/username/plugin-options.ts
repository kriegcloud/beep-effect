import type { AuthPluginSchema, InferOptionSchema } from "better-auth";
export const getSchema = (normalizer: {
  username: (username: string) => string;
  displayUsername: (displayUsername: string) => string;
}) => {
  return {
    user: {
      fields: {
        username: {
          type: "string",
          required: false,
          sortable: true,
          unique: true,
          returned: true,
          transform: {
            input(value) {
              return value == null ? value : normalizer.username(value as string);
            },
          },
        },
        displayUsername: {
          type: "string",
          required: false,
          transform: {
            input(value) {
              return value == null ? value : normalizer.displayUsername(value as string);
            },
          },
        },
      },
    },
  } satisfies AuthPluginSchema;
};

export type UsernameSchema = ReturnType<typeof getSchema>;
export type UsernameOptions = {
  schema?: InferOptionSchema<UsernameSchema>;
  /**
   * The minimum length of the username
   *
   * @default 3
   */
  minUsernameLength?: number;
  /**
   * The maximum length of the username
   *
   * @default 30
   */
  maxUsernameLength?: number;
  /**
   * A function to validate the username
   *
   * By default, the username should only contain alphanumeric characters and underscores
   */
  usernameValidator?: (username: string) => boolean | Promise<boolean>;
  /**
   * A function to validate the display username
   *
   * By default, no validation is applied to display username
   */
  displayUsernameValidator?: (displayUsername: string) => boolean | Promise<boolean>;
  /**
   * A function to normalize the username
   *
   * @default (username) => username.toLowerCase()
   */
  usernameNormalization?: ((username: string) => string) | false;
  /**
   * A function to normalize the display username
   *
   * @default false
   */
  displayUsernameNormalization?: ((displayUsername: string) => string) | false;
  /**
   * The order of validation
   *
   * @default { username: "pre-normalization", displayUsername: "pre-normalization" }
   */
  validationOrder?: {
    /**
     * The order of username validation
     *
     * @default "pre-normalization"
     */
    username?: "pre-normalization" | "post-normalization";
    /**
     * The order of display username validation
     *
     * @default "pre-normalization"
     */
    displayUsername?: "pre-normalization" | "post-normalization";
  };
};
