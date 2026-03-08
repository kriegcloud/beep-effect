import { Chunk, Option, Data, Differ } from "effect";
import { dual } from "effect/Function";
import {
  Pattern,
  POSPatternElement,
  EntityPatternElement,
  LiteralPatternElement,
  type MarkRange,
  type WinkPOSTag,
  type WinkEntityType,
  type POSPatternOption,
  type EntityPatternOption,
} from "./Pattern.js";

// ============================================================================
// PRIMITIVE ELEMENT BUILDERS (Data-First & Data-Last Dual APIs)
// ============================================================================

/**
 * Create a POS pattern element from POS tags (data-first)
 */
export const pos: {
  (...tags: ReadonlyArray<WinkPOSTag | "">): Pattern.POS.Type;
  (tags: ReadonlyArray<WinkPOSTag | "">): Pattern.POS.Type;
} = (
  ...args: ReadonlyArray<WinkPOSTag | ""> | [ReadonlyArray<WinkPOSTag | "">]
): Pattern.POS.Type => {
  const tags = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
  return POSPatternElement.make({
    value: Data.array(tags) as POSPatternOption,
  });
};

/**
 * Create an entity pattern element from entity types (data-first)
 */
export const entity: {
  (...types: ReadonlyArray<WinkEntityType | "">): Pattern.Entity.Type;
  (types: ReadonlyArray<WinkEntityType | "">): Pattern.Entity.Type;
} = (
  ...args:
    | ReadonlyArray<WinkEntityType | "">
    | [ReadonlyArray<WinkEntityType | "">]
): Pattern.Entity.Type => {
  const types = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
  return EntityPatternElement.make({
    value: Data.array(types) as EntityPatternOption,
  });
};

/**
 * Create a literal pattern element from literal strings (data-first)
 */
export const literal: {
  (...values: ReadonlyArray<string>): Pattern.Literal.Type;
  (values: ReadonlyArray<string>): Pattern.Literal.Type;
} = (
  ...args: ReadonlyArray<string> | [ReadonlyArray<string>]
): Pattern.Literal.Type => {
  const values = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
  const validValues = values.filter(
    (v): v is string => typeof v === "string" && v.length > 0
  );
  const finalValues = validValues.length > 0 ? validValues : [""];
  return LiteralPatternElement.make({
    value: Data.array(finalValues) as any,
  });
};

/**
 * Create an optional POS pattern element (includes empty string option) (data-first)
 */
export const optionalPos: {
  (...tags: ReadonlyArray<WinkPOSTag>): Pattern.POS.Type;
  (tags: ReadonlyArray<WinkPOSTag>): Pattern.POS.Type;
} = (
  ...args: ReadonlyArray<WinkPOSTag> | [ReadonlyArray<WinkPOSTag>]
): Pattern.POS.Type => {
  const tags = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
  const allTags = ["", ...tags] as ReadonlyArray<WinkPOSTag | "">;
  return POSPatternElement.make({
    value: Data.array(allTags) as POSPatternOption,
  });
};

/**
 * Create an optional entity pattern element (includes empty string option) (data-first)
 */
export const optionalEntity: {
  (...types: ReadonlyArray<WinkEntityType>): Pattern.Entity.Type;
  (types: ReadonlyArray<WinkEntityType>): Pattern.Entity.Type;
} = (
  ...args: ReadonlyArray<WinkEntityType> | [ReadonlyArray<WinkEntityType>]
): Pattern.Entity.Type => {
  const types = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
  const allTypes = ["", ...types] as ReadonlyArray<WinkEntityType | "">;
  return EntityPatternElement.make({
    value: Data.array(allTypes) as EntityPatternOption,
  });
};

/**
 * Create an optional literal pattern element (includes empty string option) (data-first)
 */
export const optionalLiteral: {
  (...values: ReadonlyArray<string>): Pattern.Literal.Type;
  (values: ReadonlyArray<string>): Pattern.Literal.Type;
} = (
  ...args: ReadonlyArray<string> | [ReadonlyArray<string>]
): Pattern.Literal.Type => {
  const values = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
  const validValues = values.filter((v) => v.length > 0);
  const allValues = ["", ...validValues];
  return LiteralPatternElement.make({
    value: Data.array(allValues) as any,
  });
};

// ============================================================================
// PATTERN CONSTRUCTION (Dual APIs)
// ============================================================================

/**
 * Create a Pattern (dual API)
 */
export const make: {
  (id: string, elements: ReadonlyArray<Pattern.Element.Type>): Pattern;
  (id: string): (elements: ReadonlyArray<Pattern.Element.Type>) => Pattern;
} = (id: string, elements?: ReadonlyArray<Pattern.Element.Type>): any => {
  if (elements !== undefined) {
    // Data-first
    return new Pattern({
      id: Pattern.Id(id),
      elements: Chunk.fromIterable(elements),
      mark: Option.none(),
    });
  }
  // Data-last
  return (elements: ReadonlyArray<Pattern.Element.Type>) =>
    new Pattern({
      id: Pattern.Id(id),
      elements: Chunk.fromIterable(elements),
      mark: Option.none(),
    });
};

/**
 * Add a mark range to a pattern (dual API)
 */
export const withMark: {
  (mark: MarkRange): (pattern: Pattern) => Pattern;
  (pattern: Pattern, mark: MarkRange): Pattern;
} = dual(
  2,
  (pattern: Pattern, mark: MarkRange): Pattern =>
    new Pattern({
      ...pattern,
      mark: Option.some(mark),
    })
);

// =============================================================================
// PATCHING DSL (Differ-based, Data-First & Dual APIs)
// =============================================================================

/**
 * A patch for `Pattern` is an endomorphism function `(p) => p'`.
 * We use Differ.update to gain compositional patching semantics.
 */
export type PatternPatch = (pattern: Pattern) => Pattern;

/** Differ that composes `PatternPatch` functions left-to-right. */
export const PatternDiffer = Differ.update<Pattern>();

/** Apply a single patch to a pattern. */
export const applyPatch: {
  (pattern: Pattern, patch: PatternPatch): Pattern;
  (patch: PatternPatch): (pattern: Pattern) => Pattern;
} = dual(
  2,
  (pattern: Pattern, patch: PatternPatch): Pattern =>
    Differ.patch(PatternDiffer, patch, pattern)
);

/** Compose multiple patches into one. */
export const composePatches = (
  ...patches: ReadonlyArray<PatternPatch>
): PatternPatch => {
  if (patches.length === 0) return (p) => p;
  return patches.reduce<PatternPatch>(
    (acc, nxt) => (p) => nxt(acc(p)),
    (p) => p
  );
};

/**
 * Map over only literal elements.
 */
export const mapLiterals: {
  (f: (values: ReadonlyArray<string>, index: number) => Pattern.Element.Type): (
    pattern: Pattern
  ) => Pattern;
  (
    pattern: Pattern,
    f: (values: ReadonlyArray<string>, index: number) => Pattern.Element.Type
  ): Pattern;
} = dual(
  2,
  (
    pattern: Pattern,
    f: (values: ReadonlyArray<string>, index: number) => Pattern.Element.Type
  ): Pattern =>
    new Pattern({
      ...pattern,
      elements: Chunk.map(pattern.elements, (el, i) => {
        if (el._tag === "LiteralPatternElement") {
          return f(el.value as unknown as ReadonlyArray<string>, i);
        }
        return el;
      }),
    })
);

/** Replace a literal element at a specific index using a replacer. */
export const patchReplaceLiteralAt =
  (
    index: number,
    replacer: (values: ReadonlyArray<string>) => Pattern.Element.Type
  ): PatternPatch =>
  (pattern) =>
    new Pattern({
      ...pattern,
      elements: Chunk.map(pattern.elements, (el, i) => {
        if (i === index && el._tag === "LiteralPatternElement") {
          return replacer(el.value as unknown as ReadonlyArray<string>);
        }
        return el;
      }),
    });

/** Replace all literal elements using a single replacer. */
export const patchReplaceAllLiterals =
  (
    replacer: (
      values: ReadonlyArray<string>,
      index: number
    ) => Pattern.Element.Type
  ): PatternPatch =>
  (pattern) =>
    new Pattern({
      ...pattern,
      elements: Chunk.map(pattern.elements, (el, i) =>
        el._tag === "LiteralPatternElement"
          ? replacer(el.value as unknown as ReadonlyArray<string>, i)
          : el
      ),
    });

/**
 * Generalize literals by converting them into a provided element.
 * Overloads allow passing a constant element, or a function from literal values.
 */
export const generalizeLiterals: {
  (to: Pattern.Element.Type): (pattern: Pattern) => Pattern;
  (f: (values: ReadonlyArray<string>, index: number) => Pattern.Element.Type): (
    pattern: Pattern
  ) => Pattern;
  (pattern: Pattern, to: Pattern.Element.Type): Pattern;
  (
    pattern: Pattern,
    f: (values: ReadonlyArray<string>, index: number) => Pattern.Element.Type
  ): Pattern;
} = (arg1: any, arg2?: any): any => {
  if (arg2 === undefined) {
    // data-last
    const toOrF = arg1 as
      | Pattern.Element.Type
      | ((
          values: ReadonlyArray<string>,
          index: number
        ) => Pattern.Element.Type);
    return (pattern: Pattern) =>
      typeof toOrF === "function"
        ? patchReplaceAllLiterals(toOrF)(pattern)
        : patchReplaceAllLiterals(() => toOrF)(pattern);
  }
  // data-first
  const pattern = arg1 as Pattern;
  const toOrF = arg2 as
    | Pattern.Element.Type
    | ((values: ReadonlyArray<string>, index: number) => Pattern.Element.Type);
  return typeof toOrF === "function"
    ? patchReplaceAllLiterals(toOrF)(pattern)
    : patchReplaceAllLiterals(() => toOrF)(pattern);
};

/**
 * Remove mark range from a pattern (dual API)
 */
export const withoutMark: {
  (pattern: Pattern): Pattern;
  (): (pattern: Pattern) => Pattern;
} = (pattern?: Pattern): any => {
  if (pattern !== undefined) {
    // Data-first
    return new Pattern({
      ...pattern,
      mark: Option.none(),
    });
  }
  // Data-last
  return (pattern: Pattern) =>
    new Pattern({
      ...pattern,
      mark: Option.none(),
    });
};

/**
 * Add elements to a pattern (dual API)
 */
export const addElements: {
  (elements: ReadonlyArray<Pattern.Element.Type>): (
    pattern: Pattern
  ) => Pattern;
  (pattern: Pattern, elements: ReadonlyArray<Pattern.Element.Type>): Pattern;
} = dual(
  2,
  (pattern: Pattern, elements: ReadonlyArray<Pattern.Element.Type>): Pattern =>
    new Pattern({
      ...pattern,
      elements: Chunk.appendAll(pattern.elements, Chunk.fromIterable(elements)),
    })
);

/**
 * Prepend elements to a pattern (dual API)
 */
export const prependElements: {
  (elements: ReadonlyArray<Pattern.Element.Type>): (
    pattern: Pattern
  ) => Pattern;
  (pattern: Pattern, elements: ReadonlyArray<Pattern.Element.Type>): Pattern;
} = dual(
  2,
  (pattern: Pattern, elements: ReadonlyArray<Pattern.Element.Type>): Pattern =>
    new Pattern({
      ...pattern,
      elements: Chunk.prependAll(
        pattern.elements,
        Chunk.fromIterable(elements)
      ),
    })
);

/**
 * Update pattern ID (dual API)
 */
export const withId: {
  (id: string): (pattern: Pattern) => Pattern;
  (pattern: Pattern, id: string): Pattern;
} = dual(
  2,
  (pattern: Pattern, id: string): Pattern =>
    new Pattern({
      ...pattern,
      id: Pattern.Id(id),
    })
);

// ============================================================================
// PATTERN INSPECTION (Data-First)
// ============================================================================

/**
 * Check if a pattern has a mark range
 */
export const hasMark = (pattern: Pattern): boolean =>
  Option.isSome(pattern.mark);

/**
 * Get the mark range from a pattern if it exists
 */
export const getMark = (pattern: Pattern): MarkRange | undefined =>
  Option.getOrUndefined(pattern.mark);

/**
 * Get the number of elements in a pattern
 */
export const length = (pattern: Pattern): number =>
  Chunk.size(pattern.elements);

/**
 * Get all elements from a pattern as an array
 */
export const elements = (
  pattern: Pattern
): ReadonlyArray<Pattern.Element.Type> =>
  Chunk.toReadonlyArray(pattern.elements);

/**
 * Get a specific element from a pattern by index
 */
export const elementAt = (
  pattern: Pattern,
  index: number
): Pattern.Element.Type | undefined => {
  const elements = Chunk.toReadonlyArray(pattern.elements);
  return elements[index];
};

/**
 * Check if pattern is empty (has no elements)
 */
export const isEmpty = (pattern: Pattern): boolean =>
  Chunk.isEmpty(pattern.elements);

/**
 * Get the first element of a pattern
 */
export const head = (pattern: Pattern): Pattern.Element.Type | undefined =>
  Option.getOrUndefined(Chunk.head(pattern.elements));

/**
 * Get the last element of a pattern
 */
export const last = (pattern: Pattern): Pattern.Element.Type | undefined =>
  Option.getOrUndefined(Chunk.last(pattern.elements));

// ============================================================================
// PATTERN TRANSFORMATION (Dual APIs)
// ============================================================================

/**
 * Map over pattern elements (dual API)
 */
export const mapElements: {
  (f: (element: Pattern.Element.Type, index: number) => Pattern.Element.Type): (
    pattern: Pattern
  ) => Pattern;
  (
    pattern: Pattern,
    f: (element: Pattern.Element.Type, index: number) => Pattern.Element.Type
  ): Pattern;
} = dual(
  2,
  (
    pattern: Pattern,
    f: (element: Pattern.Element.Type, index: number) => Pattern.Element.Type
  ): Pattern =>
    new Pattern({
      ...pattern,
      elements: Chunk.map(pattern.elements, f),
    })
);

/**
 * Filter pattern elements (dual API)
 */
export const filterElements: {
  (predicate: (element: Pattern.Element.Type, index: number) => boolean): (
    pattern: Pattern
  ) => Pattern;
  (
    pattern: Pattern,
    predicate: (element: Pattern.Element.Type, index: number) => boolean
  ): Pattern;
} = dual(
  2,
  (
    pattern: Pattern,
    predicate: (element: Pattern.Element.Type, index: number) => boolean
  ): Pattern => {
    // Use Chunk.filterMap with Option to filter with index
    const filteredElements = Chunk.filterMap(
      pattern.elements,
      (element, index) =>
        predicate(element, index) ? Option.some(element) : Option.none()
    );
    return new Pattern({
      ...pattern,
      elements: filteredElements,
    });
  }
);

/**
 * Take first n elements from pattern (dual API)
 */
export const take: {
  (pattern: Pattern, n: number): Pattern;
  (n: number): (pattern: Pattern) => Pattern;
} = (patternOrN: Pattern | number, n?: number): any => {
  if (n !== undefined) {
    // Data-first
    const pattern = patternOrN as Pattern;
    return new Pattern({
      ...pattern,
      elements: Chunk.take(pattern.elements, n),
    });
  }
  // Data-last
  return (pattern: Pattern) =>
    new Pattern({
      ...pattern,
      elements: Chunk.take(pattern.elements, patternOrN as number),
    });
};

/**
 * Drop first n elements from pattern (dual API)
 */
export const drop: {
  (pattern: Pattern, n: number): Pattern;
  (n: number): (pattern: Pattern) => Pattern;
} = (patternOrN: Pattern | number, n?: number): any => {
  if (n !== undefined) {
    // Data-first
    const pattern = patternOrN as Pattern;
    return new Pattern({
      ...pattern,
      elements: Chunk.drop(pattern.elements, n),
    });
  }
  // Data-last
  return (pattern: Pattern) =>
    new Pattern({
      ...pattern,
      elements: Chunk.drop(pattern.elements, patternOrN as number),
    });
};

// ============================================================================
// PATTERN PARSING (Effect-based, Data-First)
// ============================================================================

// ============================================================================
// PATTERN COMBINATION (Dual APIs)
// ============================================================================

/**
 * Combine two patterns into one (dual API)
 */
export const combine: {
  (pattern2: Pattern, newId: string): (pattern1: Pattern) => Pattern;
  (pattern1: Pattern, pattern2: Pattern, newId: string): Pattern;
} = dual(
  3,
  (pattern1: Pattern, pattern2: Pattern, newId: string): Pattern =>
    new Pattern({
      id: Pattern.Id(newId),
      elements: Chunk.appendAll(pattern1.elements, pattern2.elements),
      mark: Option.none(),
    })
);

// ============================================================================
// PATTERN BUILDERS NAMESPACE (Organized API)
// ============================================================================

export const PatternBuilders = {
  // Element builders
  pos,
  entity,
  literal,
  optionalPos,
  optionalEntity,
  optionalLiteral,

  // Pattern construction
  make,
  withMark,
  withoutMark,
  addElements,
  prependElements,
  withId,

  // Pattern inspection
  hasMark,
  getMark,
  length,
  elements,
  elementAt,
  isEmpty,
  head,
  last,

  // Pattern transformation
  mapElements,
  filterElements,
  take,
  drop,

  // Pattern combination
  combine,
} as const;
