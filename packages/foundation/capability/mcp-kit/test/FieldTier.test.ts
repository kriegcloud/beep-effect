/**
 * Fixture proof: the field-tier projector reduces a large fixture payload
 * (documentBag-shaped) below a configured size budget; minimal/balanced/
 * complete tiers are named Schema variants. When even the minimal tier
 * exceeds the budget, the result is a fetchable-handle outcome, never an
 * oversized inline payload. The columnar reshaper never drops fields for
 * sparse rows.
 *
 * @since 0.0.0
 */
import {
  defineFieldTiers,
  estimateJsonSize,
  FetchableHandle,
  projectFieldTier,
  projectWithinBudget,
  toColumnarEnvelope,
} from "@beep/mcp-kit";
import { NonNegativeInt } from "@beep/schema";
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

const mintFetchableHandle = (oversized: { readonly sizeBytes: number }): FetchableHandle =>
  FetchableHandle.make({
    handleId: "5b1d6a3e-8f3e-4a1a-9c1e-2e6b7a2f9c10",
    expiresAt: "2026-07-01T01:00:00.000Z",
    sizeBytes: NonNegativeInt.make(oversized.sizeBytes),
    tier: "minimal",
  });

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

    const projected = projectWithinBudget(documentTiers, largeDocumentBagPayload, { budgetBytes, mintFetchableHandle });

    assert.strictEqual(projected._tag, "Inline");
    if (projected._tag === "Inline") {
      assert.strictEqual(projected.tier, "minimal");
      assert.isAtMost(estimateJsonSize(projected.value), budgetBytes);
      assert.notProperty(projected.value, "documentBag");
    }
  });

  it("projects a single named tier's field set", () => {
    const projected = projectFieldTier(documentTiers, "balanced", largeDocumentBagPayload);

    assert.deepStrictEqual(Object.keys(projected).sort(), ["abstractText", "documentId", "title"]);
  });

  it("never returns an oversized payload inline when even the minimal tier exceeds the budget", () => {
    const minimalProjectedSize = estimateJsonSize(projectFieldTier(documentTiers, "minimal", largeDocumentBagPayload));
    const impossibleBudgetBytes = 1;

    assert.isAbove(minimalProjectedSize, impossibleBudgetBytes);

    const projected = projectWithinBudget(documentTiers, largeDocumentBagPayload, {
      budgetBytes: impossibleBudgetBytes,
      mintFetchableHandle,
    });

    assert.strictEqual(projected._tag, "Fetchable");
    if (projected._tag === "Fetchable") {
      assert.isTrue(S.is(FetchableHandle)(projected.handle));
      assert.strictEqual(projected.handle.tier, "minimal");
    }
    assert.notProperty(projected, "value");
  });
});

describe("toColumnarEnvelope", () => {
  it("unions column keys across all rows and never drops sparse fields", () => {
    const envelope = toColumnarEnvelope([{ title: "A" }, { id: "2", title: "B" }]);

    assert.deepStrictEqual(envelope.columns, ["title", "id"]);
    assert.deepStrictEqual(envelope.rows, [
      ["A", null],
      ["B", "2"],
    ]);
  });
});
