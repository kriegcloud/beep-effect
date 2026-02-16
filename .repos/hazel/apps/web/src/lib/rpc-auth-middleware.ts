/**
 * @module RPC Auth Middleware
 * @platform all
 * @description Client-side auth middleware that adds Bearer token from storage (Tauri store or localStorage)
 */

import { Headers } from "@effect/platform"
import { RpcMiddleware } from "@effect/rpc"
import { AuthMiddleware } from "@hazel/domain/rpc"
import { Effect } from "effect"
import { getDesktopAccessToken } from "~/atoms/desktop-auth"
import { getWebAccessToken } from "~/atoms/web-auth"
import { isTauri } from "~/lib/tauri"

export const AuthMiddlewareClientLive = RpcMiddleware.layerClient(AuthMiddleware, ({ request }) =>
	Effect.gen(function* () {
		let token: string | null = null

		if (isTauri()) {
			// Desktop: get token from Tauri secure storage
			token = yield* Effect.promise(() => getDesktopAccessToken())
		} else {
			// Web: get token from localStorage
			token = yield* Effect.promise(() => getWebAccessToken())
		}

		if (token) {
			const newHeaders = Headers.set(request.headers, "authorization", `Bearer ${token}`)
			return { ...request, headers: newHeaders }
		}

		return request
	}),
)
