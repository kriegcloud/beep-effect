/**
 * @license Copyright 2018 Palantir Technologies, Inc. All rights reserved.
 */

import { Button, Card, Classes, H6, NonIdealState, NumericInput, Radio, RadioGroup } from "@blueprintjs/core";
import { TimePicker, TimePrecision } from "@blueprintjs/datetime";
import {
    IRecipeStep,
    IRecipeStep_Bake,
    IRecipeStep_Chop,
    IRecipeStep_Mix,
    TemperatureUnit,
} from "conjure-recipe-example-api";
import * as React from "react";
import { AddElementIndicator } from "../addElementIndicator";
import { dateToSeconds, secondsToDate, updateListElem } from "./utils";

interface ICreateRecipeStepProps {
    step: IRecipeStep;
    setStepType: (type: string) => void;
    updateStep: (step: IRecipeStep) => void;
    removeStep: () => void;
}

export class CreateRecipeStep extends React.PureComponent<ICreateRecipeStepProps> {
    public render() {
        const { step, removeStep } = this.props;
        return (
            <Card>
                <div className="rp-step-header">
                    <RadioGroup onChange={this.handleStepChange} inline={true} selectedValue={step.type}>
                        <Radio label="Mix" value="mix" />
                        <Radio label="Chop" value="chop" />
                        <Radio label="Bake" value="bake" />
                    </RadioGroup>
                    <div className={Classes.TEXT_LARGE}>{}</div>
                    <Button className={Classes.MINIMAL} icon="cross" onClick={removeStep} />
                </div>
                {this.renderStepBody()}
            </Card>
        );
    }

    private renderStepBody() {
        const { step } = this.props;
        switch (step.type) {
            case "mix":
                return this.renderMixStep(step);
            case "chop":
                return this.renderChopStep(step);
            case "bake":
                return this.renderBakeStep(step);
            default:
                return <NonIdealState description="Unhandled step type" />;
        }
    }

    private renderMixStep({ mix }: IRecipeStep_Mix) {
        return (
            <div className="rp-mix-body">
                <H6>Ingredients</H6>
                <ol>
                    {mix.map((ingredient, i) => (
                        <li key={i}>
                            <input
                                className={Classes.INPUT}
                                type="text"
                                value={ingredient}
                                placeholder="Ingredient name"
                                onChange={this.handleMixIngredientChange(i)}
                            />
                        </li>
                    ))}
                </ol>
                <AddElementIndicator icon="plus" onClick={this.addMixIngredient} />
            </div>
        );
    }

    private renderChopStep({ chop }: IRecipeStep_Chop) {
        return (
            <div className="rp-chop-body">
                <H6>Ingredient</H6>
                <input
                    className={Classes.INPUT}
                    type="text"
                    value={chop}
                    placeholder="Ingredient name"
                    onChange={this.handleChopChange}
                />
            </div>
        );
    }

    private renderBakeStep({
        bake: {
            temperature: { degree, unit },
            durationInSeconds,
        },
    }: IRecipeStep_Bake) {
        return (
            <div className="rp-bake-body">
                <H6>Temperature</H6>
                <div className="temperature-control">
                    <NumericInput
                        leftIcon="dashboard"
                        allowNumericCharactersOnly={true}
                        buttonPosition="right"
                        majorStepSize={10}
                        min={0}
                        onValueChange={this.handleBakeTemperatureChange}
                        value={degree}
                    />
                    <RadioGroup inline={true} selectedValue={unit} onChange={this.handleBakeUnitChange}>
                        <Radio label="Fahrenheit" value={TemperatureUnit.FAHRENHEIT} />
                        <Radio label="Celcius" value={TemperatureUnit.CELCIUS} />
                    </RadioGroup>
                </div>
                <H6>Duration</H6>
                <TimePicker
                    value={secondsToDate(durationInSeconds)}
                    precision={TimePrecision.SECOND}
                    onChange={this.handleBakeDurationChange}
                />
            </div>
        );
    }

    private handleMixIngredientChange = (index: number) => {
        return (event: React.FormEvent<HTMLInputElement>) => {
            const ingredient = (event.target as HTMLInputElement).value;
            const step = this.props.step as IRecipeStep_Mix;
            this.props.updateStep({ ...step, mix: updateListElem(ingredient, step.mix, index) });
        };
    };

    private addMixIngredient = () => {
        const step = this.props.step as IRecipeStep_Mix;
        this.props.updateStep({ ...step, mix: [...step.mix, ""] });
    };

    private handleChopChange = (event: React.FormEvent<HTMLInputElement>) => {
        const step = this.props.step as IRecipeStep_Chop;
        const ingredient = (event.target as HTMLInputElement).value;
        this.props.updateStep({ ...step, chop: ingredient });
    };

    private handleBakeTemperatureChange = (value: number) => {
        const step = this.props.step as IRecipeStep_Bake;
        this.props.updateStep({
            ...step,
            bake: {
                ...step.bake,
                temperature: {
                    ...step.bake.temperature,
                    degree: value,
                },
            },
        });
    };

    private handleBakeUnitChange = (event: React.FormEvent<HTMLInputElement>) => {
        const step = this.props.step as IRecipeStep_Bake;
        const unit = (event.target as HTMLInputElement).value as TemperatureUnit;
        this.props.updateStep({
            ...step,
            bake: {
                ...step.bake,
                temperature: {
                    ...step.bake.temperature,
                    unit,
                },
            },
        });
    };

    private handleBakeDurationChange = (date: Date) => {
        const step = this.props.step as IRecipeStep_Bake;
        const durationInSeconds = dateToSeconds(date);
        this.props.updateStep({
            ...step,
            bake: {
                ...step.bake,
                durationInSeconds,
            },
        });
    };

    private handleStepChange = (event: React.FormEvent<HTMLInputElement>) => {
        const type = (event.target as HTMLInputElement).value;
        this.props.setStepType(type);
    };
}
