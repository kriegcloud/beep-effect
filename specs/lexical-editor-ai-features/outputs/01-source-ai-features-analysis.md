# Source AI Features Analysis

Analysis of the AI features implementation in `tmp/nextjs-notion-like-ai-editor/`.

## Executive Summary

The source application is a Notion-like AI editor built with Next.js, Lexical, and Liveblocks. It implements AI text assistance through a floating toolbar that appears when text is selected. The AI integration uses the Vercel AI SDK with streaming responses via React Server Components (RSC).

## Component Inventory

### Core Components

| Component | Path | Purpose |
|-----------|------|---------|
| `Editor` | `app/components/Editor.tsx` | Main Lexical editor with Liveblocks integration |
| `FloatingToolbar` | `app/components/FloatingToolbar.tsx` | Container for floating toolbar using @floating-ui |
| `FloatingToolbarAi` | `app/components/FloatingToolbarAi.tsx` | AI prompt interface with cmdk command menu |
| `FloatingToolbarOptions` | `app/components/FloatingToolbarOptions.tsx` | Text formatting options (bold, italic, etc.) |
| `CreateWithAiLink` | `app/components/CreateWithAiLink.tsx` | Entry point link for AI features |

### AI Integration Points

| File | Purpose |
|------|---------|
| `app/actions/ai.ts` | Server action for AI streaming (`continueConversation`) |
| `app/api/chat/route.ts` | API route for chat-based AI interactions |
| `app/prompts.tsx` | Predefined AI prompt definitions (translate, summarize, etc.) |

### Supporting Components

| Component | Path | Purpose |
|-----------|------|---------|
| `PreserveSelectionPlugin` | `app/plugins/PreserveSelectionPlugin.tsx` | Saves/restores selection during AI operations |
| `DraggableBlockPlugin` | `app/plugins/DraggableBlockPlugin.tsx` | Block-level drag handles |
| `useSelection` | `app/hooks/useSelection.ts` | Hook for accessing current selection state |
| `useRange` | `app/hooks/useRange.ts` | Hook for getting selection range for positioning |

## AI Data Flow

```
User selects text
       |
       v
FloatingToolbar appears (positioned via @floating-ui)
       |
       v
User clicks AI button -> FloatingToolbarAi opens
       |
       v
User types prompt OR selects predefined option
       |
       v
submitPrompt() called with:
  - System message with selected text context
  - User prompt
       |
       v
continueConversation(messages) server action
       |
       v
streamText() with OpenAI model
       |
       v
createStreamableValue() wraps textStream
       |
       v
readStreamableValue() on client streams chunks
       |
       v
AI response shown in FloatingToolbarAi preview
       |
       v
User chooses insertion mode:
  - Replace selection
  - Insert inline (after selection)
  - Insert as new paragraph (below)
       |
       v
editor.update() applies change
```

## OUTDATED Patterns (Require Migration)

The source code uses deprecated AI SDK patterns that need updating:

### 1. CoreMessage Type (DEPRECATED)

```typescript
// OUTDATED - Source uses this
import { CoreMessage } from "ai";
const [messages, setMessages] = useState<CoreMessage[]>([]);

// MODERN - Should use UIMessage
import type { UIMessage } from "ai";
const [messages, setMessages] = useState<UIMessage[]>([]);
```

### 2. convertToCoreMessages (DEPRECATED)

```typescript
// OUTDATED - Source uses this (app/api/chat/route.ts)
import { convertToCoreMessages, streamText } from "ai";
messages: convertToCoreMessages(messages),

// MODERN - Use convertToModelMessages (ASYNC)
import { convertToModelMessages, streamText } from "ai";
messages: await convertToModelMessages(messages),
```

### 3. toDataStreamResponse (DEPRECATED)

```typescript
// OUTDATED - Source uses this
return result.toDataStreamResponse();

// MODERN - Use toUIMessageStreamResponse for useChat compatibility
return result.toUIMessageStreamResponse();
```

### 4. Message Content Access

```typescript
// OUTDATED - Direct content access
const content = message.content;

// MODERN - Content is in parts array
const textPart = message.parts.find(p => p.type === 'text');
const content = textPart?.text;
```

## Lexical Integration Patterns

### Selection Preservation

The editor uses a custom plugin to preserve selection when interacting with the AI toolbar:

```typescript
// Commands for save/restore selection
export const SAVE_SELECTION_COMMAND: LexicalCommand<null> = createCommand();
export const RESTORE_SELECTION_COMMAND: LexicalCommand<null> = createCommand();

// Usage in FloatingToolbarAi
onMouseDown={() => {
  editor.dispatchCommand(SAVE_SELECTION_COMMAND, null);
}}
onMouseUp={() => {
  editor.dispatchCommand(RESTORE_SELECTION_COMMAND, null);
}}
```

This pattern is critical because clicking outside the editor normally clears selection.

### Three Content Insertion Modes

1. **Replace Selection** - Replaces currently selected text
```typescript
editor.update(() => {
  const selection = $getSelection();
  selection?.insertRawText(lastAiMessage.content);
});
```

2. **Insert Inline** - Inserts after selection point within the same text node
```typescript
editor.update(() => {
  const selection = $getSelection();
  if ($isRangeSelection(selection)) {
    const node = selection.focus.getNode();
    const offset = selection.focus.offset;
    if (node instanceof TextNode) {
      const textContent = node.getTextContent();
      const newText = `${textContent.slice(0, offset)} ${aiContent} ${textContent.slice(offset)}`;
      node.replace(new TextNode(newText));
    }
  }
});
```

3. **Insert as New Paragraph** - Creates new paragraph block below current
```typescript
editor.update(() => {
  const selection = $getSelection();
  if ($isRangeSelection(selection)) {
    const anchorNode = selection.anchor.getNode();
    const paragraphNode = $createParagraphNode();
    paragraphNode.append($createTextNode(aiContent));
    anchorNode.getTopLevelElementOrThrow().insertAfter(paragraphNode);
  }
});
```

## UI Patterns

### Floating Toolbar Positioning

Uses `@floating-ui/react-dom` for intelligent positioning:

```typescript
const {
  refs: { setReference, setFloating },
  strategy,
  x,
  y,
} = useFloating({
  strategy: "fixed",
  placement: "bottom",
  middleware: [
    offset(10),           // Gap from selection
    hide({ padding }),    // Hide when reference hidden
    shift({ padding, limiter: limitShift() }),  // Keep in viewport
    size({ padding }),    // Resize if needed
  ],
  whileElementsMounted: (...args) => {
    return autoUpdate(...args, {
      animationFrame: true,  // Smooth tracking
    });
  },
});
```

### Command Menu (cmdk)

The AI options use `cmdk` for keyboard-navigable menus:

```typescript
<Command
  onKeyDown={(e) => {
    if (e.key === "Escape" || e.key === "Backspace") {
      // Go back to previous page or close
    }
  }}
>
  <Command.List>
    <Command.Group heading="Modify selection">
      <Command.Item onSelect={() => submitPrompt(option.prompt)}>
        {option.text}
      </Command.Item>
    </Command.Group>
  </Command.List>
</Command>
```

### Animation with Framer Motion

Smooth transitions between states:

```typescript
<motion.div
  layoutId="floating-toolbar-main"
  layout="size"
  initial={{ opacity: 0, scale: 0.93 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ type: "spring", duration: 0.25 }}
>
```

## Predefined AI Prompts

The source defines prompt groups in `app/prompts.tsx`:

### Modify Selection Group
- **Improve writing** - "Improve the quality of the text"
- **Fix mistakes** - "Fix any typos or general errors in the text"
- **Simplify** - "Shorten the text, simplifying it"
- **Add more detail** - "Lengthen the text, going into more detail"

### Generate Group
- **Summarise** - "Summarise the text"
- **Translate into...** - Sub-menu with 13 languages
- **Change style to...** - Sub-menu with 6 styles (Professional, Friendly, Pirate, etc.)
- **Explain** - "Explain what the text is about"

## Server Action Implementation

The `continueConversation` server action (app/actions/ai.ts):

```typescript
"use server";

import { createStreamableValue } from "ai/rsc";
import { CoreMessage, streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function continueConversation(messages: CoreMessage[]) {
  const result = await streamText({
    model: openai(aiModel),
    messages,
  });

  const stream = createStreamableValue(result.textStream);
  return stream.value;
}
```

Key patterns:
- Uses `createStreamableValue` from `ai/rsc` for RSC streaming
- Returns `stream.value` which can be consumed with `readStreamableValue`
- No system prompt in server action (provided by client)

## Client-Side Streaming Consumption

```typescript
// Stream in results
const result = await continueConversation(newMessages);
for await (const content of readStreamableValue(result)) {
  setMessages([
    ...newMessages,
    {
      role: "assistant",
      content: content as string,
    },
  ]);
}
```

## State Management

The AI toolbar manages three main states:

```typescript
// Component visibility/mode
const [state, setState] = useState<"default" | "ai" | "closed">("default");

// AI operation state
const [aiState, setAiState] = useState<"initial" | "loading" | "complete">("initial");

// Conversation history
const [messages, setMessages] = useState<CoreMessage[]>([]);
```

## Key Files for Implementation Reference

| File | Lines of Interest | What to Study |
|------|-------------------|---------------|
| `FloatingToolbarAi.tsx` | 88-124 | Prompt submission flow |
| `FloatingToolbarAi.tsx` | 276-354 | Content insertion modes |
| `PreserveSelectionPlugin.tsx` | Full file | Selection preservation pattern |
| `prompts.tsx` | Full file | Prompt definition structure |
| `actions/ai.ts` | Full file | Server action streaming |
| `FloatingToolbar.tsx` | 25-45 | @floating-ui configuration |

## Identified Issues for Migration

1. **Deprecated AI SDK Patterns** - Must update to modern message types and conversion functions
2. **No Error Handling** - Missing error boundaries and user feedback for AI failures
3. **No Rate Limiting** - Could add debouncing for rapid prompt submissions
4. **Selection Edge Cases** - Inline insertion doesn't handle all node types (only TextNode)
5. **No Collaborative Awareness** - AI operations don't show presence/typing indicators

## Recommendations for Target Implementation

1. Use modern AI SDK 4.x patterns (UIMessage, convertToModelMessages, toUIMessageStreamResponse)
2. Add error handling with Effect patterns for type-safe errors
3. Implement AI "typing" presence indicator for collaborative editing
4. Support more node types for inline insertion (not just TextNode)
5. Add undo/redo grouping for AI operations
6. Consider adding AI response caching for common operations
