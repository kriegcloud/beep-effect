/**
 * Pattern builders and patch helpers.
 *
 * @since 0.0.0
 * @module @beep/nlp/Core/PatternBuilders
 */

import { Chunk } from "effect";
import * as A from "effect/Array";
import { dual } from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as Str from "effect/String";
import {
  EntityPatternElement,
  LiteralPatternElement,
  type MarkRange,
  Pattern,
  type PatternElement,
  POSPatternElement,
  type WinkEntityType,
  type WinkPOSTag,
} from "./Pattern.ts";

type NonEmptyChoices<A> = readonly [A, ...A[]];
type LiteralReplacer = (values: ReadonlyArray<string>, index: number) => PatternElement;

const ensureNonEmpty = <A>(values: ReadonlyArray<A>, fallback: A): NonEmptyChoices<A> => {
  const [head, ...tail] = values;
  return head === undefined ? [fallback] : [head, ...tail];
};

const normalizeLiteralValues = (values: ReadonlyArray<string>): NonEmptyChoices<string> => {
  const filtered = A.filter(values, Str.isNonEmpty);
  return ensureNonEmpty(filtered, "");
};

const prependEmptyChoice = <A>(values: ReadonlyArray<A>): readonly [A | "", ...(A | "")[]] => ["", ...values];
const isPosChoiceArray = (
  value: (WinkPOSTag | "") | ReadonlyArray<WinkPOSTag | "">
): value is ReadonlyArray<WinkPOSTag | ""> => A.isArray(value);
const isEntityChoiceArray = (
  value: (WinkEntityType | "") | ReadonlyArray<WinkEntityType | "">
): value is ReadonlyArray<WinkEntityType | ""> => A.isArray(value);
const isLiteralValueArray = (value: string | ReadonlyArray<string>): value is ReadonlyArray<string> => A.isArray(value);
const isRequiredPosChoiceArray = (value: WinkPOSTag | ReadonlyArray<WinkPOSTag>): value is ReadonlyArray<WinkPOSTag> =>
  A.isArray(value);
const isRequiredEntityChoiceArray = (
  value: WinkEntityType | ReadonlyArray<WinkEntityType>
): value is ReadonlyArray<WinkEntityType> => A.isArray(value);

const toElements = (pattern: Pattern): ReadonlyArray<PatternElement> => Chunk.toReadonlyArray(pattern.elements);

const makePattern = (
  id: string,
  elements: ReadonlyArray<PatternElement>,
  mark: O.Option<MarkRange> = O.none()
): Pattern =>
  new Pattern({
    elements: Chunk.fromIterable(elements),
    id: Pattern.Id(id),
    mark,
  });

const rebuildPattern = (pattern: Pattern, changes: Partial<Pick<Pattern, "elements" | "id" | "mark">>): Pattern =>
  new Pattern({
    elements: changes.elements ?? pattern.elements,
    id: changes.id ?? pattern.id,
    mark: changes.mark ?? (changes.elements === undefined ? pattern.mark : O.none()),
  });

const isLiteralElement = (element: PatternElement): element is LiteralPatternElement =>
  P.isTagged(element, "LiteralPatternElement");

/**
 * Create a POS pattern element.
 *
 * @since 0.0.0
 * @category Constructors
 */
export function pos(first: WinkPOSTag | "", ...rest: ReadonlyArray<WinkPOSTag | "">): POSPatternElement;
export function pos(tags: ReadonlyArray<WinkPOSTag | "">): POSPatternElement;
export function pos(
  firstOrTags: (WinkPOSTag | "") | ReadonlyArray<WinkPOSTag | "">,
  ...rest: ReadonlyArray<WinkPOSTag | "">
): POSPatternElement {
  const tags = isPosChoiceArray(firstOrTags) ? firstOrTags : [firstOrTags, ...rest];
  return new POSPatternElement({
    value: ensureNonEmpty(tags, ""),
  });
}

/**
 * Create an entity pattern element.
 *
 * @since 0.0.0
 * @category Constructors
 */
export function entity(first: WinkEntityType | "", ...rest: ReadonlyArray<WinkEntityType | "">): EntityPatternElement;
export function entity(types: ReadonlyArray<WinkEntityType | "">): EntityPatternElement;
export function entity(
  firstOrTypes: (WinkEntityType | "") | ReadonlyArray<WinkEntityType | "">,
  ...rest: ReadonlyArray<WinkEntityType | "">
): EntityPatternElement {
  const types = isEntityChoiceArray(firstOrTypes) ? firstOrTypes : [firstOrTypes, ...rest];
  return new EntityPatternElement({
    value: ensureNonEmpty(types, ""),
  });
}

/**
 * Create a literal pattern element.
 *
 * @since 0.0.0
 * @category Constructors
 */
export function literal(first: string, ...rest: ReadonlyArray<string>): LiteralPatternElement;
export function literal(values: ReadonlyArray<string>): LiteralPatternElement;
export function literal(
  firstOrValues: string | ReadonlyArray<string>,
  ...rest: ReadonlyArray<string>
): LiteralPatternElement {
  const values = isLiteralValueArray(firstOrValues) ? firstOrValues : [firstOrValues, ...rest];
  return new LiteralPatternElement({
    value: normalizeLiteralValues(values),
  });
}

/**
 * Create an optional POS pattern element.
 *
 * @since 0.0.0
 * @category Constructors
 */
export function optionalPos(first: WinkPOSTag, ...rest: ReadonlyArray<WinkPOSTag>): POSPatternElement;
export function optionalPos(tags: ReadonlyArray<WinkPOSTag>): POSPatternElement;
export function optionalPos(
  firstOrTags: WinkPOSTag | ReadonlyArray<WinkPOSTag>,
  ...rest: ReadonlyArray<WinkPOSTag>
): POSPatternElement {
  const tags = isRequiredPosChoiceArray(firstOrTags) ? firstOrTags : [firstOrTags, ...rest];
  return new POSPatternElement({
    value: prependEmptyChoice(tags),
  });
}

/**
 * Create an optional entity pattern element.
 *
 * @since 0.0.0
 * @category Constructors
 */
export function optionalEntity(first: WinkEntityType, ...rest: ReadonlyArray<WinkEntityType>): EntityPatternElement;
export function optionalEntity(types: ReadonlyArray<WinkEntityType>): EntityPatternElement;
export function optionalEntity(
  firstOrTypes: WinkEntityType | ReadonlyArray<WinkEntityType>,
  ...rest: ReadonlyArray<WinkEntityType>
): EntityPatternElement {
  const types = isRequiredEntityChoiceArray(firstOrTypes) ? firstOrTypes : [firstOrTypes, ...rest];
  return new EntityPatternElement({
    value: prependEmptyChoice(types),
  });
}

/**
 * Create an optional literal pattern element.
 *
 * @since 0.0.0
 * @category Constructors
 */
export function optionalLiteral(first: string, ...rest: ReadonlyArray<string>): LiteralPatternElement;
export function optionalLiteral(values: ReadonlyArray<string>): LiteralPatternElement;
export function optionalLiteral(
  firstOrValues: string | ReadonlyArray<string>,
  ...rest: ReadonlyArray<string>
): LiteralPatternElement {
  const values = A.filter(
    isLiteralValueArray(firstOrValues) ? firstOrValues : [firstOrValues, ...rest],
    Str.isNonEmpty
  );
  return new LiteralPatternElement({
    value: prependEmptyChoice(values),
  });
}

/**
 * Construct a pattern from an id and ordered elements.
 *
 * @since 0.0.0
 * @category Constructors
 */
export function make(id: string, elements: ReadonlyArray<PatternElement>): Pattern;
export function make(id: string): (elements: ReadonlyArray<PatternElement>) => Pattern;
export function make(id: string, elements?: ReadonlyArray<PatternElement>) {
  return elements === undefined
    ? (nextElements: ReadonlyArray<PatternElement>) => makePattern(id, nextElements)
    : makePattern(id, elements);
}

/**
 * Add a mark range to a pattern.
 *
 * @since 0.0.0
 * @category Combinators
 */
export const withMark = dual(
  2,
  (pattern: Pattern, mark: MarkRange): Pattern => rebuildPattern(pattern, { mark: O.some(mark) })
);

/**
 * Remove a mark range from a pattern.
 *
 * @since 0.0.0
 * @category Combinators
 */
export function withoutMark(): (pattern: Pattern) => Pattern;
export function withoutMark(pattern: Pattern): Pattern;
export function withoutMark(pattern?: Pattern) {
  return pattern === undefined
    ? (nextPattern: Pattern) => rebuildPattern(nextPattern, { mark: O.none() })
    : rebuildPattern(pattern, { mark: O.none() });
}

/**
 * Append elements to a pattern.
 *
 * @since 0.0.0
 * @category Combinators
 */
export const addElements = dual(
  2,
  (pattern: Pattern, extraElements: ReadonlyArray<PatternElement>): Pattern =>
    rebuildPattern(pattern, {
      elements: Chunk.appendAll(pattern.elements, Chunk.fromIterable(extraElements)),
    })
);

/**
 * Prepend elements to a pattern.
 *
 * @since 0.0.0
 * @category Combinators
 */
export const prependElements = dual(
  2,
  (pattern: Pattern, leadingElements: ReadonlyArray<PatternElement>): Pattern =>
    rebuildPattern(pattern, {
      elements: Chunk.appendAll(Chunk.fromIterable(leadingElements), pattern.elements),
    })
);

/**
 * Replace the pattern id.
 *
 * @since 0.0.0
 * @category Combinators
 */
export const withId = dual(
  2,
  (pattern: Pattern, id: string): Pattern => rebuildPattern(pattern, { id: Pattern.Id(id) })
);

/**
 * Test whether a pattern has a mark.
 *
 * @since 0.0.0
 * @category Predicates
 */
export const hasMark = (pattern: Pattern): boolean => O.isSome(pattern.mark);

/**
 * Get a pattern's mark if present.
 *
 * @since 0.0.0
 * @category Accessors
 */
export const getMark = (pattern: Pattern): MarkRange | undefined =>
  O.isSome(pattern.mark) ? pattern.mark.value : undefined;

/**
 * Count pattern elements.
 *
 * @since 0.0.0
 * @category Accessors
 */
export const length = (pattern: Pattern): number => Chunk.size(pattern.elements);

/**
 * Materialize pattern elements as a readonly array.
 *
 * @since 0.0.0
 * @category Accessors
 */
export const elements = (pattern: Pattern): ReadonlyArray<PatternElement> => toElements(pattern);

/**
 * Get an element by index.
 *
 * @since 0.0.0
 * @category Accessors
 */
export const elementAt = (pattern: Pattern, index: number): PatternElement | undefined => {
  const element = Chunk.get(pattern.elements, index);
  return O.isSome(element) ? element.value : undefined;
};

/**
 * Test whether a pattern is empty.
 *
 * @since 0.0.0
 * @category Predicates
 */
export const isEmpty = (pattern: Pattern): boolean => Chunk.isEmpty(pattern.elements);

/**
 * Get the first pattern element.
 *
 * @since 0.0.0
 * @category Accessors
 */
export const head = (pattern: Pattern): PatternElement | undefined => elementAt(pattern, 0);

/**
 * Get the last pattern element.
 *
 * @since 0.0.0
 * @category Accessors
 */
export const last = (pattern: Pattern): PatternElement | undefined => elementAt(pattern, length(pattern) - 1);

/**
 * Map pattern elements.
 *
 * @since 0.0.0
 * @category Combinators
 */
export const mapElements = dual(
  2,
  (pattern: Pattern, f: (element: PatternElement, index: number) => PatternElement): Pattern =>
    rebuildPattern(pattern, {
      elements: Chunk.fromIterable(A.map(toElements(pattern), f)),
    })
);

/**
 * Filter pattern elements.
 *
 * @since 0.0.0
 * @category Combinators
 */
export const filterElements = dual(
  2,
  (pattern: Pattern, predicate: (element: PatternElement, index: number) => boolean): Pattern =>
    rebuildPattern(pattern, {
      elements: Chunk.fromIterable(A.filter(toElements(pattern), predicate)),
    })
);

/**
 * Take the first `count` elements.
 *
 * @since 0.0.0
 * @category Combinators
 */
export const take = dual(
  2,
  (pattern: Pattern, count: number): Pattern =>
    rebuildPattern(pattern, {
      elements: Chunk.take(pattern.elements, count),
    })
);

/**
 * Drop the first `count` elements.
 *
 * @since 0.0.0
 * @category Combinators
 */
export const drop = dual(
  2,
  (pattern: Pattern, count: number): Pattern =>
    rebuildPattern(pattern, {
      elements: Chunk.drop(pattern.elements, count),
    })
);

/**
 * Combine two patterns into a new one.
 *
 * @since 0.0.0
 * @category Combinators
 */
export function combine(left: Pattern, right: Pattern, id: string): Pattern;
export function combine(right: Pattern, id: string): (left: Pattern) => Pattern;
export function combine(leftOrRight: Pattern, rightOrId: Pattern | string, maybeId?: string) {
  if (P.isString(rightOrId)) {
    return (left: Pattern) => makePattern(rightOrId, [...toElements(left), ...toElements(leftOrRight)]);
  }

  return makePattern(maybeId ?? `${leftOrRight.id}-${rightOrId.id}`, [
    ...toElements(leftOrRight),
    ...toElements(rightOrId),
  ]);
}

/**
 * Functional patch over a pattern.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type PatternPatch = (pattern: Pattern) => Pattern;

/**
 * Apply a patch to a pattern.
 *
 * @since 0.0.0
 * @category Combinators
 */
export const applyPatch = dual(2, (pattern: Pattern, patch: PatternPatch): Pattern => patch(pattern));

/**
 * Compose multiple patches from left to right.
 *
 * @since 0.0.0
 * @category Combinators
 */
export const composePatches = (...patches: ReadonlyArray<PatternPatch>): PatternPatch =>
  A.reduce(
    patches,
    ((pattern: Pattern) => pattern) satisfies PatternPatch,
    (acc, patch) => (pattern) => patch(acc(pattern))
  );

/**
 * Replace a literal element at a given index.
 *
 * @since 0.0.0
 * @category Combinators
 */
export const patchReplaceLiteralAt =
  (index: number, replacer: (values: ReadonlyArray<string>) => PatternElement): PatternPatch =>
  (pattern) =>
    mapElements(pattern, (element: PatternElement, elementIndex: number) =>
      elementIndex === index && isLiteralElement(element) ? replacer(element.value) : element
    );

/**
 * Replace all literal elements.
 *
 * @since 0.0.0
 * @category Combinators
 */
export const patchReplaceAllLiterals =
  (replacer: LiteralReplacer): PatternPatch =>
  (pattern) =>
    mapElements(pattern, (element: PatternElement, index: number) =>
      isLiteralElement(element) ? replacer(element.value, index) : element
    );

/**
 * Generalize literal elements into other element kinds.
 *
 * @since 0.0.0
 * @category Combinators
 */
export function generalizeLiterals(to: PatternElement): (pattern: Pattern) => Pattern;
export function generalizeLiterals(f: LiteralReplacer): (pattern: Pattern) => Pattern;
export function generalizeLiterals(pattern: Pattern, to: PatternElement): Pattern;
export function generalizeLiterals(pattern: Pattern, f: LiteralReplacer): Pattern;
export function generalizeLiterals(
  arg1: Pattern | PatternElement | LiteralReplacer,
  arg2?: PatternElement | LiteralReplacer
) {
  if (Pattern.is(arg1)) {
    if (arg2 === undefined) {
      return arg1;
    }

    const replacer: LiteralReplacer = P.isFunction(arg2) ? arg2 : () => arg2;
    return patchReplaceAllLiterals(replacer)(arg1);
  }

  const replacer: LiteralReplacer = P.isFunction(arg1) ? arg1 : () => arg1;
  return (pattern: Pattern) => patchReplaceAllLiterals(replacer)(pattern);
}
