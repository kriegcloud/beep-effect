/**
 * Compile-time checks for shared table factory inference.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import * as sqlite from "drizzle-orm/sqlite-core";
import type { EntityIdLike } from "./table.js";
import { make } from "./table.js";

declare const TestEntityId: EntityIdLike<"TestEntityId", "test_entity", "shared", number>;
const testEntityFactory = make(TestEntityId);

const testEntity = testEntityFactory(
  {
    name: sqlite.text("name").notNull(),
    enabled: sqlite.integer("enabled", { mode: "boolean" }).notNull().default(false),
  },
  (table) => [sqlite.index("test_entity_name_idx").on(table.name)]
);

type TestEntitySelect = InferSelectModel<typeof testEntity>;
type TestEntityInsert = InferInsertModel<typeof testEntity>;

const _checkSelectId: TestEntitySelect["id"] = 1;
const _checkSelectCreatedAt: TestEntitySelect["createdAt"] = 1;
const _checkSelectDeletedAt: TestEntitySelect["deletedAt"] = null;
const _checkSelectSource: TestEntitySelect["source"] = null;
const _checkSelectEnabled: TestEntitySelect["enabled"] = false;

const _checkInsertName: TestEntityInsert["name"] = "name";
const _checkInsertEnabled: TestEntityInsert["enabled"] = true;

type TestEntityColumns = Parameters<typeof testEntityFactory>[0];

const _invalidIdOverride: TestEntityColumns = {
  // @ts-expect-error default shared columns cannot be overridden
  id: sqlite.integer("id", { mode: "number" }),
  name: sqlite.text("name").notNull(),
};

const _invalidCreatedAtOverride: TestEntityColumns = {
  // @ts-expect-error injected audit columns cannot be overridden
  createdAt: sqlite.integer("created_at", { mode: "number" }),
  name: sqlite.text("name").notNull(),
};

void [
  _checkSelectId,
  _checkSelectCreatedAt,
  _checkSelectDeletedAt,
  _checkSelectSource,
  _checkSelectEnabled,
  _checkInsertName,
  _checkInsertEnabled,
  _invalidIdOverride,
  _invalidCreatedAtOverride,
];
