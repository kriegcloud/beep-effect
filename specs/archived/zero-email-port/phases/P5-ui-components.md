# Phase 5: UI Components

> Build React components with View Model pattern for email client UI using Effect-Atom.

---

## Prerequisites

- P0-P4 completed (all RPC contracts and handlers)
- Understanding of VM pattern (`.claude/skills/react-vm/SKILL.md`)
- Understanding of Effect-Atom (`@effect-atom/atom`)

---

## Overview

This phase implements the email client UI using the VM pattern:

| Component | Purpose | VM State |
|-----------|---------|----------|
| InboxView | Thread list with filters | threads, loading, selectedFolder |
| ThreadView | Message list + conversation | messages, loading, summary |
| ComposeModal | Email composition | draft, recipients, attachments, aiSuggestions |
| ConnectionManager | OAuth account management | connections, activeConnection |
| SettingsPanel | User preferences | settings, hotkeys |
| BrainSettings | AI auto-label config | enabled, labels, prompts |

---

## Architecture

```
packages/comms/ui/
  src/
    components/
      InboxView/
        InboxView.tsx
        InboxView.vm.ts
        index.ts
      ThreadView/
        ThreadView.tsx
        ThreadView.vm.ts
        index.ts
      ComposeModal/
        ComposeModal.tsx
        ComposeModal.vm.ts
        index.ts
      ConnectionManager/
        ConnectionManager.tsx
        ConnectionManager.vm.ts
        index.ts
      SettingsPanel/
        SettingsPanel.tsx
        SettingsPanel.vm.ts
        index.ts
      BrainSettings/
        BrainSettings.tsx
        BrainSettings.vm.ts
        index.ts
    lib/
      mail-client.ts       # RPC client instance
      VMRuntime.ts         # VM runtime setup
    index.ts
  package.json
  CLAUDE.md
```

---

## Tasks

### Task 5.1: Create @beep/comms-ui Package Structure

**File**: `packages/comms/ui/package.json`

```json
{
  "name": "@beep/comms-ui",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./inbox": "./src/components/InboxView/index.ts",
    "./thread": "./src/components/ThreadView/index.ts",
    "./compose": "./src/components/ComposeModal/index.ts",
    "./connections": "./src/components/ConnectionManager/index.ts",
    "./settings": "./src/components/SettingsPanel/index.ts",
    "./brain": "./src/components/BrainSettings/index.ts"
  },
  "dependencies": {
    "@beep/comms-client": "workspace:*",
    "@beep/comms-domain": "workspace:*",
    "@beep/ui": "workspace:*",
    "@effect-atom/atom": "catalog:",
    "@effect-atom/atom-react": "catalog:",
    "effect": "catalog:",
    "react": "catalog:"
  }
}
```

---

### Task 5.2: Create Mail RPC Client

**File**: `packages/comms/ui/src/lib/mail-client.ts`

```typescript
import { CommsRpcs } from "@beep/comms-client";
import * as RpcClient from "@effect/rpc/RpcClient";
import * as Layer from "effect/Layer";

// Create RPC client from contracts
export const MailClientLive = RpcClient.makeClient(CommsRpcs.Rpcs).pipe(
  // Configure with HTTP transport
  Layer.provide(CommsRpcs.TransportLive)
);
```

---

### Task 5.3: Implement InboxView Component

**File**: `packages/comms/ui/src/components/InboxView/InboxView.vm.ts`

```typescript
import * as Atom from "@effect-atom/atom/Atom";
import { AtomRegistry } from "@effect-atom/atom/Registry";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Data from "effect/Data";
import { pipe } from "effect/Function";
import { Mail } from "@beep/comms-client";

// Thread list item (UI-ready)
export interface ThreadItem {
  readonly key: string;
  readonly from: string;           // "John Doe"
  readonly subject: string;
  readonly preview: string;        // First 100 chars
  readonly date: string;           // "Jan 15"
  readonly isUnread: boolean;
  readonly hasAttachments: boolean;
  readonly isStarred: boolean;
}

// State machine
export type InboxState = Data.TaggedEnum<{
  Loading: {}
  Loaded: { threads: readonly ThreadItem[]; hasMore: boolean }
  Error: { message: string }
}>
export const InboxState = Data.taggedEnum<InboxState>();

// Folder options
export type Folder = "inbox" | "sent" | "drafts" | "starred" | "archive" | "spam" | "trash";

export interface InboxViewVM {
  readonly state$: Atom.Atom<InboxState>
  readonly selectedFolder$: Atom.Atom<Folder>
  readonly searchQuery$: Atom.Atom<string>
  readonly isRefreshing$: Atom.Atom<boolean>

  // Actions
  readonly refresh: () => void
  readonly loadMore: () => void
  readonly selectFolder: (folder: Folder) => void
  readonly search: (query: string) => void
  readonly markAsRead: (threadIds: readonly string[]) => void
  readonly archive: (threadIds: readonly string[]) => void
  readonly deleteThreads: (threadIds: readonly string[]) => void
  readonly star: (threadId: string) => void
}

export const InboxViewVM = Context.GenericTag<InboxViewVM>("InboxViewVM");

const layer = Layer.effect(
  InboxViewVM,
  Effect.gen(function* () {
    const registry = yield* AtomRegistry;
    const mailClient = yield* Mail.Client;

    // State atoms
    const state$ = Atom.make<InboxState>(InboxState.Loading());
    const selectedFolder$ = Atom.make<Folder>("inbox");
    const searchQuery$ = Atom.make("");
    const isRefreshing$ = Atom.make(false);
    const cursor$ = Atom.make<string | null>(null);

    // Transform API response to UI-ready items
    const toThreadItem = (thread: Mail.Thread): ThreadItem => ({
      key: thread.id,
      from: thread.sender?.name ?? thread.sender?.email ?? "Unknown",
      subject: thread.subject ?? "(No subject)",
      preview: (thread.snippet ?? "").slice(0, 100),
      date: formatRelativeDate(thread.receivedAt),
      isUnread: !thread.isRead,
      hasAttachments: (thread.attachments?.length ?? 0) > 0,
      isStarred: thread.isStarred ?? false,
    });

    const fetchThreads = (folder: Folder, query?: string, cursorToken?: string | null) =>
      Effect.gen(function* () {
        registry.set(isRefreshing$, true);

        const response = yield* mailClient.listThreads({
          folder,
          query,
          cursor: cursorToken ?? undefined,
          maxResults: 50,
        });

        const items = response.threads.map(toThreadItem);
        registry.set(cursor$, response.nextPageToken);
        registry.set(state$, InboxState.Loaded({
          threads: items,
          hasMore: response.nextPageToken !== null,
        }));
        registry.set(isRefreshing$, false);
      }).pipe(
        Effect.catchAll((e) => Effect.sync(() => {
          registry.set(state$, InboxState.Error({ message: String(e) }));
          registry.set(isRefreshing$, false);
        }))
      );

    const refresh = () => {
      const folder = registry.get(selectedFolder$);
      const query = registry.get(searchQuery$);
      Effect.runFork(fetchThreads(folder, query || undefined, null));
    };

    const loadMore = () => {
      const currentState = registry.get(state$);
      if (currentState._tag !== "Loaded" || !currentState.hasMore) return;

      const folder = registry.get(selectedFolder$);
      const query = registry.get(searchQuery$);
      const currentCursor = registry.get(cursor$);

      Effect.runFork(
        Effect.gen(function* () {
          const response = yield* mailClient.listThreads({
            folder,
            query: query || undefined,
            cursor: currentCursor ?? undefined,
            maxResults: 50,
          });

          const newItems = response.threads.map(toThreadItem);
          registry.set(cursor$, response.nextPageToken);
          registry.set(state$, InboxState.Loaded({
            threads: [...currentState.threads, ...newItems],
            hasMore: response.nextPageToken !== null,
          }));
        }).pipe(
          Effect.catchAll(() => Effect.succeed(undefined))
        )
      );
    };

    const selectFolder = (folder: Folder) => {
      registry.set(selectedFolder$, folder);
      registry.set(state$, InboxState.Loading());
      registry.set(cursor$, null);
      Effect.runFork(fetchThreads(folder, undefined, null));
    };

    const search = (query: string) => {
      registry.set(searchQuery$, query);
      registry.set(state$, InboxState.Loading());
      registry.set(cursor$, null);
      const folder = registry.get(selectedFolder$);
      Effect.runFork(fetchThreads(folder, query || undefined, null));
    };

    const markAsRead = (threadIds: readonly string[]) => {
      Effect.runFork(
        Effect.forEach(threadIds, (id) => mailClient.markAsRead({ threadId: id }))
      );
    };

    const archive = (threadIds: readonly string[]) => {
      Effect.runFork(
        Effect.forEach(threadIds, (id) => mailClient.archive({ threadId: id })).pipe(
          Effect.tap(() => Effect.sync(refresh))
        )
      );
    };

    const deleteThreads = (threadIds: readonly string[]) => {
      Effect.runFork(
        Effect.forEach(threadIds, (id) => mailClient.delete({ threadId: id })).pipe(
          Effect.tap(() => Effect.sync(refresh))
        )
      );
    };

    const star = (threadId: string) => {
      Effect.runFork(mailClient.toggleStar({ threadId }));
    };

    // Initial load
    Effect.runFork(fetchThreads("inbox", undefined, null));

    return {
      state$,
      selectedFolder$,
      searchQuery$,
      isRefreshing$,
      refresh,
      loadMore,
      selectFolder,
      search,
      markAsRead,
      archive,
      deleteThreads,
      star,
    };
  })
);

export default { tag: InboxViewVM, layer };

// Helper
const formatRelativeDate = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (days < 7) {
    return date.toLocaleDateString([], { weekday: "short" });
  } else {
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  }
};
```

**File**: `packages/comms/ui/src/components/InboxView/InboxView.tsx`

```tsx
"use client";

import { useVM } from "../../lib/VMRuntime";
import { useAtomValue } from "@effect-atom/atom-react";
import * as Result from "@effect-atom/atom/Result";
import InboxViewVM, { InboxState, type InboxViewVM as InboxViewVMType, type Folder, type ThreadItem } from "./InboxView.vm";
import { Button, Input, ScrollArea, Skeleton } from "@beep/ui";

// Child component - receives VM as prop
function FolderList({ vm }: { vm: InboxViewVMType }) {
  const selectedFolder = useAtomValue(vm.selectedFolder$);

  const folders: Array<{ id: Folder; label: string; icon: string }> = [
    { id: "inbox", label: "Inbox", icon: "inbox" },
    { id: "sent", label: "Sent", icon: "send" },
    { id: "drafts", label: "Drafts", icon: "file-text" },
    { id: "starred", label: "Starred", icon: "star" },
    { id: "archive", label: "Archive", icon: "archive" },
    { id: "spam", label: "Spam", icon: "alert-triangle" },
    { id: "trash", label: "Trash", icon: "trash" },
  ];

  return (
    <nav className="space-y-1">
      {folders.map((folder) => (
        <button
          key={folder.id}
          onClick={() => vm.selectFolder(folder.id)}
          className={`w-full text-left px-3 py-2 rounded ${
            selectedFolder === folder.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
          }`}
        >
          {folder.label}
        </button>
      ))}
    </nav>
  );
}

function SearchBar({ vm }: { vm: InboxViewVMType }) {
  const query = useAtomValue(vm.searchQuery$);

  return (
    <Input
      placeholder="Search emails..."
      value={query}
      onChange={(e) => vm.search(e.target.value)}
      className="w-full"
    />
  );
}

function ThreadListItem({ item, onSelect }: { item: ThreadItem; onSelect: () => void }) {
  return (
    <div
      onClick={onSelect}
      className={`p-3 border-b cursor-pointer hover:bg-muted ${
        item.isUnread ? "font-semibold bg-background" : "bg-muted/50"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="truncate">{item.from}</span>
        <span className="text-xs text-muted-foreground">{item.date}</span>
      </div>
      <div className="truncate">{item.subject}</div>
      <div className="text-sm text-muted-foreground truncate">{item.preview}</div>
    </div>
  );
}

function ThreadList({ vm, onSelectThread }: { vm: InboxViewVMType; onSelectThread: (id: string) => void }) {
  const state = useAtomValue(vm.state$);
  const isRefreshing = useAtomValue(vm.isRefreshing$);

  return InboxState.$match(state, {
    Loading: () => (
      <div className="space-y-2 p-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    ),
    Error: ({ message }) => (
      <div className="p-4 text-destructive">
        <p>Failed to load emails</p>
        <p className="text-sm">{message}</p>
        <Button onClick={vm.refresh} className="mt-2">Retry</Button>
      </div>
    ),
    Loaded: ({ threads, hasMore }) => (
      <ScrollArea className="h-full">
        {isRefreshing && <div className="p-2 text-center text-sm">Refreshing...</div>}
        {threads.map((thread) => (
          <ThreadListItem
            key={thread.key}
            item={thread}
            onSelect={() => onSelectThread(thread.key)}
          />
        ))}
        {hasMore && (
          <Button onClick={vm.loadMore} variant="ghost" className="w-full">
            Load more
          </Button>
        )}
      </ScrollArea>
    ),
  });
}

// Parent component - owns VM
export default function InboxView({ onSelectThread }: { onSelectThread: (id: string) => void }) {
  const vmResult = useVM(InboxViewVM.tag, InboxViewVM.layer);

  return Result.match(vmResult, {
    onInitial: () => <div className="p-4">Loading...</div>,
    onSuccess: ({ value: vm }) => (
      <div className="flex h-full">
        <aside className="w-48 border-r p-4">
          <FolderList vm={vm} />
        </aside>
        <main className="flex-1 flex flex-col">
          <header className="p-4 border-b">
            <SearchBar vm={vm} />
          </header>
          <ThreadList vm={vm} onSelectThread={onSelectThread} />
        </main>
      </div>
    ),
    onFailure: ({ cause }) => (
      <div className="p-4 text-destructive">Failed to initialize: {String(cause)}</div>
    ),
  });
}
```

---

### Task 5.4: Implement ComposeModal Component

**File**: `packages/comms/ui/src/components/ComposeModal/ComposeModal.vm.ts`

```typescript
import * as Atom from "@effect-atom/atom/Atom";
import { AtomRegistry } from "@effect-atom/atom/Registry";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Data from "effect/Data";
import * as O from "effect/Option";
import { pipe } from "effect/Function";
import { Ai, Drafts, Mail } from "@beep/comms-client";

// Compose state machine
export type ComposeState = Data.TaggedEnum<{
  Editing: {}
  Saving: {}
  Sending: {}
  Sent: { messageId: string }
  Error: { message: string }
}>
export const ComposeState = Data.taggedEnum<ComposeState>();

// AI suggestion state
export type AiState = Data.TaggedEnum<{
  Idle: {}
  Generating: {}
  Suggestion: { content: string }
}>
export const AiState = Data.taggedEnum<AiState>();

// Attachment info
export interface AttachmentItem {
  readonly key: string;
  readonly name: string;
  readonly size: string;  // "1.2 MB"
  readonly type: string;
}

export interface ComposeModalVM {
  // Form state
  readonly to$: Atom.Atom<string>
  readonly cc$: Atom.Atom<string>
  readonly bcc$: Atom.Atom<string>
  readonly subject$: Atom.Atom<string>
  readonly body$: Atom.Atom<string>
  readonly attachments$: Atom.Atom<readonly AttachmentItem[]>

  // UI state
  readonly state$: Atom.Atom<ComposeState>
  readonly aiState$: Atom.Atom<AiState>
  readonly showCcBcc$: Atom.Atom<boolean>

  // Derived
  readonly canSend$: Atom.Atom<boolean>  // UI-ready boolean

  // Actions
  readonly send: () => void
  readonly saveDraft: () => void
  readonly discard: () => void
  readonly addAttachment: (file: File) => void
  readonly removeAttachment: (key: string) => void
  readonly aiCompose: (prompt: string) => void
  readonly aiGenerateSubject: () => void
  readonly acceptAiSuggestion: () => void
  readonly rejectAiSuggestion: () => void
}

export const ComposeModalVM = Context.GenericTag<ComposeModalVM>("ComposeModalVM");

interface ComposeConfig {
  replyTo?: string;
  threadId?: string;
  prefillTo?: string;
  prefillSubject?: string;
}

export const makeLayer = (config?: ComposeConfig) => Layer.effect(
  ComposeModalVM,
  Effect.gen(function* () {
    const registry = yield* AtomRegistry;
    const mailClient = yield* Mail.Client;
    const aiClient = yield* Ai.Client;
    const draftsClient = yield* Drafts.Client;

    // Form atoms
    const to$ = Atom.make(config?.prefillTo ?? "");
    const cc$ = Atom.make("");
    const bcc$ = Atom.make("");
    const subject$ = Atom.make(config?.prefillSubject ?? "");
    const body$ = Atom.make("");
    const attachments$ = Atom.make<readonly AttachmentItem[]>([]);

    // UI state
    const state$ = Atom.make<ComposeState>(ComposeState.Editing());
    const aiState$ = Atom.make<AiState>(AiState.Idle());
    const showCcBcc$ = Atom.make(false);

    // Derived - UI-ready validation
    const canSend$ = pipe(
      Atom.tuple(to$, subject$, body$),
      Atom.map(([to, subject, body]) =>
        to.trim().length > 0 &&
        subject.trim().length > 0 &&
        body.trim().length > 0
      )
    );

    const send = () => {
      registry.set(state$, ComposeState.Sending());

      Effect.runFork(
        Effect.gen(function* () {
          const response = yield* mailClient.send({
            to: registry.get(to$).split(",").map(e => e.trim()),
            cc: registry.get(cc$) ? registry.get(cc$).split(",").map(e => e.trim()) : undefined,
            bcc: registry.get(bcc$) ? registry.get(bcc$).split(",").map(e => e.trim()) : undefined,
            subject: registry.get(subject$),
            body: registry.get(body$),
            threadId: config?.threadId,
            replyTo: config?.replyTo,
          });

          registry.set(state$, ComposeState.Sent({ messageId: response.messageId }));
        }).pipe(
          Effect.catchAll((e) => Effect.sync(() => {
            registry.set(state$, ComposeState.Error({ message: String(e) }));
          }))
        )
      );
    };

    const saveDraft = () => {
      registry.set(state$, ComposeState.Saving());

      Effect.runFork(
        Effect.gen(function* () {
          yield* draftsClient.create({
            to: registry.get(to$).split(",").map(e => e.trim()),
            subject: registry.get(subject$),
            body: registry.get(body$),
          });

          registry.set(state$, ComposeState.Editing());
        }).pipe(
          Effect.catchAll((e) => Effect.sync(() => {
            registry.set(state$, ComposeState.Error({ message: String(e) }));
          }))
        )
      );
    };

    const discard = () => {
      registry.set(to$, "");
      registry.set(cc$, "");
      registry.set(bcc$, "");
      registry.set(subject$, "");
      registry.set(body$, "");
      registry.set(attachments$, []);
      registry.set(state$, ComposeState.Editing());
    };

    const addAttachment = (file: File) => {
      const item: AttachmentItem = {
        key: crypto.randomUUID(),
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type,
      };
      const current = registry.get(attachments$);
      registry.set(attachments$, [...current, item]);
    };

    const removeAttachment = (key: string) => {
      const current = registry.get(attachments$);
      registry.set(attachments$, current.filter(a => a.key !== key));
    };

    const aiCompose = (prompt: string) => {
      registry.set(aiState$, AiState.Generating());

      Effect.runFork(
        Effect.gen(function* () {
          const response = yield* aiClient.compose({
            prompt,
            context: registry.get(body$) || undefined,
            threadId: config?.threadId,
          });

          registry.set(aiState$, AiState.Suggestion({ content: response.content ?? "" }));
        }).pipe(
          Effect.catchAll(() => Effect.sync(() => {
            registry.set(aiState$, AiState.Idle());
          }))
        )
      );
    };

    const aiGenerateSubject = () => {
      registry.set(aiState$, AiState.Generating());

      Effect.runFork(
        Effect.gen(function* () {
          const body = registry.get(body$);
          if (!body) return;

          const response = yield* aiClient.generateSubject({ body });
          registry.set(subject$, response.subject);
          registry.set(aiState$, AiState.Idle());
        }).pipe(
          Effect.catchAll(() => Effect.sync(() => {
            registry.set(aiState$, AiState.Idle());
          }))
        )
      );
    };

    const acceptAiSuggestion = () => {
      const aiState = registry.get(aiState$);
      if (aiState._tag === "Suggestion") {
        registry.set(body$, aiState.content);
      }
      registry.set(aiState$, AiState.Idle());
    };

    const rejectAiSuggestion = () => {
      registry.set(aiState$, AiState.Idle());
    };

    return {
      to$,
      cc$,
      bcc$,
      subject$,
      body$,
      attachments$,
      state$,
      aiState$,
      showCcBcc$,
      canSend$,
      send,
      saveDraft,
      discard,
      addAttachment,
      removeAttachment,
      aiCompose,
      aiGenerateSubject,
      acceptAiSuggestion,
      rejectAiSuggestion,
    };
  })
);

export default { tag: ComposeModalVM, layer: makeLayer() };

// Helper
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
```

---

### Task 5.5: Implement ConnectionManager Component

**File**: `packages/comms/ui/src/components/ConnectionManager/ConnectionManager.vm.ts`

```typescript
import * as Atom from "@effect-atom/atom/Atom";
import { AtomRegistry } from "@effect-atom/atom/Registry";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Data from "effect/Data";
import { pipe } from "effect/Function";
import { Connections } from "@beep/comms-client";

// Connection item (UI-ready)
export interface ConnectionItem {
  readonly key: string;
  readonly email: string;
  readonly displayName: string;    // "John Doe (Gmail)" or "john@example.com"
  readonly provider: string;       // "Gmail" | "Outlook"
  readonly avatarUrl: string | null;
  readonly isDefault: boolean;
  readonly expiresAt: string;      // "Expires in 2 days" or "Active"
}

// State machine
export type ConnectionsState = Data.TaggedEnum<{
  Loading: {}
  Loaded: { connections: readonly ConnectionItem[] }
  Error: { message: string }
}>
export const ConnectionsState = Data.taggedEnum<ConnectionsState>();

export interface ConnectionManagerVM {
  readonly state$: Atom.Atom<ConnectionsState>
  readonly isConnecting$: Atom.Atom<boolean>

  // Actions
  readonly refresh: () => void
  readonly connectGoogle: () => void
  readonly connectOutlook: () => void
  readonly setDefault: (connectionId: string) => void
  readonly disconnect: (connectionId: string) => void
}

export const ConnectionManagerVM = Context.GenericTag<ConnectionManagerVM>("ConnectionManagerVM");

const layer = Layer.effect(
  ConnectionManagerVM,
  Effect.gen(function* () {
    const registry = yield* AtomRegistry;
    const connectionsClient = yield* Connections.Client;

    const state$ = Atom.make<ConnectionsState>(ConnectionsState.Loading());
    const isConnecting$ = Atom.make(false);

    const toConnectionItem = (conn: Connections.Connection): ConnectionItem => {
      const providerLabel = conn.providerId === "google" ? "Gmail" : "Outlook";
      return {
        key: conn.id,
        email: conn.email,
        displayName: conn.name ? `${conn.name} (${providerLabel})` : conn.email,
        provider: providerLabel,
        avatarUrl: conn.picture ?? null,
        isDefault: conn.isDefault ?? false,
        expiresAt: formatExpiresAt(conn.expiresAt),
      };
    };

    const fetchConnections = () =>
      Effect.gen(function* () {
        const response = yield* connectionsClient.list({});
        const items = response.connections.map(toConnectionItem);
        registry.set(state$, ConnectionsState.Loaded({ connections: items }));
      }).pipe(
        Effect.catchAll((e) => Effect.sync(() => {
          registry.set(state$, ConnectionsState.Error({ message: String(e) }));
        }))
      );

    const refresh = () => {
      registry.set(state$, ConnectionsState.Loading());
      Effect.runFork(fetchConnections());
    };

    const connectGoogle = () => {
      registry.set(isConnecting$, true);
      Effect.runFork(
        Effect.gen(function* () {
          const response = yield* connectionsClient.initiateOAuth({ provider: "google" });
          // Open OAuth popup or redirect
          window.location.href = response.authUrl;
        }).pipe(
          Effect.ensuring(Effect.sync(() => registry.set(isConnecting$, false)))
        )
      );
    };

    const connectOutlook = () => {
      registry.set(isConnecting$, true);
      Effect.runFork(
        Effect.gen(function* () {
          const response = yield* connectionsClient.initiateOAuth({ provider: "microsoft" });
          window.location.href = response.authUrl;
        }).pipe(
          Effect.ensuring(Effect.sync(() => registry.set(isConnecting$, false)))
        )
      );
    };

    const setDefault = (connectionId: string) => {
      Effect.runFork(
        connectionsClient.setDefault({ connectionId }).pipe(
          Effect.tap(() => fetchConnections())
        )
      );
    };

    const disconnect = (connectionId: string) => {
      Effect.runFork(
        connectionsClient.delete({ connectionId }).pipe(
          Effect.tap(() => fetchConnections())
        )
      );
    };

    // Initial load
    Effect.runFork(fetchConnections());

    return {
      state$,
      isConnecting$,
      refresh,
      connectGoogle,
      connectOutlook,
      setDefault,
      disconnect,
    };
  })
);

export default { tag: ConnectionManagerVM, layer };

// Helper
const formatExpiresAt = (date: Date): string => {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days < 0) return "Expired";
  if (days === 0) return "Expires today";
  if (days === 1) return "Expires tomorrow";
  if (days < 7) return `Expires in ${days} days`;
  return "Active";
};
```

---

### Task 5.6: Implement BrainSettings Component

**File**: `packages/comms/ui/src/components/BrainSettings/BrainSettings.vm.ts`

```typescript
import * as Atom from "@effect-atom/atom/Atom";
import { AtomRegistry } from "@effect-atom/atom/Registry";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Data from "effect/Data";
import { pipe } from "effect/Function";
import { Brain } from "@beep/comms-client";

// Label item for editing
export interface LabelItem {
  readonly key: string;
  readonly name: string;
  readonly usecase: string;
}

// State machine
export type BrainState = Data.TaggedEnum<{
  Loading: {}
  Loaded: { enabled: boolean; labels: readonly LabelItem[] }
  Error: { message: string }
}>
export const BrainState = Data.taggedEnum<BrainState>();

export interface BrainSettingsVM {
  readonly state$: Atom.Atom<BrainState>
  readonly isSaving$: Atom.Atom<boolean>

  // Derived
  readonly isEnabled$: Atom.Atom<boolean>
  readonly labelCount$: Atom.Atom<string>  // "3 labels configured"

  // Actions
  readonly toggle: () => void
  readonly addLabel: (name: string, usecase: string) => void
  readonly updateLabel: (key: string, name: string, usecase: string) => void
  readonly removeLabel: (key: string) => void
  readonly saveLabels: () => void
}

export const BrainSettingsVM = Context.GenericTag<BrainSettingsVM>("BrainSettingsVM");

const layer = Layer.effect(
  BrainSettingsVM,
  Effect.gen(function* () {
    const registry = yield* AtomRegistry;
    const brainClient = yield* Brain.Client;

    const state$ = Atom.make<BrainState>(BrainState.Loading());
    const isSaving$ = Atom.make(false);
    const pendingLabels$ = Atom.make<readonly LabelItem[]>([]);

    // Derived atoms
    const isEnabled$ = pipe(state$, Atom.map((s) =>
      s._tag === "Loaded" ? s.enabled : false
    ));

    const labelCount$ = pipe(state$, Atom.map((s) => {
      if (s._tag !== "Loaded") return "Loading...";
      const count = s.labels.length;
      return count === 1 ? "1 label configured" : `${count} labels configured`;
    }));

    const fetchState = () =>
      Effect.gen(function* () {
        const [stateResponse, labelsResponse] = yield* Effect.all([
          brainClient.getBrainState({}),
          brainClient.getBrainLabels({}),
        ]);

        const labels: LabelItem[] = labelsResponse.labels.map((l, i) => ({
          key: `label-${i}`,
          name: l.name,
          usecase: l.usecase,
        }));

        registry.set(pendingLabels$, labels);
        registry.set(state$, BrainState.Loaded({
          enabled: stateResponse.enabled,
          labels,
        }));
      }).pipe(
        Effect.catchAll((e) => Effect.sync(() => {
          registry.set(state$, BrainState.Error({ message: String(e) }));
        }))
      );

    const toggle = () => {
      const current = registry.get(state$);
      if (current._tag !== "Loaded") return;

      const action = current.enabled
        ? brainClient.disableBrain({})
        : brainClient.enableBrain({});

      Effect.runFork(
        action.pipe(Effect.tap(() => fetchState()))
      );
    };

    const addLabel = (name: string, usecase: string) => {
      const current = registry.get(pendingLabels$);
      const newLabel: LabelItem = {
        key: `label-${Date.now()}`,
        name,
        usecase,
      };
      registry.set(pendingLabels$, [...current, newLabel]);
    };

    const updateLabel = (key: string, name: string, usecase: string) => {
      const current = registry.get(pendingLabels$);
      registry.set(pendingLabels$, current.map((l) =>
        l.key === key ? { ...l, name, usecase } : l
      ));
    };

    const removeLabel = (key: string) => {
      const current = registry.get(pendingLabels$);
      registry.set(pendingLabels$, current.filter((l) => l.key !== key));
    };

    const saveLabels = () => {
      registry.set(isSaving$, true);

      Effect.runFork(
        Effect.gen(function* () {
          const labels = registry.get(pendingLabels$);
          yield* brainClient.updateBrainLabels({
            labels: labels.map((l) => ({ name: l.name, usecase: l.usecase })),
          });
          yield* fetchState();
        }).pipe(
          Effect.ensuring(Effect.sync(() => registry.set(isSaving$, false)))
        )
      );
    };

    // Initial load
    Effect.runFork(fetchState());

    return {
      state$,
      isSaving$,
      isEnabled$,
      labelCount$,
      toggle,
      addLabel,
      updateLabel,
      removeLabel,
      saveLabels,
    };
  })
);

export default { tag: BrainSettingsVM, layer };
```

---

### Task 5.7: Create ThreadView and SettingsPanel Components

Similar patterns to above. Key considerations:

**ThreadView.vm.ts**:
- `messages$: Atom.Atom<readonly MessageItem[]>` - Formatted message list
- `summary$: Atom.Atom<Option<string>>` - AI-generated summary
- `reply: (body: string) => void` - Quick reply action
- `loadSummary: () => void` - Fetch AI summary on demand

**SettingsPanel.vm.ts**:
- `settings$: Atom.Atom<SettingsData>` - User preferences
- `hotkeys$: Atom.Atom<readonly HotkeyItem[]>` - Keyboard shortcuts
- `save: () => void` - Persist changes

---

## Verification

```bash
# Check UI package
bun run check --filter @beep/comms-ui

# Run component tests
bun run test --filter @beep/comms-ui

# Lint
bun run lint --filter @beep/comms-ui
```

---

## Deliverables

| Deliverable | Location |
|-------------|----------|
| Package setup | `packages/comms/ui/package.json` |
| VMRuntime | `packages/comms/ui/src/lib/VMRuntime.ts` |
| Mail client | `packages/comms/ui/src/lib/mail-client.ts` |
| InboxView | `packages/comms/ui/src/components/InboxView/` |
| ThreadView | `packages/comms/ui/src/components/ThreadView/` |
| ComposeModal | `packages/comms/ui/src/components/ComposeModal/` |
| ConnectionManager | `packages/comms/ui/src/components/ConnectionManager/` |
| SettingsPanel | `packages/comms/ui/src/components/SettingsPanel/` |
| BrainSettings | `packages/comms/ui/src/components/BrainSettings/` |

---

## Dependencies

- P0-P4 (All RPC contracts and handlers must be complete)

## Blocks

- Integration testing
- App integration in todox

---

## Component Pattern Summary

Each component follows the VM pattern:

```
Component/
  Component.tsx      # Pure renderer, receives VM via useVM hook
  Component.vm.ts    # Interface, Tag, Layer, default export { tag, layer }
  index.ts           # Re-exports
```

**VM Rules**:
1. ALL formatting happens in VM (dates, numbers, strings)
2. Components receive UI-ready values only
3. Actions return `void`, use `Effect.runFork` internally
4. Use `Data.TaggedEnum` for state machines
5. Derived atoms use `Atom.map` or `Atom.tuple`

---

## Agent Recommendations

| Agent | Task |
|-------|------|
| `architecture-pattern-enforcer` | Verify VM pattern compliance |
| `test-writer` | Create component tests |
| `doc-writer` | Create CLAUDE.md for comms-ui package |
