# Liveblocks AI Integration Patterns

Patterns for integrating AI features with Liveblocks collaborative editing.

## Executive Summary

Liveblocks provides real-time collaboration infrastructure built on Yjs CRDT. When integrating AI features with collaborative editing, special consideration must be given to conflict resolution, presence awareness, and synchronized content updates. This document covers the patterns and gotchas for AI-enhanced collaborative editing.

## Liveblocks Architecture Overview

### Core Concepts

| Concept | Description |
|---------|-------------|
| **Room** | A collaborative space where users edit together |
| **Presence** | Real-time user state (cursor, selection, typing status) |
| **Storage** | Persistent shared state (Yjs CRDT documents) |
| **Broadcast** | One-time events to all users in room |

### Data Flow

```
User Action
    |
    v
Lexical Editor State
    |
    v
Yjs Document (CRDT)
    |
    v
Liveblocks WebSocket
    |
    v
Server Sync
    |
    v
Other Users' Yjs Documents
    |
    v
Their Lexical Editor State
```

## @liveblocks/react-lexical Integration

### LiveblocksPlugin

The core integration point for Lexical collaboration:

```typescript
import {
  LiveblocksPlugin,
  liveblocksConfig,
  FloatingComposer,
  FloatingThreads,
  AnchoredThreads,
  useIsEditorReady,
} from "@liveblocks/react-lexical";

// Wrap initial config
const initialConfig = liveblocksConfig({
  namespace: "Demo",
  nodes: [
    HeadingNode,
    QuoteNode,
    CodeNode,
    // ... other nodes
  ],
  theme: { /* ... */ },
});

function Editor() {
  const ready = useIsEditorReady();
  const { threads } = useThreads();

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <LiveblocksPlugin>
        {/* Editor content */}
        <RichTextPlugin contentEditable={<ContentEditable />} />

        {/* Collaboration features */}
        <FloatingComposer />
        <FloatingThreads threads={threads} />
        <AnchoredThreads threads={threads} />
      </LiveblocksPlugin>
    </LexicalComposer>
  );
}
```

### Configuration with liveblocksConfig

```typescript
import { liveblocksConfig } from "@liveblocks/react-lexical";

const initialConfig = liveblocksConfig({
  // Standard Lexical config
  namespace: "MyEditor",
  nodes: PlaygroundNodes,
  theme: editorTheme,
  onError: (error) => console.error(error),

  // Liveblocks adds additional nodes automatically:
  // - ThreadMarkNode for comments
  // - LiveblocksPresenceNode for cursors
});
```

## Authentication Setup

### API Route for Room Access

```typescript
// app/api/liveblocks-auth/route.ts
import { Liveblocks } from "@liveblocks/node";
import { NextRequest } from "next/server";

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

export async function POST(request: NextRequest) {
  // Get user from your auth system
  const user = await getSession(request);

  // Create session with user info for presence
  const session = liveblocks.prepareSession(`${user.id}`, {
    userInfo: {
      name: user.name,
      avatar: user.avatar,
      color: user.color, // Cursor color
    },
  });

  // Grant access to rooms (wildcard or specific)
  session.allow(`document:*`, session.FULL_ACCESS);

  const { body, status } = await session.authorize();
  return new Response(body, { status });
}
```

### TypeScript Configuration

```typescript
// liveblocks.config.ts
declare global {
  interface Liveblocks {
    UserMeta: {
      id: string;
      info: {
        name: string;
        avatar: string;
        color: string;
      };
    };
    Storage: {
      title: string;
      // Add other storage fields
    };
    // Room events for broadcasts
    RoomEvent: {
      type: "AI_TYPING" | "AI_COMPLETE";
      userId: string;
    };
  }
}

export {};
```

## AI Integration Patterns

### Pattern 1: AI Content Insertion with CRDT Sync

When AI generates content, insert it through Lexical's editor.update():

```typescript
function insertAiContent(editor: LexicalEditor, content: string) {
  editor.update(() => {
    const selection = $getSelection();

    if ($isRangeSelection(selection)) {
      // Option 1: Replace selection
      selection.insertText(content);

      // Option 2: Insert as new paragraph
      const paragraph = $createParagraphNode();
      paragraph.append($createTextNode(content));
      selection.anchor.getNode()
        .getTopLevelElementOrThrow()
        .insertAfter(paragraph);
    }
  });
  // Yjs automatically syncs the change to all users
}
```

### Pattern 2: AI Typing Presence Indicator

Show other users when AI is generating content:

```typescript
import { useBroadcastEvent, useEventListener } from "@liveblocks/react";

function useAiPresence() {
  const broadcast = useBroadcastEvent();
  const [aiTypingUsers, setAiTypingUsers] = useState<Set<string>>(new Set());

  // Broadcast AI start
  const startAiGeneration = useCallback(() => {
    broadcast({ type: "AI_TYPING", userId: currentUserId });
  }, [broadcast]);

  // Broadcast AI complete
  const completeAiGeneration = useCallback(() => {
    broadcast({ type: "AI_COMPLETE", userId: currentUserId });
  }, [broadcast]);

  // Listen for AI events from other users
  useEventListener(({ event }) => {
    if (event.type === "AI_TYPING") {
      setAiTypingUsers(prev => new Set([...prev, event.userId]));
    } else if (event.type === "AI_COMPLETE") {
      setAiTypingUsers(prev => {
        const next = new Set(prev);
        next.delete(event.userId);
        return next;
      });
    }
  });

  return { aiTypingUsers, startAiGeneration, completeAiGeneration };
}
```

### Pattern 3: Streaming AI Updates

For streaming AI responses, batch updates to reduce sync overhead:

```typescript
import { useMutation } from "@liveblocks/react";

function useStreamingAiInsert(editor: LexicalEditor) {
  const [streamingNodeKey, setStreamingNodeKey] = useState<string | null>(null);
  const pendingContent = useRef<string>("");
  const updateTimeout = useRef<NodeJS.Timeout | null>(null);

  const startStreaming = useCallback(() => {
    editor.update(() => {
      const paragraph = $createParagraphNode();
      const textNode = $createTextNode("");
      paragraph.append(textNode);

      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selection.anchor.getNode()
          .getTopLevelElementOrThrow()
          .insertAfter(paragraph);
      }

      setStreamingNodeKey(textNode.getKey());
    });
  }, [editor]);

  const appendChunk = useCallback((chunk: string) => {
    pendingContent.current += chunk;

    // Debounce updates to reduce sync traffic
    if (updateTimeout.current) {
      clearTimeout(updateTimeout.current);
    }

    updateTimeout.current = setTimeout(() => {
      if (streamingNodeKey && pendingContent.current) {
        editor.update(() => {
          const node = $getNodeByKey(streamingNodeKey);
          if ($isTextNode(node)) {
            node.setTextContent(node.getTextContent() + pendingContent.current);
          }
        });
        pendingContent.current = "";
      }
    }, 50); // 50ms debounce
  }, [editor, streamingNodeKey]);

  const finishStreaming = useCallback(() => {
    if (updateTimeout.current) {
      clearTimeout(updateTimeout.current);
    }
    // Final flush
    if (streamingNodeKey && pendingContent.current) {
      editor.update(() => {
        const node = $getNodeByKey(streamingNodeKey);
        if ($isTextNode(node)) {
          node.setTextContent(node.getTextContent() + pendingContent.current);
        }
      });
    }
    setStreamingNodeKey(null);
    pendingContent.current = "";
  }, [editor, streamingNodeKey]);

  return { startStreaming, appendChunk, finishStreaming };
}
```

### Pattern 4: Update Tags for History Grouping

Group AI operations in undo stack:

```typescript
import { $addUpdateTag } from "lexical";

const AI_UPDATE_TAG = "ai-update";

function insertAiContent(editor: LexicalEditor, content: string) {
  editor.update(() => {
    // Tag this update for history grouping
    $addUpdateTag(AI_UPDATE_TAG);

    const selection = $getSelection();
    selection?.insertText(content);
  }, {
    // Optional: discrete tag to not merge with user typing
    tag: AI_UPDATE_TAG,
  });
}
```

## Conflict Resolution

### CRDT Automatic Resolution

Yjs handles most conflicts automatically through CRDT:

```
User A inserts "Hello" at position 5
    |
    v
Concurrent: User B (AI) inserts "World" at position 5
    |
    v
CRDT Resolution: "HelloWorld" or "WorldHello" (deterministic)
    |
    v
Same result on all clients
```

### Handling Selection Conflicts

When AI operates on selected text, the selection may have changed:

```typescript
function safeAiReplace(editor: LexicalEditor, newContent: string) {
  editor.update(() => {
    const selection = $getSelection();

    if (!$isRangeSelection(selection) || selection.isCollapsed()) {
      // Selection was lost/changed - notify user
      console.warn('Selection changed, inserting at cursor instead');
      selection?.insertText(newContent);
      return;
    }

    // Verify selection content is what we expected
    const currentContent = selection.getTextContent();
    if (currentContent.length === 0) {
      console.warn('Selected content was deleted by another user');
      return;
    }

    // Proceed with replacement
    selection.insertText(newContent);
  });
}
```

### Concurrent AI Operations

Handle multiple users triggering AI simultaneously:

```typescript
import { useMutation, useStorage } from "@liveblocks/react";

function useConcurrentAiGuard() {
  const aiOperationInProgress = useStorage(
    (root) => root.aiOperationInProgress
  );

  const setAiInProgress = useMutation(
    ({ storage }, userId: string | null) => {
      storage.set("aiOperationInProgress", userId);
    },
    []
  );

  const canStartAi = useCallback(() => {
    if (aiOperationInProgress && aiOperationInProgress !== currentUserId) {
      return false;
    }
    return true;
  }, [aiOperationInProgress]);

  const startAiOperation = useCallback(() => {
    if (!canStartAi()) {
      throw new Error("Another user has an AI operation in progress");
    }
    setAiInProgress(currentUserId);
  }, [canStartAi, setAiInProgress]);

  const endAiOperation = useCallback(() => {
    setAiInProgress(null);
  }, [setAiInProgress]);

  return {
    aiOperationInProgress,
    canStartAi,
    startAiOperation,
    endAiOperation,
  };
}
```

## Gotchas and Edge Cases

### 1. Stale Selection Context

**Problem**: User's selection may change while AI is processing.

**Solution**: Validate selection before insertion:

```typescript
async function handleAiRequest(selectedText: string) {
  // Save selection state
  const savedSelectionInfo = captureSelectionInfo();

  // AI generation (may take seconds)
  const aiResult = await generateAiContent(selectedText);

  // Validate selection is still valid
  editor.update(() => {
    const currentSelection = $getSelection();
    if (!isSelectionStillValid(currentSelection, savedSelectionInfo)) {
      // Fallback: insert at cursor
      showWarning("Original selection changed");
    }
  });
}
```

### 2. Overlapping Operations

**Problem**: Two users select overlapping text and both trigger AI.

**Solution**: Use operation locks or detect overlap:

```typescript
function detectOverlap(
  selection1: { start: number; end: number },
  selection2: { start: number; end: number }
): boolean {
  return !(selection1.end < selection2.start || selection2.end < selection1.start);
}
```

### 3. Undo Stack Pollution

**Problem**: Streaming AI creates many undo steps.

**Solution**: Use update tags and discrete mode:

```typescript
editor.update(() => {
  // Group with previous AI updates
  $addUpdateTag("ai-streaming");
  node.setTextContent(node.getTextContent() + chunk);
}, {
  // Or use discrete for single undo step
  discrete: true,
});
```

### 4. Connection Issues During AI

**Problem**: WebSocket disconnects while AI is streaming.

**Solution**: Handle reconnection gracefully:

```typescript
import { useStatus } from "@liveblocks/react";

function AiComponent() {
  const status = useStatus();
  const [wasDisconnected, setWasDisconnected] = useState(false);

  useEffect(() => {
    if (status === "disconnected") {
      setWasDisconnected(true);
    } else if (status === "connected" && wasDisconnected) {
      // Reconnected - verify document state
      showWarning("Reconnected. Some AI content may need verification.");
      setWasDisconnected(false);
    }
  }, [status, wasDisconnected]);

  const canUseAi = status === "connected";
}
```

### 5. Large AI Responses

**Problem**: Very long AI responses cause sync spikes.

**Solution**: Chunk large content:

```typescript
async function insertLargeContent(editor: LexicalEditor, content: string) {
  const CHUNK_SIZE = 500; // characters
  const chunks = [];

  for (let i = 0; i < content.length; i += CHUNK_SIZE) {
    chunks.push(content.slice(i, i + CHUNK_SIZE));
  }

  for (const chunk of chunks) {
    editor.update(() => {
      const selection = $getSelection();
      selection?.insertText(chunk);
    });
    // Allow sync between chunks
    await new Promise(resolve => setTimeout(resolve, 10));
  }
}
```

## Presence Hooks Reference

### useOthers

Get other users in the room:

```typescript
import { useOthers } from "@liveblocks/react";

function PresenceIndicator() {
  const others = useOthers();

  return (
    <div>
      {others.map(other => (
        <Avatar
          key={other.connectionId}
          name={other.info.name}
          color={other.info.color}
        />
      ))}
    </div>
  );
}
```

### useSelf

Get current user's presence:

```typescript
import { useSelf, useUpdateMyPresence } from "@liveblocks/react";

function CursorTracker() {
  const self = useSelf();
  const updateMyPresence = useUpdateMyPresence();

  const handleMouseMove = useCallback((e: MouseEvent) => {
    updateMyPresence({
      cursor: { x: e.clientX, y: e.clientY },
    });
  }, [updateMyPresence]);
}
```

## Best Practices Summary

1. **Always validate selection** before applying AI changes
2. **Use update tags** to group AI operations in undo stack
3. **Broadcast AI status** for presence awareness
4. **Debounce streaming updates** to reduce sync traffic
5. **Handle disconnection** gracefully during AI operations
6. **Lock concurrent operations** or detect conflicts
7. **Chunk large content** to prevent sync spikes
8. **Show clear indicators** when AI is working for any user

## Integration with Target Editor

The target editor (`apps/todox/src/app/lexical/`) already has:

1. **Yjs WebSocket collaboration** via `collaboration.ts`
2. **Comment threads** via `CommentPlugin`
3. **Collaboration plugin** with `CollaborationPlugin` and `CollaborationPluginV2__EXPERIMENTAL`

To add AI features:

1. Add `aiOperationInProgress` to Liveblocks storage type
2. Create `AiPresencePlugin` for typing indicators
3. Wrap AI operations in `useMutation` for atomic updates
4. Add AI event types to `RoomEvent` type definition
5. Update `liveblocks.config.ts` with AI-specific types
