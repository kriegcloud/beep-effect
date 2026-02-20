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
import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import rootReducer from "./rootReducer";
import rootSaga from "./rootSaga";

const serializeDatesMiddleware = () => (next: (arg0: any) => any) => (action: any) => {
    // Create a deep copy of the action while serializing Date objects
    const serializedAction = JSON.parse(
        JSON.stringify(action, (_key, value) => {
        // Check if the value is a Date object
        if (value instanceof Date) {
            return value.toISOString(); // Convert to ISO string format
        }
        return value;
        })
    );

    return next(serializedAction);
};

const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
    reducer: rootReducer,
    // middleware: (getDefaultMiddleware) => [serializeDatesMiddleware].concat(getDefaultMiddleware(), sagaMiddleware),
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(sagaMiddleware, serializeDatesMiddleware),
});

sagaMiddleware.run(rootSaga);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

export default store;