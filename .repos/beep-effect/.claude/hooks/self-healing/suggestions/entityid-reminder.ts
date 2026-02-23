/**
 * EntityId Reminder Suggestion
 *
 * Detects plain S.String usage in contexts that likely should use branded EntityIds.
 * Example: `id: S.String` in a Model class should probably be `id: SharedEntityIds.UserId`
 *
 * UNSAFE: This requires human judgment - not all string fields should be EntityIds.
 * The pattern only detects likely candidates based on field naming conventions.
 */

import * as String from "effect/String"
import type { HookPattern, FixResult } from "../types"

export const pattern: HookPattern = {
  id: "EID_001",
  name: "entityid-reminder",
  pattern: "\\b(id|userId|organizationId|memberId|teamId|sessionId|documentId|eventId):\\s*S\\.String\\b",
  fix_type: "unsafe",
  description: "Suggest using branded EntityIds instead of plain S.String for ID fields",
  category: "entityid",
  file_extensions: [".ts", ".tsx"],
}

/**
 * Mapping of field names to likely EntityId types
 */
const fieldToEntityId: Record<string, string> = {
  id: "Consider using the appropriate EntityId (e.g., SharedEntityIds.UserId, IamEntityIds.MemberId)",
  userId: "SharedEntityIds.UserId",
  organizationId: "SharedEntityIds.OrganizationId",
  memberId: "IamEntityIds.MemberId",
  teamId: "SharedEntityIds.TeamId",
  sessionId: "SharedEntityIds.SessionId",
  documentId: "DocumentsEntityIds.DocumentId",
  eventId: "CalendarEntityIds.EventId",
  folderId: "SharedEntityIds.FolderId",
  fileId: "SharedEntityIds.FileId",
  roleId: "IamEntityIds.RoleId",
  permissionId: "IamEntityIds.PermissionId",
  invitationId: "IamEntityIds.InvitationId",
  apiKeyId: "IamEntityIds.ApiKeyId",
}

/**
 * Detect plain S.String usage for ID fields
 */
export const detect = (content: string): FixResult[] => {
  const results: FixResult[] = []
  const lines = String.split(content, "\n")

  // Check if file already imports EntityIds (to avoid false positives)
  const hasEntityIdImport = content.includes("EntityIds")

  lines.forEach((line, index) => {
    const regex = new RegExp(pattern.pattern, "g")
    let match: RegExpExecArray | null

    while ((match = regex.exec(line)) !== null) {
      const fieldName = match[1]
      if (!fieldName) continue

      const suggestion = fieldToEntityId[fieldName]
      if (!suggestion) continue

      // Skip if already using branded type on this line
      if (line.includes("EntityIds") || line.includes(".$type<")) continue

      results.push({
        applied: false,
        original: `${fieldName}: S.String`,
        fixed: `${fieldName}: ${suggestion}`,
        message: `Consider using branded EntityId: ${suggestion}. Plain S.String bypasses type-safe entity references.`,
        pattern_id: pattern.id,
        line_number: index + 1,
      })
    }
  })

  return results
}

/**
 * No auto-fix for EntityId suggestions - always requires human judgment
 */
export const fix = (content: string): { content: string; results: FixResult[] } => {
  return {
    content, // No changes
    results: detect(content),
  }
}
