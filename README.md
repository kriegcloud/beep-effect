# conjure-typescript-example
A small recipe frontend application that demonstrates the simple usage of conjure tooling.

## Overview

#### Tools and Libraries

This example project uses the following tools and libraries, please consult their respective documentation for more information.

* [conjure-typescript-runtime] - conjure client bindings for typescript
* [conjure-recipe-example-api] - Generated Typescript API for the RecipeBookService
   * Generated and published by [conjure-java-example] from [this conjure API][recipe-example-api]
* [yarn](https://yarnpkg.com/en/) - a flexible build tool for frontend development

#### Project Structure

* `conjure-recipe-example-app` - a react application project that uses conjure generated typescript bindings for talking to a server that implements the same Conjure API

    This is what the project looks like:
    ```
    └── src/
        ├── components/
        ├── recipesApp.tsx
        ├── services/
        │   └── index.ts
        └── store/
            ├── actions/
            ├── createStore.ts
            ├── index.ts
            ├── reducers/
            ├── state/
            └── state.ts
    ```
    * src/recipesApp.tsx - the main component of this app
    * src/components - defines react components
    * src/services - uses [conjure-typescript-runtime] and the generated [conjure-recipe-example-api] to define a remote `RecipeBookService`
    * src/store - defines the redux store for this app
        * src/store/actions - defines actions that are exported to the react app
        * src/store/reducers - defines reducers that implement the behaviour of the actions on the state 
        * src/store/state - defines the state type hierarchy

#### How to depend on a conjure API

[gradle-conjure] publishes conjure APIs to NPM (via the `publishTypeScript` task), so you can depend on the API 
like any other package.

Make sure to also add a dependency on [conjure-client][conjure-typescript-runtime] in your `package.json`:

```diff
   "dependencies": {
     "@blueprintjs/core": "^3.0.1",
+    "conjure-client": "^1.2.0",
+    "conjure-recipe-example-api": "^0.2.0",
     "react": "^16.4.1",
     "react-dom": "^16.4.1",
     "react-redux": "^5.0.7",
```
    
## Development

#### Useful Yarn Commands:

* `yarn build` to build and test the project
* `yarn start` to run a development build and start serving the app
* `yarn lint --fix` to fix any lint errors in the entire project

#### Generate New or Modify Existing APIs

Please follow [this section](https://github.com/palantir/conjure-java-example#generate-new-or-modify-existing-apis) in 
[conjure-java-example]'s readme.



[conjure-typescript-runtime]: https://github.com/palantir/conjure-typescript-runtime/
[conjure-recipe-example-api]: https://www.npmjs.com/package/conjure-recipe-example-api
[conjure-java-example]: https://github.com/palantir/conjure-java-example
[recipe-example-api]: https://github.com/palantir/conjure-java-example/blob/develop/recipe-example-api/src/main/conjure/recipe-example-api.yml
[gradle-conjure]: https://github.com/palantir/gradle-conjure


## Create React App guide

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app). Please refer to this guide [here](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md) for how to perform common tasks.
