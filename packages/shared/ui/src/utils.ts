import { BS } from "@beep/schema";
import { noOp } from "@beep/utils";
import { Effect, pipe, Struct } from "effect";
import * as A from "effect/Array";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as Str from "effect/String";
import {
  InvalidFileSizeError,
  InvalidFileTypeError,
  InvalidRouteConfigError,
  InvalidURLError,
  UnknownFileTypeError,
} from "./tagged-errors";
import type {
  ExpandedRouteConfig,
  FileProperties,
  FileRouterInputConfig,
  FileRouterInputKey,
  FileSize,
  ResponseEsque,
  RouteConfig,
  Time,
  TimeShort,
} from "./types";

export function isRouteArray(routeConfig: FileRouterInputConfig): routeConfig is FileRouterInputKey[] {
  return A.isArray(routeConfig);
}

export function getDefaultSizeForType(fileType: FileRouterInputKey): FileSize {
  if (fileType === "image") return "4MB";
  if (fileType === "video") return "16MB";
  if (fileType === "audio") return "8MB";
  if (fileType === "blob") return "8MB";
  if (fileType === "pdf") return "4MB";
  if (fileType === "text") return "64KB";

  return "4MB";
}

export function getDefaultRouteConfigValues(type: FileRouterInputKey): RouteConfig<Record<string, never>> {
  return {
    maxFileSize: getDefaultSizeForType(type),
    maxFileCount: 1,
    minFileCount: 1,
    contentDisposition: "inline" as const,
  };
}

export const fillInputRouteConfig = (
  routeConfig: FileRouterInputConfig
): Effect.Effect<ExpandedRouteConfig, InvalidRouteConfigError> => {
  // If array, apply defaults
  if (isRouteArray(routeConfig)) {
    return Effect.succeed(
      A.reduce(routeConfig, {} as ExpandedRouteConfig, (acc, fileType) => {
        acc[fileType] = getDefaultRouteConfigValues(fileType);
        return acc;
      })
    );
  }

  // Backfill defaults onto config
  const newConfig: Record<string, unknown> = {};
  for (const key of Struct.keys(routeConfig)) {
    const value = routeConfig[key];
    if (!value) return Effect.fail(new InvalidRouteConfigError(key));
    const defaults = getDefaultRouteConfigValues(key);
    const config: Record<string, unknown> = {
      maxFileSize: value.maxFileSize ?? defaults.maxFileSize,
      maxFileCount: value.maxFileCount ?? defaults.maxFileCount,
      minFileCount: value.minFileCount ?? defaults.minFileCount,
      contentDisposition: value.contentDisposition ?? defaults.contentDisposition,
    };
    if (value.acl !== undefined) config.acl = value.acl;
    if (value.additionalProperties !== undefined) config.additionalProperties = value.additionalProperties;
    newConfig[key] = config;
  }

  // we know that the config is valid, so we can stringify it and parse it back
  // this allows us to replace numbers with "safe" equivalents
  return Effect.succeed(JSON.parse(JSON.stringify(newConfig, safeNumberReplacer)) as ExpandedRouteConfig);
};

/**
 * Match the file's type for a given allow list e.g. `image/png => image`
 * Prefers the file's type, then falls back to a extension-based lookup
 */
export const matchFileType = (
  file: FileProperties,
  allowedTypes: FileRouterInputKey[]
): Effect.Effect<FileRouterInputKey, UnknownFileTypeError | InvalidFileTypeError> => {
  // Type might be "" if the browser doesn't recognize the mime type
  const mimeType = file.type || BS.lookup(file.name);
  if (!mimeType) {
    if (A.contains("blob")(allowedTypes)) return Effect.succeed("blob");
    return Effect.fail(new UnknownFileTypeError(file.name));
  }

  // If the user has specified a specific mime type, use that
  if (A.some(allowedTypes, Str.includes("/"))) {
    if (A.contains(allowedTypes, mimeType as FileRouterInputKey)) {
      return Effect.succeed(mimeType as FileRouterInputKey);
    }
  }

  // Otherwise, we have a "magic" type eg. "image" or "video"
  const type = (
    Str.toLowerCase(mimeType) === "application/pdf" ? "pdf" : Str.split("/")(mimeType)[0]
  ) as BS.FileType.Type;

  if (!allowedTypes.includes(type)) {
    // Blob is a catch-all for any file type not explicitly supported
    if (A.contains("blob")(allowedTypes)) {
      return Effect.succeed("blob");
    }
    return Effect.fail(new InvalidFileTypeError(type, file.name));
  }

  return Effect.succeed(type);
};

export const FILESIZE_UNITS = ["B", "KB", "MB", "GB", "TB"] as const;
export type FileSizeUnit = (typeof FILESIZE_UNITS)[number];
export const fileSizeToBytes = (fileSize: FileSize): Effect.Effect<number, InvalidFileSizeError> => {
  const regex = new RegExp(`^(\\d+)(\\.\\d+)?\\s*(${pipe(FILESIZE_UNITS, A.join("|"))})$`, "i");

  // make sure the string is in the format of 123KB
  const match = fileSize.match(regex);
  if (!match?.[1] || !match[3]) {
    return Effect.fail(new InvalidFileSizeError(fileSize));
  }

  const sizeValue = Number.parseFloat(match[1]);
  const sizeUnit = pipe(match[3], Str.toUpperCase) as FileSizeUnit;
  const bytes = sizeValue * 1024 ** FILESIZE_UNITS.indexOf(sizeUnit);
  return Effect.succeed(Math.floor(bytes));
};

export const bytesToFileSize = (bytes: number) => {
  if (bytes === 0 || bytes === -1) {
    return "0B";
  }

  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(2)}${FILESIZE_UNITS[i]}`;
};

export async function safeParseJSON<T>(input: ResponseEsque): Promise<T | Error> {
  const text = await input.text();
  try {
    return JSON.parse(text) as T;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`Error parsing JSON, got '${text}'`, err);
    return new Error(`Error parsing JSON, got '${text}'`);
  }
}

export function filterDefinedObjectValues<T>(obj: Record<string, T | null | undefined>): Record<string, T> {
  return pipe(
    obj,
    Struct.entries,
    A.filter((pair): pair is [string, T] => P.isNotNullable(pair[1])),
    R.fromEntries
  );
}

export function semverLite(required: string, toCheck: string) {
  // Pull out numbers from strings like `6.0.0`, `^6.4`, `~6.4.0`
  const semverRegex = /(\d+)\.?(\d+)?\.?(\d+)?/;
  const requiredMatch = semverRegex.exec(required);
  if (!requiredMatch?.[0]) {
    throw new Error(`Invalid semver requirement: ${required}`);
  }
  const toCheckMatch = semverRegex.exec(toCheck);
  if (!toCheckMatch?.[0]) {
    throw new Error(`Invalid semver to check: ${toCheck}`);
  }

  const [_1, rMajor, rMinor, rPatch] = requiredMatch;
  const [_2, cMajor, cMinor, cPatch] = toCheckMatch;

  if (Str.startsWith("^")(required)) {
    // Major must be equal, minor must be greater or equal
    if (rMajor !== cMajor) return false;
    return !(rMinor && cMinor && rMinor > cMinor);
  }

  if (Str.startsWith("~")(required)) {
    // Major must be equal, minor must be equal
    if (rMajor !== cMajor) return false;
    return rMinor === cMinor;
  }

  // Exact match
  return rMajor === cMajor && rMinor === cMinor && rPatch === cPatch;
}

export function warnIfInvalidPeerDependency(pkg: string, required: string, toCheck: string) {
  if (!semverLite(required, toCheck)) {
    // eslint-disable-next-line no-console
    console.warn(`!!!WARNING::: ${pkg} requires "uploadthing@${required}", but version "${toCheck}" is installed`);
  }
}

export const getRequestUrl = (req: Request) =>
  Effect.gen(function* () {
    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
    const proto = req.headers.get("x-forwarded-proto") ?? "https";
    const protocol = Str.endsWith(":")(proto) ? proto : `${proto}:`;
    const url = yield* Effect.try({
      try: () => new URL(req.url, `${protocol}//${host}`),
      catch: () => new InvalidURLError(req.url),
    });
    url.search = "";
    return url;
  });

export const getFullApiUrl = (maybeUrl?: string): Effect.Effect<URL, InvalidURLError> =>
  Effect.gen(function* () {
    const base = (() => {
      if (typeof window !== "undefined") return window.location.origin;
      if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
      return "http://localhost:3000";
    })();

    const url = yield* Effect.try({
      try: () => new URL(maybeUrl ?? "/api/uploadthing", base),
      catch: () => new InvalidURLError(maybeUrl ?? "/api/uploadthing"),
    });

    if (url.pathname === "/") {
      url.pathname = "/api/uploadthing";
    }
    return url;
  });

/*
 * Returns a full URL to the dev's uploadthing endpoint
 * Can take either an origin, or a pathname, or a full URL
 * and will return the "closest" url matching the default
 * `<VERCEL_URL || localhost>/api/uploadthing`
 */
export const resolveMaybeUrlArg = (maybeUrl: string | URL | undefined): URL => {
  return maybeUrl instanceof URL ? maybeUrl : Effect.runSync(getFullApiUrl(maybeUrl));
};

export function parseTimeToSeconds(time: Time) {
  if (typeof time === "number") return time;

  const match = pipe(time, Str.split(/(\d+)/), A.filter(Boolean));
  const num = Number(match[0]);
  const unit = pipe(match[1] ?? "s", Str.trim, Str.slice(0, 1)) as TimeShort;

  const multiplier = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400,
  }[unit];

  return num * multiplier;
}

/**
 * Replacer for JSON.stringify that will replace numbers that cannot be
 * serialized to JSON with "reasonable equivalents".
 *
 * Infinity and -Infinity are replaced by MAX_SAFE_INTEGER and MIN_SAFE_INTEGER
 * NaN is replaced by 0
 *
 */
export const safeNumberReplacer = (_: string, value: unknown) => {
  if (typeof value !== "number") return value;
  if (Number.isSafeInteger(value) || (value <= Number.MAX_SAFE_INTEGER && value >= Number.MIN_SAFE_INTEGER)) {
    return value;
  }
  if (value === Number.POSITIVE_INFINITY) return Number.MAX_SAFE_INTEGER;
  if (value === Number.NEGATIVE_INFINITY) return Number.MIN_SAFE_INTEGER;
  if (Number.isNaN(value)) return 0;
  return undefined;
};

export function createIdentityProxy<TObj extends Record<string, unknown>>() {
  return new Proxy(noOp, {
    get: (_, prop) => prop,
  }) as unknown as TObj;
}

export function unwrap<T extends BS.Json.Type | PropertyKey, Param extends unknown[]>(
  x: T | ((...args: Param) => T),
  ...args: Param
) {
  return typeof x === "function" ? x(...args) : x;
}
