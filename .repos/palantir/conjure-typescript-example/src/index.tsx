/**
 * Copyright 2017 Palantir Technologies, Inc. All rights reserved.
 */

import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { RecipesApp } from "./recipesApp";
import { createServices } from "./services";
import { createConfiguredStore } from "./store";

import "./index.css";

// Create the store
const store = createConfiguredStore();
const services = createServices();

// Render the app
ReactDOM.render(
    <Provider store={store}>
        <RecipesApp services={services} />
    </Provider>,
    document.getElementById("root"),
);
