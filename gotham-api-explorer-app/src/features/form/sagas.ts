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
import { put, takeLatest, select, all } from "redux-saga/effects";
import { setFullPath, setInputValues, updateInputValues, UpdateInputValuesPayload, updateParam, UpdateParamPayload } from "./slice";
import { selectInputValues, selectInputParams, selectFullPath, selectActiveTab } from "./selectors";
import { SagaIterator } from "redux-saga";
import { PayloadAction } from "@reduxjs/toolkit";

const url = import.meta.env.VITE_FOUNDRY_API_URL;

// This function updates the request body input values whenver a request body value changes on the form
function* updateInputValuesSaga(action: PayloadAction<UpdateInputValuesPayload>): SagaIterator {
  const { fieldPath, value, arrayIndex } = action.payload;
  const inputValues = yield select(selectInputValues);
  console.log("updating input value at fieldpath " + fieldPath + " to value " + JSON.stringify(value));

  const updateNestedValue = (obj: any, keys: string[]): { [key: string]: any } => {
    if (keys.length === 0) { // Arrived at field to update, return the value that should exist there
      if (arrayIndex === undefined) { // Either some base value type
        return value;
      } else { // Or update the array there / return a new array
        const existingArray = obj || [];
        const newArray = [...existingArray];
        if (arrayIndex === existingArray.length) {
          newArray.push(value);
        } else {
          newArray[arrayIndex] = value;
        }
        return newArray;
      }
    } else if (!isNaN(Number(keys[1]))) { // This field has type array
      const key = keys[0];
      const existingArray = obj[key] || [];
      const updatedArray = [...existingArray];
      const arrayIndex = Number(keys[1]);

      // update the existing array with the new value, at specified index
      updatedArray[arrayIndex] = updateNestedValue(
        obj[key][arrayIndex] || {},
        keys.slice(2)
      );

      // replace the existing array at this field with the updated array
      return {
        ...obj,
        [key]: updatedArray,
      };
    } else if (keys.length > 0 && keys[1] === "[UnionType]") { // This field has type union
      const key = keys[0];
      const newUnionType = keys[2];
      let subObject = {};
      try {
        subObject = obj[key][newUnionType];
      } catch (e) {}

      // replace the existing union type and value at this field with the new union type and value
      return {
        ...obj,
        [key]: {
          type: newUnionType+"[UNION]", // Add [UNION] as identifier when creating JSON Object for post-processing
          [newUnionType]: updateNestedValue(subObject, keys.slice(3)),
        },
      };
    } else { 
      const key = keys[0];
      return {
        ...obj,
        [key]: updateNestedValue(obj[key] || {}, keys.slice(1)),
      };
    }
  };

  const keys = fieldPath.split(".");

  const updatedValues = updateNestedValue(inputValues, keys);
  yield put(setInputValues(updatedValues));
};

// This function updates the parameter input values whenver a param changes on the form
function* updateParamsSaga(_action: PayloadAction<UpdateParamPayload>): SagaIterator {
  let fullPath = yield select(selectFullPath);
  const inputParams = yield select(selectInputParams);
  const activeTab = yield select(selectActiveTab);

  // Use a regular expression to find all placeholders in the path
  fullPath = url + "/api" + activeTab.replace(/{(\w+)}/g, (match: string, paramName: string) => {
      // Check if the parameter exists and has a value
      if (inputParams[paramName] && inputParams[paramName].value) {
          return encodeURIComponent(inputParams[paramName].value);
      }
      // If the parameter is not found, return the original match
      return match;
  });

  let queryParams: string[] = [];
  Object.entries(inputParams).forEach(([paramName, body]: [string, any]) => {
      if (body.paramType === "query") {
          queryParams.push(`${paramName}=${encodeURIComponent(body.value)}`);
      }
  });
  if (queryParams.length > 0) {    
    if (fullPath.indexOf('?') !== -1) {
        fullPath = fullPath.substring(0, fullPath.indexOf('?'));
    }
    fullPath += '?' + queryParams.join('&');
  }
  yield put(setFullPath(fullPath));
}

export function* formSaga() {
  yield all([
    takeLatest(updateInputValues.type, updateInputValuesSaga),
    takeLatest(updateParam.type, updateParamsSaga),
  ]);
}