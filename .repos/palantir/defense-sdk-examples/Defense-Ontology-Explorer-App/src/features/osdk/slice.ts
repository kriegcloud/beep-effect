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
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DomainCategory, DomainMetadata, OsdkState } from "./types";
import { DOMAIN_INTERFACE_MAPPINGS } from "./domainMappings";

// Create static domain map from the generated mappings
const staticDomainMap: { [key in DomainCategory]?: DomainMetadata } = {
  [DomainCategory.targetingFires]: {
    title: "Targeting and Fires",
    description: "Domain for targeting, fires, and collateral concerns",
    interfaces: DOMAIN_INTERFACE_MAPPINGS["Targeting and Fires"],
    status: "tag-add",
  },
  [DomainCategory.protection]: {
    title: "Protection",
    description: "Domain for protection and defensive measures",
    interfaces: DOMAIN_INTERFACE_MAPPINGS["Protection"],
    status: "tag-add",
  },
  [DomainCategory.sustainment]: {
    title: "Sustainment",
    description: "Domain for sustainment, logistics, and unit management",
    interfaces: DOMAIN_INTERFACE_MAPPINGS["Sustainment"],
    status: "tag-add",
  },
  [DomainCategory.missionPlanning]: {
    title: "Mission Planning",
    description: "Domain for mission planning and task management",
    interfaces: DOMAIN_INTERFACE_MAPPINGS["Mission Planning"],
    status: "tag-add",
  },
  [DomainCategory.orderOfBattle]: {
    title: "Order of Battle",
    description: "Domain for order of battle and equipment tracking",
    interfaces: DOMAIN_INTERFACE_MAPPINGS["Order of Battle"],
    status: "tag-add",
  },
  [DomainCategory.intelligence]: {
    title: "Intelligence",
    description: "Domain for intelligence gathering and analysis",
    interfaces: DOMAIN_INTERFACE_MAPPINGS["Intelligence"],
    status: "tag-add",
  },
};

const initialState: OsdkState = {
  selectedDomain: null as DomainCategory | null,
  domainMap: staticDomainMap,
  errors: {
    fetchDomains: null,
    fetchInterfaceObjects: null,
    fetchFullObject: null,
  },
  selectedInterface: null,
  selectedObjectType: null,
  selectedObjectPrimaryKey: null,
  selectedObject: null,
  interfaceObjects: [],
  loadingInterfaces: false,
  loadingObjectTypes: false,
  loadingObjects: false,
  loadingObjectDetails: false,
};

const osdkSlice = createSlice({
  name: "osdk",
  initialState,
  reducers: {
    setSelectedDomain(state, action: PayloadAction<DomainCategory | null>) {
      state.selectedDomain = action.payload;
    },
    fetchDomainsStart(state) {
      // No longer needed - using static mappings
      state.loadingInterfaces = false;
      state.errors.fetchDomains = null;
    },
    fetchDomainsSuccess(
      state,
      action: PayloadAction<{ [key in DomainCategory]?: DomainMetadata }>
    ) {
      // No longer needed - using static mappings
      state.loadingInterfaces = false;
    },
    fetchDomainsFailure(state, action: PayloadAction<string>) {
      state.errors.fetchDomains = action.payload;
      state.loadingInterfaces = false;
    },
    setSelectedInterface(state, action: PayloadAction<string | null>) {
      state.selectedInterface = action.payload;
      state.selectedObjectType = null;
      state.selectedObject = null;
      state.selectedObjectPrimaryKey = null;
    },
    setSelectedObjectPrimaryKey(state, action: PayloadAction<string | null>) {
      state.selectedObjectPrimaryKey = action.payload;
    },
    setSelectedObjectType(state, action: PayloadAction<string | null>) {
      state.selectedObjectType = action.payload;
      state.selectedObject = null;
      state.selectedObjectPrimaryKey = null;
      state.loadingObjectTypes = true;
    },
    fetchInterfaceObjectsStart(state) {
      state.loadingObjectTypes = true;
      state.errors.fetchInterfaceObjects = null;
    },
    fetchInterfaceObjectsSuccess(state, action: PayloadAction<any[]>) {
      state.interfaceObjects = action.payload;
      state.loadingObjectTypes = false;
    },
    fetchInterfaceObjectsFailure(state, action: PayloadAction<string>) {
      state.errors.fetchInterfaceObjects = action.payload;
      state.loadingObjectTypes = false;
      state.interfaceObjects = [];
    },
    fetchFullObjectStart(state) {
      state.loadingObjectDetails = true;
    },
    fetchFullObjectSuccess(
      state,
      action: PayloadAction<any & { mediaContent: string | null }>
    ) {
      state.selectedObject = action.payload;
      state.loadingObjects = false;
      state.loadingObjectDetails = false;
    },
    fetchFullObjectFailure(state, action: PayloadAction<string>) {
      state.errors.fetchFullObject = action.payload;
      state.loadingObjects = false;
      state.loadingObjectDetails = false;
    },
    resetLoadingStates(state) {
      state.loadingObjects = false;
      state.loadingObjectDetails = false;
    },
    clearErrors(state) {
      state.errors = {
        fetchDomains: null,
        fetchInterfaceObjects: null,
        fetchFullObject: null,
      };
    },
  },
});

export const {
  setSelectedDomain,
  fetchDomainsStart,
  fetchDomainsSuccess,
  fetchDomainsFailure,
  setSelectedInterface,
  setSelectedObjectType,
  setSelectedObjectPrimaryKey,
  fetchInterfaceObjectsStart,
  fetchInterfaceObjectsSuccess,
  fetchInterfaceObjectsFailure,
  fetchFullObjectStart,
  fetchFullObjectSuccess,
  fetchFullObjectFailure,
  resetLoadingStates,
  clearErrors,
} = osdkSlice.actions;

export default osdkSlice.reducer;
