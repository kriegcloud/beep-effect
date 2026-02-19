import { describe, expect, it } from "@effect/vitest";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as Str from "effect/String";
import type { IndexedSymbol, EffectPattern } from "../src/IndexedSymbol.js";
import {
  classifySymbol,
  generateId,
  buildEmbeddingText,
  buildKeywordText,
  validateIndexedSymbol,
  computeContentHash,
} from "../src/IndexedSymbol.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeSymbol = (overrides: Partial<IndexedSymbol> = {}): IndexedSymbol => ({
  id: "@beep/repo-utils/schemas/PackageName",
  name: "PackageName",
  qualifiedName: "@beep/repo-utils/schemas/PackageName",
  filePath: "tooling/repo-utils/src/schemas.ts",
  startLine: 10,
  endLine: 25,
  kind: "schema",
  effectPattern: "Schema.brand",
  package: "@beep/repo-utils",
  module: "schemas",
  category: "schemas",
  domain: null,
  description: "A branded string type representing a valid NPM package name.",
  title: "Package Name",
  schemaIdentifier: "@beep/repo-utils/schemas/PackageName",
  schemaDescription: "Valid NPM package name with scope.",
  remarks: null,
  moduleDescription: null,
  examples: [],
  params: [],
  returns: null,
  errors: [],
  fieldDescriptions: null,
  seeRefs: [],
  provides: [],
  dependsOn: [],
  imports: [],
  signature: "export const PackageName: Schema.brand<string, \"PackageName\">",
  since: "0.0.0",
  deprecated: false,
  exported: true,
  embeddingText: "[schema] Package Name A branded string type representing a valid NPM package name. Valid NPM package name with scope.",
  contentHash: "abc123def456",
  indexedAt: "2026-02-19T00:00:00.000Z",
  ...overrides,
});

// ---------------------------------------------------------------------------
// classifySymbol
// ---------------------------------------------------------------------------

describe("classifySymbol", () => {
  const base = {
    effectPattern: null as EffectPattern | null,
    category: "",
    isTypeAlias: false,
    isInterface: false,
    isPackageDocumentation: false,
  };

  it("classifies TaggedErrorClass as error", () => {
    const result = classifySymbol({ ...base, effectPattern: "Schema.TaggedErrorClass" });
    expect(result).toBe("error");
  });

  it("classifies Command.make as command", () => {
    const result = classifySymbol({ ...base, effectPattern: "Command.make" });
    expect(result).toBe("command");
  });

  it("classifies commands category as command", () => {
    const result = classifySymbol({ ...base, category: "commands" });
    expect(result).toBe("command");
  });

  it("classifies Context.Tag as service", () => {
    const result = classifySymbol({ ...base, effectPattern: "Context.Tag" });
    expect(result).toBe("service");
  });

  it("classifies services category as service", () => {
    const result = classifySymbol({ ...base, category: "services" });
    expect(result).toBe("service");
  });

  it("classifies Layer.effect as layer", () => {
    const result = classifySymbol({ ...base, effectPattern: "Layer.effect" });
    expect(result).toBe("layer");
  });

  it("classifies Layer.succeed as layer", () => {
    const result = classifySymbol({ ...base, effectPattern: "Layer.succeed" });
    expect(result).toBe("layer");
  });

  it("classifies Layer.provide as layer", () => {
    const result = classifySymbol({ ...base, effectPattern: "Layer.provide" });
    expect(result).toBe("layer");
  });

  it("classifies layers category as layer", () => {
    const result = classifySymbol({ ...base, category: "layers" });
    expect(result).toBe("layer");
  });

  it("classifies Schema.Struct as schema", () => {
    const result = classifySymbol({ ...base, effectPattern: "Schema.Struct" });
    expect(result).toBe("schema");
  });

  it("classifies Schema.Class as schema", () => {
    const result = classifySymbol({ ...base, effectPattern: "Schema.Class" });
    expect(result).toBe("schema");
  });

  it("classifies Schema.Union as schema", () => {
    const result = classifySymbol({ ...base, effectPattern: "Schema.Union" });
    expect(result).toBe("schema");
  });

  it("classifies Schema.TaggedStruct as schema", () => {
    const result = classifySymbol({ ...base, effectPattern: "Schema.TaggedStruct" });
    expect(result).toBe("schema");
  });

  it("classifies Schema.brand as schema", () => {
    const result = classifySymbol({ ...base, effectPattern: "Schema.brand" });
    expect(result).toBe("schema");
  });

  it("classifies schemas category as schema", () => {
    const result = classifySymbol({ ...base, category: "schemas" });
    expect(result).toBe("schema");
  });

  it("classifies type alias as type", () => {
    const result = classifySymbol({ ...base, isTypeAlias: true });
    expect(result).toBe("type");
  });

  it("classifies interface as type", () => {
    const result = classifySymbol({ ...base, isInterface: true });
    expect(result).toBe("type");
  });

  it("classifies Effect.fn as function", () => {
    const result = classifySymbol({ ...base, effectPattern: "Effect.fn" });
    expect(result).toBe("function");
  });

  it("classifies Effect.gen as function", () => {
    const result = classifySymbol({ ...base, effectPattern: "Effect.gen" });
    expect(result).toBe("function");
  });

  it("classifies Flag.string as function", () => {
    const result = classifySymbol({ ...base, effectPattern: "Flag.string" });
    expect(result).toBe("function");
  });

  it("classifies Flag.boolean as function", () => {
    const result = classifySymbol({ ...base, effectPattern: "Flag.boolean" });
    expect(result).toBe("function");
  });

  it("classifies Argument.string as function", () => {
    const result = classifySymbol({ ...base, effectPattern: "Argument.string" });
    expect(result).toBe("function");
  });

  it("classifies Argument.number as function", () => {
    const result = classifySymbol({ ...base, effectPattern: "Argument.number" });
    expect(result).toBe("function");
  });

  it("classifies packageDocumentation as module", () => {
    const result = classifySymbol({ ...base, isPackageDocumentation: true });
    expect(result).toBe("module");
  });

  it("defaults to constant when no pattern matches", () => {
    const result = classifySymbol(base);
    expect(result).toBe("constant");
  });

  // Priority tests
  it("prioritizes error over command when both match", () => {
    const result = classifySymbol({ ...base, effectPattern: "Schema.TaggedErrorClass", category: "commands" });
    expect(result).toBe("error");
  });

  it("prioritizes command over service when category is commands", () => {
    const result = classifySymbol({ ...base, effectPattern: "Context.Tag", category: "commands" });
    expect(result).toBe("command");
  });
});

// ---------------------------------------------------------------------------
// generateId
// ---------------------------------------------------------------------------

describe("generateId", () => {
  it("produces the correct format: pkg/module/name", () => {
    const id = generateId("@beep/repo-utils", "schemas", "PackageName");
    expect(id).toBe("@beep/repo-utils/schemas/PackageName");
  });

  it("handles scoped packages correctly", () => {
    const id = generateId("@beep/codebase-search", "extractor", "extractSymbols");
    expect(id).toBe("@beep/codebase-search/extractor/extractSymbols");
  });

  it("handles deeply nested module paths", () => {
    const id = generateId("@beep/repo-utils", "schemas/PackageJson", "PackageName");
    expect(id).toBe("@beep/repo-utils/schemas/PackageJson/PackageName");
  });
});

// ---------------------------------------------------------------------------
// buildEmbeddingText
// ---------------------------------------------------------------------------

describe("buildEmbeddingText", () => {
  it("includes kind prefix", () => {
    const symbol = makeSymbol();
    const text = buildEmbeddingText(symbol);
    expect(text).toContain("[schema]");
  });

  it("includes title when present", () => {
    const symbol = makeSymbol({ title: "Package Name" });
    const text = buildEmbeddingText(symbol);
    expect(text).toContain("Package Name");
  });

  it("includes description", () => {
    const symbol = makeSymbol();
    const text = buildEmbeddingText(symbol);
    expect(text).toContain("A branded string type representing a valid NPM package name.");
  });

  it("includes schema description when present", () => {
    const symbol = makeSymbol({ schemaDescription: "Valid NPM package name with scope." });
    const text = buildEmbeddingText(symbol);
    expect(text).toContain("Valid NPM package name with scope.");
  });

  it("includes remarks when present", () => {
    const symbol = makeSymbol({ remarks: "This is used internally." });
    const text = buildEmbeddingText(symbol);
    expect(text).toContain("This is used internally.");
  });

  it("includes parameter descriptions", () => {
    const symbol = makeSymbol({
      params: [
        { name: "input", description: "The raw package name string" },
      ],
    });
    const text = buildEmbeddingText(symbol);
    expect(text).toContain("Parameter input: The raw package name string");
  });

  it("includes returns description", () => {
    const symbol = makeSymbol({ returns: "A branded PackageName value" });
    const text = buildEmbeddingText(symbol);
    expect(text).toContain("Returns: A branded PackageName value");
  });

  it("includes error descriptions", () => {
    const symbol = makeSymbol({ errors: ["ParseError when the name is invalid"] });
    const text = buildEmbeddingText(symbol);
    expect(text).toContain("Throws: ParseError when the name is invalid");
  });

  it("includes field descriptions when present", () => {
    const symbol = makeSymbol({
      fieldDescriptions: [
        { name: "scope", description: "NPM scope prefix" },
      ],
    });
    const text = buildEmbeddingText(symbol);
    expect(text).toContain("Field scope: NPM scope prefix");
  });

  it("includes see references", () => {
    const symbol = makeSymbol({ seeRefs: ["PackageJson", "PackageVersion"] });
    const text = buildEmbeddingText(symbol);
    expect(text).toContain("See also: PackageJson, PackageVersion");
  });

  it("includes provides and depends", () => {
    const symbol = makeSymbol({
      provides: ["FileSystemService"],
      dependsOn: ["PathService"],
    });
    const text = buildEmbeddingText(symbol);
    expect(text).toContain("Provides: FileSystemService");
    expect(text).toContain("Depends on: PathService");
  });

  it("includes domain when present", () => {
    const symbol = makeSymbol({ domain: "package-management" });
    const text = buildEmbeddingText(symbol);
    expect(text).toContain("Domain: package-management");
  });

  it("truncates to 3000 characters maximum", () => {
    const longDesc = "A".repeat(3500);
    const symbol = makeSymbol({ description: longDesc });
    const text = buildEmbeddingText(symbol);
    expect(Str.length(text)).toBeLessThanOrEqual(3000);
  });

  it("produces text within expected range for a typical symbol", () => {
    const symbol = makeSymbol({
      remarks: "Used throughout the repository for dependency resolution.",
      moduleDescription: "Schema definitions for NPM package metadata.",
      params: [{ name: "raw", description: "Unvalidated package name string" }],
      returns: "A branded PackageName or ParseError",
      seeRefs: ["PackageJson"],
      provides: [],
      dependsOn: [],
      domain: "package-management",
    });
    const text = buildEmbeddingText(symbol);
    const len = Str.length(text);
    expect(len).toBeGreaterThanOrEqual(50);
    expect(len).toBeLessThanOrEqual(3000);
  });
});

// ---------------------------------------------------------------------------
// buildKeywordText
// ---------------------------------------------------------------------------

describe("buildKeywordText", () => {
  it("includes name", () => {
    const symbol = makeSymbol();
    const text = buildKeywordText(symbol);
    expect(text).toContain("PackageName");
  });

  it("includes kind", () => {
    const symbol = makeSymbol();
    const text = buildKeywordText(symbol);
    expect(text).toContain("schema");
  });

  it("includes package", () => {
    const symbol = makeSymbol();
    const text = buildKeywordText(symbol);
    expect(text).toContain("@beep/repo-utils");
  });

  it("includes module", () => {
    const symbol = makeSymbol();
    const text = buildKeywordText(symbol);
    expect(text).toContain("schemas");
  });

  it("includes category", () => {
    const symbol = makeSymbol();
    const text = buildKeywordText(symbol);
    expect(text).toContain("schemas");
  });

  it("includes schema identifier when present", () => {
    const symbol = makeSymbol({ schemaIdentifier: "@beep/repo-utils/schemas/PackageName" });
    const text = buildKeywordText(symbol);
    expect(text).toContain("@beep/repo-utils/schemas/PackageName");
  });

  it("includes signature", () => {
    const symbol = makeSymbol();
    const text = buildKeywordText(symbol);
    expect(text).toContain("export const PackageName");
  });

  it("includes provides identifiers", () => {
    const symbol = makeSymbol({ provides: ["FsUtils"] });
    const text = buildKeywordText(symbol);
    expect(text).toContain("FsUtils");
  });

  it("includes dependsOn identifiers", () => {
    const symbol = makeSymbol({ dependsOn: ["FileSystem"] });
    const text = buildKeywordText(symbol);
    expect(text).toContain("FileSystem");
  });

  it("includes field names", () => {
    const symbol = makeSymbol({
      fieldDescriptions: [
        { name: "scope", description: "NPM scope" },
        { name: "version", description: "Package version" },
      ],
    });
    const text = buildKeywordText(symbol);
    expect(text).toContain("scope");
    expect(text).toContain("version");
  });

  it("includes domain when present", () => {
    const symbol = makeSymbol({ domain: "package-management" });
    const text = buildKeywordText(symbol);
    expect(text).toContain("package-management");
  });
});

// ---------------------------------------------------------------------------
// validateIndexedSymbol
// ---------------------------------------------------------------------------

describe("validateIndexedSymbol", () => {
  it("returns empty array for a valid symbol", () => {
    const symbol = makeSymbol();
    const errors = validateIndexedSymbol(symbol);
    expect(A.length(errors)).toBe(0);
  });

  it("catches empty id", () => {
    const symbol = makeSymbol({ id: "" });
    const errors = validateIndexedSymbol(symbol);
    expect(errors).toContain("id must be non-empty");
  });

  it("catches empty name", () => {
    const symbol = makeSymbol({ name: "" });
    const errors = validateIndexedSymbol(symbol);
    expect(errors).toContain("name must be non-empty");
  });

  it("catches short description", () => {
    const symbol = makeSymbol({ description: "Too short." });
    const errors = validateIndexedSymbol(symbol);
    expect(errors).toContain("description must be at least 20 characters");
  });

  it("catches empty since", () => {
    const symbol = makeSymbol({ since: "" });
    const errors = validateIndexedSymbol(symbol);
    expect(errors).toContain("since must be non-empty");
  });

  it("catches empty category", () => {
    const symbol = makeSymbol({ category: "" });
    const errors = validateIndexedSymbol(symbol);
    expect(errors).toContain("category must be non-empty");
  });

  it("catches embedding text that is too short", () => {
    const symbol = makeSymbol({ embeddingText: "short" });
    const errors = validateIndexedSymbol(symbol);
    const embeddingError = A.findFirst(errors, (e) => Str.includes("embeddingText")(e));
    expect(O.isSome(embeddingError)).toBe(true);
  });

  it("catches empty contentHash", () => {
    const symbol = makeSymbol({ contentHash: "" });
    const errors = validateIndexedSymbol(symbol);
    expect(errors).toContain("contentHash must be non-empty");
  });

  it("returns multiple errors when several fields are invalid", () => {
    const symbol = makeSymbol({ id: "", name: "", since: "" });
    const errors = validateIndexedSymbol(symbol);
    expect(A.length(errors)).toBeGreaterThanOrEqual(3);
  });
});

// ---------------------------------------------------------------------------
// computeContentHash
// ---------------------------------------------------------------------------

describe("computeContentHash", () => {
  it("returns a 64-character hex string (SHA-256)", () => {
    const hash = computeContentHash("hello world");
    expect(Str.length(hash)).toBe(64);
    expect(/^[0-9a-f]{64}$/.test(hash)).toBe(true);
  });

  it("is deterministic for the same input", () => {
    const hash1 = computeContentHash("test content");
    const hash2 = computeContentHash("test content");
    expect(hash1).toBe(hash2);
  });

  it("produces different hashes for different inputs", () => {
    const hash1 = computeContentHash("content A");
    const hash2 = computeContentHash("content B");
    expect(hash1).not.toBe(hash2);
  });

  it("produces the known SHA-256 for 'hello world'", () => {
    const hash = computeContentHash("hello world");
    expect(hash).toBe("b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9");
  });
});
