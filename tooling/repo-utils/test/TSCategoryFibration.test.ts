import {
  APPLICABLE_TO_CATEGORY_ROUTING,
  CATEGORY_PRECEDENCE,
  CATEGORY_TAXONOMY,
  DETERMINISTIC_CLASSIFICATION_THRESHOLD,
  getCandidateCategories,
  getCategoriesByArchLayer,
  getCategoriesByEffectAnalog,
  getCategoriesByPurity,
  getCategoriesForApplicableTo,
  getCategory,
  getCategoryPrecedence,
  getTSCategoryMetadata,
  make,
  resolveContextFallback,
  TSCategoryDefinition,
  TSCategoryTag,
  UNCATEGORIZED_GUARDRAIL_THRESHOLD,
} from "@beep/repo-utils/JSDoc/models/TSCategory.model";
import { CategoryValue } from "@beep/repo-utils/JSDoc/models/tag-values/TypeDocTagValues";
import { describe, expect, it } from "@effect/vitest";
import * as S from "effect/Schema";

describe("TSCategoryFibration", () => {
  describe("TSCategoryTag schema", () => {
    it("accepts all valid category tags", () => {
      const expectedTags = [
        "DomainModel",
        "DomainLogic",
        "PortContract",
        "Validation",
        "Utility",
        "UseCase",
        "Presentation",
        "DataAccess",
        "Integration",
        "Configuration",
        "CrossCutting",
        "Uncategorized",
      ] as const;

      for (const tag of expectedTags) {
        const decoded = S.decodeSync(TSCategoryTag)(tag);
        expect(decoded).toBe(tag);
      }
    });

    it("rejects invalid category tags", () => {
      // @ts-expect-error - testing runtime rejection of invalid input
      expect(() => S.decodeSync(TSCategoryTag)("NotARealCategory")).toThrow();
    });
  });

  describe("TSCategoryDefinition.make", () => {
    it("attaches metadata annotation and returns lean literal schema", () => {
      const firstCategory = CATEGORY_TAXONOMY[0];
      const { _tag, ...meta } = firstCategory;

      const schema = make(_tag, meta);
      const decoded = S.decodeSync(schema)(_tag);
      const metadata = getTSCategoryMetadata(schema);

      expect(decoded).toBe(_tag);
      expect(metadata).toBeDefined();
      expect(metadata?._tag).toBe(_tag);
      expect(metadata?.definition).toBe(firstCategory.definition);
    });
  });

  describe("CATEGORY_TAXONOMY", () => {
    it("entries decode as TSCategoryDefinition", () => {
      for (const category of CATEGORY_TAXONOMY) {
        const decoded = S.decodeSync(TSCategoryDefinition)(category);
        expect(decoded._tag).toBe(category._tag);
      }
    });

    it("includes all 12 required tags", () => {
      const expectedTags = [
        "DomainModel",
        "DomainLogic",
        "PortContract",
        "Validation",
        "Utility",
        "UseCase",
        "Presentation",
        "DataAccess",
        "Integration",
        "Configuration",
        "CrossCutting",
        "Uncategorized",
      ] as const;

      const actualTags = CATEGORY_TAXONOMY.map((category) => category._tag);

      expect(actualTags).toEqual(expectedTags);
      expect(new Set(actualTags).size).toBe(12);
    });
  });

  describe("CategoryValue schema", () => {
    it("decodes valid category names", () => {
      const decoded = S.decodeSync(CategoryValue)({ _tag: "category", name: "UseCase" });
      expect(decoded._tag).toBe("category");
      expect(decoded.name).toBe("UseCase");
    });

    it("rejects invalid category names", () => {
      // @ts-expect-error - testing runtime rejection of invalid input
      expect(() => S.decodeSync(CategoryValue)({ _tag: "category", name: "NopeCategory" })).toThrow();
    });
  });

  describe("runtime helper behavior", () => {
    it("provides precedence, lookup, and grouping behavior", () => {
      expect(getCategoryPrecedence("Validation")).toBeLessThan(getCategoryPrecedence("Utility"));
      expect(getCategoryPrecedence("Uncategorized")).toBe(CATEGORY_PRECEDENCE.length - 1);

      expect(getCategory("DataAccess")?._tag).toBe("DataAccess");
      expect(getCategory("NotACategory")).toBeUndefined();

      expect(getCategoriesByPurity("pure").map((category) => category._tag)).toContain("DomainModel");
      expect(getCategoriesByArchLayer("Core").map((category) => category._tag)).toContain("DomainLogic");
      expect(getCategoriesByEffectAnalog("IO").map((category) => category._tag)).toContain("Presentation");

      const functionCandidates = getCategoriesForApplicableTo("function");
      expect(functionCandidates[0]?._tag).toBe(APPLICABLE_TO_CATEGORY_ROUTING.function[0]);

      expect(DETERMINISTIC_CLASSIFICATION_THRESHOLD).toBeGreaterThan(UNCATEGORIZED_GUARDRAIL_THRESHOLD);
    });

    it("scores and sorts candidate categories", () => {
      const candidates = getCandidateCategories([
        { category: "DomainLogic", confidence: 0.5 },
        { category: "DomainLogic", confidence: 0.5 },
        { category: "Validation", confidence: 0.7 },
        { category: "UnknownCategory", confidence: 1 },
      ]);

      expect(candidates[0]?.category._tag).toBe("DomainLogic");
      expect(candidates[0]?.combinedConfidence).toBeCloseTo(0.75, 5);
      expect(candidates.length).toBe(2);

      const tieCandidates = getCandidateCategories([
        { category: "UseCase", confidence: 0.6 },
        { category: "DataAccess", confidence: 0.6 },
      ]);

      expect(tieCandidates[0]?.category._tag).toBe("DataAccess");
      expect(tieCandidates[1]?.category._tag).toBe("UseCase");
    });

    it("resolves fallback context using documented order", () => {
      const scoredCandidates = getCandidateCategories([{ category: "Validation", confidence: 0.7 }]);
      const lowCandidates = getCandidateCategories([
        {
          category: "Validation",
          confidence: UNCATEGORIZED_GUARDRAIL_THRESHOLD - 0.01,
        },
      ]);

      expect(resolveContextFallback(scoredCandidates, "DomainModel", "Presentation")).toBe("DomainModel");
      expect(resolveContextFallback(scoredCandidates, undefined, "Presentation")).toBe("Presentation");
      expect(resolveContextFallback(scoredCandidates)).toBe("Validation");
      expect(resolveContextFallback(lowCandidates)).toBe("Uncategorized");
    });
  });
});
