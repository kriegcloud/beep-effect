/**
 * Internal schema module support.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import * as Eq from "effect/Equal";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import { EndsWithSeparator } from "./FilePath.guards.ts";
import { $I, windowsDriveRootRegExp, windowsUncRootRegExp } from "./FilePath.shared.ts";

/**
 * Branded schema for Windows drive roots such as `C:` and `C:\\`.
 *
 * @since 0.0.0
 * @category validation
 */
export const WindowsDriveRoot = S.String.check(
  S.isPattern(windowsDriveRootRegExp, {
    identifier: $I`WindowsDriveRootCheck`,
    title: "Windows Drive Root",
    description: "A Windows drive root in the form `<letter>:` with an optional trailing separator.",
    message: "Windows drive roots must look like C: or C:\\",
  })
).pipe(
  S.brand("WindowsDriveRoot"),
  S.annotate(
    $I.annote("WindowsDriveRoot", {
      description: "A Windows drive root such as C: or C:\\.",
    })
  )
);

/**
 * Type for {@link WindowsDriveRoot}.
 *
 * @since 0.0.0
 * @category models
 */
export type WindowsDriveRoot = typeof WindowsDriveRoot.Type;

/**
 * Branded schema for UNC roots such as `\\\\server\\share`.
 *
 * @since 0.0.0
 * @category validation
 */
export const WindowsUncRoot = S.String.check(
  S.isPattern(windowsUncRootRegExp, {
    identifier: $I`WindowsUncRootCheck`,
    title: "Windows UNC Root",
    description: "A UNC root in the form \\\\server\\share without a trailing separator.",
    message: "Windows UNC roots must look like \\\\server\\share",
  })
).pipe(
  S.brand("WindowsUncRoot"),
  S.annotate(
    $I.annote("WindowsUncRoot", {
      description: "A Windows UNC root such as \\\\server\\share.",
    })
  )
);

/**
 * Type for {@link WindowsUncRoot}.
 *
 * @since 0.0.0
 * @category models
 */
export type WindowsUncRoot = typeof WindowsUncRoot.Type;

const isEndsWithSeparator = S.is(EndsWithSeparator);
const isWindowsDriveRoot = S.is(WindowsDriveRoot);
const isWindowsUncRoot = S.is(WindowsUncRoot);

/**
 * Branded schema for path strings that include a non-root leaf segment.
 *
 * @since 0.0.0
 * @category validation
 */
export const HasLeafSegment = S.NonEmptyString.check(
  S.makeFilterGroup(
    [
      S.makeFilter(P.not(Eq.equals("/")), {
        identifier: $I`HasLeafSegmentNotPosixRootCheck`,
        title: "Has Leaf Segment Not Posix Root",
        description: "A path that is not exactly the POSIX root /.",
        message: "File paths must not be the POSIX root /",
      }),
      S.makeFilter(P.not(isEndsWithSeparator), {
        identifier: $I`HasLeafSegmentNoTrailingSeparatorCheck`,
        title: "Has Leaf Segment No Trailing Separator",
        description: "A path that does not end with a trailing path separator.",
        message: "File paths must not end with a path separator",
      }),
      S.makeFilter(P.not(isWindowsDriveRoot), {
        identifier: $I`HasLeafSegmentNotWindowsDriveRootCheck`,
        title: "Has Leaf Segment Not Windows Drive Root",
        description: "A path that is not only a Windows drive root.",
        message: "File paths must not be only a Windows drive root",
      }),
      S.makeFilter(P.not(isWindowsUncRoot), {
        identifier: $I`HasLeafSegmentNotWindowsUncRootCheck`,
        title: "Has Leaf Segment Not Windows UNC Root",
        description: "A path that is not only a Windows UNC root.",
        message: "File paths must not be only a Windows UNC root",
      }),
    ],
    {
      identifier: $I`HasLeafSegmentChecks`,
      title: "Has Leaf Segment",
      description: "Checks for a path string that includes a concrete leaf segment.",
    }
  )
).pipe(
  S.brand("HasLeafSegment"),
  S.annotate(
    $I.annote("HasLeafSegment", {
      description: "A non-empty path string that is not just a root and does not end with a separator.",
    })
  )
);

/**
 * Type for {@link HasLeafSegment}.
 *
 * @since 0.0.0
 * @category models
 */
export type HasLeafSegment = typeof HasLeafSegment.Type;
