import { expect } from "bun:test";
import { effect } from "@beep/testkit";
import { getPath, setPath } from "@beep/utils/object/path";
import * as Effect from "effect/Effect";

effect("getPath safely reads nested values with defaults", () =>
  Effect.gen(function* () {
    const payload = { user: { profile: { name: "Ada" } }, items: [{ id: 1 }] };

    const name = getPath(payload, "user.profile.name");
    const itemId = getPath(payload, ["items", 0, "id"]);
    const missing = getPath(payload, "user.missing.value", "fallback");
    const forbidden = getPath(payload, "__proto__.polluted", "guarded");
    // @ts-expect-error
    expect(name).toBe("Ada");
    // @ts-expect-error
    expect(itemId).toBe(1);
    expect(missing).toBe("fallback");
    expect(forbidden).toBe("guarded");
  })
);

effect("setPath builds nested objects and arrays while skipping forbidden keys", () =>
  Effect.gen(function* () {
    const target: Record<string, unknown> = {};

    const result = setPath(target, "user.profile.name", "Ari");
    const arrayResult = setPath(target, "items[0].id", 42);
    const forbidden = setPath(target, "__proto__.bad", "skip");

    expect(result).toBe(target);
    expect(arrayResult).toBe(target);
    expect(forbidden).toBe(target);
    // @ts-expect-error
    expect(getPath(target, "user.profile.name")).toBe("Ari");
    // @ts-expect-error
    expect(getPath(target, "items.[0].id")).toBe(42);

    expect(target).toEqual({ user: { profile: { name: "Ari" } }, items: [{ id: 42 }] });
  })
);

effect("setPath reuses existing objects instead of overwriting them", () =>
  Effect.gen(function* () {
    const target = { user: { profile: { name: "Ada" } } } as Record<string, unknown>;

    setPath(target, "user.profile.title", "Engineer");
    expect(target.user).toEqual({ profile: { name: "Ada", title: "Engineer" } });
  })
);
