import { $RepoUtilsId } from "@beep/identity";
import * as S from "effect/Schema";


const $I = $RepoUtilsId.create("TSMorph/TSMorph.model");

export const SymbolId = S.TemplateLiteralParser(
	[

	]
)

export class Symbol extends S.Class<Symbol>($I`Symbol`)(
	{
		// id:
	},
	$I.annote("Symbol", {})
) {}