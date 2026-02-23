import { describe, it } from "bun:test";
import * as internal from "@beep/shared-domain/_internal/policy";

import { deepStrictEqual } from "@beep/testkit";

describe("makePermissions", () => {
  it("generates correct permission strings for actions", () => {
    const permissions = internal.makePermissions({
      users: ["read", "manage"],
    });

    deepStrictEqual(permissions, ["users:read", "users:manage"]);
  });

  it("handles multiple domains", () => {
    const permissions = internal.makePermissions({
      users: ["read"],
      posts: ["manage"],
    });

    deepStrictEqual(permissions, ["users:read", "posts:manage"]);
  });

  it("handles empty arrays", () => {
    const permissions = internal.makePermissions({
      users: [],
    });

    deepStrictEqual(permissions, []);
  });
});
