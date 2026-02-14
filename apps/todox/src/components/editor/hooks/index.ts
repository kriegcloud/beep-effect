/**
 * Editor hooks for the Lexical editor.
 *
 * These hooks provide common utilities for editor plugins and components:
 * - `useDebounce` - Debounce utility for auto-save, search, etc.
 * - `useFlashMessage` - Flash message display
 * - `useModal` - Modal state management with shadcn Dialog
 * - `useReport` - Report overlay display
 * - `useUpdateToolbarHandler` - Toolbar state synchronization with selection
 */

export { useDebounce } from "./useDebounce";
export { default as useFlashMessage } from "./useFlashMessage";
export { default as useModal } from "./useModal";
export { default as useReport } from "./useReport";
export { useUpdateToolbarHandler } from "./useUpdateToolbar";
