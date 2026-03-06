import * as S from "effect/Schema";
import { $SchemaId } from "@beep/identity";
import { isPositive, isNegative, isNonNegative, isNonPositive } from "./Number.ts";
const $I = $SchemaId.create("Int");

export const Int = S.Int.pipe(S.brand("Int")).check(S.isFinite({
	message: "Expected a finite integer",
	description: "A finite integer"
})).annotate(
	$I.annote("Int", {
		description: "A an integer value"
	})
);

export type Int = typeof Int.Type;

export const PosInt = Int.pipe(
	S.brand("PosInt"),
).check(isPositive.annotate({
	message: "Expected a positive integer",
	description: "A positive integer"
})).annotate(

	$I.annote(
		"PosInt",
		{
			description: "A positive integer"
		}
	)
);

export type PosInt = typeof PosInt.Type;

export const NegInt = Int.pipe(
	S.brand("NegInt")
).check(isNegative.annotate({
	message: "Expected a negative integer",
	description: "A negative integer"
})).annotate(
	$I.annote(
		"NegInt",
		{
			description: "A negative integer"
		}
	)
);

export type NegInt = typeof NegInt.Type;

export const NonPositiveInt = Int.pipe(
	S.brand("NonPositiveInt")
).check(isNonPositive.annotate({
	message: "Expected a non-positive integer",
	description: "A non-positive integer"
})).annotate(
	$I.annote("NonPositiveInt", {
		description: "A non-positive integer"
	})
);

export type NonPositiveInt = typeof NonPositiveInt.Type;

export const NonNegativeInt = Int.pipe(
	S.brand("NonNegativeInt")
).check(isNonNegative.annotate({
	message: "Expected a non-negative integer",
	description: "A non-negative integer"
})).annotate(
	$I.annote("NonNegativeInt", {
		description: "A non-negative integer"
	})
);

export type NonNegativeInt = typeof NonNegativeInt.Type;