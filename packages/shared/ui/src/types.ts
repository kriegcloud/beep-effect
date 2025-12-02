import type { BS } from "@beep/schema";
import type { DeepPartial } from "@beep/types/common.types";
export type Overwrite<T, U> = Omit<T, keyof U> & U;
export type ErrorMessage<TError extends string> = TError;
export type MaybePromise<TType> = TType | Promise<TType>;
export type ExtendObjectIf<Predicate, ToAdd> = undefined extends Predicate ? {} : ToAdd;

export interface FileProperties {
  readonly name: string;
  readonly size: number;
  readonly type: string;
  readonly lastModified?: number | undefined;
}

export type ExtractHashPartsFn = (file: FileProperties) => Array<string | number | undefined | null | boolean>;

/**
 * A subset of the standard RequestInit properties needed by UploadThing internally.
 * @see RequestInit from lib.dom.d.ts
 */
export interface RequestInitEsque {
  /**
   * Sets the request's body.
   */
  readonly body?: undefined | (FormData | ReadableStream | string | null);

  /**
   * Sets the request's associated headers.
   */
  readonly headers?: undefined | [string, string][] | Record<string, string>;

  /**
   * The request's HTTP-style method.
   */
  readonly method?: undefined | string;
}

/**
 * A subset of the standard Response properties needed by UploadThing internally.
 * @see Response from lib.dom.d.ts
 */
export interface ResponseEsque {
  readonly status: number;
  readonly statusText: string;
  readonly ok: boolean;
  /**
   * @remarks
   * The built-in Response::json() method returns Promise<any>, but
   * that's not as type-safe as unknown. We use unknown because we're
   * more type-safe. You do want more type safety, right? 😉
   */
  readonly json: <T = unknown>() => Promise<T>;
  readonly text: () => Promise<string>;
  readonly blob: () => Promise<Blob>;
  readonly body: ReadableStream | null;

  readonly headers: Headers;

  readonly clone: () => ResponseEsque;
}

export type MaybeUrl = string | URL;

/**
 * A subset of the standard fetch function type needed by UploadThing internally.
 * @see fetch from lib.dom.d.ts
 */
export type FetchEsque = (
  input: RequestInfo | MaybeUrl,
  init?: RequestInit | RequestInitEsque
) => Promise<ResponseEsque>;

type PowOf2 = 1 | 2 | 4 | 8 | 16 | 32 | 64 | 128 | 256 | 512 | 1024;
export type SizeUnit = "B" | "KB" | "MB" | "GB";
export type FileSize = `${PowOf2}${SizeUnit}`;

export type TimeShort = "s" | "m" | "h" | "d";
export type TimeLong = "second" | "minute" | "hour" | "day";
type SuggestedNumbers = 2 | 3 | 4 | 5 | 6 | 7 | 10 | 15 | 30 | 60;
type AutoCompleteableNumber = SuggestedNumbers | (number & {});
export type Time =
  | number
  | `1${TimeShort}`
  | `${AutoCompleteableNumber}${TimeShort}`
  | `1 ${TimeLong}`
  | `${AutoCompleteableNumber} ${TimeLong}s`;

export const ValidContentDispositions = ["inline", "attachment"] as const;
export type ContentDisposition = (typeof ValidContentDispositions)[number];

export const ValidACLs = ["public-read", "private"] as const;
export type ACL = (typeof ValidACLs)[number];

type ImageProperties = {
  /** Specify the width of the image. */
  width?: number;
  /** Specify the height of the image. */
  height?: number;
  /**
   * Specify the aspect ratio of the image.
   * @remarks If both width and height are specified, this will be ignored.
   */
  aspectRatio?: number;
};

type AdditionalProperties<T> = Record<string, unknown> & T;

export type RouteConfig<TAdditionalProperties extends Record<string, unknown>> = {
  /**
   * Human-readable file size limit
   * @example "1MB"
   * @default https://docs.uploadthing.com/api-reference/server#defaults
   */
  readonly maxFileSize: FileSize;
  /**
   * Maximum number of files allowed to be uploaded of this type
   * @example 10
   * @default https://docs.uploadthing.com/api-reference/server#defaults
   */
  readonly maxFileCount: number;
  /**
   * Minimum number of files allowed to be uploaded of this type
   * @remarks Must be <= maxFileCount
   * @example 2
   * @default 1
   */
  readonly minFileCount: number;
  /**
   * Specify the [content disposition](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Disposition) of the uploaded file
   * @example "attachment"
   * @default "inline"
   */
  readonly contentDisposition: ContentDisposition;
  /**
   * Specify the [access control list](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin) of the uploaded file
   * @remarks This must be enabled for your app. See https://docs.uploadthing.com/regions-and-acl#access-controls.
   * @example "private"
   * @default "public-read"
   */
  readonly acl?: undefined | ACL;
  /**
   * Additional properties to be passed to the client-side `useRouteConfig` hook
   * @remarks These properties are not validated on the server on upload
   */
  readonly additionalProperties?: AdditionalProperties<TAdditionalProperties>;
};

/**
 * Shared config options for an entire route not bound to any specific file type
 * @example
 * ```ts
 * f(
 *   { image: {} },
 *   { awaitServerData: true },
 * )
 * ```
 */
export type RouteOptions = {
  /**
   * Set this to `false` to run the client-side `onClientUploadComplete`
   * immediately after file has been uploaded without waiting for the
   * server to return the `onUploadComplete` data.
   * @default true
   */
  readonly awaitServerData?: undefined | boolean;
  /**
   * TTL for the presigned URLs generated for the upload
   * @default `1h`
   */
  readonly presignedURLTTL?: undefined | Time;
  /**
   * Function that pulls out the properties of the uploaded file
   * that you want to be included as part of the presigned URL generation.
   * By default, we include all properties as well as a timestamp to make
   * each URL unique. You can for example override this to always return
   * the same hash for the same file, no matter when it was uploaded.
   * @default (file) => [file.name, file.size, file.type, file.lastModified,  Date.now()]
   */
  readonly getFileHashParts?: undefined | ExtractHashPartsFn;
};

export type FileRouterInputKey = BS.FileType.Type | BS.MimeType.Type;

export type ExpandedRouteConfig = {
  [key in FileRouterInputKey]?: key extends `image${string}`
    ? RouteConfig<ImageProperties>
    : RouteConfig<Record<string, unknown>>;
};

export type EndpointMetadata = {
  readonly slug: string;
  readonly config: ExpandedRouteConfig;
}[];

export type FileRouterInputConfig = FileRouterInputKey[] | DeepPartial<ExpandedRouteConfig>;
