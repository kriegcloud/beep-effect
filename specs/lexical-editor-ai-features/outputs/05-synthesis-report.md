# Synthesis Report: Lexical Editor AI Features

## 1. Executive Summary

### Project Overview
This specification covers porting AI text assistance features from a Notion-like Lexical editor example to the target todox Lexical playground editor. The implementation involves:

1. **Floating AI toolbar** that appears on text selection
2. **Predefined AI prompts** (improve, simplify, translate, etc.)
3. **Custom prompt input** with streaming responses
4. **Three content insertion modes** (replace, inline, new paragraph)
5. **Collaborative awareness** showing AI activity to other users

### Key Complexity Factors

| Factor | Complexity | Reason |
|--------|------------|--------|
| **AI SDK Migration** | High | Source uses deprecated patterns; must update to modern API |
| **Target Editor Scope** | High | 40+ plugins, 31 node types to integrate with |
| **Collaboration Sync** | Medium | Must handle concurrent AI operations with Yjs CRDT |
| **Selection Preservation** | Medium | New plugin required; multiple node types to support |
| **UI Integration** | Low | Existing floating toolbar patterns to extend |

### Estimated Phases: 6 phases, each completable in 1-2 sessions

---

## 2. Critical Migration Requirements

### Priority 1: AI SDK Message Types (BLOCKING)

The source code uses deprecated AI SDK patterns that will fail with current versions.

#### CoreMessage -> UIMessage

```typescript
// DEPRECATED (Source)
import { CoreMessage } from "ai";
const [messages, setMessages] = useState<CoreMessage[]>([]);

// MODERN (Required)
import type { UIMessage } from "ai";
const [messages, setMessages] = useState<UIMessage[]>([]);
```

#### convertToCoreMessages -> convertToModelMessages

```typescript
// DEPRECATED (Source)
import { convertToCoreMessages, streamText } from "ai";
messages: convertToCoreMessages(messages),  // SYNC - WRONG

// MODERN (Required)
import { convertToModelMessages, streamText } from "ai";
messages: await convertToModelMessages(messages),  // ASYNC - CORRECT
```

#### toDataStreamResponse -> toUIMessageStreamResponse

```typescript
// DEPRECATED (Source)
return result.toDataStreamResponse();

// MODERN (Required)
return result.toUIMessageStreamResponse();
```

#### Message Content Access

```typescript
// DEPRECATED (Source)
const content = message.content;

// MODERN (Required)
const textPart = message.parts?.find(p => p.type === 'text');
const content = textPart?.text ?? message.content ?? '';
```

### Priority 2: Effect Integration (CODEBASE REQUIREMENT)

All new code must follow Effect patterns per codebase rules.

#### Error Handling

```typescript
// FORBIDDEN - Native Error
throw new Error("AI request failed");

// REQUIRED - Tagged Error
import * as S from "effect/Schema";

export class AiError extends S.TaggedError<AiError>()("AiError", {
  message: S.String,
  code: S.optional(S.String),
}) {}

Effect.fail(new AiError({ message: "AI request failed", code: "TIMEOUT" }))
```

#### Wrapping AI SDK Calls

```typescript
import * as Effect from "effect/Effect";

const streamAiText = (prompt: string) =>
  Effect.tryPromise({
    try: () =>
      streamText({
        model: openai('gpt-4-turbo'),
        messages: [{ role: 'user', content: prompt }],
      }),
    catch: (error) => new AiError({
      message: error instanceof Error ? error.message : 'Unknown error',
    }),
  });
```

### Priority 3: Path Aliases (CODEBASE REQUIREMENT)

```typescript
// FORBIDDEN
import { something } from "../../../utils/helper";

// REQUIRED
import { something } from "@beep/todox-client/utils/helper";
```

---

## 3. Implementation Strategy

### What to KEEP from Source (Adapt patterns)

| Pattern | Source Location | Adaptation Notes |
|---------|-----------------|------------------|
| Three insertion modes | `FloatingToolbarAi.tsx:276-354` | Keep logic, update for more node types |
| Predefined prompts structure | `prompts.tsx` | Keep structure, expand categories |
| Command menu (cmdk) integration | `FloatingToolbarAi.tsx` | Keep UX, use shadcn/ui CommandDialog |
| Floating toolbar positioning | `FloatingToolbar.tsx:25-45` | Keep @floating-ui, adapt to target's anchor element pattern |
| Selection preservation commands | `PreserveSelectionPlugin.tsx` | Copy and enhance for more node types |
| Server action streaming | `actions/ai.ts` | Keep RSC pattern, update message types |

### What to ADAPT for Target Editor

| Component | Target Location | Integration Point |
|-----------|-----------------|-------------------|
| AI button trigger | `FloatingTextFormatToolbarPlugin` | Add button alongside bold/italic |
| Slash command entry | `ComponentPickerPlugin` | Add "Ask AI" to slash commands |
| Toolbar dropdown | `ToolbarPlugin` | Add AI dropdown menu |
| Plugin registration | `Editor.tsx` | Add AiAssistantPlugin to plugin list |
| Node registration | `PlaygroundNodes.ts` | No new nodes needed initially |

### What to BUILD NEW

| Component | Purpose | Complexity |
|-----------|---------|------------|
| `AiAssistantPlugin` | Main AI feature plugin | High |
| `FloatingAiPanel` | AI prompt interface | Medium |
| `PreserveSelectionPlugin` | Selection save/restore | Low |
| `AiPresenceIndicator` | Show AI activity in collab | Medium |
| `useAiAssistant` hook | AI state management | Medium |
| `ai.ts` server action | Updated streaming endpoint | Low |
| `AiError` tagged error | Effect-based error type | Low |

---

## 4. Integration Points Map

### Floating UI Hierarchy

```
Editor.tsx
  |
  +-- floatingAnchorElem (existing anchor)
       |
       +-- FloatingTextFormatToolbarPlugin (MODIFY: add AI button)
       |    |
       |    +-- [AI Button] -> Opens FloatingAiPanel
       |
       +-- FloatingAiPanel (NEW: AI prompt interface)
            |
            +-- Command menu (cmdk/shadcn)
            +-- Prompt input
            +-- Streaming preview
            +-- Insertion mode buttons
```

### Plugin Registration Order

```
Editor.tsx plugins:
  1. PreserveSelectionPlugin (NEW - early for command registration)
  2. ... existing plugins ...
  3. AiAssistantPlugin (NEW - after FloatingTextFormatToolbarPlugin)
```

### State Flow

```
User selects text
       |
       v
FloatingTextFormatToolbarPlugin detects selection
       |
       v
AI button shown in toolbar
       |
       v
User clicks AI -> OPEN_AI_PANEL_COMMAND dispatched
       |
       v
AiAssistantPlugin handles command
       |
       v
FloatingAiPanel opens at toolbar position
       |
       v
User submits prompt
       |
       v
Server action: improveText() called
       |
       v
Streaming response updates FloatingAiPanel preview
       |
       v
User selects insertion mode
       |
       v
INSERT_AI_TEXT_COMMAND dispatched with content + mode
       |
       v
AiAssistantPlugin handles insertion
       |
       v
Liveblocks syncs change to collaborators
```

### Conflicts and Resolutions

| Conflict | Resolution |
|----------|------------|
| Selection lost on panel click | PreserveSelectionPlugin saves/restores |
| Toolbar position calculation | Use existing setFloatingElemPosition + @floating-ui fallback |
| Undo stack pollution from streaming | Use $addUpdateTag("ai-streaming") |
| Concurrent AI operations | useConcurrentAiGuard with Liveblocks storage lock |
| Stale selection after AI processing | Validate selection before insertion |

---

## 5. Phase Breakdown

### Phase 1: Infrastructure (Session 1)

**Goal**: Core dependencies and plugin scaffolding

**Tasks**:
1. Add AI SDK dependencies to package.json
2. Create `PreserveSelectionPlugin` with SAVE/RESTORE commands
3. Define AI command types (OPEN_AI_PANEL_COMMAND, INSERT_AI_TEXT_COMMAND, etc.)
4. Create `AiError` tagged error class
5. Set up AI context provider skeleton

**Files to Create**:
- `plugins/PreserveSelectionPlugin/index.tsx`
- `plugins/AiAssistantPlugin/commands.ts`
- `plugins/AiAssistantPlugin/errors.ts`
- `context/AiContext.tsx`

**Success Criteria**:
- [ ] PreserveSelectionPlugin saves and restores selection
- [ ] AI commands registered and dispatchable
- [ ] No TypeScript errors

### Phase 2: Server Integration (Session 2)

**Goal**: Working AI streaming endpoint

**Tasks**:
1. Create/update `app/api/chat/route.ts` with modern patterns
2. Create `actions/ai.ts` server action for RSC streaming
3. Define prompt templates in `prompts.ts`
4. Create `useAiStreaming` hook for client consumption

**Files to Create/Modify**:
- `app/api/chat/route.ts` (exists - update)
- `actions/ai.ts` (exists - update with modern patterns)
- `plugins/AiAssistantPlugin/prompts.ts`
- `plugins/AiAssistantPlugin/hooks/useAiStreaming.ts`

**Success Criteria**:
- [ ] Server action streams text successfully
- [ ] Modern AI SDK patterns used (no deprecation warnings)
- [ ] Effect error handling in place

### Phase 3: UI Components (Session 3)

**Goal**: Floating AI panel with command menu

**Tasks**:
1. Create `FloatingAiPanel` component
2. Implement command menu with cmdk/shadcn
3. Add predefined prompt options
4. Implement streaming preview display
5. Style with existing theme

**Files to Create**:
- `plugins/AiAssistantPlugin/FloatingAiPanel.tsx`
- `plugins/AiAssistantPlugin/components/PromptInput.tsx`
- `plugins/AiAssistantPlugin/components/StreamingPreview.tsx`
- `plugins/AiAssistantPlugin/components/InsertionModeButtons.tsx`

**Success Criteria**:
- [ ] Panel opens and closes properly
- [ ] Command menu navigable with keyboard
- [ ] Streaming text displays in preview

### Phase 4: Editor Integration (Session 4)

**Goal**: Full AI workflow in editor

**Tasks**:
1. Create main `AiAssistantPlugin`
2. Add AI button to `FloatingTextFormatToolbarPlugin`
3. Implement three insertion modes
4. Add undo grouping for AI operations
5. Handle edge cases (empty selection, unsupported nodes)

**Files to Create/Modify**:
- `plugins/AiAssistantPlugin/index.tsx`
- `plugins/FloatingTextFormatToolbarPlugin/index.tsx` (modify)
- `plugins/AiAssistantPlugin/insertion.ts`

**Success Criteria**:
- [ ] AI button appears on text selection
- [ ] All three insertion modes work
- [ ] Single undo step for AI operations
- [ ] Edge cases handled gracefully

### Phase 5: Toolbar Integration (Session 5)

**Goal**: AI access from main toolbar and slash commands

**Tasks**:
1. Add AI dropdown to `ToolbarPlugin`
2. Add AI options to `ComponentPickerPlugin`
3. Add keyboard shortcut (Cmd+J or similar)
4. Implement quick actions (no preview mode)

**Files to Modify**:
- `plugins/ToolbarPlugin/index.tsx`
- `plugins/ComponentPickerPlugin/index.tsx`
- `plugins/AiAssistantPlugin/index.tsx` (keyboard shortcuts)

**Success Criteria**:
- [ ] AI dropdown in toolbar with all options
- [ ] "/ai" slash command works
- [ ] Keyboard shortcut triggers AI panel

### Phase 6: Collaboration Awareness (Session 6)

**Goal**: AI presence indicators and conflict handling

**Tasks**:
1. Add AI event types to Liveblocks config
2. Create `AiPresenceIndicator` component
3. Implement concurrent operation guard
4. Add connection status handling
5. Test multi-user scenarios

**Files to Create/Modify**:
- `liveblocks.config.ts` (modify)
- `plugins/AiAssistantPlugin/AiPresenceIndicator.tsx`
- `plugins/AiAssistantPlugin/hooks/useConcurrentAiGuard.ts`
- `plugins/AiAssistantPlugin/hooks/useAiPresence.ts`

**Success Criteria**:
- [ ] AI typing indicator shows for other users
- [ ] Concurrent AI operations handled
- [ ] Graceful degradation on disconnect

---

## 6. Risk Assessment

### High Risk Blockers

| Risk | Impact | Mitigation |
|------|--------|------------|
| AI SDK deprecations cause runtime errors | Blocks all AI features | Thoroughly test with latest AI SDK; have fallback patterns |
| Selection preservation fails for complex node types | Insert mode broken | Test with all 31 node types; add node-specific handlers |
| Effect integration conflicts with AI SDK promises | Type errors, runtime issues | Wrap all AI calls in Effect.tryPromise consistently |

### Medium Risk Gotchas

| Gotcha | Impact | Mitigation |
|--------|--------|------------|
| Streaming updates pollute undo stack | Poor UX | Use $addUpdateTag consistently |
| Selection changes during AI processing | Wrong insertion location | Validate selection before insertion; show warning |
| Large AI responses cause sync lag | Collaboration issues | Chunk content; debounce updates |
| @floating-ui conflicts with existing positioning | UI glitches | Use existing setFloatingElemPosition first; @floating-ui as fallback |

### Low Risk Considerations

| Consideration | Impact | Mitigation |
|---------------|--------|------------|
| cmdk keyboard navigation conflicts | Minor UX | Test thoroughly; adjust key bindings |
| Animation jank during streaming | Visual polish | Use CSS transitions; avoid layout thrashing |
| API rate limiting | Degraded experience | Add debouncing; show loading states |

---

## 7. Code Patterns Quick Reference

### Modern AI SDK Server Action

```typescript
// actions/ai.ts
"use server";

import { createStreamableValue } from "ai/rsc";
import { streamText, convertToModelMessages, UIMessage } from "ai";
import { openai } from "@ai-sdk/openai";

export async function improveText(
  selectedText: string,
  instruction: string
) {
  const messages: UIMessage[] = [
    {
      id: crypto.randomUUID(),
      role: 'system',
      content: `Improve the following text according to the user's instruction.
Selected text:
"""
${selectedText}
"""`,
      parts: [{ type: 'text', text: '' }],
    },
    {
      id: crypto.randomUUID(),
      role: 'user',
      content: instruction,
      parts: [{ type: 'text', text: instruction }],
    },
  ];

  const result = streamText({
    model: openai('gpt-4-turbo'),
    messages: await convertToModelMessages(messages),
    temperature: 0.7,
  });

  const stream = createStreamableValue(result.textStream);
  return stream.value;
}
```

### Lexical Selection Preservation

```typescript
// plugins/PreserveSelectionPlugin/index.tsx
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $setSelection,
  $isRangeSelection,
  createCommand,
  COMMAND_PRIORITY_LOW,
  RangeSelection,
} from "lexical";
import { useEffect, useRef } from "react";
import { mergeRegister } from "@lexical/utils";

export const SAVE_SELECTION_COMMAND = createCommand<null>('SAVE_SELECTION');
export const RESTORE_SELECTION_COMMAND = createCommand<null>('RESTORE_SELECTION');

export function PreserveSelectionPlugin() {
  const [editor] = useLexicalComposerContext();
  const savedSelection = useRef<RangeSelection | null>(null);

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        SAVE_SELECTION_COMMAND,
        () => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            savedSelection.current = selection.clone();
          }
          return true;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        RESTORE_SELECTION_COMMAND,
        () => {
          if (savedSelection.current) {
            $setSelection(savedSelection.current);
          }
          return true;
        },
        COMMAND_PRIORITY_LOW
      )
    );
  }, [editor]);

  return null;
}
```

### Lexical AI Content Insertion

```typescript
// plugins/AiAssistantPlugin/insertion.ts
import {
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  $createTextNode,
  $addUpdateTag,
  LexicalEditor,
  TextNode,
} from "lexical";

const AI_UPDATE_TAG = "ai-update";

export type InsertionMode = "replace" | "inline" | "below";

export function insertAiContent(
  editor: LexicalEditor,
  content: string,
  mode: InsertionMode
) {
  editor.update(
    () => {
      $addUpdateTag(AI_UPDATE_TAG);
      const selection = $getSelection();

      if (!$isRangeSelection(selection)) {
        console.warn("No valid selection for AI insertion");
        return;
      }

      switch (mode) {
        case "replace":
          selection.insertText(content);
          break;

        case "inline": {
          const anchor = selection.anchor;
          const node = anchor.getNode();
          if (node instanceof TextNode) {
            const textContent = node.getTextContent();
            const offset = anchor.offset;
            const newText =
              textContent.slice(0, offset) +
              " " +
              content +
              " " +
              textContent.slice(offset);
            node.setTextContent(newText);
          } else {
            // Fallback for non-text nodes
            selection.insertText(" " + content + " ");
          }
          break;
        }

        case "below": {
          const paragraph = $createParagraphNode();
          paragraph.append($createTextNode(content));
          selection.anchor
            .getNode()
            .getTopLevelElementOrThrow()
            .insertAfter(paragraph);
          break;
        }
      }
    },
    { tag: AI_UPDATE_TAG }
  );
}
```

### Liveblocks AI Presence

```typescript
// plugins/AiAssistantPlugin/hooks/useAiPresence.ts
import { useBroadcastEvent, useEventListener } from "@liveblocks/react";
import { useState, useCallback } from "react";

export function useAiPresence(currentUserId: string) {
  const broadcast = useBroadcastEvent();
  const [aiTypingUsers, setAiTypingUsers] = useState<Set<string>>(new Set());

  const startAiGeneration = useCallback(() => {
    broadcast({ type: "AI_TYPING", userId: currentUserId });
  }, [broadcast, currentUserId]);

  const completeAiGeneration = useCallback(() => {
    broadcast({ type: "AI_COMPLETE", userId: currentUserId });
  }, [broadcast, currentUserId]);

  useEventListener(({ event }) => {
    if (event.type === "AI_TYPING") {
      setAiTypingUsers((prev) => new Set([...prev, event.userId]));
    } else if (event.type === "AI_COMPLETE") {
      setAiTypingUsers((prev) => {
        const next = new Set(prev);
        next.delete(event.userId);
        return next;
      });
    }
  });

  return { aiTypingUsers, startAiGeneration, completeAiGeneration };
}
```

### Client Streaming Consumption

```typescript
// plugins/AiAssistantPlugin/hooks/useAiStreaming.ts
import { readStreamableValue } from "ai/rsc";
import { useState, useCallback } from "react";
import { improveText } from "@/actions/ai";

export function useAiStreaming() {
  const [streamedContent, setStreamedContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const streamResponse = useCallback(
    async (selectedText: string, instruction: string) => {
      setIsStreaming(true);
      setStreamedContent("");
      setError(null);

      try {
        const stream = await improveText(selectedText, instruction);

        for await (const chunk of readStreamableValue(stream)) {
          if (chunk) {
            setStreamedContent((prev) => prev + chunk);
          }
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setIsStreaming(false);
      }
    },
    []
  );

  return {
    streamedContent,
    isStreaming,
    error,
    streamResponse,
    reset: () => {
      setStreamedContent("");
      setError(null);
    },
  };
}
```

---

## 8. Files to Create/Modify

### Files to CREATE

| File | Purpose | Dependencies |
|------|---------|--------------|
| `plugins/PreserveSelectionPlugin/index.tsx` | Selection save/restore | None |
| `plugins/AiAssistantPlugin/index.tsx` | Main AI plugin | PreserveSelectionPlugin |
| `plugins/AiAssistantPlugin/commands.ts` | AI command definitions | None |
| `plugins/AiAssistantPlugin/errors.ts` | Effect error types | @beep/schema |
| `plugins/AiAssistantPlugin/prompts.ts` | Predefined prompts | None |
| `plugins/AiAssistantPlugin/insertion.ts` | Content insertion logic | None |
| `plugins/AiAssistantPlugin/FloatingAiPanel.tsx` | AI interface UI | useAiStreaming |
| `plugins/AiAssistantPlugin/components/PromptInput.tsx` | Prompt input field | None |
| `plugins/AiAssistantPlugin/components/StreamingPreview.tsx` | Response preview | None |
| `plugins/AiAssistantPlugin/components/InsertionModeButtons.tsx` | Mode selection | None |
| `plugins/AiAssistantPlugin/hooks/useAiStreaming.ts` | Stream consumption | ai.ts |
| `plugins/AiAssistantPlugin/hooks/useAiPresence.ts` | Collab presence | Liveblocks |
| `plugins/AiAssistantPlugin/hooks/useConcurrentAiGuard.ts` | Operation locking | Liveblocks |
| `plugins/AiAssistantPlugin/AiPresenceIndicator.tsx` | Presence UI | useAiPresence |
| `context/AiContext.tsx` | AI state context | None |

### Files to MODIFY

| File | Modification | Priority |
|------|--------------|----------|
| `actions/ai.ts` | Update to modern AI SDK patterns | Phase 2 |
| `app/api/chat/route.ts` | Update to modern AI SDK patterns | Phase 2 |
| `Editor.tsx` | Register new plugins | Phase 1 |
| `plugins/FloatingTextFormatToolbarPlugin/index.tsx` | Add AI button | Phase 4 |
| `plugins/ToolbarPlugin/index.tsx` | Add AI dropdown | Phase 5 |
| `plugins/ComponentPickerPlugin/index.tsx` | Add AI slash commands | Phase 5 |
| `liveblocks.config.ts` (if exists) | Add AI event types | Phase 6 |
| `types/globals.d.ts` | Add Liveblocks type augmentation | Phase 6 |

### Dependency Order

```
1. commands.ts, errors.ts (no deps)
   |
2. PreserveSelectionPlugin (uses commands)
   |
3. prompts.ts, insertion.ts (no deps)
   |
4. actions/ai.ts update (uses prompts)
   |
5. useAiStreaming (uses actions/ai.ts)
   |
6. UI components (use hooks)
   |
7. AiAssistantPlugin (uses all above)
   |
8. Editor.tsx registration (uses plugin)
   |
9. Toolbar modifications (use plugin commands)
   |
10. Collaboration hooks (use Liveblocks)
    |
11. AiPresenceIndicator (uses collab hooks)
```

---

## Summary

This implementation requires careful attention to:

1. **AI SDK migration** - The source uses deprecated patterns that must be updated
2. **Effect compliance** - All new code must follow codebase patterns
3. **Plugin architecture** - Extend existing patterns rather than reinventing
4. **Collaboration** - Consider multi-user scenarios throughout

The 6-phase approach allows incremental progress with testable milestones at each phase. Phase 1-4 delivers core functionality; Phase 5-6 adds polish and collaboration features.
