import { schema } from "@hazel/db"
import { describe, expect, it } from "vitest"
import {
	assertWhereClauseParamsAreSequential,
	buildChannelAccessClause,
	buildChannelVisibilityClause,
	WhereClauseParamMismatchError,
} from "./where-clause-builder"

describe("where-clause-builder channel access", () => {
	it("buildChannelVisibilityClause uses single channel_access subquery", () => {
		const result = buildChannelVisibilityClause("user-1", schema.channelsTable.deletedAt)

		expect(result.params).toEqual(["user-1"])
		expect(result.whereClause).toContain(`"deletedAt" IS NULL`)
		expect(result.whereClause).toContain(
			`"id" IN (SELECT "channelId" FROM channel_access WHERE "userId" = $1)`,
		)
		expect(result.whereClause).not.toContain("COALESCE")
	})

	it("buildChannelAccessClause includes optional deletedAt and single subquery", () => {
		const result = buildChannelAccessClause(
			"user-1",
			schema.messagesTable.channelId,
			schema.messagesTable.deletedAt,
		)

		expect(result.params).toEqual(["user-1"])
		expect(result.whereClause).toContain(`"deletedAt" IS NULL AND`)
		expect(result.whereClause).toContain(
			`"channelId" IN (SELECT "channelId" FROM channel_access WHERE "userId" = $1)`,
		)
		expect(result.whereClause).not.toContain("COALESCE")
	})
})

describe("where-clause-builder param validation", () => {
	it("accepts repeated placeholder usage with one param", () => {
		const result = {
			whereClause: `"deletedAt" IS NULL AND ("userId" = $1 OR "authorId" = $1)`,
			params: ["user-1"],
		}

		expect(() => assertWhereClauseParamsAreSequential(result)).not.toThrow()
	})

	it("rejects gaps in placeholder sequence", () => {
		const result = {
			whereClause: `"channelId" IN ($1, $3)`,
			params: ["a", "b", "c"],
		}

		expect(() => assertWhereClauseParamsAreSequential(result)).toThrow(WhereClauseParamMismatchError)
	})

	it("rejects params without placeholders", () => {
		const result = {
			whereClause: `"deletedAt" IS NULL`,
			params: ["unexpected"],
		}

		expect(() => assertWhereClauseParamsAreSequential(result)).toThrow(WhereClauseParamMismatchError)
	})
})
