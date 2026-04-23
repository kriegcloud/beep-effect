/**
 * Pattern builders and patch helpers.
 *
 * @since 0.0.0
 * @module
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
type PatternDual<Arg, Output = Pattern> = {
  (pattern: Pattern, arg: Arg): Output;
  (arg: Arg): (pattern: Pattern) => Output;
};
type MakeDualArgs =
  | readonly [id: string, elements: ReadonlyArray<PatternElement>]
  | readonly [elements: ReadonlyArray<PatternElement>, id: string];

const ensureNonEmpty = <A>(values: ReadonlyArray<A>, fallback: A): NonEmptyChoices<A> => {
  const [head, ...tail] = values;
  return P.isUndefined(head) ? A.of(fallback) : [head, ...tail];
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
    mark: changes.mark ?? (P.isUndefined(changes.elements) ? pattern.mark : O.none()),
  });

const getCombineId = (options: { readonly id: string } | string): string =>
  P.isString(options) ? options : options.id;
const isLiteralElement = (element: PatternElement): element is LiteralPatternElement =>
  P.isTagged(element, "LiteralPatternElement");
const isMakeDataFirstArgs = (
  args: MakeDualArgs
): args is readonly [id: string, elements: ReadonlyArray<PatternElement>] => P.isString(args[0]);

/**
 * Create a POS pattern element.
 *
 * @example
 * ```ts
 * import { pos } from "@beep/nlp/Core/PatternBuilders"
 *
 * console.log(pos)
 * ```
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
 * @example
 * ```ts
 * import { entity } from "@beep/nlp/Core/PatternBuilders"
 *
 * console.log(entity)
 * ```
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
 * @example
 * ```ts
 * import { literal } from "@beep/nlp/Core/PatternBuilders"
 *
 * console.log(literal)
 * ```
 *
 * @since 0.0.0
 * @category Constructors
 */
export function literal(first: string, ...rest: ReadonlyArray<string>): LiteralPatternElement;
export function literal(values: ReadonlyArray<string>): LiteralPatternElement;
export function literal(firstOrValues: string | ReadonlyArray<string>, ...rest: ReadonlyArray<string>) {
  const values = isLiteralValueArray(firstOrValues) ? firstOrValues : [firstOrValues, ...rest];
  return new LiteralPatternElement({
    value: normalizeLiteralValues(values),
  });
}

/**
 * Create an optional POS pattern element.
 *
 * @example
 * ```ts
 * import { optionalPos } from "@beep/nlp/Core/PatternBuilders"
 *
 * console.log(optionalPos)
 * ```
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
 * @example
 * ```ts
 * import { optionalEntity } from "@beep/nlp/Core/PatternBuilders"
 *
 * console.log(optionalEntity)
 * ```
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
 * @example
 * ```ts
 * import { optionalLiteral } from "@beep/nlp/Core/PatternBuilders"
 *
 * console.log(optionalLiteral)
 * ```
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
 * @example
 * ```ts
 * import { make } from "@beep/nlp/Core/PatternBuilders"
 *
 * console.log(make)
 * ```
 *
 * @since 0.0.0
 * @category Constructors
 */
export const make: {
  (id: string, elements: ReadonlyArray<PatternElement>): Pattern;
  (id: string): (elements: ReadonlyArray<PatternElement>) => Pattern;
} = dual(
  (args) => args.length >= 2,
  (...args: MakeDualArgs): Pattern =>
    isMakeDataFirstArgs(args) ? makePattern(args[0], args[1]) : makePattern(args[1], args[0])
);

/**
 * Add a mark range to a pattern.
 *
 * @example
 * ```ts
 * import { withMark } from "@beep/nlp/Core/PatternBuilders"
 *
 * console.log(withMark)
 * ```
 *
 * @since 0.0.0
 * @category Combinators
 */
export const withMark: PatternDual<MarkRange> = dual(
  2,
  (pattern: Pattern, mark: MarkRange): Pattern => rebuildPattern(pattern, { mark: O.some(mark) })
);

/**
 * Remove a mark range from a pattern.
 *
 * @example
 * ```ts
 * import { withoutMark } from "@beep/nlp/Core/PatternBuilders"
 *
 * console.log(withoutMark)
 * ```
 *
 * @since 0.0.0
 * @category Combinators
 */
export const withoutMark: {
  (): (pattern: Pattern) => Pattern;
  (pattern: Pattern): Pattern;
} = dual(
  (args) => args.length >= 1,
  (pattern: Pattern): Pattern => rebuildPattern(pattern, { mark: O.none() })
);

/**
 * Append elements to a pattern.
 *
 * @example
 * ```ts
 * import { addElements } from "@beep/nlp/Core/PatternBuilders"
 *
 * console.log(addElements)
 * ```
 *
 * @since 0.0.0
 * @category Combinators
 */
export const addElements: PatternDual<ReadonlyArray<PatternElement>> = dual(
  2,
  (pattern: Pattern, extraElements: ReadonlyArray<PatternElement>): Pattern =>
    rebuildPattern(pattern, {
      elements: Chunk.appendAll(pattern.elements, Chunk.fromIterable(extraElements)),
    })
);

/**
 * Prepend elements to a pattern.
 *
 * @example
 * ```ts
 * import { prependElements } from "@beep/nlp/Core/PatternBuilders"
 *
 * console.log(prependElements)
 * ```
 *
 * @since 0.0.0
 * @category Combinators
 */
export const prependElements: PatternDual<ReadonlyArray<PatternElement>> = dual(
  2,
  (pattern: Pattern, leadingElements: ReadonlyArray<PatternElement>): Pattern =>
    rebuildPattern(pattern, {
      elements: Chunk.appendAll(Chunk.fromIterable(leadingElements), pattern.elements),
    })
);

/**
 * Replace the pattern id.
 *
 * @example
 * ```ts
 * import { withId } from "@beep/nlp/Core/PatternBuilders"
 *
 * console.log(withId)
 * ```
 *
 * @since 0.0.0
 * @category Combinators
 */
export const withId: PatternDual<string> = dual(
  2,
  (pattern: Pattern, id: string): Pattern => rebuildPattern(pattern, { id: Pattern.Id(id) })
);

/**
 * Test whether a pattern has a mark.
 *
 * @example
 * ```ts
 * import { hasMark } from "@beep/nlp/Core/PatternBuilders"
 *
 * console.log(hasMark)
 * ```
 *
 * @since 0.0.0
 * @category Predicates
 */
export const hasMark = (pattern: Pattern): boolean => O.isSome(pattern.mark);

/**
 * Get a pattern's mark if present.
 *
 * @example
 * ```ts
 * import { getMark } from "@beep/nlp/Core/PatternBuilders"
 *
 * console.log(getMark)
 * ```
 *
 * @since 0.0.0
 * @category Accessors
 */
export const getMark = (pattern: Pattern): MarkRange | undefined =>
  O.isSome(pattern.mark) ? pattern.mark.value : undefined;

/**
 * Count pattern elements.
 *
 * @example
 * ```ts
 * import { length } from "@beep/nlp/Core/PatternBuilders"
 *
 * console.log(length)
 * ```
 *
 * @since 0.0.0
 * @category Accessors
 */
export const length = (pattern: Pattern): number => Chunk.size(pattern.elements);

/**
 * Materialize pattern elements as a readonly array.
 *
 * @example
 * ```ts
 * import { elements } from "@beep/nlp/Core/PatternBuilders"
 *
 * console.log(elements)
 * ```
 *
 * @since 0.0.0
 * @category Accessors
 */
export const elements = (pattern: Pattern): ReadonlyArray<PatternElement> => toElements(pattern);

/**
 * Get an element by index.
 *
 * @example
 * ```ts
 * import { elementAt } from "@beep/nlp/Core/PatternBuilders"
 *
 * console.log(elementAt)
 * ```
 *
 * @since 0.0.0
 * @category Accessors
 */
export const elementAt: {
  (pattern: Pattern, index: number): PatternElement | undefined;
  (index: number): (pattern: Pattern) => PatternElement | undefined;
} = dual<
  (index: number) => (pattern: Pattern) => PatternElement | undefined,
  (pattern: Pattern, index: number) => PatternElement | undefined
>(2, (pattern: Pattern, index: number): PatternElement | undefined => {
  const element = Chunk.get(pattern.elements, index);
  return O.isSome(element) ? element.value : undefined;
});

/**
 * Test whether a pattern is empty.
 *
 * @example
 * ```ts
 * import { isEmpty } from "@beep/nlp/Core/PatternBuilders"
 *
 * console.log(isEmpty)
 * ```
 *
 * @since 0.0.0
 * @category Predicates
 */
export const isEmpty = (pattern: Pattern): boolean => Chunk.isEmpty(pattern.elements);

/**
 * Get the first pattern element.
 *
 * @example
 * ```ts
 * import { head } from "@beep/nlp/Core/PatternBuilders"
 *
 * console.log(head)
 * ```
 *
 * @since 0.0.0
 * @category Accessors
 */
export const head = (pattern: Pattern): PatternElement | undefined => elementAt(pattern, 0);

/**
 * Get the last pattern element.
 *
 * @example
 * ```ts
 * import { last } from "@beep/nlp/Core/PatternBuilders"
 *
 * console.log(last)
 * ```
 *
 * @since 0.0.0
 * @category Accessors
 */
export const last = (pattern: Pattern): PatternElement | undefined => elementAt(pattern, length(pattern) - 1);

/**
 * Map pattern elements.
 *
 * @example
 * ```ts
 * import { mapElements } from "@beep/nlp/Core/PatternBuilders"
 *
 * console.log(mapElements)
 * ```
 *
 * @since 0.0.0
 * @category Combinators
 */
export const mapElements: PatternDual<(element: PatternElement, index: number) => PatternElement> = dual(
  2,
  (pattern: Pattern, f: (element: PatternElement, index: number) => PatternElement): Pattern =>
    rebuildPattern(pattern, {
      elements: Chunk.fromIterable(A.map(toElements(pattern), f)),
    })
);

/**
 * Filter pattern elements.
 *
 * @example
 * ```ts
 * import { filterElements } from "@beep/nlp/Core/PatternBuilders"
 *
 * console.log(filterElements)
 * ```
 *
 * @since 0.0.0
 * @category Combinators
 */
export const filterElements: PatternDual<(element: PatternElement, index: number) => boolean> = dual(
  2,
  (pattern: Pattern, predicate: (element: PatternElement, index: number) => boolean): Pattern =>
    rebuildPattern(pattern, {
      elements: Chunk.fromIterable(A.filter(toElements(pattern), predicate)),
    })
);

/**
 * Take the first `count` elements.
 *
 * @example
 * ```ts
 * import { take } from "@beep/nlp/Core/PatternBuilders"
 *
 * console.log(take)
 * ```
 *
 * @since 0.0.0
 * @category Combinators
 */
export const take: PatternDual<number> = dual(
  2,
  (pattern: Pattern, count: number): Pattern =>
    rebuildPattern(pattern, {
      elements: Chunk.take(pattern.elements, count),
    })
);

/**
 * Drop the first `count` elements.
 *
 * @example
 * ```ts
 * import { drop } from "@beep/nlp/Core/PatternBuilders"
 *
 * console.log(drop)
 * ```
 *
 * @since 0.0.0
 * @category Combinators
 */
export const drop: PatternDual<number> = dual(
  2,
  (pattern: Pattern, count: number): Pattern =>
    rebuildPattern(pattern, {
      elements: Chunk.drop(pattern.elements, count),
    })
);

/**
 * Combine two patterns into a new one.
 *
 * @example
 * ```ts
 * import { combine } from "@beep/nlp/Core/PatternBuilders"
 *
 * console.log(combine)
 * ```
 *
 * @since 0.0.0
 * @category Combinators
 */
export const combine: {
  (left: Pattern, right: Pattern, options: { readonly id: string }): Pattern;
  (right: Pattern, options: { readonly id: string }): (left: Pattern) => Pattern;
} = dual(
  3,
  (left: Pattern, right: Pattern, options: { readonly id: string }): Pattern =>
    makePattern(getCombineId(options), [...toElements(left), ...toElements(right)])
);

/**
 * Functional patch over a pattern.
 *
 * @example
 * ```ts
 * import type { PatternPatch } from "@beep/nlp/Core/PatternBuilders"
 *
 * type Example = PatternPatch
 * ```
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type PatternPatch = (pattern: Pattern) => Pattern;

/**
 * Apply a patch to a pattern.
 *
 * @example
 * ```ts
 * import { applyPatch } from "@beep/nlp/Core/PatternBuilders"
 *
 * console.log(applyPatch)
 * ```
 *
 * @since 0.0.0
 * @category Combinators
 */
export const applyPatch: PatternDual<PatternPatch> = dual(
  2,
  (pattern: Pattern, patch: PatternPatch): Pattern => patch(pattern)
);

/**
 * Compose multiple patches from left to right.
 *
 * @example
 * ```ts
 * import { composePatches } from "@beep/nlp/Core/PatternBuilders"
 *
 * console.log(composePatches)
 * ```
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
 * @example
 * ```ts
 * import { patchReplaceLiteralAt } from "@beep/nlp/Core/PatternBuilders"
 *
 * console.log(patchReplaceLiteralAt)
 * ```
 *
 * @since 0.0.0
 * @category Combinators
 */
export const patchReplaceLiteralAt: {
  (index: number, replacer: (values: ReadonlyArray<string>) => PatternElement): PatternPatch;
  (replacer: (values: ReadonlyArray<string>) => PatternElement): (index: number) => PatternPatch;
} = dual<
  (replacer: (values: ReadonlyArray<string>) => PatternElement) => (index: number) => PatternPatch,
  (index: number, replacer: (values: ReadonlyArray<string>) => PatternElement) => PatternPatch
>(2, (index: number, replacer: (values: ReadonlyArray<string>) => PatternElement): PatternPatch => {
  return (pattern) =>
    mapElements(pattern, (element: PatternElement, elementIndex: number) =>
      elementIndex === index && isLiteralElement(element) ? replacer(element.value) : element
    );
});

/**
 * Replace all literal elements.
 *
 * @example
 * ```ts
 * import { patchReplaceAllLiterals } from "@beep/nlp/Core/PatternBuilders"
 *
 * console.log(patchReplaceAllLiterals)
 * ```
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

const toLiteralReplacer = (replacement: PatternElement | LiteralReplacer): LiteralReplacer =>
  P.isFunction(replacement) ? replacement : () => replacement;

/**
 * Generalize literal elements into other element kinds.
 *
 * @example
 * ```ts
 * import { generalizeLiterals } from "@beep/nlp/Core/PatternBuilders"
 *
 * console.log(generalizeLiterals)
 * ```
 *
 * @since 0.0.0
 * @category Combinators
 */
export const generalizeLiterals: {
  (to: PatternElement): (pattern: Pattern) => Pattern;
  (f: LiteralReplacer): (pattern: Pattern) => Pattern;
  (pattern: Pattern, to: PatternElement): Pattern;
  (pattern: Pattern, f: LiteralReplacer): Pattern;
} = dual(
  2,
  (pattern: Pattern, replacement: PatternElement | LiteralReplacer): Pattern =>
    patchReplaceAllLiterals(toLiteralReplacer(replacement))(pattern)
);
