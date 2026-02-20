/**
 * @license Copyright 2018 Palantir Technologies, Inc. All rights reserved.
 */

import { Reducer, TypedReducer } from "redoodle";
import { SetIsDialogueOpen } from "../actions/interfaceActions";
import { IInterfaceData, initialInterfaceData } from "../state/interfaceData";

export const interfaceReducer: Reducer<IInterfaceData> = TypedReducer.builder<IInterfaceData>()
    .withDefaultHandler((state = initialInterfaceData) => state)
    .withHandler(SetIsDialogueOpen.TYPE, (state, payload) => ({ isDialogueOpen: payload }))
    .build();
