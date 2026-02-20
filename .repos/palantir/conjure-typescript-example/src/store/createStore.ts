/**
 * Copyright 2017 Palantir Technologies, Inc. All rights reserved.
 */

import { loggingMiddleware } from "redoodle";
import { applyMiddleware, createStore, Store } from "redux";
import { reducer } from "./reducers";
import { IRecipesAppState } from "./state";
import { initialInterfaceData } from "./state/interfaceData";
import { initialRecipesDataState } from "./state/recipesData";

export function createConfiguredStore(): Store<IRecipesAppState> {
    const createStoreWithMiddleware = applyMiddleware(loggingMiddleware())(createStore);

    return createStoreWithMiddleware(reducer, {
        recipesData: initialRecipesDataState,
        interfaceData: initialInterfaceData,
    });
}
