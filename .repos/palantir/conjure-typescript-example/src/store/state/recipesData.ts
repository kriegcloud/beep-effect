/**
 * @license Copyright 2018 Palantir Technologies, Inc. All rights reserved.
 */

import { IRecipe } from "conjure-recipe-example-api";

export interface IRecipesDataState {
    recipes: IRecipe[];
}

export const initialRecipesDataState: IRecipesDataState = {
    recipes: [],
};
