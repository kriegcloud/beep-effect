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
import { RootState } from "../../store/store"

export const selectEndpoints = (state: RootState) => state.form.endpoints;
export const selectSchemas = (state: RootState) => state.form.schemas;
export const selectOpenapi = (state: RootState) => state.form.openapi;
export const selectActiveTab = (state: RootState) => state.form.activeTab;
export const selectActiveMethod = (state: RootState) => state.form.activeMethod;
export const selectFullPath = (state: RootState) => state.form.fullPath;
export const selectResponse = (state: RootState) => state.form.response;
export const selectInputParams = (state: RootState) => state.form.inputParams;
export const selectInputValues = (state: RootState) => state.form.inputValues;
export const selectImageData = (state: RootState) => state.form.imageData;
export const selectSelectedUnionTypes = (state: RootState) => state.form.selectedUnionTypes;
export const selectAvailableHeaders = (state: RootState) => state.form.availableHeaders;
export const selectParamFormErrors = (state: RootState) => state.form.paramFormErrors;
export const selectRequestFormErrors = (state: RootState) => state.form.requestFormErrors;