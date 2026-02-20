/**
 * @license Copyright 2018 Palantir Technologies, Inc. All rights reserved.
 */
import { DefaultHttpApiBridge } from "conjure-client";
import { RecipeBookService } from "conjure-recipe-example-api";

export interface IServices {
    recipesService: RecipeBookService;
}

export function createServices(): IServices {
    const bridge = new DefaultHttpApiBridge({
        token: "",
        userAgent: {
            productName: "RecipesApp",
            productVersion: "0.1.0",
        },
        baseUrl: "http://localhost:8000/examples/api",
    });
    return {
        recipesService: new RecipeBookService(bridge),
    };
}
