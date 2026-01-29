# Quick Start: Liveblocks Lexical AI Integration

## What is this spec?

This spec completes the partial Liveblocks + Lexical + AI integration in the todox app. The goal is to enable fully functional real-time collaborative AI features with actual Liveblocks authentication and OpenAI streaming, replacing the current mock implementations.

## Current State vs Target State

| Aspect | Current | Target |
|--------|---------|--------|
| Auth endpoint | Uses mock `getSession` from `_example.ts` | Real session integration via better-auth |
| Environment vars | `LIVEBLOCKS_SECRET_KEY` in .env.example | Verified key with proper typed access |
| User resolution | Mock database with static users | Real user service integration |
| Room pattern | Mismatch: `examples:*` vs `playground:*` | Aligned patterns across auth and provider |
| End-to-end flow | Components exist but untested together | Verified working with multiple browser tabs |

## Phase Overview

| Phase | Status | Focus |
|-------|--------|-------|
| P1 | In Progress | Infrastructure Verification |
| P2 | Pending | User Integration |
| P3 | Pending | Client Wiring |
| P4 | Pending | End-to-End Verification |
| P5 | Pending | Polish & Edge Cases |

## Key Files

| Purpose | Location |
|---------|----------|
| Auth endpoint | `apps/todox/src/app/api/liveblocks-auth/route.ts` |
| Mock session helper | `apps/todox/src/app/api/liveblocks-auth/_example.ts` |
| Mock user database | `apps/todox/src/app/api/_database.ts` |
| Liveblocks config | `apps/todox/liveblocks.config.ts` |
| Server utilities | `apps/todox/src/utils/liveblocks.ts` |
| AI server action | `apps/todox/src/actions/ai.ts` |
| Room management | `apps/todox/src/actions/liveblocks.ts` |
| LiveblocksProvider | `apps/todox/src/app/lexical/context/LiveblocksProvider.tsx` |
| Collaborative AI hook | `apps/todox/src/app/lexical/plugins/AiAssistantPlugin/hooks/useCollaborativeAi.ts` |
| AI streaming hook | `apps/todox/src/app/lexical/plugins/AiAssistantPlugin/hooks/useAiStreaming.ts` |
| Collaborative panel | `apps/todox/src/app/lexical/plugins/AiAssistantPlugin/components/CollaborativeFloatingAiPanel.tsx` |

## Quick Commands

```bash
# Verify environment variable is set
grep LIVEBLOCKS_SECRET_KEY .env

# Run todox dev server
bun run dev --filter @beep/todox

# Or run from the app directory
cd apps/todox && bun run dev

# Type check todox
bun run check --filter @beep/todox

# Test auth endpoint (with mock user)
curl -X POST http://localhost:3000/api/liveblocks-auth \
  -H "Content-Type: application/json" \
  -d '{"userId": "charlie.layne@example.com"}'
```

## Research Questions

1. **Auth Flow**: How does the auth endpoint resolve users, and what's needed to connect it to real sessions?
2. **Room Patterns**: The auth allows `liveblocks:examples:*` but LiveblocksProvider uses `liveblocks:playground:*` - which should change?
3. **Presence Broadcasting**: How does `useCollaborativeAi` hook broadcast AI activity, and is it receiving presence from Liveblocks?
4. **Conflict Detection**: What triggers the conflict warning UI when users have overlapping selections?
5. **Environment Access**: Auth route uses raw `process.env` but `utils/liveblocks.ts` uses typed `serverEnv` - should be unified.

## Known Issues

| Issue | Impact | File |
|-------|--------|------|
| Room pattern mismatch | Auth token may not authorize correct rooms | `route.ts` allows `examples:*`, provider uses `playground:*` |
| Mock session dependency | Cannot use real user data | `_example.ts` pulls from fake database |
| Raw process.env usage | Inconsistent with codebase patterns | Auth route should use `@beep/shared-env` |

## Reference Implementation

The `tmp/nextjs-notion-like-ai-editor/` directory contains a production-ready example:

| Reference File | Pattern |
|----------------|---------|
| `app/api/liveblocks-auth/route.ts` | Auth endpoint structure |
| `app/Providers.tsx` | Provider setup with resolvers |
| `app/[pageId]/Room.tsx` | Room provider pattern |
| `liveblocks.config.ts` | Type configuration |

## Next Steps

1. **Read full context**: Review `README.md` for complete spec overview
2. **Check current phase**: Read `handoffs/HANDOFF_P1.md` for Phase 1 tasks
3. **Start verification**: Run commands above to test current infrastructure state
4. **Document findings**: Update `REFLECTION_LOG.md` after completing tasks

## Output Files

| Directory | Purpose |
|-----------|---------|
| `outputs/` | Phase artifacts and deliverables |
| `handoffs/` | Phase transition documents |
| `REFLECTION_LOG.md` | Cumulative learnings |

## Success Criteria Summary

- Liveblocks auth endpoint authenticates users with proper userInfo
- AI streaming works with real OpenAI API calls
- Collaborative presence shows when users are using AI features
- Conflict detection warns users about overlapping AI operations
- End-to-end manual testing passes with multiple browser tabs

## Technology Stack

| Technology | Package | Purpose |
|------------|---------|---------|
| Liveblocks | `@liveblocks/react`, `@liveblocks/node` | Real-time collaboration |
| Lexical | `@lexical/react` | Rich text editor |
| OpenAI | `@ai-sdk/openai` | Text generation |
| Vercel AI SDK | `ai`, `@ai-sdk/rsc` | Streaming utilities |
| Next.js | 16 (App Router) | Framework |
