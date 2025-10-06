import * as A from "effect/Array";
import * as F from "effect/Function";
import * as R from "effect/Record";

export type StateProps = {
  [key: string]: boolean | undefined | [boolean, string];
};

/**
 * Merges class names with state-based class names.
 *

 *
 * @example
 *
 * const classNames = mergeClasses('item__base', {
 *   ['active__class']: true,
 *   ['open__class']: true,
 *   ['disabled__class']: false,
 *   ['hover__class']: undefined,
 * });
 *
 * console.log(classNames);
 * Output: 'item__base active__class open__class'
 */

export const mergeClasses = (className?: string | (string | undefined)[] | null, state?: StateProps) =>
  F.pipe(className ? (A.isArray(className) ? className : A.make(className)) : A.empty(), (classList) => {
    const dynamicStateClassesArray = F.pipe(
      R.toEntries(state || {}),
      A.filter(([_, value]) => value !== undefined && value !== false),
      A.map(([key, value]) => {
        if (A.isArray(value)) {
          return value[0] ? value[1] : "";
        }
        return value ? key : "";
      }),
      A.filter(Boolean)
    );

    return [...A.filter(classList, Boolean), ...dynamicStateClassesArray].join(" ");
  });
