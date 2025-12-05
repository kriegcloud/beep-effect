import type { FileUploadDataWithCustomId, NewPresignedUrl, UploadActionPayload } from "./shared-schemas";

export type UTRegionAlias = "bom1" | "icn1" | "syd1" | "can1" | "fra1" | "zrh1" | "dub1" | "cle1" | "sfo1" | "sea1";

/**
 * Marker used to select the region based on the incoming request
 */
export const UTRegion = Symbol("uploadthing-region-symbol");

/**
 * Marker used to append a `customId` to the incoming file data in `.middleware()`
 * @example
 * ```ts
 * .middleware((opts) => {
 *   return {
 *     [UTFiles]: opts.files.map((file) => ({
 *       ...file,
 *       customId: generateId(),
 *     }))
 *   };
 * })
 * ```
 */
export const UTFiles = Symbol("uploadthing-custom-id-symbol");

export type UnsetMarker = "unsetMarker" & {
  __brand: "unsetMarker";
};

export type ValidMiddlewareObject = {
  [UTRegion]?: UTRegionAlias;
  [UTFiles]?: Partial<FileUploadDataWithCustomId>[];
  [key: string]: unknown;
};

export interface AnyParams {
  _routeOptions: any;
  _input: {
    in: any;
    out: any;
  };
  _metadata: any; // imaginary field used to bind metadata return type to an Upload resolver
  _adapterFnArgs: Record<string, unknown>;
  _errorShape: any;
  _errorFn: any; // used for onUploadError
  _output: any;
}

/**
 * Map actionType to the required payload for that action
 * @todo Look into using @effect/rpc :thinking:
 */
export type UTEvents = {
  upload: {
    in: UploadActionPayload;
    out: ReadonlyArray<NewPresignedUrl>;
  };
};

/**
 * Result from the PUT request to the UploadThing Ingest server
 */
export type UploadPutResult<TServerOutput = unknown> = {
  ufsUrl: string;
  /**
   * @deprecated
   * This field will be removed in uploadthing v9. Use `ufsUrl` instead.
   */
  url: string;
  /**
   * @deprecated
   * This field will be removed in uploadthing v9. Use `ufsUrl` instead.
   */
  appUrl: string;
  fileHash: string;
  serverData: TServerOutput;
};
