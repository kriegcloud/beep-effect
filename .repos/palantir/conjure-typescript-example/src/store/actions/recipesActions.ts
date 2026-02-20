/**
 * @license Copyright 2018 Palantir Technologies, Inc. All rights reserved.
 */

import { IRecipe } from "conjure-recipe-example-api";
import { TypedAction } from "redoodle";

export const AddRecipes = TypedAction.define("recipesData::add_recipes")<IRecipe[]>();
