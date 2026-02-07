# Phase 1 Orchestrator Prompt

Copy-paste this prompt to start Phase 1 execution.

---

## Pre-Flight Checklist

Before executing this phase, verify P0 is complete:
- [ ] EntityIds exist in `packages/shared/domain/src/entity-ids/comms/`
- [ ] Domain models exist in `packages/comms/domain/src/entities/`
- [ ] Error types exist in `packages/comms/domain/src/errors/`
- [ ] `@beep/comms-tables` package exists
- [ ] Existing Gmail integration at `packages/shared/integrations/src/google/gmail/`

If any items are missing, complete P0 first using `P0_ORCHESTRATOR_PROMPT.md`.

---

## Prompt

You are implementing Phase 1 (Email Drivers) of the Zero Email Port spec.

### Context

Phase 0 established the foundational types. This phase extends the **existing Gmail integration** at `packages/shared/integrations/src/google/gmail/` and creates a unified `MailDriver` abstraction.

**Critical Insight**: The Gmail integration already has 12 operations using the `Wrap.WrapperGroup` pattern. Extend this pattern for new operations.

### Your Mission

1. Add 10 new Gmail operations to existing WrapperGroup
2. Define provider-agnostic `MailDriver` interface
3. Create `GmailDriverAdapter` wrapping Gmail actions
4. Create `OutlookDriver` using Microsoft Graph API
5. Create `MailDriverFactory` for provider selection

### Critical Patterns

**Gmail Wrapper Contract**:
```typescript
import { Wrap } from "@beep/wrap";
import { GmailMethodError } from "../../errors.ts";

export class PayloadFrom extends S.Class<PayloadFrom>($I`PayloadFrom`)({
  threadId: S.String,
  format: S.optionalWith(S.Literal("full", "metadata", "minimal"), { default: () => "full" as const }),
}) {}

export class Success extends S.Class<Success>($I`Success`)({
  id: S.String,
  messages: S.Array(Models.Email),
}) {}

export const Wrapper = Wrap.Wrapper.make("GetThread", {
  payload: PayloadFrom,
  success: Success,
  error: GmailMethodError,
});
```

**Gmail Handler with wrapGmailCall**:
```typescript
import { wrapGmailCall } from "../../common/wrap-gmail-call.ts";

export const Handler = Wrapper.implement(
  Effect.fn(function* (payload) {
    const response = yield* wrapGmailCall({
      operation: (client) =>
        client.users.threads.get({
          userId: "me",
          id: payload.threadId,
          format: payload.format,
        }),
      failureMessage: "Failed to get thread",
    });

    const messages = A.map(response.data.messages ?? [], (msg) =>
      Models.parseMessageToEmail(msg, payload.format === "full")
    );

    return yield* S.decode(Success)({ id: response.data.id ?? "", messages });
  })
);
```

**MailDriver Interface Pattern**:
```typescript
export interface MailDriver {
  readonly provider: EmailProvider;
  readonly listThreads: (params: {...}) => Effect.Effect<ThreadsResponse, ProviderApiError>;
  readonly getThread: (id: string) => Effect.Effect<ThreadResponse, ThreadNotFoundError | ProviderApiError>;
  // ... other methods
}

export class MailDriver extends Context.Tag($I`MailDriver`)<MailDriver, MailDriver>() {}
```

**Graph API Helper**:
```typescript
const graphRequest = <A>(path: string) =>
  Effect.gen(function* () {
    const httpClient = yield* HttpClient.HttpClient;
    const { accessToken } = yield* OutlookClient;

    const response = yield* httpClient.execute(
      HttpClientRequest.get(`https://graph.microsoft.com/v1.0${path}`).pipe(
        HttpClientRequest.bearerToken(Redacted.value(accessToken))
      )
    );
    return (yield* HttpClientResponse.json(response)) as A;
  });
```

### Reference Files

- Existing Gmail: `packages/shared/integrations/src/google/gmail/actions/`
- Gmail layer: `packages/shared/integrations/src/google/gmail/actions/layer.ts`
- Gmail client: `packages/shared/integrations/src/google/gmail/common/GmailClient.ts`
- Gmail errors: `packages/shared/integrations/src/google/gmail/errors.ts`
- Gmail models: `packages/shared/integrations/src/google/gmail/models/`

### New Operations to Add

| Operation | Purpose | Uses |
|-----------|---------|------|
| `CreateDraft` | Create email draft | `users.drafts.create` |
| `GetDraft` | Get draft by ID | `users.drafts.get` |
| `ListDrafts` | Paginated draft list | `users.drafts.list` |
| `SendDraft` | Send existing draft | `users.drafts.send` |
| `DeleteDraft` | Delete draft | `users.drafts.delete` |
| `GetThread` | Get thread with messages | `users.threads.get` |
| `ListThreads` | Paginated thread list | `users.threads.list` |
| `MarkAsRead` | Remove UNREAD label | `users.messages.batchModify` |
| `MarkAsUnread` | Add UNREAD label | `users.messages.batchModify` |
| `GetAttachment` | Download attachment | `users.messages.attachments.get` |

### Implementation Order

1. Gmail extensions (extend existing package)
2. Update WrapperGroup layer
3. MailDriver interface definition
4. GmailDriverAdapter
5. OutlookDriver
6. MailDriverFactory

### Verification

After each component:

```bash
# Gmail extensions
bun run check --filter @beep/shared-integrations

# MailDriver abstraction
bun run check --filter @beep/comms-server

# Tests
bun run test --filter @beep/shared-integrations -- --grep "gmail"
```

### Success Criteria

- [ ] 10 new Gmail Wrappers created with contracts and handlers
- [ ] `layer.ts` updated with all 22 operations
- [ ] `MailDriver` interface with Context.Tag defined
- [ ] `GmailDriverAdapter` implements MailDriver
- [ ] `OutlookDriver` implements MailDriver using Graph API
- [ ] `MailDriverFactory.makeMailDriverLayer()` returns correct driver
- [ ] All type checks pass
- [ ] REFLECTION_LOG.md updated

### Handoff Document

Full context: `specs/zero-email-port/handoffs/HANDOFF_P1.md`

### Next Steps

After completing Phase 1:
1. Update `REFLECTION_LOG.md` with learnings
2. Verify `HANDOFF_P2.md` exists (context for core RPC)
3. Use `P2_ORCHESTRATOR_PROMPT.md` to start Phase 2
