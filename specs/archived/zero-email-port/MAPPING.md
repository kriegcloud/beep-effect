# Zero tRPC to Effect RPC Mapping

> Comprehensive mapping of Zero email client tRPC procedures to beep-effect @effect/rpc contracts.

---

## Router Overview

| Zero Router | tRPC Procedures | Effect RPC Group | Priority |
|-------------|-----------------|------------------|----------|
| `ai` | 4 | `AiRpcs` | P4 |
| `mail` | 26 | `MailRpcs` | P2 |
| `drafts` | 4 | `DraftsRpcs` | P2 |
| `labels` | 5 | `LabelsRpcs` | P2 |
| `connections` | 4 | `ConnectionsRpcs` | P2 |
| `settings` | 2 | `SettingsRpcs` | P3 |
| `user` | ~3 | `UserRpcs` | P3 |
| `brain` | 7 | `BrainRpcs` | P4 |
| `categories` | ~4 | `CategoriesRpcs` | P3 |
| `notes` | 4 | `NotesRpcs` | P3 |
| `shortcut` | 2 | `ShortcutsRpcs` | P3 |
| `templates` | 3 | `TemplatesRpcs` | P3 |
| `meet` | ~2 | Out of scope | - |
| `bimi` | ~2 | Out of scope | - |
| `cookiePreferences` | ~2 | Out of scope | - |
| `logging` | ~2 | `LoggingRpcs` | P3 |

**Total**: ~70 procedures across 16 routers (12 in scope)

---

## Schema Translation Reference

### Zod to Effect Schema

| Zod | Effect Schema | Notes |
|-----|---------------|-------|
| `z.string()` | `S.String` | |
| `z.string().min(1)` | `S.NonEmptyString` | |
| `z.string().uuid()` | `S.UUID` | |
| `z.string().email()` | `BS.Email` | Use `@beep/schema` helper |
| `z.number()` | `S.Number` | |
| `z.number().int()` | `S.Int` | |
| `z.number().int().nonnegative()` | `S.NonNegativeInt` | |
| `z.boolean()` | `S.Boolean` | |
| `z.boolean().default(false)` | `BS.BoolWithDefault(false)` | |
| `z.array(z.string())` | `S.Array(S.String)` | |
| `z.object({ ... })` | `S.Struct({ ... })` | |
| `z.optional(...)` | `S.optional(...)` | |
| `z.nullable(...)` | `S.NullOr(...)` | |
| `z.record(z.string())` | `S.Record({ key: S.String, value: S.String })` | |
| `z.enum([...])` | `S.Literal(...) | Use `BS.StringLiteralKit` for enums |
| `z.nativeEnum(E)` | `S.Literal(...values)` | Enumerate values |
| `z.date()` | `S.Date` | For JS Date objects |
| `z.string().datetime()` | `BS.DateTimeUtcFromAllAcceptable` | For ISO strings |

### tRPC Context to Effect Context

| tRPC | Effect | Notes |
|------|--------|-------|
| `ctx.sessionUser` | `yield* Policy.AuthContext` | Get from auth middleware |
| `ctx.activeConnection` | `yield* ActiveConnection` | Custom context tag |
| `ctx.c.executionCtx` | Not needed | Effect handles concurrency |

---

## Detailed Router Mappings

### AI Router (`ai`)

| tRPC Procedure | Effect Contract | Input Schema | Output Schema |
|----------------|-----------------|--------------|---------------|
| `ai.compose` | `Rpc.make("ai_compose")` | `ComposePayload` | `ComposeSuccess` (streaming) |
| `ai.generateEmailSubject` | `Rpc.make("ai_generateSubject")` | `GenerateSubjectPayload` | `GenerateSubjectSuccess` |
| `ai.generateSearchQuery` | `Rpc.make("ai_generateSearchQuery")` | `GenerateSearchQueryPayload` | `GenerateSearchQuerySuccess` |
| `ai.webSearch` | `Rpc.make("ai_webSearch")` | `WebSearchPayload` | `WebSearchSuccess` |

**File Location**: `packages/comms/domain/src/rpc/v1/ai/`

---

### Mail Router (`mail`)

| tRPC Procedure | Effect Contract | Type | Notes |
|----------------|-----------------|------|-------|
| `mail.listThreads` | `Rpc.make("mail_listThreads")` | query | Pagination with cursor |
| `mail.get` | `Rpc.make("mail_getThread")` | query | Single thread with messages |
| `mail.suggestRecipients` | `Rpc.make("mail_suggestRecipients")` | query | Autocomplete |
| `mail.forceSync` | `Rpc.make("mail_forceSync")` | mutation | Trigger sync |
| `mail.send` | `Rpc.make("mail_send")` | mutation | Send email |
| `mail.unsend` | `Rpc.make("mail_unsend")` | mutation | Cancel scheduled |
| `mail.markAsRead` | `Rpc.make("mail_markAsRead")` | mutation | Batch operation |
| `mail.markAsUnread` | `Rpc.make("mail_markAsUnread")` | mutation | Batch operation |
| `mail.markAsImportant` | `Rpc.make("mail_markAsImportant")` | mutation | |
| `mail.modifyLabels` | `Rpc.make("mail_modifyLabels")` | mutation | Add/remove labels |
| `mail.toggleStar` | `Rpc.make("mail_toggleStar")` | mutation | |
| `mail.toggleImportant` | `Rpc.make("mail_toggleImportant")` | mutation | |
| `mail.bulkStar` | `Rpc.make("mail_bulkStar")` | mutation | |
| `mail.bulkUnstar` | `Rpc.make("mail_bulkUnstar")` | mutation | |
| `mail.bulkMarkImportant` | `Rpc.make("mail_bulkMarkImportant")` | mutation | |
| `mail.bulkUnmarkImportant` | `Rpc.make("mail_bulkUnmarkImportant")` | mutation | |
| `mail.bulkDelete` | `Rpc.make("mail_bulkDelete")` | mutation | Move to trash |
| `mail.bulkArchive` | `Rpc.make("mail_bulkArchive")` | mutation | Remove from inbox |
| `mail.bulkMute` | `Rpc.make("mail_bulkMute")` | mutation | |
| `mail.delete` | `Rpc.make("mail_delete")` | mutation | Permanent delete |
| `mail.deleteAllSpam` | `Rpc.make("mail_deleteAllSpam")` | mutation | |
| `mail.snoozeThreads` | `Rpc.make("mail_snoozeThreads")` | mutation | |
| `mail.unsnoozeThreads` | `Rpc.make("mail_unsnoozeThreads")` | mutation | |
| `mail.getEmailAliases` | `Rpc.make("mail_getEmailAliases")` | query | |
| `mail.getMessageAttachments` | `Rpc.make("mail_getAttachments")` | query | |
| `mail.processEmailContent` | `Rpc.make("mail_processContent")` | mutation | HTML processing |
| `mail.getRawEmail` | `Rpc.make("mail_getRawEmail")` | query | |
| `mail.verifyEmail` | `Rpc.make("mail_verifyEmail")` | query | DKIM/SPF verification |

**File Location**: `packages/comms/domain/src/rpc/v1/mail/`

---

### Drafts Router (`drafts`)

| tRPC Procedure | Effect Contract | Type | Notes |
|----------------|-----------------|------|-------|
| `drafts.create` | `Rpc.make("drafts_create")` | mutation | |
| `drafts.get` | `Rpc.make("drafts_get")` | query | |
| `drafts.list` | `Rpc.make("drafts_list")` | query | Paginated |
| `drafts.delete` | `Rpc.make("drafts_delete")` | mutation | |

**File Location**: `packages/comms/domain/src/rpc/v1/drafts/`

---

### Labels Router (`labels`)

| tRPC Procedure | Effect Contract | Type | Notes |
|----------------|-----------------|------|-------|
| `labels.list` | `Rpc.make("labels_list")` | query | User + system labels |
| `labels.get` | `Rpc.make("labels_get")` | query | Single label |
| `labels.create` | `Rpc.make("labels_create")` | mutation | With color support |
| `labels.update` | `Rpc.make("labels_update")` | mutation | |
| `labels.delete` | `Rpc.make("labels_delete")` | mutation | |

**File Location**: `packages/comms/domain/src/rpc/v1/labels/`

---

### Connections Router (`connections`)

| tRPC Procedure | Effect Contract | Type | Notes |
|----------------|-----------------|------|-------|
| `connections.list` | `Rpc.make("connections_list")` | query | All user connections |
| `connections.setDefault` | `Rpc.make("connections_setDefault")` | mutation | |
| `connections.delete` | `Rpc.make("connections_delete")` | mutation | Revoke OAuth |
| `connections.getDefault` | `Rpc.make("connections_getDefault")` | query | |

**File Location**: `packages/comms/domain/src/rpc/v1/connections/`

---

### Settings Router (`settings`)

| tRPC Procedure | Effect Contract | Type | Notes |
|----------------|-----------------|------|-------|
| `settings.get` | `Rpc.make("settings_get")` | query | User settings JSON |
| `settings.save` | `Rpc.make("settings_save")` | mutation | |

**File Location**: `packages/comms/domain/src/rpc/v1/settings/`

---

### Brain Router (`brain`)

| tRPC Procedure | Effect Contract | Type | Notes |
|----------------|-----------------|------|-------|
| `brain.enableBrain` | `Rpc.make("brain_enable")` | mutation | Start auto-labeling |
| `brain.disableBrain` | `Rpc.make("brain_disable")` | mutation | |
| `brain.generateSummary` | `Rpc.make("brain_generateSummary")` | query | Thread summary |
| `brain.getState` | `Rpc.make("brain_getState")` | query | Enabled status |
| `brain.getLabels` | `Rpc.make("brain_getLabels")` | query | AI label config |
| `brain.getPrompts` | `Rpc.make("brain_getPrompts")` | query | Custom prompts |
| `brain.updatePrompt` | `Rpc.make("brain_updatePrompt")` | mutation | |
| `brain.updateLabels` | `Rpc.make("brain_updateLabels")` | mutation | |

**File Location**: `packages/comms/domain/src/rpc/v1/brain/`

---

### Notes Router (`notes`)

| tRPC Procedure | Effect Contract | Type | Notes |
|----------------|-----------------|------|-------|
| `notes.list` | `Rpc.make("notes_list")` | query | By thread |
| `notes.create` | `Rpc.make("notes_create")` | mutation | |
| `notes.update` | `Rpc.make("notes_update")` | mutation | |
| `notes.delete` | `Rpc.make("notes_delete")` | mutation | |

**File Location**: `packages/comms/domain/src/rpc/v1/notes/`

---

### Templates Router (`templates`)

| tRPC Procedure | Effect Contract | Type | Notes |
|----------------|-----------------|------|-------|
| `templates.list` | `Rpc.make("templates_list")` | query | |
| `templates.create` | `Rpc.make("templates_create")` | mutation | |
| `templates.delete` | `Rpc.make("templates_delete")` | mutation | |

**File Location**: `packages/comms/domain/src/rpc/v1/templates/`

---

### Shortcuts Router (`shortcut`)

| tRPC Procedure | Effect Contract | Type | Notes |
|----------------|-----------------|------|-------|
| `shortcut.save` | `Rpc.make("shortcuts_save")` | mutation | JSONB shortcuts |
| `shortcut.get` | `Rpc.make("shortcuts_get")` | query | |

**File Location**: `packages/comms/domain/src/rpc/v1/shortcuts/`

---

## Database Table Mapping

### Zero Tables to beep-effect Tables

| Zero Table | beep-effect Table | Package | Notes |
|------------|-------------------|---------|-------|
| `mail0_user` | Use `@beep/iam-tables` User | Existing | Integrate with IAM |
| `mail0_session` | Use `@beep/iam-tables` Session | Existing | |
| `mail0_account` | Use `@beep/iam-tables` Account | Existing | |
| `mail0_connection` | `comms_connection` | `@beep/comms-tables` | NEW |
| `mail0_summary` | `comms_thread_summary` | `@beep/comms-tables` | NEW |
| `mail0_note` | `comms_note` | `@beep/comms-tables` | NEW |
| `mail0_user_settings` | `comms_user_settings` | `@beep/comms-tables` | NEW |
| `mail0_user_hotkeys` | `comms_user_hotkeys` | `@beep/comms-tables` | NEW |
| `mail0_email_template` | `comms_email_template` | `@beep/comms-tables` | Domain EXISTS |
| `mail0_writing_style_matrix` | `comms_writing_style` | `@beep/comms-tables` | Future |

---

## EntityId Mapping

### New EntityIds Required

| EntityId | Prefix | Package |
|----------|--------|---------|
| `ConnectionId` | `comms_connection__` | `CommsEntityIds` |
| `ThreadSummaryId` | `comms_thread_summary__` | `CommsEntityIds` |
| `NoteId` | `comms_note__` | `CommsEntityIds` |
| `UserSettingsId` | `comms_user_settings__` | `CommsEntityIds` |
| `UserHotkeysId` | `comms_user_hotkeys__` | `CommsEntityIds` |
| `EmailTemplateId` | `comms_email_template__` | `CommsEntityIds` (EXISTS) |

### Existing EntityIds to Reference

| EntityId | Package | Usage |
|----------|---------|-------|
| `UserId` | `SharedEntityIds` | User ownership |
| `OrganizationId` | `SharedEntityIds` | Multi-tenant |
| `SessionId` | `SharedEntityIds` | Auth sessions |

---

## Error Type Mapping

### Zero Errors to Effect Tagged Errors

| Zero Error | Effect Error | Notes |
|------------|--------------|-------|
| `TRPCError({ code: 'NOT_FOUND' })` | `class NotFoundError extends S.TaggedError` | |
| `TRPCError({ code: 'UNAUTHORIZED' })` | `class UnauthorizedError extends S.TaggedError` | |
| `TRPCError({ code: 'INTERNAL_SERVER_ERROR' })` | `class InternalError extends S.TaggedError` | |
| `TRPCError({ code: 'BAD_REQUEST' })` | `class ValidationError extends S.TaggedError` | |
| Gmail API errors | `class GmailApiError extends S.TaggedError` | Provider-specific |
| Outlook API errors | `class OutlookApiError extends S.TaggedError` | Provider-specific |

---

## Value Object Mapping

### Existing in `@beep/comms-domain`

These value objects already exist and should be reused:

| Value Object | Location | Notes |
|--------------|----------|-------|
| `Label` | `mail.value.ts` | Recursive structure |
| `LabelColor` | `mail.value.ts` | Hex colors |
| `Attachment` | `mail.value.ts` | File attachment |
| `AttachmentHeader` | `mail.value.ts` | |
| `Sender` | `mail.value.ts` | Name + email |
| `MailUser` | `mail.value.ts` | With avatar |
| `ParsedMessage` | `mail.value.ts` | Full message |
| `OutgoingMessage` | `mail.value.ts` | For sending |
| `SendMailInput` | `mail.value.ts` | API input |
| `EmailProvider` | `mail.value.ts` | google/microsoft literal |
| `Tools` | `mail.value.ts` | AI tool names |
| `EmailPrompts` | `mail.value.ts` | Prompt types |

### New Value Objects Needed

| Value Object | Purpose | Notes |
|--------------|---------|-------|
| `ThreadSummary` | List view thread data | Lighter than ParsedMessage |
| `ConnectionInfo` | OAuth connection details | Excluding tokens |
| `UserSettings` | Settings JSON structure | |
| `ShortcutConfig` | Hotkey mappings | |
| `NoteContent` | Thread annotation | |
| `BrainConfig` | Auto-labeling config | |

---

## Middleware Mapping

### tRPC Middleware to Effect Middleware

| tRPC | Effect | Notes |
|------|--------|-------|
| `privateProcedure` | `Policy.AuthContextRpcMiddleware` | Auth required |
| `publicProcedure` | No middleware | Open access |
| `activeDriverProcedure` | `ActiveConnectionRpcMiddleware` | Auth + connection |
| `activeConnectionProcedure` | `ActiveConnectionRpcMiddleware` | Same as above |
| Rate limiting | `@effect/rpc` middleware | Custom implementation |

---

## Implementation Priority Matrix

| Router | Complexity | Dependencies | Priority |
|--------|------------|--------------|----------|
| connections | Low | IAM integration | P2-1 |
| labels | Low | MailDriver | P2-2 |
| drafts | Medium | MailDriver | P2-3 |
| mail | High | All above | P2-4 |
| templates | Low | DB only | P3-1 |
| notes | Low | DB only | P3-2 |
| shortcuts | Low | DB only | P3-3 |
| settings | Low | DB only | P3-4 |
| brain | High | AI service | P4-1 |
| ai | High | AI service | P4-2 |

---

## Next Steps

1. **P0**: Create EntityIds in `@beep/shared-domain`
2. **P0**: Create domain models in `@beep/comms-domain`
3. **P0**: Create tables in `@beep/comms-tables`
4. **P1**: Implement email driver services
5. **P2+**: Implement RPC contracts and handlers
