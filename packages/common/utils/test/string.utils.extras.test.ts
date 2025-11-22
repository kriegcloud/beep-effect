import { expect } from "bun:test";
import { effect } from "@beep/testkit";
import {
  applyPrefix,
  applySuffix,
  formatLabel,
  getNameInitials,
  getNestedValue,
  interpolateTemplate,
  kebabCase,
  mapApplyPrefix,
  mapApplySuffix,
  normalizeString,
  singularize,
  stripMessageFormatting,
  strLiteralFromNum,
} from "@beep/utils/data/string.utils";
import type * as A from "effect/Array";
import * as Effect from "effect/Effect";

effect("getNameInitials handles whitespace, nullish, and empty names", () =>
  Effect.gen(function* () {
    expect(getNameInitials(" Ada   Lovelace ")).toBe("AL");
    expect(getNameInitials("single")).toBe("S");
    expect(getNameInitials("")).toBe("?");
    expect(getNameInitials(null)).toBe("?");
    expect(getNameInitials(undefined)).toBe("?");
  })
);

effect("normalizeString and kebabCase produce predictable search-friendly strings", () =>
  Effect.gen(function* () {
    const normalized = normalizeString("Café GrößE");
    const kebab = kebabCase("PrimaryButton  label");

    expect(normalized).toBe("cafe grosse");
    expect(kebab).toBe("primary-button-label");
  })
);

effect("stripMessageFormatting removes markdown tokens", () =>
  Effect.gen(function* () {
    const cleaned = stripMessageFormatting("*Hello*\\n\\nWorld");
    expect(cleaned).toBe("Hello World");
  })
);

effect("interpolateTemplate resolves nested values and leaves missing placeholders intact", () =>
  Effect.gen(function* () {
    const template = "Hello {{ user.name }}, item: {{items.[0].product}} {{missing.value}}";
    const output = interpolateTemplate(template, { user: { name: "Ari" }, items: [{ product: "Widget" }] });

    expect(output).toBe("Hello Ari, item: Widget {{missing.value}}");
  })
);

effect("getNestedValue supports array notation and returns undefined for missing paths", () =>
  Effect.gen(function* () {
    const payload = { list: [{ items: ["x", "y"] }] };
    const value = getNestedValue(payload, "list.[0].items.[1]");
    const missing = getNestedValue(payload, "list.[2].items.[0]");

    expect(value).toBe("y");
    expect(missing).toBeUndefined();
  })
);

effect("applyPrefix/suffix and mapping helpers preserve literal combinations", () =>
  Effect.gen(function* () {
    const addId = applySuffix("Id");
    const addPrefix = applyPrefix("beep.");

    expect(addId("user")).toBe("userId");
    expect(addPrefix("tenant")).toBe("beep.tenant");

    const prefixed = mapApplyPrefix("beep.")("users", "tenants");
    const suffixed = mapApplySuffix("Key")("api", "client");

    expect(prefixed).toEqual(["beep.users", "beep.tenants"]);
    expect(suffixed).toEqual(["apiKey", "clientKey"]);

    const prefixedArray = mapApplyPrefix("ns.")(["one", "two"] as const);
    const suffixedArray = mapApplySuffix("Role")(["admin", "user"] as const);

    expect(prefixedArray).toEqual(["ns.one", "ns.two"]);
    expect(suffixedArray).toEqual(["adminRole", "userRole"]);

    expect(() => mapApplyPrefix("x.")([] as unknown as A.NonEmptyReadonlyArray<string>)).toThrow(TypeError);
  })
);

effect("strLiteralFromNum formats numeric literals as strings", () =>
  Effect.gen(function* () {
    const literal = strLiteralFromNum(42);
    expect(literal).toBe("42");
  })
);

effect("formatLabel handles spaced, underscored, and camel case identifiers", () =>
  Effect.gen(function* () {
    const spaced = formatLabel("already spaced");
    const underscored = formatLabel("user_profile_id");
    const camel = formatLabel("phoneNumber2");
    const hyphenated = formatLabel("order-id");

    expect(spaced).toBe("Already Spaced");
    expect(underscored).toBe("User Profile Id");
    expect(camel).toBe("Phone Number 2");
    expect(hyphenated).toBe("Order Id");
  })
);

effect("mapApplySuffix rejects empty literal arrays", () =>
  Effect.gen(function* () {
    expect(() => mapApplySuffix("Id")([] as unknown as A.NonEmptyReadonlyArray<string>)).toThrow(TypeError);
  })
);

effect("singularize handles consonant-o plurals gracefully", () =>
  Effect.gen(function* () {
    expect(singularize("heroes")).toBe("hero");
  })
);
