/**
 * @module App version utilities
 * @description Get the app version for display in the UI
 */

import { useEffect, useState } from "react"
import { isTauri } from "./tauri"

/**
 * Hook to get the app version
 * - Web builds: Returns the build-time injected version from tauri.conf.json
 * - Tauri builds: Returns the actual installed app version via Tauri API
 */
export function useAppVersion(): string | null {
	const [version, setVersion] = useState<string | null>(() => {
		// Web builds can return immediately
		if (typeof window === "undefined") return null
		if (!("__TAURI_INTERNALS__" in window)) return __APP_VERSION__
		return null
	})

	useEffect(() => {
		if (isTauri()) {
			// Get version from Tauri API (actual installed app version)
			const app = (window as any).__TAURI__?.app
			app?.getVersion?.().then(setVersion)
		}
	}, [])

	return version
}
