import { assert, describe, it } from "@effect/vitest";
import * as S from "effect/Schema";
import * as AST from "effect/SchemaAST";
import { DuplicateViewportKeyError } from "../../../effected/cli/ui/Viewport.ts";
import { MissingUiThemeError } from "../../../effected/cli/ui/UiTheme.ts";

describe("widget invariant error metadata", () => {
	for (const error of [DuplicateViewportKeyError, MissingUiThemeError]) {
		it(`${error.name} describes its schema and message`, () => {
			assert.isString(AST.resolveIdentifier(error.ast));
			assert.isString(AST.resolveDescription(error.ast));
			assert.isString(S.resolveAnnotationsKey(error.fields.message)?.description);
			assert.isString(S.resolveAnnotationsKey(error.fields.message)?.identifier);
			const instance = error.make({ message: "invariant failed" });
			assert.strictEqual(instance.message, "invariant failed");
			assert.strictEqual(instance._tag, error === DuplicateViewportKeyError ? "DuplicateViewportKeyError" : "MissingUiThemeError");
		});
	}
});
