import { alignCandidate } from "@beep/langextract/Alignment";
import { ExtractionCandidate, LangExtractOptions } from "@beep/langextract/Extraction";
import { describe, expect, it } from "@effect/vitest";

describe("alignCandidate", () => {
  it("finds exact source matches", () => {
    const extraction = alignCandidate(
      "Alice founded Acme.",
      ExtractionCandidate.make({ label: "person", text: "Alice" })
    );

    expect(extraction.alignmentStatus).toBe("match_exact");
    expect(extraction.span?.start).toBe(0);
    expect(extraction.span?.end).toBe(5);
  });

  it("falls back to case-insensitive lesser matches", () => {
    const extraction = alignCandidate(
      "Alice founded Acme.",
      ExtractionCandidate.make({ label: "organization", text: "acme" })
    );

    expect(extraction.alignmentStatus).toBe("match_lesser");
    expect(extraction.matchedText).toBe("Acme");
  });

  it("keeps lesser match spans anchored to source offsets after Unicode lowercase expansion", () => {
    const extraction = alignCandidate(
      "A\u0130 Alice founded Acme.",
      ExtractionCandidate.make({ label: "person", text: "alice" })
    );

    expect(extraction.alignmentStatus).toBe("match_lesser");
    expect(extraction.matchedText).toBe("Alice");
    expect(extraction.span?.start).toBe(3);
    expect(extraction.span?.end).toBe(8);
  });

  it("uses bounded fuzzy matching", () => {
    const extraction = alignCandidate(
      "Alice founded Acme.",
      ExtractionCandidate.make({ label: "organization", text: "Acmee" }),
      LangExtractOptions.make({ fuzzyThreshold: 0.75 })
    );

    expect(extraction.alignmentStatus).toBe("match_fuzzy");
    expect(extraction.matchedText).toBe("Acme.");
  });

  it("marks candidates unaligned when no match passes", () => {
    const extraction = alignCandidate(
      "Alice founded Acme.",
      ExtractionCandidate.make({ label: "place", text: "Paris" })
    );

    expect(extraction.alignmentStatus).toBe("unaligned");
    expect(extraction.span).toBeUndefined();
  });
});
