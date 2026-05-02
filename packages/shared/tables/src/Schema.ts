import { Membership, Organization, User } from "./entities/index.ts";

/**
 * Shared-kernel Drizzle schema aggregate.
 *
 * @since 0.0.0
 * @category tables
 */
export interface DbSchema {
  readonly membership: typeof Membership.Table;
  readonly organization: typeof Organization.Table;
  readonly user: typeof User.Table;
}

/**
 * Shared-kernel Drizzle schema aggregate.
 *
 * @since 0.0.0
 * @category tables
 */
export const DbSchema: DbSchema = {
  organization: Organization.Table,
  membership: Membership.Table,
  user: User.Table,
};
