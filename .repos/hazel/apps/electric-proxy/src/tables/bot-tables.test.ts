import { Effect } from "effect"
import type { BotId, ChannelId, UserId } from "@hazel/schema"
import { describe, expect, it } from "vitest"
import type { AuthenticatedBot } from "../auth/bot-auth"
import { getBotWhereClauseForTable } from "./bot-tables"

const testBot: AuthenticatedBot = {
	botId: "00000000-0000-0000-0000-0000000000b0" as BotId,
	userId: "00000000-0000-0000-0000-0000000000a1" as UserId,
	accessContext: {
		channelIds: [
			"00000000-0000-0000-0000-0000000000c1" as ChannelId,
			"00000000-0000-0000-0000-0000000000c2" as ChannelId,
		],
	},
}

describe("bot table where clause builder", () => {
	it("builds single-param subquery for messages", async () => {
		const result = await Effect.runPromise(getBotWhereClauseForTable("messages", testBot))

		expect(result.params).toEqual([testBot.botId])
		expect(result.whereClause).toContain(`"channelId" IN (SELECT "id" FROM channels`)
		expect(result.whereClause).toContain(
			`"organizationId" IN (SELECT "organizationId" FROM bot_installations WHERE "botId" = $1)`,
		)
		expect(result.whereClause).toContain(`"deletedAt" IS NULL`)
		expect(result.whereClause).not.toContain("$2")
	})

	it("builds single-param subquery for channels", async () => {
		const result = await Effect.runPromise(getBotWhereClauseForTable("channels", testBot))

		expect(result.params).toEqual([testBot.botId])
		expect(result.whereClause).toContain(
			`"organizationId" IN (SELECT "organizationId" FROM bot_installations WHERE "botId" = $1)`,
		)
		expect(result.whereClause).toContain(`"deletedAt" IS NULL`)
		expect(result.whereClause).not.toContain("$2")
	})

	it("builds single-param subquery for channel_members", async () => {
		const result = await Effect.runPromise(getBotWhereClauseForTable("channel_members", testBot))

		expect(result.params).toEqual([testBot.botId])
		expect(result.whereClause).toContain(`"channelId" IN (SELECT "id" FROM channels`)
		expect(result.whereClause).toContain(
			`"organizationId" IN (SELECT "organizationId" FROM bot_installations WHERE "botId" = $1)`,
		)
		expect(result.whereClause).toContain(`"deletedAt" IS NULL`)
		expect(result.whereClause).not.toContain("$2")
	})
})
