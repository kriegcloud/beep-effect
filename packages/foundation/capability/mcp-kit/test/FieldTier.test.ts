/**
 * Fixture proof: the field-tier projector reduces a large fixture payload
 * (documentBag-shaped) below a configured size budget; minimal/balanced/
 * complete tiers are named Schema variants.
 *
 * @since 0.0.0
 */
import { defineFieldTiers, estimateJsonSize, projectFieldTier, projectWithinBudget } from "@beep/mcp-kit";
import { assert, describe, it } from "@effect/vitest";
import * as S from "effect/Schema";

const documentTiers = defineFieldTiers({
  balanced: S.Struct({ abstractText: S.String, documentId: S.String, title: S.String }),
  complete: S.Struct({
    abstractText: S.String,
    documentBag: S.Array(S.String),
    documentId: S.String,
    title: S.String,
  }),
  minimal: S.Struct({ documentId: S.String, title: S.String }),
});

const documentBagFixture = Array.from({ length: 500 }, (_, index) => `document-page-content-${index}`.repeat(20));

const largeDocumentBagPayload: Record<string, unknown> = {
  abstractText: "A".repeat(2000),
  documentBag: documentBagFixture,
  documentId: "US-12345678-A1",
  title: "Fixture Patent Title",
};

describe("field-tier projector", () => {
  it("names minimal/balanced/complete as actual Schema.Struct variants", () => {
    assert.deepStrictEqual(Object.keys(documentTiers.minimal.fields).sort(), ["documentId", "title"]);
    assert.isTrue(S.isSchema(documentTiers.minimal));
    assert.isTrue(S.isSchema(documentTiers.balanced));
    assert.isTrue(S.isSchema(documentTiers.complete));
  });

  it("reduces a large documentBag-shaped fixture payload below a configured size budget", () => {
    const budgetBytes = 500;
    const fullSize = estimateJsonSize(largeDocumentBagPayload);

    assert.isAbove(fullSize, budgetBytes);

    const projected = projectWithinBudget(documentTiers, largeDocumentBagPayload, budgetBytes);

    assert.strictEqual(projected.tier, "minimal");
    assert.isAtMost(estimateJsonSize(projected.value), budgetBytes);
    assert.notProperty(projected.value, "documentBag");
  });

  it("projects a single named tier's field set", () => {
    const projected = projectFieldTier(documentTiers, "balanced", largeDocumentBagPayload);

    assert.deepStrictEqual(Object.keys(projected).sort(), ["abstractText", "documentId", "title"]);
  });
});
