import { describe, expect, it } from "vitest"
import { buildNotificationInsertRows, buildOrgMemberLookup } from "./message-notification-handler"

describe("message-notification-handler utilities", () => {
	it("builds org-member lookup by user id", () => {
		const lookup = buildOrgMemberLookup([
			{ userId: "u1" as any, orgMemberId: "om1" as any },
			{ userId: "u2" as any, orgMemberId: "om2" as any },
		])

		expect(lookup.get("u1" as any)).toBe("om1")
		expect(lookup.get("u2" as any)).toBe("om2")
	})

	it("creates insert rows only for resolvable members", () => {
		const members = [
			{ id: "cm1", userId: "u1" },
			{ id: "cm2", userId: "u2" },
		] as any
		const orgLookup = new Map([["u1", "om1"]]) as any

		const result = buildNotificationInsertRows(members, orgLookup, {
			channelId: "ch1",
			messageId: "msg1",
		} as any)

		expect(result.values).toHaveLength(1)
		expect(result.values[0]?.memberId).toBe("om1")
		expect(result.values[0]?.targetedResourceId).toBe("ch1")
		expect(result.channelMemberByOrgMember.get("om1" as any)).toBe("cm1")
	})
})
