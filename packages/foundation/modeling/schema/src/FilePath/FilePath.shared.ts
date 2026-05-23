/**
 * Internal schema module support.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $SchemaId } from "@beep/identity/packages";
import { A, Str, thunkFalse, thunkTrue } from "@beep/utils";
import { flow, Match } from "effect";
import * as O from "effect/Option";

/**
 * Internal identity composer.
 *
 *
 * @internal
 * @category symbols
 * @since 0.0.0
 */
export const $I = $SchemaId.create("FilePath");

/** @internal */
/**
 * Public schema module export.
 *
 * @category symbols
 * @since 0.0.0
 */
export const windowsDrivePrefixRegExp = /^[A-Za-z]:/;
/** @internal */
/**
 * Public schema module export.
 *
 * @category symbols
 * @since 0.0.0
 */
export const windowsDriveRootRegExp = /^[A-Za-z]:[\\/]?$/;
/** @internal */
/**
 * Public schema module export.
 *
 * @category symbols
 * @since 0.0.0
 */
export const windowsUncPrefixRegExp = /^\\\\/;
/** @internal */
/**
 * Public schema module export.
 *
 * @category symbols
 * @since 0.0.0
 */
export const windowsUncRootRegExp = /^\\\\[^\\/]+\\[^\\/]+$/;
/** @internal */
/**
 * Public schema module export.
 *
 * @category symbols
 * @since 0.0.0
 */
export const windowsSegmentWithoutSeparatorsRegExp = /^[^\\/]+$/;
/** @internal */
/**
 * Public schema module export.
 *
 * @category symbols
 * @since 0.0.0
 */
export const windowsInvalidSegmentCharacterRegExp = /^[^<>:"|?*]+$/;
/** @internal */
/**
 * Public schema module export.
 *
 * @category symbols
 * @since 0.0.0
 */
export const windowsInvalidTrailingSegmentRegExp = /^(?!.*[ .]$).+$/;

/** @internal */
/**
 * Public schema module export.
 *
 * @category guards
 * @since 0.0.0
 */
const matchesPattern =
  (pattern: RegExp) =>
  (value: string): boolean =>
    O.isSome(Str.match(pattern)(value));

/** @internal */
/**
 * Public schema module export.
 *
 * @category symbols
 * @since 0.0.0
 */
export const splitNonEmpty = (separator: string | RegExp) => flow(Str.split(separator), A.filter(Str.isNonEmpty));

/** @internal */
/**
 * Public schema module export.
 *
 * @category schemas
 * @since 0.0.0
 */
export const usesUnsupportedWindowsNamespacePrefix = Match.type<string>().pipe(
  Match.whenOr(Str.startsWith("\\\\?\\"), Str.startsWith("\\\\.\\"), thunkTrue),
  Match.orElse(thunkFalse)
);

/** @internal */
/**
 * Public schema module export.
 *
 * @category symbols
 * @since 0.0.0
 */
export const isWindowsDrivePrefix = matchesPattern(windowsDrivePrefixRegExp);
