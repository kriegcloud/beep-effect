/*
 * (c) Copyright 2025 Palantir Technologies Inc. All rights reserved.
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

// This file contains the mapping between operation IDs and their corresponding operation names

/**
 * Interface for operation mapping
 */
export interface OperationMapping {
  [operationId: string]: string;
}

/**
 * Mapping from operationId to operationName
 * This should be updated whenever new operations are added to the API
 */
export const operationIdToNameMap: OperationMapping = {
  // Geotime operations
  "geotimeWriteObservations": "Write observations",
  "geotimeSearchObservationHistories": "Search observation histories",
  "geotimeSearchLatestObservations": "Search latest observations",
  "geotimeLinkTrackAndObject": "Link track to object",
  "geotimeLinkTracks": "Link tracks",
  "geotimeUnlinkTrackAndObject": "Unlink track to object",
  "geotimeUnlinkTracks": "Unlink tracks",
  
  // Maps operations
  "mapRenderingRenderObjects": "Rendering Foundry Objects",
  "mapRenderingLoadResourceTile": "Load Tile",
  "mapRenderingLoadGenericSymbol": "Load Generic Symbol",
  "gaiaSearchMaps": "Search Maps",
  "gaiaLoadMap": "Load a Map",
  "gaiaLoadLayers": "Load Map Layers",
  "gaiaLoadMapWithExtension": "Load a Map With Extension Metadata",
  "gaiaRenderSymbol": "Rendering Symbology",
  "gaiaExportKmz": "Export Map as KMZ",
  "gaiaAddArtifactsToMap": "Add Artifacts To Map",
  "gaiaAddEmlsToMap": "Add Enterprise Map Layers To Map",
  "gaiaAddObjectsToMap": "Add Objects To Map",
  
  // Targets operations
  "targetWorkbenchLoadTargetPucks": "Load Target Pucks",
  "targetWorkbenchCreateTargetIntelV2": "Create Intel on a Target",
  "targetWorkbenchCreateHptlV2": "Create a HighPriorityTargetList",
  "targetWorkbenchLoadHptlV2": "Load a HighPriorityTargetList",
  "targetWorkbenchModifyHptlV2": "Modify a HighPriorityTargetList",
  "targetWorkbenchModifyTargetIntel": "Modify Intel on a Target",
  "targetWorkbenchRemoveTargetIntelV2": "Remove Intel From a Target",
  "targetWorkbenchSetTargetColumnV2": "Set the Target on a Column",
  "targetWorkbenchCreateTargetV2": "Create a Target",
  "targetWorkbenchLoadTargetV2": "Load a Target",
  "targetWorkbenchModifyTargetV2": "Modify a Target",
  "targetWorkbenchArchiveTargetV2": "Archive a Target",
  "targetWorkbenchCreateTargetBoardV2": "Create a Target Board",
  "targetWorkbenchLoadTargetBoardV2": "Load a Target Board",
  "targetWorkbenchModifyTargetBoardV2": "Modify a Target Board",
  "targetWorkbenchArchiveTargetBoardV2": "Archive a Target Board"
};

/**
 * Get the operation name for a given operation ID
 * If no mapping is found, returns the operation ID itself with spaces inserted before capital letters
 * 
 * @param operationId The operation ID to get the name for
 * @returns The operation name if found, or a formatted version of the operation ID
 */
export function getOperationName(operationId: string): string {
  if (operationIdToNameMap[operationId]) {
    return operationIdToNameMap[operationId];
  }
  
  // Otherwise, format the operation ID by inserting spaces before capital letters
  // and remove the first word
  let operationName = operationId.replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase());
  
  // If it ends with "V\d", remove the last word
  const regex = /V\d$/;
  if (regex.test(operationName)) {
    operationName = operationName.replace(/\s+V\d$/, '');
  }
  
  return operationName;
}