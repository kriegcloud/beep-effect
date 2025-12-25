/**
 * Tests for EntityId schema factory with AnnotableClass pattern.
 *
 * Verifies that the Type parameter correctly represents ONLY the runtime data type,
 * not the static class properties.
 */

import { describe, expect, test } from "bun:test";
import { EntityId } from "@beep/schema/identity";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

describe("EntityId Schema Factory", () => {
  test("Type resolves to template literal string, not class properties", () => {
    const TestId = EntityId.make("test_entity", { brand: "TestId" });

    // Should be just a string, not include static properties
    type IdType = typeof TestId.Type;

    // This should compile - Type is just a string
    const id: IdType = "test_entity__550e8400-e29b-41d4-a716-446655440000";

    expect(id).toMatch(/^test_entity__[0-9a-f-]+$/);
  });

  test("create() returns the data type, not the class", () => {
    const TestId = EntityId.make("test_entity", { brand: "TestId" });

    const id = TestId.create();

    // Should be assignable to Type (template literal string)
    const typed: typeof TestId.Type = id;

    expect(typed).toMatch(/^test_entity__[0-9a-f-]+$/);
  });

  test("annotations chaining returns SchemaInstance", () => {
    const TestId = EntityId.make("test_entity", { brand: "TestId" }).annotations({
      description: "Custom description",
    });

    // Should still have all static properties after annotations
    expect(TestId.tableName).toBe("test_entity");
    expect(TestId.brand).toBe("TestId");
    expect(typeof TestId.create).toBe("function");
    expect(typeof TestId.is).toBe("function");
  });

  test("is() type guard works correctly", () => {
    const TestId = EntityId.make("test_entity", { brand: "TestId" });

    const validId = TestId.create();
    const invalidId = "not-an-id";

    expect(TestId.is(validId)).toBe(true);
    expect(TestId.is(invalidId)).toBe(false);

    // Type guard should narrow the type
    if (TestId.is(validId)) {
      // This should compile - validId is narrowed to Type
      const typed: typeof TestId.Type = validId;
      expect(typed).toBe(validId);
    }
  });

  test("works in Effect context without type pollution", async () => {
    const TestId = EntityId.make("test_entity", { brand: "TestId" });

    // This should compile - return type is Effect<Type, never, never>
    const program = Effect.gen(function* () {
      const id = TestId.create();

      // Should be assignable to Effect<Type, E, R>
      return yield* Effect.succeed(id);
    });

    // The return type should be just the template literal string
    // Verified: Effect.Effect.Success<typeof program> resolves to template literal

    const result = await Effect.runPromise(program);
    expect(result).toMatch(/^test_entity__[0-9a-f-]+$/);
  });

  test("modelIdSchema has correct type and default", () => {
    const TestId = EntityId.make("test_entity", { brand: "TestId" });

    const withId = { id: TestId.create() };
    const withoutId = {}; // id will default on decode

    // Valid id should pass
    expect(S.is(S.Struct({ id: TestId.modelIdSchema }))(withId)).toBe(true);

    // Decode should use default if not provided
    const decoded = S.decodeSync(S.Struct({ id: TestId.modelIdSchema }))(withoutId);
    expect(decoded.id).toMatch(/^test_entity__[0-9a-f-]+$/);

    // Encode should preserve the id
    const encoded = S.encodeSync(S.Struct({ id: TestId.modelIdSchema }))(decoded);
    expect(encoded.id).toBe(decoded.id);
  });

  test("separate instances don't interfere", () => {
    const UserId = EntityId.make("user", { brand: "UserId" });
    const OrgId = EntityId.make("organization", { brand: "OrganizationId" });

    const userId = UserId.create();
    const orgId = OrgId.create();

    expect(userId).toMatch(/^user__[0-9a-f-]+$/);
    expect(orgId).toMatch(/^organization__[0-9a-f-]+$/);

    expect(UserId.is(userId)).toBe(true);
    expect(UserId.is(orgId)).toBe(false);
    expect(OrgId.is(userId)).toBe(false);
    expect(OrgId.is(orgId)).toBe(true);
  });

  test("Type extraction from class works", () => {
    class UserId extends EntityId.make("user", { brand: "UserId" }) {}

    // Should be the template literal string
    type UserIdType = typeof UserId.Type;

    const id: UserIdType = "user__550e8400-e29b-41d4-a716-446655440000";
    expect(id).toMatch(/^user__[0-9a-f-]+$/);
  });
});
