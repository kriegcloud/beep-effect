# Phase 1 Orchestrator Prompt

Copy-paste this prompt to start Phase 1 implementation.

---

## Prompt

You are implementing Phase 1 (Email Parsing Infrastructure) of the `enron-data-pipeline` spec.

### Context

Phase 0 is complete. Use these artifacts as inputs:
- `specs/pending/enron-data-pipeline/outputs/dataset-evaluation.md`
- `specs/pending/enron-data-pipeline/outputs/parsing-library-evaluation.md`
- `specs/pending/enron-data-pipeline/handoffs/HANDOFF_P1.md`

Raw dataset already uploaded:
- `s3://static.vaultctx.com/todox/test-data/enron/raw/enron_mail_20150507.tar.gz`

Recommended parser from Phase 0:
- Primary: `postal-mime`
- Fallback: `mailparser` (only if streaming constraints require it)

### Your Mission

Implement all Phase 1 tasks in `tooling/cli`:

1. Define schemas:
- Create `tooling/cli/src/commands/enron/schemas.ts`
- Include `EnronEmail`, `EnronThread`, and `EnronDocument` types/schemas per spec

2. Build RFC 2822 parser:
- Create `tooling/cli/src/commands/enron/parser.ts`
- Extract required headers: From, To, CC, BCC, Date, Subject, Message-ID, In-Reply-To, References
- Handle multipart MIME, quoted-printable, base64
- Include deterministic ID strategy from Message-ID

3. Build thread reconstructor:
- Create `tooling/cli/src/commands/enron/thread-reconstructor.ts`
- Reconstruct threads from `In-Reply-To` and `References`
- Handle broken references/orphans

4. Build TodoX document bridge:
- Create `tooling/cli/src/commands/enron/document-bridge.ts`
- Map parsed Enron email/thread data into TodoX document model expectations

5. Add unit tests:
- Parser tests
- Thread reconstruction tests
- Document bridge tests
- Use realistic RFC 2822 fixtures

### Constraints

- Keep boundaries clean (`tooling/cli` only for this phase unless explicitly required).
- Follow Effect patterns and monorepo standards (no `any`, no unchecked casts, no `@ts-ignore`).
- Signature stripping is not handled by parser libraries natively; implement it as an explicit normalization step.
- Do not start long-running dev servers.

### Verification

Run and pass:

```bash
bun run check --filter @beep/tooling-cli
bun run test --filter @beep/tooling-cli
```

Then update:
- `specs/pending/enron-data-pipeline/REFLECTION_LOG.md` (Phase 1 section)
- `specs/pending/enron-data-pipeline/handoffs/HANDOFF_P2.md`
- `specs/pending/enron-data-pipeline/handoffs/P2_ORCHESTRATOR_PROMPT.md`

### Success Criteria

- [ ] P1 implementation files created
- [ ] Required headers + MIME parsing implemented
- [ ] Thread reconstruction implemented
- [ ] Tests pass for CLI package
- [ ] Reflection updated
- [ ] P2 handoff pair created
