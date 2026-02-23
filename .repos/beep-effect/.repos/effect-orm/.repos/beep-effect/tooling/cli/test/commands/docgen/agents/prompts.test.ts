/**
 * @file Unit tests for agent prompts.
 * @module docgen/agents/prompts.test
 */

import {
  COORDINATOR_SYSTEM_PROMPT,
  DOC_FIXER_SYSTEM_PROMPT,
  JSDOC_BATCH_GENERATOR_PROMPT,
  JSDOC_GENERATOR_PROMPT,
  SIMPLE_DOC_FIXER_PROMPT,
} from "@beep/repo-cli/commands/docgen/agents/prompts";
import { describe, expect, it } from "@beep/testkit";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as Str from "effect/String";

describe("prompts", () => {
  describe("JSDOC_GENERATOR_PROMPT", () => {
    it("includes required tag documentation", () => {
      expect(F.pipe(JSDOC_GENERATOR_PROMPT, Str.includes("@category"))).toBe(true);
      expect(F.pipe(JSDOC_GENERATOR_PROMPT, Str.includes("@example"))).toBe(true);
      expect(F.pipe(JSDOC_GENERATOR_PROMPT, Str.includes("@since"))).toBe(true);
    });

    it("includes Effect pattern guidance", () => {
      expect(F.pipe(JSDOC_GENERATOR_PROMPT, Str.includes("Effect.gen"))).toBe(true);
      expect(F.pipe(JSDOC_GENERATOR_PROMPT, Str.includes("F.pipe"))).toBe(true);
      expect(F.pipe(JSDOC_GENERATOR_PROMPT, Str.includes("A.map"))).toBe(true);
    });

    it("instructs to output only JSDoc", () => {
      expect(F.pipe(JSDOC_GENERATOR_PROMPT, Str.includes("DO NOT"))).toBe(true);
      expect(F.pipe(JSDOC_GENERATOR_PROMPT, Str.includes("ONLY"))).toBe(true);
    });

    it("includes category examples", () => {
      expect(F.pipe(JSDOC_GENERATOR_PROMPT, Str.includes("Constructors"))).toBe(true);
      expect(F.pipe(JSDOC_GENERATOR_PROMPT, Str.includes("Utils"))).toBe(true);
    });

    it("includes import conventions", () => {
      expect(F.pipe(JSDOC_GENERATOR_PROMPT, Str.includes('import * as Effect from "effect/Effect"'))).toBe(true);
      expect(F.pipe(JSDOC_GENERATOR_PROMPT, Str.includes('import * as A from "effect/Array"'))).toBe(true);
    });
  });

  describe("SIMPLE_DOC_FIXER_PROMPT", () => {
    it("includes required tag documentation", () => {
      expect(F.pipe(SIMPLE_DOC_FIXER_PROMPT, Str.includes("@category"))).toBe(true);
      expect(F.pipe(SIMPLE_DOC_FIXER_PROMPT, Str.includes("@example"))).toBe(true);
      expect(F.pipe(SIMPLE_DOC_FIXER_PROMPT, Str.includes("@since"))).toBe(true);
    });

    it("includes category patterns", () => {
      expect(F.pipe(SIMPLE_DOC_FIXER_PROMPT, Str.includes("Constructors"))).toBe(true);
      expect(F.pipe(SIMPLE_DOC_FIXER_PROMPT, Str.includes("Models"))).toBe(true);
      expect(F.pipe(SIMPLE_DOC_FIXER_PROMPT, Str.includes("Utils"))).toBe(true);
      expect(F.pipe(SIMPLE_DOC_FIXER_PROMPT, Str.includes("Errors"))).toBe(true);
      expect(F.pipe(SIMPLE_DOC_FIXER_PROMPT, Str.includes("Services"))).toBe(true);
      expect(F.pipe(SIMPLE_DOC_FIXER_PROMPT, Str.includes("Layers"))).toBe(true);
      expect(F.pipe(SIMPLE_DOC_FIXER_PROMPT, Str.includes("Schemas"))).toBe(true);
    });

    it("includes Effect idiom requirements", () => {
      expect(F.pipe(SIMPLE_DOC_FIXER_PROMPT, Str.includes("Effect.gen"))).toBe(true);
      expect(F.pipe(SIMPLE_DOC_FIXER_PROMPT, Str.includes("F.pipe"))).toBe(true);
      expect(F.pipe(SIMPLE_DOC_FIXER_PROMPT, Str.includes("A.map"))).toBe(true);
      expect(F.pipe(SIMPLE_DOC_FIXER_PROMPT, Str.includes("A.filter"))).toBe(true);
    });

    it("specifies forbidden patterns", () => {
      expect(F.pipe(SIMPLE_DOC_FIXER_PROMPT, Str.includes("Native"))).toBe(true);
      expect(F.pipe(SIMPLE_DOC_FIXER_PROMPT, Str.includes(".map()"))).toBe(true);
      expect(F.pipe(SIMPLE_DOC_FIXER_PROMPT, Str.includes(".filter()"))).toBe(true);
      expect(F.pipe(SIMPLE_DOC_FIXER_PROMPT, Str.includes("async/await"))).toBe(true);
    });

    it("specifies response format", () => {
      expect(F.pipe(SIMPLE_DOC_FIXER_PROMPT, Str.includes("typescript"))).toBe(true);
      expect(F.pipe(SIMPLE_DOC_FIXER_PROMPT, Str.includes("ONLY"))).toBe(true);
    });
  });

  describe("DOC_FIXER_SYSTEM_PROMPT", () => {
    it("includes tool usage workflow", () => {
      expect(F.pipe(DOC_FIXER_SYSTEM_PROMPT, Str.includes("AnalyzePackage"))).toBe(true);
      expect(F.pipe(DOC_FIXER_SYSTEM_PROMPT, Str.includes("ReadSourceFile"))).toBe(true);
      expect(F.pipe(DOC_FIXER_SYSTEM_PROMPT, Str.includes("WriteSourceFile"))).toBe(true);
      expect(F.pipe(DOC_FIXER_SYSTEM_PROMPT, Str.includes("ValidateExamples"))).toBe(true);
    });

    it("includes required tags documentation", () => {
      expect(F.pipe(DOC_FIXER_SYSTEM_PROMPT, Str.includes("@category"))).toBe(true);
      expect(F.pipe(DOC_FIXER_SYSTEM_PROMPT, Str.includes("@example"))).toBe(true);
      expect(F.pipe(DOC_FIXER_SYSTEM_PROMPT, Str.includes("@since"))).toBe(true);
    });

    it("includes JSON output format", () => {
      expect(F.pipe(DOC_FIXER_SYSTEM_PROMPT, Str.includes("packageName"))).toBe(true);
      expect(F.pipe(DOC_FIXER_SYSTEM_PROMPT, Str.includes("exportsFixed"))).toBe(true);
      expect(F.pipe(DOC_FIXER_SYSTEM_PROMPT, Str.includes("exportsRemaining"))).toBe(true);
      expect(F.pipe(DOC_FIXER_SYSTEM_PROMPT, Str.includes("validationPassed"))).toBe(true);
    });

    it("includes Effect pattern guidance", () => {
      expect(F.pipe(DOC_FIXER_SYSTEM_PROMPT, Str.includes("Effect.gen"))).toBe(true);
      expect(F.pipe(DOC_FIXER_SYSTEM_PROMPT, Str.includes("F.pipe"))).toBe(true);
    });

    it("references SearchEffectDocs tool", () => {
      expect(F.pipe(DOC_FIXER_SYSTEM_PROMPT, Str.includes("SearchEffectDocs"))).toBe(true);
    });
  });

  describe("COORDINATOR_SYSTEM_PROMPT", () => {
    it("describes coordinator role", () => {
      expect(F.pipe(COORDINATOR_SYSTEM_PROMPT, Str.includes("coordinator"))).toBe(true);
      expect(F.pipe(COORDINATOR_SYSTEM_PROMPT, Str.includes("orchestrate"))).toBe(true);
    });

    it("includes workflow steps", () => {
      expect(F.pipe(COORDINATOR_SYSTEM_PROMPT, Str.includes("Discover"))).toBe(true);
      expect(F.pipe(COORDINATOR_SYSTEM_PROMPT, Str.includes("Prioritize"))).toBe(true);
      expect(F.pipe(COORDINATOR_SYSTEM_PROMPT, Str.includes("DocFixer"))).toBe(true);
    });

    it("includes summary format", () => {
      expect(F.pipe(COORDINATOR_SYSTEM_PROMPT, Str.includes("packagesProcessed"))).toBe(true);
      expect(F.pipe(COORDINATOR_SYSTEM_PROMPT, Str.includes("totalExportsFixed"))).toBe(true);
      expect(F.pipe(COORDINATOR_SYSTEM_PROMPT, Str.includes("packagesSucceeded"))).toBe(true);
      expect(F.pipe(COORDINATOR_SYSTEM_PROMPT, Str.includes("packagesFailed"))).toBe(true);
    });

    it("includes JSON output format", () => {
      expect(F.pipe(COORDINATOR_SYSTEM_PROMPT, Str.includes("json"))).toBe(true);
    });
  });

  describe("JSDOC_BATCH_GENERATOR_PROMPT", () => {
    it("includes batch format markers", () => {
      expect(F.pipe(JSDOC_BATCH_GENERATOR_PROMPT, Str.includes("---JSDOC:"))).toBe(true);
      expect(F.pipe(JSDOC_BATCH_GENERATOR_PROMPT, Str.includes("---END---"))).toBe(true);
    });

    it("includes Effect idioms requirement", () => {
      expect(F.pipe(JSDOC_BATCH_GENERATOR_PROMPT, Str.includes("F.pipe"))).toBe(true);
      expect(F.pipe(JSDOC_BATCH_GENERATOR_PROMPT, Str.includes("A.map"))).toBe(true);
      expect(F.pipe(JSDOC_BATCH_GENERATOR_PROMPT, Str.includes("A.filter"))).toBe(true);
    });

    it("requires exact export name matching", () => {
      expect(F.pipe(JSDOC_BATCH_GENERATOR_PROMPT, Str.includes("EXACT"))).toBe(true);
      expect(F.pipe(JSDOC_BATCH_GENERATOR_PROMPT, Str.includes("case-sensitive"))).toBe(true);
    });

    it("includes required tags", () => {
      expect(F.pipe(JSDOC_BATCH_GENERATOR_PROMPT, Str.includes("@category"))).toBe(true);
      expect(F.pipe(JSDOC_BATCH_GENERATOR_PROMPT, Str.includes("@example"))).toBe(true);
      expect(F.pipe(JSDOC_BATCH_GENERATOR_PROMPT, Str.includes("@since"))).toBe(true);
    });

    it("forbids native array methods", () => {
      expect(F.pipe(JSDOC_BATCH_GENERATOR_PROMPT, Str.includes("never native .map()"))).toBe(true);
    });

    it("specifies output format rules", () => {
      expect(F.pipe(JSDOC_BATCH_GENERATOR_PROMPT, Str.includes("SAME ORDER"))).toBe(true);
      expect(F.pipe(JSDOC_BATCH_GENERATOR_PROMPT, Str.includes("DO NOT"))).toBe(true);
    });

    it("includes import convention", () => {
      expect(F.pipe(JSDOC_BATCH_GENERATOR_PROMPT, Str.includes('import * as A from "effect/Array"'))).toBe(true);
    });

    it("provides example output format", () => {
      expect(F.pipe(JSDOC_BATCH_GENERATOR_PROMPT, Str.includes("exportName1"))).toBe(true);
      expect(F.pipe(JSDOC_BATCH_GENERATOR_PROMPT, Str.includes("exportName2"))).toBe(true);
    });
  });

  describe("prompt consistency", () => {
    it("all prompts mention Effect patterns", () => {
      const prompts = [
        JSDOC_GENERATOR_PROMPT,
        SIMPLE_DOC_FIXER_PROMPT,
        DOC_FIXER_SYSTEM_PROMPT,
        JSDOC_BATCH_GENERATOR_PROMPT,
      ];

      A.forEach(prompts, (prompt) => {
        expect(F.pipe(prompt, Str.includes("Effect"))).toBe(true);
      });
    });

    it("all JSDoc prompts mention required tags", () => {
      const prompts = [
        JSDOC_GENERATOR_PROMPT,
        SIMPLE_DOC_FIXER_PROMPT,
        DOC_FIXER_SYSTEM_PROMPT,
        JSDOC_BATCH_GENERATOR_PROMPT,
      ];

      A.forEach(prompts, (prompt) => {
        expect(F.pipe(prompt, Str.includes("@category"))).toBe(true);
        expect(F.pipe(prompt, Str.includes("@example"))).toBe(true);
        expect(F.pipe(prompt, Str.includes("@since"))).toBe(true);
      });
    });

    it("prompts reference 0.1.0 version", () => {
      const prompts = [
        JSDOC_GENERATOR_PROMPT,
        SIMPLE_DOC_FIXER_PROMPT,
        DOC_FIXER_SYSTEM_PROMPT,
        JSDOC_BATCH_GENERATOR_PROMPT,
      ];

      A.forEach(prompts, (prompt) => {
        expect(F.pipe(prompt, Str.includes("0.1.0"))).toBe(true);
      });
    });
  });
});
