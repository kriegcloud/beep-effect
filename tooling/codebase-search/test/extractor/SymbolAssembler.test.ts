import {
  assembleSymbols,
  extractSignature,
  resolveImports,
  resolveModuleName,
} from "@beep/codebase-search/extractor/SymbolAssembler";
import type { IndexedSymbol } from "@beep/codebase-search/IndexedSymbol";
import { describe, expect, it } from "@effect/vitest";
import * as A from "effect/Array";
import { pipe } from "effect/Function";
import * as MutableHashMap from "effect/MutableHashMap";
import * as O from "effect/Option";
import * as Str from "effect/String";
import { Project } from "ts-morph";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const createProject = (): Project => new Project({ useInMemoryFileSystem: true, compilerOptions: { strict: true } });

/** Creates a source file in an in-memory project and assembles symbols from it. */
const assembleFromSource = (
  code: string,
  pkg = "@beep/test-pkg",
  moduleName = "test-module",
  fileName = "test.ts"
): ReadonlyArray<IndexedSymbol> => {
  const project = createProject();
  const sf = project.createSourceFile(fileName, code);
  return assembleSymbols(sf, pkg, moduleName);
};

/** Finds a symbol by name in an array of IndexedSymbols. */
const findByName = (symbols: ReadonlyArray<IndexedSymbol>, name: string): O.Option<IndexedSymbol> =>
  A.findFirst(symbols, (s) => s.name === name);

// ---------------------------------------------------------------------------
// assembleSymbols - simple exported const with JSDoc
// ---------------------------------------------------------------------------

describe("assembleSymbols", () => {
  describe("simple exported const with JSDoc", () => {
    it("produces a valid IndexedSymbol", () => {
      const symbols = assembleFromSource(`
/**
 * The current version of the package.
 * @since 1.0.0
 * @category constants
 */
export const VERSION = "1.0.0" as const;
`);

      const versionOpt = findByName(symbols, "VERSION");
      expect(O.isSome(versionOpt)).toBe(true);

      if (O.isSome(versionOpt)) {
        const sym = versionOpt.value;
        expect(sym.kind).toBe("constant");
        expect(sym.name).toBe("VERSION");
        expect(sym.package).toBe("@beep/test-pkg");
        expect(sym.module).toBe("test-module");
        expect(sym.since).toBe("1.0.0");
        expect(sym.category).toBe("constants");
        expect(sym.description).toBe("The current version of the package.");
        expect(sym.exported).toBe(true);
        expect(Str.length(sym.contentHash)).toBe(64);
        expect(Str.length(sym.embeddingText)).toBeGreaterThan(30);
        expect(Str.length(sym.indexedAt)).toBeGreaterThan(0);
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Schema.Struct with .annotate()
  // ---------------------------------------------------------------------------

  describe("Schema.Struct with annotations", () => {
    it("assembles as schema kind with annotations extracted", () => {
      const symbols = assembleFromSource(`
import * as S from "effect/Schema";

/**
 * A schema for user profile data with name and email fields.
 * @since 0.0.0
 * @category schemas
 */
export const UserProfile = S.Struct({
  name: S.String,
  email: S.String,
}).annotate({
  identifier: "@beep/test-pkg/test-module/UserProfile",
  title: "User Profile",
  description: "Schema for user profile data containing name and email.",
});
`);

      const profileOpt = findByName(symbols, "UserProfile");
      expect(O.isSome(profileOpt)).toBe(true);

      if (O.isSome(profileOpt)) {
        const sym = profileOpt.value;
        expect(sym.kind).toBe("schema");
        expect(sym.effectPattern).toBe("Schema.Struct");
        expect(sym.schemaIdentifier).toBe("@beep/test-pkg/test-module/UserProfile");
        expect(sym.title).toBe("User Profile");
        expect(sym.schemaDescription).toBe("Schema for user profile data containing name and email.");
      }
    });
  });

  // ---------------------------------------------------------------------------
  // TaggedErrorClass
  // ---------------------------------------------------------------------------

  describe("TaggedErrorClass", () => {
    it("assembles as error kind", () => {
      const symbols = assembleFromSource(`
import * as S from "effect/Schema";

/**
 * Indicates a validation failure when processing user input data.
 * @since 0.0.0
 * @category errors
 */
export class ValidationError extends S.TaggedErrorClass<ValidationError>(
  "@beep/test-pkg/test-module/ValidationError"
)("ValidationError", {
  message: S.String,
  field: S.String,
}, {
  title: "Validation Error",
  description: "A validation failure during user input processing.",
}) {}
`);

      const errorOpt = findByName(symbols, "ValidationError");
      expect(O.isSome(errorOpt)).toBe(true);

      if (O.isSome(errorOpt)) {
        const sym = errorOpt.value;
        expect(sym.kind).toBe("error");
        expect(sym.effectPattern).toBe("Schema.TaggedErrorClass");
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Effect.fn function
  // ---------------------------------------------------------------------------

  describe("Effect.fn function", () => {
    it("assembles as function kind", () => {
      const symbols = assembleFromSource(`
/**
 * Processes the input string and returns a transformed result.
 * @since 0.0.0
 * @category functions
 * @param input - The raw input string to process
 * @returns The processed string output
 */
export const processInput = Effect.fn(function* (input: string) {
  return input.toUpperCase();
});
`);

      const fnOpt = findByName(symbols, "processInput");
      expect(O.isSome(fnOpt)).toBe(true);

      if (O.isSome(fnOpt)) {
        const sym = fnOpt.value;
        expect(sym.kind).toBe("function");
        expect(sym.effectPattern).toBe("Effect.fn");
        expect(A.length(sym.params)).toBe(1);
        expect(sym.params[0].name).toBe("input");
        expect(sym.returns).toBe("The processed string output");
      }
    });
  });

  // ---------------------------------------------------------------------------
  // @packageDocumentation module symbol
  // ---------------------------------------------------------------------------

  describe("module with @packageDocumentation", () => {
    it("creates a module kind symbol for the file", () => {
      const symbols = assembleFromSource(`
/**
 * Core utility functions for string manipulation and validation.
 * @since 0.0.0
 * @packageDocumentation
 */

/**
 * The current version of the string utilities module.
 * @since 0.0.0
 * @category constants
 */
export const VERSION = "0.0.0";
`);

      const moduleOpt = findByName(symbols, "_module");
      expect(O.isSome(moduleOpt)).toBe(true);

      if (O.isSome(moduleOpt)) {
        const sym = moduleOpt.value;
        expect(sym.kind).toBe("module");
        expect(sym.description).toBe("Core utility functions for string manipulation and validation.");
        expect(sym.moduleDescription).toBe("Core utility functions for string manipulation and validation.");
      }
    });

    it("passes moduleDescription to child symbols", () => {
      const symbols = assembleFromSource(`
/**
 * Core utility functions for string manipulation and validation.
 * @since 0.0.0
 * @packageDocumentation
 */

/**
 * The current version of the string utilities module.
 * @since 0.0.0
 * @category constants
 */
export const VERSION = "0.0.0";
`);

      const versionOpt = findByName(symbols, "VERSION");
      expect(O.isSome(versionOpt)).toBe(true);

      if (O.isSome(versionOpt)) {
        expect(versionOpt.value.moduleDescription).toBe(
          "Core utility functions for string manipulation and validation."
        );
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Exports without JSDoc
  // ---------------------------------------------------------------------------

  describe("exports without JSDoc", () => {
    it("applies sensible defaults for missing JSDoc", () => {
      const symbols = assembleFromSource(`
export const FOO = "bar";
`);

      const fooOpt = findByName(symbols, "FOO");
      expect(O.isSome(fooOpt)).toBe(true);

      if (O.isSome(fooOpt)) {
        const sym = fooOpt.value;
        expect(sym.description).toBe("");
        expect(sym.since).toBe("0.0.0");
        expect(sym.category).toBe("uncategorized");
        expect(sym.kind).toBe("constant");
        expect(sym.exported).toBe(true);
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Type alias
  // ---------------------------------------------------------------------------

  describe("type alias", () => {
    it("assembles as type kind", () => {
      const symbols = assembleFromSource(`
/**
 * A mapping from string keys to numeric values used for config.
 * @since 0.0.0
 * @category types
 */
export type ConfigMap = { readonly [key: string]: number };
`);

      const typeOpt = findByName(symbols, "ConfigMap");
      expect(O.isSome(typeOpt)).toBe(true);

      if (O.isSome(typeOpt)) {
        expect(typeOpt.value.kind).toBe("type");
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Interface
  // ---------------------------------------------------------------------------

  describe("interface", () => {
    it("assembles as type kind", () => {
      const symbols = assembleFromSource(`
/**
 * Defines the contract for a data processing pipeline step.
 * @since 0.0.0
 * @category types
 */
export interface PipelineStep {
  readonly name: string;
  readonly execute: () => void;
}
`);

      const ifaceOpt = findByName(symbols, "PipelineStep");
      expect(O.isSome(ifaceOpt)).toBe(true);

      if (O.isSome(ifaceOpt)) {
        expect(ifaceOpt.value.kind).toBe("type");
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Non-exported symbols are skipped
  // ---------------------------------------------------------------------------

  describe("non-exported symbols", () => {
    it("skips non-exported declarations", () => {
      const symbols = assembleFromSource(`
/**
 * A private helper that should not be indexed.
 * @since 0.0.0
 * @category internal
 */
const internalHelper = "hidden";

/**
 * A public constant that should be indexed correctly.
 * @since 0.0.0
 * @category constants
 */
export const PUBLIC = "visible";
`);

      const internalOpt = findByName(symbols, "internalHelper");
      expect(O.isNone(internalOpt)).toBe(true);

      const publicOpt = findByName(symbols, "PUBLIC");
      expect(O.isSome(publicOpt)).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // Multiple exports
  // ---------------------------------------------------------------------------

  describe("multiple exports", () => {
    it("assembles all exported symbols from a file", () => {
      const symbols = assembleFromSource(`
/**
 * The primary configuration schema for app settings.
 * @since 0.0.0
 * @category schemas
 */
export const Config = "schema";

/**
 * A type alias representing a valid configuration key.
 * @since 0.0.0
 * @category types
 */
export type ConfigKey = string;

/**
 * The default timeout value in milliseconds for requests.
 * @since 0.0.0
 * @category constants
 */
export const TIMEOUT = 5000;
`);

      // Filter out module symbols
      const nonModuleSymbols = A.filter(symbols, (s) => s.kind !== "module");
      expect(A.length(nonModuleSymbols)).toBe(3);
    });
  });

  // ---------------------------------------------------------------------------
  // ID generation
  // ---------------------------------------------------------------------------

  describe("ID generation", () => {
    it("generates correct IDs in pkg/module/name format", () => {
      const symbols = assembleFromSource(
        `
/**
 * A constant exported for identification testing purposes.
 * @since 0.0.0
 * @category constants
 */
export const MyConst = "test";
`,
        "@beep/my-pkg",
        "utils/helpers"
      );

      const constOpt = findByName(symbols, "MyConst");
      expect(O.isSome(constOpt)).toBe(true);

      if (O.isSome(constOpt)) {
        expect(constOpt.value.id).toBe("@beep/my-pkg/utils/helpers/MyConst");
        expect(constOpt.value.qualifiedName).toBe("@beep/my-pkg/utils/helpers/MyConst");
      }
    });
  });
});

// ---------------------------------------------------------------------------
// resolveImports (two-pass)
// ---------------------------------------------------------------------------

describe("resolveImports", () => {
  it("populates imports field for symbols that reference other indexed symbols", () => {
    const project = createProject();

    // File A: exports a symbol
    const fileA = project.createSourceFile(
      "/project/src/fileA.ts",
      `
/**
 * A utility function for formatting strings with padding.
 * @since 0.0.0
 * @category functions
 */
export const formatString = (s: string) => s.trim();
`
    );

    // File B: imports from File A
    const fileB = project.createSourceFile(
      "/project/src/fileB.ts",
      `
import { formatString } from "./fileA.js";

/**
 * Processes user names by formatting and validating them.
 * @since 0.0.0
 * @category functions
 */
export const processName = (name: string) => formatString(name);
`
    );

    const symbolsA = assembleSymbols(fileA, "@beep/test", "fileA");
    const symbolsB = assembleSymbols(fileB, "@beep/test", "fileB");
    const allSymbols = A.appendAll(symbolsA, symbolsB);
    const sourceFiles = [fileA, fileB];

    const fileToSymbolIds = MutableHashMap.empty<string, ReadonlyArray<string>>();

    const resolved = resolveImports(allSymbols, sourceFiles, fileToSymbolIds);

    const processNameOpt = A.findFirst(resolved, (s) => s.name === "processName");
    expect(O.isSome(processNameOpt)).toBe(true);

    if (O.isSome(processNameOpt)) {
      const sym = processNameOpt.value;
      expect(A.length(sym.imports)).toBeGreaterThan(0);
      expect(sym.imports).toContain("@beep/test/fileA/formatString");
    }
  });

  it("resolves aliased named imports using exported symbol names", () => {
    const project = createProject();

    const fileA = project.createSourceFile(
      "/project/src/fileA.ts",
      `
/**
 * Formats a string in a deterministic way for downstream processing.
 * @since 0.0.0
 * @category functions
 */
export const formatString = (s: string) => s.trim();
`
    );

    const fileB = project.createSourceFile(
      "/project/src/fileB.ts",
      `
import { formatString as fmt } from "./fileA.js";

/**
 * Uses aliased imports while still depending on fileA.formatString.
 * @since 0.0.0
 * @category functions
 */
export const processName = (name: string) => fmt(name);
`
    );

    const symbolsA = assembleSymbols(fileA, "@beep/test", "fileA");
    const symbolsB = assembleSymbols(fileB, "@beep/test", "fileB");
    const resolved = resolveImports(
      A.appendAll(symbolsA, symbolsB),
      [fileA, fileB],
      MutableHashMap.empty<string, ReadonlyArray<string>>()
    );

    const processNameOpt = A.findFirst(resolved, (s) => s.name === "processName");
    expect(O.isSome(processNameOpt)).toBe(true);

    if (O.isSome(processNameOpt)) {
      expect(processNameOpt.value.imports).toContain("@beep/test/fileA/formatString");
    }
  });

  it("fallback resolution handles multiple named imports from the same file", () => {
    const project = createProject();

    const fileA = project.createSourceFile(
      "/project/src/fileA.ts",
      `
/**
 * First exported dependency.
 * @since 0.0.0
 * @category constants
 */
export const Alpha = "alpha";

/**
 * Second exported dependency.
 * @since 0.0.0
 * @category constants
 */
export const Beta = "beta";
`
    );

    const fileB = project.createSourceFile(
      "/project/src/fileB.ts",
      `
import { Alpha, Beta } from "./fileA.js";

/**
 * Uses both Alpha and Beta from fileA.
 * @since 0.0.0
 * @category functions
 */
export const useBoth = () => \`\${Alpha}-\${Beta}\`;
`
    );

    const symbolsA = assembleSymbols(fileA, "@beep/test", "fileA");
    const symbolsB = assembleSymbols(fileB, "@beep/test", "fileB");
    const symbolsWithMismatchedFilePath = pipe(
      symbolsA,
      A.map((symbol) => ({ ...symbol, filePath: "/virtual/fileA.ts" }))
    );
    const allSymbols = A.appendAll(symbolsWithMismatchedFilePath, symbolsB);
    const fileToSymbolIds = MutableHashMap.empty<string, ReadonlyArray<string>>();
    MutableHashMap.set(
      fileToSymbolIds,
      fileA.getFilePath(),
      pipe(
        symbolsA,
        A.map((symbol) => symbol.id)
      )
    );

    const resolved = resolveImports(allSymbols, [fileA, fileB], fileToSymbolIds);

    const useBothOpt = A.findFirst(resolved, (s) => s.name === "useBoth");
    expect(O.isSome(useBothOpt)).toBe(true);

    if (O.isSome(useBothOpt)) {
      expect(useBothOpt.value.imports).toContain("@beep/test/fileA/Alpha");
      expect(useBothOpt.value.imports).toContain("@beep/test/fileA/Beta");
    }
  });
});

// ---------------------------------------------------------------------------
// resolveModuleName
// ---------------------------------------------------------------------------

describe("resolveModuleName", () => {
  it("extracts module name from a typical file path", () => {
    const result = resolveModuleName("tooling/cli/src/commands/codegen.ts");
    expect(result).toBe("commands/codegen");
  });

  it("extracts module name from an index file", () => {
    const result = resolveModuleName("tooling/repo-utils/src/index.ts");
    expect(result).toBe("index");
  });

  it("extracts module name from a nested path", () => {
    const result = resolveModuleName("packages/core/src/schemas/PackageJson.ts");
    expect(result).toBe("schemas/PackageJson");
  });

  it("handles paths without src directory", () => {
    const result = resolveModuleName("standalone/module.ts");
    expect(result).toBe("module");
  });
});

// ---------------------------------------------------------------------------
// extractSignature
// ---------------------------------------------------------------------------

describe("extractSignature", () => {
  it("returns trimmed text for short declarations", () => {
    const project = createProject();
    const sf = project.createSourceFile("sig-test.ts", `export const VERSION = "1.0.0";`);
    const stmt = sf.getStatements()[0];
    const sig = extractSignature(stmt);
    expect(sig).toBe(`export const VERSION = "1.0.0";`);
  });

  it("returns first line for long declarations", () => {
    const project = createProject();
    const longBody = A.join("\n")(A.replicate("  readonly field: string;", 100));
    const sf = project.createSourceFile("sig-long.ts", `export interface BigInterface {\n${longBody}\n}`);
    const stmt = sf.getStatements()[0];
    const sig = extractSignature(stmt);
    expect(sig).toBe("export interface BigInterface {");
  });
});
