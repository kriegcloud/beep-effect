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
import { RootState } from "../../store/store";

export const selectDomainMap = (state: RootState) => state.osdk.domainMap;
export const selectSelectedDomain = (state: RootState) =>
  state.osdk.selectedDomain;
export const selectSelectedInterface = (state: RootState) =>
  state.osdk.selectedInterface;
export const selectSelectedObjectType = (state: RootState) =>
  state.osdk.selectedObjectType;
export const selectSelectedObjectPrimaryKey = (state: RootState) =>
  state.osdk.selectedObjectPrimaryKey;
export const selectSelectedObject = (state: RootState) =>
  state.osdk.selectedObject;
export const selectInterfaceObjects = (state: RootState) =>
  state.osdk.interfaceObjects;
export const selectLoadingInterfaces = (state: RootState) =>
  state.osdk.loadingInterfaces;
export const selectLoadingObjectTypes = (state: RootState) =>
  state.osdk.loadingObjectTypes;
export const selectLoadingObjects = (state: RootState) =>
  state.osdk.loadingObjects;
export const selectLoadingObjectDetails = (state: RootState) =>
  state.osdk.loadingObjectDetails;
export const selectErrors = (state: RootState) => state.osdk.errors;
export const selectFetchDomainsError = (state: RootState) =>
  state.osdk.errors.fetchDomains;
export const selectFetchInterfaceObjectsError = (state: RootState) =>
  state.osdk.errors.fetchInterfaceObjects;
export const selectFetchFullObjectError = (state: RootState) =>
  state.osdk.errors.fetchFullObject;
