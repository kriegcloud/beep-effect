import type { BaseEditor } from "slate"
import type { HistoryEditor } from "slate-history"
import type { ReactEditor } from "slate-react"

type CustomEditor = BaseEditor & ReactEditor & HistoryEditor

// File types accepted for paste (matching ACCEPTED_FILE_TYPES in slate-message-composer.tsx)
const ACCEPTED_FILE_TYPES = [
	"image/*",
	"video/*",
	"audio/*",
	"application/pdf",
	"application/msword",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	"application/vnd.ms-excel",
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	"text/plain",
	"text/csv",
]

/**
 * Check if a file type matches the accepted types.
 * Handles wildcard types like "image/*".
 */
function isFileTypeAccepted(fileType: string): boolean {
	for (const acceptedType of ACCEPTED_FILE_TYPES) {
		if (acceptedType.endsWith("/*")) {
			// Wildcard match (e.g., "image/*" matches "image/png")
			const prefix = acceptedType.slice(0, -1) // "image/"
			if (fileType.startsWith(prefix)) {
				return true
			}
		} else if (fileType === acceptedType) {
			return true
		}
	}
	return false
}

/**
 * Plugin to handle pasting files and images from clipboard.
 * Intercepts paste events and extracts files before falling through to text paste.
 *
 * Supports:
 * - Files copied from Finder/Explorer
 * - Images copied from any application
 * - Screenshots taken with system screenshot tools
 */
export function withFilePaste<T extends CustomEditor>(editor: T, onFilePaste: (files: File[]) => void): T {
	const { insertData } = editor

	editor.insertData = (data: DataTransfer) => {
		const files: File[] = []

		// Check data.files first (copied files from Finder/Explorer)
		if (data.files && data.files.length > 0) {
			for (const file of Array.from(data.files)) {
				if (isFileTypeAccepted(file.type)) {
					files.push(file)
				}
			}
		}

		// Check data.items for images (screenshots, copied images from apps)
		// This catches cases where data.files is empty but clipboard has image data
		if (files.length === 0 && data.items) {
			for (const item of Array.from(data.items)) {
				// Check if it's a file type we accept
				if (item.kind === "file" && isFileTypeAccepted(item.type)) {
					const file = item.getAsFile()
					if (file) {
						files.push(file)
					}
				}
			}
		}

		// If we found valid files, handle them and return early
		if (files.length > 0) {
			onFilePaste(files)
			return
		}

		// No valid files found, fall through to normal paste behavior
		insertData(data)
	}

	return editor
}
