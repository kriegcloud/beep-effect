# Agent Prompts: Lexical Editor AI Features

> Ready-to-use prompts for specialized agents working on this spec.

---

## Phase 0: Research & Discovery

### Explore Agent - Source AI Features Analysis

```
You are researching the AI features in tmp/nextjs-notion-like-ai-editor/.

## Mission
Document all AI-related components, hooks, and patterns for porting.

## Search Areas
1. components/editor/extensions/ - AI panel components
2. lib/ai/ - AI utilities and prompts
3. hooks/ - AI-related React hooks
4. app/api/ - AI API routes

## For Each Feature Found
Document:
- Component/file name
- Purpose and functionality
- Dependencies on other components
- Key code patterns used

## Key Questions
1. How does the floating AI panel appear?
2. What triggers it (selection, keyboard, button)?
3. How is streaming content displayed?
4. What insertion modes exist (replace, inline, below)?
5. How is selection preserved when panel opens?
6. What predefined prompts are available?

## Output
Create outputs/01-source-ai-features-analysis.md with:
- Component inventory
- Feature descriptions
- Code pattern examples
- Integration points
```

### Explore Agent - Target Lexical Editor Analysis

```
You are researching the Lexical editor at apps/todox/src/app/lexical/.

## Mission
Identify integration points for AI features in the existing editor.

## Search Areas
1. plugins/ - Existing plugin patterns
2. nodes/ - Custom node implementations
3. ui/ - UI components and toolbar
4. Editor.tsx - Plugin registration

## For Each Area
Document:
- Existing patterns and conventions
- Extension points for AI features
- Potential conflicts or challenges

## Key Questions
1. How are plugins structured and registered?
2. Is there an existing floating toolbar? How does it work?
3. How is selection tracked and managed?
4. What command patterns exist?
5. How does undo/redo work?
6. What UI component library is used?

## Output
Create outputs/02-target-lexical-editor-analysis.md with:
- Plugin architecture overview
- Extension point analysis
- UI component patterns
- Recommended integration approach
```

### Web Researcher - AI SDK 6 Patterns

```
You are researching modern AI SDK 6 patterns.

## Mission
Document the migration from deprecated to modern AI SDK patterns.

## Research Topics

### 1. Message Types
- UIMessage vs CoreMessage
- How to access message content
- message.parts array structure

### 2. Conversion Functions
- convertToModelMessages (ASYNC - must await!)
- Differences from convertToCoreMessages
- Type definitions

### 3. Response Streaming
- toUIMessageStreamResponse
- How it differs from toDataStreamResponse
- Route handler implementation

### 4. useChat Hook
- Modern configuration options
- Error handling patterns
- Abort support

### 5. Content Access
- Old: message.content (string)
- New: message.parts?.find(p => p.type === 'text')?.text

## Sources
- Vercel AI SDK documentation
- GitHub AI SDK repository
- Migration guides

## Output
Create outputs/03-ai-sdk-6-patterns.md with:
- Migration table (deprecated → modern)
- Code examples for each pattern
- Common pitfalls to avoid
- TypeScript types
```

### Web Researcher - Liveblocks AI Integration

```
You are researching Liveblocks AI integration patterns.

## Mission
Document patterns for collaborative AI features.

## Research Topics

### 1. Presence Updates
- Showing "user is using AI" status
- Updating presence for AI operations
- Clearing presence on completion

### 2. Broadcast Events
- Event types for AI operations
- Subscribing to events
- Handling events from other users

### 3. Conflict Handling
- What happens if selection changes during AI operation?
- How to detect concurrent edits?
- Graceful cancellation patterns

### 4. Yjs Integration
- CRDT operations during AI insertion
- Undo manager integration
- Collaboration cursor behavior

## Sources
- Liveblocks documentation
- Liveblocks examples repository
- AI collaboration patterns

## Output
Create outputs/04-liveblocks-ai-integration.md with:
- Presence pattern examples
- Broadcast event patterns
- Conflict handling strategies
- Integration recommendations
```

---

## Phase 1: Infrastructure

### Effect Code Writer - Commands

```
You are creating AI command definitions for Lexical.

## Mission
Create plugins/AiAssistantPlugin/commands.ts with typed commands.

## Commands to Create

1. OPEN_AI_PANEL_COMMAND
   - Payload: null
   - Purpose: Open the AI assistant panel

2. CLOSE_AI_PANEL_COMMAND
   - Payload: null
   - Purpose: Close the AI assistant panel

3. INSERT_AI_TEXT_COMMAND
   - Payload: { content: string; mode: 'replace' | 'inline' | 'below' }
   - Purpose: Insert AI-generated content

4. SAVE_SELECTION_COMMAND
   - Payload: null
   - Purpose: Save current selection before panel opens

5. RESTORE_SELECTION_COMMAND
   - Payload: null
   - Purpose: Restore saved selection for insertion

## Pattern

import { createCommand, LexicalCommand } from "lexical";

export type InsertionMode = 'replace' | 'inline' | 'below';

export const MY_COMMAND: LexicalCommand<PayloadType> = createCommand('MY_COMMAND');

## Requirements
- Use createCommand from lexical
- Proper TypeScript typing
- Export type for InsertionMode
- Export InsertAiTextPayload interface
```

### Effect Code Writer - Errors

```
You are creating Effect error types for AI operations.

## Mission
Create plugins/AiAssistantPlugin/errors.ts with tagged errors.

## Errors to Create

1. AiError
   - General AI operation error
   - Fields: message: S.String, code: S.optional(S.String)

2. AiStreamError
   - Streaming failure
   - Fields: message: S.String, cause: S.optional(S.Unknown)

3. AiSelectionError
   - Selection preservation error
   - Fields: message: S.String

## Pattern

import * as S from "effect/Schema";

export class AiError extends S.TaggedError<AiError>()("AiError", {
  message: S.String,
  code: S.optional(S.String),
}) {}

## Requirements
- ALL errors MUST extend S.TaggedError
- Use namespace import for Schema
- Export all error classes
```

### Effect Code Writer - PreserveSelectionPlugin

```
You are creating the PreserveSelectionPlugin.

## Mission
Create plugins/PreserveSelectionPlugin/index.tsx

## Functionality

1. Register SAVE_SELECTION_COMMAND handler
   - Get current selection from editor state
   - If RangeSelection, clone and store in ref
   - Return true to indicate handled

2. Register RESTORE_SELECTION_COMMAND handler
   - Get saved selection from ref
   - Apply to editor state
   - Clear ref after restoration
   - Return true to indicate handled

## Key Implementation Details

- Use useRef<RangeSelection | null> (NOT useState)
- Use $getSelection() inside editor.update()
- Use $isRangeSelection() to type guard
- Use selection.clone() to preserve state
- Handle null selection gracefully
- Use COMMAND_PRIORITY_LOW for handlers

## Pattern

export function PreserveSelectionPlugin(): null {
  const [editor] = useLexicalComposerContext();
  const savedSelection = useRef<RangeSelection | null>(null);

  useEffect(() => {
    return editor.registerCommand(
      SAVE_SELECTION_COMMAND,
      () => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          savedSelection.current = selection.clone();
        }
        return true;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor]);

  // Similar for RESTORE_SELECTION_COMMAND

  return null;
}

## Requirements
- Import commands from ./AiAssistantPlugin/commands
- Import Lexical utilities correctly
- Handle edge cases (null selection, invalid state)
- Return null (plugin has no render output)
```

### Effect Code Writer - AiContext

```
You are creating the AI context provider.

## Mission
Create context/AiContext.tsx

## Interface

interface AiContextValue {
  isAiPanelOpen: boolean;
  setAiPanelOpen: (open: boolean) => void;
  selectedText: string;
  setSelectedText: (text: string) => void;
  isStreaming: boolean;
  setIsStreaming: (streaming: boolean) => void;
  streamedContent: string;
  setStreamedContent: (content: string) => void;
}

## Implementation

1. Create context with createContext
2. Create provider component with useState for each value
3. Export useAiContext hook with proper error handling
4. Export AiContextProvider component

## Pattern

const AiContext = createContext<AiContextValue | null>(null);

export function AiContextProvider({ children }: { children: ReactNode }) {
  const [isAiPanelOpen, setAiPanelOpen] = useState(false);
  // ... other state

  const value = useMemo(() => ({
    isAiPanelOpen,
    setAiPanelOpen,
    // ... rest
  }), [isAiPanelOpen, /* ... */]);

  return <AiContext.Provider value={value}>{children}</AiContext.Provider>;
}

export function useAiContext() {
  const context = useContext(AiContext);
  if (!context) {
    throw new Error("useAiContext must be used within AiContextProvider");
  }
  return context;
}

## Requirements
- Proper TypeScript types
- useMemo for context value
- Descriptive error for missing provider
```

---

## Phase 2: Server Integration

### Effect Code Writer - Chat Route

```
You are updating the chat API route.

## Mission
Update app/api/chat/route.ts with modern AI SDK 6 patterns.

## Critical Migration Points

### BEFORE (deprecated):
const { messages } = await request.json();
const coreMessages = convertToCoreMessages(messages);
return result.toDataStreamResponse();

### AFTER (modern):
const { messages } = await request.json();
const modelMessages = await convertToModelMessages(messages); // ASYNC!
return result.toUIMessageStreamResponse();

## Implementation

import { openai } from "@ai-sdk/openai";
import { streamText, convertToModelMessages } from "ai";

export async function POST(request: Request) {
  const { messages, prompt } = await request.json();

  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: openai("gpt-4"),
    system: prompt?.systemPrompt || "You are a helpful writing assistant.",
    messages: modelMessages,
  });

  return result.toUIMessageStreamResponse();
}

## Requirements
- Must await convertToModelMessages (it's async!)
- Use toUIMessageStreamResponse, NOT toDataStreamResponse
- Handle errors appropriately
- Support custom system prompts
```

### Effect Code Writer - useAiStreaming Hook

```
You are creating the streaming hook.

## Mission
Create plugins/AiAssistantPlugin/hooks/useAiStreaming.ts

## Implementation

import { useChat } from "ai/react";

export function useAiStreaming() {
  const {
    messages,
    input,
    setInput,
    handleSubmit,
    isLoading,
    error,
    stop,
  } = useChat({
    api: "/api/chat",
  });

  // Get the latest assistant message content
  const streamedContent = useMemo(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === "assistant") {
      // Modern: use parts array
      const textPart = lastMessage.parts?.find(p => p.type === 'text');
      return textPart?.text || "";
    }
    return "";
  }, [messages]);

  return {
    streamedContent,
    isStreaming: isLoading,
    error,
    input,
    setInput,
    submit: handleSubmit,
    abort: stop,
  };
}

## Requirements
- Use modern content access via parts array
- Provide abort capability
- Handle error state
- Export clean interface
```

---

## Cross-Phase Prompts

### Reflector - Session Synthesis

```
You are synthesizing learnings from the current phase.

## Mission
Update REFLECTION_LOG.md with structured findings.

## Analysis Areas

1. What worked well?
   - Effective patterns discovered
   - Smooth integrations
   - Time-saving approaches

2. What was challenging?
   - Unexpected issues
   - Documentation gaps
   - Integration difficulties

3. What should change for next phase?
   - Prompt improvements
   - Process refinements
   - Research gaps to address

4. Learnings for future specs
   - Reusable patterns
   - Common pitfalls
   - Best practices discovered

## Output Format

### Phase [N]: [Name]

**Date**: YYYY-MM-DD

### What Worked
- Point 1
- Point 2

### What Could Improve
- Point 1
- Point 2

### Pattern Candidates

| Pattern | Score | Description |
|---------|-------|-------------|
| ... | ... | ... |

### Key Decisions
1. Decision description
2. Decision description
```

### Handoff Writer - Phase Transition

```
You are creating handoff documents for the next phase.

## Mission
Create BOTH files: HANDOFF_P[N+1].md and P[N+1]_ORCHESTRATOR_PROMPT.md

## HANDOFF_P[N+1].md Structure

1. Previous Phase Summary
   - What was accomplished
   - Key outputs created

2. Phase [N+1] Objectives
   - Main goals
   - Task list with agents

3. Files to Create
   - File paths
   - Purpose
   - Key implementation notes

4. Files to Modify
   - File paths
   - What to change

5. Implementation Notes
   - Critical patterns
   - Gotchas to avoid

6. Verification
   - How to verify success
   - Commands to run

7. Success Criteria
   - Checklist items

## P[N+1]_ORCHESTRATOR_PROMPT.md Structure

Short, copy-paste ready prompt:
- Context (1-2 sentences)
- Mission (what this phase accomplishes)
- Tasks (numbered list)
- Critical patterns (code examples)
- Delegation rules
- Reference files
- Verification commands
- Success criteria checklist
```
