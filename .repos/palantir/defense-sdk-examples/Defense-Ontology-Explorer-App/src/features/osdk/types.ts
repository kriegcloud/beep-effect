/*
 * (c) Copyright 2024 Palantir Technologies Inc. All rights reserved.
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
export enum OntologyCategory {
  DEFENSE = "Defense Ontology",
  NOTIONAL = "Notional",
  YOUR = "Your Ontology",
}

export enum DomainCategory {
  targetingFires = "Targeting and Fires",
  protection = "Protection",
  sustainment = "Sustainment",
  missionPlanning = "Mission Planning",
  orderOfBattle = "Order of Battle",
  intelligence = "Intelligence",
}

export interface DomainMetadata {
  title: string;
  description: string;
  interfaces: readonly string[];
  status: string;
}

export interface OsdkState {
  selectedDomain: DomainCategory | null;
  domainMap: { [key in DomainCategory]?: DomainMetadata };
  errors: {
    fetchDomains: string | null;
    fetchInterfaceObjects: string | null;
    fetchFullObject: string | null;
  };
  selectedInterface: string | null;
  selectedObjectType: string | null;
  selectedObjectPrimaryKey: string | null;
  selectedObject: (any & { mediaContent: string | null }) | null;
  interfaceObjects: any[];
  loadingInterfaces: boolean;
  loadingObjectTypes: boolean;
  loadingObjects: boolean;
  loadingObjectDetails: boolean;
}

// Type-safe domain mapping based on generated mappings
export type DomainKey =
  keyof typeof import("./domainMappings").DOMAIN_INTERFACE_MAPPINGS;
export type InterfaceList<T extends DomainKey> =
  typeof import("./domainMappings").DOMAIN_INTERFACE_MAPPINGS[T];
