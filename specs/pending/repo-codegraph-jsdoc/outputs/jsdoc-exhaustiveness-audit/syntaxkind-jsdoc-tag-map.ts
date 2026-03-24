/**
 * @module SyntaxKindJSDocTagMap
 * @description Mapping from TypeScript JSDoc `SyntaxKind` nodes to canonical
 * and synonym JSDoc tag names.
 * @since 0.0.0
 *
 * Mapping of TypeScript JSDoc tag SyntaxKind nodes (328-352)
 * to canonical/synonym JSDoc tag names.
 */

/**
 * Mapping entry for one JSDoc tag-bearing syntax kind.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export interface SyntaxKindJSDocTagMapEntry {
  readonly syntaxKind: number;
  readonly node: string;
  readonly tags: ReadonlyArray<string>;
  readonly note?: string;
}

/**
 * Exhaustive mapping table for TypeScript JSDoc tag syntax kinds.
 *
 * @since 0.0.0
 * @category Configuration
 */
export const SYNTAXKIND_JSDOC_TAG_MAP: ReadonlyArray<SyntaxKindJSDocTagMapEntry> = [
  { syntaxKind: 328, node: "JSDocTag", tags: [], note: "Generic fallback tag node." },
  { syntaxKind: 329, node: "JSDocAugmentsTag", tags: ["augments", "extends"] },
  { syntaxKind: 330, node: "JSDocImplementsTag", tags: ["implements"] },
  { syntaxKind: 331, node: "JSDocAuthorTag", tags: ["author"] },
  { syntaxKind: 332, node: "JSDocDeprecatedTag", tags: ["deprecated"] },
  { syntaxKind: 333, node: "JSDocClassTag", tags: ["class", "constructor"] },
  { syntaxKind: 334, node: "JSDocPublicTag", tags: ["public"] },
  { syntaxKind: 335, node: "JSDocPrivateTag", tags: ["private"] },
  { syntaxKind: 336, node: "JSDocProtectedTag", tags: ["protected"] },
  { syntaxKind: 337, node: "JSDocReadonlyTag", tags: ["readonly"] },
  { syntaxKind: 338, node: "JSDocOverrideTag", tags: ["override"] },
  { syntaxKind: 339, node: "JSDocCallbackTag", tags: ["callback"] },
  { syntaxKind: 340, node: "JSDocOverloadTag", tags: ["overload"] },
  { syntaxKind: 341, node: "JSDocEnumTag", tags: ["enum"] },
  { syntaxKind: 342, node: "JSDocParameterTag", tags: ["param", "arg", "argument"] },
  { syntaxKind: 343, node: "JSDocReturnTag", tags: ["returns", "return"] },
  { syntaxKind: 344, node: "JSDocThisTag", tags: ["this"] },
  { syntaxKind: 345, node: "JSDocTypeTag", tags: ["type"] },
  { syntaxKind: 346, node: "JSDocTemplateTag", tags: ["template"] },
  { syntaxKind: 347, node: "JSDocTypedefTag", tags: ["typedef"] },
  { syntaxKind: 348, node: "JSDocSeeTag", tags: ["see"] },
  { syntaxKind: 349, node: "JSDocPropertyTag", tags: ["property", "prop"] },
  { syntaxKind: 350, node: "JSDocThrowsTag", tags: ["throws", "exception"] },
  { syntaxKind: 351, node: "JSDocSatisfiesTag", tags: ["satisfies"] },
  { syntaxKind: 352, node: "JSDocImportTag", tags: ["import"] }
] as const;
