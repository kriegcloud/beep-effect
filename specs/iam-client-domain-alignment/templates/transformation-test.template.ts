/**
 * Transformation Schema Test Template
 *
 * Use this template when creating tests for Better Auth → Domain transformation schemas.
 *
 * Replace:
 * - {{Entity}} with the entity name (e.g., Member, Invitation, Organization)
 * - {{entity}} with lowercase entity name (e.g., member, invitation, organization)
 * - {{id_prefix}} with the branded ID prefix (e.g., iam_member, iam_invitation, shared_organization)
 */

import * as S from "effect/Schema";
import { describe, expect, it } from "vitest";
import {
  BetterAuth{{Entity}}Schema,
  Domain{{Entity}}FromBetterAuth{{Entity}},
} from "../src/_internal/{{entity}}.schemas.ts";

// =============================================================================
// Test Fixtures
// =============================================================================

const validUUID = "12345678-1234-1234-1234-123456789012";

const createValid{{Entity}}Response = (overrides = {}) => ({
  id: `{{id_prefix}}__${validUUID}`,
  // ... add required fields with valid defaults
  createdAt: new Date("2024-01-15T10:00:00Z"),
  // additionalFieldsCommon
  _rowId: 1,
  version: 1,
  source: "better-auth",
  createdBy: null,
  updatedBy: null,
  updatedAt: new Date("2024-01-15T10:00:00Z"),
  ...overrides,
});

// =============================================================================
// Schema Validation Tests
// =============================================================================

describe("BetterAuth{{Entity}}Schema", () => {
  it("accepts valid Better Auth response", () => {
    const response = createValid{{Entity}}Response();
    const result = S.decodeUnknownSync(BetterAuth{{Entity}}Schema)(response);
    expect(result.id).toBe(`{{id_prefix}}__${validUUID}`);
  });

  it("accepts unknown plugin fields via S.Record extension", () => {
    const response = createValid{{Entity}}Response({
      unknownPluginField: "some-value",
      anotherUnknown: 42,
    });
    // Should not throw - S.Record captures unknown fields
    const result = S.decodeUnknownSync(BetterAuth{{Entity}}Schema)(response);
    expect(result).toBeDefined();
  });

  it("rejects response with missing required fields", () => {
    const response = { id: `{{id_prefix}}__${validUUID}` }; // Missing required fields
    expect(() => S.decodeUnknownSync(BetterAuth{{Entity}}Schema)(response)).toThrow();
  });
});

// =============================================================================
// Transformation Tests
// =============================================================================

describe("Domain{{Entity}}FromBetterAuth{{Entity}}", () => {
  // ===========================================================================
  // 1. Happy Path
  // ===========================================================================
  it("decodes valid Better Auth response to domain model", () => {
    const response = createValid{{Entity}}Response();
    const result = S.decodeUnknownSync(Domain{{Entity}}FromBetterAuth{{Entity}})(response);

    expect(result.id).toBe(`{{id_prefix}}__${validUUID}`);
    // ... add assertions for other fields
  });

  // ===========================================================================
  // 2. Default Application
  // ===========================================================================
  it("applies defaults for missing optional fields", () => {
    const response = createValid{{Entity}}Response({
      // Omit optional fields
      _rowId: undefined,
      version: undefined,
    });
    const result = S.decodeUnknownSync(Domain{{Entity}}FromBetterAuth{{Entity}})(response);
    // Verify defaults or undefined handling
    expect(result._rowId).toBeUndefined();
  });

  // ===========================================================================
  // 3. ID Validation
  // ===========================================================================
  it("fails on invalid ID format", () => {
    const response = createValid{{Entity}}Response({
      id: "invalid-uuid", // Not {{id_prefix}}__<uuid> format
    });
    expect(() =>
      S.decodeUnknownSync(Domain{{Entity}}FromBetterAuth{{Entity}})(response)
    ).toThrow(/Invalid {{entity}} ID format/);
  });

  it("fails on wrong ID prefix", () => {
    const response = createValid{{Entity}}Response({
      id: `wrong_prefix__${validUUID}`,
    });
    expect(() =>
      S.decodeUnknownSync(Domain{{Entity}}FromBetterAuth{{Entity}})(response)
    ).toThrow(/Invalid {{entity}} ID format/);
  });

  // ===========================================================================
  // 4. Date Handling
  // ===========================================================================
  it("converts Date objects to DateTime.Utc", () => {
    const response = createValid{{Entity}}Response({
      createdAt: new Date("2024-06-15T14:30:00Z"),
    });
    const result = S.decodeUnknownSync(Domain{{Entity}}FromBetterAuth{{Entity}})(response);
    // DateTime.Utc stores as ISO string in encoded form
    expect(result.createdAt).toBeDefined();
  });

  // ===========================================================================
  // 5. Encode Round-Trip
  // ===========================================================================
  it("encodes back to Better Auth format", () => {
    const response = createValid{{Entity}}Response();
    const decoded = S.decodeUnknownSync(Domain{{Entity}}FromBetterAuth{{Entity}})(response);
    const encoded = S.encodeSync(Domain{{Entity}}FromBetterAuth{{Entity}})(decoded);

    expect(encoded.id).toBe(response.id);
    expect(encoded.createdAt).toBeInstanceOf(Date);
  });

  it("round-trip preserves data integrity", () => {
    const response = createValid{{Entity}}Response();
    const decoded = S.decodeUnknownSync(Domain{{Entity}}FromBetterAuth{{Entity}})(response);
    const encoded = S.encodeSync(Domain{{Entity}}FromBetterAuth{{Entity}})(decoded);
    const reDecoded = S.decodeUnknownSync(Domain{{Entity}}FromBetterAuth{{Entity}})(encoded);

    expect(reDecoded.id).toBe(decoded.id);
    // ... add assertions for other fields
  });

  // ===========================================================================
  // 6. Extra Fields (S.Record extension)
  // ===========================================================================
  it("handles unknown plugin fields gracefully", () => {
    const response = createValid{{Entity}}Response({
      unknownField: "should-not-fail",
    });
    // Should decode without throwing
    const result = S.decodeUnknownSync(Domain{{Entity}}FromBetterAuth{{Entity}})(response);
    expect(result).toBeDefined();
  });

  // ===========================================================================
  // 7. Plugin Fields (additionalFields)
  // ===========================================================================
  it("correctly extracts additionalFields", () => {
    const response = createValid{{Entity}}Response({
      // Add entity-specific additionalFields
    });
    const result = S.decodeUnknownSync(Domain{{Entity}}FromBetterAuth{{Entity}})(response);
    // ... add assertions for additionalFields
  });

  // ===========================================================================
  // 8. Configuration Errors
  // ===========================================================================
  it("fails gracefully when additionalFields are missing", () => {
    const response = {
      id: `{{id_prefix}}__${validUUID}`,
      // Missing required additionalFields
      createdAt: new Date(),
    };
    expect(() =>
      S.decodeUnknownSync(Domain{{Entity}}FromBetterAuth{{Entity}})(response)
    ).toThrow();
  });

  // ===========================================================================
  // 9. Partial Responses
  // ===========================================================================
  it("handles partial responses with optional fields omitted", () => {
    const response = createValid{{Entity}}Response();
    // Remove optional fields
    delete (response as Record<string, unknown>).updatedAt;

    const result = S.decodeUnknownSync(Domain{{Entity}}FromBetterAuth{{Entity}})(response);
    expect(result).toBeDefined();
  });

  // ===========================================================================
  // 10. Malformed JSON (if applicable)
  // ===========================================================================
  // Add if entity has JSON fields like permissions

  // ===========================================================================
  // 11. Invalid Enum Values
  // ===========================================================================
  // Add if entity has enum fields like role, status

  // ===========================================================================
  // 12. Null vs Undefined
  // ===========================================================================
  it("handles nullable fields correctly", () => {
    const response = createValid{{Entity}}Response({
      createdBy: null, // Nullable field
    });
    const result = S.decodeUnknownSync(Domain{{Entity}}FromBetterAuth{{Entity}})(response);
    expect(result.createdBy).toBeNull();
  });

  // ===========================================================================
  // 13. Timezone Handling
  // ===========================================================================
  it("preserves UTC timezone in DateTime conversion", () => {
    const utcDate = new Date("2024-06-15T14:30:00Z");
    const response = createValid{{Entity}}Response({
      createdAt: utcDate,
    });
    const result = S.decodeUnknownSync(Domain{{Entity}}FromBetterAuth{{Entity}})(response);
    // The instant should be preserved
    expect(result.createdAt).toBeDefined();
  });
});
