import { describe, expect, it, layer } from "@effect/vitest"
import { Effect, Exit, Option } from "effect"
import { SessionExpiredError } from "@hazel/domain"
import { BackendAuth, type UserRepoLike } from "./backend-auth.ts"
import type { UserId } from "@hazel/schema"

// ===== Mock UserRepo Factory =====

const createMockUserRepo = (options?: {
	existingUser?: {
		id: UserId
		email: string
		firstName: string
		lastName: string
		avatarUrl: string
		isOnboarded: boolean
		timezone: string | null
	}
	onUpsert?: (user: any) => any
	shouldFailFind?: boolean
	shouldFailUpsert?: boolean
}): UserRepoLike => ({
	findByExternalId: (_externalId: string) => {
		if (options?.shouldFailFind) {
			return Effect.fail({ _tag: "DatabaseError" as const })
		}
		return Effect.succeed(options?.existingUser ? Option.some(options.existingUser) : Option.none())
	},
	upsertByExternalId: (user: any) => {
		if (options?.shouldFailUpsert) {
			return Effect.fail({ _tag: "DatabaseError" as const })
		}
		const result = options?.onUpsert?.(user) ?? {
			id: `usr_${Date.now()}` as UserId,
			email: user.email,
			firstName: user.firstName,
			lastName: user.lastName,
			avatarUrl: user.avatarUrl,
			isOnboarded: user.isOnboarded,
			timezone: user.timezone,
		}
		return Effect.succeed(result)
	},
})

// ===== Tests =====

describe("BackendAuth", () => {
	describe("authenticateWithBearer", () => {
		layer(BackendAuth.Test)("successful authentication", (it) => {
			it.effect("returns CurrentUser", () =>
				Effect.gen(function* () {
					const auth = yield* BackendAuth
					const userRepo = createMockUserRepo()

					const result = yield* auth.authenticateWithBearer("valid-bearer-token", userRepo)

					expect(result.email).toBe("test@example.com")
					expect(result.role).toBe("member")
				}),
			)
		})
	})

	describe("TestWith", () => {
		describe("failure scenarios", () => {
			layer(
				BackendAuth.TestWith({
					shouldFail: {
						authenticateWithBearer: Effect.fail(
							new SessionExpiredError({
								message: "Bearer token expired",
								detail: "The bearer token could not be verified",
							}),
						),
					},
				}),
			)("bearer auth failure", (it) => {
				it.effect("fails with error on bearer auth", () =>
					Effect.gen(function* () {
						const auth = yield* BackendAuth
						const userRepo = createMockUserRepo()

						const exit = yield* auth
							.authenticateWithBearer("invalid-token", userRepo)
							.pipe(Effect.exit)

						expect(Exit.isFailure(exit)).toBe(true)
					}),
				)
			})
		})
	})
})
