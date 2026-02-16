/**
 * @module Desktop authentication atoms
 * @platform desktop
 * @description Effect Atom-based state management for desktop OAuth authentication
 *
 * This module replaces the Promise-based wrappers with a clean Effect Atom architecture:
 * - Uses atoms for all auth state (tokens, refresh timer, OAuth flow)
 * - Uses atom finalizers for cleanup (no module-level timers)
 * - Proper Result types for React integration
 */

import { Atom } from "@effect-atom/atom-react"
import { Clipboard } from "@effect/platform-browser"
import type { OrganizationId } from "@hazel/schema"
import { Deferred, Duration, Effect, Exit, Layer, Option, Ref, Schema } from "effect"
import { runtime } from "~/lib/services/common/runtime"
import { TauriAuth } from "~/lib/services/desktop/tauri-auth"
import { TokenExchange } from "~/lib/services/desktop/token-exchange"
import { TokenStorage } from "~/lib/services/desktop/token-storage"
import { isTauri } from "~/lib/tauri"

// ============================================================================
// Types
// ============================================================================

export interface DesktopTokens {
	accessToken: string
	refreshToken: string
	expiresAt: number
}

export type DesktopAuthStatus = "idle" | "loading" | "authenticated" | "error"

export interface DesktopAuthError {
	_tag: string
	message: string
}

interface DesktopLoginOptions {
	returnTo?: string
	organizationId?: OrganizationId
	invitationToken?: string
}

interface DesktopLogoutOptions {
	redirectTo?: string
}

// ============================================================================
// Constants
// ============================================================================

// Refresh 5 minutes before expiry
const REFRESH_BUFFER_MS = 5 * 60 * 1000

// Retry configuration for transient errors
const MAX_REFRESH_RETRIES = 3
const BASE_BACKOFF_MS = 1000 // 1s, 2s, 4s

// ============================================================================
// Layers
// ============================================================================

const TokenStorageLive = TokenStorage.Default
const TokenExchangeLive = TokenExchange.Default.pipe(Layer.provide(TokenStorageLive))
const TauriAuthLive = TauriAuth.Default.pipe(
	Layer.provide(TokenStorageLive),
	Layer.provide(TokenExchangeLive),
)
const ClipboardLive = Clipboard.layer

// ============================================================================
// Core State Atoms
// ============================================================================

/**
 * Writable atom holding the current desktop tokens
 * Null when not authenticated
 */
export const desktopTokensAtom = Atom.make<DesktopTokens | null>(null).pipe(Atom.keepAlive)

/**
 * Writable atom holding the current auth status
 */
export const desktopAuthStatusAtom = Atom.make<DesktopAuthStatus>("idle").pipe(Atom.keepAlive)

/**
 * Writable atom holding the last auth error (if any)
 */
export const desktopAuthErrorAtom = Atom.make<DesktopAuthError | null>(null).pipe(Atom.keepAlive)

/**
 * Ref to track if refresh is in progress (prevents concurrent refreshes)
 */
const isRefreshingRef = Ref.unsafeMake(false)

/**
 * Ref holding a Deferred that resolves when current refresh completes
 * Allows callers to wait for an in-progress refresh
 */
const refreshDeferredRef = Ref.unsafeMake<Deferred.Deferred<boolean> | null>(null)

// ============================================================================
// Derived Atoms
// ============================================================================

/**
 * Derived atom that returns whether the user is authenticated on desktop
 */
export const isDesktopAuthenticatedAtom = Atom.make((get) => get(desktopTokensAtom) !== null)

// ============================================================================
// Token Refresh Logic
// ============================================================================

/**
 * Getter interface for atom actions (matches what Atom.make provides)
 */
interface AtomGetter {
	<T>(atom: Atom.Atom<T>): T
	set<T>(atom: Atom.Writable<T>, value: T): void
	addFinalizer(fn: () => void): void
	refresh<T>(atom: Atom.Atom<T>): void
}

/**
 * Check if an error is a fatal error (refresh token revoked/invalid)
 * Fatal errors should not be retried
 */
export const isFatalRefreshError = (error: { _tag?: string; message?: string; detail?: string }): boolean => {
	// 401 from refresh endpoint means refresh token is revoked/invalid
	if (error.detail?.includes("HTTP 401")) return true
	// 403 means forbidden - token blacklisted or similar
	if (error.detail?.includes("HTTP 403")) return true
	return false
}

/**
 * Check if an error is transient (timeout, network) and can be retried
 */
export const isTransientError = (error: { _tag?: string; message?: string }): boolean => {
	const message = error.message?.toLowerCase() ?? ""
	return (
		message.includes("timed out") ||
		message.includes("timeout") ||
		message.includes("network error") ||
		error._tag === "TimeoutException" ||
		error._tag === "RequestError"
	)
}

/**
 * Effect that performs the actual token refresh with retry logic
 * Returns true if refresh succeeded, false if failed/skipped
 */
const doRefresh = (get: AtomGetter) =>
	Effect.gen(function* () {
		// Prevent concurrent refreshes - but allow caller to wait
		const alreadyRefreshing = yield* Ref.get(isRefreshingRef)
		if (alreadyRefreshing) {
			yield* Effect.log("[desktop-auth] Already refreshing, skipping")
			return false
		}

		yield* Ref.set(isRefreshingRef, true)

		// Create a Deferred so callers can wait for this refresh
		const deferred = yield* Deferred.make<boolean>()
		yield* Ref.set(refreshDeferredRef, deferred)

		// Use a Ref to store the result so we can access it in the finalizer
		const resultRef = yield* Ref.make<boolean>(false)

		yield* Effect.gen(function* () {
			const tokenStorage = yield* TokenStorage
			const tokenExchange = yield* TokenExchange

			// Get refresh token
			const refreshTokenOpt = yield* tokenStorage.getRefreshToken
			if (Option.isNone(refreshTokenOpt)) {
				yield* Effect.log("[desktop-auth] No refresh token found, user needs to re-login")
				// Clear state and dispatch session expired event
				get.set(desktopTokensAtom, null)
				get.set(desktopAuthStatusAtom, "error")
				get.set(desktopAuthErrorAtom, {
					_tag: "TokenNotFoundError",
					message: "No refresh token found",
				})

				if (typeof window !== "undefined") {
					window.dispatchEvent(new CustomEvent("auth:session-expired"))
				}
				yield* Ref.set(resultRef, false)
				return
			}

			yield* Effect.log("[desktop-auth] Refreshing tokens...")

			// Attempt refresh with retries for transient errors
			const attemptRefresh = (attempt: number): Effect.Effect<boolean> =>
				Effect.gen(function* () {
					const refreshResult = yield* tokenExchange.refreshToken(refreshTokenOpt.value).pipe(
						Effect.map((tokens) => ({ success: true as const, tokens })),
						Effect.catchAll((error) => Effect.succeed({ success: false as const, error })),
					)

					if (refreshResult.success) {
						const { tokens } = refreshResult
						// Store new tokens
						yield* tokenStorage
							.storeTokens(tokens.accessToken, tokens.refreshToken, tokens.expiresIn)
							.pipe(Effect.orDie)

						// Update atom state
						const expiresAt = Date.now() + tokens.expiresIn * 1000
						get.set(desktopTokensAtom, {
							accessToken: tokens.accessToken,
							refreshToken: tokens.refreshToken,
							expiresAt,
						})
						get.set(desktopAuthErrorAtom, null)

						yield* Effect.log("[desktop-auth] Tokens refreshed successfully")
						return true
					}

					const { error } = refreshResult

					// Fatal error - don't retry, logout immediately
					if (isFatalRefreshError(error)) {
						yield* Effect.log(
							`[desktop-auth] Fatal refresh error (attempt ${attempt}): ${error.message}`,
						)
						console.error("[desktop-auth] Fatal token refresh error:", error)
						get.set(desktopAuthErrorAtom, {
							_tag: error._tag ?? "UnknownError",
							message: error.message ?? "Token refresh failed",
						})
						if (typeof window !== "undefined") {
							window.dispatchEvent(new CustomEvent("auth:session-expired"))
						}
						return false
					}

					// Transient error - retry with backoff
					if (isTransientError(error) && attempt < MAX_REFRESH_RETRIES) {
						const backoffMs = BASE_BACKOFF_MS * Math.pow(2, attempt - 1)
						yield* Effect.log(
							`[desktop-auth] Transient error (attempt ${attempt}/${MAX_REFRESH_RETRIES}), retrying in ${backoffMs}ms: ${error.message}`,
						)
						yield* Effect.sleep(Duration.millis(backoffMs))
						return yield* attemptRefresh(attempt + 1)
					}

					// Max retries exhausted or non-transient error
					yield* Effect.log(
						`[desktop-auth] Refresh failed after ${attempt} attempts: ${error.message}`,
					)
					console.error("[desktop-auth] Token refresh failed after retries:", error)
					get.set(desktopAuthErrorAtom, {
						_tag: error._tag ?? "UnknownError",
						message: error.message ?? "Token refresh failed",
					})
					if (typeof window !== "undefined") {
						window.dispatchEvent(new CustomEvent("auth:session-expired"))
					}
					return false
				})

			const refreshed = yield* attemptRefresh(1)
			yield* Ref.set(resultRef, refreshed)
		}).pipe(
			Effect.provide(TokenStorageLive),
			Effect.provide(TokenExchangeLive),
			Effect.ensuring(
				Effect.gen(function* () {
					yield* Ref.set(isRefreshingRef, false)
					// Resolve the Deferred so waiters get the result
					const currentDeferred = yield* Ref.get(refreshDeferredRef)
					const finalResult = yield* Ref.get(resultRef)
					if (currentDeferred) {
						yield* Deferred.succeed(currentDeferred, finalResult)
					}
					yield* Ref.set(refreshDeferredRef, null)
				}),
			),
			Effect.catchAll((error) => {
				// Catch any unexpected errors
				console.error("[desktop-auth] Unexpected error during refresh:", error)
				get.set(desktopAuthErrorAtom, {
					_tag: "UnknownError",
					message: "Unexpected error during token refresh",
				})
				return Effect.void
			}),
		)

		return yield* Ref.get(resultRef)
	})

// ============================================================================
// Action Atoms
// ============================================================================

/**
 * Action atom that initiates the desktop OAuth flow
 * Opens system browser, waits for callback, stores tokens
 */
export const desktopLoginAtom = Atom.fn(
	Effect.fnUntraced(function* (options: DesktopLoginOptions, get) {
		if (!isTauri()) {
			yield* Effect.log("[desktop-auth] Not in Tauri environment, skipping desktop login")
			return
		}

		get.set(desktopAuthStatusAtom, "loading")
		get.set(desktopAuthErrorAtom, null)

		const result = yield* Effect.gen(function* () {
			const auth = yield* TauriAuth
			return yield* auth.initiateAuth(options)
		}).pipe(
			Effect.provide(TauriAuthLive),
			Effect.catchAll((error) => {
				console.error("[desktop-auth] Login failed:", error)
				get.set(desktopAuthStatusAtom, "error")
				get.set(desktopAuthErrorAtom, {
					_tag: error._tag ?? "UnknownError",
					message: error.message ?? "Login failed",
				})
				return Effect.fail(error)
			}),
		)

		// Load the newly stored tokens into atom state
		yield* Effect.gen(function* () {
			const tokenStorage = yield* TokenStorage
			const accessTokenOpt = yield* tokenStorage.getAccessToken
			const refreshTokenOpt = yield* tokenStorage.getRefreshToken
			const expiresAtOpt = yield* tokenStorage.getExpiresAt

			if (
				Option.isSome(accessTokenOpt) &&
				Option.isSome(refreshTokenOpt) &&
				Option.isSome(expiresAtOpt)
			) {
				get.set(desktopTokensAtom, {
					accessToken: accessTokenOpt.value,
					refreshToken: refreshTokenOpt.value,
					expiresAt: expiresAtOpt.value,
				})
				get.set(desktopAuthStatusAtom, "authenticated")
			}
		}).pipe(Effect.provide(TokenStorageLive))

		// Navigate to return path
		yield* Effect.log(`[desktop-auth] Login successful, navigating to: ${result.returnTo}`)
		window.location.href = result.returnTo
	}),
)

/**
 * Action atom that performs desktop logout
 * Clears tokens from storage and resets atom state
 */
export const desktopLogoutAtom = Atom.fn(
	Effect.fnUntraced(function* (options?: DesktopLogoutOptions, get?) {
		if (!isTauri()) {
			yield* Effect.log("[desktop-auth] Not in Tauri environment, skipping desktop logout")
			return
		}

		yield* Effect.gen(function* () {
			const tokenStorage = yield* TokenStorage
			yield* tokenStorage.clearTokens
		}).pipe(
			Effect.provide(TokenStorageLive),
			Effect.catchAll((error) => {
				console.error("[desktop-auth] Failed to clear tokens:", error)
				return Effect.void
			}),
		)

		// Reset atom state
		get?.set(desktopTokensAtom, null)
		get?.set(desktopAuthStatusAtom, "idle")
		get?.set(desktopAuthErrorAtom, null)

		// Navigate to redirect path
		const redirectTo = options?.redirectTo || "/"
		yield* Effect.log(`[desktop-auth] Logout complete, redirecting to: ${redirectTo}`)
		window.location.href = redirectTo
	}),
)

/**
 * Action atom that forces an immediate token refresh
 * Useful when you need fresh tokens for a specific operation
 */
export const desktopForceRefreshAtom = Atom.fn(
	Effect.fnUntraced(function* (_: void, get) {
		if (!isTauri()) return false
		return yield* doRefresh(get)
	}),
)

/**
 * Schema for clipboard auth payload
 */
const ClipboardAuthPayload = Schema.Struct({
	code: Schema.String,
	state: Schema.Unknown,
})

/**
 * Action atom that authenticates using clipboard data
 * Used as fallback when local OAuth server connection fails
 */
export const desktopLoginFromClipboardAtom = Atom.fn(
	Effect.fnUntraced(function* (_: void, get) {
		if (!isTauri()) return

		get.set(desktopAuthStatusAtom, "loading")
		get.set(desktopAuthErrorAtom, null)

		const result = yield* Effect.gen(function* () {
			// Read clipboard using Effect Platform API
			const clipboard = yield* Clipboard.Clipboard
			const clipboardText = yield* clipboard.readString

			// Parse JSON and validate structure
			const rawJson = yield* Effect.try({
				try: () => JSON.parse(clipboardText),
				catch: () => new Error("Invalid clipboard data - not valid JSON"),
			})

			const parsed = yield* Schema.decodeUnknown(ClipboardAuthPayload)(rawJson).pipe(
				Effect.mapError(() => new Error("Invalid clipboard data - missing code or state")),
			)

			// State needs to be stringified for the token exchange
			const stateString = typeof parsed.state === "string" ? parsed.state : JSON.stringify(parsed.state)

			// Exchange code for tokens
			const tokenExchange = yield* TokenExchange
			return yield* tokenExchange.exchangeCode(parsed.code, stateString)
		}).pipe(
			Effect.provide(ClipboardLive),
			Effect.provide(TokenExchangeLive),
			Effect.catchAll((error) => {
				console.error("[desktop-auth] Clipboard login failed:", error)
				get.set(desktopAuthStatusAtom, "error")
				get.set(desktopAuthErrorAtom, {
					_tag: "ClipboardAuthError",
					message: error instanceof Error ? error.message : "Failed to authenticate from clipboard",
				})
				return Effect.fail(error)
			}),
		)

		// Store tokens
		yield* Effect.gen(function* () {
			const tokenStorage = yield* TokenStorage
			yield* tokenStorage.storeTokens(result.accessToken, result.refreshToken, result.expiresIn)
		}).pipe(Effect.provide(TokenStorageLive))

		// Update atom state
		get.set(desktopTokensAtom, {
			accessToken: result.accessToken,
			refreshToken: result.refreshToken,
			expiresAt: Date.now() + result.expiresIn * 1000,
		})
		get.set(desktopAuthStatusAtom, "authenticated")

		yield* Effect.log("[desktop-auth] Clipboard login successful")
		window.location.href = "/"
	}),
)

// ============================================================================
// Initialization Atom
// ============================================================================

/**
 * Initialization atom that loads stored tokens into atom state on startup
 * Should be mounted once at app startup
 */
export const desktopInitAtom = Atom.make((get) => {
	// Skip if not in Tauri environment
	if (!isTauri()) return null

	// Load tokens from storage asynchronously
	const loadTokens = Effect.gen(function* () {
		const tokenStorage = yield* TokenStorage
		const accessTokenOpt = yield* tokenStorage.getAccessToken
		const refreshTokenOpt = yield* tokenStorage.getRefreshToken
		const expiresAtOpt = yield* tokenStorage.getExpiresAt

		if (Option.isSome(accessTokenOpt) && Option.isSome(refreshTokenOpt) && Option.isSome(expiresAtOpt)) {
			get.set(desktopTokensAtom, {
				accessToken: accessTokenOpt.value,
				refreshToken: refreshTokenOpt.value,
				expiresAt: expiresAtOpt.value,
			})
			get.set(desktopAuthStatusAtom, "authenticated")
			yield* Effect.log("[desktop-auth] Loaded tokens from storage")
		} else {
			get.set(desktopAuthStatusAtom, "idle")
			yield* Effect.log("[desktop-auth] No stored tokens found")
		}
	}).pipe(
		Effect.provide(TokenStorageLive),
		Effect.catchAll((error) => {
			console.error("[desktop-auth] Failed to load tokens:", error)
			get.set(desktopAuthStatusAtom, "error")
			get.set(desktopAuthErrorAtom, {
				_tag: error._tag ?? "UnknownError",
				message: error.message ?? "Failed to load tokens",
			})
			return Effect.void
		}),
	)

	// Run token loading
	const fiber = runtime.runFork(loadTokens)

	get.addFinalizer(() => {
		fiber.unsafeInterruptAsFork(fiber.id())
	})

	return null
}).pipe(Atom.keepAlive)

// ============================================================================
// Token Refresh Scheduler Atom
// ============================================================================

/**
 * Scheduler atom that automatically refreshes tokens before they expire
 * Uses fiber + finalizer for cleanup (no module-level setTimeout)
 */
export const desktopTokenSchedulerAtom = Atom.make((get) => {
	const tokens = get(desktopTokensAtom)

	// Skip if not authenticated or not in Tauri
	if (!tokens || !isTauri()) return null

	const timeUntilRefresh = tokens.expiresAt - Date.now() - REFRESH_BUFFER_MS

	if (timeUntilRefresh <= 0) {
		// Token expired or about to expire, refresh immediately
		runtime.runFork(
			Effect.gen(function* () {
				yield* Effect.log("[desktop-auth] Token expired or expiring soon, refreshing now")
				yield* doRefresh(get)
			}),
		)
		return { scheduledFor: Date.now(), immediate: true }
	}

	// Schedule refresh using Effect.sleep
	const minutes = Math.round(timeUntilRefresh / 1000 / 60)
	const scheduledFor = tokens.expiresAt - REFRESH_BUFFER_MS

	const refreshSchedule = Effect.gen(function* () {
		yield* Effect.log(`[desktop-auth] Scheduling refresh in ${minutes} minutes`)
		yield* Effect.sleep(Duration.millis(timeUntilRefresh))
		yield* Effect.log("[desktop-auth] Scheduled refresh triggered")
		yield* doRefresh(get)
	})

	const fiber = runtime.runFork(refreshSchedule)

	get.addFinalizer(() => {
		fiber.unsafeInterruptAsFork(fiber.id())
	})

	return { scheduledFor, immediate: false }
}).pipe(Atom.keepAlive)

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get the current access token (for use in HTTP headers)
 * Returns null if not authenticated
 */
export const getDesktopAccessToken = (): Promise<string | null> => {
	if (!isTauri()) return Promise.resolve(null)

	return Effect.runPromise(
		Effect.gen(function* () {
			const tokenStorage = yield* TokenStorage
			const tokenOpt = yield* tokenStorage.getAccessToken
			return Option.getOrNull(tokenOpt)
		}).pipe(
			Effect.provide(TokenStorageLive),
			Effect.catchAll(() => Effect.succeed(null)),
		),
	)
}

/**
 * Wait for any in-progress token refresh to complete
 * Returns true if refresh succeeded, false otherwise, or true if no refresh in progress
 */
export const waitForRefresh = (): Promise<boolean> => {
	if (!isTauri()) return Promise.resolve(true)

	return Effect.runPromise(
		Effect.gen(function* () {
			const deferred = yield* Ref.get(refreshDeferredRef)
			if (deferred) {
				yield* Effect.log("[desktop-auth] Waiting for in-progress refresh...")
				return yield* Deferred.await(deferred)
			}
			return true
		}).pipe(Effect.catchAll(() => Effect.succeed(true))),
	)
}

/**
 * Force an immediate token refresh (Promise-based for use by auth-fetch)
 * Returns true if refresh succeeded, false otherwise
 */
export const forceRefresh = (): Promise<boolean> => {
	if (!isTauri()) return Promise.resolve(false)

	return Effect.runPromise(
		Effect.gen(function* () {
			// Check if a refresh is already in progress
			const alreadyRefreshing = yield* Ref.get(isRefreshingRef)
			if (alreadyRefreshing) {
				// Wait for the in-progress refresh instead of starting a new one
				const deferred = yield* Ref.get(refreshDeferredRef)
				if (deferred) {
					yield* Effect.log("[desktop-auth] forceRefresh: waiting for in-progress refresh")
					return yield* Deferred.await(deferred)
				}
				return false
			}

			// Get refresh token to check if we can refresh
			const tokenStorage = yield* TokenStorage
			const refreshTokenOpt = yield* tokenStorage.getRefreshToken
			if (Option.isNone(refreshTokenOpt)) {
				yield* Effect.log("[desktop-auth] forceRefresh: no refresh token available")
				return false
			}

			// Perform the refresh using a mock getter that doesn't use atoms
			// This is a simplified version for auth-fetch use case
			const tokenExchange = yield* TokenExchange

			yield* Effect.log("[desktop-auth] forceRefresh: starting refresh...")
			yield* Ref.set(isRefreshingRef, true)

			const result = yield* tokenExchange.refreshToken(refreshTokenOpt.value).pipe(
				Effect.flatMap((tokens) =>
					Effect.gen(function* () {
						yield* tokenStorage.storeTokens(
							tokens.accessToken,
							tokens.refreshToken,
							tokens.expiresIn,
						)
						yield* Effect.log("[desktop-auth] forceRefresh: tokens refreshed successfully")
						return true
					}),
				),
				Effect.catchAll((error) => {
					console.error("[desktop-auth] forceRefresh failed:", error)
					return Effect.succeed(false)
				}),
				Effect.ensuring(Ref.set(isRefreshingRef, false)),
			)

			return result
		}).pipe(
			Effect.provide(TokenStorageLive),
			Effect.provide(TokenExchangeLive),
			Effect.catchAll(() => Effect.succeed(false)),
		),
	)
}
