"use client"

import { createContext, use } from "react"
import type {
	CommandPalettePageType,
	CreateChannelPageState,
	JoinChannelPageState,
	PageState,
	SearchPageState,
} from "~/atoms/command-palette-state"
import type { PageStateUpdater } from "~/hooks/use-command-palette"

/**
 * Context value for command palette
 * Provides state and actions to child components
 */
export interface CommandPaletteContextValue {
	// State
	isOpen: boolean
	currentPage: PageState
	canGoBack: boolean

	// Navigation actions
	open: (initialPage?: CommandPalettePageType) => void
	close: () => void
	navigateTo: (pageType: CommandPalettePageType) => void
	goBack: () => void

	// Page-specific state updaters
	updateSearchState: (updater: PageStateUpdater<SearchPageState>) => void
	updateCreateChannelState: (updater: PageStateUpdater<CreateChannelPageState>) => void
	updateJoinChannelState: (updater: PageStateUpdater<JoinChannelPageState>) => void
	updateInputValue: (value: string) => void
}

/**
 * Context for command palette state and actions
 */
export const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(null)

/**
 * Hook to access command palette context
 * Must be used within CommandPaletteProvider
 */
export function useCommandPaletteContext(): CommandPaletteContextValue {
	const context = use(CommandPaletteContext)

	if (!context) {
		throw new Error("useCommandPaletteContext must be used within a CommandPaletteProvider")
	}

	return context
}
