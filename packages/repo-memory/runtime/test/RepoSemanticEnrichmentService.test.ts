import { describe, expect, it } from "@effect/vitest";
import { Option as O } from "effect";
import * as S from "effect/Schema";
import { RepoSemanticEnrichmentError } from "../src/semantic/RepoSemanticEnrichmentService.js";

describe("RepoSemanticEnrichmentService", () => {
  it("constructs enrichment errors through attached status-cause helpers", () => {
    const error = RepoSemanticEnrichmentError.new(new Error("kapow"), "Failed to derive semantic artifacts.", 500);

    expect(error).toBeInstanceOf(RepoSemanticEnrichmentError);
    expect(S.is(RepoSemanticEnrichmentError)(error)).toBe(true);
    expect(error.message).toBe("Failed to derive semantic artifacts.");
    expect(error.status).toBe(500);
    expect(O.isSome(error.cause)).toBe(true);
  });
});
