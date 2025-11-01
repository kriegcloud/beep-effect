import type { User } from "@beep/iam-domain/entities";
import type { AccountViewPaths } from "../lib/view-paths";
export type AccountOptions = {
  /**
   * Base path for account-scoped views
   * @default "/account"
   */
  readonly basePath?: undefined | string;
  /**
   * Array of fields to show in Account Settings
   * @default ["image", "name"]
   */
  readonly fields: ReadonlyArray<typeof User.Model.utils.KeyType>;
  /**
   * Customize account view paths
   */
  readonly viewPaths?: undefined | Partial<AccountViewPaths>;
};

export type AccountOptionsContext = {
  /**
   * Base path for account-scoped views
   * @default "/account"
   */
  readonly basePath: string;
  /**
   * Array of fields to show in Account Settings
   * @default ["image", "name"]
   */
  readonly fields: ReadonlyArray<typeof User.Model.utils.keySchema.Type>;
  /**
   * Customize account view paths
   */
  readonly viewPaths: AccountViewPaths;
};
