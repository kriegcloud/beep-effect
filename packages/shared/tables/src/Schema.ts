/**
 * Shared-kernel Drizzle schema aggregate exports.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { Membership, Organization, User } from "./entities/index.ts";

type DbSchemaShape = {
  readonly membership: typeof Membership.Table;
  readonly organization: typeof Organization.Table;
  readonly user: typeof User.Table;
};

/**
 * Shared-kernel Drizzle schema aggregate.
 *
 * @since 0.0.0
 * @category tables
 */
export const DbSchema: DbSchemaShape = {
  organization: Organization.Table,
  membership: Membership.Table,
  user: User.Table,
};

/**
 * Type for {@link DbSchema}.
 *
 * @since 0.0.0
 * @category tables
 */
export type DbSchema = DbSchemaShape;
