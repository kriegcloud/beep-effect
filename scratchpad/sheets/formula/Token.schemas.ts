import {$ScratchpadId} from "@beep/identity";
import {MappedLiteralKit} from "@beep/schema";

const $I = $ScratchpadId.create("sheets/formula/Token.schemas");

export const OperatorToken = MappedLiteralKit([
	[
		"PLUS",
		"+",
	],
	[
		"MINUS",
		'-',
	],
	[
		"MULTIPLY",
		'*',
	],
	[
		"DIVIDED",
		'/',
	],
	[
		"CONCATENATE",
		'&',
	],
	[
		"POWER",
		'^',
	],
	[
		"EQUALS",
		'=',
	],
	[
		"NOT_EQUAL",
		'<>',
	],
	[
		"GREATER_THAN",
		'>',
	],
	[
		"GREATER_THAN_OR_EQUAL",
		'>=',
	],
	[
		"LESS_THAN",
		'<',
	],
	[
		"LESS_THAN_OR_EQUAL",
		'<=',
	],
]).pipe(
	$I.annoteSchema("OperatorToken", {
		description: "An operator token in a formula",
	})
)
