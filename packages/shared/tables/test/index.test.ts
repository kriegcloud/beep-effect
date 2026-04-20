import { Table, VERSION } from "@beep/shared-tables";
import type { EntityIdLike } from "@beep/shared-tables/table";
import { getTableConfig, index, text } from "drizzle-orm/sqlite-core";
import { describe, expect, it } from "vitest";

const TestEntityId: EntityIdLike<"TestEntityId", "test_entity", "shared", number> = {
  _tag: "TestEntityId",
  tableName: "test_entity",
  slice: "shared",
};

describe("@beep/shared-tables", () => {
  it("exports the package version constant", () => {
    expect(VERSION).toBe("0.0.0");
  });

  it("builds a sqlite table with the shared default columns", () => {
    const testEntity = Table.make(TestEntityId)(
      {
        name: text("name").notNull(),
      },
      (table) => [index("test_entity_name_idx").on(table.name)]
    );

    const config = getTableConfig(testEntity);

    expect(config.name).toBe("test_entity");
    expect(config.columns.map((column) => column.name)).toEqual([
      "id",
      "created_at",
      "updated_at",
      "deleted_at",
      "created_by",
      "updated_by",
      "deleted_by",
      "version",
      "source",
      "name",
    ]);
    expect(Reflect.get(testEntity.id, "autoIncrement")).toBe(true);
    expect(testEntity.id.primary).toBe(true);
    expect(config.indexes).toHaveLength(1);
  });
});
