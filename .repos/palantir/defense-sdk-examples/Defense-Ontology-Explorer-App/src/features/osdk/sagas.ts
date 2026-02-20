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
import { call, put, takeLatest, select, all } from "redux-saga/effects";
import client from "../../client";
import {
  fetchDomainsSuccess,
  fetchDomainsFailure,
  fetchInterfaceObjectsSuccess,
  fetchInterfaceObjectsFailure,
  fetchFullObjectSuccess,
  fetchFullObjectFailure,
  fetchInterfaceObjectsStart,
} from "./slice";
import { DomainCategory, DomainMetadata } from "./types";
import {
  selectSelectedInterface,
  selectSelectedObjectType,
  selectSelectedObjectPrimaryKey,
  selectDomainMap,
} from "./selectors";
import * as $DefenseOntology from "@defense-ontology-explorer-app/sdk";
import { SagaIterator } from "redux-saga";

function* fetchDomainsSaga(): SagaIterator {
  try {
    const objects =  yield select(selectDomainMap);
    console.log("todo got objects: ", objects);

    const domainMap: { [key in DomainCategory]?: DomainMetadata } = {};

    Object.keys(objects).forEach((key) => {
  const obj: DomainMetadata = objects[key];
  console.log("todo domain: ", obj);

    let status: string;
    switch (obj.status) {
      case "COMING_SOON":
        status = "time";
        break;
      case "UNDER_DEVELOPMENT":
        status = "build";
        break;
      case "PUBLISHED":
        status = "tag-add";
        break;
      default:
        status = "unknown";
    }

      const categoryKey = obj.title as keyof typeof DomainCategory;
      if (DomainCategory[categoryKey]) {
        domainMap[DomainCategory[categoryKey]] = {
          title: obj.title || "Untitled",
          description: obj.description || "No description available",
          interfaces: obj.interfaces || [],
          status: status,
        };
      }
    });

    yield put(fetchDomainsSuccess(domainMap));
  } catch (error) {
    yield put(
      fetchDomainsFailure(
        error instanceof Error
          ? error.message
          : "Error fetching defense ontology domain metadata"
      )
    );
  }
}

function* fetchInterfaceObjectsSaga(): SagaIterator {
  const selectedInterface = yield select(selectSelectedInterface);
  if (selectedInterface) {
    try {
      yield put(fetchInterfaceObjectsStart());
      const InterfaceType = ($DefenseOntology as any)[selectedInterface];
      if (!InterfaceType) {
        throw new Error(`Interface ${String(selectedInterface)} not found`);
      }

      const fetchObjects = async () => {
        const objects: any[] = [];
        for await (const obj of client(InterfaceType).asyncIter()) {
          objects.push(obj);
        }
        return objects;
      };
      const objects = yield call(fetchObjects);
      yield put(fetchInterfaceObjectsSuccess(objects));
    } catch (error) {
      yield put(
        fetchInterfaceObjectsFailure(
          error instanceof Error
            ? error.message
            : "Error fetching interface objects"
        )
      );
    }
  }
}

function* fetchFullObjectSaga(): SagaIterator {
  const selectedObjectPrimaryKey = yield select(selectSelectedObjectPrimaryKey);
  const selectedObjectType = yield select(selectSelectedObjectType);
  if (selectedObjectPrimaryKey && selectedObjectType) {
    try {
      const Type = ($DefenseOntology as any)[selectedObjectType];
      if (!Type) {
        throw new Error(`Type ${selectedObjectType} not found`);
      }
      const object = yield call(
        client(Type).fetchOneWithErrors,
        selectedObjectPrimaryKey
      );

      let mediaContent = null;
      if (object.value.mediaReference) {
        try {
          const fetchContents = () =>
            object.value.mediaReference.fetchContents();
          const response = yield call(fetchContents);
          if (response.ok) {
            const blob = yield call([response, "blob"]);
            mediaContent = URL.createObjectURL(blob);
          }
        } catch (error) {
          yield put(
            fetchFullObjectFailure(
              error instanceof Error ? error.message : "Error fetching object"
            )
          );
        }
      }
      const serializableObject = { ...object.value };
      yield put(
        fetchFullObjectSuccess({ ...serializableObject, mediaContent })
      );
    } catch (error) {
      console.log("Error fetching object: ", error);
      yield put(
        fetchFullObjectFailure(
          error instanceof Error ? error.message : "Error fetching object"
        )
      );
    }
  }
}

export function* osdkSaga() {
  yield all([
    takeLatest("osdk/fetchDomainsStart", fetchDomainsSaga),
    takeLatest("osdk/setSelectedInterface", fetchInterfaceObjectsSaga),
    takeLatest("osdk/setSelectedObjectType", fetchInterfaceObjectsSaga),
    takeLatest("osdk/setSelectedObjectPrimaryKey", fetchFullObjectSaga),
  ]);
}
