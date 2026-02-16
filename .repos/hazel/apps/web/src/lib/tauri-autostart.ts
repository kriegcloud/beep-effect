/**
 * @module Desktop autostart functionality
 * @platform desktop
 * @description Enable/disable automatic app launch at system login
 */

type AutostartApi = typeof import("@tauri-apps/plugin-autostart")

const autostart: AutostartApi | undefined = (window as any).__TAURI__?.autostart

export async function enableAutostart(): Promise<boolean> {
	if (!autostart) return false
	await autostart.enable()
	return true
}

export async function disableAutostart(): Promise<boolean> {
	if (!autostart) return false
	await autostart.disable()
	return true
}

export async function isAutostartEnabled(): Promise<boolean> {
	if (!autostart) return false
	return await autostart.isEnabled()
}
