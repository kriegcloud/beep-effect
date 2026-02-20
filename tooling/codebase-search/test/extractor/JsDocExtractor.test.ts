import { describe, expect, it } from "@effect/vitest";
import * as A from "effect/Array";
import { Project } from "ts-morph";

import { DEFAULT_JSDOC_RESULT, extractJsDoc, extractModuleDoc } from "../../src/extractor/JsDocExtractor.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const createProject = (): Project => new Project({ useInMemoryFileSystem: true, compilerOptions: { strict: true } });

/**
 * Creates an in-memory source file and returns the first statement node for
 * JSDoc extraction testing.
 */
const createSourceAndFirstStatement = (source: string) => {
  const project = createProject();
  const sf = project.createSourceFile("test.ts", source);
  const statements = sf.getStatements();
  if (A.isArrayNonEmpty(statements)) {
    return statements[0];
  }
  throw new Error("Source file has no statements");
};

// ---------------------------------------------------------------------------
// extractJsDoc - description
// ---------------------------------------------------------------------------

describe("extractJsDoc", () => {
  describe("description extraction", () => {
    it("extracts the main description from a JSDoc comment", () => {
      const node = createSourceAndFirstStatement(`
/** A branded string type representing a valid package name. */
export const PackageName = "test";
`);
      const result = extractJsDoc(node);
      expect(result.description).toBe("A branded string type representing a valid package name.");
    });

    it("extracts multi-line descriptions correctly", () => {
      const node = createSourceAndFirstStatement(`
/**
 * A branded string type representing a valid package name.
 * It must conform to the NPM naming convention.
 */
export const PackageName = "test";
`);
      const result = extractJsDoc(node);
      expect(result.description).toContain("branded string type");
      expect(result.description).toContain("NPM naming convention");
    });
  });

  // ---------------------------------------------------------------------------
  // @since
  // ---------------------------------------------------------------------------

  describe("@since extraction", () => {
    it("extracts the @since tag value", () => {
      const node = createSourceAndFirstStatement(`
/**
 * Some description text here.
 * @since 1.2.3
 */
export const Foo = "bar";
`);
      const result = extractJsDoc(node);
      expect(result.since).toBe("1.2.3");
    });

    it("defaults to 0.0.0 when @since is missing", () => {
      const node = createSourceAndFirstStatement(`
/** Some description text here. */
export const Foo = "bar";
`);
      const result = extractJsDoc(node);
      expect(result.since).toBe("0.0.0");
    });
  });

  // ---------------------------------------------------------------------------
  // @category
  // ---------------------------------------------------------------------------

  describe("@category extraction", () => {
    it("extracts the @category tag value", () => {
      const node = createSourceAndFirstStatement(`
/**
 * Some description text here.
 * @since 0.0.0
 * @category schemas
 */
export const MySchema = "test";
`);
      const result = extractJsDoc(node);
      expect(result.category).toBe("schemas");
    });

    it("defaults to uncategorized when @category is missing", () => {
      const node = createSourceAndFirstStatement(`
/** Some description text here. */
export const Foo = "bar";
`);
      const result = extractJsDoc(node);
      expect(result.category).toBe("uncategorized");
    });
  });

  // ---------------------------------------------------------------------------
  // @domain
  // ---------------------------------------------------------------------------

  describe("@domain extraction", () => {
    it("extracts the custom @domain tag value", () => {
      const node = createSourceAndFirstStatement(`
/**
 * Some description text here.
 * @domain package-management
 */
export const Foo = "bar";
`);
      const result = extractJsDoc(node);
      expect(result.domain).toBe("package-management");
    });

    it("returns null when @domain is missing", () => {
      const node = createSourceAndFirstStatement(`
/** Some description text here. */
export const Foo = "bar";
`);
      const result = extractJsDoc(node);
      expect(result.domain).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // @remarks
  // ---------------------------------------------------------------------------

  describe("@remarks extraction", () => {
    it("extracts the @remarks tag content", () => {
      const node = createSourceAndFirstStatement(`
/**
 * Some description text here.
 * @remarks This is used internally for dependency resolution.
 */
export const Foo = "bar";
`);
      const result = extractJsDoc(node);
      expect(result.remarks).toBe("This is used internally for dependency resolution.");
    });

    it("returns null when @remarks is missing", () => {
      const node = createSourceAndFirstStatement(`
/** Some description text here. */
export const Foo = "bar";
`);
      const result = extractJsDoc(node);
      expect(result.remarks).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // @example
  // ---------------------------------------------------------------------------

  describe("@example extraction", () => {
    it("extracts a single @example block", () => {
      const node = createSourceAndFirstStatement(`
/**
 * Some description text here.
 * @example
 * const x = doStuff();
 */
export const Foo = "bar";
`);
      const result = extractJsDoc(node);
      expect(A.length(result.examples)).toBe(1);
      expect(result.examples[0]).toContain("doStuff");
    });

    it("extracts multiple @example blocks", () => {
      const node = createSourceAndFirstStatement(`
/**
 * Some description text here.
 * @example
 * const a = first();
 * @example
 * const b = second();
 */
export const Foo = "bar";
`);
      const result = extractJsDoc(node);
      expect(A.length(result.examples)).toBe(2);
    });

    it("returns empty array when no @example is present", () => {
      const node = createSourceAndFirstStatement(`
/** Some description text here. */
export const Foo = "bar";
`);
      const result = extractJsDoc(node);
      expect(A.length(result.examples)).toBe(0);
    });
  });

  // ---------------------------------------------------------------------------
  // @param
  // ---------------------------------------------------------------------------

  describe("@param extraction", () => {
    it("extracts a single @param tag", () => {
      const node = createSourceAndFirstStatement(`
/**
 * Processes the input string value.
 * @param input - The raw package name string
 */
export function process(input: string) { return input; }
`);
      const result = extractJsDoc(node);
      expect(A.length(result.params)).toBe(1);
      expect(result.params[0].name).toBe("input");
      expect(result.params[0].description).toContain("raw package name");
    });

    it("extracts multiple @param tags", () => {
      const node = createSourceAndFirstStatement(`
/**
 * Combines two strings together.
 * @param a - The first string value
 * @param b - The second string value
 */
export function combine(a: string, b: string) { return a + b; }
`);
      const result = extractJsDoc(node);
      expect(A.length(result.params)).toBe(2);
      expect(result.params[0].name).toBe("a");
      expect(result.params[1].name).toBe("b");
    });

    it("returns empty array when no @param is present", () => {
      const node = createSourceAndFirstStatement(`
/** Some description text here. */
export const Foo = "bar";
`);
      const result = extractJsDoc(node);
      expect(A.length(result.params)).toBe(0);
    });
  });

  // ---------------------------------------------------------------------------
  // @returns / @return
  // ---------------------------------------------------------------------------

  describe("@returns extraction", () => {
    it("extracts @returns tag description", () => {
      const node = createSourceAndFirstStatement(`
/**
 * Produces a branded PackageName value.
 * @returns A branded PackageName or ParseError
 */
export function makeName() { return ""; }
`);
      const result = extractJsDoc(node);
      expect(result.returns).toBe("A branded PackageName or ParseError");
    });

    it("extracts @return tag as an alias", () => {
      const node = createSourceAndFirstStatement(`
/**
 * Produces a branded PackageName value.
 * @return A branded PackageName value
 */
export function makeName() { return ""; }
`);
      const result = extractJsDoc(node);
      expect(result.returns).toBe("A branded PackageName value");
    });

    it("returns null when no @returns/@return is present", () => {
      const node = createSourceAndFirstStatement(`
/** Some description text here. */
export const Foo = "bar";
`);
      const result = extractJsDoc(node);
      expect(result.returns).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // @throws / @errors
  // ---------------------------------------------------------------------------

  describe("@throws / @errors extraction", () => {
    it("extracts @throws tag descriptions", () => {
      const node = createSourceAndFirstStatement(`
/**
 * Validates the input string value.
 * @throws ParseError when the name is invalid
 */
export function validate() {}
`);
      const result = extractJsDoc(node);
      expect(A.length(result.errors)).toBe(1);
      expect(result.errors[0]).toContain("ParseError");
    });

    it("extracts @errors tag descriptions", () => {
      const node = createSourceAndFirstStatement(`
/**
 * Validates the input string value.
 * @errors ValidationError when input is empty
 */
export function validate() {}
`);
      const result = extractJsDoc(node);
      expect(A.length(result.errors)).toBe(1);
      expect(result.errors[0]).toContain("ValidationError");
    });

    it("collects errors from both @throws and @errors", () => {
      const node = createSourceAndFirstStatement(`
/**
 * Validates the input string value.
 * @throws ParseError when format is wrong
 * @errors ValidationError when value is empty
 */
export function validate() {}
`);
      const result = extractJsDoc(node);
      expect(A.length(result.errors)).toBe(2);
    });

    it("returns empty array when no error tags are present", () => {
      const node = createSourceAndFirstStatement(`
/** Some description text here. */
export const Foo = "bar";
`);
      const result = extractJsDoc(node);
      expect(A.length(result.errors)).toBe(0);
    });
  });

  // ---------------------------------------------------------------------------
  // @see
  // ---------------------------------------------------------------------------

  describe("@see extraction", () => {
    it("extracts @see references into seeRefs array", () => {
      const node = createSourceAndFirstStatement(`
/**
 * Some description text here.
 * @see PackageJson
 * @see PackageVersion
 */
export const Foo = "bar";
`);
      const result = extractJsDoc(node);
      expect(A.length(result.seeRefs)).toBe(2);
      expect(result.seeRefs[0]).toContain("PackageJson");
      expect(result.seeRefs[1]).toContain("PackageVersion");
    });

    it("returns empty array when no @see is present", () => {
      const node = createSourceAndFirstStatement(`
/** Some description text here. */
export const Foo = "bar";
`);
      const result = extractJsDoc(node);
      expect(A.length(result.seeRefs)).toBe(0);
    });
  });

  // ---------------------------------------------------------------------------
  // @provides
  // ---------------------------------------------------------------------------

  describe("@provides extraction", () => {
    it("extracts custom @provides tags", () => {
      const node = createSourceAndFirstStatement(`
/**
 * Layer that provides file system access.
 * @provides FileSystemService
 * @provides PathService
 */
export const FsLayer = "layer";
`);
      const result = extractJsDoc(node);
      expect(A.length(result.provides)).toBe(2);
      expect(result.provides[0]).toBe("FileSystemService");
      expect(result.provides[1]).toBe("PathService");
    });

    it("returns empty array when no @provides is present", () => {
      const node = createSourceAndFirstStatement(`
/** Some description text here. */
export const Foo = "bar";
`);
      const result = extractJsDoc(node);
      expect(A.length(result.provides)).toBe(0);
    });
  });

  // ---------------------------------------------------------------------------
  // @depends
  // ---------------------------------------------------------------------------

  describe("@depends extraction", () => {
    it("extracts custom @depends tags into dependsOn", () => {
      const node = createSourceAndFirstStatement(`
/**
 * Layer that depends on other services.
 * @depends ConfigService
 * @depends LoggerService
 */
export const AppLayer = "layer";
`);
      const result = extractJsDoc(node);
      expect(A.length(result.dependsOn)).toBe(2);
      expect(result.dependsOn[0]).toBe("ConfigService");
      expect(result.dependsOn[1]).toBe("LoggerService");
    });

    it("returns empty array when no @depends is present", () => {
      const node = createSourceAndFirstStatement(`
/** Some description text here. */
export const Foo = "bar";
`);
      const result = extractJsDoc(node);
      expect(A.length(result.dependsOn)).toBe(0);
    });
  });

  // ---------------------------------------------------------------------------
  // @deprecated
  // ---------------------------------------------------------------------------

  describe("@deprecated extraction", () => {
    it("sets deprecated to true when @deprecated tag is present", () => {
      const node = createSourceAndFirstStatement(`
/**
 * Some description text here.
 * @deprecated Use NewThing instead
 */
export const OldThing = "old";
`);
      const result = extractJsDoc(node);
      expect(result.deprecated).toBe(true);
    });

    it("sets deprecated to false when @deprecated is missing", () => {
      const node = createSourceAndFirstStatement(`
/** Some description text here. */
export const Foo = "bar";
`);
      const result = extractJsDoc(node);
      expect(result.deprecated).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // @packageDocumentation / @module
  // ---------------------------------------------------------------------------

  describe("@packageDocumentation / @module extraction", () => {
    it("sets isPackageDocumentation for @packageDocumentation tag", () => {
      const node = createSourceAndFirstStatement(`
/**
 * Core schema definitions for the package system.
 * @since 0.0.0
 * @packageDocumentation
 */
export const VERSION = "0.0.0";
`);
      const result = extractJsDoc(node);
      expect(result.isPackageDocumentation).toBe(true);
    });

    it("sets isPackageDocumentation for @module tag", () => {
      const node = createSourceAndFirstStatement(`
/**
 * Core schema definitions for the package system.
 * @since 0.0.0
 * @module
 */
export const VERSION = "0.0.0";
`);
      const result = extractJsDoc(node);
      expect(result.isPackageDocumentation).toBe(true);
    });

    it("sets moduleDescription when isPackageDocumentation is true", () => {
      const node = createSourceAndFirstStatement(`
/**
 * Core schema definitions for the package system.
 * @since 0.0.0
 * @packageDocumentation
 */
export const VERSION = "0.0.0";
`);
      const result = extractJsDoc(node);
      expect(result.moduleDescription).toBe("Core schema definitions for the package system.");
    });

    it("sets moduleDescription to null when not a package doc", () => {
      const node = createSourceAndFirstStatement(`
/**
 * Some description text here.
 * @since 0.0.0
 */
export const Foo = "bar";
`);
      const result = extractJsDoc(node);
      expect(result.moduleDescription).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // Missing JSDoc
  // ---------------------------------------------------------------------------

  describe("missing JSDoc", () => {
    it("returns sensible defaults when no JSDoc comment exists", () => {
      const node = createSourceAndFirstStatement(`
export const Foo = "bar";
`);
      const result = extractJsDoc(node);
      expect(result.description).toBe("");
      expect(result.since).toBe("0.0.0");
      expect(result.category).toBe("uncategorized");
      expect(result.domain).toBeNull();
      expect(result.remarks).toBeNull();
      expect(A.length(result.examples)).toBe(0);
      expect(A.length(result.params)).toBe(0);
      expect(result.returns).toBeNull();
      expect(A.length(result.errors)).toBe(0);
      expect(A.length(result.seeRefs)).toBe(0);
      expect(A.length(result.provides)).toBe(0);
      expect(A.length(result.dependsOn)).toBe(0);
      expect(result.deprecated).toBe(false);
      expect(result.isPackageDocumentation).toBe(false);
      expect(result.moduleDescription).toBeNull();
    });

    it("returns DEFAULT_JSDOC_RESULT for nodes without JSDoc", () => {
      const node = createSourceAndFirstStatement(`
export const Foo = "bar";
`);
      const result = extractJsDoc(node);
      expect(result).toStrictEqual(DEFAULT_JSDOC_RESULT);
    });
  });

  // ---------------------------------------------------------------------------
  // Comprehensive JSDoc
  // ---------------------------------------------------------------------------

  describe("comprehensive JSDoc extraction", () => {
    it("extracts all tags from a fully documented symbol", () => {
      const node = createSourceAndFirstStatement(`
/**
 * Validates and brands a raw package name string.
 * @since 1.0.0
 * @category schemas
 * @domain package-management
 * @remarks Used throughout the repository for dependency resolution.
 * @example
 * const name = makeName("@beep/utils");
 * @param raw - The unvalidated package name string
 * @returns A branded PackageName or ParseError
 * @throws ParseError when the name format is invalid
 * @see PackageJson
 * @see PackageVersion
 * @provides NameService
 * @depends ConfigService
 * @deprecated Use makePackageName instead
 */
export function makeName(raw: string) { return raw; }
`);
      const result = extractJsDoc(node);

      expect(result.description).toBe("Validates and brands a raw package name string.");
      expect(result.since).toBe("1.0.0");
      expect(result.category).toBe("schemas");
      expect(result.domain).toBe("package-management");
      expect(result.remarks).toBe("Used throughout the repository for dependency resolution.");
      expect(A.length(result.examples)).toBe(1);
      expect(A.length(result.params)).toBe(1);
      expect(result.params[0].name).toBe("raw");
      expect(result.returns).toBe("A branded PackageName or ParseError");
      expect(A.length(result.errors)).toBe(1);
      expect(A.length(result.seeRefs)).toBe(2);
      expect(A.length(result.provides)).toBe(1);
      expect(result.provides[0]).toBe("NameService");
      expect(A.length(result.dependsOn)).toBe(1);
      expect(result.dependsOn[0]).toBe("ConfigService");
      expect(result.deprecated).toBe(true);
      expect(result.isPackageDocumentation).toBe(false);
      expect(result.moduleDescription).toBeNull();
    });
  });
});

// ---------------------------------------------------------------------------
// extractModuleDoc
// ---------------------------------------------------------------------------

describe("extractModuleDoc", () => {
  it("extracts module-level JSDoc with @packageDocumentation", () => {
    const project = createProject();
    const sf = project.createSourceFile(
      "module.ts",
      `
/**
 * Core schema definitions for the package system.
 * @since 0.0.0
 * @packageDocumentation
 */
export const VERSION = "0.0.0";
`
    );
    const result = extractModuleDoc(sf);
    expect(result).not.toBeNull();
    expect(result!.isPackageDocumentation).toBe(true);
    expect(result!.description).toBe("Core schema definitions for the package system.");
    expect(result!.moduleDescription).toBe("Core schema definitions for the package system.");
  });

  it("extracts module-level JSDoc with @module tag", () => {
    const project = createProject();
    const sf = project.createSourceFile(
      "module2.ts",
      `
/**
 * Utility functions for string manipulation.
 * @since 0.0.0
 * @module
 */
export const UTIL_VERSION = "0.0.0";
`
    );
    const result = extractModuleDoc(sf);
    expect(result).not.toBeNull();
    expect(result!.isPackageDocumentation).toBe(true);
    expect(result!.description).toBe("Utility functions for string manipulation.");
  });

  it("returns null when no module-level JSDoc exists", () => {
    const project = createProject();
    const sf = project.createSourceFile(
      "no-module-doc.ts",
      `
/** Just a regular constant. */
export const Foo = "bar";
`
    );
    const result = extractModuleDoc(sf);
    expect(result).toBeNull();
  });

  it("returns null for an empty source file", () => {
    const project = createProject();
    const sf = project.createSourceFile("empty.ts", "");
    const result = extractModuleDoc(sf);
    expect(result).toBeNull();
  });

  it("ignores non-module JSDoc on first statement", () => {
    const project = createProject();
    const sf = project.createSourceFile(
      "no-pkg-doc.ts",
      `
/**
 * This is just a regular function description.
 * @since 0.0.0
 * @category functions
 */
export function doStuff() { return 42; }
`
    );
    const result = extractModuleDoc(sf);
    expect(result).toBeNull();
  });

  it("extracts module doc from source files with multiple exports", () => {
    const project = createProject();
    const sf = project.createSourceFile(
      "multi-export.ts",
      `
/**
 * Schema definitions and validation utilities.
 * @since 0.0.0
 * @packageDocumentation
 */

/** @since 0.0.0 */
export const A_CONST = "a";

/** @since 0.0.0 */
export const B_CONST = "b";
`
    );
    const result = extractModuleDoc(sf);
    expect(result).not.toBeNull();
    expect(result!.isPackageDocumentation).toBe(true);
    expect(result!.description).toContain("Schema definitions");
  });
});

// ---------------------------------------------------------------------------
// DEFAULT_JSDOC_RESULT
// ---------------------------------------------------------------------------

describe("DEFAULT_JSDOC_RESULT", () => {
  it("has the expected default field values", () => {
    expect(DEFAULT_JSDOC_RESULT.description).toBe("");
    expect(DEFAULT_JSDOC_RESULT.since).toBe("0.0.0");
    expect(DEFAULT_JSDOC_RESULT.category).toBe("uncategorized");
    expect(DEFAULT_JSDOC_RESULT.domain).toBeNull();
    expect(DEFAULT_JSDOC_RESULT.remarks).toBeNull();
    expect(A.length(DEFAULT_JSDOC_RESULT.examples)).toBe(0);
    expect(A.length(DEFAULT_JSDOC_RESULT.params)).toBe(0);
    expect(DEFAULT_JSDOC_RESULT.returns).toBeNull();
    expect(A.length(DEFAULT_JSDOC_RESULT.errors)).toBe(0);
    expect(A.length(DEFAULT_JSDOC_RESULT.seeRefs)).toBe(0);
    expect(A.length(DEFAULT_JSDOC_RESULT.provides)).toBe(0);
    expect(A.length(DEFAULT_JSDOC_RESULT.dependsOn)).toBe(0);
    expect(DEFAULT_JSDOC_RESULT.deprecated).toBe(false);
    expect(DEFAULT_JSDOC_RESULT.isPackageDocumentation).toBe(false);
    expect(DEFAULT_JSDOC_RESULT.moduleDescription).toBeNull();
  });
});
