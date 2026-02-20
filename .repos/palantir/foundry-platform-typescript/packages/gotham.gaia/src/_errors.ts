/*
 * Copyright 2024 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export type LooselyBrandedString<T extends string> = string & {
  __LOOSE_BRAND?: T;
};

/**
 * Could not addArtifactsTo the Map.
 *
 * Log Safety: SAFE
 */
export interface AddArtifactsToMapPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "AddArtifactsToMapPermissionDenied";
  errorDescription: "Could not addArtifactsTo the Map.";
  errorInstanceId: string;
  parameters: {
    mapRid: unknown;
  };
}

/**
 * Failed to convert MapAppData from artifact appData to gaia MapAppData
 *
 * Log Safety: SAFE
 */
export interface ErrorConvertingAppData {
  errorCode: "INTERNAL";
  errorName: "ErrorConvertingAppData";
  errorDescription:
    "Failed to convert MapAppData from artifact appData to gaia MapAppData";
  errorInstanceId: string;
  parameters: {
    mapId: unknown;
  };
}

/**
 * Failed to export map.
 *
 * Log Safety: SAFE
 */
export interface ErrorExporting {
  errorCode: "INTERNAL";
  errorName: "ErrorExporting";
  errorDescription: "Failed to export map.";
  errorInstanceId: string;
  parameters: {
    mapId: unknown;
  };
}

/**
 * Failed to export symbol.
 *
 * Log Safety: SAFE
 */
export interface ErrorExportingSymbol {
  errorCode: "INTERNAL";
  errorName: "ErrorExportingSymbol";
  errorDescription: "Failed to export symbol.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * Expected a map Gid.
 *
 * Log Safety: SAFE
 */
export interface ExpectedMapGid {
  errorCode: "INVALID_ARGUMENT";
  errorName: "ExpectedMapGid";
  errorDescription: "Expected a map Gid.";
  errorInstanceId: string;
  parameters: {
    mapId: unknown;
  };
}

/**
 * Url Symbol not supported, must be either IconSymbol or MilsymSymbol.
 *
 * Log Safety: SAFE
 */
export interface InvalidUrlSymbol {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidUrlSymbol";
  errorDescription:
    "Url Symbol not supported, must be either IconSymbol or MilsymSymbol.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * Could not loadLayers the Map.
 *
 * Log Safety: SAFE
 */
export interface LoadLayersMapPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "LoadLayersMapPermissionDenied";
  errorDescription: "Could not loadLayers the Map.";
  errorInstanceId: string;
  parameters: {
    mapRid: unknown;
  };
}

/**
 * Could not load the Map.
 *
 * Log Safety: SAFE
 */
export interface LoadMapPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "LoadMapPermissionDenied";
  errorDescription: "Could not load the Map.";
  errorInstanceId: string;
  parameters: {
    mapRid: unknown;
  };
}

/**
 * Could not loadWithExtension the Map.
 *
 * Log Safety: SAFE
 */
export interface LoadWithExtensionMapPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "LoadWithExtensionMapPermissionDenied";
  errorDescription: "Could not loadWithExtension the Map.";
  errorInstanceId: string;
  parameters: {
    mapRid: unknown;
  };
}

/**
 * Map not found
 *
 * Log Safety: SAFE
 */
export interface MapNotFound {
  errorCode: "NOT_FOUND";
  errorName: "MapNotFound";
  errorDescription: "Map not found";
  errorInstanceId: string;
  parameters: {
    mapId: unknown;
  };
}

/**
 * Could not renderSymbol the Map.
 *
 * Log Safety: SAFE
 */
export interface RenderSymbolMapPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "RenderSymbolMapPermissionDenied";
  errorDescription: "Could not renderSymbol the Map.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * Could not search the Map.
 *
 * Log Safety: SAFE
 */
export interface SearchMapsPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "SearchMapsPermissionDenied";
  errorDescription: "Could not search the Map.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * Unknown symbol type not supported, must be either IconSymbol or MilsymSymbol.
 *
 * Log Safety: UNSAFE
 */
export interface UnknownSymbolType {
  errorCode: "INVALID_ARGUMENT";
  errorName: "UnknownSymbolType";
  errorDescription:
    "Unknown symbol type not supported, must be either IconSymbol or MilsymSymbol.";
  errorInstanceId: string;
  parameters: {
    unknownType: unknown;
  };
}
