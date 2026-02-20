/**
 * @license Copyright 2018 Palantir Technologies, Inc. All rights reserved.
 */

import { Reducer, TypedReducer } from "redoodle";
import { AddRecipes } from "../actions";
import { initialRecipesDataState, IRecipesDataState } from "../state/recipesData";

export const recipesReducer: Reducer<IRecipesDataState> = TypedReducer.builder<IRecipesDataState>()
    .withDefaultHandler((state = initialRecipesDataState) => state)
    .withHandler(AddRecipes.TYPE, (state, payload) => ({ ...state, recipes: [...state.recipes, ...payload] }))
    .build();
