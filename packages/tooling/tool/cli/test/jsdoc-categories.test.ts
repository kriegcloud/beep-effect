import {
  isAcceptedJSDocCategory,
  isCanonicalJSDocCategory,
  normalizeJSDocCategory,
  normalizeJSDocCategoryKey,
} from "@beep/repo-utils/schemas/JSDocCategories";
import { Str } from "@beep/utils";
import { describe, expect, it } from "vitest";

describe("JSDoc category taxonomy", () => {
  it("normalizes legacy casing and separators to category keys", () => {
    expect(normalizeJSDocCategoryKey("DomainModel")).toBe("domain-model");
    expect(normalizeJSDocCategoryKey("Resource Management & Finalization")).toBe("resource-management-finalization");
    expect(normalizeJSDocCategoryKey("tool_schemas")).toBe("tool-schemas");
    expect(normalizeJSDocCategoryKey("HTTPServerAdapter")).toBe("http-server-adapter");
  });

  it("accepts canonical kebab-case values", () => {
    expect(isCanonicalJSDocCategory("value-objects")).toBe(true);
    expect(isCanonicalJSDocCategory("tool-schemas")).toBe(true);
    expect(isCanonicalJSDocCategory("error-handling")).toBe(true);
  });

  it("maps transitional aliases to canonical values", () => {
    expect(normalizeJSDocCategory("DomainModel")).toMatchObject({
      canonical: "models",
      status: "alias",
    });
    expect(normalizeJSDocCategory("ToolSchemas")).toMatchObject({
      canonical: "tool-schemas",
      status: "alias",
    });
    expect(normalizeJSDocCategory("entity ids")).toMatchObject({
      canonical: "entity-ids",
      status: "alias",
    });
    expect(normalizeJSDocCategory("Resource Management & Finalization")).toMatchObject({
      canonical: "resource-management",
      status: "alias",
    });
    expect(normalizeJSDocCategory("UseCase")).toMatchObject({
      canonical: "use-cases",
      status: "alias",
    });
  });

  it("rejects structural graph metadata as symbol categories", () => {
    expect(normalizeJSDocCategory("exports")).toMatchObject({
      status: "rejected",
    });
    expect(normalizeJSDocCategory("re-exports")).toMatchObject({
      status: "rejected",
    });
    expect(isAcceptedJSDocCategory("exports")).toBe(false);
  });

  it("reports unknown or empty categories", () => {
    expect(normalizeJSDocCategory("totally-made-up")).toMatchObject({
      status: "unknown",
    });
    expect(normalizeJSDocCategory("")).toMatchObject({
      message: "Empty @category value.",
      status: "unknown",
    });
  });

  it("rejects overlong category text before normalization", () => {
    expect(normalizeJSDocCategory(Str.repeat(10_000)("A"))).toMatchObject({
      message: "@category value exceeds 128 characters.",
      status: "rejected",
    });
  });
});
