import { expect } from "bun:test";
import { effect } from "@beep/testkit";
import { deepMerge } from "@beep/utils/data/object.utils/deep-merge";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";

effect("deepMerge combines nested objects and merges arrays by index", () =>
  Effect.gen(function* () {
    const target = {
      meta: { createdBy: "system", tags: ["alpha", "beta"] },
      stats: { views: 10, likes: 2 },
    } as const;

    const source = {
      meta: { tags: ["release"], description: "Initial release" },
      stats: { likes: 5 },
    } as const;

    const result = deepMerge(target, source);

    expect(result).toEqual({
      meta: { createdBy: "system", tags: ["release", "beta"], description: "Initial release" },
      stats: { views: 10, likes: 5 },
    });

    expect(target).toEqual({
      meta: { createdBy: "system", tags: ["alpha", "beta"] },
      stats: { views: 10, likes: 2 },
    });

    expect(result.meta).not.toBe(target.meta);
    expect(result.meta?.tags).not.toBe(target.meta.tags);
  })
);

effect("deepMerge preserves target values when source entries are undefined", () =>
  Effect.gen(function* () {
    const target = { flags: { archived: false, published: true } };
    const source = { flags: { archived: undefined, featured: true } };

    const result = deepMerge(target, source);

    expect(result.flags).toEqual({ archived: false, published: true, featured: true });
  })
);

effect("deepMerge merges multiple sources sequentially", () =>
  Effect.gen(function* () {
    const base = { level: 1, progress: { completed: 2, total: 5 } };
    const updateOne = { level: 2 };
    const updateTwo = { progress: { completed: 4 } };

    const result = deepMerge(base, updateOne, updateTwo);

    expect(result).toEqual({ level: 2, progress: { completed: 4, total: 5 } });
  })
);

effect("deepMerge does not mutate the provided inputs", () =>
  Effect.gen(function* () {
    const original = { list: [{ id: 1 }, { id: 2 }] };
    const updates = { list: [{ id: 1, name: "One" }] };

    const result = deepMerge(original, updates);

    expect(original).toEqual({ list: [{ id: 1 }, { id: 2 }] });

    const firstUpdated = F.pipe(
      result.list,
      A.head,
      O.map((item) => item.name),
      O.getOrElse(() => "")
    );

    expect(firstUpdated).toBe("One");
  })
);

effect("deepMerge ignores unsafe prototype keys", () =>
  Effect.gen(function* () {
    const target = {} as Record<string, unknown>;
    const result = deepMerge(target, { __proto__: { polluted: true } });

    expect((result as Record<string, unknown>).__proto__).not.toHaveProperty("polluted");
  })
);
