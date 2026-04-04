import {
  Chunk,
  HashSet,
  Match,
  Schema,
  Data,
  Hash,
  Equal,
  Equivalence,
  Option,
  type Pipeable,
} from "effect";
import { Pattern, MarkRange } from "../Core/Pattern.js";

// ============================================================================
// Branded Types
// ============================================================================

/**
 * Branded type for entity group names
 */
export type EntityGroupName = Schema.Schema.Type<typeof EntityGroupName>;
export const EntityGroupName = Schema.NonEmptyString.pipe(
  Schema.brand("EntityGroupName"),
  Schema.annotations({
    identifier: "effect-nlp/WinkPattern/EntityGroupName",
    title: "Entity Group Name",
    description: "A branded string representing a unique entity group name",
  })
);

// ============================================================================
// Pattern Element Matcher
// ============================================================================

/**
 * Simple matcher type for PatternElement to string conversion
 */
export interface PatternElementMatcher {
  readonly convertToString: (element: Pattern.Element.Type) => string;
}

/**
 * Pattern matching implementation for converting PatternElement to bracket string
 * Using correct _tag values based on the TaggedClass first argument
 */
const patternElementToBracketString = Match.type<Pattern.Element.Type>().pipe(
  Match.tag("POSPatternElement", (element) =>
    Pattern.POS.toBracketString(element.value)
  ),
  Match.tag("EntityPatternElement", (element) =>
    Pattern.Entity.toBracketString(element.value)
  ),
  Match.tag("LiteralPatternElement", (element) =>
    Pattern.Literal.toBracketString(element.value)
  ),
  Match.exhaustive
);

export class CustomEntityExample extends Schema.Class<CustomEntityExample>(
  "CustomEntityExample"
)({
  name: Schema.String,
  patterns: Schema.Data(Schema.Array(Schema.String)).pipe(
    Schema.annotations({
      jsonSchema: {
        type: "array",
        items: { type: "string" },
        description: "Ordered array of pattern strings for sequential matching",
      },
    })
  ),
  mark: Schema.optional(MarkRange),
}) {}

export class WinkEngineCustomEntities
  extends Schema.Class<WinkEngineCustomEntities>("WinkEngineCustomEntities")({
    name: EntityGroupName,
    patterns: Schema.HashSetFromSelf(CustomEntityExample).pipe(
      Schema.annotations({
        jsonSchema: {
          type: "array",
          items: true,
          uniqueItems: true,
          description: "Set of custom entity examples",
        },
      })
    ),
  })
  implements Pipeable.Pipeable
{
  static fromPatterns(
    name: EntityGroupName | string,
    patterns: ReadonlyArray<Pattern.Type> | Chunk.Chunk<Pattern.Type>
  ) {
    const groupName = Schema.is(EntityGroupName)(name)
      ? name
      : EntityGroupName.make(name);
    const patternChunk = Chunk.isChunk(patterns)
      ? patterns
      : Chunk.fromIterable(patterns);

    const serialized = Chunk.map(patternChunk, (pattern) => {
      const name = pattern.id;
      const patterns = patternElementChunksToBracketString(pattern);
      return new CustomEntityExample({
        name,
        patterns: Data.array(patterns),
      });
    });

    return new WinkEngineCustomEntities({
      name: groupName,
      patterns: HashSet.fromIterable(Chunk.toArray(serialized)),
    });
  }

  // ============================================================================
  // Pipeable Implementation
  // ============================================================================

  pipe(): WinkEngineCustomEntities;
  pipe<A>(ab: (input: WinkEngineCustomEntities) => A): A;
  pipe<A, B>(
    ab: (input: WinkEngineCustomEntities) => A,
    bc: (input: A) => B
  ): B;
  pipe<A, B, C>(
    ab: (input: WinkEngineCustomEntities) => A,
    bc: (input: A) => B,
    cd: (input: B) => C
  ): C;
  pipe<A, B, C, D>(
    ab: (input: WinkEngineCustomEntities) => A,
    bc: (input: A) => B,
    cd: (input: B) => C,
    de: (input: C) => D
  ): D;
  pipe<A, B, C, D, E>(
    ab: (input: WinkEngineCustomEntities) => A,
    bc: (input: A) => B,
    cd: (input: B) => C,
    de: (input: C) => D,
    ef: (input: D) => E
  ): E;
  pipe<A, B, C, D, E, F>(
    ab: (input: WinkEngineCustomEntities) => A,
    bc: (input: A) => B,
    cd: (input: B) => C,
    de: (input: C) => D,
    ef: (input: D) => E,
    fg: (input: E) => F
  ): F;
  pipe<A, B, C, D, E, F, G>(
    ab: (input: WinkEngineCustomEntities) => A,
    bc: (input: A) => B,
    cd: (input: B) => C,
    de: (input: C) => D,
    ef: (input: D) => E,
    fg: (input: E) => F,
    gh: (input: F) => G
  ): G;
  pipe<A, B, C, D, E, F, G, H>(
    ab: (input: WinkEngineCustomEntities) => A,
    bc: (input: A) => B,
    cd: (input: B) => C,
    de: (input: C) => D,
    ef: (input: D) => E,
    fg: (input: E) => F,
    gh: (input: F) => G,
    hi: (input: G) => H
  ): H;
  pipe<A, B, C, D, E, F, G, H, I>(
    ab: (input: WinkEngineCustomEntities) => A,
    bc: (input: A) => B,
    cd: (input: B) => C,
    de: (input: C) => D,
    ef: (input: D) => E,
    fg: (input: E) => F,
    gh: (input: F) => G,
    hi: (input: G) => H,
    ij: (input: H) => I
  ): I;
  pipe(...args: ReadonlyArray<(input: any) => any>): any {
    switch (args.length) {
      case 0:
        return this;
      case 1:
        return args[0]!(this);
      default:
        return args.reduce((acc, fn) => fn(acc), this);
    }
  }

  // ============================================================================
  // Hash and Equivalence Utilities
  // ============================================================================

  /**
   * Get hash of this WinkEngineCustomEntities instance
   * Uses Effect's built-in Hash implementation from Schema.Class
   */
  getHash(): number {
    return Hash.hash(this);
  }

  /**
   * Check equality with another WinkEngineCustomEntities instance
   * Uses Effect's built-in Equal implementation from Schema.Class
   */
  equals(other: WinkEngineCustomEntities): boolean {
    return Equal.equals(this, other);
  }

  /**
   * Get equivalence instance for WinkEngineCustomEntities
   * Useful for creating custom collections or comparisons
   */
  static getEquivalence(): Equivalence.Equivalence<WinkEngineCustomEntities> {
    return Equivalence.make((self, that) => Equal.equals(self, that));
  }

  /**
   * Merge with another WinkEngineCustomEntities instance
   * Returns new instance with union of patterns (deduplicates automatically)
   * Requires explicit name specification for the merged result
   */
  merge(
    other: WinkEngineCustomEntities,
    newName: EntityGroupName | string
  ): WinkEngineCustomEntities {
    const mergedPatterns = HashSet.union(this.patterns, other.patterns);
    const resultName =
      typeof newName === "string" ? EntityGroupName.make(newName) : newName;

    return new WinkEngineCustomEntities({
      name: resultName,
      patterns: mergedPatterns,
    });
  }

  /**
   * Rename this entity group
   */
  rename(newName: EntityGroupName | string): WinkEngineCustomEntities {
    const name = Schema.is(EntityGroupName)(newName)
      ? newName
      : EntityGroupName.make(newName);
    return new WinkEngineCustomEntities({
      name,
      patterns: this.patterns,
    });
  }

  /**
   * Add a single pattern to this entities collection
   * Returns new instance with the pattern added (deduplicates automatically)
   */
  addPattern(pattern: Pattern.Type): WinkEngineCustomEntities {
    const entity = Schema.decodeSync(PatternToWinkCustomEntityExample)(
      Pattern.encode(pattern)
    );
    const updatedPatterns = HashSet.add(this.patterns, entity);
    return new WinkEngineCustomEntities({
      name: this.name,
      patterns: updatedPatterns,
    });
  }

  /**
   * Remove a pattern by name
   * Returns new instance with the named pattern removed
   */
  removePattern(name: EntityGroupName | string): WinkEngineCustomEntities {
    const nameToRemove = Schema.is(EntityGroupName)(name)
      ? name
      : EntityGroupName.make(name);
    const filteredPatterns = HashSet.filter(
      this.patterns,
      (entity: CustomEntityExample) => entity.name !== nameToRemove
    );
    return new WinkEngineCustomEntities({
      name: this.name,
      patterns: filteredPatterns,
    });
  }

  /**
   * Get pattern by name
   * Returns the CustomEntityExample if found, otherwise undefined
   */
  getPattern(name: EntityGroupName | string): CustomEntityExample | undefined {
    const nameToGet = Schema.is(EntityGroupName)(name)
      ? name
      : EntityGroupName.make(name);
    const values = HashSet.toValues(this.patterns);
    return values.find((entity) => entity.name === nameToGet);
  }

  /**
   * Check if a pattern with the given name exists
   */
  hasPattern(name: EntityGroupName | string): boolean {
    const nameToCheck = Schema.is(EntityGroupName)(name)
      ? name
      : EntityGroupName.make(name);
    return HashSet.some(this.patterns, (entity: CustomEntityExample) =>
      Equal.equals(entity.name, nameToCheck)
    );
  }

  /**
   * Get the number of unique patterns
   */
  size(): number {
    return HashSet.size(this.patterns);
  }

  /**
   * Check if the entities collection is empty
   */
  isEmpty(): boolean {
    return HashSet.size(this.patterns) === 0;
  }

  /**
   * Convert to array for iteration or external APIs
   */
  toArray(): ReadonlyArray<CustomEntityExample> {
    return HashSet.toValues(this.patterns);
  }

  /**
   * Convert to wink-nlp compatible format
   * Returns array of objects with name and patterns for wink-nlp.learnCustomEntities()
   */
  toWinkFormat(): ReadonlyArray<{
    name: string;
    patterns: ReadonlyArray<string>;
    mark?: [number, number];
  }> {
    return HashSet.toValues(this.patterns).map(
      (entity: CustomEntityExample) =>
        Schema.decodeSync(CustomEntityExampleToWinkFormat)(entity) as any
    );
  }

  /**
   * Create a debug string representation
   */
  toDebugString(): string {
    const entities = this.toArray();
    return `WinkEngineCustomEntities("${this.name}", ${
      entities.length
    } entities): ${entities
      .map((e) => `${e.name}[${e.patterns.length}]`)
      .join(", ")}`;
  }

  // ============================================================================
  // Static Data-First Utility Functions (for pipe operations)
  // ============================================================================

  /**
   * Data-first merge operation
   * Usage: pipe(entities1, WinkEngineCustomEntities.mergeWith(entities2, "new-name"))
   */
  static mergeWith =
    (other: WinkEngineCustomEntities, newName: EntityGroupName | string) =>
    (self: WinkEngineCustomEntities) =>
      self.merge(other, newName);

  /**
   * Data-first rename operation
   * Usage: pipe(entities, WinkEngineCustomEntities.renameTo("new-name"))
   */
  static renameTo =
    (newName: EntityGroupName | string) => (self: WinkEngineCustomEntities) =>
      self.rename(newName);

  /**
   * Data-first add pattern operation
   * Usage: pipe(entities, WinkEngineCustomEntities.addingPattern(pattern))
   */
  static addingPattern =
    (pattern: Pattern.Type) => (self: WinkEngineCustomEntities) =>
      self.addPattern(pattern);

  /**
   * Data-first remove pattern operation
   * Usage: pipe(entities, WinkEngineCustomEntities.removingPattern("pattern-name"))
   */
  static removingPattern =
    (name: EntityGroupName | string) => (self: WinkEngineCustomEntities) =>
      self.removePattern(name);

  /**
   * Data-first filter operation
   * Usage: pipe(entities, WinkEngineCustomEntities.filteringBy(predicate))
   */
  static filteringBy =
    (predicate: (entity: CustomEntityExample) => boolean) =>
    (self: WinkEngineCustomEntities) => {
      const filteredPatterns = HashSet.filter(self.patterns, predicate);
      return new WinkEngineCustomEntities({
        name: self.name,
        patterns: filteredPatterns,
      });
    };

  /**
   * Add a pattern with mark functionality
   * Returns new instance with the pattern added with specified mark range
   */
  addPatternWithMark(
    pattern: Pattern.Type,
    mark: MarkRange
  ): WinkEngineCustomEntities {
    const markedPattern = new Pattern({
      ...pattern,
      mark: Option.some(mark),
    });
    return this.addPattern(markedPattern);
  }

  /**
   * Data-first add pattern with mark operation
   * Usage: pipe(entities, WinkEngineCustomEntities.addingPatternWithMark(pattern, mark))
   */
  static addingPatternWithMark =
    (pattern: Pattern.Type, mark: MarkRange) =>
    (self: WinkEngineCustomEntities) =>
      self.addPatternWithMark(pattern, mark);
}

export const PatternToWinkCustomEntityExample = Schema.transform(
  Pattern,
  CustomEntityExample,
  {
    strict: true,
    decode: (pattern) => {
      const name = pattern.id;
      const patterns = patternElementChunksToBracketString(pattern);
      const mark = Option.getOrNull(pattern.mark);
      return new CustomEntityExample({
        name,
        patterns: Data.array(patterns),
        mark: mark === null ? undefined : mark,
      });
    },
    encode: (customEntityExample) => {
      const id = Pattern.Id(customEntityExample.name);
      // Parse bracket strings back to pattern elements (simplified for now)
      // This would need a proper parser to convert bracket strings back to elements
      const elements = Chunk.empty<Pattern.Element.Type>();
      const mark = customEntityExample.mark;
      return new Pattern({
        id,
        elements,
        mark: mark ? Option.some(mark) : Option.none(),
      });
    },
  }
);

/**
 * Schema for encoding CustomEntityExample to wink-nlp format
 */
export const CustomEntityExampleToWinkFormat = Schema.transform(
  CustomEntityExample,
  Schema.Struct({
    name: Schema.String,
    patterns: Schema.Array(Schema.String),
    mark: Schema.optional(Schema.Tuple(Schema.Int, Schema.Int)),
  }),
  {
    strict: false,
    decode: (entity) => ({
      name: entity.name,
      // Join the bracket patterns with spaces for wink-nlp
      patterns: [entity.patterns.join(" ")],
      mark: entity.mark as [number, number] | undefined,
    }),
    encode: (winkFormat) => {
      // Split the pattern string back into bracket components
      const patterns =
        winkFormat.patterns.length > 0
          ? winkFormat.patterns[0]!.split(" ").filter((s) => s.length > 0)
          : [];
      return new CustomEntityExample({
        name: winkFormat.name,
        patterns: Data.array(patterns),
        mark: winkFormat.mark,
      });
    },
  }
);

export const patternElementChunksToBracketString = (pattern: Pattern.Type) =>
  Chunk.toArray(Chunk.map(pattern.elements, patternElementToBracketString));
