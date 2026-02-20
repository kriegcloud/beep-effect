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

export function getNamespacePlatform(ns?: string): string {
  if (!ns) {
    return "foundry";
  }

  const namespaceMapping: {
    [key: string]: "foundry" | "gotham" | "both" | "skipped";
  } = {
    "Core": "both",
    "TargetWorkbench": "gotham",
    "Gaia": "gotham",
    "MapRendering": "gotham",
    "Geojson": "gotham",
    "Admin": "foundry",
    "AipAgents": "foundry",
    "Appkit": "skipped",
    "Audit": "foundry",
    "Checkpoints": "foundry",
    "Connectivity": "foundry",
    "DataHealth": "foundry",
    "Datasets": "foundry",
    "Filesystem": "foundry",
    "Functions": "foundry",
    "Geo": "foundry",
    "LanguageModels": "foundry",
    "MediaSets": "foundry",
    "Models": "foundry",
    "Notepad": "foundry",
    "Ontologies": "foundry",
    "Operations": "foundry",
    "Orchestration": "foundry",
    "Pack": "foundry",
    "PublicApis": "foundry",
    "SqlQueries": "foundry",
    "Streams": "foundry",
    "ThirdPartyApplications": "foundry",
    "Widgets": "foundry",
  };

  const platform = namespaceMapping[ns];
  if (platform === undefined) {
    throw new Error(
      `Unknown namespace "${ns}". Add it to the namespace mapping in getNamespacePlatform.ts`,
    );
  }

  return platform;
}
