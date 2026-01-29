# Evaluation Rubrics: Lexical Editor AI Features

> Criteria for evaluating each phase of the AI features implementation.

---

## Phase 0: Research & Discovery

### Research Breadth (30%)

| Score | Criteria |
|-------|----------|
| 4 | All 4 research areas covered: source, target, AI SDK, Liveblocks |
| 3 | 3 areas covered thoroughly |
| 2 | 2 areas covered, significant gaps in others |
| 1 | Only 1 area covered adequately |

### Research Depth (30%)

| Score | Criteria |
|-------|----------|
| 4 | Each area includes code examples, patterns, and integration points |
| 3 | Most areas have sufficient detail |
| 2 | Surface-level coverage, missing important details |
| 1 | Incomplete or missing key information |

### Synthesis Quality (40%)

| Score | Criteria |
|-------|----------|
| 4 | Clear 6-phase plan with dependencies, file lists, code patterns |
| 3 | Plan exists but missing some details |
| 2 | Plan incomplete or unclear |
| 1 | No actionable synthesis |

---

## Phase 1: Infrastructure

### Command Definitions (25%)

| Score | Criteria |
|-------|----------|
| 4 | All 5 commands defined, properly typed, exported correctly |
| 3 | Commands defined but minor typing issues |
| 2 | Missing commands or significant type errors |
| 1 | Commands not implemented |

### Error Types (25%)

| Score | Criteria |
|-------|----------|
| 4 | All errors extend S.TaggedError, properly structured |
| 3 | Errors created but minor issues |
| 2 | Some errors missing or incorrect patterns |
| 1 | Errors not implemented or using native Error |

### PreserveSelectionPlugin (30%)

| Score | Criteria |
|-------|----------|
| 4 | Both commands handled, ref usage, proper cloning, edge cases |
| 3 | Basic functionality works, minor edge case gaps |
| 2 | Partial implementation, significant gaps |
| 1 | Plugin not functional |

### AiContext (20%)

| Score | Criteria |
|-------|----------|
| 4 | Full interface, proper typing, useMemo optimization |
| 3 | Working context but minor optimizations missing |
| 2 | Partial interface or typing issues |
| 1 | Context not implemented |

---

## Phase 2: Server Integration

### AI SDK Migration (40%)

| Score | Criteria |
|-------|----------|
| 4 | All modern patterns used: UIMessage, async convert, toUIMessageStreamResponse |
| 3 | Most patterns correct, 1 deprecated usage |
| 2 | Mixed deprecated and modern patterns |
| 1 | Still using deprecated patterns |

### Prompt Templates (25%)

| Score | Criteria |
|-------|----------|
| 4 | 6+ prompts defined, proper structure, clear templates |
| 3 | 4-5 prompts, working structure |
| 2 | 2-3 prompts only |
| 1 | No prompts defined |

### Streaming Hook (35%)

| Score | Criteria |
|-------|----------|
| 4 | useAiStreaming works, modern content access, abort support |
| 3 | Basic streaming works, minor gaps |
| 2 | Streaming partially functional |
| 1 | Hook not implemented |

---

## Phase 3: UI Components

### FloatingAiPanel (30%)

| Score | Criteria |
|-------|----------|
| 4 | Proper positioning, show/hide logic, keyboard handling |
| 3 | Basic panel works, minor UX issues |
| 2 | Panel renders but positioning/visibility issues |
| 1 | Panel not implemented |

### CommandMenu (25%)

| Score | Criteria |
|-------|----------|
| 4 | All prompts listed, keyboard nav, search works |
| 3 | Prompts show, basic navigation |
| 2 | Partial implementation |
| 1 | Not implemented |

### Custom Input (20%)

| Score | Criteria |
|-------|----------|
| 4 | Input works, submit handling, loading state |
| 3 | Basic input works |
| 2 | Input partially functional |
| 1 | Not implemented |

### Streaming Preview (25%)

| Score | Criteria |
|-------|----------|
| 4 | Progressive display, mode selector, insert/cancel |
| 3 | Content displays, basic controls |
| 2 | Partial display functionality |
| 1 | Not implemented |

---

## Phase 4: Editor Integration

### AiAssistantPlugin (30%)

| Score | Criteria |
|-------|----------|
| 4 | All commands registered, context connected, panel mounted |
| 3 | Basic plugin works, minor integration gaps |
| 2 | Plugin partially functional |
| 1 | Plugin not implemented |

### Content Insertion (40%)

| Score | Criteria |
|-------|----------|
| 4 | All 3 modes work: replace, inline, below |
| 3 | 2 modes work correctly |
| 2 | 1 mode works |
| 1 | No insertion working |

### Undo Batching (30%)

| Score | Criteria |
|-------|----------|
| 4 | Single undo step for entire AI operation |
| 3 | Undo works but multiple steps |
| 2 | Undo partially working |
| 1 | Undo broken |

---

## Phase 5: Toolbar Integration

### Toolbar Button (40%)

| Score | Criteria |
|-------|----------|
| 4 | Button visible, icon correct, dispatches command, active state |
| 3 | Button works, minor UX issues |
| 2 | Button visible but action issues |
| 1 | No toolbar button |

### Dropdown Menu (30%)

| Score | Criteria |
|-------|----------|
| 4 | Prompts listed, keyboard nav, executes correctly |
| 3 | Basic dropdown works |
| 2 | Partial functionality |
| 1 | Not implemented |

### Slash Commands (30%)

| Score | Criteria |
|-------|----------|
| 4 | /ai, /improve, /simplify all work |
| 3 | /ai command works |
| 2 | Partial slash command support |
| 1 | No slash commands |

---

## Phase 6: Collaboration Awareness

### Presence Indicators (40%)

| Score | Criteria |
|-------|----------|
| 4 | AI activity shown, updates presence, clears on completion |
| 3 | Basic presence works |
| 2 | Partial presence functionality |
| 1 | No presence indicators |

### Broadcast Events (35%)

| Score | Criteria |
|-------|----------|
| 4 | Events broadcast, subscription works, state synced |
| 3 | Basic event broadcasting |
| 2 | Partial event support |
| 1 | No event broadcasting |

### Conflict Handling (25%)

| Score | Criteria |
|-------|----------|
| 4 | Detects conflicts, shows warning, graceful cancel |
| 3 | Basic conflict detection |
| 2 | Partial conflict handling |
| 1 | No conflict handling |

---

## Cross-Phase Rubrics

### Handoff Quality

| Score | Criteria |
|-------|----------|
| 4 | Both HANDOFF and ORCHESTRATOR_PROMPT created; complete context |
| 3 | Both files created; minor context gaps |
| 2 | Only one file created; significant context missing |
| 1 | No handoff files |

### Reflection Quality

| Score | Criteria |
|-------|----------|
| 4 | Rich learnings documented; prompt improvements suggested |
| 3 | Phase learnings documented |
| 2 | Basic learnings only |
| 1 | Reflection not updated |

### Code Quality

| Score | Criteria |
|-------|----------|
| 4 | Effect patterns followed, types correct, no errors |
| 3 | Minor type issues, patterns mostly followed |
| 2 | Multiple type errors or pattern violations |
| 1 | Code doesn't compile |

### Verification

| Score | Criteria |
|-------|----------|
| 4 | `bun run check` passes, manual testing done |
| 3 | Check passes, limited manual testing |
| 2 | Check has warnings, minimal testing |
| 1 | Check fails |

---

## Deliverable Checklist

### Phase 0 Outputs

| Deliverable | Required | Verification |
|-------------|----------|--------------|
| `outputs/01-source-ai-features-analysis.md` | Yes | Covers UI, streaming, insertion |
| `outputs/02-target-lexical-editor-analysis.md` | Yes | Covers plugins, selection, toolbar |
| `outputs/03-ai-sdk-6-patterns.md` | Yes | Migration table present |
| `outputs/04-liveblocks-ai-integration.md` | Yes | Presence patterns documented |
| `outputs/05-synthesis-report.md` | Yes | 6-phase plan, file lists |
| `REFLECTION_LOG.md` update | Yes | Phase 0 section populated |
| `handoffs/HANDOFF_P1.md` | Yes | Complete context |
| `handoffs/P1_ORCHESTRATOR_PROMPT.md` | Yes | Copy-paste ready |

### Phase 1 Outputs

| Deliverable | Required | Verification |
|-------------|----------|--------------|
| `plugins/AiAssistantPlugin/commands.ts` | Yes | 5 commands defined |
| `plugins/AiAssistantPlugin/errors.ts` | Yes | 3 errors extend TaggedError |
| `plugins/PreserveSelectionPlugin/index.tsx` | Yes | Both handlers work |
| `context/AiContext.tsx` | Yes | Full interface |
| `Editor.tsx` modification | Yes | Plugin registered |
| `bun run check --filter @beep/todox` | Yes | Passes |

### Phase 2 Outputs

| Deliverable | Required | Verification |
|-------------|----------|--------------|
| `app/api/chat/route.ts` update | Yes | Modern patterns |
| `plugins/AiAssistantPlugin/prompts.ts` | Yes | 6+ prompts |
| `hooks/useAiStreaming.ts` | Yes | Streaming works |

### Phase 3 Outputs

| Deliverable | Required | Verification |
|-------------|----------|--------------|
| `components/FloatingAiPanel.tsx` | Yes | Renders, positions |
| `components/CommandMenu.tsx` | Yes | Prompts listed |
| `components/CustomPromptInput.tsx` | Yes | Input works |
| `components/StreamingPreview.tsx` | Yes | Content displays |

### Phase 4 Outputs

| Deliverable | Required | Verification |
|-------------|----------|--------------|
| `plugins/AiAssistantPlugin/index.tsx` | Yes | Plugin works |
| `plugins/AiAssistantPlugin/insertion.ts` | Yes | 3 modes work |
| End-to-end flow | Yes | Manual testing |

### Phase 5 Outputs

| Deliverable | Required | Verification |
|-------------|----------|--------------|
| Toolbar AI button | Yes | Button visible |
| Dropdown menu | Yes | Menu works |
| Slash commands | Yes | /ai works |

### Phase 6 Outputs

| Deliverable | Required | Verification |
|-------------|----------|--------------|
| Presence indicators | Yes | Shows AI activity |
| Broadcast events | Yes | Events sent |
| Conflict handling | Yes | Warns on conflict |

---

## Overall Scoring

### Phase Completion Threshold

| Rating | Score Range | Meaning |
|--------|-------------|---------|
| Excellent | 3.5 - 4.0 | Phase complete, ready for next |
| Good | 2.5 - 3.4 | Minor issues, can proceed |
| Needs Work | 1.5 - 2.4 | Significant gaps, rework required |
| Unsatisfactory | < 1.5 | Phase not complete, major rework |

### Spec Completion Criteria

The spec is complete when:

- [ ] All 6 phases score >= 3.0
- [ ] All deliverables created
- [ ] `bun run check --filter @beep/todox` passes
- [ ] `bun run lint:fix` passes
- [ ] Manual end-to-end testing complete
- [ ] REFLECTION_LOG.md complete with all phases

---

## Quality Gates

### Phase 0 → Phase 1 Gate

Cannot proceed unless:
- [ ] All 5 output files exist
- [ ] AI SDK migration patterns documented
- [ ] 6-phase plan in synthesis report
- [ ] Handoff files created

### Phase 1 → Phase 2 Gate

Cannot proceed unless:
- [ ] All commands defined and typed
- [ ] All errors extend TaggedError
- [ ] PreserveSelectionPlugin functional
- [ ] AiContext provider created
- [ ] `bun run check --filter @beep/todox` passes

### Phase 4 → Phase 5 Gate

Cannot proceed unless:
- [ ] All 3 insertion modes work
- [ ] Undo batching verified
- [ ] End-to-end flow tested

### Phase 6 → Complete Gate

Cannot mark complete unless:
- [ ] All functional requirements met
- [ ] All technical requirements met
- [ ] Collaboration features work
- [ ] All checks pass

---

## Anti-Pattern Detection

### Red Flags (Score = 0)

| Anti-Pattern | Detection |
|--------------|-----------|
| Deprecated AI SDK patterns | Using CoreMessage, sync convert |
| Native Error | Any `new Error()` or `throw new Error()` |
| Missing handoff | Either file missing |
| Orchestrator writing code | Code written directly instead of delegating |

### Warnings (Score Penalty)

| Warning | Penalty |
|---------|---------|
| Type assertions used | -0.5 from Code Quality |
| Native methods used | -0.5 from Code Quality |
| Missing error handling | -0.5 from relevant section |
| No manual testing | -0.5 from Verification |
