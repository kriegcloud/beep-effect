/**
 * @module CanonicalTagLists
 * @description Canonical source metadata and tag sets used by the JSDoc
 * exhaustiveness validator baseline.
 * @since 2026-03-01
 */

/**
 * Canonical metadata envelope for one tag source authority.
 *
 * @since 2026-03-01
 * @category DomainModel
 */
export interface CanonicalSourceMetadata {
  readonly name: string;
  readonly url: string;
  readonly retrievedAt: string;
}

/**
 * JSDoc official source metadata.
 *
 * @since 2026-03-01
 * @category Configuration
 */
export const JSDOC3_SOURCE: CanonicalSourceMetadata = {
  name: "JSDoc 3 Official",
  url: "https://jsdoc.app/index.html",
  retrievedAt: "2026-03-01"
} as const;

/**
 * TSDoc standard tag source metadata.
 *
 * @since 2026-03-01
 * @category Configuration
 */
export const TSDOC_SOURCE: CanonicalSourceMetadata = {
  name: "TSDoc Standard Tags",
  url: "https://tsdoc.org/pages/tags/alpha/",
  retrievedAt: "2026-03-01"
} as const;

/**
 * Primary TypeScript JSDoc reference metadata.
 *
 * @since 2026-03-01
 * @category Configuration
 */
export const TYPESCRIPT_JSDOC_SOURCE: CanonicalSourceMetadata = {
  name: "TypeScript JSDoc Reference (Primary)",
  url: "https://raw.githubusercontent.com/microsoft/TypeScript-Website/v2/packages/documentation/copy/en/javascript/JSDoc%20Reference.md",
  retrievedAt: "2026-03-01"
} as const;

/**
 * Supplemental TypeScript release-note sources used to capture tags introduced
 * outside the main reference page.
 *
 * @since 2026-03-01
 * @category Configuration
 */
export const TYPESCRIPT_JSDOC_ADDENDA_SOURCES = [
  {
    name: "TypeScript 5.0 Release Notes",
    url: "https://raw.githubusercontent.com/microsoft/TypeScript-Website/v2/packages/documentation/copy/en/release-notes/TypeScript%205.0.md",
    retrievedAt: "2026-03-01",
    tags: ["overload"]
  }
] as const;

/**
 * Alias normalization table used to map non-canonical spellings to canonical
 * tag names before comparison.
 *
 * @since 2026-03-01
 * @category Utility
 */
export const TYPESCRIPT_ALIAS_NORMALIZATION = {
  arg: "param",
  argument: "param",
  return: "returns"
} as const;

/**
 * Google Closure annotation source metadata.
 *
 * @since 2026-03-01
 * @category Configuration
 */
export const CLOSURE_SOURCE: CanonicalSourceMetadata = {
  name: "Google Closure Compiler Annotations",
  url: "https://raw.githubusercontent.com/wiki/google/closure-compiler/Annotating-JavaScript-for-the-Closure-Compiler.md",
  retrievedAt: "2026-03-01"
} as const;

/**
 * TypeDoc tag source metadata.
 *
 * @since 2026-03-01
 * @category Configuration
 */
export const TYPEDOC_SOURCE: CanonicalSourceMetadata = {
  name: "TypeDoc Tags Reference",
  url: "https://typedoc.org/documents/Tags.html",
  retrievedAt: "2026-03-01"
} as const;

/**
 * Canonical JSDoc 3 tag set.
 *
 * @since 2026-03-01
 * @category Configuration
 */
export const JSDOC3_TAGS = [
  "abstract",
  "access",
  "alias",
  "async",
  "augments",
  "author",
  "borrows",
  "class",
  "classdesc",
  "constant",
  "constructs",
  "copyright",
  "default",
  "deprecated",
  "description",
  "enum",
  "event",
  "example",
  "exports",
  "external",
  "file",
  "fires",
  "function",
  "generator",
  "global",
  "hideconstructor",
  "ignore",
  "implements",
  "inheritdoc",
  "inner",
  "instance",
  "interface",
  "kind",
  "lends",
  "license",
  "listens",
  "member",
  "memberof",
  "mixes",
  "mixin",
  "module",
  "name",
  "namespace",
  "override",
  "package",
  "param",
  "private",
  "property",
  "protected",
  "public",
  "readonly",
  "requires",
  "returns",
  "see",
  "since",
  "static",
  "summary",
  "this",
  "throws",
  "todo",
  "tutorial",
  "type",
  "typedef",
  "variation",
  "version",
  "yields",
  "link"
] as const;

/**
 * Canonical TSDoc standard tag set.
 *
 * @since 2026-03-01
 * @category Configuration
 */
export const TSDOC_STANDARD_TAGS = [
  "alpha",
  "beta",
  "decorator",
  "defaultValue",
  "deprecated",
  "eventProperty",
  "example",
  "experimental",
  "inheritDoc",
  "internal",
  "label",
  "link",
  "override",
  "packageDocumentation",
  "param",
  "privateRemarks",
  "public",
  "readonly",
  "remarks",
  "returns",
  "sealed",
  "see",
  "throws",
  "typeParam",
  "virtual"
] as const;

/**
 * Canonical TypeScript-supported JSDoc tag set.
 *
 * @since 2026-03-01
 * @category Configuration
 */
export const TYPESCRIPT_JSDOC_TAGS = [
  "type",
  "import",
  "param",
  "returns",
  "typedef",
  "callback",
  "template",
  "satisfies",
  "public",
  "private",
  "protected",
  "readonly",
  "override",
  "extends",
  "augments",
  "implements",
  "class",
  "constructor",
  "this",
  "deprecated",
  "see",
  "link",
  "enum",
  "author",
  "overload"
] as const;

/**
 * Canonical Closure annotation set used by the audit baseline.
 *
 * @since 2026-03-01
 * @category Configuration
 */
export const CLOSURE_TAGS = [
  "constructor",
  "enum",
  "extends",
  "implements",
  "interface",
  "lends",
  "param",
  "return",
  "template",
  "this",
  "type",
  "typedef",
  "deprecated",
  "final",
  "package",
  "public",
  "private",
  "protected",
  "const",
  "define",
  "dict",
  "implicitCast",
  "inheritDoc",
  "override",
  "polymer",
  "polymerBehavior",
  "struct",
  "unrestricted",
  "suppress",
  "export",
  "externs",
  "fileoverview",
  "license",
  "noalias",
  "nocompile",
  "nosideeffects",
  "nocollapse",
  "noinline",
  "throws"
] as const;

/**
 * Canonical TypeDoc tag set used by the audit baseline.
 *
 * @since 2026-03-01
 * @category Configuration
 */
export const TYPEDOC_TAGS = [
  "abstract",
  "alpha",
  "author",
  "beta",
  "category",
  "class",
  "defaultValue",
  "deprecated",
  "document",
  "enum",
  "event",
  "eventProperty",
  "example",
  "expand",
  "experimental",
  "function",
  "group",
  "hidden",
  "hideconstructor",
  "ignore",
  "import",
  "inline",
  "interface",
  "internal",
  "license",
  "mergeModuleWith",
  "module",
  "namespace",
  "overload",
  "override",
  "packageDocumentation",
  "param",
  "primaryExport",
  "private",
  "privateRemarks",
  "property",
  "protected",
  "public",
  "readonly",
  "remarks",
  "returns",
  "sealed",
  "see",
  "since",
  "sortStrategy",
  "summary",
  "template",
  "throws",
  "typeParam",
  "useDeclaredType",
  "virtual"
] as const;
