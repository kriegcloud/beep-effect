import { useCallback, useEffect } from "react"

export interface UseGlobalKeyboardFocusOptions {
	/**
	 * Callback to handle text insertion when a printable character is typed
	 */
	onInsertText: (text: string) => void
	/**
	 * Conditional flag - only attach listener when true
	 * @default true
	 */
	when?: boolean
}

/**
 * Hook that intercepts global keyboard input and focuses/inserts text into a target element
 * when user types printable characters (outside of inputs, textareas, or other editable elements).
 *
 * This is useful for chat interfaces where typing anywhere should focus the message input.
 *
 * @example
 * useGlobalKeyboardFocus({
 *   onInsertText: (text) => {
 *     // Focus editor and insert the typed character
 *     editorRef.current?.focus()
 *     insertText(text)
 *   }
 * })
 */
export function useGlobalKeyboardFocus(options: UseGlobalKeyboardFocusOptions) {
	const { onInsertText, when = true } = options

	// Wrap onInsertText in useCallback to prevent recreating the effect unnecessarily
	const handleInsertText = useCallback(onInsertText, [])

	useEffect(() => {
		if (!when) return

		const handleGlobalKeyDown = (event: KeyboardEvent) => {
			const target = event.target as HTMLElement

			// Ignore if user is already in an input field
			if (
				target.tagName === "INPUT" ||
				target.tagName === "TEXTAREA" ||
				target.contentEditable === "true"
			) {
				return
			}

			// Check if there's an actually visible/open dialog
			// We exclude dialogs that are hidden via aria-hidden
			const hasDialog = !!document.querySelector(
				'[role="dialog"]:not([data-react-aria-hidden="true"] *)',
			)

			if (hasDialog) {
				return
			}

			// Ignore modifier keys
			if (event.ctrlKey || event.altKey || event.metaKey) {
				return
			}

			// Only handle printable characters (single character keys)
			const isPrintableChar = event.key.length === 1

			if (isPrintableChar) {
				event.preventDefault()
				handleInsertText(event.key)
			}
		}

		document.addEventListener("keydown", handleGlobalKeyDown)

		return () => {
			document.removeEventListener("keydown", handleGlobalKeyDown)
		}
	}, [handleInsertText, when])
}
