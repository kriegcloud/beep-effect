import { assert, describe, it } from "@effect/vitest";
import * as ActionState from "../../effected/github-actions/ActionState.ts";
import * as CacheKey from "../../effected/github-actions/CacheKey.ts";
import * as DetachedProcess from "../../effected/github-actions/DetachedProcess.ts";
import {
	InvalidActionStateNameError,
	InvalidDigestLengthError,
	MissingProcessIdError,
} from "../../effected/github-actions/index.ts";

describe("github-actions entry-point exports", () => {
	it("exports the three existing tagged error classes", () => {
		assert.strictEqual(InvalidActionStateNameError, ActionState.InvalidActionStateNameError);
		assert.strictEqual(InvalidDigestLengthError, CacheKey.InvalidDigestLengthError);
		assert.strictEqual(MissingProcessIdError, DetachedProcess.MissingProcessIdError);
	});
});
