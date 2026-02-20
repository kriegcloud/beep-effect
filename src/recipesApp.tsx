/**
 * @license Copyright 2017 Palantir Technologies, Inc. All rights reserved.
 */

import { IRecipe } from "conjure-recipe-example-api";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { CreateRecipeDialog } from "./components/createRecipeDialog";
import { Header } from "./components/header";
import { RecipeItem } from "./components/recipeItem";
import { IServices } from "./services";
import { IRecipesAppState } from "./store";
import { AddRecipes } from "./store/actions";
import { SetIsDialogueOpen } from "./store/actions/interfaceActions";

export interface IRecipesAppStateProps {
    isDialogueOpen: boolean;
    recipes: IRecipe[];
    services: IServices;
}

export interface IRecipesAppDispatchProps {
    addRecipes: (recipe: IRecipe[]) => void;
    setIsDialogOpen: (isDialogOpen: boolean) => void;
}

export type IExampleAppProps = IRecipesAppStateProps & IRecipesAppDispatchProps;

class UnconnectedRecipesApp extends React.PureComponent<IExampleAppProps> {
    public componentDidMount(): void {
        this.props.services.recipesService.getAllRecipes().then(recipes => this.props.addRecipes(recipes));
    }

    public render() {
        const { recipes, isDialogueOpen } = this.props;
        return (
            <div className="foundry-example-app">
                <CreateRecipeDialog
                    isDialogOpen={isDialogueOpen}
                    closeDialog={this.closeRecipeDialog}
                    createNewRecipe={this.createNewRecipe}
                />
                <Header createNewRecipe={this.openCreateRecipeDialog} />
                {recipes.map((recipe, index) => <RecipeItem recipe={recipe} key={index} />)}
            </div>
        );
    }

    private openCreateRecipeDialog = () => {
        this.props.setIsDialogOpen(true);
    };

    private closeRecipeDialog = () => {
        this.props.setIsDialogOpen(false);
    };

    private createNewRecipe = (recipe: IRecipe) => {
        this.props.addRecipes([recipe]);
        this.props.setIsDialogOpen(false);
    };
}

export const RecipesApp = connect(
    (state: IRecipesAppState, ownProps: { services: IServices }): IRecipesAppStateProps => ({
        isDialogueOpen: state.interfaceData.isDialogueOpen,
        recipes: state.recipesData.recipes,
        services: ownProps.services,
    }),
    (dispatch: Dispatch): IRecipesAppDispatchProps => ({
        setIsDialogOpen: isDialogueOpen => dispatch(SetIsDialogueOpen.create(isDialogueOpen)),
        addRecipes: recipes => dispatch(AddRecipes.create(recipes)),
    }),
)(UnconnectedRecipesApp);
