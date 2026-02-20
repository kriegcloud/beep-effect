/**
 * @license Copyright 2018 Palantir Technologies, Inc. All rights reserved.
 */

import { IRecipeStep, TemperatureUnit } from "conjure-recipe-example-api";
import * as moment from "moment";

export function updateListElem<T>(updatedElem: T, list: T[], index: number) {
    return [...list.slice(0, index), updatedElem, ...list.slice(index + 1)];
}

export function createDefaultRecipeStep(type: string): IRecipeStep {
    if (type === "mix") {
        return { type: "mix", mix: [""] };
    } else if (type === "chop") {
        return { type: "chop", chop: "" };
    } else {
        return {
            type: "bake",
            bake: { temperature: { degree: 350, unit: TemperatureUnit.FAHRENHEIT }, durationInSeconds: 600 },
        };
    }
}

export function handleStringChange(handler: (value: string) => void) {
    return (event: React.FormEvent<HTMLElement>) => handler((event.target as HTMLInputElement).value);
}

export function secondsToDate(durationInSeconds: number): Date {
    return new Date(0, 0, 0, 0, 0, durationInSeconds, 0);
}

export function dateToSeconds(date: Date): number {
    return moment(date).diff(new Date(0, 0, 0, 0, 0, 0, 0)) / 1000;
}
