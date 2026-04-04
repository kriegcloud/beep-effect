import {
  pipe,
  Match,
  String,
  Schema,
  Differ,
  Data,
  Option,
  Chunk,
  Array,
  Predicate,
} from "effect";
import {
  Pattern,
  type PatternElement,
  POSPatternElement,
  EntityPatternElement,
  LiteralPatternElement,
  type WinkPOSTag,
  type WinkEntityType,
} from "./Pattern.js";

// ============================================================================
// PREDICATE-BASED PATTERN VALIDATION AND FILTERING
// ============================================================================

/**
 * Predicates for pattern element types using Effect's Predicate combinators
 */
export const isPOSElement = (
  element: PatternElement
): element is POSPatternElement => element._tag === "POSPatternElement";

export const isEntityElement = (
  element: PatternElement
): element is EntityPatternElement => element._tag === "EntityPatternElement";

export const isLiteralElement = (
  element: PatternElement
): element is LiteralPatternElement => element._tag === "LiteralPatternElement";

/**
 * Predicates for element values using Predicate combinators
 */
export const hasValue =
  (targetValue: string) =>
  (element: PatternElement): boolean => {
    const values = extractElementValues(element);
    return Array.some(values, (value) => value === targetValue);
  };

export const hasAnyValue =
  (targetValues: ReadonlyArray<string>) =>
  (element: PatternElement): boolean => {
    const values = extractElementValues(element);
    return Array.some(targetValues, (target) =>
      Array.some(values, (value) => value === target)
    );
  };

export const hasAllValues =
  (targetValues: ReadonlyArray<string>) =>
  (element: PatternElement): boolean => {
    const values = extractElementValues(element);
    return Array.every(targetValues, (target) =>
      Array.some(values, (value) => value === target)
    );
  };

export const hasNumericValues = (element: PatternElement): boolean => {
  const values = extractElementValues(element);
  return Array.every(values, (value) => /^\d+$/.test(value));
};

export const hasDateLikeValues = (element: PatternElement): boolean => {
  const values = extractElementValues(element);
  return Array.every(
    values,
    (value) =>
      /^\d{4}-\d{2}-\d{2}$/.test(value) ||
      /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value)
  );
};

export const hasEmptyValues = (element: PatternElement): boolean => {
  const values = extractElementValues(element);
  return Array.some(values, (value) => value === "");
};

export const hasNonEmptyValues = (element: PatternElement): boolean => {
  const values = extractElementValues(element);
  return Array.every(values, String.isNonEmpty);
};

/**
 * Composite predicates using Predicate combinators
 */
export const isOptionalElement = Predicate.compose(
  isPOSElement,
  hasEmptyValues
);

export const isRequiredElement = Predicate.compose(
  isPOSElement,
  hasNonEmptyValues
);

export const isNumericLiteral = Predicate.compose(
  isLiteralElement,
  hasNumericValues
);

export const isDateLiteral = Predicate.compose(
  isLiteralElement,
  hasDateLikeValues
);

export const isConvertibleToPOS = Predicate.or(isNumericLiteral, isDateLiteral);

/**
 * Pattern-level predicates
 */
export const hasElementAt =
  (index: number) =>
  (pattern: Pattern): boolean => {
    const elements = Chunk.toReadonlyArray(pattern.elements);
    return index >= 0 && index < elements.length;
  };

export const hasElementType =
  (
    type: "POSPatternElement" | "EntityPatternElement" | "LiteralPatternElement"
  ) =>
  (pattern: Pattern): boolean => {
    const elements = Chunk.toReadonlyArray(pattern.elements);
    return Array.some(elements, (element) => element._tag === type);
  };

export const hasElementWithValue =
  (targetValue: string) =>
  (pattern: Pattern): boolean => {
    const elements = Chunk.toReadonlyArray(pattern.elements);
    return Array.some(elements, hasValue(targetValue));
  };

export const hasMultipleElements = (pattern: Pattern): boolean => {
  return Chunk.size(pattern.elements) > 1;
};

export const isEmptyPattern = (pattern: Pattern): boolean => {
  return Chunk.isEmpty(pattern.elements);
};

// ============================================================================
// STRING MANIPULATION SCHEMAS (using Effect String filters)
// ============================================================================

/**
 * Schema for bracket string content (without brackets)
 * Simplified to avoid complex filter requirements
 */
export const BracketContent = Schema.String.pipe(
  Schema.annotations({
    identifier: "effect-nlp/PatternOperations/BracketContent",
    title: "Bracket Content",
    description: "Content inside bracket strings",
  })
);

/**
 * Schema for individual pattern values (POS tags, entity types, literals)
 * Simplified to avoid complex filter requirements
 */
export const PatternValue = Schema.String.pipe(
  Schema.annotations({
    identifier: "effect-nlp/PatternOperations/PatternValue",
    title: "Pattern Value",
    description: "Individual pattern value",
  })
);

/**
 * Schema for optional pattern values (can be empty string)
 */
export const OptionalPatternValue = Schema.Union(
  PatternValue,
  Schema.Literal("")
).pipe(
  Schema.annotations({
    identifier: "effect-nlp/PatternOperations/OptionalPatternValue",
    title: "Optional Pattern Value",
    description: "Pattern value that can be empty (for optional elements)",
  })
);

// ============================================================================
// ELEMENT TYPE DIFFER (for pattern matching)
// ============================================================================

/**
 * Differ for PatternElement that handles type-specific transformations
 * Uses Effect's Differ.update with pattern matching
 */
export const ElementDiffer = Differ.update<PatternElement>();

/**
 * Type-safe element transformation using pattern matching
 */
export const transformElement = (
  element: PatternElement,
  transformFn: (element: PatternElement) => PatternElement
): PatternElement => {
  return pipe(
    element,
    Match.value,
    Match.when({ _tag: "POSPatternElement" }, (posElement) =>
      transformFn(posElement)
    ),
    Match.when({ _tag: "EntityPatternElement" }, (entityElement) =>
      transformFn(entityElement)
    ),
    Match.when({ _tag: "LiteralPatternElement" }, (literalElement) =>
      transformFn(literalElement)
    ),
    Match.exhaustive
  );
};

// ============================================================================
// STRING MANIPULATION UTILITIES
// ============================================================================

/**
 * Extract content from bracket string with validation
 * Uses proper Effect String functions and Option handling
 */
export const extractBracketContent = (
  bracketString: string
): Option.Option<string> => {
  // Check if string starts with '[' and ends with ']'
  const hasBrackets = pipe(
    bracketString,
    String.startsWith("["),
    (startsWith) => startsWith && pipe(bracketString, String.endsWith("]"))
  );

  if (!hasBrackets) {
    return Option.none();
  }

  // Extract content between brackets
  const content = bracketString.slice(1, -1);

  // Validate content using schema
  return pipe(content, Schema.decodeUnknownOption(BracketContent));
};

/**
 * Split bracket content into individual values
 */
export const splitBracketValues = (content: string): ReadonlyArray<string> => {
  return pipe(
    content,
    String.split("|"),
    Array.map(String.trim),
    Array.filter(String.isNonEmpty)
  );
};

/**
 * Join values into bracket string format
 */
export const joinBracketValues = (values: ReadonlyArray<string>): string => {
  return pipe(
    values,
    Array.filter(String.isNonEmpty),
    (filtered) => (filtered.length > 0 ? filtered : [""]),
    (final) => `[${final.join("|")}]`
  );
};

// ============================================================================
// ELEMENT-SPECIFIC OPERATIONS (using pattern matching)
// ============================================================================

/**
 * Extract values from any element type using pattern matching
 */
export const extractElementValues = (
  element: PatternElement
): ReadonlyArray<string> => {
  return pipe(
    element,
    Match.value,
    Match.when(
      { _tag: "POSPatternElement" },
      (posElement) => posElement.value as unknown as ReadonlyArray<string>
    ),
    Match.when(
      { _tag: "EntityPatternElement" },
      (entityElement) => entityElement.value as unknown as ReadonlyArray<string>
    ),
    Match.when(
      { _tag: "LiteralPatternElement" },
      (literalElement) =>
        literalElement.value as unknown as ReadonlyArray<string>
    ),
    Match.exhaustive
  );
};

/**
 * Create new element with updated values
 */
export const updateElementValues = (
  element: PatternElement,
  newValues: ReadonlyArray<string>
): PatternElement => {
  return pipe(
    element,
    Match.value,
    Match.when({ _tag: "POSPatternElement" }, () =>
      POSPatternElement.make({
        value: Data.array(newValues) as any,
      })
    ),
    Match.when({ _tag: "EntityPatternElement" }, () =>
      EntityPatternElement.make({
        value: Data.array(newValues) as any,
      })
    ),
    Match.when({ _tag: "LiteralPatternElement" }, () =>
      LiteralPatternElement.make({
        value: Data.array(newValues) as any,
      })
    ),
    Match.exhaustive
  );
};

// ============================================================================
// ENHANCED PATCH OPERATIONS WITH PREDICATES
// ============================================================================

/**
 * Patch that transforms element values using a function
 */
export const patchElementValues = (
  transformFn: (values: ReadonlyArray<string>) => ReadonlyArray<string>
): ((element: PatternElement) => PatternElement) => {
  return (element) => {
    const currentValues = extractElementValues(element);
    const newValues = transformFn(currentValues);
    return updateElementValues(element, newValues);
  };
};

/**
 * Patch that filters element values using Predicate combinators
 */
export const patchFilterValues = (
  predicate: Predicate.Predicate<string>
): ((element: PatternElement) => PatternElement) => {
  return patchElementValues((values) => Array.filter(values, predicate));
};

/**
 * Patch that maps element values
 */
export const patchMapValues = (
  mapFn: (value: string) => string
): ((element: PatternElement) => PatternElement) => {
  return patchElementValues((values) => Array.map(values, mapFn));
};

/**
 * Patch that adds a value to element
 */
export const patchAddValue = (
  newValue: string
): ((element: PatternElement) => PatternElement) => {
  return patchElementValues((values) => Array.append(values, newValue));
};

/**
 * Patch that removes a value from element
 */
export const patchRemoveValue = (
  valueToRemove: string
): ((element: PatternElement) => PatternElement) => {
  return patchFilterValues((value) => value !== valueToRemove);
};

/**
 * Patch that only applies to elements matching a predicate
 */
export const patchWhenElement = (
  elementPredicate: Predicate.Predicate<PatternElement>,
  elementPatch: (element: PatternElement) => PatternElement
): ((element: PatternElement) => PatternElement) => {
  return (element) =>
    elementPredicate(element) ? elementPatch(element) : element;
};

// ============================================================================
// ENHANCED PATTERN-LEVEL OPERATIONS WITH PREDICATES
// ============================================================================

/**
 * Apply patch to specific element in pattern
 */
export const patchElementAt = (
  index: number,
  elementPatch: (element: PatternElement) => PatternElement
): ((pattern: Pattern) => Pattern) => {
  return (pattern) => {
    const elements = Chunk.toReadonlyArray(pattern.elements);
    if (index < 0 || index >= elements.length) {
      return pattern; // No change if index out of bounds
    }

    const updatedElements = pipe(
      elements,
      Array.map((element, i) =>
        i === index ? elementPatch(element) : element
      ),
      Chunk.fromIterable
    );

    return new Pattern({
      ...pattern,
      elements: updatedElements,
    });
  };
};

/**
 * Apply patch to all elements of a specific type using predicates
 */
export const patchElementsByType = (
  type: "POSPatternElement" | "EntityPatternElement" | "LiteralPatternElement",
  elementPatch: (element: PatternElement) => PatternElement
): ((pattern: Pattern) => Pattern) => {
  const typePredicate =
    type === "POSPatternElement"
      ? isPOSElement
      : type === "EntityPatternElement"
      ? isEntityElement
      : isLiteralElement;

  return patchElementsWhere(typePredicate, elementPatch);
};

/**
 * Apply patch to all elements matching a predicate
 */
export const patchElementsWhere = (
  predicate: Predicate.Predicate<PatternElement>,
  elementPatch: (element: PatternElement) => PatternElement
): ((pattern: Pattern) => Pattern) => {
  return (pattern) => {
    const updatedElements = pipe(
      pattern.elements,
      Chunk.map((element) =>
        predicate(element) ? elementPatch(element) : element
      )
    );

    return new Pattern({
      ...pattern,
      elements: updatedElements,
    });
  };
};

/**
 * Patch that only affects elements with specific values using predicates
 */
export const patchElementsWithValue = (
  targetValue: string,
  elementPatch: (element: PatternElement) => PatternElement
): ((pattern: Pattern) => Pattern) => {
  return patchElementsWhere(hasValue(targetValue), elementPatch);
};

/**
 * Patch that only affects elements with any of the specified values
 */
export const patchElementsWithAnyValue = (
  targetValues: ReadonlyArray<string>,
  elementPatch: (element: PatternElement) => PatternElement
): ((pattern: Pattern) => Pattern) => {
  return patchElementsWhere(hasAnyValue(targetValues), elementPatch);
};

/**
 * Patch that only affects elements with all of the specified values
 */
export const patchElementsWithAllValues = (
  targetValues: ReadonlyArray<string>,
  elementPatch: (element: PatternElement) => PatternElement
): ((pattern: Pattern) => Pattern) => {
  return patchElementsWhere(hasAllValues(targetValues), elementPatch);
};

/**
 * Patch that only affects numeric literals
 */
export const patchNumericLiterals = (
  elementPatch: (element: PatternElement) => PatternElement
): ((pattern: Pattern) => Pattern) => {
  return patchElementsWhere(isNumericLiteral, elementPatch);
};

/**
 * Patch that only affects date literals
 */
export const patchDateLiterals = (
  elementPatch: (element: PatternElement) => PatternElement
): ((pattern: Pattern) => Pattern) => {
  return patchElementsWhere(isDateLiteral, elementPatch);
};

/**
 * Patch that only affects optional elements
 */
export const patchOptionalElements = (
  elementPatch: (element: PatternElement) => PatternElement
): ((pattern: Pattern) => Pattern) => {
  return patchElementsWhere(isOptionalElement, elementPatch);
};

// ============================================================================
// ADVANCED COMPOSITION UTILITIES WITH PREDICATES
// ============================================================================

/**
 * Compose multiple element patches
 */
export const composeElementPatches = (
  ...patches: ReadonlyArray<(element: PatternElement) => PatternElement>
): ((element: PatternElement) => PatternElement) => {
  return (element) => patches.reduce((acc, patch) => patch(acc), element);
};

/**
 * Compose multiple pattern patches
 */
export const composePatternPatches = (
  ...patches: ReadonlyArray<(pattern: Pattern) => Pattern>
): ((pattern: Pattern) => Pattern) => {
  return (pattern) => patches.reduce((acc, patch) => patch(acc), pattern);
};

/**
 * Conditional patch application using predicates
 */
export const patchWhen = (
  condition: Predicate.Predicate<Pattern>,
  patch: (pattern: Pattern) => Pattern
): ((pattern: Pattern) => Pattern) => {
  return (pattern) => (condition(pattern) ? patch(pattern) : pattern);
};

/**
 * Patch that applies different transformations based on element type
 */
export const patchByType = (
  posPatch: (element: POSPatternElement) => PatternElement,
  entityPatch: (element: EntityPatternElement) => PatternElement,
  literalPatch: (element: LiteralPatternElement) => PatternElement
): ((element: PatternElement) => PatternElement) => {
  return (element) =>
    pipe(
      element,
      Match.value,
      Match.when({ _tag: "POSPatternElement" }, posPatch),
      Match.when({ _tag: "EntityPatternElement" }, entityPatch),
      Match.when({ _tag: "LiteralPatternElement" }, literalPatch),
      Match.exhaustive
    );
};

// ============================================================================
// SPECIALIZED OPERATIONS WITH PREDICATES
// ============================================================================

/**
 * Normalize element values (trim, deduplicate, sort)
 */
export const normalizeElementValues = (
  element: PatternElement
): PatternElement => {
  return pipe(
    element,
    patchElementValues((values) =>
      pipe(
        values,
        Array.map(String.trim),
        Array.filter(String.isNonEmpty),
        Array.dedupe,
        Array.sort(String.Order)
      )
    )
  );
};

/**
 * Convert literal to POS based on content analysis using predicates
 */
export const literalToPOS = (element: PatternElement): PatternElement => {
  return pipe(
    element,
    Match.value,
    Match.when({ _tag: "LiteralPatternElement" }, (literalElement) => {
      const values = literalElement.value as unknown as ReadonlyArray<string>;
      // Use predicate to determine if all values are numeric
      const allNumeric = Array.every(values, (value) => /^\d+$/.test(value));
      const posTag: WinkPOSTag = allNumeric ? "NUM" : "NOUN";

      return POSPatternElement.make({
        value: Data.array([posTag]) as any,
      });
    }),
    Match.orElse(() => element) // Return unchanged if not literal
  );
};

/**
 * Convert literal to entity based on content analysis using predicates
 */
export const literalToEntity = (element: PatternElement): PatternElement => {
  return pipe(
    element,
    Match.value,
    Match.when({ _tag: "LiteralPatternElement" }, (literalElement) => {
      const values = literalElement.value as unknown as ReadonlyArray<string>;
      // Use predicate to determine if all values look like dates
      const allDateLike = Array.every(
        values,
        (value) =>
          /^\d{4}-\d{2}-\d{2}$/.test(value) ||
          /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value)
      );
      const entityType: WinkEntityType = allDateLike ? "DATE" : "CARDINAL";

      return EntityPatternElement.make({
        value: Data.array([entityType]) as any,
      });
    }),
    Match.orElse(() => element) // Return unchanged if not literal
  );
};

/**
 * Smart conversion based on content analysis using predicates
 */
export const smartConvert = (element: PatternElement): PatternElement => {
  return pipe(
    element,
    patchWhenElement(isNumericLiteral, literalToPOS),
    patchWhenElement(isDateLiteral, literalToEntity)
  );
};

// ============================================================================
// WINK-NLP ESCAPE HELPERS
// ============================================================================

/**
 * Escape a literal value for wink-nlp patterns
 * According to wink-nlp docs: use caret (^) to escape entity/POS types
 * Examples: 'DATE' -> '^DATE', 'NOUN' -> '^NOUN', '^' -> '^^'
 */
export const escapeWinkLiteral = (value: string): string => {
  return value.replace(/\^/g, "^^").replace(/^([A-Z]+)$/, "^$1");
};

/**
 * Unescape a literal value from wink-nlp patterns
 * Reverses the escaping done by escapeWinkLiteral
 */
export const unescapeWinkLiteral = (value: string): string => {
  // First unescape double carets
  const unescaped = value.replace(/\^\^/g, "^");
  // Then remove leading caret if it's followed by uppercase letters only
  return unescaped.replace(/^\^([A-Z]+)$/, "$1");
};

/**
 * Check if a value is an escaped wink-nlp literal
 */
export const isEscapedWinkLiteral = (value: string): boolean => {
  return /^\^[A-Z]+$/.test(value);
};

/**
 * Check if a value needs escaping for wink-nlp patterns
 * Entity types and POS tags in uppercase need escaping
 */
export const needsWinkEscaping = (value: string): boolean => {
  return /^[A-Z]+$/.test(value) && !isEscapedWinkLiteral(value);
};

/**
 * Escape all values in a pattern element that need escaping
 */
export const escapePatternElementValues = (
  element: PatternElement
): PatternElement => {
  return pipe(
    element,
    patchElementValues((values) =>
      Array.map(values, (value) =>
        needsWinkEscaping(value) ? escapeWinkLiteral(value) : value
      )
    )
  );
};

/**
 * Unescape all values in a pattern element
 */
export const unescapePatternElementValues = (
  element: PatternElement
): PatternElement => {
  return pipe(
    element,
    patchElementValues((values) =>
      Array.map(values, (value) =>
        isEscapedWinkLiteral(value) ? unescapeWinkLiteral(value) : value
      )
    )
  );
};

/**
 * Convert a pattern to wink-nlp format with proper escaping
 * Uses existing PatternOperations utilities with escaping
 */
export const toWinkPattern = (pattern: Pattern): string => {
  const elements = Array.fromIterable(pattern.elements);
  const winkElements = Array.map(elements, (element) => {
    const values = extractElementValues(element);
    const escapedValues = Array.map(values, (value) =>
      needsWinkEscaping(value) ? escapeWinkLiteral(value) : value
    );
    return `[${escapedValues.join("|")}]`;
  });
  return winkElements.join(" ");
};

/**
 * Create a wink-nlp custom entity pattern object
 * Uses existing Pattern conversion with escaping
 */
export const toWinkCustomEntity = (
  name: string,
  pattern: Pattern
): { name: string; patterns: ReadonlyArray<string> } => {
  return {
    name,
    patterns: [toWinkPattern(pattern)],
  };
};

/**
 * Create multiple wink-nlp custom entity patterns
 */
export const toWinkCustomEntities = (
  entities: ReadonlyArray<{ name: string; pattern: Pattern }>
): ReadonlyArray<{ name: string; patterns: ReadonlyArray<string> }> => {
  return Array.map(entities, ({ name, pattern }) =>
    toWinkCustomEntity(name, pattern)
  );
};

/**
 * Patch that escapes all pattern element values for wink-nlp
 */
export const patchEscapeForWink = (pattern: Pattern): Pattern => {
  return pipe(
    pattern,
    patchElementsWhere(
      () => true, // Apply to all elements
      escapePatternElementValues
    )
  );
};

/**
 * Patch that unescapes all pattern element values from wink-nlp
 */
export const patchUnescapeFromWink = (pattern: Pattern): Pattern => {
  return pipe(
    pattern,
    patchElementsWhere(
      () => true, // Apply to all elements
      unescapePatternElementValues
    )
  );
};

// ============================================================================
// EXPORT NAMESPACE
// ============================================================================

export const PatternOperations = {
  // Predicates
  isPOSElement,
  isEntityElement,
  isLiteralElement,
  hasValue,
  hasAnyValue,
  hasAllValues,
  hasNumericValues,
  hasDateLikeValues,
  hasEmptyValues,
  hasNonEmptyValues,
  isOptionalElement,
  isRequiredElement,
  isNumericLiteral,
  isDateLiteral,
  isConvertibleToPOS,
  hasElementAt,
  hasElementType,
  hasElementWithValue,
  hasMultipleElements,
  isEmptyPattern,

  // String manipulation
  extractBracketContent,
  splitBracketValues,
  joinBracketValues,

  // Element operations
  extractElementValues,
  updateElementValues,
  transformElement,

  // Enhanced patch operations
  patchElementValues,
  patchFilterValues,
  patchMapValues,
  patchAddValue,
  patchRemoveValue,
  patchWhenElement,

  // Enhanced pattern-level patches
  patchElementAt,
  patchElementsByType,
  patchElementsWhere,
  patchElementsWithValue,
  patchElementsWithAnyValue,
  patchElementsWithAllValues,
  patchNumericLiterals,
  patchDateLiterals,
  patchOptionalElements,

  // Enhanced composition
  composeElementPatches,
  composePatternPatches,
  patchWhen,
  patchByType,

  // Enhanced specialized operations
  normalizeElementValues,
  literalToPOS,
  literalToEntity,
  smartConvert,

  // Wink-NLP escape helpers
  escapeWinkLiteral,
  unescapeWinkLiteral,
  isEscapedWinkLiteral,
  needsWinkEscaping,
  escapePatternElementValues,
  unescapePatternElementValues,
  toWinkPattern,
  toWinkCustomEntity,
  toWinkCustomEntities,
  patchEscapeForWink,
  patchUnescapeFromWink,
} as const;
