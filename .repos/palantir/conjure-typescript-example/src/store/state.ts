/**
 * Copyright 2017 Palantir Technologies, Inc. All rights reserved.
 */
import { IInterfaceData } from "./state/interfaceData";
import { IRecipesDataState } from "./state/recipesData";

export interface IRecipesAppState {
    recipesData: IRecipesDataState;
    interfaceData: IInterfaceData;
}
