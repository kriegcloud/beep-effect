import {
  isAcceptedJSDocCategory,
  isCanonicalJSDocCategory,
  normalizeJSDocCategory,
  normalizeJSDocCategoryKey,
} from "@beep/repo-utils/schemas/JSDocCategories";
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

  it("accepts the newly promoted canonical roles", () => {
    expect(isCanonicalJSDocCategory("annotations")).toBe(true);
    expect(isCanonicalJSDocCategory("math")).toBe(true);
    expect(isCanonicalJSDocCategory("pattern-matching")).toBe(true);
  });

  it("aliases Effect-style role labels to canonical slugs", () => {
    expect(normalizeJSDocCategory("transforming")).toMatchObject({
      canonical: "mapping",
      status: "alias",
    });
    expect(normalizeJSDocCategory("converting")).toMatchObject({
      canonical: "mapping",
      status: "alias",
    });
    expect(normalizeJSDocCategory("mutations")).toMatchObject({
      canonical: "setters",
      status: "alias",
    });
    expect(normalizeJSDocCategory("utility types")).toMatchObject({
      canonical: "type-level",
      status: "alias",
    });
    expect(normalizeJSDocCategory("do notation")).toMatchObject({
      canonical: "combinators",
      status: "alias",
    });
    expect(normalizeJSDocCategory("equivalence")).toMatchObject({
      canonical: "predicates",
      status: "alias",
    });
  });

  it("treats spaced or cased forms of the new canonicals as aliases", () => {
    expect(normalizeJSDocCategory("pattern matching")).toMatchObject({
      canonical: "pattern-matching",
      status: "alias",
    });
    expect(normalizeJSDocCategory("Annotations")).toMatchObject({
      canonical: "annotations",
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
    expect(normalizeJSDocCategory("A".repeat(10_000))).toMatchObject({
      message: "@category value exceeds 128 characters.",
      status: "rejected",
    });
  });
});
