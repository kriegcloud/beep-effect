# Phase 3: User Features RPC

> Implement templates, notes, shortcuts, settings, and logging RPC contracts and handlers.

---

## Prerequisites

- P0 (Foundation) completed
- P2 (Core Email RPC) completed
- Domain models for user features exist

---

## Overview

This phase implements user customization features:

| Router | Procedures | Priority |
|--------|------------|----------|
| `templates` | 3 | P3-1 |
| `notes` | 4 | P3-2 |
| `shortcuts` | 2 | P3-3 |
| `settings` | 2 | P3-4 |
| `logging` | ~2 | P3-5 |
| `categories` | ~4 | P3-6 |

These features are simpler than P2 as they primarily interact with the database rather than external email providers.

---

## Tasks

### Task 3.1: Create Templates RPC Contracts

**Directory**: `packages/comms/domain/src/rpc/v1/templates/`

#### list-templates.ts

```typescript
import { $CommsDomainId } from "@beep/identity/packages";
import { CommsEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $CommsDomainId.create("rpc/templates/list");

export class TemplateItem extends S.Class<TemplateItem>($I`TemplateItem`)({
  id: CommsEntityIds.EmailTemplateId,
  name: S.String,
  subject: S.NullOr(S.String),
  body: S.NullOr(S.String),
  to: S.optional(S.Array(S.String)),
  cc: S.optional(S.Array(S.String)),
  bcc: S.optional(S.Array(S.String)),
  createdAt: S.Date,
  updatedAt: S.Date,
}) {}

export class Payload extends S.Class<Payload>($I`Payload`)({}) {}

export class Success extends S.Class<Success>($I`Success`)({
  templates: S.Array(TemplateItem),
}) {}

export const Contract = Rpc.make("listTemplates", {
  payload: Payload,
  success: Success,
});
```

#### create-template.ts

```typescript
import { $CommsDomainId } from "@beep/identity/packages";
import { CommsEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import { TemplateItem } from "./list-templates";

const $I = $CommsDomainId.create("rpc/templates/create");

export class Payload extends S.Class<Payload>($I`Payload`)({
  name: S.NonEmptyTrimmedString,
  subject: S.optional(S.String),
  body: S.optional(S.String),
  to: S.optional(S.Array(S.String)),
  cc: S.optional(S.Array(S.String)),
  bcc: S.optional(S.Array(S.String)),
}) {}

export class Success extends S.Class<Success>($I`Success`)({
  template: TemplateItem,
}) {}

export const Contract = Rpc.make("createTemplate", {
  payload: Payload,
  success: Success,
});
```

#### delete-template.ts

```typescript
import { $CommsDomainId } from "@beep/identity/packages";
import { CommsEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $CommsDomainId.create("rpc/templates/delete");

export class Payload extends S.Class<Payload>($I`Payload`)({
  id: CommsEntityIds.EmailTemplateId,
}) {}

export class Success extends S.Class<Success>($I`Success`)({
  success: S.Boolean,
}) {}

export const Contract = Rpc.make("deleteTemplate", {
  payload: Payload,
  success: Success,
});
```

#### _rpcs.ts (RPC Group)

```typescript
import * as RpcGroup from "@effect/rpc/RpcGroup";
import * as ListTemplates from "./list-templates";
import * as CreateTemplate from "./create-template";
import * as DeleteTemplate from "./delete-template";

export class Rpcs extends RpcGroup.make(
  ListTemplates.Contract,
  CreateTemplate.Contract,
  DeleteTemplate.Contract
).prefix("templates_") {}

export { ListTemplates, CreateTemplate, DeleteTemplate };
```

---

### Task 3.2: Create Notes RPC Contracts

**Directory**: `packages/comms/domain/src/rpc/v1/notes/`

#### list-notes.ts

```typescript
import { $CommsDomainId } from "@beep/identity/packages";
import { CommsEntityIds } from "@beep/shared-domain";
import { NoteColor } from "@beep/comms-domain/entities/note";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $CommsDomainId.create("rpc/notes/list");

export class NoteItem extends S.Class<NoteItem>($I`NoteItem`)({
  id: CommsEntityIds.NoteId,
  threadId: S.String,
  content: S.String,
  color: NoteColor,
  isPinned: S.Boolean,
  order: S.Int,
  createdAt: S.Date,
  updatedAt: S.Date,
}) {}

export class Payload extends S.Class<Payload>($I`Payload`)({
  threadId: S.NonEmptyTrimmedString,
}) {}

export class Success extends S.Class<Success>($I`Success`)({
  notes: S.Array(NoteItem),
}) {}

export const Contract = Rpc.make("listNotes", {
  payload: Payload,
  success: Success,
});
```

#### create-note.ts

```typescript
import { $CommsDomainId } from "@beep/identity/packages";
import { CommsEntityIds } from "@beep/shared-domain";
import { NoteColor } from "@beep/comms-domain/entities/note";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import { NoteItem } from "./list-notes";

const $I = $CommsDomainId.create("rpc/notes/create");

export class Payload extends S.Class<Payload>($I`Payload`)({
  threadId: S.NonEmptyTrimmedString,
  content: S.String,
  color: S.optional(NoteColor),
  isPinned: S.optional(S.Boolean),
}) {}

export class Success extends S.Class<Success>($I`Success`)({
  note: NoteItem,
}) {}

export const Contract = Rpc.make("createNote", {
  payload: Payload,
  success: Success,
});
```

#### update-note.ts

```typescript
import { $CommsDomainId } from "@beep/identity/packages";
import { CommsEntityIds } from "@beep/shared-domain";
import { NoteColor } from "@beep/comms-domain/entities/note";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import { NoteItem } from "./list-notes";

const $I = $CommsDomainId.create("rpc/notes/update");

export class Payload extends S.Class<Payload>($I`Payload`)({
  id: CommsEntityIds.NoteId,
  content: S.optional(S.String),
  color: S.optional(NoteColor),
  isPinned: S.optional(S.Boolean),
  order: S.optional(S.Int),
}) {}

export class Success extends S.Class<Success>($I`Success`)({
  note: NoteItem,
}) {}

export const Contract = Rpc.make("updateNote", {
  payload: Payload,
  success: Success,
});
```

#### delete-note.ts

```typescript
import { $CommsDomainId } from "@beep/identity/packages";
import { CommsEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $CommsDomainId.create("rpc/notes/delete");

export class Payload extends S.Class<Payload>($I`Payload`)({
  id: CommsEntityIds.NoteId,
}) {}

export class Success extends S.Class<Success>($I`Success`)({
  success: S.Boolean,
}) {}

export const Contract = Rpc.make("deleteNote", {
  payload: Payload,
  success: Success,
});
```

---

### Task 3.3: Create Shortcuts RPC Contracts

**Directory**: `packages/comms/domain/src/rpc/v1/shortcuts/`

#### get-shortcuts.ts

```typescript
import { $CommsDomainId } from "@beep/identity/packages";
import { ShortcutsData, ShortcutBinding } from "@beep/comms-domain/entities/user-hotkeys";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $CommsDomainId.create("rpc/shortcuts/get");

export class Payload extends S.Class<Payload>($I`Payload`)({}) {}

export class Success extends S.Class<Success>($I`Success`)({
  shortcuts: ShortcutsData,
}) {}

export const Contract = Rpc.make("getShortcuts", {
  payload: Payload,
  success: Success,
});
```

#### save-shortcuts.ts

```typescript
import { $CommsDomainId } from "@beep/identity/packages";
import { ShortcutsData } from "@beep/comms-domain/entities/user-hotkeys";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $CommsDomainId.create("rpc/shortcuts/save");

export class Payload extends S.Class<Payload>($I`Payload`)({
  shortcuts: ShortcutsData,
}) {}

export class Success extends S.Class<Success>($I`Success`)({
  success: S.Boolean,
}) {}

export const Contract = Rpc.make("saveShortcuts", {
  payload: Payload,
  success: Success,
});
```

---

### Task 3.4: Create Settings RPC Contracts

**Directory**: `packages/comms/domain/src/rpc/v1/settings/`

#### get-settings.ts

```typescript
import { $CommsDomainId } from "@beep/identity/packages";
import { SettingsData } from "@beep/comms-domain/entities/user-settings";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $CommsDomainId.create("rpc/settings/get");

export class Payload extends S.Class<Payload>($I`Payload`)({}) {}

export class Success extends S.Class<Success>($I`Success`)({
  settings: SettingsData,
}) {}

export const Contract = Rpc.make("getSettings", {
  payload: Payload,
  success: Success,
});
```

#### save-settings.ts

```typescript
import { $CommsDomainId } from "@beep/identity/packages";
import { SettingsData } from "@beep/comms-domain/entities/user-settings";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $CommsDomainId.create("rpc/settings/save");

export class Payload extends S.Class<Payload>($I`Payload`)({
  settings: SettingsData,
}) {}

export class Success extends S.Class<Success>($I`Success`)({
  success: S.Boolean,
}) {}

export const Contract = Rpc.make("saveSettings", {
  payload: Payload,
  success: Success,
});
```

---

### Task 3.5: Create Repositories

**File**: `packages/comms/server/src/repos/EmailTemplateRepo.ts`

```typescript
import * as Effect from "effect/Effect";
import * as Context from "effect/Context";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";
import { Entities } from "@beep/comms-domain";
import { CommsEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { CommsDb } from "../db/CommsDb";

export interface EmailTemplateRepo {
  readonly findByUserId: (
    userId: SharedEntityIds.UserId.Type
  ) => Effect.Effect<ReadonlyArray<Entities.EmailTemplate.Model>>;

  readonly findById: (
    id: CommsEntityIds.EmailTemplateId.Type
  ) => Effect.Effect<Option.Option<Entities.EmailTemplate.Model>>;

  readonly create: (
    data: typeof Entities.EmailTemplate.Model.insert.Type
  ) => Effect.Effect<Entities.EmailTemplate.Model>;

  readonly delete: (
    id: CommsEntityIds.EmailTemplateId.Type
  ) => Effect.Effect<void>;
}

export const EmailTemplateRepo = Context.GenericTag<EmailTemplateRepo>(
  "@beep/comms/EmailTemplateRepo"
);

export const EmailTemplateRepoLive = Layer.effect(
  EmailTemplateRepo,
  Effect.gen(function* () {
    const db = yield* CommsDb;

    return {
      findByUserId: (userId) => Effect.gen(function* () {
        return yield* db.query(/* SQL */);
      }),

      findById: (id) => Effect.gen(function* () {
        const result = yield* db.query(/* SQL */);
        return Option.fromNullable(result);
      }),

      create: (data) => Effect.gen(function* () {
        const id = CommsEntityIds.EmailTemplateId.create();
        return yield* db.insert({ ...data, id });
      }),

      delete: (id) => Effect.gen(function* () {
        yield* db.delete(/* SQL */);
      }),
    };
  })
);
```

Similar repositories for:
- `NoteRepo.ts`
- `UserSettingsRepo.ts`
- `UserHotkeysRepo.ts`

---

### Task 3.6: Implement Handlers

**File**: `packages/comms/server/src/rpc/v1/templates/list-templates.handler.ts`

```typescript
import * as Effect from "effect/Effect";
import { Policy } from "@beep/shared-domain";
import { EmailTemplateRepo } from "../../../repos/EmailTemplateRepo";
import { ListTemplates } from "@beep/comms-domain/rpc/v1/templates";

type HandlerEffect = (
  payload: ListTemplates.Payload
) => Effect.Effect<
  ListTemplates.Success,
  never,
  Policy.AuthContext | EmailTemplateRepo
>;

export const Handler: HandlerEffect = Effect.fn("templates_listTemplates")(
  function* (_payload) {
    const { session } = yield* Policy.AuthContext;
    const repo = yield* EmailTemplateRepo;

    const templates = yield* repo.findByUserId(session.userId);

    return new ListTemplates.Success({
      templates: templates.map((t) => new ListTemplates.TemplateItem({
        id: t.id,
        name: t.name,
        subject: t.subject ?? null,
        body: t.body ?? null,
        to: t.to,
        cc: t.cc,
        bcc: t.bcc,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      })),
    });
  },
  Effect.catchTags({
    ParseError: Effect.die,
  })
);
```

**File**: `packages/comms/server/src/rpc/v1/notes/create-note.handler.ts`

```typescript
import * as Effect from "effect/Effect";
import { Policy } from "@beep/shared-domain";
import { NoteRepo } from "../../../repos/NoteRepo";
import { CreateNote } from "@beep/comms-domain/rpc/v1/notes";

type HandlerEffect = (
  payload: CreateNote.Payload
) => Effect.Effect<
  CreateNote.Success,
  never,
  Policy.AuthContext | NoteRepo
>;

export const Handler: HandlerEffect = Effect.fn("notes_createNote")(
  function* (payload) {
    const { session } = yield* Policy.AuthContext;
    const repo = yield* NoteRepo;

    const note = yield* repo.create({
      userId: session.userId,
      threadId: payload.threadId,
      content: payload.content,
      color: payload.color ?? "default",
      isPinned: payload.isPinned ?? false,
      order: 0,
    });

    return new CreateNote.Success({
      note: new CreateNote.NoteItem({
        id: note.id,
        threadId: note.threadId,
        content: note.content,
        color: note.color,
        isPinned: note.isPinned,
        order: note.order,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      }),
    });
  },
  Effect.catchTags({
    ParseError: Effect.die,
  })
);
```

---

### Task 3.7: Add RPC Groups to CommsRpcsLive

**File**: `packages/comms/server/src/rpc/v1/CommsRpcsLive.ts` (extend)

```typescript
import { Templates } from "@beep/comms-domain/rpc/v1/templates";
import { Notes } from "@beep/comms-domain/rpc/v1/notes";
import { Shortcuts } from "@beep/comms-domain/rpc/v1/shortcuts";
import { Settings } from "@beep/comms-domain/rpc/v1/settings";

// Template handlers
export const TemplatesRpcsLive = Templates.Rpcs
  .middleware(Policy.AuthContextRpcMiddleware)
  .toLayer({
    listTemplates: ListTemplatesHandler.Handler,
    createTemplate: CreateTemplateHandler.Handler,
    deleteTemplate: DeleteTemplateHandler.Handler,
  });

// Notes handlers
export const NotesRpcsLive = Notes.Rpcs
  .middleware(Policy.AuthContextRpcMiddleware)
  .toLayer({
    listNotes: ListNotesHandler.Handler,
    createNote: CreateNoteHandler.Handler,
    updateNote: UpdateNoteHandler.Handler,
    deleteNote: DeleteNoteHandler.Handler,
  });

// Shortcuts handlers
export const ShortcutsRpcsLive = Shortcuts.Rpcs
  .middleware(Policy.AuthContextRpcMiddleware)
  .toLayer({
    getShortcuts: GetShortcutsHandler.Handler,
    saveShortcuts: SaveShortcutsHandler.Handler,
  });

// Settings handlers
export const SettingsRpcsLive = Settings.Rpcs
  .middleware(Policy.AuthContextRpcMiddleware)
  .toLayer({
    getSettings: GetSettingsHandler.Handler,
    saveSettings: SaveSettingsHandler.Handler,
  });

// Add to combined layer
export const CommsRpcsLive = Layer.mergeAll(
  // From P2
  ConnectionsRpcsLive,
  LabelsRpcsLive,
  DraftsRpcsLive,
  MailRpcsLive,
  // From P3
  TemplatesRpcsLive,
  NotesRpcsLive,
  ShortcutsRpcsLive,
  SettingsRpcsLive,
);
```

---

## Verification

```bash
# Check domain contracts
bun run check --filter @beep/comms-domain

# Check server handlers
bun run check --filter @beep/comms-server

# Run tests
bun run test --filter @beep/comms-server

# Lint
bun run lint --filter @beep/comms-*
```

---

## Deliverables

| Deliverable | Location |
|-------------|----------|
| Templates RPC contracts | `packages/comms/domain/src/rpc/v1/templates/` |
| Notes RPC contracts | `packages/comms/domain/src/rpc/v1/notes/` |
| Shortcuts RPC contracts | `packages/comms/domain/src/rpc/v1/shortcuts/` |
| Settings RPC contracts | `packages/comms/domain/src/rpc/v1/settings/` |
| EmailTemplateRepo | `packages/comms/server/src/repos/EmailTemplateRepo.ts` |
| NoteRepo | `packages/comms/server/src/repos/NoteRepo.ts` |
| UserSettingsRepo | `packages/comms/server/src/repos/UserSettingsRepo.ts` |
| UserHotkeysRepo | `packages/comms/server/src/repos/UserHotkeysRepo.ts` |
| Handlers | `packages/comms/server/src/rpc/v1/{templates,notes,shortcuts,settings}/` |

---

## Dependencies

- P0 (Foundation) - Domain models
- P2 (Core Email RPC) - Middleware patterns

## Blocks

- P5 (UI Components) - needs RPC contracts

---

## Test Strategy

These handlers are database-focused, so tests should:
1. Mock the repository layer
2. Verify authorization checks
3. Test CRUD operations

Example:

```typescript
import { effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { Handler } from "./create-note.handler";

const MockNoteRepo = Layer.succeed(NoteRepo, {
  create: (data) => Effect.succeed({
    id: "note-1",
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
});

effect("createNote creates a note", () =>
  Effect.gen(function* () {
    const result = yield* Handler({
      threadId: "thread-123",
      content: "Test note",
    });

    strictEqual(result.note.content, "Test note");
    strictEqual(result.note.threadId, "thread-123");
  }).pipe(
    Effect.provide(MockNoteRepo),
    Effect.provide(MockAuthContext),
  )
);
```

---

## Agent Recommendations

| Agent | Task |
|-------|------|
| `test-writer` | Create repository and handler tests |
| `doc-writer` | Document RPC contracts |
