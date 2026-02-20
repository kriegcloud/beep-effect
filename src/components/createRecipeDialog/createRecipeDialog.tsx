/**
 * @license Copyright 2018 Palantir Technologies, Inc. All rights reserved.
 */

import "./createRecipeDialog.css";

import { Button, Card, Classes, Dialog, H6, Intent } from "@blueprintjs/core";
import * as classNames from "classnames";
import { IRecipe, IRecipeStep } from "conjure-recipe-example-api";
import * as React from "react";
import { AddElementIndicator } from "../addElementIndicator";
import { CreateRecipeStep } from "./createRecipeStep";
import { createDefaultRecipeStep, handleStringChange, updateListElem } from "./utils";

export interface ICreateRecipeDialogStateProps {
    isDialogOpen: boolean;
}

export interface ICreateRecipeDialogDispatchProps {
    closeDialog: () => void;
    createNewRecipe: (recipe: IRecipe) => void;
}

type ICreateRecipeDialogState = IRecipe;

export type ICreateRecipeDialogProps = ICreateRecipeDialogStateProps & ICreateRecipeDialogDispatchProps;

export class CreateRecipeDialog extends React.PureComponent<ICreateRecipeDialogProps, ICreateRecipeDialogState> {
    public state = {
        name: "",
        steps: [],
    };

    private handleNameChange = handleStringChange(name => this.setState({ ...this.state, name }));

    public render() {
        const { isDialogOpen, closeDialog } = this.props;
        const { name, steps } = this.state;
        return (
            <Dialog
                className="rp-create-dialog"
                icon="plus"
                title="Create new recipe"
                onClose={closeDialog}
                isOpen={isDialogOpen}
            >
                <div className={classNames("rp-create-dialog-body", Classes.DIALOG_BODY)}>
                    <Card>
                        <H6>Create a new delicious recipe</H6>
                        <input
                            className={Classes.INPUT}
                            type="text"
                            onChange={this.handleNameChange}
                            value={name}
                            placeholder="Recipe name"
                        />
                    </Card>
                    <div className="rp-create-dialog-steps">
                        {steps.map((step, index) => (
                            <CreateRecipeStep
                                key={index}
                                step={step}
                                setStepType={this.handleStepChange(index)}
                                updateStep={this.updateStep(index)}
                                removeStep={this.handleRemoveStep(index)}
                            />
                        ))}
                    </div>
                    <AddElementIndicator icon="plus" onClick={this.addStep} />
                </div>
                <div className={Classes.DIALOG_FOOTER}>
                    <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                        <Button intent={Intent.SUCCESS} onClick={this.createNewRecipe}>
                            Create Recipe
                        </Button>
                    </div>
                </div>
            </Dialog>
        );
    }

    private addStep = () => {
        this.setState({
            ...this.state,
            steps: [...this.state.steps, createDefaultRecipeStep("mix")],
        });
    };

    private updateStep(stepIndex: number) {
        return (modifiedStep: IRecipeStep) => {
            this.setState({
                ...this.state,
                steps: updateListElem(modifiedStep, this.state.steps, stepIndex),
            });
        };
    }

    private handleRemoveStep(index: number) {
        return () => {
            this.setState({
                ...this.state,
                steps: [...this.state.steps.slice(0, index), ...this.state.steps.slice(index + 1)],
            });
        };
    }

    private handleStepChange(index: number) {
        return (type: string) => {
            this.setState({
                ...this.state,
                steps: updateListElem(createDefaultRecipeStep(type), this.state.steps, index),
            });
        };
    }

    private createNewRecipe = () => {
        this.props.createNewRecipe(this.state);
        this.setState({ name: "", steps: [] });
    };
}
