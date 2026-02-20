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
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FormState } from "./types";

const url = import.meta.env.VITE_FOUNDRY_API_URL;

const initialState: FormState = {
  endpoints: {},
  schemas: [],
  openapi: null,
  activeTab: null,
  activeMethod: null,
  fullPath: "",
  response: null,
  inputParams: {},
  inputValues: {},
  imageData: null,
  selectedUnionTypes: {},
  availableHeaders: [],
  paramFormErrors: {},
  requestFormErrors: {},
};

export interface UpdateParamPayload {
  paramName: string;
  value: any;
  paramType: string;
}

export interface UpdateInputValuesPayload {
  fieldPath: string;
  value: any | undefined;
  arrayIndex: number | undefined;
}

interface UpdateSelectedUnionTypesPayload {
  fieldPath: string;
  selectedType: any;
}

interface SetActiveTabPayload {
  path: string;
  method: string;
}

const formSlice = createSlice({
  name: "form",
  initialState,
  reducers: {
    setOpenapiDefinition(state, action: PayloadAction<any>) {
      state.openapi = action.payload;
      state.endpoints = action.payload.paths;
      state.schemas = action.payload.components.schemas;
    },
    setFullPath(state, action: PayloadAction<string>) {
      state.fullPath = action.payload;
    },
    setImageData(state, action: PayloadAction<string>) {
      state.imageData = action.payload;
    },
    setActiveTab(state, action: PayloadAction<SetActiveTabPayload>) {
      state.activeTab = action.payload.path;
      state.activeMethod = action.payload.method;
      state.fullPath = url + "/api" + action.payload.path;
      state.inputParams = {};
      state.inputValues = {};
      state.response = null;
      state.paramFormErrors = {};
      state.requestFormErrors = {};
    },
    updateSelectedUnionTypes(state, action: PayloadAction<UpdateSelectedUnionTypesPayload>) {
      const { fieldPath, selectedType } = action.payload;
      state.selectedUnionTypes[fieldPath] = selectedType;
    },
    updateParam(state, action: PayloadAction<UpdateParamPayload>) {
      const { paramName, value, paramType } = action.payload;
      state.inputParams = {
        ...state.inputParams,
        [paramName]: {
          value: value,
          paramType: paramType
        }
      }
    },
    setResponse(state, action: PayloadAction<any>) {
      state.response = action.payload;
    },
    setInputValues(state, action: PayloadAction<{ [key: string]: any }>) {
      state.inputValues = action.payload;
    },
    updateInputValues(_state, _action: PayloadAction<UpdateInputValuesPayload>) {}, // logic lives in saga
    registerHeader: (state, action: PayloadAction<string>) => {
      // This looks like mutation but Redux Toolkit's createSlice produces an immutable update
      if (!state.availableHeaders.includes(action.payload)) {
        state.availableHeaders.push(action.payload);
      }
    },
    unregisterHeader: (state, action: PayloadAction<string>) => {
      state.availableHeaders = state.availableHeaders.filter(id => id !== action.payload);
    },
    setParamFormErrors: (state, action: PayloadAction<{ [key: string]: string }>) => {
      state.paramFormErrors = action.payload
    },
    removeParamFormError: (state, action: PayloadAction<string>) => {
      const temp = state.paramFormErrors
      delete temp[action.payload];
      state.paramFormErrors = temp;
    },
    setRequestFormErrors: (state, action: PayloadAction<{ [key: string]: string }>) => {
      state.requestFormErrors = action.payload
    },
    removeRequestFormError: (state, action: PayloadAction<string>) => {
      const temp = state.requestFormErrors
      delete temp[action.payload];
      state.requestFormErrors = temp;
    },
  },
});

export const {
  setOpenapiDefinition,
  setFullPath,
  setActiveTab,
  setImageData,
  updateSelectedUnionTypes,
  updateParam,
  setResponse,
  setInputValues,
  updateInputValues,
  registerHeader, 
  unregisterHeader,
  setParamFormErrors,
  removeParamFormError,
  setRequestFormErrors,
  removeRequestFormError,
} = formSlice.actions;

export default formSlice.reducer;