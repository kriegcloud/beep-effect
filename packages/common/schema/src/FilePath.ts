/**
 * Reusable schema constructors for filesystem path strings.
 *
 * @since 0.0.0
 * @module @beep/schema/FilePath
 */

import { $SchemaId } from "@beep/identity/packages";
import { A, thunkFalse, thunkTrue } from "@beep/utils";
import { flow, Match, pipe } from "effect";
import * as Eq from "effect/Equal";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { LiteralKit } from "./LiteralKit.ts";

const $I = $SchemaId.create("FilePath");

const windowsDrivePrefixRegExp = /^[A-Za-z]:/;
const windowsDriveRootRegExp = /^[A-Za-z]:[\\/]?$/;
const windowsUncPrefixRegExp = /^\\\\/;
const windowsUncRootRegExp = /^\\\\[^\\/]+\\[^\\/]+$/;
const windowsSegmentWithoutSeparatorsRegExp = /^[^\\/]+$/;
const windowsInvalidSegmentCharacterRegExp = /^[^<>:"|?*]+$/;
const windowsInvalidTrailingSegmentRegExp = /^(?!.*[ .]$).+$/;

const matchesPattern =
  (pattern: RegExp) =>
  (value: string): boolean =>
    O.isSome(Str.match(pattern)(value));

const splitNonEmpty = (separator: string | RegExp) => flow(Str.split(separator), A.filter(Str.isNonEmpty));

const usesUnsupportedWindowsNamespacePrefix = Match.type<string>().pipe(
  Match.whenOr(Str.startsWith("\\\\?\\"), Str.startsWith("\\\\.\\"), thunkTrue),
  Match.orElse(thunkFalse)
);

/**
 * Branded schema for strings that contain an embedded NUL byte.
 *
 * @since 0.0.0
 * @category Validation
 */
export const HasNullByte = S.String.check(
  S.isIncludes("\u0000", {
    identifier: $I`HasNullByteCheck`,
    title: "Has Null Byte",
    description: "A string that contains an embedded NUL byte.",
    message: "Path text must contain an embedded NUL byte",
  })
).pipe(
  S.brand("HasNullByte"),
  S.annotate(
    $I.annote("HasNullByte", {
      description: "A string that contains an embedded NUL byte.",
    })
  )
);

/**
 * Type for {@link HasNullByte}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type HasNullByte = typeof HasNullByte.Type;

/**
 * Branded schema for path strings that do not use unsupported Windows device
 * namespace prefixes.
 *
 * @since 0.0.0
 * @category Validation
 */
export const SupportedWindowsNamespace = S.NonEmptyString.check(
  S.makeFilter(P.not(usesUnsupportedWindowsNamespacePrefix), {
    identifier: $I`SupportedWindowsNamespaceCheck`,
    title: "Supported Windows Namespace",
    description: "A path string that does not start with \\\\?\\ or \\\\.\\.",
    message: "Windows namespace paths starting with \\\\?\\ or \\\\.\\ are not supported",
  })
).pipe(
  S.brand("SupportedWindowsNamespace"),
  S.annotate(
    $I.annote("SupportedWindowsNamespace", {
      description: "A non-empty path string that does not use unsupported Windows namespace prefixes.",
    })
  )
);

/**
 * Type for {@link SupportedWindowsNamespace}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type SupportedWindowsNamespace = typeof SupportedWindowsNamespace.Type;

/**
 * Branded schema for strings that contain a POSIX separator.
 *
 * @since 0.0.0
 * @category Validation
 */
export const UsesPosixSeparator = S.String.check(
  S.isIncludes("/", {
    identifier: $I`UsesPosixSeparatorCheck`,
    title: "Uses Posix Separator",
    description: "A string that contains the POSIX path separator /.",
    message: "Path text must contain the POSIX separator /",
  })
).pipe(
  S.brand("UsesPosixSeparator"),
  S.annotate(
    $I.annote("UsesPosixSeparator", {
      description: "A string that contains the POSIX path separator /.",
    })
  )
);

/**
 * Type for {@link UsesPosixSeparator}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type UsesPosixSeparator = typeof UsesPosixSeparator.Type;

/**
 * Branded schema for strings that contain a Windows separator.
 *
 * @since 0.0.0
 * @category Validation
 */
export const UsesWindowsSeparator = S.String.check(
  S.makeFilter(Str.includes("\\"), {
    identifier: $I`UsesWindowsSeparatorCheck`,
    title: "Uses Windows Separator",
    description: "A string that contains the Windows path separator \\.",
    message: "Path text must contain the Windows separator \\",
  })
).pipe(
  S.brand("UsesWindowsSeparator"),
  S.annotate(
    $I.annote("UsesWindowsSeparator", {
      description: "A string that contains the Windows path separator \\.",
    })
  )
);

/**
 * Type for {@link UsesWindowsSeparator}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type UsesWindowsSeparator = typeof UsesWindowsSeparator.Type;

/**
 * Branded schema for strings that end with a POSIX or Windows path separator.
 *
 * @since 0.0.0
 * @category Validation
 */
export const EndsWithSeparator = S.String.check(
  S.makeFilter(P.or(Str.endsWith("/"), Str.endsWith("\\")), {
    identifier: $I`EndsWithSeparatorCheck`,
    title: "Ends With Separator",
    description: "A string that ends with either / or \\.",
    message: "Path text must end with a path separator",
  })
).pipe(
  S.brand("EndsWithSeparator"),
  S.annotate(
    $I.annote("EndsWithSeparator", {
      description: "A string that ends with either the POSIX or Windows path separator.",
    })
  )
);

/**
 * Type for {@link EndsWithSeparator}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type EndsWithSeparator = typeof EndsWithSeparator.Type;

const WindowsDotSegmentKit = LiteralKit([".", ".."] as const);

/**
 * Literal union for Windows dot-segment markers.
 *
 * @since 0.0.0
 * @category Validation
 */
export const WindowsDotSegment = WindowsDotSegmentKit.annotate(
  $I.annote("WindowsDotSegment", {
    description: "Windows dot-segment markers used for current and parent directory traversal.",
  })
);

/**
 * Type for {@link WindowsDotSegment}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type WindowsDotSegment = typeof WindowsDotSegment.Type;

/**
 * Branded schema for Windows path segments that are plain names rather than
 * separators or dot-segment markers.
 *
 * @since 0.0.0
 * @category Validation
 */
export const ValidWindowsPlainPathSegment = S.NonEmptyString.check(
  S.makeFilterGroup(
    [
      S.isPattern(windowsSegmentWithoutSeparatorsRegExp, {
        identifier: $I`WindowsPlainPathSegmentNoSeparatorsCheck`,
        title: "Windows Plain Path Segment Without Separators",
        description: "A Windows path segment that does not contain / or \\.",
        message: "Windows path segments must not contain / or \\",
      }),
      S.isPattern(windowsInvalidSegmentCharacterRegExp, {
        identifier: $I`WindowsPlainPathSegmentCharacterCheck`,
        title: "Windows Plain Path Segment Characters",
        description: 'A Windows path segment without reserved characters <>:"|?*.',
        message: 'Windows path segments must not contain <>:"|?*',
      }),
      S.isPattern(windowsInvalidTrailingSegmentRegExp, {
        identifier: $I`WindowsPlainPathSegmentTrailingCheck`,
        title: "Windows Plain Path Segment Trailing Character",
        description: "A Windows path segment that does not end with a trailing dot or space.",
        message: "Windows path segments must not end with a dot or space",
      }),
    ],
    {
      identifier: $I`ValidWindowsPlainPathSegmentChecks`,
      title: "Valid Windows Plain Path Segment",
      description: "Checks for a Windows path segment that is neither empty nor structurally invalid.",
    }
  )
).pipe(
  S.brand("ValidWindowsPlainPathSegment"),
  S.annotate(
    $I.annote("ValidWindowsPlainPathSegment", {
      description: "A non-empty Windows path segment without separators, reserved characters, or trailing dots/spaces.",
    })
  )
);

/**
 * Type for {@link ValidWindowsPlainPathSegment}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ValidWindowsPlainPathSegment = typeof ValidWindowsPlainPathSegment.Type;

const isWindowsDotSegment = S.is(WindowsDotSegment);

/**
 * Branded schema for Windows root segments such as UNC server and share names.
 *
 * @since 0.0.0
 * @category Validation
 */
export const ValidWindowsRootSegment = ValidWindowsPlainPathSegment.check(
  S.makeFilter(P.not(isWindowsDotSegment), {
    identifier: $I`ValidWindowsRootSegmentCheck`,
    title: "Valid Windows Root Segment",
    description: "A Windows root segment that is not . or ..",
    message: "Windows root segments must not be . or ..",
  })
).pipe(
  S.brand("ValidWindowsRootSegment"),
  S.annotate(
    $I.annote("ValidWindowsRootSegment", {
      description: "A Windows root segment suitable for drive roots and UNC server/share segments.",
    })
  )
);

/**
 * Type for {@link ValidWindowsRootSegment}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ValidWindowsRootSegment = typeof ValidWindowsRootSegment.Type;

/**
 * Branded schema for Windows path segments that may be either plain segments or
 * dot-segment markers.
 *
 * @since 0.0.0
 * @category Validation
 */
export const ValidWindowsPathSegment = S.Union([WindowsDotSegment, ValidWindowsPlainPathSegment]).pipe(
  S.brand("ValidWindowsPathSegment"),
  S.annotate(
    $I.annote("ValidWindowsPathSegment", {
      description: "A Windows path segment that is either a valid plain segment or a dot-segment marker.",
    })
  )
);

/**
 * Type for {@link ValidWindowsPathSegment}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ValidWindowsPathSegment = typeof ValidWindowsPathSegment.Type;

/**
 * Branded schema for a non-empty Windows path segment list.
 *
 * @since 0.0.0
 * @category Validation
 */
export const WindowsSegments = S.NonEmptyArray(ValidWindowsPathSegment).pipe(
  S.brand("WindowsSegments"),
  S.annotate(
    $I.annote("WindowsSegments", {
      description: "A non-empty Windows path segment list.",
    })
  )
);

/**
 * Type for {@link WindowsSegments}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type WindowsSegments = typeof WindowsSegments.Type;

/**
 * Branded schema for the tail segment list of a UNC file path after the server
 * and share segments.
 *
 * @since 0.0.0
 * @category Validation
 */
export const ValidWindowsUncRest = S.NonEmptyArray(ValidWindowsPathSegment).pipe(
  S.brand("ValidWindowsUncRest"),
  S.annotate(
    $I.annote("ValidWindowsUncRest", {
      description: "The non-empty remainder segment list of a UNC file path after the server and share segments.",
    })
  )
);

/**
 * Type for {@link ValidWindowsUncRest}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ValidWindowsUncRest = typeof ValidWindowsUncRest.Type;

/**
 * Branded schema for a full UNC segment list `[server, share, ...rest]`.
 *
 * @since 0.0.0
 * @category Validation
 */
export const ValidWindowsUncSegments = S.TupleWithRest(
  S.Tuple([ValidWindowsRootSegment, ValidWindowsRootSegment, ValidWindowsPathSegment]),
  [ValidWindowsPathSegment]
).pipe(
  S.brand("ValidWindowsUncSegments"),
  S.annotate(
    $I.annote("ValidWindowsUncSegments", {
      description: "A UNC segment list with server, share, and at least one leaf segment.",
    })
  )
);

/**
 * Type for {@link ValidWindowsUncSegments}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ValidWindowsUncSegments = typeof ValidWindowsUncSegments.Type;

/**
 * Branded schema for Windows drive roots such as `C:` and `C:\\`.
 *
 * @since 0.0.0
 * @category Validation
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
 * @category DomainModel
 */
export type WindowsDriveRoot = typeof WindowsDriveRoot.Type;

/**
 * Branded schema for UNC roots such as `\\\\server\\share`.
 *
 * @since 0.0.0
 * @category Validation
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
 * @category DomainModel
 */
export type WindowsUncRoot = typeof WindowsUncRoot.Type;

const isEndsWithSeparator = S.is(EndsWithSeparator);
const isWindowsDriveRoot = S.is(WindowsDriveRoot);
const isWindowsUncRoot = S.is(WindowsUncRoot);

/**
 * Branded schema for path strings that include a non-root leaf segment.
 *
 * @since 0.0.0
 * @category Validation
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
 * @category DomainModel
 */
export type HasLeafSegment = typeof HasLeafSegment.Type;

const isSupportedWindowsNamespace = S.is(SupportedWindowsNamespace);
const isUsesPosixSeparator = S.is(UsesPosixSeparator);
const isUsesWindowsSeparator = S.is(UsesWindowsSeparator);
const isHasLeafSegment = S.is(HasLeafSegment);
const isWindowsSegments = S.is(WindowsSegments);
const isValidWindowsUncSegments = S.is(ValidWindowsUncSegments);

/**
 * Branded schema for Windows drive paths with a leaf segment.
 *
 * @since 0.0.0
 * @category Validation
 */
export const WindowsDrivePath = S.NonEmptyString.check(
  S.makeFilterGroup(
    [
      S.makeFilter(isSupportedWindowsNamespace, {
        identifier: $I`WindowsDrivePathSupportedNamespaceCheck`,
        title: "Windows Drive Path Supported Namespace",
        description: "A drive path that does not use an unsupported Windows namespace prefix.",
        message: "Windows drive paths must not use unsupported namespace prefixes",
      }),
      S.isPattern(windowsDrivePrefixRegExp, {
        identifier: $I`WindowsDrivePathPrefixCheck`,
        title: "Windows Drive Path Prefix",
        description: "A drive path that starts with `<letter>:`.",
        message: "Windows drive paths must start with a drive prefix like C:",
      }),
      S.makeFilter(isHasLeafSegment, {
        identifier: $I`WindowsDrivePathLeafSegmentCheck`,
        title: "Windows Drive Path Leaf Segment",
        description: "A drive path that includes a leaf segment and is not only a drive root.",
        message: "Windows drive paths must include a leaf segment",
      }),
      S.makeFilter((value: string) => pipe(Str.substring(2)(value), splitNonEmpty(/[\\/]+/), isWindowsSegments), {
        identifier: $I`WindowsDrivePathSegmentsCheck`,
        title: "Windows Drive Path Segments",
        description: "A drive path whose segments after the drive prefix are valid Windows path segments.",
        message: "Windows drive paths must contain valid Windows path segments after the drive prefix",
      }),
    ],
    {
      identifier: $I`WindowsDrivePathChecks`,
      title: "Windows Drive Path",
      description: "Checks for a Windows drive path with a leaf segment.",
    }
  )
).pipe(
  S.brand("WindowsDrivePath"),
  S.annotate(
    $I.annote("WindowsDrivePath", {
      description: "A Windows drive path with a drive prefix and at least one leaf segment.",
    })
  )
);

/**
 * Type for {@link WindowsDrivePath}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type WindowsDrivePath = typeof WindowsDrivePath.Type;

/**
 * Branded schema for Windows UNC file paths with server, share, and leaf
 * segments.
 *
 * @since 0.0.0
 * @category Validation
 */
export const WindowsUncPath = S.NonEmptyString.check(
  S.makeFilterGroup(
    [
      S.makeFilter(isSupportedWindowsNamespace, {
        identifier: $I`WindowsUncPathSupportedNamespaceCheck`,
        title: "Windows UNC Path Supported Namespace",
        description: "A UNC path that does not use an unsupported Windows namespace prefix.",
        message: "Windows UNC paths must not use unsupported namespace prefixes",
      }),
      S.isPattern(windowsUncPrefixRegExp, {
        identifier: $I`WindowsUncPathPrefixCheck`,
        title: "Windows UNC Path Prefix",
        description: "A UNC path that starts with two leading backslashes.",
        message: "Windows UNC paths must start with \\\\",
      }),
      S.makeFilter(P.not(isUsesPosixSeparator), {
        identifier: $I`WindowsUncPathNoPosixSeparatorCheck`,
        title: "Windows UNC Path No Posix Separator",
        description: "A UNC path that does not contain the POSIX separator /.",
        message: "Windows UNC paths must not contain /",
      }),
      S.makeFilter(isHasLeafSegment, {
        identifier: $I`WindowsUncPathLeafSegmentCheck`,
        title: "Windows UNC Path Leaf Segment",
        description: "A UNC path that includes a leaf segment and is not only a UNC root.",
        message: "Windows UNC paths must include a leaf segment",
      }),
      S.makeFilter(flow(Str.substring(2), splitNonEmpty(/\\+/), isValidWindowsUncSegments), {
        identifier: $I`WindowsUncPathSegmentsCheck`,
        title: "Windows UNC Path Segments",
        description: "A UNC path whose segments form `[server, share, ...rest]` with valid Windows path segments.",
        message: "Windows UNC paths must include valid server, share, and leaf segments",
      }),
    ],
    {
      identifier: $I`WindowsUncPathChecks`,
      title: "Windows UNC Path",
      description: "Checks for a Windows UNC file path.",
    }
  )
).pipe(
  S.brand("WindowsUncPath"),
  S.annotate(
    $I.annote("WindowsUncPath", {
      description: "A Windows UNC file path with valid server, share, and leaf segments.",
    })
  )
);

/**
 * Type for {@link WindowsUncPath}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type WindowsUncPath = typeof WindowsUncPath.Type;

const isWindowsDrivePrefix = matchesPattern(windowsDrivePrefixRegExp);

/**
 * Branded schema for Windows relative paths that use backslash separators and
 * include a leaf segment.
 *
 * @since 0.0.0
 * @category Validation
 */
export const WindowsRelativePath = S.NonEmptyString.check(
  S.makeFilterGroup(
    [
      S.makeFilter(isSupportedWindowsNamespace, {
        identifier: $I`WindowsRelativePathSupportedNamespaceCheck`,
        title: "Windows Relative Path Supported Namespace",
        description: "A Windows relative path that does not use an unsupported namespace prefix.",
        message: "Windows relative paths must not use unsupported namespace prefixes",
      }),
      S.makeFilter(isUsesWindowsSeparator, {
        identifier: $I`WindowsRelativePathWindowsSeparatorCheck`,
        title: "Windows Relative Path Uses Windows Separator",
        description: "A Windows relative path that contains at least one backslash separator.",
        message: "Windows relative paths must contain a Windows separator",
      }),
      S.makeFilter(P.not(isUsesPosixSeparator), {
        identifier: $I`WindowsRelativePathNoPosixSeparatorCheck`,
        title: "Windows Relative Path No Posix Separator",
        description: "A Windows relative path that does not contain the POSIX separator /.",
        message: "Windows relative paths must not contain /",
      }),
      S.makeFilter(P.not(Str.startsWith("\\\\")), {
        identifier: $I`WindowsRelativePathNotUncCheck`,
        title: "Windows Relative Path Not UNC",
        description: "A Windows relative path that does not start with a UNC prefix.",
        message: "Windows relative paths must not start with \\\\",
      }),
      S.makeFilter(P.not(isWindowsDrivePrefix), {
        identifier: $I`WindowsRelativePathNotDrivePrefixedCheck`,
        title: "Windows Relative Path Not Drive Prefixed",
        description: "A Windows relative path that does not begin with a drive prefix.",
        message: "Windows relative paths must not start with a drive prefix like C:",
      }),
      S.makeFilter(isHasLeafSegment, {
        identifier: $I`WindowsRelativePathLeafSegmentCheck`,
        title: "Windows Relative Path Leaf Segment",
        description: "A Windows relative path that includes a leaf segment and does not end with a separator.",
        message: "Windows relative paths must include a leaf segment",
      }),
      S.makeFilter(flow(splitNonEmpty(/\\+/), isWindowsSegments), {
        identifier: $I`WindowsRelativePathSegmentsCheck`,
        title: "Windows Relative Path Segments",
        description: "A Windows relative path whose segments are valid Windows path segments.",
        message: "Windows relative paths must contain valid Windows path segments",
      }),
    ],
    {
      identifier: $I`WindowsRelativePathChecks`,
      title: "Windows Relative Path",
      description: "Checks for a Windows relative path that uses backslashes and contains a leaf segment.",
    }
  )
).pipe(
  S.brand("WindowsRelativePath"),
  S.annotate(
    $I.annote("WindowsRelativePath", {
      description: "A Windows relative path that uses backslashes and contains a leaf segment.",
    })
  )
);

/**
 * Type for {@link WindowsRelativePath}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type WindowsRelativePath = typeof WindowsRelativePath.Type;

const SupportedPathFamilyKit = LiteralKit([
  "posixAbsolute",
  "posixRelative",
  "windowsDrive",
  "windowsUnc",
  "windowsRelative",
] as const);

/**
 * Literal union of file-path families recognized by {@link FilePath}.
 *
 * @since 0.0.0
 * @category Validation
 */
export const SupportedPathFamily = SupportedPathFamilyKit.annotate(
  $I.annote("SupportedPathFamily", {
    description: "The supported filesystem path families recognized by FilePath.",
  })
);

/**
 * Type for {@link SupportedPathFamily}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type SupportedPathFamily = typeof SupportedPathFamily.Type;

const isWindowsDrivePath = S.is(WindowsDrivePath);
const isWindowsUncPath = S.is(WindowsUncPath);
const isWindowsRelativePath = S.is(WindowsRelativePath);
const isHasNullByte = S.is(HasNullByte);

const classifyPathFamily = Match.type<string>().pipe(
  Match.when(Str.startsWith("\\\\"), SupportedPathFamilyKit.thunk.windowsUnc),
  Match.when(isWindowsDrivePrefix, SupportedPathFamilyKit.thunk.windowsDrive),
  Match.whenAnd(isUsesPosixSeparator, Str.startsWith("/"), SupportedPathFamilyKit.thunk.posixAbsolute),
  Match.when(isUsesPosixSeparator, SupportedPathFamilyKit.thunk.posixRelative),
  Match.when(isUsesWindowsSeparator, SupportedPathFamilyKit.thunk.windowsRelative),
  Match.orElse(SupportedPathFamilyKit.thunk.posixRelative)
);

const matchesSupportedPathFamily = (value: string): boolean =>
  isSupportedWindowsNamespace(value) &&
  SupportedPathFamilyKit.$match(classifyPathFamily(value), {
    posixAbsolute: thunkTrue,
    posixRelative: thunkTrue,
    windowsDrive: () => isWindowsDrivePath(value),
    windowsUnc: () => isWindowsUncPath(value),
    windowsRelative: () => isWindowsRelativePath(value),
  });

const FilePathChecks = S.makeFilterGroup(
  [
    S.isNonEmpty({
      identifier: $I`FilePathNonEmptyCheck`,
      title: "File Path Non-empty",
      description: "A file path string that is not empty.",
      message: "File path must not be empty",
    }),
    S.makeFilter(P.not(isHasNullByte), {
      identifier: $I`FilePathNoNullByteCheck`,
      title: "File Path No Null Byte",
      description: "A file path string without embedded NUL bytes.",
      message: "File path must not contain embedded NUL bytes",
    }),
    S.makeFilter(isHasLeafSegment, {
      identifier: $I`FilePathHasLeafSegmentCheck`,
      title: "File Path Has Leaf Segment",
      description: "A file path string that includes a leaf segment and is not just a root.",
      message: "File path must include a leaf segment",
    }),
    S.makeFilter(matchesSupportedPathFamily, {
      identifier: $I`FilePathSupportedFamilyCheck`,
      title: "File Path Supported Family",
      description: "A file path string that matches a supported POSIX or Windows path family.",
      message: "File path must use supported POSIX or Windows file path syntax",
    }),
  ],
  {
    identifier: $I`FilePathChecks`,
    title: "File Path",
    description: "Checks for a file path string accepted by at least one supported filesystem path family.",
  }
);

/**
 * Branded schema for file path strings that are valid on at least one major OS.
 *
 * @since 0.0.0
 * @category Validation
 */
export const FilePath = S.String.check(FilePathChecks).pipe(
  S.brand("FilePath"),
  S.annotate(
    $I.annote("FilePath", {
      description: "A file path string valid for at least one supported operating-system path family.",
    })
  )
);

/**
 * Type for {@link FilePath}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type FilePath = typeof FilePath.Type;
